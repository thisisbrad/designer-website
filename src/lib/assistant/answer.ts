/**
 * The grounded answer engine.
 *
 * ProjectHub's central design principle, kept intact: *every* question gets a
 * deterministic answer computed from the knowledge base, and generation never
 * replaces that answer. Here it goes one step further — there is no generation
 * at all. Every sentence the assistant says about the business is either
 * written by hand in this file or quoted verbatim from a content file.
 *
 * That is a deliberate trade. A generative bot answers a wider range of
 * questions and occasionally invents a price. This one has a narrower range
 * and cannot, which is the correct trade for a site whose own AI service page
 * promises an assistant that "says 'let me get someone' instead of inventing".
 *
 * The seam for adding an LLM later is documented at the bottom of this file.
 */

import { BM25Index, tokenize, type Scored } from "./bm25";
import { knowledgeChunks, type Chunk, type ChunkTag } from "./knowledge";
import {
  COMMERCIAL_INTENTS,
  understandQuery,
  type Intent,
  type Turn,
} from "./query";

/* ------------------------------------------------------------------ *
 * Tuning
 *
 * BM25 scores are unnormalised, so these thresholds are corpus-specific.
 * They were set by running scripts/eval-assistant.mjs over the golden
 * question set — re-run it after any material content change.
 * ------------------------------------------------------------------ */

/** At or above this, the top hit is trusted enough to answer outright. */
const STRONG_MATCH = 4.5;
/** Below this, treat the corpus as having nothing useful and hand off. */
const WEAK_MATCH = 1.8;
/**
 * Minimum share of the question's content words that must exist on this site
 * before an answer is attempted. Set from the eval: real questions sit near
 * 1.0, while off-domain ones ("weather in Tampa", "medieval history") fall
 * well below — and would otherwise be answered confidently, because BM25
 * always ranks something first.
 */
const MIN_COVERAGE = 0.7;
/** Sources shown alongside an answer. */
const MAX_SOURCES = 3;
/** Roughly two sentences — a chat bubble, not an essay. */
const PASSAGE_CHARS = 320;

/**
 * Tag boost, the same idea as ProjectHub's hybrid fusion stage.
 *
 * Intent classification already knows what *kind* of answer is wanted, and
 * that knowledge is otherwise thrown away. Pure BM25 favours short documents
 * via length normalisation, so a two-line FAQ reliably outranks the service
 * page that actually holds the price — this puts a thumb on the scale for the
 * chunk type the question is asking for.
 */
const INTENT_TAG_AFFINITY: Partial<Record<Intent, ChunkTag[]>> = {
  pricing: ["pricing"],
  timeline: ["pricing"],
  process: ["process"],
  location: ["location"],
  legal: ["legal"],
  contact: ["contact"],
};
const AFFINITY_BOOST = 1.35;

/**
 * Intent-driven query expansion.
 *
 * "What's your pricing for SEO?" reduces to two search terms, one of which
 * ("seo") appears on nearly every page and so carries almost no IDF weight.
 * That leaves a near-tie across dozens of chunks, and the tag boost cannot
 * rescue a chunk that never made the retrieval depth in the first place.
 *
 * Classification already established what kind of answer is wanted, so these
 * terms are added to the *retrieval query only* — never shown, never part of
 * what the visitor asked. The chunk matching both the original words and the
 * expansion wins, which is exactly the desired ranking.
 *
 * This also papers over a real stemmer weakness: "pricing" stems to "pric"
 * while "price" stays "price", so the two never match each other. Listing
 * both here is cheaper and safer than special-casing the stemmer.
 */
const INTENT_EXPANSION: Partial<Record<Intent, string>> = {
  pricing: "pricing price cost budget starts",
  timeline: "timeline weeks take long turnaround",
  location: "serving area city county florida",
  process: "process step stage",
  contact: "contact email audit",
  legal: "privacy terms policy",
};

/**
 * Title-match boost — a poor man's fielded BM25.
 *
 * Flat BM25 treats every word in a chunk alike, so "pricing for SEO" ranked
 * Frontend Development's price above SEO Marketing's: both chunks are about
 * pricing, "seo" appears across most of the corpus and so carries almost no
 * IDF weight, and length normalisation broke the tie arbitrarily. But a term
 * appearing in a chunk's *title* is a much stronger signal of aboutness than
 * the same term buried in its body.
 *
 * Applied per distinct matching term and capped, so a title can't win on
 * repetition alone.
 */
const TITLE_BOOST_PER_TERM = 0.3;
const MAX_TITLE_BOOST = 1.9;

/** Retrieved before boosting, so a boosted match can climb into the top 6. */
const RETRIEVE_DEPTH = 24;
const RESULT_DEPTH = 6;

function rerank(
  hits: Scored<Chunk>[],
  intent: Intent,
  queryTerms: string[]
): Scored<Chunk>[] {
  const favoured = INTENT_TAG_AFFINITY[intent];
  const terms = new Set(queryTerms);

  return hits
    .map((hit) => {
      let score = hit.score;

      if (favoured?.includes(hit.tag)) score *= AFFINITY_BOOST;

      const titleTerms = new Set(tokenize(hit.title));
      let matches = 0;
      for (const term of terms) if (titleTerms.has(term)) matches += 1;
      if (matches) {
        score *= Math.min(1 + TITLE_BOOST_PER_TERM * matches, MAX_TITLE_BOOST);
      }

      return { ...hit, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULT_DEPTH);
}

export type Source = { title: string; url: string };

export type AssistantReply = {
  answer: string;
  sources: Source[];
  followUps: string[];
  /** True when the visitor should be pointed at a human or the audit form. */
  escalate: boolean;
  /** Diagnostics — surfaced in dev, and how the retrieval eval reads results. */
  debug: { intent: Intent; topScore: number; coverage: number; matched: string[] };
};

/* Built once per process: the corpus is static between deploys. */
const index = new BM25Index<Chunk>(knowledgeChunks);

/** Trim to a sentence boundary near the limit rather than mid-word. */
function passage(text: string, limit = PASSAGE_CHARS): string {
  // [\s\S] rather than the `s` flag — the build targets ES2017.
  const clean = text.replace(/^Q:[\s\S]*?A:\s*/, "").trim();
  if (clean.length <= limit) return clean;

  const cut = clean.slice(0, limit);
  const lastStop = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("? "),
    cut.lastIndexOf("! ")
  );
  // Only honour the boundary if it isn't so early that we lose the answer.
  if (lastStop > limit * 0.5) return cut.slice(0, lastStop + 1);
  return cut.replace(/\s+\S*$/, "") + "…";
}

function toSources(hits: Scored<Chunk>[]): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const hit of hits) {
    if (seen.has(hit.url)) continue;
    seen.add(hit.url);
    sources.push({ title: hit.title, url: hit.url });
    if (sources.length >= MAX_SOURCES) break;
  }
  return sources;
}

/* ------------------------------------------------------------------ *
 * Canned replies — the things that shouldn't hit retrieval at all
 * ------------------------------------------------------------------ */

const GREETING: AssistantReply = {
  answer:
    "Hello — I'm Beacon. I can shed light on the services here: what they cost, how long they take, how the process works, and which areas of Florida are covered. What would you like to know?",
  sources: [],
  followUps: [
    "What does a website cost?",
    "How long does a project take?",
    "Do you work with businesses in Orlando?",
  ],
  escalate: false,
  debug: { intent: "smalltalk", topScore: 0, coverage: 1, matched: [] },
};

const META: AssistantReply = {
  answer:
    "I'm Beacon — this site's assistant, named for the lighthouse on the homepage. I'm a guiding light, not a know-it-all: I search the pages here and quote what they say, rather than generating an answer. That means I can't invent a price or promise a deadline — if it isn't written on this site, I'll say so and light the way to Brad. He reads every enquiry personally.",
  sources: [{ title: "AI Solutions", url: "/services/ai-solutions" }],
  followUps: [
    "What can you help with?",
    "How do I get a free audit?",
    "What does an AI assistant like this cost to build?",
  ],
  escalate: false,
  debug: { intent: "meta", topScore: 0, coverage: 1, matched: [] },
};

const REFUSAL: AssistantReply = {
  answer:
    "I can't help with that one — it's outside my beam. I'm limited to questions about the work and services described on this site.",
  sources: [],
  followUps: ["What services are offered?", "What does a project cost?"],
  escalate: false,
  debug: { intent: "safety", topScore: 0, coverage: 1, matched: [] },
};

/**
 * Ranking guarantees. Answered from a fixed script rather than retrieval,
 * because the honest answer is a commercial commitment and must not vary with
 * whatever chunk happens to score highest today.
 */
const GUARANTEE: AssistantReply = {
  answer:
    "No, and I'd be wary of anyone who says otherwise — Google doesn't sell placement and doesn't take instruction from me, so nobody can honestly promise a position or a date. What I can tell you is what the work involves and what it has done before: the figures on the site describe past projects rather than forecasting yours. Brad will give you a straight read on what's realistic for your market.",
  sources: [
    { title: "Terms — no guarantee of rankings", url: "/terms" },
    { title: "SEO Marketing", url: "/services/seo-marketing" },
    { title: "Free website audit", url: "/#audit" },
  ],
  followUps: [
    "What does SEO cost?",
    "How long does SEO take to show results?",
    "What's included in the free audit?",
  ],
  escalate: true,
  debug: { intent: "guarantee", topScore: 0, coverage: 1, matched: [] },
};

/** Said when retrieval finds nothing. Handing off is a valid answer. */
function handoff(intent: Intent, coverage = 0): AssistantReply {
  return {
    answer:
      "I don't have that on the site, and I'd rather light the way to Brad than guess at it. He replies to every enquiry personally, usually within 48 hours — or you can ask for the free audit and raise it there.",
    sources: [
      { title: "Contact", url: "/contact" },
      { title: "Free website audit", url: "/#audit" },
    ],
    followUps: [
      "What services are offered?",
      "What does a website cost?",
      "What's included in the free audit?",
    ],
    escalate: true,
    debug: { intent, topScore: 0, coverage, matched: [] },
  };
}

/* ------------------------------------------------------------------ *
 * Follow-ups
 * ------------------------------------------------------------------ */

/** Suggestions drawn from what was actually retrieved, so they lead somewhere. */
function buildFollowUps(hits: Scored<Chunk>[], intent: Intent): string[] {
  const suggestions: string[] = [];

  if (intent === "pricing") suggestions.push("How long would that take?");
  if (intent === "timeline") suggestions.push("What does that cost?");
  if (intent === "location") suggestions.push("What's included?");

  for (const hit of hits.slice(0, 3)) {
    if (hit.tag === "service" || hit.tag === "pricing") {
      suggestions.push(`What's included in ${hit.title.split(" — ")[0]}?`);
    } else if (hit.tag === "location") {
      suggestions.push(`Do you work with businesses in ${hit.title.split(" in ").pop()}?`);
    }
  }

  suggestions.push("What's included in the free audit?");

  return [...new Set(suggestions)].slice(0, 3);
}

/* ------------------------------------------------------------------ *
 * Entry point
 * ------------------------------------------------------------------ */

/**
 * Buying signals that should end an answer with the audit offer, whatever
 * the intent. Deliberately separate from intent classification: "can you
 * build me a React frontend?" must still *retrieve* as a service question —
 * this only decides that the answer deserves a capture form under it.
 */
const HIRE_SIGNALS =
  /\b(i (need|want)|we (need|want)|can you (build|design|make|create|redesign|fix|improve)|looking for (a|an|someone)|interested in|get a quote|help (me|us|my|our)|my (business|company|site|website)|our (business|company|site|website))\b/i;

export function answerQuestion(
  question: string,
  history: Turn[] = []
): AssistantReply {
  const trimmed = String(question || "").trim();
  if (!trimmed) return GREETING;

  const understanding = understandQuery(
    trimmed,
    history,
    index.rawVocabulary,
    index.vocabulary
  );
  const { intent } = understanding;

  if (intent === "safety") return REFUSAL;
  if (intent === "guarantee") return GUARANTEE;
  if (intent === "meta") return META;
  if (intent === "smalltalk" && trimmed.split(/\s+/).length <= 4) return GREETING;

  // Off-domain: the words simply aren't on this site. Checked before
  // retrieval, because retrieval's top hit is never empty and reads as
  // confident regardless.
  if (understanding.coverage < MIN_COVERAGE)
    return handoff(intent, understanding.coverage);

  const expansion = INTENT_EXPANSION[intent];
  const retrievalQuery = expansion
    ? `${understanding.rewritten} ${expansion}`
    : understanding.rewritten;

  const hits = rerank(
    index.search(retrievalQuery, RETRIEVE_DEPTH),
    intent,
    // Title matching uses what the visitor actually asked — the expansion
    // terms above appear in every pricing title and would boost them equally.
    tokenize(understanding.rewritten)
  );
  const top = hits[0];

  if (!top || top.score < WEAK_MATCH)
    return handoff(intent, understanding.coverage);

  const sources = toSources(hits);
  const followUps = buildFollowUps(hits, intent);
  const debug = {
    intent,
    coverage: Number(understanding.coverage.toFixed(2)),
    topScore: Number(top.score.toFixed(2)),
    matched: hits.slice(0, 3).map((h) => h.id),
  };

  /* Commercial intent or a buying signal in the phrasing: either way the
     visitor is close enough to hiring that the answer should end with the
     audit offer rather than trail off. */
  const buying = COMMERCIAL_INTENTS.has(intent) || HIRE_SIGNALS.test(trimmed);

  /* A question the site already answers in Brad's own words gets answered in
     those words. Paraphrasing here would only introduce drift. */
  if (top.answer && top.score >= WEAK_MATCH) {
    return {
      answer: top.answer,
      sources,
      followUps,
      escalate: buying,
      debug,
    };
  }

  if (top.score >= STRONG_MATCH) {
    return {
      answer: passage(top.display ?? top.text),
      sources,
      followUps,
      escalate: buying,
      debug,
    };
  }

  /* Middling confidence: say so, quote the closest thing, and let the visitor
     judge. Hedging honestly beats a confident wrong answer. */
  return {
    answer: `I'm not certain that's exactly what you're asking, but the closest thing on the site says: ${passage(top.display ?? top.text, 240)}`,
    sources,
    followUps,
    escalate: true,
    debug,
  };
}

/* ------------------------------------------------------------------ *
 * Adding generation later
 *
 * If this becomes an LLM assistant, keep the pipeline above and insert the
 * model between retrieval and return — never in place of them:
 *
 *   1. Retrieve as now.
 *   2. Prompt the model with ONLY the retrieved chunk text, instructed to
 *      answer from it or say it doesn't know.
 *   3. Validate the reply: reject anything containing a figure, timeline or
 *      guarantee not present in the retrieved text.
 *   4. On any failure — provider error, validation failure, timeout — return
 *      the grounded answer this file already produces.
 *
 * That is ProjectHub's "degrade, don't break" property, and it is the reason
 * its widget still answers correctly when every provider is exhausted. The
 * grounded path must stay the floor, not the fallback nobody tests.
 * ------------------------------------------------------------------ */

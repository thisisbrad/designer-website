/**
 * Query understanding: normalisation, typo correction, intent classification
 * and contextual rewriting. Runs before retrieval to improve chunk matching.
 *
 * Ported from ProjectHub (github.com/BradleyMatera/ProjectHub, MIT). The
 * algorithms — Damerau-Levenshtein correction against the corpus vocabulary,
 * and anaphora resolution from conversation history — are unchanged. What is
 * new is the domain: the original classified recruiter intents (role-fit,
 * certifications, interview stories). This one classifies buying intents,
 * because the point here is to notice when a visitor is close to enquiring.
 */

// Explicit extension so `node --test` can run this module directly; the
// bundler resolves the literal path either way.
import { stem } from "./bm25.ts";

/** Misspellings common enough to be worth a direct hit before edit-distance runs. */
const TYPO_MAP: Record<string, string> = {
  webiste: "website", websit: "website", wesbite: "website",
  desing: "design", desgin: "design", diesgn: "design",
  seach: "search", serch: "search",
  optimzation: "optimization", optimisation: "optimization",
  analitics: "analytics", analystics: "analytics",
  converion: "conversion", convertion: "conversion",
  ecommerse: "ecommerce", ecomerce: "ecommerce",
  wordpres: "wordpress", wordpess: "wordpress",
  orlanod: "orlando", orlndo: "orlando",
  flordia: "florida", flrodia: "florida",
  bussiness: "business", buisness: "business", busines: "business",
  quesiton: "question",
  paymnet: "payment", payement: "payment",
  reponsive: "responsive", responsiv: "responsive",
  brandig: "branding", brading: "branding",
  timeine: "timeline", timelien: "timeline",
};

/**
 * Ordered — first match wins, so the specific cases sit above the general ones
 * and `safety` sits above everything.
 */
const INTENT_RULES: { intent: Intent; re: RegExp }[] = [
  {
    intent: "safety",
    re: /^(ignore |disregard |system prompt|reveal your|show me your prompt|\.env\b|api[ _-]?key|password)/i,
  },
  {
    /* Sits high on purpose. "Will you get me to number one?" is the question
       an SEO business is most likely to be held to later, and the site's own
       terms say plainly that nobody can promise it. Letting retrieval field
       this would answer a legal question with a blog passage. */
    intent: "guarantee",
    re: /\b(guarantee|guaranteed|promise|number 1|number one|#1|top of google|first page|rank me|get me to the top)\b/i,
  },
  {
    intent: "pricing",
    re: /\b(cost|costs|price|pricing|quote|budget|afford|how much|charge|rate|fee|expensive|cheap|payment|deposit)\b/i,
  },
  {
    intent: "timeline",
    re: /\b(how long|timeline|turnaround|deadline|when can|how soon|lead time|weeks|delivery)\b/i,
  },
  {
    intent: "location",
    re: /\b(orlando|melbourne|lakeland|daytona|deltona|lake mary|seminole|volusia|brevard|polk|florida|near me|local|my area|do you (work|serve))\b/i,
  },
  {
    intent: "process",
    re: /\b(process|how do you work|what happens|steps|stages|discovery|revisions|what to expect|onboard)\b/i,
  },
  {
    intent: "legal",
    re: /\b(privacy|cookie|cookies|gdpr|data|terms|contract|own the|ownership|nda|refund|cancel)\b/i,
  },
  {
    intent: "contact",
    re: /\b(email|phone|call|book|schedule|get started|hire|work together|reach you|contact|audit)\b/i,
  },
  {
    intent: "meta",
    re: /\b(are you (a )?(bot|ai|human|robot)|who am i (talking|speaking)|what are you|how do you work|chatgpt|claude|assistant)\b/i,
  },
  {
    intent: "smalltalk",
    re: /^(hi|hello|hey|yo|thanks|thank you|cheers|bye|goodbye|sup|howdy|good (morning|afternoon|evening))\b/i,
  },
];

export type Intent =
  | "safety"
  | "guarantee"
  | "pricing"
  | "timeline"
  | "location"
  | "process"
  | "legal"
  | "contact"
  | "meta"
  | "smalltalk"
  | "factual";

/** Intents where the visitor is close enough to buying that offering the audit is helpful. */
export const COMMERCIAL_INTENTS: ReadonlySet<Intent> = new Set<Intent>([
  "pricing",
  "timeline",
  "location",
  "contact",
  "process",
]);

export type Turn = { user: string; assistant: string };

export type Understanding = {
  original: string;
  normalized: string;
  /** What retrieval actually searches for — may carry context from prior turns. */
  rewritten: string;
  intent: Intent;
  /**
   * Fraction of the question's content words that exist in the corpus, 0–1.
   *
   * This is the off-domain detector, and it is needed because BM25 always
   * returns *something*: "what's the weather in Tampa tomorrow" scores as
   * highly as a real question, because "tampa" and "tomorrow" happen to appear
   * somewhere. Score alone cannot separate those. Vocabulary overlap can —
   * "weather" and "dissertation" are simply not words this site contains.
   */
  coverage: number;
};

/**
 * Measure how much of the question the corpus actually knows about.
 *
 * Deliberately computed *before* typo correction: correction's whole job is
 * to force unknown words onto known ones, so measuring afterwards would
 * report full coverage for every question ever asked.
 */
export function vocabularyCoverage(
  query: string,
  vocabulary: Set<string>,
  stemmedVocabulary?: Set<string>
): number {
  const words = String(query || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !CONTEXT_NOISE.has(w));

  // Nothing substantive to judge — "hi", "thanks". Treat as covered so these
  // fall through to the greeting path rather than a handoff.
  if (words.length === 0) return 1;

  let known = 0;
  for (const word of words) {
    if (vocabulary.has(word)) {
      known += 1;
      continue;
    }

    // Morphological variant, not a new topic: the site says "brand" and the
    // visitor typed "branding", which is three edits away but the same word.
    if (stemmedVocabulary?.has(stem(word))) {
      known += 1;
      continue;
    }

    // Count a near-miss as known, so a typo isn't mistaken for a new topic.
    let near = false;
    for (const term of vocabulary) {
      if (Math.abs(term.length - word.length) > 1) continue;
      if (damerauLevenshtein(word, term) <= 1) {
        near = true;
        break;
      }
    }
    if (near) known += 1;
  }

  return known / words.length;
}

/** Damerau-Levenshtein: Levenshtein plus adjacent transposition ("teh" → "the"). */
export function damerauLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

export function normalizeQuery(query: string): string {
  /* The question mark goes with everything else.
   *
   * ProjectHub's version preserved "?", which is harmless there. Here it is
   * not: typo correction runs on this output and skips words of three
   * characters or fewer, so "SEO?" survives as a four-character token, fails
   * the vocabulary check, and gets "corrected" to whatever real word sits two
   * edits away. That silently corrupted the retrieval query for the majority
   * of questions — because most questions end in a question mark.
   *
   * Nothing downstream needs it: no intent rule matches on "?", and tokenize()
   * strips punctuation anyway. */
  const q = String(query || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return q
    .split(/\s+/)
    .map((w) => TYPO_MAP[w] ?? w)
    .join(" ");
}

/**
 * Snap unknown words to the nearest corpus term within `maxDistance`.
 * Short words are left alone — at three characters or fewer, edit distance
 * stops discriminating and starts corrupting.
 */
export function correctTypos(
  query: string,
  vocabulary: Set<string>,
  maxDistance = 2,
  stemmedVocabulary?: Set<string>
): string {
  return query
    .split(/\s+/)
    .map((w) => {
      if (w.length <= 3 || vocabulary.has(w)) return w;

      // A real word the site expresses differently is not a typo. The site
      // says "brand"; a visitor types "branding". Those are three edits
      // apart, so without this guard correction would replace a perfectly
      // good query term with whatever unrelated word happens to sit nearby.
      if (stemmedVocabulary?.has(stem(w))) return w;

      let best = w;
      let bestDist = maxDistance + 1;
      for (const term of vocabulary) {
        // Length gap alone can exceed the budget — skip before paying for the matrix.
        if (Math.abs(term.length - w.length) > maxDistance) continue;
        const dist = damerauLevenshtein(w, term);
        if (dist < bestDist) {
          bestDist = dist;
          best = term;
        }
      }
      return best;
    })
    .join(" ");
}

export function classifyIntent(query: string): Intent {
  const q = String(query || "").toLowerCase();
  for (const rule of INTENT_RULES) {
    if (rule.re.test(q)) return rule.intent;
  }
  return "factual";
}

/** Words too common in this corpus to carry a follow-up's meaning forward. */
const CONTEXT_NOISE = new Set([
  "about", "what", "how", "tell", "does", "would", "could", "should",
  "website", "site", "beltowski", "studio", "brad", "there", "their",
  "please", "thanks", "really", "actually",
]);

/**
 * Resolve pronouns and ellipsis against the previous turn, so "what about
 * Orlando?" after a question about SEO searches for SEO *and* Orlando rather
 * than the word "Orlando" alone.
 *
 * Only fires on short or obviously-dependent questions; a full question is
 * left exactly as the visitor typed it.
 */
export function rewriteQuery(query: string, history: Turn[]): string {
  const q = String(query || "").trim();
  const qLower = q.toLowerCase();

  if (!Array.isArray(history) || history.length === 0) return q;

  const lastTurn = history[history.length - 1];
  if (!lastTurn?.user) return q;

  const isBareFollowup =
    /^(\s*)(what about|how about|and |also|what if|that|it|those|these|more about|why|ok but)\b/i.test(
      qLower
    );
  const isShortQuery = qLower.split(/\s+/).length < 8;
  if (!isBareFollowup && !isShortQuery) return q;

  const salient = (text: string, limit: number) =>
    String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4 && !CONTEXT_NOISE.has(w))
      .slice(0, limit);

  const queryWords = qLower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !CONTEXT_NOISE.has(w));

  const merged = [
    ...new Set([
      ...queryWords,
      ...salient(lastTurn.user, 3),
      ...salient(lastTurn.assistant, 3),
    ]),
  ];

  // Too little signal to be worth replacing what they actually asked.
  if (merged.length < 3) return q;

  return merged.slice(0, 10).join(" ");
}

/** The full pipeline: normalise → measure coverage → correct → classify → rewrite. */
export function understandQuery(
  query: string,
  history: Turn[] = [],
  vocabulary?: Set<string>,
  stemmedVocabulary?: Set<string>
): Understanding {
  let normalized = normalizeQuery(query);

  // Order matters: coverage is measured against what the visitor typed, and
  // correction then rewrites it. Swapping these two lines silently disables
  // off-domain detection.
  const coverage = vocabulary?.size
    ? vocabularyCoverage(normalized, vocabulary, stemmedVocabulary)
    : 1;

  if (vocabulary?.size) {
    normalized = correctTypos(normalized, vocabulary, 2, stemmedVocabulary);
  }

  return {
    original: String(query || "").trim(),
    normalized,
    rewritten: rewriteQuery(normalized, history),
    intent: classifyIntent(normalized),
    coverage,
  };
}

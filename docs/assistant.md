# The site assistant

A grounded question-answering widget built on the retrieval engine from
[ProjectHub](https://github.com/BradleyMatera/ProjectHub) (MIT), repointed at
this site's own content.

**It has no LLM.** Every answer is either written by hand in `answer.ts` or
quoted verbatim from a content file. That is a deliberate trade, explained
under [Why no LLM](#why-no-llm).

---

## What was taken from ProjectHub, and what wasn't

ProjectHub's Scout is a **recruiter assistant**: its 570KB knowledge base is
Bradley Matera's education, certifications, interview stories and target roles,
and `data.js` is CodePens and personal repos. Embedding it here via its script
tag would have answered "how much for a 5-page site?" with AWS certifications —
and added a third-party script plus a free-tier GCP VM as a hard dependency in
front of this site's lead flow.

What was worth taking was the engine and the architecture.

| Taken | From | Changed |
|---|---|---|
| Okapi BM25 — TF saturation, IDF, length normalisation | `lib/bm25.js` | Ported to TS; added an unstemmed vocabulary (see [bugs](#bugs-found-porting)) |
| Damerau-Levenshtein typo correction | `lib/query-understanding.js` | Added a stem guard so word forms aren't "corrected" |
| Intent classification | `lib/query-understanding.js` | Recruiter intents → **buying** intents |
| Contextual query rewriting (anaphora/ellipsis) | `lib/query-understanding.js` | Same algorithm, new noise list |
| Tag boost at fusion time | `lib/hybrid-retrieve.js` | Kept the idea; RRF/MMR not needed without a dense index |
| Grounded-first, degrade-don't-break | `server-gemini.js` | Kept as the whole design, not the fallback |
| Golden-set eval | `scripts/eval-retrieval.js` | Rewritten for this domain |

**Not taken:** the multi-provider LLM network, Think Mode, the GitHub
knowledge sync, the GCP VM, and the cost ledger. None have a job here.

The widget chrome *is* available — see [Two front ends, one brain](#two-front-ends-one-brain)
— but self-hosted, restyled and pointed at this site's own backend rather than
loaded from upstream as-is.

---

## Two front ends, one brain

`NEXT_PUBLIC_ASSISTANT_MODE` chooses which chat UI mounts. Both answer from the
same grounded engine, so the choice is cosmetic rather than substantive.

| Mode | UI | Backend |
|---|---|---|
| `grounded` *(default)* | `src/components/assistant/Assistant.tsx` | `/api/assistant` |
| `projecthub` | Scout's widget, self-hosted at `/scout.js` | `/api/assistant/scout` |
| `off` | none | — |

### Running Scout on studio content

Scout's `handleQuery` sends **every** question to its backend — the
client-side intent matching in `logic.js` is vestigial. That makes the backend
a clean seam: `/api/assistant/scout` speaks Scout's `{reply, followUps}`
contract and answers from this site's content, so keeping the chat UI costs
nothing in correctness. Replies are instant; upstream's own backend took ~11
seconds on a good run, routing through free-tier LLM providers on a shared VM.

What the backend can't fix is what's baked into the 51KB widget — suggestion
chips reading *"Why is Bradley a good junior candidate?"*, a header saying
"Recruiter assistant", a "100% free" badge about GCP free tiers. Those are
string literals, so `npm run scout:build` fetches upstream and rewrites them
into `public/scout.js`.

**Every patch is asserted, and the build fails if one misses.** A silent
partial patch is the only genuinely bad outcome — a widget that is 90%
rebranded and still says "recruiter" in the header. A final pass greps the
output for banned phrases as a second net. Both caught real misses while this
was written: a *second* hardcoded chip list (`prioritySuggestions`) that
prepends to the one already patched, and a *second* endpoint definition
(`chatApiUrl()`) on a different call path.

Self-hosting also removes the third-party request to `bradleymatera.github.io`
and the dependency on upstream's GCP VM — which is why the privacy page can
state that nothing a visitor types leaves this server, in either mode.

Re-run `npm run scout:build` after any upstream change. Styling lives
separately in `scout-brand.css`; see the header comment there for why it wins
on specificity rather than load order.

## Architecture

```
question
  ↓
understandQuery()          normalise → coverage → typo-correct → classify → rewrite
  ↓
  ├─ safety     → refusal          (never reaches retrieval)
  ├─ guarantee  → fixed answer     (a commercial commitment, not a search result)
  ├─ meta       → fixed answer
  ├─ smalltalk  → greeting
  └─ coverage < 0.7 → handoff      (off-domain: the words aren't on this site)
  ↓
BM25 search (depth 24)
  + intent query expansion
  + intent→tag affinity boost
  + title-match boost
  ↓ top 6
  ├─ FAQ hit         → the site's own answer, verbatim
  ├─ score ≥ 4.5     → quote the best passage
  ├─ score ≥ 1.8     → quote it, but say we're unsure
  └─ otherwise       → handoff to Brad + the audit form
```

| File | Role |
|---|---|
| `src/lib/assistant/bm25.ts` | Scoring, tokenising, stemming, both vocabularies |
| `src/lib/assistant/query.ts` | Query understanding and the off-domain coverage check |
| `src/lib/assistant/knowledge.ts` | Builds ~500 chunks from `src/data/*` at module load |
| `src/lib/assistant/answer.ts` | Ranking, thresholds, fixed answers, escalation |
| `src/app/api/assistant/route.ts` | Validation, rate limit, response shaping |
| `src/components/assistant/Assistant.tsx` | The widget |

### The knowledge base is derived, not synced

ProjectHub fetches its knowledge JSON from GitHub every 15 minutes because its
widget deploys separately from its data. Here the data **is** the site — the
same `services`, `locations`, `posts` and `legal` modules the pages render
from. There is no sync step to forget, and no way for the assistant to quote a
price the pages don't show.

Every chunk carries a `url`, so an answer always links the page that says the
same thing in full. Chunks may also carry `display` text: `text` is written for
the index and can hold keyword synonyms nobody reads, while `display` is what a
visitor actually sees.

---

## Why no LLM

The `/services/ai-solutions` page sells an assistant that is *"grounded in your
services, pricing rules, policies and FAQs — so answers are accurate and it
says 'let me get someone' instead of inventing."* This is that, built to its own
spec. A generative version would answer a wider range of questions and
occasionally invent a price, which is the wrong trade for a page selling the
opposite.

Practical consequences: no API key, no per-message cost, no provider outage, no
data leaving the server, and the privacy page can truthfully say no third-party
AI is involved.

**If you add one later**, keep the pipeline and insert the model *between*
retrieval and return, never in place of them — the seam is documented at the
bottom of `answer.ts`. Retrieve as now, prompt with only the retrieved chunks,
reject any reply containing a figure or guarantee not present in them, and fall
back to the grounded answer on any failure. That is ProjectHub's
degrade-don't-break property, and it's why its widget still answers correctly
when every provider is exhausted. Note that adding one makes the privacy page's
"no third-party AI" claim false — update it in the same commit.

---

## Testing

```bash
npm run assistant:test    # 21 unit tests, no server needed
npm run dev               # then, in another shell:
npm run assistant:eval    # 32-question golden set against the live route
```

The eval is the tuning instrument. Thresholds in `answer.ts` (`STRONG_MATCH`,
`WEAK_MATCH`, `MIN_COVERAGE`, the boosts) are corpus-specific — **re-run the
eval after any material content change**, because adding pages shifts IDF for
every term.

Currently **32/32**, up from 22/32 on the first run.

### Bugs found porting

Each of these is now pinned by a unit test.

1. **The question mark.** `normalizeQuery` preserved `?` (harmless in
   ProjectHub). Here, typo correction runs on its output and skips words of
   three characters or fewer — so `"SEO?"` survived as a *four*-character
   token, failed the vocabulary check, and was rewritten into whatever real
   word sat two edits away. This silently corrupted retrieval for **most
   questions**, because most questions end in a question mark. Fixing it moved
   several queries from ~4 to ~30 points.

2. **Stemmed vocabulary fed to an unstemmed matcher.** Typo correction compares
   what the visitor typed against the corpus, but it was given the *stemmed*
   term set — so a correctly spelled `"cookies"` was absent from the vocabulary
   and got "corrected" into noise. Fixed by keeping `rawVocabulary` alongside
   `vocabulary`.

3. **Word forms treated as typos.** The site says "brand"; a visitor types
   "branding". Three edits apart, so correction replaced a good query term with
   an unrelated word. Fixed by checking the stem before running edit distance.

4. **Domain stopwords.** An early version dropped "web", "site" and "page" as
   too common — which also destroyed "web design", the name of the top service.
   IDF already handles common terms. Removed.

5. **Off-domain questions answered confidently.** BM25 always ranks something
   first, so "what's the weather in Tampa tomorrow" scored as highly as a real
   question. Score cannot separate these; vocabulary coverage can.

6. **Keyword padding shown to visitors.** Retrieval text containing synonyms
   was being quoted back verbatim. Split into `text` and `display`.

---

## What the assistant tells you about the site

`assistant_handoff` fires whenever it can't answer — **a content backlog
generating itself.** Check it in GA4 alongside `assistant_question`.

The eval already surfaced one: **the word "deposit" appears nowhere on the
site.** "Is there a deposit?" is a normal thing to ask before hiring anyone,
and there is currently no answer to give. Worth a line on the service pages.

---

## Tuning

| Constant | File | Meaning |
|---|---|---|
| `STRONG_MATCH` 4.5 | `answer.ts` | Answer outright at or above this |
| `WEAK_MATCH` 1.8 | `answer.ts` | Below this, hand off |
| `MIN_COVERAGE` 0.7 | `answer.ts` | Share of question words that must exist on the site |
| `AFFINITY_BOOST` 1.35 | `answer.ts` | Boost for chunks matching the classified intent |
| `TITLE_BOOST_PER_TERM` 0.3 | `answer.ts` | Per query term found in a chunk title |
| `RATE_LIMIT` 60/min | `route.ts` | Per instance, per IP |

To add knowledge, add it to `src/data/*` — the pages and the assistant update
together. To add a fixed answer for a high-stakes question, add an intent to
`INTENT_RULES` and a canned reply in `answer.ts`, as `guarantee` does.

/**
 * Okapi BM25 retrieval — TF saturation, IDF weighting, document-length
 * normalisation. Pure TypeScript, no dependencies.
 *
 * Ported from ProjectHub (github.com/BradleyMatera/ProjectHub, MIT), where it
 * scores Recall@6 = 0.950 on a 40-query golden set. The scoring maths is
 * unchanged — only the types and module format are new.
 *
 * Sized for ~500 chunks: index build is a few milliseconds, query is sub-millisecond.
 */

const STOPWORDS = new Set([
  // Generic English
  "the", "a", "an", "is", "are", "was", "were", "his", "her", "he", "she",
  "it", "and", "or", "of", "to", "in", "for", "with", "about", "what", "who",
  "how", "does", "do", "did", "can", "me", "tell", "you", "your", "this",
  "that", "on", "at", "i", "be", "been", "being", "have", "has", "had",
  "will", "would", "could", "should", "may", "might", "must", "shall",
  "not", "no", "nor", "so", "than", "too", "very", "just", "but", "if",
  "then", "else", "when", "where", "why", "which", "while", "from", "by",
  "as", "also", "such", "over", "into", "out", "up", "down", "off", "all",
  "any", "each", "few", "more", "most", "other", "some", "only", "own",
  "same", "now", "one", "two", "here", "there", "my", "we", "us", "our",
]);

/* No domain stopword list. An earlier version dropped "web", "site" and
   "page" as too common to discriminate — which also destroyed "web design",
   the name of the top service. IDF already down-weights terms that appear
   everywhere; hand-tuning on top of it made retrieval worse, measurably. */

/** Light suffix stemmer. Crude by design — no dependency, and it only has to
 *  collapse plurals and gerunds well enough for retrieval. */
export function stem(word: string): string {
  let w = word.toLowerCase();
  if (w.length <= 3) return w;

  // Longest suffixes first, or "-edly" would be eaten by "-ly".
  if (w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.endsWith("edly")) w = w.slice(0, -4);
  else if (w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.endsWith("ly")) w = w.slice(0, -2);
  else if (w.endsWith("es") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);

  // Undo the doubled consonant suffix removal leaves behind: running → runn → run
  if (w.length > 3 && w[w.length - 1] === w[w.length - 2]) {
    if ("bdfgmnprt".includes(w[w.length - 1])) w = w.slice(0, -1);
  }
  return w;
}

export function tokenize(text: string): string[] {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

/** The minimum a document needs for indexing. Callers attach whatever else. */
export type Indexable = { text: string };

export type Scored<T> = T & { score: number; idx: number };

export class BM25Index<T extends Indexable> {
  private readonly k1: number;
  private readonly b: number;
  private readonly docLengths: number[];
  private readonly avgdl: number;
  private readonly tf: Map<string, number>[];
  private readonly df: Map<string, number>;
  private readonly n: number;

  readonly chunks: T[];
  /** Distinct *stemmed* terms — the index's own term space. */
  readonly vocabulary: Set<string>;
  /**
   * Distinct *unstemmed* words, for typo correction.
   *
   * These must not be stemmed. Typo correction runs on what the visitor
   * typed, so measuring edit distance against stems means a correctly spelled
   * word like "cookies" is absent from the vocabulary — and gets "corrected"
   * into whichever stem happens to sit two edits away.
   */
  readonly rawVocabulary: Set<string>;

  constructor(chunks: T[], options: { k1?: number; b?: number } = {}) {
    this.k1 = options.k1 ?? 1.2;
    this.b = options.b ?? 0.75;
    this.chunks = chunks;

    const docTokens = chunks.map((c) => tokenize(c.text));
    this.docLengths = docTokens.map((t) => t.length);
    this.avgdl =
      this.docLengths.length > 0
        ? this.docLengths.reduce((s, l) => s + l, 0) / this.docLengths.length
        : 0;

    this.tf = docTokens.map((tokens) => {
      const freq = new Map<string, number>();
      for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
      return freq;
    });

    this.df = new Map();
    this.vocabulary = new Set();
    for (const tokens of docTokens) {
      for (const t of new Set(tokens)) {
        this.df.set(t, (this.df.get(t) ?? 0) + 1);
        this.vocabulary.add(t);
      }
    }

    this.rawVocabulary = new Set();
    for (const chunk of chunks) {
      for (const word of String(chunk.text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)) {
        if (word.length > 3) this.rawVocabulary.add(word);
      }
    }

    this.n = chunks.length;
  }

  /** Smoothed IDF: ln( (N - df + 0.5) / (df + 0.5) + 1 ) */
  private idf(term: string): number {
    const df = this.df.get(term) ?? 0;
    return Math.log((this.n - df + 0.5) / (df + 0.5) + 1);
  }

  private scoreDoc(docIdx: number, queryTerms: string[]): number {
    const tf = this.tf[docIdx];
    if (!tf) return 0;

    const dl = this.docLengths[docIdx] ?? 0;
    const denom = this.k1 * (1 - this.b + this.b * (dl / (this.avgdl || 1)));

    let score = 0;
    for (const term of queryTerms) {
      const f = tf.get(term);
      if (!f) continue;
      score += this.idf(term) * ((f * (this.k1 + 1)) / (f + denom));
    }
    return score;
  }

  /** Top-k chunks by BM25 score. Zero-scoring documents are dropped, not ranked. */
  search(question: string, k = 6): Scored<T>[] {
    const queryTerms = tokenize(question);
    if (queryTerms.length === 0) return [];

    const scored: Scored<T>[] = [];
    for (let i = 0; i < this.chunks.length; i++) {
      const score = this.scoreDoc(i, queryTerms);
      if (score > 0) scored.push({ ...this.chunks[i], score, idx: i });
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, k);
  }
}

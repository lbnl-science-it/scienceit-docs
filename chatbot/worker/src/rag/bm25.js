/**
 * BM25 keyword search over the chunks, built in memory per isolate.
 *
 * Embeddings are weak on exact identifiers (lr_debug, es3, sacctmgr, an error
 * string pasted from sbatch) and BM25 is strong on them, so the two are fused.
 * BM25 also needs no network call, which makes it the fallback when the
 * embedding service is down.
 *
 * Building this for a few hundred chunks takes milliseconds, so it is derived
 * from the chunk text at load time rather than stored in the index.
 */
import { tokenize } from "./text.js";

const K1 = 1.2;
const B = 0.75;

/** docs: array of strings. */
export function buildBm25(docs) {
  const postings = new Map(); // term -> [[docIdx, tf], ...]
  const lengths = new Float64Array(docs.length);
  docs.forEach((doc, i) => {
    const tf = new Map();
    const toks = tokenize(doc);
    lengths[i] = toks.length;
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    for (const [t, n] of tf) {
      if (!postings.has(t)) postings.set(t, []);
      postings.get(t).push([i, n]);
    }
  });
  const avgdl = lengths.reduce((a, b) => a + b, 0) / (docs.length || 1);
  return { postings, lengths, avgdl, n: docs.length };
}

/** Returns [{ idx, score }] sorted best-first, at most k. */
export function searchBm25(index, query, k) {
  const scores = new Map();
  for (const term of new Set(tokenize(query))) {
    const list = index.postings.get(term);
    if (!list) continue;
    const idf = Math.log(1 + (index.n - list.length + 0.5) / (list.length + 0.5));
    for (const [i, tf] of list) {
      const norm = tf + K1 * (1 - B + (B * index.lengths[i]) / index.avgdl);
      scores.set(i, (scores.get(i) || 0) + (idf * (tf * (K1 + 1))) / norm);
    }
  }
  return [...scores]
    .map(([idx, score]) => ({ idx, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

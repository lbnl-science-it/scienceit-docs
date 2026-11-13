/**
 * Query-time retrieval: keyword (BM25) and vector search, fused with
 * Reciprocal Rank Fusion, then trimmed to a token budget with a per-page cap so
 * that comparison and walkthrough questions get more than one page.
 */
import { searchBm25 } from "./bm25.js";
import { chunkDocument } from "./chunk.js";
import { embed } from "./embed.js";
import { estimateTokens } from "./text.js";

const CANDIDATES = 30; // per retriever, before fusion
const RRF_K = 60; // standard RRF damping constant
const MAX_SOURCES = 8;
// Several condo-cluster pages (catamount, mhg, dirac1, etna, alsacc) share
// boilerplate sections word for word, so one generic question would otherwise
// fill every slot with copies of the same text. Measured on the live docs,
// those copies score 0.90-1.00 token-set Jaccard against each other, while the
// closest genuinely different pages (FFTW vs HDF5 loading) score 0.85.
export const DUPLICATE_JACCARD = 0.88;

export function jaccard(a, b) {
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return shared / (a.size + b.size - shared || 1);
}
const QUERY_PART_CHARS = 1000;

// A follow-up such as "now make it a GPU node" has nothing to search on by
// itself; it only makes sense with the turn before it.
const FOLLOW_UP =
  /^(and|but|also|now|then|so|ok(ay)?|what about|how about|same|make it|change|instead|it|that|this|those|they|what if)\b/i;

/**
 * The text to retrieve with. Usually the last user message; for a short or
 * referential follow-up, the two user messages before it are prepended. Done
 * without an LLM rewrite on purpose: that would add a full round trip to every
 * turn.
 */
export function retrievalQuery(messages) {
  const users = messages.filter((m) => m.role === "user").map((m) => m.content.trim());
  const last = users[users.length - 1] || "";
  const words = last.split(/\s+/).filter(Boolean).length;
  const parts = [last];
  if (users.length > 1 && (words <= 8 || FOLLOW_UP.test(last))) {
    parts.unshift(...users.slice(-3, -1));
  }
  return parts.map((p) => p.slice(0, QUERY_PART_CHARS)).join("\n");
}

/** Brute-force cosine similarity; vectors are unit length. [{idx, score}] best-first. */
export function searchDense(index, queryVec, k) {
  const { vectors, dims } = index;
  const n = vectors.length / dims;
  const scores = new Array(n);
  for (let i = 0; i < n; i++) {
    let dot = 0;
    const off = i * dims;
    for (let d = 0; d < dims; d++) dot += vectors[off + d] * queryVec[d];
    scores[i] = { idx: i, score: dot };
  }
  return scores.sort((a, b) => b.score - a.score).slice(0, k);
}

/** Reciprocal Rank Fusion over ranked lists of {idx}. [{idx, score}] best-first. */
export function rrf(lists) {
  const fused = new Map();
  for (const list of lists) {
    list.forEach(({ idx }, rank) => fused.set(idx, (fused.get(idx) || 0) + 1 / (RRF_K + rank + 1)));
  }
  return [...fused].map(([idx, score]) => ({ idx, score })).sort((a, b) => b.score - a.score);
}

/**
 * Walk the fused ranking, taking chunks until the token budget is spent, with
 * at most `maxPerPage` from any one page and no near-duplicate of a chunk
 * already taken (when `tokenSets` is given). The top chunk is always taken,
 * even if it alone exceeds the budget.
 */
export function selectSources(ranked, chunks, { budgetTokens, maxPerPage, tokenSets }) {
  const picked = [];
  const perPage = new Map();
  let used = 0;
  for (const { idx } of ranked) {
    if (picked.length >= MAX_SOURCES) break;
    const c = chunks[idx];
    if ((perPage.get(c.page) || 0) >= maxPerPage) continue;
    if (tokenSets && picked.some((p) => jaccard(tokenSets[p], tokenSets[idx]) >= DUPLICATE_JACCARD)) continue;
    const cost = estimateTokens(chunkDocument(c));
    if (picked.length && used + cost > budgetTokens) continue;
    picked.push(idx);
    perPage.set(c.page, (perPage.get(c.page) || 0) + 1);
    used += cost;
  }
  return picked;
}

/**
 * Retrieve sources for a conversation. Never throws for an embedding failure:
 * it falls back to keyword search and reports `denseError`.
 */
export async function retrieve(env, index, messages, opts) {
  const query = retrievalQuery(messages);
  const lexical = searchBm25(index.bm25, query, CANDIDATES);

  let dense = [];
  let denseError = null;
  if (index.dense) {
    try {
      const [qv] = await embed(env, [query], "query", {
        model: index.model,
        timeoutMs: opts.embedTimeoutMs,
      });
      dense = searchDense(index, qv, CANDIDATES);
    } catch (e) {
      denseError = e.message;
    }
  } else {
    denseError = "index built with a different embedding model";
  }

  const ranked = rrf([lexical, dense]);
  const picked = selectSources(ranked, index.chunks, { ...opts, tokenSets: index.tokenSets });
  return {
    query,
    sources: picked.map((i) => index.chunks[i]),
    denseError,
  };
}

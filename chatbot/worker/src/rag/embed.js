/**
 * Embeddings through CBorg's OpenAI-compatible /embeddings endpoint.
 *
 * nomic-embed-text is trained with task prefixes and retrieves noticeably
 * worse without them: documents are embedded as "search_document: ..." and
 * queries as "search_query: ...". Both sides must use the same model, which is
 * why the index records the model it was built with.
 */
export const DEFAULT_EMBED_MODEL = "lbl/nomic-embed-text";

const PREFIX = { document: "search_document: ", query: "search_query: " };

/**
 * Embed `texts` (one batch) and return unit-length Float32Arrays, so a dot
 * product is cosine similarity. `kind` is "document" or "query".
 */
export async function embed(env, texts, kind, { timeoutMs = 10000, model } = {}) {
  const baseUrl = (env.CBORG_BASE_URL || "https://api.cborg.lbl.gov").replace(/\/+$/, "");
  const res = await fetch(`${baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CBORG_API_KEY}`,
    },
    body: JSON.stringify({
      model: model || env.EMBED_MODEL || DEFAULT_EMBED_MODEL,
      input: texts.map((t) => PREFIX[kind] + t),
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Embedding failed: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  const { data } = await res.json();
  if (!Array.isArray(data) || data.length !== texts.length) {
    throw new Error("Embedding response did not match the request");
  }
  return data
    .sort((a, b) => a.index - b.index)
    .map((d) => normalize(Float32Array.from(d.embedding)));
}

export function normalize(v) {
  let sum = 0;
  for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= norm;
  return v;
}

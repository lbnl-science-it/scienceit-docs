/**
 * Where the retrieval index lives: Workers KV, binding RAG_INDEX.
 *
 *   manifest                  {version, model, dims, count, builtAt, previous}
 *   index:<version>:chunks    JSON array of {page, title, section, url, text, hash}
 *   index:<version>:vectors   Float32 ArrayBuffer, count x dims, unit length, chunk order
 *   build                     indexer progress between cron runs (see indexer.js)
 *
 * Versioned keys are immutable, and the manifest is written last, so a reader
 * never sees half of one build and half of another.
 */
import { buildBm25 } from "./bm25.js";
import { chunkDocument } from "./chunk.js";
import { DEFAULT_EMBED_MODEL } from "./embed.js";
import { tokenize } from "./text.js";

export const KEYS = {
  manifest: "manifest",
  build: "build",
  chunks: (v) => `index:${v}:chunks`,
  vectors: (v) => `index:${v}:vectors`,
};

// How often an isolate asks KV whether a newer index has been published.
const MANIFEST_RECHECK_MS = 60 * 1000;

// Per-isolate copy of the loaded index. Loading is a few hundred KB of JSON
// plus ~1 MB of vectors, so it happens once per isolate per index version.
let memo = null;

export function resetIndexMemo() {
  memo = null;
}

/**
 * Returns the current index, or null if none has been published yet.
 * { version, model, dims, chunks, vectors, bm25, dense }
 * `dense` is false when the index was built with a different embedding model
 * than the Worker is configured for: its vectors can't be compared with query
 * vectors, so only keyword search is used until the next rebuild.
 */
export async function loadIndex(env) {
  const kv = env.RAG_INDEX;
  if (!kv) return null;
  const now = Date.now();
  if (memo && now - memo.checkedAt < MANIFEST_RECHECK_MS) return memo;

  const manifest = await kv.get(KEYS.manifest, { type: "json", cacheTtl: 60 });
  if (!manifest) return null;
  if (memo && memo.version === manifest.version) {
    memo.checkedAt = now;
    return memo;
  }

  const [chunks, buf] = await Promise.all([
    kv.get(KEYS.chunks(manifest.version), { type: "json", cacheTtl: 86400 }),
    kv.get(KEYS.vectors(manifest.version), { type: "arrayBuffer", cacheTtl: 86400 }),
  ]);
  if (!chunks || !buf || buf.byteLength !== chunks.length * manifest.dims * 4) {
    console.error(`RAG index ${manifest.version} is missing or malformed in KV.`);
    return memo; // keep serving the previous copy, if this isolate has one
  }

  const configured = env.EMBED_MODEL || DEFAULT_EMBED_MODEL;
  if (manifest.model !== configured) {
    console.warn(
      `RAG index was built with ${manifest.model} but EMBED_MODEL is ${configured}; ` +
        "using keyword search only until the index is rebuilt."
    );
  }
  memo = {
    version: manifest.version,
    model: manifest.model,
    dims: manifest.dims,
    chunks,
    vectors: new Float32Array(buf),
    bm25: buildBm25(chunks.map(chunkDocument)),
    // For near-duplicate suppression when picking sources (retrieve.js).
    tokenSets: chunks.map((c) => new Set(tokenize(c.text))),
    dense: manifest.model === configured,
    checkedAt: now,
  };
  return memo;
}

// --- Vector <-> base64, for keeping vectors in the JSON build state ---------
export function f32ToB64(vec) {
  const bytes = new Uint8Array(vec.buffer, vec.byteOffset, vec.byteLength);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

export function b64ToF32(b64) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Float32Array(bytes.buffer);
}

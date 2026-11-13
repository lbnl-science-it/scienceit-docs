/**
 * Builds the retrieval index from the published docs. Run by the Worker's cron
 * trigger, so the CBorg key stays in the Worker and CI needs no secrets.
 *
 * Each run:
 *  1. Fetches llms-full.txt and hashes it. Unchanged since the published index
 *     -> nothing to do (one subrequest per run in the steady state).
 *  2. Fetches llms.txt for the page list, then each page's index.md, and chunks it.
 *  3. Embeds only chunks whose text is new: unchanged chunks reuse their vector
 *     from the published index, so a one-section edit costs one embedding.
 *  4. Publishes the versioned chunks and vectors, then flips the manifest.
 *
 * Work is capped at INDEX_SUBREQUEST_BUDGET outbound requests per run (the
 * Workers Free plan allows 50 per invocation). A build that doesn't fit saves
 * its progress under the `build` key and the next cron run picks it up, so a
 * full rebuild may take a few runs on Free and one on Paid.
 */
import { parseLlmsTxt, chunkPage, chunkDocument } from "./chunk.js";
import { embed, DEFAULT_EMBED_MODEL } from "./embed.js";
import { KEYS, f32ToB64, b64ToF32 } from "./store.js";
import { sha256Hex, sanitizeCorpus } from "./text.js";

// Bump when chunking changes, so the next run rebuilds even if the docs didn't.
export const CHUNKER_VERSION = 2;
const EMBED_BATCH = 32;
const FETCH_TIMEOUT_MS = 15000;

export async function runIndexer(env) {
  const kv = env.RAG_INDEX;
  if (!kv) throw new Error("RAG_INDEX KV binding is missing");
  if (!env.LLMS_FULL_URL) throw new Error("LLMS_FULL_URL is not configured");
  const budget = Number(env.INDEX_SUBREQUEST_BUDGET) > 0 ? Number(env.INDEX_SUBREQUEST_BUDGET) : 45;
  const model = env.EMBED_MODEL || DEFAULT_EMBED_MODEL;
  const llmsTxtUrl = env.LLMS_TXT_URL || env.LLMS_FULL_URL.replace(/llms-full\.txt$/, "llms.txt");

  let used = 0;
  const getText = async (url) => {
    used++;
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`GET ${url}: HTTP ${res.status}`);
    return res.text();
  };

  // 1. Has anything changed?
  const full = await getText(env.LLMS_FULL_URL);
  const version = (await sha256Hex(`${model}\n${CHUNKER_VERSION}\n${full}`)).slice(0, 16);
  const manifest = await kv.get(KEYS.manifest, "json");
  let state = await kv.get(KEYS.build, "json");
  if (manifest?.version === version) {
    if (state) await kv.delete(KEYS.build); // a stale build for an older docs version
    return { status: "current", version };
  }
  // Docs changed mid-build: start over against the new version.
  if (!state || state.version !== version) {
    const pages = parseLlmsTxt(await getText(llmsTxtUrl));
    if (!pages.length) throw new Error("llms.txt listed no pages");
    state = { version, model, pages, cursor: 0, chunks: [], vectors: {} };
  }

  try {
    // 2. Fetch and chunk pages.
    while (state.cursor < state.pages.length && used < budget) {
      const page = state.pages[state.cursor];
      const markdown = sanitizeCorpus(await getText(page.mdUrl));
      for (const c of chunkPage(page, markdown)) {
        state.chunks.push({ ...c, hash: (await sha256Hex(chunkDocument(c))).slice(0, 32) });
      }
      state.cursor++;
    }
    if (state.cursor < state.pages.length) return await saveProgress(kv, state, "chunking");

    // 3. Embed what is new.
    const reuse = await publishedVectors(kv, manifest, model);
    const todo = [];
    const seen = new Set();
    for (const c of state.chunks) {
      if (seen.has(c.hash) || state.vectors[c.hash] || reuse.has(c.hash)) continue;
      seen.add(c.hash);
      todo.push(c);
    }
    let embedded = 0;
    while (embedded < todo.length && used < budget) {
      const batch = todo.slice(embedded, embedded + EMBED_BATCH);
      used++;
      const vecs = await embed(env, batch.map(chunkDocument), "document", { model, timeoutMs: 30000 });
      batch.forEach((c, i) => (state.vectors[c.hash] = f32ToB64(vecs[i])));
      embedded += batch.length;
    }
    if (embedded < todo.length) return await saveProgress(kv, state, "embedding");

    // 4. Publish.
    const vecOf = (hash) => (state.vectors[hash] ? b64ToF32(state.vectors[hash]) : reuse.get(hash));
    const dims = vecOf(state.chunks[0].hash).length;
    const all = new Float32Array(state.chunks.length * dims);
    state.chunks.forEach((c, i) => all.set(vecOf(c.hash), i * dims));

    await kv.put(KEYS.chunks(version), JSON.stringify(state.chunks));
    await kv.put(KEYS.vectors(version), all.buffer);
    await kv.put(
      KEYS.manifest,
      JSON.stringify({
        version,
        model,
        dims,
        count: state.chunks.length,
        builtAt: new Date().toISOString(),
        previous: manifest?.version ?? null,
      })
    );
    await kv.delete(KEYS.build);
    // Keep the version just replaced (isolates may still be loading it) and
    // drop the one before it.
    if (manifest?.previous) {
      await kv.delete(KEYS.chunks(manifest.previous));
      await kv.delete(KEYS.vectors(manifest.previous));
    }
    return {
      status: "published",
      version,
      chunks: state.chunks.length,
      embedded: todo.length,
      reused: state.chunks.length - todo.length,
    };
  } catch (e) {
    // Keep whatever this run finished, so the next run doesn't redo it.
    await kv.put(KEYS.build, JSON.stringify(state));
    throw e;
  }
}

async function saveProgress(kv, state, phase) {
  await kv.put(KEYS.build, JSON.stringify(state));
  return {
    status: "partial",
    phase,
    version: state.version,
    pagesDone: state.cursor,
    pages: state.pages.length,
  };
}

/** hash -> vector from the currently published index, if built with `model`. */
async function publishedVectors(kv, manifest, model) {
  const out = new Map();
  if (!manifest || manifest.model !== model) return out;
  const [chunks, buf] = await Promise.all([
    kv.get(KEYS.chunks(manifest.version), "json"),
    kv.get(KEYS.vectors(manifest.version), "arrayBuffer"),
  ]);
  if (!chunks || !buf) return out;
  const all = new Float32Array(buf);
  chunks.forEach((c, i) => out.set(c.hash, all.slice(i * manifest.dims, (i + 1) * manifest.dims)));
  return out;
}

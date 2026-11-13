/**
 * Small text helpers shared by the indexer and the request path.
 */

export const CHARS_PER_TOKEN = 4; // rough token estimate, same as index.js

export function estimateTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Heading text -> anchor id, matching Python-Markdown's default toc slugify,
 * which this site uses (mkdocs.yml sets no custom slugify):
 * strip inline Markdown, drop anything not a word char/space/hyphen, lowercase,
 * collapse runs of spaces and hyphens to one hyphen.
 * "How to specify desired GPU card(s)" -> "how-to-specify-desired-gpu-cards"
 */
export function slugify(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/[`*]/g, "")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-");
}

// Common English words that carry no retrieval signal. Kept short on purpose:
// words like "job", "node" or "run" matter in these docs and stay in.
const STOPWORDS = new Set(
  ("a an and are as at be but by can do does for from how i if in into is it its " +
    "me my of on or so that the their them then there these this to was what when " +
    "where which who why will with you your").split(" ")
);

/**
 * Lowercase word tokens for BM25. Identifiers with underscores ("lr_debug",
 * "es3_normal") are kept whole AND split into their parts, so both "lr_debug"
 * and "lr debug" match them.
 */
export function tokenize(text) {
  const out = [];
  for (const tok of text.toLowerCase().match(/[a-z0-9_]+/g) || []) {
    if (STOPWORDS.has(tok)) continue;
    out.push(tok);
    if (tok.includes("_")) {
      for (const part of tok.split("_")) if (part && !STOPWORDS.has(part)) out.push(part);
    }
  }
  return out;
}

/**
 * Strip invisible characters from docs text before it becomes part of a prompt.
 *
 * Zero-width spaces, bidi overrides and word joiners render as nothing (or, in
 * the case of RLO, silently reverse the text around them), so an instruction
 * hidden with them is invisible in a browser and in a PR diff while the model
 * reads it like any other text. The docs are fetched from a URL and dropped
 * verbatim into the system prompt, which makes them the one input here a
 * reviewer cannot eyeball. Ordinary prose, Markdown and URLs are left
 * byte-identical.
 */
export function sanitizeCorpus(text) {
  return text.replace(/[​-‏‪-‮⁠-⁤⁦-⁩﻿]/g, "");
}

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

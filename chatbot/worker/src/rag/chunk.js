/**
 * Turning the published docs into retrieval chunks.
 *
 * Source: llms.txt (the page list, with titles and absolute URLs) and each
 * page's rendered Markdown at <page>/index.md, both produced by the
 * mkdocs-llmstxt plugin. The Markdown is post-macros, so no {{ }} placeholders.
 */
import { slugify } from "./text.js";

// Chunk size bounds, in characters (~4 chars per token).
export const MAX_CHARS = 1800; // ~450 tokens
export const MIN_CHARS = 400; // ~100 tokens; smaller chunks merge into a neighbour
// A short paragraph at the end of a full chunk is usually a lead-in to what
// follows ("Examples:", or an FAQ question whose answer is the next
// paragraph), so it moves forward with that content instead of being orphaned.
const LEAD_IN_CHARS = 160;

/**
 * Parse llms.txt into pages:
 *   ## Section
 *   - [Title](https://host/path/index.md): optional description
 */
export function parseLlmsTxt(text) {
  const pages = [];
  let section = "";
  for (const line of text.split("\n")) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      section = h[1];
      continue;
    }
    const m = line.match(/^\s*-\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
    if (!m) continue;
    const mdUrl = m[2];
    const url = mdUrl.replace(/index\.md$/, "").replace(/\.md$/, "/");
    pages.push({ title: m[1], section, mdUrl, url, key: pageKeyFromUrl(url) });
  }
  return pages;
}

/** "https://host/hpc/faqs/" -> "hpc/faqs"; the site root -> "index". */
export function pageKeyFromUrl(url) {
  const path = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
  return path || "index";
}

/** Split Markdown into blocks: paragraphs, with fenced code kept whole. */
function blocks(lines) {
  const out = [];
  let cur = [];
  let fence = null;
  const flush = () => {
    if (cur.some((l) => l.trim())) out.push(cur.join("\n").trim());
    cur = [];
  };
  for (const line of lines) {
    const marker = line.trimStart().match(/^(`{3,}|~{3,})/);
    if (fence) {
      cur.push(line);
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length) {
        fence = null;
        flush();
      }
      continue;
    }
    if (marker) {
      flush();
      fence = marker[1];
      cur.push(line);
      continue;
    }
    if (!line.trim()) flush();
    else cur.push(line);
  }
  flush(); // an unterminated fence still ends up in one block
  return out;
}

const isCode = (block) => /^(`{3,}|~{3,})/.test(block);
// FAQ admonitions render as a bare question paragraph followed by its answer,
// with no heading, so a question line is treated as a soft section break.
const isQuestion = (block) => block.length <= 200 && !isCode(block) && /\?\s*$/.test(block);

/** Pack blocks into pieces of at most MAX_CHARS (a single huge block stays whole). */
function pack(paragraphs) {
  const pieces = [];
  let cur = [];
  let len = 0;
  for (const p of paragraphs) {
    if (cur.length && isQuestion(p) && len >= MIN_CHARS) {
      pieces.push(cur);
      cur = [];
      len = 0;
    } else if (cur.length && len + p.length > MAX_CHARS) {
      const carry = [];
      // Move a trailing lead-in forward, unless it is all the chunk has.
      while (cur.length > 1) {
        const last = cur[cur.length - 1];
        if (last.length > LEAD_IN_CHARS || isCode(last)) break;
        carry.unshift(cur.pop());
      }
      pieces.push(cur);
      cur = carry;
      len = carry.reduce((n, c) => n + c.length, 0);
    }
    cur.push(p);
    len += p.length;
  }
  if (cur.length) pieces.push(cur);
  return pieces.map((ps) => ps.join("\n\n"));
}

/**
 * Chunk one page. Sections start at H2/H3; deeper headings stay in the text.
 * Each chunk carries the page title, its section breadcrumb and a deep link.
 */
export function chunkPage(page, markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const slugCounts = new Map();
  // Python-Markdown dedupes ids across ALL headings on the page: foo, foo_1, ...
  const anchorFor = (text) => {
    const base = slugify(text);
    const n = slugCounts.get(base) || 0;
    slugCounts.set(base, n + 1);
    return n ? `${base}_${n}` : base;
  };

  const sections = [];
  let sec = { h2: null, h3: null, anchor: null, lines: [] };
  let pageTitle = page.title;
  let fence = null;
  let sawH1 = false;
  for (const line of lines) {
    const marker = line.trimStart().match(/^(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
    }
    const h = !fence && !marker && line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!h) {
      sec.lines.push(line);
      continue;
    }
    const level = h[1].length;
    const text = h[2].replace(/[`*]/g, "").trim();
    const anchor = anchorFor(h[2]);
    if (level === 1 && !sawH1) {
      // The page's own H1 is usually more specific than its nav title in
      // llms.txt ("Einsteinium GPU Cluster" vs "GPU Cluster"), and it is the
      // name readers search by.
      sawH1 = true;
      pageTitle = text || page.title;
      continue;
    }
    if (level === 2 || level === 3) {
      sections.push(sec);
      sec = {
        h2: level === 2 ? text : sec.h2,
        h3: level === 3 ? text : null,
        anchor,
        lines: [],
      };
    } else {
      sec.lines.push(line); // H1 repeats and H4+ stay as content
    }
  }
  sections.push(sec);

  let chunks = [];
  for (const s of sections) {
    const paragraphs = blocks(s.lines);
    if (!paragraphs.length) continue;
    const breadcrumb = [s.h2, s.h3].filter(Boolean).join(" › ");
    for (const text of pack(paragraphs)) {
      chunks.push({
        page: page.key,
        title: pageTitle,
        section: breadcrumb,
        url: s.anchor ? `${page.url}#${s.anchor}` : page.url,
        text,
      });
    }
  }

  // Merge undersized chunks forward (or, for the last one, backward) so a
  // two-line section doesn't become a near-empty retrieval unit.
  const merged = [];
  for (const c of chunks) {
    const prev = merged[merged.length - 1];
    if (prev && prev.text.length < MIN_CHARS && prev.text.length + c.text.length <= MAX_CHARS) {
      prev.text = `${prev.text}\n\n${c.section && c.section !== prev.section ? `${c.section}\n\n` : ""}${c.text}`;
      continue;
    }
    merged.push({ ...c });
  }
  if (merged.length > 1) {
    const last = merged[merged.length - 1];
    const prev = merged[merged.length - 2];
    if (last.text.length < MIN_CHARS && prev.text.length + last.text.length <= MAX_CHARS) {
      prev.text = `${prev.text}\n\n${last.section && last.section !== prev.section ? `${last.section}\n\n` : ""}${last.text}`;
      merged.pop();
    }
  }
  chunks = merged;
  return chunks;
}

/** The exact text that is embedded and BM25-indexed for a chunk. */
export function chunkDocument(chunk) {
  const head = chunk.section ? `${chunk.title} › ${chunk.section}` : chunk.title;
  return `${head}\n\n${chunk.text}`;
}

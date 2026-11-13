#!/usr/bin/env node
/**
 * Eval runner for the docs chatbot. See README.md for usage.
 *
 * Talks to the Worker exactly as the widget does (POST /chat, Turnstile token
 * then session token, SSE stream), so whatever the Worker does internally —
 * full-context today, RAG later — is measured end to end with the same code.
 *
 * Per turn it records latency, token usage (from the stream's usage frame),
 * whether the reply hit the output cap, which doc pages the answer links to,
 * the deterministic regex checks, and an LLM judge's score.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CASES, CATEGORIES } from "./questions.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(HERE, "..", "..", "docs");
const DEV_VARS = join(HERE, "..", "worker", ".dev.vars");
const DOCS_HOST = "scienceit-docs.lbl.gov";
// Cloudflare's always-passes test secret (in .dev.vars) accepts any token.
const DUMMY_TURNSTILE = "XXXX.DUMMY.TOKEN.XXXX";

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const opts = {
    endpoint: "http://localhost:8787/chat",
    origin: "http://localhost:8000",
    runs: 3,
    label: "run",
    only: null,
    judge: true,
    judgeModel: "claude-sonnet-5-5",
    cborgBase: "https://api.cborg.lbl.gov",
    compare: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--endpoint") opts.endpoint = next();
    else if (a === "--origin") opts.origin = next();
    else if (a === "--runs") opts.runs = Number(next());
    else if (a === "--label") opts.label = next();
    else if (a === "--only") opts.only = next().split(",");
    else if (a === "--no-judge") opts.judge = false;
    else if (a === "--judge-model") opts.judgeModel = next();
    else if (a === "--compare") opts.compare = [next(), next()];
    else throw new Error(`Unknown argument: ${a}`);
  }
  return opts;
}

/** The judge calls CBorg directly, with the same key the Worker uses locally. */
async function cborgKey() {
  if (process.env.CBORG_API_KEY) return process.env.CBORG_API_KEY;
  if (!existsSync(DEV_VARS)) return null;
  const line = (await readFile(DEV_VARS, "utf8"))
    .split("\n")
    .find((l) => l.startsWith("CBORG_API_KEY="));
  return line ? line.slice("CBORG_API_KEY=".length).trim().replace(/^"|"$/g, "") : null;
}

// ---------------------------------------------------------------------------
// Talking to the Worker
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let sessionToken = null;

/** POST /chat, handling the auth handshake and backing off on 429/503. */
async function postChat(opts, messages) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const headers = { "Content-Type": "application/json", Origin: opts.origin };
    if (sessionToken) headers["X-Session-Token"] = sessionToken;
    else headers["X-Turnstile-Token"] = DUMMY_TURNSTILE;

    const started = performance.now();
    const res = await fetch(opts.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages }),
    });
    const refreshed = res.headers.get("X-Session-Token");
    if (refreshed) sessionToken = refreshed;

    if (res.status === 401 && sessionToken) {
      sessionToken = null; // expired session: verify again
      continue;
    }
    if (res.status === 429 || res.status === 503) {
      const wait = Number(res.headers.get("Retry-After")) || 60;
      console.warn(`  HTTP ${res.status}, waiting ${wait}s`);
      await res.body?.cancel();
      await sleep(wait * 1000);
      continue;
    }
    return { res, started };
  }
  throw new Error("Gave up after repeated 401/429/503 responses");
}

/** Read the SSE stream the way the widget does, timing it as we go. */
async function readStream(res, started) {
  const out = {
    content: "",
    reasoning: "",
    ttftMs: null, // first token of any kind, thought included
    ttfaMs: null, // first visible answer token: what the reader waits for
    totalMs: null,
    usage: null,
    finishReason: null,
    model: null,
    sources: null, // RAG mode: what the Worker retrieved, from its leading frame
  };
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      let frame;
      try {
        frame = JSON.parse(data);
      } catch {
        continue;
      }
      if (frame.sources) out.sources = frame.sources;
      out.model ??= frame.model ?? null;
      if (frame.usage) out.usage = frame.usage;
      const choice = frame.choices?.[0];
      if (!choice) continue;
      if (choice.finish_reason) out.finishReason = choice.finish_reason;
      const d = choice.delta || {};
      const thought = d.reasoning_content || d.reasoning;
      const now = performance.now() - started;
      if ((thought || d.content) && out.ttftMs === null) out.ttftMs = now;
      if (thought) out.reasoning += thought;
      if (d.content) {
        out.content += d.content;
        // Inline <think> text arrives as content too, so the answer has only
        // started once something survives stripping it.
        if (out.ttfaMs === null && stripThinking(out.content)) out.ttfaMs = now;
      }
    }
  }
  out.totalMs = performance.now() - started;
  return out;
}

/**
 * Drop inline thought blocks, keeping only the visible answer. Same tags as
 * the widget's splitThinking; an unclosed block runs to the end.
 */
export function stripThinking(content) {
  return content
    .replace(/<(think|thinking|thought)>[\s\S]*?(<\/\1>|$)/gi, "")
    .trim();
}

/** Ask one question in the context of `history`; returns the turn record. */
async function ask(opts, history, q) {
  const messages = [...history, { role: "user", content: q }];
  const { res, started } = await postChat(opts, messages);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      msg += `: ${(await res.json()).error.message}`;
    } catch {}
    return { error: msg };
  }
  const s = await readStream(res, started);
  return { ...s, answer: stripThinking(s.content) };
}

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------
/** Map any docs URL or path to the page key used in questions.mjs. */
export function pageKey(url) {
  let p = url.trim();
  try {
    const u = new URL(p, `https://${DOCS_HOST}/`);
    if (u.host !== DOCS_HOST) return null;
    p = u.pathname;
  } catch {
    return null;
  }
  p = p
    .replace(/^\/+/, "")
    .replace(/(^|\/)index\.(md|html)$/, "")
    .replace(/\.(md|html)$/, "")
    .replace(/\/+$/, "");
  return p || "index";
}

/** Doc pages the answer links to (Markdown links or bare URLs). */
export function citedPages(answer) {
  const urls = [
    ...answer.matchAll(/\]\(([^)\s]+)\)/g),
    ...answer.matchAll(new RegExp(`https?://${DOCS_HOST.replace(/\./g, "\\.")}[^\\s)\\]>"']*`, "g")),
  ].map((m) => m[1] ?? m[0]);
  return [...new Set(urls.map(pageKey).filter(Boolean))];
}

/**
 * True when the visible answer opens with the model's own planning ("The user
 * is asking...", "I need to search..."). Some models emit that as plain content
 * with no <think> tags, so neither the widget nor stripThinking can hide it.
 */
export function leaksReasoning(answer) {
  return /^(the user (is|wants|asked|has)|i (need|will|should) )/i.test(answer.trim());
}

function runChecks(turn, answer) {
  const failed = [];
  for (const re of turn.must || []) if (!re.test(answer)) failed.push(`missing ${re}`);
  for (const re of turn.mustNot || []) if (re.test(answer)) failed.push(`forbidden ${re}`);
  return { pass: failed.length === 0, failed };
}

const pageCache = new Map();
async function pageSource(page) {
  if (pageCache.has(page)) return pageCache.get(page);
  const candidates =
    page === "index" ? ["index.md"] : [`${page}.md`, `${page}/index.md`];
  let text = null;
  for (const c of candidates) {
    const f = join(DOCS_DIR, c);
    if (existsSync(f)) {
      text = await readFile(f, "utf8");
      break;
    }
  }
  pageCache.set(page, text);
  return text;
}

const JUDGE_PROMPT = `You grade answers from a documentation chatbot for the Lawrencium HPC cluster at LBNL.

You get: the conversation so far, the user's latest question, a rubric describing a correct answer, reference pages from the documentation (may be empty, and may not be exhaustive), and the chatbot's answer.

Score the answer:
- 2 = correct: satisfies the rubric, no wrong or fabricated facts, commands would work as written.
- 1 = partially correct: right direction but missing a key element from the rubric, or has a minor error.
- 0 = wrong: contradicts the docs or rubric, fabricates facts/commands/limits, or fails the stated behavior (e.g. invents specs it should refuse).

Site-wide facts from the docs home page, which may not be among the reference pages: the HPC help desk is scienceithelp@lbl.gov (creates a Freshservice ticket); office hours are Wednesdays 10:30-noon on Zoom. Do not treat these as invented.

Also report "grounded": false if the answer states any concrete fact (hostname, limit, command flag, QoS, path, email) that contradicts the reference pages or appears invented. Do not penalize facts merely because they are absent from the reference pages if they are plausible and consistent with them.

Reply with only a JSON object: {"score": 0|1|2, "grounded": true|false, "reason": "<one sentence>"}`;

async function judge(opts, key, { history, turn, pages, answer }) {
  const refs = [];
  for (const p of pages) {
    const src = await pageSource(p);
    if (src) refs.push(`--- ${p} ---\n${src}`);
  }
  const convo = history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const user = [
    `CONVERSATION SO FAR:\n${convo || "(none)"}`,
    `LATEST QUESTION:\n${turn.q}`,
    `RUBRIC:\n${turn.rubric}`,
    `REFERENCE PAGES:\n${refs.join("\n\n") || "(none)"}`,
    `CHATBOT ANSWER:\n${answer}`,
  ].join("\n\n");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${opts.cborgBase}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: opts.judgeModel,
          temperature: 0,
          // The judge reasons before answering, and that counts against this
          // cap; at a few hundred tokens it can run out before writing JSON.
          max_tokens: 4000,
          messages: [
            { role: "system", content: JUDGE_PROMPT },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const choice = (await res.json()).choices[0];
      const text = choice.message.content;
      if (!text) throw new Error(`empty reply (finish_reason ${choice.finish_reason})`);
      const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
      return { score: Number(json.score), grounded: json.grounded !== false, reason: json.reason };
    } catch (e) {
      if (attempt === 2) return { score: null, grounded: null, reason: `judge failed: ${e.message}` };
      await sleep(3000);
    }
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
function pct(xs, p) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

function summarize(turns) {
  const ok = turns.filter((t) => !t.error);
  const judged = ok.filter((t) => t.judge?.score != null);
  const withPages = ok.filter((t) => t.pages.length);
  return {
    turns: turns.length,
    errors: turns.length - ok.length,
    correct: judged.length ? judged.filter((t) => t.judge.score === 2 && t.checks.pass).length / judged.length : null,
    judgeMean: mean(judged.map((t) => t.judge.score)),
    grounded: judged.length ? judged.filter((t) => t.judge.grounded).length / judged.length : null,
    checksPass: ok.length ? ok.filter((t) => t.checks.pass).length / ok.length : null,
    citationRecall: mean(withPages.map((t) => t.pages.filter((p) => t.cited.includes(p)).length / t.pages.length)),
    retrievalRecall: mean(
      withPages.filter((t) => t.retrieved).map((t) => t.pages.filter((p) => t.retrieved.includes(p)).length / t.pages.length)
    ),
    retrievalHit: (() => {
      const r = withPages.filter((t) => t.retrieved);
      return r.length ? r.filter((t) => t.pages.some((p) => t.retrieved.includes(p))).length / r.length : null;
    })(),
    citesAny: withPages.length ? withPages.filter((t) => t.cited.some((p) => t.pages.includes(p))).length / withPages.length : null,
    truncated: ok.filter((t) => t.finishReason === "length").length,
    leaked: ok.length ? ok.filter((t) => t.leakedReasoning).length / ok.length : null,
    ttfaP50: pct(ok.map((t) => t.ttfaMs).filter((x) => x != null), 50),
    ttfaP95: pct(ok.map((t) => t.ttfaMs).filter((x) => x != null), 95),
    totalP50: pct(ok.map((t) => t.totalMs), 50),
    totalP95: pct(ok.map((t) => t.totalMs), 95),
    promptTokens: mean(ok.map((t) => t.usage?.prompt_tokens).filter((x) => x != null)),
    completionTokens: mean(ok.map((t) => t.usage?.completion_tokens).filter((x) => x != null)),
    reasoningTokens: mean(ok.map((t) => t.usage?.completion_tokens_details?.reasoning_tokens).filter((x) => x != null)),
  };
}

const fmt = {
  pct: (x) => (x == null ? "—" : `${(x * 100).toFixed(0)}%`),
  s: (ms) => (ms == null ? "—" : `${(ms / 1000).toFixed(1)}s`),
  n: (x) => (x == null ? "—" : Math.round(x).toLocaleString("en-US")),
  f: (x) => (x == null ? "—" : x.toFixed(2)),
};

const ROWS = [
  ["Correct (judge=2 and checks pass)", "correct", fmt.pct],
  ["Judge score (0–2)", "judgeMean", fmt.f],
  ["Grounded (no fabricated facts)", "grounded", fmt.pct],
  ["Regex checks pass", "checksPass", fmt.pct],
  ["Retrieved an expected page (RAG)", "retrievalHit", fmt.pct],
  ["Expected-page retrieval recall (RAG)", "retrievalRecall", fmt.pct],
  ["Cites an expected page", "citesAny", fmt.pct],
  ["Expected-page citation recall", "citationRecall", fmt.pct],
  ["Answer opens with leaked reasoning", "leaked", fmt.pct],
  ["Truncated at max_tokens", "truncated", fmt.n],
  ["Errors", "errors", fmt.n],
  ["Time to first answer token p50", "ttfaP50", fmt.s],
  ["Time to first answer token p95", "ttfaP95", fmt.s],
  ["Total time p50", "totalP50", fmt.s],
  ["Total time p95", "totalP95", fmt.s],
  ["Prompt tokens (mean)", "promptTokens", fmt.n],
  ["Completion tokens (mean)", "completionTokens", fmt.n],
  ["  of which reasoning (mean)", "reasoningTokens", fmt.n],
];

function report(result) {
  const { meta, turns } = result;
  const overall = summarize(turns);
  const lines = [
    `# Eval: ${meta.label}`,
    "",
    `- When: ${meta.startedAt}`,
    `- Commit: ${meta.commit}`,
    `- Answer model: ${meta.models.join(", ") || "unknown"}`,
    `- Judge model: ${meta.judgeModel ?? "none"}`,
    `- Runs per case: ${meta.runs}, turns graded: ${turns.length}`,
    "",
    "| Metric | Value |",
    "|---|---|",
    ...ROWS.map(([name, k, f]) => `| ${name} | ${f(overall[k])} |`),
    "",
    "## By category",
    "",
    "| Category | Turns | Correct | Judge | Grounded | Checks | Cites expected | TTFA p50 | Prompt tok |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  for (const [cat, name] of Object.entries(CATEGORIES)) {
    const s = summarize(turns.filter((t) => t.category === cat));
    if (!s.turns) continue;
    lines.push(
      `| ${name} | ${s.turns} | ${fmt.pct(s.correct)} | ${fmt.f(s.judgeMean)} | ${fmt.pct(s.grounded)} | ${fmt.pct(s.checksPass)} | ${fmt.pct(s.citesAny)} | ${fmt.s(s.ttfaP50)} | ${fmt.n(s.promptTokens)} |`
    );
  }
  lines.push("", "## By case", "", "| Case | Turn | Correct runs | Judge scores | Failed checks (any run) |", "|---|---|---|---|---|");
  const byKey = new Map();
  for (const t of turns) {
    const k = `${t.caseId}#${t.turn}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(t);
  }
  for (const [k, ts] of byKey) {
    const [id, turn] = k.split("#");
    const correct = ts.filter((t) => !t.error && t.judge?.score === 2 && t.checks.pass).length;
    const scores = ts.map((t) => (t.error ? "E" : t.judge?.score ?? "-")).join(" ");
    const failed = [...new Set(ts.flatMap((t) => (t.error ? [t.error] : t.checks.failed)))].join("; ");
    lines.push(`| ${id} | ${Number(turn) + 1} | ${correct}/${ts.length} | ${scores} | ${failed.replace(/\|/g, "\\|")} |`);
  }
  return lines.join("\n") + "\n";
}

function compare(a, b) {
  const sa = summarize(a.turns);
  const sb = summarize(b.turns);
  const lines = [
    `| Metric | ${a.meta.label} | ${b.meta.label} |`,
    "|---|---|---|",
    ...ROWS.map(([name, k, f]) => `| ${name} | ${f(sa[k])} | ${f(sb[k])} |`),
    "",
    "| Category | Correct (" + a.meta.label + ") | Correct (" + b.meta.label + ") |",
    "|---|---|---|",
  ];
  for (const [cat, name] of Object.entries(CATEGORIES)) {
    const ca = summarize(a.turns.filter((t) => t.category === cat));
    const cb = summarize(b.turns.filter((t) => t.category === cat));
    lines.push(`| ${name} | ${fmt.pct(ca.correct)} | ${fmt.pct(cb.correct)} |`);
  }
  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.compare) {
    const [a, b] = await Promise.all(opts.compare.map(async (f) => JSON.parse(await readFile(f, "utf8"))));
    process.stdout.write(compare(a, b));
    return;
  }

  const key = opts.judge ? await cborgKey() : null;
  if (opts.judge && !key) throw new Error("No CBORG_API_KEY in env or worker/.dev.vars; pass --no-judge to skip grading.");

  const cases = opts.only ? CASES.filter((c) => opts.only.includes(c.id)) : CASES;
  let commit = "unknown";
  try {
    commit = execSync("git rev-parse --short HEAD", { cwd: HERE }).toString().trim();
    if (execSync("git status --porcelain", { cwd: HERE }).toString().trim()) commit += "-dirty";
  } catch {}

  const meta = {
    label: opts.label,
    startedAt: new Date().toISOString(),
    commit,
    endpoint: opts.endpoint,
    runs: opts.runs,
    judgeModel: opts.judge ? opts.judgeModel : null,
    models: [],
  };
  const turns = [];

  for (let run = 0; run < opts.runs; run++) {
    for (const c of cases) {
      const history = [];
      for (const [i, turn] of c.turns.entries()) {
        process.stdout.write(`[run ${run + 1}/${opts.runs}] ${c.id} turn ${i + 1} ... `);
        let r;
        try {
          r = await ask(opts, history, turn.q);
        } catch (e) {
          r = { error: e.message };
        }
        const rec = {
          caseId: c.id,
          category: c.category,
          turn: i,
          run,
          q: turn.q,
          pages: c.pages,
        };
        if (r.error) {
          console.log(`ERROR ${r.error}`);
          turns.push({ ...rec, error: r.error });
          break; // later turns depend on this one
        }
        if (r.model && !meta.models.includes(r.model)) meta.models.push(r.model);
        const checks = runChecks(turn, r.answer);
        const verdict = key ? await judge(opts, key, { history, turn, pages: c.pages, answer: r.answer }) : null;
        Object.assign(rec, {
          answer: r.answer,
          reasoningChars: r.reasoning.length + (r.content.length - r.answer.length),
          ttftMs: r.ttftMs,
          ttfaMs: r.ttfaMs,
          totalMs: r.totalMs,
          usage: r.usage,
          finishReason: r.finishReason,
          cited: citedPages(r.answer),
          retrieved: r.sources ? [...new Set(r.sources.map((s) => pageKey(s.url)).filter(Boolean))] : null,
          leakedReasoning: leaksReasoning(r.answer),
          checks,
          judge: verdict,
        });
        turns.push(rec);
        console.log(
          `${checks.pass ? "checks ok" : "checks FAIL"}, judge ${verdict?.score ?? "-"}, ` +
            `${fmt.s(r.ttfaMs)} to answer, ${fmt.n(r.usage?.prompt_tokens)} prompt tok` +
            (r.sources ? `, retrieved ${rec.retrieved.length} pages` : "")
        );
        // The widget sends back only the visible answer, never the thinking.
        history.push({ role: "user", content: turn.q }, { role: "assistant", content: r.answer || "(empty)" });
      }
    }
  }

  const result = { meta, turns };
  const outDir = join(HERE, "results");
  await mkdir(outDir, { recursive: true });
  const stem = `${meta.startedAt.slice(0, 10)}-${opts.label}`;
  await writeFile(join(outDir, `${stem}.json`), JSON.stringify(result, null, 2));
  const md = report(result);
  await writeFile(join(outDir, `${stem}.md`), md);
  process.stdout.write("\n" + md);
  console.log(`Wrote results/${stem}.json and results/${stem}.md`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

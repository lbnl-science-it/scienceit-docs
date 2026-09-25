# Docs chatbot

A floating chat widget for the ScienceIT docs, backed by a Cloudflare Worker that proxies to [CBorg](https://cborg.lbl.gov) (LBNL's OpenAI-compatible gateway). The full text of `llms-full.txt` is placed in the system prompt on every request (no RAG, no embeddings).

```
widget/chatbot.js  --POST /chat-->  worker (holds CBORG_API_KEY)  -->  CBorg
```

The browser never sees the API key; it only lives in a Worker secret.

## 1. Local preview (docs site)

The widget is previewed inside the real docs site, built with MkDocs, not as a standalone page. Requires Node 18+ and Python 3.10+ (see the repo's own README/`requirements.txt` for the site's Python setup).

Terminal 1 — the Worker:

```bash
cd chatbot/worker
npm install
cp .dev.vars.example .dev.vars      # then edit .dev.vars and paste your CBorg key
npx wrangler dev
```

The Worker now listens on <http://localhost:8787> (the default; don't pass it as an argument). Leave this terminal running.

Terminal 2 — the site, from the repo root:

```bash
source .venv/bin/activate           # the site's Python virtualenv
CHATBOT_ENDPOINT=http://localhost:8787/chat mkdocs serve
```

Open <http://127.0.0.1:8000>. The widget appears on every page (it's wired in via `docs/overrides/main.html` and `mkdocs.yml`'s `extra.chatbot_endpoint`, which is empty — and the widget hidden — unless `CHATBOT_ENDPOINT` is set). `docs/assets/chatbot.js` is a symlink to `widget/chatbot.js`, so there's one copy of the widget code.

Before it works, confirm the model ID in `worker/wrangler.toml` against the CBorg docs, and make sure your IP is authorized at the CBorg key manager (CBorg rejects requests from unrecognized IPs, including most VPNs off LBLnet).

## 2. Deploy

```bash
cd worker
npx wrangler login
npx wrangler secret put CBORG_API_KEY   # paste the key when prompted
npx wrangler deploy
```

Wrangler prints the Worker URL (e.g. `https://scienceit-docs-chat.<account>.workers.dev`). Then:

1. Update `ALLOWED_ORIGINS` in `wrangler.toml` to your real site origin(s) and remove the localhost entries, then redeploy.
2. Point the widget at `https://<your-worker-url>/chat` (the `data-endpoint` attribute below).

## 3. Embedding on the real site

This is already wired up (see §1): `docs/overrides/main.html` adds the `<script>` tag on every page, reading its endpoint from `mkdocs.yml`'s `extra.chatbot_endpoint` (itself read from the `CHATBOT_ENDPOINT` env var, defaulting to empty/off). For production, set `CHATBOT_ENDPOINT` to the deployed Worker URL in your build environment, e.g.:

```bash
CHATBOT_ENDPOINT=https://scienceit-docs-chat.<account>.workers.dev/chat mkdocs build
```

The script tag itself looks like:

```html
<script src="assets/chatbot.js"
        data-endpoint="https://scienceit-docs-chat.<account>.workers.dev/chat"></script>
```

Optional attributes: `data-title`, `data-subtitle`, `data-greeting`, `data-color` (accent color, e.g. `#005f9e`) — set them as extra attributes on the `<script>` tag in `docs/overrides/main.html` if you want to override the defaults.

To embed on a different site instead, host `chatbot.js` there and add the same tag to its pages.

The widget keeps history in memory only, so a page reload starts a new conversation.

## 4. Configuration reference

Set non-secret values in `worker/wrangler.toml` under `[vars]`, or in `.dev.vars` for local runs.

| Variable | Default | Description |
|---|---|---|
| `CBORG_API_KEY` | (required) | **Secret.** CBorg API key. Set with `wrangler secret put` (deployed) or `.dev.vars` (local). Never commit it. |
| `CBORG_BASE_URL` | `https://api.cborg.lbl.gov` | OpenAI-compatible base URL. The Worker calls `<base>/chat/completions`. |
| `CBORG_MODEL` | `anthropic/claude-sonnet` | Model ID. **Confirm current IDs in the CBorg docs.** |
| `LLMS_FULL_URL` | `https://scienceit-docs.lbl.gov/llms-full.txt` | Where the docs text is fetched from. Cached for 1 hour (Cache API plus an in-memory fallback, since the Cache API is a no-op on `*.workers.dev`). |
| `ALLOWED_ORIGINS` | site + localhost:8000 | Comma-separated origins allowed to call `/chat`. Exact match, no trailing slash. |
| `MODEL_CONTEXT_TOKENS` | `128000` | Model context window; only used to log a warning when the docs (estimated at 4 chars/token) are too large. |
| `MAX_MESSAGES` | `20` | Max messages per request. |
| `MAX_MESSAGE_CHARS` | `4000` | Max characters per message. |
| `MAX_PAYLOAD_BYTES` | `60000` | Max request body size. |
| `MAX_OUTPUT_TOKENS` | `1000` | Max tokens in each reply. |
| `RATE_LIMITER` (binding) | 10 req / 60 s per IP | Configured by the `[[ratelimits]]` block in `wrangler.toml`. `period` must be 10 or 60. If the binding is missing, the Worker logs a warning and skips limiting. |

## Notes

- **Docs size:** if `llms-full.txt` exceeds the model's context window, `wrangler tail` shows a warning and requests will fail. Pick a larger-context model or trim the docs.
- **Cost:** the whole docs text is sent on every request. The per-IP rate limit and `MAX_OUTPUT_TOKENS` help bound spend.
- **CORS is not authentication:** it only stops other websites' browsers. Scripts can spoof `Origin`, so the rate limit is your real guard. Add auth or Turnstile if abuse becomes a problem.
- **Debugging:** run `npx wrangler tail` to see Worker logs. Upstream error details are logged there but never returned to the client.

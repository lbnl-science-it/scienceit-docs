# Docs chatbot

A floating chat widget for the ScienceIT docs, backed by a Cloudflare Worker that proxies to [CBorg](https://cborg.lbl.gov) (LBNL's OpenAI-compatible gateway). The full text of `llms-full.txt` is placed in the system prompt on every request (no RAG, no embeddings).

```
widget/chatbot.js  --POST /chat-->  worker (holds CBORG_API_KEY)  -->  CBorg
```

The browser never sees the API key; it only lives in a Worker secret.

## 1. Local demo

Requires Node 18+.

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars      # then edit .dev.vars and paste your CBorg key
npx wrangler dev                    # Worker on http://localhost:8787
```

In a second terminal:

```bash
cd widget
python3 -m http.server 8000
```

Open <http://localhost:8000/demo.html> (serve it over http; opening the file directly sends `Origin: null`, which the CORS allowlist rejects).

Before it works, confirm the model ID in `worker/wrangler.toml` against the CBorg docs.

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

Host `chatbot.js` somewhere on your site (or a CDN) and add one tag to any page:

```html
<script src="/assets/chatbot.js"
        data-endpoint="https://scienceit-docs-chat.<account>.workers.dev/chat"></script>
```

Optional attributes: `data-title`, `data-greeting`, `data-color` (accent color, e.g. `#005f9e`).

For MkDocs (Material), put the tag in a theme override, e.g. `docs/overrides/main.html` inside `{% block scripts %}{{ super() }} ... {% endblock %}`, and copy `chatbot.js` into `docs/assets/`.

The widget keeps history in memory only, so a page reload starts a new conversation.

## 4. Configuration reference

Set non-secret values in `worker/wrangler.toml` under `[vars]`, or in `.dev.vars` for local runs.

| Variable | Default | Description |
|---|---|---|
| `CBORG_API_KEY` | (required) | **Secret.** CBorg API key. Set with `wrangler secret put` (deployed) or `.dev.vars` (local). Never commit it. |
| `CBORG_BASE_URL` | `https://api.cborg.lbl.gov` | OpenAI-compatible base URL. The Worker calls `<base>/chat/completions`. |
| `CBORG_MODEL` | `lbl/cborg-chat:latest` | Model ID. **Confirm current IDs in the CBorg docs.** |
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

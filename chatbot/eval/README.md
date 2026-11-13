# Chatbot eval

An end-to-end eval for the docs chatbot. It talks to the Worker the same way the widget does, so it measures whatever the Worker does internally (full-context today, RAG later) using the same questions and the same scoring.

- [`questions.mjs`](questions.mjs): 38 cases in 7 categories (40 graded turns, since the follow-up chain has three turns). Each case lists the doc pages that hold the answer, a rubric for the judge, and optional `must` / `mustNot` regexes.
- [`run.mjs`](run.mjs): the runner, the report and the comparison mode.
- `results/`: one `.json` (every turn, every answer) and one `.md` summary per run.

## Running it

Start the Worker locally (it needs `worker/.dev.vars`, see [`../README.md`](../README.md)):

```bash
cd chatbot/worker && npx wrangler dev
```

Then, in another terminal:

```bash
cd chatbot/eval
node run.mjs --label baseline-full-context          # 3 runs of every case, judged
node run.mjs --runs 1 --only f04-walltime-debug-normal,c01-srun-chain --label smoke
node run.mjs --no-judge --label quick               # skip the LLM judge
node run.mjs --compare results/A.json results/B.json
```

| Flag | Default | |
|---|---|---|
| `--endpoint` | `http://localhost:8787/chat` | Worker to test |
| `--origin` | `http://localhost:8000` | Must be in the Worker's `ALLOWED_ORIGINS` |
| `--runs` | `3` | The answer model isn't deterministic, so each case runs this many times |
| `--label` | `run` | Names the output files |
| `--only` | all | Comma-separated case ids |
| `--judge-model` | `claude-sonnet-5-5` | CBORG model that grades answers |
| `--no-judge` | | Regex checks only |

The judge calls CBORG directly, with `CBORG_API_KEY` from the environment or from `worker/.dev.vars`. Locally, Turnstile uses Cloudflare's always-passes test secret, so the runner sends a dummy token and then reuses the session token, as the widget does. It backs off on `429`/`503`.

A full run makes about 120 Worker calls plus 120 judge calls and takes roughly an hour.

## What is measured

| Metric | Meaning |
|---|---|
| Correct | Judge score 2 **and** all regex checks pass |
| Judge score | 0 wrong / 1 partial / 2 correct, against the rubric and the expected pages' source |
| Grounded | Judge found no fabricated or contradicted facts |
| Cites an expected page | The answer links to at least one of the case's `pages`. Under RAG, compare this with the retrieved set to separate retrieval misses from generation misses |
| Leaked reasoning | The visible answer opens with the model's planning text ("The user is asking…") |
| Truncated | The reply hit `MAX_OUTPUT_TOKENS` (`finish_reason: length`) |
| TTFA | Time to first visible answer token, measured at the runner, after any `<think>` block |
| Prompt / completion tokens | From the stream's usage frame (the Worker sets `stream_options.include_usage`) |

## Adding cases

Use real user questions where you can. Keep `must` regexes loose about formatting and strict about the facts and flags that matter, and let the judge handle the rest. If a question's answer isn't in the docs, leave `pages` empty and write a rubric that rewards declining.

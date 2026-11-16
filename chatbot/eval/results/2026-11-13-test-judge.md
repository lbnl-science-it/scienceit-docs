# Eval: test-judge

- When: 2026-11-13T19:09:21.324Z
- Commit: 6ed678e-dirty
- Answer model: lbl/cborg-coder-fast
- Judge model: claude-sonnet-5-5
- Runs per case: 1, turns graded: 7

| Metric | Value |
|---|---|
| Correct (judge=2 and checks pass) | 57% |
| Judge score (0–2) | 1.57 |
| Grounded (no fabricated facts) | 86% |
| Regex checks pass | 100% |
| Retrieved an expected page (RAG) | 100% |
| Expected-page retrieval recall (RAG) | 79% |
| Cites an expected page | 86% |
| Expected-page citation recall | 60% |
| Answer opens with leaked reasoning | 0% |
| Truncated at max_tokens | 0 |
| Errors | 0 |
| Time to first answer token p50 | 3.3s |
| Time to first answer token p95 | 16.2s |
| Total time p50 | 5.9s |
| Total time p95 | 16.4s |
| Prompt tokens (mean) | 3,287 |
| Completion tokens (mean) | 941 |
|   of which reasoning (mean) | 495 |

## By category

| Category | Turns | Correct | Judge | Grounded | Checks | Cites expected | TTFA p50 | Prompt tok |
|---|---|---|---|---|---|---|---|---|
| Procedural / command generation | 2 | 100% | 2.00 | 100% | 100% | 100% | 8.0s | 3,673 |
| Multi-page synthesis | 4 | 50% | 1.50 | 75% | 100% | 75% | 5.4s | 3,160 |
| Ambiguous questions | 1 | 0% | 1.00 | 100% | 100% | 100% | 3.3s | 3,024 |

## By case

| Case | Turn | Correct runs | Judge scores | Failed checks (any run) |
|---|---|---|---|---|
| p04-gpu-pytorch-script | 1 | 1/1 | 2 |  |
| p07-llm-serving | 1 | 1/1 | 2 |  |
| s01-new-student-to-gpu | 1 | 0/1 | 1 |  |
| s02-io-bound | 1 | 1/1 | 2 |  |
| s03-many-small-tasks | 1 | 1/1 | 2 |  |
| s04-lrc-vs-cloud-vs-nrp | 1 | 0/1 | 1 |  |
| a01-job-wont-start | 1 | 0/1 | 1 |  |

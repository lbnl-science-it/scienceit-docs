# Eval: quick-test

- When: 2026-11-13T19:03:44.826Z
- Commit: 6ed678e-dirty
- Answer model: lbl/cborg-coder-fast
- Judge model: none
- Runs per case: 1, turns graded: 40

| Metric | Value |
|---|---|
| Correct (judge=2 and checks pass) | — |
| Judge score (0–2) | — |
| Grounded (no fabricated facts) | — |
| Regex checks pass | 95% |
| Retrieved an expected page (RAG) | 95% |
| Expected-page retrieval recall (RAG) | 83% |
| Cites an expected page | 70% |
| Expected-page citation recall | 61% |
| Answer opens with leaked reasoning | 0% |
| Truncated at max_tokens | 0 |
| Errors | 0 |
| Time to first answer token p50 | 2.6s |
| Time to first answer token p95 | 10.1s |
| Total time p50 | 3.8s |
| Total time p95 | 10.7s |
| Prompt tokens (mean) | 3,079 |
| Completion tokens (mean) | 707 |
|   of which reasoning (mean) | 422 |

## By category

| Category | Turns | Correct | Judge | Grounded | Checks | Cites expected | TTFA p50 | Prompt tok |
|---|---|---|---|---|---|---|---|---|
| Factual lookups | 12 | — | — | — | 92% | 75% | 2.4s | 2,829 |
| Procedural / command generation | 10 | — | — | — | 90% | 80% | 3.5s | 3,026 |
| Multi-page synthesis | 4 | — | — | — | 100% | 25% | 4.1s | 3,160 |
| Ambiguous questions | 3 | — | — | — | 100% | 67% | 2.6s | 3,335 |
| Hallucination and scope traps | 5 | — | — | — | 100% | 100% | 2.4s | 3,360 |
| Messy real-user phrasing | 3 | — | — | — | 100% | 100% | 2.6s | 3,129 |
| Multi-turn follow-up chain | 3 | — | — | — | 100% | 33% | 3.6s | 3,374 |

## By case

| Case | Turn | Correct runs | Judge scores | Failed checks (any run) |
|---|---|---|---|---|
| f01-login-host | 1 | 0/1 | - |  |
| f02-user-account | 1 | 0/1 | - |  |
| f03-login-node | 1 | 0/1 | - | missing /\b(srun\|salloc\|sbatch)\b/ |
| f04-walltime-debug-normal | 1 | 0/1 | - |  |
| f05-lowprio-gracetime | 1 | 0/1 | - |  |
| f06-associations | 1 | 0/1 | - |  |
| f07-transfer-node | 1 | 0/1 | - |  |
| f08-local-scratch | 1 | 0/1 | - |  |
| f09-get-help | 1 | 0/1 | - |  |
| f10-windows-transfer | 1 | 0/1 | - |  |
| f11-account-fee | 1 | 0/1 | - |  |
| f12-aws-account | 1 | 0/1 | - |  |
| p01-interactive-lr4 | 1 | 0/1 | - |  |
| p02-scp-to-scratch | 1 | 0/1 | - | missing /(scp\s+-r\|rsync)/; missing /lrc-xfer\.lbl\.gov/ |
| p03-my-jobs | 1 | 0/1 | - |  |
| p04-gpu-pytorch-script | 1 | 0/1 | - |  |
| p05-jupyter | 1 | 0/1 | - |  |
| p06-conda-kernel | 1 | 0/1 | - |  |
| p07-llm-serving | 1 | 0/1 | - |  |
| p08-apptainer | 1 | 0/1 | - |  |
| p09-globus-connectors | 1 | 0/1 | - |  |
| p10-modules-gcc | 1 | 0/1 | - |  |
| s01-new-student-to-gpu | 1 | 0/1 | - |  |
| s02-io-bound | 1 | 0/1 | - |  |
| s03-many-small-tasks | 1 | 0/1 | - |  |
| s04-lrc-vs-cloud-vs-nrp | 1 | 0/1 | - |  |
| a01-job-wont-start | 1 | 0/1 | - |  |
| a02-get-gpus | 1 | 0/1 | - |  |
| a03-time-limit | 1 | 0/1 | - |  |
| t01-es-lowprio-walltime | 1 | 0/1 | - |  |
| t02-nonexistent-lr12 | 1 | 0/1 | - |  |
| t03-reset-pin | 1 | 0/1 | - |  |
| t04-perlmutter | 1 | 0/1 | - |  |
| t05-prompt-injection | 1 | 0/1 | - |  |
| m01-check-jobs | 1 | 0/1 | - |  |
| m02-invalid-combination | 1 | 0/1 | - |  |
| m03-lrc-vs-es | 1 | 0/1 | - |  |
| c01-srun-chain | 1 | 0/1 | - |  |
| c01-srun-chain | 2 | 0/1 | - |  |
| c01-srun-chain | 3 | 0/1 | - |  |

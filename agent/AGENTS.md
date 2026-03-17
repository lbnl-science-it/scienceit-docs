# agent/ -- AGENTS.md

## Overview

This directory contains the configuration for **lrc-agent**, a Docker Agent built on the [Docker Agent SDK](https://docker.github.io/docker-agent/configuration/overview/). The agent serves as a Science IT assistant for Lawrencium HPC cluster users at Lawrence Berkeley National Laboratory.

## Build Process for agent.yaml

`agent.yaml` is **generated** -- do not edit it directly. Edit [`agent-template.yaml`](agent-template.yaml) instead, then run `make` to produce the final config.

### How it works

1. [`agent-template.yaml`](agent-template.yaml) contains the full agent configuration with `${SCIENCEIT_DOCS_BASEDIR}` placeholders for absolute paths to the repository root.
2. The [`Makefile`](Makefile) runs `envsubst` to replace those placeholders with the resolved base directory, producing `agent.yaml`.
3. `agent.yaml` is gitignored -- each deployment generates its own copy with paths appropriate to the local filesystem.

### Build commands

```bash
# Generate agent.yaml (default target)
make -C agent

# Equivalent explicit target
make -C agent agent.yaml
```

If `SCIENCEIT_DOCS_BASEDIR` is not set in the environment, the Makefile defaults it to the parent directory of `agent/` (i.e., the repository root).

To override the base directory explicitly:

```bash
SCIENCEIT_DOCS_BASEDIR=/opt/scienceit-docs make -C agent
```

### Other Makefile targets

| Target       | Description |
|--------------|-------------|
| `agent.yaml` | Build `agent.yaml` from the template (default) |
| `update`     | Fetch upstream changes, optionally pull and reset RAG databases |
| `clean`      | Remove the generated `agent.yaml` |
| `help`       | Print available targets |

### Template variable

| Variable | Purpose | Default |
|----------|---------|---------|
| `SCIENCEIT_DOCS_BASEDIR` | Absolute path to the repository root; used in RAG doc globs and database paths | Parent of `agent/` |

### RAG database files

The agent uses two retrieval databases that are built automatically on first run and stored alongside the config:

- `scienceit-docs-chunked-embeddings.db` -- vector embeddings (nomic-embed-text, 768 dimensions, cosine similarity)
- `scienceit-docs-bm25.db` -- BM25 keyword index

The `update` target backs up these files before pulling new docs so they are rebuilt on the next agent run.

## Editing the agent configuration

1. Modify [`agent-template.yaml`](agent-template.yaml).
2. Run `make -C agent` to regenerate `agent.yaml`.
3. Restart the agent to pick up changes.

Do not add new substitution variables without updating the `envsubst` call in the [`Makefile`](Makefile) -- it uses an explicit variable list (`'$$SCIENCEIT_DOCS_BASEDIR'`) rather than expanding all environment variables.

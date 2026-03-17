# lrc-agent

An CLI assistant for Lawrencium, built on the [scienceit-docs](https://scienceit-docs.lbl.gov) knowledge base. It runs as a [Docker Agent](https://docker.github.io/docker-agent/).

## Prerequisites

- [Docker Agent](https://docker.github.io/docker-agent/getting-started/installation/) installed and running
- A CBORG API "BK" Key (`CBORG_API_BK_KEY`) - access to on-prem models via Berkelium (no cost)
- `make` and `envsubst` (standard on macOS/Linux)

## Install Docker Agent

Follow the official installation guide:
https://docker.github.io/docker-agent/getting-started/installation/

## Setup

1. **Clone the repository** (if not already done):

   ```bash
   git clone https://github.com/lbnl-science-it/scienceit-docs.git
   cd scienceit-docs
   ```

2. **Configure your API key** -- copy the example env file and fill in your key:

   ```bash
   cp agent/.env.example agent/.env
   # Edit agent/.env and set CBORG_API_BK_KEY=<your-key>
   ```

3. **Generate `agent.yaml`** from the template:

   ```bash
   make all
   ```

   This runs `envsubst` to substitute the repository root path into the config.
   To use a custom base directory:

   ```bash
   SCIENCEIT_DOCS_BASEDIR=/opt/scienceit-docs make -C agent
   ```

4. **Start the agent**:

   ```bash
   lrc-agent
   ```

   `lrc-agent` can be added to the `$PATH` and called from any location.

   Additional options can also be passed to the agent, e.g. to set a session ID (enables resume of conversation)

   ```bash
   lrc-agent --session my-session-id
   ```

## Updating

To check for upstream doc changes and refresh the RAG databases:

```bash
make update
```

This fetches the latest commits, prompts before pulling, and backs up the existing vector/BM25 databases so they are rebuilt on the next agent run.

## Makefile targets

| Target       | Description                                              |
|--------------|----------------------------------------------------------|
| `agent.yaml` | Generate `agent.yaml` from the template (default)        |
| `update`     | Fetch upstream changes and optionally reset RAG databases |
| `clean`      | Remove the generated `agent.yaml`                        |
| `help`       | Print available targets                                  |

## Configuration

The agent configuration lives in [`agent-template.yaml`](agent-template.yaml). Do not edit the generated `agent.yaml` directly -- it is gitignored and overwritten by `make`.

The template uses one substitution variable:

| Variable               | Purpose                                      | Default              |
|------------------------|----------------------------------------------|----------------------|
| `SCIENCEIT_DOCS_BASEDIR` | Absolute path to the repository root       | Parent of `agent/`   |

## RAG databases

On first run the agent builds two retrieval databases in the `agent/` directory:

- `scienceit-docs-chunked-embeddings.db` -- vector embeddings (nomic-embed-text, 768-dim, cosine similarity)
- `scienceit-docs-bm25.db` -- BM25 keyword index

These files are gitignored. The `update` target backs them up before pulling new docs.


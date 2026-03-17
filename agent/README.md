# lrc-agent

An AI assistant for Lawrence Berkeley National Laboratory's Science IT services, built on the [scienceit-docs](https://scienceit-docs.lbl.gov) knowledge base. It runs as a [Docker Agent](https://docker.github.io/docker-agent/) and answers questions about the Lawrencium HPC cluster, Slurm, software environments, data transfer, and account management.

## Prerequisites

- [Docker Agent](https://docker.github.io/docker-agent/getting-started/installation/) installed and running
- A CBORG API key (`CBORG_API_BK_KEY`)
- `make` and `envsubst` (standard on macOS/Linux)

## Install Docker Agent

Follow the official installation guide:
https://docker.github.io/docker-agent/getting-started/installation/

Quick install (Linux/macOS):

```bash
curl -fsSL https://docker.github.io/docker-agent/install.sh | sh
```

Verify the installation:

```bash
docker-agent --version
```

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
   make -C agent
   ```

   This runs `envsubst` to substitute the repository root path into the config.
   To use a custom base directory:

   ```bash
   SCIENCEIT_DOCS_BASEDIR=/opt/scienceit-docs make -C agent
   ```

4. **Start the agent**:

   ```bash
   docker-agent run --env-file agent/.env agent/agent.yaml
   ```

## Updating

To check for upstream doc changes and refresh the RAG databases:

```bash
make -C agent update
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

## Support

For issues with the Lawrencium cluster or Science IT services, contact **scienceithelp@lbl.gov**.

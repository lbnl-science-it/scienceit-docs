# Skills

Agent Skills that let Claude, `claude-science`, and other LLM agents answer
questions directly from the **Markdown source** of this documentation, instead of
fetching and parsing the rendered HTML from `scienceit-docs.lbl.gov`.

Each subdirectory is one skill: a folder with a `SKILL.md` file whose YAML front
matter declares a `name` and a `description` (what it covers and when to use it).
The body explains how to navigate the docs and includes a **doc map** — a routing
table of topics to the `.md` files that answer them.

## Available skills

| Skill | Covers |
|-------|--------|
| [`lawrencium-hpc/`](lawrencium-hpc/SKILL.md) | Lawrencium (LRC) & Einsteinium HPC: accounts, Slurm, software modules, Open OnDemand, data transfer — sourced from [`docs/hpc/`](../docs/hpc/). |

## Using the skills

### Claude Code / Claude Agent SDK

Claude Code discovers skills placed in a `.claude/skills/` directory. Point it at
this folder — from the repository root:

```bash
mkdir -p .claude/skills
ln -s ../../skills/lawrencium-hpc .claude/skills/lawrencium-hpc
```

(Copy instead of symlink if your setup does not follow symlinks.) Claude then loads
a skill on demand when a question matches its `description`.

### claude-science and other LLM agents

Any agent that can read local files can use a skill without special support:

1. Read the skill's `SKILL.md`.
2. Use its **doc map** to pick the relevant `docs/hpc/*.md` file(s).
3. Read those Markdown files and answer from them, citing the public URL as
   described in the skill.

The whole point is that agents read the `.md` files directly — no HTML scraping.

## Maintaining a skill

The doc map in each `SKILL.md` mirrors the site navigation in
[`mkdocs.yml`](../mkdocs.yml). When you add, remove, or rename a page under
`docs/hpc/`, update the corresponding entry in
[`lawrencium-hpc/SKILL.md`](lawrencium-hpc/SKILL.md) so the map stays in sync.

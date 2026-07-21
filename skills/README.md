# Skills

Agent Skills that let Claude, `claude-science`, and other LLM agents answer
questions directly from the **Markdown source** of this documentation, instead of
scraping the rendered HTML from `scienceit-docs.lbl.gov`.

The Markdown is fetched from the
[`lbnl-science-it/scienceit-docs`](https://github.com/lbnl-science-it/scienceit-docs)
GitHub repository (raw files on the `main` branch), so a skill works without a local
checkout of the docs — only the small `SKILL.md` needs to be installed.

Each subdirectory is one skill: a folder with a `SKILL.md` file whose YAML front
matter declares a `name` and a `description` (what it covers and when to use it).
The body explains how to navigate the docs and includes a **doc map** — a routing
table of topics to the `.md` files that answer them.

## Available skills

| Skill | Covers |
|-------|--------|
| [`lawrencium-hpc/`](lawrencium-hpc/SKILL.md) | Lawrencium (LRC) & Einsteinium HPC: accounts, Slurm, software modules, Open OnDemand, data transfer — sourced from [`docs/hpc/`](../docs/hpc/). |

## Using the skills

### Claude Code — install as a plugin (recommended)

This repository is also a Claude Code **plugin marketplace**, so users can install
the skill without cloning anything. In Claude Code:

```
/plugin marketplace add lbnl-science-it/scienceit-docs
/plugin install lawrencium-hpc@scienceit-docs
```

Then reload plugins (or restart the session) and the skill loads on demand whenever a
question matches its `description`:

```
/reload-plugins
```

Installs default to **user** scope (available in every project). To share it with a
team via the repo, install with `--scope project`, which records it in
`.claude/settings.json`.

The marketplace and plugin are defined by two manifests at the repository root —
[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) (the catalog)
and [`.claude-plugin/plugin.json`](../.claude-plugin/plugin.json) (the plugin, whose
`skills/` directory is auto-discovered).

### Claude Code — manual install (without the marketplace)

Alternatively, symlink the skill into a skills directory yourself. Claude Code
discovers skills in `~/.claude/skills/`, which makes them available in every
project — from a checkout of this repository:

```bash
mkdir -p ~/.claude/skills
ln -s "$(pwd)/skills/lawrencium-hpc" ~/.claude/skills/lawrencium-hpc
```

(Copy instead of symlink if your setup does not follow symlinks.) To scope a skill to
a single project instead, install it into that project's `.claude/skills/` directory
rather than `~/.claude/skills/`.

### Claude Code — allow fetching the docs without a prompt

However you install the skill, the pages are fetched with the `WebFetch` tool, so
Claude Code asks for permission the first time it hits each domain. To pre-approve
the raw GitHub host,
add a `WebFetch` rule to your settings. Use `~/.claude/settings.json` to apply it to
all projects, or the repo's `.claude/settings.json` to scope it to this project:

```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:raw.githubusercontent.com)"
    ]
  }
}
```

If the key already exists, add the string to the existing `permissions.allow` array
rather than duplicating the block. With this rule in place, fetching any
`raw.githubusercontent.com/lbnl-science-it/scienceit-docs/...` page runs without a
prompt.


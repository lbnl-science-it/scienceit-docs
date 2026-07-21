# Lawrencium Skill for Claude

Science IT publishes a **Claude Code plugin** that teaches [Claude Code](https://docs.claude.com/en/docs/claude-code/overview){:target="_blank"} {{ ext }} how to answer your Lawrencium and Einsteinium questions directly from the official Science IT documentation.

Once installed, whenever you ask a question about accounts, logging in, Slurm, software modules, Open OnDemand, or data transfer, Claude reads the current Markdown source of this documentation site and grounds its answer in it — instead of scraping the rendered website. 

!!! note "What this is"
    A **skill** packaged as a Claude Code plugin. It ships only a small set of instructions and a map of the documentation — no copy of the docs is bundled. The pages are fetched live from the [`lbnl-science-it/scienceit-docs`](https://github.com/lbnl-science-it/scienceit-docs){:target="_blank"} {{ ext }} GitHub repository as needed.

## Prerequisites

- **Claude Code** installed and working. See the [Claude Code setup guide](https://docs.claude.com/en/docs/claude-code/setup){:target="_blank"} {{ ext }} if you have not installed it yet.
- Internet access from wherever you run Claude Code, so it can fetch the documentation pages.

## Install the plugin

This repository doubles as a Claude Code **plugin marketplace**, so you do not need to clone anything. From inside a Claude Code session, add the marketplace and install the plugin:

```
/plugin marketplace add lbnl-science-it/scienceit-docs
/plugin install lawrencium-hpc@scienceit-docs
```

Then reload plugins (or restart the session):

```
/reload-plugins
```

That's it. The skill loads automatically whenever your question matches its topic — you do not need to invoke it by name.

## Using it

Just ask Claude Code your question in plain language. For example:

- *"Write me a Slurm script to run a 4-GPU PyTorch job on Einsteinium."*
- *"How do I request a Lawrencium user account?"*
- *"Which module do I load for Open MPI under GCC?"*
- *"How do I move a large dataset onto the cluster?"*

Claude recognizes that the question is about Lawrencium, fetches the relevant documentation page(s), and answers with a citation to the corresponding page on [scienceit-docs.lbl.gov](https://scienceit-docs.lbl.gov).

## Allow fetching the docs without a prompt

The plugin fetches pages with Claude Code's `WebFetch` tool, so the first time it accesses a domain, Claude Code asks for your permission. To pre-approve the GitHub host that serves the raw Markdown, add a `WebFetch` rule to your settings. Use `~/.claude/settings.json` to apply it everywhere, or a project's `.claude/settings.json` to scope it to that project:

```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:raw.githubusercontent.com)"
    ]
  }
}
```

If a `permissions.allow` array already exists, add the string to it rather than duplicating the block. With this rule in place, fetching the documentation runs without prompting.

## Other ways to ask

Prefer not to use Claude Code? See [Asking LLMs](../help/llms.md) for the Lawrencium AI assistant (`lrc-agent`), the CBorg Science IT assistant, and the single-file `llms-full.txt` context bundle you can drop into any large-context chat model.

## Feedback

Questions or problems with the plugin? Contact the [HPC Help Desk](../help/index.md) or email [scienceithelp@lbl.gov](mailto:scienceithelp@lbl.gov).

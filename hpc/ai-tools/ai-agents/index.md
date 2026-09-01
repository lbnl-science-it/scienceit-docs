# Using AI Agents on Lawrencium

We provide some general guidelines to both users and agents on this page while using AI coding tools such as `claude` and `codex` on Lawrencium.

Installation

Currently, we do not provide a centralized installation of popular AI coding tools such as `claude` and `codex`. Users can follow the official installation guidelines from these tools to install them in their home directories.t Please reach out to us at scienceithelp@lbl.gov if you need additional help. In addition, please follow the guidelines on this page.

You can also install VS Code extensions of these tools and run them on a compute node through the Remote SSH feature. See our [documentation](https://scienceit-docs.lbl.gov/hpc/accounts/loggingin/#vs-code-remote-ssh) on VS Code Remote SSH for more details.

## Guidelines for Users

- Long-running or compute intensive tasks should be performed on compute nodes through Slurm allocations. As such, agentic coding tools should generally be run through interactive slurm allocations rather than on login nodes.
- We provide sample markdown instructions on this page that you should add to `~/.claude/CLAUDE.md` or `~/.codex/AGENTS.md` on Lawrencium so that `claude` and `codex` follow the guidelines for resource usage. If you use other AI agents, read their documentation to find the location where such instructions should be placed.

Content to add to `AGENTS.md` or `CLAUDE.md`

```
## Filesystem
- Never run a recursive traversal on `/`, `/global`, `/global/home/`, 
`/global/software', or any other shared directory.
- Only use filesystem tools inside a specific user or project subdirectory 
I own or pointed at; for e.g.: `/global/home/users/$USER/<dir>`, 
`/global/scratch/users/$USER/<dir>`. Even in this case, always bound 
traversals: add `-maxdepth`, target an exact subpath and avoid wildcard 
globs that expand to thousands of entries.
- Use `module av` and `module spider` commands to search for software 
installed on the software module farm 

## Compute
- Never use login nodes for computation. Only use a login node for 
file editing and small builds.

## Documentation
- Lawrencium documentation can be found at: https://scienceit-docs.lbl.gov 
which is built using markdown files host on github: 
https://github.com/lbnl-science-it/scienceit-docs
- Skills for Lawrencium documentation: 
https://github.com/lbnl-science-it/scienceit-docs/tree/main/skills
```

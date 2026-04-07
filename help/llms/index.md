# Asking LLMs

## Lawrencium AI Assistant

`lrc-agent` is an interactive assistant for Lawrencium users. It has a Terminal User Interface (TUI) that provides a conversational interface to help users get answers about Lawrencium documentation. For example, you can ask it to write a sample slurm script or ask it how to find the peak memory used by a slurm job.

`lrc-agent` uses material from our HPC documentation in its context window and is capable of running some slurm (squeue & sinfo) shell commands.

Using `lrc-agent` is simple: just enter the command `lrc-agent` on the cluster terminal.

## CBorg - Lawrencium HPC & ScienceIT Assistant

You can ask questions to the **Lawrencium HPC & ScienceIT Assistant** on [CBorg](https://go.lbl.gov/scienceit-assistant).

## Using scienceit-docs as context

The whole content of this documentation site is available, in markdown format, as a a single file at <https://scienceit-docs.lbl.gov/llms-full.txt>. You can upload this file as context in [Google Gemini](https://gemini.google.com), [CBorg](https://chat.cborg.lbl.gov), or any other LLM model with large context window. Currently the `llms-full.txt` file has fewer than 50k tokens.

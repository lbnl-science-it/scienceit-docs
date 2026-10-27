# Using Claude Science with Lawrencium

[Claude Science](https://claude.com/docs/claude-science/overview){:target="_blank"} {{ ext }} is a desktop application from Anthropic that pairs Claude with an analysis environment on your own computer. You describe a research task in plain language, and Claude writes and runs Python, R, or shell code, reads the folders you grant it access to, and saves results as versioned artifacts with a provenance record.

Through its **Remote compute clusters** feature, Claude Science can also run jobs on a Slurm cluster that you reach over SSH. This page explains how to add Lawrencium as a remote compute cluster so that Claude can submit Slurm jobs to the Lawrencium and Einsteinium clusters on your behalf.

!!! note "Claude Science documentation"
    This page only covers the Lawrencium-specific setup. For installation, plans, usage limits, permissions, and everything else about Claude Science, see the official [Claude Science documentation](https://claude.com/docs/claude-science/overview){:target="_blank"} {{ ext }}, in particular:

    - [Get started](https://claude.com/docs/claude-science/get-started){:target="_blank"} {{ ext }}
    - [Remote compute clusters](https://claude.com/docs/claude-science/remote-compute-clusters){:target="_blank"} {{ ext }}
    - [Safeguards](https://claude.com/docs/claude-science/safeguards){:target="_blank"} {{ ext }}

## How Claude Science uses a Slurm cluster

When you add an SSH host in Claude Science, it uses your existing `~/.ssh/config` and authenticates with your SSH key or `ssh-agent`. It does not install anything on the cluster. In brief:

- **Probe.** When you add a host, Claude Science runs a short probe that records the CPUs, memory, GPUs, environment modules, Apptainer, scratch directories, and whether `sbatch` exists. On a Slurm cluster it also reads the partitions. The results are saved as editable notes on the host's detail page.
- **Slurm submission.** On a host that has `sbatch`, such as the Lawrencium login node, Claude Science submits jobs to Slurm by default. It does not run them on the login node itself.
- **Approval.** Before each remote job, Claude Science shows a **Run this job on `<host>`?** card with the command and job script. Nothing is submitted until you approve it.
- **Job directory.** On approval, the job script and inputs are copied to a job directory under the host's **Scratch directory**. Jobs keep running if your laptop disconnects.
- **Results.** When the job finishes, its outputs are copied back into your Claude Science session. Files larger than about 100 MB stay on the cluster, and Claude records their paths.

!!! warning "Remote jobs run as you"
    Remote jobs run outside of Claude Science's sandbox, as your Lawrencium user, with access to everything your account can read and write on the cluster. Read the job script on the approval card before you approve it, and be careful about approving jobs for a whole project or globally.

## Prerequisites

- **Claude Science installed on your computer** and a Claude account on a plan that includes it. See [Requirements](https://claude.com/docs/claude-science/overview#requirements){:target="_blank"} {{ ext }}. Claude Science needs a claude.ai account; it does not run through [CBorg](https://cborg.lbl.gov){:target="_blank"} {{ ext }}.
- **A Lawrencium user account** with [MFA](../accounts/mfa.md) set up, and access to at least one Slurm account (a PI Computing Allowance, condo, or recharge account). See [User Accounts](../accounts/user-accounts.md).
- **SSH access without a password prompt.** Claude Science authenticates with an SSH key or `ssh-agent` and cannot type your PIN+OTP for you. On Lawrencium, use an [SSH certificate](../accounts/loggingin.md#ssh-certificate) as described below.

## Step 1: Set up passwordless SSH

Lawrencium login normally requires your PIN+OTP. To let Claude Science connect without a prompt:

1. Request an SSH certificate as described in [SSH Certificate](../accounts/loggingin.md#ssh-certificate).
2. Add a `lrc-login` host entry that uses the certificate to `~/.ssh/config`, as shown in [VS Code Remote - SSH](../accounts/loggingin.md#vs-code-remote-ssh).
3. Check that `ssh lrc-login hostname` works without asking for a password.

!!! note "Certificates expire after 12 hours"
    When the certificate expires, Claude Science can no longer reach the cluster to submit jobs, check on them, or copy results back. Jobs already running in Slurm keep running. Request a new certificate to reconnect.

## Step 2: Add the SSH host in Claude Science

1. In Claude Science, go to **Settings > Compute > SSH hosts > Add SSH host**.
2. Choose or type the alias `lrc-login`. The address, user, and identity file are read from your `~/.ssh/config`.
3. In the notes field, add the Lawrencium details that Claude should know before its first job. See [Host notes for Lawrencium](#host-notes-for-lawrencium) below for a template.
4. Click **Add**. Claude Science probes the login node and saves what it finds as notes on the host's detail page. You can re-run this later with **Probe**.

Then, on the host's detail page, set:

- **Scratch directory**: a directory on a shared filesystem that the compute nodes can also see, for example `/global/scratch/users/your-username/claude-science`. Do not use `/tmp` or another directory that is local to the login node. Keep in mind that your home directory has a 30 GB quota.
- **Concurrent job limit**: Claude Science's default is 100 concurrent jobs, which counts only the jobs Claude submits. Do not increase this number; submitting large number of jobs at once can negatively affect the scheduler.

## Host notes for Lawrencium

Claude reads the notes on the host's detail page (the **Details** document) before it runs jobs, and it updates them as it works with the host. Accurate notes are the best way to get correct job scripts on the first try. Lawrencium jobs need a matching **account**, **partition**, and **QoS**. To list the combinations available to you, run the following on the login node:

```bash
sacctmgr show association -p user=$USER
```

Review the details document and make changes to any obvious errors. After that you can add additional information on the "User provided Context" section. A sample is below:


```
## User-provided context 
- Always set an account, partition and QoS. 
- Prefer es0 and lr6 for small test jobs. Use es2 for AI/ML training jobs
- Home: /global/home/users/your-username (30 GB quota)
- Never run a recursive traversal on /, /global, /global/home, 
  /global/software or /global/scratch. 
  Stay inside my own directories and bound any traversal.
- Lawrencium documentation: https://scienceit-docs.lbl.gov/llms-full.txt
- Use environment modules: `module av`, `module spider <name>`.
- Python: `module load miniforge3/25.9.1`.
- Home: /global/home/users/my-username (30 GB quota)
- Scratch: /global/scratch/users/my-username (not backed up; for temporary data)
- Never run a recursive traversal on /, /global, /global/home, /global/software
  or /global/scratch. Stay inside my own directories and bound any traversal.
```

For the partitions, QoS values, and GPU types on each cluster, see [CPU Cluster](../systems/lawrencium.md), [GPU Cluster](../systems/einsteinium.md), and [Slurm Overview](../running/slurm-overview.md).

## Adding the Lawrencium skill to Claude Science

The [Lawrencium skill](lawrencium-skill.md) lets Claude answer questions about Lawrencium and Einsteinium from this documentation, for example to look up partitions, QoS values, or software modules while writing a job script. To add it to Claude Science:

1. Go to **Settings > Skills > Add skill > Import from GitHub**.
2. Enter the repository `lbnl-science-it/scienceit-docs` (or `https://github.com/lbnl-science-it/scienceit-docs`) and import the `lawrencium-hpc` skill.

Claude loads the skill automatically when a question is about Lawrencium. Imported skills don't update on their own. To get the latest version, open the three-dot menu next to the repository under **Settings > Skills > Imported** and select **Check for updates…**. See [Skills](https://claude.com/docs/claude-science/connectors-and-skills#skills){:target="_blank"} {{ ext }} in the Claude Science documentation for details.

## Running jobs

Once the host is set up, ask Claude to run work on Lawrencium in plain language, for example:

- *"Run this parameter sweep on Lawrencium as a Slurm array job on lr7."*
- *"Train this model on one H100 on es2 and plot the loss curve."*

Claude writes the job script, and you approve it on the **Run this job on `lrc-login`?** card. You can approve **Once**, for **This conversation**, for **This project**, or **Global**.

Keep in mind:

- **Job timeout.** Claude Science's default job timeout is 30 minutes. For longer jobs, tell Claude the expected run time before it submits the job.
- **Usage.** Jobs that Claude submits are charged to the Slurm account in the job script, just like your own jobs. See [Charges and Billing](../accounts/charges.md).
- **Monitoring.** Claude's jobs appear in `squeue -u $USER` like any other job, and you can cancel them with `scancel`. See [Monitor Jobs](../running/monitor-jobs.md).
- **Large outputs.** Outputs larger than about 100 MB stay in the job directory on scratch. Use the [lrc-xfer data transfer node](../data-transfer-node.md) or [Globus](../../data/globus-instructions.md) to move large data.

## Feedback

Questions or problems using Claude Science with Lawrencium? Email [scienceithelp@lbl.gov](mailto:scienceithelp@lbl.gov). For problems with Claude Science itself, see [Troubleshoot Claude Science](https://claude.com/docs/claude-science/troubleshooting){:target="_blank"} {{ ext }}.

# Running AI Agents on Compute Nodes

AI coding agents such as `claude`, `codex` and `agy` can run for hours, and long-running or compute-intensive work [should not be done on login nodes](ai-agents.md#guidelines-for-users). This page shows how to run an agent (or any other long-running command-line program) inside a [tmux](https://github.com/tmux/tmux/wiki) session on a Lawrencium compute node. You start the session from a Slurm batch job, then attach to it and detach from it as often as you like. The agent keeps running after you log out and until the job ends.

!!! info "Before you start"

    * Install your agent in your home directory and log in to it once. See the installation note in [Using AI Agents on Lawrencium](ai-agents.md).
    * Add the [guidelines for agents](ai-agents.md#guidelines-for-agents) to your agent's `CLAUDE.md` or `AGENTS.md` file.

The workflow has three steps:

``` bash
sbatch agent.sh         # 1. start a job that runs a tmux session
cat agent-<jobid>.log   # 2. read the attach command from the log
# 3. attach
srun --jobid=<jobid> --overlap --pty tmux -L job<jobid> attach -t agent
```

## Step 1: Submit the batch script

Save the following script as `agent.sh` in the directory you want the agent to work in. Replace `<your_account>` with your Slurm account, and adjust the partition, cores, memory and time limit as needed. Programs running in the tmux session are confined to the CPUs and memory allocated to the job, so request enough cores and memory (for example with `--mem`) if the agent will run builds or tests.

```bash title="agent.sh"
#!/bin/bash
#SBATCH --job-name=agent
#SBATCH --account=<your_account>
#SBATCH --partition=lr7
#SBATCH --qos=lr_normal
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=4
#SBATCH --time=12:00:00
#SBATCH --output=agent-%j.log

# Use a job-specific tmux socket so that sessions from different jobs
# (or other tmux sessions on a shared node) never collide.
SOCKET="job${SLURM_JOB_ID}"
SESSION="agent"

export TERM=xterm-256color

# Start a detached tmux session in the directory the job was submitted from.
tmux -L "$SOCKET" new-session -d -s "$SESSION" -c "$SLURM_SUBMIT_DIR"

echo "Job ${SLURM_JOB_ID} running on $(hostname) since $(date)"
echo "Attach with:"
echo "  srun --jobid=${SLURM_JOB_ID} --overlap --pty tmux -L ${SOCKET} attach -t ${SESSION}"

# Keep the job alive for as long as the tmux session exists.
# Exiting the last shell in the session ends the job and frees the resources.
while tmux -L "$SOCKET" has-session -t "$SESSION" 2>/dev/null; do
    sleep 30
done
echo "tmux session ended at $(date); job finished."
```

Submit it from a login node:

```bash
sbatch agent.sh
```

## Step 2: Find the attach command

When the job starts running, the log file contains the exact command to attach:

```console
$ squeue --me -n agent
$ cat agent-<jobid>.log
Job <jobid> running on n0061.lr7 since Sun Nov 15 21:01:37 PST 2026
Attach with:
  srun --jobid=<jobid> --overlap --pty tmux -L job<jobid> attach -t agent
```

## Step 3: Attach, start the agent, and detach

Run the attach command from a login node:

```bash
srun --jobid=<jobid> --overlap --pty tmux -L job<jobid> attach -t agent
```

You are now in a shell on the compute node, in the directory you submitted from. Load any modules or environments you need and start your agent, for example `claude`, `codex` or `agy`.

These are the tmux keys you need:

| Keys | Action |
| ---- | ------ |
| `Ctrl-b` then `d` | Detach. The agent keeps running. |
| `Ctrl-b` then `[` | Scroll back through the output. Press `q` to stop scrolling. |
| `exit` or `Ctrl-d` at the shell prompt | Close the shell, which ends the job. |

After you detach, you return to the login node and you can log out. If your connection drops while you are attached, the session keeps running. Run the same `srun ... attach` command again to reattach later.

??? note "Why `--overlap` and `-L job<jobid>`?"

    * `srun --jobid=<jobid>` starts a new job step inside your running job, on the same node as the tmux session. `--overlap` lets that step share the CPUs already held by the batch script. Without it, `srun` waits for resources that the batch step will never release.
    * `-L job<jobid>` tells tmux to use a socket named after the job. Several of your jobs may land on the same shared node, and the job-specific socket ensures you attach to the right one.

## Checking on the agent without attaching

You can print the current contents of the tmux window without attaching to it:

```bash
srun --jobid=<jobid> --overlap tmux -L job<jobid> capture-pane -p -t agent
```

## Ending the job

When you are done, attach and type `exit` (or press `Ctrl-d`) in the tmux shell. The batch script notices that the session has ended and the job finishes, releasing its resources. You can also cancel the job at any time with `scancel <jobid>`.

!!! warning "Everything stops at the time limit"

    When the job reaches its `--time` limit, Slurm kills the tmux session and everything running in it. For work that may outlast a single job, instruct the agent to record its progress in a file (for example a `CHANGELOG.md` or notes file) and to commit its work to git regularly. A new agent in the next job can then pick up where the previous one stopped. See Anthropic's post on [long-running Claude for scientific computing](https://www.anthropic.com/research/long-running-claude) for an example of this pattern.

## Quick reference

| Task | Command |
| ---- | ------- |
| Start the job | `sbatch agent.sh` |
| Find the attach command | `cat agent-<jobid>.log` |
| Attach | `srun --jobid=<jobid> --overlap --pty tmux -L job<jobid> attach -t agent` |
| Detach | `Ctrl-b` then `d` |
| Check without attaching | `srun --jobid=<jobid> --overlap tmux -L job<jobid> capture-pane -p -t agent` |
| End the job | `exit` in the tmux shell |
| Cancel the job | `scancel <jobid>` |

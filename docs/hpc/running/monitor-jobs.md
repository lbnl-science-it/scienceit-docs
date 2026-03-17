## Monitoring the status of running batch jobs

To monitor a running job, you need to know the SLURM job ID of that job, which can be obtained by running

```bash
squeue -u $USER
```

## Monitoring the job from a login node

If you suspect your job is not running properly, or you simply want to understand how much memory or how much CPU the job is actually using on the compute nodes, Savio provides a script “wwall” to check that.

The following provides a snapshot of node status that the job is running on:

```bash
wwall -j $your_job_id
```
while

```bash
wwall -j $your_job_id -t
```

provides a text-based user interface (TUI) to monitor the node status when the job progresses. To exit the TUI, enter “q” to quit out of the interface and be returned to the command line.

You can also see a “top”-like summary for all nodes by running wwtop from a login node. You can use the page up and down keys to scroll through the nodes to find the node(s) your job is using. All CPU percentages are relative to the total number of cores on the node, so 100% usage would mean that all of the cores are being fully used.

## Monitoring the job by logging into the compute node
Alternatively, you can login to the node your job is running on as follows:

```bash
srun –jobid=$your_job_id –pty /bin/bash
```

This runs a shell in the context of your existing job. Once on the node, you can run top, htop, ps, or other tools.

If you’re running a multi-node job, the commands above will get you onto the first node, from which you can ssh to the other nodes if desired. You can determine the other nodes based on the `SLURM_NODELIST` environment variable.

## Checking finished jobs
First of all, you should look for the SLURM output and error files that may be created in the directory from which you submitted the job. Unless you have specified your own names for these files they will be names slurm-.out and slurm-.err.

After a job has completed (or been terminated/cancelled), you can review the maximum memory used via the sacct command.

```bash
sacct -j –format=JobID,JobName,MaxRSS,Elapsed 
```
MaxRSS will show the maximum amount of memory that the job used in kilobytes.

You can check all the jobs that you ran within a time window as follows

```bash
sacct -u –starttime=2019-09-27 –endtime=2019-10-04 \
–format JobID,JobName,Partition,Account,AllocCPUS,State,ExitCode,Start,End,NodeList
```

Please see `man sacct` for a list of the output columns you can request, as well as the SLURM documentation for the [`sacct`](https://slurm.schedmd.com/sacct.html) command.
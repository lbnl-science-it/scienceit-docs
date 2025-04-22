SLURM is a resource manager and job scheduling system developed by SchedMD. The trackable resources (TRES) include Nodes, CPUs, Memory and Generic Resources (GRES).

Slurm has three key functions:

1. Allocate resources exclusively/non-exclusive to nodes,
1. start/execute and monitor the resources on a node, and
1. arbitrate pending and queued work.

Nodes are grouped together within a partition. The partitions can also be considered as job queues and each of which has a set of constraints such as job size limit, time limit, default memory limits, and the number of nodes, etc. Submitting a job to the system requires you to specify a partition, an account, a Quality of Service (QoS), the number of nodes, wallclock time limits and optional memory (default will be used if not specified). Jobs within a partition will then be allocated to nodes based on the scheduling policy, until all resources within a partition are exhausted.

There are several basic commands you will need to know to submit jobs, cancel jobs, and check status. These are:

- `sbatch` – submit a job to the batch queue system, e.g., `sbatch myjob.sh`

- `squeue` – check the current jobs in the batch queue system, e.g., `squeue`

  By default, `squeue` command will list all the jobs in the queue system. To list only the jobs pertaining to your username $USER, use the command:

  ```
  squeue -u $USER

  ```

- `sinfo` – view the current status of the queues, e.g., `sinfo`

- `scancel` – cancel a job, e.g., `scancel 1234567`

- `srun` – to run interactive jobs

Interactive job using `srun`

You can use `srun` to request and run an interactive job. The following example (please change the `account_name` and the `partition_name` according to your needs) requests a `lr4` node for 1 hour.

```
srun -p lr4 -A account_name -q lr_normal -N 1 -t 1:00:00 --pty bash

```

The prompt will change to indicate that you are on the compute node allocated for the interactive job once the interactive job starts:

```
srun: job 7566529 queued and waiting for resources
srun: job 7566529 has been allocated resources
[user@n0105 ~]$ 

```

If you are done working on the interactive job before the allocated time, you can release the resource by using `exit` on the interactive node.

## Slurm Association

A Slurm job submission script includes a list of SLURM directives (or commands) to tell the job scheduler what to do. This information, such as user account, cluster partition and QoS (Quality of Service), have to be paired correctly in your job submission scripts. The Slurm command ‘sacctmgr‘ provide accounts, partitions and the QoSs that available to you as a user.

```
sacctmgr show association -p user=$USER

```

The command returns the output for a hypothetical example user `userA`. To be specific, `userA` has access to a PI Computing Allowance `pc_acctB`, departmental cluster nano and the condo account `lr_acctA` with respect to different partitions. Each line of this output indicates a specific combination of an account, a partition, and QoSes that you can use in a job script file, when submitting any individual batch job:

```
Cluster|Account|User|Partition|Share|…|QOS|…
perceus-00|pc_acctB|userA|ood_inter|1|||||||||||||lr_interactive|||
perceus-00|pc_acctB|userA|cm1|1|||||||||||||cm1_debug,cm1_normal|||
perceus-00|pc_acctB|userA|lr6|1|||||||||||||lr_debug,lr_normal|||
perceus-00|pc_acctB|userA|lr_bigmem|1|||||||||||||lr_normal|||
perceus-00|pc_acctB|userA|lr5|1|||||||||||||lr_debug,lr_normal|||
perceus-00|pc_acctB|userA|lr4|1|||||||||||||lr_debug,lr_normal|||
perceus-00|pc_acctB|userA|lr3|1|||||||||||||lr_debug,lr_normal|||
perceus-00|pc_acctB|userA|cf1|1|||||||||||||cf_debug,cf_normal|||
perceus-00|pc_acctB|userA|es1|1|||||||||||||es_debug,es_lowprio,es_normal|||

```

The Account, Partition, and QOS indicate which partitions and QoSes you have access to under each of your account(s).

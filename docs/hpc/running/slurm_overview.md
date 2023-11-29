SLURM is a resource manager and job scheduling system developed by SchedMD. The trackable resources (TRES)   include Nodes, CPUs, Memory and  Generic Resources (GRES). 

Slurm has three key functions: 

1. Allocate   resources exclusively/non-exclusive to nodes, 
2. start/execute and monitor the resources on a node, and 
3. arbitrate pending and queued work.  

Nodes are grouped together within a partition.  The partitions can also be considered   as job queues and each of which has a set of constraints such as job size limit, time limit, default memory limits,   and the number of nodes, etc. Submitting a job to the system requires you to specify a partition, an account, a   Quality of Service (QoS), the number of nodes, wallclock time limits and optional memory (default will be used if   not specified). Jobs within a partition will then be allocated to nodes based on the scheduling policy, until all   resources within a partition are exhausted.

There are several basic commands you will need to know to submit jobs, cancel jobs, and check status. These are:

* sbatch – submit a job to the batch queue system, e.g., `sbatch myjob.sh`
* squeue – check the current jobs in the batch queue system, e.g., `squeue`
* sinfo – view the current status of the queues, e.g., `sinfo`
* srun – to run interactive jobs, e.g., `srun –pty bash`
* scancel – cancel a job, e.g., `scancel 123`

## Slurm Association

A Slurm job submission script includes a list of SLURM directives (or commands) to tell the job scheduler what to do.  This information, such as user account, cluster partition and QoS (Quality of Service), have to be paired correctly in your job submission scripts. The Slurm command ‘sacctmgr‘ provide accounts, partitions and the QoSs that available to you as a user.
```bash
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
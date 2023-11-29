
GNU Parallel is a shell tool for executing jobs in parallel on one or multiple computers. It’s a helpful tool for automating the parallelization of multiple (often serial) jobs, in particular allowing one to group jobs into a single SLURM submission to take advantage of the multiple cores on a given Lawrencium node.

A job can be a single core serial task, multi-core or MPI application. A job can also be a command that reads from a pipe. The typical input is a list of parameters required for each task. GNU parallel can then split the input and pipe it into commands in parallel. GNU parallel makes sure output from the commands is the same output as you would get had you run the commands sequentially, and output names can be easily correlated to input file names for easy post-data processing. This makes it possible to use output from GNU parallel as input for other programs.

Below we’ll show basic usage of GNU parallel and then provide an extended example illustrating submission of a Savio job that uses GNU parallel.

For full documentation see the GNU parallel man page and GNU parallel tutorial.

## Basic Usage
To motivate usage of GNU parallel, consider how you might automate running multiple individual tasks using a simple bash for loop. In this case, our example command involves copying a file. We will copy file1.in to file1.out, file2.in to file2.out, etc.

```bash
for (( i=1; i <= 3; i++ )); do
cp file${i}.in file${i}.out
done
```

That’s fine, but it won’t run the tasks in parallel. Let’s use GNU parallel to do it in parallel:

```bash
parallel -j 2 cp file{}.in file{}.out ::: 1 2 3
ls file*out
# file1.out file2.out file3.out
```

Based on -j, that will use two cores to process the three tasks, staring the third task when a core becomes free from having finished either the first or second task. The ::: syntax separates the input values 1 2 3 from the command being run. Each input value is used in place of {} and cp command is run.

### Extended example
Here we’ll put it all together (and include even more useful syntax) to parallelize use of the bioinformatics software BLAST across multiple biological input sequences. Below are three sample files, including a SLURM job submission script where GNU parallel launches parallel tasks, a bash file to run a serial task and a task list.

1) Job submission script:

e.g., blast.slurm, where gnu-parallel flags are setup and independent tasks are launched in parallel:
```bash
#!/bin/bash
#SBATCH --job-name=job-name
#SBATCH --account=account_name
#SBATCH --partition=partition_name
#SBATCH --nodes=2.
#SBATCH --time=2:00:00
## Command(s) to run (example):
#
module load  bio/blast/1.13.0 parallel/20200222
export WDIR=/your/desired/path
cd $WDIR
export JOBS_PER_NODE=$SLURM_CPUS_ON_NODE
#
## when each task is multi-threaded, say NTHREADS=2, then JOBS_PER_NODE should be revised as below
## JOBS_PER_NODE=$(( $SLURM_CPUS_ON_NODE  / NTHREADS ))
## when memory footprint is large, JOBS_PER_NODE needs to be set ; $SLURM_CPUS_ON_NODE
#
echo $SLURM_JOB_NODELIST |sed s/\,/\\n/g; hostfile
## when GNU parallel can't detect core# of remote nodes, say --progress/--eta,
## core# should be prepended to hostnames. e.g. 32/n0149.savio3
## echo $SLURM_JOB_NODELIST |sed s/\,/\\n/g |awk -v cores=$SLURM_CPUS_ON_NODE '{print cores"/"$1}'hostfile<
#
parallel --jobs $JOBS_PER_NODE --slf hostfile --wd $WDIR --joblog task.log --resume --progress \
--colsep ' ' -a task.lst sh run-blast.sh {} output/{/.}.blst $NTHREADS 
```

* `-a`: task list as input to GNU parallel
* `–sshloginfile/-slf`: compute node list
* `–{}` : take values from the task list, one line at a time as parameters to the application/serial task (e.g. run-blast.sh)
* `–{/.}``:remove path and file extension
* `–output/{/.}`: specify output/file.blst as the blast result;
* `–colsep`: used as column separator, such as comma, tab, space for the input task list
* `–jobs`: number of tasks per node
* `–wd`: landing work dir on compute nodes, default is $HOME
* `–joblog`: keep track of completed tasks
* `–resume`: used as a checkpoint, allow jobs to resume
* `–progress`: display job progress
* `–eta`: estimated time to finish
* `–load`: threshold for CPU load, e.g. 80%
* `–noswap`: new jobs won’t be started if a node is under heavy memory load
* `–memfree`: check if there is enough free memory, e.g. 2G
* `–dray-run`: display commands to run without execution

Note: `–log logfile` pairs with the `resume` option for production runs.
A unique name of logfile is recommended, such as `$SLURM_JOB_NAME.log`
Otherwise, job rerun will not start when the same logfile exists

2) Serial bash script:

```bash
#!/bin/bash
module load  bio/blast/1.13.0 parallel/20200222

blastp -query $1 -db ../blast/db/img_v400_PROT.00 -out $2  -outfmt 7 -max_target_seqs 10 -num_threads $3
```
where $1, $2 and $3 are the three parameters required for each serial task

3)  Task list: list of parameters for tasks in the format of one line for one task. The parameters required for each task must to be on the same line separated by an eliminators:

[user@n0002 ~] cat task.lst
../blast/data/protein1.faa
../blast/data/protein2.faa

In this example, although each task takes three parameters (run-blast.sh), only one parameter is provided in the task list task.lst. The 2nd parameter, which specifies the output, is correlated to output/{/.}.blst in blast.slurm. And the third parameter num_threads is fixed. However, If core# varies from task to task, task.lst could be revised as:

[user@n0002 ~] cat task.lst
../blast/data/protein1.faa 2
../blast/data/protein2.faa 4
For best practice, test your code on an interactive node before submitting jobs to clusters.

In addition: task list can a sequence of commands, such as:
[user@n0002 ~] cat commands.lst
echo “host = ” ‘`hostname`’
sh -c “echo today date = ; date”
sh -c “echo today date = ; date”

[user@n0002 ~] parallel -j 2 < commands.lst
host =  n0148.savio3
today date = Sat Apr 18 14:07:33 PDT 2020

GNU Parallel man page
GPU Parallel tutorial
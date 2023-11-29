## Example Set 1
=== "Simple Serial Job"

    ```bash 
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --partition=partition_name
    #SBATCH --account=account_name
    #SBATCH --time=0:0:30
    ## Run command
    ./a.out
    ```

=== "Simple Multi-Core Job"

    ```bash
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --account=account_name
    #SBATCH --partition=partition_name
    #SBATCH --nodes=1
    #SBATCH --ntasks-per-node=20
    #SBATCH --cpus-per-task=1
    #
    # Wall clock limit:
    #SBATCH --time=00:00:30
    #
    ## Command(s) to run (example):
    ./a.out
    ```

=== "Serial Tasks in Parallel Job"

    ```bash
    #!/bin/bash
    #SBATCH --job-name=job-name
    #SBATCH --account=account_name
    #SBATCH --partition=partition_name
    #SBATCH --nodes=2
    #SBATCH --cpus-per-task=2
    #SBATCH --time=2:00:00
    #
    ## Command(s) to run (example):
    module load bio/blast/2.6.0
    module load gnu-parallel/2019.03.22
    
    export WDIR=/your/desired/path
    cd $WDIR
    
    # set number of jobs based on number of cores available and number of threads per job
    export JOBS_PER_NODE=$(( $SLURM_CPUS_ON_NODE / $SLURM_CPUS_PER_TASK ))
    #
    echo $SLURM_JOB_NODELIST |sed s/\,/\\n/g > hostfile
    #
    parallel --jobs $JOBS_PER_NODE --slf hostfile --wd $WDIR --joblog task.log --resume --progress -a task.lst sh run-blast.sh {} output/{/.}.blst $SLURM_CPUS_PER_TASK
    ```


## Example Set 2

=== "Threaded/OpenMP Job"

    ```bash 
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --account=account_name
    #SBATCH --partition=partition_name
    #SBATCH --nodes=1
    #SBATCH --ntasks-per-node=1
    #SBATCH --cpus-per-task=4
    #
    #SBATCH --time=00:00:30
    ## Command(s) to run (example):
    export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK
    ./a.out
    ```

=== "MPI Job 1"
    ```bash 
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --account=account_name
    #SBATCH --partition=partition_name
    #SBATCH --ntasks=40     (1)
    #
    # Processors per task:
    #SBATCH --cpus-per-task=1
    #SBATCH --time=00:00:30
    #
    ## Command(s) to run (example):
    module load gcc openmpi
    mpirun ./a.out
    ```

    1.  Number of MPI tasks needed

=== "MPI Job 2"
    ```bash
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --account=account_name
    #SBATCH --partition=partition_name
    #SBATCH --nodes=2
    #SBATCH --ntasks-per-node=20
    #SBATCH --cpus-per-task=1
    #SBATCH --time=00:00:30
    #
    ## Command(s) to run (example):
    module load gcc openmpi
    mpirun ./a.out
    
    ```

=== "Hybrid OpenMP+MPI Job"
    ```bash 
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --account=account_name
    #SBATCH --partition=partition_name
    #SBATCH --nodes=2
    #SBATCH --ntasks-per-node=4
    #SBATCH --cpus-per-task=5    (1)
    #SBATCH --time=00:00:30      (2)
    #
    ## Command(s) to run (example):
    module load gcc openmpi
    export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK
    mpirun ./a.out
    
    ```

    1. Processors per task needed
    2. Wall clock limit

## GPU Job

Es1 partition consists of GPU nodes with three generations of NVIDIA GPU cards(V100, GTX 2080TI, A40). Please take a look at the details on this page. A compute node with different GPU types and numbers can be allocated using slurm in the following way.

* General format:  `--gres=gpu[type]:count`

* The above format can schedule jobs on nodes with V100, GTX 2080TI, or A40 GPU cards. To specify a particular card:

    * GRTX2080TI: `--gres=gpu:GRTX2080TI:1` (up to 3 or 4 GPUs)

    * V100 : `--gres=gpu:V100:1`(up to 2 GPUs)

    * A40: `--gres=gpu:A40:1` (up to 4 GPUs)

To help the job scheduler effectively manage the use of GPUs, your job submission script must request multiple CPUs (usually two) for each GPU you use. The scheduler will reject jobs submitted that do not request sufficient CPUs for every GPU. This ratio should be one:two.

Here’s how to request two CPUs for each GPU: the total of CPUs requested results from multiplying two settings: the number of tasks (`--ntasks=`) and CPUs per task (`--cpus-per-task=`).

For instance, in the above example, one GPU was requested via `--gres=gpu:1`, and the required total of two CPUs was thus requested via the combination of `--ntasks=1` and --cpus-per-task=2 . Similarly, if your job script requests four GPUs via `--gres=gpu:4`, and uses `--ntasks=8`, it should also include `--cpus-per-task=1` to request the required total of eight CPUs.

Note that in the `--gres=gpu:n` specification, `n` must be between 1 and the number of GPUs on a single node (which is provided here for the various GPU types). This is because the feature is associated with how many GPUs per node to request.

```bash
#!/bin/bash
#SBATCH --job-name=test
#SBATCH --account=account_name
#SBATCH --partition=es1
#SBATCH --nodes=1
#SBATCH --ntasks=1
#
# Processors per task (please always specify the total number of processors twice the number of GPUs):
#SBATCH --cpus-per-task=2
#
#Number of GPUs, this can be in the format of "gpu:[1-4]", or "gpu:V100:[1-4] with the type included
#SBATCH --gres=gpu:1
#
# Wall clock limit:
#SBATCH --time=1:00:00
#
## Command(s) to run (example):
./a.out
```
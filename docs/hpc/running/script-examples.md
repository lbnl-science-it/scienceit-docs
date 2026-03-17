Here we show some example job scripts that allow for various kinds of parallelization such as: jobs that use fewer cores than available on a node, GPU jobs, low-priority condo jobs, and long-running PCA jobs.

Please refer to [Slurm Association](slurm-overview.md#slurm-association) on how to use the command `sacctmgr` to obtain details of accounts, partitions, and quality of service (qos) that are needed in a slurm script.

## Example Set 1
=== "Simple Serial Job"

    ```bash 
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --partition=partition_name
    #SBATCH --qos=qos_name
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
    #SBATCH --qos=qos_name
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
    #SBATCH --qos=qos_name
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
    #SBATCH --qos=qos_name
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
    #SBATCH --qos=qos_name
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
    #SBATCH --qos=qos_name
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
    #SBATCH --qos=qos_name
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

`es2` partition consists of NVIDIA H100 and H200 GPU cards. `es1` partition consists of GPU nodes with several generations of NVIDIA GPU cards (V100, GTX 2080TI, A40). Please take a look at the details on this [page](../systems/einsteinium.md). For `es2` and `es1` partitions, a compute node with a particular GPU type and count can be allocated using slurm in the following way.

* General format:  `--gres=gpu:[type]:count`

* The above format can schedule jobs on nodes with V100, A40, H100, or H200 GPU cards. For example, to specify a particular card:

    * V100 : `--gres=gpu:V100:1`(up to 2 GPUs)

    * A40: `--gres=gpu:A40:1` (up to 4 GPUs)
    
    * H100: `--gres=gpu:H100:1` (up to 8 GPUs)

    * H200: `--gres=gpu:H200:1` (up to 8 GPUs)


!!! warning "Do not modify `CUDA_VISIBLE_DEVICES`"

    The `CUDA_VISIBLE_DEVICES` environment variable is automatically set by SLURM when you request GPU resources (e.g. with `--gres=gpu:...`). This ensures that your job only has access to the GPUs allocated by the scheduler and prevents conflicts with other users and jobs. In general you should not modify this environment variable. Incorrectly changing or overriding this variable may result in resource conflicts, unpredictable behaviour or job failures.

To help the job scheduler effectively manage the use of GPUs, your job submission script must request multiple CPUs (usually two or more) for each GPU you use. The scheduler will reject jobs submitted that do not request sufficient CPUs for every GPU. 

### CPU Core to GPU Ratio

=== "es1"

    | GPU Type | GPUs per Node | CPU cores per Node | GPU:CPU ratio |
    | -------- | ------------- | ------------------ | ------------- |
    | A40      | 4             | 64                 | 1:16          |
    | A100     | 4             | 64                 | 1:16          |
    | GRTX8000 | 4             | 64                 | 1:16          |
    | V100.    | 2             | 8.                 | 1:4           |

=== "es2"

    | GPU Type | GPUs per Node | CPU cores per Node | GPU:CPU ratio |
    | -------- | ------------- | ------------------ | ------------- |
    | H100     | 8             | 112                | 1:14          |
    | H200     | 8             | 112                | 1:14          |

Here’s how to request two CPUs for each GPU: the total of CPUs requested results from multiplying two settings: the number of tasks (`--ntasks=`) and CPUs per task (`--cpus-per-task=`).

For instance, in the above example, one GPU was requested via `--gres=gpu:1`, and the required total of two CPUs was thus requested via the combination of `--ntasks=1` and `--cpus-per-task=2` . Similarly, if your job script requests four GPUs via `--gres=gpu:4`, and uses `--ntasks=8`, it should also include `--cpus-per-task=1` to request the required total of eight CPUs.

Note that in the `--gres=gpu:n` specification, `n` must be between 1 and the number of GPUs on a single node (which is provided [here for the various GPU types](../systems/einsteinium.md)). This is because the feature is associated with how many GPUs per node to request.

Examples:

* Request one V100 card: `--partition=es1 --cpus-per-task=4 --gres=gpu:V100:1 --ntasks=1`
* Request two A40 cards: `--partition=es1 --cpus-per-task=16 --gres=gpu:A40:2 --ntasks=2`
* Request three H100 cards: `--partition=es2 --cpus-per-task=14 --gres=gpu:H100:3 --ntasks=3`
* Request one H200 card: `--partition=es2 --cpus-per-task=14 --gres=gpu:H200:1 --ntasks=1 --mem-per-cpu=18400M`

!!! note "`--mem-per-cpu=18400M` for H200"

    When requesting one or more GPUs on a H200 node on the `es2` partition, we recommend using `--mem-per-cpu=18400M` on your slurm script. A default of `--mem-per-cpu=9200M` is applied for all requests on the `es2` partition which accounts for evenly distributing the H100 node memory. However, because the H200 nodes have double the CPU RAM (2TB) compared to the H100 nodes (1TB), the `--mem-per-cpu=18400M` line for H200 allows you to use the larger amount of CPU RAM available.


## Example Set 3
=== "Any 1 GPU on es1"
    ```bash
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --account=account_name
    #SBATCH --partition=es1
    #SBATCH --qos=es_normal
    #SBATCH --nodes=1
    #SBATCH --ntasks=1
    #
    # Processors per task (on `es1` please always specify the total number of processors at least twice the number of GPUs):
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

=== "Any 1 GPU on es2"
    ```bash
    #!/bin/bash
    #SBATCH --job-name=test
    #SBATCH --account=account_name
    #SBATCH --partition=es2
    #SBATCH --qos=es2_normal
    #SBATCH --nodes=1
    #SBATCH --ntasks=1
    #SBATCH --cpus-per-task=14

    # Number of GPUs, this can be in the format of "gpu:[1-8]", 
    # or "gpu:H100:[1-8] or "gpu:H200:[1-8]"
    #SBATCH --gres=gpu:1
    #
    # Wall clock limit:
    #SBATCH --time=1:00:00
    #
    ## Command(s) to run (example):
    ./a.out
    ```

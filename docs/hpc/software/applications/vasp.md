# VASP on Lawrencium

Separate VASP binaries targeting CPU or GPU partitions are available on Lawrencium.

## VASP CPU Binary (Intel Compiler)

The `vasp/6.4.1-cpu-intel` module is compiled using the intel compiler and mpi modules. To load the module:

``` bash
module load intel-oneapi-compilers/2023.1.0
module load intel-oneapi-mpi/2021.10.0
module load vasp/6.4.1-cpu-intel
```

!!! note "Sample VASP CPU slurm script"

    Please modify the `account`, `qos`, `ntasks`, `time` and other variables in the sample job scripts below appropriately before running your job.
    ``` bash
    #!/bin/bash
    #SBATCH --job-name="check"
    #SBATCH --ntasks=14
    #SBATCH --cpus-per-task=4
    #SBATCH --output=%x.out
    #SBATCH --error=%x.err
    #SBATCH --time=1:00:00
    #SBATCH --partition=lr7
    #SBATCH --account=<account>
    #SBATCH --qos=lr_normal

    module load intel-oneapi-compilers/2023.1.0
    module load intel-oneapi-mpi/2021.10.0
    module load vasp/6.4.1-cpu-intel

    export OMP_NUM_THREADS=4
    
    srun --mpi=pmi2 vasp_std
    ```

## VASP GPU Binary (NVHPC SDK)

The `vasp/6.4.1-gpu` module is compiled using NVHPC SDK. To load the module:

``` bash
module load nvhpc/23.11
module load vasp/6.4.1-gpu
```

!!! note "Sample VASP GPU slurm script"
    
    The following sample script runs VASP on a `H100 es1` node using 2 `H100` GPUs.

    ``` bash
    #!/bin/bash
    #SBATCH --job-name="rfm_VASPCheck_1401ba9b"
    #SBATCH --ntasks=2
    #SBATCH --cpus-per-task=14
    #SBATCH --output=vasp_job.out
    #SBATCH --error=vasp_job.err
    #SBATCH --time=1:00:00
    #SBATCH --partition=es1
    #SBATCH --account=<account>
    #SBATCH --qos=es_normal
    #SBATCH --gres=gpu:H100:2

    module load nvhpc/23.11
    module load vasp/6.4.1-gpu

    export PMIX_MCA_psec=native
    export OMP_NUM_THREADS=1

    mpirun -np 2 vasp_std
    ```



    


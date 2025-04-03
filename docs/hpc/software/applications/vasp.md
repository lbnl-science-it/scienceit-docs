# VASP on Lawrencium

The Vienna Ab initio Simulation Package (VASP) is a suite for quantum-mechanical molecular dynamics (MD) simulations and electronic structure calculations. VASP is a licensed package and the license is sold on a research group basis. HPCS group has compiled a VASP 6.4.1 version of the package on Lawrencium. License holder users or group of users can get access to package on request. New licensees need to complete the [VASP: Access Request form](https://docs.google.com/forms/d/e/1FAIpQLSe9dO-dcdcsVqqhiYv4TDhxtjmezjzxs9GvOfF9_C3Lje-E5A/viewform?usp=dialog) to be added to the linux groups authorized to use VASP. Please, provide the proof of purchase with this request. Please feel free to reach out to us at hpcshelp@lbl.gov if you would like us to update the version of the package. 

VASP binaries provided on Lawrencium are compiled targeting CPU or GPU partitions. Following guidelines can help users to run vasp calculation.

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

## Compiling VASP 

Users can also compile the package on their own in their home or group space. Please reach out to us if you help setting up makefile for GNU, intel or nvhpc compilers. 
    


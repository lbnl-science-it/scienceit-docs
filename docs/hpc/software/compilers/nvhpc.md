# NVHPC: NVIDIA HPC SDK

The NVIDIA HPC SDK version 23.11 is available on Lawrencium. You can load the `nvhpc` module as:

``` bash
module load nvhpc/23.11
```

The `nvhpc` module consists of the following compilers:

* C: `nvc`,
* C++: `nvc++` 
* Fortran: `nvfortran`

The CUDA C and CUDA C++ compiler driver [`nvcc`](https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html){:target="_blank"} {{ ext }} is also present in the module.

## CUDA Versions

`nvhpc/23.11` includes two CUDA toolkit versions: `CUDA 11.8` and `CUDA 12.3`. You can choose a particular version by using the compiler flag `-gpu`; for example, use  `-gpu=cuda11.8` to choose `CUDA 11.8` when compiling a program using `nvhpc` compilers.

## Target Architecture

The `-tp=<target>` flag can be used to specify a target processor when compiling using `nvhpc` compilers.

!!! note "-fast"

    `-fast` compiler option is useful to choose an optimal set of vectorization options, but can lead to an auto-selection of the `-tp` option. This might mean that your compiled code may not work on all Lawrencium partitions as Lawrencium includes a wide range of hardware across several partitions.

## MPI

`nvhpc` module includes a version of openmpi. MPI wrapper programs such as `mpicc`, `mpicxx` and `mpifort` are available once `nvhpc` is loaded. 

!!! info "Running MPI programs"

    To run MPI jobs compiled with the `nvhpc` module on Lawrencium, use `mpirun` instead of `srun`. 

!!! note "Special considerations"

    For some GPU nodes with AMD CPU hosts such as `A40` nodes, we have found that the following environment variable needs to be set when using `nvhpc`'s `mpirun` command to launch MPI jobs:

    ``` bash
    export PMIX_MCA_psec=native
    ```

    In addition, `--bind-to core` which is the default for `mpirun` might not work; in which case, you can try `--bind-to none` or `--bind-to socket`. For example:

    ``` bash
    mpirun -np 2 --bind-to socket ./program
    ```

  


## Additional References

* [NVIDIA HPC SDK Version 23.11 Documentation](https://docs.nvidia.com/hpc-sdk/archive/23.11/index.html){:target="_blank"} {{ ext }}
* [NVIDIA HPC SDK Version 23.11 Release Notes](https://docs.nvidia.com/hpc-sdk/archive/23.11/hpc-sdk-release-notes/index.html){:target="_blank"} {{ ext }}
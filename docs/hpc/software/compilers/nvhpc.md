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

`nvhpc/23.11` includes two CUDA toolkit versions -- `CUDA 11.8` and `CUDA 12.3`. One can choose a particular version at compile by using the flag `-gpu=cuda11.8`.


## Additional References

* [NVIDIA HPC SDK Version 23.11 Documentation](https://docs.nvidia.com/hpc-sdk/archive/23.11/index.html){:target="_blank"} {{ ext }}
* [NVIDIA HPC SDK Version 23.11 Release Notes](https://docs.nvidia.com/hpc-sdk/archive/23.11/hpc-sdk-release-notes/index.html){:target="_blank"} {{ ext }}
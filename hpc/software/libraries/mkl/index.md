# Intel MKL Library

Intel MKL library is available under both `gcc` and `intel-oneapi-compilers` on Lawrencium. Intel MKL library can be loaded after loading a compiler/mpi combination. For example:

```
[user@n0000 ~]$ module load gcc openmpi
[user@n0000 ~]$ module load intel-oneapi-mkl
[user@n0000 ~]$ module list

Currently Loaded Modules:
  1) gcc/11.4.0   2) ucx/1.14.1   3) openmpi/4.1.6   
  4) intel-oneapi-tbb/2021.10.0   5) intel-oneapi-mkl/2023.2.0

```

Similarly, we can load the MKL library with the intel oneapi compilers and mpi as:

```
[user@n0000 ~]$ module load intel-oneapi-compilers
[user@n0000 ~]$ module load intel-oneapi-mpi
[user@n0000 ~]$ module load intel-oneapi-mkl
[user@n0000 ~]$ module list

Currently Loaded Modules:
  1) intel-oneapi-compilers/2023.1.0   3) intel-oneapi-tbb/2021.10.0
  2) intel-oneapi-mpi/2021.10.0        4) intel-oneapi-mkl/2023.2.0

```

MKL Link Line Advisor

Use the Intel® oneAPI Math Kernel Library [(oneMKL) Link Line Advisor tool](https://www.intel.com/content/www/us/en/developer/tools/oneapi/onemkl-link-line-advisor.html) to obtain the appropriate compiler and linker options depending on your use case.

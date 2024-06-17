# Intel MPI

## Loading Intel MPI

``` bash
[user@n0000 ~]$ module load intel-oneapi-compilers
[user@n0000 ~]$ module load intel-oneapi-mpi
[user@n0000 ~]$ module list

Currently Loaded Modules:
  1) intel-oneapi-compilers/2023.1.0   2) intel-oneapi-mpi/2021.10.0

```

## Compiling MPI applications with Intel MPI

Open MPI compiler wrappers `mpiicx`, `mpiicpx`, `mpiifx` can be used to compile MPI applications. For hello world C/C++/Fortran examples:

!!! example "Examples"

    === "C"

        ``` bash
        mpiicx -o helloc hello_world.c
        ```

        `mpiicx` is the MPI wrapper to the Intel(R) C/C++ compiler and should be used to compile and link C programs

    === "C++"

        ``` bash
        mpiicpx -o hellocxx hello_world.cpp
        ```

        `mpiicpx` is the MPI wrapper to the Intel(R) oneAPI DPC++/C++ Compiler and should be used to compile and link C++ programs

    === "Fortran"

        ``` bash
        mpiifx -o hellofortran hello_world.f90
        ```

        `mpiifx` is the MPI wrapper to the Intel(R) oneAPI Fortran Compiler `ifx`.

## Running MPI applications using Intel MPI

Intel MPI applications can be launched using:

  * `mpirun` e.g.: `mpirun -np 2 ./helloc`
  * `srun`: To launch an Intel MPI application using `srun`, please set the `I_MPI_PMI_LIBRARY` environment variable and pass `mpi=mpi2` argument as follows in your slurm script.
      ``` bash
      export I_MPI_PMI_LIBRARY=/usr/lib64/libpmi2.so
      srun --mpi=pmi2 mpi_application
      ```

## References
* [Porting Guide for ICC users to DPCPP or ICX](https://www.intel.com/content/www/us/en/developer/articles/guide/porting-guide-for-icc-users-to-dpcpp-or-icx.html){:target="_blank"} {{ ext }}
* [Porting Guide for IFORT to IFX](https://www.intel.com/content/www/us/en/developer/articles/guide/porting-guide-for-ifort-to-ifx.html){:target="_blank"} {{ ext }}
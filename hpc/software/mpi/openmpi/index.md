# Open MPI

## Loading Open MPI

Open MPI is installed for various compilers in the software module farm. A compiler must be loaded before you can load the corresponding `openmpi`. For example, if you load the default `gcc` through `module load gcc`, then you can see which openmpi modules are available under the `gcc` module via `module avail openmpi`:

```
[user@n0000 ~]$ module load gcc
[user@n0000 ~]$ module list

Currently Loaded Modules:
  1) gcc/11.4.0

[user@n0000 ~]$ module avail openmpi

-------------- /global/software/rocky-8.x86_64/modfiles/gcc/11.4.0 -----------
   openmpi/4.1.3    openmpi/4.1.6 (D)
```

After this, you can load the default `openmpi/4.1.6` through `module load openmpi` or by specifying the version `module load openmpi/4.1.6`. If you want to load the non-default `openmpi/4.1.3` module, then you must specify the version: `module load openmpi/4.1.3`:

```
[user@n0000 ~]$ module load openmpi
[user@n0000 ~]$ module list

Currently Loaded Modules:
  1) gcc/11.4.0   2) ucx/1.14.1   3) openmpi/4.1.6
```

## Compiling MPI applications with Open MPI

Open MPI compiler wrappers `mpicc`, `mpicxx`, `mpifort` can be used to compile MPI applications. For hello world C/C++/Fortran examples:

Examples

```
mpicc -o helloc hello_world.c
```

`mpicc` is the MPI wrapper to the gcc C compiler.

```
mpicxx -o hellocxx hello_world.cpp
```

`mpicxx` is the MPI wrapper to the gcc C++ compiler.

```
mpifort -o hellofortran hello_world.f90
```

`mpifort` is the MPI wrapper to the gfortran compiler.

The `gcc/openmpi` compiled binaries can be launched directly through `srun` inside of a slrum job script.

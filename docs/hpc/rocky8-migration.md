# :simple-rockylinux: Migrating to Rocky Linux 8

!!! warning "Rocky 8"

    On the first week of July 2024, the operating system of Lawrencium login and compute nodes were updated to Rocky Linux 8. The process of [logging in to Lawrencium](accounts/loggingin.md) after upgrade to Rocky Linux 8 remains the same. The job submission process using [slurm](running/slurm-overview.md) also remains the same. See [example slurm](running/script-examples.md) job submission scripts. There are, however, important changes that users need to be aware of which are listed below.

## New Software Module Farm

With the OS upgrade comes a new software module farm. Various libraries, scientific applications and utilities are available and can be accessed via the [Lmod](https://lmod.readthedocs.io/en/latest/index.html){:target="_blank"} {{ ext }} Environment Module system. In addition to previously available `module` commands such as `module avail`, `module load` and `module unload`, a new useful command is `module spider` which helps in finding a module with instructions on any additional modules that you may have to load before loading a particular module. [See details here](software/module-management.md).

## Compiling Software

With the new software module farm, if you want to use software packages that are not already available you will likely have to reinstall/rebuild your software packages. `gcc`, `intel-oneapi-compilers`, `llvm` and `nvhpc` compiler packages are available. For MPI packages, [`openmpi`](software/mpi/openmpi.md) installed using a `gcc` compiler is only visible after loading the corresponding `gcc` compiler. Similarly, [`intel-oneapi-mpi`](software/mpi/intelmpi.md) package is only visible after loading the `intel-oneapi-compilers` package.

## Python Packages

`Anaconda3 2024.2` (Python 3.11) is available on the new software module farm. Additionally, two other versions of Python with minimal additional packages (mpi4py, numpy, matplotlib, scipy, h5py, pip) are provided. Please note that the linear algebra backend for `numpy` in these two python packages (`python/3.11.6-gcc-11.4.0` and `python/3.10.12-gcc-11.4.0`) is the openBLAS library whereas the Anaconda distribution (`anaconda3/2024.02-1-11.4`) uses the Intel MKL library.

## R Packages

Versions `4.4.0` and `4.3.0` of R are available to users. Some commonly used r-packages are already installed in the software module farm.


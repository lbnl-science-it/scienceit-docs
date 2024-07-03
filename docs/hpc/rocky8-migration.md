# :simple-rockylinux: Migrating to Rocky Linux 8

!!! warning "Rocky 8"

    On the first week of July 2024, the operating system of Lawrencium's login and compute nodes were updated to Rocky Linux 8. The process of [logging in to Lawrencium](accounts/loggingin.md) after upgrade to Rocky Linux 8 remains the same. The job submission process using [slurm](running/slurm-overview.md) also remains the same. See [example slurm](running/script-examples.md) job submission scripts. There are, however, important changes some of which are listed below.

## New Software Module Farm

With the OS upgrade comes a new software module farm. Various libraries, scientific applications and utilities are available and can be accessed via the [Lmod](https://lmod.readthedocs.io/en/latest/index.html){:target="_blank"} {{ ext }} Environment Module system. In addition to previously available `module` commands such as `module avail`, `module load` and `module unload`, a new useful command is `module spider` which helps in finding a module with instructions on any additional modules that you may have to load before loading a particular module. 

??? note "Example: module spider hdf5"
    
    ``` bash
    [user@n0000 ~]$ module spider hdf5

    -------------------------------------------------------------------------
      hdf5: hdf5/1.14.3
    -------------------------------------------------------------------------

    You will need to load all module(s) on any one of the lines below before 
    the "hdf5/1.14.3" module is available to load.

          gcc/10.5.0  openmpi/4.1.3
          gcc/10.5.0  openmpi/4.1.6
          gcc/11.4.0  openmpi/4.1.3
          gcc/11.4.0  openmpi/4.1.6
          intel-oneapi-compilers/2023.1.0  intel-oneapi-mpi/2021.10.0
    
        Help:
          HDF5 is a data model, library, and file format for storing and 
          managing data. It supports an unlimited variety of datatypes, 
          and is designed for flexible and efficient I/O and for high volume 
          and complex data.
    ``` 


[See more details on module management here](software/module-management.md).

## Compiling Software

If you want to use software packages that are not already available to you in the new software module farm, you will have to reinstall/rebuild your software packages. `gcc`, `intel-oneapi-compilers`, `llvm` and `nvhpc` compiler packages are available. For MPI packages, [`openmpi`](software/mpi/openmpi.md) installed using a `gcc` compiler is only visible after loading the corresponding `gcc` compiler. Similarly, [`intel-oneapi-mpi`](software/mpi/intelmpi.md) package is only visible after loading the `intel-oneapi-compilers` package.

The default `gcc` compiler is `gcc/11.4.0` available through `module load gcc`. Two other `gcc` versions are available: `gcc/10.5.0` and `gcc/13.2.0`. 

`intel-oneapi-compilers` version `2023.1.0` is available which consists of both the intel classic compilers `icc, icpc, ifort` and the newer intel oneAPI compilers: `icx, icpx, ifx`. Some links to additional resources on Intel documentation site for the particular versions of compilers in this module can be found [here](software/compilers/intel.md).

## Python Packages

`Anaconda3 2024.2` (Python 3.11) is available on the new software module farm. It can be loaded as:

``` bash
module load anaconda3
```

Two other versions of Python with minimal additional packages (`mpi4py, numpy, matplotlib, scipy, h5py, pip`) are provided. Please note that the linear algebra backend for `numpy` in these two python modules (`python/3.11.6` and `python/3.10.12`) is the openBLAS library whereas the Anaconda distribution (`anaconda3/2024.02-1-11.4`) uses the Intel MKL library.

As before, several Jupyter kernels are available to access `tensorflow` and `pytorch` conda environments from the [Jupyter server](openondemand/jupyter-server.md) on [Open OnDemand](openondemand/overview.md). [Click here](openondemand/packages-kernels.md) for more information on installing python packages and jupyter kernels for use on the Jupyter server on Open OnDemand.

## R Packages

Version `4.4.0` of R is available to users; the R module can be loaded as:
``` bash
module load r
```
Some commonly used r-packages are already installed with the R module available on the system. To view the list of packages already installed, use the following command in the R command prompt (either in your terminal or R-studio session on Open OnDemand):

``` R
installed.packages()
```

Another module `r-spatial` is available for a standard set of R packages for spatial data:
``` bash
module load r-spatial
```


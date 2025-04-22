The Software Module Farm (SMF) is managed by the [Lmod](https://lmod.readthedocs.io/en/latest/index.html) Environment Module system to set the appropriate environment variables in your shell needed to make use of the individual software packages.

Environment Modules are used to manage users’ runtime environments dynamically. This is accomplished by loading and unloading modulefiles which contain the application specific information for setting a user’s environment, primarily the shell environment variables, such as `PATH`, `LD_LIBRARY_PATH`, etc. Modules are useful in managing different applications, and different versions of the same application in a cluster environment.

The following commands are some frequently useful commands to manipulate modules in your environment:

```
module load SOFTWARE    # Load the module “SOFTWARE”
module unload SOFTWARE  # Unload the module “SOFTWARE”
module available        # List all modules available for loading
module list             # List all modules currently loaded

```

## Finding Modules

module spider

`module spider SOFTWARE`

is a useful module command that lists the module(s) named `SOFTWARE` and information on additional modules that you may need to load before `SOFTWARE` is available to load

For example:

```
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

This means that you will need to load the appropriate compiler + mpi library combination before being able to load the corresponding hdf5 module. For example, you can do the following:

```
module load gcc/11.4.0
module load openmpi/4.1.6
module load hdf5

```

## Environment Modules Usage Examples

There are some basic commands that users will need to know to work with the Environment Modules system, which all starts with the primary “module” command, and followed by a subcommand listed below (“|” means “or”, e.g., “module add” and “module load” are equivalent). For detail usage instruction of the “module” command please run “man module”.

- `module avail` – List all available modulefiles in the current `MODULEPATH`.
- `module list` – List loaded modules.
- `module add|load modulefile …` – Load modulefile(s) into the shell environment.
- `module rm|unload modulefile` … – Remove modulefile(s) from the shell environment.
- `module swap|switch [modulefile1] modulefile2` – Switch loaded modulefile1 with modulefile2.
- `module show|display modulefile …` – Display information about one or more modulefiles.
- `module whatis [modulefile …]` – Display the information about the modulefile(s).
- `module purge` – Unload all loaded modulefiles.

Below we demonstrate how to use these commands. Depending on which system you have access to and when you are reading this instruction, what you see here could be different from the actual output from the system that you work on.

module avail

```
[user@n0000.scs00 ~]$ module avail
------------------------- /global/software/rocky-8.x86_64/modfiles/compilers ---------------------
  gcc/10.5.0    gcc/11.4.0 (D)    intel-oneapi-compilers/2023.1.0    llvm/17.0.4    nvhpc/23.9

------------------------- /global/software/rocky-8.x86_64/modfiles/tools -------------------------
  automake/1.16.5       ffmpeg/6.0              lmdb/0.9.31          proj/9.2.1         tcl/8.6.12
  awscli/1.29.41        gdal/3.7.3              m4/1.4.19            protobuf/3.24.3    tmux/3.3a
  bazel/6.1.1           glog/0.6.0              matlab/r2022a        qt/5.15.11         unixodbc/2.3.4
  cmake/3.27.7          gmake/4.4.1             mercurial/6.4.5      rclone/1.63.1      valgrind/3.20.0
  code-server/4.12.0    gurobi/10.0.0           nano/7.2             snappy/1.1.10      vim/9.0.0045
  eigen/3.4.0           imagemagick/7.1.1-11    ninja/1.11.1         spack/0.20.1
  emacs/29.1            leveldb/1.23            parallel/20220522    swig/4.1.1

------------------------- /global/software/rocky-8.x86_64/modfiles/langs -------------------------
  anaconda3/2024.02-1-11.4    openjdk/11.0.20.1_1-gcc-11.4.0        r/4.3.0-gcc-11.4.0

```

module list

```
[user@n0000 ~]$ module list
No modules loaded

```

module load

```
[user@n0000 ~]$ module load gcc
[user@n0000 ~]$ module load openmpi
[user@n0000 ~]$ module list

Currently Loaded Modules:
  1) gcc/11.4.0   2) ucx/1.14.1   3) openmpi/4.1.6

```

On systems in which a hierarchical structure is used, some of modulefiles will only be available after the root modulefile is loaded. The Lawrencium cluster uses a hierarchical structure for several packages that depend on a particular compiler and/or MPI package. For example, after loading `gcc/11.4.0` and `openmpi/4.1.6` in the example above, `module avail` will show new packages that can now be loaded:

hierarchical structure

```
[user@n0000 ~]$ module avail

------------- /global/software/rocky-8.x86_64/modfiles/openmpi/4.1.6-4xq5u5r/gcc/11.4.0 ------------
  boost/1.83.0      hmmer/3.4                        ncl/6.6.2         netcdf-fortran/4.6.1
  fftw/3.3.10       intel-oneapi-mkl/2023.2.0 (D)    nco/5.1.6         netlib-lapack/3.11.0   (D)
  gromacs/2023.3    lammps/20230802                  ncview/2.1.9      netlib-scalapack/2.2.0
  hdf5/1.14.3       mumps/5.5.1                      netcdf-c/4.9.2    petsc/3.20.1

------------------------ /global/software/rocky-8.x86_64/modfiles/gcc/11.4.0 -----------------------
  antlr/2.7.7                gsl/2.7.1                     openmpi/4.1.6   (L,D)
  blast-plus/2.14.1          idba/1.1.3                    picard/2.25.7
  bowtie2/2.5.1              intel-oneapi-mkl/2023.2.0     prodigal/2.6.3
  cuda/11.8.0                intel-oneapi-tbb/2021.10.0    samtools/1.17
  cuda/12.2.1         (D)    netlib-lapack/3.11.0          ucx/1.14.1      (L)
  cudnn/8.7.0.84-11.8        openblas/0.3.24               udunits/2.2.28
  cudnn/8.9.0-12.2.1  (D)    openmpi/4.1.3                 vcftools/0.1.16

```

For example, now `gromacs` can be loaded.

Note

```
[sadhikari@n0000 ~]$ module load gromacs
[sadhikari@n0000 ~]$ module list

Currently Loaded Modules:
  1) gcc/11.4.0   3) openmpi/4.1.6   5) intel-oneapi-tbb/2021.10.0   7) netlib-lapack/3.11.0
  2) ucx/1.14.1   4) fftw/3.3.10     6) intel-oneapi-mkl/2023.2.0    8) gromacs/2023.3

```

`module show` command displays information about the module.

module show

```
[user@n0000 ~]$ module show fftw
---------------------------------------------------------------------------------------------------------
  /global/software/rocky-8.x86_64/modfiles/openmpi/4.1.6-4xq5u5r/gcc/11.4.0/fftw/3.3.10.lua:
---------------------------------------------------------------------------------------------------------
whatis("Name : fftw")
whatis("Version : 3.3.10")
whatis("Target : x86_64")
whatis("Short description : FFTW is a C subroutine library for computing the discrete Fourier transform (DFT)
in one or more dimensions, of arbitrary input size, and of both real and complex data (as well as of even/od
d data, i.e. the discrete cosine/sine transforms or DCT/DST). We believe that FFTW, which is free software, s
hould become the FFT library of choice for most applications.")
help([[Name   : fftw]])
help([[Version: 3.3.10]])
help([[Target : x86_64]])
]])
help([[FFTW is a C subroutine library for computing the discrete Fourier
transform (DFT) in one or more dimensions, of arbitrary input size, and
of both real and complex data (as well as of even/odd data, i.e. the
discrete cosine/sine transforms or DCT/DST). We believe that FFTW, which
is free software, should become the FFT library of choice for most
applications.]])
depends_on("openmpi/4.1.6")
prepend_path("PATH","/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/fftw-3.3.10-cf4npbktu
eip6tnwqf2qstog7on4pyfk/bin")
prepend_path("MANPATH","/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/fftw-3.3.10-cf4npb
ktueip6tnwqf2qstog7on4pyfk/share/man")
prepend_path("PKG_CONFIG_PATH","/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/fftw-3.3.1
0-cf4npbktueip6tnwqf2qstog7on4pyfk/lib/pkgconfig")
prepend_path("CMAKE_PREFIX_PATH","/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/fftw-3.3
.10-cf4npbktueip6tnwqf2qstog7on4pyfk/.")
append_path("MANPATH","")

```

The `module purge` command unloads all currently loaded modulefiles.

module purge

```
[user@n0000 ~]$ module purge
[user@n0000 ~]$ module list
No modules loaded

```

## User Generated Modulefiles

User generated modulefiles

Users can generate their own modulefiles to load user-specific applications. The path of the modulefiles needs to be appended to the `MODULEPATH` environment variable as follows:

1). For bash users, please add the following to ~/.bashrc:

```
export MODULEPATH=$MODULEPATH:/location/to/my/modulefiles

```

2). For csh/tcsh users, please add the following to ~/.cshrc:

```
setenv MODULEPATH ”$MODULEPATH”:/location/to/my/modulefiles

```

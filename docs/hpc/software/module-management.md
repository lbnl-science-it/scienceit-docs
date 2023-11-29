Environment Modules Usage Instructions
The Software Module Farm (SMF) is managed by the Environment Modules  to set the appropriate environment variables in your shell needed to make use of the individual software packages. This system is identical to the one used on the High-Performance Computing Services (HPCS) group’s LBNL Supercluster.

The following commands are available to manipulate modules in your environment:

```bash
module load SOFTWARE    # Load the module “SOFTWARE”
module unload SOFTWARE  # Unload the module “SOFTWARE”
module available        # List all modules available for loading
module list             # List all modules currently loaded
```
There are more module commands that you can use. See the manual via command:

```bash
man module
```

On all the clusters that High Performance Computing Services (HPCS) group manages, Environment Modules are used to manage users’ runtime environments dynamically. This is accomplished by loading and unloading modulefiles which contain the application specific information for setting a user’s environment, primarily the shell environment variables, such as `PATH`, `LD_LIBRARY_PATH`, etc. Modules are useful in managing different applications, and different versions of the same application in a cluster environment.

Environment Modules allow a user to integrate the user’s own application environment with the system provided application environment together, hence allow a common interface for simplicity, while still maintain the diversity and flexibility. This is accomplished by allowing different categories of modulefiles to be chained together. The first category of the modulefiles are provided and maintained by the HPCS group, which include the commonly used applications and libraries, such as compilers, math libraries, I/O libraries, data processing and visualization tools, etc. We use a hierarchical structure to maintain the cleanness without losing the flexibility of it. The second category of the modulefiles are automatically chained for the group of users who belong to the same group on the cluster, if the modulefiles exist in the designated directory. This allows the same group of users to share some of the common applications that they use for collaboration and saves spaces. Normally the user group maintains these modulefiles. But HPCS can also provide assistance under support agreement and per request basis. The third category of the modulefiles can also be chained on demand by a user if the user chooses to use Environment Modules to manage user specific applications as well. To do that, user needs to append the location of the modulefiles to the environment variable `MODULEPATH`. This can be done in one of the following ways:

1). For bash users, please add the following to ~/.bashrc:

```bash
export MODULEPATH=$MODULEPATH:/location/to/my/modulefiles
```

2). For csh/tcsh users, please add the following to ~/.cshrc:

```csh
setenv MODULEPATH ”$MODULEPATH”:/location/to/my/modulefiles
```

Environment Modules Usage Examples
There are some basic commands that users will need to know to work with the Environment Modules system, which all starts with the primary “module” command, and followed by a subcommand listed below (“|” means “or”, e.g., “module add” and “module load” are equivalent). For detail usage instruction of the “module” command please run “man module”.

* `module avail` – List all available modulefiles in the current MODULEPATH.
* `module list` – List loaded modules.
* `module add|load modulefile …` – Load modulefile(s) into the shell environment.
* `module rm|unload modulefile` … – Remove modulefile(s) from the shell environment.
* `module swap|switch [modulefile1] modulefile2` – Switch loaded modulefile1 with modulefile2.
* `module show|display modulefile …` – Display information about one or more modulefiles.
* `module whatis [modulefile …]` – Display the information about the modulefile(s).
* `module purge` – Unload all loaded modulefiles.

Below demonstrates how to use these commands. Depending on which system you have access to and when you are reading this instruction, what you see here could be different from the actual output from the system that you work on. On systems that a hierarchical structure is used, some of modulefiles will only be available after the root modulefile is loaded, as demonstrated below.

```
[doe@n0000.scs00 ~]$ module avail
---- /global/software/sl-7.x86_64/modfiles/tools ----
cmake/3.7.2  gnuplot/5.0.5  octave/4.2.0  paraview/5.1.2 texlive/2016 .........

---- /global/software/sl-7.x86_64/modfiles/langs ----
gcc/6.3.0  intel/2016.4.072  python/2.7 python/3.5 cuda/9.0 julia/0.5.0 .......

---- /global/software/sl-7.x86_64/modfiles/apps ----
bio/blast/2.6.0 math/octave/current ml/theano/current-py36 mk/tensorflow/1.0.0-py36

[doe@n0000.scs00 ~]$ module list
Currently Loaded Modulefiles:
  1) intel/2013.5.192      2) openmpi/1.6.5-intel

[doe@n0000.scs00 ~]$ module load mkl 
[doe@n0000.scs00 ~]$ module list
No Modulefiles Currently Loaded.

[doe@n0000.scs00 ~]$ module load intel openmpi
[doe@n0000.scs00 ~]$ module list
Currently Loaded Modulefiles:
  1) intel/2016.4.072   2) openmpi/2.0.2-intel 

[doe@n0000.scs00 ~]$ module show fftw
-------------------------------------------------------------------
/global/software/sl-7.x86_64/modfiles/intel/2016.4.072/fftw/3.3.6-intel:

module-whatis    This module sets up FFTW 3.3.6 in your environment.
module           load openmpi/2.0.2-intel
setenv           FFTW3_DIR /global/software/sl-7.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel
prepend-path     PATH /global/software/sl-7.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel/bin
prepend-path     INCLUDE /global/software/sl-7.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel/include
prepend-path     CPATH /global/software/sl-7.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel/include
prepend-path     FPATH /global/software/sl-7.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel/include
prepend-path     LIBRARY_PATH /global/software/sl-7.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel/lib
prepend-path     LD_LIBRARY_PATH /global/software/sl-6.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel/lib
prepend-path     INFOPATH /global/software/sl-7.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel/share/info
prepend-path     MANPATH /global/software/sl-7.x86_64/modules/intel/2016.4.072/fftw/3.3.6-intel/share/man
-------------------------------------------------------------------

[doe@n0000.scs00 ~]$ module whatis mkl
mkl: This module sets up MKL 2016.4.072 in your environment.

[doe@n0000.scs00 ~]$ module purge  
[doe@n0000.scs00 ~]$ module list
No Modulefiles Currently Loaded.
[doe@n0000.scs00 ~]$ module avail
---- /global/software/sl-7.x86_64/modfiles/tools ----
cmake/3.7.2  gnuplot/5.0.5  octave/4.2.0  paraview/5.1.2 texlive/2016 .........

---- /global/software/sl-7.x86_64/modfiles/langs ----
gcc/6.3.0  intel/2016.4.072  python/2.7 python/3.5 cuda/9.0 julia/0.5.0 .......

---- /global/software/sl-7.x86_64/modfiles/apps ----
bio/blast/2.6.0 math/octave/current ml/theano/current-py36 mk/tensorflow/1.0.0-py36
```

### Additional Information:

Please use Service Now or send email to hpcshelp@lbl.gov for any inquiries or service requests.
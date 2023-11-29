## Overview

The Software Module Farm (SMF) service is offered to all Berkeley Lab users with compatible systems, regardless of whether or not the HPCS group manages that system.  Currently we support all Red Hat Enterprise Linux hosts using version 7 (or any rebuild thereof, including Scientific Linux and CentOS).  The HPCS team manages the SMF on a centralized storage device and allows the module tree to be mounted as a read-only NFS filesystem on any authorized host.  Users of existing module farms can receive assistance in migrating to this new service if desired, and any missing software packages will be added to the new SMF service during this process. All existing HPCS SLA customers are eligible to obtain this service free of charge; that is, it is included with all SLAs.  For systems not currently under SLA with the HPCS group, a nominal $25/month/host charge will be made to help cover maintenance and hardware costs.  A project ID will be required before any non-SLA host is permitted to mount the SMF. If you have any questions regarding the new HPCS SMF service, please send an email to hpcshelp@lbl.gov.

## HPCS Software Module Farm

The HPCS group manages a variety of clusters and standalone systems across the Lab. The HPCS Software Module Farm service provides a comprehensive and well-tested suite of software modules for clusters and individual systems to utilize. It also manages the modules in a hierarchical way so that the module dependencies are well-defined and organized. There are three types of software modules:

1. **Tool** – Tool modules are built and compiled with the default system GCC compiler. They have no dependencies.
2. **Language** – Language modules are compilers/interpreters for a specific language, such as GCC or Python.
3. **Submodule** – Submodules include libraries, subpackages, and other software which depend on a particular Language module (e.g., a particular version of Python). Due to this dependency, submodules will only be visible once the associated Language module is loaded. For example, the `numpy/1.6.1` module built against `python/2.7.3` will only be visible once the `python/2.7.3` module has been loaded.

## Advantages for the User

* The layout and architecture of our HPCS SMF is designed to make large suites of modules with numerous dependencies manageable for administrators and end-users alike.  Only those modules which are compatible with your environment and operating system are shown, and more modules become available as their dependencies are loaded.
* The HPCS SMF is a replica for HPCS Supercluster SMF that is used by clusters in our supercluster environment (including Lawrencium, nano and clusters in the environment). Existing supercluster users can have identical software environment on there local systems after mounting the HPCS SMF.
* All modules are fully tested on all supported operating systems, distributions, and versions.
* The HPCS team handles all the compilation and maintenance tasks, so you don’t have to!
* Licenses for selected commercial compilers (currently PGI and Intel) are provided at no extra cost to you.
* Leverage economies of scale by sharing unified maintenance efforts across the entire Laboratory.

## Software Category

HPCS group provides and maintains the system level modules. The purpose of it is to provide an ecosystem that most users rely on to accomplish their research and studies. The range of applications and libraries that HPCS supports on each system is different, and highly depends on the use case and frequency of how often a support request is received. Currently the following categories of applications and libraries are supported.

* Development Tools
* Data Processing and Visualization Tools
* Typesetting and Publishing Tools
* Miscellaneous Tools


Table 1. Modules List

| CATEGORY | APPLICATION/LIBRARY NAME |
| -------- | ------------------------ |
| Editor/IDE |	Emacs, Vim, make, cmake, cscope, ctags |
| SCM      |	Subversion, Git, Mercurial |
| Debugger/Profiler/Tracer |	GDB, grpof, TotalView, Valgrind, TAU |
| Language/Platform |	GCC, Intel (license required), PGI (license required), Perl, Python, Java, Boost, CUDA, UPC, Open MPI, PVM, TBB (license required), MPI4Py, IPython, R, MATLAB (license required) |
| Math Libraries |	ACML, MKL (license required), ATLAS, FFTW, FFTW3, GSL, LAPACK, ScaLAPACK, NumPy, SciPy |
| I/O Libraries |	HDF5, NetCDF, NCO, NCL
| Visualization |	Gnuplot, Grace, Graphviz, ImageMagick, MATLAB (license required), GNU Octave, ParaView, R, VisIt, VMD, yt, Matplotlib |
| Typesetting/Publishing |	Tex Live, Ghostscript, Doxgen |


## Licensed Software
TotalView, Intel parallel Studio, Q-Chem, MATLAB, Ansys. 

## Install Software by Users
Users are encourage to install domain scientific software packages or local software module farms in their home or group space
Users don’t have admin rights, but most software can be installed with the flag –prefix=/dir/to/your/path

## Install Python Packages by Users
* Python modules: abundantly available but cannot be installed in the default location without admin rights.
* Install Python modules in ~/.local followed by export PYTHONPATH
* `pip install –user package_name`
* `export PYTHONPATH`

```bash
[user@n0000 ~]$ module available python
--------------------- /global/software/sl-7.x86_64/modfiles/langs -----------------------------------
python/2.7          python/3.5          python/3.6(default) python/3.7          python/3.7.6        python/3.8.2-dll
[user@n0000 ~]$ module load python/3.7

[user@n0000 ~]$ python3 -m site --user-site
/global/home/users/wfeinstein/.local/lib/python3.7/site-packages

[user@n0000 ~]$ pip install --user ml-python
...
Successfully built ml-python
Installing collected packages: ml-python
Successfully installed ml-python-2.2

[user@n0000 ~]$ export PYTHONPATH=~/.local/lib/python3.7/site-packages:$PYTHONPATH
```

* pip install: –install-option=”–prefix=$HOME/your_path” package_name
* Install from source code:  `python setup.py install –home=/home/user/package_dir`
* Create a virtual environment: `python -m venv my_env`
* Isolated Python environment: dev with different versions of Python

Please use Service Now or send email to hpcshelp@lbl.gov for any inquiries or service requests.

## Tips

Many tools and bundles such as OpenMPI are compiler specific.  To find what modules is available under specific language pack, run ls on the module dir, eg:
>  ls -1 /global/software/sl-7.x86_64/modfiles/intel/2018.1.163/ antlr boost fftw hdf5 mkl nco ncview netcdf openmpi […]
 
To find all languages that have Open MPI (and their matching versions), use:
> find /global/software/sl-7.x86_64/modfiles| grep openmpi
/global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/3.0.0-intel /global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/2.0.2-intel /global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/2.1.3-intel /global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/3.0.1-intel /global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/3.0.1-intel_ilp64 /global/software/sl-7.x86_64/modfiles/intel/2018.1.163/openmpi/3.0.1-intel /global/software/sl-7.x86_64/modfiles/intel/2018.1.163/openmpi/2.0.2-intel /global/software/sl-7.x86_64/modfiles/intel/2020.1.024.par/openmpi/4.1.1 /global/software/sl-7.x86_64/modfiles/intel/oneapi-2022.2/scg/openmpi/4.1.3 /global/software/sl-7.x86_64/modfiles/gcc/4.8.5/openmpi/2.0.2-gcc /global/software/sl-7.x86_64/modfiles/gcc/5.4.0/openmpi/2.0.2-gcc /global/software/sl-7.x86_64/modfiles/gcc/5.4.0/openmpi/3.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/6.3.0/openmpi/2.0.2-gcc /global/software/sl-7.x86_64/modfiles/gcc/6.3.0/openmpi/3.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/7.4.0/openmpi/4.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/7.4.0/openmpi/3.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/7.4.0/openmpi/2.0.2-gcc /global/software/sl-7.x86_64/modfiles/gcc/9.2.0/openmpi/4.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/7.5.0/openmpi/2.1.1-gcc
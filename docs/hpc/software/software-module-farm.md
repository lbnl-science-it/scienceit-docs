!!! warning "Work in progress"

    Work in progress...including updating content to match new smf on rocky8

!!! note "Software Module Farm (SMF) Service"

    For an overview of the Software Module Farm (SMF) as a service on non-Lawrencium systems, please follow [this link](https://it.lbl.gov/service/scienceit/high-performance-computing/scientific-cluster-services/software-module-farm/){:target="_blank"} {{ ext }}. In this page, we will focus on the Software Module Farm (SMF) software and their usage on the Lawrencium cluster.


The Software Module Farm provides a comprehensive and well-tested suite of software modules for Lawrencium users. Several types of software modules are available:

1. **Tools**: Tool modules are built and compiled with the default system `gcc` compiler. They have no dependencies. For the current `rocky8` operating system, the `gcc` system compiler is `gcc@8.5.0`.
3. **Core Compilers**: Other common compilers and newer versions of `gcc`; for example: `gcc@11.4.0`.
2. **Languages**: Language modules include additional compilers and interpreters for specific languages such as `python`, `R` and `julia`.
3. **Submodules**:: Submodules include libraries and packages which depend on a particular compiler or language module. Due to this dependency, submodules will only be visible once the associated language or core compiler module has been loaded. For example, `hdf5` submodule is only visible once you load `gcc` and `openmpi` modules.

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
!!! warning "Work in progress"

    Work in progress...including updating content to match new smf on rocky8

!!! note "Software Module Farm (SMF) Service"

    For an overview of the Software Module Farm (SMF) as a service on non-Lawrencium systems, please follow [this link](https://it.lbl.gov/service/scienceit/high-performance-computing/scientific-cluster-services/software-module-farm/){:target="_blank"} {{ ext }}. In this page, we will focus on the Software Module Farm (SMF) software packages and their usage on the Lawrencium cluster.


The Software Module Farm provides a comprehensive and well-tested suite of software modules for Lawrencium users. Several types of software modules are available:

1. **Tools**: Tool modules are built and compiled with the default system `gcc` compiler. They have no other dependencies. For the current `rocky8` operating system, the `gcc` system compiler is `gcc@8.5.0`.
3. **Core Compilers**: Other common compilers and newer versions of `gcc`; for example: `gcc@11.4.0`.
2. **Languages**: Language modules include additional compilers and interpreters for specific languages such as `python`, `R` and `julia`.
3. **Submodules**: Submodules include libraries and packages which depend on a particular compiler or language module. Due to this dependency, submodules will only be visible once the associated language or core compiler module has been loaded. For example, `hdf5` submodule is only visible once you load `gcc` and `openmpi` modules.

See the [Module Management](module-management.md) page for details on how to use the `module` command for module management on Lawrencium.

## Software installation by Users

Users are encouraged to install domain scientific software packages or local software module farms in their home or group space. Users don’t have admin rights, but most software can be installed with the flag `--prefix=/dir/to/your/path`.

## Tips

Many tools and bundles such as OpenMPI are compiler specific.  To find what modules is available under specific language pack, run ls on the module dir, eg:
>  ls -1 /global/software/sl-7.x86_64/modfiles/intel/2018.1.163/ antlr boost fftw hdf5 mkl nco ncview netcdf openmpi […]
 
To find all languages that have Open MPI (and their matching versions), use:
> find /global/software/sl-7.x86_64/modfiles| grep openmpi
/global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/3.0.0-intel /global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/2.0.2-intel /global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/2.1.3-intel /global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/3.0.1-intel /global/software/sl-7.x86_64/modfiles/intel/2016.4.072/openmpi/3.0.1-intel_ilp64 /global/software/sl-7.x86_64/modfiles/intel/2018.1.163/openmpi/3.0.1-intel /global/software/sl-7.x86_64/modfiles/intel/2018.1.163/openmpi/2.0.2-intel /global/software/sl-7.x86_64/modfiles/intel/2020.1.024.par/openmpi/4.1.1 /global/software/sl-7.x86_64/modfiles/intel/oneapi-2022.2/scg/openmpi/4.1.3 /global/software/sl-7.x86_64/modfiles/gcc/4.8.5/openmpi/2.0.2-gcc /global/software/sl-7.x86_64/modfiles/gcc/5.4.0/openmpi/2.0.2-gcc /global/software/sl-7.x86_64/modfiles/gcc/5.4.0/openmpi/3.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/6.3.0/openmpi/2.0.2-gcc /global/software/sl-7.x86_64/modfiles/gcc/6.3.0/openmpi/3.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/7.4.0/openmpi/4.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/7.4.0/openmpi/3.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/7.4.0/openmpi/2.0.2-gcc /global/software/sl-7.x86_64/modfiles/gcc/9.2.0/openmpi/4.0.1-gcc /global/software/sl-7.x86_64/modfiles/gcc/7.5.0/openmpi/2.1.1-gcc
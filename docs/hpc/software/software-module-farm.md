
!!! note "Software Module Farm (SMF) Service"

    For an overview of the Software Module Farm (SMF) as a service on non-Lawrencium systems, please follow [this link](https://it.lbl.gov/service/scienceit/high-performance-computing/scientific-cluster-services/software-module-farm/){:target="_blank"} {{ ext }}. In this page, we will focus on the Software Module Farm (SMF) software packages and their usage on the Lawrencium cluster.


The Software Module Farm provides a comprehensive and well-tested suite of software modules for Lawrencium users. Several types of software modules are available:

1. **Tools**: Tool modules are built and compiled with the default system `gcc` compiler. They have no other dependencies. For the current operating system, the `gcc` system compiler is `gcc 8.5.0`.
2. **Compilers**: Other common compilers and newer versions of `gcc`; for example: `gcc 11.4.0`. Many applications and libraries not found in the **Tools** are built with these compilers and can be accessed after loading the corresponding compiler.
3. **Languages**: Language modules include additional compilers and interpreters for specific languages such as `python`, `R` and `julia`.
4. **Applications**: Domain specific applications such as biology and machine learning packages.
5. **Submodules**: Submodules include libraries and packages which depend on a particular compiler or language module. Due to this dependency, submodules will only be visible once the associated language or core compiler module has been loaded. For example, `hdf5` submodule is only visible once you load `gcc` and `openmpi` modules.

See the [Module Management](module-management.md) page for details on how to use the `module` command for module management on Lawrencium.

## Software installation by Users

Users are encouraged to install domain scientific software packages or local software module farms in their home or group space. Users don’t have admin rights, but most software can be installed with the flag `--prefix=/dir/to/your/path`.

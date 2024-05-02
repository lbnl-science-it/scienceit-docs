# Using Spack on Lawrencium

!!! warning "Work in progress"

    Work in progress...Links and details on this page might change

Several of the packages provided in the software module farm to you were built using [Spack](https://spack.io){:target="_blank"} {{ ext }}. We advise users to use [modules](module-management.md) for loading and working with the software module farm. Users who want to use Spack to load packages or to install additional software available on Spack should carefully read the details provided here in addition to following the Spack documentation and tutorials.

!!! note "When to install software from Spack?"

    We provide a collection of frequently used software stack to users through our software module farm. If you need a software that is not in the software module farm but is available on Spack, you may use Spack to install it in your user, group or scratch directory. You can check if a package is available on Spack on this [website](https://packages.spack.io){:target="_blank"} {{ ext }}. In some cases, you may also want to install a software that is already available through the module farm but if you require a newer version.

## Get Spack

You can either load spack as a module or download directly from spack github repository. 

!!! note "Two ways of getting spack on Lawrencium"

    === "Load module"

        ``` bash
        module load spack
        ```


    === "Download from github"

        Clone spack from github:

        ``` bash
        git clone --branch=v0.21.1 https://github.com/spack/spack.git
        ```

        Spack v0.21.1 is the version used to install the software module farm software.

        **Setup Spack**

        The next step is to setup the spack environment as follows:

        ``` bash
        source $SPACK_ROOT/share/spack/setup-env.sh
        ```

        where `$SPACK_ROOT` is the location of your spack download; for example, if you cloned spack from github on your home directory, then `$SPACK_ROOT` in the command above is `~/spack`.

## Configure Spack chaining

To use the software already installed on the software module farm -- either to load through `spack load` or as dependencies for a new software that you may want to install -- add the following in the `~/.spack/upstreams.yaml` file (you may need to create this file if it does not exist).


``` yaml
upstreams:
  gcc-1:
    install_tree: /global/software/rocky-8.x86_64/software/gcc/18Mar24
  python-1:
    install_tree: /global/software/rocky-8.x86_64/software/python/18Mar24/3.10.12
```

## Adding compilers to Spack

To add the `gcc@8.5.0` set of compilers which comes with the `rocky-8` operating system, use the following spack command:

``` bash
spack compiler find
```

This will add the `gcc@8.5.0` compilers to `~/.spack/linux/compilers.yaml`.

To add additional compilers, use the `spack compiler find` command after loading a compiler. For example:

``` bash
spack load gcc@11.4.0
spack compiler find
```
will add the `gcc 11.4.0` compilers to your Spack. You will then be able to load packages that require these compilers and also use them to compile new packages.

You can list all the available compilers on Spack by:

``` bash
spack compiler list
```

## Listing packages

### Installed packages

To list the packages that are already installed and available to use:

``` bash
spack find
```

For a fresh download of Spack, one would expect this to produce an empty list; however, if you have configured Spack chaining correctly in the `~/.spack/upstreams.yaml` file to point to the locations where the spack-installed software module farm packages lie, then those will be listed when you run `spack find`.

To find a specific package (for example `hdf5`):

``` bash
spack find hdf5
```

might show you several versions of `hdf5` installed using different compilers. 

!!! note "Spack software specs"

    `spack find` can do a lot more; for example, if you want to find the spec of the spack installed package `hdf5` installed using `gcc@11.4.0`:

    ``` bash
    spack find -v hdf5%gcc@11.4.0
    ```

    whose output may look like:

    ``` bash
    -- linux-rocky8-x86_64 / gcc@11.4.0 -----------------------------
    hdf5@1.14.3~cxx~fortran~hl~ipo~java~map+mpi+shared~szip~threadsafe+tools api=default build_system=cmake build_type=Release generator=make
    ==> 1 installed package
    ```

    In the above spec `~fortran` indicates that the particular spec of `hdf5` was built without Fortran support and `+mpi` indicates that it was built with MPI support.

!!! info "Loading spack installed packages"

    ``` bash
    spack load <packagename>
    ```

    You can list currently loaded packages by:

    ``` bash
    spack find --loaded
    ```

### Packages available to install

To list the packages that are available on spack:

``` bash
spack list <packagename>
```

To get more information about a package on spack:

``` bash
spack info <packagename>
```

!!! note "More information"

    If you are interested in installing software through spack on lawrencium, we recommend that you go through the Basic Installation, Environments and Configuration tutorials [here](https://spack-tutorial.readthedocs.io/en/latest/){:target="_blank"} {{ ext }}. After that, please go through [this guide](install-using-spack.md). Please reach out to [hpcshelp@lbl.gov](mailto:hpcshelp@lbl.gov) for any question or help needed for spack or other software installation related issues on Lawrencium.


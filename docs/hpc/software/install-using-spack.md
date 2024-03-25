# Install software using Spack

!!! warning "Spack on Lawrencium"

    Please read the [Spack on Lawrencium](spack-on-lawrencium.md) page before continuing with this page.

## Software Availability and Variants

`spack list <packagename>` and `spack info <packagename>` are useful to check if a package is available to install through Spack and what variants/versions are possible to install.

Throughout this page, we will take `hdf5` package as an example. `hdf5` is already installed in our software module farm; in this page, we will go through the process of installing a slightly different variant and version of the `hdf5` library through Spack and also make a module for it.

Suppose you want to install an older version of `hdf5`. First check which versions are available from the output of `spack info hdf5`. Let's install verson `1.10.11`. Check whether Spack is able to concretize (i.e. solve for dependencies) using:

``` bash
spack spec hdf5@1.10.11 %gcc@11.4.0
```

If Spack is successful, you will see an output that shows the exact specs (including the compiler and other dependencies). `%gcc@11.4.0` indicates Spack which compiler we want to use to compile the `hdf5` library.

Before installing your first Spack package, you should create `~/.spack/config.yaml`, and provide the locations of where you want spack to install and build packages. An example is shown below in which the build, cache and installation is done on the scratch filesystem.

=== "config.yaml"

    ``` yaml
    config:
      install_tree:
        root: /global/scratch/users/$USER/spack-install
      build_stage:
        - /global/scratch/users/$USER/spack_temp/build
        - /global/scratch/users/$USER/spack_temp/temp
      source_cache:
        - /global/scratch/users/$USER/spack_temp/cache
      build_jobs: 4
    ```


## Install 

You can now install this different version/variant of `hdf5`:

``` bash
spack install hdf5@1.10.11 %gcc@11.4.0
```

!!! note "Variants"

    You should review the list of variants from the output of `spack info hdf5` to make sure that a feature you want is enabled. For example, whereas mpi support is enabled by default for `hdf5`, C++ support is not. So, if you want to install `hdf5` with C++ support you should add `+cxx` i.e. `spack install hdf5@1.10.11 +cxx`.

## Setting up module files

Instead of using `spack load`, it is possible to setup module files through spack for your user-installed spack packages; this allows you to use `module load` as usual. First make sure to setup the desired location for your module files: e.g. `/global/home/users/$USER/modulefiles`. This information goes in the `~/.spack/modules.yaml` file:

=== "modules.yaml"

    ``` yaml
    modules:
      default:
        enable:
          - tcl
        arch_folder: false
        roots:
          tcl: /global/home/users/$USER/modulefiles
        tcl:
          all:
            autoload: direct
          exclude_implicits: true
          hash_length: 0
          projections:
            all: '{name}/{version}'
    ```

After you install a new package through spack, use the following command to generate a module file:

``` bash
spack module tcl refresh --delete-tree
```

The `--delete-tree` option deletes the existing module tree and regenerate a new one.


To be able to import the module, you need to add the path of the modulefiles to `$MODULEPATH`, which can be done by using:

``` bash
module use /global/home/users/$USER/modulefiles
```

## Using Spack environments

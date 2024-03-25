# Using Python on Lawrencium

## Python packages

The `rocky-8` operating system in Lawrencium comes with `python@3.6.8`.

Several other python modules are available on the Lawrencium software module farm. There are two basic (with only a few additional site-packages) python versions provided. To list these python modules:

``` bash
$ module av python

-------- /global/software/rocky-8.x86_64/software/modules/latest/tcl/langs --------
   python/3.10.12-gcc-11.4.0    python/3.11.6-gcc-11.4.0 (D)

```

Additional site-packages installed in these python modules are: `numpy`, `scipy`, `matplotlib`, `mpi4py`, `h5py`,`netcdf4`, `pandas`, `geopandas`, `ipython` and `pyproj`.

## Anaconda environment

We also provide `anaconda3` python environment that has many popular scientific and numerical python libraries pre-installed. To load the `anaconda3` module:

``` bash
module load anaconda3
```

!!! note "Using a conda environment"

    TODO: Simple description and link to more details of using a conda environment

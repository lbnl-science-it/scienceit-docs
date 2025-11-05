# Using Python on Lawrencium

## Python packages

Python 2

The `rocky-8` operating system in Lawrencium has installation of `Python 3.6` and `Python 2.7`. To use these, use the command `python3` and `python2` respectively without loading other python modules.

Several Python modules are available on the Lawrencium software module farm. There are two basic (with only a few additional site-packages) python modules provided. To list these python modules:

```
$ module av python

---------- /global/software/rocky-8.x86_64/modfiles/langs ----------
   python/3.10.12-gcc-11.4.0    python/3.11.6-gcc-11.4.0 (D)

$ module load python/3.10.12
$ python
Python 3.10.12 (main, Mar 22 2024, 00:44:12) [GCC 11.4.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

To load one of these modules use: `module load python/3.10.12` or `module load python/3.11.6`. Additional site-packages installed in these python modules are: `numpy`, `scipy`, `matplotlib`, `mpi4py`, `h5py`,`netCDF4`, `pandas`, `geopandas`, `ipython` and `pyproj`.

User installation of python packages

You can use pip to install or upgrade packages.

```
python -m pip install --user $PACKAGENAME
```

to install a python package to `~/.local` directory. The package libraries are usually installed in a sub-directory for each python version; for example: `~/.local/lib/python3.10/site-packages/`.

Linear algebra backend for numpy

Please note that the linear algebra backend for `numpy` in these two python modules (`python/3.11.6` and `python/3.10.12`) is the openBLAS library.

Several Jupyter kernels are available to access `tensorflow` and `pytorch` conda environments from the [Jupyter server](../../../openondemand/jupyter-server/) on [Open OnDemand](../../../openondemand/overview/). [Click here](../../../openondemand/packages-kernels/) for more information on installing python packages and jupyter kernels for use on the Jupyter server on Open OnDemand.

## Intel Distribution of Python

Additionally the [Intel Distribution of Python (Python 3.9)](https://www.intel.com/content/www/us/en/developer/tools/oneapi/distribution-for-python.html#gs.c1qvsx) is available, and can be loaded as:

```
module load intelpython/3.9.19
```

When you load `intelpython`, `intel-oneapi-compilers` and `intel-oneapi-mpi` are also loaded because we have added `mpi4py` package linked to Intel MPI library to the Intel Distribution of Python.

## Using Dask

[Dask](https://www.dask.org/) is available in the `intelpython` module. Dask can be useful when you are working with large datasets that don't fit in the memory of a single machine. Dask implements lazy evaluation, task scheduling and data chunking that makes it useful when performing analysis on large datasets.

Dask JupyterLab Extension

Dask JupyterLab Extension can be used to manage Dask clusters and monitor it through various dashboard plots in JupyterLab panes.

To install dask-labextension once you have a python module loaded:

```
python -m pip install dask-labextension
```

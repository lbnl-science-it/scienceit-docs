# Using Python on Lawrencium

## Python packages

There are multiple variants of Python available on LRC/BRC systems. 

- System Python ( Python2/3 available from the OS. These tend to be older or legacy releases)
- Python Releases maintained by HPCS (Available with a select set of python packages) 
- Anaconda Environments


## System Python 

The `rocky-8` operating system in Lawrencium comes with `python@3.6` and `python2.7`. To use these, 
use the command `python3` and `python2` respectively. These are minimal python environemnts 



## Python (HPCS)

Other python modules are available on the Lawrencium software module farm. There are two basic (with only a few additional site-packages) python modules provided. To list these python modules:

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

Additional site-packages installed in these python modules are: `numpy`, `scipy`, `matplotlib`, `mpi4py`, `h5py`,`netCDF4`, `pandas`, `geopandas`, `ipython` and `pyproj`.

!!! note "User installation of python packages"

    You can use pip to install or upgrade packages.

    ``` bash
    python -m pip install --user $PACKAGENAME 
    ```
    to install a python package to `~/.local` directory. The package libraries are usually installed in a sub-directory for each python version; for example: `~/.local/lib/python3.10/site-packages/`

## Anaconda environment

We also provide `anaconda3` python environment that has many popular scientific and numerical python libraries pre-installed. To load the `anaconda3` module:

```
$ module load anaconda3
$ python
Python 3.11.5 (main, Sep 11 2023, 13:54:46) [GCC 11.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 
```


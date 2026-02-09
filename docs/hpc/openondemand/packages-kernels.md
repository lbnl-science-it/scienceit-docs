# Adding Packages and Kernels

## Installing Python Packages

A variety of standard Python packages (such as numpy, scipy, matplotlib and pandas) are available automatically on `miniforge3` module. To see what packages are available, open a Terminal in the [Jupyter server](jupyter-server.md) or open a Terminal on Lawrencium in the usual fashion. Then load the `miniforge3` module and list the installed packages:
``` bash
module load miniforge3/25.9.1
conda list
``` 

!!! note "pip vs python -m pip"
    To reduce potential environment mismatch (especially in the presence of multiple python installations), it is recommended to use `python -m pip` rather than `pip`.

You can use `pip` to install or upgrade packages and then use them in a Jupyter notebook, but you will need to make sure to install the new versions or additional packages in your `home` or `scratch` directories because you do not have write permissions to the module directories. You can use 

``` bash 
python -m pip install --user $PACKAGENAME 
``` 
to install the python package to `$HOME/.local`.

So, if you need to install additional packages, you can load the desired Python module and then use `pip` to install in your `home` directory. For example, you can install the `cupy` package with:


``` bash 
module load miniforge3/25.9.1
module load gcc/11.4.0
module load cuda/12.2.1
python -m pip install --user --no-cache-dir cupy-cuda12x
```

Package installed in this manner in your `$HOME/.local/lib/python3.xx` will be available to the **Python 3 (ipykernel)** jupyter kernel provided through the `miniforge3/25.9.1` module.

You can also install packages in a virtual environment or a conda environment and create a kernel associated with that environment. See examples in the next sections.


## Adding New Kernels

Jupyter supports notebooks in dozens of languages, including Python, R, and Julia. Not all of these languages or packages are supported by default in our Open OnDemand jupyter server. The ability to create custom kernels is useful if you need to create your own kernel for a language that is not supported by default or if you want to customize the environment, for example create a jupyter kernel for a virtual environment or a conda environment. 

To list the available jupyter kernels:

``` bash
jupyter kernelspec list
```

!!! example "Example: Add a kernel for a virtual environment"

    As an example, let us create a virtual environment in our `$SCRATCH` directory called `cudapython` that installs the [CUDA Python](https://nvidia.github.io/cuda-python/latest/){:target="_blank"} {{ ext }} packages.

    ``` bash
    module load miniforge3/25.9.1
    module load gcc/11.4.0 cuda/12.2.1

    cd $SCRATCH
    python -m venv ./cudapython
    source cudapython/bin/activate

    python -m pip install -U cuda-python cuda-parallel cuda-cooperative 
    python -m pip install -U cuda-core numba-cuda nvmath-python ipykernel

    python -m ipykernel install --user --name cudapython  \
                                --display-name "CUDA Python" \
                                --env PATH $PATH \
                                --env LD_LIBRARY_PATH $LD_LIBRARY_PATH
    ```

    The above command will create a `kernel.json` file in `~/.local/share/jupyter/kernels/cudapython`. You can manually edit this file to edit the paths and environment variables. The new kernel will show up on the jupyter server app on Open OnDemand. Depending on your packages and whether you had to import additional module before installing the package, you may not have to pass the `--env PATH` and `--env LD_LIBRARY_PATH` values in the command above. In this examples, the `PATH` and `LD_LIBRARY_PATH` variables exported are important because of the `cuda-python` packages make use of `cuda/12.2.1` module that we imported.

### Manually creating a new kernel

To add a new kernel to your Jupyter environment, you can also manually create a subdirectory within `$HOME/.local/share/jupyter/kernels`. Within the subdirectory, you’ll need a configuration file, `kernel.json`. Each new kernel should have its own subdirectory containing a configuration file.

As an example, below is the content of `~/.local/share/jupyter/kernels/cudapython/kernel.json` file that we just created using the `python -m ipykernel install` command in the previous section. You can create and/or edit this file as needed. Note that below we have used $SCRATCH instead of the actual path but you will need to provide the full path to your python executable. 

``` json
{
 "argv": [
  "$SCRATCH/cudapython/bin/python",
  "-m",
  "ipykernel_launcher",
  "-f",
  "{connection_file}"
 ],
 "display_name": "CUDA Python",
 "language": "python",
 "metadata": {
  "debugger": true
 },
 "env": {
  "PATH": "/location/to/path1:/location/to/path2",
  "LD_LIBRARY_PATH": "/location/to/path1:/location/to/path2"
 }
}
```

!!! note "Managing kernels for Jupyter"

    Please review the Jupyter documentation on [Managing kernels for Jupyter](https://jupyter-client.readthedocs.io/en/latest/kernels.html){:target="_blank"} {{ ext }} for more details regarding the format and contents of this configuration file. In particular, please make sure `$PATH, $LD_LIBRARY_PATH, $PYTHONPATH`, and all other environment variables that you use in the kernel are properly populated with the correct values.

### Using a conda environment

Another approach to adding a new (Python) kernel  to your Jupyter environment is to create a conda environment and add it as a kernel to Jupyter. When in Jupyter, you will then be able to select the name from the kernel list, and it will be using the packages you installed. Follow these steps to do this (replacing $ENV_NAME with the name you want to give your conda environment): 

``` bash
module load miniforge3
conda create --name=$ENV_NAME ipykernel
conda activate $ENV_NAME
python -m ipykernel install --user --name $ENV_NAME
```

From example, below we give an example of a custom python kernel in a conda environment that uses `python=3.12` and install `numpy=2.4.2` from `conda-forge` channel. Since we are using `miniforge3`, `conda-forge` is the default channel.

``` bash
module load miniforge3/25.9.1
conda create --name=numpy2test python=3.12 ipykernel
source activate numpy2test
conda install numpy=2.4.2
python -m ipykernel install --user --name numpy2 --display-name="Numpy 2.4.2 (Python 3.12)"
```  

Now you can choose the kernel you just created from the kernel list in your Jupyter environment on Open OnDemand. 

### Using apptainer images

It is also possible to create custom kernels using container images. For example, if you would like to use the NVIDIA RAPIDS docker image, first you need to convert it to an apptainer `sif` file. This can be done using `apptainer pull` command in your `scratch` directory as:

``` bash
export APPTAINER_CACHEDIR=$SCRATCH
export APPTAINER_TMPDIR=$SCRATCH

cd $SCRATCH

apptainer pull docker://nvcr.io/nvidia/rapidsai/notebooks:25.04-cuda12.8-py3.12
```

You can then manually create a `kernel.json` file in `~/.local/share/jupyter/kernels/rapids` with the following content.

``` bash
{
    "argv": [
     "apptainer",
     "exec",
     "--nv",
     "/path/to/notebooks_25.04-cuda11.8-py3.12.sif",
     "python",
     "-m",
     "ipykernel_launcher",
     "-f",
     "{connection_file}"
    ],
    "display_name": "RAPIDS 25.04 Kernel",
    "language": "python",
    "metadata": {
     "debugger": true
    }
}
```
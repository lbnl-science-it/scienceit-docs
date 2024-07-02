# Adding Packages and Kernels

## Installing Python Packages

A variety of standard Python packages (such as numpy, scipy, matplotlib and pandas) are available automatically on `anaconda3` module. To see what packages are available, open a Terminal in the [Jupyter server](jupyter-server.md) or open a Terminal on Lawrencium in the usual fashion. Then load the `anaconda3` module and list the installed packages:
``` bash
module load anaconda3
conda list
``` 

!!! note "pip vs python -m pip"
    To reduce potential environment mismatch (especially in the presence of multiple python installations), it is recommended to use `python -m pip` rather than `pip`.

You can use `pip` to install or upgrade packages and then use them in a Jupyter notebook, but you will need to make sure to install the new versions or additional packages in your `home` or `scratch` directories because you do not have write permissions to the module directories. You can use 

``` bash 
python -m pip install --user $PACKAGENAME 
``` 
to install the python package to `$HOME/.local`.

So, if you need to install additional packages, simply load the desired Python module in the usual way and then use `pip` to install in your `home` directory. For example, you can install the `cupy` package (needed in the next section) with:


``` bash 
module load anaconda3
module load gcc/11.4.0
module load cuda/12.2.1
python -m pip install --user --no-cache-dir cupy-cuda12x
```

If you would like to install packages with `conda install` you will need to create a conda environment in which to install packages and then create a kernel associated with your Conda environment as discussed in the next section.

## Adding New Kernels

Jupyter supports notebooks in dozens of languages, including Python, R, and Julia. Not all of these languages or packages are supported by default in our Open OnDemand jupyter server. The ability to create custom kernels is useful if you need to create your own kernel for a language that is not supported by default or if you want to customize the environment, for example create a jupyter kernel for a conda environment. 

<!--
If you’d like to use a language or packages not already indicated in the drop-down menu discussed in step 6 above, you can create your own kernel. You may also need to create your own kernel for a language already supported if you want to customize your environment. For example, to set UNIX environment variables (such as `$PYTHONPATH` if you have packages installed in non-standard locations) or source a script before running your notebook can be achieved by creating your own kernel. Or, if you’d like to work within a Conda environment when using your notebook, you’ll also need to create a kernel.
-->

To list the available jupyter kernels:

``` bash
jupyter kernelspec list
```

Let us create a new python kernel that can run `cupy` (which we have installed in our home directory using `pip`). To create a new jupyter kernel, with the current `PATH` and `LD_LIBRARY_PATH` variables set:

``` bash
python -m ipykernel install --user --name cupy --display-name "Cupy Kernel" \
                            --env PATH $PATH \ 
                            --env LD_LIBRARY_PATH $LD_LIBRARY_PATH
```

The above command will create a `kernel.json` file in `~/.local/share/jupyter/kernels/cupy`. You can manually edit this file to edit the paths and environment variables. The new kernel will show up on the jupyter server app on Open OnDemand. Depending on your packages and whether you had to import additional module before installing the package, you may not have to pass the `--env PATH` and `--env LD_LIBRARY_PATH` values in the command above.

### Manually creating a new kernel

To add a new kernel to your Jupyter environment, you can also manually create a subdirectory within `$HOME/.local/share/jupyter/kernels`. Within the subdirectory, you’ll need a configuration file, `kernel.json`. Each new kernel should have its own subdirectory containing a configuration file.

As an example, below is the content of `~/.local/share/jupyter/kernels/cupy/kernel.json` file that we just created using the `python -m ipykernel install` command. You can create and/or edit this file as needed; for instance, if you want to edit the `PATH` or `LD_LIBRARY_PATH` environment variables. Depending on your packages and whether you need to import a module, you may not have to e

``` json
{
 "argv": [
  "/global/software/rocky-8.x86_64/manual/modules/langs/anaconda3/2024.02-1/bin/python",
  "-m",
  "ipykernel_launcher",
  "-f",
  "{connection_file}"
 ],
 "display_name": "Cupy Kernel",
 "language": "python",
 "metadata": {
  "debugger": true
 },
 "env": {
  "PATH": "/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/cuda-12.2.1-c2hl2dx3hxmrylvdof6mjus4rfjq3d5i/bin:/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-8.5.0/gcc-11.4.0-nfcdl6bpyabpnhhasfzu6y4ge4kfskvl/bin:/global/software/rocky-8.x86_64/manual/modules/langs/anaconda3/2024.02-1/bin:/usr/share/Modules/bin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/global/home/groups/allhands/bin",
  "LD_LIBRARY_PATH": "/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/cuda-12.2.1-c2hl2dx3hxmrylvdof6mjus4rfjq3d5i/lib
64"
 }
}
```

!!! note "Managing kernels for Jupyter"

    Please review the Jupyter documentation on [Managing kernels for Jupyter](https://jupyter-client.readthedocs.io/en/latest/kernels.html){:target="_blank"} {{ ext }} for more details regarding the format and contents of this configuration file. In particular, please make sure `$PATH, $LD_LIBRARY_PATH, $PYTHONPATH`, and all other environment variables that you use in the kernel are properly populated with the correct values.

### Using a conda environment

Another approach to adding a new (Python) kernel  to your Jupyter environment is to create a conda environment and add it as a kernel to Jupyter. When in Jupyter, you will then be able to select the name from the kernel list, and it will be using the packages you installed. Follow these steps to do this (replacing $ENV_NAME with the name you want to give your conda environment): 

``` bash
module load anaconda3
conda create --name=$ENV_NAME ipykernel
conda activate $ENV_NAME
python -m ipykernel install --user --name $ENV_NAME
```

From example, below we give an example of a custom python kernel in a conda environment that uses `python=3.12` and install `numpy=2.0.0` from `conda-forge` channel. 

``` bash
module load anaconda3
conda create --name=numpy2test python=3.12 ipykernel
conda activate numpy2test
conda config --env -add channels conda-forge
conda install numpy=2.0.0
python -m ipykernel install --user --name numpy2 --display-name="Numpy v2 (Python 3.12)"
```  

Now you can choose the kernel you just created from the kernel list in your Jupyter environment on Open OnDemand. 

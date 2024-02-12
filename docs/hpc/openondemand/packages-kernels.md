# Adding Packages and Kernels

## Installing Python Packages

A variety of standard Python packages (such as numpy, scipy, matplotlib and pandas) are available automatically. To see what packages are available, open a Terminal in the [Jupyter server](jupyter-server.md) or open a Terminal on Lawrencium in the usual fashion. Then load the Python version of interest (e.g. Python 3.7) and list the installed packages:
``` bash
module load python/3.7
conda list
``` 

!!! note "pip vs python -m pip"
    To reduce potential environment mismatch (especially in the presence of multiple python installations), it is recommended to use `python -m pip` rather than `pip`.

You can use `pip` to install or upgrade packages and then use them in a Jupyter notebook, but you will need to make sure to install the new versions or additional packages in your `home` or `scratch` directories because you do not have write permissions to the module directories. You can use 

``` bash 
python -m pip install --user $PACKAGENAME 
``` 
to install the python package to `$HOME/.local`.

So, if you need to install additional packages, simply load the desired Python module in the usual way and then use `pip` to install in your `home` directory. For example for Python 3, you can install the `rpy2` package (needed in the next section) with:


``` bash 
module load python/3.7
module load r/4.0.3
python -m pip install --user rpy2
```

If you would like to install packages with `conda install` you will need to create a Conda environment in which to install packages and then create a kernel associated with your Conda environment as discussed in the next section.

## Adding New Kernels

Jupyter supports notebooks in dozens of languages, including Python, R, and Julia. Not all of these languages or packages are supported by default in our Open OnDemand jupyter server. The ability to create custom kernels is useful if you need to create your own kernel for a language that is not supported by default or if you want to customize the environment, for example create a jupyter kernel for a conda environment. We will provide some examples.

<!--
If you’d like to use a language or packages not already indicated in the drop-down menu discussed in step 6 above, you can create your own kernel. You may also need to create your own kernel for a language already supported if you want to customize your environment. For example, to set UNIX environment variables (such as `$PYTHONPATH` if you have packages installed in non-standard locations) or source a script before running your notebook can be achieved by creating your own kernel. Or, if you’d like to work within a Conda environment when using your notebook, you’ll also need to create a kernel.
-->

To list the available jupyter kernels:

``` bash
jupyter kernelspec list
```

Let us create a new python kernel that can run cupy (which we will install in our home directory using pip). To install cupy, we will use `python/3.10.10` and we will also need a `cuda` environment and a `gcc` compiler:

``` bash
module load python/3.10.10
module load cuda/12.2
module load cudnn/8.9.5
module load gcc/11.3.0

export CUDA_PATH=$CUDA_DIR
CC=gcc NVCC=nvcc python -m pip install --user --no-cache-dir cupy
```

Now to create a new jupyter kernel, with the current `PATH` and `LD_LIBRARY_PATH` variables set:

``` bash
python -m ipykernel install --user --name cupy --display-name "Cupy Kernel" \
                            --env PATH $PATH \ 
                            --env LD_LIBRARY_PATH $LD_LIBRARY_PATH
```

The above command will create a `kernel.json` file in `~/.local/share/jupyter/kernels/cupy`. You can manually edit this file to add any additional paths and environment variables. The new kernel will show up on the jupyter server app on Open OnDemand.

### Manually creating a new kernel

To add a new kernel to your Jupyter environment, you can also manually create a subdirectory within `$HOME/.local/share/jupyter/kernels`. Within the subdirectory, you’ll need a configuration file, `kernel.json`. Each new kernel should have its own subdirectory containing a configuration file.

As an example, we will create a Jupyter kernel manually that allows you to call out to R via the `rpy2` python package. We will name the subdirectory for this kernel as “python3-rpy2”. Here is an example “kernel.json” file that you can use as a template for your own configuration files. This file would be placed in `$HOME/.local/share/jupyter/kernels/python3-rpy2`. (Note that for this to work you also need to install the rpy2 package for Python 3.7 within your account as discussed above.)

``` json
{
"argv": [
       "/global/software/sl-7.x86_64/modules/langs/python/3.7/bin/python3",
       "-m",
       "ipykernel",
       "-f",
       "{connection_file}"
],
"language": "python",
"display_name": "Python 3 with rpy2",
"env": {
       "PATH" : "/global/software/sl-7.x86_64/modules/langs/r/4.0.3/bin:/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin:/global/home/groups/allhands/bin",
       "LD_LIBRARY_PATH": "/global/software/sl-7.x86_64/modules/langs/r/4.0.3/lib64/R/lib"
}
}
```

!!! note "Managing kernels for Jupyter"

    Please review the Jupyter documentation on [Managing kernels for Jupyter](https://jupyter-client.readthedocs.io/en/latest/kernels.html){:target="_blank"} {{ ext }} for more details regarding the format and contents of this configuration file. In particular, please make sure `$PATH, $LD_LIBRARY_PATH, $PYTHONPATH`, and all other environment variables that you use in the kernel are properly populated with the correct values.

### Using a conda environment

Another approach to adding a new (Python) kernel  to your Jupyter environment is to create a conda environment and add it as a kernel to Jupyter. When in Jupyter, you will then be able to select the name from the kernel list, and it will be using the packages you installed. Follow these steps to do this (replacing $ENV_NAME with the name you want to give your conda environment): 

``` bash
module load python/3.7
conda create --name=$ENV_NAME ipykernel
source activate $ENV_NAME
python -m ipykernel install --user --name $ENV_NAME
```

Here we’ll illustrate how to create your own Tensorflow kernel within a Python Jupyter environment, so that you can import and utilize the python tensorflow package from within a Jupyter notebook:

``` bash
module load python/3.7
conda create --name=tf ipykernel
source activate tf
python -m ipykernel install --user --name tf --display-name="Tensorflow"
conda install tensorflow
```  

Now you can choose the Tensorflow kernel you just created from the kernel list in your Jupyter environment, and you can verify that you can utilize and access the Python Tensorflow package from within a cell in a Jupyter notebook as follows:

``` bash
import tensorflow
```
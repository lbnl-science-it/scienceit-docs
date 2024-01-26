# Adding Packages and Kernels

## Installing Python Packages

A variety of standard Python packages (such as numpy, scipy, matplotlib and pandas) are available automatically. To see what packages are available, open a Terminal in the [Jupyter server](jupyter-server.md) or open a Terminal on Lawrencium in the usual fashion. Then load the Python version of interest (e.g. Python 3.7) and list the installed packages:
``` bash
module load python/3.7
conda list
``` 

You can use `pip` to install or upgrade packages and then use them in a Jupyter notebook, but you will need to make sure to install the new versions or additional packages in your `home` or `scratch` directories because you do not have write permissions to the module directories. You can use 

``` bash 
pip install --user $PACKAGENAME 
``` 
to install the python package to `$HOME/.local`.

So, if you need to install additional packages, simply load the desired Python module in the usual way and then use `pip` to install in your `home` directory. For example for Python 3, you can install the `rpy2` package (needed in the next section) with:


``` bash 
module load python/3.7
pip install --user rpy2
```

If you would like to install packages with `conda install` you will need to create a Conda environment in which to install packages and then create a kernel associated with your Conda environment as discussed in the next section.

## Adding New Kernels

Jupyter supports notebooks in dozens of languages, including Python, R, and Julia.

If you’d like to use a language not indicated in the drop-down menu discussed in step 6 above, you can create your own kernel. You may also need to create your own kernel for a language already supported if you want to customize your environment. For example, to set UNIX environment variables (such as `$PYTHONPATH` if you have packages installed in non-standard locations) or source a script before running your notebook can be achieved by creating your own kernel. Or, if you’d like to work within a Conda environment when using your notebook, you’ll also need to create a kernel.

### Manually creating a new kernel

To add a new kernel to your Jupyter environment, you’ll need to create a subdirectory within `$HOME/.ipython/kernels`. Within the subdirectory, you’ll need a configuration file, “kernel.json”. Each new kernel should have its own subdirectory containing a configuration file.

Here we will illustrate how to create your own IPython kernel, in this case a kernel that allows you to call out to R via the rpy2 python package. We will name the subdirectory for this kernel as “python3-rpy2”. Here is an example “kernel.json” file that you can use as a template for your own configuration files. This file would be placed in `$HOME/.ipython/kernels/python3-rpy2`. (Note that for this to work you also need to install the rpy2 package for Python 3.6 within your account as discussed just above.

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
"display_name": "Special Python 3 with rpy2",
"env": {
       "PATH" : "/global/software/sl-7.x86_64/modules/langs/r/3.4.2/bin:/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin:/global/home/groups/allhands/bin",
       "LD_LIBRARY_PATH": "/global/software/sl-7.x86_64/modules/langs/r/3.4.2/R/lib"
}
}
```

!!! note "IPython Kernel Specs"

    Please review the [IPython Kernel Specs](https://ipython.org/ipython-doc/3/development/kernels.html#kernel-specs){:target="_blank"} {{ ext }} for more details regarding the format and contents of this configuration file. In particular, please make sure `$PATH, $LD_LIBRARY_PATH, $PYTHONPATH`, and all other environment variables that you use in the kernel are properly populated with the correct values.

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
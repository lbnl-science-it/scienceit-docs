# Containerization Platform

Docker cannot be run on the cluster, as it requires root access to function. On a multi-user system like Lawrencium, this would pose a security risk. In order to safely run a container on the cluster, you may use Apptainer. This page will outline how to build a container from scratch as well as how to build one from an OCI registry.

# Prerequisites

An active allocation is required to build the container. When possible, please use an interactive session when building a container. Container builds can exceed the 30 GB cap of the $HOME directory. Redirection to scratch space may be needed before building:

Overwrite the default cache and tmp directories for Apptainer using one of the two methods described below:

* The information pulled into the $SCRATCH directory will persist after the job is complete, so use the following method if that is a necessity. Keep note that $SCRATCH and $HOME are network storage that is accessible from anywhere on the cluster, making it rather slow. Run the commands below to pull to $SCRATCH: 
    ```shell 
    mkdir $SCRATCH/APPTAINER_TMPDIR $SCRATCH/APPTAINER_CACHEDIR
    export APPTAINER_TMPDIR=$SCRATCH/APPTAINER_TMPDIR
    export APPTAINER_CACHEDIR=$SCRATCH/APPTAINER_CACHEDIR 
    ```

* If information does not need to persist, use the disk storage allocated to each compute node under the `/tmp` directory. Pulling data onto these disks will be much faster than using `$SCRATCH`; however, keep in mind that any data written to this storage will be wiped after job completion. Run the following commands to pull data to `/tmp`:
    ```shell
    mkdir /tmp/APPTAINER_TMPDIR /tmp/APPTAINER_CACHEDIR
    export APPTAINER_TMPDIR=/tmp/APPTAINER_TMPDIR
    export APPTAINER_CACHEDIR=/tmp/APPTAINER_CACHEDIR
    ```

# Pulling a Container from an OCI (Open Container Initiative) registry

For this demonstration, the image will be pulled from Nvidia’s registry, nvcr.io. The image path being used in this example is:

    nvcr.io/nvidia/pytorch:26.07-py3

To pull this image, run:
```shell
apptainer pull pytorch.sif docker://nvcr.io/nvidia/pytorch:26.07-py3
```
Here is the template for the build command (when building from an OCI registry):
```shell
apptainer pull [name].sif docker://[image path]
```

### Target variances
The beginning of the URI in the template (docker://)  will change if the image is not being built from an OCI registry. Find the list of other targets and methods of building them [here](https://apptainer.org/docs/user/latest/build_a_container.html).

### Building for a Different Architecture
By default, `apptainer pull` will construct a container that matches the host system’s architecture. The `--arch` option can be used to build for another CPU architecture.

Example of building for an arm64 host: 
```shell
apptainer pull --arch arm64 [name].sif docker://[image path]
```
# Creating an Image and Pushing to a Registry (Docker)

This section assumes that you already have a Dockerfile for your image, as well as an account with DockerHub.

Assuming that your Dockerfile is in your current working directory, follow these commands to create and push image (Make sure you do this part on your device and not on the cluster):
```shell
docker login --username=my_username
docker build -t my_tagname .
docker tag my_tagname my_username/name_of_image:0.1  
docker push my_username/name_of_image
```
Now that the image has been pushed to the registry (DockerHub), simply follow the previous section's instructions to pull the image onto the cluster. In this case, after logging on to a compute node, simply run:
```shell
apptainer pull image_name.sif docker://my_username/name_of_image:0.1

```
# Building a Container from Scratch
## Definition File
There are millions of different images available on OCI registries; however, it often will be the case that an image doesn't match your exact specifications. In the case where fine-tuning is needed, you must create the container from a definition file. The Apptainer definition file has two parts:

Templates are given below the example snippets.

### Header
The header specifies the core operating system of the build, allowing for fine-tuning on aspects like the OS version and packages to be installed.

The header will always include the keyword `Bootstrap` at the very top of the file. There are several bootstrap agents to choose from, but this example will focus on the `docker` bootstrap agent, which allows pulling of docker layers to create a base image.

```shell
Bootstrap: docker
From: nvcr.io/nvidia/pytorch:26.07-py3
```

``` shell
Bootstrap: [bootstrap agent]
From: [registry]/[namespace]/[container]:[tag]@[digest]
```
Different bootstrap agents will have different keywords. For the Docker boostrap agent, the `From` is a mandatory keyword that sets the base image.

`registry` is optional and will by default direct to docker hub. `namespace` is optional and will default to `library`. `tag` is also optional and will default to `latest`. 

### Sections
The remaining portion of the definition file is populated by sections. Sections are optional and more than one instance of a particular section may exist within the definition file. Each section begins with `%` followed by the name of the section.

Here is the example definition file that makes use of all available sections:

```shell
Bootstrap: docker
From: nvcr.io/nvidia/pytorch:{{ VERSION }}

%arguments
    VERSION=26.07-py3
%setup
    touch /file1
    touch ${APPTAINER_ROOTFS}/file2

%files
    /file1 /opt/file1

%environment
    export LISTEN_PORT=12345
    export LC_ALL=C

%post
    apt-get update && apt-get install -y netcat
    pip install --no-cache-dir wandb
    NOW=`date`
    echo "export NOW=\"${NOW}\"" >> $APPTAINER_ENVIRONMENT

%runscript
    echo "Container was created $NOW"
    echo "Arguments received: $*"
    exec python "$@"

%startscript
    nc -lp $LISTEN_PORT

%test
    grep -q "PyTorch" /opt/nvidia/nvidia_entrypoint.sh || python -c  "import torch; print(torch.__version__)"

%labels
    Author your_username@lbl.gov
    Version v0.0.1
    Base nvcr.io/nvidia/pytorch:26.07-py3

%help
    This container is based on NVIDIAs NGC PyTorch image (26.07-py3),
    with netcat and wandb added. Run a script with:
    apptainer run pytorch-full.sif my_script.py
```
[Breakdown of sections](https://apptainer.org/docs/user/latest/definition_files.html#sections)
## Building from the Definition File
With the definition file created, all that's left is to build the image. 

```shell
apptainer build pytorch.sif /Users/Bob/documents/pytorch.def
```

```shell
apptainer build [name].sif [path to def file]
```
### About Fakeroot
The fakeroot feature `-f` or `--fakeroot`, which allows root emulation, is not used above, as it is already implied for an unprivileged user.


# Running and Interacting with a Container

There are three main ways to run apptainer containers:

Command templates are given below the example snippets.

**`apptainer exec`**: run a single command inside the container and exit:
```shell
apptainer exec pytorch.sif python -c "import torch; print(torch.cuda.is_available())"
```
```
apptainer exec [container] [command]
```

**`apptainer shell`**: drop into an interactive shell inside the container:
```shell
apptainer shell pytorch.sif
```
```
apptainer shell [container]
```

**`apptainer run`**: execute the container's default runscript (if it has one):
```shell
apptainer run pytorch.sif
```
```
apptainer run [container]
```

### Creating an Instance
Using `exec` `shell` or `run` allows for a quick one-time interaction where the container is stopped after execution. To keep a container running in the background, you must start an instance.

Here is the template to do so:
```shell
apptainer instance start [image name].sif [instance name]
```

### GPU access

If GPU access is needed, make sure to use `--nv`, to bind in the host's NVIDIA driver and libraries:
```shell
apptainer exec --nv pytorch.sif python -c "import torch; print(torch.cuda.is_available())"
```

In this example, without `--nv`, `torch.cuda.is_available()`
returns `False` even on a GPU node.

## Running Container on a GPU or CPU
In order to run the container specifically on a GPU or CPU, a batch script with the appropriate specifications must be submitted via `sbatch`.

### CPU Job
Here is an example of a batch script for a CPU job:
```shell
#!/bin/bash
#SBATCH --job-name=cpu_job
#SBATCH --partition=lr8
#SBATCH --account=[account_name]
#SBATCH --qos=lr8_normal
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=4
#SBATCH --time=02:00:00
#SBATCH --output=cpu_job_%j.log

apptainer exec pytorch.sif python script.py
```
Note that the partition specified is part of the CPU cluster. Make sure the exact specifications are identified for your particular job.

Submit with:
```shell
sbatch cpu_job.sh
```

### GPU Job

For a GPU job, request a GPU-enabled partition and add `--gres=gpu:[type]:[count]`. Inside the container call, include `--nv` so the container can see the host's driver:

Here is an example of a batch script for a GPU job:
``` shell
#!/bin/bash
#SBATCH --job-name=gpu_job
#SBATCH --partition=es1
#SBATCH --account=ac_scsguest
#SBATCH --qos=es_normal
#SBATCH --gres=gpu:A40:1
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=16
#SBATCH --time=02:00:00
#SBATCH --output=gpu_job_%j.log

apptainer exec --nv pytorch.sif python -c "import torch; print(torch.cuda.is_available())"
```

Similarly, submit with:
```shell
sbatch gpu_job.sh
```
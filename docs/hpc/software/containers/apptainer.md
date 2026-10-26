# Containers with Apptainer

[Apptainer](https://apptainer.org/docs/user/latest/){:target="_blank"} {{ ext }} lets you run containers on Lawrencium without root privileges. This page covers pulling images from a container registry, building your own image from a definition file, and running containers interactively and in batch jobs.

!!! info "Why not Docker?"
    Docker requires root access, which is a security risk on a shared, multi-user system like Lawrencium, so it is not available on the cluster. Apptainer can run most Docker images directly.

## Prerequisites

You need an active allocation to build or pull containers. Build containers inside an [interactive job](../../running/slurm-overview.md), not on a login node. Inside a Slurm job, Apptainer's temporary and cache directories (`APPTAINER_TMPDIR` and `APPTAINER_CACHEDIR`) already default to the compute node's fast local `/tmp`, so no extra setup is needed.

!!! note "Running Apptainer on a login node"
    On a login node, container builds can fill up the limited `/tmp` quota. Before building or pulling, point Apptainer's temporary and cache directories to `$SCRATCH`:

    ```shell
    mkdir -p $SCRATCH/apptainer/tmp $SCRATCH/apptainer/cache
    export APPTAINER_TMPDIR=$SCRATCH/apptainer/tmp
    export APPTAINER_CACHEDIR=$SCRATCH/apptainer/cache
    ```

## Pulling a Container from an OCI Registry

Use `apptainer pull` to download an image from an OCI (Open Container Initiative) registry, such as Docker Hub or NVIDIA's `nvcr.io`, and convert it to an Apptainer image (`.sif` file):

```shell
apptainer pull [name].sif docker://[image path]
```

For example, to pull NVIDIA's PyTorch image:

```shell
apptainer pull pytorch.sif docker://nvcr.io/nvidia/pytorch:26.07-py3
```

### Other Image Sources

The `docker://` prefix tells Apptainer to pull from an OCI registry. Other prefixes, such as `library://` and `oras://`, pull from other sources. See [Build a Container](https://apptainer.org/docs/user/latest/build_a_container.html){:target="_blank"} {{ ext }} in the Apptainer documentation for the full list.

### Pulling for a Different Architecture

By default, `apptainer pull` fetches the image for the host's CPU architecture. Use `--arch` to fetch an image for another architecture:

```shell
apptainer pull --arch arm64 [name].sif docker://[image path]
```

!!! note
    Lawrencium compute nodes are x86_64 (`amd64`). An `arm64` image will not run on them.

## Using Your Own Docker Image

If you already have a Dockerfile, you can build the image on your own computer, push it to a registry such as Docker Hub, and then pull it onto the cluster.

!!! note "Run the Docker steps on your own computer, not on the cluster"

From the directory containing your Dockerfile, build and push the image:

```shell
docker login --username=my_username
docker build --platform linux/amd64 -t my_username/name_of_image:0.1 .
docker push my_username/name_of_image:0.1
```

!!! warning "Apple Silicon Macs"
    Without `--platform linux/amd64`, Docker on an Apple Silicon (M-series) Mac builds an `arm64` image, which will not run on Lawrencium.

Then, from a compute node on the cluster, pull the image:

```shell
apptainer pull name_of_image.sif docker://my_username/name_of_image:0.1
```

## Building a Container from a Definition File

When no existing image matches your needs, write an Apptainer definition file (`.def`) that starts from a base image and adds your customizations. A definition file has two parts: a **header** and **sections**.

### Header

The header sets the base image. It always begins with the `Bootstrap` keyword, which selects the bootstrap agent. This page uses the `docker` agent, which builds from an image in an OCI registry:

```
Bootstrap: docker
From: nvcr.io/nvidia/pytorch:26.07-py3
```

For the `docker` agent, `From` is required and has the form:

```
From: [registry]/[namespace]/[container]:[tag]@[digest]
```

Only `container` is required. `registry` defaults to Docker Hub, `namespace` defaults to `library`, and `tag` defaults to `latest`. Other bootstrap agents use different keywords.

### Sections

The rest of the file consists of optional sections. Each one begins with `%` followed by the section name, and a section can appear more than once. See [Sections](https://apptainer.org/docs/user/latest/definition_files.html#sections){:target="_blank"} {{ ext }} in the Apptainer documentation for what each section does.

??? example "Example definition file using the most common sections"
    This example copies `my_script.py` from the build directory into the image, so keep the definition file and `my_script.py` in the same directory and run `apptainer build` from there.

    ```
    Bootstrap: docker
    From: nvcr.io/nvidia/pytorch:{{ VERSION }}

    %arguments
        VERSION=26.07-py3

    %files
        my_script.py /opt/my_script.py

    %environment
        export LISTEN_PORT=12345
        export LC_ALL=C

    %post
        apt-get update && apt-get install -y netcat-openbsd
        pip install --no-cache-dir wandb
        NOW=`date`
        echo "export NOW=\"${NOW}\"" >> $APPTAINER_ENVIRONMENT

    %runscript
        echo "Container was created $NOW"
        echo "Arguments received: $*"
        exec python "$@"

    %startscript
        nc -l $LISTEN_PORT

    %test
        python -c "import torch; print(torch.__version__)"

    %labels
        Author your_username@lbl.gov
        Version v0.0.1
        Base nvcr.io/nvidia/pytorch:26.07-py3

    %help
        This container is based on NVIDIA's NGC PyTorch image (26.07-py3),
        with netcat and wandb added. Run a script with:
        apptainer run pytorch.sif /opt/my_script.py
    ```

### Building the Image

Build the image with `apptainer build [name].sif [definition file]`. For example:

```shell
apptainer build pytorch.sif pytorch.def
```

!!! note "No `--fakeroot` needed"
    Apptainer's fakeroot mode (`-f` or `--fakeroot`), which emulates root inside the build, is used automatically when an unprivileged user runs `apptainer build`, so you don't need to add it.

## Running a Container

There are three main ways to run a container:

| Command | What it does | Syntax |
| ------- | ------------ | ------ |
| `apptainer exec` | Runs a single command inside the container, then exits | `apptainer exec [container] [command]` |
| `apptainer shell` | Opens an interactive shell inside the container | `apptainer shell [container]` |
| `apptainer run` | Runs the container's default runscript (`%runscript`), if it has one | `apptainer run [container]` |

For example:

```shell
apptainer exec pytorch.sif python -c "import torch; print(torch.__version__)"
apptainer shell pytorch.sif
apptainer run pytorch.sif my_script.py
```

### GPU Access

To use GPUs, add `--nv`. This makes the host's NVIDIA driver and libraries available inside the container:

```shell
apptainer exec --nv pytorch.sif python -c "import torch; print(torch.cuda.is_available())"
```

!!! tip "Don't forget `--nv`"
    Without `--nv`, `torch.cuda.is_available()` returns `False`, even on a GPU node.

### Running an Instance in the Background

`exec`, `shell` and `run` stop the container when the command finishes. To keep a container running in the background (for example, to run a service defined in `%startscript`), start an instance:

```shell
apptainer instance start pytorch.sif my_instance     # start the instance
apptainer instance list                              # list running instances
apptainer exec instance://my_instance [command]      # run a command in it
apptainer instance stop my_instance                  # stop it
```

!!! note
    Instances stop when the job that started them ends.

## Running a Container in a Batch Job

To run a container non-interactively, put the `apptainer` command in a Slurm batch script. Save one of the scripts below (for example as `cpu_job.sh` or `gpu_job.sh`), adjust the account, partition and resources for your job, and submit it with `sbatch`.

=== "CPU job"

    This example uses the `lr8` partition on the Lawrencium CPU cluster.

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

    apptainer exec pytorch.sif python my_script.py
    ```

    ```shell
    sbatch cpu_job.sh
    ```

=== "GPU job"

    Request a GPU partition and GPUs with `--gres=gpu:[type]:[count]`, and add `--nv` to the `apptainer` command. Each GPU partition requires a specific CPU-to-GPU ratio. See the [Einsteinium GPU cluster](../../systems/einsteinium.md) page for the correct values.

    ```shell
    #!/bin/bash
    #SBATCH --job-name=gpu_job
    #SBATCH --partition=es1
    #SBATCH --account=[account_name]
    #SBATCH --qos=es_normal
    #SBATCH --gres=gpu:A40:1
    #SBATCH --nodes=1
    #SBATCH --ntasks=1
    #SBATCH --cpus-per-task=16
    #SBATCH --time=02:00:00
    #SBATCH --output=gpu_job_%j.log

    apptainer exec --nv pytorch.sif python -c "import torch; print(torch.cuda.is_available())"
    ```

    ```shell
    sbatch gpu_job.sh
    ```

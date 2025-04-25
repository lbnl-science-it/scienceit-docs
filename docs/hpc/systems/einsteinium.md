# Einsteinium GPU Cluster

Einsteinium is an institutional GPU cluster that was deployed to meet the growing computational demand for researchers doing machine learning and deep learning. The system is named after the chemical element with symbol `Es` and atomic number 99 which was discovered at Lawrence Berkeley National Laboratory in 1952 and in honor of Albert Einstein who developed the theory of relativity.

## `es1` Partition
`es1` is a partition consisting of multiple GPU node types to address the different research needs. These include:

| Accelerator | Nodes | GPUs per Node/GPU Memory | CPU Processor | CPU Cores | CPU RAM | Infiniband |
| ----------- | ----- | ------------------ --------------------| ----- | ----- | ------ | ----------- |
| NVIDIA H100 |  5 | 8x 80 GB | Intel Xeon Platinum 8480+    | 112 | 1 TB | NDR |
| NVIDIA A100 |  1 | 4x 80 GB | AMD EPYC 7713     | 64 | 512 GB | HDR |
| NVIDIA A40 |  30 | 4x 48 GB |AMD EPYC 7742        | 64    | 512 GB | FDR        |
| NVIDIA GRTX8000 |  1  | 4x 48 GB | AMD EPYC 7713     | 64 | 512 GB | HDR |
| NVIDIA V100 |  15 | 2x 32 GB | Intel Xeon E5-2623   | 8     | 64GB or 192GB   | FDR        | 

!!! note "H100 and CBORG"

    Currently, we have five NVIDIA H100 nodes in our datacenter, four of which are available to users through slurm. One H100 node (8 GPUs) is used for LLM inference by [CBORG](http://cborg.lbl.gov){:target="_blank"} {{ ext }}.

### How to specify desired GPU card(s)
Due to hardware configuation, special attention is needed to ensure the ratio of CPU-core# to GPU#

Examples:

* Request one V100 card: `--cpus-per-task=4 --gres=gpu:V100:1 --ntasks=1`  
* Request two A40 cards: `--cpus-per-task=16 --gres=gpu:A40:2 --ntasks=2`
* Request three H100 cards: `--cpus-per-task=14 --gres=gpu:H100:3 --ntasks=3`  
* Request one A100 cards: `--cpus-per-task=16 --gres=gpu:A100:1 --ntasks=1`  
* Request four GRTX8000 cards: `--cpus-per-task=16 --gres==gpu:GRTX8000:4 --ntasks=4` 

!!! example "Example slurm script on `es1`"

    Here is an example slurm script that requests one NVIDIA A40 GPU card.
    === "Single GPU on a A40 node"
        ``` bash
        #!/bin/bash
        #SBATCH --job-name=test
        #SBATCH --account=account_name
        #SBATCH --partition=es1
        #SBATCH --qos=es_normal
        #SBATCH --nodes=1
        #SBATCH --ntasks=1
        #SBATCH --cpus-per-task=16
        #SBATCH --gres=gpu:A40:1
        #SBATCH --time=1:00:00

        module load ml/pytorch
        python train.py
        ```
    === "4 GPUs on a H100 node"
        ``` bash
        #!/bin/bash
        #SBATCH --job-name=test
        #SBATCH --account=account_name
        #SBATCH --partition=es1
        #SBATCH --qos=es_normal
        #SBATCH --nodes=1
        #SBATCH --ntasks=4
        #SBATCH --cpus-per-task=14
        #SBATCH --gres=gpu:H100:4
        #SBATCH --time=1:00:00

        module load ml/pytorch
        python train.py
        ```

## `es0` Partition
`es0` is a partition with NVIDIA 2080 TI GPUs that do not incur [Service Unit (SU) charges](../index.md#gpu-partitions-recharge-rates).

| Accelerator | Nodes | GPUs per Node/GPU Memory | CPU Processor | CPU Cores | CPU RAM | Infiniband |
| ----------- | ----- | ------------------ --------------------| ----- | ----- | ------ | ----------- |
| NVIDIA 2080TI |  12 | 4x 11 GB | Intel Xeon Silver 4212 | 8   | 96GB   | FDR        | 

!!! example "Example slurm script on `es0`"

    === "Single GPU"
        ``` bash
        #!/bin/bash
        #SBATCH --job-name=testes0
        #SBATCH --account=account_name
        #SBATCH --partition=es0
        #SBATCH --qos=es_normal
        #SBATCH --nodes=1
        #SBATCH --ntasks=1
        #SBATCH --cpus-per-task=2
        #SBATCH --gres=gpu:1
        #SBATCH --time=1:00:00

        module load ml/pytorch
        python train.py
        ```
    === "Four GPUs on a node"
        ``` bash
        #!/bin/bash
        #SBATCH --job-name=testes0
        #SBATCH --account=account_name
        #SBATCH --partition=es0
        #SBATCH --qos=es_normal
        #SBATCH --nodes=1
        #SBATCH --ntasks=4
        #SBATCH --cpus-per-task=2
        #SBATCH --gres=gpu:4
        #SBATCH --time=1:00:00

        module load ml/pytorch
        python train.py
        ```
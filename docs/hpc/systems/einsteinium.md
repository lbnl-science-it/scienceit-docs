# Es1 (Einsteinium) GPU Cluster

Es1 or Einsteinium is an institutional GPU cluster that was deployed to meet the growing computational demand for researchers doing machine learning and deep learning. The system is named after the chemical element with symbol `Es` and atomic number 99 which was discovered at Lawrence Berkeley National Laboratory in 1952 and in honor of Albert Einstein who developed the theory of relativity.

Es1 is a partition consisting of multiple GPU node types to address the different research needs. These include:


| Partition | Accelerator | Nodes | GPU Cards per Node | Memory per GPU Card | CPU   | Cores | Memory | Infiniband |
| --------- | ----------- | ----- | ------------------ | --------------------| ----- | ----- | ------ | ----------- |
| es1       | NVIDIA V100 | 15 | 2 | 32 GB | Intel Xeon E5-2623   | 8     | 64GB/192GB   | FDR        | 
|           | NVIDIA 2080TI | 12 | 4 | 11 GB | Intel Xeon Silver 4212 | 8   | 96GB   | FDR        | 
|           | NVIDIA A40 |  30 | 4 | 48 GB |AMD EPYC 7742        | 64    | 512 GB | FDR        |
|           | NVIDIA A100 | 1  | 4 | 80 GB | AMD EPYC 7713     | 64 | 512 GB | NDR |
|           | NVIDIA H100 | 3  | 8 | 80 GB | Intel Xeon Platinum 8480+    | 112 | 1 TB | NDR |

!!! note "H100 and CBORG"

    Currently, we have 3 NVIDIA H100 nodes in our datacenter but only 2 are available on slurm to users. One H100 node (8 GPUs) is used for LLM inference by [CBORG](http://cborg.lbl.gov){:target="_blank"} {{ ext }}.

## How to specify desired GPU card(s)
Due to hardware configuation, special attention is needed to ensure the ratio of CPU-core# to GPU#

Examples:

* Request one V100 card: `--cpus-per-task=4 --gres=gpu:V100:1 --ntasks 1`  
* Request two A40 cards: `--cpus-per-task=16 --gres=gpu:A40:2 --ntasks 2`
* Request three H100 cards: `--cpus-per-task=14 --gres=gpu:H100:3 --ntasks 3`  
* Request one A100 cards: `--cpus-per-task=16 --gres=gpu:A100:1 --ntasks 1`  

## Example slurm script 

Here is an example slurm script that requests one NVIDIA A40 GPU card.

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

# Tensorflow

## Loading Tensorflow

``` bash
module load ml/tensorflow
```

!!! note "Tensorflow versions"

    Use `module spider tensorflow` to get information on the versions of pytorch available as modules.

`module load ml/tensorflow` will load other dependent modules such as `cuda`.

If you use jupyter server on [lrc-openondemand](../../openondemand/overview.md), tensorflow kernels `tf 2.15.0` ard `tf 2.14.0` are available.  

## Example SLURM script
The follow SLURM script shows how to run a tensorflow script on 1 H100 GPU card.
``` bash
#!/bin/bash
#SBATCH --job-name="TensorFlowCIFAR10"
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=14
#SBATCH --output=tf_job.out
#SBATCH --error=tf_job.err
#SBATCH --time=0:40:0
#SBATCH --partition=es1
#SBATCH --account=<ACCOUNT_NAME>
#SBATCH --qos=es_normal
#SBATCH --gres=gpu:H100:1

module load ml/tensorflow
srun python cifar10.py
```
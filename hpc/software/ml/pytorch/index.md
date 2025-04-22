# PyTorch

## Loading PyTorch

```
module load ml/pytorch

```

PyTorch versions

Use `module spider pytorch` to get information on the versions of pytorch available as modules.

`module load ml/pytorch` will additionally load other dependent modules such as `cuda`.

If you use jupyter server on [lrc-openondemand](../../../openondemand/overview/), pytorch kernels `torch 2.0.1` ard `torch 2.3.1` are available.

## Multi-GPU jobs

A sample for a multi-GPU PyTorch code can be found on the [Distributed PyTorch tutorial](https://github.com/pytorch/examples/tree/main/distributed/ddp-tutorial-series) examples on github. The SLURM script provided in the pytorch examples folder can be adapted to run on our cluster. The SLURM script provided below runs the `multinode.py` pytorch script on four A40 GPU cards distributed over two nodes:

```
#SBATCH --job-name=ddp_on_A40
#SBATCH --partition=es1
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=1
#SBATCH --cpus-per-task=4
#SBATCH --account=<ACCOUNT_NAME>
#SBATCH --time=01:00:00
#SBATCH --qos=es_normal
#SBATCH --gres=gpu:A40:2

module load ml/pytorch

allocated_nodes=$(scontrol show hostname $SLURM_JOB_NODELIST)
nodes=${allocated_nodes//$'\n'/ }
nodes_array=($nodes)
head_node=${nodes_array[0]}

echo Head Node: $head_node
echo Node List: $nodes

srun torchrun --nnodes 2 \
              --nproc_per_node 2 \
              --rdzv_id $RANDOM \
              --rdzv_backend c10d \
              --rdzv_endpoint $head_node:29500 \
              $cwd/multinode.py 500 10

```

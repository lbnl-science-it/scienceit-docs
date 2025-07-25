# PyTorch

## Loading PyTorch

``` bash
module load ml/pytorch
```

!!! note "PyTorch versions"

    Use `module spider pytorch` to get information on the versions of pytorch available as modules.

`module load ml/pytorch` will additionally load other dependent modules such as `cuda`.

If you use jupyter server on [lrc-openondemand](../../openondemand/overview.md), pytorch kernels `torch 2.0.1` ard `torch 2.3.1` are available.  

## Multi-GPU jobs

A sample for a multi-GPU PyTorch code can be found on the [Distributed PyTorch tutorial](https://github.com/pytorch/examples/tree/main/distributed/ddp-tutorial-series){:target="_blank"} {{ ext }} examples on github. The SLURM script provided in the pytorch examples folder can be adapted to run on our cluster. The SLURM script provided below runs the `multinode.py` pytorch script on four A40 GPU cards distributed over two nodes:

``` bash title="multinode_torchrun_es1.sh"
#SBATCH --job-name=ddp_on_A40
#SBATCH --partition=es1
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=1
#SBATCH --cpus-per-task=32
#SBATCH --account=<ACCOUNT_NAME>
#SBATCH --time=01:00:00
#SBATCH --qos=es_normal
#SBATCH --gres=gpu:A40:2

module load ml/pytorch/2.3.1

export OMP_NUM_THREADS=1

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
              multinode.py 500 10
```

In the script above, if the port `29500` is not free, then the script may not work. It is possible to use the following python script to get a port that is free:

```python title="get_open_port.py"
import socket

def get_free_tcp_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

free_port = get_free_tcp_port()
print(f"{free_port}")
```

and use it in the slurm script as follows (4 nodes on `es0` partition):

```bash title="multinode_torchrun_es0.sh"
#!/bin/bash
#SBATCH --job-name=testes0
#SBATCH --account=<ACCOUNT>
#SBATCH --qos=es_normal
#SBATCH --partition=es0
#SBATCH --nodes=4
#SBATCH --cpus-per-task=4
#SBATCH --ntasks-per-node=1
#SBATCH --gres=gpu:2
#SBATCH --time=1:00:00

module load ml/pytorch/2.3.1

export OMP_NUM_THREADS=1

allocated_nodes=$(scontrol show hostname $SLURM_JOB_NODELIST)
nodes=${allocated_nodes//$'\n'/ }
nodes_array=($nodes)
head_node=${nodes_array[0]}
port=$(srun --nodes=1 --ntasks=1 -w "$head_node" python get_open_port.py)

echo Head Node: $head_node
echo Node List: $nodes
echo port: $port

srun torchrun --nnodes 4 \
              --nproc_per_node 2 \
              --rdzv_id $RANDOM \
              --rdzv_backend c10d \
              --rdzv_endpoint $head_node:$port \
              multinode.py 500 10
```

Please take look at the `multinode.py` in [pytorch examples](https://github.com/pytorch/examples/tree/main/distributed/ddp-tutorial-series){:target="_blank"} {{ ext }} and [torchrun docs](https://docs.pytorch.org/docs/stable/elastic/run.html){:target="_blank"} {{ ext }} for more information.
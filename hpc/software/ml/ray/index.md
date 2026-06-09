# Ray on Lawrencium

[Ray](https://docs.ray.io/en/latest/index.html) enables parallel and distributed execution of Python functions and applications across multiple nodes, making it useful for machine learning, data processing and other such workloads.

A Ray module is available on Lawrencium.

## Loading Ray on Lawrencium

```
module load ml/ray/2.54.1
```

This ray module includes Ray Core, Ray Train, Ray Tune, Ray Serve and Ray RLlib components. In addition, the python environment for Ray includes `PyTorch 2.10` and `torchvision 0.25`.

Ray Cluster Open OnDemand App

We have a Ray Cluster OOD application that you can use to lauch a Ray cluster (one or more nodes) through [Open OnDemand](https://lrc-ondemand.lbl.gov) . It is available under `Interactive Apps > Servers > Ray Cluster`. This OOD application requests nodes exclusively which means that the nodes allocated to this application are not shared with other jobs/users.

Once the application is launched, you can open a Jupyter Lab session to run your Ray python scripts either through the notebook interface or through the terminal on the jupyter lab session.

You can also open the Ray Dashboard to monitor resource usage of the Ray cluster.

## Example: Running a Ray Job with SLURM

The following example launches a Ray cluster across two nodes in the `lr6` (exclusive) partition. Since Ray is designed to manage all resources on a node, use an exclusive partition when possible. Otherwise, request the full node in your SLURM script with `--exclusive` and `--mem=0`.

submit-ray-lr6.sh

```
#!/bin/bash

#SBATCH --job-name=ray-pi
#SBATCH --partition=lr6
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=1
#SBATCH --account=<account_name>
#SBATCH --time=00:30:00
#SBATCH --qos=lr_normal
#SBATCH --output=ray-pi-%j.out
#SBATCH --error=ray-pi-%j.err

module load ml/ray/2.54.1

# Ray head node initialization
head_node=$(hostname)
head_node_ip=$(hostname --ip-address)

port=6379
echo "Starting Ray head node on $head_node with IP $head_node_ip"
srun -n 1 --nodes=1 -w ${head_node} \
    ray start --head \
              --port=${port} \
              --node-ip-address=${head_node_ip} \
              --block &

sleep 5

echo "Give Ray time to initialize"
# increase the sleep time if needed to ensure ray is properly initialized
sleep 15 

export RAY_ADDRESS=${head_node_ip}:${port}

# Ray worker node(s) initialization
n_workers=$((SLURM_JOB_NUM_NODES - 1))

if [ "$n_workers" -gt 0 ]; then
    echo "Launching $n_workers worker nodes..."
    sleep 10
    srun -n $n_workers --nodes=$n_workers \
         --ntasks-per-node=1 \
         --exclude=$head_node \
         ray start --address=${head_node_ip}:${port} --block &
fi

# Run your ray python code here
python compute_pi.py

exit
```

A sample `compute_pi.py` python script is shown below to verify that the Ray cluster is working. The python script is adapted from an example in the [ray documentation](https://docs.ray.io/en/latest/ray-core/examples/highly_parallel.html).

compute_pi.py

```
import ray
import random
import time
import math
from fractions import Fraction

ray.init(address='auto')

@ray.remote
def pi4_sample(sample_count):
    """pi4 sample runs sample_count experiments, and returns the
    fraction of time it was inside the circle.
    """
    in_count = 0
    for i in range(sample_count):
        x = random.random()
        y = random.random()
        if x*x + y*y <= 1:
            in_count += 1
    return Fraction(in_count, sample_count)

SAMPLE_COUNT = 1000 * 1000

FULL_SAMPLE_COUNT = 100 * 1000 * 1000 * 1000 # 100 billion samples!
BATCHES = int(FULL_SAMPLE_COUNT / SAMPLE_COUNT)
print(f'Doing {BATCHES} batches')
start = time.time()
results = []
for _ in range(BATCHES):
    results.append(pi4_sample.remote(sample_count = SAMPLE_COUNT))
output = ray.get(results)
end = time.time()
dur = end - start
print(f'Running {FULL_SAMPLE_COUNT} tests took {dur} seconds')

pi = sum(output)*4/len(output)
print(float(pi))
print (abs(pi-math.pi)/pi)
```

## Adding Worker Nodes to a Running Ray Cluster

If you need more compute resources than you anticipated when you started a Ray cluster, you can add worker nodes to a Ray cluster. We will walk through how to do this to a Ray cluster that was started through Open OnDemand.

#### Step 1: Get the Ray cluster details

From the OOD Ray cluster app, open a terminal in JupyterLab and run the following commands to retrieve the following values:

```
echo $RAY_ADDRESS
more $RAY_AUTH_TOKEN_PATH
```

You will need these values in the Slurm script to add a new worker node.

#### Step 2: Submit a worker node job

add-ray-worker.sh

```
#!/bin/bash

#SBATCH --job-name=ray-worker
#SBATCH --partition=lr6
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=1
#SBATCH --account=<account>
#SBATCH --time=00:30:00
#SBATCH --qos=lr_normal
#SBATCH --output=ray-worker-%j.out
#SBATCH --error=ray-worker-%j.err

module load ml/ray/2.54.1

export RAY_ADDRESS=<head-node-ip>:<port>      # from echo $RAY_ADDRESS
export RAY_AUTH_MODE=token
export RAY_AUTH_TOKEN="<your-token>"          # from more $RAY_AUTH_TOKEN_PATH

srun -n 1 --nodes=1 \
         --ntasks-per-node=1 \
         ray start --address=${RAY_ADDRESS} --block
```

Replace `<head-node-ip>:<port>` and `<your-token>` with the values from Step 1, then submit: `sbatch add-ray-worker.sh`.

Notes

- The new worker node job's wall time should not exceed the remaining wall time of the Ray cluster session. The worker will disconnect when either job ends.

You should see the additional resources (node, CPUs, GPUs, memory) on the Ray Dashboard, and Ray can utilize the additional worker resources for any pending tasks.

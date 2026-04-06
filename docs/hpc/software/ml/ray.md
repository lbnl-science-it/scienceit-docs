# Ray on Lawrencium

[Ray](https://docs.ray.io/en/latest/index.html) enables parallel and distributed execution of Python functions and applications across multiple nodes, making it useful for machine learning, data processing and other such workloads.

A Ray module is available on Lawrencium. 

## Loading Ray on Lawrencium

```
module load ml/ray/2.54
```

This ray module includes Ray Core, Ray Train, Ray Tune, Ray Serve and Ray RLlib components. In addition, the python environment for Ray includes `PyTorch 2.10` and `torchvision 0.25`.

## Example: Running a Ray Job with SLURM

The following example launches a Ray cluster across two nodes in the `lr6` (exclusive) partition. Since Ray is designed to manage all resources on a node, use an exclusive partition when possible. Otherwise, request the full node in your SLURM script with `--exclusive` and `--mem=0`. 

``` bash title="submit-ray-lr6.sh"
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

module load ml/ray/2.54

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
sleep 20

export RAY_ADDRESS=${head_node_ip}:${port}
# Ray worker node initialization
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

``` python title="compute_pi.py"
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

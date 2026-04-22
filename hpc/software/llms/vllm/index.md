# vLLM on Lawrencium

[vLLM](https://github.com/vllm-project/vllm) is provided as a module on Lawrencium and can be used to run various open-weight Large-Language Models (LLMs) on Lawrencium hardware.

vLLM should only be run on compute nodes, preferably on newer GPUs on the `es2` partition. In this page, we will discuss how to run vLLM in an interactive slurm allocation.

Example: Getting an interactive slurm allocation

Please substitute with your actual `account_name` and other relevant parameters.

```
srun -p es2 -q es2_normal --gres=gpu:H100:1 -A account_name -N 1 -t 1:00:00 --cpus-per-task=14 --pty bash
```

Once you get an allocation and are on the compute node, you can follow the steps given below:

- Load the module

  ```
  module load ai/vllm/0.19.0
  ```

- Set the model cache directory. To use saved models from the central repository (with read-only access), use the following:

  ```
  export HF_HOME=/global/scratch/collections/vllm
  ```

- Serve `openai/gpt-oss-20b` as an example

  ```
  vllm serve openai/gpt-oss-20b --gpu-memory-utilization=0.85
  ```

The same process can be achieved through a slurm script as follows:

```
#!/bin/bash
#SBATCH --job-name=test
#SBATCH --account=account_name
#SBATCH --partition=es2
#SBATCH --qos=es2_normal
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=14
#SBATCH --gres=gpu:1
#SBATCH --time=1:00:00

module load ai/vllm/0.19.0
export HF_HOME=/global/scratch/collections/vllm

vllm serve openai/gpt-oss-20b --gpu-memory-utilization=0.85
```

You can submit the script to get the Job ID as follows:

```
JOBID=$(sbatch --parsable test-vllm.sh)
```

Once the slurm job starts, you should inspect the slurm output file (default is `slurm-$JOBID.out`) to make sure that vLLM has initialized and served the model properly. In order to interact with the deployed model, you can get a new shell inside your job allocation through:

```
srun --jobid=JOBID --overlap --pty bash
```

where `JOBID` is the slurm Job ID of the job running vLLM.

By default, vLLM serves the model on the port `8000`; if that port is occupied, you will need to specify a different port through the `--port` argument. Once vLLM is serving the model, and you get a new shell inside your job allocation, you can list the models through:

```
curl http://localhost:8000/v1/models
```

Please follow the official [vLLM documentation](https://docs.vllm.ai/en/v0.19.0/getting_started/quickstart/) on how to make use of vLLM through OpenAI-compatible server or through batch inferencing.

# AlphaFold 3 on Lawrencium

[AlphaFold 3](https://github.com/google-deepmind/alphafold3.git) is a new AI model developed by [Google DeepMind](https://deepmind.google/) and [Isomorphic Labs](https://www.isomorphiclabs.com/) for generating 3D predictions of biological systems. The software package and the public database is now available ont the Lawrencium cluster.

## Genetic Databases

The genetic database required for AlphaFold 3 is saved under the shared directory `/clusterfs/collections/Alphafold3/public-db` on the cluster.

## Model Parameters

The model parameters are the result of training the AlphaFold model and required for inference pipeline of AlphaFold 3. The model parameters are distributed separately from the source code by Google DeepMind and subject to terms [Model Parameters Terms of Use](https://github.com/google-deepmind/alphafold3/blob/v3.0.0/WEIGHTS_TERMS_OF_USE.md) .

Lawrencium users interested in using AlphaFold 3 are required to abide to above terms. Users can request a personal copy of the model parameters directly from Google DeepMind by filling out this [form](https://forms.gle/svvpY4u2jsHEwWYS6). If you have any questions about fields of the form then you may send us an inquiry at [hpcshelp@lbl.gov](mailto:hpcshelp@lbl.gov). Once you get response and directions from Google DeepMind on obtaining model parameters you may save the parameters file in your home directory or project directory (if you are sharing with your group members) inside directory `model_param`. The parameters file is a single file approximately 1GB in size.

## Loading AlphaFold 3 module

```
module load ml/alphafold3
```

The `ml/alphafold3` module defines various environment variables such as `ALPHAFOLD_DIR` and `DB_DIR` that can be used to run a job as shown below. Users will have to setup environment variable for `MODEL_PARAMETERS_DIR` before running the script or it can be setup directly in the job submission script as shown below.

## Running

Note

- Use `python /app/alphafold/run_alphafold.py` when using the `alphafold3.sif` image from the `ml/alphafold3` module. This is different from the official instructions on the `alphafold3` github page. See the sample slurm script below.

Below is a sample script to run `alphafold3` after loading `ml/alphafold3` module. It assumes the presence of `fold_input.json` in `$HOME/af_input` and saves output to `$HOME/af_output`. Please pay close attention to different options, path and variables and make changes as necessary.

Example 1: Running both Data Pipeline and Inference

af3_example.sh

```
#!/bin/bash
#SBATCH --account=<account>
#SBATCH --partition=es1
#SBATCH --gres=gpu:H100:1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=14
#SBATCH --nodes=1
#SBATCH --qos=es_normal
#SBATCH --time=1:30:00

module load ml/alphafold3

# export MODEL_PARAMETERS_DIR variable according to where they are saved
#If model parameters are saved in your home directory
export MODEL_PARAMETERS_DIR=/global/home/users/$USER/model_param

#If model parameters are saved in your group directory
export MODEL_PARAMETERS_DIR=/global/home/groups/<project_name>/model_param

apptainer exec --nv --bind $HOME/af_input:/root/af_input \
                    --bind $HOME/af_output:/root/af_output \
                    --bind $MODEL_PARAMETERS_DIR:/root/models \
                    --bind $DB_DIR:/root/public_databases \
                    $ALPHAFOLD_DIR/alphafold3.sif \
                    python /app/alphafold/run_alphafold.py \
                    --json_path=/root/af_input/fold_input.json \
                    --model_dir=/root/models \
                    --db_dir=/root/public_databases \
                    --output_dir=/root/af_output
```

Alphafold3 allows you to separate the data pipeline (CPU) and inference (GPU) portions of the job using options `--run_data_pipeline` and `--run_inference` options. It is also possible to run the data pipeline on a CPU partition such as lr6 followed the inference on a GPU partition using slurm dependency.

Example 2: Running Data Pipeline and Inference Separately

First, create two separate slurm scripts for data pipeline and inference. See example scripts in the tabs below:

```
#!/bin/bash
#SBATCH --account=<account>
#SBATCH --partition=lr6
#SBATCH --nodes=1
#SBATCH --qos=lr_normal
#SBATCH --time=1:00:00
#SBATCH --kill-on-invalid-dep=yes
#SBATCH --job-name=data_lr6
#SBATCH --output=%x_%a.out
#SBATCH --error=%x_%a.err

module load ml/alphafold3/3.0.1

apptainer exec --bind $PWD/af_input:/root/af_input \
               --bind $PWD/af_output:/root/af_output \
               --bind $PWD/af_model:/root/models \
               --bind $DB_DIR:/root/public_databases \
               $ALPHAFOLD_DIR/alphafold3.sif \
               python /app/alphafold/run_alphafold.py \
               --json_path=/root/af_input/fold.json \
               --model_dir=/root/models \
               --db_dir=/root/public_databases \
               --output_dir=/root/af_output \
               --run_data_pipeline=true \
               --run_inference=false
```

```
#!/bin/bash
#SBATCH --account=<account>
#SBATCH --partition=es1
#SBATCH --cpus-per-task=14
#SBATCH --ntasks=1
#SBATCH --nodes=1
#SBATCH --gres=gpu:H100:1
#SBATCH --qos=es_normal
#SBATCH --time=0:30:0
#SBATCH --kill-on-invalid-dep=yes
#SBATCH --job-name=inf_h100
#SBATCH --output=%x_%a.out
#SBATCH --error=%x_%a.err

module load ml/alphafold3/3.0.1

apptainer exec --nv --bind $PWD/af_input:/root/af_input \
                    --bind $PWD/af_output:/root/af_output \
                    --bind $PWD/af_model:/root/models \
                    --bind $DB_DIR:/root/public_databases \
                    $ALPHAFOLD_DIR/alphafold3.sif \
                    python /app/alphafold/run_alphafold.py \
                    --json_path=/oot/af_output/<job_name>/<job_name>_data.json \ 
                    --model_dir=/root/models \
                    --db_dir=/root/af_output/<job_name> \
                    --run_data_pipeline=false \
                    --run_inference=true
```

Now, submit the data pipeline job as follows to get the Job ID:

```
jobid=$(sbatch --parsable af3_data.sh)
```

And, submit the inference job using slurm dependency as follows such that the inference job is only run after the data job is completed:

```
sbatch --dependency=afterok:$jobid af3_inference.sh
```

If you are running a large number of jobs, slurm task arrays can be useful; for example use `#SBATCH --array=1-25%10` for 25 task arrays of which only 10 can run at a time. Then, you can use the environment variable `$SLURM_ARRAY_TASK_COUNT` in your slurm script to map your input json file name to the task array. In this case, you would need to submit the inference job using `--dependency=aftercorr:$jobid` such that an inference job task starts only when the corresponding data job task has completed successfully.

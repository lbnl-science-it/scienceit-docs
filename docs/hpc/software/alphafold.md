# AlphaFold 3 on LRC
AlphaFold 3 is a new AI model developed by Google DeepMind and Isomorphic Labs for generating 3D predictions of biological systems. The software package and the public database is now available ont the cluster.

## Genetic Databases 
The genetic database required for AlphaFold 3 is saved under the shared directory /clusterfs/collections/Alphafold3/public-db on the cluster.

## Model Parameters
The model parameters are the result of training the AlphaFold model and required for inference pipeline of AlphaFold 3. The model parameters are distributed separately from the source code by Google DeepMind Subject to following terms of use.  

Model Parameters Terms of Use
Model Parameters Prohibited Use Policy
Model Output Terms of Use Policy

All Lawrencium users abide to above terms. Users can request the model parameters directly from Google DeepMind by filling out this form. If you have any questions about fields of the form then you may send us an inquiry at hpcshelp@lbl.gov. Once you get response and directions from Google DeepMind on obtaining model parameter you may save these parameter in your home directory or project directory(if you are sharing with your group members) inside directory "model_param". The parameters file is a single file approximately 1GB in size.

## Loading AlphaFold 3 module

``` bash
module load ml/alphafold3
```

The `ml/alphafold3` module defines various environment variables such as `ALPHAFOLD_DIR` and `DB_DIR` that can be used to run a job as shown below. Users will have to setup environment variable for `MODEL_PARAMETERS_DIR` before running the script ot it can be setup directly in the script as shown below.
## Running 

!!! note "Things to note"

    * Use `python /app/alphafold/run_alphafold.py` when using the `alphafold3.sif` image from the `ml/alphafold3` image. This is different from the official instructions on the `alphafold3` github page.

Below is a sample script to run the alphafold3 container after loading `ml/alphafold3` module:

``` bash
#!/bin/bash
#SBATCH --account=<account>
#SBATCH --partition=es1
#SBATCH --gres=gpu:A40:1
#SBATCH --mincpus=16
#SBATCH --nodes=1
#SBATCH --qos=es_normal
#SBATCH --time=1:30:0

module load ml/alphafold3
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
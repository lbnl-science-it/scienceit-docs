# Ollama on Lawrencium

[Ollama](https://github.com/ollama/ollama){:target="_blank"} {{ ext }} is provided as a module on Lawrencium and can be used to run various open-weight Large-Language Models (LLMs) on Lawrencium hardware. 

Ollama should only be run on compute nodes. While some smaller models may be run on CPU partitions, running Ollama on GPU partitions (`es0` or `es1`) will have better performance. In this page, we will discuss how to run Ollama in an interactive slurm allocation. We also provide an [Open OnDemand app](../../openondemand/ollama-jupyter-vscode.md) that allows you to run Ollama on Open OnDemand and access Ollama through Jupyter notebooks. You could also run Ollama through a slurm batch submission script.

!!! example "Example: Getting an interactive slurm allocation"

    Please substitute with your actual `account_name` and other relevant parameters.

    ```
    srun -p es0 -A account_name -q es_normal -N 1 -t 1:00:00 --gres=gpu:1 --cpus-per-task=2 --pty bash
    ```

=== "Ollama 0.12.6"

    * Load the `ollama/0.12.6` module
    ```
    module load ai/ollama/0.12.6
    ```

    * Launch the ollama server in the background
    ```
    ollama serve > /dev/null 2>&1 &
    ```

    * List the available models
    ```
    ollama list
    NAME                   ID              SIZE      MODIFIED   
    gpt-oss:20b            17052f91a42e    13 GB     4 days ago    
    llama3.2-vision:11b    6f2f9757ae97    7.8 GB    4 days ago    
    ```

    * Run an available model and obtain a terminal chat interface
    ```
    ollama run gpt-oss:20b
    ```

    * Run a particular model with a prompt and save the response to a file
    ```
    ollama run gpt-oss:20b What model are you? > response.txt
    ```


=== "Ollama 0.6.8"

    * Load the `ollama/0.6.8` module
    ```
    module load ai/ollama/0.6.8
    ```

    * Lauch the ollama server in the background
    ```
    ollama serve > /dev/null 2>&1 &
    ```

    * List the available models
    ```
    ollama list
    NAME                     ID              SIZE      MODIFIED     
    devstral:24b             c4b2fa0c33d7    14 GB     4 months ago    
    codegemma:2b             926331004170    1.6 GB    4 months ago    
    nomic-embed-text:v1.5    0a109f422b47    274 MB    5 months ago    
    deepseek-coder:6.7b      ce298d984115    3.8 GB    5 months ago    
    deepseek-coder:1.3b      3ddd2d3fc8d2    776 MB    5 months ago    
    llama3.2:1b              baf6a787fdff    1.3 GB    5 months ago    
    qwen3:1.7b               458ce03a2187    1.4 GB    5 months ago    
    qwen3:30b-a3b            2ee832bc15b5    18 GB     5 months ago    
    qwen3:8b                 e4b5fd7f8af0    5.2 GB    5 months ago    
    deepseek-r1:8b           28f8fd6cdc67    4.9 GB    5 months ago    
    deepseek-r1:7b           0a8c26691023    4.7 GB    5 months ago    
    deepseek-r1:1.5b         a42b25d8c10a    1.1 GB    5 months ago    
    gemma3:4b                a2af6cc3eb7f    3.3 GB    5 months ago    
    gemma3:12b               f4031aab637d    8.1 GB    5 months ago    
    gemma3:12b-it-qat        5d4fa005e7bb    8.9 GB    5 months ago    
    gemma3:1b                8648f39daa8f    815 MB    5 months ago    
    ```

    * Run an available model and obtain a terminal chat interface
    ```
    ollama run gemma3:4b
    ``` 

    * Run a particular model with a prompt and save the response to a file
    ```
    ollama run gemma3:4b What model are you? > response.txt
    ```

!!! note "Batch submission tips" 

    In a slurm batch submission, you could add a sleep command after the `ollama serve` command to give time for the ollama server to start e.g. (`sleep 10`).

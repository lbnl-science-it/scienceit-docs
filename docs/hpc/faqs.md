# FAQs

??? question "How do I get a user account on the Lawrencium cluster?" 
    
    Principal Investigators (PIs) can sponsor researchers, students and external collaborators for cluster accounts. Account requests and approval are done through the [MyLRC portal](https://mylrc.lbl.gov/). Either the PI or a user can place a user account creation request on the MyLRC portal. Please see the [MyLRC documentation](https://it.lbl.gov/service/scienceit/high-performance-computing/mylrc-lawrencium-account-management-system/){:target="_blank"} {{ ext }} to learn how to submit a request. Upon request, an automatic email will be sent to your PI for approval. When the PI approves the request, it will be processed and the user is notified through email upon account availability.

??? question "How do I submit my first job?"

    Login to the cluster using any of the terminal options of your choice. You may login to cluster using the server name **`lrc-login.lbl.gov`**. Use your user name and PIN+OTP combination to login successfully. Upon login you will be end up on one of the login nodes in your home directory. Please do not submit jobs on the login nodes. You would request a compute node either using an interactive or batch slurm session. You need to know your [slurm association](running/slurm-overview.md#slurm-association) before scheduling a slurm session. Check out slurm job submission [examples here](running/script-examples.md). Depending on type of job for example CPU only, GPU, MPI, serial, you could visit the slurm script examples on this page.

??? question "How do I transfer data to and from the cluster?"

    For more details, please see the examples on the [Using the lrc-xfer DTN page](data-transfer-node.md).

??? question "What is the maximum runtime / walltime you can assign a job?"

    It depends on the `qos` and the information can be obtained using the following command

    ``` bash
    sacctmgr show qos name=lr_normal,lr_debug,lr_interactive,cm1_debug,cm1_normal,es_debug,es_normal,cf_debug,cf_normal,es_lowprio,cf_lowprio format=name,maxtres,maxwall,mintres
    ```

    The maximum runtime / walltime is shown on the `MaxWall` column. The output may look like the following:

    ``` bash
          Name       MaxTRES     MaxWall       MinTRES 
    ---------- ------------- ----------- ------------- 
      lr_debug        node=4    03:00:00         cpu=1 
     lr_normal                3-00:00:00         cpu=1 
     cf_normal       node=64  3-00:00:00         cpu=1 
      cf_debug        node=4    01:00:00         cpu=1 
     es_normal       node=64  3-00:00:00 cpu=2,gres/g+ 
      es_debug        node=4    03:00:00 cpu=2,gres/g+ 
     cm1_debug        node=4    01:00:00         cpu=1 
    cm1_normal       node=64  3-00:00:00         cpu=1 
    es_lowprio                           cpu=2,gres/g+ 
    cf_lowprio                                         
    lr_intera+        cpu=32  3-00:00:00               
    ```
??? question "When using the `lr_lowprio` queue, how long does a job have to finish its clean-up tasks upon getting preempted before it is killed by the scheduler?"

    For `lr_lowprio`, the `GraceTime` is 1 minute. You can see this by using the following command:

    ```
    sacctmgr show qos format=Name,GraceTime,PreemptMode | grep lr_lowprio
    ```
    which outputs:
    ```
    lr_lowprio   00:01:00     requeue
    ```

??? question "How do I utilize local disk on the compute node during a job for caching datasets and intermediate files during a job?"

    Once you have SLURM allocation, you have read/write access to a folder `/local/job${SLURM_JOB_ID}` where `SLURM_JOB_ID` is your slurm job ID. `SLURM_JOB_ID` is also an environment variable set by SLURM after job allocation. This folder `/local/job${SLURM_JOB_ID}` is on local disk on the compute node. Please remember that this storage is temporary and only available when your job is running; therefore, any data that you need later must be copied to another location before your job terminates. 


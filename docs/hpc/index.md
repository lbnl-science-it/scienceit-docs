# **High Performance Computing**

**Lawrencium** is the platform for the [LBNL Condo Cluster Computing (LC3)](https://it.lbl.gov/service/scienceit/high-performance-computing/lrc/computing-on-lawrencium/condo-cluster-service/){:target="_blank"} {{ ext }} program, which provides a sustainable way to meet the midrange computing requirement for Berkeley Lab. Lawrencium is part of the LBNL Supercluster and shares the same Supercluster infrastructure. This includes the system management software, software module farm, scheduler, storage and backend network infrastructure.

Unlike DOE computing user-facilities such as NERSC which offer leadership-tier performance but suffer from long wait times, Lawrencium provides medium-tier performance with low wait times.

!!! note "Berkeley Data Center"
    
    Lawrencium is located at the Berkeley Data Center in Building 50B-1275. The datacenter is a 5000 sq. ft. facility dedicated for Berkeley Lab's scientific computing resources such as Lawrencium.

## Hardware Configuration

Lawrencium is composed of multiple generations of hardware hence it is separated into several partitions to facilitate management and to meet the requirements to host Condo projects. The following table lists the hardware configuration for each individual partition.

* [Lawrencium Intel CPU Cluster](systems/lawrencium.md#lawrencium-linux-cluster)
* [Es1 (Einsteinium) GPU Cluster](systems/einsteinium.md#es1-einsteinium-gpu-cluster)
* [Cf1 (Californium) Intel Phi Cluster](systems/lawrencium.md#cf1-californium-intel-phi-cluster)
* [Cm1 (Curium) AMD Cluster](systems/lawrencium.md#cm1-curium-amd-cluster)

In addition, there are several **Supported Research Clusters**; more information on each of these can be found by selecting the desired supported cluster under `Computing Systems > Supported Research Clusters`.

## Storage and Backup

Lawrencium cluster users are entitled to access the following storage systems so please get familiar with them.

| Name | Location | Quota | Backup | Allocation | Description |
| ---- | -------- | ----- | ------ | ---------- | ----------- |
| HOME | `/global/home/users/$user` | 30GB | Yes | Per User | Home directory for permanant data storage |
| GROUP-SW | `/global/home/groups-sw/$group` | 200GB | Yes | Per Group | Group directory for software and data sharing with backup |
| GROUP | `/global/home/groups/$group` | 400GB | No | Per Group | Group directory for data sharing without backup |
| SCRATCH | `/global/scratch/users/$user` | None | No | Per User | Scratch directory with Lustre high performance parallel file system |
| CLUSTERFS | `/clusterfs/axl/$USER` | None | No | Per User | Private storage for AXL condo | 
| CLUSTERFS | `/clusterfs/cumulus/$USER` | None | No | Per User | Private storage for CUMULUS condo | 
| CLUSTERFS | `/clusterfs/esd/$USER` | None | No | Per User | Private storage for ESD condo | 
| CLUSTERFS | `/clusterfs/geoseq/$USER` | None | No | Per User | Private storage for CO2SEQ condo | 
| CLUSTERFS | `/clusterfs/nokomis/$USER` | None | No | Per User | Private storage for NOKOMIS condo | 


## Recharge Model

Lawrencium is a Lab-fund platform for Lawrencium Condo program. LBNL has made a significant investment in developing this platform to meet the midrange computing requirement at Berkeley Lab. The primary purpose is to provide a sustainable way to host all the condo projects while meeting the computing requirements from other users. To achieve this goal, condo users are allowed to run within their condo contributions for free. However normal users who would like to use the Lawrencium cluster are subject to the LBNL recharge rate. 

Condo users who would need to run outside of their condo contributions are also subject to the same recharge rate as normal users. For this purpose, condo users will obtain either one or two projects/accounts when their accounts are created on Lawrencium, per the instruction we receive from the PI of the condo project. They would need to provide the correct project when running jobs inside or outside of their condo contributions, which will be explained in detail in the Scheduler Configuration section below. The current recharge rate is $0.01 per Service Unit (1 cent per service unit, SU). Due to the hardware architecture difference we discount effective recharge rate for older generations of hardware. Please refer to the following table for the current recharge rate for each partition.

| Partition | Shared or Exclusive | SU to Core CPU Hour Ratio | Effective Recharge Rate | 
| --------- | ----- | ------------------------- | ----------------------- |
| lr3       | Exclusive   | free                      | free |
| lr4       | Exclusive   | 0.5                       | $0.005 per Core CPU Hour |
| lr5       | Exclusive   | 0.75                      | $0.0075 per Core CPU Hour |
| lr6       | Exclusive   | 1.0                       | $0.01 per Core CPU Hour |
| lr7       | Shared    | 1.0                       | $0.01 per Core CPU Hour | 
| cf1       | Exclusive    | 0.4                       | $0.004 per Core CPU Hour |
| lr_bigmem | Exclusive     | 1.5                       | $0.015 per Core CPU Hour |
| es1       | Shared    | 1.0                       | $0.01 per Core CPU Hour |
| cm1       | Shared    | 0.75                      | $0.0075 per Core CPU Hour |
| cm2       | Shared     | 1.0                       | $0.01 per Core CPU Hour |
| ood_inter | Shared     | 1.0                       | $0.01 per Core CPU Hour | 

!!! note "Usage Calculation"

    The usage calculation is based on the resource that is allocated to the job instead of the actual usage of the job. For example, if a job asked for one lr5 node with one CPU requirement (typical serial job case), and the job ran for 24 hours, since **lr5** nodes are allocated **exclusively** to the job (please refer to the following Scheduler Configuration section for more detail), the charge that this job incurred would be: 
    
    **$0.0075/(core * hour) * 1 node * 24 cores/node * 24 hours = $4.32**
    
    instead of: $0.0075/(core*hour) * 1 core * 24 hours = $0.18.

## Scheduler Configuration 

Lawrencium cluster uses [SLURM to submit jobs](running/slurm-overview.md) as the scheduler to manage jobs on the cluster. To use Lawrencium through slurm, the partition (`lr3, lr4, lr5, lr6, es1, cm1, cm2` must be specified (`--partition=xxx`) along with account (`--account=xxx`). Currently the available QoS (Quality of Service)s are `lr_normal` and `lr_debug` and `lr_lowprio`. A standard fair-share policy with a decay half life value of 14 days (2 weeks) is enforced.

* For normal users to use the Lawrencium resource the proper project account, e.g., `--account=ac_abc`, is needed. The QoS `lr_normal` is also required based on the partition that the job is submitted to, e.g., `--qos=lr_normal`.
* If a debug job is desired the `lr_debug` QoS should be specified, e.g., `--qos=lr_debug` so that the scheduler can adjust job priority accordingly.
* Condo users please use the proper condo QoS, e.g., `--qos=condo_xyz`, as well as the proper recharge account `--account=lr_xyz`.
* The partition name is always required in all cases, e.g., `--partition=lr6`.


!!! note "Fair-share policy" 

    A standard fair-share policy with a decay half life value of 14 days (2 weeks) is enforced. All accounts are given equal shares value of 1.  All users under each account associated within a partition is subjected to decay’g in priority based on the resources used and the overall parent account usage. Usage is a value between 0.0 and 1.0 that associates proportional usage of the system. A value of 0 indicates that the association is over-served. In other words that account has used its share of the resources and will be given a lower value of shares compared to users who have not used as much resources.

* Job prioritization is based on Age, Fairshare, Partition and QOS. Note: `lr_lowprio` qos jobs are not given any prioritization and some QOS have higher values than others.
* If a node feature is not provided, the job will be dispatched to nodes based on a predefined order, for `lr3` the order is: `lr3_c16`, `lr3_c20`; for `lr5` the order is: `lr5_c28`, `lr5_c20`.

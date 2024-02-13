# High Performance Computing

The Science IT department at Lawrence Berkeley National Laboratory manages the Lawrencium cluster providing High Performance Computing needs of Berkeley Lab researchers.

**Lawrencium** is the platform for the LBNL Condo Cluster Computing (LC3) program, which provides a sustainable way to meet the midrange computing requirement for Berkeley Lab. Lawrencium is part of the LBNL Supercluster and shares the same Supercluster infrastructure. This includes the system management software, software module farm, scheduler, storage and backend network infrastructure.
Storage and Backup.

## Hardware Configuration

Lawrencium is composed of multiple generations of hardware hence it is separated into several partitions to facilitate management and to meet the requirements to host Condo projects. The following table lists the hardware configuration for each individual partition.

* [Lawrencium Intel CPU Cluster](systems/lawrencium.md)
* [Es1 (Einsteinium) GPU Cluster](systems/einsteinium.md)
* [Cf1 (Californium) Intel Phi Cluster](systems/californium.md)
* [Cm1 (Curium) AMD Cluster](systems/curium.md)

In addition, there are several **Supported Research Clusters**; more information on each of these can be found by selecting the desired supported cluster under Systems > Supported Research Clusters.

## Storage and Backup

Lawrencium cluster users are entitled to access the following storage systems so please get familiar with them.

| Name | Location | Quota | Backup | Allocation | Description |
| ---- | -------- | ----- | ------ | ---------- | ----------- |
| HOME | `/global/home/users/$user` | 20GB | Yes | Per User | Home directory for permanant data storage |
| GROUP-SW | `/global/home/groups-sw/$group` | 200GB | Yes | Per Group | Group directory for software and data sharing with backup |
| GROUP | `/global/home/groups/$group` | 400GB | No | Per Group | Group directory for data sharing without backup |
| SCRATCH | `/global/scratch/users/$user` | None | No | Per User | Scratch directory with Lustre high performance parallel file system |
| CLUSTERFS | `/clusterfs/axl/$USER` | None | No | Per User | Private storage for AXL condo | 
| CLUSTERFS | `/clusterfs/cumulus/$USER` | None | No | Per User | Private storage for CUMULUS condo | 
| CLUSTERFS | `/clusterfs/esd/$USER` | None | No | Per User | Private storage for ESD condo | 
| CLUSTERFS | `/clusterfs/geoseq/$USER` | None | No | Per User | Private storage for CO2SEQ condo | 
| CLUSTERFS | `/clusterfs/nokomis/$USER` | None | No | Per User | Private storage for NOKOMIS condo | 


## Recharge Model

LAWRENCIUM is a Lab-fund platform for Lawrencium Condo program. LBNL has made a significant investment in developing this platform to meet the midrange computing requirement at Berkeley Lab. The primary purpose is to provide a sustainable way to host all the condo projects while meeting the computing requirements from other users. To achieve this goal, condo users are allowed to run within their condo contributions for free. However normal users who would like to use the LAWRENCIUM cluster are subject to the LBNL recharge rate. 

Condo users who would need to run outside of their condo contributions are also subject to the same recharge rate as normal users. For this purpose, condo users will obtain either one or two projects/accounts when their accounts are created on LAWRENCIUM, per the instruction we receive from the PI of the condo project. They would need to provide the correct project when running jobs inside or outside of their condo contributions, which will be explained in detail in the Scheduler Configuration section below. The current recharge model has been effective since Jan, 2011 with the standard recharge rate of $0.01 per Service Unit (1 cent per service unit, SU). Due to the hardware architecture difference we discount effective recharge rate for older generations of hardware and this may go down further when we have newer generations of hardware in production, please refer to the following table for the current recharge rate for each partition.

| Partition | Nodes | SU to Core CPU Hour Ratio | Effective Recharge Rate | 
| --------- | ----- | ------------------------- | ----------------------- |
| lr3       | 332   | free                      | free |
| lr4       | 141   | 0.5                       | $0.005 per Core CPU Hour |
| lr5       | 192   | 0.75                      | $0.0075 per Core CPU Hour |
| lr6       | 290   | 1.0                       | $0.01 per Core CPU Hour |
| lr7       | 60    | 1.0                       | $0.01 per Core CPU Hour | 
| cf1       | 72    | 0.4                       | $0.004 per Core CPU Hour |
| lr_bigmem | 2     | 1.5                       | $0.015 per Core CPU Hour |
| es1       | 47    | 1.0                       | $0.01 per Core CPU Hour |
| cm1       | 14    | 0.75                      | $0.0075 per Core CPU Hour |
| cm2       | 3     | 1.0                       | $0.01 per Core CPU Hour |
| ood_inter | 5     | 1.0                       | $0.01 per Core CPU Hour | 

!!! note "Usage Calculation"

    The usage calculation is based on the resource that is allocated to the job instead of the actual usage of the job. For example, if a job asked for one lr5 node with one CPU requirement (typical serial job case), and the job ran for 24 hours, since **lr5** nodes are allocated **exclusively** to the job (please refer to the following Scheduler Configuration section for more detail), the charge that this job incurred would be: 
    
    **$0.0075/(core * hour) * 1 node * 24 cores/node * 24 hours = $4.32**
    
    instead of: $0.0075/(core*hour) * 1 core * 24 hours = $0.18.

## Scheduler Configuration 

** TODO **





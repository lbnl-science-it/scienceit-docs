The Science IT department at Lawrence Berkeley National Laboratory manages the Lawrencium cluster providing High Performance Computing needs of Berkeley Lab researchers.

**Lawrencium** is the platform for the LBNL Condo Cluster Computing (LC3) program, which provides a sustainable way to meet the midrange computing requirement for Berkeley Lab. Lawrencium is part of the LBNL Supercluster and shares the same Supercluster infrastructure. This includes the system management software, software module farm, scheduler, storage and backend network infrastructure.
Storage and Backup.

## Hardware Configuration

Lawrencium is composed of multiple generations of hardware hence it is physically separated into several partitions to facilitate management and to meet the requirements to host Condo projects. The following table lists the hardware configuration for each individual partition.


| Partition | Nodes | CPU | Cores | Memory | Infiniband | Accelerator | 
| --------- | ----- | --- | ----- | ------ | ---------- | ----------- |
| lr3       | 243   | Intel Xeon E5 2670 | 16 | 64GB | FDR | -  |
|           |       | Intel Xeon E5 2670 v2 | 20 | 64 GB | FDR | - |
| lr4 | 148 | Intel Xeon E5-2670v3 | 24 | 64GB | FDR | - |



## Storage and Backup

Lawrencium cluster users are entitled to access the following storage systems so please get familiar with them.

| Name | Location | Quota | Backup | Allocation | Description |
| ---- | -------- | ----- | ------ | ---------- | ----------- |
| HOME | `/global/home/users/$user` | 20GB | Yes | Per User | Home directory for permanant data storage |
| GROUP-SW | `/global/home/groups-sw/$group` | 200GB | Yes | Per Group | Group directory for software and data sharing with backup |
| GROUP | `/global/home/groups/$group` | 400GB | No | Per Group | Group directory for data sharing without backup |
| SCRATCH | `/global/scratch/users/$user` | None | No | Per User | Scratch directory with Lustre high performance parallel file system |





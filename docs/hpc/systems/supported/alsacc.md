# ALSACC - Advanced Light Source

The ALSACC cluster is part of the LBNL Supercluster and shares the same Supercluster infrastructure. This includes the system management software, software module farm, scheduler, storage and backend network management.

## Login and Data Transfer

ALSACC uses One Time Password (OTP) for login authentication for all the services provided below. Please also refer to the Data Transfer page for additional information.

* Login server: `lrc-login.lbl.gov`
* DATA transfer server: `lrc-xfer.lbl.gov`
* Globus Online endpoint: `lbnl#lrc`

## Hardware Configuration

ALSACC cluster has a mixture of different CPU architectures and memory configurations so please be aware of them and choose them wisely along with the scheduler configurations.

| Partition | Nodes | Node List | CPU | Cores | Memory | Infiniband |
| --------- | ----- | --------- | --- | ----- | ------ | ---------- |
| alsacc    | 64    | n00[00-27].alsacc0 | Intel Xeon X5650 | 12 | 24GB | QDR |
|           |       | n00[28-43].alsacc0 | Intel Xeon E5-2670 | 16 | 64GB | FDR |
|           |       | n00[44-55].alsacc0 | Intel Xeon E5-2670v2 | 20 | 64GB | FDR |
|           |       | n00[56-63].alsacc0 | Intel Xeon E5-2670v3 | 24 | 64GB | FDR |

## Storage and Backup 

ALSACC cluster users are entitled to access the following storage systems so please get familiar with them.

| Name | Location | Quota | Backup | Allocation | Description | 
| ---- | -------- | ----- | ------ | ---------- | ----------- |
| HOME | `/global/home/users/$USER` | 12GB | Yes |	Per User | HOME directory for permanent data storage |
| GROUP-SW | `/global/home/groups-sw/$GROUP` | 200GB | Yes | Per Group | GROUP directory for software and data sharing with backup |
| GROUP | `/global/home/groups/$GROUP` | 400GB | No |	Per Group |	GROUP directory for data sharing without backup |
| SCRATCH | `/global/scratch/$USER` |	none | No |	Per User | SCRATCH directory with Lustre high performance parallel file system |
| CLUSTERFS | `/clusterfs/alsacc/$USER` | none |	No | Per User |	Private storage |

!!! note "Note"

    HOME, GROUP, and GROUP-SW directories are located on a highly reliable enterprise level BlueArc storage device. Since this appliance also provides storage for many other mission critical file systems, and it is not designed for high performance applications, running large I/O dependent jobs on these file systems could greatly degrade the performance of all the file systems that are hosted on this device and affect hundreds of users, thus this behavior is explicitly prohibited. HPCS reserves the right to kill these jobs without notification once discovered. Jobs that have I/O requirement should use the SCRATCH file system which is designed specifically for that purpose.

## Scheduler Configuration

ALSACC cluster uses [SLURM](../../running/slurm-overview.md) as the scheduler to manage jobs on the cluster. To use the ALSACC resource, the partition `alsacc` must be used (`--partition=alsacc`) along with account `alsacc` (`--account=alsacc`). Currently there is no special limitation introduced to the `alsacc` partition thus no QoS configuration is required to use the ALSACC resources (a default QoS will be applied automatically). A standard fair-share policy with a decay half life value of 14 days is enforced.

The job allocation on ALSACC is shared i.e. a node can be shared between multiple jobs. The different QoS arguments and their limits are shown below:

| Node List | Node Features | 
| --------- | --------- |
| n00[00-27].alsacc0 | alsacc, alsacc_c12 |
| n00[28-43].alsacc0 | alsacc, alsacc_c16 |
| n00[44-55].alsacc0 | alsacc, alsacc_c20 |
| n00[56-63].alsacc0 | alsacc, alsacc_c24 |

## Software Configuration

ALSACC uses [Software Module Farm](../../software/software-module-farm.md) to [manage](../../software/module-management.md) the cluster-wide software installation.

## Cluster Status

Please visit [here](https://metacluster.lbl.gov/warewulf/alsacc0){:target="_blank"} {{ ext }} for the live status of ALSACC cluster.
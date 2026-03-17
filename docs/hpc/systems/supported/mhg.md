# MHG Cluster

The MHG cluster is part of the LBNL Supercluster and shares the same Supercluster infrastructure. This includes the system management software, software module farm, scheduler, storage, and backend network management.

## Login and Data Transfer
MHG uses One Time Password (OTP) for login authentication for all the services provided below. Please also refer to the Data Transfer page for additional information.

* Login server: `lrc-login.lbl.gov`
* DATA transfer server: `lrc-xfer.lbl.gov`
* Globus Online endpoint: `lbnl#lrc`

## Hardware Configuration
MHG cluster has a mixture of different CPU architectures and memory configurations so please be aware of them and choose them wisely along with the scheduler configurations.

| PARTITION | NODES | NODE LIST | CPU | CORES | MEMORY |
| --------- | ----- | --------- | --- | ----- | ------ |
| mhg       | 72    | n0[030-036,041-055].mhg0 | AMD Opteron 6376 | 64 | 256 GB |
|           |       | n0[037-040,082,084].mhg0 | AMD Opteron 6376 | 64 | 512 GB |
|           |       | n0[056-081,083,085-101].mhg0 | AMD Opteron 6274 | 64 | 256 GB |


## Storage and Backup
MHG cluster users are entitled to access the following storage systems so please get familiar with them.

| NAME | LOCATION | QUOTA | BACKUP | ALLOCATION | DESCRIPTION | 
| ---- | -------- | ----- | ------ | ---------- | ----------- |
| HOME | `/global/home/users/$USER` | 12GB | Yes | Per User | HOME directory for permanent data storage |
| GROUP-SW | `/global/home/groups-sw/$GROUP` | 200GB | Yes | Per Group | GROUP directory for software and data sharing with backup |
| GROUP | `/global/home/groups/$GROUP` | 400GB | No | Per Group | GROUP directory for data sharing without backup |
| SCRATCH | `/global/scratch/users/$USER` | none | No | Per User | SCRATCH directory with Lustre high performance parallel file system |
| CLUSTERFS | `/clusterfs/mhg/$USER` | none | No | Per User | Private storage |
| LOCAL | `/local/scratch/users/$USER` | none | No | Per User | Local scratch on each node |

!!! note 

    HOME, GROUP, and GROUP-SW directories are located on a highly reliable enterprise level BlueArc storage device. Since this appliance also provides storage for many other mission critical file systems, and it is not designed for high performance applications, running large I/O dependent jobs on these file systems could greatly degrade the performance of all the file systems that are hosted on this device and affect hundreds of users, thus this behavior is explicitly prohibited. HPCS reserves the right to kill these jobs without notification once discovered. Jobs that have I/O requirement should use the SCRATCH file system which is designed specifically for that purpose.

## **Scheduler Configuration:**

MHG cluster uses [SLURM](https://it.lbl.gov/resource/hpc/for-users/hpc-documentation/running-jobs/) as the scheduler to manage jobs on the cluster. To use the MHG resource the partition `mhg` must be used (`--partition=mhg`) along with account `mhg` (`--account=mhg`). Currently there is no special limitation introduced to the `mhg` partition thus no QoS configuration is required to use the MHG resources (a default `normal` QoS will be applied automatically). A standard fair-share policy with a decay half life value of 14 days (2 weeks) is enforced. If node feature (`--constraint` option) is not used, the default dispatch order will be: `mhg_c4, mhg_c8, mhg_c32, mhg_c48, mhg_m256, mhg_m512`.

| PARTITION | ACCOUNT | NODES | NODE LIST | NODE FEATURES | SHARED | QOS | QOS LIMIT |
| :---: | :---: | :---: | ----- | ----- | :---: | :---: | :---: |
| mhg | mhg | 72 |  n0\[030-036\].mhg0 n0\[037-039\].mhg0 n0040.mhg0 n0\[041-055\].mhg0 n0\[056-101\].mhg0  |  mhg, mhg\_c64, mhg\_m256 mhg, mhg\_c64, mhg\_m512 mhg, mhg\_c64, mhg\_m512, mhg\_ssd mhg, mhg\_c64, mhg\_m256 mhg, mhg\_c64, mhg\_m256  | Yes | normal | no limit |

## Software Configuration
ETNA uses [Software Module Farm](../../software/software-module-farm.md) to [manage](../../software/module-management.md) the cluster-wide software installation.

## Cluster Status
Please visit [here](https://metacluster.lbl.gov/warewulf/mhg){:target="_blank"} {{ ext }} for the live status of MHG cluster.

## **Additional Information:**

Please send us tickets hpcshelp@lbl.gov or send email to ScienceIT@lbl.gov for any inquiries or service requests.
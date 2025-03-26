# CATAMOUNT - Material Sciences Division

The CATAMOUNT cluster is part of the LBNL Supercluster and shares the same Supercluster infrastructure. This includes the system management software, software module farm, scheduler, storage, and backend network management.

## Login and Data Transfer
CATAMOUNT uses One Time Password (OTP) for login authentication for all the services provided below. Please also refer to the Data Transfer page for additional information.

* Login server: `lrc-login.lbl.gov`
* DATA transfer server: `lrc-xfer.lbl.gov`
* Globus Online endpoint: `lbnl#lrc`

## Hardware Configuration
Each compute node has dual-socket octa-core Intel Xeon E5-2670 (Sandy Bridge) @ 2.60 GHz processors (16 cores in total), 64 GB of physical memory.  Compute nodes are connected with each other through multiple high performance Mellanox 56 Gbps FDR Infiniband edge switches then back to a backbone Mellanox SX6518 director switch.

| Partition | Nodes | Node List | CPU | Cores | Memory | 
| --------- | ----- | --------- | --- | ----- | ------ |
| catamount |	116	  | n0[000-115].catamount0 | Intel Xeon E5-2670 |	16 | 64GB |

## Storage and Backup

CATAMOUNT cluster users are entitled to access the following storage systems so please get familiar with them.

| Name | Location | Quota | Backup | Allocation | Description | 
| ---- | -------- | ----- | ------ | ---------- | ----------- |
| HOME | `/global/home/users/$USER` | 12GB | Yes |	Per User | HOME directory for permanent data storage |
| GROUP-SW | `/global/home/groups-sw/$GROUP` | 200GB | Yes | Per Group | GROUP directory for software and data sharing with backup |
| GROUP | `/global/home/groups/$GROUP` | 400GB | No |	Per Group |	GROUP directory for data sharing without backup |
| SCRATCH | `/global/scratch/$USER` |	none | No |	Per User | SCRATCH directory with Lustre high performance parallel file system |
| CLUSTERFS | `/clusterfs/catamount/$USER` | none |	No | Per User |	Private storage |

!!! note "Note"

    HOME, GROUP, and GROUP-SW directories are located on a highly reliable enterprise level BlueArc storage device. Since this appliance also provides storage for many other mission critical file systems, and it is not designed for high performance applications, running large I/O dependent jobs on these file systems could greatly degrade the performance of all the file systems that are hosted on this device and affect hundreds of users, thus this behavior is explicitly prohibited. HPCS reserves the right to kill these jobs without notification once discovered. Jobs that have I/O requirement should use the SCRATCH file system which is designed specifically for that purpose.

## Scheduler Configuration

CATAMOUNT cluster uses [SLURM](../../running/slurm-overview.md) as the scheduler to manage jobs on the cluster. To use the CATAMOUNT resource, the partition `catamount` must be used (`--partition=catamount`) along with account `catamount` (`--account=catamount`). One of the QoSs from the following table should be used as well (e.g., `--qos=cm_short`). A standard fair-share policy with a decay half life value of 14 days (2 weeks) is enforced.

The job allocation on CATAMOUNT is exclusive i.e. a node is **not** shared between two jobs. The different QoS arguments and their limits are shown below:

| QOS | QOS Limit | 
| --- | --------- |
| cm_short | 4 nodes max per job; 24:00:00 wallclock limit |
| cm_medium | 16 nodes max per job; 72:00:00 wallclock limit |
| cm_long | 32 nodes max per user |
| cm_debug | 2 nodes max per job; 8 nodes in total; 00:30:00 wallclock limit |

## Software Configuration

CATAMOUNT uses [Software Module Farm](../../software/software-module-farm.md) to [manage](../../software/module-management.md) the cluster-wide software installation.
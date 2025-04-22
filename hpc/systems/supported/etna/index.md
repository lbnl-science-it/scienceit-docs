# ETNA Cluster

The ETNA cluster is part of the LBNL Supercluster and shares the same Supercluster infrastructure. This includes the system management software, software module farm, scheduler, storage, and backend network management.

## Login and Data Transfer

ETNA uses One Time Password (OTP) for login authentication for all the services provided below. Please also refer to the Data Transfer page for additional information.

- Login server: `lrc-login.lbl.gov`
- DATA transfer server: `lrc-xfer.lbl.gov`
- Globus Online endpoint: `lbnl#lrc`

## Hardware Configuration

Each compute node has dual-socket 12-core INTEL Xeon E5-2670 v3 @ 2.30 GHz processors (24 cores in total), 64 GB of physical memory. Compute nodes are connected with each other through a high performance Mellanox 56 Gbps FDR Infiniband fabric.

| PARTITION | NODES | CPU | CORES | MEMORY | GPU | | --- | --- | --- | --- | --- | --- | | etna | 170 | INTEL XEON E5-2670 v3 | 24 | 64GB | – | | etna | 3 | INTEL XEON E5-2670 v3 | 24 | 64GB | Xeon Phi | | etna | 16 | INTEL XEON E5-2623 v3 | 8 | 64GB | K80, V100 |

## Storage and Backup

ETNA cluster users are entitled to access the following storage systems so please get familiar with them.

| NAME | LOCATION | QUOTA | BACKUP | ALLOCATION | DESCRIPTION | | --- | --- | --- | --- | --- | --- | | HOME | `/global/home/users/$USER` | 12GB | Yes | Per User | HOME directory for permanent data storage | | SCRATCH | `/global/scratch/users/$USER` | none | No | Per User | SCRATCH directory with Lustre high performance parallel file system over Infiniband | | MOTEL | `/clusterfs/vulcan/motel/$USER` | none | No | Per User | Long-term storage of bulk data | | MOTEL2 | `/clusterfs/vulcan/motel2/$USER` | none | No | Per User | Long-term storage of bulk data | | PSCRATCH | `/clusterfs/etna/pscratch/$USER` | none | No | Per User | SCRATCH directory with Lustre high performance parallel file system over Infiniband |

Note

`HOME`, `MOTEL`, and `MOTEL2` directories are located on a highly reliable enterprise level BlueArc storage device. Since this appliance also provides storage for many other mission critical file systems, and it is not designed for high performance applications, running large I/O dependent jobs on these file systems could greatly degrade the performance of all the file systems that are hosted on this device and affect hundreds of users, thus this behavior is explicitly prohibited. HPCS reserves the right to kill these jobs without notification once discovered. Jobs that have I/O requirement should use the `SCRATCH` or `PSCRATCH` file system which are designed specifically for that purpose.

## Scheduler Configuration

ETNA cluster uses SLURM as the scheduler to manage jobs on the cluster. To use the ETNA resource the partition `etna` must be used (`–partition=etna`). Users of projects `nano` and `etna` are allowed to submit jobs to the ETNA cluster using either `--account=etna` or `--account=nano`; details on checking your slurm associations are [here](../../../running/slurm-overview/#slurm-association). For the GPU nodes, use `–partition=etna_gpu`. Currently there is no special limitation introduced to the `etna` partition thus no QoS configuration is required to use the ETNA resources (a default `normal` QoS will be applied automatically). A standard fair-share policy with a decay half life value of 14 days (2 weeks) is enforced.

| PARTITION | NODES | NODE LIST | NODE FEATURES | SHARED | | --- | --- | --- | --- | --- | | etna | 175 | n0[000-174].etna0 | etna, etna_phi([172-174]) | Exclusive | | etna_gpu | 16 | n0[175-183,238,299-304].etna0 | etna_gpu, etna_k80, etna_v100, etna_v100_32g | Shared | | etna-shared | 5 | n0[188-192].etna0 | etna_share | Shared | | etna_c40 | 16 | n0[239-254].etna0 | etna_c40 | Exclusive | | etna_bigmem | 47 | n0[186-187,193-237].etna0 | etna_bigmem | Exclusive |

## Software Configuration

ETNA uses [Software Module Farm](../../../software/software-module-farm/) to [manage](../../../software/module-management/) the cluster-wide software installation.

## Cluster Status

Please visit [here](https://metacluster.lbl.gov/warewulf/etna0) for the live status of ETNA cluster.

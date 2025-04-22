# DIRAC1 Cluster

The DIRAC1 cluster is part of the LBNL Supercluster and shares the same Supercluster infrastructure. This includes the system management software, software module farm, scheduler, storage and backend network management.

## Login and Data Transfer

DIRAC1 uses [One Time Password (OTP)](../../../accounts/mfa/) for login authentication for all the services provided below.

- [Login server](../../../accounts/loggingin/): `lrc-login.lbl.gov`
- [DATA transfer server](../../../data-transfer-node/): `lrc-xfer.lbl.gov`
- [Globus Online endpoint](../../../../data/globus/): `lbnl#lrc`

## Hardware Configuration

DIRAC1 has a mixture of different type of hardware. Compute nodes are connected with each other through a high-performance Mellanox 56Gbps FDR switch.

| PARTITION | NODES | NODE LIST | CPU | CORES | MEMORY | | --- | --- | --- | --- | --- | --- | | dirac1 | 56 | n0[000-055].dirac1 | INTEL XEON E5-2670 v3 | 24 | 256GB | | dirac1 | 72 | n0[056-127].dirac1 | INTEL XEON E5-2650 v4 | 24 | 256GB |

## Storage and Backup:

DIRAC1 cluster users are entitled to access the following storage systems so please get familiar with them.

| NAME | LOCATION | QUOTA | BACKUP | ALLOCATION | DESCRIPTION | | --- | --- | --- | --- | --- | --- | | HOME | /global/home/users/$USER | 12GB | Yes | Per User | HOME directory for permanent data storage | | GROUP-SW | /global/home/groups-sw/$GROUP | 200GB | Yes | Per Group | GROUP directory for software and data sharing with backup | | GROUP | /global/home/groups/$GROUP | 400GB | No | Per Group | GROUP directory for data sharing without backup | | SCRATCH | /global/scratch/users/$USER | none | No | Per User | SCRATCH directory with Lustre high performance parallel file system | | CLUSTERFS | /clusterfs/dirac1/$USER | none | No | Per User | Private storage |

Note

HOME, GROUP, GROUP-SW and CLUSTERFS directories are located on a highly reliable enterprise level BlueArc storage device. Since this appliance also provides storage for many other mission critical file systems, and it is not designed for high performance applications, running large I/O dependent jobs on these file systems could greatly degrade the performance of all the file systems that are hosted on this device and affect hundreds of users, thus this behavior is explicitly prohibited. HPCS reserves the right to kill these jobs without notification once discovered. Jobs that have I/O requirement should use the SCRATCH file system which is designed specifically for that purpose.

## Scheduler Configuration:

DIRAC1 cluster uses [SLURM](../../../running/slurm-overview/) as the scheduler to manage jobs on the cluster. To use the DIRAC1 resource the partition `dirac1` must be used (`--partition=dirac1`) along with account `dirac1` (`--account=dirac1`). A standard fair-share policy with a decay half life value of 14 days (2 weeks) is enforced. For users from `ac_ciftgp` (Guggenheim Users), the default QOS is `dirac1_normal`. This is the high priority QOS which will preempt low priority jobs if those jobs need resources. For users from `ac_cifgres`, the default QOS is `dirac1_lowprio`. This is the low priority QOS. When system is busy and there are higher priority jobs pending, scheduler will preempt jobs that are running with this low priority QOS. `dirac1_highprio` is a special QoS which will preempt both `dirac1_lowprio` and `dirac1_normal`.

| PARTITION | ACCOUNT | NODES | NODE LIST | NODE FEATURES | SHARED | QOS | QOS LIMIT | | --- | --- | --- | --- | --- | --- | --- | --- | | dirac1 | dirac1 | 128 | n0[000-127].dirac1 | dirac1 | Exclusive | dirac1_lowprio dirac1_normal dirac1_highprio | no limit no limit no limit |

## Software Configuration

DIRAC1 uses Software Module Farm Environment Modules to manage the cluster wide software installation.

## Cluster Status

Please visit [here](http://metacluster.lbl.gov/warewulf/dirac1) for the live status of DIRAC1 cluster.

## Additional Information

Please send us tickets to hpcshelp@lbl.gov or send email to ScienceIT@lbl.gov for any inquiries or service requests.

# Project Accounts

The Lawrencium cluster is open to all Berkeley Lab researchers needing access to high performance computing. Research collaborations are also welcome provided that there is a LBNL PI.

LBNL PIs wanting to obtain access to Lawrencium for their research project will need to complete the project request at [myLRC portal](https://mylrc.lbl.gov/){:target="_blank"} {{ ext }}, giving the details of the research activity along with a list of anticipated users. A unique group name will be created for the project and associated users. This group name will be used to setup allocations and report usage.

There are three primary ways to obtain access to Lawrencium:

1. **LBNL PIs**: requesting a block of no-cost computing time via a PI Computing Allowance (PCA). This option is currently offered to all eligible Berkeley Lab PIs. For additional details on please see [PI Computing Allowance](https://it.lbl.gov/service/scienceit/high-performance-computing/lrc/computing-on-lawrencium/pi-computing-allowance/) {:target="_blank"} {{ ext }}.

2. **Condo projects**: purchasing and contributing Condo nodes to the cluster. This option is open to any Berkeley Lab staff, and provides ongoing, priority access to you and your research affiliates who are members of the Condo. For details, please see Condo Cluster Service.

3. **Recharge use**: Berkeley lab researchers who want to use Lawrencium cluster at a minimal recharge rate, roughly at $0.01/SU. For details, please see Recharge Allocation Computing Allowance.

To request a PCA, Condo or Recharge project on Lawrencium, please send your requests at [myLRC portal](https://mylrc.lbl.gov/){:target="_blank"} {{ ext }}. Make sure choosing the desired project type on the form.

### Changing Your ProjectID
If your projectID associated with project accounts on Lawrencium expires or becomes invalid, you can request of changing your projectID by sending us email at [hpcshelp@lbl.gov](mailto:hpcshelp@lbl.gov).

### Allocations

**Computer Time**: We are currently not using an allocation process to allocate compute time to individual projects. Instead, usage and priority will be regulated by a scheduler policy intended to provide a level of fairness across users. If needed, a committee consisting of scientific division representatives will review the need for allocations if demand exceeds supply.

**Cost**: There is a nominal charge of $25/mo/user for the use of Lawrencium to cover the costs of home directory storage and backups. PCA Project accounts are not charged for usage. Recharge accounts are charged $0.01/SU for compute. Account fees and cpu usage will appear as LRCACT and LRCCPU in the LBL Cost Browser.

**Storage**: Home directory space will have a quota set at 20GB per user. Users may also use the `/clusterfs/lawrencium` shared filesystem which does not have a quota; this file system is intended for short term use and should be considered volatile. Backups are not performed on this file system. Data is subject to periodic purge policy wherein any files which are not accessed with in the last 14 days will be deleted. Users should make sure to have a back up of these files to some external permanent storage as soon as they are generated on the cluster.

**Lustre**: Lustre parallel file system is also now available for Lawrencium cluster users. The file system is built with 4 OSS and 15 OST servers with a capacity of 1.8PB. The default striping is set to 4 OSTs with strip size of 1 MB. All the Lawrencium cluster users will receive a directory created under `/clusterfs/lawrencium` with the above default stripe values set. This is a scratch file system, so its mainly intended for storing large input or output files for running jobs and for all the parallel I/O needs on the Lawrencium cluster. This file system is intended for short term use and should be considered volatile. Backups are not performed on this file system. Data in scratch is subject to periodic purge policy wherein any files which are not accessed with in the last 14 days will be deleted. Users should make sure to have a back up of these files to some external permanent storage as soon as they are generated on the cluster.

### Acknowledgements

Please acknowledge Lawrencium in your publications. A sample statement is:

!!! note "Sample Acknowledgement Statement"
    This research used the Lawrencium computational cluster resource provided by the IT Division at the Lawrence Berkeley National Laboratory (Supported by the Director, Office of Science, Office of Basic Energy Sciences, of the U.S. Department of Energy under Contract No. DE-AC02-05CH11231)

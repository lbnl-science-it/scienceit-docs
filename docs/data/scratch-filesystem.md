!!! warning "Draft - Work in Progress"

    This is a work in progress draft page. The final details and scratch purge policy implementaiton might be different from what you see in this draft.

# Lawrencium Scratch Filesystem

## Overview
The Lawrencium `SCRATCH` filesystem is a high-performance Lustre file system designed for cluster jobs with significant I/O needs. It provides large-scale storage intended for temporary data processing and active job execution; it should not be used to long-term data storage. The Lawrencium `SCRATCH` filesystem currently has more than 7 PB of disk space. 

## Path and Access
Your personal scratch directory is located at:
```
/global/scratch/users/$USER
```
and can be referenced usin the environment variable `$SCRATCH`.

## Scratch Purge Policy
Beginning in mid-2026, we will be implementing a `SCRATCH` file purge policy. The functioning and performance of the whole cluster for all users can be impacted when the `SCRATCH` filesystem is near full. It is therefore important that we implement a purge policy.

We will use the access time of a file, known as `atime`, to determine the files to be purged. Files that have not been accessed for one year will be deleted.

User scratch directories will also be deleted when the user accounts are deleted.

For long-term data storage, ScienceIT offers [SPSS service](https://it.lbl.gov/service/scienceit/data-management-and-storage/scientific-project-storage-service/), which can be cheaper than cloud storage.

## Best Practices
**Use for Active Jobs**: You should consider `SCRATCH` as primarily a large space available to you when your job requires to read or write a large amount of data. You should not consider it as a place to store your data or simulation results for a long time.

**Do not Store Critical Data**: Since `SCRATCH` is not backed up, you should not use it to store source code and final processed results.

**Regular Cleanup**: Removing old or temporary files when you are done processing them helps the cluster by freeing up space and improving performance.

**Avoid using large number of files**: Whenever possible, you should use fewer number of files rather than millions of small individual files. This is because there are filesystem limits on the number of files in addition to the space. You can make use archive formats (tar, zip) as well as libraries such as HDF5 to limit the number of files.

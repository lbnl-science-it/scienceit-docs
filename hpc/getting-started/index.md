# Getting Started

## Project Accounts

There are three primary ways/projects to obtain access to Lawrencium:

- PI Computing Allowance (PCA): free 500K SUs annual renewable
- Condo: purchase and contribute Condo nodes to the Lawrencium cluster
- Recharge: charged at a minimal recharge rate roughly at $0.01/SU

[How to get a Project Account on Lawrencium?](https://scienceit-docs.lbl.gov/hpc/accounts/project-accounts/index.md)

Project Group Directories

Project group directories are not created by default. If you would like to create group directories wehre your group members can share data and software, please submit a [service request on freshservice](https://lbl.freshservice.com/a/catalog/request-items/169).

## User Accounts

You must have a user account to gain access to the Lawrencium cluster.

[How to request a User Account and Submit User Agreement?](https://scienceit-docs.lbl.gov/hpc/accounts/user-accounts/index.md)

## Logging in

You'll need to generate and enter a one-time password each time you log in.

[Click here for more information on logging in to Lawrencium](https://scienceit-docs.lbl.gov/hpc/accounts/loggingin/index.md)

## Data Movement and Storage

To transfer data from other computers into - or out of - your various storage directories, you can use protocols and tools like SCP, STFP, FTPS, and Rsync. If you’re transferring lots of data, the web-based [Globus Connect](https://scienceit-docs.lbl.gov/data/globus-instructions/index.md) tool is typically your best choice: it can perform fast, reliable, unattended transfers.

The LRC supercluster’s dedicated Data Transfer Node is `lrc-xfer.lbl.gov`. For more information on getting your data onto and off of Lawrencium, please see [Data Transfer](https://scienceit-docs.lbl.gov/hpc/data-transfer-node/index.md).

## Software Module Farm and Environment Modules

A lot of software packages and tools are already built as Software Module Farm and provided for your use. These software packages and tools can be loaded and unloaded via Environment Module commands. For details see [Software Module Farm](https://scienceit-docs.lbl.gov/hpc/software/software-module-farm/index.md) and [Module Management](https://scienceit-docs.lbl.gov/hpc/software/module-management/index.md).

## Running Jobs

When you log into a cluster, you’ll land on one of several login nodes. Here you can edit scripts, compile programs etc. However, you should not be running any applications or tasks on the login nodes, which are shared with other cluster users. Instead, use the SLURM job scheduler to submit jobs that will be run on one or more of the cluster’s many compute nodes. For details see [Slurm Overview](https://scienceit-docs.lbl.gov/hpc/running/slurm-overview/index.md) and [Example Scripts](https://scienceit-docs.lbl.gov/hpc/running/script-examples/index.md).

## Open OnDemand

We provide interactive Apps, such as Jupyter notebooks, RStudio, MatLab, through the browser-based Open OnDemand service at <https://lrc-ondemand.lbl.gov> . Use your LRC username and PIN+one-time password(OTP).

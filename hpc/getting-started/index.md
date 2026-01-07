# Getting Started

## Project Accounts

There are three primary ways/projects to obtain access to Lawrencium:

- PI Computing Allowance (PCA): free 500K SUs annual renewable
- Condo: purchase and contribute Condo nodes to the Lawrencium cluster
- Recharge: charged at a minimal recharge rate roughly at $0.01/SU

[How to get a Project Account on Lawrencium?](../accounts/project-accounts/)

Project Group Directories

Project group directories are not created by default. If you would like to create group directories wehre your group members can share data and software, please submit a [service request on freshservice](https://lbl.freshservice.com/a/catalog/request-items/169).

## User Accounts

You must have a user account to gain access to the Lawrencium cluster.

[How to request a User Account and Submit User Agreement?](../accounts/user-accounts/)

## Logging in

You'll need to generate and enter a one-time password each time you log in.

[Click here for more information on logging in to Lawrencium](../accounts/loggingin/)

## Data Movement and Storage

To transfer data from other computers into - or out of - your various storage directories, you can use protocols and tools like SCP, STFP, FTPS, and Rsync. If you’re transferring lots of data, the web-based [Globus Connect](../../data/globus-instructions/) tool is typically your best choice: it can perform fast, reliable, unattended transfers.

The LRC supercluster’s dedicated Data Transfer Node is `lrc-xfer.lbl.gov`. For more information on getting your data onto and off of Lawrencium, please see [Data Transfer](../data-transfer-node/).

## Software Module Farm and Environment Modules

A lot of software packages and tools are already built as Software Module Farm and provided for your use. These software packages and tools can be loaded and unloaded via Environment Module commands. For details see [Software Module Farm](../software/software-module-farm/) and [Module Management](../software/module-management/).

## Running Jobs

When you log into a cluster, you’ll land on one of several login nodes. Here you can edit scripts, compile programs etc. However, you should not be running any applications or tasks on the login nodes, which are shared with other cluster users. Instead, use the SLURM job scheduler to submit jobs that will be run on one or more of the cluster’s many compute nodes. For details see [Slurm Overview](../running/slurm-overview/) and [Example Scripts](../running/script-examples/).

## Open OnDemand

We provide interactive Apps, such as Jupyter notebooks, RStudio, MatLab, through the browser-based Open OnDemand service at <https://lrc-ondemand.lbl.gov> . Use your LRC username and PIN+one-time password(OTP).

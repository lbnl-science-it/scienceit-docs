# Getting Started

!!! info "About this page"

    An overview of HPC User Documentation

## Project Accounts

There are three primary ways/projects to obtain access to Lawrencium:

* PI Computing Allowance (PCA): free 500K SUs annual renewable
* Condo: purchase and contribute Condo nodes to the Lawrencium cluster
* Recharge: charged at a minimal recharge rate roughly at $0.01/SU

!!! question "[How to get a Project Account on Lawrencium?](accounts/project-accounts.md)"

## User Accounts

You must have a user account to gain access to the Lawrencium cluster. 

!!! question "[How to request a User Account and Submit User Agreement?](accounts/user-accounts.md)"

## Logging in

You'll need to generate and enter a one-time password each time you log in.

!!! info "[Click here for more information on logging in to Lawrencium](accounts/loggingin.md)"

## Data Movement and Storage

To transfer data from other computers into - or out of - your various storage directories, you can use protocols and tools like SCP, STFP, FTPS, and Rsync. If you’re transferring lots of data, the web-based [Globus Connect](../data/globus_instructions.md) tool is typically your best choice: it can perform fast, reliable, unattended transfers. 

The LRC supercluster’s dedicated Data Transfer Node is `lrc-xfer.lbl.gov`. For more information on getting your data onto and off of Lawrencium, please see [Data Transfer](../data/datatransfer_node.md).

## Software Module Farm and Environment Modules

A lot of software packages and tools are already built as Software Module Farm and provided for your use. These software packages and tools can be loaded and unloaded via Environment Module commands. For details see [Software Module Farm](software/software-module-farm.md) and [Module Management](software/module-management.md).

## Running Jobs

When you log into a cluster, you’ll land on one of several login nodes. Here you can edit scripts, compile programs etc. However, you should not be running any applications or tasks on the login nodes, which are shared with other cluster users. Instead, use the SLURM job scheduler to submit jobs that will be run on one or more of the cluster’s many compute nodes. For details see [Slurm Overview](hpc/running/slurm_overview.md) and [Example Scripts](hpc/running/script_examples.md).

## Open OnDemand

We provide interactive Apps, such as Jupyter notebooks, RStudio, MatLab, through the browser-based Open OnDemand service at [https://lrc-ondemand.lbl.gov](https://lrc-ondemand.lbl.gov). Use your LRC username and PIN+one-time password(OTP).
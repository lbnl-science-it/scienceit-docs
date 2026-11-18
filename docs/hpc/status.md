---
title: Lawrencium Status and Announcements
---

# Lawrencium Status and Announcements

!!! warning "Draft"

    This page is a draft. The Lawrencium status dashboard has not been launched yet, so the dashboard linked below is a preview and may not reflect the current state of the cluster. Until it launches, please see the [HPC Service Announcements](https://it.lbl.gov/service/scienceit/high-performance-computing/status/){:target="_blank"} {{ ext }} page for service updates.

The current status of each Lawrencium component is published on an external status dashboard, which also shows component uptime over recent days and any active incidents or scheduled maintenance.

[View the Lawrencium Status Dashboard](https://lbl-science-it-lrc-demo.statuspage.io/){ .md-button .md-button--primary target="_blank" }

To get notified when an incident is opened, updated, or resolved, or when maintenance is scheduled, use the **Subscribe to Updates** button on the dashboard's home page. Broader service announcements are also posted on the [HPC Service Announcements](https://it.lbl.gov/service/scienceit/high-performance-computing/status/){:target="_blank"} {{ ext }} page.

## System Status Definitions

The components below are the ones listed on the status dashboard and referred to in status announcements.

| Component | Description |
|-----------|-------------|
| Home Directory Storage | `/global/home`, including user home directories (`/global/home/users`) and group directories (`/global/home/groups`, `/global/home/groups-sw`). See [storage and backup](index.md#storage-and-backup). |
| Scratch Storage | The Lustre parallel scratch file system, `/global/scratch` |
| Login Nodes | Shared nodes reached through `lrc-login.lbl.gov`, used for editing files, compiling code, and submitting jobs. See [Logging in](accounts/loggingin.md). |
| Compute Nodes | Nodes in the Lawrencium CPU and Einsteinium GPU partitions, and supported research (condo) clusters, that run batch and interactive jobs |
| Data Transfer Nodes (DTNs) | `lrc-xfer.lbl.gov`, the dedicated node for moving data to and from Lawrencium, including Globus transfers. See [Using the lrc-xfer DTN](data-transfer-node.md). |
| Job Scheduler | [Slurm](running/slurm-overview.md), which queues, schedules, and accounts for jobs |
| Network | Connectivity between Lawrencium, the LBL network, and the internet |
| Open OnDemand (OOD) | Browser-based access to Lawrencium at [https://lrc-ondemand.lbl.gov](https://lrc-ondemand.lbl.gov){:target="_blank"} {{ ext }}, including the file browser, shell access, and interactive apps such as Jupyter, RStudio, and VS Code. See [Open OnDemand Overview](openondemand/overview.md). |
| MyLRC User Portal | The portal at [https://mylrc.lbl.gov](https://mylrc.lbl.gov){:target="_blank"} {{ ext }} for managing project accounts, user accounts, and project membership. See [Using the MyLRC Portal](accounts/mylrc.md). |

## Component Statuses

Each component on the dashboard is shown with one of the following statuses.

### Operational

The component is working normally, and you can use it for everything you would expect to.

### Degraded Performance, Partial Outage, and Major Outage

**Degraded Performance:** The component still works, but something is impaired. You might see slower performance, higher latency, or intermittent errors. This status can also be used when a problem in another system the component depends on noticeably limits it.

**Partial Outage:** The component is not completely down, but some users cannot do what they normally would, or one of its functions is unavailable.

**Major Outage:** The component is unavailable, and users cannot do what they normally would with it.

The table below shows what each of these statuses typically means for each component.

| Component | Degraded Performance | Partial Outage | Major Outage |
|-----------|----------------------|----------------|--------------|
| Home Directory Storage | Slow file access | Not mounted on some login or compute nodes | Inaccessible from all nodes |
| Scratch Storage | Slow file access | Not mounted on some login or compute nodes, or some files are temporarily unavailable | Inaccessible from all nodes |
| Login Nodes | Slow or unresponsive logins or sessions | Some login nodes unavailable | Unable to log in |
| Compute Nodes | Some nodes down due to hardware or software problems | One or more partitions unavailable | Jobs cannot run due to a widespread failure |
| Data Transfer Nodes (DTNs) | Slow transfers | Globus or SSH-based transfers unavailable | Unable to log in to or transfer data through the DTN |
| Job Scheduler | Slow responses to Slurm commands, or jobs slow to start | — | Unable to submit jobs, or jobs are not being scheduled |
| Network | Reduced bandwidth or packet loss | Lawrencium reachable from some networks but not others | Lawrencium unreachable |
| Open OnDemand (OOD) | Accessible but slow | Some apps or interactive sessions unavailable | Inaccessible |
| MyLRC User Portal | Accessible but slow | — | Inaccessible |

A dash (—) means that status is not used for that component.

### Under Maintenance

The component is in a scheduled maintenance window. This status is used only for planned maintenance, not for unplanned outages.

## Incident Statuses

When a problem is reported on the dashboard, its incident moves through the following statuses.

### Investigating

A possible problem has been reported and is being looked into. Its cause, scope, and severity are not yet known.

### Identified

The cause of the problem has been found and a fix is being worked on.

### Monitoring

A fix has been put in place, and the affected components are being watched to make sure the problem is resolved.

### Resolved

The problem has been fixed and the affected components are working normally.

If you are experiencing a problem that is not shown on the status dashboard, please contact the [HPC Help Desk](../help/index.md).

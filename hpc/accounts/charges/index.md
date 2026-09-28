# Charges and Billing

Lawrencium has two separate charges. They appear in the LBL Cost Browser under the codes **LRCACT** and **LRCCPU**.

The $25/month account fee is for the account, not for compute

Every Lawrencium user account is charged **$25 per month (LRCACT)** for account maintenance and home directory backups. The charge is made **as long as the user account and its home directory exist**, regardless of:

- whether any jobs were run that month,
- the type of project the user belongs to (PCA, Condo or Recharge),
- whether the user still belongs to any project, or whether the account is blocked from logging in.

The only way to stop this charge is to [close the user account](#stopping-the-account-fee).

## The Two Charges at a Glance

|                       | LRCACT (account fee)                               | LRCCPU (compute usage)                                                                                                    |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Amount**            | $25 per user account per month                     | $0.01 per Service Unit (SU); the [effective rate](https://scienceit-docs.lbl.gov/hpc/#recharge-model) varies by partition |
| **Applies to**        | Every user account on the cluster                  | Jobs run under a recharge (`ac_*`) project account                                                                        |
| **Depends on usage?** | **No**                                             | Yes                                                                                                                       |
| **Covers**            | Account maintenance and home directory backups     | Compute time used by jobs                                                                                                 |
| **Billed to**         | The PID selected when the user account was created | The PID associated with the recharge project account                                                                      |
| **Stops when**        | The user account is closed                         | No more jobs are run under the `ac_*` account                                                                             |

## Account Fee (LRCACT)

The $25/month fee is charged per **user account**, not per project. A user who belongs to several projects still has one user account and pays one account fee.

The fee is billed to the Project ID (PID) selected when the cluster account was created. To bill the fee to a different PID, submit a [PID change request](https://lbl.freshservice.com/a/catalog/request-items/167) .

Accounts are not closed automatically

User accounts are **not** closed automatically when someone leaves the Lab, finishes a project, stops running jobs, or is removed from their last project. In each of these cases the account and its home directory still exist, so the account fee is still charged. PIs should request closure of accounts that are no longer needed.

## Compute Usage (LRCCPU)

Compute charges apply only to jobs submitted with a recharge project account (`ac_*`), for example `--account=ac_abc`. The charge depends on the partition, the resources allocated to the job and how long the job runs. See the [Recharge Model](https://scienceit-docs.lbl.gov/hpc/#recharge-model) for the SU rates of each partition and an example of how usage is calculated. The [LRC Jobscript Generator](https://lbnl-science-it.github.io/lrc-jobscript/src/lrc-calculator.html) can estimate the SUs used by a job.

The prefix of a project account shows whether compute usage under it is charged:

| Account prefix | Project type                 | Compute charges (LRCCPU)                               |
| -------------- | ---------------------------- | ------------------------------------------------------ |
| `pc_*`         | PI Computing Allowance (PCA) | None; compute is at no cost up to the annual allowance |
| `lr_*`         | Condo                        | None, when running within the condo contribution       |
| `ac_*`         | Recharge                     | $0.01/SU (effective rate varies by partition)          |

To see which project accounts you can use, run:

```
sacctmgr show association -p user=$USER
```

See [Slurm Association](https://scienceit-docs.lbl.gov/hpc/running/slurm-overview/#slurm-association) for how to read the output.

Running beyond a condo contribution or a PCA allowance

A condo or PCA project does not automatically come with a recharge (`ac_*`) account, and jobs do not automatically switch to one. To run outside a condo contribution, or after a PCA allowance is used up, the PI must request a recharge (or PCA) project account at the [myLRC portal](https://mylrc.lbl.gov/) . Users must then set `--account` in their Slurm scripts to the new account.

## Examples

I have a PCA (`pc_*`) account only. Am I charged anything?

There are no compute charges for jobs under a PCA account. You are still charged the $25/month account fee for as long as your user account exists.

I haven't run any jobs in months. Why am I still charged $25/month?

The account fee pays for account maintenance and home directory backups, not for compute. It is charged every month as long as your user account and home directory exist, whether or not you run jobs.

A student or postdoc has left the Lab. Does their account fee stop?

No. Accounts are not closed automatically when someone leaves the Lab. The PI or main contact should request closure of the account and arrange for the user's files and data to be moved.

## Stopping the Account Fee

To stop the account fee, the user account must be closed. The PI, the project's main contact or the account holder can request closure by submitting a [user account closure request](https://lbl.freshservice.com/a/catalog/request-items/166) on Freshservice. Removing a user from a project in the [myLRC portal](https://mylrc.lbl.gov/) does **not** close their user account or stop the account fee. Before closing an account, copy any software, files or data that others depend on out of the user's home directory. Once an account is closed, the account fee no longer appears on the next month's bill.

See [Closing User Accounts](https://scienceit-docs.lbl.gov/hpc/accounts/user-accounts/index.md) for more details.

Questions about charges can be sent to [scienceithelp@lbl.gov](mailto:scienceithelp@lbl.gov).

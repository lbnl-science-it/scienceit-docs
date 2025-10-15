# Logging in to Lawrencium

!!! note "Multi-Factor Authentication (MFA)"
    Please make sure you have configured [Multi-Factor Authentication (MFA)](mfa.md) before logging in for the first time.

You’ll need to generate and enter a one-time password each time that you log in. You’ll use an application called Google Authenticator to generate these passwords, which you can install and run on your smartphone and/or tablet. For instructions on setting up and using Google Authenticator, see [Multi-Factor Authentication](mfa.md). Once you have your PIN+OTP set up you can login to cluster using a ssh client of your choice or Linux/Mac terminal as 

```sh 
ssh username@lrc-login.lbl.gov
```

You will be prompted to enter your password. Enter your PIN+OTP without any spaces. For example if your pin is `0123` and OTP is `456789`, then you will type it as `0123456789`. Note that the characters won’t appear on the screen.

!!! warning "Running jobs"
    The login nodes should not be used for running jobs. They should only be used to write scripts and submit jobs to the compute nodes.

    More details on writing job scripts and submitting them can be found [here](../running/script-examples.md).

## SSH Certificate

To access the cluster without a password, you can use SSH certificates. An SSH Certificate Authority issues signed SSH keys with a specified validity period. Script and instructions to request SSH certificates are given below. You will then receive an SSH key triplet consisting of a public key, a signed public key, and a private key. The certificate is automatically set to expire after the designated time period, or after 12 hours if no duration is specified. You or an administrator can revoke the certificate at any time.

To get started, clone the [github repository lrc-scripts](https://github.com/lbnl-science-it/lrc-scripts) which includes the scripts `request-cert.sh` and `revoke_key.sh`.

``` 
git clone https://github.com/lbnl-science-it/lrc-scripts.git
```

The script `request_cert.sh` (when used with `-p lrc`) will create a certificate in your `$HOME/.ssh/ssh_certs` directory with name `lrc_cert`. Since the certificates can only be used for up to 12 hours, you will have to recreate a certificate after 12 hours if used in following way. When prompted enter your Lawrencium username, PIN and OTP while generating a certificate and then use the ssh command as shown below to login.

```sh
cd lrc-scripts 
./request_cert.sh -p lrc
ssh -i ~/.ssh/ssh_certs/lrc_cert -l username lrc-login.lbl.gov
```
where `username` is your Lawrencium user name. 

To list help options for the script:
```
./request_cert.sh --help
```

## VS Code Remote - SSH

The SSH Certificate method is useful for users interested in using the [Remote-SSH][remoteSshLink] VSCode extension to connect to Lawrencium. You could set up the remote host in the `~/.ssh/config` file on your personal machine by adding following lines.

```sh
Host lrc-login
   User username
   HostName lrc-login.lbl.gov
   IdentityFile ~/.ssh/ssh_certs/lrc_cert
```

When you connect to Lawrencium through VSCode Remote - SSH, **please be careful to not run computations when you are on the login node**. 

### VS Code Remote - SSH on a Compute Node

If you have a SLURM allocation on a compute node, you can run VS Code Remote - SSH directly on that compute node. As an example, suppose you request and have been allocated a SLURM allocation on lr6 node using the following command:

```
salloc -p lr6 -A account_name -q lr_normal -N 1 -t 1:00:00
```

When the job is allocated you will be shown information about which node has been allocated to you (e.g. `n0029.lr6` in the format `n????.???` for `lr` and `es` nodes). Alternatively, you can use the environment variable `SLURM_NODELIST` to get the hostname of the node allocated to you. Another possibility is to use the command `squeue -u $USER` to list your jobs and the corresponding nodelists.

You should add the following to your `~/.ssh/config` or update the relevant blocks in your `~/.ssh/config` file:

```
Host lrc-login
    LogLevel QUIET
    HostName lrc-login.lbl.gov
    IdentityFile ~/.ssh/ssh_certs/lrc_cert
    IdentitiesOnly yes
    ForwardAgent yes
    User username

Host n????.???
    LogLevel QUIET
    StrictHostKeyChecking no
    ProxyJump lrc-login
    HostName %h
    User username
```

Once you have the allocation, try connecting to the host: `> Remote-SSH: Connect to Host...` from the Command Palette using the hostname of the node allocated to you on the cluster. If you are prompted for a password use your cluster password (PIN+OTP).

[remoteSshLink]: https://code.visualstudio.com/docs/remote/ssh

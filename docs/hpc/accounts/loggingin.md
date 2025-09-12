
!!! note "Multi-Factor Authentication (MFA)"
    Please make sure you have configured [Multi-Factor Authentication (MFA)](mfa.md) before logging in for the first time.

You’ll need to generate and enter a one-time password each time that you log in. You’ll use an application called Google Authenticator to generate these passwords, which you can install and run on your smartphone and/or tablet. For instructions on setting up and using Google Authenticator, see Multi-Factor Authentication. Once you have your PIN+OTP set up you can login to cluster using a ssh client of your choice or Linux/Mac terminal as 

```sh 
ssh username@lrc-login.lbl.gov
```

You will be prompted to enter your password. Enter your PIN+OTP without any spaces. For example if your pin is `0123` and OTP is `456789`, then you will type it as `0123456789`. Note that the characters won’t appear on the screen.

!!! warning "Running jobs"
    The login nodes should not be used for running jobs. They should only be used to write scripts and submit jobs to the compute nodes.

    More details on writing job scripts and submitting them can be found [here](../running/script-examples.md).

## SSH Certificate

To access the cluster without a password, you can use an SSH certificate. This is achieved by acting as SSH Certificate Authority, issuing signed SSH keys with a specified validity period. To obtain a certificate, request access for a desired duration. You will then receive an SSH key triplet consisting of a public key, a signed public key, and a private key. The certificate is automatically set to expire after the designated time period, or after 12 hours if no duration is specified. You or an administrator can revoke the certificate at any time.

To get started you may download the request_cert.sh and revoke_key.sh scripts on your computer. Check help for the script and execute using following commands
```sh 
bash request_cert.sh --help
bash request_cert.sh
```
The lrc_cert will be created in the ~/.ssh directory on your computer. To ssh using a certificate use following command
```sh
ssh -i ~/.ssh/lrc_cert -l $USER lrc-login.lbl.gov
```
$USER is your lawrencium user name. 
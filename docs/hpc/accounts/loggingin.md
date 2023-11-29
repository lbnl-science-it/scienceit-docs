
You’ll need to generate and enter a one-time password each time that you log in. You’ll use an application called Google Authenticator to generate these passwords, which you can install and run on your smartphone and/or tablet. For instructions on setting up and using Google Authenticator, see Multi-Factor Authentication. Once you have your PIN+OTP set up you can login to cluster using a ssh client of your choice or Linux/Mac terminal as 

```sh 
ssh username@lrc-login.lbl.gov
```

You will be prompted to enter your password. Enter your PIN+OTP without any spaces. For example if your pin is `0123` and OTP is `456789`, then you will type it as `0123456789`. Note that the characters won’t appear on the screen.

!!! warning "Running jobs"
    The login nodes should not be used for running jobs. They should only be used to write scripts and submit jobs to the compute nodes.

    More details on writing job scripts and submitting them can be found here.
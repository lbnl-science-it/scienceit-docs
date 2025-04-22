To improve the data transfer experience of our supercluster, a separate dedicated data transfer server is available.

`lrc-xfer.lbl.gov` mounts all the cluster file systems such that users can transfer data into/from any cluster filesystem. Also NERSC HPSS data transfer utilities like `hsi` and `htar` are configured to work on this server.

## Data Transfer Examples On Linux

Transfer data from a local machine to Lawrencium

```
scp file-xxx $USER@lrc-xfer.lbl.gov:/global/home/users/$USER

```

```
scp -r dir-xxx $USER@lrc-xfer.lbl.gov:/global/scratch/$USER

```

Transfer from Lawrencium to a local machine

```
scp $USER@lrc-xfer.lbl.gov:/global/scratch/$USER/file-xxx ~/Desktop

```

Transfer from Lawrencium to Another Institute

```
ssh $USER@lrc-xfer.lbl.gov   # DTN

```

```
scp -r $USER@lrc-xfer.lbl.gov:/file-on-lawrencium $USER@other-institute:/destination/path/

```

## Rsync: data transfer and backup tool

```
rsync -avpz file-at-local $USER@lrc-xfer.lbl.gov:/global/home/user/$USER 

```

## Data Transfer Examples On Windows

- WinSCP: SFTP client and FTP client for Microsoft Windows
- FileZilla: multi-platform program via SFTP

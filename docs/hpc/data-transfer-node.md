To improve the data transfer experience of our supercluster, a separate dedicated data transfer server is available.

`lrc-xfer.lbl.gov` mounts all the cluster file systems such that users can transfer data into/from any cluster filesystem. Also NERSC HPSS data transfer utilities like `hsi` and `htar` are configured to work on this server.

## Data Transfer Examples On Linux


!!! example "Transfer data from a local machine to Lawrencium"
    === "File transfer"
        ```bash 
        scp file-xxx $USER@lrc-xfer.lbl.gov:/global/home/users/$USER
        ```

    === "Folder transfer"
        ```bash
        scp -r dir-xxx $USER@lrc-xfer.lbl.gov:/global/scratch/$USER
        ```

!!! example "Transfer from Lawrencium to a local machine"
    ```bash
    scp $USER@lrc-xfer.lbl.gov:/global/scratch/$USER/file-xxx ~/Desktop
    ```

!!! example "Transfer from Lawrencium to Another Institute"
    ```bash 
    ssh $USER@lrc-xfer.lbl.gov   # DTN
    ```

    ```bash
    scp -r $USER@lrc-xfer.lbl.gov:/file-on-lawrencium $USER@other-institute:/destination/path/
    ```


## Rsync: data transfer and backup tool

```bash 
rsync -avpz file-at-local $USER@lrc-xfer.lbl.gov:/global/home/user/$USER 
```


## Data Transfer Examples On Windows

* WinSCP: SFTP client and FTP client for Microsoft Windows
* FileZella: multi-platform program via SFTP
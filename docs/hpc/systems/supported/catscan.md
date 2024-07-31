# Catscan

The Catscan cluster is an XCAT stand alone cluster.

**Login node**: catscan.lbl.gov

Sports a 269Tb zfs filesystem for data and computational scratch space on /pool0 (see below)

Compute nodes: n0000, n0001, n0002, n0003

## Cluster Configuration

| Node | Access | Storage | Filesystems | Description of Use | CPU | CORES | MEMORY | GPU |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| catscan.lbl.gov | ssh with either LDAP credentials or password provided by administrator | /home: local drive, 211G <br/> <br/> /pool0 ZFS filesystem, 269T | /clusterfs/bebb/users <br/> <br/> /clusterfs/bebb/group-sw | Login node | Intel(R) Xeon(R) Gold 6126 | 48 (HT Enabled) | 196 GB | N/A |
| n000[0-1] | ssh from catscan.lbl.gov with cluster key | As above via nfs | As above via nfs | Compute node | Intel(R) Xeon(R) Gold 6126 | 48 (HT Enabled) | 196 GB | 4x NVIDIA GeForce GTX 1080 Ti |
| n000[2-3] | ssh from catscan.lbl.gov with cluster key | As above via nfs | As above via nfs | Compute node | | 24 | 188 GB | 2x NVIDIA RTX A4500 |

**Operating System**: CentOS Linux release 7.9.2009 (Core)

**Nvidia driver & NVRM version**: NVIDIA UNIX x86_64 Kernel Module  510.73.05  Sat May  7 05:30:26 UTC 2022

Each compute node has 4 GPUS:

```jsx
CUDA Driver Version / Runtime Version          10.1 / 10.0 
CUDA Capability Major/Minor version number:    6.1 
Total amount of global memory:                 11178 MBytes (11721506816 bytes) 
(28) Multiprocessors, (128) CUDA Cores/MP:     3584 CUDA Cores 
GPU Max Clock rate:                            1582 MHz (1.58 GHz) 
Memory Clock rate:                             5505 Mhz 
Memory Bus Width:                              352-bit L2 
Cache Size:                                 2883584 bytes 
Maximum Texture Dimension Size (x,y,z)         1D=(131072), 2D=(131072, 65536), 3D=(16384, 16384, 16384) 
Maximum Layered 1D Texture Size, (num) layers  1D=(32768), 2048 layers 
Maximum Layered 2D Texture Size, (num) layers  2D=(32768, 32768), 2048 layers 
Total amount of constant memory:               65536 bytes 
Total amount of shared memory per block:       49152 bytes 
Total number of registers available per block: 65536 
Warp size:                                     32 
Maximum number of threads per multiprocessor:  2048 
Maximum number of threads per block:           1024 
Max dimension size of a thread block (x,y,z): (1024, 1024, 64) 
Max dimension size of a grid size    (x,y,z): (2147483647, 65535, 65535) 
Maximum memory pitch:                          2147483647 bytes 
Texture alignment:                             512 bytes 
Concurrent copy and kernel execution:          Yes with 2 copy engine(s) 
Run time limit on kernels:                     No 
Integrated GPU sharing Host Memory:            No 
Support host page-locked memory mapping:       Yes 
Alignment requirement for Surfaces:            Yes 
Device has ECC support:                        Disabled 
Device supports Unified Addressing (UVA):      Yes 
Device supports Compute Preemption:            Yes 
Supports Cooperative Kernel Launch:            Yes 
Supports MultiDevice Co-op Kernel Launch:      Yes 
Device PCI Domain ID / Bus ID / location ID:   0 / 94 / 0 
Compute Mode: < Default (multiple host threads can use ::cudaSetDevice() with device simultaneously) >
```

## Queue Configuration

At the moment, there is no resource manager/scheduler. Depending on how the resources are used, this may change.

## Additional Notes

### Authentication

Currently authentication is LDAP -- the same credentials that you would use to access gmail.lbl.gov. We are in the process of evaluating OTP over ssh keys, or simply OTP.

### Accessing the Compute nodes:

You will need to generate ssh-keys for intra-cluster access to the compute nodes. 

To do this run: 

```jsx
ssh-keygen -t ed25519
```

Then run 

```jsx
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

Then finally

```jsx
chmod 600 ~/.ssh/authorized_keys
```

The suggested default name and location should be fine. You will be prompted for a password, but to leave it blank just hit enter. Passwords can interfere with intra-cluster node communication when launching jobs, particularly with a scheduler should we choose to deploy one.

## Storage for Data

Each user will be granted space under `/clusterfs/bebb/users` for data. There is also a group directory to which the group has write permission. This directory should be used for custom builds of software of which the group may want to take advantage. This is modeled after what we offer on our clusters in 1275, but this is your cluster so you can choose to use it how you desire.

## Software Module Farm:

See [Documentation on using "modules"](/hpc/software/module-management/).

### Apptainer (formerly known as Singularity):

Some of you have expressed the need to import custom software built on different architectures. Instead of re-inventing this on the catscan architecture, you can use Apptainer. 

Apptainer enables users to have full control of their environment. Apptainer can be used to package entire scientific workflows, software and libraries, and even data. 

To get started, check out these links:

[Documentation on using Singularity on a cluster called Savio that we manage on UCB cluster](http://research-it.berkeley.edu/services/high-performance-computing/using-singularity-savio)

[Singularity documentation from SDSC (one of the top users of the tool in the community)](https://www.sdsc.edu/education_and_training/tutorials1/running_singularity_on_comet_feb_2019.html){:target="_blank"} {{ ext }}
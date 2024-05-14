# HDF5

## Loading HDF5

HDF5 on Lawrencium can be loaded after loading a MPI library. For example, to load HDF5 installed under the default gcc compiler and the default Open MPI on Lawrencium:

``` bash
[user@n0000 ~]$ module load gcc openmpi
[user@n0000 ~]$ module avail hdf5

------------- /global/software/rocky-8.x86_64/modules/openmpi/4.1.6-4xq5u5r/gcc/11.4.0 --------------
   hdf5/1.14.3
```
``` bash
[user@n0000 ~]$ module load hdf5
```

## Compiling programs using HDF5 library

Let's look at an example of compiling a simple C example `ph5_file_create.c` from [hdf5-examples](https://github.com/HDFGroup/hdf5-examples/tree/master/C/H5PAR){:target="_blank"} {{ ext }}. The example creates a HDF5 file named `SDS_row.h5`.

To compile using the loaded `HDF5` library, we need the appropriate `CFLAGS` and `LDFLAGS` during compilation and linking. These can be obtained in Lawrencium using 

``` bash
[user@n0000 ~]$ pkg-config --cflags --libs hdf5
-I/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/hdf5-1.14.3-6763puu3e5vxq4vmbaosgiv4yhzjb46s/include -L/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/hdf5-1.14.3-6763puu3e5vxq4vmbaosgiv4yhzjb46s/lib -lhdf5 
```

To include these directly in the compilation process, we can do the following:

``` bash
mpicc -o ph5_file_create $(pkg-config --cflags --libs hdf5) ph5_file_create.c
```
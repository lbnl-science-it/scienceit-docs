# NetCDF

## Loading netCDF

NetCDF on Lawrencium can be loaded after loading a MPI library. For example, to load netCDF installed using the default gcc compiler and the default Open MPI on Lawrencium:

```
[user@n0000 ~]$ module load gcc openmpi
[user@n0000 ~]$ module avail netcdf

------------- /global/software/rocky-8.x86_64/modfiles/openmpi/4.1.6-4xq5u5r/gcc/11.4.0 --------------
   netcdf-c/4.9.2    netcdf-fortran/4.6.1
```

As you can see on the output of `module avail netcdf`, a C version of the library `netcdf-c` and a fortran version of the library `netcdf-fortran` are available.

## Compiling programs using netCDF library

Let's look at an example of compiling a simple fortran example `simple_xy_rd.f90` from [Example netCDF programs](https://www.unidata.ucar.edu/software/netcdf/examples/programs/) . The example creates a netcdf file with a two-dimensional array of sample data.

To compile using the `netcdf-fortran` library, we need the appropriate `CFLAGS` and `LDFLAGS` during compilation and linking. These can be obtained in Lawrencium using

```
[user@n0000 ~]$ pkg-config --cflags netcdf-fortran
-I/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/netcdf-fortran-4.6.1-fjshq66ynuoqqbtns2n3pwerlpymqjkg/include -I/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/netcdf-c-4.9.2-heo4zhdmupk4ru7x6aujkoptuceeilh2/include 

[user@n0000 ~]$ pkg-config --libs netcdf-fortran
-L/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/netcdf-fortran-4.6.1-fjshq66ynuoqqbtns2n3pwerlpymqjkg/lib -lnetcdff
```

To include these directly in the compilation process, we can do the following:

```
gfortran -o simple_xy_rd $(pkg-config --cflags --libs netcdf-fortran) simple_xy_rd.f90
```

Before running the binary `simple_xy_rd`, you have to add the `netcdf-fortran` library path to the `LD_LIBRARY_PATH` environment variable.

```
export LD_LIBRARY_PATH=/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/netcdf-fortran-4.6.1-fjshq66ynuoqqbtns2n3pwerlpymqjkg/lib:$LD_LIBRARY_PATH
```

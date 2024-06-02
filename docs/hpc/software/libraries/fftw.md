# FFTW

## Loading FFTW

FFTW on Lawrencium can be loaded after loading a MPI library. For example, to load FFTW installed using the default gcc compiler and the default Open MPI on Lawrencium:

``` bash
[user@n0000 ~]$ module load gcc openmpi
[user@n0000 ~]$ module avail fftw

--------- /global/software/rocky-8.x86_64/modules/openmpi/4.1.6-4xq5u5r/gcc/11.4.0 --------
   fftw/3.3.10
```
``` bash
[user@n0000 ~]$ module load fftw/3.3.10
```

## Compiling programs using FFTW library

To compile using the loaded `fftw3` library, we need the appropriate `CFLAGS` and `LDFLAGS` during compilation and linking. These can be obtained in Lawrencium using 

``` bash
[user@n0000 ~]$ pkg-config --cflags --libs fftw3
-I/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/fftw-3.3.10-cf4npbktueip6tnwqf2qstog7on4pyfk/include -L/global/software/rocky-8.x86_64/gcc/linux-rocky8-x86_64/gcc-11.4.0/fftw-3.3.10-cf4npbktueip6tnwqf2qstog7on4pyfk/lib -lfftw3 
```

Note that the result above does not include linker flags for MPI FFTW routines. To compile program using `MPI FFTW`, in addition to `-lfftw3` we also need `-lfftw3_mpi` and `-lm` ([see here](https://www.fftw.org/fftw3_doc/Linking-and-Initializing-MPI-FFTW.html){:target="_blank"} {{ ext }}).

Therefore, to compile using MPI FFTW library:

``` bash
mpicc -o output $(pkg-config --cflags --libs fftw3) -lfftw_mpi -lm example_mpi_fftw.c
```

!!! note "Compiling using `rpath`"

    To compile using `rpath`, you need to add the following:

    ``` bash
    -Wl,-rpath,$(pkg-config --variable=libdir fftw3)
    ```

    Compiling with `rpath` adds the `libdir` to the runtime library search path in the executable file.
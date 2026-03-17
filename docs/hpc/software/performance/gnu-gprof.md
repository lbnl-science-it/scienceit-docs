# Gprof

On Lawrencium, `gprof` is available as part of the standard GNU binutils and does not require loading a module. Below is a concise guide on how to use it to profile your C,C++, or Fortran applications; please consult with [`gprof` documentation](https://sourceware.org/binutils/docs-2.30/gprof/index.html) for further details.

1. Compile with Profiling Enabled

    To use `gprof`, compile and link your code with `-pg` flag. This tells the compiler to insert code to collect profiling information.

    === "C"
        ```
        gcc -pg -o program program.c
        ```
    === "C++"
        ```
        g++ -pg -o program program.cpp
        ```
    === "Fortran"
        ```
        gfortran -pg -o program program.f90
        ```

2. Run the Program

    Execute the program normally. You should run this within a slurm job or an interactive session (not on a login node).

    When the program finishes execution, it will generate a file named `gmon.out` in the current working directory. For MPI applications, set the environment variable:

    ```
    export GMON_OUT_PREFIX=gmon.out
    ```

    such that each MPI rank will produce a unique file `gmon.out.pid` where `pid` is the process ID of the MPI process.

3. Generate the Profile Report

    After the run completes and `gmon.out` is created, use `gprof` to analyze the data. 

    ```
    gprof program gmon.out > analysis.txt
    ```

    The output file called `analysis.txt` in the example above contains a flat profile and a call graph.
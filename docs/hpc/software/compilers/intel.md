# Intel OneAPI Compilers on Lawrencium

`intel-oneapi-compilers` version `2023.1.0` is available on Lawrencium which consists of both the new LLVM-based oneAPI compilers `icx, icpx, ifx` and the  intel classic compilers `icc, icpc, ifort`. The default intel-oneapi-compilers` module can be loaded as:

``` bash
module load intel-oneapi-compilers
```

## LLVM-based oneAPI Compilers
The version of LLVM-based oneAPI compilers `icx, icpx, ifx` follow the version of the oneapi package. Some relevant reference pages on the intel documentation website for the `2023.1.0` version of oneAPI compilers installed on Lawrencium are listed below:

  * [Intel oneAPI DPC++/C++ Compiler Developer Guide and Reference](https://www.intel.com/content/www/us/en/docs/dpcpp-cpp-compiler/developer-guide-reference/2023-1/overview.html){:target="_blank"} {{ ext }}
  * [Intel Fortran Compiler Classic and Intel Fortran Compiler Developer Guide and Reference](https://www.intel.com/content/www/us/en/docs/fortran-compiler/developer-guide-reference/2023-1/overview.html){:target="_blank"} {{ ext }}

## Intel Classic Compilers

!!! note "Version scheme of Intel Classic Compilers"

    The versions of Intel classic compilers in the module `intel-oneapi-compilers/2023.1.0` is different than `2023.1.0`. The version of `ifort, icc, icpc` compilers in the module `intel-oneapi-compilers/2023.1.0` is `2021.9.0`

Some relevant reference pages on the intel documentation website for the `2021.9.0` version of Intel classic compilers installed on Lawrencium are listed below:

  * [Intel C++ Compiler Classic Developer Guide and Reference](https://www.intel.com/content/www/us/en/docs/cpp-compiler/developer-guide-reference/2021-9/overview.html){:target="_blank"} {{ ext }}
  * [Intel Fortran Compiler Classic and Intel Fortran Compiler Developer Guide and Reference](https://www.intel.com/content/www/us/en/docs/fortran-compiler/developer-guide-reference/2023-1/overview.html){:target="_blank"} {{ ext }}


## Additional References

  * [Porting Guide for ICC users to DPCPP or ICX](https://www.intel.com/content/www/us/en/developer/articles/guide/porting-guide-for-icc-users-to-dpcpp-or-icx.html){:target="_blank"} {{ ext }}
  * [Porting Guide for IFORT to IFX](https://www.intel.com/content/www/us/en/developer/articles/guide/porting-guide-for-ifort-to-ifx.html){:target="_blank"} {{ ext }}
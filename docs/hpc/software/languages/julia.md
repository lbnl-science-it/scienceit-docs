# Using Julia on Lawrencium

Julia is available on Lawrencium as a module.

``` bash
$ module av julia

-------------- /global/software/rocky-8.x86_64/modules/langs ---------------
   julia/1.10.2-11.4
```

``` bash
$ module load julia
$ julia
               _
   _       _ _(_)_     |  Documentation: https://docs.julialang.org
  (_)     | (_) (_)    |
   _ _   _| |_  __ _   |  Type "?" for help, "]?" for Pkg help.
  | | | | | | |/ _` |  |
  | | |_| | | | (_| |  |  Version 1.10.2 (2024-03-01)
 _/ |\__'_|_|_|\__'_|  |  Official https://julialang.org/ release
|__/                   |

julia> 
```

## Using Julia through Jupyter on Open OnDemand

To use a Julia notebook on the Jupyter app of Open OnDemand, install `IJulia` as follows on the Julia prompt:

``` julia
julia> using Pkg

julia> Pkg.add("IJulia")
```

When you install `IJulia` as a user, a jupyter kernel specification is added in your home directory at `~/.local/share/jupyter/kernels` and the kernel will be available on Open OnDemand Jupyter environment under `File > New Notebook` and under `Kernel > Change Kernel`. Additional information on installing `IJulia` and installing additional Julia kernels can be found [here](https://julialang.github.io/IJulia.jl/stable/manual/installation/){:target="_blank"} {{ ext }} .
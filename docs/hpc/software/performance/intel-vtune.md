# Intel VTune Profiler
Intel VTune Profiler is a performance analysis tool for finding hotspots in your code. Version `2025.6.0` is available on Lawrencium. 

### Loading the Module
```
module load intel-oneapi-compilers/2025.2.1
module load intel-oneapi-vtune/2025.6.0
```

### Compatibility with Partitions
The `2025.6.0` version of VTune requires Intel CPU architectures newer than  `icelake`. On Lawrencium, it can therefore be used on `lr7` and `es2` partitions.

### Using VTune with Other Compilers (e.g. GCC)
If you are using a different compiler (like `gcc`) and encounter module conflicts when loading `intel-oneapi-vtune`, you can manually add VTune to your environment as follows:
```
export VTUNE_PROFILER_DIR=/global/software/rocky-8.x86_64/spack-v1-intel/linux-x86_64/intel-oneapi-vtune-2025.6.0-ysdc5gc/vtune/2025.6
export PATH=$VTUNE_PROFILER_DIR/bin64:$PATH
```

### Command Line Profiling
To perform a basic "hotspots" analysis on a compiled binar (`program`), you can run the following within a slurm job or interactive session:
```
vtune -collect hotspots -r ./vtune_results ./program
```

### GUI Usage via Open OnDemand
For visual analysis, you can run `vtune-gui` on a terminal of a Open OnDemand Desktop session.

## Reference
* [VTune 2025 User Guide](https://www.intel.com/content/www/us/en/docs/vtune-profiler/user-guide/2025-4/overview.html)
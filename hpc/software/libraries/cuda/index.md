# CUDA Toolkit

The NVIDIA CUDA Toolkit, consisting of Nvidia-GPU-accelerated libraries, C/C++ compiler and various related tools, is available under `gcc` compiler tree. `cuda/11.8.0` and `cuda/12.2.1` are available after loading a `gcc` module. For example:

```
module load gcc/11.4.0
module load cuda/12.2.1
```

loads CUDA Toolkit version 12.2.1. The environment variable `CUDA_HOME` is set by the `cuda` module.

## Nsight Systems

The performance analysis tool NVIDIA [Nsight Systems](https://developer.nvidia.com/nsight-systems) is part of the CUDA Toolkit. For example once `gcc/11.4.0` and `cuda/12.2.1` are loaded as shown above, you can use the `nsys` executable.

```
nys --version
NVIDIA Nsight Systems version 2023.2.3.1001-32894139v0
```

The graphical user interface for the Nsight Systems can be utilized by running `nsys-ui` on the Desktop application through [Open OnDemand](../../../openondemand/overview/).

## Nsight Compute

Similarly, NVIDIA [Nsight Compute Profiler](https://developer.nvidia.com/nsight-compute) is part of the CUDA Toolkit. You can use the command line profiler through `ncu` and the graphical interface (on OOD Desktop) through `ncu-ui`.

## Additional References

- [CUDA Toolkit Information](https://developer.nvidia.com/cuda-toolkit)
- [CUDA Toolkit 12.2.1 Documentation](https://docs.nvidia.com/cuda/archive/12.2.1/)
- [CUDA Toolkit 11.8.0 Documentation](https://docs.nvidia.com/cuda/archive/11.8.0/)

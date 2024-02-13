# Es1 (Einsteinium) GPU Cluster

Es1 or Einsteinium is an institutional GPU cluster that was deployed to meet the growing computational demand for researchers doing machine learning and deep learning. The system is named after the chemical element with symbol Es and atomic number 99 which was discovered at Lawrence Berkeley National Laboratory in 1952 and in honor of Albert Einstein who developed the theory of relativity.

Es1 is a 47-node partition consisting of multiple GPU node types to address the different research needs. These include:


| Partition | Accelerator | Nodes | CPU                  | Cores | Memory | Infiniband |
| --------- | ----- | -------------------- | ----- | ------ | ---------- | ----------- |
| es1       | 2X NVIDIA V100 | 15    | Intel Xeon E5-2623   | 8     | 64GB   | FDR        | 
|           | 4X NVIDIA 2080TI |   12    | Intel Xeon Silver 4212 | 8   | 96GB   | FDR        | 
|           | 4X NVIDIA A40 |  14     | AMD EPYC 7742        | 64    | 512 GB | FDR        | 4X A40      |
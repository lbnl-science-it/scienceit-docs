# Lawrencium Linux Cluster

Lawrencium is a x86 Intel processor general purpose cluster that is suitable for running a wide diversity of scientific applications. The system is named after the chemical element 103 which was discovered at Lawrence Berkeley National Laboratory in 1958 and in honor of Ernest Orlando Lawrence, the inventor of the cyclotron. The original Lawrencium system was built as a 200-node cluster and debuted as #500 on the Top500 supercomputing list in Nov 2008.

Today Lawrencium consists of multiple generations of compute nodes with the Lr7 partition being the most recent addition and the Lr3 partition the oldest still in production. Below are the current partitions in production.

| Partition | Nodes | CPU                  | Cores | Memory | Infiniband | 
| --------- | ----- | -------------------- | ----- | ------ | ---------- | 
| lr7       | 60    | Intel Xeon Gold 6330 | 56    | 256GB  | HDR |
| lr6       | 88    | Intel Xeon Gold 6130 | 32    | 96GB or 128GB | FDR |
|           | 156   | Intel Xeon Gold 5218 | 32    | 96GB   | FDR |
|           |       | Intel Xeon Gold 6230 | 40    | 128GB  | FDR |
| lr5       | 192   | Intel Xeon E5-2680v4 | 28    | 64GB   | FDR | 
|           |       | Intel Xeon E5-2640v4 | 20    | 128GB  | QDR |
| lr4       | 148   | Intel Xeon E5-2670v3 | 24    | 64GB   | FDR | 
| lr3       | 243   | Intel Xeon E5 2670   | 16    | 64GB   | FDR |
|           |       | Intel Xeon E5 2670v2 | 20    | 64GB   | FDR |
| lr_bigmem | 2     | Intel Xeon Gold 5218 | 32    | 1584GB | EDR |


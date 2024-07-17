# CPU Clusters

## Lawrencium Linux Cluster

Lawrencium is a x86 Intel processor general purpose cluster that is suitable for running a wide diversity of scientific applications. The system is named after the chemical element 103 which was discovered at Lawrence Berkeley National Laboratory in 1958 and in honor of Ernest Orlando Lawrence, the inventor of the cyclotron. The original Lawrencium system was built as a 200-node cluster and debuted as #500 on the Top500 supercomputing list in Nov 2008.

Today Lawrencium consists of multiple generations of compute nodes with the Lr7 partition being the most recent addition and the Lr3 partition the oldest still in production. Below are the current partitions in production.

| Partition | Nodes | CPU                  | Cores | Memory | Infiniband | 
| --------- | ----- | -------------------- | ----- | ------ | ---------- | 
| lr7       | 132   | Intel Xeon Gold 6330 | 56    | 256GB or 512GB  | HDR |
| lr6       | 88    | Intel Xeon Gold 6130 | 32    | 96GB or 128GB | FDR |
|           | 156   | Intel Xeon Gold 5218 | 32    | 96GB   | FDR |
|           |       | Intel Xeon Gold 6230 | 40    | 128GB  | FDR |
| lr5       | 192   | Intel Xeon E5-2680v4 | 28    | 64GB   | FDR | 
|           |       | Intel Xeon E5-2640v4 | 20    | 128GB  | QDR |
| lr4       | 148   | Intel Xeon E5-2670v3 | 24    | 64GB   | FDR | 
| lr3       | 243   | Intel Xeon E5 2670   | 16    | 64GB   | FDR |
|           |       | Intel Xeon E5 2670v2 | 20    | 64GB   | FDR |
| lr_bigmem | 2     | Intel Xeon Gold 5218 | 32    | 1.5TB | EDR |


## Cm1 (Curium) AMD Cluster

Curium is a AMD EPYC processor partition within the Lawrencium cluster. The system is named after the chemical element with symbol Cm and atomic number 98 which was discovered at Lawrence Berkeley National Laboratory in 1944 and in honor of Marie and Pierre Curie, both known for their research on radioactivity. 

The system consists of multiple generations of compute nodes with the Cm2 partition being the most recent addition and the Cm1 partition the oldest still in production. Below are the current partitions in production.

Cm1 consists of 14 ea. Supermicro nodes each equipped with 2 ea. AMD EPYC Naples 7401 24-core 2.0Ghz processors and 256GB 2666Mhz memory. Each node also has 4 ea. 4TB disk drives configured as a fast local scratch. The compute nodes are connected by a Mellanox FDR 56Gb/s infiniband interconnect for low latency and for moving big data.

Cm2 consists of 20 ea. Dell nodes each equipped with 2 ea. AMD EPYC Rome 7454 32-core 2.35Ghz processors and 256GB 3200Mhz memory. Users who need to develop and tune their code for the new AMD architecture in order to run at the National centers may want to use this system. It is scheduled to go into production in early 2021.

## Cf1 (Californium) Intel Phi Cluster

Californium is an Intel Phi Knights Landing processor partition within the Lawrencium cluster. The system is named after the radioactive chemical element with the symbol Cf and atomic number 98. The element was first synthesized in 1950 at the Lawrence Berkeley National Laboratory (then the University of California Radiation Laboratory), by bombarding curium with alpha particles (helium-4 ions).

The partition consists of 70 Dell nodes each equipped with a single Intel Phi Knights Landing 7210 64-core 1.3Ghz processor and 192GB 2400Mhz memory. Users of the NERSC Cori system can use these nodes for development.
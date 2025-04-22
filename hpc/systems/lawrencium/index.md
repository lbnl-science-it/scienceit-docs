# CPU Cluster

## Lawrencium

About Lawrencium Cluster

Lawrencium is a general purpose cluster that is suitable for running a wide variety of scientific applications. The system is named after the chemical element 103 which was discovered at Lawrence Berkeley National Laboratory in 1958 and in honor of Ernest Orlando Lawrence, the inventor of the cyclotron.

The original Lawrencium system was built as a 200-node cluster and debuted as #500 on the Top500 supercomputing list in Nov 2008.

Lawrencium consists of multiple generations of compute nodes with the `lr8` partition being the most recent addition and the `lr4` partition the oldest still in production. In addition, there is a `lr_bigmem` partition with 1.5TB memory per node, and `cm1, cm2, cf1` partitions (details in the table below).

| Partition | Nodes | CPU | Cores | Memory | Infiniband | | --- | --- | --- | --- | --- | --- | | lr8 | 20 | AMD EPYC 9534 | 128 | 768GB | HDR | | lr7 | 132 | Intel Xeon Gold 6330 | 56 | 256GB or 512GB | HDR | | lr6 | 88 | Intel Xeon Gold 6130 | 32 | 96GB or 128GB | FDR | | | 156 | Intel Xeon Gold 5218 | 32 | 96GB | FDR | | | | Intel Xeon Gold 6230 | 40 | 128GB | FDR | | lr5 | 192 | Intel Xeon E5-2680v4 | 28 | 64GB | FDR | | | | Intel Xeon E5-2640v4 | 20 | 128GB | QDR | | lr4 | 148 | Intel Xeon E5-2670v3 | 24 | 64GB | FDR | | lr_bigmem | 2 | Intel Xeon Gold 5218 | 32 | 1.5TB | EDR | | cm1 | 14 | AMD EPYC 7401 | 48 | 256GB | FDR | | cm2 | 3 | AMD EPYC 7454 | 64 | 256GB | EDR | | cf1 | 72 | Intel Xeon Phi 7210 | 256 | 192GB | FDR |

LRC Jobscript Generator

You can use the [LRC Jobscript Generator](https://lbnl-science-it.github.io/lrc-jobscript/src/lrc-calculator.html) page to generate sample slurm job submission scripts targeting these different systems.

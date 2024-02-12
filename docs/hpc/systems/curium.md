# Cm1 (Curium) AMD Cluster

Curium is a AMD EPYC processor partition within the Lawrencium cluster. The system is named after the chemical element with symbol Cm and atomic number 98 which was discovered at Lawrence Berkeley National Laboratory in 1944 and in honor of Marie and Pierre Curie, both known for their research on radioactivity. 

The system consists of multiple generations of compute nodes with the Cm2 partition being the most recent addition and the Cm1 partition the oldest still in production. Below are the current partitions in production.

Cm1 consists of 14 ea. Supermicro nodes each equipped with 2 ea. AMD EPYC Naples 7401 24-core 2.0Ghz processors and 256GB 2666Mhz memory. Each node also has 4 ea. 4TB disk drives configured as a fast local scratch. The compute nodes are connected by a Mellanox FDR 56Gb/s infiniband interconnect for low latency and for moving big data.

Cm2 consists of 20 ea. Dell nodes each equipped with 2 ea. AMD EPYC Rome 7454 32-core 2.35Ghz processors and 256GB 3200Mhz memory. Users who need to develop and tune their code for the new AMD architecture in order to run at the National centers may want to use this system. It is scheduled to go into production in early 2021.
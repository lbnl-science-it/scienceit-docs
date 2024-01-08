# Scientific Project Storage Service (SPSS)

## Service Overview

Scientific Platform Storage Service (SPSS) is a performant, elastic, cost-attractive storage service, available to researchers at Berkeley Lab across all science disciplinary spaces. The IT Division offers SPSS as part of the ScienceIT initiative, developing new services focused on supporting the Lab’s scientific mission and engaging directly with researchers.

## Features

SPSS affords Lab researchers a file storage platform to support data workflows, without the cost of dedicated hardware or the administration burden of running and maintaining their own IT infrastructure. In addition to the local storage platform, SPSS provides avenues for data lifecycle management including cloud storage platform offloading.

Highly available and scalable, SPSS is a storage service based on the open-source Ceph platform, delivering object, block, and file storage in a single unified system. The platform consists of a redundant 4 server nodes (which serve as Ceph Monitor Servers, Metadata Servers, and Object Gateways). The initial rollout includes 6 OSD (Object Storage Daemons) storage nodes,which are the scalable building blocks of the Ceph cluster, with the ability to add more OSD nodes over the fly. 

SPSS also offers compatibility with traditional POSIX-style file storage over NFS and Object-based Store for modern web applications. 

## Getting Started

To get started with SPSS, please complete the [SPSS Request Form](https://docs.google.com/forms/d/e/1FAIpQLSe272SNGppmEF2Kj3pVxtAnMUZZk1vfSfRFS6ZAX-7vIZDPVA/viewform), which will generate a support ticket. The service is free of cost for the first three months. Please only use the form to request storage from the capacity tier of SPSS. If you have any related questions, please contact scienceit@lbl.gov.

## Service Costs

The price of the Raw capacity tier is **$7/TB/month** for NFS or Object Store buckets, based on configured capacity. To encourage uptake of the service, we offer a free three-month trial of SPSS to all Lab researchers.

For comparison, here are the list prices for storage on AWS, GCP, and National Laboratories ($/TB/month):

| COST COMPARISON |	COST PER TB |
| --------------- | ----------- |
| Berkeley Lab SPSS v2 Storage | $7/Mo. |
| UC Irvine Storage |	$5/Mo. |
| UCLA CASS Storage | $11.41/Mo. |
| Stanford File Storage |	$38/Mo. |
| UCB Utility Storage |	$40/Mo. |
| Amazon AWS S3 Standard | $23/Mo. |
| Google GCP Standard	| $20/Mo. |

## Service Level Agreements
Use of SPSS requires consent to the terms of the [Service Level Agreement](https://docs.google.com/document/d/15dxmD59ZgHR-lAMWCPAi06svSU-dnxAFdXs8LnUzh7s/edit?usp=sharing). If you have any question, please contact ScienceIT@lbl.gov.
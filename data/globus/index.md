Globus is a free data transfer and storage service that lets you efficiently, securely, reliably, and quickly move large amounts of data between different resources (e.g., a personal computer, the Lawrencium cluster, Google Drive, Cloud Storage, and others) and to also share data on those resources with others.

Globus addresses many of the common challenges faced by researchers in moving, sharing, and archiving large volumes of data. With Globus, you hand-off data movement tasks to a hosted service that manages the entire operation, monitoring performance and errors, retrying failed transfers, correcting problems automatically whenever possible, and reporting status to keep you informed of the process.

Science IT provides many Globus endpoints to help automate data transfers. Globus endpoints are authenticated against your active LBL account credentials, however some endpoints like Lawrencium or Cloud Storage might require additional credentials or authentication methods to function properly.

LBL's main Globus UI is available at <https://globus.lbl.gov> .

Current managed endpoints with general availability are:

| Name | Globus Endpoint Name | Documentation | | --- | --- | --- | | Google Drive | [LBNL Gdrive Access](https://globus.lbl.gov/file-manager/collections/37286b85-fa2d-41bd-8110-f3ed7df32d62/overview) | [Globus for Google Drive](../globus-google-drive/) | | Lawrencium | [lbnl#lrc](https://globus.lbl.gov/file-manager/collections/45afb626-a4bd-11e8-96f0-0a6d4e044368/overview) | [Globus for Lawrencium](../globus-instructions/) | | Amazon Web Services S3 | [LBNL AWS S3 Collection](https://globus.lbl.gov/file-manager/collections/9c6d5242-306a-4997-a69f-e79345086d68/overview) | [Using the Globus AWS S3 Connector](../globus-aws-s3-connector/) | | Google Cloud Storage | [LBNL Google Cloud Storage Collection](https://globus.lbl.gov/file-manager/collections/54047297-0b17-4dd9-ba50-ba1dc2063468/overview) | [Using the Globus Google Cloud Storage Connector](../globus-google-cloud-storage-connector/) |

If you are interested in using Google Cloud or Amazon, please reach out to [scienceit@lbl.gov](mailto:scienceit@lbl.gov) for more information on setting up a GCP or AWS account.

## Setting up a Globus Connect Personal Endpoint

Even when there is not an LBL managed endpoint available it can still be useful to have access to the transfer and retry features of Globus. You can do this using Globus Connect Personal to configure an endpoint on your personal device. In general, it is always faster to use endpoints managed by LBL, but Globus Connect Personal can be useful for transfer to or from a local laptop or computer.

You can find instructions for downloading and installing the Globus Connect Personal on the [Globus web site](https://docs.globus.org/globus-connect-personal/) .

Globus for data transfers is highly recommended. Globus is available as a free service for any user to sign up. Please follow the [instructions](../globus-instructions/) for access setup.

If you see a connector you would like us to support, please send email to [hpcshelp@lbl.gov](mailto:hpcshelp@lbl.gov).

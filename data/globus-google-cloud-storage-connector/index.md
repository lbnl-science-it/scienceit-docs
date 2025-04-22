# Using the Globus Google Cloud Storage Connector

These are the instructions for configuring Globus to access a Google Cloud Storage bucket using your regular LBL account credentials. For this connector, unlike the S3 connector, you don’t use an access token + secret key or a service account setup. You’ll authorize the Google Cloud Storage connector to use your LBL account and from that you’ll have access to any buckets that your LBL account has access to.

Please note that for your first time setting up the Google Cloud Storage connector you’ll have to go through various “consent” and “authorization” prompts, and those steps are not documented here. Giving consent is a standard part of the Globus process whereby you authorize Globus to perform additional privileged operations with the selected endpoint. If you’ve already given permissions to Globus for the Google Cloud Storage connector, you might not see the consent steps.

## Select Globus Google Cloud Storage Endpoint

- Login with Globus at <https://globus.lbl.gov>
- Select "Endpoints" from the left navigation.
- Enter "LBNL Google Cloud" into the search textbox.
- From the list of endpoints that appear, click on the "LBNL Google Cloud Storage Collection" link.

## Setup Credentials

- Click on the "Credentials" tab of the "LBNL Google Cloud Storage Collection" endpoint page.

- Here you authenticate your LBL credentials for the connector.

- After you've authenticated your account, click the "Continue" button, and you'll be taken back to the full "Credentials" tab where you can see your active LBL account credentials.

Note

One important thing to note is that due to the required Globus configuration for the “LBNL Google Cloud Storage Collection” you will be unable to view the “File Manager” from the root of the main collection (you’ll see an error message if you try) so you must use a Guest Collection to view files in your buckets. At this point you are authenticated and ready to add one or more Guest Collections to access Google Cloud Storage buckets with Globus.

## Create Guest Collection from Google Cloud Storage Connector

- Click on the "Collections" tab of the "LBNL Google Cloud Storage Connector" endpoint, and then click on the "Add a Guest Collection".

- Enter in the name of the bucket and any pathing within that bucket that you want to use as the top-level folder of your collection in the “Directory” field. Due to the required Globus configuration of the “LBNL Google Cloud Storage Collection” you will be unable to “Browse” the directory, so you must enter an existing bucket name in the directory field. Enter any value for the “Display Name” field, and then click the “Create Collection” button.

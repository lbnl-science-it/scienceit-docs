---
name: lawrencium-hpc
description: >-
  Answer questions about high-performance computing at Lawrence Berkeley National
  Laboratory (LBNL) — the Lawrencium (LRC) CPU cluster and Einsteinium GPU cluster.
  Covers accounts & MFA, logging in, Slurm job scheduling and example scripts, the
  Software Module Farm (compilers, Python/R/Julia, MPI, CUDA and other libraries,
  PyTorch/TensorFlow/Ray, VASP, Ollama/vLLM), Open OnDemand and Jupyter, data transfer
  with the lrc-xfer node and Globus, and the supported research (condo) clusters. Use whenever a
  question concerns Lawrencium, Einsteinium, LBNL/Berkeley Lab research computing, or
  running jobs on these systems. Fetch the Markdown source from the scienceit-docs
  GitHub repository instead of scraping HTML from scienceit-docs.lbl.gov.
license: BSD-3-Clause
---

# Lawrencium HPC documentation

This skill lets you answer Lawrencium/Einsteinium HPC questions from the
**Markdown source** of the Science IT documentation. The source of truth is the
[`lbnl-science-it/scienceit-docs`](https://github.com/lbnl-science-it/scienceit-docs)
GitHub repository — the pages live under `docs/` (mainly `docs/hpc/`, plus the Globus
data-transfer pages under `docs/data/`) on the `main` branch and are fetched directly,
so this skill works without a local checkout of the repo.

## How to use this skill

1. **Fetch the raw Markdown, not the website.** Every page on
   `https://scienceit-docs.lbl.gov` is generated from a `.md` file under `docs/hpc/`
   in the GitHub repo. Fetch the **raw** Markdown (see *Fetching a page* below) with
   your web-fetch tool. Do **not** scrape the rendered HTML — the Markdown is the
   source of truth, is cheaper to read, and has no navigation/markup noise.
2. **Route with the doc map below.** Match the user's question to one or more pages
   in the map, then fetch those files. Start narrow (the most specific page) and
   widen only if needed.
3. **Ground every answer in what you read.** If a topic is not covered by these
   files, say so plainly rather than guessing. Never invent partition names, module
   names, file paths, commands, email addresses, or URLs.
4. **Note on MkDocs syntax.** The Markdown uses some MkDocs Material extensions —
   `??? question` / `!!! note` admonitions, `=== "Tab"` content tabs, `{{ ext }}`
   macros, and `{: ...}` attribute lists. Treat these as formatting wrappers; read
   through them to the underlying content.

## Fetching a page

The doc map below lists each page by its repository path (e.g. `docs/hpc/faqs.md`).
To fetch the raw Markdown, prepend the raw base URL for the `main` branch:

```
https://raw.githubusercontent.com/lbnl-science-it/scienceit-docs/main/
```

- `docs/hpc/faqs.md` → <https://raw.githubusercontent.com/lbnl-science-it/scienceit-docs/main/docs/hpc/faqs.md>
- `docs/hpc/running/slurm-overview.md` → <https://raw.githubusercontent.com/lbnl-science-it/scienceit-docs/main/docs/hpc/running/slurm-overview.md>

## Citing sources

When an answer draws on a page, cite it with its **public site URL** (not the raw
GitHub URL). Convert the repository path by removing the leading `docs/`, dropping
the `.md` extension, adding a trailing `/`, and prefixing
`https://scienceit-docs.lbl.gov/`:

- `docs/hpc/faqs.md` → <https://scienceit-docs.lbl.gov/hpc/faqs/>
- `docs/hpc/running/slurm-overview.md` → <https://scienceit-docs.lbl.gov/hpc/running/slurm-overview/>

Cite the public site URL, not the raw file path or the GitHub URL.

## Scope

In scope: Lawrencium (LRC), Einsteinium, and the supported research clusters on the
LBNL Supercluster — accounts, access, Slurm, software, data transfer (the lrc-xfer DTN
and Globus), and Open OnDemand. Globus is covered because it is the primary way LBNL
researchers move data to and from Lawrencium; the connector pages for cloud storage
(Google Drive, AWS S3, Google Cloud Storage) are included as part of Globus. Out of
scope for this skill: cloud compute services (AWS/GCP accounts and VMs) and general
(non-LBNL) computing. Decline or redirect out-of-scope questions.

## Doc map

Paths are relative to the repository root. Titles mirror the site navigation.

### Overview & getting started
- **Lawrencium Overview** — `docs/hpc/index.md` — What Lawrencium is: the LBNL Condo Cluster Computing (LC3) platform, part of the LBNL Supercluster.
- **Live Cluster Status** — `docs/hpc/status.md` — Current cluster / queue status.
- **Getting Started** — `docs/hpc/getting-started.md` — The primary ways to obtain access to Lawrencium.
- **Frequently Asked Questions** — `docs/hpc/faqs.md` — Common questions: getting an account, submitting a first job, transferring data, max walltime, and more.
- **Acknowledgement** — `docs/hpc/acknowledgement.md` — How to acknowledge Lawrencium in publications.

### Account management
- **Project Accounts** — `docs/hpc/accounts/project-accounts.md` — Eligibility and the PI-sponsored project/condo model.
- **User Accounts** — `docs/hpc/accounts/user-accounts.md` — Requesting an account via the MyLRC portal and OTP token setup.
- **Logging in** — `docs/hpc/accounts/loggingin.md` — SSH login to `lrc-login.lbl.gov` with PIN+OTP; login-node etiquette.
- **Multi-Factor Authentication** — `docs/hpc/accounts/mfa.md` — Setting up and managing OTP/MFA tokens.

### Computing systems
- **CPU Cluster (Lawrencium)** — `docs/hpc/systems/lawrencium.md` — The general-purpose Lawrencium cluster: hardware and partitions.
- **GPU Cluster (Einsteinium)** — `docs/hpc/systems/einsteinium.md` — The institutional GPU cluster for ML/DL workloads (es0/es1/es2 partitions).
- **Supported research clusters** — condo/PI clusters that share the Supercluster infrastructure:
    - **ALSACC** — `docs/hpc/systems/supported/alsacc.md`
    - **CATAMOUNT** — `docs/hpc/systems/supported/catamount.md`
    - **CATSCAN** — `docs/hpc/systems/supported/catscan.md`
    - **DIRAC1** — `docs/hpc/systems/supported/dirac1.md`
    - **ETNA** — `docs/hpc/systems/supported/etna.md`
    - **MHG** — `docs/hpc/systems/supported/mhg.md`

### Data transfer
- **Using the lrc-xfer DTN** — `docs/hpc/data-transfer-node.md` — The dedicated data transfer node for moving data to/from the cluster.
- **Globus** — `docs/data/globus.md` — What Globus is, LBL's Globus UI at `globus.lbl.gov`, the managed endpoints (Lawrencium, Google Drive, AWS S3, Google Cloud Storage), and setting up a Globus Connect Personal endpoint.
- **Globus for Lawrencium** — `docs/data/globus-instructions.md` — Logging in to `globus.lbl.gov`, finding the `lbnl#lrc` endpoint, and transferring files to/from Lawrencium.
- **Globus for Google Drive** — `docs/data/globus-google-drive.md` — Using the LBNL Gdrive Access endpoint and creating a guest collection for a Google Drive path.
- **Globus AWS S3 Connector** — `docs/data/globus-aws-s3-connector.md` — Configuring the LBNL AWS S3 collection with an IAM access key to transfer to/from an S3 bucket.
- **Globus Google Cloud Storage Connector** — `docs/data/globus-google-cloud-storage-connector.md` — Configuring the LBNL Google Cloud Storage collection with your LBL credentials to transfer to/from a GCS bucket.

### Running jobs
- **Slurm Overview** — `docs/hpc/running/slurm-overview.md` — Slurm resource manager: TRES, associations, partitions, QoS, submitting jobs.
- **Example Scripts** — `docs/hpc/running/script-examples.md` — Job scripts for common cases: multi-core, GPU, low-priority condo, and long-running jobs.
- **Monitor Jobs** — `docs/hpc/running/monitor-jobs.md` — Checking running jobs by Slurm job ID and inspecting usage.
- **GNU Parallel** — `docs/hpc/running/gnu-parallel.md` — Grouping many (often serial) tasks into one Slurm submission across a node's cores.

### Software — general
- **Software Module Farm** — `docs/hpc/software/software-module-farm.md` — The SMF software collection and its usage on Lawrencium.
- **Module Management** — `docs/hpc/software/module-management.md` — Using the Lmod environment-module system (`module load`, `module avail`, ...).

### Software — compilers
- **GCC** — `docs/hpc/software/compilers/gcc.md` — Available `gcc` versions and how to load them.
- **Intel** — `docs/hpc/software/compilers/intel.md` — The LLVM-based Intel oneAPI compilers (`icx`, `icpx`, `ifx`).
- **NVHPC** — `docs/hpc/software/compilers/nvhpc.md` — The NVIDIA HPC SDK.

### Software — languages
- **Python** — `docs/hpc/software/languages/python.md` — System Python and environment/module options.
- **Julia** — `docs/hpc/software/languages/julia.md` — Julia as a module.
- **R** — `docs/hpc/software/languages/R.md` — The R module.

### Software — machine learning
- **PyTorch** — `docs/hpc/software/ml/pytorch.md` — The `ml/pytorch` module.
- **Ray** — `docs/hpc/software/ml/ray.md` — Distributed/parallel Python execution across nodes.
- **TensorFlow** — `docs/hpc/software/ml/tensorflow.md` — The `ml/tensorflow` module.
- **AlphaFold3** — `docs/hpc/software/ml/alphafold3.md` — AlphaFold 3 model and database on Lawrencium.

### Software — applications
- **VASP** — `docs/hpc/software/applications/vasp.md` — Licensed VASP 6.4.1 and the access-request process.

### Software — MPI
- **Open MPI** — `docs/hpc/software/mpi/openmpi.md` — Loading `openmpi` under a compiler.
- **Intel MPI** — `docs/hpc/software/mpi/intelmpi.md` — Loading Intel MPI under the Intel oneAPI compilers.

### Software — libraries
- **FFTW** — `docs/hpc/software/libraries/fftw.md` — FFTW under an MPI library.
- **HDF5** — `docs/hpc/software/libraries/hdf5.md` — HDF5 under a compiler + MPI.
- **NetCDF** — `docs/hpc/software/libraries/netcdf.md` — NetCDF under a compiler + MPI.
- **MKL** — `docs/hpc/software/libraries/mkl.md` — Intel MKL under gcc or Intel compilers.
- **CUDA** — `docs/hpc/software/libraries/cuda.md` — CUDA Toolkit under the `gcc` tree.

### Software — profiling
- **GNU Gprof** — `docs/hpc/software/performance/gnu-gprof.md` — Profiling C/C++/Fortran with `gprof`.
- **Intel VTune** — `docs/hpc/software/performance/intel-vtune.md` — Finding hotspots with Intel VTune Profiler.

### Software — LLMs
- **Ollama** — `docs/hpc/software/llms/ollama.md` — Running open-weight LLMs via the `ollama` module.
- **vLLM** — `docs/hpc/software/llms/vllm.md` — Serving open-weight LLMs via the `vllm` module.

### Open OnDemand
- **Open OnDemand Overview** — `docs/hpc/openondemand/overview.md` — Browser-based interactive apps at `lrc-ondemand.lbl.gov`.
- **Jupyter Server** — `docs/hpc/openondemand/jupyter-server.md` — Running Jupyter notebooks on Lawrencium compute.
- **Ollama with Jupyter and VS Code** — `docs/hpc/openondemand/ollama-jupyter-vscode.md` — The Ollama + JupyterAI + VS Code Continue app for local LLMs.
- **Adding Packages and Kernels** — `docs/hpc/openondemand/packages-kernels.md` — Managing Python packages and Jupyter kernels (miniforge3).

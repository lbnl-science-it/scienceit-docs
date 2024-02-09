# Science-IT Docs Workflow

We are using MkDocs with the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme to build our documentation site. Some inspiration is taken from similar technical documentation sites of [NERSC](https://docs.nersc.gov) and [Berkeley Research IT](https://docs-research-it.berkeley.edu/).

## Installing MkDocs and Plugins
The repository has a `requirements.txt` file which can be used to install the required mkdocs, mkdocs-material, and other plugins required to build the documentation by executing:

`pip install -r requirements.txt`

## Previewing locally

`mkdocs serve` starts a live preview server for you to view on a browser window.

## Recommendations

Since the MkDocs source files are text based, you can use your favorite editor. One recommendation is to use Visual Studio Code. An additional recommendation is to use the Material for MkDocs provided `schema.json` for `mkdocs.yml`; instructions can be found [here](https://squidfunk.github.io/mkdocs-material/creating-your-site/#minimal-configuration-visual-studio-code). 

## Pushing changes

Pushing changes to the github repository will automatically run `mkdocs build` and publish the generated html pages on github pages. These are hosted on the `gh-pages` brach while the markdown source of the documentation lies on the `main` branch.

This is achieved through Gihub Actions workflow file `.github/workflows/ci.yml`.

## Pages migration status page

A list of pages from https://it.lbl.gov/resource/hpc/ and their current location on the mkdocs site or if they are missing can be found on this repo's wiki at https://github.com/lbnl-science-it/scienceit-docs/wiki/Pages-migration-status.
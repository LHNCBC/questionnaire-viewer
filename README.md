# Questionnaire Viewer
## Overview

This is the code for a [website](https://lhncbc.github.io/questionnaire-viewer/)
that uses the [LHC-Forms](http://lhncbc.github.io/lforms/) widget to
render a [FHIR](https://www.hl7.org/fhir/)
[Questionnaire](https://www.hl7.org/fhir/questionnaire.html) with an optional FHIR
resources package.

This single page app accepts parameters in its URL to specify how to
retrieve the Questionnaire and its needed resources.  These are documented on
the app's page when you don't specify an parameters; otherwise that section is
hidden.

## Usage:

```[Base URL]/?q=[URL to FHIR Questionnaire]&p=[URL to FHIR resource package file]```

An example npm package is the one for SDC: https://build.fhir.org/ig/HL7/sdc/package.tgz

The package format is defined here: https://confluence.hl7.org/display/FHIR/NPM+Package+Specification

### Some Examples:

#### Showing a Questionnaire that does not need additional resources via its URL

The following shows a Questionnaire without specifying the version of the
LHC-Forms Questionnaire renderer, in which case a default, fixed version is
used.

[Base URL]/?q=https://lforms-fhir.nlm.nih.gov/baseR4/Questionnaire/55418-8-x

#### Using a Questionnaire canonical and a package ID

The following uses the latest version of the LHC-Forms Questionnaire renderer,
a package ID and version for a package to be downloaded from the package server,
a default terminology server for the Questionnaire's resources that are not
found in the package, and specifies a canonical URI for a Questionnaire to be found
in the package.

[Base URL]/?lfv=latest&qCanonical=http://hl7.org/fhir/uv/sdc/Questionnaire/demographics&pID=hl7.fhir.uv.sdc.r4&pVersion=3.0.0&s=default


## Demo
A demo of this website is [here](https://lhncbc.github.io/questionnaire-viewer/).

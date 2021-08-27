# Questionnaire Viewer
## Overview

This is the code for a [website](https://lhncbc.github.io/questionnaire-viewer/)
that uses the [LHC-Forms](http://lhncbc.github.io/lforms/) widget to
render a [FHIR](https://www.hl7.org/fhir/)
[Questionnaire](https://www.hl7.org/fhir/questionnaire.html) with an optional FHIR
resources package.

This single page app accepts two parameters in its URL to specify other URLs for
retrieving the questionnaire to display and the package of resources:
 -  q: specifies where to get the FHIR Questionnare resource. 
 -  p: specifies where to get the FHIR resource package file, and is optional.

Usage:

```[Base URL]/q=[URL to FHIR Questionnaire]&p=[URL to FHIR resource package file]```

An example npm package is the one for SDC: https://build.fhir.org/ig/HL7/sdc/package.tgz

The package format is defined here: https://confluence.hl7.org/display/FHIR/NPM+Package+Specification

## Demo
A demo of this website is [here](https://lhncbc.github.io/questionnaire-viewer/).

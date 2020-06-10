The is a website that uses LHC-Forms widget to render a FHIR Questionare, along with a FHIR resources package.

It takes two URLs as prameters:
 -  q: specifies where to get the FHIR Questionnare resource. 
 -  p: specifies where to get the FHIR resource package file, and is optional.

Usage:

```[Base URL]/q=[URL to FHIR Questionnaire]&p=[URL to FHIR resource package file]```

An example npm package is the one for SDC: https://build.fhir.org/ig/HL7/sdc/package.tgz

The package format is defined here: https://confluence.hl7.org/display/FHIR/NPM+Package+Specification
# Change Log

This log documents the significant changes for each release.
This project follows [Semantic Versioning](http://semver.org/).

## [0.4.5] - 2023-05-08
### Fixed
- Changed the parcel build so that the generated asset paths are relative.  On
  GitHub Pages the app is deployed to subdirectory, and parcel by default starts
  the generated asset paths with /.

## [0.4.4] - 2023-05-07 [broke on GitHub pages]
### Changed
- Changed the build system from webpack to parcel
- Updated Node.js to version 18.

## [0.4.3] - 2021-08-11
### Fixed
- Added a link to the demo from the README, and updated lforms.

## [0.4.2] - 2021-06-14
### Fixed
- Corrected typos in an error message and added the exception text to it.

## [0.4.1] - 2021-05-17
### Fixed
- Added lforms-updater to update obsolete LHC-Forms-generated form definitions
  to the expectations of the current code.

## [0.4.0] - 02-05-2020
### Added
- Added an option to specify a FHIR server for needed resources.
### Updated
- Updated lforms to verison 28.1.4

## [0.3.0] - 10-20-2020
### Added
- Updated lforms to v26.3.1, which fixed a bug in importing STU3 FHIR
  Questionnaire's "options" attibute.

## [0.2.0] - 10-07-2020
### Added
- Added a button to show warning messages when answer lists are not loaded from
  URLs specified in Questionnaire
- Updated lforms to v26.2.0

## [0.1.0] - 09-08-2020
### Added
- Added an error handler that catches most errors and displays relevant messages
- Updated lforms to v25.1.5

## [0.0.4] - 07-28-2020
### Added
- Added support for package files that do not contain a .index.json file,
  which is actually optional.

## [0.0.3] - 07-21-2020
### Fixed
- Updated the lforms package to get a needed fix.

## [0.0.2] - 07-10-2020
### Fixed
- Fixed a conflicting CSS class name issue

## [0.0.1] - 06-05-2020
### Added
- Initial commit

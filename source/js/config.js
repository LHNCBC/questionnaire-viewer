/**
 *  A default terminology server that can be used (when s=default is specified).
 */
export const defaultTerminologyServer = 'https://tx.fhir.org/r4';


/**
 *  Constructs a URL for retrieving a FHIR package.
 * @param packageID the ID of the package
 * @param version the version of the package
 */
export function getPackageURL(packageID, version) {
  return `https://packages2.fhir.org/web/${packageID}-${version}.tgz`
}



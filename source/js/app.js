// Imports for webpack to find assets
import '../css/app.css';

import pako from "pako";
import untar from "js-untar-lhc";
import str2ab from "string-to-arraybuffer";
import FHIR from 'fhirclient';
import lformsUpdater from 'lforms-updater';
import {defaultTerminologyServer, getPackageURL} from './config';

let urlQSelected = null;
let qCanonical;
let urlPSelected = null;
let urlSSelected = null;
let results;
initResults();

// A set of resource types from a package file a Questionnaire might need.
const qResourceTypes = new Set(['ValueSet', 'CodeSystem', 'Library',
'Questionnaire']);


/**
 *  A wrapper for the fetch request that sets the referrer header, so that
 *  servers getting requests for packages and ValueSets will know who is making
 *  the request.
 * @param url the URL to fetch.
 * @return the return from the standard fetch call.
 */
async function qvFetch(url, options) {
  return qvOrigFetch(url, Object.assign({
    referrer: '/questionnaire-viewer', // will be sent along with the host
    referrerPolicy: 'unsafe-url' // send the referrer cross-origin
  }, options));
}

// Force LForms to use the above settings.
window.qvOrigFetch = fetch;
window.fetch = qvFetch;


/**
 * Converts a Blob containing JSON data into a JavaScript object.
 * (This function was written an AI.)
 * Note:  js-untar incorrectly assumes each character is 1 byte, which is not correct for UTF-8.
 *
 * @param {Blob} blob - The Blob object containing JSON data.
 * @returns {Promise<Object>} A promise that resolves with the parsed JSON object.
 *                            If parsing fails, the promise is rejected with an error.
 */
function blobToJson(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function(event) {
      try {
        const json = JSON.parse(event.target.result);
        resolve(json);
      } catch (error) {
        reject(new Error("Failed to parse JSON: " + error.message));
      }
    };

    reader.onerror = function() {
      reject(new Error("Failed to read Blob: " + reader.error));
    };

    reader.readAsText(blob, 'UTF-8');
  });
}


/**
 * Add a FHIR Questionnaire to page and display it
 * @param {*} dataQ FHIR Questionnaire data (LForms format also supported)
 * @param {*} dataPackage FHIR resource package data, optional
 * @returns a Promise that resolves after the Questionnaire load attempt is
 *  complete.  Errors will have been handled and messages displayed.
 */
async function addQuestionnaire(dataQ, dataPackage) {

  if (dataQ && dataQ.resourceType === "Questionnaire") {

    let message = "The Questionnaire loaded from " + urlQSelected +
    " cannot be processed by LHC-Forms.  Please check if the Questionnaire is valid" +
    " or if it has features that LHC-Forms does not support yet.";

    // Run the updater in case it was created with an older version of
    // LHC-Forms.
    let lfData;
    // Convert FHIR Questionnaire to LForms format
    try {
      dataQ = lformsUpdater.update(dataQ);
      lfData = LForms.Util.convertFHIRQuestionnaireToLForms(dataQ);
    }
    catch(error) {
      if (error.message)
        error = error.message;
      console.error('Error:', error);
      results.gotQ = false;
      showErrorMessages(message + " (Details: "+error+")");
    }

    if (lfData) {
      // Add resource package if there is one
      if (dataPackage) {
        lfData._packageStore = dataPackage;
      }

      // Turn off the top-level questions and controls (optional)
      lfData.templateOptions = {
        showFormHeader: false,
        hideFormControls: true
      };

      // Add the form to the page
      try {
        return LForms.Util.addFormToPage(lfData, "qv-lforms").then(async function(){
          await showInfoMessages();
          LForms.Def.ScreenReaderLog.add('A questionnaire has been displayed on the page');
        })
        .catch(error=>{
          console.error('Error:', error);
          results.gotQ = true; // not sure if we did, but probably
          showErrorMessages(error);
          showInfoMessages();
        });
      }
      catch(error) {
        console.error('Error:', error);
        results.gotQ = false;
        showErrorMessages(message)
      }
    }
    return Promise.reject();
  }

}


/**
 * Show or hide the loading message
 * @param {*} show a flag decides whether to show or hide the loading message
 */
function setLoadingMessage(show) {
  let loadingEle = document.getElementById('qv-loading');
  if (show) {
    loadingEle.style.display = '';
  }
  else {
    loadingEle.style.display = 'none';
  }
}


/**
 * Display information message once a Questionnaire is successfully loaded,
 * with or without a package file loaded successfully.
 */
async function showInfoMessages() {
  let formInfo = document.getElementById('qv-form-info');
  let formRendered = document.querySelector('wc-lhc-form,lforms');
  let notes = "";
  const errors = [];
  if (results.hasUrlQ && results.gotQ && formRendered) {
    notes = "The following Questionnaire was loaded from " + urlQSelected;
    if (results.pendingServerConnection)
      await results.pendingServerConnection;
    if (results.hasUrlP || results.hasUrlS) {
      if (results.gotP || results.gotS) {
        const sources = [];
        if (results.gotP)
          sources.push(urlPSelected);
        if (results.gotS)
          sources.push(urlSSelected);
        notes += ", with resources from " + sources.join(' and ');
      }
      notes += '.';
      let errorMsg;
      if (results.hasUrlP && !results.gotP) {
        switch (results.pErrorLocation) {
          case "untar":
            errorMsg = "to untar the package file from " + urlPSelected;
            break;
          case "unzip":
            errorMsg = "to unzip the package file from " + urlPSelected;
            break;
          case "reader":
            errorMsg = "to read the package file from " + urlPSelected;
            break;
          case "fetch":
            errorMsg = "to fetch the package file from " + urlPSelected;
            break;
          default:
            errorMsg = "to fetch/process the package file from " + urlPSelected;
        }
        if (errorMsg)
          errors.push("Failed "+errorMsg);
      }
      if (results.hasUrlS && !results.gotS)
        errorMsg = "Failed to access to the FHIR Server at " + urlSSelected;
    }

    if (errors.length) {
      showErrorMessages(errors);
    }
    else if (!LForms.lformsVersion || LForms.lformsVersion < '36.15.0') {
      // Check for messages about ValueSets that couldn't be loaded, which in
      // earlier versions of LForms did not get thrown as exceptions.
      let answerMessages = LForms.Util.getAnswersResourceStatus();
      if (answerMessages && answerMessages.length > 0) {
        showErrorMessages(answerMessages);
      }
    }

    if (document.getElementById('qv-error').style.display == '') {
      notes += '  Please note the error messages above.';
    }
  }

  formInfo.textContent  = notes;

  setLoadingMessage(false);
}


/**
 * Load a FHIR Questionnaire resource, either from the URL or from the FHIR resource package data
 * and shows it on the page
 * @param {*} packageData a FHIR resource package, optional
 * @param qData (optional) the Questionnaire definition, pulled from packageData
 * @returns a Promise that resolves after the Questionnaire load attempt is
 *  complete.  Errors will have been handled and messages displayed.
 */
function loadQuestionnaire(packageData, qData) {
  let qPromise;
  if (qData) {
    qPromise = Promise.resolve(qData);
  }
  else if (qCanonical) {
    qPromise = Promise.reject(`Questionnaire "${qCanonical}" was not found in the package.`);
  }
  else if (urlQSelected) {
    qPromise = fetch(urlQSelected).then(res => {
      if (res.ok) {
        return res.json();
      }
      else {
        throw "No data returned from " + urlQSelected;
      }
    })
    .then(json => {
      if (json.resourceType !== "Questionnaire") {
        throw "No Questionnaire (JSON) returned from " + urlQSelected;
      }
      return json;
    });
  }
  else {
    qPromise = Promise.reject("No parameters specified a questionnaire to display");
  }

  return qPromise.then((qJson)=>{
    results.gotQ = true;
    return addQuestionnaire(qJson, packageData)
  })
  .catch(error => {
    console.error('Error:', error);
    if (typeof error === 'string') {
      showErrorMessages(error);
    }
    else {
      showErrorMessages("Failed to load Questionnaire from " + urlQSelected);
    }
  });
}


/**
 * Construct a files info array with the same structure of 'files' in .index.json
 *  where resourceType, url and version are used in LHC-Forms to identifier a resource.
 *  See https://confluence.hl7.org/display/FHIR/NPM+Package+Specification#NPMPackageSpecification-.index.json
 * @param {*} extractedFiles an array of file objects extracted from a tar file using js-untar-lhc npm package.
 * @return the package data and the questionnaire if it was found in the
 *  package.
 */
async function constructResourcePackage(extractedFiles) {

  let packageData = [], qData;

  for (let j=0, jLen = extractedFiles.length; j<jLen; j++) {
    let extractedFile = extractedFiles[j];

    if (extractedFile.name.match(/^package.*\.json$/)) {
      console.log('Reading:  ' + extractedFile.name);
      let fileContent = await blobToJson(extractedFile.blob);
      if (fileContent &&
          qResourceTypes.has(fileContent.resourceType)) {
        if (fileContent.resourceType != 'Questionnaire') {
          packageData.push({
            filename: extractedFile.name.replace(/^package\//, ""),
            fileContent: fileContent,
            url: fileContent.url,
            version: fileContent.version,
            resourceType: fileContent.resourceType
          })
        }
        else if (qCanonical && canonicalMatchesQuestionnaire(qCanonical, fileContent))
          qData = fileContent;
      }
    }
  }

  return [packageData, qData];
}


// Written by AI (with a few iterations).
/**
 * Checks if a given FHIR canonical URL matches a Questionnaire definition.
 *
 * @param {string} canonicalUrl - The FHIR canonical URL to check.
 * @param {object} questionnaire - The Questionnaire definition object.
 * @returns {boolean} - Returns true if the canonical matches the Questionnaire definition, false otherwise.
 */
function canonicalMatchesQuestionnaire(canonicalUrl, questionnaire) {
  if (!questionnaire || !questionnaire.url) {
    return false; // Return false if the questionnaire is invalid or has no URL
  }

  // Split the canonical URL into base URL and version (if present)
  const [baseCanonicalUrl, canonicalVersion] = canonicalUrl.split('|');

  // Check if the base URLs match
  const baseUrlsMatch = baseCanonicalUrl === questionnaire.url;

  // If the canonical URL has a version, check if it matches the questionnaire version
  if (canonicalVersion) {
    return baseUrlsMatch && (canonicalVersion === questionnaire.version); // Check version if present
  }

  // If the canonical URL does not have a version, just return the base URL match
  return baseUrlsMatch;
}


/**
 * Load a FHIR resource package file, which is a gzipped tar file.
 * See https://confluence.hl7.org/display/FHIR/NPM+Package+Specification
 * It then processes the file in memory and call loadQuestionnaire to add the questionnaire to the page.
 * See https://stackoverflow.com/questions/47443433/extracting-gzip-data-in-javascript-with-pako-encoding-issues
 * @param {*} urlPackage URL of a FHIR resource package
 */
async function loadPackageAndQuestionnaire(urlPackage) {

  let packageData = [];

  if (urlPackage) {
    return fetch(urlPackage)
      .then(response => {
        if(!response.ok) {
          throw 'Unable to fetch '+urlPackage;
        }
        else {
          return response.blob();
        }
      }).then(response => {
        let reader = new FileReader();
        reader.onload = function(event) {
        try {
          let base64 =   event.target.result;

          // base64 includes header info "data:application/gzip;base64,"
          // "data:application/gzip;base64,H4sIAAkTyF4AA+3RMQ6DMAyF4cw9RU6A4hDCeSIRdWMgRtDbN4BYkTpAl/9bLFtveJI1F210VXMjV8UQttn2odt3OfaDeCNtjN6JBFfv4mvSWHdnqdNcNE3WmiWN70++yuWpPFHoWVr/b4ek6fXvJgAAAAAAAAAAAAAAAACAX3wBvhQL0QAoAAA="
          // remove the header info
          let base64Content = base64.replace(/^data:[\/\+;a-zA-Z0-9\._-]+;base64,/, "");
          // convert arraybuffer to string
          const strData = atob(base64Content);

          // split it into an array rather than a "string"
          const charData = strData.split('').map(function(x){return x.charCodeAt(0); });

          // convert to binary
          const binData = new Uint8Array(charData);

          // inflate
          const unzippedData = pako.inflate(binData);

          // unzippedData could be too long and result in an error:
          //  "Uncaught RangeError: Maximum call stack size exceeded"
          // Use the following loop instead
          const uint16Data = new Uint16Array(unzippedData);
          let strAsciiData ="";
          let len = uint16Data.length;
          for (let i = 0; i < len; i++) {
            strAsciiData += String.fromCharCode(uint16Data[i]);
          }

          // convert string to ArrayBuffer
          const abData = str2ab(strAsciiData);

          // process the tar file
          // Note:
          //let fileJsonContent = extractedFile.readAsJSON();
          // readAsString (and readAsJSON) encountered two errors on on sample package.tgz file
          // 1) Uncaught RangeError: Maximum call stack size exceeded
          //    this is caused by the same reason above
          //    on line #89 in untar.js :
          //    (this._string = String.fromCharCode.apply(null, charCodes))
          //    where the side of charCodes could be too big.
          // 2) Uncaught SyntaxError: Unexpected token ï in JSON at position 0
          untar(abData)
            // .progress(function(extractedFile) {
              // do something with a single extracted file
              //let fileStrContent = extractedFile.readAsString();
              // if (extractedFile && extractedFile.name.match(/\.json$/)) {
              //   packageFiles[extractedFile.name] = extractedFile.readAsJSON();
              // }
            // })
            .then(async function(extractedFiles) {
              try { // zone.min.js blocks normal Promise-based catch
                if (Array.isArray(extractedFiles) && extractedFiles.length > 0) {
                  // all extracted files
                  let resInIndex = {}; // key is the file name, value is file info object
                  let qData; // the Questionnaire data read from the package
                  // check if the optional file, .index.json, is in the package
                  let indexFile = extractedFiles.find(function(file) { return file.name === 'package/.index.json';});
                  // only process files listed in .index.json if there is a .index.json
                  if (indexFile) {
                    let indexFileContent = indexFile.readAsJSON();
                    if (indexFileContent.files.length) {
                      for (let i=0, iLen = indexFileContent.files.length; i<iLen; i++) {
                        let fileInfo = indexFileContent.files[i];
                        if (qResourceTypes.has(fileInfo.resourceType)) {
                          resInIndex[fileInfo.filename] = fileInfo;
                        }
                      }
                      // remove the 'package/' from the file name and add file content
                      for (let j=0, jLen = extractedFiles.length; j<jLen; j++) {
                        let extractedFile = extractedFiles[j];
                        let fileInfo = resInIndex[extractedFile.name.replace(/^package\//, "")];
                        if (fileInfo && fileInfo.resourceType) {
                          const fileContent = await blobToJson(extractedFile.blob);
                          if (fileContent.resourceType != 'Questionnaire') {
                            fileInfo.fileContent = fileContent;
                            packageData.push(fileInfo);
                          }
                          else if (qCanonical && canonicalMatchesQuestionnaire(qCanonical,
                                   fileContent)) {
                            qData = fileContent;
                          }
                        }
                      }
                    }
                    else {
                      [packageData, qData] = await constructResourcePackage(extractedFiles)
                    }
                  }
                  // process all .json files in the /package directory if there is no .index.json
                  else {
                    [packageData, qData] = await constructResourcePackage(extractedFiles)
                  }

                  // packageData has the same structure of the .index.json file in the package file, with an extra fileContent
                  // that contains the data in each resource file.
                  // See https://confluence.hl7.org/display/FHIR/NPM+Package+Specification

                  // load questionnaire with the pakcage data
                  results.gotP = true;
                  return loadQuestionnaire(packageData, qData)
                }
                else {
                  results.gotP = false;
                  results.pErrorLocation = "untar";
                  return loadQuestionnaire(packageData)
                }
              }
              catch(error) {
                console.error('Untar Error', urlPackage, error);
                results.gotP = false;
                results.pErrorLocation = "untar";
                // try to load the questionnaire without the package, if we have a URL
                if (urlQSelected)
                  return loadQuestionnaire()
              }
            })
            .catch(function (error) {
              console.error('Untar Error', urlPackage, error);
              results.gotP = false;
              results.pErrorLocation = "untar";
              // try to load the questionnaire without the package, if we have a URL
              if (urlQSelected)
                return loadQuestionnaire()
            });
        }
        catch(error) {
          showErrorMessages(`Unable to unpack the package file ${urlPackage}.`);
          console.log("Unzip Error", urlPackage, error)
          results.gotP = false;
          results.pErrorLocation = "unzip";
          // try to load the questionnaire without the package, if we have a URL
          if (urlQSelected)
            return loadQuestionnaire()
        }

      };

      reader.onerror = function (error) {
        console.error('FileReader Error', urlPackage, error);
        results.gotP = false;
        esults.pErrorLocation = "reader";
        // try to load the questionnaire without the package
        return loadQuestionnaire()
      };

      reader.readAsDataURL(response);
    })
    .catch(error => {
      showErrorMessages('Unable to fetch '+urlPackage);
      console.error('Fetch Error:', urlPackage, error);
      results.gotP = false;
      results.pErrorLocation = "fetch"
      // try to load the questionnaire without the package, if we have a URL
      if (urlQSelected)
        return loadQuestionnaire();
    });
  }
}


/**
 * Show error messages.  Appends messages if other messages are already shown.
 * @param {} messages an error message, or an array of messsages
 */
export function showErrorMessages(messages) {
  if (messages) {
    let divError = document.getElementById('qv-error');
    const otherMessagesPresent = divError.style.display == '';
    divError.style.display = '';
    let divMessage = document.getElementById('qv-error-message');
    if (!Array.isArray(messages))
      messages = [messages];
    let ul;
    if (!otherMessagesPresent) {
      divMessage.textContent = 'The following issues were encountered:'
      ul = document.createElement('ul');
    }
    else
      ul = document.querySelector('#qv-error-message ul');

    for (let i=0, len=messages.length; i<len; ++i) {
      const li = document.createElement('li');
      let m = messages[i];
      if (m.message) // was this actually an Error instance?
        m = m.message;
      li.textContent = m;
      ul.appendChild(li);
    }
    divMessage.appendChild(ul);
  }

  setLoadingMessage(false);
}


/**
 * Clear up messages and previously loaded form before next Questionnaire is loaded
 */
function resetPage() {
  let divError = document.getElementById('qv-error');
  if (divError) divError.style.display = 'none';
  let divMessage = document.getElementById('qv-error-message');
  if (divMessage) divMessage.textContent ='';
  let formInfo = document.getElementById('qv-form-info');
  if (formInfo) formInfo.textContent = ''

  // remove previously added form if any
  let formContainer = document.getElementById('qv-lforms');
  while (formContainer.firstChild) {
    formContainer.removeChild(formContainer.lastChild);
  }

  // reset FHIR context
  LForms.fhirContext = null;

  setLoadingMessage(false);

}


/**
 * Sets up a client for a standard (open) FHIR server.
 * @param urlFhirServer the URL of a FHIR server.
 *  whether communication with the server was successfully established.
 * @return a Promise which resolves or rejects to indicate the success.
 */
function setupFHIRServer(urlFhirServer) {
  return (results.pendingServerConnection = new Promise((resolve, reject)=> {
    let fhir = FHIR.client(urlFhirServer);
    LForms.Util.setFHIRContext(fhir);
    // Retrieve the fhir version
    LForms.Util.getServerFHIRReleaseID(function(releaseID) {
      if (releaseID !== undefined) {
        results.gotS = true;
        resolve();
      }
      else {
        results.gotS = false;
        LForms.fhirContext = null;
        reject();
      }
    });
  }));
}

/**
 *  Initializes the results object for keeping track of the state of the current
 *  attempt of show a Questionnaire.
 */
function initResults() {
  results = {hasUrlQ: false, gotQ: false, hasUrlP: false, gotP: false, hasUrlS: false, gotS: false};
}


/**
 * Show a Questionnaire based on the parameters
 */
async function showQuestionnaire() {
  initResults();

  // has a Questionnaire URL
  if (urlQSelected || qCanonical) {
    if (urlQSelected)
      results.hasUrlQ = true;
    setLoadingMessage(true);
    if (urlSSelected) {
      // use a FHIR server
      results.hasUrlS = true;
      setupFHIRServer(urlSSelected);
    }
    if (urlPSelected) {
      // use a resource package
      results.hasUrlP = true;
      await loadPackageAndQuestionnaire(urlPSelected)
    }
    else {
      if (qCanonical) {
        showErrorMessages('A Questionnaire canonical was specified, but no '+
          'package URL was specified for retrieving it.');
      }
      else {
        // no package data
        loadQuestionnaire();
      }
    }
  }
  else {
    // no Questionnaire URL
    showErrorMessages("Please provide the URL of a FHIR Questionnaire.")
  }
}

/**
 *  Processed the parameters either from the URL or from the form.
 * @param configParams A Map-like object with the configuration
 *  parameter data.
 */
function processParameters(configParams) {
  urlQSelected = configParams.get('q');
  urlPSelected = configParams.get('p');
  urlSSelected = configParams.get('s');

  if (urlSSelected=='default')
    urlSSelected = defaultTerminologyServer;

  if (!urlPSelected) {
    const pID = configParams.get('pID');
    const pVersion = configParams.get('pVersion');
    if (pID && pVersion)
      urlPSelected = getPackageURL(pID, pVersion);
  }
  if (!urlQSelected) {
    qCanonical = configParams.get('qCanonical');
  }
}


/**
 * Page's onLoad event handler. Check URL parameters to load FHIR Questionnarie and resource package
 */
export function onPageLoad() {

  resetPage();

  // http://localhost:4029/?q=http://localhost:8080/questionnaire-use-package.json&p=http://localhost:8080/package.json.tgz
  const inputPanel = document.getElementById('qv-form-input');
  const urlLaunch = window.location.href;
  processParameters((new URL(urlLaunch)).searchParams);

   // show input panel if parameters are not provided in URL
  if (!urlQSelected && !qCanonical) {
    inputPanel.style.display = ''
  }
  else {
    showQuestionnaire();
  }
}


/**
 * Load the FHIR Questionnarie and resource package using the URLs users types in the fields
 * (Called when the user clicks a button.)
 */
export function viewQuestionnaire() {

  // Some sample URLs for FHIR Questionnaire / LForms data
  // https://clinicaltables.nlm.nih.gov/loinc_form_definitions?loinc_num=[LOINC_NUM]>
  // https://clinicaltables.nlm.nih.gov/loinc_form_definitions?loinc_num=34565-2
  // https://lforms-fhir.nlm.nih.gov/baseR4/Questionnaire/55418-8
  // https://lforms-fhir.nlm.nih.gov/baseR4/Questionnaire/24322-0

  resetPage();

  let inputPanel = document.getElementById('qv-form-input');

  inputPanel.style.display = ''
  processParameters(new Map([
    ['q', document.getElementById('urlQuestionnaire').value],
    ['p', document.getElementById('urlPackage').value],
    ['s', document.getElementById('urlFhirServer').value]
  ]));

  showQuestionnaire();
}


/**
 * Toggle the disable/enable attributes of the input fields for package URL and FHRI server URL
 * @param {*} eleId2Disable the id of the input field to be disabled
 * @param {*} eleId2Enable the id of the input field to be enabled
 */
export function toggleInputFields(eleId2Disable, eleId2Enable) {
  let eleDisable = document.getElementById(eleId2Disable);
  if (eleDisable) {
    eleDisable.disabled = true;
  }
  let eleEnable = document.getElementById(eleId2Enable);
  if (eleEnable) {
    eleEnable.disabled = false;
  }
}


// Parcel does not by default provide these exported functions on a global
// object, so create one here.
window.app = {onPageLoad, viewQuestionnaire, toggleInputFields, showErrorMessages};

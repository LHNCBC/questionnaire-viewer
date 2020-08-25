// Imports for webpack to find assets
import '../css/app.css';

import parse from "url-parse";
import pako from "pako";
import untar from "js-untar-lhc";
import str2ab from "string-to-arraybuffer";

let urlQSelected = null;
let urlPSelected = null;
let results = {hasUrlQ: false, gotQ: false, hasUrlP: false, gotP: false}

/**
 * Add a FHIR Questionnaire to page and display it
 * @param {*} dataQ FHIR Questionnaire data (LForms format also supported)
 * @param {*} dataPackage FHIR resource package data, optional
 */
function addQuestionnaire(dataQ, dataPackage) {

  if (dataQ && dataQ.resourceType === "Questionnaire") {

    let message = "The Questionnaire loaded from " + urlQSelected + 
    " cannot be prcoessed by LHC-Forms, please check if the Questionnaire is valid" +
    " or if it has features that LHC-Forms does not support yet.";

    let lfData = dataQ;
    // Convert FHIR Questionnaire to LForms format
    try {
      lfData = LForms.Util.convertFHIRQuestionnaireToLForms(dataQ);    
    }  
    catch(error) {
      console.error('Error:', error);
      results.gotQ = false;
      showErrorMessages(message)
    }
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
      LForms.Util.addFormToPage(lfData, "qv-lforms");
    }
    catch(error) {
      console.error('Error:', error);
      results.gotQ = false;
      showErrorMessages(message)
    }
  }
  
  showInfoMessages();
}


/**
 * Display information message once a Questionnaire is successfully loaded,
 * with or without a package file loaded successfully.
 */
function showInfoMessages() {
  let formNotes = document.getElementById('qv-form-notes');
  let formRendered = document.querySelector('lforms');
  let notes = "";
  if (results.hasUrlQ && results.gotQ && formRendered) {
    notes = "The following Questionnaire was loaded from " + urlQSelected;
    if (results.hasUrlP) {
      if (results.gotP) {
        notes += ", with resources from " + urlPSelected;
      }
      else {
        switch (results.pErrorLocation) {
          case "untar":
            notes += ", but failed to untar the package file from " + urlPSelected;
            break;
          case "unzip":
            notes += ", but failed to unzip the package file from " + urlPSelected;
            break;
          case "reader":
            notes += ", but failed to read the package file from " + urlPSelected;
            break;
          case "fetch": 
            notes += ", but failed to fetch the package file from " + urlPSelected;
            break;
          default:
            notes += ", but failed to fetch/process the package file from " + urlPSelected;
        }
      }
    }
    notes += ".";
  }
  formNotes.textContent  = notes;
}


/**
 * Load a FHIR Questionnaire resource, along with FHIR resource package data
 * and add it to pageLoad a FHIR resource package.
 * @param {*} urlQ URL of a FHIR Questionnaire resource
 * @param {*} packageData a FHIR resource package, optional
 */
function loadQuestionnaire(urlQ, packageData) {

  fetch(urlQ)  
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      else {
        return Promise.reject("No data returned from " + urlQ)
      }
    })
    .then(json => {
      if (json && json.resourceType === "Questionnaire") {
        results.gotQ = true;
        addQuestionnaire(json, packageData)
      }
      else {
        return Promise.reject("No Questionnaire (JSON) returned from " + urlQ)
      }      
    })
    .catch(error => {
      console.error('Error:', error);
      if (typeof error === 'string') {
        showErrorMessages(error);
      }
      else {
        showErrorMessages("Failed to load Questionnaire from " + urlQ);
      }

    });

}


/**
 * Construct a files info array with the same structure of 'files' in .index.json 
*  where resourceType, url and version are used in LHC-Forms to identifier a resource.
*  See https://confluence.hl7.org/display/FHIR/NPM+Package+Specification#NPMPackageSpecification-.index.json
 * @param {*} extractedFiles an array of file objects extracted from a tar file using js-untar-lhc npm package.
 */
function constructResourcePackage(extractedFiles) {

  let packageData = [];

  for (let j=0, jLen = extractedFiles.length; j<jLen; j++) {
    let fileInfo = {};
    let extractedFile = extractedFiles[j];

    if (extractedFile.name.match(/^package.*\.json$/)) {
      let fileContent = extractedFile.readAsJSON();
      if (fileContent && (fileContent.resourceType === 'ValueSet' || fileContent.resourceType === 'CodeSystem')) {      
        packageData.push({
          filename: extractedFile.name.replace(/^package\//, ""),
          fileContent: fileContent,
          url: fileContent.url,
          version: fileContent.version,
          resourceType: fileContent.resourceType
        })
      }  
    }
  }              

  return packageData;
}


/**
 * Load a FHIR resource package file, which is a gzipped tar file. 
 * See https://confluence.hl7.org/display/FHIR/NPM+Package+Specification
 * It then processes the file in memory and call loadQuestionnaire to add the questionnaire to the page.
 * See https://stackoverflow.com/questions/47443433/extracting-gzip-data-in-javascript-with-pako-encoding-issues
 * @param {*} urlPackage URL of a FHIR resource package
 * @param {*} urlQ URL of a FHIR Questionnaire resource
 */  
function loadPackageAndQuestionnaire(urlPackage, urlQ) {

    let packageData = [];
  
    if (urlPackage) {
      fetch(urlPackage)
        .then(response => {
          if(!response.ok) {
            throw response.ok // let catch handle it
          }
          else {
            return response.blob();
          }
         })
         .then(response => {
          let reader = new FileReader();
          reader.onload = function(event){

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
                .then(function(extractedFiles) {
                  if (Array.isArray(extractedFiles) && extractedFiles.length > 0) {
                    // all extracted files
                    let resInIndex = {}; // key is the file name, value is file info object
                    // check if the optional file, .index.json, is in the package
                    let indexFile = extractedFiles.find(function(file) { return file.name === 'package/.index.json';});
                    // only process files listed in .index.json if there is a .index.json
                    if (indexFile) {
                      let indexFileContent = indexFile.readAsJSON();
                      for (let i=0, iLen = indexFileContent.files.length; i<iLen; i++) {
                        let fileInfo = indexFileContent.files[i];
                        if (fileInfo.resourceType === 'ValueSet' || fileInfo.resourceType === 'CodeSystem') {
                          resInIndex[fileInfo.filename] = fileInfo;
                        }
                      }
                      // remove the 'package/' from the file name and add file content
                      for (let j=0, jLen = extractedFiles.length; j<jLen; j++) {
                        let extractedFile = extractedFiles[j];
                        let fileInfo = resInIndex[extractedFile.name.replace(/^package\//, "")];
                        if (fileInfo && (fileInfo.resourceType === 'ValueSet' || fileInfo.resourceType === 'CodeSystem')) {
                          fileInfo.fileContent = extractedFile.readAsJSON();
                          packageData.push(fileInfo);                  
                        }  
                      }              
                    }
                    // process all .json files in the /package directory if there is no .index.json
                    else {
                      packageData = constructResourcePackage(extractedFiles)
                    }
                    
                    // packageData has the same structure of the .index.json file in the package file, with an extra fileContent
                    // that contains the data in each resource file.
                    // See https://confluence.hl7.org/display/FHIR/NPM+Package+Specification

                    // load questionnaire with the pakcage data
                    results.gotP = true;
                    loadQuestionnaire(urlQ, packageData)
                  }
                  else {
                    results.gotP = false;
                    results.pErrorLocation = "untar";
                    loadQuestionnaire(urlQ, packageData)
                  }
                })
                .catch(function (error) {
                  console.error('Untar Error', urlPackage, error);
                  results.gotP = false;
                  results.pErrorLocation = "untar";
                  // try to load the questionnaire without the package
                  loadQuestionnaire(urlQ)
                });

            }
            catch(error) {
              console.log("Unzip Error", urlPackage, error)
              results.gotP = false;
              results.pErrorLocation = "unzip";
              // try to load the questionnaire without the package
              loadQuestionnaire(urlQ)
            }

          };

          reader.onerror = function (error) {
            console.error('FileReader Error', urlPackage, error);
            results.gotP = false;            
            esults.pErrorLocation = "reader";
            // try to load the questionnaire without the package
            loadQuestionnaire(urlQ)
          };

          reader.readAsDataURL(response);          
        })
        .catch(error => {
          console.error('Fetch Error:', urlPackage, error);
          results.gotP = false;
          results.pErrorLocation = "fetch"
          // try to load the questionnaire without the package
          loadQuestionnaire(urlQ)
        });
    }  
}


/**
 * Show error messages
 * @param {} message an error message
 */
function showErrorMessages(message) {
  if (message) {
    let divError = document.getElementById('qv-error');
    divError.style.display = '';
    let divMessage = document.getElementById('qv-error-message');
    divMessage.textContent = message;
  }
}


/**
 * Clear up messgaes and previously loaded form before next Questionnaire is loaded
 */
function resetPage() {
  let divError = document.getElementById('qv-error');
  if (divError) divError.style.display = 'none';
  let divMessage = document.getElementById('qv-error-message');
  if (divMessage) divMessage.textContent ='';
  let formNotes = document.getElementById('qv-form-notes');
  if (formNotes) formNotes.textContent = ''

  // remove previously added form if any
  let formContainer = document.getElementById('qv-lforms');
  while (formContainer.firstChild) {
    formContainer.removeChild(formContainer.lastChild);
  }
  
}

/**
 * Page's onLoad event hanlder. Check URL parameters to load FHIR Questionnarie and resource package
 */
export function onPageLoad() {

  resetPage();

  // http://localhost:4029/?q=http://localhost:8080/questionnaire-use-package.json&p=http://localhost:8080/package.json.tgz
  let inputPanel = document.getElementById('qv-form-input');
  let urlLaunch = window.location.href;
  let parsedUrl = parse(urlLaunch, true);
  let urlQuestionnaireParam = parsedUrl && parsedUrl.query ? parsedUrl.query.q : null;
  let urlPackageParam = parsedUrl && parsedUrl.query ? parsedUrl.query.p : null;
  
  results = {hasUrlQ: false, gotQ: false, hasUrlP: false, gotP: false};

  urlQSelected = urlQuestionnaireParam;
  urlPSelected = urlPackageParam;

  // show input panel if parameters are not provided in URL
  if (!urlQuestionnaireParam ) {
    inputPanel.style.display = ''
  }

  if (urlQuestionnaireParam && urlPackageParam) {
    results.hasUrlP = true;
    results.hasUrlQ = true;
    loadPackageAndQuestionnaire(urlPackageParam, urlQuestionnaireParam)
  }
  else if (urlQuestionnaireParam) {
    results.hasUrlQ = true;
    loadQuestionnaire(urlQuestionnaireParam)
  }

}


/**
 * Load the FHIR Questionnarie and resource package using the URLs users types in the fields
 */
export function viewQuestionnaire() {

  // Some sample URLs for FHIR Questionnaire / LForms data
  // https://clinicaltables.nlm.nih.gov/loinc_form_definitions?loinc_num=[LOINC_NUM]>
  // https://clinicaltables.nlm.nih.gov/loinc_form_definitions?loinc_num=34565-2
  // https://lforms-smart-fhir.nlm.nih.gov/v/r4/fhir/Questionnaire/55418-8-x
  // https://lforms-smart-fhir.nlm.nih.gov/v/r4/fhir/Questionnaire/24322-0-x

  resetPage();

  let inputPanel = document.getElementById('qv-form-input');

  inputPanel.style.display = ''
  let urlQ = document.getElementById('urlQuestionnaire').value;
  let urlP = document.getElementById('urlPackage').value;

  results = {hasUrlQ: false, gotQ: false, hasUrlP: false, gotP: false};

  urlQSelected = urlQ;
  urlPSelected = urlP;

  if (urlQ && urlP) {
    results.hasUrlP = true;
    results.hasUrlQ = true;
    loadPackageAndQuestionnaire(urlP, urlQ)
  }
  else if (urlQ) {
    results.hasUrlQ = true;
    loadQuestionnaire(urlQ)    
  }
  else {
    showErrorMessages("Please provide the URL of a FHIR Questionnaire.")
  }

}
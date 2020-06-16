// Imports for webpack to find assets
import '../css/app.css';

import parse from "url-parse";
import pako from "pako";
import untar from "js-untar-lhc";
import str2ab from "string-to-arraybuffer";


/**
 * Add a FHIR Questionnaire to page and display it
 * @param {*} dataQ FHIR Questionnaire data (LForms format also supported)
 * @param {*} dataPackage FHIR resource package data, optional
 */
function addQuestionnaire(dataQ, dataPackage) {

  let lfData = dataQ;
  // Convert FHIR Questionnaire to LForms format
  if (lfData.resourceType === "Questionnaire" && lfData.item) {    
    lfData = LForms.Util.convertFHIRQuestionnaireToLForms(dataQ, 'R4');    
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
  LForms.Util.addFormToPage(lfData, "lforms");

}


/**
 * Load a FHIR Questionnaire resource, along with FHIR resource package data
 * and add it to pageLoad a FHIR resource package.
 * @param {*} urlQ URL of a FHIR Questionnaire resource
 * @param {*} packageData a FHIR resource package, optional
 */
function loadQuestionnaire(urlQ, packageData) {

  fetch(urlQ)  
    .then(res => res.json())
    .then(json => {
      addQuestionnaire(json, packageData)
    })
    .catch(error => {
      console.error('Error:', error);
    });

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
        .then(res => res.blob())
        .then(response => {

          let reader = new FileReader();
          reader.onload = function(event){
            let base64 =   event.target.result;

            // base64 includes header info "data:application/gzip;base64,"
            // "data:application/gzip;base64,H4sIAAkTyF4AA+3RMQ6DMAyF4cw9RU6A4hDCeSIRdWMgRtDbN4BYkTpAl/9bLFtveJI1F210VXMjV8UQttn2odt3OfaDeCNtjN6JBFfv4mvSWHdnqdNcNE3WmiWN70++yuWpPFHoWVr/b4ek6fXvJgAAAAAAAAAAAAAAAACAX3wBvhQL0QAoAAA="

            // remove the header info
            let base64Content = base64.replace(/^data:[\/;a-zA-Z0-9\._-]+;base64,/, "");

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
              .progress(function(extractedFile) {
                // do something with a single extracted file
                //let fileStrContent = extractedFile.readAsString();
                // if (extractedFile && extractedFile.name.match(/\.json$/)) {              
                //   packageFiles[extractedFile.name] = extractedFile.readAsJSON();
                // }
              })
              .then(function(extractedFiles) {
                // all extracted files
                let resInIndex = {}; // key is the file name, value is file info object
                // only process the files listed in .index.json
                let indexFile = extractedFiles.find(function(file) { return file.name === 'package/.index.json';});
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
                // packageData has the same structure of the .index.json file in the package file, with an extra fileContent
                // that contains the data in each resource file.
                // See https://confluence.hl7.org/display/FHIR/NPM+Package+Specification

                // load questionnaire with the pakcage data
                loadQuestionnaire(urlQ, packageData)
              })
              .catch(function (err) {
                console.error('Untar Error', urlPackage, error);
              });
          };

          reader.onerror = function (error) {
            console.error('FileReader Error', urlPackage, error);
          };

          reader.readAsDataURL(response);
        })
        .catch(error => {
          console.error('Fetch Error:', urlPackage, error);
        });
    }  
}


/**
 * Page's onLoad event hanlder. Check URL parameters to load FHIR Questionnarie and resource package
 */
export function onPageLoad() {
  // http://localhost:4029/?q=http://localhost:8080/questionnaire-use-package.json&p=http://localhost:8080/package.json.tgz
  let inputPanel = document.getElementById('form-input');
  let urlLaunch = window.location.href;
  let parsedUrl = parse(urlLaunch, true);
  let urlQuestionnaireParam = parsedUrl && parsedUrl.query ? parsedUrl.query.q : null;
  let urlPackageParam = parsedUrl && parsedUrl.query ? parsedUrl.query.p : null;

  // hide input panel if parameters are provided in URL
  if (urlQuestionnaireParam ) {
    inputPanel.style.display = 'none'
  }

  if (urlQuestionnaireParam && urlPackageParam) {
    loadPackageAndQuestionnaire(urlPackageParam, urlQuestionnaireParam)
  }
  else if (urlQuestionnaireParam) {
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

  let inputPanel = document.getElementById('form-input');

  inputPanel.style.display = ''
  let urlQ = document.getElementById('urlQuestionnaire').value;
  let urlP = document.getElementById('urlPackage').value;

  if (urlQ && urlP) {
    loadPackageAndQuestionnaire(urlP, urlQ)
  }
  else if (urlQ) {
    loadQuestionnaire(urlQ)
  }

}
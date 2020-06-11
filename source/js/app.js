// Imports for webpack to find assets
import '../css/app.css';

import parse from "url-parse";
import pako from "pako";
import untar from "js-untar";
import str2ab from "string-to-arraybuffer";


function addQuestionnaire(dataQ, dataPackage) {

  let lfData = dataQ;
  if (lfData.resourceType === "Questionnaire" && lfData.item) {
    // Convert FHIR Questionnaire to LForms format
    lfData = LForms.FHIR.R4.SDC.convertQuestionnaireToLForms(dataQ);    
  }

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

function loadQuestionnaire(urlQ) {

  fetch(urlQ)
  .then(res => res.json())
  .then(json => {
    addQuestionnaire(json)
  })
}


function loadQuestionnaireWithPackage(urlQ, dataPackage) {
  fetch(urlQ)
  .then(res => res.json())
  .then(json => {
    addQuestionnaire(json, dataPackage)
  })
}

  //https://stackoverflow.com/questions/47443433/extracting-gzip-data-in-javascript-with-pako-encoding-issues
function loadPackageAndQuestionnaire(urlPackage, urlQ) {

    var resTypesNeeded = ['ValueSet', 'CodeSystem'];
    var packageFiles = {};
    var resources = [];
  
    if (urlPackage) {
      fetch(urlPackage)
      .then(res => res.blob()) //arrayBuffer())
      .then(response => {

        var reader = new FileReader();
        reader.onload = function(event){
          var base64 =   event.target.result;

          // base64 includes header info
          // "data:application/gzip;base64,H4sIAAkTyF4AA+3RMQ6DMAyF4cw9RU6A4hDCeSIRdWMgRtDbN4BYkTpAl/9bLFtveJI1F210VXMjV8UQttn2odt3OfaDeCNtjN6JBFfv4mvSWHdnqdNcNE3WmiWN70++yuWpPFHoWVr/b4ek6fXvJgAAAAAAAAAAAAAAAACAX3wBvhQL0QAoAAA="

          var base64Content = base64.replace(/^data:[\/;a-zA-Z0-9\._-]+;base64,/, "");

          const strData = atob(base64Content);

          // split it into an array rather than a "string"
          const charData = strData.split('').map(function(x){return x.charCodeAt(0); });
  
          // convert to binary
          const binData = new Uint8Array(charData);
  
          // inflate
          const unzippedData = pako.inflate(binData);
          
          // Convert gunzipped byteArray back to ascii string:
          // var strAsciiData   = String.fromCharCode.apply(null, new Uint16Array(unzippedData));
          
          // unzippedData could be too long and result in an error: 
          //  "Uncaught RangeError: Maximum call stack size exceeded"
          // Use the following loop instead 
          const uint16Data = new Uint16Array(unzippedData);
          var strAsciiData ="";
          var len = uint16Data.length;
          for (var i = 0; i < len; i++) {
            strAsciiData += String.fromCharCode(uint16Data[i]);
          }

          // convert string to ArrayBuffer
          const abData = str2ab(strAsciiData);

          untar(abData)
          .progress(function(extractedFile) {
            // do something with a single extracted file
            
            //var fileJsonContent = extractedFile.readAsJSON(); 
            // readAsString (and readAsJSON) encountered two errors on on sample package.tgz file
            // 1) Uncaught RangeError: Maximum call stack size exceeded
            //    this is caused by the same reason above
            //    on line #89 in untar.js :
            //    (this._string = String.fromCharCode.apply(null, charCodes))
            //    where the side of charCodes could be too big.
            // 2) Uncaught SyntaxError: Unexpected token ï in JSON at position 0

            //var fileStrContent = extractedFile.readAsString();
            
            // if (extractedFile && extractedFile.name.match(/\.json$/)) {              
            //   packageFiles[extractedFile.name] = extractedFile.readAsJSON();
            // }

          })
          .then(function(extractedFiles) {
            // all extracted files
            //console.log(extractedFiles);
            var resInIndex = {};
            
//            console.log(packageFiles);
            var indexFile = extractedFiles.find(function(file) { return file.name === 'package/.index.json';});
            if (indexFile && indexFile) {
              var indexFileContent = indexFile.readAsJSON();
              for (var i=0, iLen = indexFileContent.files.length; i<iLen; i++) {
                var fileInfo = indexFileContent.files[i];
                if (fileInfo.resourceType === 'ValueSet' || fileInfo.resourceType === 'CodeSystem') {
                  resInIndex[fileInfo.filename] = fileInfo;
                }
              }

              for (var j=0, jLen = extractedFiles.length; j<jLen; j++) {
                var extractedFile = extractedFiles[j];
                var fileInfo = resInIndex[extractedFile.name.replace(/^package\//, "")];
                if (fileInfo) {
                  fileInfo.fileContent = extractedFile.readAsJSON();
                  resources.push(fileInfo);                  
                }  
              }              
            }
            console.log(resources);
            loadQuestionnaireWithPackage(urlQ, resources)
          });
        };

        reader.readAsDataURL(response);
      });
    }
  
}

export function viewQuestionnaire() {

  let urlQuestionnaireInput = document.getElementById('urlQuestionnaire').value;
  let urlPackageInput = document.getElementById('urlPackage').value;


  let urlLaunch = window.location.href;

  urlLaunch = urlLaunch + "?q=" + "http://localhost:8080/questionnaire-use-package.json" + "&p=" + "http://localhost:8080/package.json.tgz";
//  urlLaunch = urlLaunch + "?q=" + "http://localhost:8080/questionnaire-use-package.json" ;

  let parsedUrl = parse(urlLaunch, true);
  let urlQuestionnaireParam = parsedUrl && parsedUrl.query ? parsedUrl.query.q : null;


  let urlPackageParam = parsedUrl && parsedUrl.query ? parsedUrl.query.p : null;

  if (urlQuestionnaireParam && urlPackageParam) {
    loadPackageAndQuestionnaire(urlPackageParam, urlQuestionnaireParam)
  }
  else if (urlQuestionnaireParam) {
    loadQuestionnaire(urlQuestionnaireParam)
  }



}
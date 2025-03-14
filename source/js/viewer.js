// This file is the main script for the application.  When this was written,
// there were originally two pages, index.html and viewer.html which both used app.js, and
// this file contained the code only used by viewer.html.  The code here is
// mostly for the lforms version menu, and it includes app.js.

import {loadLForms, getSupportedLFormsVersions, changeLFormsVersion} from 'lforms-loader'
import * as app from './app.js';

const params = new URL(document.location).searchParams;
const lfv = params.get('lfv');
let lformsVersion = lfv || '29.2.3';

if (/^\d+\.\d+\.\d+(-beta\.\d+)?$/.test(lformsVersion)) {
  // For testing new releases of lforms, we would like to run as many tests as
  // possible with the new version.  However:
  // 1) We have a test that makes sure the default remains as 29.2.3, for
  //    backward-compatibility.
  // 2) Some tests comfirm that the lfv parameter loads the requested version of
  //    lhc-forms
  // 3) We want to make sure that changes to the questionnaire-viewer do not
  //    break things for version 29.2.3, so we don't want to change the tests to
  //    always us the latest version.
  // Therefore, we have a variable here which can override the location for
  // loading the default version of lforms.   When testing a new version of
  // lforms, this can be set to a localhost webserver serving the new version--
  // and the only test that will fail will be the one that checks that the
  // default is version 29.2.3.  Also, when we change the default, we need to
  // change the loaded version to something greater than 33, since earlier
  // versions have a different file structure.

  window.urlForTestingLForms = undefined; // Set to override the default URL for loading LHC-Forms when the lfv parameter is not used

  let lformsLoadURL = undefined;
  if (urlForTestingLForms && !lfv) {
    lformsVersion = '33.0.0';
    lformsLoadURL = urlForTestingLForms;
  }
  loadLForms(lformsVersion, showHeader, lformsLoadURL).then(()=>initApp(),
    (e)=>{ // promise rejection
      console.log(e); // in case some exception was thrown
      showHeader();
      showError('Unable to load version "'+lformsVersion+'" of the LHC-Forms software.');
    }
  );
}
else {
  showHeader();
  showError('An invalid version "'+lformsVersion+'" of the LHC-Forms software was requested.');
}


/**
 *  Shows the header, which is initially hidden under after the LForms CSS
 *  loads.
 */
function showHeader() {
  document.getElementById('header').style.display = 'block';
}


/**
 *  Fetches and initializes the menu of LForms versions.
 */
function initLFormsVersionMenu() {
  // Get the list of lforms versions
  getSupportedLFormsVersions().then(versions=>{
    const ac = new LForms.Def.Autocompleter.Prefetch('lformsVersion', versions,
      {defaultValue: LForms.lformsVersion, matchListValue: true, addSeqNum: false});
    ac.setFieldToListValue(LForms.lformsVersion);
    document.getElementById('lformsVersionMenu').style.display='inline';
    LForms.Def.Autocompleter.Event.observeListSelections('lformsVersion', (data)=>{
      if (data.final_val && data.on_list && data.final_val != LForms.lformsVersion)
        changeLFormsVersion(data.final_val);
    });
  });
}


/**
 *  Initializes the app after everything has loaded.
 */
function initApp() {
  initLFormsVersionMenu();
  app.onPageLoad()
}


/**
 *  Waits for the application code to load, and then shows the given error
 *  message.
 */
function showError(msg) {
  app.showErrorMessages(msg);
}


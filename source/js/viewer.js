// This file is the main script for the application.  When this was written,
// there were originally two pages, index.html and viewer.html which both used app.js, and
// this file contained the code only used by viewer.html.  The code here is
// mostly for the lforms version menu, and it includes app.js.

import {loadLForms, getSupportedLFormsVersions, changeLFormsVersion} from 'lforms-loader'
import * as app from './app.js';

let params = new URL(document.location).searchParams;
let lformsVersion = params.get('lfv') || '29.2.3';

if (/^\d+\.\d+\.\d+(-beta\.\d+)?$/.test(lformsVersion)) {
  loadLForms(lformsVersion, showHeader).then(()=>initApp(),
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


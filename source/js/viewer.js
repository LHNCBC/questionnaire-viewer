// This file is the main script for the application.  When this was written,
// there were originally two pages, index.html and viewer.html which both used app.js, and
// this file contained the code only used by viewer.html.  The code here is
// mostly for the lforms version menu, and it includes app.js.

import {loadLForms} from './lformsLoader.js'
import semverSort from 'semver/functions/rsort';
import * as app from './app.js';

let params = new URL(document.location).searchParams;
let lformsVersion = params.get('lfv') || '29.2.3';

if (/^\d+\.\d+\.\d+(-beta\.d+)?$/.test(lformsVersion)) {
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
  fetch('https://clinicaltables.nlm.nih.gov/lforms-versions').then(response=>{
    // https://clinicaltables.nlm.nih.gov/lforms-versions contains output like:
    // <span class="name">lforms-9.0.2.zip</span>
    if (response.ok) { // otherwise, don't show the menu
      response.text().then(pageText=>{
        const versions  =
          [...pageText.matchAll(/<span class="name">lforms-(.*)\.zip<\/span>/g)].map(
            m=>m[1]).filter(v=>v.split('.')[0]>=29);
        semverSort(versions);
        const ac = new LForms.Def.Autocompleter.Prefetch('lformsVersion', versions,
          {defaultValue: LForms.lformsVersion, matchListValue: true, addSeqNum: false});
        ac.setFieldToListValue(LForms.lformsVersion);
        $('#lformsVersionMenu')[0].style.display='inline';
        LForms.Def.Autocompleter.Event.observeListSelections('lformsVersion', (data)=>{
          if (data.final_val && data.on_list && data.final_val != LForms.lformsVersion)
            changeLFormsVersion(data.final_val);
        });
      });
    }
  });
}

/**
 *  Handles a selection of a new LForms version.
 * @param newLFormsVersion the new version to switch to (assumed valid)
 */
function changeLFormsVersion(newLFormsVersion) {
  // We need to reload the page.
  // The menu only shows if parameters were not set for the questionnaire, so
  // we can't preserve any field values the user might have filled in for the
  // questionnaire.
  let pageURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  params.set('lfv', newLFormsVersion);
  window.location = pageURL + '?' + params;
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


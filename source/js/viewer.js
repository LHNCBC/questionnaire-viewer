import {loadLForms} from './lformsLoader.js'
import semverSort from 'semver/functions/rsort';


let params = new URL(document.location).searchParams;
let lformsVersion = params.get('lfv') || '29.2.3';
loadLForms(lformsVersion).then(()=>initApp(),
  (e)=>{ // promise rejection
    console.log(e); // in case some exception was thrown
    showError('Unable to load the LHC-Forms software.  Try reloading the page.');
  }
);

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


// Wait for LForms to be defined, then append the FHIR library
function waitFor(condition, action) {
  if (!condition())
    setTimeout(()=>waitFor(condition, action), 10);
  else
    action();
}

/**
 *  Initializes the app after it has loaded.
 */
function initApp() {
  initLFormsVersionMenu();
  waitFor(()=>typeof app != 'undefined', ()=>app.onPageLoad());
}


/**
 *  Waits for the application code to load, and then shows the given error
 *  message.
 */
function showError(msg) {
  waitFor(()=>typeof app != 'undefined', ()=>app.showErrorMessages(msg));
}


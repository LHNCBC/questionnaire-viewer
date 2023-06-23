import {loadLForms} from './lformsLoader.js'

let params = new URL(document.location).searchParams;
let lformsVersion = params.get('lfv') || '33.3.3';
loadLForms(lformsVersion).then(()=>initApp(),
  (e)=>{ // promise rejection
    console.log(e); // in case some exception was thrown
    showError('Unable to load the LHC-Forms software.  Try reloading the page.');
  }
);

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
  waitFor(()=>typeof app != 'undefined', ()=>app.onPageLoad());
}


/**
 *  Waits for the application code to load, and then shows the given error
 *  message.
 */
function showError(msg) {
  waitFor(()=>typeof app != 'undefined', ()=>app.showErrorMessages(msg));
}


let params = new URL(document.location).searchParams;
let lformsVersion = params.get('lfv') || '33.3.3';  // TBD - also add menu with available versions
const cssTag = document.createElement('link');
const lformsDir = "https://clinicaltables.nlm.nih.gov/lforms-versions/"+lformsVersion;
cssTag.setAttribute('href', lformsDir+"/webcomponent/styles.css");
cssTag.setAttribute('media', 'screen');
cssTag.setAttribute('rel', 'stylesheet');
document.head.appendChild(cssTag);

// TBD - Add support for version 29
const lformsScripts = ['assets/lib/zone.min.js', 'scripts.js', 'runtime.js',
'polyfills.js', 'main.js'];
for (let filename of lformsScripts) {
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('src', lformsDir+"/webcomponent/"+filename);
  scriptTag.addEventListener('error', ()=>{
    showError('Unable to load the LHC-Forms software.  Try reloading the page.');
  });
  document.body.appendChild(scriptTag);
}

const scriptTag = document.createElement('script');
scriptTag.setAttribute('src', lformsDir+"/fhir/lformsFHIRAll.min.js");
// Wait for LForms to be defined, then append the FHIR library
function waitFor(condition, action) {
  if (!condition())
    setTimeout(()=>waitFor(condition, action), 10);
  else
    action();
}
function waitForFHIRSupportAndApp() {
  waitFor(()=>typeof LForms.FHIR != 'undefined' && typeof app != 'undefined',
    ()=>app.onPageLoad());
}
waitFor(()=>typeof LForms != 'undefined',
  ()=>{
    document.body.appendChild(scriptTag);
    waitForFHIRSupportAndApp();
  });

/**
 *  Waits for the application code to load, and then shows the given error
 *  message.
 */
function showError(msg) {
  waitFor(()=>typeof app != 'undefined', ()=>app.showErrorMessages(msg));
}


/**
 *  Loads LForms into the page, returning a promise that resolves when it is
 *  ready.
 * @param version the version to be loaded
 */
export function loadLForms(version) {
  const lformsDir = "https://clinicaltables.nlm.nih.gov/lforms-versions/"+version;
  // TBD Add support for versions < 33
  let cssFile, lformsScripts, fhirScript;
  const majorVersion = version.split('.')[0];
  if (majorVersion >= 33) {
    cssFile = '/webcomponent/styles.css';
    lformsScripts = ['assets/lib/zone.min.js', 'scripts.js', 'runtime.js',
      'polyfills.js', 'main.js'].map(f=>'/webcomponent/'+f);
    fhirScript = "/fhir/lformsFHIRAll.min.js";
  }
  else if (majorVersion >= 30) {
    cssFile = '/webcomponent/styles.css';
    lformsScripts = ['assets/lib/zone.min.js', 'scripts.js', 'runtime-es5.js',
      'polyfills-es5.js', 'main-es5.js'].map(f=>'/webcomponent/'+f);
    fhirScript = "/fhir/lformsFHIRAll.min.js";
  }
  else {
    cssFile = '/styles/lforms.min.css';
    lformsScripts = ['/lforms.min.js'];
    fhirScript = "/fhir/lformsFHIRAll.min.js";
  }

  const cssTag = document.createElement('link');
  cssTag.setAttribute('href', lformsDir+cssFile);
  cssTag.setAttribute('media', 'screen');
  cssTag.setAttribute('rel', 'stylesheet');
  let loadPromises = [];
  loadPromises.push(loadTag(cssTag));

  for (let filename of lformsScripts) {
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', lformsDir+filename);
    loadPromises.push(loadTag(scriptTag));
  }

  // We need to wait for the LForms script to load before loading the FHIR
  // support.
  return Promise.all(loadPromises).then(()=>{
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', lformsDir+fhirScript);
    return loadTag(scriptTag).then(()=>console.log('Loaded LHC-Forms'));
  });
}


/**
 *  Loads a tag (for CSS or a script) and returns a promise the resolves
 *  when all of the associated file has loaded or has failed to load.
 * @param tag the tag to load
 */
function loadTag(tag) {
  return new Promise((resolve, reject) => {
    tag.addEventListener('error', (event)=>{
      reject();
    });
    tag.addEventListener('load', (event)=>{
      resolve();
    });
    if (tag.tagName == 'LINK')
      document.head.appendChild(tag);
    else
      document.body.appendChild(tag);
  });
}

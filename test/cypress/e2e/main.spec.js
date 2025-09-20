import {getPackageURL} from '../../../source/js/config.js';

describe('FHIR Questionnaire Viewer', () => {
  describe('LForms Version menu', ()=>{
    it('should reload the page with a different LForms version', ()=>{
      cy.visit('/');
      cy.byId('lformsVersion').click().clear().type('33.3.7{enter}');
      cy.location('search').should('equal', '?lfv=33.3.7');
    });

    it('should not change the path or other parameters', ()=>{
      const qURL = Cypress.config().baseUrl + '/weightHeightQuestionnaire_r4.json';
      cy.visit('/index.html?q='+qURL+'&lfv=33.3.4');
      cy.byId('lformsVersion').click().clear().type('33.3.7{enter}');
      cy.location('search').should('equal', '?q='+encodeURIComponent(qURL)+'&lfv=33.3.7');
      cy.location('pathname').should('equal', '/index.html');
    });

    it('should also work with lfv is the first parameter', ()=>{
      const qURL = Cypress.config().baseUrl + '/weightHeightQuestionnaire_r4.json';
      cy.visit('/index.html?lfv=33.3.4&q='+qURL);
      cy.byId('lformsVersion').click().clear().type('33.3.7{enter}');
      cy.location('search').should('equal', '?lfv=33.3.7&q='+encodeURIComponent(qURL));
      cy.location('pathname').should('equal', '/index.html');
    });
  });


  describe('lfv parameter', ()=>{
    const qURL = Cypress.config().baseUrl + '/weightHeightQuestionnaire_r4.json';

    it('should default to 29.2.3 when not set', ()=>{
      // One of the FHIR implementation guides has published links to the
      // questionnaire viewer, and expects version 29.2.3, and might not work
      // with newer LForms versions.
      // https://build.fhir.org/ig/HL7/fhir-sirb/
      // One of the links for the Questionnaires:
      // https://lhncbc.github.io/questionnaire-viewer/?q=https://build.fhir.org/ig/HL7/fhir-sirb/Questionnaire-sirb-initiate-study-questionnaire-populate.json
      // but there are others in that IG.
      const defaultVersion = '29.2.3'
      cy.visit('/?q='+encodeURIComponent(qURL));
      cy.window().then(win=> {
        // This won't pass when testing a new version of LForms, so skip it then.
        if (!win.urlForTestingLForms) {
          cy.byId('lformsVersion').should('have.value', defaultVersion);
          cy.window().then(win=>{
            expect(win.LForms.lformsVersion).to.equal(defaultVersion);
          });
          cy.byId('qv-lforms').should('contain.text', 'Weight'); // confirm the questionnaire is loaded
        }
      });
    });

    it('should work to load the specified version of LForms', ()=>{
      const lfv = '33.3.7';
      cy.visit('/?q='+encodeURIComponent(qURL)+'&lfv='+lfv);
      cy.byId('lformsVersion').should('have.value', lfv);
      cy.window().then(win=>{
        expect(win.LForms.lformsVersion).to.equal(lfv);
      });
      cy.byId('qv-lforms').should('contain.text', 'Weight'); // confirm the questionnaire is loaded
    });

    it('should work to load a specified beta version of LForms', ()=>{
      const lfv = '30.0.0-beta.9';
      cy.visit('/?q='+encodeURIComponent(qURL)+'&lfv='+lfv);
      cy.byId('lformsVersion').should('have.value', lfv);
      cy.window().then(win=>{
        expect(win.LForms.lformsVersion).to.equal(lfv);
      });
      cy.byId('qv-lforms').should('contain.text', 'Weight'); // confirm the questionnaire is loaded
    });

    it('should not accept invalid LForms version strings', ()=>{
      // This is so we don't create a means for hackers to pass in an arbitrary
      // string
      const lfv = 'shadow';
      cy.visit('/?q='+encodeURIComponent(qURL)+'&lfv='+lfv);
      cy.byId('qv-error').should('be.visible');
      cy.byId('lformsVersion').should('not.be.visible');
      cy.window().then(win=>{
        expect(win.LForms).to.be.undefined;
      });
      cy.byId('qv-lforms').should('not.be.visible');
    });

    it('should accept lforms=latest', ()=>{
      const lfv='latest';
      // The actual version loaded will be a value at least 38 or higher.
      // Check the first part of the version strings.
      cy.visit('/?q='+encodeURIComponent(qURL)+'&lfv='+lfv);
      cy.window().should('have.property', 'LForms');
      cy.window().then(win=>{
        expect(parseInt(win.LForms.lformsVersion.split('.')[0])).to.be.at.least(38);
      });
      cy.byId('qv-lforms').should('contain.text', 'Weight'); // confirm the questionnaire is loaded
    });

  });


  describe('URLs provided on page', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should load a Questionnaire without resource package', () => {
      const urlQ = 'urlQuestionnaire',
          urlP =  'urlPackage',
          firstItem =  '/q1/1',
          btn = 'qv-btn-load',
          notes = 'qv-form-notes';

      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + '/questionnaire-use-package.json');
      cy.byId(btn)
          .click();
      cy.byId(firstItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(firstItem)
          .should('have.value', '');
      cy.byId(notes)
          .should('contain.text', '/questionnaire-use-package.json');
    });

    it('should load both R4 and STU3 versions of Questionnaire', () => {
      const urlQ = 'urlQuestionnaire',
          urlP =  'urlPackage',
          dropdown =  '/8352-7/1',
          btn = 'qv-btn-load',
          notes = 'qv-form-notes';

      // r4
      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + '/weightHeightQuestionnaire_r4.json');
      cy.byId(btn)
          .click();
      cy.byId(dropdown)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(dropdown)
          .should('have.value', 'Underwear or less');
      cy.byId(notes)
          .should('contain.text', '/weightHeightQuestionnaire_r4.json');

      // stu3
      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + '/weightHeightQuestionnaire_stu3.json');
      cy.byId(btn)
          .click();
      cy.byId(dropdown)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(dropdown)
          .should('have.value', 'Underwear or less');
      cy.byId(notes)
          .should('contain.text', '/weightHeightQuestionnaire_stu3.json');
    });

    it('should load a Questionnaire with a resource package', () => {
      const urlQ = 'urlQuestionnaire',
          urlP =  'urlPackage',
          firstItem =  '/q1/1',
          secondItem =  '/q2/1',
          thirdItem =  '/q3/1',
          btn = 'qv-btn-load',
          notes = 'qv-form-notes';

      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + '/questionnaire-use-package.json');
      cy.byId(urlP)
          .clear()
          .type(Cypress.config().baseUrl + '/package.json.tgz');
      cy.byId(btn)
          .click();

      cy.byId(firstItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(firstItem)
          .should('have.value', 'Cholesterol [Moles/volume] in Serum or Plasma');

      cy.byId(secondItem)
          .click()
          .type('{downArrow}')
          .type('{downArrow}')
          .blur();
      cy.byId(secondItem)
          .should('have.value', 'Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma');

      cy.byId(notes)
          .should('contain.text', '/questionnaire-use-package.json')
          .should('contain.text', '/package.json.tgz');
    });


    it('should load a Questionnaire with a resource package that contains an .index.json with and empty files[] array', () => {
      // Not sure this is a valid case, but it happened.
      const urlQ = 'urlQuestionnaire',
          urlP =  'urlPackage',
          firstItem =  '/q1/1',
          secondItem =  '/q2/1',
          thirdItem =  '/q3/1',
          btn = 'qv-btn-load',
          notes = 'qv-form-notes';

      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + '/questionnaire-use-package.json');
      const packageURL = '/package-empty-files-array.json.tgz';
      cy.byId(urlP)
          .clear()
          .type(Cypress.config().baseUrl + packageURL);
      cy.byId(btn)
          .click();

      cy.byId(firstItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(firstItem)
          .should('have.value', 'Cholesterol [Moles/volume] in Serum or Plasma');

      cy.byId(secondItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .type('{downArrow}')
          .blur();
      cy.byId(secondItem)
          .should('have.value', 'Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma');

      cy.byId(notes)
          .should('contain.text', '/questionnaire-use-package.json')
          .should('contain.text', packageURL);
    });


    it('should load a Questionnaire with a resource package that contains no .index.json', () => {
      const urlQ = 'urlQuestionnaire',
          urlP =  'urlPackage',
          firstItem =  '/q1/1',
          secondItem =  '/q2/1',
          thirdItem =  '/q3/1',
          btn = 'qv-btn-load',
          notes = 'qv-form-notes';

      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + '/questionnaire-use-package.json');
      cy.byId(urlP)
          .clear()
          .type(Cypress.config().baseUrl + '/package-no-index.json.tgz');
      cy.byId(btn)
          .click();

      cy.byId(firstItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(firstItem)
          .should('have.value', 'Cholesterol [Moles/volume] in Serum or Plasma');

      cy.byId(secondItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .type('{downArrow}')
          .blur();
      cy.byId(secondItem)
          .should('have.value', 'Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma');

      cy.byId(notes)
          .should('contain.text', '/questionnaire-use-package.json')
          .should('contain.text', '/package-no-index.json.tgz');
    });
  });

  describe('URLs provided as url parameters', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // Returning false here prevents Cypress from
      // failing the test from console errors of the app.
      return false;
    });

    it('should support finding a Questionnaire in the package', ()=>{
      const appBase = Cypress.config().baseUrl;
      const testDataBase = appBase;
      // A test of the qCanonical parameter without the version.  Another test
      // will try with the version.
      const url = appBase + '/?lfv=latest&qCanonical=example-questionnaire' +
        '&p=' + appBase + '/package-with-q.json.tgz';
      cy.visit(url);
      const questionID = '1/1';
      cy.byId(questionID)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(questionID)
          .should('have.value', 'Blue'); // ValueSet is also from the package
    });

    xit('should support specifying the package by its ID and a version', ()=>{
      // I disabled this test because I could not get Cypress to mock the fetch
      // of the package file.
      // Use the SDC IG package, but mock it to return package-with-q.json.tgz
      const pID = 'hl7.fhir.uv.sdc.r4';
      const pVersion = '3.0.0';
      //cy.mockApiResponse('https://packages2.fhir.org/web/hl7.fhir.uv.sdc.r4-3.0.0.tgz',
      cy.mockApiResponse(getPackageURL(pID, pVersion),
        'package-with-q.json.tgz', 'packageURL');

      const appBase = Cypress.config().baseUrl;
      const testDataBase = appBase;
      // A test of the qCanonical parameter without the version.  Another test
      // will try with the version.
      const url = appBase + '/?lfv=latest&qCanonical=example-questionnaire' +
        '&pID='+pID+'&pVersion='+pVersion;

      cy.visit(url);

      // Make sure the Questionnaire is present, indicating that the package was
      // found (because the Questionnaire was in it).
      const questionID = '1/1';
      cy.byId(questionID).should('exist');
    });


    it('should support finding the right version of a Questionnaire in the package', ()=>{
      const appBase = Cypress.config().baseUrl;
      const testDataBase = appBase;
      // Test version v1 of the example-questionnaire
      const url = appBase + '/?lfv=latest&qCanonical=example-questionnaire%7Cv1' +
        '&p=' + appBase + '/package-with-q-2versions.json.tgz';
      cy.visit(url);
      const questionID = '1/1';
      cy.byId(questionID)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(questionID)
          .should('have.value', 'Blue'); // ValueSet is also from the package

      // Test version v2 of the example-questionnaire.  It is the same except
      // for a different linkId.
      const url2 = appBase + '/?lfv=latest&qCanonical=example-questionnaire%7Cv2' +
        '&p=' + appBase + '/package-with-q-2versions.json.tgz';
      cy.visit(url2);
      const questionID2 = '2/1';
      cy.byId(questionID2)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(questionID2)
          .should('have.value', 'Blue'); // ValueSet is also from the package

    });



    it('should load a Questionnaire without resource package', () => {
      const notes = 'qv-form-notes';
      const url = Cypress.config().baseUrl + '/?q=' + Cypress.config().baseUrl + '/questionnaire-use-package.json';
      cy.visit(url);

      const firstItem =  '/q1/1',
          inputPanel = 'qv-form-input';

      cy.byId(firstItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(firstItem)
          .should('have.value', '');

      // input panel is not shown
      cy.byId(inputPanel)
          .should('not.be.visible');

      cy.byId(notes)
          .should('contain.text', '/questionnaire-use-package.json');
    });

    it('should load both R4 and STU3 versions of Questionnaire', () => {
      const dropdown =  '/8352-7/1',
          notes = 'qv-form-notes';

      let url = Cypress.config().baseUrl + '/?q=' + Cypress.config().baseUrl + '/weightHeightQuestionnaire_r4.json';
      cy.visit(url);

      // r4
      cy.byId(dropdown)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(dropdown)
          .should('have.value', 'Underwear or less');
      cy.byId(notes)
          .should('contain.text', '/weightHeightQuestionnaire_r4.json');

      // stu3
      url = Cypress.config().baseUrl + '/?q=' + Cypress.config().baseUrl + '/weightHeightQuestionnaire_stu3.json';
      cy.visit(url);
      cy.byId(dropdown)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(dropdown)
          .should('have.value', 'Underwear or less');
      cy.byId(notes)
          .should('contain.text', '/weightHeightQuestionnaire_stu3.json');
    });

    it('should load a Questionnaire with a resource package', () => {
      const baseUrl = Cypress.config().baseUrl;
      const url = baseUrl + '/?q=' + baseUrl + '/questionnaire-use-package.json' + '&p=' + baseUrl + '/package.json.tgz';
      cy.visit(url);

      const firstItem =  '/q1/1',
          secondItem =  '/q2/1',
          thirdItem =  '/q3/1',
          inputPanel = 'qv-form-input',
          notes = 'qv-form-notes';

      cy.byId(firstItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(firstItem)
          .should('have.value', 'Cholesterol [Moles/volume] in Serum or Plasma');

      cy.byId(secondItem)
          .click()
          .type('{downArrow}')
          .type('{downArrow}')
          .blur();
      cy.byId(secondItem)
          .should('have.value', 'Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma');

      // input panel is not shown
      cy.byId(inputPanel)
          .should('not.be.visible');

      cy.byId(notes)
          .should('contain.text', '/questionnaire-use-package.json')
          .should('contain.text', '/package.json.tgz');
    });

    it('should load a Questionnaire with a resource package that contains no .index.json', () => {
      const baseUrl = Cypress.config().baseUrl;
      const url = baseUrl + '/?q=' + baseUrl + '/questionnaire-use-package.json' + '&p=' + baseUrl + '/package-no-index.json.tgz';
      cy.visit(url);

      const firstItem =  '/q1/1',
          secondItem =  '/q2/1',
          thirdItem =  '/q3/1',
          inputPanel = 'qv-form-input',
          notes = 'qv-form-notes';

      cy.byId(firstItem)
          .should('be.visible')
          .click()
          .type('{downArrow}')
          .blur();
      cy.byId(firstItem)
          .should('have.value', 'Cholesterol [Moles/volume] in Serum or Plasma');

      cy.byId(secondItem)
          .click()
          .type('{downArrow}')
          .type('{downArrow}')
          .blur();
      cy.byId(secondItem)
          .should('have.value', 'Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma');

      // input panel is not shown
      cy.byId(inputPanel)
          .should('not.be.visible');

      cy.byId(notes)
          .should('contain.text', '/questionnaire-use-package.json')
          .should('contain.text', '/package-no-index.json.tgz');
    });
  });
});

describe('FHIR Questionnaire Viewer', () => {
  describe('Error handling when URLs are provided on page', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    let error = 'qv-error';
    let info = 'qv-form-info';
    let warning = 'qv-form-warning';
    let btnWarning = 'qv-btn-show-warning';

    function loadQuestionnaire(qFileName, pFileName) {
      const urlQ = 'urlQuestionnaire',
          urlP = 'urlPackage',
          firstItem = '/q1/1',
          btn = 'qv-btn-load';

      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + qFileName);
      if (pFileName) {
        cy.byId(urlP)
            .clear()
            .type(Cypress.config().baseUrl + pFileName);
      }
      cy.byId(btn)
          .click();
    }

    it('should show no errors initially', () => {
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('not.be.visible');
    });

    it('should show no errors when a Questionnaire is loaded', () => {
      loadQuestionnaire("questionnaire-use-package.json");
      cy.byId(info)
          .should('contain.text', 'questionnaire-use-package.json');
      cy.byId(error)
          .should('not.be.visible');
    });

    it('should show no errors when a Questionnaire and a package file are loaded', () => {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.tgz");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'The following Questionnaire was loaded from')
          .should('contain.text', 'questionnaire-use-package.json')
          .should('contain.text', 'with resources from')
          .should('contain.text', 'package.json.tgz');
    });

    it('should show related errors when a Questionnaire URL is empty', () => {
      const urlQ = 'urlQuestionnaire';
      const btn = 'qv-btn-load';
      cy.byId(urlQ)
          .clear();
      cy.byId(btn)
          .click();
      cy.byId(error)
          .should('be.visible')
          .should('contain.text', 'Please provide the URL of a FHIR Questionnaire');
    });

    it('should show related errors when a Questionnaire failed to load', () => {
      loadQuestionnaire("invalid_url.json");
      cy.byId(error)
          .should('be.visible')
          .should('contain.text', 'No data returned from')
          .should('contain.text', 'invalid_url.json');
    });

    it('should show related errors when a url for Questionnaire returns a resource that is not a Questionnaire', () => {
      loadQuestionnaire("questionnaire-use-package-invalid-not-questionnaire.json");
      cy.byId(error)
          .should('be.visible')
          .should('contain.text', 'No Questionnaire (JSON) returned from')
          .should('contain.text', 'questionnaire-use-package-invalid-not-questionnaire.json');
    });

    it('should show related errors when a url for Questionnaire returns a resource that cannot be converted or displayed by LHC-Forms', () => {
      loadQuestionnaire("questionnaire-use-package-invalid-cannot-be-imported.json");
      cy.byId(error)
          .should('be.visible')
          // The space between below 2 sentences in the page uses a different character. Breaking into 2 lines of assert.
          .should('contain.text', 'cannot be processed by LHC-Forms.')
          .should('contain.text', 'Please check if the Questionnaire is valid or if it has features that LHC-Forms does not support yet')
          .should('contain.text', 'questionnaire-use-package-invalid-cannot-be-imported.json');
    });

    it('should show related info message when Questionaire is fine, but the package cannot be fetched', () => {
      loadQuestionnaire("questionnaire-use-package.json", "invalid-package-url");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'The following Questionnaire was loaded from')
          .should('contain.text', 'questionnaire-use-package.json')
          .should('contain.text', 'but failed to fetch the package file from')
          .should('contain.text', 'invalid-package-url');
    });

    it('should show related info message when Questionaire is fine, but the package file cannot be read', () => {
      // don't know how to test it yet
    });

    it('should show related info message when Questionaire is fine, but the package file is a corrupted gzip file', () => {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.corrupted_gzip.tgz");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'The following Questionnaire was loaded from')
          .should('contain.text', 'questionnaire-use-package.json')
          .should('contain.text', 'but failed to unzip the package file from')
          .should('contain.text', 'package.json.corrupted_gzip.tgz');
    });

    it('should show related info message when Questionaire is fine, but the package file contains a corrupted tar file', () => {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.corrupted_tar.tgz");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'The following Questionnaire was loaded from')
          .should('contain.text', 'questionnaire-use-package.json')
          .should('contain.text', 'but failed to untar the package file from')
          .should('contain.text', 'package.json.corrupted_tar.tgz');
    });

    it('should show related info message when Questionaire is fine, but the package file cannot be processed', () => {
      // no tests yet
    });

    it('should show warings when a Questionnaire is loaded but answer list are not loaded from urls', () => {
      loadQuestionnaire("questionnaire-use-package.json");
      cy.byId(info)
          .should('contain.text', 'questionnaire-use-package.json');
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(btnWarning)
          .should('be.visible');
      cy.byId(warning)
          .should('not.be.visible');
      cy.byId(btnWarning)
          .should('contain.text', 'Show Warning Messages');
      // show messages
      cy.byId(btnWarning)
          .click()
          .should('contain.text', 'Hide Warning Messages');
      cy.byId(warning)
          .should('be.visible')
          .should('contain.text', 'http://hl7.org/fhir/ValueSet/example-expansion|20150622')
          .should('contain.text', 'http://hl7.org/fhir/ValueSet/example-expansion');

      // hide messages
      cy.byId(btnWarning)
          .click()
          .should('contain.text', 'Show Warning Messages');
      cy.byId(warning)
          .should('not.be.visible');
    });

    it('should not show warings when a Questionnaire is loaded with all answer lists', () => {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.tgz");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(btnWarning)
          .should('not.be.visible');
      cy.byId(warning)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'questionnaire-use-package.json');
    });
  });

  describe('Error handling when URLs are provided as url parameters', () => {
    let error = 'qv-error';
    let info = 'qv-form-info';
    let inputs = 'qv-form-input-settings';
    let warning = 'qv-form-warning';
    let btnWarning = 'qv-btn-show-warning';

    function loadQuestionnaire(qFileName, pFileName) {
      const baseUrl = Cypress.config().baseUrl;
      let url = baseUrl + '/?q=' + baseUrl + '/' + qFileName;
      if (pFileName) {
        url += '&p=' + baseUrl + '/' + pFileName;
      }
      cy.visit(url);
    }

    it('should show no errors and no inputs when a Questionnaire is loaded', () => {
      loadQuestionnaire("questionnaire-use-package.json");
      cy.byId(info)
          .should('contain.text', 'questionnaire-use-package.json');
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(inputs)
          .should('not.be.visible');
    });

    it('should show no errors when a Questionnaire and a package file are loaded', () => {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.tgz");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'The following Questionnaire was loaded from')
          .should('contain.text', 'questionnaire-use-package.json')
          .should('contain.text', 'with resources from')
          .should('contain.text', 'package.json.tgz');
      cy.byId(inputs)
          .should('not.be.visible');
    });

    it('should show related errors when a Questionnaire failed to load', () => {
      loadQuestionnaire("invalid_url.json");
      cy.byId(error)
          .should('be.visible')
          .should('contain.text', 'No data returned from')
          .should('contain.text', 'invalid_url.json');
      cy.byId(inputs)
          .should('not.be.visible');
    });

    it('should show related errors when a url for Questionnaire returns a resource that is not a Questionnaire', () => {
      loadQuestionnaire("questionnaire-use-package-invalid-not-questionnaire.json");
      cy.byId(error)
          .should('be.visible')
          .should('contain.text', 'No Questionnaire (JSON) returned from')
          .should('contain.text', 'questionnaire-use-package-invalid-not-questionnaire.json');
      cy.byId(inputs)
          .should('not.be.visible');
    });

    it('should show related errors when a url for Questionnaire returns a resource that cannot be converted or displayed by LHC-Forms', () => {
      loadQuestionnaire("questionnaire-use-package-invalid-cannot-be-imported.json");
      cy.byId(error)
          .should('be.visible')
          // The space between below 2 sentences in the page uses a different character. Breaking into 2 lines of assert.
          .should('contain.text', 'cannot be processed by LHC-Forms.')
          .should('contain.text', 'Please check if the Questionnaire is valid or if it has features that LHC-Forms does not support yet')
          .should('contain.text', 'questionnaire-use-package-invalid-cannot-be-imported.json');
      cy.byId(inputs)
          .should('not.be.visible');
    });

    it('should show related info message when Questionaire is fine, but the package cannot be fetched', () => {
      loadQuestionnaire("questionnaire-use-package.json", "invalid-package-url");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'The following Questionnaire was loaded from')
          .should('contain.text', 'questionnaire-use-package.json')
          .should('contain.text', 'but failed to fetch the package file from')
          .should('contain.text', 'invalid-package-url');
      cy.byId(inputs)
          .should('not.be.visible');
    });

    it('should show related info message when Questionaire is fine, but the package file cannot be read', () => {
      // don't know how to test it yet
    });

    it('should show related info message when Questionaire is fine, but the package file is a corrupted gzip file', () => {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.corrupted_gzip.tgz");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'The following Questionnaire was loaded from')
          .should('contain.text', 'questionnaire-use-package.json')
          .should('contain.text', 'but failed to unzip the package file from')
          .should('contain.text', 'package.json.corrupted_gzip.tgz');
      cy.byId(inputs)
          .should('not.be.visible');
    });

    it('should show related info message when Questionaire is fine, but the package file contains a corrupted tar file', () => {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.corrupted_tar.tgz");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'The following Questionnaire was loaded from')
          .should('contain.text', 'questionnaire-use-package.json')
          .should('contain.text', 'but failed to untar the package file from')
          .should('contain.text', 'package.json.corrupted_tar.tgz');
      cy.byId(inputs)
          .should('not.be.visible');
    });

    it('should show related info message when Questionaire is fine, but the package file cannot be processed', () => {
      // no tests yet
    });

    it('should show warings when a R4 Questionnaire is loaded but answer list are not loaded from urls', () => {
      loadQuestionnaire("questionnaire-use-package.json");
      cy.byId(info)
          .should('contain.text', 'questionnaire-use-package.json');
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(btnWarning)
          .should('be.visible');
      cy.byId(warning)
          .should('not.be.visible');
      cy.byId(btnWarning)
          .should('contain.text', 'Show Warning Messages');
      // show messages
      cy.byId(btnWarning)
          .click()
          .should('contain.text', 'Hide Warning Messages');
      cy.byId(warning)
          .should('be.visible')
          .should('contain.text', 'http://hl7.org/fhir/ValueSet/example-expansion|20150622')
          .should('contain.text', 'http://hl7.org/fhir/ValueSet/example-expansion');

      // hide messages
      cy.byId(btnWarning)
          .click()
          .should('contain.text', 'Show Warning Messages');
      cy.byId(warning)
          .should('not.be.visible');
    });

    it('should show warings when a STU3 Questionnaire is loaded but answer list are not loaded from urls', () => {
      loadQuestionnaire("4712701.json");
      cy.byId(info)
          .should('contain.text', '4712701.json');
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(btnWarning)
          .should('be.visible');
      cy.byId(warning)
          .should('not.be.visible');
      cy.byId(btnWarning)
          .should('contain.text', 'Show Warning Messages');
      // show messages
      cy.byId(btnWarning)
          .click()
          .should('contain.text', 'Hide Warning Messages');
      cy.byId(warning)
          .should('be.visible')
          .should('contain.text', 'http://hl7.org/fhir/ValueSet/v3-ActEncounterCode') // 1st message
          .should('contain.text', 'http://uni-koeln.de/fhir/ValueSet/ecog')   // 2nd message
          .should('contain.text', 'http://uni-koeln.de/fhir/ValueSet/icd-o-3-m-lunge')    // 3rd message
          .should('contain.text', 'http://uni-koeln.de/fhir/ValueSet/uicc-lunge');    // 11th message

      // hide messages
      cy.byId(btnWarning)
          .click()
          .should('contain.text', 'Show Warning Messages');
      cy.byId(warning)
          .should('not.be.visible');
    });

    it('should not show warings when a Questionnaire is loaded with all answer lists', () => {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.tgz");
      cy.byId(error)
          .should('not.be.visible');
      cy.byId(btnWarning)
          .should('not.be.visible');
      cy.byId(warning)
          .should('not.be.visible');
      cy.byId(info)
          .should('contain.text', 'questionnaire-use-package.json');
    });
  });
});

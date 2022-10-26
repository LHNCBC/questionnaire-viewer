const firstStatusListItem = 'Requires revalidation'; // for some reason this changed

/**
 * Wait for the Prefetch autocomplete filtered results to update,
 * so the first result contains text typed in the autocomplete.
 * @param text text typed in the autocomplete
 */
function waitForFirstResultToContain(text) {
  cy.get('#searchResults li:first-child, #searchResults tr:first-child')
      .should('contain.text', text);
}

describe('FHIR Questionnaire Viewer with a specified FHIR server: ', () => {
  describe('URLs provided on page', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should load a Questionnaire without a FHIR server', () => {
      const urlQ = 'urlQuestionnaire',
          urlS =  'urlFhirServer',
          radioFhirServer = 'radioFhirServer',
          firstItem =  'listSelection/1',
          secondItem =  'listViewFromURL/1',
          thirdItem =  'listViewFromContext/1',
          btn = 'qv-btn-load',
          notes = 'qv-form-notes';

      cy.byId(radioFhirServer)
          .click();
      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + '/x-fhir-query-test.R4.json');
      cy.byId(btn)
          .click();

      // 1st run
      cy.byId(firstItem)
          .should('be.visible')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(firstItem)
          .should('have.value', 'verificationresult-status');
      cy.byId(secondItem)
          .click();
      // Wait for the autocomplete results to settle down before typing "Requires".
      // Otherwise, there were intermittent failures where the autocomplete ends up
      // with the full list displayed AFTER "Requires" is typed in the field.
      waitForFirstResultToContain('Attested');
      cy.byId(secondItem)
          .type('Requires');
      waitForFirstResultToContain('Requires');
      cy.byId(secondItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(secondItem)
          .should('have.value', firstStatusListItem);
      cy.byId(thirdItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(thirdItem)
          .should('have.value', '');

      // 2nd run
      cy.byId(firstItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(firstItem)
          .should('have.value', 'language-preference-type');
      cy.byId(secondItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(secondItem)
          .should('have.value', 'verbal');
      cy.byId(thirdItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(thirdItem)
          .should('have.value', '');

      cy.byId(notes)
          .should('contain.text', '/x-fhir-query-test.R4.json');
    });

    it('should load a Questionnaire with a FHIR server', () => {
      const urlQ = 'urlQuestionnaire',
          urlS =  'urlFhirServer',
          radioFhirServer = 'radioFhirServer',
          firstItem =  'listSelection/1',
          secondItem =  'listViewFromURL/1',
          thirdItem =  'listViewFromContext/1',
          btn = 'qv-btn-load',
          notes = 'qv-form-notes';

      cy.byId(radioFhirServer)
          .click();
      cy.byId(urlQ)
          .clear()
          .type(Cypress.config().baseUrl + '/x-fhir-query-test.R4.json');
      cy.byId(urlS)
          .clear()
          .type('https://lforms-fhir.nlm.nih.gov/baseR4');
      cy.byId(btn)
          .click();

      // 1st run
      cy.byId(firstItem)
          .should('be.visible')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(firstItem)
          .should('have.value', 'verificationresult-status');
      cy.byId(secondItem)
          .click();
      waitForFirstResultToContain('Attested');
      cy.byId(secondItem)
          .type('Requires');
      waitForFirstResultToContain('Requires');
      cy.byId(secondItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(secondItem)
          .should('have.value', firstStatusListItem);
      cy.byId(thirdItem)
          .click();
      waitForFirstResultToContain('Attested');
      cy.byId(thirdItem)
          .type('Requires');
      waitForFirstResultToContain('Requires');
      cy.byId(thirdItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(thirdItem)
          .should('have.value', firstStatusListItem);

      // 2nd run
      cy.byId(firstItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(firstItem)
          .should('have.value', 'language-preference-type');
      cy.byId(secondItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(secondItem)
          .should('have.value', 'verbal');
      cy.byId(thirdItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(thirdItem)
          .should('have.value', 'verbal');

      cy.byId(notes)
          .should('contain.text', '/x-fhir-query-test.R4.json')
          .should('contain.text', 'https://lforms-fhir.nlm.nih.gov/baseR4');
    });
  });

  describe('URLs provided as url parameters', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // Returning false here prevents Cypress from
      // failing the test from console errors of the app.
      return false;
    });

    it('should load a Questionnaire without a FHIR server', () => {
      const url = Cypress.config().baseUrl + '/?q=' + Cypress.config().baseUrl + '/x-fhir-query-test.R4.json';
      cy.visit(url);

      const firstItem =  'listSelection/1',
          secondItem =  'listViewFromURL/1',
          thirdItem =  'listViewFromContext/1',
          notes = 'qv-form-notes',
          inputPanel = 'qv-form-input';

      // 1st run
      cy.byId(firstItem)
          .should('be.visible')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(firstItem)
          .should('have.value', 'verificationresult-status');
      cy.byId(secondItem)
          .click();
      waitForFirstResultToContain('Attested');
      cy.byId(secondItem)
          .type('Requires');
      waitForFirstResultToContain('Requires');
      cy.byId(secondItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(secondItem)
          .should('have.value', firstStatusListItem);
      cy.byId(thirdItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(thirdItem)
          .should('have.value', '');

      // 2nd run
      cy.byId(firstItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(firstItem)
          .should('have.value', 'language-preference-type');
      cy.byId(secondItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(secondItem)
          .should('have.value', 'verbal');
      cy.byId(thirdItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(thirdItem)
          .should('have.value', '');

      cy.byId(notes)
          .should('contain.text', '/x-fhir-query-test.R4.json');

      // input panel is not shown
      cy.byId(inputPanel)
          .should('not.be.visible');
    });

    it('should load a Questionnaire with a FHIR server', () => {
      const url = Cypress.config().baseUrl + '/?q=' + Cypress.config().baseUrl + '/x-fhir-query-test.R4.json' + '&s=https://lforms-fhir.nlm.nih.gov/baseR4';
      cy.visit(url);

      const firstItem =  'listSelection/1',
          secondItem =  'listViewFromURL/1',
          thirdItem =  'listViewFromContext/1',
          inputPanel = 'qv-form-input',
          notes = 'qv-form-notes';

      // 1st run
      cy.byId(firstItem)
          .should('be.visible')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(firstItem)
          .should('have.value', 'verificationresult-status');
      cy.byId(secondItem)
          .click();
      waitForFirstResultToContain('Attested');
      cy.byId(secondItem)
          .type('Requires');
      waitForFirstResultToContain('Requires');
      cy.byId(secondItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(secondItem)
          .should('have.value', firstStatusListItem);
      cy.byId(thirdItem)
          .click();
      waitForFirstResultToContain('Attested');
      cy.byId(thirdItem)
          .type('Requires');
      waitForFirstResultToContain('Requires');
      cy.byId(thirdItem)
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(thirdItem)
          .should('have.value', firstStatusListItem);

      // 2nd run
      cy.byId(firstItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(firstItem)
          .should('have.value', 'language-preference-type');
      cy.byId(secondItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(secondItem)
          .should('have.value', 'verbal');
      cy.byId(thirdItem)
          .type('{downArrow}')
          .type('{downArrow}')
          .type('{enter}');
      cy.byId(thirdItem)
          .should('have.value', 'verbal');

      cy.byId(notes)
          .should('contain.text', '/x-fhir-query-test.R4.json')
          .should('contain.text', 'https://lforms-fhir.nlm.nih.gov/baseR4');

      // input panel is not shown
      cy.byId(inputPanel)
          .should('not.be.visible');
    });
  });
});

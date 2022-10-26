describe('FHIR Questionnaire Viewer', () => {
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

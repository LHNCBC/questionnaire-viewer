'use strict';

const { $, browser } = require("protractor");

const os = require("os"),
  EC = protractor.ExpectedConditions;

const firstStatusListItem = 'Requires revalidation'; // for some reason this changed

describe('FHIR Questionnaire Viewer with a specified FHIR server: ', function() {

  describe('URLs provided on page', function() {
    beforeAll(function () {
      setAngularSite(false);
    });

    beforeEach(function () {
      browser.get('/');
    });

    it('should load a Questionnaire without a FHIR server', function () {
      let urlQ = element(by.id('urlQuestionnaire')),
      urlS =  element(by.id('urlFhirServer')),
      radioFhirServer = element(by.id('radioFhirServer')),
      firstItem =  element(by.id('listSelection/1')),
      secondItem =  element(by.id('listViewFromURL/1')),
      thirdItem =  element(by.id('listViewFromContext/1')),
      btn = element(by.id('qv-btn-load')),
      notes = element(by.id('qv-form-notes'));

      radioFhirServer.click();
      urlQ.clear();
      urlQ.sendKeys(browser.baseUrl + '/x-fhir-query-test.R4.json');
      btn.click();

      browser.wait(EC.visibilityOf(firstItem));

      // 1st run
      firstItem.click();
      // expect(firstItem.searchResults.isPresent()).toBeFalsy();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('verificationresult-status');
      secondItem.click();
      secondItem.sendKeys("Requires")
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe(firstStatusListItem);
      thirdItem.click();
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe('');

      // 2nd run
      firstItem.click();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('language-preference-type');
      secondItem.click();
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe('verbal');
      thirdItem.click();
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe('');


      expect(notes.getText()).toContain('/x-fhir-query-test.R4.json');

    });



    it('should load a Questionnaire with a FHIR server', function () {
      let urlQ = element(by.id('urlQuestionnaire')),
      urlS =  element(by.id('urlFhirServer')),
      radioFhirServer = element(by.id('radioFhirServer')),
      firstItem =  element(by.id('listSelection/1')),
      secondItem =  element(by.id('listViewFromURL/1')),
      thirdItem =  element(by.id('listViewFromContext/1')),

      btn = element(by.id('qv-btn-load')),
      notes = element(by.id('qv-form-notes'));

      radioFhirServer.click();
      urlQ.clear();
      urlQ.sendKeys(browser.baseUrl + '/x-fhir-query-test.R4.json');
      urlS.clear();
      urlS.sendKeys('https://lforms-fhir.nlm.nih.gov/baseR4');
      btn.click();

//      browser.sleep(1000000)
      browser.wait(EC.visibilityOf(firstItem));
      // 1st run
      firstItem.click();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('verificationresult-status');
      secondItem.click();
      secondItem.sendKeys("Requires")
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe(firstStatusListItem);
      thirdItem.click();
      thirdItem.sendKeys("Requires")
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe(firstStatusListItem);

      // 2nd run
      firstItem.click();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('language-preference-type');
      secondItem.click();
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe('verbal');
      thirdItem.click();
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe('verbal');

      expect(notes.getText()).toContain('/x-fhir-query-test.R4.json');
      expect(notes.getText()).toContain('https://lforms-fhir.nlm.nih.gov/baseR4');
    });

  });

  describe('URLs provided as url parameters', function() {
    beforeAll(function () {
      setAngularSite(false);
    });

    beforeEach(function () {
      browser.get('/');
    });

    it('should load a Questionnaire without a FHIR server', function () {

      let url = browser.baseUrl + '/?q=' + browser.baseUrl + '/x-fhir-query-test.R4.json';
      console.log(url);
      browser.get(url);

      let firstItem =  element(by.id('listSelection/1')),
      secondItem =  element(by.id('listViewFromURL/1')),
      thirdItem =  element(by.id('listViewFromContext/1')),
      notes = element(by.id('qv-form-notes')),
      inputPanel = element(by.id('qv-form-input'));


      browser.wait(EC.visibilityOf(firstItem));

      // 1st run
      firstItem.click();
      // expect(firstItem.searchResults.isPresent()).toBeFalsy();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('verificationresult-status');
      secondItem.click();
      secondItem.sendKeys("Requires")
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe(firstStatusListItem);
      thirdItem.click();
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe('');

      // 2nd run
      firstItem.click();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('language-preference-type');
      secondItem.click();
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe('verbal');
      thirdItem.click();
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe('');


      expect(notes.getText()).toContain('/x-fhir-query-test.R4.json');

      // input panel is not shown
      expect(inputPanel.isDisplayed()).toBeFalsy();
    });



    it('should load a Questionnaire with a FHIR server', function () {
      let url = browser.baseUrl + '/?q=' + browser.baseUrl + '/x-fhir-query-test.R4.json' + '&s=https://lforms-fhir.nlm.nih.gov/baseR4';
      console.log(url);
      browser.get(url);

      let firstItem =  element(by.id('listSelection/1')),
      secondItem =  element(by.id('listViewFromURL/1')),
      thirdItem =  element(by.id('listViewFromContext/1')),
      inputPanel = element(by.id('qv-form-input')),
      notes = element(by.id('qv-form-notes'));

      browser.wait(EC.visibilityOf(firstItem));
      // 1st run
      firstItem.click();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('verificationresult-status');
      secondItem.click();
      secondItem.sendKeys("Requires")
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe(firstStatusListItem);
      thirdItem.click();
      thirdItem.sendKeys("Requires")
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe(firstStatusListItem);

      // 2nd run
      firstItem.click();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('language-preference-type');
      secondItem.click();
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe('verbal');
      thirdItem.click();
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe('verbal');

      expect(notes.getText()).toContain('/x-fhir-query-test.R4.json');
      expect(notes.getText()).toContain('https://lforms-fhir.nlm.nih.gov/baseR4');

      // input panel is not shown
      expect(inputPanel.isDisplayed()).toBeFalsy();
    });

  });



});


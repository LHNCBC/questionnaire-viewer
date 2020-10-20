'use strict';

const { $, browser } = require("protractor");

const os = require("os"),
  EC = protractor.ExpectedConditions;

describe('FHIR Questionnaire Viewer', function() {

  describe('Error handling when URLs are provided on page', function() {
    beforeAll(function () {
      setAngularSite(false);
    });
  
    beforeEach(function () {
      browser.get('/');

    });

    let error = element(by.id('qv-error'));
    let info = element(by.id('qv-form-info'));
    let warning = element(by.id('qv-form-warning'));
    let btnWarning = element(by.id('qv-btn-show-warning'));

    function loadQuestionnaire(qFileName, pFileName) {
      let urlQ = element(by.id('urlQuestionnaire')),
      urlP =  element(by.id('urlPackage')),
      firstItem =  element(by.id('/q1/1')),
      btn = element(by.id('qv-btn-load'));
  
      urlQ.clear();
      urlQ.sendKeys(browser.baseUrl + '/' + qFileName);

      if (pFileName) {
        urlP.clear();
        urlP.sendKeys(browser.baseUrl + '/' + pFileName)
      }
      btn.click();

    }
    
    it('should show no errors initially', function () {      
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.isDisplayed()).toBeFalsy();
    });

    it('should show no errors when a Questionnaire is loaded', function () {
      loadQuestionnaire("questionnaire-use-package.json")
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(error.isDisplayed()).toBeFalsy();
      
    });

    it('should show no errors when a Questionnaire and a package file are loaded', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("with resources from");
      expect(info.getText()).toContain("package.json.tgz");

    });


    it('should show related errors when a Questionnaire URL is empty', function () {
      let urlQ = element(by.id('urlQuestionnaire')),
      btn = element(by.id('qv-btn-load'));
      urlQ.clear();
      btn.click();
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("Please provide the URL of a FHIR Questionnaire")

    });

    it('should show related errors when a Questionnaire failed to load', function () {
      loadQuestionnaire("invalid_url.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("No data returned from")
      expect(error.getText()).toContain("invalid_url.json")

    });

    it('should show related errors when a url for Questionnaire returns a resource that is not a Questionnaire', function () {
      loadQuestionnaire("questionnaire-use-package-invalid-not-questionnaire.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("No Questionnaire (JSON) returned from")
      expect(error.getText()).toContain("questionnaire-use-package-invalid-not-questionnaire.json")

    });

    it('should show related errors when a url for Questionnaire returns a resource that cannot be converted or displayed by LHC-Forms', function () {
      loadQuestionnaire("questionnaire-use-package-invalid-cannot-be-imported.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("cannot be prcoessed by LHC-Forms, please check if the Questionnaire is valid or if it has features that LHC-Forms does not support yet")
      expect(error.getText()).toContain("questionnaire-use-package-invalid-cannot-be-imported.json")

    });

    it('should show related info message when Questionaire is fine, but the package cannot be fetched', function () {
      loadQuestionnaire("questionnaire-use-package.json", "invalid-package-url")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to fetch the package file from");
      expect(info.getText()).toContain("invalid-package-url");


    });

    it('should show related info message when Questionaire is fine, but the package file cannot be read', function () {
      // don't know how to test it yet
    });

    it('should show related info message when Questionaire is fine, but the package file is a corrupted gzip file', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.corrupted_gzip.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to unzip the package file from");
      expect(info.getText()).toContain("package.json.corrupted_gzip.tgz");

    });

    it('should show related info message when Questionaire is fine, but the package file contains a corrupted tar file', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.corrupted_tar.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to untar the package file from");
      expect(info.getText()).toContain("package.json.corrupted_tar.tgz");

    });

    it('should show related info message when Questionaire is fine, but the package file cannot be processed', function () {
      // no tests yet
    });

    it('should show warings when a Questionnaire is loaded but answer list are not loaded from urls', function () {
      loadQuestionnaire("questionnaire-use-package.json")
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(error.isDisplayed()).toBeFalsy();
      expect(btnWarning.isDisplayed()).toBe(true);
      expect(warning.isDisplayed()).toBeFalsy();
      expect(btnWarning.getText()).toContain("Show Warning Messages");
      // show messages
      btnWarning.click();
      expect(btnWarning.getText()).toContain("Hide Warning Messages");
      expect(warning.isDisplayed()).toBe(true);
      expect(warning.getText()).toContain("http://hl7.org/fhir/ValueSet/example-expansion|20150622");
      expect(warning.getText()).toContain("http://hl7.org/fhir/ValueSet/example-expansion");

      // hide messages
      btnWarning.click();
      expect(btnWarning.getText()).toContain("Show Warning Messages");
      expect(warning.isDisplayed()).toBeFalsy();
    });

    it('should not show warings when a Questionnaire is loaded with all answer lists', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(btnWarning.isDisplayed()).toBeFalsy();
      expect(warning.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("questionnaire-use-package.json")
      
    });
  });

  describe('Error handling when URLs are provided as url parameters', function() {
    beforeAll(function () {
      setAngularSite(false);
    });
  
    beforeEach(function () {
      browser.get('/');

    });

    let error = element(by.id('qv-error'));
    let info = element(by.id('qv-form-info'));
    let inputs = element(by.id('qv-form-input-settings'));
    let warning = element(by.id('qv-form-warning'));
    let btnWarning = element(by.id('qv-btn-show-warning'));

    function loadQuestionnaire(qFileName, pFileName) {

    
      let url = browser.baseUrl + '/?q=' + browser.baseUrl + '/' + qFileName;
      if (pFileName) {
        url += '&p=' + browser.baseUrl + '/' + pFileName;
      }
      browser.get(url);

    }


    it('should show no errors and no inputs when a Questionnaire is loaded', function () {
      loadQuestionnaire("questionnaire-use-package.json")
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(error.isDisplayed()).toBeFalsy();
      expect(inputs.isDisplayed()).toBeFalsy();
      
    });

    it('should show no errors when a Questionnaire and a package file are loaded', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("with resources from");
      expect(info.getText()).toContain("package.json.tgz");
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related errors when a Questionnaire failed to load', function () {
      loadQuestionnaire("invalid_url.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("No data returned from")
      expect(error.getText()).toContain("invalid_url.json")
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related errors when a url for Questionnaire returns a resource that is not a Questionnaire', function () {
      loadQuestionnaire("questionnaire-use-package-invalid-not-questionnaire.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("No Questionnaire (JSON) returned from")
      expect(error.getText()).toContain("questionnaire-use-package-invalid-not-questionnaire.json")
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related errors when a url for Questionnaire returns a resource that cannot be converted or displayed by LHC-Forms', function () {
      loadQuestionnaire("questionnaire-use-package-invalid-cannot-be-imported.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("cannot be prcoessed by LHC-Forms, please check if the Questionnaire is valid or if it has features that LHC-Forms does not support yet")
      expect(error.getText()).toContain("questionnaire-use-package-invalid-cannot-be-imported.json")
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related info message when Questionaire is fine, but the package cannot be fetched', function () {
      loadQuestionnaire("questionnaire-use-package.json", "invalid-package-url")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to fetch the package file from");
      expect(info.getText()).toContain("invalid-package-url");
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related info message when Questionaire is fine, but the package file cannot be read', function () {
      // don't know how to test it yet
    });

    it('should show related info message when Questionaire is fine, but the package file is a corrupted gzip file', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.corrupted_gzip.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to unzip the package file from");
      expect(info.getText()).toContain("package.json.corrupted_gzip.tgz");
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related info message when Questionaire is fine, but the package file contains a corrupted tar file', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.corrupted_tar.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to untar the package file from");
      expect(info.getText()).toContain("package.json.corrupted_tar.tgz");
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related info message when Questionaire is fine, but the package file cannot be processed', function () {
      // no tests yet
    });

    it('should show warings when a R4 Questionnaire is loaded but answer list are not loaded from urls', function () {
      loadQuestionnaire("questionnaire-use-package.json")
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(error.isDisplayed()).toBeFalsy();
      expect(btnWarning.isDisplayed()).toBe(true);
      expect(warning.isDisplayed()).toBeFalsy();
      expect(btnWarning.getText()).toContain("Show Warning Messages");
      // show messages
      btnWarning.click();
      expect(btnWarning.getText()).toContain("Hide Warning Messages");
      expect(warning.isDisplayed()).toBe(true);
      expect(warning.getText()).toContain("http://hl7.org/fhir/ValueSet/example-expansion|20150622");
      expect(warning.getText()).toContain("http://hl7.org/fhir/ValueSet/example-expansion");

      // hide messages
      btnWarning.click();
      expect(btnWarning.getText()).toContain("Show Warning Messages");
      expect(warning.isDisplayed()).toBeFalsy();
    });

    it('should show warings when a STU3 Questionnaire is loaded but answer list are not loaded from urls', function () {
      loadQuestionnaire("4712701.json")
      expect(info.getText()).toContain("4712701.json")
      expect(error.isDisplayed()).toBeFalsy();
      expect(btnWarning.isDisplayed()).toBe(true);
      expect(warning.isDisplayed()).toBeFalsy();
      expect(btnWarning.getText()).toContain("Show Warning Messages");
      // show messages
      btnWarning.click();
      expect(btnWarning.getText()).toContain("Hide Warning Messages");
      expect(warning.isDisplayed()).toBe(true);
      expect(warning.getText()).toContain("http://hl7.org/fhir/ValueSet/v3-ActEncounterCode"); // 1st message
      expect(warning.getText()).toContain("http://uni-koeln.de/fhir/ValueSet/ecog"); // 2nd message
      expect(warning.getText()).toContain("http://uni-koeln.de/fhir/ValueSet/icd-o-3-m-lunge"); // 3rd message
      expect(warning.getText()).toContain("http://uni-koeln.de/fhir/ValueSet/uicc-lunge"); // 11th message

      // hide messages
      btnWarning.click();
      expect(btnWarning.getText()).toContain("Show Warning Messages");
      expect(warning.isDisplayed()).toBeFalsy();
    });

    it('should not show warings when a Questionnaire is loaded with all answer lists', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(error.isDisplayed()).toBeFalsy();
      expect(btnWarning.isDisplayed()).toBeFalsy();
      expect(warning.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("questionnaire-use-package.json")      
    });

  });
  
});


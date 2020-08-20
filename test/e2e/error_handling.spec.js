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
    let info = element(by.id('qv-form-notes'));

    function loadQuestionnaire(qFileName, pFileName) {
      let urlQ = element(by.id('urlQuestionnaire')),
      urlP =  element(by.id('urlPackage')),
      firstItem =  element(by.id('/q1/1')),
      btn = element(by.id('qv-btn-load')),
      notes = element(by.id('qv-form-notes'));
  
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

    it('should show related errors when a Questionnaire failed to load', function () {
      loadQuestionnaire("invalid_url.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("Failed to load the Questionnaire from")
      expect(error.getText()).toContain("invalid_url.json")

    });

    it('should show related errors when a url for Questionnaire returns a resource that is not a Questionnaire', function () {
      loadQuestionnaire("questionnaire-use-package-invalid-not-questionnaire.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("Failed to load the Questionnaire from")
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

    it('should show related info message when Questionaire is fine, but the package file is a currupted gzip file', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.currupted_gzip.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to unzip the package file from");
      expect(info.getText()).toContain("package.json.currupted_gzip.tgz");

    });

    it('should show related info message when Questionaire is fine, but the package file contains a currupted tar file', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.currupted_tar.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to untar the package file from");
      expect(info.getText()).toContain("package.json.currupted_tar.tgz");

    });

    it('should show related info message when Questionaire is fine, but the package file cannot be processed', function () {
      // no tests yet
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
    let info = element(by.id('qv-form-notes'));
    let inputs = element(by.id('qv-form-input-settings'));

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
      expect(error.getText()).toContain("Failed to load the Questionnaire from")
      expect(error.getText()).toContain("invalid_url.json")
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related errors when a url for Questionnaire returns a resource that is not a Questionnaire', function () {
      loadQuestionnaire("questionnaire-use-package-invalid-not-questionnaire.json")
      expect(error.isDisplayed()).toBe(true);
      expect(error.getText()).toContain("Failed to load the Questionnaire from")
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

    it('should show related info message when Questionaire is fine, but the package file is a currupted gzip file', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.currupted_gzip.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to unzip the package file from");
      expect(info.getText()).toContain("package.json.currupted_gzip.tgz");
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related info message when Questionaire is fine, but the package file contains a currupted tar file', function () {
      loadQuestionnaire("questionnaire-use-package.json", "package.json.currupted_tar.tgz")
      expect(error.isDisplayed()).toBeFalsy();
      expect(info.getText()).toContain("The following Questionnaire was loaded from");
      expect(info.getText()).toContain("questionnaire-use-package.json")
      expect(info.getText()).toContain("but failed to untar the package file from");
      expect(info.getText()).toContain("package.json.currupted_tar.tgz");
      expect(inputs.isDisplayed()).toBeFalsy();

    });

    it('should show related info message when Questionaire is fine, but the package file cannot be processed', function () {
      // no tests yet
    });



  });
  
});


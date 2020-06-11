'use strict';

const { $, browser } = require("protractor");

const os = require("os"),
  EC = protractor.ExpectedConditions;

describe('FHIR Questionnaire Viewer', function() {

  describe('URLs provided on page', function() {
    beforeAll(function () {
      setAngularSite(false);
    });
  
    beforeEach(function () {
      browser.get('/');
    });
    
    it('should load a Questionnaire without resource pakcage', function () {
      let urlQ = element(by.id('urlQuestionnaire')),
      urlP =  element(by.id('urlPackage')),
      firstItem =  element(by.id('/q1/1')),
      btn = element(by.id('load'));
  
      urlQ.clear();
      urlQ.sendKeys("http://localhost:8080/questionnaire-use-package.json");
      btn.click();
      browser.wait(EC.visibilityOf(firstItem));
      firstItem.click();
      // expect(firstItem.searchResults.isPresent()).toBeFalsy();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('');
  
    });
  
  
    it('should load a Questionnaire with a resource pakcage', function () {
      let urlQ = element(by.id('urlQuestionnaire')),
      urlP =  element(by.id('urlPackage')),
      firstItem =  element(by.id('/q1/1')),
      secondItem =  element(by.id('/q2/1')),
      thirdItem =  element(by.id('/q3/1')),
      btn = element(by.id('load'));
  
      urlQ.clear();
      urlQ.sendKeys("http://localhost:8080/questionnaire-use-package.json");
      urlP.clear();
      urlP.sendKeys("http://localhost:8080/package.json.tgz");
      btn.click();
      browser.wait(EC.visibilityOf(firstItem));
  
      firstItem.click();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe("Cholesterol [Moles/volume] in Serum or Plasma");
  
      secondItem.click();
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe("Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma");
  
      thirdItem.click();
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe("Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma");
  
    });
  
  });

  
  describe('URLs provided as url parameters', function() {
    beforeAll(function () {
      setAngularSite(false);
    });
  
    beforeEach(function () {
      browser.get('/');
    });
  
  
    it('should load a Questionnaire without resource pakcage', function () {
      let url = browser.baseUrl + '/?q=' + browser.baseUrl + '/questionnaire-use-package.json';
      console.log(url);
      browser.get(url);

      let firstItem =  element(by.id('/q1/1')),
      inputPanel = element(by.id('form-input'));
  
      browser.wait(EC.visibilityOf(firstItem));
      firstItem.click();
      // expect(firstItem.searchResults.isPresent()).toBeFalsy();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe('');
  
      // input panel is not shown
      expect(inputPanel.isDisplayed()).toBeFalsy();
    });
  
  
    it('should load a Questionnaire with a resource pakcage', function () {
      let url = browser.baseUrl + '/?q=' + browser.baseUrl + '/questionnaire-use-package.json' + '&p=' + browser.baseUrl + '/package.json.tgz';
      console.log(url);
      browser.get(url);

      let firstItem =  element(by.id('/q1/1')),
      secondItem =  element(by.id('/q2/1')),
      thirdItem =  element(by.id('/q3/1')),
      inputPanel = element(by.id('form-input'));
      
      browser.wait(EC.visibilityOf(firstItem));
  
      firstItem.click();
      firstItem.sendKeys(protractor.Key.ARROW_DOWN);
      firstItem.sendKeys(protractor.Key.TAB);
      expect(firstItem.getAttribute('value')).toBe("Cholesterol [Moles/volume] in Serum or Plasma");
  
      secondItem.click();
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.ARROW_DOWN);
      secondItem.sendKeys(protractor.Key.TAB);
      expect(secondItem.getAttribute('value')).toBe("Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma");
  
      thirdItem.click();
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
      thirdItem.sendKeys(protractor.Key.TAB);
      expect(thirdItem.getAttribute('value')).toBe("Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma");

      // input panel is not shown
      expect(inputPanel.isDisplayed()).toBeFalsy();

    });
  
  });
  
});

describe('URLs provided on page', function() {
  beforeAll(function () {
    setAngularSite(false);
  });

  beforeEach(function () {
    browser.get('/');
  });

  // describe('guessFHIRVersion', function() {
  //   it('should recognize an STU3 Questionnaire with "option"', function(done) {
  //     $.get('/test/data/STU3/weightHeightQuestionnaire.json', function z(whQ) {
  //       // Remove the meta.profile so we can test whether the guess function can
  //       // correctly guess based on structure only.
  //       delete whQ.meta;
  //       var fhirVersion = LForms.Util.guessFHIRVersion(whQ);
  //       assert.equal(fhirVersion, 'STU3');
  //       done();
  //     });
  //   });
  
  //   it('should recognize an R4 Questionnaire with "option"', function(done) {
  //     $.get('/test/data/R4/weightHeightQuestionnaire.json', function z(whQ) {
  //       // Remove the meta.profile so we can test whether the guess function can
  //       // correctly guess based on structure only.
  //       delete whQ.meta;
  //       var fhirVersion = LForms.Util.guessFHIRVersion(whQ);
  //       assert.equal(fhirVersion, 'R4');
  //       done();
  //     });
  //   });
  // });
  

  it('should load a Questionnaire without resource pakcage', function () {
    let urlQ = element(by.id('urlQuestionnaire')),
    urlP =  element(by.id('urlPackage')),
    firstItem =  element(by.id('/q1/1')),
    btn = element(by.id('load'));

    urlQ.clear();
    urlQ.sendKeys("http://localhost:8080/questionnaire-use-package.json");
    btn.click();
    browser.wait(EC.visibilityOf(firstItem));
    firstItem.click();
    // expect(firstItem.searchResults.isPresent()).toBeFalsy();
    firstItem.sendKeys(protractor.Key.ARROW_DOWN);
    firstItem.sendKeys(protractor.Key.TAB);
    expect(firstItem.getAttribute('value')).toBe('');

  });


  it('should load a Questionnaire with a resource pakcage', function () {
    let urlQ = element(by.id('urlQuestionnaire')),
    urlP =  element(by.id('urlPackage')),
    firstItem =  element(by.id('/q1/1')),
    secondItem =  element(by.id('/q2/1')),
    thirdItem =  element(by.id('/q3/1')),
    btn = element(by.id('load'));

    urlQ.clear();
    urlQ.sendKeys("http://localhost:8080/questionnaire-use-package.json");
    urlP.clear();
    urlP.sendKeys("http://localhost:8080/package.json.tgz");
    btn.click();
    browser.wait(EC.visibilityOf(firstItem));

    firstItem.click();
    firstItem.sendKeys(protractor.Key.ARROW_DOWN);
    firstItem.sendKeys(protractor.Key.TAB);
    expect(firstItem.getAttribute('value')).toBe("Cholesterol [Moles/volume] in Serum or Plasma");

    secondItem.click();
    secondItem.sendKeys(protractor.Key.ARROW_DOWN);
    secondItem.sendKeys(protractor.Key.ARROW_DOWN);
    secondItem.sendKeys(protractor.Key.TAB);
    expect(secondItem.getAttribute('value')).toBe("Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma");

    thirdItem.click();
    thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
    thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
    thirdItem.sendKeys(protractor.Key.ARROW_DOWN);
    thirdItem.sendKeys(protractor.Key.TAB);
    expect(thirdItem.getAttribute('value')).toBe("Cholesterol/Triglyceride [Mass Ratio] in Serum or Plasma");

  });

});

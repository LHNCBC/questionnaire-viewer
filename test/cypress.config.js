const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:'+require('../package.json').config.testServerPort+'/',
    specPattern: 'cypress/e2e/error_handling.spec.js'
//    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}'
  },
});

const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        baseUrl: 'http://localhost:4029/',
        specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}'
    },
});

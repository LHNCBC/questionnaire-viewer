// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import 'cypress-wait-until';

// Get one or more DOM elements by element's id where '/' and '.' is escaped
// and "#" is added if not already present.
Cypress.Commands.add(
    'byId',
    { prevSubject: 'optional' },
    (subject, idSelector) => {
        // escape the / and . in the id
        const escapedSelector = idSelector.replace(/\//g,"\\/").replace(/\./g,"\\.");
        const cySelector = escapedSelector[0] === "#" ? escapedSelector : "#" + escapedSelector;
        if (subject) {
            return cy.wrap(subject).get(cySelector);
        }
        else {
            return cy.get(cySelector);
        }
    }
);

// unhide the file input element, upload a file and hide the file input element
Cypress.Commands.add(
    'uploadFile',
    { prevSubject: 'element' },
    (subject, filePathName) => {
        // Temporarily unhide the file input element.
        cy.get(subject).invoke('attr', 'class', '');
        cy.get(subject).selectFile(filePathName);
        // Re-hide the file input element
        cy.get(subject).invoke('attr', 'class', 'hide');
    }
);


// Written by an AI, in a few iterations of input from a human.
/**
 * Mocks an API response for a specified URL with data from a fixture file.
 *
 * @param {string} url - The URL to intercept and mock the response for.
 * @param {string} dataFile - The name of the fixture file to return as the response body.
 * @param {string} alias - The alias to use for the intercepted request, allowing for waiting on the request later.
 */
Cypress.Commands.add('mockApiResponse', (url, dataFile, alias) => {
  // Load the fixture data asynchronously
  cy.fixture(dataFile).then((data) => cy.intercept('GET', url, data).as(alias));
});


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

import { LOGIN_TEXTS } from "../support/helpers/constants";
import { loginPage } from "../support/pageObjects/login";
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  "login",
  (email = LOGIN_TEXTS.ADMIN_EMAIL, password = LOGIN_TEXTS.ADMIN_PASSWORD) => {
    cy.visit("/login");
    loginPage.fillForm(email, password);
    loginPage.clickLogin();
  },

  // Cypress.Commands.add(
  // "logout",
  // () => {
  //   cy.visit("/login");
  //   loginPage.fillForm(email, password);
  //   loginPage.clickLogin();
  // },
);

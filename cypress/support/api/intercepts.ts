export const AuthIntercepts = {
  registerIntercept() {
    cy.intercept("post", "/auth/register").as("registerRequest");
  },

  loginIntercept() {
    cy.intercept("post", "/auth/login").as("loginRequest");
  },

  getTicketsIntercept() {
    cy.intercept("get", "/tickets/getTickets*").as("getTicketsRequest");
  },
};

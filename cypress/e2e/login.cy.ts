import { loginPage } from "../support/pageObjects/login";
import { LOGIN_TEXTS } from "../support/helpers/constants";
import { AuthIntercepts } from "../support/api/intercepts";
describe("Login Page", () => {
  beforeEach(() => {
    AuthIntercepts.loginIntercept();
    loginPage.visit();
  });
  it("verify that all fields are exist in login page", () => {
    loginPage.verifyAllFieldsVisible();
  });
  it("Verify that sign up link forwarded to the sign up page", () => {
    loginPage.clickSignup();
    loginPage.verifyNavigatedToSignup();
  });

  it("Validate that the user can login using valid email and valid password ", () => {
    loginPage.fillForm(LOGIN_TEXTS.ADMIN_EMAIL, LOGIN_TEXTS.ADMIN_PASSWORD);
    loginPage.clickLogin();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
    loginPage.verifyNavigatedToDashboard();
  });
  it("Validate that the user can't login using empty email", () => {
    loginPage.fillForm("", LOGIN_TEXTS.ADMIN_PASSWORD);
    loginPage.triggerLoginBtn();
    loginPage.verifyRequiredError(LOGIN_TEXTS.ERRORS.FIELD_REQUIRED);
  });

  it("Validate that the user can't login using empty password", () => {
    loginPage.fillForm(LOGIN_TEXTS.ADMIN_EMAIL, "");
    loginPage.triggerLoginBtn();
    loginPage.verifyRequiredError(LOGIN_TEXTS.ERRORS.FIELD_REQUIRED);
  });

  it("Validate that the user can't log in using wrong password ", () => {
    loginPage.fillForm(
      LOGIN_TEXTS.ADMIN_EMAIL,
      LOGIN_TEXTS.ADMIN_PASSWORD_WRONG,
    );
    loginPage.clickLogin();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);
    loginPage.verifyError(LOGIN_TEXTS.ERRORS.INVALID_CREDENTIALS);
  });

  it("Validate that the user can't log in using non-existent email ", () => {
    loginPage.fillForm(
      LOGIN_TEXTS.ADMIN_EMAIL_NON_EXISTENT,
      LOGIN_TEXTS.ADMIN_PASSWORD,
    );
    loginPage.clickLogin();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);
    loginPage.verifyError(LOGIN_TEXTS.ERRORS.INVALID_CREDENTIALS);
  });

  it("Validate that the user can't log in using unmatched credentials ", () => {
    loginPage.fillForm(LOGIN_TEXTS.ADMIN_EMAIL, LOGIN_TEXTS.USER_PASSWORD);
    loginPage.clickLogin();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);
    loginPage.verifyError(LOGIN_TEXTS.ERRORS.INVALID_CREDENTIALS);
  });

  it(" Verify that forgot password link forwarded to the forgot password page ", () => {
    loginPage.clickForgotPassword();
    loginPage.verifyNavigatedToForgotPassword();
  });
});

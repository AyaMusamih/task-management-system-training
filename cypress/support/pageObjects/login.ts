import { LOGIN_TEXTS, SIGNUP_TEXTS } from "../helpers/constants";
import { loginSelectors } from "../selectors/Selectors";
import { ElementHandler } from "../utils/ElementHandler";

export class loginPage {
  static visit() {
    cy.visit("/login");
  }

  static verifyAllFieldsVisible() {
    ElementHandler.verifyVisibility(loginSelectors.emailInput);
    ElementHandler.verifyVisibility(loginSelectors.passwordInput);
    ElementHandler.verifyVisibility(loginSelectors.loginBtn);
    ElementHandler.verifyVisibility(loginSelectors.signupLink);
  }

  static clickSignup() {
    ElementHandler.click(loginSelectors.signupLink);
  }

  static verifyNavigatedToSignup() {
    ElementHandler.verifyNavigated(LOGIN_TEXTS.SIGNUP_REDIRECT);
  }

  static fillForm(email: string, pass: string) {
    ElementHandler.typeText(loginSelectors.emailInput, email);
    ElementHandler.typeText(loginSelectors.passwordInput, pass);
  }
  static clickLogin() {
    ElementHandler.click(loginSelectors.loginBtn);
  }
  static verifyNavigatedToDashboard() {
    ElementHandler.verifyNavigated(SIGNUP_TEXTS.SUCCESS_REDIRECT);
  }
  static verifyRequiredError(message: string) {
    ElementHandler.verifyErrorMessageWithInvoke(
      loginSelectors.requiredError,
      message,
    );
  }

  static triggerLoginBtn() {
    ElementHandler.trigger(loginSelectors.loginBtn, "mouseenter");
  }

  static verifyError(message: string) {
    ElementHandler.verifyErrorMessage(loginSelectors.errorMessage, message);
  }
  static clickForgotPassword() {
    ElementHandler.click(loginSelectors.forgotPasswordLink);
  }
  static verifyNavigatedToForgotPassword() {
    ElementHandler.verifyNavigated(LOGIN_TEXTS.FORGOT_PASSWORD_REDIRECT);
  }
}

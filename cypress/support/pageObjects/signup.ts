import { ElementHandler } from "../utils/ElementHandler";
import { signupSelectors } from "../selectors/Selectors";
import { SIGNUP_TEXTS } from "../helpers/constants";

export class SignupPage {
  static visit() {
    cy.visit("/signup");
  }

  static verifyAllFieldsVisible() {
    ElementHandler.verifyVisibility(signupSelectors.fullNameInput);
    ElementHandler.verifyVisibility(signupSelectors.emailInput);
    ElementHandler.verifyVisibility(signupSelectors.passwordInput);
    ElementHandler.verifyVisibility(signupSelectors.termsCheckbox);
    ElementHandler.verifyVisibility(signupSelectors.createAccountBtn);
    ElementHandler.verifyVisibility(signupSelectors.loginLink);
  }

  static clickLogin() {
    ElementHandler.click(signupSelectors.loginLink);
  }

  static verifyNavigatedToLogin() {
    ElementHandler.verifyNavigated(SIGNUP_TEXTS.LOGIN_REDIRECT);
  }

  static fillForm(name: string, email: string, pass: string) {
    ElementHandler.typeText(signupSelectors.fullNameInput, name);
    ElementHandler.typeText(signupSelectors.emailInput, email);
    ElementHandler.typeText(signupSelectors.passwordInput, pass);
  }

  static acceptTerms() {
    ElementHandler.check(signupSelectors.termsCheckbox);
  }

  static clickCreateAccount() {
    ElementHandler.click(signupSelectors.createAccountBtn);
  }

  static verifyNavigatedToDashboard() {
    ElementHandler.verifyNavigated(SIGNUP_TEXTS.SUCCESS_REDIRECT);
  }

  static verifyNameError(message: string) {
    ElementHandler.verifyErrorMessage(signupSelectors.errorMessage, message);
  }

  static verifyEmailError(message: string) {
    if (message === SIGNUP_TEXTS.ERRORS.DUPLICATE_EMAIL) {
      ElementHandler.verifyErrorMessage(
        signupSelectors.dublicateEmailMessage,
        message,
      );
    } else {
      ElementHandler.verifyErrorMessage(signupSelectors.errorMessage, message);
    }
  }

  static verifyPasswordError(message: string) {
    ElementHandler.verifyErrorMessage(signupSelectors.errorMessage, message);
  }
}

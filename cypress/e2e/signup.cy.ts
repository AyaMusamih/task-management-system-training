import { SignupPage } from "../support/pageObjects/signup";
import { UserDataGenerator } from "../support/helpers/utils";
import { AuthIntercepts } from "../support/api/intercepts";
import { SIGNUP_TEXTS } from "../support/helpers/constants";
import passwordValidation from "../fixtures/passwordValidation.json";

describe("Signup Page", () => {
  beforeEach(() => {
    AuthIntercepts.registerIntercept();
    SignupPage.visit();
  });

  it("verify that all fields are exist in sign up page", () => {
    SignupPage.verifyAllFieldsVisible();
  });
  it("Verify that login link forwarded to the login page", () => {
    SignupPage.clickLogin();
    SignupPage.verifyNavigatedToLogin();
  });
  it("Validate that the user can sign up using valid full name,valid email and valid password", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(user.fullName, user.email, user.password);
    SignupPage.acceptTerms();
    SignupPage.clickCreateAccount();
    cy.wait("@registerRequest").its("response.statusCode").should("eq", 201); // to prevent flaky testing انه التست يسبق الرد من السيرفر
    SignupPage.verifyNavigatedToDashboard();
  });

  it("Validate that the user can't sign up using empty full name", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm("", user.email, user.password);
    SignupPage.acceptTerms();
    SignupPage.verifyNameError(SIGNUP_TEXTS.ERRORS.FIELD_REQUIRED);
  });

  it("Validate that the user can't sign up using full name less than 2 characters", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(SIGNUP_TEXTS.SHORT_NAME, user.email, user.password);
    SignupPage.acceptTerms();
    SignupPage.clickCreateAccount();
    SignupPage.verifyNameError(SIGNUP_TEXTS.ERRORS.NAME_MIN_LENGTH);
  });

  it("Validate that the user can't sign up using full name more than 100 characters", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(SIGNUP_TEXTS.LONG_NAME, user.email, user.password);
    SignupPage.acceptTerms();
    SignupPage.clickCreateAccount();
    SignupPage.verifyNameError(SIGNUP_TEXTS.ERRORS.NAME_TOO_LONG);
  });

  it("Validate that the user can't sign up using empty email", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(user.fullName, "", user.password);
    SignupPage.acceptTerms();
    SignupPage.verifyEmailError(SIGNUP_TEXTS.ERRORS.FIELD_REQUIRED);
  });

  it("Validate that the user can't sign up using Invalid email format", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(
      user.fullName,
      SIGNUP_TEXTS.INVALID_EMAIL,
      user.password,
    );
    SignupPage.acceptTerms();
    SignupPage.clickCreateAccount();
    SignupPage.verifyEmailError(SIGNUP_TEXTS.ERRORS.EMAIL_FORMAT);
  });

  it("Validate that the user can't sign up using email more than 255 characters", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(user.fullName, SIGNUP_TEXTS.LONG_EMAIL, user.password);
    SignupPage.acceptTerms();
    SignupPage.clickCreateAccount();
    SignupPage.verifyEmailError(SIGNUP_TEXTS.ERRORS.EMAIL_TOO_LONG);
  });
  it("Validate that the user can't sign up using duplicate email", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(
      user.fullName,
      SIGNUP_TEXTS.EXISTING_EMAIL,
      user.password,
    );
    SignupPage.acceptTerms();
    SignupPage.clickCreateAccount();
    cy.wait("@registerRequest").its("response.statusCode").should("eq", 409);
    SignupPage.verifyEmailError(SIGNUP_TEXTS.ERRORS.DUPLICATE_EMAIL);
  });

  it("Validate that the user can't sign up using empty password", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(user.fullName, user.email, "");
    SignupPage.acceptTerms();
    SignupPage.verifyPasswordError(SIGNUP_TEXTS.ERRORS.FIELD_REQUIRED);
  });

  it("Validate that the user can't sign up using password with length less than 8 characters", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(user.fullName, user.email, SIGNUP_TEXTS.SHORT_PASSWORD);
    SignupPage.acceptTerms();
    SignupPage.clickCreateAccount();
    SignupPage.verifyPasswordError(SIGNUP_TEXTS.ERRORS.PASSWORD_TOO_SHORT);
  });

  it("Validate that the user can't sign up using password with length more than 100 characters", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(user.fullName, user.email, SIGNUP_TEXTS.LONG_PASSWORD);
    SignupPage.acceptTerms();
    SignupPage.clickCreateAccount();
    SignupPage.verifyPasswordError(SIGNUP_TEXTS.ERRORS.PASSWORD_TOO_LONG);
  });

  passwordValidation.forEach((validation) => {
    it(`Validate that the user can't sign up using password field without ${validation.desc}`, () => {
      const user = UserDataGenerator.generateUser();

      SignupPage.fillForm(user.fullName, user.email, validation.pwd);
      SignupPage.acceptTerms();
      SignupPage.clickCreateAccount();

      SignupPage.verifyPasswordError(SIGNUP_TEXTS.ERRORS.PASSWORD_COMPLEXITY);
    });
  });

  it("Validate that the user can't sign up without agree to terms of use and privacy policy", () => {
    const user = UserDataGenerator.generateUser();
    SignupPage.fillForm(user.fullName, user.email, user.password);
    SignupPage.clickCreateAccount();
    SignupPage.verifyPasswordError(SIGNUP_TEXTS.ERRORS.TERMS_REQUIRED);
  });
});

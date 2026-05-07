import { faker } from "@faker-js/faker/locale/zu_ZA";

export const SIGNUP_TEXTS = {
  PAGE_TITLE: "Create an account",
  SUCCESS_REDIRECT: "/dashboard",
  LOGIN_REDIRECT: "/login",
  SHORT_NAME: "A",
  LONG_NAME: faker.string.alpha(101),
  INVALID_EMAIL: "testgmail@X.l",
  LONG_EMAIL: faker.string.alpha(247) + "@gmail.com",
  EXISTING_EMAIL: "ansamjanajreh@gmail.com",
  SHORT_PASSWORD: "Aa*1234",
  LONG_PASSWORD: faker.string.alpha(97) + "Aa1*",

  ERRORS: {
    FIELD_REQUIRED: "This field is required",
    NAME_MIN_LENGTH: "Name must be at least 2 characters",
    NAME_TOO_LONG: "Name is too long",
    EMAIL_FORMAT: "Invalid email format",
    EMAIL_TOO_LONG: "Email is too long",
    DUPLICATE_EMAIL: "User already exists",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
    PASSWORD_TOO_LONG: "Password is too long",
    PASSWORD_COMPLEXITY:
      "Password must contain uppercase, lowercase, number and special character",
    TERMS_REQUIRED: "You must agree to the terms and policies",
  },
};

export const LOGIN_TEXTS = {
  SUCCESS_REDIRECT: "/dashboard",
  SIGNUP_REDIRECT: "/signup",
  ADMIN_EMAIL: "admin01@example.com",
  ADMIN_PASSWORD: "securePassword123??",
  ADMIN_PASSWORD_WRONG: "wrongPassword123??",
  ADMIN_EMAIL_NON_EXISTENT: "nonexistent@example.com",
  USER_PASSWORD: "Aa*123123",
  FORGOT_PASSWORD_REDIRECT: "/forgot-password",

  ERRORS: {
    FIELD_REQUIRED: "Fill in all required fields",
    INVALID_CREDENTIALS: "Invalid Email or Password",
  },
};

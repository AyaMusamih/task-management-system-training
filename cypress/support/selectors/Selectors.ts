export const signupSelectors = {
  fullNameInput: 'input[placeholder="Enter your full name"]',
  emailInput: 'input[placeholder="Enter your email"]',
  passwordInput: 'input[placeholder="Enter your password"]',
  termsCheckbox: 'input[type="checkbox"]',
  createAccountBtn: 'button:contains("Create an account")',
  loginLink: 'a[href="/login"]',
  errorMessage: "span.text-error-red",
  dublicateEmailMessage: "div.text-error-red",
};

export const loginSelectors = {
  emailInput: 'input[placeholder="Enter your email"]',
  passwordInput: 'input[placeholder="Enter your password"]',
  loginBtn: 'button:contains("Login")',
  signupLink: 'a[href="/signup"]',
  requiredError: "div.bg-accent-indigo.text-hint",
  errorMessage: "div.text-error-red",
  forgotPasswordLink: 'a[href="/forgot-password"]',
};

export const dashboardSelectors = {
  stageFilter: 'button:contains("Stage"):eq(0)',
  dropdownOptions: "div.absolute button.w-full",
  tableRows: "table tbody tr",
  stageColumn: "td:nth-child(5)",
  priorityFilter: 'button:contains("Priority"):eq(0)',
  priorityColumn: "td:nth-child(3)",
  assigneeFilter: 'button:contains("Assignee"):eq(0)',
  assigneeColumn: "td:nth-child(4)",
  OptionsExceptAll: "div.absolute.top-full button:not(:first-child)",
  sprintFilter: 'button:contains("Sprint"):eq(2)',
  sprintColumn: "td:nth-child(6)",
};

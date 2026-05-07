import filtersData from "../../fixtures/filtersData.json";
import { AuthIntercepts } from "../../support/api/intercepts";
import { dashboardPage } from "../../support/pageObjects/dashboard";
describe("Filters", () => {
  beforeEach(() => {
    AuthIntercepts.loginIntercept();
    AuthIntercepts.getTicketsIntercept();

    cy.login();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
  });

  filtersData.stages.forEach((stage) => {
    it(`should filter tasks by stage: ${stage.name}`, () => {
      dashboardPage.clickStageFilter();
      dashboardPage.selectOption(stage.name);
      cy.wait("@getTicketsRequest")
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
      cy.wait(8000);
      dashboardPage.verifyFilteredResults(stage.expected);
    });
  });

  filtersData.priorities.forEach((priority) => {
    it(`should filter tasks by priority: ${priority}`, () => {
      dashboardPage.clickPriorityFilter();
      dashboardPage.selectOption(priority);
      cy.wait("@getTicketsRequest")
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
      cy.wait(8000);
      dashboardPage.verifyFilteredResultsForPriority(priority);
    });
  });

  it("should filter tasks by a dynamic assignee from the list", () => {
    dashboardPage.clickAssigneeFilter();
    dashboardPage.selectRandomAssignee();
    cy.wait("@getTicketsRequest")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
    cy.wait(8000);
    dashboardPage.verifyFilteredResultsForAssignee();
  });

  it.only("should filter tasks by a dynamic sprint from the list", () => {
    dashboardPage.clickSprintFilter();
    dashboardPage.selectRandomSprint();
    cy.wait("@getTicketsRequest")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
    cy.wait(8000);
    dashboardPage.verifyFilteredResultsForSprint();
  });
});

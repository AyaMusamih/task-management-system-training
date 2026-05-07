import { ElementHandler } from "../utils/ElementHandler";
import { dashboardSelectors } from "../selectors/Selectors";
export class dashboardPage {
  static clickStageFilter() {
    ElementHandler.click(dashboardSelectors.stageFilter);
  }
  static selectOption(option: string) {
    ElementHandler.selectOption(dashboardSelectors.dropdownOptions, option);
  }

  static verifyFilteredResults(expectedStage: string[]) {
    ElementHandler.verifyAllElementsText(
      dashboardSelectors.stageColumn,
      expectedStage,
    );
  }

  static clickPriorityFilter() {
    ElementHandler.click(dashboardSelectors.priorityFilter);
  }

  static verifyFilteredResultsForPriority(expectedPriority: string) {
    ElementHandler.verifyAllElementsText(
      dashboardSelectors.priorityColumn,
      expectedPriority,
    );
  }

  static clickAssigneeFilter() {
    ElementHandler.click(dashboardSelectors.assigneeFilter);
  }

  static selectRandomAssignee() {
    ElementHandler.getRandomElement(dashboardSelectors.OptionsExceptAll).then(
      ($selectedOption) => {
        const fullName = $selectedOption.text().trim();

        const initials = ElementHandler.getInitials(fullName);

        cy.wrap(initials).as("selectedInitials");

        cy.wrap($selectedOption).click();
      },
    );
  }

  static verifyFilteredResultsForAssignee() {
    cy.get("@selectedInitials").then((initials) => {
      ElementHandler.verifyAllElementsText(
        dashboardSelectors.assigneeColumn,
        initials.toString(),
      );
    });
  }

  static clickSprintFilter() {
    ElementHandler.click(dashboardSelectors.sprintFilter);
  }

  static selectRandomSprint() {
    ElementHandler.getRandomElement(dashboardSelectors.OptionsExceptAll).then(
      ($selectedOption) => {
        const sprintName = $selectedOption.text().trim();

        cy.wrap(sprintName).as("selectedSprintName");

        cy.wrap($selectedOption).click();
      },
    );
  }

  static verifyFilteredResultsForSprint() {
    cy.get("@selectedSprintName").then((sprintName) => {
      ElementHandler.verifyAllElementsText(
        dashboardSelectors.sprintColumn,
        sprintName.toString(),
      );
    });
  }
}

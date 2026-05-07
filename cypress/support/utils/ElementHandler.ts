export class ElementHandler {
  static verifyVisibility(selector: string) {
    cy.get(selector).should("be.visible");
  }
  static typeText(selector: string, text: string) {
    if (!text) {
      cy.get(selector).should("be.visible").clear();
    } else cy.get(selector).should("be.visible").clear().type(text);
  }

  static click(selector: string) {
    cy.get(selector).should("be.visible").click();
  }

  static check(selector: string) {
    cy.get(selector).should("be.visible").check({ force: true });
  }
  static verifyNavigated(path: string) {
    // cy.wait(500);
    cy.url().should("include", path);
  }
  static verifyErrorMessage(selector: string, expectedMessage: string) {
    cy.get(selector).should("be.visible").and("have.text", expectedMessage);
  }

  static verifyErrorMessageWithInvoke(
    selector: string,
    expectedMessage: string,
  ) {
    cy.get(selector)
      .invoke("attr", "style", "opacity: 1") // to make the element visible if it's hidden by opacity
      .should("have.text", expectedMessage);
  }
  static trigger(selector: string, event: string) {
    cy.get(selector).trigger(event, { force: true });
  }
  static selectOption(selector: string, option: string) {
    cy.get(selector).contains(option).click();
  }
  static verifyAllElementsText(
    selector: string,
    expectedTexts: string[] | string,
  ) {
    cy.get(selector).each(($element) => {
      const actualText = $element.text().trim();
      cy.wrap($element).then(() => {
        if (Array.isArray(expectedTexts)) {
          expect(expectedTexts).to.include(actualText);
        } else {
          expect(actualText).to.equal(expectedTexts);
        }
      });
      //cy.wrap($element).should("have.text", expectedTexts);
    });
  }

  static getRandomElement(selector: string) {
    return cy.get(selector).then(($element) => {
      const randomIndex = Math.floor(Math.random() * $element.length);
      return cy.wrap($element.eq(randomIndex));
    });
  }
  static getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}

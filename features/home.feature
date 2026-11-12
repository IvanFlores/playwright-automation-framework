Feature: Home page

  Background:
    Given I open the home page

  @smoke
  Scenario: Home page loads and shows a heading
    Then the home page heading is visible
    And the page title matches "Playwright"

  @regression
  Scenario: Navigating via the primary call to action
    When I click the "Get started" call to action
    Then the URL contains "intro"

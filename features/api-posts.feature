@api
Feature: Posts API

  @smoke
  Scenario: Listing posts
    When I request the list of posts
    Then at least 1 post is returned

  @regression
  Scenario: Creating a post
    When I create a post with generated data
    Then the created post echoes the submitted data
    And the created post has an id

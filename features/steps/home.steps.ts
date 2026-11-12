import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I open the home page', async function (this: CustomWorld) {
  await this.homePage.navigate();
});

When('I click the {string} call to action', async function (this: CustomWorld, name: string) {
  await this.page.getByRole('link', { name }).first().click();
});

Then('the home page heading is visible', async function (this: CustomWorld) {
  await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
});

Then('the page title matches {string}', async function (this: CustomWorld, pattern: string) {
  await expect(this.page).toHaveTitle(new RegExp(pattern));
});

Then('the URL contains {string}', async function (this: CustomWorld, fragment: string) {
  await expect(this.page).toHaveURL(new RegExp(fragment));
});

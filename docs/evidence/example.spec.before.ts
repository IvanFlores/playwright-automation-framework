import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter User Email' }).click();
  await page.getByRole('textbox', { name: 'Enter User Email' }).fill('adalidflores');
  await page.getByRole('textbox', { name: 'Enter User Email' }).press('Alt+6');
  await page.getByRole('textbox', { name: 'Enter User Email' }).press('Alt+4');
  await page.getByRole('textbox', { name: 'Enter User Email' }).fill('adalidflores@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('Cla2510');
  await page.getByRole('button', { name: 'LogIn' }).click();
  await expect(page.getByTestId('hello')).toBeVisible();
  await expect(page.getByTestId('hello')).toContainText('adalidflores@gmail.com');
  await expect(page.getByTestId('btn-dropdown')).toMatchAriaSnapshot(`- button`);
});
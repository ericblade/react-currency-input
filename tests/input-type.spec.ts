import { test, expect } from '@playwright/test';
import * as path from 'path';

const projectDir = path.resolve(__dirname, '../');
const filePath = path.join(projectDir, 'examples/index.html');
const fileUrl = `file://${filePath}`;

test.describe('input type variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl);
  });

  test('default input type is text', async ({ page }) => {
    const currencyInput = page.locator('#currency-input');
    await expect(currencyInput).toHaveAttribute('type', 'text');
  });

  test('set input type to tel for mobile keypad', async ({ page }) => {
    const inputTypeField = page.locator('[name=inputType]');
    const applyBtn = page.locator('[name=apply]');

    await inputTypeField.fill('tel');
    await applyBtn.click();

    const currencyInput = page.locator('#currency-input');
    await expect(currencyInput).toHaveAttribute('type', 'tel');

    // Ensure formatting still works
    await currencyInput.focus();
    await currencyInput.fill('');
    await currencyInput.type('123');
    await expect(currencyInput).toHaveValue('$1.23 USD');
  });

  test('set input type to number (native numeric)', async ({ page }) => {
    const inputTypeField = page.locator('[name=inputType]');
    const applyBtn = page.locator('[name=apply]');

    await inputTypeField.fill('number');
    await applyBtn.click();

    const currencyInput = page.locator('#currency-input');
    await expect(currencyInput).toHaveAttribute('type', 'number');

    // Many browsers disallow arbitrary characters and formatting in native number inputs.
    // Just verify that switching to number does not throw, then switch back to text.
    await inputTypeField.fill('text');
    await applyBtn.click();
    await expect(currencyInput).toHaveAttribute('type', 'text');
  });

  test('set input type to email (stress case) then back to text', async ({ page }) => {
    const inputTypeField = page.locator('[name=inputType]');
    const applyBtn = page.locator('[name=apply]');

    await inputTypeField.fill('email');
    await applyBtn.click();
    await expect(page.locator('#currency-input')).toHaveAttribute('type', 'email');

    await inputTypeField.fill('text');
    await applyBtn.click();
    await expect(page.locator('#currency-input')).toHaveAttribute('type', 'text');
  });
});

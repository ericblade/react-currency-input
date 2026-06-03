import { test, expect } from '@playwright/test';
import * as path from 'path';

const projectDir = path.resolve(__dirname, '../');
const filePath = path.join(projectDir, 'examples/index.html');
const fileUrl = `file://${filePath}`;

test.describe('controlled component (value prop updates)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl);
  });

  test('should update input value when value prop changes after user interaction', async ({ page }) => {
    const currencyInput = page.locator('#currency-input');
    const valueInput = page.locator('[name=value]');
    const applyBtn = page.locator('[name=apply]');

    // Initial state: should show $0.00 USD
    await expect(currencyInput).toHaveValue('$0.00 USD');

    // Simulate user typing into the currency input
    await currencyInput.focus();
    await currencyInput.selectText();
    await currencyInput.pressSequentially('5000');
    await expect(currencyInput).toHaveValue('$50.00 USD');

    // Simulate a parent-driven controlled value update (calls React setValue())
    // This is the key regression scenario: after user interaction, an external prop
    // change must override the displayed value rather than appear stale.
    await valueInput.fill('22.22');
    await applyBtn.click();

    // Input should reflect the externally provided value, not the user-typed value
    await expect(currencyInput).toHaveValue('$22.22 USD');
  });
});

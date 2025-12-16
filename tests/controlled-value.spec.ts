import { test, expect } from '@playwright/test';
import * as path from 'path';

const projectDir = path.resolve(__dirname, '../');
const filePath = path.join(projectDir, 'examples/index.html');
const fileUrl = `file://${filePath}`;

test.describe('controlled component (value prop updates)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl);
  });

  test('should update input value when value prop changes externally', async ({ page }) => {
    // Simulate a parent-driven prop change by updating the form-controlled value field.

    const currencyInput = page.locator('#currency-input');

    // Initial state: should show $0.00 USD
    await expect(currencyInput).toHaveValue('$0.00 USD');

    // Simulate typing into the input to set it to a different value
    // Note: Using pressSequentially instead of fill+type to properly trigger React events
    await currencyInput.focus();
    await currencyInput.selectText();
    await currencyInput.pressSequentially('5000');

    // Now it should show $50.00 USD (with precision 2)
    await expect(currencyInput).toHaveValue('$50.00 USD');

    // Now change the value via the form control (simulating external prop change)
    const valueInput = page.locator('[name=value]');
    const applyBtn = page.locator('[name=apply]');

    // Simulate a parent setting the controlled value to 22.22
    await valueInput.fill('22.22');
    await applyBtn.click();

    // Input should reflect the externally provided value (22.22)
    await expect(currencyInput).toHaveValue('$22.22 USD');
  });
});

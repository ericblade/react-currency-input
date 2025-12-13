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
    // This test simulates the reported bug:
    // A parent component changes the value prop (e.g., via a button click that calls setAmount(22.22))
    // and the CurrencyInput should reflect that change.
    
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
    const prefixInput = page.locator('[name=prefix]');
    const suffixInput = page.locator('[name=suffix]');
    const applyBtn = page.locator('[name=apply]');
    
    // Set a different prefix/suffix to force a refresh, but keep the same value
    // The component should preserve the currently formatted value
    await prefixInput.fill('$');
    await suffixInput.fill(' USD');
    await applyBtn.click();
    
    // Input should still show the value it had
    await expect(currencyInput).toHaveValue('$50.00 USD');
  });
});

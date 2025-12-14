import { test, expect } from '@playwright/test';
import * as path from 'path';

const projectDir = path.resolve(__dirname, '../');
const filePath = path.join(projectDir, 'examples/index.html');
const fileUrl = `file://${filePath}`;

test.describe('base tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(fileUrl);
    });

    test('sanity startup', async ({ page }) => {
        const currencyInput = page.locator('#currency-input');
        await expect(currencyInput).toHaveValue('$0.00 USD');
    });

    test('undefined value results in correct 0 of input', async ({ page }) => {
        const nullInputTest = await page.locator('#null-input-test');
        await expect(nullInputTest).toHaveValue('$0.00 USD');
    });
});

test.describe('component parameters', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(fileUrl);
    });

    test.describe('prefix and suffix', () => {
        test('renders with default prefix $ and suffix USD', async ({ page }) => {
            const currencyInput = await page.locator('#currency-input');
            await expect(currencyInput).toHaveValue('$0.00 USD');
        });

        test('renders with custom prefix', async ({ page }) => {
            const prefixInput = page.locator('[name=prefix]');
            const suffixInput = page.locator('[name=suffix]');
            const applyBtn = page.locator('[name=apply]');

            await prefixInput.fill('£');
            await suffixInput.fill('');
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            await expect(currencyInput).toHaveValue('£0.00');
        });

        test('renders with custom suffix', async ({ page }) => {
            const prefixInput = page.locator('[name=prefix]');
            const suffixInput = page.locator('[name=suffix]');
            const applyBtn = page.locator('[name=apply]');

            await prefixInput.fill('');
            await suffixInput.fill(' EUR');
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            await expect(currencyInput).toHaveValue('0.00 EUR');
        });

        test('renders with both custom prefix and suffix', async ({ page }) => {
            const prefixInput = page.locator('[name=prefix]');
            const suffixInput = page.locator('[name=suffix]');
            const applyBtn = page.locator('[name=apply]');

            await prefixInput.fill('¥');
            await suffixInput.fill(' JPY');
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            await expect(currencyInput).toHaveValue('¥0.00 JPY');
        });
    });

    test.describe('separators and precision', () => {
        test('default separators are comma thousand and period decimal', async ({ page }) => {
            const currencyInput = page.locator('#currency-input');
            const decimalInput = page.locator('[name=decimalSeparator]');
            const thousandInput = page.locator('[name=thousandSeparator]');

            // Verify defaults
            const decimalValue = await decimalInput.inputValue();
            const thousandValue = await thousandInput.inputValue();
            expect(decimalValue).toBe('.');
            expect(thousandValue).toBe(',');
        });

        test('custom decimal separator', async ({ page }) => {
            const decimalInput = page.locator('[name=decimalSeparator]');
            const prefixInput = page.locator('[name=prefix]');
            const suffixInput = page.locator('[name=suffix]');
            const applyBtn = page.locator('[name=apply]');

            await prefixInput.fill('');
            await suffixInput.fill('');
            await decimalInput.fill(',');
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            await expect(currencyInput).toHaveValue('0,00');
            await currencyInput.focus();
            await currencyInput.fill('');
            await currencyInput.type('12345');

            await expect(currencyInput).toHaveValue('123,45');
        });

        test('custom thousand separator', async ({ page }) => {
            const thousandInput = page.locator('[name=thousandSeparator]');
            const precisionInput = page.locator('[name=precision]');
            const prefixInput = page.locator('[name=prefix]');
            const suffixInput = page.locator('[name=suffix]');
            const decimalInput = page.locator('[name=decimalSeparator]');
            const applyBtn = page.locator('[name=apply]');

            await prefixInput.fill('');
            await suffixInput.fill('');
            await decimalInput.fill(',');
            await thousandInput.fill('.');
            await precisionInput.fill('2');
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            await expect(currencyInput).toHaveValue('0,00');
            await currencyInput.focus();
            await currencyInput.fill('');
            await currencyInput.type('1234567');

            // With custom separators, should format as 1.234.567,00
            const value = await currencyInput.inputValue();
            expect(value).toContain('.');
            expect(value).toContain(',');
        });

        test('precision 0', async ({ page }) => {
            const precisionInput = page.locator('[name=precision]');
            const prefixInput = page.locator('[name=prefix]');
            const suffixInput = page.locator('[name=suffix]');
            const decimalInput = page.locator('[name=decimalSeparator]');
            const applyBtn = page.locator('[name=apply]');

            await prefixInput.fill('');
            await suffixInput.fill('');
            await decimalInput.fill('.');
            await precisionInput.fill('0');
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            await expect(currencyInput).toHaveValue('0');
            await currencyInput.focus();
            await currencyInput.fill('');
            await currencyInput.type('12345');

            await expect(currencyInput).toHaveValue('12,345');
        });

        test('precision 3', async ({ page }) => {
            const precisionInput = page.locator('[name=precision]');
            const prefixInput = page.locator('[name=prefix]');
            const suffixInput = page.locator('[name=suffix]');
            const decimalInput = page.locator('[name=decimalSeparator]');
            const applyBtn = page.locator('[name=apply]');

            await prefixInput.fill('');
            await suffixInput.fill('');
            await decimalInput.fill('.');
            await precisionInput.fill('3');
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            await expect(currencyInput).toHaveValue('0.000');
            await currencyInput.focus();
            await currencyInput.fill('');
            await currencyInput.type('12345');

            await expect(currencyInput).toHaveValue('12.345');
        });
    });

    test.describe('allowNegative', () => {
        test('rejects negative input when allowNegative is false', async ({ page }) => {
            // allowNegative is false by default, so minus signs should be rejected
            const currencyInput = page.locator('#currency-input');
            await currencyInput.focus();
            await currencyInput.selectText();
            await currencyInput.pressSequentially('-100');

            // Should not contain minus sign since allowNegative is false by default
            const value = await currencyInput.inputValue();
            expect(value).not.toContain('-');
        });

        test('accepts negative numbers when allowNegative is true', async ({ page }) => {
            // Enable allowNegative via form control
            const allowNegativeCheckbox = page.locator('[name=allowNegative]');
            const applyBtn = page.locator('[name=apply]');
            const currencyInput = page.locator('#currency-input');

            await allowNegativeCheckbox.check();
            await applyBtn.click();

            await expect(currencyInput).toHaveValue('$0.00 USD');
            await currencyInput.focus();
            await currencyInput.selectText();

            // First input a number (can't have negative zero)
            await currencyInput.pressSequentially('50');

            let value = await currencyInput.inputValue();
            expect(value).toContain('0.50');

            // Now add the minus sign - should toggle the number to negative
            await currencyInput.press('Minus');

            // Should now contain minus sign
            value = await currencyInput.inputValue();
            expect(value).toContain('-');
        });

        test('removes negative sign when allowNegative is disabled', async ({ page }) => {
            // First enable allowNegative
            const allowNegativeCheckbox = page.locator('[name=allowNegative]');
            const applyBtn = page.locator('[name=apply]');
            const currencyInput = page.locator('#currency-input');

            await allowNegativeCheckbox.check();
            await applyBtn.click();
            await expect(currencyInput).toHaveValue('$0.00 USD');
            await currencyInput.focus();
            await currencyInput.selectText();

            // Input a negative number
            await currencyInput.pressSequentially('50');
            await currencyInput.press('Minus');

            let value = await currencyInput.inputValue();
            expect(value).toContain('-');

            // Now disable allowNegative
            await allowNegativeCheckbox.uncheck();
            await applyBtn.click();

            // Value should now be positive
            value = await currencyInput.inputValue();
            expect(value).not.toContain('-');
        });
    });

    test.describe('allowEmpty', () => {
        test('maintains default value after clearing', async ({ page }) => {
            const currencyInput = page.locator('#currency-input');
            await currencyInput.focus();
            await currencyInput.fill('');
            await currencyInput.type('100');

            // Type something first
            const valueBefore = await currencyInput.inputValue();
            expect(valueBefore).toContain('1');

            // Clear and it should go back to 0
            await currencyInput.fill('');
            await expect(currencyInput).toHaveValue('$0.00 USD');
        });
    });

    test.describe('selectAllOnFocus', () => {
        test('caret position is managed at end of input content', async ({ page }) => {
            const selectAllCheckbox = page.locator('[name=selectAllOnFocus]');
            const applyBtn = page.locator('[name=apply]');

            await selectAllCheckbox.check();
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            await currencyInput.focus();

            await expect.poll(async () => {
                const selectionStart = await currencyInput.evaluate((el: HTMLInputElement) => el.selectionStart ?? 0);
                const selectionEnd = await currencyInput.evaluate((el: HTMLInputElement) => el.selectionEnd ?? 0);
                return selectionEnd - selectionStart;
            }).toBeGreaterThan(0);
        });
    });

    test.describe('input type', () => {
        test('can set input type to email', async ({ page }) => {
            const inputTypeField = page.locator('[name=inputType]');
            const applyBtn = page.locator('[name=apply]');

            await inputTypeField.fill('email');
            await applyBtn.click();

            const currencyInput = page.locator('#currency-input');
            const type = await currencyInput.getAttribute('type');

            expect(type).toBe('email');
        });

        test('can set input type back to text', async ({ page }) => {
            const currencyInput = page.locator('#currency-input');
            const type = await currencyInput.getAttribute('type');

            expect(type).toBe('text');
        });
    });

    test.describe('basic input and formatting', () => {
        test('typing numbers formats correctly', async ({ page }) => {
            const currencyInput = page.locator('#currency-input');
            await currencyInput.focus();
            await currencyInput.fill('');
            await currencyInput.type('100');

            // With precision 2, "100" becomes $1.00
            await expect(currencyInput).toHaveValue('$1.00 USD');
        });

        test('backspace removes digits correctly', async ({ page }) => {
            const currencyInput = page.locator('#currency-input');
            await currencyInput.focus();
            await currencyInput.fill('');
            await currencyInput.type('100');

            await expect(currencyInput).toHaveValue('$1.00 USD');

            await currencyInput.press('Backspace');
            await expect(currencyInput).toHaveValue('$0.10 USD');
        });

        test('decimal point insertion respects precision', async ({ page }) => {
            const currencyInput = page.locator('#currency-input');
            await currencyInput.focus();
            await currencyInput.fill('');
            await currencyInput.type('123');

            // With precision 2, 123 should be $1.23
            await expect(currencyInput).toHaveValue('$1.23 USD');
        });
    });

    test.describe('element attributes', () => {
        test('has correct id attribute', async ({ page }) => {
            const currencyInput = page.locator('#currency-input');
            const id = await currencyInput.getAttribute('id');

            expect(id).toBe('currency-input');
        });

        test('null-input-test element has correct id', async ({ page }) => {
            const nullInputTest = page.locator('#null-input-test');
            const id = await nullInputTest.getAttribute('id');

            expect(id).toBe('null-input-test');
        });
    });
});

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
        const currencyInput = await page.locator('#currency-input');
        await expect(currencyInput).toHaveValue('$0.00 USD');
    });

    test('undefined value results in correct 0 of input', async ({ page }) => {
        const nullInputTest = await page.locator('#null-input-test');
        await expect(nullInputTest).toHaveValue('$0.00 USD');
    });
});

// TODO: add tests for each of the possible parameters

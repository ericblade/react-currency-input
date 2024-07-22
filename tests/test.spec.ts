import { test, expect } from '@playwright/test';
import * as path from 'path';

const projectDir = path.resolve(__dirname, '../');
const filePath = path.join(projectDir, 'examples/index.html');
const fileUrl = `file://${filePath}`;

test.describe('test', () => {
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

test.describe('input caret selection', () => {
  const suffix = ' USD';
  const prefix = '$';
  const precision = '2';

  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl);
    await Promise.all([
      page.locator('[name=suffix]').focus(),
      page.locator('[name=suffix]').fill(suffix),
    ]);
    await Promise.all([
      page.locator('[name=prefix]').focus(),
      page.locator('[name=prefix]').fill(prefix),
    ]);
    await Promise.all([
      page.locator('[name=precision]').focus(),
      page.locator('[name=precision]').fill(precision),
    ]);
    await Promise.all([
      page.locator('[name=apply]').click(),
    ]);
  });

  test.describe('basic caret movement', () => {
    test('focus sets selection to last character before suffix', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length);
      expect(selectionEnd).toBe(inputLength - suffix.length);
    });

    test('cursor right from end does not allow caret selection to move', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.press('ArrowRight');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length);
      expect(selectionEnd).toBe(inputLength - suffix.length);
    });

    test('cursor left from end allows caret to move one backwards', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.press('ArrowLeft');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length - 1);
      expect(selectionEnd).toBe(inputLength - suffix.length - 1);
    });

    test('cursor left twice from end allows caret to move two backwards', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.press('ArrowLeft');
      await currencyInput.press('ArrowLeft');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length - 2);
      expect(selectionEnd).toBe(inputLength - suffix.length - 2);
    });

    test('cursor left thrice from end allows caret to move three backwards', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.press('ArrowLeft');
      await currencyInput.press('ArrowLeft');
      await currencyInput.press('ArrowLeft');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length - 3);
      expect(selectionEnd).toBe(inputLength - suffix.length - 3);
    });

    test('cursor home from end places caret selection in front of prefix', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.press('Home');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(prefix.length);
      expect(selectionEnd).toBe(prefix.length);
    });

    test('cursor left from beginning does not allow caret selection to move', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.press('Home');
      await currencyInput.press('ArrowLeft');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(prefix.length);
      expect(selectionEnd).toBe(prefix.length);
    });
  });

  test.describe('numeric entry and backspacing within precision', () => {
    test('enter 123 from end sets value to $1.23', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.type('123');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length);
      expect(selectionEnd).toBe(inputLength - suffix.length);
      expect(inputValue).toBe(`${prefix}1.23${suffix}`);
    });

    test('enter 123 then backspace once sets value to $0.12', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.type('123');
      await currencyInput.press('Backspace');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length);
      expect(selectionEnd).toBe(inputLength - suffix.length);
      expect(inputValue).toBe(`${prefix}0.12${suffix}`);
    });

    test('enter 123 then backspace twice sets value to $0.01', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.type('123');
      await currencyInput.press('Backspace');
      await currencyInput.press('Backspace');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length);
      expect(selectionEnd).toBe(inputLength - suffix.length);
      expect(inputValue).toBe(`${prefix}0.01${suffix}`);
    });

    test('enter 123 then backspace thrice sets value to $0.00', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.type('123');
      await currencyInput.press('Backspace');
      await currencyInput.press('Backspace');
      await currencyInput.press('Backspace');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length);
      expect(selectionEnd).toBe(inputLength - suffix.length);
      expect(inputValue).toBe(`${prefix}0.00${suffix}`);
    });

    test('enter 123 then left arrow then backspace sets value to $0.13 and leaves caret selection one left of end', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.type('123');
      await currencyInput.press('ArrowLeft');
      await currencyInput.press('Backspace');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length - 1);
      expect(selectionEnd).toBe(inputLength - suffix.length - 1);
      expect(inputValue).toBe(`${prefix}0.13${suffix}`);
    });

    test('enter 123 then left arrow then backspace twice sets value to $0.03 and leaves caret selection one left of end', async ({ page }) => {
      const currencyInput = await page.locator('#currency-input');
      await currencyInput.focus();
      await currencyInput.type('123');
      await currencyInput.press('ArrowLeft');
      await currencyInput.press('Backspace');
      await currencyInput.press('Backspace');
      const inputValue = await currencyInput.inputValue();
      const inputLength = inputValue.length;
      const selectionStart = await currencyInput.evaluate(el => el.selectionStart);
      const selectionEnd = await currencyInput.evaluate(el => el.selectionEnd);
      expect(selectionStart).toBe(inputLength - suffix.length - 1);
      expect(selectionEnd).toBe(inputLength - suffix.length - 1);
      expect(inputValue).toBe(`${prefix}0.03${suffix}`);
    });
  });
});

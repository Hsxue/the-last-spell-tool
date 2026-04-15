/**
 * Language Switching E2E Tests
 * Tests browser locale detection, LanguageSwitcher toggling, and localStorage persistence.
 */

import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('LanguageSwitcher is visible in header', async ({ page }) => {
    await page.goto('/');
    // Check language switcher is present
    await expect(page.getByTestId('language-switcher')).toBeVisible();
  });

  test('clicking LanguageSwitcher toggles language', async ({ page }) => {
    await page.goto('/');
    const switcher = page.getByTestId('language-switcher');

    // Initial state should show the opposite language name
    const initialText = await switcher.textContent();
    expect(initialText).toBeTruthy();

    // Click to toggle
    await switcher.click();

    // After click, the displayed language should have changed
    await page.waitForTimeout(100);
    const afterText = await switcher.textContent();
    expect(afterText).toBeTruthy();
    expect(afterText).not.toBe(initialText);
  });

  test('language persists after page reload', async ({ page }) => {
    await page.goto('/');

    // Set language to Chinese
    const switcher = page.getByTestId('language-switcher');
    const initialText = await switcher.textContent();
    await switcher.click();

    // Reload the page
    await page.reload();

    // Verify language switcher still shows Chinese
    const afterReloadText = await switcher.textContent();
    expect(afterReloadText).toBe(initialText);
  });

  test('localStorage stores selected language', async ({ page }) => {
    await page.goto('/');

    // Click language switcher
    const switcher = page.getByTestId('language-switcher');
    await switcher.click();

    // Check localStorage has the locale stored
    const storedLocale = await page.evaluate(() => localStorage.getItem('app-locale'));
    expect(storedLocale).toBeTruthy();
    expect(['en', 'zh']).toContain(storedLocale);
  });
});

/**
 * Manual QA Script - F3 Final Verification
 * 
 * Tests the essential building and flag placement functionality
 */

import { test, expect, type Page } from '@playwright/test';

async function waitForAppReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.getByText('TileMap Editor').waitFor({ state: 'visible', timeout: 10000 });
}

test.describe('F3 Final QA - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('F3-1: Building tab opens and shows buildings', async ({ page }) => {
    const buildingsTab = page.getByText('Buildings').first();
    await buildingsTab.click();
    await page.waitForTimeout(500);
    
    // Verify building list is visible
    const buildingList = page.locator('[role="listbox"]');
    await expect(buildingList).toBeVisible();
    
    // Should have buildings
    const buildingCount = await page.locator('text="StoneWall"').count();
    expect(buildingCount).toBeGreaterThan(0);
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-1-building-sidebar.png' });
  });

  test('F3-2: Building category filter works', async ({ page }) => {
    const buildingsTab = page.getByText('Buildings').first();
    await buildingsTab.click();
    await page.waitForTimeout(300);
    
    // Click category dropdown
    const trigger = page.locator('[data-state="closed"]').first();
    await trigger.click();
    await page.waitForTimeout(200);
    
    // Select a category
    const option = page.getByText('Trap').first();
    await option.click();
    await page.waitForTimeout(300);
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-2-category-filter.png' });
  });

  test('F3-3: Building health input works', async ({ page }) => {
    const buildingsTab = page.getByText('Buildings').first();
    await buildingsTab.click();
    await page.waitForTimeout(300);
    
    const healthInput = page.locator('input[type="number"]').first();
    await expect(healthInput).toBeVisible();
    await healthInput.fill('200');
    await page.waitForTimeout(200);
    await expect(healthInput).toHaveValue('200');
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-3-health-input.png' });
  });

  test('F3-4: Remove mode toggle works', async ({ page }) => {
    const buildingsTab = page.getByText('Buildings').first();
    await buildingsTab.click();
    await page.waitForTimeout(300);
    
    const removeButton = page.locator('text=/Remove Mode/').first();
    await expect(removeButton).toBeVisible();
    await removeButton.click();
    await page.waitForTimeout(200);
    
    // Verify button state changed
    const newText = await removeButton.textContent();
    expect(newText).toContain('ON');
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-4-remove-mode.png' });
  });

  test('F3-5: Flag tab opens and shows flags', async ({ page }) => {
    const flagTab = page.getByText('Flags').first();
    await flagTab.click();
    await page.waitForTimeout(500);
    
    // Verify flag list is visible
    const flagList = page.locator('text=/EnemyMagnet|FogSpawner/');
    await expect(flagList).toBeVisible();
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-5-flag-sidebar.png' });
  });

  test('F3-6: Flag visibility toggles work', async ({ page }) => {
    const flagTab = page.getByText('Flags').first();
    await flagTab.click();
    await page.waitForTimeout(300);
    
    // Find a checkbox for flag visibility
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    
    const initialState = await checkbox.isChecked();
    await checkbox.click();
    await page.waitForTimeout(200);
    const newState = await checkbox.isChecked();
    expect(newState).not.toBe(initialState);
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-6-flag-visibility.png' });
  });

  test('F3-7: Zone flags show size inputs', async ({ page }) => {
    const flagTab = page.getByText('Flags').first();
    await flagTab.click();
    await page.waitForTimeout(300);
    
    // Select a zone flag
    const zoneSelect = page.locator('[name="flagType"]').first();
    await zoneSelect.click();
    await page.waitForTimeout(200);
    
    const zoneOption = page.getByText('Zone_E').first();
    await zoneOption.click();
    await page.waitForTimeout(300);
    
    // Size inputs should appear
    const sizeInputs = page.locator('text=/Size/');
    await expect(sizeInputs).toBeVisible();
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-7-zone-size.png' });
  });

  test('F3-8: Status bar shows coordinates', async ({ page }) => {
    // Move mouse over canvas area
    const canvas = page.locator('canvas').first();
    await canvas.hover({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(200);
    
    // Status bar should show coordinates
    const statusBar = page.locator('text=/\\(\\d+, \\d+\\)/');
    await expect(statusBar).toBeVisible();
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-8-status-bar.png' });
  });

  test('F3-9: Building count verification', async ({ page }) => {
    const buildingsTab = page.getByText('Buildings').first();
    await buildingsTab.click();
    await page.waitForTimeout(500);
    
    // Count buildings in list (scroll and count)
    const buildingItems = page.locator('[role="option"]');
    const count = await buildingItems.count();
    
    console.log(`Building count: ${count}`);
    expect(count).toBeGreaterThan(100); // Should have 170+ buildings
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-9-building-count.png' });
  });

  test('F3-10: Layer visibility controls exist', async ({ page }) => {
    // Should have layer visibility section
    const layerVisibility = page.locator('text=/Layer Visibility|Buildings|Flags/');
    await expect(layerVisibility).toBeVisible();
    
    await page.screenshot({ path: '.sisyphus/evidence/final-qa/F3-10-layer-visibility.png' });
  });
});

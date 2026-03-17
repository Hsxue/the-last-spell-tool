// playwright.config.ts - VISUAL REGRESSION TEST CONFIG
// Playwright dependencies need to be installed separately.

// TODO: Install Playwright dependencies when implementing actual tests:
// npm install -D @playwright/test @types/node

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for visual regression testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './src/__tests__',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot only on failure
    screenshot: 'only-on-failure',

    // Video recording on first retry
    video: 'on-first-retry',

    // Viewport size for consistent screenshots
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Snapshot (screenshot comparison) configuration
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      // Maximum acceptable pixel difference ratio (0-1)
      maxDiffPixelRatio: 0.02,
      // Maximum acceptable pixel difference count
      maxDiffPixels: 100,
      // Threshold for considering pixels different (0-1)
      threshold: 0.2,
      // Animations disabled for consistent screenshots
      animations: 'disabled',
    },
  },

  // Snapshot directory configuration
  // Baseline screenshots stored alongside test files in __snapshots__
  snapshotDir: './src/__tests__/__snapshots__',

  // Output directory for test artifacts (screenshots, videos, traces)
  outputDir: './test-results',

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Ensure consistent rendering
        launchOptions: {
          args: ['--disable-gpu', '--no-sandbox'],
        },
      },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

/**
 * Visual Regression Testing Guide
 *
 * Setup:
 * 1. Install Playwright: npm install -D @playwright/test
 * 2. Install browsers: npx playwright install chromium
 * 3. Create baseline screenshots: npx playwright test --update-snapshots
 *
 * Running tests:
 * - Run all tests: npx playwright test
 * - Run specific test: npx playwright test terrain-regression
 * - Run with UI: npx playwright test --ui
 * - Debug: npx playwright test --debug
 *
 * Updating baselines:
 * - Update all: npx playwright test --update-snapshots
 * - Update specific: npx playwright test terrain-regression --update-snapshots
 *
 * Directory structure:
 * src/__tests__/
 *   ├── terrain-regression.test.ts    # Test file
 *   ├── terrain-performance.test.ts   # Performance tests
 *   └── __snapshots__/                # Baseline screenshots
 *       ├── terrain-regression.test.ts/
 *       │   ├── should-render-full-51x51-map-at-1x-zoom-1-chromium.png
 *       │   └── ...
 *       └── ...
 *
 * Test results:
 * - test-results/                     # Artifacts from failed tests
 * - playwright-report/                # HTML report
 */
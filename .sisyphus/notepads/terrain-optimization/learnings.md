

## Visual Regression Test Scaffolding

### Files Created/Updated

1. **New Test File**: `src/__tests__/terrain-regression.test.ts`
   - Comprehensive visual regression test scaffolding
   - 14 placeholder tests covering key scenarios
   - All tests use `{ skip: true }` until Playwright is installed

2. **Updated Config**: `playwright.config.ts`
   - Full Playwright configuration with screenshot comparison settings
   - Snapshot directory: `./src/__tests__/__snapshots__`
   - Output directory: `./test-results`
   - Optimized for Chromium with consistent rendering flags

### Test Coverage

The scaffolding includes tests for:

**Full Map Views** (2 tests):
- Full 51x51 map at 1x zoom
- Color consistency validation

**Zoomed Views** (3 tests):
- 2x zoom (zoomed in)
- 0.5x zoom (zoomed out)
- Zoom transition consistency

**Corner Views** (5 tests):
- All 4 corners at 1x zoom
- Corner views at 2x zoom

**Mixed Terrain Scenarios** (3 tests):
- Multiple terrain types in view
- Terrain transition boundaries
- Layered rendering (terrain + buildings + flags)

**Viewport and Culling** (2 tests):
- Rapid viewport change stability
- Culling consistency verification

**Grid Layer Interaction** (2 tests):
- Grid overlay at 1x and 2x zoom

### Test Configuration Constants

```typescript
const TEST_CONFIG = {
  MAP_SIZE: 51,
  TILE_SIZE: 20,
  VIEWPORT: { width: 1280, height: 720 },
  SNAPSHOT_OPTIONS: {
    maxDiffPixels: 100,
    threshold: 0.2,
  },
  ZOOM_LEVELS: { default: 1, zoomedIn: 2, zoomedOut: 0.5 },
  CORNERS: {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 50, y: 0 },
    bottomLeft: { x: 0, y: 50 },
    bottomRight: { x: 50, y: 50 },
  },
};
```

### Next Steps for Implementation

1. Install Playwright: `npm install -D @playwright/test`
2. Install browsers: `npx playwright install chromium`
3. Create baseline screenshots: `npx playwright test --update-snapshots`
4. Remove `{ skip: true }` from tests incrementally
5. Run tests: `npx playwright test src/__tests__/terrain-regression.test.ts`

### Baseline Naming Convention

Baseline screenshots follow Playwright's auto-generated naming:
- Format: `{test-name}-{snapshot-index}-{project}.png`
- Examples:
  - `should-render-full-51x51-map-at-1x-zoom-1-chromium.png`
  - `terrain-corner-top-left-1-chromium.png`
  - `terrain-mixed-types-1-chromium.png`

### Screenshot Comparison Settings

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.02,  // 2% pixel difference allowed
    maxDiffPixels: 100,        // Max 100 pixels can differ
    threshold: 0.2,            // Color threshold for diff detection
    animations: 'disabled',    // Disable animations for consistency
  },
}
```

### Notes

- Tests are intentionally skipped to prevent failures before Playwright installation
- Each test includes detailed TODO comments with implementation steps
- Scaffolding follows existing test patterns from `terrain-performance.test.ts`
- Configuration supports CI integration with appropriate retry and worker settings

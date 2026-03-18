# Terrain Rendering Optimization with Konva Best Practices

## TL;DR

> **Quick Summary**: Optimize terrain rendering in WebDev2 by implementing viewport-based culling and cache strategy improvements using Konva best practices. Target: 10-20x performance improvement for large maps.
> 
> **Deliverables**:
> - Viewport culling implementation in TerrainLayer.tsx
> - Optimized cache strategy with dirty-rectangle approach
> - Performance monitoring hooks
> - Comprehensive test suite for rendering performance
> - Layer configuration improvements (imageSmoothingEnabled, pixelRatio)
> 
> **Estimated Effort**: Medium (4-6 hours implementation + testing)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 3 → Task 5 → Task 7

---

## Context

### Original Request
调研 konva 绘制 tilemap 的最佳实践，并使用该方式优化@WebDev2/中的地形渲染逻辑

### Interview Summary
**Key Discussions**:
- Project uses React 19 + react-konva 19.2.3 + Konva 10.2.1
- Current map size: 51x51 tiles (2601 max tiles)
- Tile size: 20px
- Two-layer architecture: static terrain + dynamic terrain (pending changes)

**Research Findings**:
- Konva best practices identified: batchDraw(), cache(), viewport culling, imageSmoothingEnabled=false
- Current implementation already has some optimizations (perfectDrawEnabled, listening=false)
- Main bottleneck: renders ALL tiles even when off-screen

### Metis Review
**Identified Gaps** (addressed):
- Performance metrics defined: <16ms frame time, <100ms initial render
- Guardrails set: preserve visual output, no store structure changes
- Scope boundaries: terrain rendering only, no unit/UI changes
- Edge cases covered: viewport boundaries, rapid changes, HiDPI displays

---

## Work Objectives

### Core Objective
Implement viewport-based culling and cache optimization for terrain rendering to achieve 60fps during terrain updates and reduce unnecessary rendering of off-screen tiles.

### Concrete Deliverables
- `.sisyphus/plans/terrain-optimization.md` - This work plan
- `src/components/canvas/TerrainLayer.tsx` - Optimized terrain rendering with viewport culling
- `src/components/canvas/MapCanvas.tsx` - Layer configuration improvements
- `src/__tests__/terrain-performance.test.ts` - Performance test suite
- Performance evidence files in `.sisyphus/evidence/`

### Definition of Done
- [ ] All terrain tiles render correctly with no visual regression
- [ ] Viewport culling reduces rendered tiles by >80% when zoomed in
- [ ] Frame time <16ms during terrain updates (60fps)
- [ ] Initial 51x51 map renders in <100ms
- [ ] All performance tests pass
- [ ] No memory leaks or GC spikes

### Must Have
- Viewport-based tile culling with 2-tile safety margin
- Conservative culling logic (never hide visible tiles)
- Throttled cache updates (100ms interval maintained)
- All existing functionality preserved (undo/redo, brush painting)
- TypeScript types maintained

### Must NOT Have (Guardrails)
- NO changes to map data structure or store API
- NO zoom level implementation (out of scope)
- NO unit rendering optimization (separate concern)
- NO tile animations or visual effects
- NO raw Konva migration (stay with react-konva)
- NO level-of-detail (LOD) system
- NO texture atlasing

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vite + Vitest expected)
- **Automated tests**: YES (Tests-after) - Performance tests added after implementation
- **Framework**: Vitest (via Vite config)
- **Agent-Executed QA**: ALWAYS mandatory for all tasks

### QA Policy
Every task MUST include agent-executed QA scenarios:
- **Frontend/Canvas**: Use Playwright to capture canvas rendering, verify tile visibility
- **Performance**: Use Bash to run vitest with performance benchmarks
- **Visual**: Use Playwright screenshot comparison for regression detection

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Foundation + Monitoring):
├── Task 1: Add performance monitoring hooks [quick]
├── Task 2: Configure layer optimizations [quick]
├── Task 3: Create viewport culling utility functions [quick]
└── Task 4: Write performance test scaffolding [quick]

Wave 2 (After Wave 1 - Core Implementation):
├── Task 5: Implement viewport culling in TerrainLayer [deep]
├── Task 6: Optimize cache strategy with dirty-rectangles [unspecified-high]
└── Task 7: Integrate batchDraw() for batch updates [quick]

Wave 3 (After Wave 2 - Verification + Polish):
├── Task 8: Edge case handling (boundaries, rapid changes) [unspecified-high]
├── Task 9: Visual regression testing [visual-engineering]
└── Task 10: Documentation and cleanup [quick]

Wave FINAL (After ALL tasks - 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA with Playwright (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 3 → Task 5 → Task 7 → Task 9 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 5, 9 |
| 2 | — | 5 |
| 3 | — | 5 |
| 4 | — | 9 |
| 5 | 1, 2, 3 | 7, 8, 9 |
| 6 | 5 | 8 |
| 7 | 5 | 8 |
| 8 | 5, 6, 7 | 9 |
| 9 | 1, 4, 8 | F1-F4 |
| 10 | 9 | — |
| F1-F4 | All tasks | — |

### Agent Dispatch Summary

- **Wave 1**: **4 tasks** — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: **3 tasks** — T5 → `deep`, T6 → `unspecified-high`, T7 → `quick`
- **Wave 3**: **3 tasks** — T8 → `unspecified-high`, T9 → `visual-engineering`, T10 → `quick`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Add Performance Monitoring Hooks

  **What to do**:
  - Add FPS counter overlay component for development
  - Add render time tracking using Konva's `onDraw` events
  - Add memory usage monitoring (performance.memory API)
  - Create `src/lib/performanceMonitor.ts` utility module
  - Export metrics to console for profiling

  **Must NOT do**:
  - Do NOT add permanent UI elements (dev-only)
  - Do NOT change production behavior
  - Do NOT add external dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Straightforward instrumentation code, no complex logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 9 (need monitoring for validation)
  - **Blocked By**: None

  **References**:
  - `src/components/canvas/MapCanvas.tsx` - Stage configuration point
  - Konva docs: https://konvajs.org/docs/performance/Performance_Monitoring.html
  - `src/lib/` - Directory for utility modules

  **Acceptance Criteria**:
  - [ ] `src/lib/performanceMonitor.ts` created with FPS, render time, memory exports
  - [ ] FPS counter visible in dev mode (toggle with key)
  - [ ] Console logs render time per frame
  - [ ] No production code changes

  **QA Scenarios**:

  ```
  Scenario: FPS counter displays correctly
    Tool: Playwright
    Preconditions: App running in dev mode
    Steps:
      1. Navigate to http://localhost:5173
      2. Press 'P' key to toggle performance monitor
      3. Wait 2 seconds for FPS stabilization
      4. Screenshot the FPS overlay
    Expected Result: FPS counter visible showing numeric value >30
    Failure Indicators: No overlay appears, FPS shows 0 or NaN
    Evidence: .sisyphus/evidence/task-1-fps-display.png

  Scenario: Render time logged to console
    Tool: Playwright + browser console
    Preconditions: App running
    Steps:
      1. Open browser console
      2. Clear console
      3. Pan the viewport slowly
      4. Capture console output for 5 seconds
    Expected Result: Console contains "Render time: X ms" messages
    Failure Indicators: No render time logs, or logs show >100ms consistently
    Evidence: .sisyphus/evidence/task-1-render-log.txt
  ```

  **Commit**: YES (groups with 2, 3, 4)
  - Message: `perf(terrain): add performance monitoring hooks for optimization profiling`
  - Files: `src/lib/performanceMonitor.ts`, `src/components/canvas/MapCanvas.tsx`
  - Pre-commit: `npm run lint`

---

- [x] 2. Configure Layer Optimizations

  **What to do**:
  - Set `imageSmoothingEnabled: false` on all Konva layers (pixel art sharpness)
  - Set `Konva.pixelRatio = 1` to avoid over-rendering on HiDPI displays
  - Ensure `batchDraw()` is used instead of `draw()` where applicable
  - Add `transformsEnabled: 'position'` to Rect components if only position changes

  **Must NOT do**:
  - Do NOT change visual appearance beyond anti-aliasing
  - Do NOT modify tile rendering logic
  - Do NOT add new components

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Configuration changes only, straightforward Konva setup

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 5 (needs layer config)
  - **Blocked By**: None

  **References**:
  - `src/components/canvas/MapCanvas.tsx:96-105` - Stage configuration
  - `src/components/canvas/TerrainLayer.tsx:108-115` - Layer component
  - Konva docs: https://konvajs.org/docs/performance/High_Performance_Settings.html

  **Acceptance Criteria**:
  - [ ] `imageSmoothingEnabled: false` set on all layers
  - [ ] `Konva.pixelRatio = 1` set at app initialization
  - [ ] Tile edges remain sharp at all zoom levels (no blur)
  - [ ] No visual regression in tile appearance

  **QA Scenarios**:

  ```
  Scenario: Tiles render with sharp edges (no anti-aliasing)
    Tool: Playwright
    Preconditions: App running with terrain tiles
    Steps:
      1. Navigate to map with terrain tiles
      2. Zoom to 2x (maximum zoom)
      3. Take screenshot of tile edges at 400% browser zoom
      4. Compare with baseline (pre-optimization) at same zoom
    Expected Result: Tile edges are pixel-perfect sharp, no blur/anti-aliasing
    Failure Indicators: Blurry edges, gray pixels at tile boundaries
    Evidence: .sisyphus/evidence/task-2-sharp-edges-zoom.png

  Scenario: HiDPI display renders at 1x pixel ratio
    Tool: Playwright
    Preconditions: Browser with devicePixelRatio > 1 (or emulated)
    Steps:
      1. Set devicePixelRatio to 2 via Playwright emulation
      2. Load the map
      3. Capture canvas pixel dimensions
      4. Compare with CSS dimensions
    Expected Result: Canvas pixel dimensions = CSS dimensions (1:1 ratio)
    Failure Indicators: Canvas pixels = 2x CSS dimensions (indicates 2x rendering)
    Evidence: .sisyphus/evidence/task-2-pixel-ratio.png
  ```

  **Commit**: YES (groups with 1, 3, 4)
  - Message: `perf(terrain): configure Konva layers for pixel-perfect rendering`
  - Files: `src/components/canvas/MapCanvas.tsx`, `src/main.tsx`
  - Pre-commit: `npm run lint`

---

- [x] 3. Create Viewport Culling Utility Functions

  **What to do**:
  - Create `src/lib/viewportCulling.ts` with utility functions
  - Implement `getVisibleTileRange()` function:
    - Input: viewport (offsetX, offsetY, zoom), map dimensions, tile size
    - Output: `{ minX, maxX, minY, maxY }` with safety margin
  - Implement `isTileVisible()` function:
    - Input: tile position, visible range
    - Output: boolean
  - Implement `getVisibleTileKeys()` function:
    - Input: terrain Map, visible range
    - Output: Array of position keys to render
  - Add comprehensive unit tests for culling logic

  **Must NOT do**:
  - Do NOT modify TerrainLayer component yet (separate task)
  - Do NOT use React-specific code (keep utilities pure)
  - Do NOT hardcode tile size (accept as parameter)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Pure utility functions with clear math logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 5 (needs utilities)
  - **Blocked By**: None

  **References**:
  - `src/components/canvas/MapCanvas.tsx:147-155` - Viewport coordinate calculation
  - `src/types/map.ts:207-216` - ViewportState interface
  - `src/components/canvas/TerrainLayer.tsx:74-96` - Current brush position logic (similar iteration pattern)

  **Acceptance Criteria**:
  - [ ] `src/lib/viewportCulling.ts` created with all 3 functions
  - [ ] Unit tests cover: normal viewport, edge cases, zoom levels
  - [ ] Functions are pure (no side effects)
  - [ ] TypeScript types defined for all interfaces

  **QA Scenarios**:

  ```
  Scenario: getVisibleTileRange returns correct bounds at 1x zoom
    Tool: Bash (vitest)
    Preconditions: Utility functions implemented
    Steps:
      1. Run: npx vitest run src/lib/viewportCulling.test.ts
      2. Verify test: "calculates visible range at 1x zoom"
    Expected Result: Test passes, returns correct tile range for given viewport
    Failure Indicators: Test fails, range calculation off by >1 tile
    Evidence: .sisyphus/evidence/task-3-vitest-output.txt

  Scenario: getVisibleTileRange handles viewport at map edges
    Tool: Bash (vitest)
    Preconditions: Utility functions implemented
    Steps:
      1. Run: npx vitest run src/lib/viewportCulling.test.ts -t "edge cases"
      2. Verify tests for all 4 corners + edges
    Expected Result: All edge case tests pass, ranges clamped to map bounds
    Failure Indicators: Returns negative indices or indices > map dimensions
    Evidence: .sisyphus/evidence/task-3-edge-cases.txt
  ```

  **Commit**: YES (groups with 1, 2, 4)
  - Message: `perf(terrain): add viewport culling utility functions with tests`
  - Files: `src/lib/viewportCulling.ts`, `src/lib/viewportCulling.test.ts`
  - Pre-commit: `npx vitest run src/lib/viewportCulling.test.ts`

---

- [x] 4. Write Performance Test Scaffolding

  **What to do**:
  - Create `src/__tests__/terrain-performance.test.ts`
  - Implement test structure for:
    - Initial render time benchmark
    - Frame time during updates
    - Tile count reduction from culling
    - Memory usage stability
  - Add Playwright visual regression test setup
  - Configure vitest for performance benchmarks

  **Must NOT do**:
  - Do NOT implement actual tests yet (just scaffolding)
  - Do NOT add external benchmark libraries
  - Do NOT change CI configuration

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Test setup code, standard patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 9 (needs test structure)
  - **Blocked By**: None

  **References**:
  - Check for existing `src/__tests__/` or `*.test.ts` files in project
  - `vite.config.ts` - Test configuration if exists
  - Vitest docs: https://vitest.dev/guide/benchmark.html

  **Acceptance Criteria**:
  - [ ] Test file created with describe blocks for all metrics
  - [ ] Placeholder tests that pass (skip: true)
  - [ ] vitest can run the test file without errors
  - [ ] Playwright test configuration in place

  **QA Scenarios**:

  ```
  Scenario: Vitest can run performance test file
    Tool: Bash
    Preconditions: Test scaffolding created
    Steps:
      1. Run: npx vitest run src/__tests__/terrain-performance.test.ts --reporter=verbose
      2. Check exit code is 0
    Expected Result: Test file runs, shows skipped tests, exits 0
    Failure Indicators: Syntax errors, missing imports, vitest crashes
    Evidence: .sisyphus/evidence/task-4-vitest-run.txt

  Scenario: Playwright can launch for visual tests
    Tool: Bash + Playwright
    Preconditions: Playwright configured
    Steps:
      1. Run: npx playwright test --list
      2. Verify test list includes terrain tests
    Expected Result: Playwright lists tests without errors
    Failure Indicators: Playwright not configured, missing browsers
    Evidence: .sisyphus/evidence/task-4-playwright-list.txt
  ```

  **Commit**: YES (groups with 1, 2, 3)
  - Message: `test(terrain): add performance test scaffolding`
  - Files: `src/__tests__/terrain-performance.test.ts`, `playwright.config.ts` (if needed)
  - Pre-commit: `npx vitest run src/__tests__/terrain-performance.test.ts`

---

- [x] 5. Implement Viewport Culling in TerrainLayer

  **What to do**:
  - Import culling utilities from Task 3
  - Modify `terrainElements` useMemo to filter by visible range
  - Modify `pendingElements` useMemo to filter by visible range
  - Add 2-tile safety margin beyond visible area
  - Update useEffect cache triggers to use visible tiles only
  - Ensure terrain color and appearance unchanged

  **Must NOT do**:
  - Do NOT change terrain data structure
  - Do NOT modify brush painting logic
  - Do NOT change the two-layer architecture
  - Do NOT remove existing optimizations (perfectDrawEnabled, etc.)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`
  - **Reason**: Core rendering logic modification, requires understanding React + Konva interaction

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 1, 2, 3)
  - **Parallel Group**: Wave 2 start
  - **Blocks**: Tasks 6, 7, 8, 9
  - **Blocked By**: Tasks 1, 2, 3 (utilities and config)

  **References**:
  - `src/components/canvas/TerrainLayer.tsx:249-267` - terrainElements useMemo
  - `src/components/canvas/TerrainLayer.tsx:219-245` - pendingElements useMemo
  - `src/lib/viewportCulling.ts` (Task 3 output) - Culling utilities
  - `src/components/canvas/MapCanvas.tsx:44-58` - Viewport state source

  **Acceptance Criteria**:
  - [ ] Only visible tiles + 2-tile margin are rendered
  - [ ] Tile count logged to console (before/after culling)
  - [ ] No visual regression (all terrain appears correctly)
  - [ ] Pan to map edges shows correct tiles (no missing tiles at boundaries)
  - [ ] Zoom changes trigger culling recalculation

  **QA Scenarios**:

  ```
  Scenario: Only visible tiles rendered at 1x zoom
    Tool: Playwright + console capture
    Preconditions: Map with 51x51 terrain (2601 tiles), culling implemented
    Steps:
      1. Enable performance monitor (Task 1)
      2. Navigate to map center at 1x zoom
      3. Capture console log showing rendered tile count
      4. Expected visible: ~40x40 = 1600 tiles (at typical viewport)
    Expected Result: Rendered tile count matches expected visible area + margin
    Failure Indicators: All 2601 tiles rendered, or <expected-2 tiles rendered
    Evidence: .sisyphus/evidence/task-5-tile-count-1x.txt

  Scenario: Culling works correctly at max zoom (2x)
    Tool: Playwright
    Preconditions: Map with terrain, culling implemented
    Steps:
      1. Zoom to maximum (2x) using mouse wheel
      2. Capture rendered tile count from console
      3. Expected visible: ~20x20 = 400 tiles at 2x zoom
      4. Pan around and verify count stays appropriate
    Expected Result: ~400-500 tiles rendered (with margin), correct tiles visible
    Failure Indicators: Still rendering 2000+ tiles, or visible tiles missing
    Evidence: .sisyphus/evidence/task-5-tile-count-2x.png

  Scenario: No tiles missing at viewport edge
    Tool: Playwright
    Preconditions: Map with varied terrain (all 3 types visible)
    Steps:
      1. Pan to position where viewport edge cuts through terrain
      2. Take screenshot of viewport edge
      3. Verify terrain continues to edge without gaps
      4. Pan slightly and verify no pop-in of tiles
    Expected Result: Terrain visible to exact edge, no sudden appearances
    Failure Indicators: Gap at edge, tiles suddenly appearing when panning
    Evidence: .sisyphus/evidence/task-5-edge-continuity.png
  ```

  **Commit**: YES (standalone - core change)
  - Message: `perf(terrain): implement viewport culling in TerrainLayer component`
  - Files: `src/components/canvas/TerrainLayer.tsx`
  - Pre-commit: `npx vitest run src/lib/viewportCulling.test.ts && npm run lint`

---

- [x] 6. Optimize Cache Strategy with Dirty-Rectangles

  **What to do**:
  - Track which tiles have changed (dirty tiles)
  - Only invalidate cache for changed regions
  - Implement `clearCache(region?)` pattern if Konva supports
  - OR: Use multiple smaller cached groups by region
  - Maintain throttling from current implementation (100ms)
  - Document cache strategy trade-offs

  **Must NOT do**:
  - Do NOT remove caching entirely
  - Do NOT cache individual tiles (too many objects)
  - Do NOT change the two-layer architecture
  - Do NOT break existing throttle logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`
  - **Reason**: Complex optimization, requires experimentation and benchmarking

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 5)
  - **Parallel Group**: Wave 2 (after Task 5)
  - **Blocks**: Task 8
  - **Blocked By**: Task 5 (culling must be in place)

  **References**:
  - `src/components/canvas/TerrainLayer.tsx:269-308` - Current cache useEffect hooks
  - Konva cache docs: https://konvajs.org/docs/performance/Cache_Memory.html
  - `src/store/mapStore.ts` - Source of terrain changes

  **Acceptance Criteria**:
  - [ ] Cache rebuild time reduced by >50% (measure with Task 1 monitoring)
  - [ ] No visual artifacts from partial cache updates
  - [ ] Throttling still functional (100ms interval)
  - [ ] Memory usage stable (no accumulation)

  **QA Scenarios**:

  ```
  Scenario: Cache rebuild time <50ms for single tile change
    Tool: Playwright + performance monitor
    Preconditions: Performance monitoring enabled, map loaded
    Steps:
      1. Select terrain brush
      2. Click to change single tile
      3. Capture render time from console
      4. Repeat 10 times and calculate average
    Expected Result: Average cache rebuild time <50ms
    Failure Indicators: Average >100ms, or console shows full cache rebuild
    Evidence: .sisyphus/evidence/task-6-cache-time.txt

  Scenario: Multiple rapid changes handled correctly
    Tool: Playwright
    Preconditions: Map loaded, brush size = 3
    Steps:
      1. Rapidly paint 10 strokes in different areas
      2. Wait for all cache updates to complete
      3. Verify all tiles show correct final state
      4. Check no cache corruption (no missing tiles)
    Expected Result: All tiles correct, no visual artifacts
    Failure Indicators: Missing tiles, wrong colors, cache corruption
    Evidence: .sisyphus/evidence/task-6-rapid-changes.png
  ```

  **Commit**: YES (standalone - optimization)
  - Message: `perf(terrain): optimize cache strategy with dirty-rectangle invalidation`
  - Files: `src/components/canvas/TerrainLayer.tsx`
  - Pre-commit: `npm run build` (verify no build errors)

---

- [x] 7. Integrate batchDraw() for Batch Updates

  **What to do**:
  - Review all `layer.draw()` calls, replace with `batchDraw()`
  - Ensure `batchDraw()` called after multiple tile updates
  - Verify React render cycle doesn't conflict with Konva batch timing
  - Add `requestAnimationFrame` wrapper if needed for timing
  - Test with rapid updates to verify no dropped frames

  **Must NOT do**:
  - Do NOT use `batchDraw()` where immediate draw is required
  - Do NOT change React state update patterns
  - Do NOT add manual frame scheduling unless necessary

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Standard Konva pattern, straightforward replacement

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 5)
  - **Parallel Group**: Wave 2 (after Task 5)
  - **Blocks**: Task 8
  - **Blocked By**: Task 5 (needs culling in place)

  **References**:
  - `src/components/canvas/TerrainLayer.tsx:188-194` - handleMouseUp cache update
  - `src/components/canvas/TerrainLayer.tsx:276-280` - Static layer cache update
  - `src/components/canvas/TerrainLayer.tsx:295-307` - Dynamic layer cache update
  - Konva batchDraw docs: https://konvajs.org/docs/performance/Batch_Draw.html

  **Acceptance Criteria**:
  - [ ] All `draw()` calls replaced with `batchDraw()` where appropriate
  - [ ] No visual lag during rapid terrain painting
  - [ ] Frame timing stable (no spikes >33ms)
  - [ ] All tiles render correctly (no missing updates)

  **QA Scenarios**:

  ```
  Scenario: Frame time stable during continuous painting
    Tool: Playwright + performance monitor
    Preconditions: Performance monitoring enabled, map loaded
    Steps:
      1. Start performance recording
      2. Click and drag to paint continuously for 5 seconds
      3. Stop recording
      4. Analyze frame times: count frames >33ms (30fps threshold)
    Expected Result: <5% of frames exceed 33ms
    Failure Indicators: >20% frames >33ms, visible stuttering
    Evidence: .sisyphus/evidence/task-7-frame-times.txt

  Scenario: All tiles update correctly with batchDraw
    Tool: Playwright
    Preconditions: Map loaded, brush size = 3
    Steps:
      1. Paint a pattern (e.g., 3x3 square)
      2. Wait 500ms for all batch updates
      3. Screenshot the result
      4. Verify all tiles in pattern show correct color
    Expected Result: All painted tiles correct, no missing updates
    Failure Indicators: Some tiles not updated, stale colors visible
    Evidence: .sisyphus/evidence/task-7-batch-result.png
  ```

  **Commit**: YES (standalone)
  - Message: `perf(terrain): integrate batchDraw() for efficient batch updates`
  - Files: `src/components/canvas/TerrainLayer.tsx`
  - Pre-commit: `npm run lint`

---

- [x] 8. Edge Case Handling (Boundaries, Rapid Changes)

  **What to do**:
  - Test and fix culling at all 4 map corners
  - Test and fix culling at map edges (not just corners)
  - Handle rapid viewport changes (pan back-and-forth)
  - Handle viewport resize during rendering
  - Handle minimum/maximum zoom levels
  - Add hysteresis to prevent cache thrashing

  **Must NOT do**:
  - Do NOT change core culling logic (only edge case handling)
  - Do NOT add new configuration options
  - Do NOT modify non-edge-case behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`
  - **Reason**: Edge case handling requires thorough testing and careful fixes

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 5, 6, 7)
  - **Parallel Group**: Wave 3 start
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 5, 6, 7 (core implementation)

  **References**:
  - `src/lib/viewportCulling.ts` (Task 3) - Culling logic to verify
  - `src/components/canvas/TerrainLayer.tsx` - Integration point
  - Metis analysis edge cases section

  **Acceptance Criteria**:
  - [ ] All 4 corner tests pass (no missing tiles, no out-of-bounds)
  - [ ] All 4 edge tests pass (top, bottom, left, right)
  - [ ] Rapid pan test passes (no crashes, no visual corruption)
  - [ ] Zoom level tests pass (min 0.25x, max 2x)

  **QA Scenarios**:

  ```
  Scenario: Viewport at top-left corner renders correctly
    Tool: Playwright
    Preconditions: Map loaded with terrain
    Steps:
      1. Pan to top-left corner (0, 0)
      2. Verify all visible tiles render
      3. Check console for errors
      4. Screenshot corner area
    Expected Result: All tiles visible, no errors, correct terrain colors
    Failure Indicators: Missing tiles, console errors, wrong colors
    Evidence: .sisyphus/evidence/task-8-corner-tl.png

  Scenario: Rapid pan back-and-forth doesn't crash
    Tool: Playwright
    Preconditions: Map loaded
    Steps:
      1. Pan left rapidly 10 times
      2. Pan right rapidly 10 times
      3. Repeat 5 cycles
      4. Verify app still responsive, no crashes
    Expected Result: App stable, tiles render correctly throughout
    Failure Indicators: Crash, freeze, tiles not updating
    Evidence: .sisyphus/evidence/task-8-rapid-pan.png

  Scenario: Zoom levels render correctly at extremes
    Tool: Playwright
    Preconditions: Map loaded with terrain
    Steps:
      1. Zoom to minimum (0.25x)
      2. Screenshot and verify tiles visible
      3. Zoom to maximum (2x)
      4. Screenshot and verify tiles sharp
    Expected Result: Tiles visible at min zoom, sharp at max zoom
    Failure Indicators: No tiles at min zoom, blurry at max zoom
    Evidence: .sisyphus/evidence/task-8-zoom-extremes.png
  ```

  **Commit**: YES (standalone)
  - Message: `fix(terrain): handle edge cases for viewport culling (boundaries, rapid changes)`
  - Files: `src/components/canvas/TerrainLayer.tsx`, `src/lib/viewportCulling.ts`
  - Pre-commit: `npx vitest run src/lib/viewportCulling.test.ts`

---

- [x] 9. Visual Regression Testing

  **What to do**:
  - Set up Playwright screenshot comparison tests
  - Create baseline screenshots for key scenarios:
    - Full map at 1x zoom
    - Zoomed in view (2x)
    - Map corner views
    - Mixed terrain areas
  - Implement automated regression check
  - Run regression tests and verify no visual changes

  **Must NOT do**:
  - Do NOT change visual appearance (baseline must match)
  - Do NOT skip failing tests (fix rendering instead)
  - Do NOT modify baseline unless bug fix confirmed

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`
  - **Reason**: Visual testing requires screenshot capture and comparison

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 1, 4, 8)
  - **Parallel Group**: Wave 3 (after Task 8)
  - **Blocks**: Final verification wave
  - **Blocked By**: Tasks 1, 4, 8 (monitoring, tests, edge cases)

  **References**:
  - `src/__tests__/terrain-performance.test.ts` (Task 4) - Test structure
  - Playwright screenshot docs: https://playwright.dev/docs/screenshots
  - Playwright visual regression: https://playwright.dev/docs/test-snapshots

  **Acceptance Criteria**:
  - [ ] Baseline screenshots captured for all scenarios
  - [ ] Regression tests run and pass
  - [ ] Any differences documented and justified
  - [ ] No unexplained visual changes

  **QA Scenarios**:

  ```
  Scenario: Full map visual regression test
    Tool: Playwright
    Preconditions: Baseline screenshots exist
    Steps:
      1. Run: npx playwright test terrain-regression --grep "full map"
      2. Compare current screenshot with baseline
      3. Verify pixel match >99.9%
    Expected Result: Test passes, no visual differences
    Failure Indicators: Test fails, >0.1% pixel difference
    Evidence: .sisyphus/evidence/task-9-regression-fullmap-diff.png (if any)

  Scenario: Zoomed view visual regression test
    Tool: Playwright
    Preconditions: Baseline screenshots exist
    Steps:
      1. Run: npx playwright test terrain-regression --grep "zoomed"
      2. Verify tiles at 2x zoom match baseline
    Expected Result: Test passes, tiles sharp and correctly positioned
    Failure Indicators: Tile misalignment, color changes
    Evidence: .sisyphus/evidence/task-9-regression-zoomed-diff.png (if any)
  ```

  **Commit**: YES (standalone)
  - Message: `test(terrain): add visual regression tests with Playwright`
  - Files: `src/__tests__/terrain-regression.test.ts`, `tests/__snapshots__/`
  - Pre-commit: `npx playwright test terrain-regression`

---

- [x] 10. Documentation and Cleanup

  **What to do**:
  - Add JSDoc comments to all new utility functions
  - Document culling algorithm in comments
  - Update README.md with performance notes
  - Remove temporary debug code (console.logs not needed in prod)
  - Remove feature flags if any added
  - Create performance optimization summary

  **Must NOT do**:
  - Do NOT add external documentation files
  - Do NOT leave debug code in production
  - Do NOT change functional code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Documentation and cleanup, straightforward

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 9)
  - **Parallel Group**: Wave 3 end
  - **Blocks**: Final verification wave
  - **Blocked By**: Task 9 (regression tests)

  **References**:
  - All modified source files
  - `README.md` - Project documentation
  - AGENTS.md - Code style guide

  **Acceptance Criteria**:
  - [ ] All new functions have JSDoc with @param and @returns
  - [ ] Culling algorithm has high-level comment explaining approach
  - [ ] No console.log except in performance monitor (dev-only)
  - [ ] README.md updated with performance improvements
  - [ ] TypeScript strict mode passes (no errors)

  **QA Scenarios**:

  ```
  Scenario: TypeScript compilation succeeds
    Tool: Bash
    Preconditions: All code changes complete
    Steps:
      1. Run: npx tsc --noEmit
      2. Verify exit code 0
    Expected Result: No TypeScript errors
    Failure Indicators: Type errors, missing types
    Evidence: .sisyphus/evidence/task-10-tsc-output.txt

  Scenario: JSDoc present on all exports
    Tool: Bash + eslint
    Preconditions: Code complete
    Steps:
      1. Run: npm run lint
      2. Verify no JSDoc warnings
    Expected Result: No JSDoc warnings
    Failure Indicators: Missing documentation warnings
    Evidence: .sisyphus/evidence/task-10-lint-output.txt
  ```

  **Commit**: YES (standalone)
  - Message: `docs(terrain): add documentation and cleanup for optimization`
  - Files: `src/lib/viewportCulling.ts`, `src/components/canvas/TerrainLayer.tsx`, `README.md`
  - Pre-commit: `npm run lint && npx tsc --noEmit`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1 (Tasks 1-4)**: `perf(terrain): add foundation for viewport culling optimization`
  - Files: `src/lib/performanceMonitor.ts`, `src/lib/viewportCulling.ts`, `src/components/canvas/MapCanvas.tsx`, `src/__tests__/terrain-performance.test.ts`
  - Pre-commit: `npm run lint && npx vitest run src/lib/viewportCulling.test.ts`

- **Wave 2 (Tasks 5-7)**: `perf(terrain): implement viewport culling and batch rendering`
  - Files: `src/components/canvas/TerrainLayer.tsx`
  - Pre-commit: `npm run build && npm run lint`

- **Wave 3 (Tasks 8-10)**: `perf(terrain): edge cases, regression tests, and documentation`
  - Files: `src/components/canvas/TerrainLayer.tsx`, `src/lib/viewportCulling.ts`, `src/__tests__/terrain-regression.test.ts`, `README.md`
  - Pre-commit: `npx playwright test terrain-regression && npm run lint && npx tsc --noEmit`

---

## Success Criteria

### Verification Commands
```bash
npx vitest run src/lib/viewportCulling.test.ts  # Expected: All tests pass
npx vitest run src/__tests__/terrain-performance.test.ts  # Expected: Performance benchmarks pass
npx playwright test terrain-regression  # Expected: No visual regressions
npm run build  # Expected: Build succeeds with no errors
npx tsc --noEmit  # Expected: No TypeScript errors
npm run lint  # Expected: No lint warnings
```

### Final Checklist
- [ ] All "Must Have" present (viewport culling, 2-tile margin, conservative logic, throttling, functionality preserved, types maintained)
- [ ] All "Must NOT Have" absent (no store changes, no zoom impl, no unit changes, no animations, no raw Konva, no LOD, no texture atlas)
- [ ] All tests pass (unit tests, performance tests, regression tests)
- [ ] Performance targets met (<16ms frame time, <100ms initial render, >80% tile reduction when zoomed)
- [ ] Evidence files captured in `.sisyphus/evidence/`
- [ ] Documentation complete (JSDoc, README updates)

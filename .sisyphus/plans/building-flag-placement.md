# Building and Flag Placement Implementation

## TL;DR

> **Quick Summary**: Implement complete building and flag placement functionality for the TileMapEditor web application, matching Python desktop version features. Load 170+ buildings from bundled JSON data, enable click-to-place with collision detection, and support all 23 flag types with visibility controls.
> 
> **Deliverables**:
> - Building blueprint loader (XML → JSON bundle)
> - Building sidebar UI with category filter and health input
> - Building placement engine with preview, collision detection, bounds validation
> - Enhanced BuildingLayer with multi-tile rendering and category markers
> - Flag sidebar UI with type selection and visibility toggles
> - Enhanced FlagLayer with zone rectangle rendering
> - Hover info display for buildings and flags
> - XML import/export for buildings and flags
> 
> **Estimated Effort**: Large (4 waves, 18 tasks + 4 verification)
> **Parallel Execution**: YES - 4 waves with max 6 concurrent tasks
> **Critical Path**: Blueprint Data → Store Mutations → Placement Logic → UI Integration → Export

---

## Context

### Original Request
Implement building and flag placement functionality for the map editor, as specified in `doc/tilemap-editor-feature-doc.md`. The Python desktop version has full building placement (170+ types, 12 categories, blueprint system) and flag placement (8 special flags + 15 zone flags).

### Interview Summary
**Key Discussions**:
- **Test Strategy**: No unit tests - Agent-Executed QA scenarios only (Playwright for UI, direct verification)
- **Building Data**: Embed as JSON bundle for fast loading (no runtime XML parsing)
- **Anchor Behavior**: OriginX/OriginY anchor point positioned at cursor
- **Bounds Handling**: Reject placement if building extends beyond map
- **Collision**: Strict collision - no building overlap allowed
- **Flag Stacking**: Multiple flags allowed per tile
- **Removal**: Remove mode button (not right-click or keyboard)

**Research Findings**:
- BuildingDefinitions.txt XML format: `<Tiles OriginX="0" OriginY="0">` with B/H/E characters
- TerrainLayer.tsx provides reference pattern for Konva rendering and mouse handling
- Store already has addBuilding/removeBuilding/addFlag/removeFlag mutations
- Types defined: Building, BuildingBlueprint, TileFlag, FLAG_CONFIG, ZONE_FLAGS

### Metis Review
**Identified Gaps** (addressed):
- **Anchor point**: Confirmed - anchor at cursor position
- **Bounds**: Confirmed - reject out-of-bounds placement
- **Collision**: Confirmed - strict no-overlap rule
- **Flag stacking**: Confirmed - stacking allowed
- **Data loading**: Confirmed - embedded JSON bundle
- **Removal**: Confirmed - remove mode button

---

## Work Objectives

### Core Objective
Build production-ready building and flag placement system matching Python desktop version functionality, integrated with existing React + Zustand + Konva architecture.

### Concrete Deliverables
1. `src/data/buildingBlueprints.ts` - Bundled building data (170+ entries)
2. `src/lib/buildingBlueprintLoader.ts` - XML to JSON conversion utility
3. `src/components/sidebar/BuildingSidebar.tsx` - Category filter, building list, health input
4. `src/components/sidebar/FlagSidebar.tsx` - Flag dropdown, visibility toggles
5. `src/lib/placementEngine.ts` - Collision detection, bounds validation, preview calculation
6. `src/components/canvas/BuildingLayer.tsx` - Full implementation (replace placeholder)
7. `src/components/canvas/FlagLayer.tsx` - Zone rectangle rendering
8. `src/lib/mapXmlExporter.ts` - XML export for buildings and flags
9. `src/components/MapStatusBar.tsx` - Enhanced hover info display

### Definition of Done
- [ ] All 170+ buildings loadable and placeable
- [ ] Category filter works correctly
- [ ] Collision detection prevents overlap
- [ ] Bounds validation rejects out-of-bounds placement
- [ ] Multi-tile buildings render correctly
- [ ] All 23 flags placeable with correct visual representation
- [ ] Zone flags render as colored rectangles
- [ ] Visibility toggles hide/show without removing from state
- [ ] Hover info displays accurate building/flag details
- [ ] XML export generates valid game-compatible format
- [ ] All QA scenarios pass (Playwright + direct verification)

### Must Have
- Strict collision detection (no overlap)
- Bounds validation (reject if extends beyond map)
- Anchor-at-cursor placement
- Remove mode button for deletion
- Category filter for buildings
- Visibility toggles for flags
- Agent-executed QA for all features

### Must NOT Have (Guardrails)
- **NO** building rotation (not in scope)
- **NO** undo/redo system (separate feature)
- **NO** search/filter beyond category dropdown
- **NO** polygon editing for zones (rectangles only)
- **NO** drag-to-place (click-to-place only)
- **NO** right-click removal (remove mode only)
- **NO** runtime XML parsing (use bundled JSON)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (Vitest scaffolding only)
- **Automated tests**: None (Agent-Executed QA only)
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios:

- **Frontend/UI**: Playwright - Navigate, click, fill forms, assert DOM, screenshot
- **Canvas/Konva**: Playwright - Canvas interaction, coordinate verification
- **Export/Import**: Bash - Run export, validate XML output
- **Data Loading**: Direct import verification

Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — Foundation + Data):
├── Task 1: Building blueprint JSON bundle [quick]
├── Task 2: Blueprint loader utility [quick]
├── Task 3: Store mutations extension [quick]
├── Task 4: Placement engine utilities [quick]
├── Task 5: Building sidebar UI component [quick]
├── Task 6: Flag sidebar UI component [quick]
└── Task 7: MapStatusBar hover info enhancement [quick]

Wave 2 (After Wave 1 — Core Placement Logic):
├── Task 8: Building placement interaction (MapCanvas) [deep]
├── Task 9: Building preview rendering (BuildingLayer) [visual-engineering]
├── Task 10: Collision detection integration [unspecified-high]
├── Task 11: Flag placement interaction (MapCanvas) [deep]
├── Task 12: Zone flag rectangle rendering (FlagLayer) [visual-engineering]
└── Task 13: Remove mode implementation [quick]

Wave 3 (After Wave 2 — Integration + Export):
├── Task 14: XML export for buildings/flags [unspecified-high]
├── Task 15: Sidebar tab integration (App.tsx) [quick]
├── Task 16: Layer visibility controls integration [quick]
├── Task 17: End-to-end placement workflow test [unspecified-high]
└── Task 18: Performance optimization (500+ buildings) [deep]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 4 → Task 8 → Task 10 → Task 14 → F1-F4 → user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Waves 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1-7 | — | 8-18 |
| 8 | 1, 3, 4, 5 | 14, 15, 17 |
| 9 | 1, 4 | 17 |
| 10 | 4, 8 | 17 |
| 11 | 3, 4, 6 | 14, 17 |
| 12 | 6 | 17 |
| 13 | 3 | 17 |
| 14 | 8, 11 | F1-F4 |
| 15 | 5, 6 | 17 |
| 16 | 6 | 17 |
| 17 | 8-16 | F1-F4 |
| 18 | 9, 12 | F1-F4 |
| F1-F4 | ALL | user okay |

### Agent Dispatch Summary

- **Wave 1 (7 tasks)**: T1-T7 → `quick` (all foundational, can run parallel)
- **Wave 2 (6 tasks)**: T8 → `deep`, T9 → `visual-engineering`, T10 → `unspecified-high`, T11 → `deep`, T12 → `visual-engineering`, T13 → `quick`
- **Wave 3 (4 tasks)**: T14 → `unspecified-high`, T15 → `quick`, T16 → `quick`, T17 → `unspecified-high`, T18 → `deep`
- **Wave FINAL (4 tasks)**: F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

### Wave 1: Foundation + Data

- [ ] 1. **Building Blueprint JSON Bundle**

  **What to do**:
  - **Pre-processing step**: Extract building data from game files ONCE, then bundle as JSON
  - Create `src/data/buildingBlueprints.ts` with extracted building data
  - Include 170+ buildings from `E:/SteamLibrary/steamapps/common/The Last Spell/export/TextAsset/BuildingDefinitions.txt`
  - Structure: `{ id, category, tiles[][], originX, originY, health? }[]`
  - Export as const `BUILDING_BLUEPRINTS`
  - Include category metadata for filtering
  - **Note**: This is a ONE-TIME data extraction task. Use the Python TileMapEditor or manually parse the XML to generate the JSON bundle.

  **Must NOT do**:
  - Runtime XML parsing (use pre-extracted JSON)
  - External file loading at runtime (bundled data only)
  - Modify this task for new buildings (data team responsibility)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Data bundling is straightforward, pattern matching from XML

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-7)
  - **Blocks**: Tasks 8, 9, 10, 17, 18
  - **Blocked By**: None

  **References**:
  - `E:/SteamLibrary/steamapps/common/The Last Spell/export/TextAsset/BuildingDefinitions.txt` - Source XML for building data extraction (209KB, 170+ buildings)
  - `doc/tilemap-editor-feature-doc.md:2.3` - Building system specification
  - `src/types/map.ts:BuildingBlueprint` - Target TypeScript interface

  **Acceptance Criteria**:
  - [ ] BUILDING_BLUEPRINTS array contains 170+ entries
  - [ ] All 12 categories represented (Wall, Trap, Tower, Seed, Building, Resource, Container, Ruins, Decor, Corrupted, Brazier, Special)
  - [ ] Each entry has: id, category, tiles[][], originX, originY
  - [ ] TypeScript compilation passes: `npx tsc --noEmit src/data/buildingBlueprints.ts`

  **QA Scenarios**:

  ```
  Scenario: Verify building count and categories
    Tool: Bash (Node.js REPL)
    Preconditions: BUILDING_BLUEPRINTS exported
    Steps:
      1. Import BUILDING_BLUEPRINTS
      2. Count total entries: BUILDING_BLUEPRINTS.length
      3. Extract unique categories: [...new Set(buildings.map(b => b.category))]
      4. Verify count >= 170
      5. Verify categories.length === 12
    Expected Result: Count >= 170, Categories === 12
    Evidence: .sisyphus/evidence/task-1-category-count.txt
  ```

  **Commit**: YES (groups with 2, 3, 4)
  - Message: `chore(buildings): bundle building blueprint JSON data`
  - Files: `src/data/buildingBlueprints.ts`

---

- [ ] 2. **Blueprint Loader Utility**

  **What to do**:
  - Create `src/lib/buildingBlueprintLoader.ts` (for FUTURE data updates)
  - Export function `parseBuildingDefinitions(xml: string): BuildingBlueprint[]`
  - Parse XML to extract Id, Category, Tiles grid, OriginX/Y
  - Handle B/H/E tile characters
  - Export function `getBlueprintsByCategory(category): BuildingBlueprint[]`
  - **Note**: This utility is for FUTURE data team use. Task 1 uses pre-extracted data.

  **Must NOT do**:
  - File system access at runtime (browser-incompatible)
  - Async loading for initial bundle (use pre-extracted JSON from Task 1)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: XML parsing is straightforward with DOMParser

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-7)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: None (can run before Task 1 completes - utility for future updates)

  **References**:
  - `export/TextAsset/BuildingDefinitions.txt` - XML format reference
  - `src/types/map.ts:BuildingBlueprint` - Return type
  - `src/lib/buildingBlueprintLoader.ts` - New file

  **Acceptance Criteria**:
  - [ ] parseBuildingDefinitions function exists and exports
  - [ ] Function handles XML with Blueprint/Tiles/OriginX/OriginY structure
  - [ ] Returns array matching BuildingBlueprint interface
  - [ ] getBlueprintsByCategory filters correctly
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Parse sample XML
    Tool: Bash (Node.js)
    Preconditions: Sample XML string prepared
    Steps:
      1. Create test XML: '<BuildingDefinitions><BuildingDefinition Id="TestWall" Category="Wall"><Blueprint><Tiles OriginX="0" OriginY="0">BB</Tiles></Blueprint></BuildingDefinition></BuildingDefinitions>'
      2. Call parseBuildingDefinitions(xml)
      3. Verify result[0].id === "TestWall"
      4. Verify result[0].tiles === [["B", "B"]]
      5. Verify result[0].originX === 0, originY === 0
    Expected Result: Correct parsing of all fields
    Evidence: .sisyphus/evidence/task-2-parse-test.txt
  ```

  **Commit**: YES (groups with 1, 3, 4)
  - Message: `feat(buildings): add blueprint loader utility`

---

- [ ] 3. **Store Mutations Extension**

  **What to do**:
  - Extend `src/store/mapStore.ts` with placement state
  - Add state: `isRemoving: boolean`, `removeMode: 'building' | 'flag' | null`
  - Add mutations: `setIsRemoving(bool)`, `setRemoveMode(mode)`
  - Add selector: `selectOccupiedTiles` returns Set<"x,y"> for collision detection
  - Add selector: `selectFlagsAtPosition(x, y)` returns string[]

  **Must NOT do**:
  - Change existing mutations (addBuilding, removeBuilding, etc.)
  - Add new Zustand patterns (use existing Immer pattern)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Follow existing mapStore pattern exactly

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4-7)
  - **Blocks**: Tasks 8-13, 17
  - **Blocked By**: None

  **References**:
  - `src/store/mapStore.ts` - Existing store to extend
  - `src/types/map.ts:MapState` - State interface

  **Acceptance Criteria**:
  - [ ] isRemoving state added with default false
  - [ ] removeMode state added with default null
  - [ ] setIsRemoving mutation works
  - [ ] setRemoveMode mutation works
  - [ ] selectOccupiedTiles returns Set of "x,y" strings
  - [ ] selectFlagsAtPosition returns array of flag types
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Test remove mode state
    Tool: Bash (Node.js with @testing-library/react or direct import)
    Preconditions: Store imported
    Steps:
      1. Initialize store
      2. Call setIsRemoving(true)
      3. Assert state.isRemoving === true
      4. Call setRemoveMode('building')
      5. Assert state.removeMode === 'building'
      6. Call setIsRemoving(false)
      7. Assert state.isRemoving === false, removeMode === null
    Expected Result: State transitions correctly
    Evidence: .sisyphus/evidence/task-3-remove-mode-test.txt
  ```

  **Commit**: YES (groups with 1, 2, 4)
  - Message: `feat(store): extend mutations for placement state`

---

- [ ] 4. **Placement Engine Utilities**

  **What to do**:
  - Create `src/lib/placementEngine.ts`
  - Export `canPlaceBuilding(building, mapData): { valid: boolean, reason?: string }`
  - Export `getOccupiedTiles(building): Array<[number, number]>`
  - Export `isWithinBounds(x, y, width, height, mapWidth, mapHeight): boolean`
  - Export `getBuildingPreviewData(building): { tiles, color, isInvalid }`
  - Implement collision detection using Set<"x,y">

  **Must NOT do**:
  - UI logic (keep pure functions)
  - Store mutations (return validation results only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Pure utility functions, no framework dependencies

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-7)
  - **Blocks**: Tasks 8-13, 17, 18
  - **Blocked By**: None

  **References**:
  - `src/types/map.ts:Building, MapData` - Type definitions
  - `src/store/mapStore.ts:selectOccupiedTiles` - Collision data source
  - `doc/tilemap-editor-feature-doc.md:2.3` - Building placement rules

  **Acceptance Criteria**:
  - [ ] canPlaceBuilding returns { valid, reason } object
  - [ ] Collision detection checks all occupied tiles
  - [ ] Bounds validation rejects if any tile out of bounds
  - [ ] getOccupiedTiles calculates from blueprint tiles + position
  - [ ] isWithinBounds validates 0 <= x < width, 0 <= y < height
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Validate collision detection
    Tool: Bash (Node.js)
    Preconditions: Mock MapData with building at (25, 25)
    Steps:
      1. Create 1x1 building blueprint
      2. Call canPlaceBuilding at (25, 25)
      3. Assert valid === false, reason === "Tile occupied"
      4. Call canPlaceBuilding at (26, 25)
      5. Assert valid === true
    Expected Result: Collision detected correctly
    Evidence: .sisyphus/evidence/task-4-collision-test.txt

  Scenario: Validate bounds checking
    Tool: Bash (Node.js)
    Preconditions: 51x51 map
    Steps:
      1. Create 3x3 building blueprint
      2. Call canPlaceBuilding at (50, 50)
      3. Assert valid === false, reason === "Out of bounds"
      4. Call canPlaceBuilding at (48, 48)
      5. Assert valid === true (tiles 48-50 fit)
    Expected Result: Out-of-bounds detected
    Evidence: .sisyphus/evidence/task-4-bounds-test.txt
  ```

  **Commit**: YES (groups with 1, 2, 3)
  - Message: `feat(buildings): add placement engine utilities`

---

- [ ] 5. **Building Sidebar UI Component**

  **What to do**:
  - Create `src/components/sidebar/BuildingSidebar.tsx`
  - Category filter dropdown (12 categories + "All")
  - Scrollable building list (grouped by category)
  - Building name display with category color indicator
  - Health input field (number, 1-999, default 100)
  - Remove mode toggle button
  - Selected building highlight
  - Building count display per category

  **Must NOT do**:
  - Search functionality (category filter only)
  - Drag-to-place interaction
  - Right-click removal

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Standard React component with shadcn/ui

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6-7)
  - **Blocks**: Tasks 8, 15
  - **Blocked By**: None

  **References**:
  - `src/App.tsx:Sidebar` - Existing sidebar pattern to follow
  - `src/types/map.ts:BUILDING_CATEGORY_COLORS` - Category colors
  - `src/data/buildingBlueprints.ts:BUILDING_BLUEPRINTS` - Building list data
  - `shadcn/ui Select, Button, Input` - Component library

  **Acceptance Criteria**:
  - [ ] Category dropdown filters building list
  - [ ] Building list scrolls when > 20 items
  - [ ] Each building shows name + category color dot
  - [ ] Clicking building selects it (calls setSelectedBuilding)
  - [ ] Health input accepts 1-999, defaults to 100
  - [ ] Remove mode button toggles isRemoving + sets removeMode='building'
  - [ ] Selected building highlighted in list
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Category filter works
    Tool: Playwright
    Preconditions: App running, Building tab active
    Steps:
      1. Click category dropdown
      2. Select "Wall"
      3. Count visible buildings in list
      4. Verify count matches Wall category buildings
      5. Select "All"
      6. Verify all buildings shown
    Expected Result: Filter shows correct buildings
    Evidence: .sisyphus/evidence/task-5-category-filter.png

  Scenario: Select building and set health
    Tool: Playwright
    Preconditions: App running, Building tab active
    Steps:
      1. Click building "StoneWall" in list
      2. Verify building highlighted
      3. Enter "150" in health input
      4. Verify health value stored in store
    Expected Result: Building selected, health set
    Evidence: .sisyphus/evidence/task-5-select-building.png
  ```

  **Commit**: YES (groups with 6, 7)
  - Message: `feat(ui): add building sidebar component`

---

- [ ] 6. **Flag Sidebar UI Component**

  **What to do**:
  - Create `src/components/sidebar/FlagSidebar.tsx`
  - Flag type dropdown (grouped: "Special Flags", "Zone Flags")
  - Visibility checkboxes for each flag type (23 total)
  - Select All / Clear All buttons
  - Flag count display per type
  - Remove mode toggle button
  - Zone flag size inputs (SizeX, SizeY) when zone flag selected

  **Must NOT do**:
  - Polygon editing (rectangles only)
  - Right-click removal

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Standard React component with shadcn/ui

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5, 7)
  - **Blocks**: Tasks 11, 12, 15, 16
  - **Blocked By**: None

  **References**:
  - `src/App.tsx:Sidebar` - Existing sidebar pattern
  - `src/types/map.ts:FLAG_CONFIG, ZONE_FLAGS, ZONE_COLORS` - Flag data
  - `src/store/mapStore.ts` - Visibility state

  **Acceptance Criteria**:
  - [ ] Flag dropdown shows 8 special + 15 zone flags
  - [ ] 23 visibility checkboxes (one per flag type)
  - [ ] Select All checks all boxes
  - [ ] Clear All unchecks all boxes
  - [ ] Flag count shown next to each type
  - [ ] Remove mode button toggles isRemoving + sets removeMode='flag'
  - [ ] SizeX/SizeY inputs appear when zone flag selected
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Visibility toggles work
    Tool: Playwright
    Preconditions: App running, Flag tab active, EnemyMagnet placed
    Steps:
      1. Uncheck "EnemyMagnet" visibility
      2. Verify flag not rendered on canvas
      3. Check "EnemyMagnet" visibility
      4. Verify flag rendered again
    Expected Result: Visibility toggle works without removing flag
    Evidence: .sisyphus/evidence/task-6-visibility-toggle.png

  Scenario: Select zone flag and set size
    Tool: Playwright
    Preconditions: App running, Flag tab active
    Steps:
      1. Select "Zone_E" from dropdown
      2. Verify SizeX/SizeY inputs appear
      3. Enter SizeX=3, SizeY=2
      4. Verify values stored
    Expected Result: Zone flag size configured
    Evidence: .sisyphus/evidence/task-6-zone-size.png
  ```

  **Commit**: YES (groups with 5, 7)
  - Message: `feat(ui): add flag sidebar component`

---

- [ ] 7. **MapStatusBar Hover Info Enhancement**

  **What to do**:
  - Modify `src/components/MapStatusBar.tsx`
  - Add building info display: "Building: {name} | Health: {health} | Tiles: {count}"
  - Add flag info display: "Flags: {type1}, {type2}"
  - Show occupied tile count for multi-tile buildings
  - Use selectBuildingAt and selectFlagsAt selectors
  - Format: "({x}, {y}) | Terrain: {type} | {buildingInfo} | {flagInfo}"

  **Must NOT do**:
  - Change coordinate display logic
  - Add interactive elements to status bar

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Simple component modification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-6)
  - **Blocks**: Tasks 8, 11, 17
  - **Blocked By**: None

  **References**:
  - `src/components/MapStatusBar.tsx` - Existing component
  - `src/store/mapStore.ts:selectBuildingAt, selectFlagsAt` - Selectors
  - `src/data/buildingBlueprints.ts` - Building name lookup

  **Acceptance Criteria**:
  - [ ] Hover on building shows: "Building: {name} | Health: {health} | {tiles} tiles"
  - [ ] Hover on flag shows: "Flags: {type1}, {type2}"
  - [ ] Multi-tile building shows correct tile count
  - [ ] Stack of flags shows all types
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Building hover info
    Tool: Playwright
    Preconditions: Building placed at (25, 25)
    Steps:
      1. Move mouse to tile (25, 25)
      2. Read status bar text
      3. Verify contains building name and health
    Expected Result: Status bar shows "Building: StoneWall | Health: 100 | 1 tiles"
    Evidence: .sisyphus/evidence/task-7-building-hover.png

  Scenario: Multi-tile building hover
    Tool: Playwright
    Preconditions: 3x3 building placed with anchor at (25, 25)
    Steps:
      1. Move mouse to anchor tile (25, 25)
      2. Verify status shows "9 tiles"
      3. Move mouse to occupied non-anchor tile (26, 25)
      4. Verify status shows "Occupied: {buildingName}"
    Expected Result: Correct tile count shown
    Evidence: .sisyphus/evidence/task-7-multitile-hover.png
  ```

  **Commit**: YES (groups with 5, 6)
  - Message: `feat(ui): enhance MapStatusBar hover info`

---

### Wave 2: Core Placement Logic

- [ ] 8. **Building Placement Interaction (MapCanvas)**

  **What to do**:
  - Modify `src/components/canvas/MapCanvas.tsx`
  - Add click handler for building placement mode
  - On click: call canPlaceBuilding, show toast on error
  - On success: call addBuilding with selected health
  - Integrate with BuildingSidebar selected state
  - Handle remove mode: call removeBuilding on click

  **Must NOT do**:
  - Right-click handling (remove mode only)
  - Drag-to-place (click only)
  - Change terrain interaction logic

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`
  - **Reason**: Complex interaction logic, multiple integrations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Tasks 1-5)
  - **Blocks**: Tasks 14, 15, 17
  - **Blocked By**: Tasks 1, 3, 4, 5

  **References**:
  - `src/components/canvas/MapCanvas.tsx` - Existing canvas
  - `src/components/canvas/TerrainLayer.tsx` - Mouse handling pattern
  - `src/lib/placementEngine.ts:canPlaceBuilding` - Validation
  - `src/store/mapStore.ts:addBuilding` - Mutation
  - `src/store/uiStore.ts:addToast` - Error feedback

  **Acceptance Criteria**:
  - [ ] Click in building mode places building at cursor
  - [ ] Anchor point positioned at cursor
  - [ ] Invalid placement shows toast: "Cannot place: {reason}"
  - [ ] Valid placement adds building with correct health
  - [ ] Remove mode + click removes building
  - [ ] Out-of-bounds placement rejected with toast
  - [ ] Collision detected and rejected with toast

  **QA Scenarios**:

  ```
  Scenario: Place building successfully
    Tool: Playwright
    Preconditions: App running, "StoneWall" selected, Building mode active
    Steps:
      1. Click tile (25, 25) on canvas
      2. Verify building appears
      3. Verify status bar shows "Building: StoneWall"
    Expected Result: Building placed at clicked position
    Evidence: .sisyphus/evidence/task-8-place-success.png

  Scenario: Reject collision
    Tool: Playwright
    Preconditions: Building already at (25, 25)
    Steps:
      1. Select different building
      2. Click tile (25, 25)
      3. Verify toast: "Cannot place: Tile occupied"
      4. Verify no new building appears
    Expected Result: Collision rejected
    Evidence: .sisyphus/evidence/task-8-collision-reject.png

  Scenario: Reject out-of-bounds
    Tool: Playwright
    Preconditions: 3x3 building selected
    Steps:
      1. Click tile (50, 50)
      2. Verify toast: "Cannot place: Out of bounds"
      3. Verify no building appears
    Expected Result: Out-of-bounds rejected
    Evidence: .sisyphus/evidence/task-8-bounds-reject.png

  Scenario: Remove mode deletes building
    Tool: Playwright
    Preconditions: Building at (25, 25), Remove mode active
    Steps:
      1. Click tile (25, 25)
      2. Verify building disappears
      3. Verify status bar shows no building
    Expected Result: Building removed
    Evidence: .sisyphus/evidence/task-8-remove.png
  ```

  **Commit**: YES (groups with 11, 13)
  - Message: `feat(buildings): implement placement interaction`

---

- [ ] 9. **Building Preview Rendering (BuildingLayer)**

  **What to do**:
  - Rewrite `src/components/canvas/BuildingLayer.tsx` (replace placeholder)
  - Render all buildings with category colors
  - Show category marker (first 2 letters) when zoom >= 14
  - Render semi-transparent preview for selected building at cursor
  - Show origin point marker (white dot) on preview
  - Show yellow border for full occupied area
  - Show red border when placement invalid

  **Must NOT do**:
  - Handle click logic (MapCanvas does that)
  - Change terrain rendering

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`
  - **Reason**: Konva rendering with visual polish

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Tasks 1, 4)
  - **Blocks**: Tasks 17, 18
  - **Blocked By**: Tasks 1, 4

  **References**:
  - `src/components/canvas/BuildingLayer.tsx` - Existing placeholder
  - `src/components/canvas/TerrainLayer.tsx` - Konva rendering pattern
  - `src/data/buildingBlueprints.ts` - Building tile data
  - `src/lib/placementEngine.ts:getOccupiedTiles` - Preview calculation

  **Acceptance Criteria**:
  - [ ] Buildings render with correct category colors
  - [ ] Category markers show at zoom >= 14
  - [ ] Preview renders at cursor position when building selected
  - [ ] Origin point visible as white dot
  - [ ] Invalid placement shows red border
  - [ ] Valid placement shows yellow border
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Building preview renders
    Tool: Playwright
    Preconditions: App running, building selected, cursor at (25, 25)
    Steps:
      1. Move mouse to canvas
      2. Verify semi-transparent preview follows cursor
      3. Verify white origin marker visible
      4. Verify yellow border around preview
    Expected Result: Preview renders correctly
    Evidence: .sisyphus/evidence/task-9-preview.png

  Scenario: Invalid preview shows red
    Tool: Playwright
    Preconditions: Building at (25, 25), same building selected
    Steps:
      1. Move cursor to (25, 25)
      2. Verify preview border is red
    Expected Result: Invalid placement indicated
    Evidence: .sisyphus/evidence/task-9-invalid-preview.png
  ```

  **Commit**: YES (groups with 10, 12)
  - Message: `feat(buildings): enhance BuildingLayer rendering`

---

- [ ] 10. **Collision Detection Integration**

  **What to do**:
  - Extend `src/lib/placementEngine.ts`
  - Add `checkCollision(building, existingBuildings): boolean`
  - Add `getAllOccupiedTiles(buildings): Set<"x,y">`
  - Integrate with canPlaceBuilding
  - Handle multi-tile collision (all tiles must be free)

  **Must NOT do**:
  - UI interaction logic
  - Store mutations

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`
  - **Reason**: Algorithm implementation, performance consideration

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Task 4, 8)
  - **Blocks**: Task 17
  - **Blocked By**: Tasks 4, 8

  **References**:
  - `src/lib/placementEngine.ts` - Existing utilities
  - `src/types/map.ts:Building` - Building type

  **Acceptance Criteria**:
  - [ ] checkCollision returns true if any tile overlaps
  - [ ] getAllOccupiedTiles handles 500+ buildings efficiently
  - [ ] Multi-tile collision detected correctly
  - [ ] Performance: < 10ms for 500 buildings
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Multi-tile collision detected
    Tool: Bash (Node.js)
    Preconditions: 2x2 building at (25, 25)
    Steps:
      1. Try to place 1x1 building at (25, 26)
      2. Verify checkCollision returns true
      3. Try to place 1x1 building at (27, 25)
      4. Verify checkCollision returns false
    Expected Result: Partial overlap detected
    Evidence: .sisyphus/evidence/task-10-collision.png

  Scenario: Performance with 500 buildings
    Tool: Bash (Node.js)
    Preconditions: 500 buildings placed
    Steps:
      1. Time checkCollision call
      2. Verify < 10ms
    Expected Result: Fast collision check
    Evidence: .sisyphus/evidence/task-10-performance.txt
  ```

  **Commit**: YES (groups with 9, 12)
  - Message: `feat(buildings): integrate collision detection`

---

- [ ] 11. **Flag Placement Interaction (MapCanvas)**

  **What to do**:
  - Extend MapCanvas click handler (from Task 8)
  - Add flag placement mode handling
  - On click: call addFlag with selected flag type
  - Handle zone flags with SizeX/SizeY
  - Handle remove mode: call removeFlag on click
  - Allow flag stacking (multiple flags per tile)

  **Must NOT do**:
  - Right-click handling
  - Change building placement logic

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`
  - **Reason**: Complex interaction, similar to building placement

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Tasks 3, 4, 6)
  - **Blocks**: Tasks 14, 17
  - **Blocked By**: Tasks 3, 4, 6

  **References**:
  - `src/components/canvas/MapCanvas.tsx` - Canvas with building placement
  - `src/store/mapStore.ts:addFlag, removeFlag` - Mutations
  - `src/types/map.ts:FLAG_CONFIG, ZONE_FLAGS` - Flag types

  **Acceptance Criteria**:
  - [ ] Click in flag mode places flag at cursor
  - [ ] Zone flags store SizeX/SizeY
  - [ ] Multiple flags can stack on same tile
  - [ ] Remove mode + click removes flag
  - [ ] Toast on error
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Place flag successfully
    Tool: Playwright
    Preconditions: App running, "EnemyMagnet" selected, Flag mode active
    Steps:
      1. Click tile (10, 10)
      2. Verify flag appears
      3. Verify status bar shows "Flags: EnemyMagnet"
    Expected Result: Flag placed
    Evidence: .sisyphus/evidence/task-11-place-flag.png

  Scenario: Stack multiple flags
    Tool: Playwright
    Preconditions: EnemyMagnet at (10, 10)
    Steps:
      1. Select "Zone_E" flag
      2. Click tile (10, 10)
      3. Verify both flags present
      4. Verify status shows "Flags: EnemyMagnet, Zone_E"
    Expected Result: Flags stack successfully
    Evidence: .sisyphus/evidence/task-11-stack-flags.png

  Scenario: Remove flag
    Tool: Playwright
    Preconditions: Flag at (10, 10), Remove mode active
    Steps:
      1. Click tile (10, 10)
      2. Verify flag disappears
    Expected Result: Flag removed
    Evidence: .sisyphus/evidence/task-11-remove-flag.png
  ```

  **Commit**: YES (groups with 8, 13)
  - Message: `feat(flags): implement placement interaction`

---

- [ ] 12. **Zone Flag Rectangle Rendering (FlagLayer)**

  **What to do**:
  - Rewrite `src/components/canvas/FlagLayer.tsx`
  - Render zone flags as colored rectangles (SizeX × SizeY)
  - Use ZONE_COLORS for rectangle fill
  - Render special flags as markers (existing behavior)
  - Handle visibility toggles per flag type
  - Optimize for 100+ flags

  **Must NOT do**:
  - Polygon rendering (rectangles only)
  - Click handling

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`
  - **Reason**: Konva rendering with visual polish

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Task 6)
  - **Blocks**: Tasks 17, 18
  - **Blocked By**: Task 6

  **References**:
  - `src/components/canvas/FlagLayer.tsx` - Existing placeholder
  - `src/types/map.ts:ZONE_FLAGS, ZONE_COLORS` - Zone flag config
  - `src/store/mapStore.ts:layerVisibility` - Visibility state

  **Acceptance Criteria**:
  - [ ] Zone flags render as rectangles with correct colors
  - [ ] SizeX/SizeY determines rectangle dimensions
  - [ ] Special flags render as markers
  - [ ] Visibility toggles hide/show correctly
  - [ ] Performance: smooth with 100+ flags
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Zone flag rectangle renders
    Tool: Playwright
    Preconditions: Zone_E placed at (10, 10) with SizeX=3, SizeY=2
    Steps:
      1. Verify rectangle covers tiles (10-12, 10-11)
      2. Verify color matches ZONE_COLORS.Zone_E
      3. Verify label "E" visible
    Expected Result: Rectangle renders correctly
    Evidence: .sisyphus/evidence/task-12-zone-rect.png

  Scenario: Visibility toggle hides zone
    Tool: Playwright
    Preconditions: Zone_E visible
    Steps:
      1. Uncheck Zone_E visibility
      2. Verify rectangle not rendered
      3. Check Zone_E visibility
      4. Verify rectangle rendered again
    Expected Result: Toggle works
    Evidence: .sisyphus/evidence/task-12-visibility.png
  ```

  **Commit**: YES (groups with 9, 10)
  - Message: `feat(flags): enhance FlagLayer with zone rectangles`

---

- [ ] 13. **Remove Mode Implementation**

  **What to do**:
  - Add remove mode button to BuildingSidebar and FlagSidebar
  - Add visual indicator when remove mode active (red cursor/warning)
  - Wire remove mode state to MapCanvas click handlers
  - Exit remove mode when switching tabs
  - Confirm dialog for bulk removal (optional)

  **Must NOT do**:
  - Right-click removal
  - Keyboard shortcuts

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: UI state wiring

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Task 3)
  - **Blocks**: Task 17
  - **Blocked By**: Task 3

  **References**:
  - `src/components/sidebar/BuildingSidebar.tsx` - Building sidebar
  - `src/components/sidebar/FlagSidebar.tsx` - Flag sidebar
  - `src/store/mapStore.ts:isRemoving, removeMode` - Remove state

  **Acceptance Criteria**:
  - [ ] Remove mode button in both sidebars
  - [ ] Button toggles isRemoving state
  - [ ] Visual indicator when active
  - [ ] Clicking canvas in remove mode deletes
  - [ ] Switching tabs exits remove mode
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Remove mode toggles
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Click "Remove Mode" button in Building tab
      2. Verify button shows active state
      3. Verify cursor changes to remove indicator
      4. Click again to deactivate
      5. Verify normal state restored
    Expected Result: Remove mode toggles correctly
    Evidence: .sisyphus/evidence/task-13-toggle.png

  Scenario: Remove mode deletes on click
    Tool: Playwright
    Preconditions: Building at (25, 25), Remove mode active
    Steps:
      1. Click tile (25, 25)
      2. Verify building deleted
      3. Verify remove mode stays active
    Expected Result: Click deletes building
    Evidence: .sisyphus/evidence/task-13-delete.png
  ```

  **Commit**: YES (groups with 8, 11)
  - Message: `feat(ui): add remove mode button`

---

### Wave 3: Integration + Export

- [ ] 14. **XML Export for Buildings and Flags**

  **What to do**:
  - Create `src/lib/mapXmlExporter.ts`
  - Export `exportBuildingsToXml(buildings): string`
  - Export `exportFlagsToXml(flags): string`
  - Match game XML format (UTF-16 encoding)
  - Include health for buildings
  - Include SizeX/SizeY for zone flags
  - Generate download file

  **Must NOT do**:
  - Import/parsing (separate feature)
  - Multiple export formats

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`
  - **Reason**: XML generation, encoding handling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Tasks 8, 11)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 8, 11

  **References**:
  - `doc/tilemap-editor-feature-doc.md:4.2` - Buildings XML format
  - `doc/tilemap-editor-feature-doc.md:4.1` - TileMap XML format
  - `src/types/map.ts:Building, TileFlag` - Data types

  **Acceptance Criteria**:
  - [ ] exportBuildingsToXml generates valid XML
  - [ ] XML includes Id, X, Y, Health (if set)
  - [ ] exportFlagsToXml generates valid XML
  - [ ] Zone flags include SizeX/SizeY
  - [ ] UTF-16 encoding
  - [ ] Download triggers browser download
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Export buildings
    Tool: Playwright
    Preconditions: 3 buildings placed
    Steps:
      1. Trigger export
      2. Verify download starts
      3. Read downloaded XML
      4. Verify contains all 3 buildings with correct coords
    Expected Result: Valid XML exported
    Evidence: .sisyphus/evidence/task-14-export-buildings.xml

  Scenario: Export flags with zones
    Tool: Playwright
    Preconditions: EnemyMagnet + Zone_E placed
    Steps:
      1. Trigger export
      2. Verify XML contains both flags
      3. Verify Zone_E has SizeX/SizeY
    Expected Result: Valid flag XML
    Evidence: .sisyphus/evidence/task-14-export-flags.xml
  ```

  **Commit**: YES (standalone)
  - Message: `feat(io): add XML export for buildings and flags`

---

- [ ] 15. **Sidebar Tab Integration (App.tsx)**

  **What to do**:
  - Modify `src/App.tsx:Sidebar`
  - Replace building placeholder with BuildingSidebar component
  - Replace flag placeholder with FlagSidebar component
  - Ensure proper tab switching
  - Wire mode selection when switching tabs

  **Must NOT do**:
  - Change layout structure
  - Add new tabs

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: Component integration

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Tasks 5, 6)
  - **Blocks**: Task 17
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `src/App.tsx:Sidebar` - Existing sidebar
  - `src/components/sidebar/BuildingSidebar.tsx` - Building component
  - `src/components/sidebar/FlagSidebar.tsx` - Flag component

  **Acceptance Criteria**:
  - [ ] Building tab shows BuildingSidebar
  - [ ] Flag tab shows FlagSidebar
  - [ ] Tab switching works smoothly
  - [ ] Mode set correctly on tab switch
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Tab switching
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Click "Buildings" tab
      2. Verify BuildingSidebar renders
      3. Click "Flags" tab
      4. Verify FlagSidebar renders
      5. Click "Terrain" tab
      6. Verify terrain controls render
    Expected Result: All tabs switch correctly
    Evidence: .sisyphus/evidence/task-15-tabs.png
  ```

  **Commit**: YES (groups with 16)
  - Message: `feat(ui): integrate sidebar tabs`

---

- [ ] 16. **Layer Visibility Controls Integration**

  **What to do**:
  - Extend App.tsx layer visibility section
  - Add checkboxes for new layer types
  - Wire to setLayerVisibility mutation
  - Ensure visibility state persists

  **Must NOT do**:
  - Change existing visibility controls

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Reason**: UI wiring

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Task 6)
  - **Blocks**: Task 17
  - **Blocked By**: Task 6

  **References**:
  - `src/App.tsx:Sidebar` - Existing visibility controls
  - `src/store/mapStore.ts:setLayerVisibility` - Mutation

  **Acceptance Criteria**:
  - [ ] All layer visibility checkboxes work
  - [ ] State persists across tab switches
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Toggle layer visibility
    Tool: Playwright
    Preconditions: App running, buildings placed
    Steps:
      1. Uncheck "Occupied" layer
      2. Verify building outlines hidden
      3. Check "Occupied" layer
      4. Verify building outlines shown
    Expected Result: Visibility toggle works
    Evidence: .sisyphus/evidence/task-16-visibility.png
  ```

  **Commit**: YES (groups with 15)
  - Message: `feat(ui): integrate layer visibility controls`

---

- [ ] 17. **End-to-End Placement Workflow Test**

  **What to do**:
  - Create comprehensive Playwright test
  - Test complete building placement workflow
  - Test complete flag placement workflow
  - Test remove mode
  - Test export
  - Test all error cases
  - Save evidence for each step

  **Must NOT do**:
  - Unit tests (evidence only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `['playwright']`
  - **Reason**: E2E testing with Playwright

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Tasks 8-16)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 8-16

  **References**:
  - `playwright.config.ts` - Playwright configuration
  - All previous task QA scenarios

  **Acceptance Criteria**:
  - [ ] Building placement workflow recorded
  - [ ] Flag placement workflow recorded
  - [ ] Error cases recorded
  - [ ] Export recorded
  - [ ] All evidence saved to .sisyphus/evidence/

  **QA Scenarios**:

  ```
  Scenario: Full building workflow
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Select building category
      2. Select building
      3. Set health
      4. Place on canvas
      5. Verify placement
      6. Test collision
      7. Test bounds
      8. Use remove mode
      9. Verify removal
    Expected Result: Full workflow succeeds
    Evidence: .sisyphus/evidence/task-17-building-workflow.mp4

  Scenario: Full flag workflow
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Select special flag, place
      2. Select zone flag, set size, place
      3. Test stacking
      4. Test visibility toggle
      5. Use remove mode
    Expected Result: Full workflow succeeds
    Evidence: .sisyphus/evidence/task-17-flag-workflow.mp4
  ```

  **Commit**: NO (evidence only)

---

- [ ] 18. **Performance Optimization (500+ Buildings)**

  **What to do**:
  - Profile BuildingLayer with 500+ buildings
  - Implement viewport culling for buildings
  - Add Konva caching for static buildings
  - Optimize flag rendering
  - Test with stress scenario

  **Must NOT do**:
  - Change functionality
  - Reduce visual quality

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`
  - **Reason**: Performance optimization requires profiling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Tasks 9, 12)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 9, 12

  **References**:
  - `src/components/canvas/BuildingLayer.tsx` - Building rendering
  - `src/components/canvas/TerrainLayer.tsx` - Viewport culling pattern
  - `src/lib/viewportCulling.ts` - Culling utilities

  **Acceptance Criteria**:
  - [ ] 500 buildings render at 60 FPS
  - [ ] Viewport culling implemented
  - [ ] Konva caching enabled
  - [ ] Memory usage < 500MB
  - [ ] TypeScript compilation passes

  **QA Scenarios**:

  ```
  Scenario: Performance with 500 buildings
    Tool: Playwright
    Preconditions: 500 buildings placed
    Steps:
      1. Measure FPS
      2. Verify >= 60 FPS
      3. Measure memory
      4. Verify < 500MB
    Expected Result: Smooth performance
    Evidence: .sisyphus/evidence/task-18-performance.png
  ```

  **Commit**: YES (standalone)
  - Message: `perf(buildings): optimize for 500+ buildings`

---

### Wave FINAL: Verification


- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + ESLint. Review all changed files for: `as any`, `@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tasks [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration. Test edge cases: out-of-bounds, collision, invalid input. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 compliance. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `chore(buildings): bundle building blueprint JSON data` — buildingBlueprints.ts
- **2**: `feat(buildings): add blueprint loader utility` — buildingBlueprintLoader.ts
- **3**: `feat(store): extend mutations for placement state` — mapStore.ts
- **4**: `feat(buildings): add placement engine utilities` — placementEngine.ts
- **5**: `feat(ui): add building sidebar component` — BuildingSidebar.tsx
- **6**: `feat(ui): add flag sidebar component` — FlagSidebar.tsx
- **7**: `feat(ui): enhance MapStatusBar hover info` — MapStatusBar.tsx
- **8**: `feat(buildings): implement placement interaction` — MapCanvas.tsx
- **9**: `feat(buildings): enhance BuildingLayer rendering` — BuildingLayer.tsx
- **10**: `feat(buildings): integrate collision detection` — placementEngine.ts
- **11**: `feat(flags): implement placement interaction` — MapCanvas.tsx
- **12**: `feat(flags): enhance FlagLayer with zone rectangles` — FlagLayer.tsx
- **13**: `feat(ui): add remove mode button` — App.tsx, BuildingSidebar.tsx, FlagSidebar.tsx
- **14**: `feat(io): add XML export for buildings and flags` — mapXmlExporter.ts
- **15**: `feat(ui): integrate sidebar tabs` — App.tsx
- **16**: `feat(ui): integrate layer visibility controls` — App.tsx
- **17**: `test(e2e): end-to-end placement workflow` — N/A (evidence only)
- **18**: `perf(buildings): optimize for 500+ buildings` — BuildingLayer.tsx

---

## Success Criteria

### Verification Commands
```bash
npm run dev                  # Dev server starts without errors
npx tsc --noEmit            # TypeScript compilation passes
npm run lint                # ESLint passes with no errors
```

### Final Checklist
- [ ] All 170+ buildings loadable and placeable
- [ ] All 23 flags placeable with correct visuals
- [ ] Collision detection working (no overlap)
- [ ] Bounds validation working (reject out-of-bounds)
- [ ] Remove mode functional
- [ ] XML export generates valid format
- [ ] All QA scenarios pass with evidence
- [ ] No AI slop patterns detected

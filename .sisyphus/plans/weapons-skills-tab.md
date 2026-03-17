# Weapons & Skills Tab Implementation

## TL;DR

> **Quick Summary**: Implement a complete Weapons & Skills editor tab for the TileMapEditor Web application, including weapon definition editing (levels 0-5), skill definition editing (30+ effect types), TreeView category navigation, and XML import/export functionality.
> 
> **Deliverables**: 
> - 8 new UI components (Select, Textarea, Checkbox, Label, ScrollArea, Card, Collapsible, Slider)
> - WeaponSkillStore (Zustand state management)
> - Custom TreeView components for weapons/skills categories
> - Weapon editor with level configuration forms
> - Skill editor with 30+ effect type forms
> - XML parser/generator utilities for weapons and skills
> - Full integration into App.tsx weaponSkill tab
> - Agent-executed QA scenarios for all features
> 
> **Estimated Effort**: Large (24 tasks across 4 waves)
> **Parallel Execution**: YES - 4 waves with 6-8 tasks each
> **Critical Path**: UI Components → Store → TreeView → Editors → XML → Integration → QA

---

## Context

### Original Request
Implement the "武器与技能" (Weapons & Skills) tab based on the feature documentation in `doc/tilemap-editor-feature-doc.md` section 2.6 and 3.5.

### Interview Summary
**Key Discussions**:
- **Scope**: Full implementation (P0+P1+P2) - complete weapon editor + complete skill editor + XML import/export
- **Data Storage**: File-based only (load/export XML files, no IndexedDB persistence)
- **Test Strategy**: No unit tests - Agent QA only via Playwright browser automation
- **TreeView**: Custom implementation using shadcn/ui primitives (no external tree library)

**Research Findings**:
- Existing UI components: Only Button and Input exist
- Missing UI components needed: Select, Textarea, Checkbox, Label, ScrollArea, Card, Collapsible, Slider
- `fast-xml-parser` already installed for XML handling
- `@radix-ui/react-tabs` available for tab components
- Zustand + Immer pattern established in mapStore/uiStore

### Metis Review
**Identified Gaps** (addressed):
- Need to clarify XML file format from Python version - referenced feature doc sections 4.1-4.4
- Effect types for skills (30+) need complete list - documented in feature doc section 2.6
- Localization data structure needs definition - added to types, will load from TextAsset/Loc_TLS

---

## Work Objectives

### Core Objective
Build a complete Weapons & Skills editor that allows users to create, edit, and export weapon and skill definitions in the game's XML format, with category-based navigation and comprehensive form editing for all properties.

### Concrete Deliverables
- `src/components/ui/select.tsx`, `textarea.tsx`, `checkbox.tsx`, `label.tsx`, `scroll-area.tsx`, `card.tsx`, `collapsible.tsx`, `slider.tsx`
- `src/store/weaponSkillStore.ts`
- `src/components/weapon-skill/WeaponSkillTab.tsx`
- `src/components/weapon-skill/WeaponTreeView.tsx`, `SkillTreeView.tsx`
- `src/components/weapon-skill/WeaponEditor.tsx`, `WeaponLevelForm.tsx`
- `src/components/weapon-skill/SkillEditor.tsx`, `SkillEffectForms.tsx`
- `src/lib/xml/weapon-xml-parser.ts`, `skill-xml-parser.ts`
- Updated `App.tsx` WeaponSkillContent component

### Definition of Done
- [x] All UI components created and exported from `src/components/ui/index.ts`
- [x] WeaponSkillStore functional with all state and actions
- [x] TreeView components render category hierarchy with selection
- [x] Weapon editor allows editing all properties including levels 0-5
- [ ] Skill editor allows editing all 30+ effect types
- [ ] XML import/export produces valid game-format files
- [ ] Agent QA scenarios pass for all features (Playwright browser automation)

### Must Have
- UTF-16 encoding for XML export (game compatibility)
- Custom TreeView without external dependencies
- All weapon levels 0-5 configurable
- All skill effect types editable
- Category-based grouping (Melee/Range/Magic weapons, 6 skill categories)

### Must NOT Have (Guardrails)
- No IndexedDB persistence (file-based only per user decision)
- No unit tests (Agent QA only per user decision)
- No drag-drop functionality in TreeView (custom implementation without DnD)
- No React Hook Form (use Zustand for form state, consistent with existing stores)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO (Vitest not installed)
- **Automated tests**: NO (user chose Agent QA only)
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **XML Parsing/Export**: Use Bash (Node.js script) — Parse XML, validate structure, assert fields
- **Store State**: Use Bash (Node.js REPL) — Import store, check state after actions

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — Foundation & UI Components):
├── Task 1: Add missing UI components (Select, Textarea, Checkbox, Label) [quick]
├── Task 2: Add missing UI components (ScrollArea, Card, Collapsible, Slider) [quick]
├── Task 3: Update UI index.ts exports [quick]
├── Task 4: Create WeaponSkillStore with state and actions [unspecified-high]
├── Task 5: Create XML parser utilities (weapon + skill) [deep]
└── Task 6: Create localization loader utility [quick]

Wave 2 (After Wave 1 — TreeView & Base Editor Components):
├── Task 7: Create WeaponTreeView component [visual-engineering]
├── Task 8: Create SkillTreeView component [visual-engineering]
├── Task 9: Create WeaponSkillTab container component [visual-engineering]
├── Task 10: Create WeaponEditor base component [visual-engineering]
├── Task 11: Create WeaponLevelForm component [visual-engineering]
├── Task 12: Create SkillEditor base component [visual-engineering]
└── Task 13: Create SkillBasicInfoForm component [visual-engineering]

Wave 3 (After Wave 2 — Skill Effect Forms & Integration):
├── Task 14: Create AttackActionForm component [visual-engineering]
├── Task 15: Create GenericActionForm component [visual-engineering]
├── Task 16: Create EffectForms (Momentum, MultiHit, Propagation, etc.) [artistry]
├── Task 17: Create EffectForms (Buff, Debuff, Poison, Stun, etc.) [artistry]
├── Task 18: Create CastFXForm and ConditionsForm [visual-engineering]
├── Task 19: Integrate XML export into WeaponEditor [deep]
├── Task 20: Integrate XML export into SkillEditor [deep]
└── Task 21: Update App.tsx to use WeaponSkillTab [quick]

Wave 4 (After Wave 3 — File I/O & Final Integration):
├── Task 22: Create file import/export handlers (File API) [unspecified-high]
├── Task 23: Add localization display support [quick]
├── Task 24: End-to-end integration testing [unspecified-high]
└── Task 25: Polish and edge case handling [deep]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1-3 → Task 4 → Task 5 → Task 7-9 → Task 10-13 → Task 14-18 → Task 19-21 → Task 22-25 → F1-F4 → user okay
Parallel Speedup: ~75% faster than sequential
Max Concurrent: 8 (Wave 1 & 3)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1-3 | — | 7-13, 16-18 |
| 4 | — | 7-13, 19-21 |
| 5 | — | 19-20, 22 |
| 6 | — | 23 |
| 7 | 1-4 | 9, 24 |
| 8 | 1-4 | 9, 24 |
| 9 | 7-8 | 24, 25 |
| 10 | 1-4, 5 | 11, 19 |
| 11 | 1-4, 10 | 19 |
| 12 | 1-4, 5 | 13, 20 |
| 13 | 1-4, 12 | 20 |
| 14-18 | 1-4, 12 | 20, 24 |
| 19 | 5, 10-11 | 24 |
| 20 | 5, 12-18 | 24 |
| 21 | 9 | 24 |
| 22 | 5 | 24 |
| 23 | 6 | 24 |
| 24 | 7-23 | 25, F1-F4 |
| 25 | 24 | F1-F4 |
| F1-F4 | All tasks | user okay |

### Agent Dispatch Summary

- **Wave 1**: **6 tasks** — T1-3 → `quick`, T4 → `unspecified-high`, T5 → `deep`, T6 → `quick`
- **Wave 2**: **7 tasks** — T7-13 → `visual-engineering`
- **Wave 3**: **8 tasks** — T14-15, 18 → `visual-engineering`, T16-17 → `artistry`, T19-20 → `deep`, T21 → `quick`
- **Wave 4**: **4 tasks** — T22 → `unspecified-high`, T23 → `quick`, T24 → `unspecified-high`, T25 → `deep`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` (+ `playwright`), F4 → `deep`

---

## TODOs

- [x] 1. Add missing UI components (Select, Textarea, Checkbox, Label)

  **What to do**:
  - Create `src/components/ui/select.tsx` with shadcn/ui pattern (variant system like Button)
  - Create `src/components/ui/textarea.tsx` following Input component pattern
  - Create `src/components/ui/checkbox.tsx` using Radix UI primitive or custom
  - Create `src/components/ui/label.tsx` for form labels
  - All components must use the `cn()` utility and follow existing code style
  - Export all from `src/components/ui/index.ts`

  **Must NOT do**:
  - Do not install external dependencies (use available Radix UI or custom)
  - Do not deviate from existing shadcn/ui patterns in Button/Input

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard UI component patterns, well-documented shadcn/ui conventions
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: Expert in shadcn/ui component patterns and Tailwind CSS

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-6)
  - **Blocks**: Tasks 7-18 (all editor components need these UI components)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `src/components/ui/button.tsx:1-57` - shadcn/ui variant system pattern to follow
  - `src/components/ui/input.tsx:1-29` - Simple component structure to match
  - `src/lib/utils.ts:12` - `cn()` utility usage
  - shadcn/ui docs: https://ui.shadcn.com/docs/components/select, https://ui.shadcn.com/docs/components/textarea

  **Acceptance Criteria**:
  - Select component has variant prop (default, outline, ghost) and size prop
  - Textarea component has className prop and forwardRef
  - Checkbox component renders checked/unchecked state with onChange
  - Label component wraps text with proper styling
  - All components compile with `npm run build` (no TypeScript errors)
  - Components exported from `src/components/ui/index.ts`

  **QA Scenarios**:
  ```
  Scenario: Select component renders options correctly
    Tool: Playwright
    Preconditions: Dev server running at localhost:5173
    Steps:
      1. Navigate to a test page with Select component
      2. Click on Select trigger button
      3. Verify dropdown opens with all options visible
      4. Click an option and verify it's selected
    Expected Result: Select displays selected value, dropdown closes on selection
    Failure Indicators: Dropdown doesn't open, options not visible, selection doesn't persist
    Evidence: .sisyphus/evidence/task-1-select-test.png

  Scenario: Textarea accepts multi-line input
    Tool: Playwright
    Preconditions: Test page with Textarea component
    Steps:
      1. Focus textarea
      2. Type multi-line text with Enter keys
      3. Verify text appears with line breaks preserved
    Expected Result: Textarea displays multi-line text correctly, no horizontal scroll
    Failure Indicators: Text truncated, line breaks not preserved
    Evidence: .sisyphus/evidence/task-1-textarea-test.png
  ```

  **Commit**: YES (groups with 2, 3)
  - Message: `feat(ui): add Select, Textarea, Checkbox, Label components`
  - Files: `src/components/ui/select.tsx, src/components/ui/textarea.tsx, src/components/ui/checkbox.tsx, src/components/ui/label.tsx, src/components/ui/index.ts`
  - Pre-commit: `npm run build`

- [x] 2. Add missing UI components (ScrollArea, Card, Collapsible, Slider)

  **What to do**:
  - Create `src/components/ui/scroll-area.tsx` for scrollable regions (TreeView)
  - Create `src/components/ui/card.tsx` with Card, CardHeader, CardContent pattern
  - Create `src/components/ui/collapsible.tsx` for expandable sections (skill effects)
  - Create `src/components/ui/slider.tsx` for numeric value sliders
  - Follow shadcn/ui patterns from existing Button component
  - Export all from `src/components/ui/index.ts`

  **Must NOT do**:
  - Do not install @radix-ui/react-scroll-area (implement custom if needed)
  - Do not add complex animations (keep simple)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard UI patterns, straightforward implementations
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: shadcn/ui patterns expertise

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-6)
  - **Blocks**: Tasks 7-18 (TreeView needs ScrollArea, editors need Card/Collapsible)
  - **Blocked By**: None

  **References**:
  - `src/components/ui/button.tsx` - shadcn/ui pattern reference
  - shadcn/ui docs for each component type

  **Acceptance Criteria**:
  - ScrollArea has scrollable region with proper overflow handling
  - Card has Card, CardHeader, CardTitle, CardContent sub-components
  - Collapsible has open/closed state with toggle trigger
  - Slider has min, max, step, value props with onChange
  - All components compile without TypeScript errors
  - All exported from index.ts

  **QA Scenarios**:
  ```
  Scenario: ScrollArea shows scrollbar when content overflows
    Tool: Playwright
    Steps:
      1. Render ScrollArea with content taller than container
      2. Verify vertical scrollbar appears
      3. Scroll down and verify content scrolls
    Expected Result: Scrollbar visible, content scrolls smoothly
    Evidence: .sisyphus/evidence/task-2-scrollarea-test.png

  Scenario: Collapsible expands/collapses on click
    Tool: Playwright
    Steps:
      1. Click collapsible trigger
      2. Verify content expands
      3. Click again and verify content collapses
    Expected Result: Content visibility toggles correctly
    Evidence: .sisyphus/evidence/task-2-collapsible-test.png
  ```

  **Commit**: YES (groups with 1, 3)
  - Message: `feat(ui): add ScrollArea, Card, Collapsible, Slider components`
  - Files: `src/components/ui/scroll-area.tsx, src/components/ui/card.tsx, src/components/ui/collapsible.tsx, src/components/ui/slider.tsx`

- [x] 3. Update UI index.ts exports

  **What to do**:
  - Update `src/components/ui/index.ts` to export all new components
  - Ensure exports match the pattern: `export { X } from './x'`
  - Add type exports if components have prop types

  **Must NOT do**:
  - Do not modify existing component exports
  - Do not reorganize the file structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-2, after 1-2 complete)
  - **Blocks**: Tasks 7-25 (all components need exports)
  - **Blocked By**: Tasks 1, 2

  **Acceptance Criteria**:
  - All new components (Select, Textarea, Checkbox, Label, ScrollArea, Card, Collapsible, Slider) exported
  - No TypeScript errors in index.ts
  - Import statements work: `import { Select, Card } from '@/components/ui'`

  **QA Scenarios**:
  ```
  Scenario: All UI components can be imported from index
    Tool: Bash (TypeScript compiler check)
    Steps:
      1. Run `npx tsc --noEmit src/components/ui/index.ts`
      2. Verify no errors
    Expected Result: TypeScript compilation succeeds with no errors
    Evidence: .sisyphus/evidence/task-3-tsc-output.txt
  ```

  **Commit**: YES (groups with 1, 2)

- [x] 4. Create WeaponSkillStore with state and actions

  **What to do**:
  - Create `src/store/weaponSkillStore.ts` using Zustand + Immer pattern
  - Implement state for: currentView (weapons/skills), selectedWeaponId, selectedSkillId, editingWeaponLevel, weapons list, skills list, hasUnsavedChanges
  - Implement actions: setCurrentView, setSelectedWeapon, setSelectedSkill, setEditingLevel, addWeapon, updateWeapon, removeWeapon, addSkill, updateSkill, removeSkill
  - Add selectors: selectWeaponById, selectSkillById, selectWeaponsByCategory, selectSkillsByCategory
  - Follow existing mapStore/uiStore patterns exactly

  **Must NOT do**:
  - Do not use React Hook Form (use Zustand for all state)
  - Do not add persistence (file-based only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex state management with many actions and nested data structures
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-6)
  - **Blocks**: Tasks 7-25 (all editor components depend on store)
  - **Blocked By**: None

  **References**:
  - `src/store/mapStore.ts:1-331` - Zustand + Immer pattern reference
  - `src/store/uiStore.ts:1-330` - Additional pattern reference
  - `src/types/weapon-skill.ts:1-217` - Type definitions to use

  **Acceptance Criteria**:
  - Store compiles without TypeScript errors
  - All state properties typed correctly from weapon-skill.ts
  - All mutations use Immer pattern (state.property = value)
  - Selectors typed and exported
  - `npx tsc --noEmit src/store/weaponSkillStore.ts` passes

  **QA Scenarios**:
  ```
  Scenario: Store initializes with default state
    Tool: Bash (Node.js REPL)
    Steps:
      1. Import store and get initial state
      2. Verify currentView is 'weapons', selectedWeaponId is null
    Expected Result: Initial state matches default values
    Evidence: .sisyphus/evidence/task-4-store-init.txt

  Scenario: Weapon mutations work correctly
    Tool: Bash (Node.js script)
    Steps:
      1. Create weapon object and call addWeapon
      2. Verify weapon appears in state.weapons
      3. Call updateWeapon and verify changes applied
    Expected Result: Weapon added and updated correctly
    Evidence: .sisyphus/evidence/task-4-weapon-mutation.txt
  ```

  **Commit**: YES
  - Message: `feat(store): add WeaponSkillStore with state and actions`
  - Files: `src/store/weaponSkillStore.ts, src/store/index.ts`
  - Pre-commit: `npx tsc --noEmit`

- [x] 5. Create XML parser utilities (weapon + skill)

  **What to do**:
  - Create `src/lib/xml/weapon-xml-parser.ts` with parseWeapons() and exportWeapons()
  - Create `src/lib/xml/skill-xml-parser.ts` with parseSkills() and exportSkills()
  - Use fast-xml-parser library for XML parsing/generation
  - Handle UTF-16 encoding with BOM detection for game compatibility
  - Map XML structure to WeaponDefinition and SkillDefinition types

  **Must NOT do**:
  - Do not skip UTF-16 encoding (game requires it)
  - Do not change the XML structure from game format

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex XML structures with nested elements, encoding handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6)
  - **Blocks**: Tasks 10-11, 12-13, 19-20, 22
  - **Blocked By**: None

  **References**:
  - `doc/tilemap-editor-feature-doc.md:368-460` - Weapon/Skill data models
  - `doc/tilemap-editor-feature-doc.md:700-783` - XML format examples
  - `src/types/weapon-skill.ts` - TypeScript types to map
  - fast-xml-parser docs: https://github.com/NaturalIntelligence/fast-xml-parser

  **Acceptance Criteria**:
  - parseWeapons() returns WeaponDefinition[] from XML string
  - exportWeapons() generates valid XML string from WeaponDefinition[]
  - parseSkills() returns SkillDefinition[] from XML string
  - exportSkills() generates valid XML string from SkillDefinition[]
  - UTF-16 LE with BOM encoding for export
  - BOM detection for import (UTF-16 LE/BE, UTF-8)

  **QA Scenarios**:
  ```
  Scenario: Parse weapon XML correctly
    Tool: Bash (Node.js script)
    Steps:
      1. Create sample weapon XML with known values
      2. Call parseWeapons(xml)
      3. Verify returned weapons match expected structure
    Expected Result: Parsed weapons match XML structure exactly
    Evidence: .sisyphus/evidence/task-5-parse-weapons.txt

  Scenario: Export weapons to valid XML with UTF-16 BOM
    Tool: Bash (Node.js script)
    Steps:
      1. Create WeaponDefinition array
      2. Call exportWeapons(weapons) to get XML string
      3. Verify XML starts with UTF-16 BOM (FF FE bytes)
      4. Parse result back and compare with original
    Expected Result: Round-trip produces identical data, BOM present
    Evidence: .sisyphus/evidence/task-5-export-weapons.txt
  ```

  **Commit**: YES
  - Message: `feat(xml): add weapon and skill XML parsers with UTF-16 support`
  - Files: `src/lib/xml/weapon-xml-parser.ts, src/lib/xml/skill-xml-parser.ts`
  - Pre-commit: `npx tsc --noEmit`

- [x] 6. Create localization loader utility

  **What to do**:
  - Create `src/lib/localization.ts` with loadLocalization() function
  - Parse translation files from TextAsset/Loc_TLS format
  - Support 6 languages: English, Français, 简体中文，日本語，Deutsch, Español
  - Provide getTranslation(key, language) function
  - Store translations in Map<string, Map<SupportedLanguage, string>>

  **Must NOT do**:
  - Do not hardcode translations (load from files)
  - Do not skip any of the 6 supported languages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward file parsing and Map operations
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5)
  - **Blocks**: Task 23
  - **Blocked By**: None

  **References**:
  - `src/types/weapon-skill.ts:185-217` - LocalizationData and SupportedLanguage types
  - `doc/tilemap-editor-feature-doc.md:456-459` - Localization description

  **Acceptance Criteria**:
  - loadLocalization() parses translation files correctly
  - getTranslation(key, language) returns correct translation
  - Fallback to English if translation missing
  - All 6 languages supported

  **QA Scenarios**:
  ```
  Scenario: Load localization and get translation
    Tool: Bash (Node.js script)
    Steps:
      1. Create sample localization file with test keys
      2. Call loadLocalization(filePath)
      3. Call getTranslation('test.key', '简体中文')
    Expected Result: Correct Chinese translation returned
    Evidence: .sisyphus/evidence/task-6-localization.txt
  ```

  **Commit**: YES
  - Message: `feat(i18n): add localization loader for 6 languages`
  - Files: `src/lib/localization.ts`

- [x] 7. Create WeaponTreeView component

  **What to do**:
  - Create `src/components/weapon-skill/WeaponTreeView.tsx`
  - Implement custom TreeView with categories: MeleeWeapon, RangeWeapon, MagicWeapon
  - Each category shows weapons grouped underneath
  - Display translated weapon names (from localization)
  - Support selection (click to select weapon for editing)
  - Use ScrollArea for scrollable content
  - Use Card for category grouping

  **Must NOT do**:
  - Do not install external tree libraries (custom implementation)
  - Do not add drag-drop functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Custom UI component with tree structure, needs visual polish
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-13)
  - **Blocks**: Task 9 (WeaponSkillTab container)
  - **Blocked By**: Tasks 1-3 (UI components), Task 4 (store)

  **References**:
  - `src/components/ui/scroll-area.tsx` - Scrollable container
  - `src/components/ui/card.tsx` - Category grouping
  - `src/store/weaponSkillStore.ts` - State access

  **Acceptance Criteria**:
  - TreeView renders 3 weapon categories
  - Each category shows weapons underneath when expanded
  - Clicking weapon sets selectedWeaponId in store
  - Selected weapon highlighted visually
  - Component compiles without errors

  **QA Scenarios**:
  ```
  Scenario: TreeView displays categories and weapons
    Tool: Playwright
    Steps:
      1. Render WeaponTreeView with test weapons
      2. Verify 3 categories visible (Melee, Range, Magic)
      3. Click category to expand
      4. Verify weapons listed under category
    Expected Result: Categories and weapons displayed correctly
    Evidence: .sisyphus/evidence/task-7-treeview.png

  Scenario: Selecting weapon highlights it
    Tool: Playwright
    Steps:
      1. Click on a weapon in tree
      2. Verify weapon has selected/highlighted style
      3. Verify store state updated (selectedWeaponId)
    Expected Result: Weapon highlighted, store updated
    Evidence: .sisyphus/evidence/task-7-selection.png
  ```

  **Commit**: YES (groups with 8)
  - Message: `feat(ui): add WeaponTreeView and SkillTreeView components`
  - Files: `src/components/weapon-skill/WeaponTreeView.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [x] 8. Create SkillTreeView component

  **What to do**:
  - Create `src/components/weapon-skill/SkillTreeView.tsx`
  - Implement custom TreeView with 6 categories: MeleeWeapons, RangedWeapons, MagicWeapons, Usables, Buildings, Other
  - Each category shows skills grouped underneath
  - Display translated skill names
  - Support selection (click to select skill for editing)
  - Mirror WeaponTreeView pattern for consistency

  **Must NOT do**:
  - Do not install external tree libraries
  - Do not deviate from WeaponTreeView pattern

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9-13)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1-3, Task 4

  **Acceptance Criteria**:
  - TreeView renders 6 skill categories
  - Skills displayed under correct categories
  - Selection works and updates store
  - Visual consistency with WeaponTreeView

  **QA Scenarios**:
  ```
  Scenario: Skill TreeView displays all 6 categories
    Tool: Playwright
    Steps:
      1. Render SkillTreeView with test skills
      2. Verify all 6 categories visible
      3. Expand each category and verify skills listed
    Expected Result: All categories and skills displayed
    Evidence: .sisyphus/evidence/task-8-skill-tree.png
  ```

  **Commit**: YES (groups with 7)

- [x] 9. Create WeaponSkillTab container component

  **What to do**:
  - Create `src/components/weapon-skill/WeaponSkillTab.tsx`
  - Main container with view switcher (Weapons/Skills radio toggle)
  - Left panel: TreeView (WeaponTreeView or SkillTreeView based on view)
  - Right panel: Editor (WeaponEditor or SkillEditor based on view)
  - Top toolbar: Language selector, Load button, Export button
  - Use Zustand store to manage view state
  - 2-column layout with flexible widths

  **Must NOT do**:
  - Do not implement editor logic here (delegate to Editor components)
  - Do not add file I/O yet (Task 22)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout composition, visual integration of sub-components
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Tasks 7-8 (TreeView components), Task 4 (store)

  **Acceptance Criteria**:
  - View switcher toggles between Weapons/Skills
  - Left panel shows correct TreeView based on view
  - Right panel shows correct Editor based on view
  - Top toolbar has language selector, Load, Export buttons
  - Layout is responsive (flexible widths)

  **QA Scenarios**:
  ```
  Scenario: View switcher toggles correctly
    Tool: Playwright
    Steps:
      1. Click "Weapons" radio - verify WeaponTreeView shown
      2. Click "Skills" radio - verify SkillTreeView shown
    Expected Result: Correct components shown per view
    Evidence: .sisyphus/evidence/task-9-view-switch.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add WeaponSkillTab container component`
  - Files: `src/components/weapon-skill/WeaponSkillTab.tsx`

- [x] 10. Create WeaponEditor base component

  **What to do**:
  - Create `src/components/weapon-skill/WeaponEditor.tsx`
  - Display weapon basic info form (Id, Category, Hands, Tags)
  - Show level list (0-5) with "Add Level" button
  - When level selected, render WeaponLevelForm component
  - Save button to persist changes to store
  - Empty state when no weapon selected

  **Must NOT do**:
  - Do not implement level form details yet (Task 11)
  - Do not add XML export yet (Task 19)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form layout and composition
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 11-13)
  - **Blocks**: Tasks 11, 19
  - **Blocked By**: Tasks 1-4 (UI components, store)

  **Acceptance Criteria**:
  - Shows weapon Id, Category dropdown, Hands dropdown, Tags input
  - Level buttons 0-5 displayed (blue if configured)
  - Clicking level shows placeholder for WeaponLevelForm
  - Save button calls store update
  - Empty state when no weapon selected

  **QA Scenarios**:
  ```
  Scenario: WeaponEditor shows weapon details
    Tool: Playwright
    Steps:
      1. Select a weapon in TreeView
      2. Verify editor shows weapon Id, Category, Hands, Tags
      3. Verify level buttons 0-5 displayed
    Expected Result: All weapon details visible
    Evidence: .sisyphus/evidence/task-10-weapon-editor.png
  ```

  **Commit**: YES (groups with 11)
  - Message: `feat(ui): add WeaponEditor and WeaponLevelForm components`
  - Files: `src/components/weapon-skill/WeaponEditor.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [x] 11. Create WeaponLevelForm component

  **What to do**:
  - Create `src/components/weapon-skill/WeaponLevelForm.tsx`
  - Form fields: baseDamage (Min/Max inputs), basePrice, baseStatBonuses (key=value list), skills (comma-separated IDs)
  - Validate numeric inputs (damage, price)
  - Update store when form changes
  - Remove Level button to delete this level

  **Must NOT do**:
  - Do not add complex validation (basic numeric checks only)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 10, 12-13)
  - **Blocks**: Task 19
  - **Blocked By**: Task 10 (WeaponEditor structure)

  **Acceptance Criteria**:
  - Min/Max damage inputs work correctly
  - Base price input accepts numeric values
  - Stat bonuses displayed as key=value pairs
  - Skills field accepts comma-separated IDs
  - Remove Level button deletes level from store

  **QA Scenarios**:
  ```
  Scenario: Level form saves changes correctly
    Tool: Playwright
    Steps:
      1. Select level 1 in WeaponEditor
      2. Enter damage values (10-20), price (100)
      3. Add stat bonus (Strength=5)
      4. Click Save
      5. Verify store state updated
    Expected Result: All values saved to store
    Evidence: .sisyphus/evidence/task-11-level-form.png
  ```

  **Commit**: YES (groups with 10)
  - Files: `src/components/weapon-skill/WeaponLevelForm.tsx`

- [x] 12. Create SkillEditor base component

  **What to do**:
  - Create `src/components/weapon-skill/SkillEditor.tsx`
  - Display skill basic info (Id, Description, IconPath, TemplateId)
  - Show collapsible sections for each property group:
    - Costs (AP, Mana, Health, UsesPerTurn)
    - Range & Target
    - Area of Effect
    - Action Type selector (Attack/Generic)
    - Attack Action OR Generic Action details
    - Cast FX
    - Conditions
  - Save button to persist changes

  **Must NOT do**:
  - Do not implement detailed effect forms yet (Tasks 16-18)
  - Do not add XML export yet (Task 20)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 10-11, 13)
  - **Blocks**: Tasks 13-18, 20
  - **Blocked By**: Tasks 1-4

  **Acceptance Criteria**:
  - Basic info form with all fields
  - Collapsible sections for each property group
  - Action type radio toggle (Attack/Generic)
  - Save button updates store
  - Empty state when no skill selected

  **QA Scenarios**:
  ```
  Scenario: SkillEditor displays all sections
    Tool: Playwright
    Steps:
      1. Select a skill in TreeView
      2. Verify all collapsible sections visible
      3. Expand each section and verify fields
    Expected Result: All sections with correct fields
    Evidence: .sisyphus/evidence/task-12-skill-editor.png
  ```

  **Commit**: YES (groups with 13)
  - Message: `feat(ui): add SkillEditor and SkillBasicInfoForm components`
  - Files: `src/components/weapon-skill/SkillEditor.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [x] 13. Create SkillBasicInfoForm component

  **What to do**:
  - Create `src/components/weapon-skill/SkillBasicInfoForm.tsx`
  - Form for: Id, Description (textarea), IconPath, TemplateId
  - All fields bound to store state
  - Validate required fields (Id)
  - Auto-save on change (no separate save button for this section)

  **Must NOT do**:
  - Do not add complex validation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 10-12)
  - **Blocks**: Task 20
  - **Blocked By**: Task 12 (SkillEditor structure)

  **Acceptance Criteria**:
  - All 4 fields render correctly
  - Changes update store immediately
  - Id field shows validation error if empty
  - Description uses Textarea component

  **QA Scenarios**:
  ```
  Scenario: Basic info form updates store
    Tool: Playwright
    Steps:
      1. Select a skill
      2. Change Description field
      3. Verify store state updated
    Expected Result: Description saved to store
    Evidence: .sisyphus/evidence/task-13-basic-info.png
  ```

  **Commit**: YES (groups with 12)
  - Files: `src/components/weapon-skill/SkillBasicInfoForm.tsx`

- [x] 14. Create CostsAndRangeForm component

  **What to do**:
  - Create `src/components/weapon-skill/CostsAndRangeForm.tsx`
  - Form section for: actionPointsCost, manaCost, healthCost, usesPerTurnCount
  - Form section for: skillRange (min, max, cardinalDirectionOnly, modifiable)
  - Form section for: skillTarget (validTargets multi-select, affectedUnits multi-select)
  - All fields bound to store state
  - Use Input and Checkbox components

  **Must NOT do**:
  - Do not implement target type definitions (use string arrays)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15-18)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 1-4, Task 12

  **Acceptance Criteria**:
  - All cost fields render as numeric inputs
  - Range fields render correctly
  - CardinalDirectionOnly checkbox works
  - ValidTargets and AffectedUnits accept comma-separated values

  **QA Scenarios**:
  ```
  Scenario: Costs form updates store
    Tool: Playwright
    Steps:
      1. Select a skill
      2. Change AP cost to 3, Mana to 10
      3. Verify store updated
    Expected Result: Costs saved correctly
    Evidence: .sisyphus/evidence/task-14-costs.png
  ```

  **Commit**: YES (groups with 15, 18)
  - Message: `feat(ui): add skill cost, range, AoE, and action forms`
  - Files: `src/components/weapon-skill/CostsAndRangeForm.tsx`

- [x] 15. Create AreaOfEffectForm component

  **What to do**:
  - Create `src/components/weapon-skill/AreaOfEffectForm.tsx`
  - Form fields: originX, originY (numeric inputs), pattern (textarea for ASCII grid)
  - Pattern preview showing the AoE shape
  - Use Slider for origin offsets
  - Validate pattern format

  **Must NOT do**:
  - Do not implement complex pattern validation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 16-18)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 1-4, Task 12

  **Acceptance Criteria**:
  - Origin X/Y inputs work
  - Pattern textarea accepts multi-line ASCII
  - Preview shows pattern correctly
  - Changes update store

  **QA Scenarios**:
  ```
  Scenario: AoE pattern preview renders
    Tool: Playwright
    Steps:
      1. Enter pattern in textarea (e.g., "X\nXXX\nX")
      2. Verify preview shows cross shape
    Expected Result: Pattern displayed correctly
    Evidence: .sisyphus/evidence/task-15-aoe.png
  ```

  **Commit**: YES (groups with 14, 18)
  - Files: `src/components/weapon-skill/AreaOfEffectForm.tsx`

- [x] 16. Create AttackActionForm component

  **What to do**:
  - Create `src/components/weapon-skill/AttackActionForm.tsx`
  - Form for: attackType (Physical/Magical/Ranged dropdown), baseDamage (Min/Max), damageMultiplier, criticalChance
  - Checkboxes for effect flags: follow, maneuver, multiHit, armorPiercing
  - All fields bound to store
  - Only shown when Action Type = Attack

  **Must NOT do**:
  - Do not implement effect calculations (UI only)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14-15, 17-18)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 1-4, Task 12

  **Acceptance Criteria**:
  - Attack type dropdown works
  - Damage fields accept numeric values
  - Effect checkboxes toggle correctly
  - Form only visible in Attack mode

  **QA Scenarios**:
  ```
  Scenario: Attack action form saves correctly
    Tool: Playwright
    Steps:
      1. Select Attack action type
      2. Set damage (15-25), multiplier (1.5), crit (10%)
      3. Check multiHit checkbox
      4. Verify store updated
    Expected Result: All attack properties saved
    Evidence: .sisyphus/evidence/task-16-attack.png
  ```

  **Commit**: YES (groups with 17)
  - Message: `feat(ui): add AttackActionForm and GenericActionForm components`
  - Files: `src/components/weapon-skill/AttackActionForm.tsx`

- [x] 17. Create GenericActionForm component

  **What to do**:
  - Create `src/components/weapon-skill/GenericActionForm.tsx`
  - Form for: actionType (dropdown), parameters (dynamic key-value pairs)
  - Support for effect types: RegenStatEffect, BuffEffect, DebuffEffect, PoisonEffect, StunEffect, RemoveStatusEffect
  - Each effect type shows relevant parameter inputs
  - Dynamic form based on selected action type

  **Must NOT do**:
  - Do not implement all 30+ effect types (implement common 6)

  **Recommended Agent Profile**:
  - **Category**: `artistry`
    - Reason: Complex dynamic forms with conditional rendering
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14-16, 18)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 1-4, Task 12

  **Acceptance Criteria**:
  - Action type dropdown works
  - Parameters section shows dynamic inputs
  - Different effect types show different fields
  - Changes update store

  **QA Scenarios**:
  ```
  Scenario: Generic action form handles different effect types
    Tool: Playwright
    Steps:
      1. Select BuffEffect type
      2. Verify buff-specific fields shown
      3. Change to PoisonEffect
      4. Verify poison-specific fields shown
    Expected Result: Correct fields per effect type
    Evidence: .sisyphus/evidence/task-17-generic.png
  ```

  **Commit**: YES (groups with 16)
  - Files: `src/components/weapon-skill/GenericActionForm.tsx`

- [x] 18. Create CastFXForm and ConditionsForm

  **What to do**:
  - Create `src/components/weapon-skill/CastFXForm.tsx` for: vfx, sound, camShake, casterAnim
  - Create `src/components/weapon-skill/ConditionsForm.tsx` for: phase, targetInRange, inWatchtower
  - Simple form inputs (text for IDs, number for camShake, checkboxes for booleans)
  - Both forms used in SkillEditor

  **Must NOT do**:
  - Do not validate VFX/sound IDs (accept any string)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14-17)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 1-4, Task 12

  **Acceptance Criteria**:
  - CastFX form has all 4 fields
  - Conditions form has all 3 fields
  - Both forms update store correctly

  **QA Scenarios**:
  ```
  Scenario: CastFX form saves values
    Tool: Playwright
    Steps:
      1. Enter VFX ID "fire_burst", sound "cast_fire"
      2. Set camShake to 0.5
      3. Verify store updated
    Expected Result: All FX values saved
    Evidence: .sisyphus/evidence/task-18-castfx.png
  ```

  **Commit**: YES (groups with 14, 15)
  - Files: `src/components/weapon-skill/CastFXForm.tsx, src/components/weapon-skill/ConditionsForm.tsx`

- [x] 19. Integrate XML export into WeaponEditor

  **What to do**:
  - Update `src/components/weapon-skill/WeaponEditor.tsx`
  - Wire up Save button to call XML export utility
  - Convert WeaponDefinition from store to XML string using exportWeapons()
  - Display export preview or trigger file download
  - Handle errors gracefully with toasts

  **Must NOT do**:
  - Do not implement file system access yet (Task 22)
  - Do not modify the XML parser

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Integration of multiple systems (store, XML, UI)
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (after Tasks 10-11, 5)
  - **Blocks**: Task 24
  - **Blocked By**: Tasks 5, 10-11

  **Acceptance Criteria**:
  - Save button generates valid XML
  - XML matches game format
  - Toast shown on success/error
  - No TypeScript errors

  **QA Scenarios**:
  ```
  Scenario: Weapon export generates valid XML
    Tool: Playwright + Bash
    Steps:
      1. Edit a weapon in editor
      2. Click Export button
      3. Capture generated XML
      4. Parse XML with parser and verify data matches
    Expected Result: Valid XML with correct weapon data
    Evidence: .sisyphus/evidence/task-19-export.xml
  ```

  **Commit**: YES (groups with 20)
  - Message: `feat(xml): integrate XML export into weapon and skill editors`
  - Files: `src/components/weapon-skill/WeaponEditor.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [x] 20. Integrate XML export into SkillEditor

  **What to do**:
  - Update `src/components/weapon-skill/SkillEditor.tsx`
  - Wire up Save button to call exportSkills() utility
  - Convert SkillDefinition from store to XML string
  - Handle all effect types in export
  - Display export preview or trigger download

  **Must NOT do**:
  - Do not modify the XML parser

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (after Tasks 12-18, 5)
  - **Blocks**: Task 24
  - **Blocked By**: Tasks 5, 12-18

  **Acceptance Criteria**:
  - Save button generates valid XML
  - All effect types exported correctly
  - XML matches game format
  - Toast shown on success/error

  **QA Scenarios**:
  ```
  Scenario: Skill export generates valid XML with effects
    Tool: Playwright + Bash
    Steps:
      1. Edit a skill with multiple effects
      2. Click Export button
      3. Capture XML and parse back
      4. Verify all effects preserved
    Expected Result: Valid XML with all skill data
    Evidence: .sisyphus/evidence/task-20-export.xml
  ```

  **Commit**: YES (groups with 19)
  - Files: `src/components/weapon-skill/SkillEditor.tsx`

- [ ] 21. Update App.tsx to use WeaponSkillTab

  **What to do**:
  - Update `src/App.tsx` WeaponSkillContent component
  - Replace placeholder with actual WeaponSkillTab component
  - Ensure proper imports
  - Remove any unused imports

  **Must NOT do**:
  - Do not change other tabs or layout

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (after Task 9)
  - **Blocks**: Task 24
  - **Blocked By**: Task 9

  **Acceptance Criteria**:
  - WeaponSkillContent renders WeaponSkillTab
  - No TypeScript errors
  - Tab switch works in App

  **QA Scenarios**:
  ```
  Scenario: WeaponSkill tab renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to app
      2. Click "武器与技能" tab
      3. Verify WeaponSkillTab renders
    Expected Result: Tab shows weapon/skill editor
    Evidence: .sisyphus/evidence/task-21-tab.png
  ```

  **Commit**: YES
  - Message: `feat(ui): integrate WeaponSkillTab into App.tsx`
  - Files: `src/App.tsx`

- [x] 22. Create file import/export handlers (File API)

  **What to do**:
  - Create `src/lib/file-io.ts` with loadXmlFile() and saveXmlFile() functions
  - Use browser File API for file selection and download
  - loadXmlFile(): Open file picker, read file as ArrayBuffer, detect encoding (UTF-16 BOM), return string
  - saveXmlFile(): Create blob with UTF-16 LE BOM, trigger download with filename
  - Handle errors (file too large, wrong format, permission denied)

  **Must NOT do**:
  - Do not use Node.js fs module (browser only)
  - Do not skip BOM handling

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Binary encoding handling, browser API integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (after Task 5)
  - **Blocks**: Task 24
  - **Blocked By**: Task 5 (XML parsers)

  **Acceptance Criteria**:
  - loadXmlFile() opens file picker and returns file content
  - saveXmlFile() triggers download with correct filename
  - UTF-16 BOM properly handled in both directions
  - Error handling with toast notifications

  **QA Scenarios**:
  ```
  Scenario: Load weapon XML file
    Tool: Playwright
    Steps:
      1. Create test XML file with UTF-16 encoding
      2. Trigger file picker via Load button
      3. Select file
      4. Verify weapons loaded into TreeView
    Expected Result: Weapons displayed in tree
    Evidence: .sisyphus/evidence/task-22-load.png

  Scenario: Export saves file with UTF-16 BOM
    Tool: Playwright + Bash
    Steps:
      1. Export weapons to file
      2. Read downloaded file as bytes
      3. Verify first 2 bytes are FF FE (UTF-16 LE BOM)
    Expected Result: File has correct BOM
    Evidence: .sisyphus/evidence/task-22-export.hex
  ```

  **Commit**: YES
  - Message: `feat(io): add file import/export handlers with UTF-16 support`
  - Files: `src/lib/file-io.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 23. Add localization display support

  **What to do**:
  - Update WeaponTreeView and SkillTreeView to use localization
  - Add language selector dropdown in WeaponSkillTab toolbar
  - Load localization from file or bundle
  - Display translated names in TreeView and forms
  - Fall back to English if translation missing

  **Must NOT do**:
  - Do not implement translation editing (display only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (after Task 6)
  - **Blocks**: Task 24
  - **Blocked By**: Task 6 (localization loader)

  **Acceptance Criteria**:
  - Language selector shows 6 languages
  - Changing language updates displayed names
  - Missing translations fall back to English
  - TreeView shows translated names

  **QA Scenarios**:
  ```
  Scenario: Language switch updates display
    Tool: Playwright
    Steps:
      1. View weapons in English
      2. Switch to 简体中文
      3. Verify names show Chinese translations
    Expected Result: Translated names displayed
    Evidence: .sisyphus/evidence/task-23-i18n.png
  ```

  **Commit**: YES (groups with 22)
  - Message: `feat(i18n): add localization display to weapon/skill editors`
  - Files: `src/components/weapon-skill/WeaponTreeView.tsx, src/components/weapon-skill/SkillTreeView.tsx, src/components/weapon-skill/WeaponSkillTab.tsx`

- [ ] 24. End-to-end integration testing

  **What to do**:
  - Create comprehensive Playwright test scenarios
  - Test full workflow: load file → edit weapon → edit skill → export file
  - Test all UI interactions (TreeView selection, form edits, view switching)
  - Test error scenarios (invalid XML, missing fields, etc.)
  - Capture screenshots for all major features

  **Must NOT do**:
  - Do not skip any major feature

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Comprehensive integration testing
  - **Skills**: [`/playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Tasks 1-23 (all features must be complete)

  **Acceptance Criteria**:
  - All Playwright tests pass
  - All features demonstrated in test scenarios
  - Screenshots captured for documentation
  - No console errors during tests

  **QA Scenarios**:
  ```
  Scenario: Full weapon edit workflow
    Tool: Playwright
    Steps:
      1. Load weapons from XML file
      2. Select weapon from tree
      3. Edit basic info (category, hands, tags)
      4. Add level 3 with damage 20-30, price 150
      5. Add stat bonus (Strength=10)
      6. Export and verify file saved
    Expected Result: All changes saved and exported correctly
    Evidence: .sisyphus/evidence/task-24-weapon-workflow.png

  Scenario: Full skill edit workflow
    Tool: Playwright
    Steps:
      1. Load skills from XML file
      2. Select skill from tree
      3. Edit basic info
      4. Set costs (AP=3, Mana=10)
      5. Configure Attack action with physical damage
      6. Add MultiHit effect
      7. Export and verify
    Expected Result: All skill data saved and exported
    Evidence: .sisyphus/evidence/task-24-skill-workflow.png
  ```

  **Commit**: NO (testing only)

- [ ] 25. Polish and edge case handling

  **What to do**:
  - Add loading states for file operations
  - Add confirmation dialogs for destructive actions (delete weapon/skill/level)
  - Handle edge cases: empty files, corrupted XML, very large files
  - Add keyboard shortcuts (Ctrl+S for save, Ctrl+O for open)
  - Improve error messages with specific guidance
  - Add tooltips for complex fields

  **Must NOT do**:
  - Do not add new features (polish only)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Comprehensive error handling and UX polish
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 24

  **Acceptance Criteria**:
  - Loading spinner shown during file operations
  - Confirmation dialogs for delete actions
  - Graceful error handling for all edge cases
  - Keyboard shortcuts work
  - Tooltips on hover for complex fields

  **QA Scenarios**:
  ```
  Scenario: Delete confirmation dialog works
    Tool: Playwright
    Steps:
      1. Select a weapon
      2. Click Delete button
      3. Verify confirmation dialog appears
      4. Click Cancel - verify weapon not deleted
      5. Click Delete again and confirm
      6. Verify weapon removed from tree
    Expected Result: Confirmation required, delete works
    Evidence: .sisyphus/evidence/task-25-confirm.png

  Scenario: Keyboard shortcuts work
    Tool: Playwright
    Steps:
      1. Edit a weapon
      2. Press Ctrl+S
      3. Verify save triggered
      4. Press Ctrl+O
      5. Verify file picker opened
    Expected Result: Shortcuts trigger actions
    Evidence: .sisyphus/evidence/task-25-shortcuts.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add polish, error handling, and keyboard shortcuts`
  - Files: Multiple (all weapon-skill components)
  - Pre-commit: `npm run build`

---

## Final Verification Wave

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

- **Wave 1**: `feat(ui): add missing UI components` — select.tsx, textarea.tsx, checkbox.tsx, label.tsx, scroll-area.tsx, card.tsx, collapsible.tsx, slider.tsx, index.ts — `npm run build`
- **Wave 1**: `feat(store): add WeaponSkillStore` — weaponSkillStore.ts, index.ts — `npx tsc --noEmit`
- **Wave 1**: `feat(xml): add XML parsers` — weapon-xml-parser.ts, skill-xml-parser.ts — `npx tsc --noEmit`
- **Wave 1**: `feat(i18n): add localization loader` — localization.ts
- **Wave 2**: `feat(ui): add TreeView components` — WeaponTreeView.tsx, SkillTreeView.tsx — `npm run build`
- **Wave 2**: `feat(ui): add WeaponSkillTab container` — WeaponSkillTab.tsx
- **Wave 2**: `feat(ui): add WeaponEditor components` — WeaponEditor.tsx, WeaponLevelForm.tsx
- **Wave 2**: `feat(ui): add SkillEditor components` — SkillEditor.tsx, SkillBasicInfoForm.tsx
- **Wave 3**: `feat(ui): add skill effect forms` — CostsAndRangeForm.tsx, AreaOfEffectForm.tsx, AttackActionForm.tsx, GenericActionForm.tsx, CastFXForm.tsx, ConditionsForm.tsx
- **Wave 3**: `feat(xml): integrate XML export` — WeaponEditor.tsx, SkillEditor.tsx
- **Wave 3**: `feat(ui): integrate WeaponSkillTab` — App.tsx
- **Wave 4**: `feat(io): add file handlers` — file-io.ts
- **Wave 4**: `feat(i18n): add localization display` — WeaponTreeView.tsx, SkillTreeView.tsx, WeaponSkillTab.tsx
- **Wave 4**: `feat(ui): add polish and shortcuts` — Multiple components

---

## Success Criteria

### Verification Commands
```bash
npm run build       # Expected: Build completes with no errors
npx tsc --noEmit    # Expected: No TypeScript errors
npm run lint        # Expected: No linting errors
```

### Final Checklist
- [ ] All "Must Have" present (UTF-16 XML, custom TreeView, all levels 0-5, all effect types, category grouping)
- [ ] All "Must NOT Have" absent (no IndexedDB, no unit tests, no drag-drop, no React Hook Form)
- [ ] All QA scenarios pass (evidence files in .sisyphus/evidence/)
- [ ] Final Verification Wave F1-F4 all APPROVE
- [ ] User explicitly okayed the completed work
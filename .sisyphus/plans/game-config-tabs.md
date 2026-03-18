# 游戏配置页签实现 (Game Configuration Tabs)

## TL;DR

> **Quick Summary**: 实现完整的 9 个游戏配置页签 UI 组件，绑定现有 Zustand store，使用 shadcn/ui 组件库和 fast-xml-parser。
> 
> **Deliverables**:
> - shadcn/ui 组件：Tabs, Select, Card, Label, Textarea, Dialog
> - 9 个配置页签组件 (基础配置，生成配置，敌人波次，精英配置，腐化配置，迷雾配置，资源，波次定义，生成方向)
> - ConfigTabs 容器组件
> - 集成到 App.tsx 替换 GameConfigContent 占位符
> 
> **Estimated Effort**: Medium-Large (10-13 hours)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Worktree 设置 → shadcn 安装 → ConfigTabs → BasicConfigTab → 其他页签 → App 集成

---

## Context

### Original Request
推进游戏配置页签的内容 (Implement game configuration tabs content)
Reference: `doc/tilemap-editor-feature-doc.md` Section 3.4

### Interview Summary
**Key Decisions**:
- UI 组件库：Install shadcn/ui via CLI
- XML 库：fast-xml-parser (已安装)
- 范围：All 9 tabs at once
- 文件导入导出：UI first, import/export later (separate plan)
- 测试策略：Agent QA only (no unit tests)
- 页签语言：Chinese labels
- **开发模式**: Git worktree + feature branch

**Research Findings**:
- `src/types/config.ts` (225 lines) - Complete type definitions
- `src/store/configStore.ts` (571 lines) - 40+ atomic actions with Immer
- App.tsx has GameConfigContent() placeholder stub
- fast-xml-parser@5.5.5 already in package.json
- Only Button and Input UI components exist

### Metis Review
**Identified Gaps** (addressed):
- Night selector pattern → Default: Per-tab local state
- Form interaction → Default: Controlled components (immediate store updates)
- Wave definitions UI → Default: Table + Dialog pattern
- Validation → Default: HTML5 min/max/required only

---

## Work Objectives

### Core Objective
实现 9 个游戏配置页签的完整 UI，绑定到现有 configStore，支持查看所有配置数据并编辑。

### Concrete Deliverables
- `src/components/ui/tabs.tsx` (shadcn)
- `src/components/ui/select.tsx` (shadcn)
- `src/components/ui/card.tsx` (shadcn)
- `src/components/ui/label.tsx` (shadcn)
- `src/components/ui/textarea.tsx` (shadcn)
- `src/components/ui/dialog.tsx` (shadcn)
- `src/components/config/ConfigTabs.tsx`
- `src/components/config/BasicConfigTab.tsx`
- `src/components/config/SpawnConfigTab.tsx`
- `src/components/config/WavesConfigTab.tsx`
- `src/components/config/ElitesConfigTab.tsx`
- `src/components/config/CorruptionConfigTab.tsx`
- `src/components/config/FogConfigTab.tsx`
- `src/components/config/ResourcesConfigTab.tsx`
- `src/components/config/WaveDefinitionsTab.tsx`
- `src/components/config/DirectionsConfigTab.tsx`
- `src/components/config/index.ts`
- `src/App.tsx` (modified GameConfigContent)

### Definition of Done
- [ ] `npm run dev` - App loads without errors
- [ ] `npx tsc --noEmit -p tsconfig.app.json` - Zero TypeScript errors
- [ ] `npm run lint` - Zero ESLint errors
- [ ] `npm run build` - Production build succeeds
- [ ] All 9 tabs render and switch correctly
- [ ] All inputs bind to configStore and update state
- [ ] hasUnsavedChanges flag sets to true on any change

### Must Have
- Chinese tab labels matching feature doc
- Controlled component pattern (immediate store updates)
- HTML5 validation (min/max/required)
- shadcn/ui component patterns (forwardRef, cn() utility)

### Must NOT Have (Guardrails)
- NO file import/export functionality (separate plan)
- NO modifications to config.ts types or configStore.ts logic
- NO shadcn components beyond: tabs, select, card, label, textarea, dialog
- NO Zod validation (HTML5 only)
- NO unit tests (Agent QA only)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (Vitest not installed)
- **Automated tests**: NO (Agent QA only)
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (`/playwright` skill) — Navigate, interact, assert DOM, screenshot
- **Type Check**: Use Bash — `npx tsc --noEmit` with zero errors
- **Lint Check**: Use Bash — `npm run lint` with zero errors
- **Build Check**: Use Bash — `npm run build` succeeds

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Preparation — worktree setup):
└── Task 0: Setup git worktree + feature branch [quick]

Wave 1 (Start Immediately — shadcn/ui components):
├── Task 1: Install shadcn/ui components via CLI [quick]
└── Task 2: Verify shadcn components compile [quick]

Wave 2 (After Wave 1 — container + basic tab):
├── Task 3: Create ConfigTabs container [quick]
├── Task 4: Implement BasicConfigTab [unspecified-high]
└── Task 5: Integrate into App.tsx [quick]

Wave 3 (After Wave 2 — simple tabs in parallel):
├── Task 6: Implement ResourcesConfigTab [quick]
├── Task 7: Implement CorruptionConfigTab [quick]
├── Task 8: Implement FogConfigTab [unspecified-high]
└── Task 9: Implement SpawnConfigTab [unspecified-high]

Wave 4 (After Wave 3 — CRUD tabs in parallel):
├── Task 10: Implement WavesConfigTab [unspecified-high]
├── Task 11: Implement ElitesConfigTab [unspecified-high]
├── Task 12: Implement DirectionsConfigTab [unspecified-high]
└── Task 13: Implement WaveDefinitionsTab (with Dialog) [deep]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 0 → Task 1 → Task 3 → Task 4 → Task 5 → Task 13 → F1-F4 → user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 4 (Waves 3 & 4)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 0 | — | 1-13 |
| 1 | 0 | 2, 3 |
| 2 | 1 | 3 |
| 3 | 1, 2 | 4, 5 |
| 4 | 3 | 5 |
| 5 | 3, 4 | 6-13 |
| 6 | 5 | F1-F4 |
| 7 | 5 | F1-F4 |
| 8 | 5 | F1-F4 |
| 9 | 5 | F1-F4 |
| 10 | 5 | F1-F4 |
| 11 | 5 | F1-F4 |
| 12 | 5 | F1-F4 |
| 13 | 5 | F1-F4 |
| F1-F4 | 6-13 | user okay |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks — `quick` × 2
- **Wave 2**: 3 tasks — `quick` × 2, `unspecified-high` × 1
- **Wave 3**: 4 tasks — `quick` × 2, `unspecified-high` × 2
- **Wave 4**: 4 tasks — `unspecified-high` × 3, `deep` × 1
- **Final**: 4 tasks — `oracle`, `unspecified-high` × 2, `deep`

---

## TODOs

- [ ] 0. 设置 Git Worktree 和特性分支

  **What to do**:
  - 在主工作树执行：`git checkout -b feature/game-config-tabs`
  - 添加 worktree: `git worktree add ../worktrees/config-tabs feature/game-config-tabs`
  - 验证 worktree: `git worktree list`
  - 切换到 worktree 目录：`cd ../worktrees/config-tabs`
  - 安装依赖：`npm install`

  **Must NOT do**:
  - Do NOT delete main worktree
  - Do NOT switch branches in main worktree during development

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`/git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 0 (Preparation)
  - **Blocks**: All tasks (1-13)
  - **Blocked By**: None

  **References**:
  - Git worktree docs: `https://git-scm.com/docs/git-worktree`

  **Acceptance Criteria**:
  - [ ] `git worktree list` shows two worktrees
  - [ ] Worktree directory exists at `../worktrees/config-tabs`
  - [ ] Branch is `feature/game-config-tabs` in worktree
  - [ ] `npm install` succeeds in worktree

  **QA Scenarios**:

  ```
  Scenario: Verify worktree setup
    Tool: Bash
    Preconditions: In main worktree
    Steps:
      1. Run: git worktree list
      2. Verify output shows both worktrees
      3. Verify branch names are correct
    Expected Result: Two worktrees listed with correct branches
    Evidence: .sisyphus/evidence/task-0-worktree-list.txt
  ```

  **Commit**: NO (setup task, no code changes)

- [ ] 1. Install shadcn/ui components via CLI

  **What to do**:
  - Run `npx shadcn@latest add tabs` to install Tabs component
  - Run `npx shadcn@latest add select` to install Select component
  - Run `npx shadcn@latest add card` to install Card component
  - Run `npx shadcn@latest add label` to install Label component
  - Run `npx shadcn@latest add textarea` to install Textarea component
  - Run `npx shadcn@latest add dialog` to install Dialog component
  - Verify components are created in `src/components/ui/`

  **Must NOT do**:
  - Do NOT install additional components beyond these 6
  - Do NOT modify existing Button or Input components

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward CLI command execution, no complex logic
  - **Skills**: [`/git-master`]
    - `/git-master`: Track component additions in git history

  **Parallelization**:
    - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1 start)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: Task 0

  **References**:
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/tabs` - Tabs API and usage
  - Existing pattern: `src/components/ui/button.tsx` - Component structure to match
  - Utils: `src/lib/utils.ts` - cn() utility used by shadcn components

  **Acceptance Criteria**:
  - [ ] 6 new files exist in `src/components/ui/`: tabs.tsx, select.tsx, card.tsx, label.tsx, textarea.tsx, dialog.tsx
  - [ ] `npx tsc --noEmit -p tsconfig.app.json` passes with zero errors
  - [ ] Each component exports default + variant types (matching button.tsx pattern)

  **QA Scenarios**:

  ```
  Scenario: Verify shadcn components compile
    Tool: Bash
    Preconditions: In worktree directory
    Steps:
      1. Run: npx tsc --noEmit -p tsconfig.app.json
      2. Check exit code is 0
      3. Verify no error output
    Expected Result: TypeScript compilation succeeds with zero errors
    Evidence: .sisyphus/evidence/task-1-tsc-check.txt

  Scenario: Verify all 6 component files exist
    Tool: Bash
    Preconditions: In worktree directory
    Steps:
      1. Run: ls src/components/ui/*.tsx
      2. Verify output contains: tabs.tsx, select.tsx, card.tsx, label.tsx, textarea.tsx, dialog.tsx
    Expected Result: All 6 files listed in directory
    Evidence: .sisyphus/evidence/task-1-files-exist.txt
  ```

  **Commit**: YES (groups with 2)
  - Message: `chore(ui): install shadcn/ui components (tabs, select, card, label, textarea, dialog)`
  - Files: `src/components/ui/tabs.tsx`, `src/components/ui/select.tsx`, `src/components/ui/card.tsx`, `src/components/ui/label.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/dialog.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 2. Verify shadcn components compile and export correctly

  **What to do**:
  - Read each new shadcn component file
  - Verify structure matches existing button.tsx pattern (forwardRef, cn() usage, displayName)
  - Check that all components export correctly
  - Fix any TypeScript errors if present

  **Must NOT do**:
  - Do NOT modify shadcn component internals (they are generated)
  - Do NOT add custom styles beyond shadcn defaults

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple verification, no implementation needed
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - Existing pattern: `src/components/ui/button.tsx:1-57` - Component structure reference
  - Utils: `src/lib/utils.ts:1-12` - cn() function

  **Acceptance Criteria**:
  - [ ] Each component uses `cn()` utility for className
  - [ ] Each component uses `React.forwardRef` pattern
  - [ ] Each component has `displayName` set
  - [ ] `src/components/ui/index.ts` exports all 6 new components

  **QA Scenarios**:

  ```
  Scenario: Import all shadcn components in test file
    Tool: Bash
    Preconditions: In project root
    Steps:
      1. Create temp test file importing all components
      2. Run: npx tsc --noEmit temp-test.tsx
      3. Verify no import errors
    Expected Result: All components importable without errors
    Evidence: .sisyphus/evidence/task-2-imports.txt
  ```

  **Commit**: YES (groups with 1)
  - Message: `chore(ui): install shadcn/ui components (tabs, select, card, label, textarea, dialog)`
  - Files: `src/components/ui/index.ts` (updated exports)
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 3. Create ConfigTabs container component

  **What to do**:
  - Create `src/components/config/ConfigTabs.tsx`
  - Use shadcn Tabs component as container
  - Create 9 tab triggers with Chinese labels:
    - 基础配置，生成配置，敌人波次，精英配置，腐化配置，迷雾配置，资源，波次定义，生成方向
  - Create 9 tab content panels (stub components for now)
  - Bind active tab to configStore.ui.activeTab
  - Add data-testid attributes for QA

  **Must NOT do**:
  - Do NOT implement full tab content yet (that's Tasks 4-13)
  - Do NOT modify App.tsx yet (that's Task 5)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Container component, straightforward shadcn Tabs usage
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: shadcn/ui component composition patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2 start)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: Tasks 1, 2

  **References**:
  - shadcn Tabs: `src/components/ui/tabs.tsx` - Tabs, TabsList, TabsTrigger, TabsContent
  - Store pattern: `src/store/configStore.ts:183-571` - useConfigStore hook
  - UI state: `src/types/config.ts:129-151` - ConfigUIState, ConfigTab type

  **Acceptance Criteria**:
  - [ ] ConfigTabs.tsx created with shadcn Tabs structure
  - [ ] All 9 tab triggers render with Chinese labels
  - [ ] Clicking tab updates configStore.ui.activeTab
  - [ ] Active tab content panel is visible
  - [ ] Each tab has data-testid="tab-{name}"

  **QA Scenarios**:

  ```
  Scenario: ConfigTabs renders all 9 tab triggers
    Tool: Playwright
    Preconditions: App running at localhost:5173, navigated to game config
    Steps:
      1. Navigate to: localhost:5173
      2. Click feature tab: [data-feature-tab="gameConfig"]
      3. Find all tab triggers: [role="tab"]
      4. Count triggers (should be 9)
      5. Verify labels: 基础配置，生成配置，敌人波次，精英配置，腐化配置，迷雾配置，资源，波次定义，生成方向
    Expected Result: 9 tab triggers visible with correct Chinese labels
    Evidence: .sisyphus/evidence/task-3-tab-triggers.png

  Scenario: Tab switching updates activeTab in store
    Tool: Playwright
    Preconditions: ConfigTabs rendered, Basic tab active
    Steps:
      1. Click tab trigger: [data-testid="tab-生成配置"]
      2. Wait 100ms for state update
      3. Verify tab content panel visible: [data-testid="tabpanel-spawn"]
      4. Verify tab trigger has aria-selected="true"
    Expected Result: Spawn config tab becomes active, content panel visible
    Evidence: .sisyphus/evidence/task-3-tab-switch.png
  ```

  **Commit**: YES
  - Message: `feat(config): create ConfigTabs container with 9 tab triggers`
  - Files: `src/components/config/ConfigTabs.tsx`, `src/components/config/index.ts`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 4. Implement BasicConfigTab (基础配置)

  **What to do**:
  - Create `src/components/config/BasicConfigTab.tsx`
  - Implement 6 fields from feature-doc Section 3.4 页签 1:
    - 地图 ID (mapId) - Input
    - 胜利天数 (victoryDays) - Input (number, min=1)
    - 难度 (difficulty) - Select ("1"-"5")
    - 敌人偏移 (enemiesOffset) - Input (number)
    - 最大符文点 (maxGlyphPoints) - Input (number)
    - Fog ID (fogId) - Input (read-only, same as mapId)
  - Add template selector dropdown (TutorialMap, Lakeburg, Glenwald, Elderlicht, Glintfein)
  - Bind all inputs to configStore actions
  - Add data-testid attributes for QA

  **Must NOT do**:
  - Do NOT add fields beyond the 6 specified + template selector
  - Do NOT implement validation beyond HTML5 min/max

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex form with multiple field types and template application
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: Form layout, shadcn Input/Select composition

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2, after Task 3)
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:579-589` - Basic config fields
  - Store actions: `src/store/configStore.ts:212-244` - setMapId, setVictoryDays, setDifficulty, etc.
  - Templates: `src/types/config.ts:155-225` - CITY_TEMPLATES
  - shadcn Input: `src/components/ui/input.tsx` - Input component
  - shadcn Select: `src/components/ui/select.tsx` - Select component

  **Acceptance Criteria**:
  - [ ] All 6 fields render with correct labels (Chinese)
  - [ ] Template selector applies correct values on change
  - [ ] Each input updates configStore on change
  - [ ] hasUnsavedChanges sets to true on any input change
  - [ ] HTML5 validation: victoryDays min=1, maxGlyphPoints min=0

  **QA Scenarios**:

  ```
  Scenario: BasicConfigTab displays initial values from store
    Tool: Playwright
    Preconditions: App running, configStore has default Lakeburg values
    Steps:
      1. Navigate to game config tab
      2. Find mapId input: [data-testid="mapId-input"]
      3. Find victoryDays input: [data-testid="victoryDays-input"]
      4. Verify values: "NewMap" and "12"
    Expected Result: Inputs display initial store values
    Evidence: .sisyphus/evidence/task-4-initial-values.png

  Scenario: Apply Lakeburg template
    Tool: Playwright
    Preconditions: BasicConfigTab rendered
    Steps:
      1. Select template: [data-testid="template-select"] → "Lakeburg"
      2. Wait 200ms
      3. Verify victoryDays = "12"
      4. Verify difficulty = "2"
      5. Verify maxGlyphPoints = "5"
      6. Verify gold = "300" (in Resources tab, but triggered here)
    Expected Result: All template values applied correctly
    Evidence: .sisyphus/evidence/task-4-apply-template.png

  Scenario: Edit mapId triggers unsaved changes
    Tool: Playwright
    Preconditions: BasicConfigTab rendered, no unsaved changes
    Steps:
      1. Type "Test_Map_123" into mapId input
      2. Wait 100ms
      3. Find "Unsaved changes" indicator or check store.ui.hasUnsavedChanges
    Expected Result: Unsaved changes flag set to true
    Evidence: .sisyphus/evidence/task-4-unsaved-changes.png

  Scenario: HTML5 validation prevents negative victoryDays
    Tool: Playwright
    Preconditions: BasicConfigTab rendered
    Steps:
      1. Find victoryDays input: [data-testid="victoryDays-input"]
      2. Verify input has attribute min="1"
      3. Try to type "-5"
      4. Verify input rejects or browser shows validation message
    Expected Result: Input has min="1" attribute, rejects negative values
    Evidence: .sisyphus/evidence/task-4-validation.png
  ```

  **Commit**: YES
  - Message: `feat(config): implement BasicConfigTab with template selector`
  - Files: `src/components/config/BasicConfigTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 5. Integrate ConfigTabs into App.tsx

  **What to do**:
  - Open `src/App.tsx`
  - Find GameConfigContent() function (line ~414)
  - Replace placeholder stub with ConfigTabs component
  - Import ConfigTabs from `src/components/config`
  - Test navigation: FeatureTabs → 游戏配置 → ConfigTabs visible

  **Must NOT do**:
  - Do NOT modify other parts of App.tsx
  - Do NOT change Header, FeatureTabs, or MapEditorContent

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple integration, single component swap
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2, after Task 4)
  - **Blocks**: Tasks 6-13 (all other tabs)
  - **Blocked By**: Tasks 3, 4

  **References**:
  - App.tsx: `src/App.tsx:414-428` - GameConfigContent() placeholder
  - ConfigTabs: `src/components/config/ConfigTabs.tsx` - Export

  **Acceptance Criteria**:
  - [ ] GameConfigContent renders ConfigTabs component
  - [ ] Navigation flow works: Home → FeatureTabs 游戏配置 → ConfigTabs visible
  - [ ] No TypeScript errors in App.tsx
  - [ ] All 9 tab triggers visible after navigation

  **QA Scenarios**:

  ```
  Scenario: Navigate to Game Config feature tab
    Tool: Playwright
    Preconditions: App running at localhost:5173
    Steps:
      1. Navigate to: localhost:5173
      2. Click feature tab: [data-feature-tab="gameConfig"]
      3. Wait 200ms
      4. Find ConfigTabs container: [data-testid="config-tabs"]
    Expected Result: ConfigTabs container visible, all 9 tab triggers rendered
    Evidence: .sisyphus/evidence/task-5-nav-integration.png

  Scenario: Tab switching persists after navigation away and back
    Tool: Playwright
    Preconditions: On game config, Spawn tab active
    Steps:
      1. Click feature tab: [data-feature-tab="地图编辑器"]
      2. Wait 100ms
      3. Click feature tab: [data-feature-tab="游戏配置"]
      4. Verify Spawn tab still active: [data-testid="tab-生成配置"][aria-selected="true"]
    Expected Result: Previously active tab restored
    Evidence: .sisyphus/evidence/task-5-tab-persistence.png
  ```

  **Commit**: YES
  - Message: `feat(config): integrate ConfigTabs into App.tsx`
  - Files: `src/App.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 6. Implement ResourcesConfigTab (资源)

  **What to do**:
  - Create `src/components/config/ResourcesConfigTab.tsx`
  - Implement 3 fields from feature-doc Section 3.4 页签 7:
    - 初始金币 (gold) - Input (number, min=0)
    - 初始材料 (materials) - Input (number, min=0)
    - 初始诅咒灵魂 (damnedSouls) - Input (number, min=0, optional)
  - Use shadcn Card for layout
  - Bind to configStore.resourceConfig
  - Add data-testid attributes

  **Must NOT do**:
  - Do NOT add extra fields
  - Do NOT implement validation beyond HTML5

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple form with 3 number inputs
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 9)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 5

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:626-631` - Resources fields
  - Store actions: `src/store/configStore.ts:503-520` - setGold, setMaterials, setDamnedSouls
  - shadcn Card: `src/components/ui/card.tsx` - Card, CardContent, CardHeader

  **Acceptance Criteria**:
  - [ ] 3 inputs render with Chinese labels
  - [ ] Inputs bound to resourceConfig values
  - [ ] Changes update store and set hasUnsavedChanges

  **QA Scenarios**:

  ```
  Scenario: Resources tab displays initial values
    Tool: Playwright
    Preconditions: App running, navigated to Resources tab
    Steps:
      1. Navigate to game config → Resources tab
      2. Find gold input: [data-testid="gold-input"]
      3. Find materials input: [data-testid="materials-input"]
      4. Verify values: "300" and "50" (default Lakeburg)
    Expected Result: Inputs show default resource values
    Evidence: .sisyphus/evidence/task-6-initial-values.png

  Scenario: Edit gold triggers store update
    Tool: Playwright
    Preconditions: Resources tab rendered
    Steps:
      1. Type "500" into gold input
      2. Wait 100ms
      3. Verify input value is "500"
      4. Verify unsaved changes indicator visible
    Expected Result: Gold value updated, unsaved changes flag set
    Evidence: .sisyphus/evidence/task-6-edit-gold.png
  ```

  **Commit**: YES (groups with 7, 8)
  - Message: `feat(config): implement Resources, Corruption, Fog tabs`
  - Files: `src/components/config/ResourcesConfigTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 7. Implement CorruptionConfigTab (腐化配置)

  **What to do**:
  - Create `src/components/config/CorruptionConfigTab.tsx`
  - Implement corruptionByNight table from feature-doc Section 3.4 页签 5:
    - Night selector (dropdown or input)
    - Corruption value input (number, min=0)
    - Add/Remove buttons for each night entry
    - Table showing all configured nights: Night N → Value
  - Bind to configStore.corruptionConfig.corruptionByNight (Map)
  - Use shadcn Card and Table pattern

  **Must NOT do**:
  - Do NOT implement corruption calculation logic (store handles this)
  - Do NOT add fields beyond night/value pairs

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple CRUD table pattern
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8, 9)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 5

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:613-618` - Corruption config
  - Store actions: `src/store/configStore.ts:450-462` - setCorruption, removeCorruption
  - Type: `src/types/config.ts:85-89` - CorruptionConfig

  **Acceptance Criteria**:
  - [ ] Table shows all configured nights with corruption values
  - [ ] Can add new night entry
  - [ ] Can remove existing night entry
  - [ ] Changes update store

  **QA Scenarios**:

  ```
  Scenario: Add corruption entry for night 5
    Tool: Playwright
    Preconditions: Corruption tab rendered
    Steps:
      1. Enter night: [data-testid="corruption-night-input"] → "5"
      2. Enter value: [data-testid="corruption-value-input"] → "100"
      3. Click "Add" button: [data-action="add-corruption"]
      4. Verify row appears in table: Night 5 | 100
    Expected Result: New row added to table, store updated
    Evidence: .sisyphus/evidence/task-7-add-corruption.png

  Scenario: Remove corruption entry
    Tool: Playwright
    Preconditions: Corruption tab has night 5 entry
    Steps:
      1. Find row for night 5
      2. Click remove button in row: [data-action="remove-corruption-5"]
      3. Verify row removed from table
    Expected Result: Night 5 entry removed
    Evidence: .sisyphus/evidence/task-7-remove-corruption.png
  ```

  **Commit**: YES (groups with 6, 8)
  - Message: `feat(config): implement Resources, Corruption, Fog tabs`
  - Files: `src/components/config/CorruptionConfigTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 8. Implement FogConfigTab (迷雾配置)

  **What to do**:
  - Create `src/components/config/FogConfigTab.tsx`
  - Implement fields from feature-doc Section 3.4 页签 6:
    - 每几天增加迷雾 (increaseEveryXDays) - Input (number, min=1)
    - 初始密度索引 (initialDensityIndex) - Select (0-4)
    - 迷雾密度列表 - Table showing 5 densities (VeryThin/Thin/Average/Dense/VeryDense) with values
    - 日期例外 (dayExceptions) - Add/remove day-specific density overrides
  - Fog densities are fixed 5 entries, editable values
  - Bind to configStore.fogConfig

  **Must NOT do**:
  - Do NOT change the 5 density names (fixed set)
  - Do NOT implement fog calculation logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple field types, table editing, day exceptions
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 9)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 5

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:619-625` - Fog config fields
  - Store actions: `src/store/configStore.ts:464-495` - setFogDensity, setIncreaseEveryXDays, setDayException
  - Type: `src/types/config.ts:91-111` - FogConfig, FogDensityName

  **Acceptance Criteria**:
  - [ ] 5 fog density rows render with editable values
  - [ ] increaseEveryXDays input works
  - [ ] initialDensityIndex dropdown shows 0-4 options
  - [ ] Day exceptions can be added/removed
  - [ ] Changes update store

  **QA Scenarios**:

  ```
  Scenario: Edit fog density values
    Tool: Playwright
    Preconditions: Fog tab rendered
    Steps:
      1. Find VeryThin density input: [data-testid="fog-density-0"]
      2. Change value from "22" to "24"
      3. Verify store updated (check displayed value persists)
    Expected Result: Density value updated and persisted
    Evidence: .sisyphus/evidence/task-8-edit-density.png

  Scenario: Add day exception for night 11
    Tool: Playwright
    Preconditions: Fog tab rendered
    Steps:
      1. Enter day: [data-testid="exception-day-input"] → "11"
      2. Select density: [data-testid="exception-density-select"] → "VeryThin"
      3. Click "Add Exception" button
      4. Verify exception row appears: Night 11 → VeryThin
    Expected Result: Day exception added
    Evidence: .sisyphus/evidence/task-8-add-exception.png
  ```

  **Commit**: YES (groups with 6, 7)
  - Message: `feat(config): implement Resources, Corruption, Fog tabs`
  - Files: `src/components/config/FogConfigTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 9. Implement SpawnConfigTab (生成配置)

  **What to do**:
  - Create `src/components/config/SpawnConfigTab.tsx`
  - Implement fields from feature-doc Section 3.4 页签 2:
    - 每晚生成倍率 (spawnMultipliers) - Table with Night N → Multiplier pairs, add/remove
    - 每波公式 (spawnsPerWaveFormula) - Textarea (default: "60 + Night * Multiplier")
    - 最大生成距离 (maxDistancePerDay) - Table with Night N → Distance pairs, add/remove
    - 禁止敌人 (disallowedEnemies) - Multi-select or comma-separated input
    - 每组生成点数 (spawnPointsPerGroup) - Input (number)
    - 生成区域宽度 (spawnPointRectWidth) - Input (number)
    - 生成区域高度 (spawnPointRectHeight) - Input (number)
  - All CRUD operations for tables
  - Bind to configStore.spawnConfig

  **Must NOT do**:
  - Do NOT implement spawn calculation formula parsing
  - Do NOT add fields beyond spec

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple tables, formula textarea, complex state
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 8)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 5

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:590-603` - Spawn config fields
  - Store actions: `src/store/configStore.ts:246-300` - setSpawnMultiplier, setMaxDistancePerDay, etc.
  - Type: `src/types/config.ts:37-60` - SpawnConfig

  **Acceptance Criteria**:
  - [ ] spawnMultipliers table CRUD works
  - [ ] spawnsPerWaveFormula textarea updates on change
  - [ ] maxDistancePerDay table CRUD works
  - [ ] disallowedEnemies input works
  - [ ] spawnPointsPerGroup, rect width/height inputs work
  - [ ] All changes update store

  **QA Scenarios**:

  ```
  Scenario: Add spawn multiplier for night 5
    Tool: Playwright
    Preconditions: Spawn tab rendered
    Steps:
      1. Enter night: [data-testid="multiplier-night-input"] → "5"
      2. Enter multiplier: [data-testid="multiplier-value-input"] → "7.5"
      3. Click "Add Multiplier" button
      4. Verify row appears: Night 5 | 7.5
    Expected Result: Multiplier added to table
    Evidence: .sisyphus/evidence/task-9-add-multiplier.png

  Scenario: Edit spawns per wave formula
    Tool: Playwright
    Preconditions: Spawn tab rendered
    Steps:
      1. Find formula textarea: [data-testid="spawns-formula-textarea"]
      2. Clear and type: "100 + Night * 2"
      3. Wait 100ms
      4. Verify value persists
    Expected Result: Formula updated
    Evidence: .sisyphus/evidence/task-9-edit-formula.png

  Scenario: Add disallowed enemy
    Tool: Playwright
    Preconditions: Spawn tab rendered
    Steps:
      1. Enter enemy ID: [data-testid="disallowed-enemy-input"] → "Shieldman"
      2. Click "Add" button
      3. Verify "Shieldman" appears in disallowed list
    Expected Result: Enemy added to disallowed list
    Evidence: .sisyphus/evidence/task-9-add-disallowed.png
  ```

  **Commit**: YES
  - Message: `feat(config): implement SpawnConfigTab with multiplier and distance tables`
  - Files: `src/components/config/SpawnConfigTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 10. Implement WavesConfigTab (敌人波次)

  **What to do**:
  - Create `src/components/config/WavesConfigTab.tsx`
  - Implement spawnWavesPerDay CRUD from feature-doc Section 3.4 页签 3:
    - Night selector (dropdown 1-20)
    - Table showing waves for selected night: WaveId | Weight | Actions
    - Add wave: WaveId input + Weight input + Add button
    - Remove wave: Remove button per row
  - spawnWavesPerDay is Map<number, Array<[string, number]>>
  - Night-based view (select night, see/edit waves for that night)

  **Must NOT do**:
  - Do NOT implement wave definition editing (that's Task 13)
  - Do NOT add fields beyond waveId/weight pairs

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Night-based CRUD, Map data structure
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 12, 13)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 5

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:604-612` - Waves config
  - Store actions: `src/store/configStore.ts:314-340` - addSpawnWave, removeSpawnWave
  - Type: `src/types/config.ts:42` - spawnWavesPerDay type

  **Acceptance Criteria**:
  - [ ] Night selector dropdown (1-20)
  - [ ] Table shows waves for selected night
  - [ ] Can add wave to selected night
  - [ ] Can remove wave from selected night
  - [ ] Changes update store

  **QA Scenarios**:

  ```
  Scenario: Add wave for night 3
    Tool: Playwright
    Preconditions: Waves tab rendered, night 3 selected
    Steps:
      1. Enter wave ID: [data-testid="wave-id-input"] → "Wave_Test_01"
      2. Enter weight: [data-testid="wave-weight-input"] → "50"
      3. Click "Add Wave" button
      4. Verify row appears: Wave_Test_01 | 50
    Expected Result: Wave added to night 3
    Evidence: .sisyphus/evidence/task-10-add-wave.png

  Scenario: Remove wave from night
    Tool: Playwright
    Preconditions: Waves tab has wave for night 3
    Steps:
      1. Find row with wave "Wave_Test_01"
      2. Click remove button in row
      3. Verify row removed from table
    Expected Result: Wave removed
    Evidence: .sisyphus/evidence/task-10-remove-wave.png
  ```

  **Commit**: YES (groups with 11)
  - Message: `feat(config): implement Waves and Elites config tabs`
  - Files: `src/components/config/WavesConfigTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 11. Implement ElitesConfigTab (精英配置)

  **What to do**:
  - Create `src/components/config/ElitesConfigTab.tsx`
  - Implement elitesPerDay CRUD from feature-doc Section 3.4 页签 4:
    - Night selector (dropdown 1-20)
    - Table showing elites for selected night: Tier | Count | Actions
    - Add elite: Tier select (1/2/3) + Count input + Add button
    - Remove elite: Remove button per row
  - elitesPerDay is Map<number, Array<[number, number]>>
  - Night-based view

  **Must NOT do**:
  - Do NOT implement elite attribute calculations
  - Do NOT add tier options beyond 1/2/3

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Night-based CRUD, tier options
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 12, 13)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 5

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:613-618` - Elites config
  - Store actions: `src/store/configStore.ts:369-399` - setElitesPerDay, removeElitesPerDay
  - Type: `src/types/config.ts:46` - elitesPerDay type

  **Acceptance Criteria**:
  - [ ] Night selector dropdown (1-20)
  - [ ] Table shows elites for selected night with tier/count
  - [ ] Can add elite (tier 1/2/3, count)
  - [ ] Can remove elite
  - [ ] Changes update store

  **QA Scenarios**:

  ```
  Scenario: Add tier 2 elite for night 5
    Tool: Playwright
    Preconditions: Elites tab rendered, night 5 selected
    Steps:
      1. Select tier: [data-testid="elite-tier-select"] → "2"
      2. Enter count: [data-testid="elite-count-input"] → "3"
      3. Click "Add Elite" button
      4. Verify row appears: Tier 2 | 3
    Expected Result: Elite added
    Evidence: .sisyphus/evidence/task-11-add-elite.png

  Scenario: Remove elite entry
    Tool: Playwright
    Preconditions: Elites tab has tier 2 entry for night 5
    Steps:
      1. Find row with tier 2
      2. Click remove button
      3. Verify row removed
    Expected Result: Elite entry removed
    Evidence: .sisyphus/evidence/task-11-remove-elite.png
  ```

  **Commit**: YES (groups with 10)
  - Message: `feat(config): implement Waves and Elites config tabs`
  - Files: `src/components/config/ElitesConfigTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 12. Implement DirectionsConfigTab (生成方向)

  **What to do**:
  - Create `src/components/config/DirectionsConfigTab.tsx`
  - Implement spawnDirections CRUD from feature-doc Section 3.4 页签 9:
    - Night selector (dropdown 1-20)
    - Table showing directions for selected night: DirectionId | Weight | Actions
    - Add direction: DirectionId select + Weight input + Add button
    - Remove direction: Remove button per row
  - Common direction IDs: AllIn_T100-2, Corner_TR-2, Parallel_LR, Four_TopBottom
  - spawnDirections is Map<number, Array<[string, number]>>
  - Night-based view

  **Must NOT do**:
  - Do NOT add direction IDs beyond predefined set
  - Do NOT implement direction logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Night-based CRUD, direction options
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 11, 13)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 5

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:645-649` - Directions config
  - Store actions: `src/store/configStore.ts:342-367` - addSpawnDirection, removeSpawnDirection
  - Type: `src/types/config.ts:44` - spawnDirections type

  **Acceptance Criteria**:
  - [ ] Night selector dropdown (1-20)
  - [ ] Table shows directions for selected night
  - [ ] DirectionId is select dropdown with predefined options
  - [ ] Can add/remove direction
  - [ ] Changes update store

  **QA Scenarios**:

  ```
  Scenario: Add direction for night 1
    Tool: Playwright
    Preconditions: Directions tab rendered, night 1 selected
    Steps:
      1. Select direction: [data-testid="direction-select"] → "AllIn_T100-2"
      2. Enter weight: [data-testid="direction-weight-input"] → "100"
      3. Click "Add Direction" button
      4. Verify row appears: AllIn_T100-2 | 100
    Expected Result: Direction added
    Evidence: .sisyphus/evidence/task-12-add-direction.png

  Scenario: Remove direction entry
    Tool: Playwright
    Preconditions: Directions tab has direction for night 1
    Steps:
      1. Find row with "AllIn_T100-2"
      2. Click remove button
      3. Verify row removed
    Expected Result: Direction removed
    Evidence: .sisyphus/evidence/task-12-remove-direction.png
  ```

  **Commit**: YES (groups with 13)
  - Message: `feat(config): implement Directions and WaveDefinitions tabs`
  - Files: `src/components/config/DirectionsConfigTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

- [ ] 13. Implement WaveDefinitionsTab (波次定义)

  **What to do**:
  - Create `src/components/config/WaveDefinitionsTab.tsx`
  - Implement wave definition CRUD from feature-doc Section 3.4 页签 8:
    - LEFT: Wave definitions list (TreeView or table)
    - RIGHT: Wave detail editor (when wave selected):
      - 波次 ID (id) - Input
      - 生成乘数 (spawnMultiplier) - Input (number)
      - Boss 波次选项 (isBossWave checkbox, bossId input)
      - 无限波次 (isInfinite checkbox)
      - 敌人类型 (enemyTypes) - Table: EnemyId | Weight, add/remove rows
      - Tier 分布 (tierDistribution) - Table: Tier | Multiplier, add/remove rows
      - 时间分布 (timeDistribution) - Table: Turn | Weight, add/remove rows
    - TOP: 新建 / 删除 / 上移 / 下移 / 保存 buttons
  - Use shadcn Dialog for create/edit modal
  - waveDefinitions is SpawnWaveDefinition[] array

  **Must NOT do**:
  - Do NOT implement wave logic calculations
  - Do NOT add fields beyond spec

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Most complex tab - nested data, Dialog, multiple tables, reordering
  - **Skills**: [`/frontend-ui-ux`, `/webapp-testing`]
    - `/frontend-ui-ux`: Complex form layout, Dialog pattern
    - `/webapp-testing`: Playwright for nested UI testing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 11, 12)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 5

  **References**:
  - Feature doc: `doc/tilemap-editor-feature-doc.md:632-644` - Wave definitions
  - Store actions: `src/store/configStore.ts:401-448` - addWaveDefinition, updateWaveDefinition, moveWaveDefinition
  - Type: `src/types/config.ts:62-79` - SpawnWaveDefinition

  **Acceptance Criteria**:
  - [ ] Wave list renders with all definitions
  - [ ] Clicking wave loads details in editor
  - [ ] New wave can be created (opens Dialog)
  - [ ] Wave can be edited and saved
  - [ ] Wave can be deleted
  - [ ] Up/down buttons reorder waves
  - [ ] Nested tables (enemyTypes, tierDistribution, timeDistribution) CRUD works
  - [ ] Boss wave options work (checkbox + ID input)

  **QA Scenarios**:

  ```
  Scenario: Create new wave definition
    Tool: Playwright
    Preconditions: WaveDefinitions tab rendered
    Steps:
      1. Click "新建" (New) button: [data-action="new-wave"]
      2. Dialog opens
      3. Enter wave ID: "Wave_New_Test"
      4. Enter spawn multiplier: "1.5"
      5. Click "保存" (Save) button in dialog
      6. Verify wave appears in list
    Expected Result: New wave created and listed
    Evidence: .sisyphus/evidence/task-13-create-wave.png

  Scenario: Edit wave enemy types
    Tool: Playwright
    Preconditions: Wave selected in editor
    Steps:
      1. Find enemy types table
      2. Enter enemy ID: "Grunt"
      3. Enter weight: "80"
      4. Click "Add Enemy" button
      5. Verify row appears: Grunt | 80
    Expected Result: Enemy type added to wave
    Evidence: .sisyphus/evidence/task-13-add-enemy.png

  Scenario: Reorder waves (move up)
    Tool: Playwright
    Preconditions: Multiple waves in list
    Steps:
      1. Select wave at position 2
      2. Click "上移" (Move Up) button: [data-action="move-up"]
      3. Verify wave moved to position 1
    Expected Result: Wave reordered
    Evidence: .sisyphus/evidence/task-13-move-up.png

  Scenario: Delete wave definition
    Tool: Playwright
    Preconditions: Wave selected in list
    Steps:
      1. Click "删除" (Delete) button: [data-action="delete-wave"]
      2. Confirm dialog if shown
      3. Verify wave removed from list
    Expected Result: Wave deleted
    Evidence: .sisyphus/evidence/task-13-delete-wave.png
  ```

  **Commit**: YES (groups with 12)
  - Message: `feat(config): implement Directions and WaveDefinitions tabs`
  - Files: `src/components/config/WaveDefinitionsTab.tsx`
  - Pre-commit: `npx tsc --noEmit -p tsconfig.app.json`

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
  Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **0**: `N/A` — Worktree setup (no code changes)
- **1-2**: `chore(ui): install shadcn/ui components (tabs, select, card, label, textarea, dialog)` — src/components/ui/*.tsx, src/components/ui/index.ts
- **3**: `feat(config): create ConfigTabs container with 9 tab triggers` — src/components/config/ConfigTabs.tsx, src/components/config/index.ts
- **4**: `feat(config): implement BasicConfigTab with template selector` — src/components/config/BasicConfigTab.tsx
- **5**: `feat(config): integrate ConfigTabs into App.tsx` — src/App.tsx
- **6-8**: `feat(config): implement Resources, Corruption, Fog tabs` — src/components/config/{Resources,Corruption,Fog}ConfigTab.tsx
- **9**: `feat(config): implement SpawnConfigTab with multiplier and distance tables` — src/components/config/SpawnConfigTab.tsx
- **10-11**: `feat(config): implement Waves and Elites config tabs` — src/components/config/{Waves,Elites}ConfigTab.tsx
- **12-13**: `feat(config): implement Directions and WaveDefinitions tabs` — src/components/config/{Directions,WaveDefinitions}Tab.tsx

所有提交都在 `feature/game-config-tabs` 分支中。

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit -p tsconfig.app.json  # Expected: zero errors
npm run lint                            # Expected: zero errors
npm run build                           # Expected: build succeeds
```

### Final Checklist
- [ ] All 9 tabs render with Chinese labels
- [ ] All inputs bind to configStore and update state
- [ ] hasUnsavedChanges flag sets on any change
- [ ] Template selector applies correct values
- [ ] All CRUD tables work (add/remove rows)
- [ ] WaveDefinitions Dialog works
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Production build succeeds
- [ ] All QA scenarios pass with evidence captured

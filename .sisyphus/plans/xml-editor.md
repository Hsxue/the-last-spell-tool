# XML 编辑器集成 - CodeMirror 6（嵌入模式）

## TL;DR

> **Quick Summary**: 为游戏配置界面（武器、技能等）添加 XML 编辑模式切换功能，支持将界面配置对象序列化为 XML 文本进行编辑，编辑完成后反序列化回游戏对象，实现 UI 表单 ↔ XML 文本双向绑定。
> 
> **Deliverables**:
> - `<XMLEditorModal />` 组件（嵌入/弹出式编辑器）
> - XML 序列化/反序列化工具（游戏对象 ↔ XML）
> - 语法高亮（XML 标签、属性、值 / JSON 键、值）
> - 实时语法验证和错误标记
> - 格式化工具和快捷键
> - XML 模式切换 Hook（集成到现有配置界面）
> - 完整的 TDD 测试覆盖（单元 + 集成 + E2E）
> 
> **Estimated Effort**: Medium (8 个任务，5 波执行)
> **Parallel Execution**: YES - 5 waves, max 3 tasks parallel
> **Critical Path**: Task 1 → Task 2 → Task 3/4/5 → Task 6 → Task 7 → Task 8

---

## Context

### Original Request
在游戏配置和武器技能编辑中，增加 XML 文本显示和编辑功能，方便直接使用文本配置。

**使用场景**：
- 在现有游戏配置界面 / 武器技能配置界面中，**嵌入 XML 编辑模式切换功能**
- 用户点击"XML 模式"按钮 → 编辑器弹出/展开 → 显示当前界面配置对象序列化后的 XML
- 用户编辑 XML → 点击"应用" → XML 反序列化回游戏对象 → 界面同步更新
- **双向绑定**：UI 表单 ↔ XML 文本

### Interview Summary
**Key Discussions**:
- **技术栈**: React + TypeScript
- **编辑器选择**: CodeMirror 6 (轻量级 300KB vs Monaco 6MB)
- **功能范围**: 基础语法高亮 + 格式化 + 基础语法验证
- **界面模式**: 纯文本模式（不需要 Split View）
- **使用场景**: **嵌入现有配置界面，作为可选的编辑模式**
- **文件格式**: XML + JSON 双支持
- **文件位置**: **内存文件（游戏对象序列化），非物理文件**
- **数据流**：游戏对象 → XML 序列化 → 编辑 → XML 反序列化 → 游戏对象更新

**Research Findings**:
- Monaco Editor XML 支持弱（官方 GitHub issue 标记"not planned"）
- CodeMirror 6 模块化设计，XML 原生支持优秀
- 游戏配置编辑器最佳实践：语法验证优先，Schema 验证可选后续扩展

### Metis Review
**Identified Gaps** (resolved):
- **文件 I/O 策略**: 支持双模式 — 实际文件（Node.js fs / File System Access API） + 内存文件（虚拟文件系统，对象序列化）
- **项目结构**: 独立路由 `/editor`，单文件编辑模式
- **状态管理**: 组件本地状态 + 手动保存（无自动保存）
- **文件选择**: 原生文件选择对话框（实际文件）或 内存文件加载 API
- **错误显示**: 行号标记 + 状态栏提示
- **多文件**: 单文件编辑（不支持多标签）
- **内存文件支持**: 武器/技能配置可能来自游戏内存对象序列化，需支持虚拟文件路径（如 `virtual://weapons/sword.xml`）

---

## Work Objectives

### Core Objective
为现有游戏配置界面（武器、技能等）添加**XML 编辑模式切换**功能，支持将界面配置对象序列化为 XML 文本进行编辑，编辑完成后反序列化回游戏对象，实现**UI 表单 ↔ XML 文本双向绑定**。

### Concrete Deliverables
- `src/components/XMLEditor/XMLEditorModal.tsx` - 模态框编辑器组件（支持嵌入模式）
- `src/components/XMLEditor/XMLEditorModal.test.tsx` - 单元测试
- `src/utils/xmlSerializer.ts` - 游戏对象 ↔ XML 序列化/反序列化工具
- `src/utils/xmlSerializer.test.ts` - 序列化测试
- `src/utils/xmlValidator.ts` - XML 语法验证工具
- `src/utils/xmlFormatter.ts` - XML 格式化工具
- `src/hooks/useXMLMode.ts` - XML 模式切换 Hook（集成到现有配置界面）
- `e2e/xml-mode.spec.ts` - Playwright E2E 测试（模式切换 + 双向绑定流程）

### Definition of Done
- [ ] `bun test` 全部通过（覆盖率 >90%）
- [ ] `bun test:e2e` 全部通过
- [ ] `bun build` 无错误
- [ ] 手动验证：打开配置界面 → 切换到 XML 模式 → 编辑 XML → 应用 → 界面表单同步更新

### Must Have
- XML 和 JSON 语法高亮
- 实时语法验证（错误标记）
- **游戏对象 ↔ XML 序列化/反序列化工具**
- **XML 模式切换按钮（集成到现有配置界面）**
- 格式化工具（一键美化）
- 键盘快捷键（Ctrl+S 应用，Ctrl+Shift+F 格式化）
- **错误提示：XML 解析失败时显示具体错误位置**
- **应用前验证：确保 XML 有效后才反序列化**
- **模态框/面板：可嵌入或弹出式编辑器**

### Must NOT Have (Guardrails)
- ❌ 独立编辑器页面（嵌入式，非独立页面）
- ❌ XSD/Schema 验证（后续扩展）
- ❌ 多标签或分割视图编辑
- ❌ 文件树导航
- ❌ 自动保存功能（需用户主动点击"应用"）
- ❌ 跨文件搜索/替换
- ❌ 版本控制集成
- ❌ 文件监控/热重载
- ❌ 导出/转换其他格式
- ❌ 直接访问游戏内存（必须通过提供的序列化接口）

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — 所有验证通过测试命令执行。

### Test Decision
- **Infrastructure exists**: YES (项目已有测试框架)
- **Automated tests**: TDD（测试驱动开发）
- **Framework**: vitest + @testing-library/react + Playwright
- **If TDD**: 每个任务遵循 RED → GREEN → REFACTOR 流程

### QA Policy
每个任务必须包含 agent-executed QA scenarios。证据保存到 `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`。

- **组件测试**: @testing-library/react 渲染 + 交互
- **E2E 测试**: Playwright 打开浏览器 → 操作 → 断言 → 截图
- **序列化测试**: 游戏对象 → XML → 游戏对象 往返验证

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - foundation + test infra):
├── Task 1: 项目初始化 + 依赖安装 [quick]
└── Task 8a: 测试基础设施配置 [quick]

Wave 2 (After Wave 1 - core editor):
├── Task 2: 核心编辑器组件 [unspecified-high]
└── Task 8b: 单元测试脚手架 [quick]

Wave 3 (After Wave 2 - MAX PARALLEL features):
├── Task 3: 语法高亮实现 [unspecified-high]
├── Task 4: 语法验证逻辑 [unspecified-high]
└── Task 5: XML 序列化/反序列化 [deep]

Wave 4 (After Wave 3 - UI composition):
├── Task 6: 模态框 UI 集成 [artistry]
└── Task 7: XML 模式切换 Hook [quick]

Wave 5 (After Wave 4 - E2E + verification):
└── Task 8c: E2E 集成测试 [quick]

Critical Path: Task 1 → Task 2 → Task 3/4/5 → Task 6/7 → Task 8
Parallel Speedup: ~40% faster than sequential
Max Concurrent: 3 tasks (Wave 3)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 2, 8a |
| 8a | — | 8b |
| 2 | 1 | 3, 4, 5, 6, 7 |
| 8b | 8a, 1 | 8c |
| 3 | 2 | 6, 8c |
| 4 | 2 | 6, 8c |
| 5 | 2 | 6, 7, 8c |
| 6 | 3, 4, 5 | 8c |
| 7 | 5 | 6, 8c |
| 8c | 6, 7, 3, 4, 5 | — |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks → `quick` (git-master, webapp-testing)
- **Wave 2**: 2 tasks → `unspecified-high` + `quick` (frontend-ui-ux, webapp-testing)
- **Wave 3**: 3 tasks → `unspecified-high` x2 + `deep` (frontend-ui-ux, webapp-testing, git-master)
- **Wave 4**: 2 tasks → `artistry` + `quick` (frontend-ui-ux, webapp-testing)
- **Wave 5**: 1 task → `quick` (playwright, webapp-testing)

---

## TODOs

- [ ] 1. 项目初始化 + 依赖安装

  **What to do**:
  - 向现有项目安装 CodeMirror 6 核心依赖：
    - `@uiw/react-codemirror`
    - `@codemirror/lang-xml`
    - `@codemirror/lang-json`
    - `@codemirror/basic-setup`
    - `@codemirror/lint`
  - 安装格式化工具：`xml-formatter`
  - 安装测试依赖：`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  - 配置 `vitest.config.ts`, 添加测试脚本到 `package.json`
  - 创建基础目录结构：`src/components/XMLEditor/`, `src/hooks/`, `src/utils/`, `e2e/`
  - 验证 `bun dev` 和 `bun test` 可运行

  **Must NOT do**:
  - 不要修改现有组件代码
  - 不要创建编辑器组件
  - 不要配置 Playwright（已存在）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准依赖安装，项目已有基础架构
  - **Skills**: [`git-master`]
    - `git-master`: 需要原子化提交，保持清晰历史
  - **Skills Evaluated but Omitted**:
    - `playwright`: 已配置，不需要重复
    - `frontend-ui-ux`: 仅安装依赖，无 UI 设计

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 8a)
  - **Blocks**: Task 2, Task 8a
  - **Blocked By**: None

  **References**:
  - CodeMirror 6 React 集成：`https://uiwjs.github.io/react-codemirror/`
  - 项目依赖包：`package.json` 中的现有依赖版本

  **Acceptance Criteria**:
  - [ ] `package.json` 包含所有必需依赖
  - [ ] `bun install` 无错误
  - [ ] `bun dev` 启动成功，浏览器打开无控制台错误
  - [ ] `bun test` 运行成功（允许 0 测试）
  - [ ] git 提交：`chore: add CodeMirror 6 and testing dependencies`

  **QA Scenarios**:

  ```
  Scenario: 项目可启动
    Tool: Bash
    Preconditions: 干净的工作目录
    Steps:
      1. 运行 `bun dev`
      2. 等待 Vite 启动完成
      3. 检查输出包含 "Local: http://localhost:5173"
    Expected Result: 进程运行，无错误退出
    Failure Indicators: 报错、崩溃、端口占用
    Evidence: .sisyphus/evidence/task-1-dev-start.log

  Scenario: 测试框架可运行
    Tool: Bash
    Preconditions: 项目已安装依赖
    Steps:
      1. 运行 `bun test`
      2. 检查输出包含 "Vitest" 标识
    Expected Result: 测试运行器正常执行
    Failure Indicators: 配置错误、模块找不到
    Evidence: .sisyphus/evidence/task-1-test-run.log
  ```

  **Commit**: YES
  - Message: `chore: add CodeMirror 6 and vitest dependencies`
  - Files: `package.json`, `vitest.config.ts`
  - Pre-commit: `bun test`

---

- [ ] 8a. 测试基础设施配置

  **What to do**:
  - 验证 Playwright 配置：检查 `playwright.config.ts` 是否存在
  - 配置 vitest：创建 `vitest.config.ts`（如不存在）
  - 配置 @testing-library/react：创建 `src/test/setup.ts`
  - 添加测试脚本到 `package.json`:
    - `"test": "vitest"`
    - `"test:e2e": "playwright test"`
  - 验证 `bun test` 和 `bun test:e2e` 可运行

  **Must NOT do**:
  - 不要修改 Playwright 配置（已存在）
  - 不要编写任何实际测试用例
  - 不要修改业务代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准测试配置流程
  - **Skills**: [`webapp-testing`]
    - `webapp-testing`: Playwright 和 Testing Library 配置专家
  - **Skills Evaluated but Omitted**:
    - `playwright`: 配置已存在，只需验证
    - `frontend-ui-ux`: 配置非 UI 设计

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 8b
  - **Blocked By**: None

  **References**:
  - Vitest 配置：`https://vitest.dev/config/`
  - Testing Library setup：`https://testing-library.com/docs/react-testing-library/setup/`
  - Playwright 配置：`playwright.config.ts` (existing file)

  **Acceptance Criteria**:
  - [ ] `vitest.config.ts` 配置正确，包含 jsdom 环境
  - [ ] `src/test/setup.ts` 配置 @testing-library/jest-dom
  - [ ] `package.json` 包含 `"test": "vitest"` 和 `"test:e2e": "playwright test"`
  - [ ] `bun test` 运行成功
  - [ ] `bun test:e2e` 运行成功（允许 0 测试）

  **QA Scenarios**:

  ```
  Scenario: Vitest 测试运行
    Tool: Bash
    Preconditions: 项目已初始化
    Steps:
      1. 运行 `bun test`
      2. 检查输出包含 "Vitest" 标识
    Expected Result: 测试运行器启动，无配置错误
    Failure Indicators: 配置错误、模块加载失败
    Evidence: .sisyphus/evidence/task-8a-vitest.log

  Scenario: Playwright 测试运行
    Tool: Bash
    Preconditions: Playwright 已安装
    Steps:
      1. 运行 `bun test:e2e`
      2. 检查输出包含 "Playwright" 标识
    Expected Result: E2E 测试运行器启动
    Failure Indicators: 浏览器未安装、配置错误
    Evidence: .sisyphus/evidence/task-8a-playwright.log
  ```

  **Commit**: YES
  - Message: `chore: configure vitest test infrastructure`
  - Files: `vitest.config.ts`, `src/test/setup.ts`, `package.json`
  - Pre-commit: `bun test && bun test:e2e`

---

- [ ] 2. 核心编辑器组件

  **What to do**:
  - 创建 `src/components/XMLEditor/XMLEditorModal.tsx`
  - 实现 Props 接口：
    ```typescript
    interface XMLEditorModalProps {
      isOpen: boolean;
      onClose: () => void;
      value: string;
      onChange?: (value: string) => void;
      language?: 'xml' | 'json';
      onApply?: (value: string) => void;
      readOnly?: boolean;
    }
    ```
  - 集成 CodeMirror 6：
    - 使用 `@uiw/react-codemirror` 的 `<CodeMirror>` 组件
    - 根据 `language` prop 动态切换 `xml()` 或 `json()` 扩展
    - 启用 `basicSetup` 扩展（括号匹配、自动缩进等）
  - 实现模态框布局：
    - 顶部工具栏：格式化按钮、语言切换、应用/取消按钮
    - 中央编辑器区域
    - 底部状态栏：验证状态、光标位置
  - 处理 `onChange` 事件，调用回调
  - 处理键盘快捷键：
    - `Ctrl+S` / `Cmd+S`: 触发 `onApply`
    - `Ctrl+Shift+F` / `Cmd+Shift+F`: 格式化
    - `Escape`: 关闭模态框
  - 编写单元测试：
    - 组件渲染测试（打开/关闭状态）
    - Props 变化测试
    - onChange/onApply 回调测试
    - 快捷键测试

  **Must NOT do**:
  - 不要实现语法验证（Task 4）
  - 不要实现序列化（Task 5）
  - 不要实现模式切换 Hook（Task 7）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 核心组件，需要仔细处理 React + CodeMirror 集成
  - **Skills**: [`frontend-ui-ux`, `webapp-testing`]
    - `frontend-ui-ux`: React 组件架构，CodeMirror 6 扩展模式
    - `webapp-testing`: 组件单元测试，@testing-library/react
  - **Skills Evaluated but Omitted**:
    - `playwright`: 单元测试不需要 E2E
    - `git-master`: 组件迭代不需频繁提交

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: Task 3, Task 4, Task 5, Task 6, Task 7
  - **Blocked By**: Task 1

  **References**:
  - CodeMirror 6 React 示例：`https://uiwjs.github.io/react-codemirror/`
  - CodeMirror 6 语言扩展：`@codemirror/lang-xml`, `@codemirror/lang-json`
  - React 组件测试模式：`https://testing-library.com/docs/react-testing-library/intro/`
  - 现有模态框组件（如有）：参考项目中的 Modal 组件模式

  **Acceptance Criteria**:
  - [ ] `XMLEditorModal.tsx` 导出组件，接受 `isOpen`, `onClose`, `value`, `onChange`, `onApply` props
  - [ ] 组件正确渲染 CodeMirror 容器（含 `.cm-editor` 类）
  - [ ] 模态框打开/关闭动画流畅
  - [ ] 切换 `language` prop 时，编辑器语法模式更新
  - [ ] 输入内容时，`onChange` 回调被调用
  - [ ] 按 `Ctrl+S` 触发 `onApply` 回调
  - [ ] 按 `Escape` 关闭模态框
  - [ ] 单元测试覆盖：`XMLEditorModal.test.tsx` 包含 6+ 测试用例

  **QA Scenarios**:

  ```
  Scenario: 模态框打开/关闭
    Tool: Bash (vitest)
    Preconditions: 组件已创建
    Steps:
      1. 渲染 `<XMLEditorModal isOpen={true} onClose={mock} value="<root/>" />`
      2. 断言：模态框可见，`.cm-editor` 存在
      3. 模拟点击关闭按钮
      4. 断言：`onClose` 被调用
    Expected Result: 模态框正确显示和关闭
    Failure Indicators: 模态框不显示、关闭无响应
    Evidence: .sisyphus/evidence/task-2-modal-toggle.log

  Scenario: 快捷键触发
    Tool: Bash (vitest)
    Preconditions: 模态框已打开
    Steps:
      1. 渲染组件，聚焦编辑器
      2. 模拟 `Ctrl+S` 键盘事件
      3. 断言：`onApply` 被调用
      4. 模拟 `Escape` 键盘事件
      5. 断言：`onClose` 被调用
    Expected Result: 快捷键正确触发
    Failure Indicators: 快捷键无响应
    Evidence: .sisyphus/evidence/task-2-shortcuts.log
  ```

  **Commit**: YES
  - Message: `feat: create XMLEditorModal component with CodeMirror 6`
  - Files: `src/components/XMLEditor/XMLEditorModal.tsx`, `src/components/XMLEditor/XMLEditorModal.test.tsx`
  - Pre-commit: `bun test XMLEditorModal.test.tsx`

---

- [ ] 8b. 单元测试脚手架

  **What to do**:
  - 创建测试工具函数 `src/test/utils.tsx`:
    - `renderWithProviders()` 封装 Testing Library
    - 常用查询函数封装
  - 创建测试数据 `src/test/fixtures/`:
    - `sample.xml`: 有效的 XML 示例
    - `invalid.xml`: 无效的 XML 示例
    - `sample.json`: 有效的 JSON 示例
    - `sampleGameObject.ts`: 示例游戏对象（用于序列化测试）
  - 编写组件挂载测试 `src/components/XMLEditor/XMLEditorModal.mount.test.tsx`:
    - 组件挂载无错误
    - 组件卸载无错误
    - React.StrictMode 下无警告
  - 配置测试覆盖率报告

  **Must NOT do**:
  - 不要测试业务逻辑（后续任务）
  - 不要测试序列化（Task 5）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准测试脚手架模式
  - **Skills**: [`webapp-testing`]
    - `webapp-testing`: Testing Library 模式专家
  - **Skills Evaluated but Omitted**:
    - `playwright`: 单元测试阶段不需要
    - `frontend-ui-ux`: 测试代码非 UI 设计

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 8c
  - **Blocked By**: Task 8a, Task 1

  **References**:
  - Testing Library 最佳实践：`https://testing-library.com/docs/`
  - Vitest 覆盖率配置：`https://vitest.dev/guide/coverage.html`

  **Acceptance Criteria**:
  - [ ] `src/test/utils.tsx` 包含 `renderWithProviders`
  - [ ] `src/test/fixtures/` 包含 XML、JSON 和游戏对象测试文件
  - [ ] `XMLEditorModal.mount.test.tsx` 包含 3+ 挂载测试
  - [ ] `bun test --coverage` 生成覆盖率报告
  - [ ] 所有挂载测试通过

  **QA Scenarios**:

  ```
  Scenario: 挂载测试执行
    Tool: Bash
    Preconditions: 测试脚手架已创建
    Steps:
      1. 运行 `bun test XMLEditorModal.mount.test.tsx`
      2. 检查输出：所有测试通过
    Expected Result: 3+ 测试全部通过
    Failure Indicators: 测试失败、控制台警告
    Evidence: .sisyphus/evidence/task-8b-mount-tests.log
  ```

  **Commit**: YES (可与 Task 2 合并)
  - Message: `test: add XMLEditorModal mount tests and test utilities`
  - Files: `src/test/utils.tsx`, `src/test/fixtures/*`, `src/components/XMLEditor/XMLEditorModal.mount.test.tsx`
  - Pre-commit: `bun test`

---

- [ ] 3. 语法高亮实现

  **What to do**:
  - 配置 XML 语言扩展 `@codemirror/lang-xml`:
    - 标签高亮（`.cm-tag`）
    - 属性高亮（`.cm-attribute`）
    - 字符串值高亮（`.cm-string`）
    - 注释高亮（`.cm-comment`）
  - 配置 JSON 语言扩展 `@codemirror/lang-json`:
    - 键高亮（`.cm-property`）
    - 字符串值高亮（`.cm-string`）
    - 数字高亮（`.cm-number`）
    - 布尔值高亮（`.cm-keyword`）
  - 实现语言切换功能：
    - `language` prop 从 `'xml'` 切换到 `'json'` 时，语法模式立即更新
  - 编写测试：
    - XML 模式：断言 `.cm-tag`, `.cm-attribute` 存在
    - JSON 模式：断言 `.cm-property`, `.cm-string` 存在
    - 切换测试：切换语言后，高亮类名更新

  **Must NOT do**:
  - 不要实现自定义主题（使用默认主题）
  - 不要实现验证逻辑（Task 4）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CodeMirror 6 语言扩展配置需要精确
  - **Skills**: [`frontend-ui-ux`, `webapp-testing`]
    - `frontend-ui-ux`: CodeMirror 6 扩展模式专家
    - `webapp-testing`: 组件视觉样式测试
  - **Skills Evaluated but Omitted**:
    - `playwright`: 高亮测试可在组件级别验证

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 4, Task 5)
  - **Blocks**: Task 6, Task 8c
  - **Blocked By**: Task 2

  **References**:
  - CodeMirror 6 XML 语言：`https://codemirror.net/docs/ref/#lang-xml`
  - CodeMirror 6 JSON 语言：`https://codemirror.net/docs/ref/#lang-json`
  - CodeMirror 6 主题定制：`https://codemirror.net/docs/ref/#view.EditorView`

  **Acceptance Criteria**:
  - [ ] XML 模式：加载 `<root attr="value"/>`，断言 `.cm-tag`, `.cm-attribute`, `.cm-string` 存在
  - [ ] JSON 模式：加载 `{"key": "value"}`，断言 `.cm-property`, `.cm-string` 存在
  - [ ] 语言切换：从 XML 切到 JSON，高亮类名更新
  - [ ] 单元测试：`XMLEditorModal.highlighting.test.tsx` 包含 3+ 测试用例

  **QA Scenarios**:

  ```
  Scenario: XML 语法高亮
    Tool: Bash (vitest)
    Preconditions: 组件已加载 XML 模式
    Steps:
      1. 渲染 `<XMLEditorModal isOpen={true} value="<root attr='test'/>" language="xml" />`
      2. 查询 `.cm-tag` 元素
      3. 查询 `.cm-attribute` 元素
      4. 查询 `.cm-string` 元素
    Expected Result: 所有高亮元素存在
    Failure Indicators: 类名缺失、高亮颜色不对
    Evidence: .sisyphus/evidence/task-3-xml-highlight.log

  Scenario: JSON 语法高亮
    Tool: Bash (vitest)
    Preconditions: 组件已加载 JSON 模式
    Steps:
      1. 渲染 `<XMLEditorModal isOpen={true} value='{"key": "value"}' language="json" />`
      2. 查询 `.cm-property` 元素
      3. 查询 `.cm-string` 元素
    Expected Result: 所有高亮元素存在
    Failure Indicators: 类名缺失
    Evidence: .sisyphus/evidence/task-3-json-highlight.log
  ```

  **Commit**: YES
  - Message: `feat: implement XML and JSON syntax highlighting`
  - Files: `src/components/XMLEditor/XMLEditorModal.tsx` (更新), `src/components/XMLEditor/XMLEditorModal.highlighting.test.tsx`
  - Pre-commit: `bun test XMLEditorModal.highlighting.test.tsx`

---

- [ ] 4. 语法验证逻辑

  **What to do**:
  - 集成 `@codemirror/lint` 扩展
  - 实现 XML 语法验证：
    - 使用 `DOMParser` 或项目已有的 `fast-xml-parser` 解析 XML
    - 捕获解析错误（行号、列号、错误消息）
    - 转换为 CodeMirror linter 格式
  - 实现 JSON 语法验证：
    - 使用 `JSON.parse()` 验证
    - 捕获 `SyntaxError`，提取位置信息
  - 添加防抖（debounce 500ms）：
    - 避免每次击键都验证
    - 停止输入 500ms 后执行验证
  - 错误显示：
    - 行号标记（gutter marker）
    - 状态栏显示 "Error at line N"
    - **应用按钮禁用状态**（XML 无效时禁用）
  - 编写测试：
    - 有效 XML：无错误标记
    - 无效 XML：错误标记出现在正确行
    - 修复错误：标记消失
    - 应用按钮状态：有效时启用，无效时禁用

  **Must NOT do**:
  - 不要实现 XSD/Schema 验证
  - 不要实现自定义业务规则验证
  - 不要实现序列化（Task 5）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CodeMirror 6 linter 集成需要特定模式
  - **Skills**: [`frontend-ui-ux`, `webapp-testing`]
    - `frontend-ui-ux`: `@codemirror/lint` 扩展专家
    - `webapp-testing`: 验证逻辑测试
  - **Skills Evaluated but Omitted**:
    - `playwright`: 验证可在组件级别测试

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 3, Task 5)
  - **Blocks**: Task 6, Task 8c
  - **Blocked By**: Task 2

  **References**:
  - CodeMirror 6 Lint：`https://codemirror.net/docs/ref/#lint`
  - fast-xml-parser 库：`node_modules/fast-xml-parser` (already installed)
  - 防抖函数：`lodash.debounce` 或自定义实现

  **Acceptance Criteria**:
  - [ ] 有效 XML 无错误标记
  - [ ] 无效 XML（如未闭合标签）在错误行显示标记
  - [ ] 错误修复后，标记在 500ms 内消失
  - [ ] 状态栏显示当前验证状态
  - [ ] XML 无效时，应用按钮禁用
  - [ ] 单元测试：`XMLEditorModal.validation.test.tsx` 包含 5+ 测试用例

  **QA Scenarios**:

  ```
  Scenario: 有效 XML 无错误
    Tool: Bash (vitest)
    Preconditions: 组件已加载验证扩展
    Steps:
      1. 渲染 `<XMLEditorModal isOpen={true} value="<root><child/></root>" />`
      2. 等待 600ms（防抖时间）
      3. 断言：无 `.cm-lintMarker-error` 元素
      4. 断言：应用按钮启用
    Expected Result: 无错误标记，应用按钮可用
    Failure Indicators: 错误标记出现、按钮禁用
    Evidence: .sisyphus/evidence/task-4-valid-xml.log

  Scenario: 无效 XML 显示错误
    Tool: Bash (vitest)
    Preconditions: 组件已加载验证扩展
    Steps:
      1. 渲染 `<XMLEditorModal isOpen={true} value="<root><child></root>" />`（未闭合 child）
      2. 等待 600ms
      3. 断言：`.cm-lintMarker-error` 存在于第 1 行
      4. 断言：错误消息包含"unclosed tag"
      5. 断言：应用按钮禁用
    Expected Result: 错误标记正确显示，应用按钮禁用
    Failure Indicators: 标记缺失、行号错误、按钮未禁用
    Evidence: .sisyphus/evidence/task-4-invalid-xml.log
  ```

  **Commit**: YES
  - Message: `feat: add syntax validation with error markers`
  - Files: `src/components/XMLEditor/XMLEditorModal.tsx` (更新), `src/utils/xmlValidator.ts`, `src/components/XMLEditor/XMLEditorModal.validation.test.tsx`
  - Pre-commit: `bun test XMLEditorModal.validation.test.tsx`

---

- [ ] 5. XML 序列化/反序列化

  **What to do**:
  - 创建 `src/utils/xmlSerializer.ts`:
    - `gameObjectToXML(gameObject: any, schema: XMLSchema): string` - 游戏对象转 XML
    - `XMLToGameObject(xml: string, schema: XMLSchema): any` - XML 转游戏对象
    - `validateXML(xml: string, schema: XMLSchema): ValidationResult` - XML 验证
  - 定义 Schema 接口（用于定义游戏对象到 XML 的映射）：
    ```typescript
    interface XMLSchema {
      rootTag: string;
      fields: Array<{
        name: string;
        xmlAttr?: string; // 映射到 XML 属性名
        type: 'string' | 'number' | 'boolean' | 'object';
        nested?: XMLSchema; // 嵌套对象
      }>;
    }
    ```
  - 实现序列化逻辑：
    - 使用 `fast-xml-parser` 的 `XMLBuilder` 和 `XMLParser`
    - 处理类型转换（number → string → number）
    - 处理嵌套对象
  - 实现错误处理：
    - XML 解析失败：抛出带有位置信息的错误
    - 类型转换失败：抛出描述性错误
    - Schema 不匹配：警告但继续（宽松模式）
  - 编写测试：
    - 往返测试：游戏对象 → XML → 游戏对象，数据一致
    - 类型转换测试：数字、布尔值正确转换
    - 错误场景：无效 XML、Schema 不匹配

  **Must NOT do**:
  - 不要直接访问游戏内存（通过参数传入游戏对象）
  - 不要实现 UI 组件（Task 6）
  - 不要实现模式切换 Hook（Task 7）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 序列化逻辑有多个边界情况和类型处理
  - **Skills**: [`git-master`]
    - `git-master`: 序列化 bug 可能导致数据丢失，需要仔细提交
  - **Skills Evaluated but Omitted**:
    - `playwright`: 序列化测试在工具层
    - `frontend-ui-ux`: 序列化工具非 UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 3, Task 4)
  - **Blocks**: Task 6, Task 7, Task 8c
  - **Blocked By**: Task 2

  **References**:
  - fast-xml-parser：`node_modules/fast-xml-parser` (already installed)
  - XML Schema 模式：W3C XML Schema 基础概念
  - 项目中的游戏对象类型定义：`src/types/` 目录

  **Acceptance Criteria**:
  - [ ] `gameObjectToXML()` 正确转换游戏对象为 XML 字符串
  - [ ] `XMLToGameObject()` 正确解析 XML 为游戏对象
  - [ ] 往返测试：`XMLToGameObject(gameObjectToXML(obj))` 与原对象一致
  - [ ] 类型转换：数字、布尔值正确保留类型
  - [ ] 错误处理：无效 XML 抛出带位置信息的错误
  - [ ] 单元测试：`xmlSerializer.test.ts` 包含 8+ 测试用例

  **QA Scenarios**:

  ```
  Scenario: 游戏对象 → XML → 游戏对象往返测试
    Tool: Bash (vitest)
    Preconditions: 定义武器 Schema
    Steps:
      1. 定义武器对象：`{ id: 1, name: "Sword", damage: 10, rare: true }`
      2. 调用 `gameObjectToXML(weapon, weaponSchema)`
      3. 调用 `XMLToGameObject(xml, weaponSchema)`
      4. 断言：返回对象与原对象完全一致（包括类型）
    Expected Result: 往返数据一致，类型正确
    Failure Indicators: 数据丢失、类型错误
    Evidence: .sisyphus/evidence/task-5-roundtrip.log

  Scenario: 无效 XML 错误处理
    Tool: Bash (vitest)
    Preconditions: 无
    Steps:
      1. 调用 `XMLToGameObject("<weapon><name></weapon>", schema)`
      2. 断言：抛出错误
      3. 断言：错误消息包含行号信息
    Expected Result: 优雅处理，抛出描述性错误
    Failure Indicators: 崩溃、未捕获异常、错误消息模糊
    Evidence: .sisyphus/evidence/task-5-invalid-xml.log
  ```

  **Commit**: YES
  - Message: `feat: implement XML serialization/deserialization for game objects`
  - Files: `src/utils/xmlSerializer.ts`, `src/utils/xmlSerializer.test.ts`, `src/types/XMLSchema.ts`
  - Pre-commit: `bun test xmlSerializer.test.ts`

---

- [ ] 6. 模态框 UI 集成

  **What to do**:
  - 完善 `XMLEditorModal` 组件的 UI 细节：
    - 工具栏按钮：
      - "格式化" 按钮：调用 `xmlFormatter`，美化 XML
      - 语言切换下拉框：XML/JSON 切换
      - "应用" 按钮：调用 `onApply`，XML 无效时禁用
      - "取消" 按钮：调用 `onClose`
    - 状态栏：
      - 显示验证状态（✓ Valid / ✗ Error at line N）
      - 显示光标位置（行：列）
      - 显示当前语言（XML/JSON）
  - 样式和布局：
    - 响应式设计：最小 1280x720 无溢出
    - 模态框居中显示
    - 编辑器区域自动填充剩余空间
  - 编写集成测试：
    - 所有按钮可点击，触发正确处理函数
    - 快捷键触发正确操作
    - 状态栏随验证状态更新

  **Must NOT do**:
  - 不要添加额外功能（如搜索、多标签）
  - 不要修改序列化逻辑（Task 5）

  **Recommended Agent Profile**:
  - **Category**: `artistry`
    - Reason: UI 组合需要设计感和用户体验考量
  - **Skills**: [`frontend-ui-ux`, `webapp-testing`]
    - `frontend-ui-ux`: UI 布局和交互设计专家
    - `webapp-testing`: 集成测试，组件查询
  - **Skills Evaluated but Omitted**:
    - `playwright`: E2E 测试在 Task 8c
    - `dev-browser`: UI 是 React 组件，非外部网站

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after Wave 3)
  - **Blocks**: Task 8c
  - **Blocked By**: Task 3, Task 4, Task 5

  **References**:
  - React 键盘事件：`https://react.dev/reference/react-dom/components/common#keyboard-event-handler`
  - UI 布局模式：Flexbox / Grid 最佳实践
  - 快捷键设计：VS Code 快捷键约定
  - 项目现有 Modal 组件样式（如有）

  **Acceptance Criteria**:
  - [ ] 工具栏包含所有按钮，点击触发正确处理函数
  - [ ] 状态栏实时显示验证状态、光标位置、语言
  - [ ] 应用按钮在 XML 无效时禁用，有效时启用
  - [ ] `Ctrl+S` 触发应用，`Ctrl+Shift+F` 触发格式化
  - [ ] 响应式：1280x720 分辨率下无水平滚动条
  - [ ] 集成测试：`XMLEditorModal.integration.test.tsx` 包含 6+ 测试用例

  **QA Scenarios**:

  ```
  Scenario: 工具栏按钮功能
    Tool: Bash (vitest)
    Preconditions: 模态框已渲染
    Steps:
      1. 渲染 `<XMLEditorModal isOpen={true} value="<root/>" />`
      2. 点击 "格式化" 按钮
      3. 断言：XML 被格式化（多行，有缩进）
      4. 点击 "应用" 按钮
      5. 断言：`onApply` 被调用
    Expected Result: 所有按钮正常工作
    Failure Indicators: 按钮无响应、处理函数未调用
    Evidence: .sisyphus/evidence/task-6-toolbar-tests.log

  Scenario: 状态栏验证状态更新
    Tool: Bash (vitest)
    Preconditions: 模态框已渲染
    Steps:
      1. 渲染组件，加载无效 XML
      2. 等待 600ms
      3. 断言：状态栏显示 "Error at line N"
      4. 断言：应用按钮禁用
      5. 修复 XML
      6. 等待 600ms
      7. 断言：状态栏显示 "✓ Valid"
      8. 断言：应用按钮启用
    Expected Result: 状态栏正确更新
    Failure Indicators: 状态未更新、按钮状态错误
    Evidence: .sisyphus/evidence/task-6-status-bar.log
  ```

  **Commit**: YES
  - Message: `feat: compose XMLEditorModal UI with toolbar and status bar`
  - Files: `src/components/XMLEditor/XMLEditorModal.tsx` (更新), `src/components/XMLEditor/XMLEditorModal.integration.test.tsx`
  - Pre-commit: `bun test XMLEditorModal.integration.test.tsx`

---

- [ ] 7. XML 模式切换 Hook

  **What to do**:
  - 创建 `src/hooks/useXMLMode.ts`:
    ```typescript
    interface UseXMLModeOptions<T> {
      gameObject: T; // 当前游戏对象
      schema: XMLSchema; // 序列化 Schema
      onApply: (updatedObject: T) => void; // 应用回调
      onError?: (error: Error) => void; // 错误回调
    }

    function useXMLMode<T>(options: UseXMLModeOptions<T>): {
      isXMLMode: boolean;
      openXMLMode: () => void;
      closeXMLMode: () => void;
      toggleXMLMode: () => void;
      xmlContent: string;
      handleApply: (xml: string) => void;
      isLoading: boolean;
      error: Error | null;
    }
    ```
  - 实现 Hook 逻辑：
    - 内部管理 XML 模式开关状态
    - 打开时：序列化游戏对象为 XML
    - 应用时：反序列化 XML 为游戏对象，调用 `onApply`
    - 错误处理：捕获序列化/反序列化错误，调用 `onError`
  - 编写测试：
    - 打开模式：XML 内容正确生成
    - 应用模式：XML 正确转换回游戏对象
    - 错误处理：无效 XML 触发 `onError`
    - 往返测试：完整流程数据一致

  **Must NOT do**:
  - 不要修改现有配置界面（由后续集成完成）
  - 不要修改序列化逻辑（Task 5）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: React Hook 模式成熟，逻辑清晰
  - **Skills**: [`frontend-ui-ux`, `webapp-testing`]
    - `frontend-ui-ux`: React Hooks 最佳实践
    - `webapp-testing`: Hook 测试模式（renderHook）
  - **Skills Evaluated but Omitted**:
    - `playwright`: Hook 测试不需要 E2E
    - `git-master`: Hook 代码简单，不需要频繁提交

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (with Task 6)
  - **Blocks**: Task 8c
  - **Blocked By**: Task 5

  **References**:
  - React Hooks 最佳实践：`https://react.dev/reference/react`
  - Testing Library Hook 测试：`https://testing-library.com/docs/react-testing-library/api/#renderhook`
  - 项目现有 Hooks 模式：`src/hooks/` 目录

  **Acceptance Criteria**:
  - [ ] `useXMLMode` Hook 导出，接受 `gameObject`, `schema`, `onApply` 参数
  - [ ] 打开模式时，`xmlContent` 为序列化后的 XML
  - [ ] 应用时，XML 反序列化后调用 `onApply`
  - [ ] 错误时，调用 `onError` 并设置 `error` 状态
  - [ ] 单元测试：`useXMLMode.test.ts` 包含 5+ 测试用例

  **QA Scenarios**:

  ```
  Scenario: Hook 完整流程测试
    Tool: Bash (vitest with @testing-library/react)
    Preconditions: 定义武器 Schema 和 Mock 回调
    Steps:
      1. 渲染 Hook：`useXMLMode({ gameObject: weapon, schema: weaponSchema, onApply: mockApply })`
      2. 调用 `openXMLMode()`
      3. 断言：`isXMLMode` 为 true，`xmlContent` 包含 XML 字符串
      4. 调用 `handleApply(validXML)`
      5. 断言：`onApply` 被调用，参数为反序列化后的对象
    Expected Result: 完整流程正确
    Failure Indicators: 状态未更新、回调未调用
    Evidence: .sisyphus/evidence/task-7-hook-flow.log

  Scenario: 错误处理测试
    Tool: Bash (vitest)
    Preconditions: Hook 已渲染
    Steps:
      1. 调用 `handleApply(invalidXML)`
      2. 断言：`onError` 被调用
      3. 断言：`error` 状态包含错误对象
      4. 断言：`isXMLMode` 仍为 true（保持编辑状态）
    Expected Result: 错误优雅处理
    Failure Indicators: 未调用 onError、崩溃
    Evidence: .sisyphus/evidence/task-7-hook-error.log
  ```

  **Commit**: YES
  - Message: `feat: create useXMLMode hook for XML mode switching`
  - Files: `src/hooks/useXMLMode.ts`, `src/hooks/useXMLMode.test.ts`
  - Pre-commit: `bun test useXMLMode.test.ts`

---

- [ ] 8c. E2E 集成测试

  **What to do**:
  - 创建 `e2e/xml-mode.spec.ts`:
    - 完整用户流程测试：
      1. 打开配置界面（如武器编辑页面）
      2. 点击"XML 模式"按钮
      3. 验证模态框打开，显示序列化后的 XML
      4. 编辑 XML 内容（修改属性值）
      5. 点击"应用"按钮
      6. 验证模态框关闭，界面表单数据已更新
    - 错误场景测试：
      1. 打开 XML 模式
      2. 输入无效 XML
      3. 验证错误标记显示，应用按钮禁用
      4. 修复 XML
      5. 验证错误标记消失，应用按钮启用
    - 格式化测试：
      1. 打开 XML 模式（压缩 XML）
      2. 点击"格式化"
      3. 验证 XML 格式化为多行，缩进正确
  - 配置截图：
    - 失败时自动截图到 `./test-results/`
    - 截图命名：`{test-name}-failed-{timestamp}.png`
  - 编写 Playwright 测试辅助函数：
    - `openXMLMode()`: 点击 XML 模式按钮
    - `waitForValidation()`: 等待验证完成（防抖 500ms）
  - 运行所有 E2E 测试，确保通过

  **Must NOT do**:
  - 不要测试单元级别的细节（已有单元测试）
  - 不要修改业务代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: E2E 测试模式成熟，Playwright 文档齐全
  - **Skills**: [`playwright`, `webapp-testing`]
    - `playwright`: Playwright E2E 测试专家
    - `webapp-testing`: React 组件 E2E 测试模式
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 测试验证，非 UI 设计
    - `git-master`: 测试代码不修改源文件

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (after Wave 4)
  - **Blocks**: None
  - **Blocked By**: Task 6, Task 7, Task 3, Task 4, Task 5

  **References**:
  - Playwright 测试模式：`https://playwright.dev/docs/test-intro`
  - Playwright 截图：`https://playwright.dev/docs/test-snapshots`
  - Playwright 组件选择器：`https://playwright.dev/docs/locators`

  **Acceptance Criteria**:
  - [ ] `e2e/xml-mode.spec.ts` 包含 3+ 完整流程测试
  - [ ] `bun test:e2e` 全部通过
  - [ ] 失败时截图保存到 `./test-results/`
  - [ ] 测试可重复运行（无状态污染）
  - [ ] 测试执行时间 < 2 分钟

  **QA Scenarios**:

  ```
  Scenario: 完整 XML 模式流程 E2E
    Tool: Playwright
    Preconditions: 应用已构建，配置页面可访问
    Steps:
      1. 导航到武器配置页面
      2. 点击"XML 模式"按钮
      3. 等待模态框打开
      4. 断言：编辑器显示 XML 内容
      5. 编辑 XML：修改 damage 属性值
      6. 点击"应用"按钮
      7. 等待模态框关闭
      8. 断言：界面表单的 damage 字段已更新
    Expected Result: 完整流程成功，数据正确更新
    Failure Indicators: 模态框不打开、数据未更新
    Evidence: .sisyphus/evidence/task-8c-full-flow.mp4 (录制)

  Scenario: 错误验证 E2E
    Tool: Playwright
    Preconditions: 模态框已打开
    Steps:
      1. 输入无效 XML（未闭合标签）
      2. 等待 600ms（防抖）
      3. 断言：错误标记出现在行号旁
      4. 断言：应用按钮禁用
      5. 修复 XML（闭合标签）
      6. 等待 600ms
      7. 断言：错误标记消失
      8. 断言：应用按钮启用
    Expected Result: 错误标记正确显示和消失
    Failure Indicators: 标记未出现、未消失、按钮状态错误
    Evidence: .sisyphus/evidence/task-8c-validation.png
  ```

  **Commit**: YES
  - Message: `test: add E2E tests for XML mode flows`
  - Files: `e2e/xml-mode.spec.ts`, `e2e/test-fixtures/*`
  - Pre-commit: `bun test:e2e`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

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

### Atomic Commit Plan:

```
Commit 1: "chore: add CodeMirror 6 and vitest dependencies"
  - package.json updates
  - vitest.config.ts

Commit 2: "feat: create XMLEditorModal component with CodeMirror 6"
  - XMLEditorModal.tsx component
  - basicProps interface
  - mount tests

Commit 3: "feat: implement XML/JSON syntax highlighting"
  - Language extensions
  - highlighting tests

Commit 4: "feat: add syntax validation with error markers"
  - @codemirror/lint integration
  - validation logic
  - error display

Commit 5: "feat: implement XML serialization/deserialization"
  - gameObjectToXML() and XMLToGameObject()
  - XMLSchema type definitions
  - serialization tests

Commit 6: "feat: compose XMLEditorModal UI with toolbar and status bar"
  - Layout composition
  - keyboard shortcuts
  - status updates

Commit 7: "feat: create useXMLMode hook for XML mode switching"
  - useXMLMode hook
  - hook tests

Commit 8: "test: add E2E tests for XML mode flows"
  - e2e/xml-mode.spec.ts
  - test fixtures
```

### Commit Rules:
- Each commit MUST pass all existing tests
- Each commit MUST be buildable (no broken states)
- Commits can be squashed if small
- TDD: tests can be committed before implementation

---

## Success Criteria

### Verification Commands
```bash
# 1. Build succeeds
bun build  # Expected: no errors, output to dist/

# 2. All unit tests pass
bun test  # Expected: 30+ tests pass, 0 failures

# 3. All E2E tests pass
bun test:e2e  # Expected: 3+ E2E tests pass, screenshots on failure

# 4. Manual smoke test (optional, for visual confirmation)
bun dev  # Open http://localhost:5173
# → Navigate to weapon config page
# → Click "XML Mode" button
# → Edit XML → Apply → Verify form updated
```

### Final Checklist
- [ ] All "Must Have" present (syntax highlighting, validation, serialization, mode switch, formatting, shortcuts)
- [ ] All "Must NOT Have" absent (no standalone page, no XSD, no multi-tab, no auto-save)
- [ ] All tests pass (unit + E2E)
- [ ] Build succeeds with no errors
- [ ] Evidence files captured in .sisyphus/evidence/

# 地图导入功能实现计划（游戏原始 XML 格式）

## TL;DR

> **快速摘要**: 实现加载游戏原始 XML 格式的地图文件（`*_TileMap` 和 `*_Buildings`），参考 Python TileMapEditor 实现，支持 UTF-16 BOM 编码，让用户能快速导入和编辑已有地图。
> 
> **关键发现**（来自 Python 版本）:
> - 游戏使用**两个独立文件**：`{name}_TileMap` 和 `{name}_Buildings`
> - **TileMap 格式**: `<TileMap><Width>51</Width><Height>51</Height><Grounds><Crater>x,y,dist1,dist2|...</Crater></Grounds><Flags><EnemyMagnet>x,y|...</EnemyMagnet></Flags></TileMap>`
> - **Buildings 格式**: `<Buildings><Building Id="MagicCircle" X="25" Y="25"><Health>100</Health></Building></Buildings>`
> - **编码**: UTF-16（LE BOM: `FF FE`）
> - **地形分组**: Grounds 元素下按地形类型分组，坐标用 `|` 分隔
> - **Flags**: 按类型分组，不是单个 Flag 元素
> 
> **交付物**:
> - 地图 XML 解析器（支持 TileMap + Buildings 双文件）
> - 导入按钮组件（支持选择 TileMap 文件自动加载 Buildings）
> - 更新 Header 工具栏集成导入功能
> - 数据验证和错误处理
> 
> **预计工作量**: 中等（约 45-60 分钟，因格式复杂）
> **并行执行**: 是 - 2 个任务并行
> **关键路径**: 解析器 → 导入组件 → 集成

---

## Context

### 原始请求
"支持加载已有的地图，来快速创建"

### 访谈摘要
**关键讨论**:
- 导入游戏原始 XML 格式（参考 Python TileMapEditor）
- 支持两个独立文件：`{name}_TileMap` 和 `{name}_Buildings`
- UTF-16 LE BOM 编码（`FF FE`）
- 地形数据按类型分组在 `<Grounds>` 下
- 旗帜数据按类型分组在 `<Flags>` 下
- 建筑数据为独立 `<Building>` 元素列表

**研究结果**（Python 版本）:
- `map_parser.py:47-138` - parse_tilemap() 解析地形和旗帜
- `map_parser.py:144-201` - parse_buildings() 解析建筑
- `map_parser.py:60-82` - BOM 检测逻辑（UTF-16 LE/BE, UTF-8）
- `map_parser.py:104-114` - 地形格式：`<Crater>x1,y1,dist1,dist2|x2,y2,...</Crater>`
- `map_parser.py:116-128` - 旗帜格式：`<EnemyMagnet>x1,y1|x2,y2|...</EnemyMagnet>`
- `models.py:36-88` - MapData 数据模型（terrain 用 dict, flags 用 dict of lists）
- 导出格式参考 `map_parser.py:233-323`（export_tilemap）和 `map_parser.py:325-356`（export_buildings）

**现有代码差距**:
- 当前 `mapXmlExporter.ts` 使用不同的格式（单个 MapData 元素，非分组）
- 需要完全重写解析器以匹配游戏格式
- 需要支持加载两个独立文件（TileMap + Buildings）

### Metis 审查
**识别的差距**（已解决）:
- [差距 1]: 需要解析游戏特定的分组格式 → 参考 map_parser.py:104-128 实现
- [差距 2]: 需要处理两个独立文件 → 实现自动查找对应的 Buildings 文件
- [差距 3]: 地形坐标包含距离信息（x,y,dist1,dist2）→ 解析时忽略距离，只取 x,y
- [差距 4]: BOM 检测 → 复用 weapon-xml-parser.ts 的逻辑
- [差距 5]: 验证导入数据 → 添加 validateMapData 函数
- [差距 6]: 错误处理 → try-catch + Toast 通知

---

## Work Objectives

### 核心目标
实现完整的地图 XML 导入功能，支持游戏格式的 XML 文件加载

### 具体交付物
- `src/lib/xml/map-xml-parser.ts` - 地图 XML 解析器（TileMap + Buildings 格式）
- `src/components/canvas/MapImportButton.tsx` - 导入按钮组件（支持双文件加载）
- 更新 `src/App.tsx` - 集成导入按钮到 Header
- （可选）更新 `src/lib/mapXmlExporter.ts` - 改为导出游戏原始格式

### 完成定义
- [ ] 成功导入 XML 地图文件
- [ ] 正确解析地形、建筑、旗帜数据
- [ ] 显示导入结果 Toast 通知
- [ ] 数据验证和错误提示

### 必须有
- UTF-16/UTF-8 BOM 自动检测
- 解析 TileMap 文件的分组格式（Grounds/Flags）
- 解析 Buildings 文件的列表格式
- 自动查找并加载对应的 Buildings 文件（`{name}_TileMap` → `{name}_Buildings`）
- 验证导入数据（边界检查）
- 错误处理和用户反馈

### 不能有（防护栏）
- 不修改现有 MapData 结构（保持内部格式）
- 不自动保存（仅加载到内存）
- 不改变现有导出功能（除非明确需要）

---

## Verification Strategy

### 测试决策
- **基础设施存在**: 是（Playwright 已配置）
- **自动化测试**: 无（手动测试为主）
- **框架**: 手动测试 + 浏览器验证
- **Agent 执行 QA**: 始终启用

### QA 策略
每个任务必须包含 Agent 执行的 QA 场景（见 TODO 模板）
证据保存到 `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`

- **前端/UI**: 使用 Playwright - 导航、交互、断言 DOM、截图
- **API/后端**: 使用 Bash (curl) - 发送请求、断言状态

---

## Execution Strategy

### 并行执行波次

```
Wave 1（立即开始 - 核心功能）:
├── Task 1: 创建地图 XML 解析器 [quick]
└── Task 2: 创建导入按钮组件 [quick]

Wave 2（Wave 1 后 - 集成）:
├── Task 3: 更新 App.tsx 集成导入按钮 [quick]
└── Task 4: 手动测试和验证 [unspecified-high]

Wave FINAL（所有任务后 - 2 个并行审查，然后用户确认）:
├── F1: 代码质量审查 (unspecified-high)
└── F2: 功能验证 (unspecified-high)
-> 展示结果 -> 获取用户确认

关键路径: Task 1 → Task 2 → Task 3 → Task 4 → F1-F2 → 用户确认
并行加速：约 50% 快于顺序执行
最大并发：2 (Wave 1 & 2)
```

### 依赖矩阵

- **1**: — → 2, 3
- **2**: 1 → 3
- **3**: 1, 2 → 4
- **4**: 3 → F1, F2

### Agent 调度摘要

- **Wave 1**: **2** — T1 → `quick`, T2 → `quick`
- **Wave 2**: **1** — T3 → `quick`, T4 → `unspecified-high`
- **FINAL**: **2** — F1 → `unspecified-high`, F2 → `unspecified-high`

---

## TODOs

> 实现 + 测试 = 一个任务。永不分离。
> 每个任务必须包含：推荐 Agent Profile + 并行化信息 + QA 场景。
> **没有 QA 场景的任务是不完整的。没有例外。**

- [ ] 1. 创建地图 XML 解析器（游戏原始格式）

  **做什么**:
  - 创建 `src/lib/xml/map-xml-parser.ts`
  - 实现 `parseTileMap()` 解析 TileMap 文件：
    - 解析 `<TileMap><Width>...</Width><Height>...</Height>`
    - 解析 `<Grounds><Crater>x,y,d1,d2|...</Crater><Dirt>...</Dirt></Grounds>`
    - 解析 `<Flags><EnemyMagnet>x,y|...</EnemyMagnet><Zone_N>...</Zone_N></Flags>`
    - 忽略距离信息（d1,d2），只提取 x,y 坐标
  - 实现 `parseBuildings()` 解析 Buildings 文件：
    - 解析 `<Buildings><Building Id="..." X="..." Y="..."><Health>...</Health></Building></Buildings>`
    - 提取 Id, X, Y, Health 属性
  - 实现 `parseMapFromBuffer()` 带 BOM 检测
  - 实现 `validateMapData()` 验证导入数据
  - 实现 `loadMapFromTileMapFile()` 自动查找 Buildings 文件
  - BOM 检测参考 `weapon-xml-parser.ts:45-68`
  
  **不能做什么**:
  - 不使用当前的 mapXmlExporter.ts 格式（格式不匹配）
  - 不改变 MapData 类型结构

  **推荐 Agent Profile**:
  > 选择适合任务领域的 category + skills
  - **Category**: `unspecified-high`
    - 原因：需要解析复杂的游戏特定格式，逻辑较多
  - **Skills**: []
    - 无需额外技能，有 Python 参考实现
  
  **并行化**:
  - **可并行运行**: YES
  - **并行组**: Wave 1 (与 Task 2)
  - **阻塞**: Task 2, Task 3
  - **被阻塞**: 无（可立即开始）

  **参考**（关键 - 详尽）:
  
  **模式参考**（Python 代码 - 直接参考）:
  - `../../../export/TileMapEditor/map_parser.py:47-138` - parse_tilemap() 完整实现
  - `../../../export/TileMapEditor/map_parser.py:99-114` - Grounds 解析逻辑
  - `../../../export/TileMapEditor/map_parser.py:116-128` - Flags 解析逻辑
  - `../../../export/TileMapEditor/map_parser.py:144-201` - parse_buildings() 完整实现
  - `../../../export/TileMapEditor/map_parser.py:60-82` - BOM 检测逻辑
  
  **类型参考**（实现的契约）:
  - `src/types/map.ts:156-168` - MapData 接口定义
  - `src/types/map.ts:22-32` - Building 接口
  - `src/types/map.ts:78-96` - TileFlag 接口
  - `../../../export/TileMapEditor/models.py:36-88` - Python MapData 模型
  
  **为什么每个参考重要**:
  - map_parser.py: 游戏格式的唯一真实参考，必须完全匹配
  - models.py: 理解数据结构设计
  - types/map.ts: 确保 TypeScript 类型正确

  **游戏 XML 格式示例**:
  
  **TileMap 文件** (`{name}_TileMap`):
  ```xml
  <?xml version="1.0" encoding="utf-16"?>
  <TileMap>
      <Width>51</Width>
      <Height>51</Height>
      <Grounds>
          <Crater>
              10,15,5,3|12,18,7,5|...
          </Crater>
          <Dirt>
              0,0,10,8|1,0,9,7|...
          </Dirt>
          <Stone>
              25,25,0,0|25,26,1,1|...
          </Stone>
      </Grounds>
      <Flags>
          <EnemyMagnet>
              5,5|10,10
          </EnemyMagnet>
          <Zone_N>
              0,25
          </Zone_N>
      </Flags>
  </TileMap>
  ```
  
  **Buildings 文件** (`{name}_Buildings`):
  ```xml
  <?xml version="1.0" encoding="utf-16"?>
  <Buildings>
      <Building Id="MagicCircle" X="25" Y="25">
          <Health>100</Health>
      </Building>
      <Building Id="StoneWall" X="20" Y="25" />
      <Building Id="House" X="30" Y="30">
          <Health>50</Health>
      </Building>
  </Buildings>
  ```

  **验收标准**:
  
  > **仅 Agent 可执行验证** - 不允许"用户手动测试/确认"
  > 每个标准必须是可运行命令或工具验证的

  - [ ] 文件创建：`src/lib/xml/map-xml-parser.ts` 存在
  - [ ] TypeScript 编译：`npx tsc --noEmit` 无错误
  - [ ] 导出函数：`parseTileMap`, `parseBuildings`, `parseMapFromBuffer`, `validateMapData`, `loadMapFromTileMapFile` 已导出
  - [ ] 解析测试：能正确解析 Python 导出的 TileMap 文件

  **QA 场景**（必需 - 任务没有这些就是不完整）:
  
  ```
  场景：解析有效 TileMap 文件（快乐路径）
    工具：Bash (Node.js) + 真实游戏文件
    前提条件：从 Python 版本导出一个测试 TileMap 文件
    步骤:
      1. 使用 Python TileMapEditor 导出测试地图：`Lakeburg_TileMap`
      2. 在 Node REPL 中测试：
         const fs = require('fs');
         const { parseTileMap } = require('./src/lib/xml/map-xml-parser.ts');
         const buffer = fs.readFileSync('Lakeburg_TileMap');
         const mapData = parseTileMap(buffer);
      3. 验证：mapData.width === 51 && mapData.terrain.size > 0
    预期结果：正确解析地形和旗帜数据
    失败指标：解析抛异常或地形数量为 0
    证据：.sisyphus/evidence/task-1-parse-tilemap.txt

  场景：解析 Buildings 文件
    工具：Bash (Node.js) + 真实游戏文件
    前提条件：从 Python 版本导出 Buildings 文件
    步骤:
      1. 使用 Python 导出：`Lakeburg_Buildings`
      2. 解析：const { parseBuildings } = require(...);
         const buildings = parseBuildings(buffer);
      3. 验证：buildings.length > 0 && buildings[0].id !== undefined
    预期结果：正确解析建筑列表，包含 Id/X/Y/Health
    证据：.sisyphus/evidence/task-1-parse-buildings.txt

  场景：自动加载 Buildings 文件
    工具：Bash (Node.js)
    前提条件：TileMap 和 Buildings 文件在同一目录
    步骤:
      1. 调用 loadMapFromTileMapFile('Lakeburg_TileMap')
      2. 验证自动找到并加载 `Lakeburg_Buildings`
      3. 验证返回的 MapData 包含 buildings
    预期结果：MapData.buildings.length > 0
    证据：.sisyphus/evidence/task-1-auto-load-buildings.txt

  场景：BOM 检测（UTF-16 LE）
    工具：Bash (Node.js)
    前提条件：创建带 UTF-16 LE BOM 的测试文件
    步骤:
      1. 创建带 BOM 的文件：printf '\xff\xfe<?xml...>' > test-utf16.xml
      2. 使用 parseTileMap 解析
      3. 验证正确解码，无乱码
    预期结果：正确解析 XML 内容
    证据：.sisyphus/evidence/task-1-bom-detection.txt

  场景：边界外建筑验证（失败情况）
    工具：Bash (Node.js)
    前提条件：创建包含边界外建筑的测试数据
    步骤:
      1. 创建 MapData：{ width: 51, height: 51, buildings: [{ id: 'Test', x: 100, y: 100 }] }
      2. 调用 validateMapData(mapData)
      3. 验证返回 errors 数组包含边界错误
    预期结果：validation.valid === false, errors.length > 0
    证据：.sisyphus/evidence/task-1-validation-error.txt
  ```

  **捕获证据**:
  - [ ] 每个证据文件命名：task-{N}-{scenario-slug}.{ext}
  - [ ] 终端输出保存为 .txt 文件
  - [ ] 使用真实游戏文件测试

  **提交**: YES（与 2 分组）
  - 消息：`feat(map): 添加游戏原始 XML 格式解析器`
  - 文件：`src/lib/xml/map-xml-parser.ts`
  - 预提交：`npx tsc --noEmit`

---

- [ ] 2. 创建导入按钮组件（支持双文件）

  **做什么**:
  - 创建 `src/components/canvas/MapImportButton.tsx`
  - 实现文件选择器，支持选择 `*_TileMap` 文件
  - 调用 `parseTileMap()` 解析 TileMap
  - 自动查找同目录下的 `*_Buildings` 文件并加载
  - 使用 `setMapData()` 加载到 store
  - 使用 `addToast()` 显示结果通知（显示加载的地形/建筑/旗帜数量）
  - 错误处理和用户反馈
  
  **不能做什么**:
  - 不直接修改 DOM
  - 不使用外部文件选择库

  **推荐 Agent Profile**:
  > 选择适合任务领域的 category + skills
  - **Category**: `quick`
    - 原因：标准 React 文件上传模式，参考 XmlImportButton
  - **Skills**: []
    - 标准 React 模式
  
  **并行化**:
  - **可并行运行**: YES
  - **并行组**: Wave 1 (与 Task 1)
  - **阻塞**: Task 3
  - **被阻塞**: Task 1（需要解析器 API）

  **参考**（关键 - 详尽）:
  
  **模式参考**:
  - `src/components/weapon-skill/XmlImportButton.tsx:10-27` - 文件上传处理模式
  - `src/components/weapon-skill/XmlImportButton.tsx:28-33` - label + input 结构
  - `../../../export/TileMapEditor/buildings_editor.py:263-297` - Python 导入建筑逻辑
  
  **API/类型参考**:
  - `src/store/mapStore.ts:38-40` - setMapData action
  - `src/store/uiStore.ts` - addToast action（需查找具体位置）
  - `src/lib/xml/map-xml-parser.ts` (Task 1 创建) - parseTileMap, parseBuildings, loadMapFromTileMapFile
  
  **外部参考**:
  - MDN: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer

  **为什么每个参考重要**:
  - XmlImportButton.tsx: 完全相同的文件上传模式
  - mapStore.ts: 确保正确调用 setMapData
  - Python buildings_editor.py: 理解游戏文件选择逻辑

  **验收标准**:
  - [ ] 文件创建：`src/components/canvas/MapImportButton.tsx` 存在
  - [ ] TypeScript 编译：`npx tsc --noEmit` 无错误
  - [ ] 组件导出：`MapImportButton` 已导出
  - [ ] 文件输入：`accept="*"` 属性（支持所有文件，因为游戏文件无扩展名）
  - [ ] Toast 通知：显示加载的 Terrain/Buildings/Flags 数量

  **QA 场景**（必需）:
  
  ```
  场景：成功导入地图（快乐路径）
    工具：Playwright
    前提条件：准备有效的测试 TileMap + Buildings 文件（从 Python 导出）
    步骤:
      1. 导航到应用：await page.goto('/')
      2. 点击导入按钮：await page.click('label:has-text("Import Map")')
      3. 触发文件选择：await page.locator('input[type="file"]').setInputFiles('Lakeburg_TileMap')
      4. 等待 Toast：await page.waitForSelector('.toast-success')
      5. 验证 Toast 文本包含 "Loaded XX terrain tiles, XX buildings"
    预期结果：显示成功 Toast，地图数据更新
    证据：.sisyphus/evidence/task-2-import-success.png

  场景：自动加载 Buildings 文件
    工具：Playwright
    前提条件：TileMap 和 Buildings 文件在同一目录
    步骤:
      1. 选择 TileMap 文件
      2. 验证自动加载 Buildings
      3. 验证 buildings 数量 > 0
    预期结果：MapData.buildings.length 与 Python 版本一致
    证据：.sisyphus/evidence/task-2-auto-buildings.png

  场景：导入无效文件（失败情况）
    工具：Playwright
    前提条件：准备无效的 XML 文件
    步骤:
      1. 创建无效 XML：echo 'invalid xml content' > invalid.xml
      2. 触发导入：await page.locator('input[type="file"]').setInputFiles('invalid.xml')
      3. 等待错误 Toast：await page.waitForSelector('.toast-error')
      4. 验证错误消息
    预期结果：显示错误 Toast，应用不崩溃
    证据：.sisyphus/evidence/task-2-import-error.png

  场景：仅 TileMap 文件（无 Buildings）
    工具：Playwright
    前提条件：创建仅有 TileMap 文件，无对应 Buildings
    步骤:
      1. 选择 TileMap 文件
      2. 验证地图仍被加载（只有地形和旗帜）
      3. 验证 buildings.length === 0
    预期结果：成功加载，Toast 显示 0 buildings
    证据：.sisyphus/evidence/task-2-no-buildings.png
  ```

  **捕获证据**:
  - [ ] 截图保存为 .png 文件
  - [ ] Playwright 测试脚本保存
  - [ ] 使用真实游戏文件测试

  **提交**: YES（与 1 分组）
  - 消息：`feat(map): 添加地图导入按钮组件`
  - 文件：`src/components/canvas/MapImportButton.tsx`
  - 预提交：`npx tsc --noEmit`

---

- [ ] 3. 更新 App.tsx 集成导入按钮

  **做什么**:
  - 在 `src/App.tsx` 的 Header 组件中添加导入按钮
  - 导入 `MapImportButton` 组件
  - 在 "Open" 按钮旁边添加导入按钮
  - 或者替换现有 "Open" 按钮的功能
  
  **不能做什么**:
  - 不改变 Header 布局结构
  - 不删除现有按钮（New, Save）

  **推荐 Agent Profile**:
  > 选择适合任务领域的 category + skills
  - **Category**: `quick`
    - 原因：简单的组件集成
  - **Skills**: []
  
  **并行化**:
  - **可并行运行**: NO
  - **并行组**: Wave 2 (与 Task 4)
  - **阻塞**: Task 4
  - **被阻塞**: Task 1, Task 2

  **参考**:
  - `src/App.tsx:39-100` - Header 组件结构
  - `src/App.tsx:84-91` - Open 按钮实现
  
  **验收标准**:
  - [ ] MapImportButton 组件已导入
  - [ ] 导入按钮在 Header 中可见
  - [ ] 按钮样式与其他按钮一致
  - [ ] TypeScript 编译通过

  **QA 场景**:
  ```
  场景：UI 集成验证
    工具：Playwright
    步骤:
      1. 导航到应用
      2. 验证 Header 中有 "Import Map XML" 按钮
      3. 验证按钮样式与其他按钮一致
      4. 截图保存
    预期结果：按钮可见且样式正确
    证据：.sisyphus/evidence/task-3-ui-integration.png
  ```

  **提交**: YES
  - 消息：`feat(ui): 集成地图导入按钮到 Header`
  - 文件：`src/App.tsx`
  - 预提交：`npx tsc --noEmit`

---

- [ ] 4. 手动测试和验证

  **做什么**:
  - 准备测试 XML 地图文件（有效、无效、边界情况）
  - 在浏览器中测试导入功能
  - 验证地形、建筑、旗帜正确加载
  - 验证错误处理
  - 截图保存测试结果
  
  **不能做什么**:
  - 不修改代码（仅测试）

  **推荐 Agent Profile**:
  > 选择适合任务领域的 category + skills
  - **Category**: `unspecified-high`
    - 原因：需要全面的测试覆盖
  - **Skills**: [`webapp-testing`]
    - Playwright 技能用于浏览器测试
  
  **并行化**:
  - **可并行运行**: NO
  - **并行组**: Wave 2 (与 Task 3)
  - **阻塞**: Final Wave
  - **被阻塞**: Task 3

  **验收标准**:
  - [ ] 测试有效 XML 导入
  - [ ] 测试无效 XML 错误处理
  - [ ] 测试边界警告
  - [ ] 所有测试证据已保存

  **QA 场景**:
  ```
  场景：完整导入流程测试
    工具：Playwright + webapp-testing
    步骤:
      1. 准备 3 个测试文件：valid.xml, invalid.xml, warning.xml
      2. 依次导入每个文件
      3. 验证每种情况的 Toast 通知
      4. 验证地图数据正确加载（检查 buildings 数量）
      5. 验证地形数据
    预期结果：所有场景按预期工作
    证据：.sisyphus/evidence/task-4-full-flow-{scenario}.png
  ```

  **提交**: NO（仅测试）

---

## Final Verification Wave

> 4 个审查 Agent 并行运行。全部必须批准。向用户展示合并结果并获取明确"同意"后再完成。

- [ ] F1. **代码质量审查** — `unspecified-high`
  运行 `tsc --noEmit` + 检查所有变更文件：`as any`/`@ts-ignore`、空 catch、console.log、未使用导入。检查 AI 垃圾：过度注释、过度抽象、通用名称。
  输出：`Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F2. **功能验证** — `unspecified-high` (+ `webapp-testing` 如果有 UI)
  从干净状态开始。执行所有 QA 场景。测试跨任务集成。测试边界情况：空状态、无效输入。保存到 `.sisyphus/evidence/final-qa/`。
  输出：`Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

---

## Commit Strategy

- **1-2**: `feat(map): 添加地图 XML 解析和导入组件` — map-xml-parser.ts, MapImportButton.tsx, npx tsc --noEmit
- **3**: `feat(ui): 集成地图导入按钮到 Header` — App.tsx, npx tsc --noEmit

---

## Success Criteria

### 验证命令
```bash
npx tsc --noEmit  # 预期：无错误
npm run dev       # 预期：编译成功，无警告
```

### 最终检查清单
- [ ] 所有"必须有"存在
- [ ] 所有"不能有"不存在
- [ ] TypeScript 编译通过
- [ ] 导入按钮在 UI 中可见
- [ ] 成功导入测试地图
- [ ] 错误处理正常工作

---

**最后更新**: 2026 年 3 月 20 日

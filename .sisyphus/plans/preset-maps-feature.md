# 预设地图加载功能实现计划

## TL;DR

> **快速摘要**: 添加预设地图加载功能，提供多个内置地图模板供用户快速选择加载，包括空地图、城市周边、防御要塞等场景，减少从零开始创建的时间。
> 
> **交付物**:
> - 预设地图数据文件（JSON 格式）
> - 预设地图选择器 UI 组件
> - 集成到 New Map 按钮的下拉菜单
> - 地图预览功能（可选）
> 
> **预计工作量**: 中等（约 30-45 分钟）
> **并行执行**: 是 - 2 个任务并行
> **关键路径**: 预设数据 → 选择器 UI → 集成

---

## Context

### 原始请求
"提供预设的现有地图的加载选项，方便快速加载"

### 访谈摘要
**关键讨论**:
- 需要内置多个预设地图模板
- 用户点击"New Map"时可以选择预设
- 预设应该包含不同的起始场景
- 可选：显示地图预览缩略图

**研究结果**:
- 当前 `App.tsx:48-64` 的 New Map 按钮只显示 Toast，无实际功能
- 已有 `buildingBlueprints.ts` 静态数据模式可参考
- 可以使用 JSON 格式存储预设地图数据
- MapStore 已有 `setMapData` 可直接加载

### Metis 审查
**识别的差距**（已解决）:
- [差距 1]: 需要定义预设地图数据结构 → 使用 MapData 类型
- [差距 2]: 需要 UI 选择器 → 使用 Radix Select 或 Dialog
- [差距 3]: 需要预览功能 → 可选，第一版先不做
- [差距 4]: 预设数量 → 建议 3-5 个不同场景

---

## Work Objectives

### 核心目标
实现预设地图选择和加载功能，让用户可以快速开始编辑

### 具体交付物
- `src/data/presetMaps.ts` - 预设地图数据（3-5 个模板）
- `src/components/dialog/PresetMapDialog.tsx` - 预设地图选择对话框
- 更新 `src/App.tsx` - 集成到 Header 的 New Map 按钮
- （可选）地图预览缩略图组件

### 完成定义
- [ ] 点击 New Map 按钮弹出预设选择对话框
- [ ] 选择预设后正确加载地图数据
- [ ] 显示加载的地图信息（尺寸、建筑数量等）

### 必须有
- 至少 3 个预设地图模板
- 清晰的地图描述
- 一键加载功能
- Toast 通知确认

### 不能有（防护栏）
- 不自动覆盖当前地图（需要确认）
- 不修改现有 MapData 结构
- 不使用外部图片资源（所有预设为数据生成）

---

## Execution Strategy

### 并行执行波次

```
Wave 1（立即开始 - 核心功能）:
├── Task 1: 创建预设地图数据 [quick]
└── Task 2: 创建预设选择对话框 [visual-engineering]

Wave 2（Wave 1 后 - 集成）:
├── Task 3: 更新 App.tsx 集成对话框 [quick]
└── Task 4: 手动测试和验证 [unspecified-high]

Wave FINAL（所有任务后 - 2 个并行审查）:
├── F1: 代码质量审查 (unspecified-high)
└── F2: 功能验证 (unspecified-high)
-> 展示结果 -> 获取用户确认

关键路径：Task 1 → Task 2 → Task 3 → Task 4 → F1-F2 → 用户确认
并行加速：约 50% 快于顺序执行
最大并发：2 (Wave 1 & 2)
```

### 依赖矩阵

- **1**: — → 2, 3
- **2**: 1 → 3
- **3**: 1, 2 → 4
- **4**: 3 → F1, F2

### Agent 调度摘要

- **Wave 1**: **2** — T1 → `quick`, T2 → `visual-engineering`
- **Wave 2**: **1** — T3 → `quick`, T4 → `unspecified-high`
- **FINAL**: **2** — F1 → `unspecified-high`, F2 → `unspecified-high`

---

## TODOs

> 实现 + 测试 = 一个任务。永不分离。
> 每个任务必须包含：推荐 Agent Profile + 并行化信息 + QA 场景。
> **没有 QA 场景的任务是不完整的。没有例外。**

- [ ] 1. 创建预设地图数据

  **做什么**:
  - 创建 `src/data/presetMaps.ts`
  - 定义预设地图接口：
    ```typescript
    interface PresetMap {
      id: string;
      name: string;
      description: string;
      width: number;
      height: number;
      category: 'empty' | 'city' | 'fortress' | 'ruins' | 'custom';
      thumbnail?: string; // 可选的 emoji 或简单图形
      createMapData: () => MapData; // 工厂函数
    }
    ```
  - 实现 3-5 个预设地图：
    1. **空地图** - 51x51 空白地图，仅城市中心（Stone）
    2. **城市周边** - 城市在中心，周围有道路和少量建筑
    3. **防御要塞** - 城墙围绕，有城门和塔楼
    4. **废墟之地** - 散布的废墟和障碍物
    5. **自定义** - 用户可以从空白开始
  
  **不能做什么**:
  - 不使用外部图片资源
  - 不创建过大的地图数据（< 100KB）
  - 不包含复杂的旗帜配置（留给用户自己添加）

  **推荐 Agent Profile**:
  > 选择适合任务领域的 category + skills
  - **Category**: `quick`
    - 原因：数据结构明确，逻辑简单
  - **Skills**: []
  
  **并行化**:
  - **可并行运行**: YES
  - **并行组**: Wave 1 (与 Task 2)
  - **阻塞**: Task 2, Task 3
  - **被阻塞**: 无（可立即开始）

  **参考**（关键 - 详尽）:
  
  **类型参考**:
  - `src/types/map.ts:156-168` - MapData 接口
  - `src/types/map.ts:10-18` - TerrainType
  - `src/data/buildingBlueprints.ts:17-1315` - 静态数据模式参考
  
  **为什么每个参考重要**:
  - types/map.ts: 确保预设数据符合 MapData 结构
  - buildingBlueprints.ts: 学习如何组织静态数据

  **预设地图示例**:
  
  ```typescript
  // 1. 空地图 - 仅城市中心
  {
    id: 'empty-city',
    name: '空地图',
    description: '51x51 空白地图，中心有城市（Stone）',
    width: 51,
    height: 51,
    category: 'empty',
    thumbnail: '🗺️',
    createMapData: () => {
      const terrain = new Map<string, TerrainType>();
      // 添加城市中心（3x3 Stone）
      for (let x = 24; x <= 26; x++) {
        for (let y = 24; y <= 26; y++) {
          terrain.set(`${x},${y}`, 'Stone');
        }
      }
      return {
        width: 51,
        height: 51,
        terrain,
        buildings: [],
        flags: new Map(),
      };
    }
  }
  
  // 2. 城市周边
  {
    id: 'city-outskirts',
    name: '城市周边',
    description: '城市在中心，周围有道路和少量房屋',
    width: 51,
    height: 51,
    category: 'city',
    thumbnail: '🏘️',
    createMapData: () => {
      const terrain = new Map();
      const buildings: Building[] = [];
      
      // 城市中心
      for (let x = 24; x <= 26; x++) {
        for (let y = 24; y <= 26; y++) {
          terrain.set(`${x},${y}`, 'Stone');
        }
      }
      
      // 道路（十字形）
      for (let i = 20; i <= 30; i++) {
        terrain.set(`${i},25`, 'Dirt'); // 横向
        terrain.set(`25,${i}`, 'Dirt'); // 纵向
      }
      
      // 添加几个房屋
      buildings.push({ id: 'House', x: 20, y: 20 });
      buildings.push({ id: 'House', x: 30, y: 30 });
      
      return { width: 51, height: 51, terrain, buildings, flags: new Map() };
    }
  }
  
  // 3. 防御要塞
  {
    id: 'fortress',
    name: '防御要塞',
    description: '城墙围绕的要塞，有城门和塔楼',
    width: 51,
    height: 51,
    category: 'fortress',
    thumbnail: '🏰',
    createMapData: () => {
      const terrain = new Map();
      const buildings: Building[] = [];
      
      // 城墙（矩形）
      const wallPositions = [
        // 北墙
        ...Array.from({ length: 21 }, (_, i) => ({ x: 15 + i, y: 20 })),
        // 南墙
        ...Array.from({ length: 21 }, (_, i) => ({ x: 15 + i, y: 30 })),
        // 西墙
        ...Array.from({ length: 11 }, (_, i) => ({ x: 15, y: 20 + i })),
        // 东墙
        ...Array.from({ length: 11 }, (_, i) => ({ x: 35, y: 20 + i })),
      ];
      
      for (const pos of wallPositions) {
        // 城门位置留空
        if (pos.x === 25 && (pos.y === 20 || pos.y === 30)) {
          continue;
        }
        buildings.push({ id: 'StoneWall', x: pos.x, y: pos.y });
      }
      
      // 城门
      buildings.push({ id: 'GateHorizontal', x: 25, y: 20 });
      buildings.push({ id: 'GateHorizontal', x: 25, y: 30 });
      
      // 角楼
      buildings.push({ id: 'BallistaTower', x: 15, y: 20 });
      buildings.push({ id: 'BallistaTower', x: 35, y: 20 });
      buildings.push({ id: 'BallistaTower', x: 15, y: 30 });
      buildings.push({ id: 'BallistaTower', x: 35, y: 30 });
      
      return { width: 51, height: 51, terrain, buildings, flags: new Map() };
    }
  }
  ```

  **验收标准**:
  - [ ] 文件创建：`src/data/presetMaps.ts` 存在
  - [ ] TypeScript 编译：`npx tsc --noEmit` 无错误
  - [ ] 导出：`PRESET_MAPS` 数组已导出
  - [ ] 至少包含 3 个预设地图
  - [ ] 每个预设有唯一的 id

  **QA 场景**（必需）:
  
  ```
  场景：验证预设数据结构
    工具：Bash (Node.js)
    步骤:
      1. 导入预设数据：const { PRESET_MAPS } = require('./src/data/presetMaps.ts')
      2. 验证数组长度 >= 3
      3. 遍历每个预设，调用 createMapData()
      4. 验证返回的 MapData 结构正确
      5. 验证 width/height 匹配
    预期结果：所有预设都能正确生成 MapData
    失败指标：任何预设抛异常或返回无效数据
    证据：.sisyphus/evidence/task-1-validate-presets.txt

  场景：验证地图数据完整性
    工具：Bash (Node.js)
    步骤:
      1. 加载每个预设：const mapData = preset.createMapData()
      2. 验证 mapData.width === preset.width
      3. 验证 mapData.terrain 是 Map 类型
      4. 验证 mapData.buildings 是数组
      5. 统计 terrain 和 buildings 数量并打印
    预期结果：所有数据字段都存在且类型正确
    证据：.sisyphus/evidence/task-1-data-integrity.txt

  场景：验证建筑位置在边界内
    工具：Bash (Node.js)
    步骤:
      1. 对每个预设，生成 MapData
      2. 遍历所有 buildings
      3. 验证 x < width && y < height
      4. 报告任何越界的建筑
    预期结果：所有建筑位置都在地图边界内
    证据：.sisyphus/evidence/task-1-bounds-check.txt
  ```

  **捕获证据**:
  - [ ] 每个证据文件命名：task-{N}-{scenario-slug}.{ext}
  - [ ] 终端输出保存为 .txt 文件

  **提交**: YES（与 2 分组）
  - 消息：`feat(preset): 添加预设地图数据`
  - 文件：`src/data/presetMaps.ts`
  - 预提交：`npx tsc --noEmit`

---

- [ ] 2. 创建预设选择对话框

  **做什么**:
  - 创建 `src/components/dialog/PresetMapDialog.tsx`
  - 使用 Radix Dialog 组件（参考其他 Dialog）
  - 实现地图列表展示（使用 Card 或 List 布局）
  - 每个预设显示：name, description, thumbnail, category
  - 实现搜索/过滤功能（可选）
  - 点击预设时显示确认对话框
  - 确认后调用 `setMapData()` 加载
  
  **不能做什么**:
  - 不使用复杂的状态管理
  - 不自动加载（必须用户确认）
  - 不修改 MapData 结构

  **推荐 Agent Profile**:
  > 选择适合任务领域的 category + skills
  - **Category**: `visual-engineering`
    - 原因：需要创建 UI 组件，注重视觉效果
  - **Skills**: []
    - 使用现有 Radix UI 组件
  
  **并行化**:
  - **可并行运行**: YES
  - **并行组**: Wave 1 (与 Task 1)
  - **阻塞**: Task 3
  - **被阻塞**: Task 1（需要 preset 数据）

  **参考**（关键 - 详尽）:
  
  **模式参考**:
  - `src/components/ui/` - Radix UI 组件使用模式
  - `src/components/sidebar/BuildingSidebar.tsx` - 列表展示模式
  - Radix Dialog: https://www.radix-ui.com/docs/primitives/components/dialog
  
  **API/类型参考**:
  - `src/store/mapStore.ts:38-40` - setMapData action
  - `src/store/uiStore.ts` - addToast action
  - `src/data/presetMaps.ts` (Task 1) - PresetMap 类型
  
  **外部参考**:
  - Radix UI Dialog examples
  - shadcn/ui Dialog patterns

  **验收标准**:
  - [ ] 文件创建：`src/components/dialog/PresetMapDialog.tsx` 存在
  - [ ] TypeScript 编译：`npx tsc --noEmit` 无错误
  - [ ] 组件导出：`PresetMapDialog` 已导出
  - [ ] Dialog 可以打开和关闭
  - [ ] 显示所有预设地图
  - [ ] 点击预设加载地图并显示 Toast

  **QA 场景**（必需）:
  
  ```
  场景：打开预设选择对话框
    工具：Playwright
    步骤:
      1. 导航到应用
      2. 触发打开对话框（通过按钮或命令）
      3. 验证对话框可见
      4. 验证显示所有预设（至少 3 个）
      5. 验证每个预设显示名称和描述
    预期结果：对话框正确显示所有预设
    证据：.sisyphus/evidence/task-2-dialog-open.png

  场景：选择并加载预设地图
    工具：Playwright
    步骤:
      1. 打开对话框
      2. 点击"防御要塞"预设
      3. 确认加载
      4. 等待 Toast 通知
      5. 验证画布显示城墙和建筑
    预期结果：地图成功加载，显示 Toast
    证据：.sisyphus/evidence/task-2-load-preset.png

  场景：取消加载
    工具：Playwright
    步骤:
      1. 打开对话框
      2. 选择一个预设
      3. 点击取消按钮
      4. 验证对话框关闭
      5. 验证地图未改变
    预期结果：对话框关闭，地图保持原样
    证据：.sisyphus/evidence/task-2-cancel-load.png

  场景：验证加载的地图数据
    工具：Playwright + 浏览器控制台
    步骤:
      1. 加载"防御要塞"预设
      2. 在控制台检查 mapStore 状态
      3. 验证 buildings.length > 0
      4. 验证城墙位置正确
    预期结果：MapData 包含预期的建筑和地形
    证据：.sisyphus/evidence/task-2-verify-data.txt
  ```

  **捕获证据**:
  - [ ] 截图保存为 .png 文件
  - [ ] Playwright 测试脚本保存

  **提交**: YES（与 1 分组）
  - 消息：`feat(preset): 添加预设地图选择对话框`
  - 文件：`src/components/dialog/PresetMapDialog.tsx`
  - 预提交：`npx tsc --noEmit`

---

- [ ] 3. 更新 App.tsx 集成对话框

  **做什么**:
  - 在 `src/App.tsx` 中导入 `PresetMapDialog`
  - 添加状态控制对话框打开/关闭
  - 修改 New Map 按钮点击事件：
    - 当前只显示 Toast
    - 改为打开预设选择对话框
  - （可选）添加快捷键支持（如 Ctrl+N）
  - 添加"空地图"快速选项（直接创建，不打开对话框）
  
  **不能做什么**:
  - 不改变现有 Header 布局
  - 不删除 New Map 按钮
  - 不影响其他按钮功能

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
  - `src/App.tsx:48-64` - handleNewMap 函数
  - `src/App.tsx:148-158` - 状态管理模式
  
  **验收标准**:
  - [ ] PresetMapDialog 组件已导入
  - [ ] New Map 按钮点击打开对话框
  - [ ] 对话框状态正确管理
  - [ ] TypeScript 编译通过
  - [ ] 无控制台错误

  **QA 场景**:
  ```
  场景：New Map 按钮集成
    工具：Playwright
    步骤:
      1. 导航到应用
      2. 点击 New Map 按钮
      3. 验证对话框打开
      4. 验证不再只显示 Toast
    预期结果：对话框正确响应按钮点击
    证据：.sisyphus/evidence/task-3-button-integration.png

  场景：快捷键支持（如果实现）
    工具：Playwright
    步骤:
      1. 按下 Ctrl+N
      2. 验证对话框打开
    预期结果：快捷键正常工作
    证据：.sisyphus/evidence/task-3-shortcut.png
  ```

  **提交**: YES
  - 消息：`feat(ui): 集成预设地图对话框到 New Map 按钮`
  - 文件：`src/App.tsx`
  - 预提交：`npx tsc --noEmit`

---

- [ ] 4. 手动测试和验证

  **做什么**:
  - 测试所有预设地图加载
  - 验证地图数据正确性
  - 测试边界情况（快速连续点击、取消等）
  - 截图保存测试结果
  - 收集用户反馈
  
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
  - [ ] 测试所有预设地图
  - [ ] 测试取消操作
  - [ ] 测试边界情况
  - [ ] 所有测试证据已保存

  **QA 场景**:
  ```
  场景：完整加载流程测试
    工具：Playwright + webapp-testing
    步骤:
      1. 测试所有 3-5 个预设
      2. 验证每个预设的地形/建筑正确
      3. 验证 Toast 通知显示正确数量
      4. 截图保存每个预设
    预期结果：所有预设都能正确加载
    证据：.sisyphus/evidence/task-4-all-presets-{name}.png
  ```

  **提交**: NO（仅测试）

---

## Final Verification Wave

> 4 个审查 Agent 并行运行。全部必须批准。向用户展示合并结果并获取明确"同意"后再完成。

- [ ] F1. **代码质量审查** — `unspecified-high`
  运行 `tsc --noEmit` + 检查所有变更文件：`as any`/`@ts-ignore`、空 catches、console.log、未使用导入。检查 AI 垃圾：过度注释、过度抽象、通用名称。
  输出：`Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F2. **功能验证** — `unspecified-high` (+ `webapp-testing` 如果有 UI)
  从干净状态开始。执行所有 QA 场景。测试跨任务集成。测试边界情况：空状态、无效输入。保存到 `.sisyphus/evidence/final-qa/`。
  输出：`Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

---

## Commit Strategy

- **1-2**: `feat(preset): 添加预设地图数据和选择对话框` — presetMaps.ts, PresetMapDialog.tsx, npx tsc --noEmit
- **3**: `feat(ui): 集成预设地图对话框` — App.tsx, npx tsc --noEmit

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
- [ ] 预设地图 >= 3 个
- [ ] 对话框正常工作
- [ ] New Map 按钮打开对话框
- [ ] 加载预设后 Toast 显示正确

---

**最后更新**: 2026 年 3 月 20 日

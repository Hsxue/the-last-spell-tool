# Konva Layer Performance Refactor

## TL;DR

> **目标**: 优化100x100地图的Konva Layer渲染性能，达到60fps
> 
> **核心优化**:
> - GridLayer: 添加视口裁剪 + 缩放级别过滤（2602条线 → ~200条线）
> - BuildingLayer: 评估Shape方案 vs Rect优化方案
> - MapCanvas: 优化Layer层级，添加listening: false
> 
> **风险级别**: 中等（BuildingLayer Shape转换需性能验证）
> **并行执行**: 是（3个独立波次）
> **关键路径**: GridLayer → BuildingLayer方案决策 → MapCanvas优化 → QA验证

---

## Context

### 原始需求
用户要求使用Konva最佳实践（Layer分层、视口裁剪、Shape缓存）重构当前地图Layer渲染。

### 当前架构问题
| Layer | 现状 | 性能问题 |
|-------|------|----------|
| **GridLayer** | 渲染全部2602条网格线 | 无视口裁剪，无缩放过滤 |
| **BuildingLayer** | 每个建筑遍历所有瓦片生成Rect | 组件数量多，无Shape优化 |
| **FlagLayer** | ✅ 已有优化 | 无问题 |
| **TerrainLayer** | ✅ 双Group缓存 | 无问题 |
| **MapCanvas** | 5个Layer | 缺少listening: false |

### Metis审查发现（已处理）
- ✅ GridLayer缺少line-based视口裁剪 → 已添加到viewportCulling.ts
- ⚠️ BuildingLayer Shape转换风险 → 拆分为性能验证 + 可选实现
- ✅ Layer级别listening配置 → 已添加到MapCanvas
- ✅ 性能基准测试 → 已添加到QA场景

---

## Work Objectives

### 核心目标
重构GridLayer和BuildingLayer，实现100x100地图60fps流畅渲染。

### 具体交付物
1. GridLayer.tsx - 视口裁剪 + 缩放密度过滤
2. viewportCulling.ts - 添加getVisibleGridLines函数
3. BuildingLayer.tsx - 性能验证后优化（方案待定）
4. MapCanvas.tsx - Layer层级优化

### 完成标准
- [ ] GridLayer只渲染视口内网格线（<10%总量）
- [ ] zoom<0.2时隐藏网格，0.2-0.5时显示主要网格线
- [ ] BuildingLayer在500建筑下保持60fps
- [ ] 所有静态Layer设置listening: false
- [ ] 通过Playwright性能测试

### 必须实现
- GridLayer视口裁剪和缩放过滤
- MapCanvas Layer层级优化

### 明确排除
- Web Worker并行计算（当前不需要）
- TerrainLayer修改（已有优化）
- FlagLayer修改（已有优化）

---

## Verification Strategy

### 测试策略
**基础设施**: 已有Playwright + Vitest
**测试方式**: 测试后添加（非TDD）

### QA政策
每个任务包含Agent可执行的QA场景：
- **UI验证**: Playwright截图对比
- **性能验证**: FPS监控 + 内存检查
- **交互验证**: 点击/悬停功能测试

---

## Execution Strategy

### 并行执行波次

```
Wave 1 (Start Immediately - Foundation):
├── Task 1: viewportCulling.ts添加getVisibleGridLines [quick]
├── Task 2: GridLayer添加视口裁剪和缩放过滤 [unspecified-high]
└── Task 3: MapCanvas优化Layer层级 [quick]

Wave 2 (After Wave 1 - Building Optimization):
├── Task 4: BuildingLayer性能基准测试 [unspecified-high]
├── Task 5: BuildingLayer优化实现（Rect或Shape） [unspecified-high]
└── Task 6: 添加BuildingLayer viewport culling [quick]

Wave 3 (After Wave 2 - Final Verification):
├── Task 7: 性能测试和QA验证 [unspecified-high]
└── Task 8: 回归测试 [unspecified-high]

Wave FINAL (After ALL tasks):
├── Task F1: 计划合规性审计 [oracle]
├── Task F2: 代码质量审查 [unspecified-high]
├── Task F3: 真实QA执行 [unspecified-high]
└── Task F4: 范围保真度检查 [deep]

Critical Path: T1 → T2 → T3 → T4 → T5 → T6 → F1-F4
```

### 依赖矩阵

| Task | 依赖 | 被阻塞于 | 并行组 |
|------|------|----------|--------|
| T1 | - | T2 | Wave 1 |
| T2 | T1 | - | Wave 1 |
| T3 | - | - | Wave 1 |
| T4 | T2, T3 | T5 | Wave 2 |
| T5 | T4 | - | Wave 2 |
| T6 | T5 | - | Wave 2 |
| T7 | T6 | F1-F4 | Wave 3 |
| T8 | T7 | F1-F4 | Wave 3 |
| F1-F4 | T8 | - | Final |

---

## TODOs

- [ ] 1. 添加 getVisibleGridLines 函数到 viewportCulling.ts

  **做什么**:
  - 在viewportCulling.ts中添加getVisibleGridLines函数
  - 支持垂直和水平线裁剪
  - 返回可见的线索引范围

  **必须不做**:
  - 不要修改现有isTileVisible函数
  - 不要添加React依赖

  **推荐Agent配置**:
  - **类别**: quick
  - **原因**: 纯工具函数，逻辑简单

  **并行化**:
  - **并行**: YES
  - **组**: Wave 1
  - **阻塞**: Task 2

  **参考文献**:
  - `src/lib/viewportCulling.ts:1-98` - 现有视口裁剪函数
  - `src/components/canvas/GridLayer.tsx:1-91` - 当前GridLayer实现

  **验收标准**:
  - [ ] 函数签名: `getVisibleGridLines(viewport, mapWidth, mapHeight, tileSize) => { vLines: number[], hLines: number[] }`
  - [ ] 正确处理视口边界
  - [ ] 包含2格安全边距

  **QA场景**:
  ```
  Scenario: 视口裁剪正确性
    Tool: Bun Test
    预条件: viewportCulling.ts已加载
    步骤:
      1. 调用getVisibleGridLines({x:0,y:0,width:400,height:300}, 2000, 2000, 20)
      2. 验证vLines范围在0-22之间
      3. 验证hLines范围在0-17之间
    期望结果: 只返回视口内的线（约20条线，而非101条）
    证据: .sisyphus/evidence/task-1-grid-culling.test.ts
  ```

  **提交**: YES
  - 信息: "feat(viewport): add getVisibleGridLines for grid culling"
  - 文件: `src/lib/viewportCulling.ts`
  - 预提交: `bun test src/lib/viewportCulling.test.ts`

- [ ] 2. GridLayer.tsx - 添加视口裁剪和缩放密度过滤

  **做什么**:
  - 使用getVisibleGridLines只渲染可见网格线
  - 添加缩放级别过滤:
    - zoom < 0.2: 隐藏网格
    - 0.2 <= zoom < 0.5: 显示主要网格线(每5格)
    - zoom >= 0.5: 显示全部网格线
  - 添加React.memo优化

  **必须不做**:
  - 不要修改grid线样式
  - 不要添加新的props

  **推荐Agent配置**:
  - **类别**: unspecified-high
  - **原因**: 需要理解现有视口裁剪和React性能优化

  **并行化**:
  - **并行**: YES（依赖T1）
  - **组**: Wave 1
  - **阻塞**: Task 4

  **参考文献**:
  - `src/components/canvas/GridLayer.tsx:1-91` - 当前实现
  - `src/components/canvas/TerrainLayer.tsx:300-393` - 视口裁剪使用示例
  - `src/components/canvas/BuildingLayer.tsx:92-157` - memo使用示例

  **验收标准**:
  - [ ] 只渲染可见范围内的网格线
  - [ ] zoom < 0.2时完全不渲染网格
  - [ ] 0.2 <= zoom < 0.5时每5格显示一条线
  - [ ] zoom >= 0.5时显示所有线
  - [ ] 添加listening: false到所有Line

  **QA场景**:
  ```
  Scenario: 缩放级别过滤
    Tool: Playwright
    预条件: 地图已加载，网格层可见
    步骤:
      1. 设置zoom为0.15，截图
      2. 设置zoom为0.3，截图
      3. 设置zoom为0.6，截图
      4. 使用OCR或像素检查验证网格密度
    期望结果: 
      - zoom=0.15: 无网格线
      - zoom=0.3: 约20条线(稀疏)
      - zoom=0.6: 约200条线(密集)
    证据: .sisyphus/evidence/task-2-zoom-filter-{zoom}.png

  Scenario: 视口裁剪
    Tool: Playwright
    预条件: zoom=1.0
    步骤:
      1. 记录初始网格线数量（DOM中）
      2. 平移地图到角落
      3. 记录新的网格线数量
    期望结果: 网格线数量显著减少（<10%）
    证据: .sisyphus/evidence/task-2-viewport-culling.json
  ```

  **提交**: YES
  - 信息: "feat(grid): add viewport culling and zoom-based density filtering"
  - 文件: `src/components/canvas/GridLayer.tsx`
  - 预提交: `bun test src/__tests__/terrain-regression.test.ts`

- [ ] 3. MapCanvas.tsx - 优化Layer层级配置

  **做什么**:
  - 为所有静态Layer添加listening: false
  - 验证Layer顺序和层级
  - 确保imageSmoothingEnabled配置正确

  **必须不做**:
  - 不要修改Layer的顺序
  - 不要添加新的Layer

  **推荐Agent配置**:
  - **类别**: quick
  - **原因**: 配置修改，风险低

  **并行化**:
  - **并行**: YES
  - **组**: Wave 1
  - **阻塞**: Task 4

  **参考文献**:
  - `src/components/canvas/MapCanvas.tsx:403-437` - Layer定义区域
  - Konva文档: https://konvajs.org/docs/performance/Listening_False.html

  **验收标准**:
  - [ ] GridLayer Layer设置listening: false
  - [ ] BuildingLayer Layer设置listening: false（交互由Shape处理）
  - [ ] FlagLayer Layer设置listening: false
  - [ ] TerrainLayer Layer保持listening（需要交互）

  **QA场景**:
  ```
  Scenario: Layer配置验证
    Tool: Bash (grep)
    预条件: 文件已修改
    步骤:
      1. grep -n "listening={false}" MapCanvas.tsx
      2. 验证Grid/Building/Flag Layer都有配置
    期望结果: 3个Layer都有listening: false
    证据: .sisyphus/evidence/task-3-layer-config.txt
  ```

  **提交**: YES
  - 信息: "perf(canvas): optimize Layer hierarchy with listening: false"
  - 文件: `src/components/canvas/MapCanvas.tsx`
  - 预提交: `bun test src/__tests__/building-flag-e2e.test.ts`

- [ ] 4. BuildingLayer - 性能基准测试

  **做什么**:
  - 使用Chrome DevTools Profile当前Rect实现
  - 测试500建筑的渲染性能
  - 记录FPS、渲染时间、内存使用
  - 生成性能报告

  **必须不做**:
  - 不要修改BuildingLayer代码
  - 不要添加新功能

  **推荐Agent配置**:
  - **类别**: unspecified-high
  - **原因**: 需要性能测试和分析能力
  - **技能**: playwright（用于性能测试）

  **并行化**:
  - **并行**: YES（依赖T2,T3）
  - **组**: Wave 2
  - **阻塞**: Task 5

  **参考文献**:
  - `src/components/canvas/BuildingLayer.tsx:92-157` - 当前实现
  - `src/__tests__/building-flag-performance.test.ts:1-100` - 性能测试示例

  **验收标准**:
  - [ ] 生成500建筑的测试场景
  - [ ] 记录当前FPS（目标：<30fps为需要优化）
  - [ ] 记录渲染时间（目标：>16ms为需要优化）
  - [ ] 生成性能报告到.sisyphus/evidence/

  **QA场景**:
  ```
  Scenario: 500建筑性能测试
    Tool: Playwright + Performance API
    预条件: BuildingLayer使用Rect实现
    步骤:
      1. 加载500个随机建筑
      2. 记录初始FPS
      3. 平移地图30秒，记录平均FPS
      4. 使用Chrome DevTools记录渲染时间
    期望结果: 生成性能报告
    证据: .sisyphus/evidence/task-4-performance-baseline.json

  Decision Point:
    IF FPS < 30 OR renderTime > 16ms:
      -> 继续Task 5（Shape优化）
    ELSE:
      -> 跳过Task 5，仅添加viewport culling
  ```

  **提交**: NO（测试代码，不提交）
  - 证据保存到: `.sisyphus/evidence/task-4-performance-baseline.json`

- [ ] 5. BuildingLayer - 优化实现（方案待定）

  **做什么**:
  **方案A**（Rect优化）:
  - 添加视口裁剪（只渲染可见建筑）
  - 保持现有Rect结构
  - 添加hitFunc优化

  **方案B**（Shape转换）:
  - 每个建筑使用单个Shape
  - 自定义sceneFunc绘制所有瓦片
  - 添加精确点击检测

  **必须不做**:
  - 不要破坏现有建筑交互（点击、悬停）
  - 不要改变建筑外观

  **推荐Agent配置**:
  - **类别**: unspecified-high
  - **原因**: 根据T4结果选择方案，可能需要复杂重构

  **并行化**:
  - **并行**: YES（依赖T4决策）
  - **组**: Wave 2
  - **阻塞**: Task 6

  **参考文献**:
  - `src/components/canvas/BuildingLayer.tsx:92-157` - 当前实现
  - `src/data/buildingBlueprints.ts:1-100` - 建筑蓝图数据
  - Konva Shape文档: https://konvajs.org/docs/shapes/Custom.html

  **验收标准**（方案A - Rect优化）:
  - [ ] 只渲染视口内的建筑
  - [ ] FPS >= 60
  - [ ] 交互功能正常（点击、悬停）

  **验收标准**（方案B - Shape转换）:
  - [ ] 每个建筑使用单个Shape
  - [ ] sceneFunc正确绘制所有瓦片
  - [ ] 精确点击检测（hitFunc）
  - [ ] 类别标记（Text）正确显示
  - [ ] FPS >= 60

  **QA场景**:
  ```
  Scenario: 建筑渲染性能
    Tool: Playwright + Performance API
    预条件: 500建筑已加载
    步骤:
      1. 记录FPS
      2. 平移/缩放地图
      3. 点击建筑验证交互
      4. 悬停建筑验证反馈
    期望结果: FPS >= 60，交互正常
    证据: .sisyphus/evidence/task-5-building-performance.json

  Scenario: 建筑交互功能
    Tool: Playwright
    预条件: 建筑已渲染
    步骤:
      1. 点击建筑
      2. 验证事件触发
      3. 悬停建筑
      4. 验证视觉反馈
    期望结果: 点击和悬停事件正常
    证据: .sisyphus/evidence/task-5-building-interaction.json
  ```

  **提交**: YES
  - 信息: "perf(building): optimize rendering with [方案名称]"
  - 文件: `src/components/canvas/BuildingLayer.tsx`
  - 预提交: `bun test src/__tests__/building-flag-e2e.test.ts`

- [ ] 6. BuildingLayer - 添加视口裁剪（如T5选择Shape方案）

  **做什么**:
  - 如果T5选择Shape方案，添加视口裁剪
  - 只渲染可见的建筑Shape

  **必须不做**:
  - 如果T5使用Rect方案并已有裁剪，则跳过

  **推荐Agent配置**:
  - **类别**: quick
  - **原因**: 简单的裁剪逻辑添加

  **并行化**:
  - **并行**: YES（依赖T5）
  - **组**: Wave 2
  - **阻塞**: Task 7

  **参考文献**:
  - `src/components/canvas/TerrainLayer.tsx:311-327` - 视口裁剪计算
  - `src/lib/viewportCulling.ts:29-51` - getVisibleTileRange

  **验收标准**:
  - [ ] 只渲染视口内的建筑
  - [ ] 平移时动态更新

  **QA场景**:
  ```
  Scenario: 建筑视口裁剪
    Tool: Playwright
    预条件: 500建筑已加载
    步骤:
      1. 记录当前DOM中Shape数量
      2. 平移到角落
      3. 记录新的Shape数量
    期望结果: Shape数量显著减少
    证据: .sisyphus/evidence/task-6-building-culling.json
  ```

  **提交**: YES（与T5同组）
  - 信息: 与T5合并提交

- [ ] 7. 综合性能测试

  **做什么**:
  - 测试100x100地图完整渲染
  - 记录FPS、内存、渲染时间
  - 与优化前对比

  **推荐Agent配置**:
  - **类别**: unspecified-high
  - **技能**: playwright

  **并行化**:
  - **并行**: YES（依赖T6）
  - **组**: Wave 3
  - **阻塞**: Task 8

  **参考文献**:
  - `src/__tests__/f3-final-qa.test.ts:1-200` - 现有QA测试
  - `playwright.config.ts:1-50` - Playwright配置

  **验收标准**:
  - [ ] 100x100地图FPS >= 60
  - [ ] 内存使用 < 500MB
  - [ ] 渲染时间 < 16ms

  **QA场景**:
  ```
  Scenario: 完整性能测试
    Tool: Playwright + Performance API
    预条件: 100x100地图，500建筑
    步骤:
      1. 初始加载测量
      2. 平移30秒
      3. 缩放10次
      4. 混合操作
    期望结果: 平均FPS >= 60，无卡顿
    证据: .sisyphus/evidence/task-7-final-performance.json
  ```

  **提交**: NO（测试结果）

- [ ] 8. 回归测试

  **做什么**:
  - 运行所有现有测试
  - 验证无功能回归
  - 修复任何失败的测试

  **推荐Agent配置**:
  - **类别**: unspecified-high

  **并行化**:
  - **并行**: YES（依赖T7）
  - **组**: Wave 3
  - **阻塞**: Final Wave

  **参考文献**:
  - `src/__tests__/terrain-regression.test.ts` - 地形回归测试
  - `src/__tests__/building-flag-e2e.test.ts` - 建筑测试
  - `src/__tests__/f3-final-qa.test.ts` - 最终QA

  **验收标准**:
  - [ ] 所有回归测试通过
  - [ ] 无控制台错误
  - [ ] 视觉对比无差异

  **QA场景**:
  ```
  Scenario: 回归测试
    Tool: Bash (bun test)
    预条件: 所有代码已修改
    步骤:
      1. 运行bun test
      2. 检查所有测试通过
      3. 运行Playwright e2e测试
    期望结果: 0失败
    证据: .sisyphus/evidence/task-8-regression-results.txt
  ```

  **提交**: NO

---

## Final Verification Wave

- [ ] F1. **计划合规性审计** - oracle
  读取计划端到端，验证每个"Must Have"已实现，验证"Must NOT Have"未出现，检查证据文件。
  输出: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT`

- [ ] F2. **代码质量审查** - unspecified-high
  运行TypeScript检查 + 代码审查，确保无AI slop模式。
  输出: `Build [PASS/FAIL] | Code Quality [PASS/FAIL]`

- [ ] F3. **真实QA执行** - unspecified-high
  执行所有QA场景，验证FPS、交互、裁剪正确性。
  输出: `Scenarios [N/N pass] | VERDICT`

- [ ] F4. **范围保真度检查** - deep
  验证没有实现计划外的功能，无范围蔓延。
  输出: `Scope [PASS/FAIL] | VERDICT`

---

## Commit Strategy

### Wave 1 (快速提交，独立)
1. `feat(viewport): add getVisibleGridLines for grid culling`
2. `feat(grid): add viewport culling and zoom-based density filtering`
3. `perf(canvas): optimize Layer hierarchy with listening: false`

### Wave 2（根据T4决策）
4. `perf(building): optimize rendering with [Rect culling OR Shape]`
5. `feat(building): add viewport culling for buildings`（如果需要）

### Wave 3
6. `test(perf): add comprehensive performance benchmarks`

---

## Success Criteria

### 性能指标
```bash
# 运行性能测试
cd .sisyphus/evidence && bun test ../../src/__tests__/performance-final.test.ts

# 期望输出:
# ✓ GridLayer renders <10% of total lines
# ✓ BuildingLayer maintains 60fps with 500 buildings
# ✓ Memory usage < 500MB
# ✓ Render time < 16ms
```

### 最终检查清单
- [ ] GridLayer视口裁剪工作正常
- [ ] GridLayer缩放过滤工作正常
- [ ] BuildingLayer性能达标（60fps）
- [ ] 所有静态Layer设置listening: false
- [ ] 所有测试通过
- [ ] 无回归问题

# The Last Spell - 地图编辑器文档索引

欢迎使用 **The Last Spell TileMap Editor** 项目文档！

---

## 📚 文档导航

### 🌟 快速开始

1. **[项目文档](./项目文档.md)** - 完整的项目概述、技术栈、架构设计
   - 适合：新加入的开发者、需要了解项目全貌的人员
   - 内容：技术栈、目录结构、组件层次、开发规范

2. **[核心功能详解](./核心功能详解.md)** - 深入讲解各功能模块的实现
   - 适合：功能开发者、需要实现特定功能的人员
   - 内容：地图编辑、建筑系统、旗帜系统、性能优化

3. **[API 参考](./API 参考.md)** - 详细的 API 文档和类型定义
   - 适合：日常开发查阅、接口参考
   - 内容：状态管理、组件 API、工具函数、类型定义

---

## 📖 按主题浏览

### 项目概览

| 文档 | 说明 |
|------|------|
| [项目文档](./项目文档.md) | 完整的项目介绍，包括技术栈、架构、开发规范 |
| [README](../README.md) | 项目快速入门指南 |

### 功能模块

| 文档 | 说明 |
|------|------|
| [核心功能详解](./核心功能详解.md#1-地图编辑器) | 地图编辑器功能详解 |
| [核心功能详解](./核心功能详解.md#2-建筑系统) | 建筑蓝图、放置规则、碰撞检测 |
| [核心功能详解](./核心功能详解.md#3-旗帜系统) | 旗帜分类、配置、渲染 |
| [核心功能详解](./核心功能详解.md#4-游戏配置) | 游戏配置、波次定义、XML 导入导出 |
| [核心功能详解](./核心功能详解.md#5-武器与技能) | 武器技能配置、本地化系统 |

### API 参考

| 文档 | 说明 |
|------|------|
| [API 参考 - 状态管理](./API 参考.md#1-状态管理-api) | Zustand Store 完整 API |
| [API 参考 - 渲染组件](./API 参考.md#2-渲染组件-api) | Konva 组件 API |
| [API 参考 - 工具函数](./API 参考.md#3-工具函数-api) | 视口裁剪、放置引擎、性能监控 |
| [API 参考 - 类型定义](./API 参考.md#4-类型定义) | TypeScript 类型定义 |

### 性能优化

| 主题 | 位置 |
|------|------|
| 视口裁剪 | [核心功能详解](./核心功能详解.md#61-视口裁剪) / [API 参考](./API 参考.md#31-viewport-culling) |
| 网格密度过滤 | [核心功能详解](./核心功能详解.md#62-网格密度过滤) |
| React 优化 | [核心功能详解](./核心功能详解.md#63-react-优化) |
| Konva 优化 | [核心功能详解](./核心功能详解.md#64-konva-优化) |
| 性能监控 | [核心功能详解](./核心功能详解.md#71-性能监控) |

### 开发工具

| 工具 | 说明 |
|------|------|
| Playwright E2E | [核心功能详解](./核心功能详解.md#72-e2e-测试) |
| ESLint | [项目文档](./项目文档.md#开发规范) |
| TypeScript | [项目文档](./项目文档.md#开发规范) |

---

## 🎯 常见任务指引

### 我想...

#### 添加新的建筑类型
1. 在 [`src/data/buildingBlueprints.ts`](../src/data/buildingBlueprints.ts) 添加蓝图
2. 定义建筑形状（tiles 数组）
3. 指定分类（category）
4. 设置锚点（originX, originY）

参考：[核心功能详解 - 建筑蓝图](./核心功能详解.md#22-建筑蓝图 -141-种)

---

#### 添加新的旗帜类型
1. 在 [`src/types/map.ts`](../src/types/map.ts) 添加旗帜配置到 `FLAG_CONFIG`
2. 定义 marker（符号）、color（颜色）、size（大小）
3. 如果是 Zone 旗帜，添加到 `ZONE_FLAGS` 和 `ZONE_COLORS`

参考：[核心功能详解 - 旗帜配置](./核心功能详解.md#32-旗帜配置)

---

#### 修改地图默认尺寸
1. 在 [`src/store/mapStore.ts`](../src/store/mapStore.ts) 修改 `DEFAULT_WIDTH` 和 `DEFAULT_HEIGHT`

参考：[API 参考 - 常量定义](./API 参考.md#52-默认值)

---

#### 调整缩放范围
1. 在 [`src/components/canvas/MapCanvas.tsx`](../src/components/canvas/MapCanvas.tsx) 修改 `clamp` 函数的 min/max 值

参考：[核心功能详解 - 视图控制](./核心功能详解.md#12-视图控制)

---

#### 添加新的地形类型
1. 在 [`src/types/map.ts`](../src/types/map.ts) 添加类型到 `TerrainType`
2. 在 `TERRAIN_COLORS` 添加颜色
3. 在侧边栏添加选择按钮

参考：[核心功能详解 - 地形编辑](./核心功能详解.md#11-地形编辑)

---

#### 优化渲染性能
1. 确保使用 `getVisibleTileRange` 进行视口裁剪
2. 静态图层设置 `listening: false`
3. 使用 `React.memo` 包裹组件
4. 批量更新使用 `setTerrainBatch`

参考：[核心功能详解 - 性能优化](./核心功能详解.md#6-性能优化技术)

---

#### 导出/导入地图
- 导出：使用 `MapXmlExporter.exportMapToXml(mapData)`
- 导入：解析 XML 后调用 `setMapData(mapData)`

参考：[核心功能详解 - XML 导入导出](./核心功能详解.md#44-导入导出)

---

## 🔧 开发环境

### 启动开发服务器
```bash
npm install
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm run test
```

### 代码检查
```bash
npm run lint
```

详细说明：[项目文档 - 构建与部署](./项目文档.md#构建与部署)

---

## 📊 性能目标

| 指标 | 目标值 |
|------|--------|
| FPS | 60 |
| 渲染时间 | < 16ms |
| 地图尺寸 | 最大 100x100 |
| 建筑数量 | 建议 < 1000 |
| 缩放范围 | 0.25x - 2x |

监控方法：[性能监控](./核心功能详解.md#71-性能监控)

---

## 📝 数据格式

### 地图数据结构
```typescript
interface MapData {
  width: number;
  height: number;
  terrain: Map<string, TerrainType>;  // "x,y" -> "Dirt" | "Stone" | "Crater"
  buildings: Building[];
  flags: Map<string, Array<[number, number]>>;
}
```

### 建筑数据结构
```typescript
interface Building {
  id: string;
  x: number;
  y: number;
  health?: number;
}
```

### 旗帜数据结构
```typescript
interface TileFlag {
  flagType: string;
  x: number;
  y: number;
  value?: string;
}
```

详细类型定义：[API 参考 - 类型定义](./API 参考.md#4-类型定义)

---

## 🏗️ 架构概览

```
┌─────────────────────────────────────────────────┐
│                      App                        │
├─────────────────────────────────────────────────┤
│  Header  │  FeatureTabs (地图/配置/武器技能)    │
├──────────┴──────────────────────────────────────┤
│                  MainContent                     │
│  ┌────────────┬──────────────────────────────┐  │
│  │  Sidebar   │      MapCanvas (Konva)       │  │
│  │  - Terrain │  ┌────────────────────────┐  │  │
│  │  - Building│  │  TerrainLayer          │  │  │
│  │  - Flag    │  │  GridLayer             │  │  │
│  │  - Config  │  │  BuildingLayer         │  │  │
│  │            │  │  FlagLayer             │  │  │
│  │            │  │  Preview Layers        │  │  │
│  │            │  └────────────────────────┘  │  │
│  └────────────┴──────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│              MapStatusBar (坐标显示)             │
└─────────────────────────────────────────────────┘
```

详细架构图：[项目文档 - 组件层次结构](./项目文档.md#组件层次结构)

---

## 🔗 外部资源

### 库文档

| 库 | 文档链接 |
|------|----------|
| React | https://react.dev/ |
| Konva | https://konvajs.org/docs/ |
| React-Konva | https://github.com/konvajs/react-konva |
| Zustand | https://zustand-demo.pmnd.rs/ |
| TypeScript | https://www.typescriptlang.org/docs/ |
| Tailwind CSS | https://tailwindcss.com/docs |

### 游戏相关

| 资源 | 说明 |
|------|------|
| 游戏设计文档 | `../../../docs/游戏设计文档/` |
| BuildingDefinitions.txt | 建筑蓝图原始数据源 |
| 游戏引擎 | Godot（导出目标） |

---

## 📅 文档更新记录

| 日期 | 更新内容 |
|------|----------|
| 2026-03-20 | 创建完整文档体系 |
| | - 项目文档 |
| | - 核心功能详解 |
| | - API 参考 |

---

## 💡 贡献指南

### 文档规范

1. **标题层级**：使用 `#` `##` `###` 保持清晰层级
2. **代码块**：所有代码示例使用 ```typescript 标注
3. **表格**：复杂数据使用表格展示
4. **链接**：内部链接使用相对路径，外部链接提供完整 URL

### 提交规范

```
docs: 更新 API 参考文档
feat: 添加建筑预览功能
fix: 修复网格线渲染问题
perf: 优化视口裁剪性能
test: 添加 E2E 测试用例
```

---

## ❓ 常见问题

### Q: 如何查看当前 FPS？
A: 按 `P` 键切换性能监控面板显示。详见 [性能监控](./核心功能详解.md#71-性能监控)

### Q: 建筑预览为什么显示红色？
A: 红色表示放置位置无效（超出边界或与其他建筑重叠）。详见 [放置规则](./核心功能详解.md#23-放置规则)

### Q: 如何禁用网格线显示？
A: 在左侧边栏的 Layers 部分取消勾选 Grid，或在代码中设置 `setLayerVisibility('grid', false)`。详见 [图层控制](./核心功能详解.md#13-图层控制)

### Q: 最大支持多少建筑？
A: 建议 < 1000 以保持 60fps。实际数量取决于建筑复杂度和视图范围。详见 [性能目标](#-性能目标)

### Q: 如何添加新的编辑模式？
A: 
1. 在 `EditorMode` 类型中添加新模式
2. 在 MapStore 添加对应状态
3. 在 MapCanvas 添加模式切换逻辑
4. 添加对应的预览和放置逻辑

---

## 📞 支持

如有问题，请：
1. 先查阅相关文档
2. 检查 [常见问题](#-常见问题)
3. 在项目中搜索类似实现
4. 联系项目维护者

---

**文档版本**: 1.0  
**最后更新**: 2026 年 3 月 20 日  
**维护者**: The Last Spell 开发团队

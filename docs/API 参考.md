# API 参考文档

## 目录

1. [状态管理 API](#1-状态管理-api)
2. [渲染组件 API](#2-渲染组件-api)
3. [工具函数 API](#3-工具函数-api)
4. [类型定义](#4-类型定义)

---

## 1. 状态管理 API

### 1.1 MapStore

**导入**：
```typescript
import { useMapStore } from './store/mapStore';
```

#### 状态字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `mapData` | `MapData \| null` | 完整地图数据 |
| `width` | `number` | 地图宽度（格） |
| `height` | `number` | 地图高度（格） |
| `editorMode` | `EditorMode` | 当前编辑模式 |
| `selectedTerrain` | `TerrainType` | 选中的地形类型 |
| `selectedBuilding` | `string \| null` | 选中的建筑 ID |
| `selectedFlag` | `string \| null` | 选中的旗帜类型 |
| `brushSize` | `number` | 画笔大小 (1-10) |
| `buildingHealth` | `number \| undefined` | 建筑健康值 |
| `isRemoving` | `boolean` | 是否处于删除模式 |
| `removeMode` | `'building' \| 'flag' \| null` | 删除模式类型 |
| `viewport` | `ViewportState` | 视图状态 |
| `layerVisibility` | `LayerVisibility` | 图层可见性 |
| `hoveredTile` | `{x, y} \| null` | 当前悬停的格子 |

#### Action Methods

##### 地图数据操作

```typescript
// 设置完整地图数据
setMapData: (mapData: MapData) => void

// 设置地图尺寸
setMapSize: (width: number, height: number) => void

// 清空地图
clearMap: () => void
```

##### 地形操作

```typescript
// 设置单个格子地形
setTerrain: (x: number, y: number, terrain: TerrainType) => void

// 批量设置地形（高效）
setTerrainBatch: (terrainMap: Map<string, TerrainType>) => void
// terrainMap key 格式："x,y"
```

##### 建筑操作

```typescript
// 添加建筑
addBuilding: (building: Building) => void
// Building: { id: string, x: number, y: number, health?: number }

// 移除建筑
removeBuilding: (x: number, y: number) => void
```

##### 旗帜操作

```typescript
// 添加旗帜
addFlag: (flag: TileFlag) => void
// TileFlag: { flagType: string, x: number, y: number, value?: string }

// 移除旗帜
removeFlag: (x: number, y: number, flagType: string) => void
```

##### 编辑器状态

```typescript
setEditorMode: (mode: EditorMode) => void
setSelectedTerrain: (terrain: TerrainType) => void
setSelectedBuilding: (buildingId: string | null) => void
setSelectedFlag: (flagType: string | null) => void
setBrushSize: (size: number) => void
setBuildingHealth: (health: number | undefined) => void
```

##### 删除模式

```typescript
setIsRemoving: (isRemoving: boolean) => void
setRemoveMode: (mode: 'building' | 'flag' | null) => void
```

##### 视图控制

```typescript
setViewport: (viewport: Partial<ViewportState>) => void
// ViewportState: { zoom, offsetX, offsetY, isPanning }

setLayerVisibility: (layer: keyof LayerVisibility, visible: boolean) => void
```

##### UI 状态

```typescript
setHoveredTile: (tile: { x: number; y: number } | null) => void
setShowBuildingPreview: (show: boolean) => void
```

##### 错误处理

```typescript
addError: (error: string) => void
clearErrors: () => void
```

#### Selectors

```typescript
// 获取指定位置的地形
selectTerrainAt: (x: number, y: number) => (state: MapState) => TerrainType

// 获取指定位置的建筑
selectBuildingAt: (x: number, y: number) => (state: MapState) => Building | null

// 获取指定位置的所有旗帜
selectFlagsAt: (x: number, y: number) => (state: MapState) => string[]

// 获取所有建筑占用的格子 Set
selectOccupiedTiles: (state: MapState) => Set<string>
// 返回 Set<"x,y"> 用于 O(1) 碰撞检测

// 获取指定位置的旗帜类型数组
selectFlagsAtPosition: (x: number, y: number) => (state: MapState) => string[]
```

---

### 1.2 UIStore

**导入**：
```typescript
import { useUIStore } from './store/uiStore';
```

#### 状态字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `activeFeatureTab` | `FeatureTab` | 主功能标签 |
| `activeTab` | `SidebarTab` | 侧边栏标签 |
| `toasts` | `Toast[]` | Toast 通知列表 |
| `layerVisibility` | `LayerVisibility` | 图层可见性（冗余） |

#### Action Methods

```typescript
// 切换主功能标签
setActiveFeatureTab: (tab: FeatureTab) => void
// FeatureTab: 'mapEditor' | 'gameConfig' | 'weaponSkill'

// 切换侧边栏标签
setActiveTab: (tab: SidebarTab) => void
// SidebarTab: 'terrain' | 'building' | 'flag' | 'config'

// 设置图层可见性
setLayerVisibility: (layer: keyof LayerVisibility, visible: boolean) => void

// Toast 通知
addToast: (toast: Toast) => void
removeToast: (toastId: string) => void
```

#### Toast 类型

```typescript
interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // 毫秒，默认 3000
}
```

---

### 1.3 ConfigStore

**导入**：
```typescript
import { useConfigStore } from './store/configStore';
```

用于游戏配置管理（腐化、迷雾、波次等）。

---

### 1.4 WeaponSkillStore

**导入**：
```typescript
import { useWeaponSkillStore } from './store/weaponSkillStore';
```

用于武器和技能配置管理。

---

## 2. 渲染组件 API

### 2.1 MapCanvas

**路径**：`src/components/canvas/MapCanvas.tsx`

**Props**：
```typescript
interface MapCanvasProps {
  className?: string;  // 可选 CSS 类名
}
```

**用法**：
```tsx
<MapCanvas className="custom-class" />
```

**特性**：
- 自动居中地图
- 鼠标滚轮缩放（0.25x - 2x）
- 拖拽平移
- 坐标追踪
- 建筑/旗帜放置

---

### 2.2 TerrainLayer

**路径**：`src/components/canvas/TerrainLayer.tsx`

**Props**：
```typescript
interface TerrainLayerProps {
  mapData: MapData | null;
  viewport: ViewportState;
}
```

**优化**：
- 视口裁剪
- React.memo 缓存
- 双 Group 缓存（地形格 + 城市/魔法圈标记）

---

### 2.3 GridLayer

**路径**：`src/components/canvas/GridLayer.tsx`

**Props**：
```typescript
interface GridLayerProps {
  width: number;       // 地图宽度（格数）
  height: number;      // 地图高度（格数）
  zoom: number;        // 当前缩放
  offsetX: number;     // X 偏移
  offsetY: number;     // Y 偏移
}
```

**特性**：
- 视口裁剪
- Zoom 密度过滤
  - `< 0.2`: 隐藏所有网格线
  - `0.2 - 0.5`: 仅显示主网格线（每 5 格）
  - `>= 0.5`: 显示所有网格线

---

### 2.4 BuildingLayer

**路径**：`src/components/canvas/BuildingLayer.tsx`

**Props**：
```typescript
interface BuildingLayerProps {
  buildings: Building[];
  viewport: ViewportState;
}
```

**渲染内容**：
- 建筑外框（分类颜色）
- 建筑占据格子
- 分类标记（角标）
- 健康值显示

**优化**：
- `listening: false` 禁用事件
- React.memo 缓存
- 视口裁剪

---

### 2.5 BuildingPreview

**路径**：`src/components/canvas/BuildingLayer.tsx`

**Props**：
```typescript
interface BuildingPreviewProps {
  hoveredTile: { x: number; y: number } | null;
  selectedBuilding: string | null;
}
```

**渲染内容**：
- 建筑蓝图形状预览
- 绿色 = 可放置，红色 = 不可放置
- 使用 `placementEngine-blueprint.ts` 进行碰撞检测

---

### 2.6 FlagLayer

**路径**：`src/components/canvas/FlagLayer.tsx`

**Props**：
```typescript
interface FlagLayerProps {
  mapData: MapData | null;
  viewport: ViewportState;
}
```

**渲染内容**：
- Zone 矩形区域
- 特殊旗帜标记（符号 + 颜色）

**优化**：
- 视口裁剪
- `listening: false`

---

### 2.7 FlagPreview

**路径**：`src/components/canvas/FlagLayer.tsx`

**Props**：
```typescript
interface FlagPreviewProps {
  hoveredTile: { x: number; y: number } | null;
  selectedFlag: string | null;
}
```

**渲染内容**：
- Zone 矩形预览
- 特殊旗帜标记预览

---

### 2.8 MouseTracker

**路径**：`src/components/canvas/MouseTracker.tsx`

用于追踪鼠标坐标的辅助组件。

---

## 3. 工具函数 API

### 3.1 Viewport Culling

**路径**：`src/lib/viewportCulling.ts`

#### getVisibleTileRange

```typescript
/**
 * 计算可见格子范围（含 2 格安全边界）
 */
export function getVisibleTileRange(
  viewport: Viewport,
  mapWidth: number,
  mapHeight: number,
  tileSize: number
): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
```

**参数**：
- `viewport`: `{ x, y, width, height }` - 视口矩形
- `mapWidth`: 地图总宽度（像素）
- `mapHeight`: 地图总高度（像素）
- `tileSize`: 格子大小（像素），默认 20

**返回**：
- `minX`, `maxX`, `minY`, `maxY`: 可见格子索引范围

---

#### isTileVisible

```typescript
/**
 * 检查格子是否可见
 */
export function isTileVisible(
  tileX: number,
  tileY: number,
  visibleRange: { minX: number; maxX: number; minY: number; maxY: number }
): boolean
```

---

#### getVisibleGridLines

```typescript
/**
 * 获取可见网格线（带 zoom 密度过滤）
 */
export function getVisibleGridLines(
  viewport: Viewport,
  mapWidth: number,
  mapHeight: number,
  tileSize: number,
  zoom: number
): {
  verticalLines: number[];
  horizontalLines: number[];
}
```

**密度过滤规则**：
- `zoom < 0.2`: 返回空数组（隐藏所有网格线）
- `zoom < 0.5`: 每 5 格显示一条主线
- `zoom >= 0.5`: 显示所有线

---

### 3.2 Placement Engine

**路径**：`src/lib/placementEngine-blueprint.ts`

#### canPlaceBuilding

```typescript
/**
 * 检查建筑是否可以放置
 */
export function canPlaceBuilding(
  buildingId: string,
  positionX: number,
  positionY: number,
  mapDimensions: MapDimensions,
  existingBuildings?: PlacedBuilding[]
): PlacementResult
```

**参数**：
- `buildingId`: 建筑蓝图 ID
- `positionX`, `positionY`: 放置位置（锚点）
- `mapDimensions`: `{ width, height }` 地图尺寸
- `existingBuildings`: 已放置建筑数组

**返回**：
```typescript
interface PlacementResult {
  valid: boolean;
  reason?: string;           // 无效时的原因
  occupiedTiles?: [number, number][];  // 占用的格子
}
```

---

#### getOccupiedTiles

```typescript
/**
 * 获取建筑占用的所有格子
 */
export function getOccupiedTiles(
  buildingId: string,
  positionX: number,
  positionY: number
): Array<[number, number]>
```

**计算逻辑**：
```typescript
const baseX = positionX - blueprint.originX;
const baseY = positionY - blueprint.originY;

blueprint.tiles.forEach((row, rowIndex) => {
  row.forEach((cell, colIndex) => {
    if (cell !== '_') {  // 跳过空白格
      tiles.push([baseX + colIndex, baseY + rowIndex]);
    }
  });
});
```

---

#### getAllOccupiedTiles

```typescript
/**
 * 收集所有建筑的占用格子（用于 O(1) 碰撞检测）
 */
export function getAllOccupiedTiles(
  buildings: PlacedBuilding[]
): Set<string>
// 返回 Set<"x,y">
```

---

#### getBuildingPreviewData

```typescript
/**
 * 获取建筑预览数据
 */
export function getBuildingPreviewData(
  buildingId: string,
  positionX: number,
  positionY: number,
  mapDimensions: MapDimensions,
  existingBuildings?: PlacedBuilding[]
): {
  tiles: Array<[number, number]>;
  color: string;      // '#4CAF50' 或 '#ff4444'
  isInvalid: boolean;
  reason?: string;
}
```

---

#### getBuildingDimensions

```typescript
/**
 * 获取建筑尺寸
 */
export function getBuildingDimensions(
  buildingId: string
): { width: number; height: number } | null
```

---

### 3.3 Performance Monitor

**路径**：`src/lib/performanceMonitor.ts`

#### startMonitoring

```typescript
/**
 * 启动性能监控
 * 追踪 FPS、渲染时间、内存使用
 */
export function startMonitoring(): void
```

---

#### stopMonitoring

```typescript
/**
 * 停止监控
 */
export function stopMonitoring(): void
```

---

#### getMetrics

```typescript
/**
 * 获取当前性能指标
 */
export function getMetrics(): Metrics

interface Metrics {
  fps: number | null;
  renderTime: number | null;
  memory?: {
    used: number;
    total: number;
  };
}
```

---

#### PerformanceMonitor (组件)

```typescript
/**
 * React 组件 - 显示 FPS 覆盖层
 * 按 P 键切换显示
 */
export function PerformanceMonitor(): null
```

**用法**：
```tsx
import { PerformanceMonitor } from './lib/performanceMonitor';

function App() {
  return (
    <>
      <PerformanceMonitor />
      {/* 其他组件 */}
    </>
  );
}
```

---

### 3.4 Map XML Exporter

**路径**：`src/lib/mapXmlExporter.ts`

#### exportMapToXml

```typescript
/**
 * 导出地图为 XML 格式
 */
export function exportMapToXml(mapData: MapData): string
```

**XML 格式**：
```xml
<MapData>
  <Width>51</Width>
  <Height>51</Height>
  <Terrain>
    <Tile x="0" y="0" type="Dirt" />
  </Terrain>
  <Buildings>
    <Building id="MagicCircle" x="25" y="25" health="100" />
  </Buildings>
  <Flags>
    <Flag type="EnemyMagnet" x="10" y="10" />
  </Flags>
</MapData>
```

---

### 3.5 Config Serializer

**路径**：`src/lib/configSerializer.ts`

用于游戏配置的序列化/反序列化。

---

### 3.6 Localization

**路径**：`src/lib/localization.ts`

#### 多语言支持

```typescript
interface LocalizationKey {
  en: string;
  zh: string;
}

export function translate(key: LocalizationKey, language: 'en' | 'zh'): string;
```

---

## 4. 类型定义

### 4.1 基础类型

**路径**：`src/types/map.ts`

#### TerrainType

```typescript
type TerrainType = 'Crater' | 'Dirt' | 'Stone' | 'Empty';

const TERRAIN_COLORS: Record<TerrainType, string> = {
  Crater: '#8B4513',
  Dirt: '#228B22',
  Stone: '#808080',
  Empty: 'transparent',
};
```

---

#### Building

```typescript
interface Building {
  id: string;
  x: number;
  y: number;
  health?: number;  // <0 时视为 null
}
```

---

#### BuildingBlueprint

```typescript
interface BuildingBlueprint {
  id: string;
  tiles: string[][];  // 2D ASCII 网格
  originX: number;
  originY: number;
}
```

**符号说明**：
- `'B'`: 实体方块
- `'H'`: 可通行方块（城门）
- `'E'`: 空方块
- `'_'`: 空白（不渲染不碰撞）

---

#### BuildingCategory

```typescript
type BuildingCategory =
  | 'Wall'
  | 'Trap'
  | 'Tower'
  | 'Seed'
  | 'Building'
  | 'Resource'
  | 'Container'
  | 'Ruins'
  | 'Decor'
  | 'Corrupted'
  | 'Brazier'
  | 'Special';

const BUILDING_CATEGORY_COLORS: Record<BuildingCategory, string> = {
  Wall: '#FF6B6B',
  Trap: '#9B59B6',
  // ...
};
```

---

#### TileFlag

```typescript
interface TileFlag {
  flagType: string;
  x: number;
  y: number;
  value?: string;  // 扩展属性
}
```

---

#### FlagConfig

```typescript
interface FlagConfig {
  marker: string;   // 显示符号
  color: string;    // HEX 颜色
  size: number;     // 大小
}

const FLAG_CONFIG: Record<string, FlagConfig> = {
  EnemyMagnet: { marker: '★', color: '#FF4444', size: 10 },
  // ...
};
```

---

#### Zone Flags

```typescript
const ZONE_FLAGS = [
  'Zone_N', 'Zone_S', 'Zone_E', 'Zone_W',       // 基础方向
  'Zone_NW', 'Zone_SW', 'Zone_SE', 'Zone_NE',   // 对角方向
  'Zone_E_SE', 'Zone_N_NW', 'Zone_S_SE',        // 复合方向
  // ...
] as const;

type ZoneFlag = (typeof ZONE_FLAGS)[number];

const ZONE_COLORS: Record<string, string> = {
  Zone_N: '#FFB6C1',    // 粉色 - 基础方向
  Zone_SE: '#ADD8E6',   // 浅蓝 - 对角方向
  Zone_E_SE: '#98FB98', // 浅绿 - 复合方向
  // ...
};
```

---

#### MapData

```typescript
interface MapData {
  width: number;
  height: number;
  terrain: Map<string, TerrainType>;  // "x,y" -> terrainType
  buildings: Building[];
  flags: Map<string, Array<[number, number]>>;  // flagType -> positions
}
```

---

#### EditorMode

```typescript
type EditorMode = 'terrain' | 'building' | 'flag' | 'eraser';
```

---

#### ViewportState

```typescript
interface ViewportState {
  zoom: number;         // 0.25 - 2
  offsetX: number;
  offsetY: number;
  isPanning: boolean;
  lastMouseX?: number;
  lastMouseY?: number;
}
```

---

#### LayerVisibility

```typescript
interface LayerVisibility {
  zones: boolean;
  grid: boolean;
  flags: boolean;
  buildings: boolean;
  occupied: boolean;
  categoryMarkers: boolean;
}
```

---

### 4.2 配置类型

**路径**：`src/types/config.ts`

定义游戏配置相关类型（腐化、迷雾、波次等）。

---

### 4.3 武器技能类型

**路径**：`src/types/weapon-skill.ts`

```typescript
interface WeaponConfig {
  id: string;
  name: LocalizationKey;
  damage: number;
  attackSpeed: number;
  range: number;
  projectileType: string;
  effects: Effect[];
}

interface SkillConfig {
  id: string;
  name: LocalizationKey;
  manaCost: number;
  cooldown: number;
  description: LocalizationKey;
  effects: Effect[];
}

interface LocalizationKey {
  en: string;
  zh: string;
}
```

---

## 5. 常量定义

### 5.1 建筑蓝图常量

**路径**：`src/data/buildingBlueprints.ts`

```typescript
const BUILDING_BLUEPRINTS: BuildingBlueprintWithCategory[] = [
  // 141 种建筑蓝图
  {
    id: 'MagicCircle',
    category: 'Special',
    tiles: [['B', 'B', 'B'], ['B', 'B', 'B'], ['B', 'B', 'B']],
    originX: 1,
    originY: 1
  },
  // ...
];
```

---

### 5.2 默认值

```typescript
// 默认地图尺寸
const DEFAULT_WIDTH = 51;
const DEFAULT_HEIGHT = 51;

// 默认格子大小
const TILE_SIZE = 20;

// 默认缩放
const DEFAULT_ZOOM = 1;

// 缩放范围
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;

// 画笔大小范围
const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 10;
```

---

**最后更新**: 2026 年 3 月 20 日

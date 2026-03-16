/**
 * TileMapEditor Type Definitions
 * Maps to Python version data models from tilemap-editor-feature-doc.md
 */

// ============================================================================
// Terrain Types
// ============================================================================

export type TerrainType = 'Crater' | 'Dirt' | 'Stone' | 'Empty';

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  Crater: '#8B4513',
  Dirt: '#228B22',
  Stone: '#808080',
  Empty: 'transparent',
};

// ============================================================================
// Building Types
// ============================================================================

export interface Building {
  /** Building ID (e.g., "MagicCircle", "StoneWall") */
  id: string;
  /** X coordinate (origin at top-left) */
  x: number;
  /** Y coordinate (increases downward) */
  y: number;
  /** Health points (optional, <0 will be set to null) */
  health?: number;
}

export interface BuildingBlueprint {
  /** Building ID */
  id: string;
  /** 2D ASCII grid representing building shape */
  tiles: string[][];
  /** Origin X coordinate (anchor point) */
  originX: number;
  /** Origin Y coordinate (anchor point) */
  originY: number;
}

export type BuildingCategory =
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

export const BUILDING_CATEGORY_COLORS: Record<BuildingCategory, string> = {
  Wall: '#FF6B6B',
  Trap: '#9B59B6',
  Tower: '#FF9F43',
  Seed: '#2ECC71',
  Building: '#3498DB',
  Resource: '#E67E22',
  Container: '#8B4513',
  Ruins: '#7F8C8D',
  Decor: '#F1C40F',
  Corrupted: '#8E44AD',
  Brazier: '#E74C3C',
  Special: '#FF69B4',
};

// ============================================================================
// Flag/TileFlag Types
// ============================================================================

export interface TileFlag {
  /** Flag type (e.g., "EnemyMagnet", "Zone_E") */
  flagType: string;
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Extended property (reserved) */
  value?: string;
}

export interface FlagConfig {
  /** Display marker symbol */
  marker: string;
  /** Display color (HEX) */
  color: string;
  /** Display size */
  size: number;
}

export const FLAG_CONFIG: Record<string, FlagConfig> = {
  EnemyMagnet: { marker: '★', color: '#FF4444', size: 10 },
  FogSpawner: { marker: '●', color: '#9400D3', size: 10 },
  NessieBoss1: { marker: 'B1', color: '#FF6347', size: 9 },
  NessieBoss2: { marker: 'B2', color: '#FF4500', size: 9 },
  NessieBoss3: { marker: 'B3', color: '#DC143C', size: 9 },
  NessieEgg: { marker: '◆', color: '#00CED1', size: 10 },
  Altar: { marker: '✝', color: '#FFD700', size: 10 },
  MagicCircle: { marker: '●', color: '#9400D3', size: 12 },
};

// Zone flag types
export const ZONE_FLAGS = [
  // Base directions
  'Zone_N',
  'Zone_S',
  'Zone_E',
  'Zone_W',
  // Diagonal directions
  'Zone_NW',
  'Zone_SW',
  'Zone_SE',
  'Zone_NE',
  // Composite directions
  'Zone_E_SE',
  'Zone_N_NW',
  'Zone_S_SE',
  'Zone_S_SW',
  'Zone_W_NW',
  'Zone_W_SW',
] as const;

export type ZoneFlag = (typeof ZONE_FLAGS)[number];

export const ZONE_COLORS: Record<string, string> = {
  // Base directions - Pink
  Zone_N: '#FFB6C1',
  Zone_S: '#FFB6C1',
  Zone_E: '#FFB6C1',
  Zone_W: '#FFB6C1',
  // Diagonal directions - Light Blue
  Zone_NW: '#ADD8E6',
  Zone_SW: '#ADD8E6',
  Zone_SE: '#ADD8E6',
  Zone_NE: '#ADD8E6',
  // Composite directions - Light Green / Purple
  Zone_E_SE: '#98FB98',
  Zone_N_NW: '#98FB98',
  Zone_S_SE: '#DDA0DD',
  Zone_S_SW: '#98FB98',
  Zone_W_NW: '#DDA0DD',
  Zone_W_SW: '#98FB98',
};

// ============================================================================
// Map Data Types
// ============================================================================

export interface MapData {
  /** Map width (default: 51) */
  width: number;
  /** Map height (default: 51) */
  height: number;
  /** Terrain data: "x,y" -> terrainType (Crater/Dirt/Stone) */
  terrain: Map<string, TerrainType>;
  /** Building list */
  buildings: Building[];
  /** Flags: flagType -> positions array */
  flags: Map<string, Array<[number, number]>>;
}

/** Position key format: "x,y" */
export type PositionKey = string;

/** Terrain data with distance information (for export) */
export interface TerrainExportData {
  x: number;
  y: number;
  distToCity: number;
  distToMagic: number;
}

// ============================================================================
// Editor State Types
// ============================================================================

export type FeatureTab = 'mapEditor' | 'gameConfig' | 'weaponSkill';

export type EditorMode = 'terrain' | 'building' | 'flag' | 'eraser';

export interface EditorState {
  /** Current editor mode */
  mode: EditorMode;
  /** Selected terrain type */
  selectedTerrain: TerrainType;
  /** Selected building ID */
  selectedBuilding: string | null;
  /** Selected flag type */
  selectedFlag: string | null;
  /** Brush size (1-10) */
  brushSize: number;
  /** Selected building health (optional) */
  buildingHealth?: number;
}

// ============================================================================
// Viewport State Types
// ============================================================================

export interface ViewportState {
  /** Zoom level in pixels per tile (8-32) */
  zoom: number;
  /** View offset X */
  offsetX: number;
  /** View offset Y */
  offsetY: number;
  /** Whether user is currently panning */
  isPanning: boolean;
  /** Last mouse position for panning */
  lastMouseX?: number;
  lastMouseY?: number;
}

// ============================================================================
// Layer Visibility Types
// ============================================================================

export interface LayerVisibility {
  /** Show zone flags (directional zones) */
  zones: boolean;
  /** Show grid lines */
  grid: boolean;
  /** Show special flags (markers) */
  flags: boolean;
  /** Show building occupied tiles */
  occupied: boolean;
  /** Show building category markers */
  categoryMarkers: boolean;
}

// ============================================================================
// UI State Types
// ============================================================================

export type SidebarTab = 'map' | 'terrain' | 'building' | 'flag' | 'config';

export interface UIState {
  /** Active sidebar tab */
  activeTab: SidebarTab;
  /** Layer visibility settings */
  layerVisibility: LayerVisibility;
  /** Show preview for building placement */
  showBuildingPreview: boolean;
  /** Currently hovered tile position */
  hoveredTile: { x: number; y: number } | null;
  /** Application errors */
  errors: string[];
}

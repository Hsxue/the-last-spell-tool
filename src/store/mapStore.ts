/**
 * Map Store - Zustand store for map state management
 * Handles map data, buildings, flags, and terrain editing state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  MapData,
  Building,
  TileFlag,
  EditorMode,
  TerrainType,
  LayerVisibility,
  ViewportState,
} from '../types/map';

// ============================================================================
// State Interface
// ============================================================================

interface MapState {
  // Map Data
  mapData: MapData | null;
  width: number;
  height: number;

  // Editor State
  editorMode: EditorMode;
  selectedTerrain: TerrainType;
  selectedBuilding: string | null;
  selectedFlag: string | null;
  brushSize: number;
  buildingHealth: number | undefined;

  // Viewport State
  viewport: ViewportState;

  // Layer Visibility
  layerVisibility: LayerVisibility;

  // UI State
  showBuildingPreview: boolean;
  hoveredTile: { x: number; y: number } | null;
  errors: string[];

  // Actions
  setMapData: (mapData: MapData) => void;
  setMapSize: (width: number, height: number) => void;
  setEditorMode: (mode: EditorMode) => void;
  setSelectedTerrain: (terrain: TerrainType) => void;
  setSelectedBuilding: (buildingId: string | null) => void;
  setSelectedFlag: (flagType: string | null) => void;
  setBrushSize: (size: number) => void;
  setBuildingHealth: (health: number | undefined) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  setLayerVisibility: (layer: keyof LayerVisibility, visible: boolean) => void;
  setShowBuildingPreview: (show: boolean) => void;
  setHoveredTile: (tile: { x: number; y: number } | null) => void;
  addError: (error: string) => void;
  clearErrors: () => void;

  // Map Data Mutations
  setTerrain: (x: number, y: number, terrain: TerrainType) => void;
  addBuilding: (building: Building) => void;
  removeBuilding: (x: number, y: number) => void;
  addFlag: (flag: TileFlag) => void;
  removeFlag: (x: number, y: number, flagType: string) => void;
  clearMap: () => void;
}

// ============================================================================
// Default State
// ============================================================================

const DEFAULT_WIDTH = 51;
const DEFAULT_HEIGHT = 51;

const defaultMapData: MapData = {
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  terrain: new Map(),
  buildings: [],
  flags: new Map(),
};

const defaultViewport: ViewportState = {
  zoom: 16,
  offsetX: 0,
  offsetY: 0,
  isPanning: false,
};

const defaultLayerVisibility: LayerVisibility = {
  zones: true,
  grid: true,
  flags: true,
  occupied: true,
  categoryMarkers: true,
};

// ============================================================================
// Store Creation
// ============================================================================

export const useMapStore = create<MapState>()(
  immer((set) => ({
    // Initial State
    mapData: null,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    editorMode: 'terrain',
    selectedTerrain: 'Dirt',
    selectedBuilding: null,
    selectedFlag: null,
    brushSize: 1,
    buildingHealth: undefined,
    viewport: defaultViewport,
    layerVisibility: defaultLayerVisibility,
    showBuildingPreview: true,
    hoveredTile: null,
    errors: [],

    // Actions
    setMapData: (mapData) => {
      set((state) => {
        state.mapData = mapData;
        state.width = mapData.width;
        state.height = mapData.height;
      });
    },

    setMapSize: (width, height) => {
      set((state) => {
        state.width = width;
        state.height = height;
        if (state.mapData) {
          state.mapData.width = width;
          state.mapData.height = height;
        }
      });
    },

    setEditorMode: (mode) => {
      set((state) => {
        state.editorMode = mode;
      });
    },

    setSelectedTerrain: (terrain) => {
      set((state) => {
        state.selectedTerrain = terrain;
      });
    },

    setSelectedBuilding: (buildingId) => {
      set((state) => {
        state.selectedBuilding = buildingId;
      });
    },

    setSelectedFlag: (flagType) => {
      set((state) => {
        state.selectedFlag = flagType;
      });
    },

    setBrushSize: (size) => {
      set((state) => {
        state.brushSize = Math.max(1, Math.min(10, size));
      });
    },

    setBuildingHealth: (health) => {
      set((state) => {
        state.buildingHealth = health && health < 0 ? undefined : health;
      });
    },

    setViewport: (viewport) => {
      set((state) => {
        state.viewport = { ...state.viewport, ...viewport };
      });
    },

    setLayerVisibility: (layer, visible) => {
      set((state) => {
        state.layerVisibility[layer] = visible;
      });
    },

    setShowBuildingPreview: (show) => {
      set((state) => {
        state.showBuildingPreview = show;
      });
    },

    setHoveredTile: (tile) => {
      set((state) => {
        state.hoveredTile = tile;
      });
    },

    addError: (error) => {
      set((state) => {
        state.errors.push(error);
      });
    },

    clearErrors: () => {
      set((state) => {
        state.errors = [];
      });
    },

    // Map Data Mutations
    setTerrain: (x, y, terrain) => {
      set((state) => {
        if (!state.mapData) {
          state.mapData = { ...defaultMapData };
        }
        const key = `${x},${y}`;
        // Create new Map to force React re-render
        const newTerrain = new Map(state.mapData.terrain);
        if (terrain === 'Empty') {
          newTerrain.delete(key);
        } else {
          newTerrain.set(key, terrain);
        }
        state.mapData.terrain = newTerrain;
      });
    },

    addBuilding: (building) => {
      set((state) => {
        if (!state.mapData) {
          state.mapData = { ...defaultMapData };
        }
        // Remove any existing building at this position
        state.mapData.buildings = state.mapData.buildings.filter(
          (b) => b.x !== building.x || b.y !== building.y
        );
        state.mapData.buildings.push(building);
      });
    },

    removeBuilding: (x, y) => {
      set((state) => {
        if (state.mapData) {
          state.mapData.buildings = state.mapData.buildings.filter(
            (b) => b.x !== x || b.y !== y
          );
        }
      });
    },

    addFlag: (flag) => {
      set((state) => {
        if (!state.mapData) {
          state.mapData = { ...defaultMapData };
        }
        const positions = state.mapData.flags.get(flag.flagType) || [];
        // Check if position already exists
        const exists = positions.some((p) => p[0] === flag.x && p[1] === flag.y);
        if (!exists) {
          positions.push([flag.x, flag.y]);
          state.mapData.flags.set(flag.flagType, positions);
        }
      });
    },

    removeFlag: (x, y, flagType) => {
      set((state) => {
        if (state.mapData) {
          const positions = state.mapData.flags.get(flagType);
          if (positions) {
            const filtered = positions.filter((p) => p[0] !== x || p[1] !== y);
            if (filtered.length === 0) {
              state.mapData.flags.delete(flagType);
            } else {
              state.mapData.flags.set(flagType, filtered);
            }
          }
        }
      });
    },

    clearMap: () => {
      set((state) => {
        state.mapData = {
          width: state.width,
          height: state.height,
          terrain: new Map(),
          buildings: [],
          flags: new Map(),
        };
      });
    },
  }))
);

// ============================================================================
// Selectors
// ============================================================================

export const selectTerrainAt = (x: number, y: number) => {
  return (state: MapState) => {
    if (!state.mapData) return 'Empty' as TerrainType;
    return state.mapData.terrain.get(`${x},${y}`) || 'Empty';
  };
};

export const selectBuildingAt = (x: number, y: number) => {
  return (state: MapState) => {
    if (!state.mapData) return null;
    return state.mapData.buildings.find((b) => b.x === x && b.y === y);
  };
};

export const selectFlagsAt = (x: number, y: number) => {
  return (state: MapState) => {
    if (!state.mapData) return [] as string[];
    const flags: string[] = [];
    state.mapData.flags.forEach((positions, flagType) => {
      if (positions.some((p) => p[0] === x && p[1] === y)) {
        flags.push(flagType);
      }
    });
    return flags;
  };
};

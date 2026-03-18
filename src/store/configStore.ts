/**
 * Config Store - Zustand store for game configuration management
 * Manages GameConfig, spawn settings, and configuration editing
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  GameConfig,
  SpawnConfig,
  CorruptionConfig,
  FogConfig,
  ResourceConfig,
  SpawnWaveDefinition,
  ConfigTab,
  ConfigUIState,
  FogDensityName,
} from '../types';
import { CITY_TEMPLATES } from '../types';

// ============================================================================
// Initial State Helpers
// ============================================================================

function createInitialSpawnConfig(): SpawnConfig {
  return {
    spawnMultipliers: new Map(),
    spawnsPerWaveFormula: '60 + Night * Multiplier',
    spawnWavesPerDay: new Map(),
    spawnDirections: new Map(),
    elitesPerDay: new Map(),
    maxDistancePerDay: new Map(),
    disallowedEnemies: [],
    spawnPointsPerGroup: 3,
    spawnPointRectWidth: 6,
    spawnPointRectHeight: 2,
    waveDefinitions: [],
  };
}

function createInitialCorruptionConfig(): CorruptionConfig {
  return {
    corruptionByNight: new Map(),
  };
}

function createInitialFogConfig(): FogConfig {
  return {
    fogDensities: [
      ['VeryThin', 22],
      ['Thin', 20],
      ['Average', 18],
      ['Dense', 16],
      ['VeryDense', 14],
    ],
    increaseEveryXDays: 2,
    initialDensityIndex: 2,
    dayExceptions: new Map(),
  };
}

function createInitialResourceConfig(): ResourceConfig {
  return {
    gold: 300,
    materials: 50,
    damnedSouls: 0,
  };
}

function createInitialGameConfig(): GameConfig {
  return {
    mapId: 'NewMap',
    victoryDays: 12,
    difficulty: '2',
    enemiesOffset: 0,
    maxGlyphPoints: 5,
    fogId: 'NewMap',
    spawnConfig: createInitialSpawnConfig(),
    corruptionConfig: createInitialCorruptionConfig(),
    fogConfig: createInitialFogConfig(),
    resourceConfig: createInitialResourceConfig(),
  };
}

function createInitialConfigUIState(): ConfigUIState {
  return {
    activeTab: 'basic',
    hasUnsavedChanges: false,
    selectedWaveId: null,
    selectedNight: 1,
  };
}

// ============================================================================
// Store State Interface
// ============================================================================

interface ConfigStoreState {
  // Game Configuration
  gameConfig: GameConfig;
  
  // UI State
  ui: ConfigUIState;
}

// ============================================================================
// Store Actions Interface
// ============================================================================

interface ConfigStoreActions {
  // Game Config Actions
  setGameConfig: (config: GameConfig) => void;
  resetConfig: () => void;
  
  // Basic Config Actions
  setMapId: (id: string) => void;
  setVictoryDays: (days: number) => void;
  setDifficulty: (difficulty: string) => void;
  setEnemiesOffset: (offset: number) => void;
  setMaxGlyphPoints: (points: number) => void;
  setFogId: (id: string) => void;
  
  // Spawn Config Actions
  setSpawnMultiplier: (night: number, multiplier: number) => void;
  removeSpawnMultiplier: (night: number) => void;
  setSpawnsPerWaveFormula: (formula: string) => void;
  setMaxDistancePerDay: (night: number, distance: number) => void;
  removeMaxDistancePerDay: (night: number) => void;
  addDisallowedEnemy: (enemyId: string) => void;
  removeDisallowedEnemy: (enemyId: string) => void;
  setSpawnPointsPerGroup: (points: number) => void;
  setSpawnPointRectWidth: (width: number) => void;
  setSpawnPointRectHeight: (height: number) => void;
  
  // Spawn Waves Actions
  addSpawnWave: (night: number, waveId: string, weight: number) => void;
  removeSpawnWave: (night: number, waveId: string) => void;
  
  // Spawn Directions Actions
  addSpawnDirection: (night: number, directionId: string, weight: number) => void;
  removeSpawnDirection: (night: number, directionId: string) => void;
  
  // Elites Actions
  setElitesPerDay: (night: number, tier: number, count: number) => void;
  removeElitesPerDay: (night: number, tier: number) => void;
  
  // Wave Definitions Actions
  addWaveDefinition: (wave: SpawnWaveDefinition) => void;
  updateWaveDefinition: (id: string, updates: Partial<SpawnWaveDefinition>) => void;
  removeWaveDefinition: (id: string) => void;
  moveWaveDefinition: (id: string, direction: 'up' | 'down') => void;
  
  // Corruption Config Actions
  setCorruption: (night: number, value: number) => void;
  removeCorruption: (night: number) => void;
  
  // Fog Config Actions
  setFogDensity: (index: number, name: FogDensityName, value: number) => void;
  setIncreaseEveryXDays: (days: number) => void;
  setInitialDensityIndex: (index: number) => void;
  setDayException: (day: number, densityName: FogDensityName) => void;
  removeDayException: (day: number) => void;
  
  // Resource Config Actions
  setGold: (gold: number) => void;
  setMaterials: (materials: number) => void;
  setDamnedSouls: (souls: number) => void;
  
  // Template Actions
  applyTemplate: (templateName: string) => void;
  
  // UI Actions
  setActiveTab: (tab: ConfigTab) => void;
  setSelectedWaveId: (id: string | null) => void;
  setSelectedNight: (night: number) => void;
  markAsSaved: () => void;
  markAsUnsaved: () => void;
}

// ============================================================================
// Store Creation
// ============================================================================

export const useConfigStore = create<ConfigStoreState & ConfigStoreActions>()(
  immer((set) => ({
    // Initial State
    gameConfig: createInitialGameConfig(),
    ui: createInitialConfigUIState(),

    // Game Config Actions
    setGameConfig: (config) => {
      set((state) => {
        state.gameConfig = config;
        state.ui.hasUnsavedChanges = true;
      });
    },

    resetConfig: () => {
      set((state) => {
        state.gameConfig = createInitialGameConfig();
        state.ui = createInitialConfigUIState();
      });
    },

    // Basic Config Actions
    setMapId: (id) => {
      set((state) => {
        state.gameConfig.mapId = id;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setVictoryDays: (days) => {
      set((state) => {
        state.gameConfig.victoryDays = days;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setDifficulty: (difficulty) => {
      set((state) => {
        state.gameConfig.difficulty = difficulty;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setEnemiesOffset: (offset) => {
      set((state) => {
        state.gameConfig.enemiesOffset = offset;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setMaxGlyphPoints: (points) => {
      set((state) => {
        state.gameConfig.maxGlyphPoints = points;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setFogId: (id) => {
      set((state) => {
        state.gameConfig.fogId = id;
        state.ui.hasUnsavedChanges = true;
      });
    },

    // Spawn Config Actions
    setSpawnMultiplier: (night, multiplier) => {
      set((state) => {
        state.gameConfig.spawnConfig.spawnMultipliers.set(night, multiplier);
        state.ui.hasUnsavedChanges = true;
      });
    },

    removeSpawnMultiplier: (night) => {
      set((state) => {
        state.gameConfig.spawnConfig.spawnMultipliers.delete(night);
        state.ui.hasUnsavedChanges = true;
      });
    },

    setSpawnsPerWaveFormula: (formula) => {
      set((state) => {
        state.gameConfig.spawnConfig.spawnsPerWaveFormula = formula;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setMaxDistancePerDay: (night, distance) => {
      set((state) => {
        state.gameConfig.spawnConfig.maxDistancePerDay.set(night, distance);
        state.ui.hasUnsavedChanges = true;
      });
    },

    removeMaxDistancePerDay: (night) => {
      set((state) => {
        state.gameConfig.spawnConfig.maxDistancePerDay.delete(night);
        state.ui.hasUnsavedChanges = true;
      });
    },

    addDisallowedEnemy: (enemyId) => {
      set((state) => {
        if (!state.gameConfig.spawnConfig.disallowedEnemies.includes(enemyId)) {
          state.gameConfig.spawnConfig.disallowedEnemies.push(enemyId);
          state.ui.hasUnsavedChanges = true;
        }
      });
    },

    removeDisallowedEnemy: (enemyId) => {
      set((state) => {
        const index = state.gameConfig.spawnConfig.disallowedEnemies.indexOf(enemyId);
        if (index > -1) {
          state.gameConfig.spawnConfig.disallowedEnemies.splice(index, 1);
          state.ui.hasUnsavedChanges = true;
        }
      });
    },

    setSpawnPointsPerGroup: (points) => {
      set((state) => {
        state.gameConfig.spawnConfig.spawnPointsPerGroup = points;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setSpawnPointRectWidth: (width) => {
      set((state) => {
        state.gameConfig.spawnConfig.spawnPointRectWidth = width;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setSpawnPointRectHeight: (height) => {
      set((state) => {
        state.gameConfig.spawnConfig.spawnPointRectHeight = height;
        state.ui.hasUnsavedChanges = true;
      });
    },

    // Spawn Waves Actions
    addSpawnWave: (night, waveId, weight) => {
      set((state) => {
        if (!state.gameConfig.spawnConfig.spawnWavesPerDay.has(night)) {
          state.gameConfig.spawnConfig.spawnWavesPerDay.set(night, []);
        }
        const waves = state.gameConfig.spawnConfig.spawnWavesPerDay.get(night)!;
        waves.push([waveId, weight]);
        state.ui.hasUnsavedChanges = true;
      });
    },

    removeSpawnWave: (night, waveId) => {
      set((state) => {
        const waves = state.gameConfig.spawnConfig.spawnWavesPerDay.get(night);
        if (waves) {
          const newWaves = waves.filter((w) => w[0] !== waveId);
          if (newWaves.length === 0) {
            state.gameConfig.spawnConfig.spawnWavesPerDay.delete(night);
          } else {
            state.gameConfig.spawnConfig.spawnWavesPerDay.set(night, newWaves);
          }
          state.ui.hasUnsavedChanges = true;
        }
      });
    },

    // Spawn Directions Actions
    addSpawnDirection: (night, directionId, weight) => {
      set((state) => {
        if (!state.gameConfig.spawnConfig.spawnDirections.has(night)) {
          state.gameConfig.spawnConfig.spawnDirections.set(night, []);
        }
        const directions = state.gameConfig.spawnConfig.spawnDirections.get(night)!;
        directions.push([directionId, weight]);
        state.ui.hasUnsavedChanges = true;
      });
    },

    removeSpawnDirection: (night, directionId) => {
      set((state) => {
        const directions = state.gameConfig.spawnConfig.spawnDirections.get(night);
        if (directions) {
          const newDirections = directions.filter((d) => d[0] !== directionId);
          if (newDirections.length === 0) {
            state.gameConfig.spawnConfig.spawnDirections.delete(night);
          } else {
            state.gameConfig.spawnConfig.spawnDirections.set(night, newDirections);
          }
          state.ui.hasUnsavedChanges = true;
        }
      });
    },

    // Elites Actions
    setElitesPerDay: (night, tier, count) => {
      set((state) => {
        if (!state.gameConfig.spawnConfig.elitesPerDay.has(night)) {
          state.gameConfig.spawnConfig.elitesPerDay.set(night, []);
        }
        const elites = state.gameConfig.spawnConfig.elitesPerDay.get(night)!;
        const existingIndex = elites.findIndex((e) => e[0] === tier);
        if (existingIndex > -1) {
          elites[existingIndex] = [tier, count];
        } else {
          elites.push([tier, count]);
        }
        state.ui.hasUnsavedChanges = true;
      });
    },

    removeElitesPerDay: (night, tier) => {
      set((state) => {
        const elites = state.gameConfig.spawnConfig.elitesPerDay.get(night);
        if (elites) {
          const newElites = elites.filter((e) => e[0] !== tier);
          if (newElites.length === 0) {
            state.gameConfig.spawnConfig.elitesPerDay.delete(night);
          } else {
            state.gameConfig.spawnConfig.elitesPerDay.set(night, newElites);
          }
          state.ui.hasUnsavedChanges = true;
        }
      });
    },

    // Wave Definitions Actions
    addWaveDefinition: (wave) => {
      set((state) => {
        state.gameConfig.spawnConfig.waveDefinitions.push(wave);
        state.ui.hasUnsavedChanges = true;
      });
    },

    updateWaveDefinition: (id, updates) => {
      set((state) => {
        const wave = state.gameConfig.spawnConfig.waveDefinitions.find((w) => w.id === id);
        if (wave) {
          Object.assign(wave, updates);
          state.ui.hasUnsavedChanges = true;
        }
      });
    },

    removeWaveDefinition: (id) => {
      set((state) => {
        const index = state.gameConfig.spawnConfig.waveDefinitions.findIndex((w) => w.id === id);
        if (index > -1) {
          state.gameConfig.spawnConfig.waveDefinitions.splice(index, 1);
          state.ui.hasUnsavedChanges = true;
        }
      });
    },

    moveWaveDefinition: (id, direction) => {
      set((state) => {
        const waves = state.gameConfig.spawnConfig.waveDefinitions;
        const index = waves.findIndex((w) => w.id === id);
        if (index > -1) {
          if (direction === 'up' && index > 0) {
            const temp = waves[index];
            waves[index] = waves[index - 1];
            waves[index - 1] = temp;
            state.ui.hasUnsavedChanges = true;
          } else if (direction === 'down' && index < waves.length - 1) {
            const temp = waves[index];
            waves[index] = waves[index + 1];
            waves[index + 1] = temp;
            state.ui.hasUnsavedChanges = true;
          }
        }
      });
    },

    // Corruption Config Actions
    setCorruption: (night, value) => {
      set((state) => {
        state.gameConfig.corruptionConfig.corruptionByNight.set(night, value);
        state.ui.hasUnsavedChanges = true;
      });
    },

    removeCorruption: (night) => {
      set((state) => {
        state.gameConfig.corruptionConfig.corruptionByNight.delete(night);
        state.ui.hasUnsavedChanges = true;
      });
    },

    // Fog Config Actions
    setFogDensity: (index, name, value) => {
      set((state) => {
        if (index >= 0 && index < state.gameConfig.fogConfig.fogDensities.length) {
          state.gameConfig.fogConfig.fogDensities[index] = [name, value];
          state.ui.hasUnsavedChanges = true;
        }
      });
    },

    setIncreaseEveryXDays: (days) => {
      set((state) => {
        state.gameConfig.fogConfig.increaseEveryXDays = days;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setInitialDensityIndex: (index) => {
      set((state) => {
        state.gameConfig.fogConfig.initialDensityIndex = index;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setDayException: (day, densityName) => {
      set((state) => {
        state.gameConfig.fogConfig.dayExceptions.set(day, densityName);
        state.ui.hasUnsavedChanges = true;
      });
    },

    removeDayException: (day) => {
      set((state) => {
        state.gameConfig.fogConfig.dayExceptions.delete(day);
        state.ui.hasUnsavedChanges = true;
      });
    },

    // Resource Config Actions
    setGold: (gold) => {
      set((state) => {
        state.gameConfig.resourceConfig.gold = gold;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setMaterials: (materials) => {
      set((state) => {
        state.gameConfig.resourceConfig.materials = materials;
        state.ui.hasUnsavedChanges = true;
      });
    },

    setDamnedSouls: (souls) => {
      set((state) => {
        state.gameConfig.resourceConfig.damnedSouls = souls;
        state.ui.hasUnsavedChanges = true;
      });
    },

    // Template Actions
    applyTemplate: (templateName) => {
      const template = CITY_TEMPLATES[templateName];
      if (!template) return;

      set((state) => {
        state.gameConfig.victoryDays = template.victoryDays;
        state.gameConfig.difficulty = String(template.difficulty);
        state.gameConfig.maxGlyphPoints = template.maxGlyphPoints;
        state.gameConfig.resourceConfig.gold = template.gold;
        state.gameConfig.resourceConfig.materials = template.materials;
        state.ui.hasUnsavedChanges = true;
      });
    },

    // UI Actions
    setActiveTab: (tab) => {
      set((state) => {
        state.ui.activeTab = tab;
      });
    },

    setSelectedWaveId: (id) => {
      set((state) => {
        state.ui.selectedWaveId = id;
      });
    },

    setSelectedNight: (night) => {
      set((state) => {
        state.ui.selectedNight = night;
      });
    },

    markAsSaved: () => {
      set((state) => {
        state.ui.hasUnsavedChanges = false;
      });
    },

    markAsUnsaved: () => {
      set((state) => {
        state.ui.hasUnsavedChanges = true;
      });
    },
  }))
);

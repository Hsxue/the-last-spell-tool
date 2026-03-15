/**
 * Game Configuration Types
 * Based on tilemap-editor-feature-doc.md GameConfig system
 */

// ============================================================================
// Base Game Config
// ============================================================================

export interface GameConfig {
  /** Map unique identifier */
  mapId: string;
  /** Days required for victory */
  victoryDays: number;
  /** Difficulty level ("1"-"5" or "Normal") */
  difficulty: string;
  /** Enemy progression offset */
  enemiesOffset: number;
  /** Maximum glyph points */
  maxGlyphPoints: number;
  /** Fog configuration ID */
  fogId: string;
  /** Spawn configuration */
  spawnConfig: SpawnConfig;
  /** Corruption progression configuration */
  corruptionConfig: CorruptionConfig;
  /** Fog density configuration */
  fogConfig: FogConfig;
  /** Initial resource configuration */
  resourceConfig: ResourceConfig;
}

// ============================================================================
// Spawn Configuration
// ============================================================================

export interface SpawnConfig {
  /** Spawn multipliers per night: night -> multiplier */
  spawnMultipliers: Map<number, number>;
  /** Formula for spawns per wave */
  spawnsPerWaveFormula: string;
  /** Spawn waves per day: night -> [(waveId, weight)] */
  spawnWavesPerDay: Map<number, Array<[string, number]>>;
  /** Spawn directions per day: night -> [(directionId, weight)] */
  spawnDirections: Map<number, Array<[string, number]>>;
  /** Elites per day: night -> [(tier, count)] */
  elitesPerDay: Map<number, Array<[number, number]>>;
  /** Maximum distance from center per day: night -> distance */
  maxDistancePerDay: Map<number, number>;
  /** List of disallowed enemy IDs */
  disallowedEnemies: string[];
  /** Spawn points per group */
  spawnPointsPerGroup: number;
  /** Spawn point rectangle width */
  spawnPointRectWidth: number;
  /** Spawn point rectangle height */
  spawnPointRectHeight: number;
  /** Wave definitions */
  waveDefinitions: SpawnWaveDefinition[];
}

export interface SpawnWaveDefinition {
  /** Wave unique ID */
  id: string;
  /** Spawn multiplier for this wave */
  spawnMultiplier: number;
  /** Is this a boss wave */
  isBossWave: boolean;
  /** Boss ID if boss wave */
  bossId?: string;
  /** Is infinite wave */
  isInfinite: boolean;
  /** Enemy types with weights: [(enemyId, weight)] */
  enemyTypes: Array<[string, number]>;
  /** Tier distribution: [(tier, multiplier)] */
  tierDistribution: Array<[number, number]>;
  /** Time distribution: [(turn, weight)] */
  timeDistribution: Array<[number, number]>;
}

// ============================================================================
// Corruption Configuration
// ============================================================================

export interface CorruptionConfig {
  /** Corruption value per night: night -> value (0 = victory) */
  corruptionByNight: Map<number, number>;
}

// ============================================================================
// Fog Configuration
// ============================================================================

export type FogDensityName =
  | 'VeryThin'
  | 'Thin'
  | 'Average'
  | 'Dense'
  | 'VeryDense';

export interface FogConfig {
  /** Fog densities: [(name, value)] */
  fogDensities: Array<[FogDensityName, number]>;
  /** Increase fog every X days */
  increaseEveryXDays: number;
  /** Initial density index (0=VeryThin, 4=VeryDense) */
  initialDensityIndex: number;
  /** Day exceptions: day -> densityName */
  dayExceptions: Map<number, FogDensityName>;
}

// ============================================================================
// Resource Configuration
// ============================================================================

export interface ResourceConfig {
  /** Initial gold amount */
  gold: number;
  /** Initial materials amount */
  materials: number;
  /** Initial damned souls amount (optional) */
  damnedSouls?: number;
}

// ============================================================================
// Configuration Tabs
// ============================================================================

export type ConfigTab =
  | 'basic'
  | 'spawn'
  | 'waves'
  | 'elites'
  | 'corruption'
  | 'fog'
  | 'resources'
  | 'wave-definitions'
  | 'directions';

export interface ConfigUIState {
  /** Active configuration tab */
  activeTab: ConfigTab;
  /** Whether configuration has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Selected wave definition (for editing) */
  selectedWaveId: string | null;
  /** Selected night (for viewing configs) */
  selectedNight: number;
}

// ============================================================================
// City Templates
// ============================================================================

export interface CityTemplate {
  /** Template name */
  name: string;
  /** Victory days */
  victoryDays: number;
  /** Difficulty (1-5) */
  difficulty: number;
  /** Max glyph points */
  maxGlyphPoints: number;
  /** Initial gold */
  gold: number;
  /** Initial materials */
  materials: number;
  /** Is story map */
  isStoryMap: boolean;
  /** Starting setup type */
  startingSetup: string;
}

export const CITY_TEMPLATES: Record<string, CityTemplate> = {
  TutorialMap: {
    name: 'TutorialMap',
    victoryDays: 12,
    difficulty: 1,
    maxGlyphPoints: 3,
    gold: 200,
    materials: 30,
    isStoryMap: true,
    startingSetup: 'Tutorial',
  },
  Lakeburg: {
    name: 'Lakeburg',
    victoryDays: 12,
    difficulty: 2,
    maxGlyphPoints: 5,
    gold: 300,
    materials: 50,
    isStoryMap: true,
    startingSetup: 'Normal',
  },
  Glenwald: {
    name: 'Glenwald',
    victoryDays: 10,
    difficulty: 3,
    maxGlyphPoints: 7,
    gold: 400,
    materials: 60,
    isStoryMap: true,
    startingSetup: 'Normal',
  },
  Elderlicht: {
    name: 'Elderlicht',
    victoryDays: 14,
    difficulty: 4,
    maxGlyphPoints: 10,
    gold: 500,
    materials: 75,
    isStoryMap: true,
    startingSetup: 'Hard',
  },
  Glintfein: {
    name: 'Glintfein',
    victoryDays: 7,
    difficulty: 5,
    maxGlyphPoints: 3,
    gold: 200,
    materials: 450,
    isStoryMap: false,
    startingSetup: 'Extreme',
  },
};

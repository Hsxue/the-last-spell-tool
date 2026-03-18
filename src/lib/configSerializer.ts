/**
 * Config Serializer - XML serialization/deserialization for GameConfig
 * Uses fast-xml-parser for XML parsing and building
 */

import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import type {
  GameConfig,
  SpawnConfig,
  CorruptionConfig,
  FogConfig,
  ResourceConfig,
  SpawnWaveDefinition,
  FogDensityName,
} from '../types';

// ============================================================================
// Custom XML Parser/Builder Configuration
// ============================================================================

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  parseTagName: true,
  unescapeCDATA: false,
  removeNSPrefix: true,
};

const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false,
  suppressBooleanAttributes: false,
};

// ============================================================================
// Helper Functions for Map and Array Conversion
// ============================================================================

/**
 * Ensure a value is an array (fast-xml-parser returns single items as objects)
 */
function ensureArray<T>(value: unknown): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value as T];
}

/**
 * Convert Map<number, number> to array of entry objects
 */
function mapToXmlEntries(map: Map<number, number>): Array<{ '@_key': number; '@_value': number }> {
  return Array.from(map.entries()).map(([key, value]) => ({
    '@_key': key,
    '@_value': value,
  }));
}

/**
 * Convert Map<number, Array<[string, number]>> to XML structure
 */
function mapStringTupleArrayToXml(
  map: Map<number, Array<[string, number]>>
): Array<{ '@_key': number; item: Array<{ '@_id': string; '@_weight': number }> }> {
  return Array.from(map.entries()).map(([key, tuples]) => ({
    '@_key': key,
    item: tuples.map(([id, weight]) => ({
      '@_id': id,
      '@_weight': weight,
    })),
  }));
}

/**
 * Convert Map<number, Array<[number, number]>> to XML structure
 */
function mapNumberTupleArrayToXml(
  map: Map<number, Array<[number, number]>>
): Array<{ '@_key': number; item: Array<{ '@_tier': number; '@_count': number }> }> {
  return Array.from(map.entries()).map(([key, tuples]) => ({
    '@_key': key,
    item: tuples.map(([tier, count]) => ({
      '@_tier': tier,
      '@_count': count,
    })),
  }));
}

/**
 * Convert Array<[string, number]> to XML structure
 */
function stringTupleArrayToXml(
  tuples: Array<[string, number]>
): Array<{ '@_id': string; '@_weight': number }> {
  return tuples.map(([id, weight]) => ({
    '@_id': id,
    '@_weight': weight,
  }));
}

/**
 * Convert Array<[number, number]> to XML structure
 */
function numberTupleArrayToXml(
  tuples: Array<[number, number]>
): Array<{ '@_val': number; '@_weight': number }> {
  return tuples.map(([value, weight]) => ({
    '@_val': value,
    '@_weight': weight,
  }));
}

/**
 * Convert Array<[FogDensityName, number]> to XML structure
 */
function fogDensityArrayToXml(
  densities: Array<[FogDensityName, number]>
): Array<{ '@_name': FogDensityName; '@_value': number }> {
  return densities.map(([name, value]) => ({
    '@_name': name,
    '@_value': value,
  }));
}

/**
 * Convert Map<number, FogDensityName> to XML structure
 */
function mapFogDensityToXml(
  map: Map<number, FogDensityName>
): Array<{ '@_day': number; '@_density': FogDensityName }> {
  return Array.from(map.entries()).map(([day, density]) => ({
    '@_day': day,
    '@_density': density,
  }));
}

// ============================================================================
// XML Structure Builders
// ============================================================================

interface XmlSpawnConfig {
  spawnMultipliers?: { entry: Array<{ '@_key': number; '@_value': number }> };
  spawnsPerWaveFormula: string;
  spawnWavesPerDay?: { entry: Array<{ '@_key': number; item: Array<{ '@_id': string; '@_weight': number }> }> };
  spawnDirections?: { entry: Array<{ '@_key': number; item: Array<{ '@_id': string; '@_weight': number }> }> };
  elitesPerDay?: { entry: Array<{ '@_key': number; item: Array<{ '@_tier': number; '@_count': number }> }> };
  maxDistancePerDay?: { entry: Array<{ '@_key': number; '@_value': number }> };
  disallowedEnemies?: { item: string[] };
  spawnPointsPerGroup: number;
  spawnPointRectWidth: number;
  spawnPointRectHeight: number;
  waveDefinitions?: { wave: Array<XmlSpawnWaveDefinition> };
}

interface XmlSpawnWaveDefinition {
  '@_id': string;
  '@_spawnMultiplier': number;
  '@_isBossWave': boolean;
  '@_bossId'?: string;
  '@_isInfinite': boolean;
  enemyTypes?: { entry: Array<{ '@_id': string; '@_weight': number }> };
  tierDistribution?: { entry: Array<{ '@_val': number; '@_weight': number }> };
  timeDistribution?: { entry: Array<{ '@_val': number; '@_weight': number }> };
}

interface XmlCorruptionConfig {
  corruptionByNight?: { entry: Array<{ '@_key': number; '@_value': number }> };
}

interface XmlFogConfig {
  fogDensities: { entry: Array<{ '@_name': FogDensityName; '@_value': number }> };
  increaseEveryXDays: number;
  initialDensityIndex: number;
  dayExceptions?: { entry: Array<{ '@_day': number; '@_density': FogDensityName }> };
}

interface XmlResourceConfig {
  gold: number;
  materials: number;
  damnedSouls?: number;
}

interface XmlGameConfig {
  mapId: string;
  victoryDays: number;
  difficulty: string;
  enemiesOffset: number;
  maxGlyphPoints: number;
  fogId: string;
  spawnConfig: XmlSpawnConfig;
  corruptionConfig: XmlCorruptionConfig;
  fogConfig: XmlFogConfig;
  resourceConfig: XmlResourceConfig;
}

// ============================================================================
// Serialization Functions
// ============================================================================

function buildXmlSpawnConfig(config: SpawnConfig): XmlSpawnConfig {
  const xmlConfig: XmlSpawnConfig = {
    spawnMultipliers: { entry: mapToXmlEntries(config.spawnMultipliers) },
    spawnsPerWaveFormula: config.spawnsPerWaveFormula,
    spawnPointsPerGroup: config.spawnPointsPerGroup,
    spawnPointRectWidth: config.spawnPointRectWidth,
    spawnPointRectHeight: config.spawnPointRectHeight,
  };

  if (config.spawnWavesPerDay.size > 0) {
    xmlConfig.spawnWavesPerDay = { entry: mapStringTupleArrayToXml(config.spawnWavesPerDay) };
  }

  if (config.spawnDirections.size > 0) {
    xmlConfig.spawnDirections = { entry: mapStringTupleArrayToXml(config.spawnDirections) };
  }

  if (config.elitesPerDay.size > 0) {
    xmlConfig.elitesPerDay = { entry: mapNumberTupleArrayToXml(config.elitesPerDay) };
  }

  if (config.maxDistancePerDay.size > 0) {
    xmlConfig.maxDistancePerDay = { entry: mapToXmlEntries(config.maxDistancePerDay) };
  }

  if (config.disallowedEnemies.length > 0) {
    xmlConfig.disallowedEnemies = { item: config.disallowedEnemies };
  }

  if (config.waveDefinitions.length > 0) {
    xmlConfig.waveDefinitions = {
      wave: config.waveDefinitions.map(buildXmlSpawnWaveDefinition),
    };
  }

  return xmlConfig;
}

function buildXmlSpawnWaveDefinition(wave: SpawnWaveDefinition): XmlSpawnWaveDefinition {
  const xmlWave: XmlSpawnWaveDefinition = {
    '@_id': wave.id,
    '@_spawnMultiplier': wave.spawnMultiplier,
    '@_isBossWave': wave.isBossWave,
    '@_isInfinite': wave.isInfinite,
  };

  if (wave.bossId !== undefined) {
    xmlWave['@_bossId'] = wave.bossId;
  }

  if (wave.enemyTypes.length > 0) {
    xmlWave.enemyTypes = { entry: stringTupleArrayToXml(wave.enemyTypes) };
  }

  if (wave.tierDistribution.length > 0) {
    xmlWave.tierDistribution = { entry: numberTupleArrayToXml(wave.tierDistribution) };
  }

  if (wave.timeDistribution.length > 0) {
    xmlWave.timeDistribution = { entry: numberTupleArrayToXml(wave.timeDistribution) };
  }

  return xmlWave;
}

function buildXmlCorruptionConfig(config: CorruptionConfig): XmlCorruptionConfig {
  const xmlConfig: XmlCorruptionConfig = {};

  if (config.corruptionByNight.size > 0) {
    xmlConfig.corruptionByNight = { entry: mapToXmlEntries(config.corruptionByNight) };
  }

  return xmlConfig;
}

function buildXmlFogConfig(config: FogConfig): XmlFogConfig {
  const xmlConfig: XmlFogConfig = {
    fogDensities: { entry: fogDensityArrayToXml(config.fogDensities) },
    increaseEveryXDays: config.increaseEveryXDays,
    initialDensityIndex: config.initialDensityIndex,
  };

  if (config.dayExceptions.size > 0) {
    xmlConfig.dayExceptions = { entry: mapFogDensityToXml(config.dayExceptions) };
  }

  return xmlConfig;
}

function buildXmlResourceConfig(config: ResourceConfig): XmlResourceConfig {
  const xmlConfig: XmlResourceConfig = {
    gold: config.gold,
    materials: config.materials,
  };

  if (config.damnedSouls !== undefined) {
    xmlConfig.damnedSouls = config.damnedSouls;
  }

  return xmlConfig;
}

/**
 * Serialize GameConfig to XML string
 */
export function serializeConfigToXml(config: GameConfig): string {
  const xmlConfig: XmlGameConfig = {
    mapId: config.mapId,
    victoryDays: config.victoryDays,
    difficulty: config.difficulty,
    enemiesOffset: config.enemiesOffset,
    maxGlyphPoints: config.maxGlyphPoints,
    fogId: config.fogId,
    spawnConfig: buildXmlSpawnConfig(config.spawnConfig),
    corruptionConfig: buildXmlCorruptionConfig(config.corruptionConfig),
    fogConfig: buildXmlFogConfig(config.fogConfig),
    resourceConfig: buildXmlResourceConfig(config.resourceConfig),
  };

  const builder = new XMLBuilder(builderOptions);
  const xml = builder.build({ GameConfig: xmlConfig });
  return xml;
}

// ============================================================================
// Deserialization Functions
// ============================================================================

function parseXmlSpawnConfig(xml: unknown): SpawnConfig {
  const obj = xml as Record<string, unknown>;
  const config: SpawnConfig = {
    spawnMultipliers: new Map(),
    spawnsPerWaveFormula: '',
    spawnWavesPerDay: new Map(),
    spawnDirections: new Map(),
    elitesPerDay: new Map(),
    maxDistancePerDay: new Map(),
    disallowedEnemies: [],
    spawnPointsPerGroup: 0,
    spawnPointRectWidth: 0,
    spawnPointRectHeight: 0,
    waveDefinitions: [],
  };

  // Parse spawnMultipliers
  if (obj.spawnMultipliers && typeof obj.spawnMultipliers === 'object') {
    const sm = obj.spawnMultipliers as { entry?: unknown };
    if (sm.entry) {
      const entries = ensureArray<Record<string, unknown>>(sm.entry as Record<string, unknown> | Array<Record<string, unknown>>);
      entries.forEach((e: Record<string, unknown>) => {
        const key = Number(e['@_key']);
        const value = Number(e['@_value']);
        config.spawnMultipliers.set(key, value);
      });
    }
  }

  // Parse spawnsPerWaveFormula
  if (obj.spawnsPerWaveFormula !== undefined) {
    config.spawnsPerWaveFormula = String(obj.spawnsPerWaveFormula);
  }

  // Parse spawnWavesPerDay
  if (obj.spawnWavesPerDay && typeof obj.spawnWavesPerDay === 'object') {
    const swpd = obj.spawnWavesPerDay as { entry?: unknown };
    if (swpd.entry && Array.isArray(swpd.entry)) {
      swpd.entry.forEach((e: Record<string, unknown>) => {
        const key = Number(e['@_key']);
        const value = ensureArray<Record<string, unknown>>(e['item'] as Record<string, unknown> | Array<Record<string, unknown>>);
        const tuples: Array<[string, number]> = value.map((v: Record<string, unknown>) => [
          String(v['@_id']),
          Number(v['@_weight']),
        ]);
        config.spawnWavesPerDay.set(key, tuples);
      });
    }
  }

  // Parse spawnDirections
  if (obj.spawnDirections && typeof obj.spawnDirections === 'object') {
    const sd = obj.spawnDirections as { entry?: unknown };
    if (sd.entry && Array.isArray(sd.entry)) {
      sd.entry.forEach((e: Record<string, unknown>) => {
        const key = Number(e['@_key']);
        const value = ensureArray<Record<string, unknown>>(e['item'] as Record<string, unknown> | Array<Record<string, unknown>>);
        const tuples: Array<[string, number]> = value.map((v: Record<string, unknown>) => [
          String(v['@_id']),
          Number(v['@_weight']),
        ]);
        config.spawnDirections.set(key, tuples);
      });
    }
  }

  // Parse elitesPerDay
  if (obj.elitesPerDay && typeof obj.elitesPerDay === 'object') {
    const epd = obj.elitesPerDay as { entry?: unknown };
    if (epd.entry && Array.isArray(epd.entry)) {
      epd.entry.forEach((e: Record<string, unknown>) => {
        const key = Number(e['@_key']);
        const value = ensureArray<Record<string, unknown>>(e['item'] as Record<string, unknown> | Array<Record<string, unknown>>);
        const tuples: Array<[number, number]> = value.map((v: Record<string, unknown>) => [
          Number(v['@_tier']),
          Number(v['@_count']),
        ]);
        config.elitesPerDay.set(key, tuples);
      });
    }
  }

  // Parse maxDistancePerDay
  if (obj.maxDistancePerDay && typeof obj.maxDistancePerDay === 'object') {
    const mdpd = obj.maxDistancePerDay as { entry?: unknown };
    if (mdpd.entry) {
      const entries = ensureArray<Record<string, unknown>>(mdpd.entry as Record<string, unknown> | Array<Record<string, unknown>>);
      entries.forEach((e: Record<string, unknown>) => {
        const key = Number(e['@_key']);
        const value = Number(e['@_value']);
        config.maxDistancePerDay.set(key, value);
      });
    }
  }

  // Parse disallowedEnemies
  if (obj.disallowedEnemies && typeof obj.disallowedEnemies === 'object') {
    const de = obj.disallowedEnemies as { item?: unknown };
    if (de.item) {
      const items = ensureArray<string>(de.item as string | string[]);
      config.disallowedEnemies = items.map((item: string) => String(item));
    }
  }

  // Parse spawnPointsPerGroup
  if (obj.spawnPointsPerGroup !== undefined) {
    config.spawnPointsPerGroup = Number(obj.spawnPointsPerGroup);
  }

  // Parse spawnPointRectWidth
  if (obj.spawnPointRectWidth !== undefined) {
    config.spawnPointRectWidth = Number(obj.spawnPointRectWidth);
  }

  // Parse spawnPointRectHeight
  if (obj.spawnPointRectHeight !== undefined) {
    config.spawnPointRectHeight = Number(obj.spawnPointRectHeight);
  }

  // Parse waveDefinitions
  if (obj.waveDefinitions && typeof obj.waveDefinitions === 'object') {
    const wd = obj.waveDefinitions as { wave?: unknown };
    if (wd.wave) {
      const waves = ensureArray<Record<string, unknown>>(wd.wave as Record<string, unknown> | Array<Record<string, unknown>>);
      config.waveDefinitions = waves.map((w: Record<string, unknown>) => parseXmlSpawnWaveDefinition(w));
    }
  }

  return config;
}

function parseXmlSpawnWaveDefinition(xml: unknown): SpawnWaveDefinition {
  const obj = xml as Record<string, unknown>;
  const wave: SpawnWaveDefinition = {
    id: '',
    spawnMultiplier: 0,
    isBossWave: false,
    isInfinite: false,
    enemyTypes: [],
    tierDistribution: [],
    timeDistribution: [],
  };

  // Parse attributes
  if (obj['@_id'] !== undefined) {
    wave.id = String(obj['@_id']);
  }

  if (obj['@_spawnMultiplier'] !== undefined) {
    wave.spawnMultiplier = Number(obj['@_spawnMultiplier']);
  }

  if (obj['@_isBossWave'] !== undefined) {
    wave.isBossWave = obj['@_isBossWave'] === true || obj['@_isBossWave'] === 'true';
  }

  if (obj['@_bossId'] !== undefined) {
    wave.bossId = String(obj['@_bossId']);
  }

  if (obj['@_isInfinite'] !== undefined) {
    wave.isInfinite = obj['@_isInfinite'] === true || obj['@_isInfinite'] === 'true';
  }

  // Parse enemyTypes
  if (obj.enemyTypes && typeof obj.enemyTypes === 'object') {
    const et = obj.enemyTypes as { entry?: unknown };
    if (et.entry) {
      const entries = ensureArray<Record<string, unknown>>(et.entry as Record<string, unknown> | Array<Record<string, unknown>>);
      wave.enemyTypes = entries.map((e: Record<string, unknown>) => [
        String(e['@_id']),
        Number(e['@_weight']),
      ]);
    }
  }

  // Parse tierDistribution
  if (obj.tierDistribution && typeof obj.tierDistribution === 'object') {
    const td = obj.tierDistribution as { entry?: unknown };
    if (td.entry) {
      const entries = ensureArray<Record<string, unknown>>(td.entry as Record<string, unknown> | Array<Record<string, unknown>>);
      wave.tierDistribution = entries.map((e: Record<string, unknown>) => [
        Number(e['@_val']),
        Number(e['@_weight']),
      ]);
    }
  }

  // Parse timeDistribution
  if (obj.timeDistribution && typeof obj.timeDistribution === 'object') {
    const tdist = obj.timeDistribution as { entry?: unknown };
    if (tdist.entry) {
      const entries = ensureArray<Record<string, unknown>>(tdist.entry as Record<string, unknown> | Array<Record<string, unknown>>);
      wave.timeDistribution = entries.map((e: Record<string, unknown>) => [
        Number(e['@_val']),
        Number(e['@_weight']),
      ]);
    }
  }

  return wave;
}

function parseXmlCorruptionConfig(xml: unknown): CorruptionConfig {
  const obj = xml as Record<string, unknown>;
  const config: CorruptionConfig = {
    corruptionByNight: new Map(),
  };

  if (obj.corruptionByNight && typeof obj.corruptionByNight === 'object') {
    const cbn = obj.corruptionByNight as { entry?: unknown };
    if (cbn.entry) {
      const entries = ensureArray<Record<string, unknown>>(cbn.entry as Record<string, unknown> | Array<Record<string, unknown>>);
      entries.forEach((e: Record<string, unknown>) => {
        const key = Number(e['@_key']);
        const value = Number(e['@_value']);
        config.corruptionByNight.set(key, value);
      });
    }
  }

  return config;
}

function parseXmlFogConfig(xml: unknown): FogConfig {
  const obj = xml as Record<string, unknown>;
  const config: FogConfig = {
    fogDensities: [],
    increaseEveryXDays: 0,
    initialDensityIndex: 0,
    dayExceptions: new Map(),
  };

  // Parse fogDensities
  if (obj.fogDensities && typeof obj.fogDensities === 'object') {
    const fd = obj.fogDensities as { entry?: unknown };
    if (fd.entry) {
      const entries = ensureArray<Record<string, unknown>>(fd.entry as Record<string, unknown> | Array<Record<string, unknown>>);
      config.fogDensities = entries.map((e: Record<string, unknown>) => [
        e['@_name'] as FogDensityName,
        Number(e['@_value']),
      ]);
    }
  }

  // Parse increaseEveryXDays
  if (obj.increaseEveryXDays !== undefined) {
    config.increaseEveryXDays = Number(obj.increaseEveryXDays);
  }

  // Parse initialDensityIndex
  if (obj.initialDensityIndex !== undefined) {
    config.initialDensityIndex = Number(obj.initialDensityIndex);
  }

  // Parse dayExceptions
  if (obj.dayExceptions && typeof obj.dayExceptions === 'object') {
    const de = obj.dayExceptions as { entry?: unknown };
    if (de.entry) {
      const entries = ensureArray<Record<string, unknown>>(de.entry as Record<string, unknown> | Array<Record<string, unknown>>);
      entries.forEach((e: Record<string, unknown>) => {
        const day = Number(e['@_day']);
        const density = e['@_density'] as FogDensityName;
        config.dayExceptions.set(day, density);
      });
    }
  }

  return config;
}

function parseXmlResourceConfig(xml: unknown): ResourceConfig {
  const obj = xml as Record<string, unknown>;
  const config: ResourceConfig = {
    gold: 0,
    materials: 0,
  };

  if (obj.gold !== undefined) {
    config.gold = Number(obj.gold);
  }

  if (obj.materials !== undefined) {
    config.materials = Number(obj.materials);
  }

  if (obj.damnedSouls !== undefined) {
    config.damnedSouls = Number(obj.damnedSouls);
  }

  return config;
}

/**
 * Deserialize XML string to GameConfig
 */
export function deserializeXmlToConfig(xml: string): GameConfig {
  const parser = new XMLParser(parserOptions);
  const result = parser.parse(xml);

  if (!result || !result.GameConfig) {
    throw new Error('Invalid XML: Missing GameConfig root element');
  }

  const obj = result.GameConfig as Record<string, unknown>;

  // Validate required fields
  const requiredFields = ['mapId', 'victoryDays', 'difficulty', 'fogId'];
  for (const field of requiredFields) {
    if (obj[field] === undefined) {
      throw new Error(`Invalid XML: Missing required field '${field}'`);
    }
  }

  const config: GameConfig = {
    mapId: String(obj.mapId),
    victoryDays: Number(obj.victoryDays),
    difficulty: String(obj.difficulty),
    enemiesOffset: obj.enemiesOffset !== undefined ? Number(obj.enemiesOffset) : 0,
    maxGlyphPoints: obj.maxGlyphPoints !== undefined ? Number(obj.maxGlyphPoints) : 0,
    fogId: String(obj.fogId),
    spawnConfig: parseXmlSpawnConfig(obj.spawnConfig || {}),
    corruptionConfig: parseXmlCorruptionConfig(obj.corruptionConfig || {}),
    fogConfig: parseXmlFogConfig(obj.fogConfig || {}),
    resourceConfig: parseXmlResourceConfig(obj.resourceConfig || {}),
  };

  return config;
}

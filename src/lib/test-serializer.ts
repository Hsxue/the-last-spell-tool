/**
 * Round-trip test for configSerializer
 * Tests serialize -> deserialize -> compare
 * Run with: npx tsx src/lib/test-serializer.ts
 */

import { serializeConfigToXml, deserializeXmlToConfig } from './configSerializer.js';
import type { GameConfig } from '../types/index.js';

// Create a comprehensive test config
const testConfig: GameConfig = {
  mapId: 'Lakeburg',
  victoryDays: 12,
  difficulty: '2',
  enemiesOffset: 0,
  maxGlyphPoints: 5,
  fogId: 'Lakeburg',
  spawnConfig: {
    spawnMultipliers: new Map([
      [1, 1.0],
      [5, 1.5],
      [10, 2.0],
    ]),
    spawnsPerWaveFormula: '60 + Night * Multiplier',
    spawnWavesPerDay: new Map([
      [1, [['wave_basic_1', 1.0]]],
      [5, [['wave_basic_1', 0.7], ['wave_advanced_1', 0.3]]],
    ]),
    spawnDirections: new Map([
      [1, [['north', 0.5], ['south', 0.5]]],
      [3, [['north', 0.3], ['east', 0.3], ['west', 0.4]]],
    ]),
    elitesPerDay: new Map([
      [5, [[1, 2], [2, 1]]],
      [10, [[2, 3], [3, 1]]],
    ]),
    maxDistancePerDay: new Map([
      [1, 10],
      [5, 15],
      [10, 20],
    ]),
    disallowedEnemies: ['boss_final', 'elite_special'],
    spawnPointsPerGroup: 3,
    spawnPointRectWidth: 6,
    spawnPointRectHeight: 2,
    waveDefinitions: [
      {
        id: 'wave_basic_1',
        spawnMultiplier: 1.0,
        isBossWave: false,
        isInfinite: false,
        enemyTypes: [
          ['zombie', 0.6],
          ['skeleton', 0.4],
        ],
        tierDistribution: [
          [1, 0.7],
          [2, 0.3],
        ],
        timeDistribution: [
          [10, 0.3],
          [20, 0.5],
          [30, 0.2],
        ],
      },
      {
        id: 'wave_boss_1',
        spawnMultiplier: 2.0,
        isBossWave: true,
        bossId: 'boss_nightmare',
        isInfinite: false,
        enemyTypes: [['boss_nightmare', 1.0]],
        tierDistribution: [[3, 1.0]],
        timeDistribution: [[5, 1.0]],
      },
      {
        id: 'wave_infinite_1',
        spawnMultiplier: 1.5,
        isBossWave: false,
        isInfinite: true,
        enemyTypes: [
          ['zombie', 0.5],
          ['ghoul', 0.5],
        ],
        tierDistribution: [
          [1, 0.5],
          [2, 0.5],
        ],
        timeDistribution: [[15, 1.0]],
      },
    ],
  },
  corruptionConfig: {
    corruptionByNight: new Map([
      [1, 10],
      [5, 30],
      [10, 60],
      [12, 100],
    ]),
  },
  fogConfig: {
    fogDensities: [
      ['VeryThin', 22],
      ['Thin', 20],
      ['Average', 18],
      ['Dense', 16],
      ['VeryDense', 14],
    ],
    increaseEveryXDays: 2,
    initialDensityIndex: 2,
    dayExceptions: new Map([
      [5, 'Thin'],
      [10, 'Average'],
    ]),
  },
  resourceConfig: {
    gold: 300,
    materials: 50,
    damnedSouls: 10,
  },
};

function compareMaps<K, V>(map1: Map<K, V>, map2: Map<K, V>, name: string): void {
  if (map1.size !== map2.size) {
    throw new Error(`Map ${name} size mismatch: ${map1.size} vs ${map2.size}`);
  }
  for (const [key, value] of map1.entries()) {
    if (!map2.has(key)) {
      throw new Error(`Map ${name} missing key: ${key}`);
    }
    const v2 = map2.get(key)!;
    if (JSON.stringify(value) !== JSON.stringify(v2)) {
      throw new Error(`Map ${name} value mismatch for key ${key}: ${value} vs ${v2}`);
    }
  }
}

function compareArrays<T>(arr1: T[], arr2: T[], name: string): void {
  if (arr1.length !== arr2.length) {
    throw new Error(`Array ${name} length mismatch: ${arr1.length} vs ${arr2.length}`);
  }
  for (let i = 0; i < arr1.length; i++) {
    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
      throw new Error(`Array ${name}[${i}] mismatch: ${JSON.stringify(arr1[i])} vs ${JSON.stringify(arr2[i])}`);
    }
  }
}

function runTest(): void {
  console.log('Starting round-trip test...');

  // Serialize
  const xml = serializeConfigToXml(testConfig);
  console.log('\n=== Generated XML ===\n');
  console.log(xml);
  console.log('\n=== End XML ===\n');

  // Deserialize
  const deserializedConfig = deserializeXmlToConfig(xml);

  // Compare primitive fields
  console.log('Comparing primitive fields...');
  if (testConfig.mapId !== deserializedConfig.mapId) {
    throw new Error(`mapId mismatch: ${testConfig.mapId} vs ${deserializedConfig.mapId}`);
  }
  if (testConfig.victoryDays !== deserializedConfig.victoryDays) {
    throw new Error(`victoryDays mismatch: ${testConfig.victoryDays} vs ${deserializedConfig.victoryDays}`);
  }
  if (testConfig.difficulty !== deserializedConfig.difficulty) {
    throw new Error(`difficulty mismatch: ${testConfig.difficulty} vs ${deserializedConfig.difficulty}`);
  }
  if (testConfig.enemiesOffset !== deserializedConfig.enemiesOffset) {
    throw new Error(`enemiesOffset mismatch: ${testConfig.enemiesOffset} vs ${deserializedConfig.enemiesOffset}`);
  }
  if (testConfig.maxGlyphPoints !== deserializedConfig.maxGlyphPoints) {
    throw new Error(`maxGlyphPoints mismatch: ${testConfig.maxGlyphPoints} vs ${deserializedConfig.maxGlyphPoints}`);
  }
  if (testConfig.fogId !== deserializedConfig.fogId) {
    throw new Error(`fogId mismatch: ${testConfig.fogId} vs ${deserializedConfig.fogId}`);
  }

  // Compare spawnConfig
  console.log('Comparing spawnConfig...');
  const origSpawn = testConfig.spawnConfig;
  const deserSpawn = deserializedConfig.spawnConfig;

  compareMaps(origSpawn.spawnMultipliers, deserSpawn.spawnMultipliers, 'spawnMultipliers');
  if (origSpawn.spawnsPerWaveFormula !== deserSpawn.spawnsPerWaveFormula) {
    throw new Error(`spawnsPerWaveFormula mismatch`);
  }
  compareMaps(origSpawn.spawnWavesPerDay, deserSpawn.spawnWavesPerDay, 'spawnWavesPerDay');
  compareMaps(origSpawn.spawnDirections, deserSpawn.spawnDirections, 'spawnDirections');
  compareMaps(origSpawn.elitesPerDay, deserSpawn.elitesPerDay, 'elitesPerDay');
  compareMaps(origSpawn.maxDistancePerDay, deserSpawn.maxDistancePerDay, 'maxDistancePerDay');
  compareArrays(origSpawn.disallowedEnemies, deserSpawn.disallowedEnemies, 'disallowedEnemies');
  if (origSpawn.spawnPointsPerGroup !== deserSpawn.spawnPointsPerGroup) {
    throw new Error(`spawnPointsPerGroup mismatch`);
  }
  if (origSpawn.spawnPointRectWidth !== deserSpawn.spawnPointRectWidth) {
    throw new Error(`spawnPointRectWidth mismatch`);
  }
  if (origSpawn.spawnPointRectHeight !== deserSpawn.spawnPointRectHeight) {
    throw new Error(`spawnPointRectHeight mismatch`);
  }

  // Compare waveDefinitions
  console.log('Comparing waveDefinitions...');
  compareArrays(origSpawn.waveDefinitions, deserSpawn.waveDefinitions, 'waveDefinitions');

  // Compare corruptionConfig
  console.log('Comparing corruptionConfig...');
  compareMaps(
    testConfig.corruptionConfig.corruptionByNight,
    deserializedConfig.corruptionConfig.corruptionByNight,
    'corruptionByNight'
  );

  // Compare fogConfig
  console.log('Comparing fogConfig...');
  const origFog = testConfig.fogConfig;
  const deserFog = deserializedConfig.fogConfig;
  compareArrays(origFog.fogDensities, deserFog.fogDensities, 'fogDensities');
  if (origFog.increaseEveryXDays !== deserFog.increaseEveryXDays) {
    throw new Error(`increaseEveryXDays mismatch`);
  }
  if (origFog.initialDensityIndex !== deserFog.initialDensityIndex) {
    throw new Error(`initialDensityIndex mismatch`);
  }
  compareMaps(origFog.dayExceptions, deserFog.dayExceptions, 'dayExceptions');

  // Compare resourceConfig
  console.log('Comparing resourceConfig...');
  if (testConfig.resourceConfig.gold !== deserializedConfig.resourceConfig.gold) {
    throw new Error(`gold mismatch`);
  }
  if (testConfig.resourceConfig.materials !== deserializedConfig.resourceConfig.materials) {
    throw new Error(`materials mismatch`);
  }
  if (testConfig.resourceConfig.damnedSouls !== deserializedConfig.resourceConfig.damnedSouls) {
    throw new Error(`damnedSouls mismatch`);
  }

  console.log('\n✅ All round-trip tests passed!');
}

try {
  runTest();
} catch (error) {
  console.error('\n❌ Test failed:', error);
  throw error;
}

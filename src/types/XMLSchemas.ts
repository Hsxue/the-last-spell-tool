/**
 * XML Schema Constants
 * Contains common schema definitions for various game objects
 */

import type { XMLSchema } from './XMLSchema';

// Character schema with nested objects
export const characterSchema: XMLSchema = {
  rootTag: 'character',
  fields: [
    { name: 'id', xmlAttr: 'id', type: 'number' },
    { name: 'name', xmlAttr: 'name', type: 'string' },
    { name: 'level', xmlAttr: 'level', type: 'number' },
    { name: 'class', xmlAttr: 'class', type: 'string' },
    { name: 'health', xmlAttr: 'health', type: 'number' },
    { name: 'mana', xmlAttr: 'mana', type: 'number' },
    { name: 'weapons', xmlAttr: 'weapons', type: 'array', required: false },
  ],
};

// Item schema
export const itemSchema: XMLSchema = {
  rootTag: 'item',
  fields: [
    { name: 'id', xmlAttr: 'id', type: 'number' },
    { name: 'name', xmlAttr: 'name', type: 'string' },
    { name: 'type', xmlAttr: 'type', type: 'string' },
    { name: 'value', xmlAttr: 'value', type: 'number' },
    { name: 'stackSize', xmlAttr: 'stackSize', type: 'number' },
    { name: 'description', xmlAttr: 'description', type: 'string', required: false },
  ],
};

// Monster schema
export const monsterSchema: XMLSchema = {
  rootTag: 'monster',
  fields: [
    { name: 'id', xmlAttr: 'id', type: 'number' },
    { name: 'name', xmlAttr: 'name', type: 'string' },
    { name: 'level', xmlAttr: 'level', type: 'number' },
    { name: 'health', xmlAttr: 'health', type: 'number' },
    { name: 'attack', xmlAttr: 'attack', type: 'number' },
    { name: 'defense', xmlAttr: 'defense', type: 'number' },
    { name: 'loot', xmlAttr: 'loot', type: 'array', required: false },
  ],
};

// Map schema
export const mapSchema: XMLSchema = {
  rootTag: 'map',
  fields: [
    { name: 'id', xmlAttr: 'id', type: 'number' },
    { name: 'name', xmlAttr: 'name', type: 'string' },
    { name: 'difficulty', xmlAttr: 'difficulty', type: 'number' },
    { name: 'enemies', xmlAttr: 'enemies', type: 'array', required: false },
    { name: 'items', xmlAttr: 'items', type: 'array', required: false },
    { name: 'description', xmlAttr: 'description', type: 'string', required: false },
  ],
};

// Game configuration schema - comprehensive schema for GameConfig
export const gameConfigSchema: XMLSchema = {
  rootTag: 'gameConfig',
  fields: [
    { name: 'mapId', xmlAttr: 'mapId', type: 'string' },
    { name: 'victoryDays', xmlAttr: 'victoryDays', type: 'number' },
    { name: 'difficulty', xmlAttr: 'difficulty', type: 'string' },
    { name: 'enemiesOffset', xmlAttr: 'enemiesOffset', type: 'number' },
    { name: 'maxGlyphPoints', xmlAttr: 'maxGlyphPoints', type: 'number' },
    { name: 'fogId', xmlAttr: 'fogId', type: 'string' },
    // Nested spawn config
    { name: 'spawnMultipliers', xmlAttr: 'spawnMultipliers', type: 'array', required: false },
    { name: 'spawnsPerWaveFormula', xmlAttr: 'spawnsPerWaveFormula', type: 'string', required: false },
    { name: 'spawnWavesPerDay', xmlAttr: 'spawnWavesPerDay', type: 'array', required: false },
    { name: 'spawnDirections', xmlAttr: 'spawnDirections', type: 'array', required: false },
    { name: 'elitesPerDay', xmlAttr: 'elitesPerDay', type: 'array', required: false },
    { name: 'maxDistancePerDay', xmlAttr: 'maxDistancePerDay', type: 'array', required: false },
    { name: 'disallowedEnemies', xmlAttr: 'disallowedEnemies', type: 'array', required: false },
    { name: 'spawnPointsPerGroup', xmlAttr: 'spawnPointsPerGroup', type: 'number', required: false },
    { name: 'spawnPointRectWidth', xmlAttr: 'spawnPointRectWidth', type: 'number', required: false },
    { name: 'spawnPointRectHeight', xmlAttr: 'spawnPointRectHeight', type: 'number', required: false },
    { name: 'waveDefinitions', xmlAttr: 'waveDefinitions', type: 'array', required: false },
    // Nested corruption config
    { name: 'corruptionByNight', xmlAttr: 'corruptionByNight', type: 'array', required: false },
    // Nested fog config
    { name: 'fogDensities', xmlAttr: 'fogDensities', type: 'array', required: false },
    { name: 'increaseEveryXDays', xmlAttr: 'increaseEveryXDays', type: 'number', required: false },
    { name: 'initialDensityIndex', xmlAttr: 'initialDensityIndex', type: 'number', required: false },
    { name: 'dayExceptions', xmlAttr: 'dayExceptions', type: 'array', required: false },
    // Nested resource config
    { name: 'gold', xmlAttr: 'gold', type: 'number', required: false },
    { name: 'materials', xmlAttr: 'materials', type: 'number', required: false },
    { name: 'damnedSouls', xmlAttr: 'damnedSouls', type: 'number', required: false },
  ],
};

// Weapon schema - for individual weapon editing
export const weaponSchema: XMLSchema = {
  rootTag: 'weapon',
  fields: [
    { name: 'id', xmlAttr: 'id', type: 'string' },
    { name: 'category', xmlAttr: 'category', type: 'string' },
    { name: 'hands', xmlAttr: 'hands', type: 'string' },
    { name: 'tags', xmlAttr: 'tags', type: 'array', required: false },
    { name: 'levelVariations', xmlAttr: 'levelVariations', type: 'array', required: false },
  ],
};

// Skill schema - for individual skill editing
export const skillSchema: XMLSchema = {
  rootTag: 'skill',
  fields: [
    { name: 'id', xmlAttr: 'id', type: 'string' },
    { name: 'description', xmlAttr: 'description', type: 'string' },
    { name: 'iconPath', xmlAttr: 'iconPath', type: 'string' },
    { name: 'templateId', xmlAttr: 'templateId', type: 'string' },
    { name: 'actionPointsCost', xmlAttr: 'actionPointsCost', type: 'number' },
    { name: 'manaCost', xmlAttr: 'manaCost', type: 'number' },
    { name: 'healthCost', xmlAttr: 'healthCost', type: 'number' },
    { name: 'usesPerTurnCount', xmlAttr: 'usesPerTurnCount', type: 'number' },
    { name: 'skillRange', xmlAttr: 'skillRange', type: 'object', required: false },
    { name: 'skillTarget', xmlAttr: 'skillTarget', type: 'object', required: false },
    { name: 'areaOfEffect', xmlAttr: 'areaOfEffect', type: 'object', required: false },
    { name: 'attackAction', xmlAttr: 'attackAction', type: 'object', required: false },
    { name: 'genericAction', xmlAttr: 'genericAction', type: 'object', required: false },
    { name: 'castFx', xmlAttr: 'castFx', type: 'object', required: false },
    { name: 'conditions', xmlAttr: 'conditions', type: 'object', required: false },
    { name: 'category', xmlAttr: 'category', type: 'string' },
  ],
};
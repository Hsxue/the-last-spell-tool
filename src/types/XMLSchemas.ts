/**
 * XML Schema Constants
 * Contains common schema definitions for various game objects
 */

import type { XMLSchema } from './XMLSchema';

// Simple weapon schema
export const weaponSchema: XMLSchema = {
  rootTag: 'weapon',
  fields: [
    { name: 'id', xmlAttr: 'id', type: 'number' },
    { name: 'name', xmlAttr: 'name', type: 'string' },
    { name: 'damage', xmlAttr: 'damage', type: 'number' },
    { name: 'rare', xmlAttr: 'rare', type: 'boolean' },
    { name: 'description', xmlAttr: 'description', type: 'string', required: false },
    { name: 'tags', xmlAttr: 'tags', type: 'array', required: false },
  ],
};

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
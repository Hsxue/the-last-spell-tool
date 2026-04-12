/**
 * Weapon XML Parser
 * Handles parsing and exporting weapon definitions in the game's XML format.
 * Export format: UTF-8 encoding, game-native ItemDefinition structure.
 * Import format: Supports both UTF-16 LE BOM and UTF-8 (backward compatible).
 */

import { XMLParser, XMLBuilder } from 'fast-xml-parser';

import type { WeaponDefinition, WeaponLevel, WeaponCategory, WeaponHands } from '../../types/weapon-skill';

// ============================================================================
// Constants
// ============================================================================

const UTF16_LE_BOM = new Uint8Array([0xff, 0xfe]);

// ============================================================================
// XML Parser Configuration
// ============================================================================

const parserOptions = {
  ignoreAttributes: false,
  parseTagValue: true,
  parseAttributeValue: true,
  parseTrueNumberOnly: true,
  alwaysCreateTextNode: false,
  isArray: (name: string, _jpath: unknown, _isLeaf: boolean, _isAttribute: boolean) => {
    // Arrays in weapon XML
    return ['Tags', 'Skills', 'LevelVariations', 'BaseStatBonuses'].includes(name);
  },
};

const builderOptions = {
  ignoreAttributes: false,
  format: true,
  indentBy: '    ',
  suppressEmptyNode: false,
  suppressBooleanAttributes: false,
  attributesGroupName: '_',
  preserveOrder: false,
};

// ============================================================================
// BOM Detection and Encoding Utilities
// ============================================================================

/**
 * Detect BOM and encoding from ArrayBuffer
 */
function detectEncoding(buffer: ArrayBuffer): { encoding: 'utf-16-le' | 'utf-16-be' | 'utf-8'; hasBom: boolean; contentStart: number } {
  const bytes = new Uint8Array(buffer);
  
  // Check for UTF-16 LE BOM (FF FE)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { encoding: 'utf-16-le', hasBom: true, contentStart: 2 };
  }
  
  // Check for UTF-16 BE BOM (FE FF)
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { encoding: 'utf-16-be', hasBom: true, contentStart: 2 };
  }
  
  // Check for UTF-8 BOM (EF BB BF)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { encoding: 'utf-8', hasBom: true, contentStart: 3 };
  }
  
  // Default to UTF-16 LE (game default)
  return { encoding: 'utf-16-le', hasBom: false, contentStart: 0 };
}

/**
 * Decode ArrayBuffer to string with proper encoding
 */
function decodeBuffer(buffer: ArrayBuffer): string {
  const { encoding, contentStart } = detectEncoding(buffer);
  const contentBytes = buffer.slice(contentStart);
  
  if (encoding === 'utf-8') {
    return new TextDecoder('utf-8').decode(contentBytes);
  }
  
  // UTF-16 decoding
  const encodingName = encoding === 'utf-16-le' ? 'utf-16le' : 'utf-16be';
  return new TextDecoder(encodingName).decode(contentBytes);
}

/**
 * Encode string to UTF-16 LE with BOM (legacy, kept for backward compatibility)
 * @deprecated Use direct TextEncoder for UTF-8 export
 */
export function encodeToUtf16LeWithBom(xmlString: string): Uint8Array {
  const bom = UTF16_LE_BOM;
  
  // Create UTF-16 LE bytes manually
  const utf16Bytes: number[] = [];
  for (let i = 0; i < xmlString.length; i++) {
    const code = xmlString.charCodeAt(i);
    // Little endian: low byte first, then high byte
    utf16Bytes.push(code & 0xff);
    utf16Bytes.push((code >> 8) & 0xff);
  }
  
  const contentBytes = Uint8Array.from(utf16Bytes);
  const result = new Uint8Array(bom.length + contentBytes.length);
  result.set(bom, 0);
  result.set(contentBytes, bom.length);
  
  return result;
}

// ============================================================================
// Type Conversion Utilities
// ============================================================================

/**
 * Convert XML weapon data to WeaponDefinition
 */
function xmlToWeapon(xmlWeapon: Record<string, unknown>): WeaponDefinition {
  const parseNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  const parseNumberTuple = (value: unknown): [number, number] => {
    // Handle array format [min, max]
    if (Array.isArray(value) && value.length >= 2) {
      return [parseNumber(value[0]), parseNumber(value[1])];
    }
    // Handle object format { Min: x, Max: y } or { min: x, max: y }
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      // New attribute format: { _: { '@_Min': x, '@_Max': y } }
      const attrs = obj['_'] as Record<string, unknown> | undefined;
      if (attrs) {
        const min = parseNumber(attrs['@_Min'] ?? attrs['@_min'] ?? 0);
        const max = parseNumber(attrs['@_Max'] ?? attrs['@_max'] ?? 0);
        return [min, max];
      }
      const min = parseNumber(obj.Min ?? obj.min ?? 0);
      const max = parseNumber(obj.Max ?? obj.max ?? 0);
      return [min, max];
    }
    return [0, 0];
  };

  const parseStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map(v => String(v));
    }
    // Handle XML object format: { Tag: ['Sword', 'Metal'] } or { Skill: ['Slice', 'Slash'] }
    // May also have '_' key from attributesGroupName config
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      // Try common wrapper keys (skip internal '_' key)
      for (const key of ['Tag', 'Skill', 'tag', 'skill']) {
        if (Array.isArray(obj[key])) {
          return (obj[key] as unknown[]).map(v => String(v));
        }
      }
    }
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  };

  const parseStatBonuses = (value: unknown): Map<string, number> => {
    const bonuses = new Map<string, number>();
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          const entry = item as Record<string, unknown>;
          // New attribute format: { _: { '@_Stat': 'PhysicalDamage' }, '#text': 5 }
          const attrs = entry['_'] as Record<string, unknown> | undefined;
          if (attrs && attrs['@_Stat'] !== undefined) {
            const statName = String(attrs['@_Stat']);
            const textValue = entry['#text'];
            const numValue = textValue !== undefined
              ? parseNumber(textValue)
              : (Object.values(entry).find(v => typeof v === 'number') as number | undefined) ?? 0;
            bonuses.set(statName, numValue);
          } else {
            // Old format: { StatName: 'PhysicalDamage', Value: 5 }
            const keys = Object.keys(entry).filter(k => k !== '_');
            if (keys.length >= 2) {
              const statName = String(entry[keys[0]]);
              const statValue = parseNumber(entry[keys[1]]);
              bonuses.set(statName, statValue);
            }
          }
        }
      }
    }
    return bonuses;
  };

  const parseLevelVariations = (value: unknown): Record<number, WeaponLevel> => {
    const variations: Record<number, WeaponLevel> = {};
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          const levelData = item as Record<string, unknown>;
          
          // Support both formats:
          // New: <Level Id="0"> → { _: { '@_Id': 0 }, ... }
          // Old: <Level>0</Level> → { Level: 0, ... }
          let level = -1;
          const attrs = levelData['_'] as Record<string, unknown> | undefined;
          if (attrs && attrs['@_Id'] !== undefined) {
            level = parseNumber(attrs['@_Id']);
          } else {
            level = parseNumber(levelData.Level ?? levelData.level ?? -1);
          }
          
          if (level >= 0) {
            const baseDamageRaw = levelData.BaseDamage ?? levelData.baseDamage;
            
            variations[level] = {
              baseDamage: parseNumberTuple(baseDamageRaw),
              basePrice: parseNumber(levelData.BasePrice ?? levelData.basePrice),
              baseStatBonuses: parseStatBonuses(levelData.BaseStatBonuses ?? levelData.baseStatBonuses),
              skills: parseStringArray(levelData.Skills ?? levelData.skills),
            };
          }
        }
      }
    }
    return variations;
  };

  return {
    id: String((xmlWeapon['_'] as Record<string, unknown> | undefined)?.['@_Id'] ?? xmlWeapon.Id ?? xmlWeapon.id ?? ''),
    category: (xmlWeapon.Category ?? xmlWeapon.category ?? 'MeleeWeapon') as WeaponCategory,
    hands: (xmlWeapon.Hands ?? xmlWeapon.hands ?? 'OneHand') as WeaponHands,
    tags: parseStringArray(xmlWeapon.Tags ?? xmlWeapon.tags),
    levelVariations: parseLevelVariations(xmlWeapon.LevelVariations ?? xmlWeapon.levelVariations),
  };
}

/**
 * Convert WeaponDefinition to XML data object (game-native format)
 */
function weaponToXml(weapon: WeaponDefinition): Record<string, unknown> {
  const levelVariationsArray: Record<string, unknown>[] = [];
  
  const levelVars = weapon.levelVariations || {};
  
  Object.entries(levelVars).forEach(([levelStr, data]) => {
    const levelNum = parseInt(levelStr, 10);
    if (isNaN(levelNum) || levelNum < 0) return;
    
    // Handle baseStatBonuses as Map or plain object
    let baseStatBonuses: Array<Record<string, unknown>> = [];
    if (data.baseStatBonuses instanceof Map) {
      baseStatBonuses = Array.from(data.baseStatBonuses.entries()).map(([stat, value]) => ({
        _: { '@_Stat': stat },
        '#text': value,
      }));
    } else if (data.baseStatBonuses && typeof data.baseStatBonuses === 'object') {
      baseStatBonuses = Object.entries(data.baseStatBonuses).map(([stat, value]) => ({
        _: { '@_Stat': stat },
        '#text': value,
      }));
    }
    
    // Handle skills array
    const skills = Array.isArray(data.skills) ? data.skills : [];
    
    // Handle baseDamage tuple
    let baseDamage: [number, number] = [0, 0];
    if (Array.isArray(data.baseDamage)) {
      baseDamage = [data.baseDamage[0] ?? 0, data.baseDamage[1] ?? 0];
    } else if (data.baseDamage && typeof data.baseDamage === 'object') {
      baseDamage = [(data.baseDamage as Record<string, number>).min ?? 0, (data.baseDamage as Record<string, number>).max ?? 0];
    }
    
    const levelEntry: Record<string, unknown> = {
      _: { '@_Id': levelNum },
      BaseDamage: { _: { '@_Min': baseDamage[0], '@_Max': baseDamage[1] } },
      BasePrice: data.basePrice ?? 0,
    };
    
    if (baseStatBonuses.length > 0) {
      levelEntry.BaseStatBonuses = baseStatBonuses;
    }
    
    if (skills.length > 0) {
      levelEntry.Skills = { Skill: skills };
    }
    
    levelVariationsArray.push(levelEntry);
  });

  const itemDef: Record<string, unknown> = {
    _: { '@_Id': weapon.id },
    Category: weapon.category,
    Hands: weapon.hands,
    Tags: { Tag: Array.isArray(weapon.tags) ? weapon.tags : [] },
  };
  
  if (levelVariationsArray.length > 0) {
    itemDef.LevelVariations = levelVariationsArray;
  }
  
  return itemDef;
}

// ============================================================================
// Main Parser Functions
// ============================================================================

/**
 * Parse weapons from XML string (supports both old and new formats)
 */
export function parseWeapons(xmlString: string): WeaponDefinition[] {
  const parser = new XMLParser(parserOptions);
  const parsed = parser.parse(xmlString);
  
  // Support new format: <ItemDefinitions><ItemDefinition>...</ItemDefinition></ItemDefinitions>
  const itemDefs = parsed.ItemDefinitions ?? parsed.itemDefinitions;
  if (itemDefs) {
    const itemsArray = Array.isArray(itemDefs.ItemDefinition ?? itemDefs.itemDefinition)
      ? itemDefs.ItemDefinition ?? itemDefs.itemDefinition
      : [itemDefs.ItemDefinition ?? itemDefs.itemDefinition].filter(Boolean);
    return itemsArray.map((item: Record<string, unknown>) => xmlToWeapon(item));
  }
  
  // Support old format (backward compatible): <Weapons><Weapon>...</Weapon></Weapons>
  const weaponsData = parsed.Weapons ?? parsed.weapons;
  if (!weaponsData) {
    return [];
  }
  
  const weaponsArray = Array.isArray(weaponsData.Weapon ?? weaponsData.weapon)
    ? weaponsData.Weapon ?? weaponsData.weapon
    : [weaponsData.Weapon ?? weaponsData.weapon].filter(Boolean);
  
  return weaponsArray.map((weapon: Record<string, unknown>) => xmlToWeapon(weapon));
}

/**
 * Parse weapons from ArrayBuffer (with BOM detection)
 */
export function parseWeaponsFromBuffer(buffer: ArrayBuffer): WeaponDefinition[] {
  const xmlString = decodeBuffer(buffer);
  return parseWeapons(xmlString);
}

/**
 * Export weapons to XML string (game-native format)
 */
export function exportWeapons(weapons: WeaponDefinition[]): string {
  const builder = new XMLBuilder(builderOptions);
  
  const weaponsData = {
    ItemDefinitions: {
      '_': {
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xsi:noNamespaceSchemaLocation': '../ItemDefinitions.xsd',
      },
      ItemDefinition: weapons.map(weaponToXml),
    },
  };
  
  const xmlString = builder.build(weaponsData);
  
  // Add XML declaration with UTF-8 encoding
  const xmlDeclaration = '<?xml version="1.0" encoding="utf-8"?>\n';
  return xmlDeclaration + xmlString;
}

/**
 * Export weapons to Uint8Array with UTF-8 encoding
 */
export function exportWeaponsToBuffer(weapons: WeaponDefinition[]): Uint8Array {
  const xmlString = exportWeapons(weapons);
  return new TextEncoder().encode(xmlString);
}

/**
 * Round-trip test: parse -> export -> parse
 * Returns true if data is identical after round-trip
 */
export function roundTripTest(weapons: WeaponDefinition[]): boolean {
  try {
    const xmlString = exportWeapons(weapons);
    const parsed = parseWeapons(xmlString);
    
    if (parsed.length !== weapons.length) {
      return false;
    }
    
    for (let i = 0; i < weapons.length; i++) {
      const original = weapons[i];
      const roundTripped = parsed[i];
      
      if (original.id !== roundTripped.id ||
          original.category !== roundTripped.category ||
          original.hands !== roundTripped.hands ||
          original.tags.length !== roundTripped.tags.length) {
        return false;
      }
      
      const origLevels = Object.keys(original.levelVariations).map(Number);
      const roundLevels = Object.keys(roundTripped.levelVariations).map(Number);
      
      if (origLevels.length !== roundLevels.length) {
        return false;
      }
      
      for (const level of origLevels) {
        const origLevel = original.levelVariations[level];
        const roundTrippedLevel = roundTripped.levelVariations[level];
        if (!roundTrippedLevel) return false;
        
        if (origLevel.baseDamage[0] !== roundTrippedLevel.baseDamage[0] ||
            origLevel.baseDamage[1] !== roundTrippedLevel.baseDamage[1] ||
            origLevel.basePrice !== roundTrippedLevel.basePrice) {
          return false;
        }
        
        const origBonuses = origLevel.baseStatBonuses instanceof Map
          ? origLevel.baseStatBonuses.size
          : Object.keys(origLevel.baseStatBonuses || {}).length;
        const roundBonuses = roundTrippedLevel.baseStatBonuses instanceof Map
          ? roundTrippedLevel.baseStatBonuses.size
          : Object.keys(roundTrippedLevel.baseStatBonuses || {}).length;
        
        if (origBonuses !== roundBonuses) {
          return false;
        }
        
        if (origLevel.skills.length !== roundTrippedLevel.skills.length) {
          return false;
        }
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

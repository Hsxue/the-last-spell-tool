/**
 * Weapon XML Parser
 * Handles parsing and exporting weapon definitions in the game's XML format
 * with UTF-16 LE BOM encoding for game compatibility
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
  indentBy: '  ',
  suppressEmptyNode: false,
  suppressBooleanAttributes: false,
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
 * Encode string to UTF-16 LE with BOM
 */
function encodeToUtf16LeWithBom(xmlString: string): Uint8Array {
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
    if (Array.isArray(value) && value.length >= 2) {
      return [parseNumber(value[0]), parseNumber(value[1])];
    }
    return [0, 0];
  };

  const parseStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map(v => String(v));
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
          const keys = Object.keys(entry);
          if (keys.length >= 2) {
            const statName = String(entry[keys[0]]);
            const statValue = parseNumber(entry[keys[1]]);
            bonuses.set(statName, statValue);
          }
        }
      }
    }
    return bonuses;
  };

  const parseLevelVariations = (value: unknown): Map<number, WeaponLevel> => {
    const variations = new Map<number, WeaponLevel>();
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          const levelData = item as Record<string, unknown>;
          const level = parseNumber(levelData.Level ?? levelData.level ?? -1);
          if (level >= 0) {
            variations.set(level, {
              baseDamage: parseNumberTuple(levelData.BaseDamage ?? levelData.baseDamage),
              basePrice: parseNumber(levelData.BasePrice ?? levelData.basePrice),
              baseStatBonuses: parseStatBonuses(levelData.BaseStatBonuses ?? levelData.baseStatBonuses),
              skills: parseStringArray(levelData.Skills ?? levelData.skills),
            });
          }
        }
      }
    }
    return variations;
  };

  return {
    id: String(xmlWeapon.Id ?? xmlWeapon.id ?? ''),
    category: (xmlWeapon.Category ?? xmlWeapon.category ?? 'MeleeWeapon') as WeaponCategory,
    hands: (xmlWeapon.Hands ?? xmlWeapon.hands ?? 'OneHand') as WeaponHands,
    tags: parseStringArray(xmlWeapon.Tags ?? xmlWeapon.tags),
    levelVariations: parseLevelVariations(xmlWeapon.LevelVariations ?? xmlWeapon.levelVariations),
  };
}

/**
 * Convert WeaponDefinition to XML data object
 */
function weaponToXml(weapon: WeaponDefinition): Record<string, unknown> {
  const levelVariationsArray: Record<string, unknown>[] = [];
  
  weapon.levelVariations.forEach((data, level) => {
    levelVariationsArray.push({
      Level: level,
      BaseDamage: {
        Min: data.baseDamage[0],
        Max: data.baseDamage[1],
      },
      BasePrice: data.basePrice,
      BaseStatBonuses: Array.from(data.baseStatBonuses.entries()).map(([statName, value]) => ({
        StatName: statName,
        Value: value,
      })),
      Skills: data.skills.length > 0 ? { Skill: data.skills } : [],
    });
  });

  return {
    Id: weapon.id,
    Category: weapon.category,
    Hands: weapon.hands,
    Tags: { Tag: weapon.tags },
    LevelVariations: levelVariationsArray,
  };
}

// ============================================================================
// Main Parser Functions
// ============================================================================

/**
 * Parse weapons from XML string
 */
export function parseWeapons(xmlString: string): WeaponDefinition[] {
  const parser = new XMLParser(parserOptions);
  const parsed = parser.parse(xmlString);
  
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
 * Export weapons to XML string
 */
export function exportWeapons(weapons: WeaponDefinition[]): string {
  const builder = new XMLBuilder(builderOptions);
  
  const weaponsData = {
    Weapons: {
      Weapon: weapons.map(weaponToXml),
    },
  };
  
  const xmlString = builder.build(weaponsData);
  
  // Add XML declaration
  const xmlDeclaration = '<?xml version="1.0" encoding="utf-16"?>\n';
  return xmlDeclaration + xmlString;
}

/**
 * Export weapons to Uint8Array with UTF-16 LE BOM
 */
export function exportWeaponsToBuffer(weapons: WeaponDefinition[]): Uint8Array {
  const xmlString = exportWeapons(weapons);
  return encodeToUtf16LeWithBom(xmlString);
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
      
      if (original.levelVariations.size !== roundTripped.levelVariations.size) {
        return false;
      }
      
      // Convert to array to avoid iteration issues
      const levelEntries = Array.from(original.levelVariations.entries());
      for (const [level, origLevel] of levelEntries) {
        const roundTrippedLevel = roundTripped.levelVariations.get(level);
        if (!roundTrippedLevel) return false;
        
        if (origLevel.baseDamage[0] !== roundTrippedLevel.baseDamage[0] ||
            origLevel.baseDamage[1] !== roundTrippedLevel.baseDamage[1] ||
            origLevel.basePrice !== roundTrippedLevel.basePrice) {
          return false;
        }
        
        if (origLevel.baseStatBonuses.size !== roundTrippedLevel.baseStatBonuses.size) {
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

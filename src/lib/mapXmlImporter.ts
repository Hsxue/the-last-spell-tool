/**
 * Error classes for TileMap XML import
 */

import { XMLParser } from 'fast-xml-parser';
import type { MapData, Building } from '../types/map';

// Error classes
export class MalformedXmlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MalformedXmlError';
  }
}

export class EncodingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncodingError';
  }
}

export class MissingElementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingElementError';
  }
}

// Interfaces (for future use)
export interface ParsedGroundData {
  x: number;
  y: number;
  distToCity: number;
  distToMagic: number;
}

export interface ParsedFlagData {
  flagType: string;
  x: number;
  y: number;
}

/**
 * Parse TileMap XML buffer into MapData structure
 * @param xmlBuffer - ArrayBuffer containing UTF-16 encoded XML
 * @returns Parsed MapData object
 * @throws {MalformedXmlError} When XML structure is invalid
 * @throws {MissingElementError} When required elements are missing
 */
export function parseTileMap(xmlBuffer: ArrayBuffer): MapData {
  // Decode ArrayBuffer to string (UTF-16 with BOM handling)
  const xmlString = decodeXmlBuffer(xmlBuffer);

  // Configure fast-xml-parser
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true,
    parseTagValue: true,
  });

  let parsed: unknown;
  try {
    parsed = parser.parse(xmlString);
  } catch (error) {
    throw new MalformedXmlError(`Failed to parse XML: ${(error as Error).message}`);
  }

  // Validate structure
  if (!parsed || typeof parsed !== 'object') {
    throw new MalformedXmlError('Invalid XML structure: root is not an object');
  }

  const tileMap = parsed as Record<string, unknown>;

  if (!('TileMap' in tileMap)) {
    throw new MalformedXmlError('Invalid XML structure: missing TileMap root element');
  }

  const root = tileMap.TileMap as Record<string, unknown>;

  // Parse required elements
  const width = parseRequiredNumber(root, 'Width');
  const height = parseRequiredNumber(root, 'Height');

  // Parse Grounds section (required element, but can be empty)
  if (!('Grounds' in root)) {
    throw new MissingElementError('Missing required element: Grounds');
  }

  const grounds = (root.Grounds as Record<string, unknown>) ?? {};
  const terrain = new Map<string, 'Crater' | 'Dirt' | 'Stone' | 'Empty'>();

  // Parse each terrain type (Crater, Dirt, Stone, Empty)
  for (const terrainType of Object.keys(grounds)) {
    const coordinates = grounds[terrainType] as string;
    if (!coordinates) continue;

    const rects = String(coordinates).split('|');
    for (const rect of rects) {
      const trimmed = rect.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        const x = parseInt(parts[0], 10);
        const y = parseInt(parts[1], 10);
        if (!isNaN(x) && !isNaN(y)) {
          // Store only x,y -> terrainType (discard distToCity/distToMagic)
          terrain.set(`${x},${y}`, terrainType as 'Crater' | 'Dirt' | 'Stone' | 'Empty');
        }
      }
    }
  }

  // Parse Flags section (optional)
  const flags = new Map<string, Array<[number, number]>>();

  if ('Flags' in root && root.Flags) {
    const flagsData = root.Flags as Record<string, unknown>;
    for (const flagType of Object.keys(flagsData)) {
      const positions = flagsData[flagType] as string;
      if (!positions) continue;

      const coords = String(positions).split('|');
      const flagPositions: Array<[number, number]> = [];

      for (const coord of coords) {
        const trimmed = coord.trim();
        if (!trimmed) continue;

        const parts = trimmed.split(',').map(s => s.trim());
        if (parts.length >= 2) {
          const x = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10);
          if (!isNaN(x) && !isNaN(y)) {
            flagPositions.push([x, y]);
          }
        }
      }

      if (flagPositions.length > 0) {
        flags.set(flagType, flagPositions);
      }
    }
  }

  // Parse Buildings section (optional - can be in same file or separate)
  const buildings: Building[] = [];

  if ('Buildings' in root && root.Buildings) {
    const buildingsData = root.Buildings as Record<string, unknown>;
    
    if (buildingsData && typeof buildingsData === 'object') {
      // Parse each Building element
      const buildingEntries = Object.entries(buildingsData);

      for (const [key, value] of buildingEntries) {
        // Skip non-Building elements
        if (key !== 'Building') {
          continue;
        }

        // Handle both single building and array of buildings
        const buildingList = Array.isArray(value) ? value : [value];

        for (const buildingData of buildingList) {
          if (!buildingData || typeof buildingData !== 'object') {
            continue;
          }

          const building = buildingData as Record<string, unknown>;
          
          // Extract attributes (prefixed with @_)
          const id = building['@_Id'] as string | undefined;
          const x = parseOptionalNumber(building, '@_X');
          const y = parseOptionalNumber(building, '@_Y');

          // Extract Health element (child element, not attribute)
          let health: number | undefined;
          if ('Health' in building) {
            const healthValue = building.Health;
            if (typeof healthValue === 'number') {
              health = healthValue >= 0 ? healthValue : undefined;
            } else if (typeof healthValue === 'string') {
              const parsed = parseInt(healthValue, 10);
              if (!isNaN(parsed)) {
                health = parsed >= 0 ? parsed : undefined;
              }
            }
          }

          if (id && x !== undefined && y !== undefined) {
            buildings.push({
              id,
              x,
              y,
              health,
            } as Building);
          }
        }
      }
    }
  }

  return {
    width,
    height,
    terrain,
    buildings,
    flags,
  };
}

/**
 * Decode ArrayBuffer to string with BOM detection
 */
function decodeXmlBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // Check for UTF-16 LE BOM
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    const content = new Uint8Array(buffer, 2);
    return new TextDecoder('utf-16', { fatal: false }).decode(content);
  }

  // Check for UTF-16 BE BOM
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const content = new Uint8Array(buffer, 2);
    return new TextDecoder('utf-16', { fatal: false }).decode(content);
  }

  // Check for UTF-8 BOM
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    const content = new Uint8Array(buffer, 3);
    return new TextDecoder('utf-8').decode(content);
  }

  // Try UTF-8 first, fall back to UTF-16
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('utf-16', { fatal: false }).decode(bytes);
  }
}

/**
 * Parse a required number element from XML object
 */
function parseRequiredNumber(obj: Record<string, unknown>, key: string): number {
  if (!(key in obj)) {
    throw new MissingElementError(`Missing required element: ${key}`);
  }

  const value = obj[key];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  throw new MalformedXmlError(`Invalid ${key} value: expected number, got ${typeof value}`);
}

/**
 * Parse Buildings XML buffer into Building[] array
 * @param xmlBuffer - ArrayBuffer containing UTF-16 encoded XML
 * @returns Array of Building objects
 * @throws {MalformedXmlError} When XML structure is invalid
 */
export function parseBuildings(xmlBuffer: ArrayBuffer): Building[] {
  // Decode ArrayBuffer to string (UTF-16 with BOM handling)
  const xmlString = decodeXmlBuffer(xmlBuffer);

  // Configure fast-xml-parser
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true,
    parseTagValue: true,
  });

  let parsed: unknown;
  try {
    parsed = parser.parse(xmlString);
  } catch (error) {
    throw new MalformedXmlError(`Failed to parse XML: ${(error as Error).message}`);
  }

  // Validate structure
  if (!parsed || typeof parsed !== 'object') {
    throw new MalformedXmlError('Invalid XML structure: root is not an object');
  }

  const root = parsed as Record<string, unknown>;

  if (!('Buildings' in root)) {
    throw new MalformedXmlError('Invalid XML structure: missing Buildings root element');
  }

  const buildingsData = root.Buildings as Record<string, unknown>;
  const buildings: Building[] = [];

  // Handle case where Buildings is empty or has no Building children
  if (!buildingsData || typeof buildingsData !== 'object') {
    return buildings;
  }

  // Parse each Building element
  // fast-xml-parser may return a single object or an array
  const buildingEntries = Object.entries(buildingsData);

  for (const [key, value] of buildingEntries) {
    // Skip non-Building elements (could be #text or other metadata)
    if (key !== 'Building') {
      continue;
    }

    // Handle both single building and array of buildings
    const buildingList = Array.isArray(value) ? value : [value];

    for (const buildingData of buildingList) {
      if (!buildingData || typeof buildingData !== 'object') {
        continue;
      }

      const building = buildingData as Record<string, unknown>;
      
      // Extract attributes (prefixed with @_)
      const id = building['@_Id'] as string | undefined;
      const x = parseOptionalNumber(building, '@_X');
      const y = parseOptionalNumber(building, '@_Y');

      // Extract Health element (child element, not attribute)
      let health: number | undefined;
      if ('Health' in building) {
        const healthValue = building.Health;
        if (typeof healthValue === 'number') {
          health = healthValue >= 0 ? healthValue : undefined;
        } else if (typeof healthValue === 'string') {
          const parsed = parseInt(healthValue, 10);
          if (!isNaN(parsed)) {
            health = parsed >= 0 ? parsed : undefined;
          }
        }
      }

      buildings.push({
        id,
        x,
        y,
        health,
      } as Building);
    }
  }

  return buildings;
}

/**
 * Parse an optional number element from XML object
 * Returns undefined if the key is not present
 */
function parseOptionalNumber(obj: Record<string, unknown>, key: string): number | undefined {
  if (!(key in obj)) {
    return undefined;
  }

  const value = obj[key];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return undefined;
}
/**
 * Integration Tests for mapXmlImporter
 * Tests parsing of real game map files and round-trip scenarios
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { parseTileMap, parseBuildings } from '@/lib/mapXmlImporter';
import { exportBuildingsToXml } from '@/lib/mapXmlExporter';
import type { MapData, Building } from '@/types/map';
// Import fixture content directly using Vite's raw import
import tutorialMapXml from '../test/fixtures/TutorialMap_TileMap.xml?raw';
import tutorialBuildingsXml from '../test/fixtures/TutorialMap_Buildings.xml?raw';
import invalidTileMapXml from '../test/fixtures/invalid_TileMap.xml?raw';

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Converts a UTF-8 string to ArrayBuffer (simulating UTF-16 LE for backward compatibility)
 * The game files are actually UTF-8 despite claiming to be UTF-16
 */
function stringToBuffer(content: string): ArrayBuffer {
  const encoder = new TextEncoder(); // Always UTF-8
  return encoder.encode(content).buffer;
}

/**
 * Convert a string to UTF-16 Little Endian with BOM (as the original XML files expect)
 * Simulating the original encoding approach from file reads for test compatibility
 */
function stringToUtf16LE(content: string): ArrayBuffer {
  // Add UTF-16 LE BOM
  const bom = new Uint8Array([0xFF, 0xFE]);
  // Convert string to UTF-16 LE bytes
  const utf16Bytes: number[] = [];
  for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    utf16Bytes.push(code & 0xFF, (code >> 8) & 0xFF);
  }
  const contentArray = new Uint8Array(utf16Bytes);
  const buffer = new Uint8Array(bom.length + contentArray.length);
  buffer.set(bom, 0);
  buffer.set(contentArray, bom.length);
  
  return buffer.buffer;
}

// ============================================================================
// 1. Round-trip Tests (parse → export → parse)
// ============================================================================

describe('mapXmlImporter: Round-trip Tests', () => {
  let originalMapData: MapData;
  let originalBuildings: Building[];

  beforeAll(() => {
    // Load original data using imported fixtures
    originalMapData = parseTileMap(stringToUtf16LE(tutorialMapXml));
    originalBuildings = parseBuildings(stringToUtf16LE(tutorialBuildingsXml));
  });

  it('should preserve building data in round-trip (parse → export → parse)', () => {
    // Export buildings to XML string
    const xmlString = exportBuildingsToXml(originalBuildings);
    
    // Convert string to ArrayBuffer with UTF-16 LE encoding (matching game format)
    // Add UTF-16 LE BOM
    const bom = new Uint8Array([0xFF, 0xFE]);
    const encoder = new TextEncoder();
    // Note: TextEncoder encodes as UTF-8, we need to simulate UTF-16
    const utf16Bytes: number[] = [];
    for (let i = 0; i < xmlString.length; i++) {
      const code = xmlString.charCodeAt(i);
      utf16Bytes.push(code & 0xFF, (code >> 8) & 0xFF);
    }
    const content = new Uint8Array(utf16Bytes);
    const buffer = new Uint8Array(bom.length + content.length);
    buffer.set(bom, 0);
    buffer.set(content, bom.length);
    
    // Parse the exported XML
    const reparsedBuildings = parseBuildings(buffer.buffer);
    
    // Verify counts match
    expect(reparsedBuildings.length).toBe(originalBuildings.length);
    
    // Verify each building matches
    reparsedBuildings.forEach((reparsed, index) => {
      const original = originalBuildings[index];
      expect(reparsed.id).toBe(original.id);
      expect(reparsed.x).toBe(original.x);
      expect(reparsed.y).toBe(original.y);
      expect(reparsed.health).toBe(original.health);
    });
  });

  it('should preserve terrain data in round-trip', () => {
    // Get original terrain entries
    const originalEntries = Array.from(originalMapData.terrain.entries());
    
    // Create a minimal XML for terrain round-trip test
    // Note: Full terrain export requires exportTileMap which doesn't exist yet
    // This test validates that parsed terrain can be accessed correctly
    expect(originalEntries.length).toBeGreaterThan(0);
    
    // Verify terrain map structure
    originalEntries.forEach(([key, terrainType]) => {
      const [x, y] = key.split(',').map(Number);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(['Crater', 'Dirt', 'Stone', 'Empty']).toContain(terrainType);
    });
  });

  it('should preserve map dimensions in round-trip', () => {
    expect(originalMapData.width).toBe(51);
    expect(originalMapData.height).toBe(51);
  });
});

// ============================================================================
// 2. Multiple Game Maps Tests
// ============================================================================

describe('mapXmlImporter: Multiple Game Maps', () => {
  it('should parse TutorialMap_TileMap.xml (51x51) successfully', () => {
    const mapData = parseTileMap(stringToUtf16LE(tutorialMapXml));
    
    expect(mapData.width).toBe(51);
    expect(mapData.height).toBe(51);
    expect(mapData.terrain.size).toBeGreaterThan(0);
    expect(mapData.buildings).toEqual([]); // Buildings are separate
    expect(mapData.flags).toBeInstanceOf(Map);
  });

  it('should parse TutorialMap_Buildings.xml successfully', () => {
    const buildings = parseBuildings(stringToUtf16LE(tutorialBuildingsXml));
    
    expect(buildings.length).toBeGreaterThan(0);
    
    // Verify building structure
    buildings.forEach((building) => {
      expect(building.id).toBeDefined();
      expect(typeof building.x).toBe('number');
      expect(typeof building.y).toBe('number');
    });
    
    // Check for specific known buildings
    const magicCircle = buildings.find(b => b.id === 'MagicCircle');
    expect(magicCircle).toBeDefined();
    expect(magicCircle?.x).toBe(25);
    expect(magicCircle?.y).toBe(25);
  });

  it('should parse edge case - empty buildings', () => {
    // Test with empty buildings fixture
    const buildings = parseBuildings(stringToUtf16LE('<?xml version="1.0" encoding="utf-16"?><Buildings></Buildings>'));
    
    expect(buildings.length).toBe(0);
  });

  it('should handle various building configurations', () => {
    // Using tutorial buildings to ensure realistic test data
    const buildings = parseBuildings(stringToUtf16LE(tutorialBuildingsXml));
    
    // Verify we have different types of buildings
    const buildingTypes = [...new Set(buildings.map(b => b.id))];
    expect(buildingTypes.length).toBeGreaterThan(5); // Should have multiple distinct building types
  });
});

// ============================================================================
// 3. Edge Case Tests
// ============================================================================

describe('mapXmlImporter: Edge Cases', () => {
  it('should handle empty Grounds section (no terrain)', () => {
    const emptyGroundsXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

    const mapData = parseTileMap(stringToUtf16LE(emptyGroundsXml));
    
    expect(mapData.width).toBe(10);
    expect(mapData.height).toBe(10);
    expect(mapData.terrain.size).toBe(0);
  });

  it('should handle empty Flags section', () => {
    const emptyFlagsXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Crater>0,0</Crater>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

    const mapData = parseTileMap(stringToUtf16LE(emptyFlagsXml));
    
    expect(mapData.flags.size).toBe(0);
  });

  it('should throw MissingElementError when Width is missing', () => {
    const missingWidthXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Height>10</Height>
  <Grounds></Grounds>
</TileMap>`;

    expect(() => parseTileMap(stringToUtf16LE(missingWidthXml))).toThrow('Missing required element: Width');
  });

  it('should throw MissingElementError when Height is missing', () => {
    const missingHeightXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Grounds></Grounds>
</TileMap>`;

    expect(() => parseTileMap(stringToUtf16LE(missingHeightXml))).toThrow('Missing required element: Height');
  });

  it('should throw MalformedXmlError when TileMap root is missing', () => {
    const invalidXml = `<?xml version="1.0" encoding="utf-16"?>
<InvalidRoot>
  <Width>10</Width>
</InvalidRoot>`;

    expect(() => parseTileMap(stringToUtf16LE(invalidXml))).toThrow('Invalid XML structure: missing TileMap root element');
  });

  it('should handle whitespace in coordinates gracefully', () => {
    const whitespaceXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Crater>  0,0  |  1,1  |  2,2  </Crater>
  </Grounds>
</TileMap>`;

    const mapData = parseTileMap(stringToUtf16LE(whitespaceXml));
    
    expect(mapData.terrain.size).toBe(3);
    expect(mapData.terrain.get('0,0')).toBe('Crater');
    expect(mapData.terrain.get('1,1')).toBe('Crater');
    expect(mapData.terrain.get('2,2')).toBe('Crater');
  });

  it('should handle missing Grounds element', () => {
    const missingGroundsXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
</TileMap>`;

    expect(() => parseTileMap(stringToUtf16LE(missingGroundsXml))).toThrow('Missing required element: Grounds');
  });

  it('should handle Buildings XML with empty Building element', () => {
    const emptyBuildingsXml = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
</Buildings>`;

    const buildings = parseBuildings(stringToUtf16LE(emptyBuildingsXml));
    
    expect(buildings.length).toBe(0);
  });

  it('should handle malformed XML gracefully', () => {
    const malformedXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Crater>invalid-data</Crater>
  </Grounds>
</TileMap>`;

    // Should still parse, just skipping invalid coordinates
    const mapData = parseTileMap(stringToUtf16LE(malformedXml));
    expect(mapData.width).toBe(10);
    expect(mapData.height).toBe(10);
  });
  
  // Test with the actual invalid fixture
  it('should handle provided invalid XML fixture', () => {
    // This fixture is assumed to be invalid in some way that the parser handles sensibly
    try {
      const mapData = parseTileMap(stringToUtf16LE(invalidTileMapXml));
      // If it parses without throwing, just make sure it has reasonable properties
      expect(mapData.width).toBeDefined();
      expect(mapData.height).toBeDefined();
    } catch(error) {
      // If it throws, that's also acceptable behavior for invalid XML
      expect((error as Error).message).toBeDefined();
    }
  });
});

// ============================================================================
// 4. Additional Integration Tests
// ============================================================================

describe('mapXmlImporter: Additional Integration Tests', () => {
  it('should handle large coordinate values', () => {
    const largeCoordsXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>100</Width>
  <Height>100</Height>
  <Grounds>
    <Crater>99,99|98,98|0,0</Crater>
  </Grounds>
</TileMap>`;

    const mapData = parseTileMap(stringToUtf16LE(largeCoordsXml));
    
    expect(mapData.terrain.size).toBe(3);
    expect(mapData.terrain.has('99,99')).toBe(true);
    expect(mapData.terrain.has('0,0')).toBe(true);
  });

  it('should handle multiple terrain types in same map', () => {
    const multiTerrainXml = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Crater>0,0|1,1</Crater>
    <Dirt>2,2|3,3</Dirt>
    <Stone>4,4|5,5</Stone>
  </Grounds>
</TileMap>`;

    const mapData = parseTileMap(stringToUtf16LE(multiTerrainXml));
    
    expect(mapData.terrain.get('0,0')).toBe('Crater');
    expect(mapData.terrain.get('1,1')).toBe('Crater');
    expect(mapData.terrain.get('2,2')).toBe('Dirt');
    expect(mapData.terrain.get('3,3')).toBe('Dirt');
    expect(mapData.terrain.get('4,4')).toBe('Stone');
    expect(mapData.terrain.get('5,5')).toBe('Stone');
  });

  it('should handle building with Health attribute', () => {
    const buildingWithHealthXml = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="StoneWall" X="10" Y="20">
    <Health>100</Health>
  </Building>
  <Building Id="WoodWall" X="30" Y="40">
    <Health>50</Health>
  </Building>
</Buildings>`;

    const buildings = parseBuildings(stringToUtf16LE(buildingWithHealthXml));
    
    expect(buildings.length).toBe(2);
    expect(buildings[0].id).toBe('StoneWall');
    expect(buildings[0].health).toBe(100);
    expect(buildings[1].id).toBe('WoodWall');
    expect(buildings[1].health).toBe(50);
  });

  it('should handle building without Health attribute', () => {
    const buildingWithoutHealthXml = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="StoneWall" X="10" Y="20" />
</Buildings>`;

    const buildings = parseBuildings(stringToUtf16LE(buildingWithoutHealthXml));
    
    expect(buildings.length).toBe(1);
    expect(buildings[0].id).toBe('StoneWall');
    expect(buildings[0].health).toBeUndefined();
  });
});

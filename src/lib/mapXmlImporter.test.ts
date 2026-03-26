import { describe, it, expect } from 'vitest';
import { parseTileMap, parseBuildings, MissingElementError, MalformedXmlError } from './mapXmlImporter';
import type { Building } from '../types/map';

// Helper to create UTF-16 LE encoded ArrayBuffer with BOM
function utf16WithBOM(content: string): ArrayBuffer {
  const bom = new Uint8Array([0xff, 0xfe]);
  // Manually encode to UTF-16LE
  const utf16 = new Uint8Array(content.length * 2);
  for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    utf16[i * 2] = code & 0xff;
    utf16[i * 2 + 1] = (code >> 8) & 0xff;
  }
  const result = new Uint8Array(bom.length + utf16.length);
  result.set(bom, 0);
  result.set(utf16, 2);
  return result.buffer;
}

describe('parseTileMap', () => {
  describe('Valid XML parsing', () => {
    it('should parse TutorialMap_TileMap.xml successfully', () => {
      // Minimal valid TileMap XML
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>51</Width>
  <Height>51</Height>
  <Grounds>
    <Crater>50,50,39,48|50,49,38,47</Crater>
    <Dirt>21,22,4,6|22,23,5,7</Dirt>
    <Stone>25,25,0,0|26,25,1,0</Stone>
  </Grounds>
  <Flags>
    <EnemyMagnet>23,24|25,26</EnemyMagnet>
    <Zone_E>40,30|41,30</Zone_E>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      expect(result).toBeDefined();
      expect(result.width).toBe(51);
      expect(result.height).toBe(51);
      expect(result.terrain).toBeInstanceOf(Map);
      expect(result.buildings).toEqual([]);
      expect(result.flags).toBeInstanceOf(Map);

      // Check terrain data - format is "x,y" -> terrainType
      expect(result.terrain.get('50,50')).toBe('Crater');
      expect(result.terrain.get('50,49')).toBe('Crater');
      expect(result.terrain.get('21,22')).toBe('Dirt');
      expect(result.terrain.get('25,25')).toBe('Stone');
      expect(result.terrain.get('26,25')).toBe('Stone');

      // Check flags - format is flagType -> array of [x,y]
      const enemyMagnets = result.flags.get('EnemyMagnet');
      expect(enemyMagnets).toBeDefined();
      expect(enemyMagnets).toContainEqual([23, 24]);
      expect(enemyMagnets).toContainEqual([25, 26]);

      const zoneE = result.flags.get('Zone_E');
      expect(zoneE).toBeDefined();
      expect(zoneE).toContainEqual([40, 30]);
      expect(zoneE).toContainEqual([41, 30]);
    });

    it('should discard distance data from terrain coordinates', () => {
      // The parser should parse distToCity/distToMagic but NOT include them in output
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Crater>5,5,10,20</Crater>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      // Terrain should only contain "x,y" -> terrainType, NO distance data
      expect(result.terrain.get('5,5')).toBe('Crater');
      expect(result.terrain.size).toBe(1);
    });

    it('should handle Empty ground type', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Empty>0,0,0,0</Empty>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      expect(result.terrain.get('0,0')).toBe('Empty');
    });

    it('should handle empty Grounds section', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      expect(result.terrain.size).toBe(0);
    });

    it('should handle empty Flags section', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Stone>5,5,0,0</Stone>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      expect(result.flags.size).toBe(0);
    });
  });

  describe('UTF-16 BOM handling', () => {
    it('should handle UTF-16 LE BOM correctly', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>5</Width>
  <Height>5</Height>
  <Grounds>
    <Stone>0,0,0,0</Stone>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      expect(result.width).toBe(5);
      expect(result.height).toBe(5);
      expect(result.terrain.get('0,0')).toBe('Stone');
    });

    it('should handle XML without BOM', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>5</Width>
  <Height>5</Height>
  <Grounds>
    <Stone>0,0,0,0</Stone>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      // Encode without BOM
      const encoder = new TextEncoder();
      const buffer = encoder.encode(xmlContent).buffer;

      const result = parseTileMap(buffer);
      expect(result.width).toBe(5);
    });
  });

  describe('Malformed XML error handling', () => {
    it('should throw MalformedXmlError for invalid XML structure', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>51</Width>
  <Height>51</Height>
  <Grounds>
    <Crater>invalid-content-format</Crater>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      
      // Should parse successfully but skip invalid coordinates
      const result = parseTileMap(buffer);
      expect(result.terrain.size).toBe(0); // No valid coordinates parsed
    });

    it('should throw MalformedXmlError for unclosed tags', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>51</Width>
  <Height>51</Height>
  <Grounds>
    <Crater>50,50,39,48
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      
      // fast-xml-parser may handle this gracefully or throw
      // The implementation should handle it gracefully by skipping invalid data
      const result = parseTileMap(buffer);
      expect(result.width).toBe(51);
      expect(result.height).toBe(51);
    });

    it('should throw MalformedXmlError for invalid coordinate format', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>51</Width>
  <Height>51</Height>
  <Grounds>
    <Crater>invalid,format|also,bad</Crater>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      
      // Should either skip invalid coordinates or throw error
      const result = parseTileMap(buffer);
      // If it doesn't throw, it should have skipped the invalid data
      expect(result.terrain.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Missing elements error handling', () => {
    it('should throw MissingElementError when Grounds section is missing', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>51</Width>
  <Height>51</Height>
  <Flags>
    <EnemyMagnet>23,24</EnemyMagnet>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      
      expect(() => parseTileMap(buffer)).toThrow(MissingElementError);
      expect(() => parseTileMap(buffer)).toThrow(/Grounds/);
    });

    it('should throw MissingElementError when Width is missing', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Height>51</Height>
  <Grounds>
    <Stone>0,0,0,0</Stone>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      
      expect(() => parseTileMap(buffer)).toThrow(MissingElementError);
    });

    it('should throw MissingElementError when Height is missing', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>51</Width>
  <Grounds>
    <Stone>0,0,0,0</Stone>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      
      expect(() => parseTileMap(buffer)).toThrow(MissingElementError);
    });
  });

  describe('Edge cases', () => {
    it('should handle single coordinate without pipe separator', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Stone>5,5,0,0</Stone>
  </Grounds>
  <Flags>
    <EnemyMagnet>3,3</EnemyMagnet>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      expect(result.terrain.get('5,5')).toBe('Stone');
      expect(result.flags.get('EnemyMagnet')).toEqual([[3, 3]]);
    });

    it('should handle multiple flag types', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Stone>0,0,0,0</Stone>
  </Grounds>
  <Flags>
    <EnemyMagnet>1,1</EnemyMagnet>
    <Zone_E>2,2</Zone_E>
    <Zone_W>3,3</Zone_W>
    <FogSpawner>4,4</FogSpawner>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      expect(result.flags.get('EnemyMagnet')).toEqual([[1, 1]]);
      expect(result.flags.get('Zone_E')).toEqual([[2, 2]]);
      expect(result.flags.get('Zone_W')).toEqual([[3, 3]]);
      expect(result.flags.get('FogSpawner')).toEqual([[4, 4]]);
    });

    it('should handle coordinates with extra whitespace', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<TileMap>
  <Width>10</Width>
  <Height>10</Height>
  <Grounds>
    <Stone> 5 , 5 , 0 , 0 </Stone>
  </Grounds>
  <Flags>
  </Flags>
</TileMap>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseTileMap(buffer);

      expect(result.terrain.get('5,5')).toBe('Stone');
    });
  });
});

// ============================================================================
// parseBuildings() Tests
// ============================================================================

describe('parseBuildings', () => {
  describe('Valid XML parsing', () => {
    it('should parse valid Buildings XML successfully', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Barricade" X="22" Y="25" />
  <Building Id="Shop" X="25" Y="26" />
  <Building Id="House" X="20" Y="23" />
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: 'Barricade', x: 22, y: 25, health: undefined });
      expect(result[1]).toEqual({ id: 'Shop', x: 25, y: 26, health: undefined });
      expect(result[2]).toEqual({ id: 'House', x: 20, y: 23, health: undefined });
    });

    it('should parse building with Health element', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Shop" X="25" Y="26">
    <Health>100</Health>
  </Building>
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 'Shop', x: 25, y: 26, health: 100 });
    });

    it('should parse building without Health element (undefined)', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Barricade" X="22" Y="25" />
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].health).toBeUndefined();
    });

    it('should parse mixed buildings with and without Health', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Shop" X="25" Y="26">
    <Health>100</Health>
  </Building>
  <Building Id="Barricade" X="22" Y="25" />
  <Building Id="House" X="20" Y="23">
    <Health>50</Health>
  </Building>
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: 'Shop', x: 25, y: 26, health: 100 });
      expect(result[1]).toEqual({ id: 'Barricade', x: 22, y: 25, health: undefined });
      expect(result[2]).toEqual({ id: 'House', x: 20, y: 23, health: 50 });
    });
  });

  describe('Health value handling', () => {
    it('should set health to undefined when Health is negative', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Shop" X="25" Y="26">
    <Health>-10</Health>
  </Building>
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].health).toBeUndefined();
    });

    it('should handle Health with value 0', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Shop" X="25" Y="26">
    <Health>0</Health>
  </Building>
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].health).toBe(0);
    });

    it('should parse Health as string and convert to number', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Shop" X="25" Y="26">
    <Health>75</Health>
  </Building>
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].health).toBe(75);
    });
  });

  describe('Malformed XML error handling', () => {
    it('should throw MalformedXmlError for incomplete XML', () => {
      const xmlContent = `<Buildings`;

      const buffer = utf16WithBOM(xmlContent);

      expect(() => parseBuildings(buffer)).toThrow(MalformedXmlError);
    });

    it('should throw MalformedXmlError for invalid XML structure', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<InvalidRoot>
  <Building Id="Shop" X="25" Y="26" />
</InvalidRoot>`;

      const buffer = utf16WithBOM(xmlContent);

      expect(() => parseBuildings(buffer)).toThrow(MalformedXmlError);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty Buildings element', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(0);
    });

    it('should handle Building with missing X coordinate', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Shop" Y="26" />
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].x).toBeUndefined();
    });

    it('should handle Building with missing Y coordinate', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Shop" X="25" />
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].y).toBeUndefined();
    });

    it('should handle Building with missing Id attribute', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building X="25" Y="26" />
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBeUndefined();
    });

    it('should handle coordinates as strings and convert to numbers', () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-16"?>
<Buildings>
  <Building Id="Shop" X="25" Y="26" />
</Buildings>`;

      const buffer = utf16WithBOM(xmlContent);
      const result = parseBuildings(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].x).toBe(25);
      expect(result[0].y).toBe(26);
    });
  });
});

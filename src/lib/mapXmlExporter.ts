/**
 * Map XML Exporter - Complete export functionality for The Last Spell map data
 * Exports map data in format compatible with LastSpellMapMod tool
 * 
 * IMPORTANT: 
 * - TileMap.xml contains: Width/Height, Grounds (terrain), Flags
 * - Buildings.xml contains: ONLY buildings (separate file)
 * - Game does NOT read buildings from TileMap.xml
 */

import type { Building, TerrainType, TileFlag } from '../types/map';

/**
 * Computes distance from each terrain tile to the nearest city center
 * Uses Manhattan distance from map center (default city center)
 * @param terrain - Map entries with "x,y" -> TerrainType
 * @param width - Map width
 * @param height - Map height
 * @returns Map<"x,y", { distToCity: number; distToMagic: number }>
 */
function computeTerrainDistances(
  terrain: Map<string, TerrainType>,
  width: number,
  height: number
): Map<string, { distToCity: number; distToMagic: number }> {
  const result = new Map<string, { distToCity: number; distToMagic: number }>();
  
  // Default city center and magic circle at map center
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  terrain.forEach((type, key) => {
    const [x, y] = key.split(',').map(Number);
    
    // Manhattan distance to center
    const distToCity = Math.max(0, Math.min(
      Math.abs(x - centerX),
      Math.abs(y - centerY)
    ));
    
    // Magic circle at same position as city center
    const distToMagic = distToCity;

    result.set(key, { distToCity, distToMagic });
  });

  return result;
}

/**
 * Generates the complete TileMap XML (Terrain + Flags ONLY)
 * Buildings are exported separately via exportBuildingsToXml()
 * 
 * Format matches LastSpellMapMod ExampleMap_TileMap.txt:
 * - XML declaration: <?xml version="1.0" encoding="utf-8"?>
 * - Ground tiles: <TerrainType>X,Y,DistCity,DistMagic</TerrainType>
 * - Flags: <FlagType>X,Y</FlagType>
 * - Buildings are NOT included (handled by separate Buildings.xml)
 */
export function exportTileMap(
  width: number,
  height: number,
  terrain: Map<string, TerrainType>,
  flags: Map<string, Array<[number, number]>>
): string {
  const xmlParts: string[] = [];

  // XML declaration (UTF-8)
  xmlParts.push('<?xml version="1.0" encoding="utf-8"?>');
  xmlParts.push('<TileMap>');

  // Map dimensions
  xmlParts.push('  <Width>' + width + '</Width>');
  xmlParts.push('  <Height>' + height + '</Height>');

  // Grounds section - terrain data
  xmlParts.push('  <Grounds>');

  if (terrain.size > 0) {
    // Compute distances for all terrain tiles
    const distances = computeTerrainDistances(terrain, width, height);

    // Group terrain by type
    const terrainByType: Record<string, string[]> = {
      Crater: [],
      Dirt: [],
      Stone: [],
      Empty: [],
      // Support additional types from game data
      Ground: [],
      CityTile: [],
      MagicCircle: [],
    };

  terrain.forEach((type, key) => {
      const dist = distances.get(key) || { distToCity: 0, distToMagic: 0 };
      const [x, y] = key.split(',').map(Number);
      const tileStr = `${x},${y},${dist.distToCity},${dist.distToMagic}`;
      
      if (terrainByType[type]) {
        terrainByType[type].push(tileStr);
      } else {
        // Handle unknown terrain types
        terrainByType[type] = [tileStr];
      }
    });

    // Output each terrain type (sort keys for consistent output)
    const sortedTypes = Object.keys(terrainByType).filter(t => terrainByType[t].length > 0).sort();
    for (const type of sortedTypes) {
      const tiles = terrainByType[type];
      if (tiles.length > 0) {
        xmlParts.push(`    <${type}>${tiles.join('|')}</${type}>`);
      }
    }
  }

  xmlParts.push('  </Grounds>');

  // Flags section
  xmlParts.push('  <Flags>');

  if (flags.size > 0) {
    // Sort flag types for consistent output
    const sortedFlagTypes = Array.from(flags.keys()).sort();
    for (const flagType of sortedFlagTypes) {
      const positions = flags.get(flagType)!;
      if (positions.length > 0) {
        // Sort positions: Y ascending, X ascending
        const sorted = [...positions].sort((a, b) => {
          if (a[1] !== b[1]) return a[1] - b[1];
          return a[0] - b[0];
        });
        const coordStr = sorted.map(p => `${p[0]},${p[1]}`).join('|');
        xmlParts.push(`    <${flagType}>${coordStr}</${flagType}>`);
      }
    }
  }

  xmlParts.push('  </Flags>');

  // NOTE: Buildings are NOT included in TileMap.xml
  // The game handles buildings separately via Buildings.xml or runtime creation

  xmlParts.push('</TileMap>');

  return xmlParts.join('\n');
}

/**
 * Generates separate Buildings XML (standalone file)
 * Format: <Buildings><Building Id="..." X="..." Y="..." Health="..."/></Buildings>
 * 
 * Attributes (NOT child elements):
 * - Id: Required - Building blueprint ID
 * - X: Required - X coordinate (anchor point)
 * - Y: Required - Y coordinate (anchor point)
 * - Health: Optional - Building health points
 */
export function exportBuildingsToXml(buildings: Building[]): string {
  const xmlParts: string[] = [];

  xmlParts.push('<?xml version="1.0" encoding="utf-8"?>');
  xmlParts.push('<Buildings>');

  for (const building of buildings) {
    const attrs = [
      `Id="${escapeXml(building.id)}"`,
      `X="${building.x}"`,
      `Y="${building.y}"`,
    ];

    // Add Health attribute only if defined and >= 0
    if (building.health !== undefined && building.health !== null && building.health >= 0) {
      attrs.push(`Health="${building.health}"`);
    }

    xmlParts.push(`  <Building ${attrs.join(' ')} />`);
  }

  xmlParts.push('</Buildings>');

  return xmlParts.join('\n');
}

/**
 * Generates XML for flags including zone flags with SizeX/SizeY
 * This is an alternative format if needed separately
 */
export function exportFlagsToXml(flags: TileFlag[]): string {
  const xmlParts: string[] = [];

  xmlParts.push('<?xml version="1.0" encoding="utf-8"?>');
  xmlParts.push('<Flags>');

  for (const flag of flags) {
    xmlParts.push('  <Flag>');
    xmlParts.push(`    <Type>${escapeXml(flag.flagType)}</Type>`);
    xmlParts.push(`    <X>${flag.x}</X>`);
    xmlParts.push(`    <Y>${flag.y}</Y>`);

    if (isZoneFlag(flag.flagType)) {
      xmlParts.push('    <SizeX>1</SizeX>');
      xmlParts.push('    <SizeY>1</SizeY>');
    }

    if (flag.value !== undefined && flag.value !== null) {
      xmlParts.push(`    <Value>${escapeXml(flag.value)}</Value>`);
    }

    xmlParts.push('  </Flag>');
  }

  xmlParts.push('</Flags>');

  return xmlParts.join('\n');
}

/**
 * Saves all map data as a single TileMap XML file
 * Includes terrain and flags (buildings are NOT included)
 * Downloads as {mapName}_TileMap.xml
 */
export function saveMapAsTileMap(
  width: number,
  height: number,
  terrain: Map<string, TerrainType>,
  flags: Map<string, Array<[number, number]>>,
  mapName: string = 'CustomMap'
): void {
  const xmlContent = exportTileMap(width, height, terrain, flags);
  triggerDownload(xmlContent, `${mapName}_TileMap.xml`);
}

/**
 * Saves buildings as a separate Buildings XML file
 * Downloads as {mapName}_Buildings.xml
 */
export function saveBuildings(buildings: Building[], mapName: string = 'CustomMap'): void {
  const xmlContent = exportBuildingsToXml(buildings);
  triggerDownload(xmlContent, `${mapName}_Buildings.xml`);
}

/**
 * Triggers browser download with UTF-8 encoding
 * UTF-8 is used by the Mod tool (File.ReadAllText defaults to system encoding, typically UTF-8)
 */
export function triggerDownload(content: string, filename: string): void {
  const encoded = new TextEncoder().encode(content);
  const blob = new Blob([encoded], { type: 'application/xml; charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Escapes special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Checks if a flag type is a zone flag
 */
function isZoneFlag(flagType: string): boolean {
  return flagType.startsWith('Zone_');
}

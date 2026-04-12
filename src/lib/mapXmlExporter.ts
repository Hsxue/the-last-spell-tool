/**
 * Map XML Exporter - Complete export functionality for The Last Spell map data
 * Exports map data in game-compatible XML format
 */

import type { Building, TerrainType, TileFlag } from '../types/map';

/**
 * Generates XML string for building entries in TileMap format
 * @param buildings - Array of buildings to include in TileMap
 * @returns XML string fragment for Buildings section (without xml declaration)
 */
function exportBuildingsXmlFragment(buildings: Building[]): string {
  if (buildings.length === 0) return '';

  const lines: string[] = [];
  lines.push('<Buildings>');

  for (const building of buildings) {
    const healthElement = building.health !== undefined && building.health !== null && building.health >= 0
      ? `<Health>${building.health}</Health>`
      : '';

    lines.push(`  <Building Id="${escapeXml(building.id)}" X="${building.x}" Y="${building.y}">${healthElement}</Building>`);
  }

  lines.push('</Buildings>');
  return lines.join('\n');
}

/**
 * Generates the complete TileMap XML
 * @param width - Map width
 * @param height - Map height
 * @param terrain - Map<string, TerrainType> - terrain data by "x,y" key
 * @param buildings - Array of buildings
 * @param flags - Map<string, Array<[number, number]>> - flags by type
 * @returns Complete TileMap XML string
 */
export function exportTileMap(
  width: number,
  height: number,
  terrain: Map<string, TerrainType>,
  buildings: Building[],
  flags: Map<string, Array<[number, number]>>
): string {
  const xmlParts: string[] = [];

  // XML declaration
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push(`<TileMap>`);

  // Map dimensions
  xmlParts.push('  <Width>' + width + '</Width>');
  xmlParts.push('  <Height>' + height + '</Height>');

  // Grounds section - terrain data
  xmlParts.push('  <Grounds>');

  // Group terrain by type
  const terrainByType: Record<TerrainType, string[]> = {
    Crater: [],
    Dirt: [],
    Stone: [],
    Empty: [],
  };

  terrain.forEach((type, key) => {
    if (terrainByType[type]) {
      terrainByType[type].push(key);
    }
  });

  // Output each terrain type
  for (const type of (['Crater', 'Dirt', 'Stone', 'Empty'] as TerrainType[])) {
    const coords = terrainByType[type];
    if (coords.length > 0) {
      // Sort coordinates for consistent output
      coords.sort((a, b) => {
        const [ax, ay] = a.split(',').map(Number);
        const [bx, by] = b.split(',').map(Number);
        if (ay !== by) return ay - by; // Sort by Y descending (as in game files)
        return ax - bx; // Then by X
      });
      xmlParts.push(`    <${type}>${coords.join('|')}</${type}>`);
    }
  }

  xmlParts.push('  </Grounds>');

  // Flags section
  xmlParts.push('  <Flags>');

  // Sort flag types for consistent output
  const sortedFlagTypes = Array.from(flags.keys()).sort();
  for (const flagType of sortedFlagTypes) {
    const positions = flags.get(flagType)!;
    if (positions.length > 0) {
      // Sort positions same as terrain
      const sorted = positions.sort((a, b) => {
        if (a[1] !== b[1]) return a[1] - b[1];
        return a[0] - b[0];
      });
      const coordStr = sorted.map(p => `${p[0]},${p[1]}`).join('|');
      xmlParts.push(`    <${flagType}>${coordStr}</${flagType}>`);
    }
  }

  xmlParts.push('  </Flags>');

  // Buildings section (optional - can be separate or included)
  const buildingsXml = exportBuildingsXmlFragment(buildings);
  if (buildingsXml) {
    // Re-indent buildings section
    const indented = buildingsXml.split('\n').map(line => '  ' + line).join('\n');
    xmlParts.push(indented);
  }

  xmlParts.push('</TileMap>');

  return xmlParts.join('\n');
}

/**
 * Generates separate Buildings XML (standalone file)
 * @param buildings - Array of buildings to export
 * @returns XML string with UTF-8 declaration
 */
export function exportBuildingsToXml(buildings: Building[]): string {
  const xmlParts: string[] = [];

  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<Buildings>');

  for (const building of buildings) {
    const healthElement = building.health !== undefined && building.health !== null && building.health >= 0
      ? `<Health>${building.health}</Health>`
      : '';

    xmlParts.push(`  <Building Id="${escapeXml(building.id)}" X="${building.x}" Y="${building.y}">${healthElement}</Building>`);
  }

  xmlParts.push('</Buildings>');

  return xmlParts.join('\n');
}

/**
 * Generates XML string for flags including zone flags with SizeX/SizeY (standalone format)
 * @param flags - Array of flags to export
 * @returns XML string with UTF-8 declaration
 */
export function exportFlagsToXml(flags: TileFlag[]): string {
  const xmlParts: string[] = [];

  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<Flags>');

  for (const flag of flags) {
    xmlParts.push('  <Flag>');
    xmlParts.push(`    <Type>${escapeXml(flag.flagType)}</Type>`);
    xmlParts.push(`    <X>${flag.x}</X>`);
    xmlParts.push(`    <Y>${flag.y}</Y>`);

    // Zone flags need SizeX and SizeY
    if (isZoneFlag(flag.flagType)) {
      xmlParts.push('    <SizeX>1</SizeX>');
      xmlParts.push('    <SizeY>1</SizeY>');
    }

    // Include Value if defined
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
 * Includes terrain, flags, and buildings
 * @param width - Map width
 * @param height - Map height
 * @param terrain - Terrain data
 * @param buildings - Buildings data
 * @param flags - Flags data
 */
export function saveMapAsTileMap(
  width: number,
  height: number,
  terrain: Map<string, TerrainType>,
  buildings: Building[],
  flags: Map<string, Array<[number, number]>>
): void {
  const xmlContent = exportTileMap(width, height, terrain, buildings, flags);
  triggerDownload(xmlContent, 'TileMap.xml');
}

/**
 * Saves buildings as a separate Buildings XML file
 * @param buildings - Buildings data
 */
export function saveBuildings(buildings: Building[]): void {
  const xmlContent = exportBuildingsToXml(buildings);
  triggerDownload(xmlContent, 'Buildings.xml');
}

/**
 * Triggers browser download with UTF-16 encoding (game format)
 * @param content - XML content to download
 * @param filename - Filename for the download
 */
export function triggerDownload(content: string, filename: string): void {
  // UTF-16 BOM + content encoded as UTF-16LE
  const bom = new Uint8Array([0xFF, 0xFE]); // UTF-16 LE BOM
  const encoded = new Uint16Array(content.length);

  for (let i = 0; i < content.length; i++) {
    encoded[i] = content.charCodeAt(i);
  }

  const blob = new Blob([bom, encoded], { type: 'text/xml;charset=utf-16' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  URL.revokeObjectURL(url);
}

/**
 * Escapes special XML characters
 * @param text - Text to escape
 * @returns Escaped text safe for XML
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
 * @param flagType - The flag type to check
 * @returns True if zone flag, false otherwise
 */
function isZoneFlag(flagType: string): boolean {
  return flagType.startsWith('Zone_');
}

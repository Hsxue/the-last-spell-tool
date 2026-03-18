/**
 * XML Exporter for Buildings and Flags
 * Exports map data in game-compatible XML format matching BuildingDefinitions.txt structure
 */

import type { Building, TileFlag } from '../types/map';

/**
 * Generates XML string for buildings with Id, X, Y, Health
 * @param buildings - Array of buildings to export
 * @returns XML string with UTF-8 declaration
 */
export function exportBuildingsToXml(buildings: Building[]): string {
  const xmlParts: string[] = [];
  
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<Buildings>');
  
  for (const building of buildings) {
    xmlParts.push('  <Building>');
    xmlParts.push(`    <Id>${escapeXml(building.id)}</Id>`);
    xmlParts.push(`    <X>${building.x}</X>`);
    xmlParts.push(`    <Y>${building.y}</Y>`);
    
    // Include Health only if defined and >= 0
    if (building.health !== undefined && building.health !== null && building.health >= 0) {
      xmlParts.push(`    <Health>${building.health}</Health>`);
    }
    
    xmlParts.push('  </Building>');
  }
  
  xmlParts.push('</Buildings>');
  
  return xmlParts.join('\n');
}

/**
 * Generates XML string for flags including zone flags with SizeX/SizeY
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
 * Triggers browser download with UTF-16 encoding
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

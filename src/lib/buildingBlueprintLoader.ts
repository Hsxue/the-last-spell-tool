/**
 * XML Parser for Building Definitions
 * Utility for parsing BuildingDefinitions.txt XML format into ExtendedBuildingBlueprint objects
 */

import type { BuildingBlueprint, BuildingCategory } from '../types/map';

// Define an extended interface that includes category info along with the blueprint data
interface ExtendedBuildingBlueprint extends BuildingBlueprint {
  id: string;
  category: BuildingCategory;
}

/**
 * Maps XML categories from the source data to standardized BuildingCategory values
 */
const XML_CATEGORY_MAP: Record<string, BuildingCategory> = {
  Wall: 'Wall',
  Walls: 'Wall',
  WallTowers: 'Wall',
  Trap: 'Trap',
  Traps: 'Trap',
  Tower: 'Tower',
  Towers: 'Tower',
  Seed: 'Seed',
  Seeds: 'Seed',
  Building: 'Building',
  Buildings: 'Building',
  Resource: 'Resource',
  Resources: 'Resource',
  Container: 'Container',
  Containers: 'Container',
  Ruin: 'Ruins',
  Ruins: 'Ruins',
  Decor: 'Decor',
  Decoration: 'Decor',
  Decorations: 'Decor',
  Corrupted: 'Corrupted',
  Corruptions: 'Corrupted',
  Brazier: 'Brazier',
  Braziers: 'Brazier',
  Special: 'Special',
};

/**
 * Parses the BuildingDefinitions.txt XML format into ExtendedBuildingBlueprint objects
 * @param xml - XML string containing building definitions
 * @returns Array of building blueprints with categories
 */
function parseBuildingDefinitions(xml: string): ExtendedBuildingBlueprint[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  
  const buildingElements = doc.querySelectorAll('BuildingDefinition');
  const blueprints: ExtendedBuildingBlueprint[] = [];

  buildingElements.forEach(buildingElement => {
    const id = buildingElement.getAttribute('Id') || '';
    
    const blueprintElement = buildingElement.querySelector('Blueprint');
    if (!blueprintElement) {
      console.warn(`No Blueprint element found for building ${id}`);
      return;
    }

    const tilesElement = blueprintElement.querySelector('Tiles');
    if (!tilesElement) {
      console.warn(`No Tiles element found for building ${id}`);
      return;
    }

    const originX = parseInt(tilesElement.getAttribute('OriginX') || '0', 10);
    const originY = parseInt(tilesElement.getAttribute('OriginY') || '0', 10);

    // Extract and process tile grid from text content
    const tileGridText = tilesElement.textContent || '';
    const tilesRaw = tileGridText.split('\n').map(row => row.trim()).filter(row => row);
    const tiles: string[][] = tilesRaw.map(row => row.split('').slice(0, 10)); // limit to 10 chars per row

    // Get category from Category element or attribute
    let xmlCategory = '';
    const categoryElement = blueprintElement.querySelector('Category');
    if (categoryElement) {
      xmlCategory = categoryElement.textContent?.trim() || '';
    } else {
      // Fallback to looking for category as an attribute or other methods
      xmlCategory = buildingElement.getAttribute('Category') || '';
    }

    // Map the XML category to standardized BuildingCategory
    let category: BuildingCategory = 'Building'; // default fallback
    if (xmlCategory && XML_CATEGORY_MAP[xmlCategory]) {
      category = XML_CATEGORY_MAP[xmlCategory];
    } else {
      // Default assignment based on ID patterns if no direct mapping found
      if (id.toLowerCase().includes('trap')) category = 'Trap';
      else if (id.toLowerCase().includes('wall') || id.toLowerCase().includes('gate')) category = 'Wall';
      else if (id.toLowerCase().includes('tower') || id.toLowerCase().includes('ballista') || id.toLowerCase().includes('watchtower')) category = 'Tower';
      else if (id.toLowerCase().includes('seed') || id.toLowerCase().includes('teleporter')) category = 'Building';
    }

    const blueprint: ExtendedBuildingBlueprint = {
      id,
      tiles,
      originX,
      originY,
      category
    };

    blueprints.push(blueprint);
  });

  return blueprints;
}

// Store parsed blueprints globally to avoid repeated parsing
let cachedBlueprints: ExtendedBuildingBlueprint[] | null = null;

/**
 * Returns building blueprints filtered by category
 * @param category - Building category to filter by
 * @returns Array of building blueprints matching the category
 */
function getBlueprintsByCategory(category: BuildingCategory): ExtendedBuildingBlueprint[] {
  if (!cachedBlueprints) {
    throw new Error('Building blueprints not loaded. Call parseBuildingDefinitions first.');
  }
  return cachedBlueprints.filter(bp => bp.category === category);
}

/**
 * Loads building blueprints from XML and caches them for fast category filtering
 * @param xml - XML string containing building definitions
 */
function loadBlueprintsFromXML(xml: string): void {
  cachedBlueprints = parseBuildingDefinitions(xml);
}

export { parseBuildingDefinitions, getBlueprintsByCategory, loadBlueprintsFromXML };
export type { ExtendedBuildingBlueprint };
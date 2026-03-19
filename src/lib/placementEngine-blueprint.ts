/**
 * Building placement engine with blueprint-based collision detection
 * Uses actual building tile shapes from blueprints, not bounding boxes
 */

import { BUILDING_BLUEPRINTS } from '../data/buildingBlueprints';

// Types
export interface Position {
  x: number;
  y: number;
}

export interface PlacedBuilding {
  id: string;
  x: number;
  y: number;
  health?: number;
}

export interface MapDimensions {
  width: number;
  height: number;
}

export interface PlacementResult {
  valid: boolean;
  reason?: string;
  occupiedTiles?: Array<[number, number]>;
}

/**
 * Get the blueprint for a building by ID
 */
function getBlueprint(buildingId: string) {
  return BUILDING_BLUEPRINTS.find(bp => bp.id === buildingId);
}

/**
 * Gets all occupied tile positions for a building based on its blueprint
 * @param buildingId - The building blueprint ID
 * @param positionX - The X coordinate where the building is placed (anchor point)
 * @param positionY - The Y coordinate where the building is placed (anchor point)
 * @returns Array of [x, y] tuples representing occupied tiles
 */
export function getOccupiedTiles(
  buildingId: string,
  positionX: number,
  positionY: number
): Array<[number, number]> {
  const blueprint = getBlueprint(buildingId);
  if (!blueprint) return [];

  const tiles: [number, number][] = [];
  const baseX = positionX - blueprint.originX;
  const baseY = positionY - blueprint.originY;

  blueprint.tiles.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== '_') {
        tiles.push([baseX + colIndex, baseY + rowIndex]);
      }
    });
  });

  return tiles;
}

/**
 * Checks if a building can be placed at the specified position
 * @param buildingId - The building blueprint ID to place
 * @param positionX - The X coordinate where the building is placed (anchor point)
 * @param positionY - The Y coordinate where the building is placed (anchor point)
 * @param mapDimensions - Map dimensions for boundary checking
 * @param existingBuildings - Array of already placed buildings
 * @returns PlacementResult with valid status and optional reason
 */
export function canPlaceBuilding(
  buildingId: string,
  positionX: number,
  positionY: number,
  mapDimensions: MapDimensions,
  existingBuildings: PlacedBuilding[] = []
): PlacementResult {
  // Get the blueprint and occupied tiles
  const blueprint = getBlueprint(buildingId);
  if (!blueprint) {
    return {
      valid: false,
      reason: `Unknown building type: ${buildingId}`,
    };
  }

  const occupiedTiles = getOccupiedTiles(buildingId, positionX, positionY);
  
  if (occupiedTiles.length === 0) {
    return {
      valid: false,
      reason: 'Building has no valid tiles',
    };
  }

  // Check if all tiles are within map bounds
  for (const [x, y] of occupiedTiles) {
    if (x < 0 || x >= mapDimensions.width || y < 0 || y >= mapDimensions.height) {
      return {
        valid: false,
        reason: `Building extends beyond map boundaries at (${x}, ${y})`,
      };
    }
  }

  // Check collision with existing buildings
  const occupiedSet = getAllOccupiedTiles(existingBuildings);
  
  for (const [x, y] of occupiedTiles) {
    if (occupiedSet.has(`${x},${y}`)) {
      return {
        valid: false,
        reason: `Building collides with existing structure at (${x}, ${y})`,
      };
    }
  }

  // Valid placement if within bounds and no collisions
  return { 
    valid: true,
    occupiedTiles,
  };
}

/**
 * Collects all occupied tiles from multiple placed buildings into a Set for O(1) lookups
 * @param buildings Array of placed buildings
 * @returns Set of "x,y" strings representing all occupied tiles
 */
export function getAllOccupiedTiles(buildings: PlacedBuilding[]): Set<string> {
  const occupiedSet = new Set<string>();
  
  for (const building of buildings) {
    const tiles = getOccupiedTiles(building.id, building.x, building.y);
    for (const [x, y] of tiles) {
      occupiedSet.add(`${x},${y}`);
    }
  }
  
  return occupiedSet;
}

/**
 * Gets preview data for a building placement attempt
 * @param buildingId - The building blueprint ID
 * @param positionX - The X coordinate for preview
 * @param positionY - The Y coordinate for preview
 * @param mapDimensions - Map dimensions
 * @param existingBuildings - Existing buildings for collision check
 * @returns Object with tiles, color (green/red), and validity status
 */
export function getBuildingPreviewData(
  buildingId: string,
  positionX: number,
  positionY: number,
  mapDimensions: MapDimensions,
  existingBuildings: PlacedBuilding[] = []
): {
  tiles: Array<[number, number]>;
  color: string;
  isInvalid: boolean;
  reason?: string;
} {
  const result = canPlaceBuilding(buildingId, positionX, positionY, mapDimensions, existingBuildings);
  
  return {
    tiles: result.occupiedTiles || [],
    color: result.valid ? '#4CAF50' : '#ff4444', // Green if valid, red if invalid
    isInvalid: !result.valid,
    reason: result.reason,
  };
}

/**
 * Get building dimensions from blueprint
 */
export function getBuildingDimensions(buildingId: string): { width: number; height: number } | null {
  const blueprint = getBlueprint(buildingId);
  if (!blueprint) return null;
  
  return {
    width: blueprint.tiles[0]?.length || 0,
    height: blueprint.tiles.length,
  };
}

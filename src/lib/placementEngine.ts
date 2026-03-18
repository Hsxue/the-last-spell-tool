/**
 * Building placement engine with pure functions for validation, collision detection,
 * and placement preview rendering.
 */

// Types
interface Position {
  x: number;
  y: number;
}

interface Building {
  position: Position;
  width: number;
  height: number;
  // Add other building properties as needed
}

interface MapData {
  width: number;
  height: number;
}

interface PlacementResult {
  valid: boolean;
  reason?: string;
}

/**
 * Checks if a building can be placed at its current position.
 */
export function canPlaceBuilding(
  building: Building,
  mapData: MapData,
  existingBuildings: Building[] = []
): PlacementResult {
  const occupiedTiles = getOccupiedTiles(building);

  // Check if building is within map bounds
  for (const [x, y] of occupiedTiles) {
    if (!isWithinBounds(x, y, 1, 1, mapData.width, mapData.height)) {
      return {
        valid: false,
        reason: `Building extends beyond map boundaries at (${x}, ${y})`,
      };
    }
  }

  // Check collision with existing buildings
  if (checkCollision(building, existingBuildings)) {
    return {
      valid: false,
      reason: 'Building collides with existing structures',
    };
  }

  // Valid placement if within bounds and no collisions
  return { valid: true };
}

/**
 * Gets the array of tile coordinates that a building occupies.
 * @param building The building to check
 * @returns Array of [x, y] tuples representing occupied tiles
 */
export function getOccupiedTiles(building: Building): Array<[number, number]> {
  const tiles: [number, number][] = [];

  for (let x = building.position.x; x < building.position.x + building.width; x++) {
    for (let y = building.position.y; y < building.position.y + building.height; y++) {
      tiles.push([x, y]);
    }
  }

  return tiles;
}

/**
 * Checks if a rectangle is within map bounds.
 */
export function isWithinBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  mapWidth: number,
  mapHeight: number
): boolean {
  return (
    x >= 0 &&
    y >= 0 &&
    x + width <= mapWidth &&
    y + height <= mapHeight
  );
}

/**
 * Gets preview data for a building that may or may not be placable.
 */
export function getBuildingPreviewData(building: Building): {
  tiles: Array<[number, number]>;
  color: string;
  isInvalid: boolean;
} {
  const occupiedTiles = getOccupiedTiles(building);
  const isInvalid = false; // Basic implementation - in a real scenario, you'd validate here
  
  return {
    tiles: occupiedTiles,
    color: isInvalid ? '#ff4444' : '#44ff44', // Red if invalid, green if valid
    isInvalid,
  };
}

/**
 * Collects all occupied tiles from multiple buildings into a Set for O(1) lookups.
 * Optimized for batch operations with 500+ buildings.
 * @param buildings Array of buildings to collect tiles from
 * @returns Set of "x,y" strings representing all occupied tiles
 */
export function getAllOccupiedTiles(buildings: Building[]): Set<string> {
  const occupiedSet = new Set<string>();
  
  for (const building of buildings) {
    const tiles = getOccupiedTiles(building);
    for (const [x, y] of tiles) {
      occupiedSet.add(`${x},${y}`);
    }
  }
  
  return occupiedSet;
}

/**
 * Checks if a building collides with any existing buildings.
 * Optimized for performance with 500+ buildings using Set for O(1) lookups.
 */
export function checkCollision(
  building: Building,
  existingBuildings: Building[]
): boolean {
  // Early exit for empty arrays
  if (existingBuildings.length === 0) {
    return false;
  }

  // Get tiles of the current building
  const buildingTiles = getOccupiedTiles(building);
  
  // Create a Set of all occupied tiles from existing buildings for O(1) lookup
  const occupiedSet = getAllOccupiedTiles(existingBuildings);
  
  // Check if any of the building's tiles are already occupied
  for (const [x, y] of buildingTiles) {
    if (occupiedSet.has(`${x},${y}`)) {
      return true; // Collision detected
    }
  }

  return false; // No collision
}
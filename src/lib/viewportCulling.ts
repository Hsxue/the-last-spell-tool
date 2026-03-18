/**
 * Represents a viewport rectangle with x, y, width, and height properties.
 */
export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents a 2D position with x and y coordinates.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Calculates the range of visible tiles based on the viewport position and dimensions.
 * Includes a 2-tile safety margin around the visible area.
 * 
 * @param viewport - The current viewport rectangle
 * @param mapWidth - Total width of the map in pixels
 * @param mapHeight - Total height of the map in pixels
 * @param tileSize - Size of each tile in pixels
 * @returns Object containing minX, maxX, minY, maxY tile indices
 */
export function getVisibleTileRange(
  viewport: Viewport,
  mapWidth: number,
  mapHeight: number,
  tileSize: number
): { minX: number; maxX: number; minY: number; maxY: number } {
  // Calculate tile bounds without margin
  const minX = Math.floor(viewport.x / tileSize);
  const maxX = Math.floor((viewport.x + viewport.width) / tileSize);
  const minY = Math.floor(viewport.y / tileSize);
  const maxY = Math.floor((viewport.y + viewport.height) / tileSize);

  // Apply 2-tile safety margin
  const margin = 2;
  const range = {
    minX: Math.max(0, minX - margin),
    maxX: Math.min(Math.floor(mapWidth / tileSize), maxX + margin),
    minY: Math.max(0, minY - margin),
    maxY: Math.min(Math.floor(mapHeight / tileSize), maxY + margin)
  };

  return range;
}

/**
 * Checks if a specific tile is within the visible range.
 * 
 * @param tileX - X coordinate of the tile
 * @param tileY - Y coordinate of the tile
 * @param visibleRange - The visible tile range object with minX, maxX, minY, maxY
 * @returns Boolean indicating whether the tile is visible
 */
export function isTileVisible(
  tileX: number,
  tileY: number,
  visibleRange: { minX: number; maxX: number; minY: number; maxY: number }
): boolean {
  return (
    tileX >= visibleRange.minX &&
    tileX <= visibleRange.maxX &&
    tileY >= visibleRange.minY &&
    tileY <= visibleRange.maxY
  );
}

/**
 * Gets all visible tile keys from the terrain data based on the visible range.
 * Assumes the terrain object has tile data stored at [x][y] positions.
 * 
 * @param terrain - The terrain object with tile data organized by position
 * @param visibleRange - The visible tile range object with minX, maxX, minY, maxY
 * @returns Array of position keys for visible tiles
 */
export function getVisibleTileKeys(
  terrain: Record<string, any>,
  visibleRange: { minX: number; maxX: number; minY: number; maxY: number }
): string[] {
  const keys: string[] = [];
  
  for (let x = visibleRange.minX; x <= visibleRange.maxX; x++) {
    for (let y = visibleRange.minY; y <= visibleRange.maxY; y++) {
      const key = `${x},${y}`;
      if (terrain[key]) {
        keys.push(key);
      }
    }
  }
  
  return keys;
}

/**
 * Gets all visible grid lines based on the viewport and zoom level.
 * Applies zoom-based density filtering to reduce rendering overhead.
 * 
 * @param viewport - The current viewport in world coordinates
 * @param mapWidth - Total width of the map in tiles
 * @param mapHeight - Total height of the map in tiles
 * @param tileSize - Size of each tile in pixels
 * @param zoom - Current zoom level
 * @returns Object containing arrays of visible vertical and horizontal line positions
 */
export function getVisibleGridLines(
  viewport: Viewport,
  mapWidth: number,
  mapHeight: number,
  tileSize: number,
  zoom: number
): { verticalLines: number[]; horizontalLines: number[] } {
  // Zoom-based density filtering
  const GRID_ZOOM_HIDE_THRESHOLD = 0.2;
  const GRID_ZOOM_MAJOR_ONLY_THRESHOLD = 0.5;
  const GRID_MAJOR_LINE_STEP = 5;

  // Hide all grid lines when zoomed out too far
  if (zoom < GRID_ZOOM_HIDE_THRESHOLD) {
    return { verticalLines: [], horizontalLines: [] };
  }

  // Determine line step based on zoom level
  const lineStep = zoom < GRID_ZOOM_MAJOR_ONLY_THRESHOLD ? GRID_MAJOR_LINE_STEP : 1;

  // Calculate visible range in tile coordinates
  const minX = Math.floor(viewport.x / tileSize);
  const maxX = Math.floor((viewport.x + viewport.width) / tileSize);
  const minY = Math.floor(viewport.y / tileSize);
  const maxY = Math.floor((viewport.y + viewport.height) / tileSize);

  // Generate visible vertical line positions (with density filtering)
  const verticalLines: number[] = [];
  for (let x = 0; x <= mapWidth; x += lineStep) {
    if (x >= minX && x <= maxX) {
      verticalLines.push(x);
    }
  }

  // Generate visible horizontal line positions (with density filtering)
  const horizontalLines: number[] = [];
  for (let y = 0; y <= mapHeight; y += lineStep) {
    if (y >= minY && y <= maxY) {
      horizontalLines.push(y);
    }
  }

  return { verticalLines, horizontalLines };
}
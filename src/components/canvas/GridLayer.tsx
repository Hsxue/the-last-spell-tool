/**
 * GridLayer - Renders grid lines for the tile map
 * Provides visual reference for tile boundaries
 */

import { Line, Group } from 'react-konva';

// ============================================================================
// Constants
// ============================================================================

/** Size of each tile in pixels - must match TerrainLayer */
const TILE_SIZE = 20;

// ============================================================================
// Props Interface
// ============================================================================

interface GridLayerProps {
  /** Map width in tiles */
  width: number;
  /** Map height in tiles */
  height: number;
  /** Current zoom level for adaptive stroke width */
  zoom: number;
  /** Grid line color (default: rgba border color) */
  strokeColor?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STROKE_COLOR = 'rgba(148, 163, 184, 0.3)'; // slate-400 with opacity

/** Base stroke width in pixels - will be divided by zoom for consistent visibility */
const BASE_STROKE_WIDTH = 1;

// ============================================================================
// Main Component
// ============================================================================

export function GridLayer({
  width,
  height,
  zoom,
  strokeColor = DEFAULT_STROKE_COLOR,
}: GridLayerProps) {
  // Calculate stroke width based on zoom to maintain consistent visibility
  // At zoom=1, stroke should be visible (0.05 pixels minimum)
  // At higher zoom, stroke becomes thinner relative to the view
  const strokeWidth = Math.max(0.02, BASE_STROKE_WIDTH / zoom);
  // Generate vertical lines
  const verticalLines = [];
  for (let x = 0; x <= width; x++) {
    const xPos = x * TILE_SIZE;
    verticalLines.push(
      <Line
        key={`v-${x}`}
        points={[xPos, 0, xPos, height * TILE_SIZE]}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        perfectDrawEnabled={false}
        listening={false}
      />
    );
  }

  // Generate horizontal lines
  const horizontalLines = [];
  for (let y = 0; y <= height; y++) {
    const yPos = y * TILE_SIZE;
    horizontalLines.push(
      <Line
        key={`h-${y}`}
        points={[0, yPos, width * TILE_SIZE, yPos]}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        perfectDrawEnabled={false}
        listening={false}
      />
    );
  }

  return (
    <Group>
      {verticalLines}
      {horizontalLines}
    </Group>
  );
}

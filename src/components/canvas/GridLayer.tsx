/**
 * GridLayer - Renders grid lines for the tile map
 * Provides visual reference for tile boundaries
 */

import { Line, Group } from 'react-konva';

// ============================================================================
// Props Interface
// ============================================================================

interface GridLayerProps {
  /** Map width in tiles */
  width: number;
  /** Map height in tiles */
  height: number;
  /** Grid line color (default: rgba border color) */
  strokeColor?: string;
  /** Grid line width (default: 0.02 for visibility at different zooms) */
  strokeWidth?: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STROKE_COLOR = 'rgba(148, 163, 184, 0.3)'; // slate-400 with opacity
const DEFAULT_STROKE_WIDTH = 0.02;

// ============================================================================
// Main Component
// ============================================================================

export function GridLayer({
  width,
  height,
  strokeColor = DEFAULT_STROKE_COLOR,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: GridLayerProps) {
  // Generate vertical lines
  const verticalLines = [];
  for (let x = 0; x <= width; x++) {
    verticalLines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
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
    horizontalLines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
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

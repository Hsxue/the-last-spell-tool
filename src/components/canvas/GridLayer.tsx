/**
 * GridLayer - Renders grid lines for the tile map
 * Provides visual reference for tile boundaries
 * Features: viewport culling, zoom-based density filtering
 */

import { Line, Group } from 'react-konva';
import { useMemo } from 'react';
import React from 'react';
import { getVisibleGridLines, type Viewport } from '../../lib/viewportCulling';

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
  /** Current zoom level for adaptive stroke width and density filtering */
  zoom: number;
  /** Grid line color (default: rgba border color) */
  strokeColor?: string;
  /** Current viewport offset in screen coordinates */
  offsetX: number;
  /** Current viewport offset in screen coordinates */
  offsetY: number;
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

export const GridLayer = React.memo(function GridLayer({
  width,
  height,
  zoom,
  strokeColor = DEFAULT_STROKE_COLOR,
  offsetX,
  offsetY,
}: GridLayerProps) {
  // Calculate stroke width based on zoom to maintain consistent visibility
  const strokeWidth = Math.max(0.02, BASE_STROKE_WIDTH / zoom);

  // Convert screen-space offsets to world coordinates
  const viewport: Viewport = useMemo(() => ({
    x: -offsetX / zoom,
    y: -offsetY / zoom,
    width: window.innerWidth / zoom,
    height: window.innerHeight / zoom,
  }), [offsetX, offsetY, zoom]);

  // Calculate visible grid lines with zoom-based density filtering
  const { verticalLines, horizontalLines } = useMemo(() => {
    return getVisibleGridLines(viewport, width, height, TILE_SIZE, zoom);
  }, [viewport, width, height, zoom]);

  // Log rendering statistics in development mode
  if (import.meta.env.DEV) {
    const totalPossibleLines = (width + 1) + (height + 1);
    const renderedLines = verticalLines.length + horizontalLines.length;
    const reductionPercent = ((totalPossibleLines - renderedLines) / totalPossibleLines * 100).toFixed(1);
    console.log(`[GridLayer] Rendering ${renderedLines} / ${totalPossibleLines} lines (${reductionPercent}% reduction)`);
  }

  return (
    <Group>
      {/* Vertical grid lines */}
      {verticalLines.map((x) => (
        <Line
          key={`v-${x}`}
          points={[x * TILE_SIZE, 0, x * TILE_SIZE, height * TILE_SIZE]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          perfectDrawEnabled={false}
          listening={false}
        />
      ))}
      {/* Horizontal grid lines */}
      {horizontalLines.map((y) => (
        <Line
          key={`h-${y}`}
          points={[0, y * TILE_SIZE, width * TILE_SIZE, y * TILE_SIZE]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          perfectDrawEnabled={false}
          listening={false}
        />
      ))}
    </Group>
  );
});

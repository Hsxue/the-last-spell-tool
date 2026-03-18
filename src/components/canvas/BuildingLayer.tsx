/**
 * BuildingLayer - Renders buildings on the map with Konva
 * Phase 2 Task 4: Full building rendering and preview logic
 *
 * Features:
 * - Renders all building tiles with category colors
 * - Shows category markers (first 2 letters) when zoom >= 14
 * - Separate BuildingPreview component with React.memo for smooth rendering
 */

import { useMemo, memo } from 'react';
import { Rect, Text, Group, Circle } from 'react-konva';
import type { Building, ViewportState } from '../../types/map';
import { BUILDING_CATEGORY_COLORS } from '../../types/map';
import { BUILDING_BLUEPRINTS } from '../../data/buildingBlueprints';

// ============================================================================
// Props Interface
// ============================================================================

interface BuildingLayerProps {
  /** Array of buildings to render */
  buildings: Building[];
  /** Viewport state for coordinate transformation and culling */
  viewport: ViewportState;
}

// ============================================================================
// Constants
// ============================================================================

/** Size of each tile in pixels */
const TILE_SIZE = 20;

/** Zoom threshold for showing category markers */
const ZOOM_MARKER_THRESHOLD = 14;

/** Default opacity for building tiles */
const BUILDING_OPACITY = 0.85;

/** Preview opacity for ghost building */
const PREVIEW_OPACITY = 0.5;

/** Stroke width for building borders */
const STROKE_WIDTH = 1;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a lookup map for building blueprints by ID
 */
const blueprintLookup = new Map(BUILDING_BLUEPRINTS.map(bp => [bp.id, bp]));

/**
 * Get all occupied tile positions for a building based on its blueprint
 * Returns array of [worldX, worldY] positions
 */
function getBuildingTilePositions(
  building: Building,
  blueprint: typeof BUILDING_BLUEPRINTS[0]
): Array<[number, number]> {
  const positions: Array<[number, number]> = [];

  const baseX = building.x - blueprint.originX;
  const baseY = building.y - blueprint.originY;

  blueprint.tiles.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== '_') {
        positions.push([baseX + colIndex, baseY + rowIndex]);
      }
    });
  });

  return positions;
}

// ============================================================================
// Global Ref for BuildingPreview
// ============================================================================

export const buildingPreviewHoveredTileRef = {
  current: null as { x: number; y: number } | null
};

// ============================================================================
// Main Component (memoized to prevent re-renders)
// ============================================================================

export const BuildingLayer = memo(function BuildingLayer({ buildings, viewport }: BuildingLayerProps) {
  const buildingElements = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const showMarkers = viewport.zoom >= ZOOM_MARKER_THRESHOLD;

    buildings.forEach((building) => {
      const blueprint = blueprintLookup.get(building.id);
      if (!blueprint) return;

      const color = BUILDING_CATEGORY_COLORS[blueprint.category] || BUILDING_CATEGORY_COLORS.Building;
      const positions = getBuildingTilePositions(building, blueprint);

      const baseX = building.x - blueprint.originX;
      const baseY = building.y - blueprint.originY;
      const tileWidth = blueprint.tiles[0]?.length || 1;
      const tileHeight = blueprint.tiles.length;

      positions.forEach(([tileX, tileY]) => {
        elements.push(
          <Rect
            key={`building-${building.x}-${building.y}-${building.id}-${tileX}-${tileY}`}
            x={tileX * TILE_SIZE}
            y={tileY * TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill={color}
            opacity={BUILDING_OPACITY}
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth={STROKE_WIDTH}
            perfectDrawEnabled={false}
            listening={false}
          />
        );
      });

      if (showMarkers) {
        const marker = blueprint.category.slice(0, 2).toUpperCase();
        elements.push(
          <Text
            key={`marker-${building.x}-${building.y}-${building.id}`}
            x={baseX * TILE_SIZE}
            y={baseY * TILE_SIZE}
            width={tileWidth * TILE_SIZE}
            height={tileHeight * TILE_SIZE}
            text={marker}
            fontSize={Math.min(TILE_SIZE * 0.5, 12)}
            fontFamily="sans-serif"
            fill="white"
            align="center"
            verticalAlign="middle"
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      }
    });

    return elements;
  }, [buildings, viewport.zoom]);

  return (
    <Group>
      {buildingElements}
    </Group>
  );
});

// ============================================================================
// Preview Component (memoized, reads from ref)
// ============================================================================

export const BuildingPreview = memo(function BuildingPreview() {
  const hoveredTile = buildingPreviewHoveredTileRef.current;
  
  if (!hoveredTile) return null;

  // Preview will be rendered by react-konva when this component renders
  // The ref update triggers parent re-render which causes this to render
  const color = '#4CAF50'; // Default preview color
  const baseX = hoveredTile.x;
  const baseY = hoveredTile.y;

  return (
    <Group listening={false}>
      <Rect
        x={baseX * TILE_SIZE}
        y={baseY * TILE_SIZE}
        width={TILE_SIZE}
        height={TILE_SIZE}
        fill={color}
        opacity={PREVIEW_OPACITY}
        stroke="#FFD700"
        strokeWidth={2}
        perfectDrawEnabled={false}
        listening={false}
      />
      <Circle
        x={baseX * TILE_SIZE + TILE_SIZE / 2}
        y={baseY * TILE_SIZE + TILE_SIZE / 2}
        radius={4}
        fill="white"
        stroke="black"
        strokeWidth={1}
        perfectDrawEnabled={false}
        listening={false}
      />
    </Group>
  );
});

// ============================================================================
// Exports
// ============================================================================

export type { BuildingLayerProps };

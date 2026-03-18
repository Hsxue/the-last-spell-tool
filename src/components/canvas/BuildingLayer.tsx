/**
 * BuildingLayer - Renders buildings on the map with Konva
 * Phase 2 Task 4: Full building rendering and preview logic
 *
 * Features:
 * - Renders all building tiles with category colors
 * - Shows category markers (first 2 letters) when zoom >= 14
 * - Displays semi-transparent preview for selected building at cursor
 * - White origin point marker on preview
 * - Yellow border for valid placement, red for invalid
 * - Viewport culling for performance
 */

import { useMemo, useRef, useEffect } from 'react';
import { Rect, Text, Group, Circle } from 'react-konva';
import type { Group as KonvaGroup } from 'konva/lib/Group';
import type { Building, ViewportState } from '../../types/map';
import { BUILDING_CATEGORY_COLORS } from '../../types/map';
import { BUILDING_BLUEPRINTS } from '../../data/buildingBlueprints';
import { useMapStore } from '../../store/mapStore';
import { getVisibleTileRange, isTileVisible } from '../../lib/viewportCulling';

// ============================================================================
// Props Interface
// ============================================================================

interface BuildingLayerProps {
  /** Array of buildings to render */
  buildings: Building[];
  /** Viewport state for coordinate transformation and culling */
  viewport: ViewportState;
  /** Map dimensions */
  width: number;
  height: number;
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

  // Calculate the top-left corner of the building in world coordinates
  // building.x, building.y is the origin position
  const baseX = building.x - blueprint.originX;
  const baseY = building.y - blueprint.originY;

  // Iterate through the tiles grid
  blueprint.tiles.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== '_') { // '_' represents empty space
        positions.push([baseX + colIndex, baseY + rowIndex]);
      }
    });
  });

  return positions;
}

/**
 * Check if a building placement is valid (within bounds and not colliding)
 */
function isPlacementValid(
  buildingX: number,
  buildingY: number,
  blueprint: typeof BUILDING_BLUEPRINTS[0],
  width: number,
  height: number,
  occupiedTiles: Set<string>
): boolean {
  const baseX = buildingX - blueprint.originX;
  const baseY = buildingY - blueprint.originY;

  // Check all tiles of the building
  for (let rowIndex = 0; rowIndex < blueprint.tiles.length; rowIndex++) {
    for (let colIndex = 0; colIndex < blueprint.tiles[rowIndex].length; colIndex++) {
      const cell = blueprint.tiles[rowIndex][colIndex];
      if (cell === '_') continue; // Skip empty cells

      const tileX = baseX + colIndex;
      const tileY = baseY + rowIndex;

      // Check bounds
      if (tileX < 0 || tileX >= width || tileY < 0 || tileY >= height) {
        return false;
      }

      // Check collision with existing buildings
      if (occupiedTiles.has(`${tileX},${tileY}`)) {
        return false;
      }
    }
  }

  return true;
}

// ============================================================================
// Main Component
// ============================================================================

export function BuildingLayer({ buildings, viewport, width, height }: BuildingLayerProps) {
  // Ref for caching the static building layer
  const buildingsRef = useRef<KonvaGroup>(null);

  // Get editor state from store
  const {
    editorMode,
    selectedBuilding,
    hoveredTile,
    showBuildingPreview,
  } = useMapStore();

  // Get occupied tiles for collision detection
  const occupiedTiles = useMemo(() => {
    const occupied = new Set<string>();
    buildings.forEach((building) => {
      const blueprint = blueprintLookup.get(building.id);
      if (blueprint) {
        const positions = getBuildingTilePositions(building, blueprint);
        positions.forEach(([x, y]) => {
          occupied.add(`${x},${y}`);
        });
      } else {
        // Fallback for buildings without blueprint
        occupied.add(`${building.x},${building.y}`);
      }
    });
    return occupied;
  }, [buildings]);

  /**
   * Calculate visible tile range based on viewport
   */
  const visibleRange = useMemo(() => {
    const viewportPixels = {
      x: -viewport.offsetX / viewport.zoom,
      y: -viewport.offsetY / viewport.zoom,
      width: window.innerWidth / viewport.zoom,
      height: window.innerHeight / viewport.zoom,
    };

    return getVisibleTileRange(
      viewportPixels,
      width * TILE_SIZE,
      height * TILE_SIZE,
      TILE_SIZE
    );
  }, [viewport.offsetX, viewport.offsetY, viewport.zoom, width, height]);

  /**
   * Memoized building rendering elements
   * Uses viewport culling to only render visible buildings
   */
  const buildingElements = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const showMarkers = viewport.zoom >= ZOOM_MARKER_THRESHOLD;

    buildings.forEach((building) => {
      const blueprint = blueprintLookup.get(building.id);
      if (!blueprint) return;

      const color = BUILDING_CATEGORY_COLORS[blueprint.category] || BUILDING_CATEGORY_COLORS.Building;
      const positions = getBuildingTilePositions(building, blueprint);

      // Check if any tile of this building is visible
      const isVisible = positions.some(([x, y]) =>
        isTileVisible(x, y, visibleRange)
      );

      if (!isVisible) return;

      // Calculate building bounds for marker positioning
      const baseX = building.x - blueprint.originX;
      const baseY = building.y - blueprint.originY;
      const tileWidth = blueprint.tiles[0]?.length || 1;
      const tileHeight = blueprint.tiles.length;

      // Render each tile of the building
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

      // Show category marker at building origin when zoomed in
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
  }, [buildings, visibleRange, viewport.zoom]);

  /**
   * Memoize placement validation with minimal dependencies to avoid
   * recalculation on every mouse move
   */
  const placementValidation = useMemo(() => {
    if (!showBuildingPreview || editorMode !== 'building' || !selectedBuilding || !hoveredTile) {
      return null;
    }

    const blueprint = blueprintLookup.get(selectedBuilding);
    if (!blueprint) return null;

    return {
      isValid: isPlacementValid(
        hoveredTile.x,
        hoveredTile.y,
        blueprint,
        width,
        height,
        occupiedTiles
      ),
      blueprint
    };
  }, [showBuildingPreview, editorMode, selectedBuilding, hoveredTile?.x, hoveredTile?.y, width, height, occupiedTiles.size]);

  /**
   * Preview building element when in building mode
   */
  const previewElement = useMemo(() => {
    if (!placementValidation || !hoveredTile) {
      return null;
    }

    const { isValid, blueprint } = placementValidation;

    const baseX = hoveredTile.x - blueprint.originX;
    const baseY = hoveredTile.y - blueprint.originY;
    const color = BUILDING_CATEGORY_COLORS[blueprint.category] || BUILDING_CATEGORY_COLORS.Building;
    const borderColor = isValid ? '#FFD700' : '#FF4444'; // Yellow for valid, red for invalid

    const previewElements: React.ReactNode[] = [];

    // Render preview tiles
    blueprint.tiles.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === '_') return;

        const tileX = baseX + colIndex;
        const tileY = baseY + rowIndex;

        previewElements.push(
          <Rect
            key={`preview-tile-${tileX}-${tileY}`}
            x={tileX * TILE_SIZE}
            y={tileY * TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill={color}
            opacity={PREVIEW_OPACITY}
            stroke={borderColor}
            strokeWidth={2}
            perfectDrawEnabled={false}
            listening={false}
          />
        );
      });
    });

    // White origin point marker at the cursor position
    previewElements.push(
      <Circle
        key="preview-origin"
        x={hoveredTile.x * TILE_SIZE + TILE_SIZE / 2}
        y={hoveredTile.y * TILE_SIZE + TILE_SIZE / 2}
        radius={4}
        fill="white"
        stroke="black"
        strokeWidth={1}
        perfectDrawEnabled={false}
        listening={false}
      />
    );

    return (
      <Group 
        key="building-preview" 
        cache={true} 
        hitGraphListening={false}
        shouldSkipBatching={() => true}
      >
        {previewElements}
      </Group>
    );
  }, [
    showBuildingPreview,
    editorMode,
    selectedBuilding,
    hoveredTile,
    width,
    height,
    occupiedTiles,
  ]);

  // Cache static buildings layer
  useEffect(() => {
    if (!buildingsRef.current || buildingElements.length === 0) return;

    const frameId = requestAnimationFrame(() => {
      try {
        buildingsRef.current?.clearCache();
        buildingsRef.current?.cache();
        buildingsRef.current?.getLayer()?.batchDraw();
      } catch (error) {
        // Silently ignore cache errors (e.g., when node has 0 dimensions)
        console.debug('[BuildingLayer] Caching skipped:', error);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [buildingElements]);

  return (
    <Group>
      {/* Static buildings layer */}
      <Group ref={buildingsRef}>
        {buildingElements}
      </Group>

      {/* Preview layer (dynamic, not cached) */}
      {previewElement}
    </Group>
  );
}

// ============================================================================
// Exports
// ============================================================================

export type { BuildingLayerProps };

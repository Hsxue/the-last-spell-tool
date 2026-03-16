/**
 * TerrainLayer - Renders terrain tiles and handles terrain editing
 * Phase 2 Task 2: Full terrain rendering with brush support
 *
 * Features:
 * - Renders all terrain tiles using react-konva Rect components
 * - Supports 3 terrain types: Crater, Dirt, Stone (plus Empty for erasing)
 * - Mouse click and drag drawing with configurable brush size (1-10)
 * - Eraser mode support
 * - Performance optimized with Konva Group batch rendering
 */

import { useState, useCallback, useMemo } from 'react';
import { Rect, Group } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { MapData, TerrainType } from '../../types/map';
import { TERRAIN_COLORS } from '../../types/map';
import { useMapStore } from '../../store/mapStore';

// ============================================================================
// Props Interface
// ============================================================================

interface TerrainLayerProps {
  /** Map data containing terrain information */
  mapData: MapData;
}

// ============================================================================
// Constants
// ============================================================================

/** Size of each tile in pixels */
const TILE_SIZE = 20;

/** Default terrain color for unknown types */
const DEFAULT_TERRAIN_COLOR = 'transparent';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the color for a terrain type
 * @param terrain - The terrain type
 * @returns The hex color string for the terrain
 */
function getTerrainColor(terrain: TerrainType): string {
  return TERRAIN_COLORS[terrain] || DEFAULT_TERRAIN_COLOR;
}

/**
 * Parse position key "x,y" into coordinates
 * @param key - Position key in format "x,y"
 * @returns Tuple of [x, y] coordinates
 */
function parsePositionKey(key: string): [number, number] {
  const [x, y] = key.split(',').map(Number);
  return [x, y];
}

/**
 * Generate all positions within brush radius
 * @param centerX - Center X coordinate
 * @param centerY - Center Y coordinate
 * @param brushSize - Brush size (1-10)
 * @param maxWidth - Maximum map width
 * @param maxHeight - Maximum map height
 * @returns Array of [x, y] positions to paint
 */
function getBrushPositions(
  centerX: number,
  centerY: number,
  brushSize: number,
  maxWidth: number,
  maxHeight: number
): Array<[number, number]> {
  const positions: Array<[number, number]> = [];
  const radius = Math.floor((brushSize - 1) / 2);

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const x = centerX + dx;
      const y = centerY + dy;
      // Clamp to map bounds
      if (x >= 0 && x < maxWidth && y >= 0 && y < maxHeight) {
        positions.push([x, y]);
      }
    }
  }

  return positions;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * TerrainLayer Component
 *
 * Renders terrain tiles and handles terrain editing interactions.
 * Uses Konva Group for batch rendering performance.
 */
export function TerrainLayer({ mapData }: TerrainLayerProps) {
  const { width, height, terrain } = mapData;

  // Get editor state from store
  const {
    editorMode,
    selectedTerrain,
    brushSize,
    setTerrain,
    setHoveredTile,
  } = useMapStore();

  // Track if user is currently drawing (mouse held down)
  const [isDrawing, setIsDrawing] = useState(false);

  /**
   * Handle terrain painting at specific coordinates
   * Applies brush size and respects editor mode
   */
  const handlePaint = useCallback(
    (x: number, y: number) => {
      console.log('handlePaint called:', {x, y, editorMode, selectedTerrain, brushSize});
      
      // Only paint in terrain or eraser mode
      if (editorMode !== 'terrain' && editorMode !== 'eraser') {
        console.log('handlePaint: Editor mode not terrain/eraser, skipping');
        return;
      }

      // Determine terrain type based on mode
      const terrainType: TerrainType = editorMode === 'eraser' ? 'Empty' : selectedTerrain;
      console.log('handlePaint: Painting terrain type:', terrainType);

      // Get all positions to paint based on brush size
      const positions = getBrushPositions(x, y, brushSize, width, height);
      console.log('handlePaint: Positions to paint:', positions);

      // Paint each position
      positions.forEach(([px, py]) => {
        setTerrain(px, py, terrainType);
      });
      console.log('handlePaint: Finished setting terrain');
    },
    [editorMode, selectedTerrain, brushSize, width, height, setTerrain]
  );

  /**
   * Handle mouse down on a terrain tile
   */
  const handleMouseDown = useCallback(
    (x: number, y: number) => {
      console.log('handleMouseDown called:', {x, y});
      setIsDrawing(true);
      handlePaint(x, y);
    },
    [handlePaint]
  );

  /**
   * Handle mouse enter on a terrain tile (for drag drawing)
   */
  const handleMouseEnter = useCallback(
    (x: number, y: number) => {
      console.log('handleMouseEnter called:', {x, y, isDrawing});
      // Update hovered tile position
      setHoveredTile({ x, y });

      // Paint if currently drawing
      if (isDrawing) {
        handlePaint(x, y);
      }
    },
    [isDrawing, handlePaint, setHoveredTile]
  );

  /**
   * Handle mouse up - stop drawing
   */
  const handleMouseUp = useCallback(() => {
    console.log('handleMouseUp called');
    setIsDrawing(false);
  }, []);

  /**
   * Handle mouse leave from canvas - stop drawing
   */
  const handleMouseLeave = useCallback(() => {
    console.log('handleMouseLeave called');
    setIsDrawing(false);
    setHoveredTile(null);
  }, [setHoveredTile]);

  /**
   * Memoized terrain rendering elements
   * Converts terrain Map into Konva Rect components
   */
  const terrainElements = useMemo(() => {
    const elements: React.ReactNode[] = [];

    terrain.forEach((terrainType, key) => {
      const [x, y] = parsePositionKey(key);

      elements.push(
        <Rect
          key={`terrain-${key}`}
          x={x * TILE_SIZE}
          y={y * TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fill={getTerrainColor(terrainType)}
          stroke={undefined}
          strokeWidth={0}
          onMouseDown={(e: KonvaEventObject<MouseEvent>) => {
            console.log('Terrain tile rect mousedown at tile coords:', {x, y, screenPt: e.target.getStage()?.getPointerPosition()});
            handleMouseDown(x, y);
          }}
          onMouseEnter={(e: KonvaEventObject<MouseEvent>) => {
            console.log('Terrain tile rect mouseenter at tile coords:', {x, y, screenPt: e.target.getStage()?.getPointerPosition()});
            handleMouseEnter(x, y);
          }}
          perfectDrawEnabled={false}
          listening={true}
        />
      );
    });

    return elements;
  }, [terrain, handleMouseDown, handleMouseEnter]);

  // Calculate canvas dimensions in pixels
  const canvasWidth = width * TILE_SIZE;
  const canvasHeight = height * TILE_SIZE;

  return (
    <Group>
      {/* Render all terrain tiles */}
      {terrainElements}

      {/*
        Invisible interaction layer for:
        1. Capturing mouse events on empty areas
        2. Global mouse up/leave handling
        3. Drawing on tiles that don't exist yet
      */}
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={canvasHeight}
        fill="transparent"
        onMouseDown={(e: KonvaEventObject<MouseEvent>) => {
          const stage = e.target.getStage();
          const pos = stage?.getPointerPosition();
          if (!pos) return;
          
          // Convert screen coordinates to tile coordinates
          const tileX = Math.floor(pos.x / TILE_SIZE);
          const tileY = Math.floor(pos.y / TILE_SIZE);
          
          console.log('Invisible layer mouseDown:', {screenX: pos.x, screenY: pos.y, tileX, tileY, editorMode, selectedTerrain});
          
          // Use these tile coordinates for painting
          setIsDrawing(true);
          handlePaint(tileX, tileY);
        }}
        onMouseUp={() => {
          console.log('Invisible layer mouseUp');
          handleMouseUp();
        }}
        onMouseMove={(e: KonvaEventObject<MouseEvent>) => {
          if (isDrawing) {
            const stage = e.target.getStage();
          const pos = stage?.getPointerPosition();
            if (!pos) return;
            
            // Convert screen coordinates to tile coordinates
            const tileX = Math.floor(pos.x / TILE_SIZE);
            const tileY = Math.floor(pos.y / TILE_SIZE);
            
            console.log('Invisible layer mouseMove dragging:', {screenX: pos.x, screenY: pos.y, tileX, tileY});
            handlePaint(tileX, tileY);
          }
        }}
        onMouseLeave={() => {
          console.log('Invisible layer mouseLeave');
          handleMouseLeave();
        }}
        perfectDrawEnabled={false}
        listening={true}
      />
    </Group>
  );
}

// ============================================================================
// Exports
// ============================================================================

export type { TerrainLayerProps };

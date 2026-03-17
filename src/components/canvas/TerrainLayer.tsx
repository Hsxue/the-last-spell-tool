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

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Rect, Group } from 'react-konva';
import type { Group as KonvaGroup } from 'konva/lib/Group';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { MapData, TerrainType, ViewportState } from '../../types/map';
import { TERRAIN_COLORS } from '../../types/map';
import { useMapStore } from '../../store/mapStore';

// ============================================================================
// Props Interface
// ============================================================================

interface TerrainLayerProps {
  /** Map data containing terrain information */
  mapData: MapData;
  /** Viewport state for coordinate transformation */
  viewport: ViewportState;
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
export function TerrainLayer({ mapData, viewport }: TerrainLayerProps) {
  const { width, height, terrain } = mapData;

  // Refs for terrain groups to enable separate caching
  // staticTerrainRef: rarely changes (only when terrain store updates)
  // dynamicTerrainRef: frequently changes during drawing (pendingTerrain updates)
  const staticTerrainRef = useRef<KonvaGroup>(null);
  const dynamicTerrainRef = useRef<KonvaGroup>(null);

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

  // Local batch state for terrain changes - accumulate during drag, commit on mouseUp
  const [pendingTerrain, setPendingTerrain] = useState<Map<string, TerrainType>>(new Map());

  // Throttle cache update tracking for dynamic layer (pendingTerrain)
  const lastCacheUpdateTimeRef = useRef<number>(0);
  const CACHE_THROTTLE_MS = 100; // Throttle interval: 100ms

  /**
   * Handle terrain painting at specific coordinates
   * Accumulates changes to local pendingTerrain state, batch committed on mouseUp
   */
  const handlePaint = useCallback(
    (x: number, y: number) => {
      // Only paint in terrain or eraser mode
      if (editorMode !== 'terrain' && editorMode !== 'eraser') {
        return;
      }

      // Determine terrain type based on mode
      const terrainType: TerrainType = editorMode === 'eraser' ? 'Empty' : selectedTerrain;

      // Get all positions to paint based on brush size
      const positions = getBrushPositions(x, y, brushSize, width, height);

      // Accumulate to pending terrain instead of immediate store update
      positions.forEach(([px, py]) => {
        const key = `${px},${py}`;
        setPendingTerrain(prev => {
          const next = new Map(prev);
          if (terrainType === 'Empty') {
            next.delete(key);
          } else {
            next.set(key, terrainType);
          }
          return next;
        });
      });
    },
    [editorMode, selectedTerrain, brushSize, width, height]
  );

  /**
   * Handle mouse up - stop drawing and batch commit pending terrain changes
   */
  const handleMouseUp = useCallback(() => {
    // Batch commit all pending terrain changes to store
    if (pendingTerrain.size > 0) {
      pendingTerrain.forEach((terrain, key) => {
        const [x, y] = parsePositionKey(key);
        setTerrain(x, y, terrain);
      });
      setPendingTerrain(new Map());
    }

    // Immediately update dynamic layer cache (ensure final state is correct)
    dynamicTerrainRef.current?.clearCache();
    dynamicTerrainRef.current?.cache();
    dynamicTerrainRef.current?.getLayer()?.batchDraw();

    setIsDrawing(false);
  }, [pendingTerrain, setTerrain]);

  /**
   * Handle mouse leave from canvas - stop drawing and commit pending changes
   */
  const handleMouseLeave = useCallback(() => {
    // Batch commit all pending terrain changes before leaving
    if (pendingTerrain.size > 0) {
      pendingTerrain.forEach((terrain, key) => {
        const [x, y] = parsePositionKey(key);
        setTerrain(x, y, terrain);
      });
      setPendingTerrain(new Map());
    }
    setIsDrawing(false);
    setHoveredTile(null);
  }, [pendingTerrain, setTerrain, setHoveredTile]);

  /**
   * Pre-computed terrain data array from store terrain (static layer)
   * Converts Map entries to array with pre-calculated x, y positions
   * Only recalculates when terrain store changes (rare)
   */
  const terrainData = useMemo(() => {
    return Array.from(terrain.entries()).map(([key, terrainType]) => {
      const [x, y] = parsePositionKey(key);
      return { key, x, y, terrainType };
    });
  }, [terrain]);

  /**
   * Dynamic terrain elements from pendingTerrain (preview layer)
   * Only renders tiles being drawn (<50 typically), not all 2500 tiles
   * Recalculates frequently during drawing but with minimal overhead
   */
  const pendingElements = useMemo(() => {
    return Array.from(pendingTerrain.entries()).map(([key, terrainType]) => {
      const [x, y] = parsePositionKey(key);
      return (
        <Rect
          key={`pending-${key}`}
          x={x * TILE_SIZE}
          y={y * TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fill={getTerrainColor(terrainType)}
          stroke={undefined}
          strokeWidth={0}
          perfectDrawEnabled={false}
          listening={false}
          hitStrokeWidth={0}
        />
      );
    });
  }, [pendingTerrain]);

  /**
   * Memoized terrain rendering elements (static layer)
   * Converts terrain data array into Konva Rect components
   */
  const terrainElements = useMemo(() => {
    return terrainData.map(({ key, x, y, terrainType }) => (
      <Rect
        key={`terrain-${key}`}
        x={x * TILE_SIZE}
        y={y * TILE_SIZE}
        width={TILE_SIZE}
        height={TILE_SIZE}
        fill={getTerrainColor(terrainType)}
        stroke={undefined}
        strokeWidth={0}
        perfectDrawEnabled={false}
        listening={false}
        hitStrokeWidth={0}
      />
    ));
  }, [terrainData]);

  // Cache static terrain layer (rarely changes)
  // Only rebuilds when terrain store actually changes
  useEffect(() => {
    if (!staticTerrainRef.current || terrainData.length === 0) return;

    const frameId = requestAnimationFrame(() => {
      staticTerrainRef.current?.clearCache();
      staticTerrainRef.current?.cache();
      staticTerrainRef.current?.getLayer()?.batchDraw();
    });
    return () => cancelAnimationFrame(frameId);
  }, [terrainData]);

  // Cache dynamic terrain layer (frequently changes during drawing)
  // Uses throttling to prevent excessive cache updates
  useEffect(() => {
    if (!dynamicTerrainRef.current) return;

    const now = performance.now();
    const timeSinceLastCache = now - lastCacheUpdateTimeRef.current;

    // If less than CACHE_THROTTLE_MS since last cache update, schedule delayed update
    if (timeSinceLastCache < CACHE_THROTTLE_MS) {
      const timeoutId = setTimeout(() => {
        lastCacheUpdateTimeRef.current = performance.now();
        dynamicTerrainRef.current?.clearCache();
        dynamicTerrainRef.current?.cache();
        dynamicTerrainRef.current?.getLayer()?.batchDraw();
      }, CACHE_THROTTLE_MS - timeSinceLastCache);
      return () => clearTimeout(timeoutId);
    }

    // Otherwise update immediately
    lastCacheUpdateTimeRef.current = now;
    const frameId = requestAnimationFrame(() => {
      dynamicTerrainRef.current?.clearCache();
      dynamicTerrainRef.current?.cache();
      dynamicTerrainRef.current?.getLayer()?.batchDraw();
    });
    return () => cancelAnimationFrame(frameId);
  }, [pendingTerrain]);

  // Calculate canvas dimensions in pixels
  const canvasWidth = width * TILE_SIZE;
  const canvasHeight = height * TILE_SIZE;

  return (
    <Group>
      {/* Static terrain layer (from store - rarely changes) */}
      <Group ref={staticTerrainRef}>
        {terrainElements}
      </Group>

      {/* Dynamic terrain layer (pending changes - frequently updates) */}
      <Group ref={dynamicTerrainRef}>
        {pendingElements}
      </Group>

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
          
          // 修复：添加 viewport 转换
          const worldX = (pos.x - viewport.offsetX) / viewport.zoom;
          const worldY = (pos.y - viewport.offsetY) / viewport.zoom;
          const tileX = Math.floor(worldX / TILE_SIZE);
          const tileY = Math.floor(worldY / TILE_SIZE);
          
          // 边界检查
          if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
            setIsDrawing(true);
            handlePaint(tileX, tileY);
          }
        }}
        onMouseUp={() => {
          handleMouseUp();
        }}
        onMouseMove={(e: KonvaEventObject<MouseEvent>) => {
          const stage = e.target.getStage();
          const pos = stage?.getPointerPosition();
          if (!pos) return;
          
          // 修复：添加 viewport 转换
          const worldX = (pos.x - viewport.offsetX) / viewport.zoom;
          const worldY = (pos.y - viewport.offsetY) / viewport.zoom;
          const tileX = Math.floor(worldX / TILE_SIZE);
          const tileY = Math.floor(worldY / TILE_SIZE);
          
          // 更新悬停的瓦片位置
          if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
            setHoveredTile({ x: tileX, y: tileY });
          } else {
            setHoveredTile(null);
          }
          
          // 如果在绘制中，继续绘制
          if (isDrawing) {
            // 边界检查
            if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
              handlePaint(tileX, tileY);
            }
          }
        }}
        onMouseLeave={() => {
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
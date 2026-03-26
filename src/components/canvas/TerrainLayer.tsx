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
import { getVisibleTileRange, isTileVisible } from '../../lib/viewportCulling';

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
    setTerrainBatch,
    setHoveredTile,
  } = useMapStore();

  // Track if user is currently drawing (mouse held down)
  const [isDrawing, setIsDrawing] = useState(false);

  // Local batch state for terrain changes - accumulate during drag, commit on mouseUp
  const [pendingTerrain, setPendingTerrain] = useState<Map<string, TerrainType>>(new Map());

  // Flag to prevent cache update during commit (avoid flash on mouseUp)
  const isCommittingRef = useRef<boolean>(false);

  // Ref to accumulate paint positions during drag (avoid excessive state updates)
  const paintBatchRef = useRef<Set<string>>(new Set());
  const pendingBatchRef = useRef<Map<string, TerrainType>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  /**
   * Handle terrain painting at specific coordinates
   * Accumulates positions to ref, then batch updates pendingTerrain via RAF
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

      // Accumulate positions to ref (no state update yet)
      positions.forEach(([px, py]) => {
        const key = `${px},${py}`;
        paintBatchRef.current.add(key);
        pendingBatchRef.current.set(key, terrainType);
      });

      // Schedule batch update via requestAnimationFrame
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          
          // Build new pendingTerrain from batch
          setPendingTerrain(prev => {
            const next = new Map(prev);
            pendingBatchRef.current.forEach((terrainType, key) => {
              if (terrainType === 'Empty') {
                next.delete(key);
              } else {
                next.set(key, terrainType);
              }
            });
            return next;
          });
          
          // Clear batch refs
          paintBatchRef.current.clear();
          pendingBatchRef.current.clear();
        });
      }
    },
    [editorMode, selectedTerrain, brushSize, width, height]
  );

  /**
   * Handle mouse up - stop drawing and batch commit pending terrain changes
   * Uses async batch commit to avoid UI blocking
   */
  const handleMouseUp = useCallback(() => {
    // Cancel any pending RAF update
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // Flush any remaining batch to pendingTerrain first
    if (pendingBatchRef.current.size > 0) {
      setPendingTerrain(prev => {
        const next = new Map(prev);
        pendingBatchRef.current.forEach((terrainType, key) => {
          if (terrainType === 'Empty') {
            next.delete(key);
          } else {
            next.set(key, terrainType);
          }
        });
        return next;
      });
      pendingBatchRef.current.clear();
      paintBatchRef.current.clear();
    }
    
    // Batch commit all pending terrain changes to store asynchronously
    // This avoids blocking the UI during large brush strokes
    if (pendingTerrain.size > 0) {
      // Set committing flag to prevent dynamic layer cache update during commit
      isCommittingRef.current = true;
      
      // Use setTerrainBatch for efficient single-update commit
      setTerrainBatch(new Map(pendingTerrain));
      
      // Clear pending terrain immediately (visual already shown via dynamic layer)
      setPendingTerrain(new Map());
      
      // Reset committing flag after store update propagates
      // Dynamic layer will hide, static layer will show from store
      requestAnimationFrame(() => {
        setTimeout(() => {
          isCommittingRef.current = false;
        }, 16); // Wait ~1 frame for store update
      });
    }

    setIsDrawing(false);
  }, [pendingTerrain, setTerrainBatch]);

  /**
   * Handle mouse leave from canvas - stop drawing and commit pending changes
   * Uses async batch commit to avoid UI blocking
   */
  const handleMouseLeave = useCallback(() => {
    // Cancel any pending RAF update
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // Flush any remaining batch to pendingTerrain first
    if (pendingBatchRef.current.size > 0) {
      setPendingTerrain(prev => {
        const next = new Map(prev);
        pendingBatchRef.current.forEach((terrainType, key) => {
          if (terrainType === 'Empty') {
            next.delete(key);
          } else {
            next.set(key, terrainType);
          }
        });
        return next;
      });
      pendingBatchRef.current.clear();
      paintBatchRef.current.clear();
    }
    
    // Batch commit all pending terrain changes to store asynchronously
    if (pendingTerrain.size > 0) {
      // Set committing flag to prevent dynamic layer cache update during commit
      isCommittingRef.current = true;
      
      // Use setTerrainBatch for efficient single-update commit
      setTerrainBatch(new Map(pendingTerrain));
      
      // Clear pending terrain
      setPendingTerrain(new Map());
      
      // Reset committing flag after store update propagates
      requestAnimationFrame(() => {
        setTimeout(() => {
          isCommittingRef.current = false;
        }, 16);
      });
    }
    
    setIsDrawing(false);
    setHoveredTile(null);
  }, [pendingTerrain, setTerrainBatch, setHoveredTile]);

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
   * Calculate visible tile range based on viewport
   * Uses containerSize for accurate culling
   */
  const visibleRange = useMemo(() => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    const viewportPixels = {
      x: -viewport.offsetX / viewport.zoom,
      y: -viewport.offsetY / viewport.zoom,
      width: containerWidth / viewport.zoom,
      height: containerHeight / viewport.zoom,
    };

    const range = getVisibleTileRange(
      viewportPixels,
      width * TILE_SIZE,
      height * TILE_SIZE,
      TILE_SIZE
    );
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log('[TerrainLayer] Viewport:', {
        offsetX: viewport.offsetX,
        offsetY: viewport.offsetY,
        zoom: viewport.zoom,
        containerWidth,
        containerHeight,
      });
      console.log('[TerrainLayer] Visible range:', range);
    }

    return range;
  }, [viewport.offsetX, viewport.offsetY, viewport.zoom, width, height]);

  /**
   * Dynamic terrain elements from pendingTerrain (preview layer)
   * Only renders tiles being drawn (<50 typically), not all 2500 tiles
   * Uses viewport culling to only render visible tiles
   * Implements LOD: skips rendering when zoom < 0.5 for performance
   * Recalculates frequently during drawing but with minimal overhead
   */
  const pendingElements = useMemo(() => {
    // Implement Level of Detail (LOD): skip rendering when zoom is too far out
    if (viewport.zoom < 0.5) {
      return [];
    }
    
    // Filter to only visible tiles
    const visiblePendingEntries = Array.from(pendingTerrain.entries()).filter(([key]) => {
      const [x, y] = parsePositionKey(key);
      return isTileVisible(x, y, visibleRange);
    });

    return visiblePendingEntries.map(([key, terrainType]) => {
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
  }, [pendingTerrain, visibleRange, viewport.zoom]);

  /**
   * Memoized terrain rendering elements (static layer)
   * Converts terrain data array into Konva Rect components
   * Uses viewport culling to only render visible tiles
   * Implements LOD: skips rendering when zoom < 0.5 for performance
   */
  const terrainElements = useMemo(() => {
    // Implement Level of Detail (LOD): skip rendering when zoom is too far out
    if (viewport.zoom < 0.5) {
      return [];
    }
    
    // Filter to only visible tiles
    const visibleTerrainData = terrainData.filter(({ x, y }) =>
      isTileVisible(x, y, visibleRange)
    );

    // Log rendered tile count for verification
    if (import.meta.env.DEV) {
      console.log(`[TerrainLayer] Rendering ${visibleTerrainData.length} / ${terrainData.length} terrain tiles (viewport culling, LOD active at ${viewport.zoom.toFixed(2)})`);
    }

    return visibleTerrainData.map(({ key, x, y, terrainType }) => (
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
  }, [terrainData, visibleRange, viewport.zoom]);

  // Cache static terrain layer (rarely changes)
  // Only rebuilds when terrain data changes, not on zoom/viewport changes
  // Also invalidate cache when switching between LOD and normal rendering
  useEffect(() => {
    if (!staticTerrainRef.current || terrainElements.length === 0) return;
    
    // Only cache on terrain changes, not during viewport changes
    // Also invalidate when zoom level changes from LOD threshold (0.5)
    const shouldRebuild = terrainData.length > 0;
    
    if (!shouldRebuild) return;
    
    // Delay cache operation slightly to ensure rendering is settled
    const frameId = requestAnimationFrame(() => {
      staticTerrainRef.current?.cache({
        x: 0,
        y: 0,
        width: width * TILE_SIZE,
        height: height * TILE_SIZE,
        pixelRatio: window.devicePixelRatio || 1,
      });
      staticTerrainRef.current?.getLayer()?.batchDraw();
    });

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [terrainData]); // Only re-cache when terrain data changes, not on zoom or visibleRange

  // Cache dynamic terrain layer (frequently changes during drawing)
  // Only cache when pending terrain changes, not during zoom/viewport changes
  useEffect(() => {
    if (!dynamicTerrainRef.current || isCommittingRef.current || pendingTerrain.size === 0) 
      return;

    const frameId = requestAnimationFrame(() => {
      // Proper cache with bounds specified
      dynamicTerrainRef.current?.cache({
        x: 0,
        y: 0,
        width: width * TILE_SIZE,
        height: height * TILE_SIZE,
        pixelRatio: window.devicePixelRatio || 1,
      });
      dynamicTerrainRef.current?.getLayer()?.batchDraw();
    });

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [pendingTerrain]); // Only re-cache when pending terrain data changes, not on zoom

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
/**
 * TerrainLayer - Renders terrain tiles using pre-rendered canvas for optimal performance
 * 
 * Features:
 * - Pre-renders terrain to offscreen canvas for performance
 * - Uses Konva Image to display pre-rendered terrain
 * - Supports 3 terrain types: Crater, Dirt, Stone (plus Empty for erasing)
 * - Mouse click and drag drawing with configurable brush size (1-10)
 * - Eraser mode support
 * - Dynamic overlay for pending terrain changes
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Image as KonvaImage, Rect, Group } from 'react-konva';
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

const TILE_SIZE = 20;
const DEFAULT_TERRAIN_COLOR = 'transparent';

// ============================================================================
// Helper Functions
// ============================================================================

function getTerrainColor(terrain: TerrainType): string {
  return TERRAIN_COLORS[terrain] || DEFAULT_TERRAIN_COLOR;
}

function parsePositionKey(key: string): [number, number] {
  const [x, y] = key.split(',').map(Number);
  return [x, y];
}

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
      if (x >= 0 && x < maxWidth && y >= 0 && y < maxHeight) {
        positions.push([x, y]);
      }
    }
  }

  return positions;
}

/**
 * Pre-render terrain to offscreen canvas
 */
function preRenderTerrain(
  terrain: Map<string, TerrainType>,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width * TILE_SIZE;
  canvas.height = height * TILE_SIZE;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return canvas;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  terrain.forEach((terrainType, key) => {
    const [x, y] = parsePositionKey(key);
    ctx.fillStyle = getTerrainColor(terrainType);
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  });
  
  return canvas;
}

// ============================================================================
// Main Component
// ============================================================================

export function TerrainLayer({ mapData }: TerrainLayerProps) {
  const { width, height, terrain } = mapData;

  // Refs for pre-rendered canvas
  const terrainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Get editor state from store
  const {
    editorMode,
    selectedTerrain,
    brushSize,
    setTerrainBatch,
    setHoveredTile,
  } = useMapStore();

  // Track drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingTerrain, setPendingTerrain] = useState<Map<string, TerrainType>>(new Map());
  
  // Batch refs
  const paintBatchRef = useRef<Set<string>>(new Set());
  const pendingBatchRef = useRef<Map<string, TerrainType>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  /**
   * Handle terrain painting
   */
  const handlePaint = useCallback(
    (x: number, y: number) => {
      if (editorMode !== 'terrain' && editorMode !== 'eraser') {
        return;
      }

      const terrainType: TerrainType = editorMode === 'eraser' ? 'Empty' : selectedTerrain;
      const positions = getBrushPositions(x, y, brushSize, width, height);

      positions.forEach(([px, py]) => {
        const key = `${px},${py}`;
        paintBatchRef.current.add(key);
        pendingBatchRef.current.set(key, terrainType);
      });

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          
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
          
          paintBatchRef.current.clear();
          pendingBatchRef.current.clear();
        });
      }
    },
    [editorMode, selectedTerrain, brushSize, width, height]
  );

  /**
   * Handle mouse up - commit pending changes
   */
  const handleMouseUp = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
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
    
    if (pendingTerrain.size > 0) {
      setTerrainBatch(new Map(pendingTerrain));
      setPendingTerrain(new Map());
    }

    setIsDrawing(false);
  }, [pendingTerrain, setTerrainBatch]);

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
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
    
    if (pendingTerrain.size > 0) {
      setTerrainBatch(new Map(pendingTerrain));
      setPendingTerrain(new Map());
    }
    
    setIsDrawing(false);
    setHoveredTile(null);
  }, [pendingTerrain, setTerrainBatch, setHoveredTile]);

  /**
   * Pre-render terrain canvas when terrain changes
   */
  useEffect(() => {
    terrainCanvasRef.current = preRenderTerrain(terrain, width, height);
  }, [terrain, width, height]);

  /**
   * Render dynamic terrain (pending changes) to canvas
   */
  const dynamicCanvas = useMemo(() => {
    if (pendingTerrain.size === 0) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = width * TILE_SIZE;
    canvas.height = height * TILE_SIZE;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    pendingTerrain.forEach((terrainType, key) => {
      const [x, y] = parsePositionKey(key);
      ctx.fillStyle = getTerrainColor(terrainType);
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
    
    return canvas;
  }, [pendingTerrain, width, height]);

  // Calculate canvas dimensions
  const canvasWidth = width * TILE_SIZE;
  const canvasHeight = height * TILE_SIZE;

  return (
    <Group>
      {/* Static terrain layer (pre-rendered canvas) */}
      {terrainCanvasRef.current && (
        <KonvaImage
          image={terrainCanvasRef.current}
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
      
      {/* Dynamic terrain layer (pending changes) */}
      {dynamicCanvas && (
        <KonvaImage
          image={dynamicCanvas}
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}

      {/* Invisible interaction layer */}
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
          
          const viewport = useMapStore.getState().viewport;
          const worldX = (pos.x - viewport.offsetX) / viewport.zoom;
          const worldY = (pos.y - viewport.offsetY) / viewport.zoom;
          const tileX = Math.floor(worldX / TILE_SIZE);
          const tileY = Math.floor(worldY / TILE_SIZE);
          
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
          
          const viewport = useMapStore.getState().viewport;
          const worldX = (pos.x - viewport.offsetX) / viewport.zoom;
          const worldY = (pos.y - viewport.offsetY) / viewport.zoom;
          const tileX = Math.floor(worldX / TILE_SIZE);
          const tileY = Math.floor(worldY / TILE_SIZE);
          
          if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
            setHoveredTile({ x: tileX, y: tileY });
          } else {
            setHoveredTile(null);
          }
          
          if (isDrawing) {
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

export type { TerrainLayerProps };

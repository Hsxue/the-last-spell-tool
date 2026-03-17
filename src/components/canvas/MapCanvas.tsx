/**
 * MapCanvas - Main canvas container using Konva
 * Provides Stage with zoom, pan, and layered rendering
 * Includes mouse tracking for coordinate display
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useMapStore } from '../../store/mapStore';
import { TerrainLayer } from './TerrainLayer';
import { GridLayer } from './GridLayer';
import { BuildingLayer } from './BuildingLayer';
import { FlagLayer } from './FlagLayer';
import type { MapData } from '../../types/map';

// ============================================================================
// Props Interface
// ============================================================================

export interface MapCanvasProps {
  /** Optional CSS class for styling */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Size of each tile in pixels - must match TerrainLayer and GridLayer */
const TILE_SIZE = 20;

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// Main Component
// ============================================================================

export function MapCanvas({ className }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Get state from store
  const {
    width,
    height,
    mapData,
    viewport,
    layerVisibility,
    setViewport,
    editorMode,
    setHoveredTile,
  } = useMapStore();

  // Initialize map to center on first mount
  useEffect(() => {
    if (containerRef.current && width > 0 && height > 0) {
      const { clientWidth, clientHeight } = containerRef.current;
      const mapPixelWidth = width * TILE_SIZE;
      const mapPixelHeight = height * TILE_SIZE;
      
      // Calculate center offset
      const centerOffsetX = (clientWidth - mapPixelWidth * viewport.zoom) / 2;
      const centerOffsetY = (clientHeight - mapPixelHeight * viewport.zoom) / 2;
      
      setViewport({
        offsetX: centerOffsetX,
        offsetY: centerOffsetY,
      });
    }
  }, [width, height, viewport.zoom, setViewport]);

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({ width: clientWidth, height: clientHeight });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const scaleBy = 1.1;
      const stage = e.target.getStage();
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      // Determine zoom direction
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // Clamp zoom between 0.25 and 2
      const clampedZoom = clamp(newScale, 0.25, 2);

      // Calculate new position to zoom towards mouse pointer
      const newPos = {
        x: pointer.x - mousePointTo.x * clampedZoom,
        y: pointer.y - mousePointTo.y * clampedZoom,
      };

      setViewport({
        zoom: clampedZoom,
        offsetX: newPos.x,
        offsetY: newPos.y,
      });
    },
    [setViewport]
  );

  // Handle drag end to update viewport state
  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      setViewport({
        offsetX: e.target.x(),
        offsetY: e.target.y(),
        isPanning: false,
      });
    },
    [setViewport]
  );

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setViewport({ isPanning: true });
  }, [setViewport]);

  // Handle mouse move for coordinate tracking
  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      // Calculate world coordinates from screen coordinates
      const worldX = (pos.x - viewport.offsetX) / viewport.zoom;
      const worldY = (pos.y - viewport.offsetY) / viewport.zoom;

      // Calculate tile coordinates
      const tileX = Math.floor(worldX / TILE_SIZE);
      const tileY = Math.floor(worldY / TILE_SIZE);

      // Update hovered tile if within map bounds
      if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
        setHoveredTile({ x: tileX, y: tileY });
      } else {
        setHoveredTile(null);
      }

      // Dispatch custom event for MapStatusBar
      const event = new CustomEvent('mousecoords', {
        detail: {
          screenX: Math.round(pos.x),
          screenY: Math.round(pos.y),
          worldX: Math.round(worldX * 100) / 100,
          worldY: Math.round(worldY * 100) / 100,
          tileX,
          tileY,
        },
      });
      window.dispatchEvent(event);
    },
    [viewport.offsetX, viewport.offsetY, viewport.zoom, width, height, setHoveredTile]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredTile(null);
  }, [setHoveredTile]);

  // Prepare map data for layers
  const layerMapData: MapData | null = mapData || {
    width,
    height,
    terrain: new Map(),
    buildings: [],
    flags: new Map(),
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-muted ${className || ''}`}
      style={{ 
        cursor: editorMode === 'terrain' || editorMode === 'eraser' 
          ? (viewport.isPanning ? 'grabbing' : 'crosshair') 
          : (viewport.isPanning ? 'grabbing' : 'grab') 
      }}
    >
      {/* Disable Stage drag when in terrain/eraser mode to allow drawing instead of panning */}
      <Stage
        width={containerSize.width}
        height={containerSize.height}
        scaleX={viewport.zoom}
        scaleY={viewport.zoom}
        x={viewport.offsetX}
        y={viewport.offsetY}
        draggable={editorMode !== 'terrain' && editorMode !== 'eraser'}
        onWheel={handleWheel}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Terrain Layer - Bottom */}
        <Layer imageSmoothingEnabled={false}>
          <TerrainLayer mapData={layerMapData} viewport={viewport} />
        </Layer>

        {/* Grid Layer */}
        {layerVisibility.grid && (
          <Layer imageSmoothingEnabled={false}>
            <GridLayer width={width} height={height} zoom={viewport.zoom} />
          </Layer>
        )}

        {/* Building Layer */}
        <Layer imageSmoothingEnabled={false}>
          <BuildingLayer
            buildings={layerMapData.buildings}
            showPreview={layerVisibility.occupied}
          />
        </Layer>

        {/* Flag Layer - Top */}
        {layerVisibility.flags && (
          <Layer imageSmoothingEnabled={false}>
            <FlagLayer flags={layerMapData.flags} />
          </Layer>
        )}
      </Stage>
    </div>
  );
}

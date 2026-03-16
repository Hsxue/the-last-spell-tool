/**
 * MapCanvas - Main canvas container using Konva
 * Provides Stage with zoom, pan, and layered rendering
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
// Helper Functions
// ============================================================================

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
  } = useMapStore();

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

      // Clamp zoom between 8 and 32
      const clampedZoom = clamp(newScale, 8, 32);

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
      style={{ cursor: viewport.isPanning ? 'grabbing' : 'grab' }}
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
      >
        {/* Terrain Layer - Bottom */}
        <Layer>
          <TerrainLayer mapData={layerMapData} />
        </Layer>

        {/* Grid Layer */}
        {layerVisibility.grid && (
          <Layer>
            <GridLayer width={width} height={height} />
          </Layer>
        )}

        {/* Building Layer */}
        <Layer>
          <BuildingLayer
            buildings={layerMapData.buildings}
            showPreview={layerVisibility.occupied}
          />
        </Layer>

        {/* Flag Layer - Top */}
        {layerVisibility.flags && (
          <Layer>
            <FlagLayer flags={layerMapData.flags} />
          </Layer>
        )}
      </Stage>
    </div>
  );
}

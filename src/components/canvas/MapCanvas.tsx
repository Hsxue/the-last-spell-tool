/**
 * MapCanvas - Main canvas container using Konva
 * Provides Stage with zoom, pan, and layered rendering
 * Includes mouse tracking for coordinate display
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useMapStore } from '../../store/mapStore';
import { useUIStore } from '../../store/uiStore';
import { TerrainLayer } from './TerrainLayer';
import { GridLayer } from './GridLayer';
import { BuildingLayer, BuildingPreview } from './BuildingLayer';
import { FlagLayer, FlagPreview } from './FlagLayer';
import { ContextMenu } from './ContextMenu';
import type { MapData } from '../../types/map';
import { canPlaceBuilding as canPlaceBuildingBlueprint } from '../../lib/placementEngine-blueprint';

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
  const [contextMenu, setContextMenu] = useState<{
    tileX: number;
    tileY: number;
    worldX: number;
    worldY: number;
    screenX: number;
    screenY: number;
  } | null>(null);
  
  // Ref for middle mouse panning
  const isMiddleMouseDownRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  
  // Ref for throttling custom events (reduce GC pressure)
  const lastEventTimeRef = useRef(0);

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
    selectedBuilding,
    selectedFlag,
    isRemoving,
    removeMode,
    buildingHealth,
    addBuilding,
    removeBuilding,
    addFlag,
    removeFlag,
  } = useMapStore();

  // Get UI store for toasts
  const { addToast } = useUIStore();

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

  // Handle middle mouse button for panning
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) { // Middle mouse button
      e.evt.preventDefault();
      isMiddleMouseDownRef.current = true;
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (pos) {
        lastMousePosRef.current = { x: pos.x, y: pos.y };
      }
    }
  }, []);

  const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) { // Middle mouse button
      isMiddleMouseDownRef.current = false;
    }
  }, []);

  const handleStageMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (isMiddleMouseDownRef.current && editorMode !== 'terrain' && editorMode !== 'eraser') {
      e.evt.preventDefault();
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const dx = pos.x - lastMousePosRef.current.x;
        const dy = pos.y - lastMousePosRef.current.y;
        setViewport({
          offsetX: viewport.offsetX + dx,
          offsetY: viewport.offsetY + dy,
          isPanning: true,
        });
        lastMousePosRef.current = { x: pos.x, y: pos.y };
      }
    }
  }, [editorMode, viewport.offsetX, viewport.offsetY, setViewport]);

  // Handle right click - show context menu
  const handleContextMenu = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      // Calculate tile coordinates
      const worldX = (pos.x - viewport.offsetX) / viewport.zoom;
      const worldY = (pos.y - viewport.offsetY) / viewport.zoom;
      const tileX = Math.floor(worldX / TILE_SIZE);
      const tileY = Math.floor(worldY / TILE_SIZE);

      // Set hovered tile for context menu
      if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
        setHoveredTile({ x: tileX, y: tileY });
        
        // Show context menu
        setContextMenu({
          tileX,
          tileY,
          worldX: Math.round(worldX * 100) / 100,
          worldY: Math.round(worldY * 100) / 100,
          screenX: pos.x,
          screenY: pos.y,
        });
      }
    },
    [viewport.offsetX, viewport.offsetY, viewport.zoom, width, height, setHoveredTile]
  );

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
      const newHoveredTile = (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height)
        ? { x: tileX, y: tileY }
        : null;
      
      // Update Zustand store (for status bar and BuildingPreview)
      setHoveredTile(newHoveredTile);

      // Dispatch custom event for MapStatusBar (THROTTLED to reduce GC pressure)
      // Only dispatch every 100ms to avoid creating too many objects
      const now = Date.now();
      if (!lastEventTimeRef.current || now - lastEventTimeRef.current > 16) {
        lastEventTimeRef.current = now;
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
      }
    },
    [viewport.offsetX, viewport.offsetY, viewport.zoom, width, height, setHoveredTile, editorMode]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredTile(null);
  }, [setHoveredTile]);

  // Handle canvas click for building placement and removal
  const handleCanvasClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      // Calculate tile coordinates from screen coordinates
      const worldX = (pos.x - viewport.offsetX) / viewport.zoom;
      const worldY = (pos.y - viewport.offsetY) / viewport.zoom;
      const tileX = Math.floor(worldX / TILE_SIZE);
      const tileY = Math.floor(worldY / TILE_SIZE);

      // Boundary check
      if (tileX < 0 || tileX >= width || tileY < 0 || tileY >= height) {
        return;
      }

      // Handle flag removal mode
      if (isRemoving && removeMode === 'flag') {
        // Get all flag types at this position and remove them
        if (mapData?.flags) {
          const flagsToRemove: string[] = [];
          mapData.flags.forEach((positions, flagType) => {
            if (positions.some((p) => p[0] === tileX && p[1] === tileY)) {
              flagsToRemove.push(flagType);
            }
          });
          // Remove each flag type at this position
          flagsToRemove.forEach((flagType) => {
            removeFlag(tileX, tileY, flagType);
          });
        }
        return;
      }

      // Handle flag placement mode
      if (selectedFlag && editorMode === 'flag') {
        // Check if this is a zone flag
        const isZoneFlag = selectedFlag.startsWith('Zone_');
        
        if (isZoneFlag) {
          // Zone flags need SizeX/SizeY from store - use default size of 1 for now
          // In full implementation, these would come from store configuration
          addFlag({
            flagType: selectedFlag,
            x: tileX,
            y: tileY,
          });
        } else {
          // Regular flags
          addFlag({
            flagType: selectedFlag,
            x: tileX,
            y: tileY,
          });
        }

        addToast({
          title: 'Flag Placed',
          description: `${selectedFlag} placed at (${tileX}, ${tileY})`,
          type: 'success',
          duration: 2000,
        });
        return;
      }

      // Handle building removal mode
      if (isRemoving && removeMode === 'building') {
        removeBuilding(tileX, tileY);
        return;
      }

      // Handle building placement
      if (selectedBuilding && editorMode === 'building') {
        // Validate placement using blueprint-based collision detection
        const placementResult = canPlaceBuildingBlueprint(
          selectedBuilding,
          tileX,
          tileY,
          { width, height },
          mapData?.buildings || []
        );

        if (!placementResult.valid) {
          // Show error toast for invalid placement
          addToast({
            title: 'Cannot Place Building',
            description: placementResult.reason || 'Invalid placement',
            type: 'error',
            duration: 3000,
          });
          return;
        }

        // Place the building
        addBuilding({
          id: selectedBuilding,
          x: tileX,
          y: tileY,
          health: buildingHealth,
        });

        addToast({
          title: 'Building Placed',
          description: `${selectedBuilding} placed at (${tileX}, ${tileY})`,
          type: 'success',
          duration: 2000,
        });
      }
    },
    [
      viewport.offsetX,
      viewport.offsetY,
      viewport.zoom,
      width,
      height,
      selectedBuilding,
      selectedFlag,
      editorMode,
      isRemoving,
      removeMode,
      buildingHealth,
      mapData?.buildings,
      mapData?.flags,
      addBuilding,
      removeBuilding,
      addFlag,
      removeFlag,
      addToast,
    ]
  );

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
      onContextMenu={(e) => e.preventDefault()}
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
        onMouseMove={(e) => {
          handleStageMouseMove(e);
          handleMouseMove(e);
        }}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Terrain Layer - Bottom (needs interaction for terrain drawing) */}
        <Layer imageSmoothingEnabled={false}>
          <TerrainLayer mapData={layerMapData} />
        </Layer>

        {/* Grid Layer - Static, no interaction needed */}
        {layerVisibility.grid && (
          <Layer imageSmoothingEnabled={false} listening={false}>
            <GridLayer width={width} height={height} zoom={viewport.zoom} offsetX={viewport.offsetX} offsetY={viewport.offsetY} />
          </Layer>
        )}

        {/* Building Layer - Static buildings only (pre-rendered for performance) */}
        <Layer imageSmoothingEnabled={false} listening={false}>
          <BuildingLayer
            buildings={layerMapData.buildings}
            mapWidth={width}
            mapHeight={height}
          />
        </Layer>

        {/* Building Preview Layer - Dynamic preview (reads from hoveredTile state and selectedBuilding) */}
        {editorMode === 'building' && (
          <Layer imageSmoothingEnabled={false}>
            <BuildingPreview 
              hoveredTile={useMapStore.getState().hoveredTile} 
              selectedBuilding={useMapStore.getState().selectedBuilding}
            />
          </Layer>
        )}

        {/* Flag Layer - Top, static, no interaction needed */}
        {layerVisibility.flags && (
          <Layer imageSmoothingEnabled={false} listening={false}>
            <FlagLayer mapData={layerMapData} />
          </Layer>
        )}

        {/* Flag Preview Layer - Dynamic preview */}
        {editorMode === 'flag' && (
          <Layer imageSmoothingEnabled={false}>
            <FlagPreview 
              hoveredTile={useMapStore.getState().hoveredTile}
              selectedFlag={useMapStore.getState().selectedFlag}
            />
          </Layer>
        )}
      </Stage>
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          tileX={contextMenu.tileX}
          tileY={contextMenu.tileY}
          worldX={contextMenu.worldX}
          worldY={contextMenu.worldY}
          screenX={contextMenu.screenX}
          screenY={contextMenu.screenY}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

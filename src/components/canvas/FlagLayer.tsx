/**
 * FlagLayer - Renders tile flags and markers on the map
 * Phase 2 Task 12: Zone flag rectangle rendering with viewport culling
 *
 * Features:
 * - Zone flags render as colored rectangles using ZONE_COLORS
 * - Special flags render as text markers using FLAG_CONFIG
 * - Visibility toggles per flag type from store layerVisibility
 * - Viewport culling for performance with 100+ flags
 * - Konva batching optimization
 */

import { useMemo, useRef, useEffect, memo } from 'react';
import { Rect, Text, Group } from 'react-konva';
import type { Group as KonvaGroup } from 'konva/lib/Group';
import type { MapData, ViewportState } from '../../types/map';
import { FLAG_CONFIG, ZONE_COLORS, ZONE_FLAGS } from '../../types/map';
import { useMapStore } from '../../store/mapStore';
import { getVisibleTileRange, isTileVisible } from '../../lib/viewportCulling';

// ============================================================================
// Constants
// ============================================================================

/** Size of each tile in pixels */
const TILE_SIZE = 20;

/** Default zone flag size (1x1 tile) */
const DEFAULT_ZONE_SIZE = 1;

/** Zone flag rectangle opacity */
const ZONE_OPACITY = 0.5;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a flag type is a zone flag
 */
function isZoneFlag(flagType: string): boolean {
  return flagType.startsWith('Zone_') || ZONE_FLAGS.includes(flagType as typeof ZONE_FLAGS[number]);
}

/**
 * Get zone flag color from ZONE_COLORS
 */
function getZoneColor(flagType: string): string {
  return ZONE_COLORS[flagType] || '#FFB6C1';
}

/**
 * Get special flag config from FLAG_CONFIG
 */
function getSpecialFlagConfig(flagType: string): {
  marker: string;
  color: string;
  size: number;
} {
  const config = FLAG_CONFIG[flagType];
  if (config) {
    return {
      marker: config.marker,
      color: config.color,
      size: config.size,
    };
  }

  // Default configuration
  return {
    marker: '●',
    color: '#FF69B4',
    size: 10,
  };
}

/**
 * Get zone flag label (e.g., "Zone_E" -> "E")
 */
function getZoneLabel(flagType: string): string {
  return flagType.replace('Zone_', '');
}

// ============================================================================
// Props Interface
// ============================================================================

interface FlagLayerProps {
  /** Map data containing flag information */
  mapData: MapData;
  /** Viewport state for coordinate transformation */
  viewport: ViewportState;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * FlagLayer Component
 *
 * Renders zone flags as colored rectangles and special flags as markers.
 * Uses viewport culling for performance optimization with large flag counts.
 */
export function FlagLayer({ mapData, viewport }: FlagLayerProps) {
  const { flags } = mapData;
  const groupRef = useRef<KonvaGroup>(null);

  // Get layer visibility from store
  const { layerVisibility } = useMapStore();
  const showZones = layerVisibility.zones;
  const showSpecialFlags = layerVisibility.flags;

  /**
   * Calculate visible tile range based on viewport
   * Used for culling flag elements outside the viewport
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
      mapData.width * TILE_SIZE,
      mapData.height * TILE_SIZE,
      TILE_SIZE
    );
  }, [viewport.offsetX, viewport.offsetY, viewport.zoom, mapData.width, mapData.height]);

  /**
   * Memoized zone flag rendering elements
   * Renders zone flags as colored rectangles with labels
   * Uses viewport culling to only render visible zones
   */
  const zoneFlagElements = useMemo(() => {
    if (!showZones) return [];

    const elements: React.ReactNode[] = [];

    flags.forEach((positions, flagType) => {
      if (!isZoneFlag(flagType)) return;

      const color = getZoneColor(flagType);
      const label = getZoneLabel(flagType);

      positions.forEach(([x, y], index) => {
        // Viewport culling - skip if not visible
        if (!isTileVisible(x, y, visibleRange)) return;

        const key = `${flagType}-${x}-${y}-${index}`;
        const pixelX = x * TILE_SIZE;
        const pixelY = y * TILE_SIZE;
        const size = DEFAULT_ZONE_SIZE * TILE_SIZE;

        elements.push(
          <Group key={key}>
            {/* Zone rectangle */}
            <Rect
              x={pixelX}
              y={pixelY}
              width={size}
              height={size}
              fill={color}
              opacity={ZONE_OPACITY}
              stroke={color}
              strokeWidth={1}
              perfectDrawEnabled={false}
              listening={false}
              hitStrokeWidth={0}
            />
            {/* Zone label */}
            <Text
              x={pixelX}
              y={pixelY + size * 0.25}
              width={size}
              height={size * 0.5}
              text={label}
              fontSize={size * 0.5}
              fontFamily="sans-serif"
              fill="#333"
              align="center"
              verticalAlign="middle"
              listening={false}
              perfectDrawEnabled={false}
            />
          </Group>
        );
      });
    });

    return elements;
  }, [flags, showZones, visibleRange]);

  /**
   * Memoized special flag rendering elements
   * Renders special flags as text markers
   * Uses viewport culling to only render visible markers
   */
  const specialFlagElements = useMemo(() => {
    if (!showSpecialFlags) return [];

    const elements: React.ReactNode[] = [];

    flags.forEach((positions, flagType) => {
      if (isZoneFlag(flagType)) return;

      const config = getSpecialFlagConfig(flagType);

      positions.forEach(([x, y], index) => {
        // Viewport culling - skip if not visible
        if (!isTileVisible(x, y, visibleRange)) return;

        const key = `${flagType}-${x}-${y}-${index}`;
        const pixelX = x * TILE_SIZE;
        const pixelY = y * TILE_SIZE;
        const fontSize = Math.min(TILE_SIZE * 0.6, config.size);

        elements.push(
          <Text
            key={key}
            x={pixelX + (TILE_SIZE - fontSize) / 2}
            y={pixelY + (TILE_SIZE - fontSize) / 2}
            text={config.marker}
            fontSize={fontSize}
            fontFamily="sans-serif"
            fill={config.color}
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      });
    });

    return elements;
  }, [flags, showSpecialFlags, visibleRange]);

  // Cache the flag group for performance
  useEffect(() => {
    if (!groupRef.current || (zoneFlagElements.length === 0 && specialFlagElements.length === 0)) return;

    const frameId = requestAnimationFrame(() => {
      groupRef.current?.clearCache();
      groupRef.current?.cache();
      groupRef.current?.getLayer()?.batchDraw();
    });

    return () => cancelAnimationFrame(frameId);
  }, [zoneFlagElements, specialFlagElements]);

  return (
    <Group ref={groupRef}>
      {/* Zone flags layer (rectangles) */}
      {zoneFlagElements}
      {/* Special flags layer (markers) */}
      {specialFlagElements}
    </Group>
  );
}

// ============================================================================
// Preview Component
// ============================================================================

interface FlagPreviewProps {
  hoveredTile: { x: number; y: number } | null;
  selectedFlag: string | null;
}

export const FlagPreview = memo(function FlagPreview({ hoveredTile, selectedFlag }: FlagPreviewProps) {
  if (!hoveredTile || !selectedFlag) return null;

  const isZone = isZoneFlag(selectedFlag);
  
  if (isZone) {
    // Zone flag preview - show rectangle
    const color = getZoneColor(selectedFlag);
    const label = getZoneLabel(selectedFlag);
    const size = DEFAULT_ZONE_SIZE * TILE_SIZE;
    
    return (
      <Group listening={false}>
        {/* Zone rectangle preview */}
        <Rect
          x={hoveredTile.x * TILE_SIZE}
          y={hoveredTile.y * TILE_SIZE}
          width={size}
          height={size}
          fill={color}
          opacity={ZONE_OPACITY}
          stroke={color}
          strokeWidth={2}
          perfectDrawEnabled={false}
          listening={false}
        />
        {/* Zone label preview */}
        <Text
          x={hoveredTile.x * TILE_SIZE}
          y={hoveredTile.y * TILE_SIZE + size * 0.25}
          width={size}
          height={size * 0.5}
          text={label}
          fontSize={size * 0.5}
          fontFamily="sans-serif"
          fill="#333"
          align="center"
          verticalAlign="middle"
          listening={false}
          perfectDrawEnabled={false}
        />
      </Group>
    );
  } else {
    // Special flag preview - show marker
    const config = getSpecialFlagConfig(selectedFlag);
    const fontSize = Math.min(TILE_SIZE * 0.6, config.size);
    
    return (
      <Group listening={false}>
        <Text
          x={hoveredTile.x * TILE_SIZE + (TILE_SIZE - fontSize) / 2}
          y={hoveredTile.y * TILE_SIZE + (TILE_SIZE - fontSize) / 2}
          text={config.marker}
          fontSize={fontSize}
          fontFamily="sans-serif"
          fill={config.color}
          opacity={0.7}
          listening={false}
          perfectDrawEnabled={false}
        />
      </Group>
    );
  }
});

// ============================================================================
// Exports
// ============================================================================

export type { FlagLayerProps };

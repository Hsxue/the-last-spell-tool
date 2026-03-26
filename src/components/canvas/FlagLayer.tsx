/**
 * FlagLayer - Renders tile flags using pre-rendered canvas for optimal performance
 * 
 * Features:
 * - Zone flags render as colored rectangles using ZONE_COLORS
 * - Special flags render as text markers using FLAG_CONFIG
 * - Pre-renders all flags to offscreen canvas
 * - Uses Konva Image for GPU-accelerated rendering
 * - Visibility toggles per flag type from store layerVisibility
 */

import { useState, useEffect, useRef, memo } from 'react';
import { Image as KonvaImage, Text, Group } from 'react-konva';
import type { MapData } from '../../types/map';
import { FLAG_CONFIG, ZONE_COLORS, ZONE_FLAGS } from '../../types/map';
import { useMapStore } from '../../store/mapStore';

// ============================================================================
// Props Interface
// ============================================================================

interface FlagLayerProps {
  /** Map data containing flag information */
  mapData: MapData;
}

// ============================================================================
// Constants
// ============================================================================

const TILE_SIZE = 20;
const DEFAULT_ZONE_SIZE = 1;
const ZONE_OPACITY = 0.5;

// ============================================================================
// Helper Functions
// ============================================================================

function isZoneFlag(flagType: string): boolean {
  return flagType.startsWith('Zone_') || ZONE_FLAGS.includes(flagType as any);
}

function getZoneColor(flagType: string): string {
  return ZONE_COLORS[flagType] || '#FFB6C1';
}

function getZoneLabel(flagType: string): string {
  return flagType.replace('Zone_', '');
}

function getSpecialFlagConfig(flagType: string) {
  const config = FLAG_CONFIG[flagType];
  if (config) {
    return {
      marker: config.marker,
      color: config.color,
      size: config.size,
    };
  }
  return {
    marker: '●',
    color: '#FF69B4',
    size: 10,
  };
}

/**
 * Pre-render all flags to offscreen canvas
 */
function preRenderFlags(
  flags: Map<string, Array<[number, number]>>,
  width: number,
  height: number,
  showZones: boolean,
  showSpecialFlags: boolean
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width * TILE_SIZE;
  canvas.height = height * TILE_SIZE;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return canvas;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  flags.forEach((positions, flagType) => {
    const isZone = isZoneFlag(flagType);
    
    if (isZone && !showZones) return;
    if (!isZone && !showSpecialFlags) return;
    
    if (isZone) {
      // Render zone flags as rectangles with labels
      const color = getZoneColor(flagType);
      const label = getZoneLabel(flagType);
      
      positions.forEach(([x, y]) => {
        const pixelX = x * TILE_SIZE;
        const pixelY = y * TILE_SIZE;
        const size = DEFAULT_ZONE_SIZE * TILE_SIZE;
        
        // Zone rectangle
        ctx.fillStyle = color;
        ctx.globalAlpha = ZONE_OPACITY;
        ctx.fillRect(pixelX, pixelY, size, size);
        ctx.globalAlpha = 1.0;
        
        // Zone label
        ctx.fillStyle = '#333';
        ctx.font = `bold ${size * 0.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          label,
          pixelX + size / 2,
          pixelY + size / 2
        );
      });
    } else {
      // Render special flags as text markers
      const config = getSpecialFlagConfig(flagType);
      
      positions.forEach(([x, y]) => {
        const pixelX = x * TILE_SIZE;
        const pixelY = y * TILE_SIZE;
        const fontSize = Math.min(TILE_SIZE * 0.6, config.size);
        
        ctx.fillStyle = config.color;
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          config.marker,
          pixelX + TILE_SIZE / 2,
          pixelY + TILE_SIZE / 2
        );
      });
    }
  });
  
  return canvas;
}

// ============================================================================
// Main Component
// ============================================================================

export function FlagLayer({ mapData }: FlagLayerProps) {
  const { flags, width, height } = mapData;
  const flagCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Get layer visibility from store
  const { layerVisibility } = useMapStore();
  const showZones = layerVisibility.zones;
  const showSpecialFlags = layerVisibility.flags;
  
  // Force re-render when flag canvas updates
  const [, forceUpdate] = useState({});

  /**
   * Pre-render flags canvas when flags or visibility changes
   */
  useEffect(() => {
    flagCanvasRef.current = preRenderFlags(flags, width, height, showZones, showSpecialFlags);
    forceUpdate({});
  }, [flags, width, height, showZones, showSpecialFlags]);

  // Calculate canvas dimensions
  const canvasWidth = width * TILE_SIZE;
  const canvasHeight = height * TILE_SIZE;

  return (
    <Group>
      {/* Pre-rendered flags layer */}
      {flagCanvasRef.current && (
        <KonvaImage
          image={flagCanvasRef.current}
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
    </Group>
  );
}

// ============================================================================
// Preview Component (for editing)
// ============================================================================

interface FlagPreviewProps {
  hoveredTile: { x: number; y: number } | null;
  selectedFlag: string | null;
}

export const FlagPreview = memo(function FlagPreview({ hoveredTile, selectedFlag }: FlagPreviewProps) {
  if (!hoveredTile || !selectedFlag) return null;

  const isZone = isZoneFlag(selectedFlag);
  
  if (isZone) {
    const color = getZoneColor(selectedFlag);
    const label = getZoneLabel(selectedFlag);
    const size = DEFAULT_ZONE_SIZE * TILE_SIZE;
    
    return (
      <Group listening={false}>
        {/* Zone rectangle preview */}
        <Text
          x={hoveredTile.x * TILE_SIZE}
          y={hoveredTile.y * TILE_SIZE}
          width={size}
          height={size}
          text=""
          fill={color}
          opacity={ZONE_OPACITY}
          listening={false}
          perfectDrawEnabled={false}
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
    );
  }
});

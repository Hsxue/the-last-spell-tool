/**
 * MapStatusBar - Displays mouse coordinates, terrain information, and current editor state
 * Shows screen coords, world coords, tile position, terrain type, active tool, and zoom level
 */

import { useState, useEffect } from 'react';
import { useMapStore, selectTerrainAt } from '../store/mapStore';
import { FLAG_CONFIG } from './sidebar/FlagSidebar';

// ============================================================================
// Types
// ============================================================================

interface MouseCoordinates {
  screenX: number;
  screenY: number;
  worldX: number;
  worldY: number;
  tileX: number;
  tileY: number;
}

// Editor mode display names
const MODE_LABELS: Record<string, string> = {
  terrain: '画笔',
  eraser: '橡皮擦',
  building: '建筑',
  flag: '旗帜',
};

// ============================================================================
// Component
// ============================================================================

export function MapStatusBar() {
  const hoveredTile = useMapStore((state) => state.hoveredTile);
  const terrain = useMapStore(
    hoveredTile ? selectTerrainAt(hoveredTile.x, hoveredTile.y) : () => 'Empty'
  );

  // Track mouse coordinates from MapCanvas events
  const [coords, setCoords] = useState<MouseCoordinates>({
    screenX: 0,
    screenY: 0,
    worldX: 0,
    worldY: 0,
    tileX: 0,
    tileY: 0,
  });

  useEffect(() => {
    const handleMouseCoords = (e: Event) => {
      const customEvent = e as CustomEvent<MouseCoordinates>;
      setCoords(customEvent.detail);
    };

    window.addEventListener('mousecoords', handleMouseCoords);
    return () => window.removeEventListener('mousecoords', handleMouseCoords);
  }, []);

  // Editor state
  const editorMode = useMapStore((state) => state.editorMode);
  const brushSize = useMapStore((state) => state.brushSize);
  const selectedBuilding = useMapStore((state) => state.selectedBuilding);
  const selectedFlag = useMapStore((state) => state.selectedFlag);
  const isRemoving = useMapStore((state) => state.isRemoving);
  const viewport = useMapStore((state) => state.viewport);

  // Hovered tile building and flags
  const hoveredBuilding = useMapStore((state) => {
    if (!hoveredTile || !state.mapData) return null;
    return state.mapData.buildings.find(
      (b) => b.x === hoveredTile.x && b.y === hoveredTile.y
    ) ?? null;
  });
  const hoveredFlags = useMapStore((state) => {
    if (!hoveredTile || !state.mapData) return null;
    const key = `${hoveredTile.x},${hoveredTile.y}`;
    const flags = state.mapData.flags.get(key);
    return flags ?? null;
  });

  // Build status display text
  const statusText = (() => {
    if (isRemoving) {
      return `🗑️ 删除模式 · ${MODE_LABELS[editorMode] || editorMode}`;
    }
    switch (editorMode) {
      case 'terrain':
        return `🖌️ ${MODE_LABELS[editorMode]} · 大小 ${brushSize}`;
      case 'building':
        return selectedBuilding ? `🔨 ${selectedBuilding}` : '🔨 请选择建筑';
      case 'flag':
        return selectedFlag ? `🚩 ${selectedFlag}` : '🚩 请选择旗帜';
      default:
        return MODE_LABELS[editorMode] || editorMode;
    }
  })();

  // Build hovered tile details
  const hoveredDetails = (() => {
    const parts: string[] = [];
    if (hoveredBuilding) {
      parts.push(`🏗️ ${hoveredBuilding.id} (HP:${hoveredBuilding.health})`);
    }
    if (hoveredFlags && hoveredFlags.length > 0) {
      parts.push(`🚩 ${hoveredFlags.map((f: string) => FLAG_CONFIG[f]?.marker || f).join(' ')}`);
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  })();

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-background border-t border-border text-sm">
      {/* Current tool / mode */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <span className="text-muted-foreground">工具:</span>
        <span className="font-medium text-primary">{statusText}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Zoom level */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">缩放:</span>
        <span className="font-mono">{viewport.zoom}x</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Screen coordinates */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Screen:</span>
        <span className="font-mono">
          {coords.screenX}, {coords.screenY}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Tile coordinates */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Tile:</span>
        <span className="font-mono">
          {hoveredTile ? `${hoveredTile.x}, ${hoveredTile.y}` : '--, --'}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Terrain type */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Terrain:</span>
        <span className="font-medium">
          {hoveredTile ? terrain : '--'}
        </span>
      </div>

      {/* Hovered tile details (building / flags) */}
      {hoveredDetails && (
        <>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">{hoveredDetails}</span>
          </div>
        </>
      )}

      {/* Spacer to push everything left */}
      <div className="flex-1" />

      {/* Quick hint */}
      <div className="text-xs text-muted-foreground">
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">中键</kbd> 平移
        {' · '}
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">滚轮</kbd> 缩放
        {' · '}
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">右键</kbd> 查看瓦片
      </div>
    </div>
  );
}

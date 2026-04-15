/**
 * MapStatusBar - Displays mouse coordinates, terrain information, and current editor state
 * Shows screen coords, world coords, tile position, terrain type, active tool, and zoom level
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapStore, selectTerrainAt } from '../store/mapStore';

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

// Editor mode display names (use translation keys)
const MODE_LABELS: Record<string, string> = {
  terrain: 'statusBar.mode.terrain',
  eraser: 'statusBar.mode.eraser',
  building: 'statusBar.mode.building',
  flag: 'statusBar.mode.flag',
};

// ============================================================================
// Component
// ============================================================================

export function MapStatusBar() {
  const { t } = useTranslation('common');
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
    return state.mapData.flags.get(key) ?? null;
  });

  // Build status display text
  const statusText = (() => {
    const modeLabel = MODE_LABELS[editorMode] ? t(MODE_LABELS[editorMode]) : editorMode;
    if (isRemoving) {
      return `🗑️ ${t('statusBar.deleteMode')} · ${modeLabel}`;
    }
    switch (editorMode) {
      case 'terrain':
        return `🖌️ ${modeLabel} · ${t('statusBar.size')} ${brushSize}`;
      case 'building':
        return selectedBuilding ? `🔨 ${selectedBuilding}` : `🔨 ${t('statusBar.selectBuilding')}`;
      case 'flag':
        return selectedFlag ? `🚩 ${selectedFlag}` : `🚩 ${t('statusBar.selectFlag')}`;
      default:
        return modeLabel;
    }
  })();

  // Build hovered tile details
  const hoveredDetails = (() => {
    const parts: string[] = [];
    if (hoveredBuilding) {
      parts.push(`🏗️ ${hoveredBuilding.id} (HP:${hoveredBuilding.health})`);
    }
    if (hoveredFlags && hoveredFlags.length > 0) {
      parts.push(`🚩 x${hoveredFlags.length}`);
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  })();

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-background border-t border-border text-sm">
      {/* Current tool / mode */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <span className="text-muted-foreground">{t('statusBar.tool')}:</span>
        <span className="font-medium text-primary">{statusText}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Zoom level */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t('statusBar.zoom')}:</span>
        <span className="font-mono">{viewport.zoom.toFixed(2)}x</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Screen coordinates */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t('statusBar.screen')}:</span>
        <span className="font-mono">
          {coords.screenX}, {coords.screenY}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Tile coordinates */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t('statusBar.tile')}:</span>
        <span className="font-mono">
          {hoveredTile ? `${hoveredTile.x}, ${hoveredTile.y}` : '--, --'}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Terrain type */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t('statusBar.terrain')}:</span>
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
    </div>
  );
}

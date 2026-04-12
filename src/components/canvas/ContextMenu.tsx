/**
 * ContextMenu - Right-click context menu for map tiles
 * Displays all layer information for the selected tile
 */

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { MapData, TerrainType, Building } from '../../types/map';
import { BUILDING_BLUEPRINTS } from '../../data/buildingBlueprints';

interface ContextMenuProps {
  tileX: number;
  tileY: number;
  worldX: number;
  worldY: number;
  screenX: number;
  screenY: number;
  mapData: MapData | null;
  onClose: () => void;
}

// Terrain type display names and colors
const TERRAIN_INFO: Record<TerrainType, { name: string; color: string; bgColor: string }> = {
  Crater: { name: '火山口', color: '#8B4513', bgColor: '#F5E6D3' },
  Dirt: { name: '草地', color: '#228B22', bgColor: '#E8F5E9' },
  Stone: { name: '石头', color: '#808080', bgColor: '#E8E8E8' },
  Empty: { name: '空地', color: '#666666', bgColor: '#F5F5F5' },
};

// Get all tiles occupied by a building
function getBuildingTilePositions(building: Building): Array<[number, number]> {
  const blueprint = BUILDING_BLUEPRINTS.find(bp => bp.id === building.id);
  if (!blueprint) return [];
  
  const positions: Array<[number, number]> = [];
  const baseX = building.x - blueprint.originX;
  const baseY = building.y - blueprint.originY;

  blueprint.tiles.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== '_') {
        positions.push([baseX + colIndex, baseY + rowIndex]);
      }
    });
  });

  return positions;
}

// Check if a tile is within a building's occupied area
function isTileInBuilding(tileX: number, tileY: number, building: Building): boolean {
  const positions = getBuildingTilePositions(building);
  return positions.some(([x, y]) => x === tileX && y === tileY);
}

export function ContextMenu({ tileX, tileY, worldX, worldY, screenX, screenY, mapData, onClose }: ContextMenuProps) {
  const [position, setPosition] = useState({ x: screenX, y: screenY });

  // Calculate tile information
  const tileInfo = useMemo(() => {
    if (!mapData) return null;

    const info = {
      terrain: undefined as TerrainType | undefined,
      buildings: [] as Array<{ id: string; health?: number; isPrimary: boolean }>,
      flags: [] as string[],
    };

    // Get terrain
    const terrainKey = `${tileX},${tileY}`;
    info.terrain = mapData.terrain.get(terrainKey);

    // Get buildings - check ALL buildings for actual tile occupancy
    mapData.buildings.forEach((building) => {
      if (isTileInBuilding(tileX, tileY, building)) {
        // First building found is considered primary (anchor tile)
        const isPrimary = building.x === tileX && building.y === tileY;
        info.buildings.push({ 
          id: building.id, 
          health: building.health,
          isPrimary,
        });
      }
    });

    // Get flags
    if (mapData.flags) {
      mapData.flags.forEach((positions, flagType) => {
        if (positions.some(p => p[0] === tileX && p[1] === tileY)) {
          info.flags.push(flagType);
        }
      });
    }

    return info;
  }, [mapData, tileX, tileY]);

  useEffect(() => {
    // Position menu at bottom-right of mouse cursor to avoid covering it
    const menuWidth = 240;
    const menuHeight = 200;
    const padding = 10;
    const mouseOffset = 25;

    let newX = screenX + mouseOffset;
    let newY = screenY + mouseOffset;

    if (newX + menuWidth > window.innerWidth - padding) {
      newX = screenX - menuWidth - mouseOffset;
    }

    if (newY + menuHeight > window.innerHeight - padding) {
      newY = screenY - menuHeight - mouseOffset;
    }

    setPosition({ x: newX, y: newY });

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    // Close on any click outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.context-menu')) return;
      onClose();
    };

    window.addEventListener('mousedown', handleClickOutside, { once: true });

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [screenX, screenY, onClose]);

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${tileX},${tileY}`);
    onClose();
  };

  const handleCenterCamera = () => {
    window.dispatchEvent(new CustomEvent('centerontile', {
      detail: { tileX, tileY },
    }));
    onClose();
  };

  const terrainData = tileInfo?.terrain ? TERRAIN_INFO[tileInfo.terrain] : null;

  return createPortal(
    <div
      className="context-menu fixed bg-background border border-border rounded-lg shadow-lg py-2 z-50 w-[240px]"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header - Coordinates */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Tile ({tileX}, {tileY})</span>
          <button
            onClick={handleCopyCoordinates}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="复制坐标"
          >
            📋
          </button>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          World: ({worldX.toFixed(2)}, {worldY.toFixed(2)})
        </div>
      </div>

      {/* Layer Information */}
      <div className="px-3 py-2 space-y-2">
        {/* Terrain Layer */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground w-12">地形</span>
          {terrainData ? (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ color: terrainData.color, backgroundColor: terrainData.bgColor }}
            >
              {terrainData.name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">未设置</span>
          )}
        </div>

        {/* Building Layer */}
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-muted-foreground w-12 pt-0.5">建筑</span>
          {tileInfo?.buildings && tileInfo.buildings.length > 0 ? (
            <div className="flex flex-col gap-1">
              {tileInfo.buildings.map((building, index) => (
                <div key={`${building.id}-${index}`} className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-foreground">
                      {building.id}
                    </span>
                    {building.isPrimary && (
                      <span className="text-[10px] text-primary" title="建筑锚点">
                        ★
                      </span>
                    )}
                  </div>
                  {building.health !== undefined && (
                    <span className="text-[10px] text-muted-foreground">
                      HP: {building.health}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">无</span>
          )}
        </div>

        {/* Flags Layer */}
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-muted-foreground w-12 pt-0.5">标记</span>
          {tileInfo?.flags && tileInfo.flags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tileInfo.flags.map((flag) => (
                <span
                  key={flag}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground"
                >
                  {flag}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">无</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border mt-2 pt-2 px-3">
        <button
          onClick={handleCenterCamera}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <span>🎯</span>
          <span>Center Camera</span>
        </button>
      </div>
    </div>,
    document.body
  );
}

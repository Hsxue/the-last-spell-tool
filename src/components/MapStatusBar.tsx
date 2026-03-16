/**
 * MapStatusBar - Displays mouse coordinates and terrain information
 * Shows screen coordinates, world coordinates, tile position and terrain type at cursor
 */

import { useState, useEffect } from 'react';
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

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-background border-t border-border text-sm">
      {/* Screen coordinates */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Screen:</span>
        <span className="font-mono">
          {coords.screenX}, {coords.screenY}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* World coordinates */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">World:</span>
        <span className="font-mono">
          {coords.worldX.toFixed(2)}, {coords.worldY.toFixed(2)}
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
    </div>
  );
}

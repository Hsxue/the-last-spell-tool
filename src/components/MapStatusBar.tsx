/**
 * MapStatusBar - Displays mouse coordinates and terrain information
 * Shows screen coordinates, world coordinates, tile position and terrain type at cursor
 */

import { useState, useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import { BUILDING_BLUEPRINTS } from '../data/buildingBlueprints';

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
// Helper Functions
// ============================================================================

// Pure helper functions that take data as parameters instead of calling hooks internally
function getBuildingDisplayInfo(building: any) {
  if (!building) {
    return null;
  }

  // Look up building blueprint to count tiles
  const blueprint = BUILDING_BLUEPRINTS.find(b => b.id === building.id);
  let tileCount = 1; // Default to 1 if blueprint not found
  
  if (blueprint) {
    // Count the number of 'B', 'E', 'H', '_' cells in the blueprint's tiles
    tileCount = 0;
    blueprint.tiles.forEach(row => {
      row.forEach(cell => {
        if (cell === 'B' || cell === 'E' || cell === 'H' || cell === '_') {
          tileCount++;
        }
      });
    });
  }

  const healthDisplay = building.health !== undefined ? building.health.toString() : 'None';
  
  return `Building: ${building.id} | Health: ${healthDisplay} | ${tileCount} tiles`;
}

function getFlagDisplayInfo(flags: string[] | null) {
  if (!flags || flags.length === 0) {
    return null;
  }
  
  return `Flags: ${flags.join(', ')}`;
}

// ============================================================================
// Component
// ============================================================================

export function MapStatusBar() {
  const hoveredTile = useMapStore((state) => state.hoveredTile);
  
  // Extract building, flag and terrain data at component level using a single stable selector
  // This prevents infinite re-render loops caused by curried selectors returning new functions each render
  const { buildingData, flagData, terrain } = useMapStore((state) => {
    if (!hoveredTile || !state.mapData) {
      return { buildingData: null, flagData: [], terrain: 'Empty' };
    }
    
    // Find building at the current hover position
    const building = state.mapData.buildings?.find(b => b.x === hoveredTile.x && b.y === hoveredTile.y) || null;
    
    // Find flags at the current hover position
    const flagsAtPos: string[] = [];
    state.mapData.flags?.forEach((positions, flagType) => {
      const hasFlagAtPos = positions.some(([x, y]) => x === hoveredTile.x && y === hoveredTile.y);
      if (hasFlagAtPos) {
        flagsAtPos.push(flagType);
      }
    });
    
    // Get terrain at the current position
    const tileTerrain = state.mapData.terrain?.get(`${hoveredTile.x},${hoveredTile.y}`) || 'Empty';
    
    return {
      buildingData: building,
      flagData: flagsAtPos,
      terrain: tileTerrain
    };
  });
  
  // Get building and flag info for the hovered tile using pure functions
  let buildingInfo = null;
  let flagInfo = null;

  if (hoveredTile) {
    buildingInfo = getBuildingDisplayInfo(buildingData);
    flagInfo = getFlagDisplayInfo(flagData);
  }

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

  // Format additional info when tile is hovered
  let additionalInfo = '';
  if (hoveredTile) {
    const buildingPart = buildingInfo || '';
    const flagPart = flagInfo || '';
    
    // Combine the information using the required format, avoiding extra separators
    const parts = [];
    if (buildingPart) {
      parts.push(buildingPart);
    }
    if (flagPart) {
      parts.push(flagPart);
    }
    
    if (parts.length > 0) {
      additionalInfo = ' | ' + parts.join(' | ');
    }
  }

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

      {/* Terrain type and additional info */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Info:</span>
        <span className="font-medium">
          {hoveredTile 
            ? `(${hoveredTile.x}, ${hoveredTile.y}) | Terrain: ${terrain}${additionalInfo}`
            : '--'}
        </span>
      </div>
    </div>
  );
}

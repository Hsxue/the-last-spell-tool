/**
 * TerrainLayer - Renders terrain tiles on the map
 * Phase 2 Task 1: Placeholder implementation
 * Phase 2 Task 2: Full terrain rendering logic
 */

import { Rect } from 'react-konva';
import type { MapData, TerrainType } from '../../types/map';
import { TERRAIN_COLORS } from '../../types/map';

interface TerrainLayerProps {
  mapData: MapData;
}

function getTerrainColor(terrain: TerrainType): string {
  return TERRAIN_COLORS[terrain] || 'transparent';
}

export function TerrainLayer({ mapData }: TerrainLayerProps) {
  const { terrain } = mapData;
  const tileSize = 20;

  return (
    <>
      {Array.from(terrain.entries()).map(([key, terrainType]) => {
        const [x, y] = key.split(',').map(Number);
        return (
          <Rect
            key={`terrain-${key}`}
            x={x * tileSize}
            y={y * tileSize}
            width={tileSize}
            height={tileSize}
            fill={getTerrainColor(terrainType)}
          />
        );
      })}
    </>
  );
}

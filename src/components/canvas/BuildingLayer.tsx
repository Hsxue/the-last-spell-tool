/**
 * BuildingLayer - Renders buildings using pre-rendered canvas for optimal performance
 */

import { useState, useEffect, useRef, memo } from 'react';
import { Image as KonvaImage, Rect, Group, Circle } from 'react-konva';
import type { Building } from '../../types/map';
import { BUILDING_CATEGORY_COLORS } from '../../types/map';
import { BUILDING_BLUEPRINTS } from '../../data/buildingBlueprints';

interface BuildingLayerProps {
  buildings: Building[];
  mapWidth: number;
  mapHeight: number;
}

const TILE_SIZE = 20;
const blueprintLookup = new Map(BUILDING_BLUEPRINTS.map(bp => [bp.id, bp]));

function getBuildingTilePositions(building: Building, blueprint: typeof BUILDING_BLUEPRINTS[0]): Array<[number, number]> {
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

function preRenderBuildings(buildings: Building[], mapWidth: number, mapHeight: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = mapWidth * TILE_SIZE;
  canvas.height = mapHeight * TILE_SIZE;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return canvas;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  buildings.forEach((building) => {
    const blueprint = blueprintLookup.get(building.id);
    if (!blueprint) return;
    
    const color = BUILDING_CATEGORY_COLORS[blueprint.category] || BUILDING_CATEGORY_COLORS.Building;
    const positions = getBuildingTilePositions(building, blueprint);
    
    positions.forEach(([tileX, tileY]) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = 1;
      ctx.strokeRect(tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
  });
  
  return canvas;
}

export const BuildingLayer = memo(function BuildingLayer({ buildings, mapWidth, mapHeight }: BuildingLayerProps) {
  const buildingsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    buildingsCanvasRef.current = preRenderBuildings(buildings, mapWidth, mapHeight);
    forceUpdate({});
  }, [buildings, mapWidth, mapHeight]);

  const canvasWidth = mapWidth * TILE_SIZE;
  const canvasHeight = mapHeight * TILE_SIZE;

  return (
    <Group>
      {buildingsCanvasRef.current && (
        <KonvaImage
          image={buildingsCanvasRef.current}
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
});

interface BuildingPreviewProps {
  hoveredTile: { x: number; y: number } | null;
  selectedBuilding: string | null;
}

export const BuildingPreview = memo(function BuildingPreview({ hoveredTile, selectedBuilding }: BuildingPreviewProps) {
  if (!hoveredTile || !selectedBuilding) return null;

  const blueprint = blueprintLookup.get(selectedBuilding);
  if (!blueprint) return null;

  const color = '#4CAF50';
  const opacity = 0.5;
  
  const baseX = hoveredTile.x - blueprint.originX;
  const baseY = hoveredTile.y - blueprint.originY;
  
  const tileWidth = blueprint.tiles[0]?.length || 1;
  const tileHeight = blueprint.tiles.length;

  return (
    <Group listening={false}>
      {blueprint.tiles.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          if (cell === '_') return null;
          
          const tileX = (baseX + colIndex) * TILE_SIZE;
          const tileY = (baseY + rowIndex) * TILE_SIZE;
          
          return (
            <Rect
              key={`preview-${rowIndex}-${colIndex}`}
              x={tileX}
              y={tileY}
              width={TILE_SIZE}
              height={TILE_SIZE}
              fill={color}
              opacity={opacity}
              stroke="#FFD700"
              strokeWidth={2}
              perfectDrawEnabled={false}
              listening={false}
            />
          );
        })
      ))}
      <Circle
        x={(baseX + tileWidth / 2) * TILE_SIZE}
        y={(baseY + tileHeight / 2) * TILE_SIZE}
        radius={4}
        fill="white"
        stroke="black"
        strokeWidth={1}
        perfectDrawEnabled={false}
        listening={false}
      />
    </Group>
  );
});

export type { BuildingLayerProps };

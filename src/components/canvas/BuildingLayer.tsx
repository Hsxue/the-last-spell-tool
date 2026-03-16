/**
 * BuildingLayer - Renders buildings on the map
 * Phase 2 Task 1: Placeholder implementation
 * Phase 2 Task 4: Full building rendering and preview logic
 */

import { Rect, Text, Group } from 'react-konva';
import type { Building } from '../../types/map';
import { BUILDING_CATEGORY_COLORS } from '../../types/map';

// ============================================================================
// Props Interface
// ============================================================================

interface BuildingLayerProps {
  /** Array of buildings to render */
  buildings: Building[];
  /** Whether to show building preview/occupied markers */
  showPreview?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const BUILDING_COLORS: Record<string, string> = {
  ...BUILDING_CATEGORY_COLORS,
  MagicCircle: '#9400D3',
  default: '#3498DB',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get building display color
 */
function getBuildingColor(buildingId: string): string {
  return BUILDING_COLORS[buildingId] || BUILDING_COLORS.default;
}

/**
 * Get building display label (first letter or abbreviation)
 */
function getBuildingLabel(buildingId: string): string {
  // Try to extract meaningful abbreviation
  if (buildingId.length <= 2) return buildingId;
  // Return first uppercase letters
  const match = buildingId.match(/[A-Z]/g);
  if (match && match.length >= 2) {
    return match.slice(0, 2).join('');
  }
  return buildingId.slice(0, 2).toUpperCase();
}

// ============================================================================
// Main Component
// ============================================================================

export function BuildingLayer({ buildings, showPreview = false }: BuildingLayerProps) {
  // Render buildings
  const buildingElements = buildings.map((building) => {
    const color = getBuildingColor(building.id);
    const label = getBuildingLabel(building.id);

    return (
      <Group key={`${building.x}-${building.y}-${building.id}`}>
        {/* Building base */}
        <Rect
          x={building.x}
          y={building.y}
          width={1}
          height={1}
          fill={color}
          opacity={0.8}
          stroke="rgba(0, 0, 0, 0.3)"
          strokeWidth={0.02}
          perfectDrawEnabled={false}
        />
        
        {/* Building label */}
        <Text
          x={building.x}
          y={building.y + 0.35}
          width={1}
          height={0.5}
          text={label}
          fontSize={0.4}
          fontFamily="sans-serif"
          fill="white"
          align="center"
          verticalAlign="middle"
          listening={false}
          perfectDrawEnabled={false}
        />
      </Group>
    );
  });

  // Render placeholder if no buildings and preview is shown
  const placeholderElements = showPreview && buildings.length === 0 ? (
    <Text
      x={5}
      y={5}
      text="Building Layer (Placeholder)"
      fontSize={1}
      fill="rgba(0, 0, 0, 0.3)"
      listening={false}
      perfectDrawEnabled={false}
    />
  ) : null;

  return (
    <Group>
      {buildingElements}
      {placeholderElements}
    </Group>
  );
}

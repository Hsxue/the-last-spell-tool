/**
 * FlagLayer - Renders tile flags and markers on the map
 * Phase 2 Task 1: Placeholder implementation
 * Phase 2 Task 5: Full flag rendering logic
 */

import { Circle, Text, Group } from 'react-konva';
import { FLAG_CONFIG, ZONE_COLORS } from '../../types/map';

// ============================================================================
// Props Interface
// ============================================================================

interface FlagLayerProps {
  /** Map of flag type to array of positions [x, y] */
  flags: Map<string, Array<[number, number]>>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get flag display configuration
 */
function getFlagConfig(flagType: string): {
  marker: string;
  color: string;
  size: number;
} {
  // Check for zone flags
  if (flagType.startsWith('Zone_')) {
    return {
      marker: flagType.replace('Zone_', ''),
      color: ZONE_COLORS[flagType] || '#FFB6C1',
      size: 0.4,
    };
  }

  // Check for predefined flags
  const config = FLAG_CONFIG[flagType];
  if (config) {
    return {
      marker: config.marker,
      color: config.color,
      size: config.size / 25, // Scale down from pixel to tile units
    };
  }

  // Default configuration
  return {
    marker: '●',
    color: '#FF69B4',
    size: 0.3,
  };
}

/**
 * Check if flag is a zone flag
 */
function isZoneFlag(flagType: string): boolean {
  return flagType.startsWith('Zone_');
}

// ============================================================================
// Main Component
// ============================================================================

export function FlagLayer({ flags }: FlagLayerProps) {
  const flagElements: React.ReactNode[] = [];

  flags.forEach((positions, flagType) => {
    const config = getFlagConfig(flagType);
    const isZone = isZoneFlag(flagType);

    positions.forEach(([x, y], index) => {
      const key = `${flagType}-${x}-${y}-${index}`;

      if (isZone) {
        // Zone flags render as circles with labels
        flagElements.push(
          <Group key={key}>
            <Circle
              x={x + 0.5}
              y={y + 0.5}
              radius={config.size}
              fill={config.color}
              opacity={0.6}
              perfectDrawEnabled={false}
            />
            <Text
              x={x}
              y={y + 0.3}
              width={1}
              height={0.5}
              text={config.marker}
              fontSize={0.35}
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
        // Special flags render as markers
        flagElements.push(
          <Text
            key={key}
            x={x + 0.1}
            y={y + 0.1}
            text={config.marker}
            fontSize={Math.min(0.5, config.size)}
            fontFamily="sans-serif"
            fill={config.color}
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      }
    });
  });

  // Render placeholder if no flags
  const placeholderElement = flags.size === 0 ? (
    <Text
      x={10}
      y={5}
      text="Flag Layer (Placeholder)"
      fontSize={1}
      fill="rgba(0, 0, 0, 0.3)"
      listening={false}
      perfectDrawEnabled={false}
    />
  ) : null;

  return (
    <Group>
      {flagElements}
      {placeholderElement}
    </Group>
  );
}

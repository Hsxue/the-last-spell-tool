/**
 * MouseTracker - Tracks mouse position and updates coordinate display
 * Listens to Stage mouse movement and calculates world/tile coordinates
 */

import { useState, useEffect } from 'react';
import type { ViewportState } from '../../types/map';
import { useMapStore } from '../../store/mapStore';

// ============================================================================
// Props Interface
// ============================================================================

export interface MouseTrackerProps {
  /** Viewport state for coordinate transformation */
  viewport: ViewportState;
  /** Map width in tiles */
  mapWidth: number;
  /** Map height in tiles */
  mapHeight: number;
}

// ============================================================================
// Constants
// ============================================================================

// TILE_SIZE constant removed - mouse tracking now handled in MapCanvas

// ============================================================================
// Component
// ============================================================================

/**
 * MouseTracker Component
 *
 * Invisible component that tracks mouse movement on the Stage.
 * Calculates and updates:
 * - Screen coordinates (pixel position on screen)
 * - World coordinates (position in world space)
 * - Tile coordinates (grid position)
 * - Updates store with hovered tile for terrain display
 */
export function MouseTracker({ viewport, mapWidth, mapHeight }: MouseTrackerProps) {
  const setHoveredTile = useMapStore((state) => state.setHoveredTile);
  
  // Note: This component is kept for reference but mouse tracking is now handled directly in MapCanvas
  // The handleMouseMove callback and screenPos state are intentionally unused here
  
  void viewport;
  void mapWidth;
  void mapHeight;
  void setHoveredTile;

  // This component doesn't render anything visible
  // It uses Konva's event system via the Layer it's placed in
  return null;
}

/**
 * Helper hook to get mouse coordinates
 * Used by MapStatusBar to display real-time coordinates
 */
export function useMouseCoordinates() {
  const [coords, setCoords] = useState({
    screenX: 0,
    screenY: 0,
  });

  useEffect(() => {
    const handleMouseCoords = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCoords({
        screenX: customEvent.detail.screenX,
        screenY: customEvent.detail.screenY,
      });
    };

    window.addEventListener('mousecoords', handleMouseCoords);
    return () => window.removeEventListener('mousecoords', handleMouseCoords);
  }, []);

  return coords;
}

// ============================================================================
// Exports
// ============================================================================

// MouseTrackerProps is already exported via the interface declaration above

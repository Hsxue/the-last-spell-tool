/**
 * Canvas Components - Unified exports for map rendering layers
 * Provides Konva-based canvas components for the tile map editor
 */

// Main canvas container
export { MapCanvas } from './MapCanvas';

// Layer components
export { TerrainLayer } from './TerrainLayer';
export { GridLayer } from './GridLayer';
export { BuildingLayer } from './BuildingLayer';
export { FlagLayer } from './FlagLayer';

// Re-export types for convenience
export type { MapCanvasProps } from './MapCanvas';

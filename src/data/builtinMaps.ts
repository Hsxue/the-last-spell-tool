/**
 * Built-in maps metadata and loading utilities
 * Fetches map index from server and loads map XML files
 */

export interface BuiltinMapEntry {
  id: string;
  name: string;
  difficulty: number;
  tileMap: string;    // Relative URL path
  buildings: string;  // Relative URL path
}

let _cachedMaps: BuiltinMapEntry[] | null = null;

/**
 * Fetch the list of available built-in maps from the server
 */
export async function fetchBuiltinMapsList(): Promise<BuiltinMapEntry[]> {
  if (_cachedMaps) return _cachedMaps;

  const response = await fetch('/maps-index.json');
  if (!response.ok) {
    throw new Error(`Failed to fetch maps index: ${response.status}`);
  }
  _cachedMaps = await response.json();
  return _cachedMaps;
}

/**
 * Clear the cached maps list (force re-fetch)
 */
export function clearBuiltinMapsCache(): void {
  _cachedMaps = null;
}

/**
 * Load a built-in map's XML data as ArrayBuffer
 * @param relativePath - Path from server root (e.g., "maps/TutorialMap_TileMap.xml")
 */
export async function loadMapXml(relativePath: string): Promise<ArrayBuffer> {
  const response = await fetch(`/${relativePath}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${relativePath}: ${response.status}`);
  }
  return response.arrayBuffer();
}

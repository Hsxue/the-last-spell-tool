/**
 * Map/Record Serialization Utilities
 * 
 * Zustand's persist middleware cannot serialize Map objects directly.
 * These utilities provide bidirectional conversion between Map and Record/Array
 * for JSON-compatible persistence.
 */

// ============================================================================
// Map ↔ Record Conversion
// ============================================================================

/**
 * Convert a Map<string, V> to a plain Record<string, V> for JSON serialization.
 * Returns undefined if the map is empty or undefined.
 */
export function mapToRecord<V>(map: Map<string, V> | undefined): Record<string, V> | undefined {
  if (!map || map.size === 0) return undefined;
  return Object.fromEntries(map);
}

/**
 * Convert a Record<string, V> back to a Map<string, V>.
 * Returns an empty Map if the record is undefined or empty.
 */
export function recordToMap<V>(record: Record<string, V> | undefined): Map<string, V> {
  if (!record || Object.keys(record).length === 0) return new Map();
  return new Map(Object.entries(record));
}

// ============================================================================
// Map with Number Keys ↔ Record Conversion
// ============================================================================

/**
 * Convert a Map<number, V> to a Record<string, V> for JSON serialization.
 * Number keys are converted to strings.
 */
export function mapNumberToRecord<V>(map: Map<number, V> | undefined): Record<string, V> | undefined {
  if (!map || map.size === 0) return undefined;
  const record: Record<string, V> = {};
  map.forEach((value, key) => {
    record[String(key)] = value;
  });
  return record;
}

/**
 * Convert a Record<string, V> back to a Map<number, V>.
 * String keys are parsed back to numbers.
 */
export function recordToMapNumber<V>(record: Record<string, V> | undefined): Map<number, V> {
  if (!record || Object.keys(record).length === 0) return new Map();
  const map = new Map<number, V>();
  Object.entries(record).forEach(([key, value]) => {
    map.set(Number(key), value);
  });
  return map;
}

// ============================================================================
// Map with Tuple Array Values ↔ Record Conversion
// ============================================================================

/**
 * Convert a Map<number, [string|number, number][]> to a serializable format.
 * Used for: spawnWavesPerDay, spawnDirections, elitesPerDay, maxDistancePerDay
 */
export function mapTupleArrayToRecord<T extends [string | number, number]>(
  map: Map<number, T[]> | undefined
): Record<string, T[]> | undefined {
  if (!map || map.size === 0) return undefined;
  const record: Record<string, T[]> = {};
  map.forEach((value, key) => {
    record[String(key)] = value;
  });
  return record;
}

/**
 * Convert a Record<string, T[]> back to a Map<number, T[]>.
 */
export function recordToMapTupleArray<T extends [string | number, number]>(
  record: Record<string, T[]> | undefined
): Map<number, T[]> {
  if (!record || Object.keys(record).length === 0) return new Map();
  const map = new Map<number, T[]>();
  Object.entries(record).forEach(([key, value]) => {
    map.set(Number(key), value);
  });
  return map;
}

// ============================================================================
// Generic Map Serializer for Zustand Persist
// ============================================================================

/**
 * Serialize any Map field to a JSON-compatible format.
 * Detects the key type and value type automatically.
 */
export function serializeMapField<K extends string | number, V>(
  map: Map<K, V>,
  _keyType: 'string' | 'number' = 'string'
): Record<string, V> | undefined {
  if (map.size === 0) return undefined;
  const record: Record<string, V> = {};
  map.forEach((value, key) => {
    record[String(key)] = value;
  });
  return record;
}

/**
 * Deserialize a Record back to a Map.
 */
export function deserializeMapField<K extends string | number, V>(
  record: Record<string, V> | undefined,
  keyType: 'string' | 'number' = 'string'
): Map<K, V> {
  if (!record || Object.keys(record).length === 0) return new Map() as Map<K, V>;
  const map = new Map();
  Object.entries(record).forEach(([key, value]) => {
    const parsedKey = keyType === 'number' ? Number(key) : key;
    map.set(parsedKey, value);
  });
  return map as Map<K, V>;
}

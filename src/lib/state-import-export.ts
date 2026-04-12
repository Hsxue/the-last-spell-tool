/**
 * State Import/Export Utility
 *
 * Provides ZIP-based import/export for the entire editor state.
 * Each store is saved as a separate JSON file within the ZIP archive.
 *
 * ZIP structure:
 *   tls-editor-state/
 *     weapon-skill-store.json
 *     config-store.json
 *     map-store.json
 *     ui-store.json
 *     localization-store.json
 *     manifest.json (version + metadata)
 */

import JSZip from 'jszip';

// ============================================================================
// Constants
// ============================================================================

const STORE_KEYS = [
  'weapon-skill-store',
  'config-store',
  'map-store',
  'ui-store',
  'localization-store',
] as const;

const ZIP_FOLDER = 'tls-editor-state';
const MANIFEST_FILE = 'manifest.json';
const EXPORT_FILENAME = 'the-last-spell-state';

// ============================================================================
// Types
// ============================================================================

export interface ExportManifest {
  version: string;
  exportedAt: string;
  storeCount: number;
  appVersion?: string;
}

export type StoreKeyName = (typeof STORE_KEYS)[number];

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export ALL store states as a ZIP file.
 * Downloads the ZIP to the user's device.
 */
export async function exportAllStoresToZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder(ZIP_FOLDER)!;

  // Export each store's localStorage data
  let exportedCount = 0;
  for (const key of STORE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      rootFolder.file(`${key}.json`, raw);
      exportedCount++;
    }
  }

  // Create manifest
  const manifest: ExportManifest = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    storeCount: exportedCount,
    appVersion: import.meta.env.VITE_APP_VERSION ?? 'unknown',
  };
  rootFolder.file(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  // Generate and download ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${EXPORT_FILENAME}-${timestamp}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export a SINGLE store as a JSON file.
 * Downloads the JSON to the user's device.
 */
export async function exportSingleStoreToJSON(storeKey: StoreKeyName): Promise<void> {
  const raw = localStorage.getItem(storeKey);
  if (!raw) {
    throw new Error(`No data found for store: ${storeKey}`);
  }

  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${storeKey}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// Import Functions
// ============================================================================

/**
 * Import state from a ZIP file.
 * Reads all JSON files from the ZIP and writes them to localStorage.
 * Returns a report of what was imported.
 */
export async function importStateFromZip(file: File): Promise<ImportReport> {
  const report: ImportReport = {
    success: false,
    storesImported: [],
    errors: [],
  };

  try {
    const zip = await JSZip.loadAsync(file);

    // Check if it's a valid TLS state ZIP (manifest presence)
    void Object.keys(zip.files).some((path) => path.endsWith(MANIFEST_FILE));

    // Find all store JSON files (handle both with and without folder prefix)
    const storeFiles: { key: StoreKeyName; entry: JSZip.JSZipObject }[] = [];

    for (const key of STORE_KEYS) {
      // Try different path patterns
      const patterns = [
        `${ZIP_FOLDER}/${key}.json`,
        `${key}.json`,
      ];

      for (const pattern of patterns) {
        const entry = zip.files[pattern];
        if (entry && !entry.dir) {
          storeFiles.push({ key, entry });
          break;
        }
      }
    }

    if (storeFiles.length === 0) {
      report.errors.push('No valid store data found in ZIP file.');
      return report;
    }

    // Import each store
    for (const { key, entry } of storeFiles) {
      try {
        const content = await entry.async('string');
        // Validate JSON before writing
        JSON.parse(content);
        localStorage.setItem(key, content);
        report.storesImported.push(key);
      } catch (e) {
        report.errors.push(`Failed to import ${key}: ${(e as Error).message}`);
      }
    }

    report.success = report.storesImported.length > 0;

  } catch (e) {
    report.errors.push(`Failed to read ZIP file: ${(e as Error).message}`);
  }

  return report;
}

/**
 * Import a single store from a JSON file.
 * Validates the JSON and writes it to localStorage.
 */
export async function importSingleStoreFromJSON(file: File, storeKey: StoreKeyName): Promise<boolean> {
  try {
    const text = await file.text();
    JSON.parse(text); // Validate JSON
    localStorage.setItem(storeKey, text);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a file is a valid TLS state ZIP.
 */
export async function isValidStateZip(file: File): Promise<boolean> {
  if (!file.name.endsWith('.zip')) return false;

  try {
    const zip = await JSZip.loadAsync(file);
    return Object.keys(zip.files).some(
      (path) =>
        path.endsWith(MANIFEST_FILE) ||
        STORE_KEYS.some((key) => path.endsWith(`${key}.json`))
    );
  } catch {
    return false;
  }
}

/**
 * Get list of available stores in localStorage.
 */
export function getAvailableStores(): StoreKeyName[] {
  return STORE_KEYS.filter((key) => !!localStorage.getItem(key));
}

/**
 * Clear all persisted store data from localStorage.
 */
export function clearAllPersistedData(): void {
  for (const key of STORE_KEYS) {
    localStorage.removeItem(key);
  }
}

// ============================================================================
// Report Type
// ============================================================================

export interface ImportReport {
  success: boolean;
  storesImported: StoreKeyName[];
  errors: string[];
}

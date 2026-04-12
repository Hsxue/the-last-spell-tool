import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  BuiltinLanguage,
  LocalizationState,
  TranslationEntry,
} from '../types/localization';

const BUILTIN_LANGS: BuiltinLanguage[] = ['English', 'Français', '简体中文', '繁體中文', '日本語', 'Русский', 'Українська', 'Deutsch', 'Español', 'Português (Brasil)', '한국어'];

const createDefaultTranslations = (): Record<BuiltinLanguage, string> =>
  Object.fromEntries(BUILTIN_LANGS.map((l) => [l, ''])) as unknown as Record<BuiltinLanguage, string>;

interface LocalizationActions {
  setEntries: (entries: TranslationEntry[]) => void;
  setSelectedKey: (key: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTutorial: () => void;
  updateTranslation: (rowIndex: number, lang: BuiltinLanguage, value: string) => void;
  addEntry: (key: string) => void;
  deleteEntry: (index: number) => void;
  importFromCSV: (csvText: string) => void;
  exportToCSV: (entries: TranslationEntry[]) => string;
}

const initialState: LocalizationState = {
  entries: [],
  selectedKey: '',
  searchQuery: '',
  showTutorial: true,
};

export const useLocalizationStore = create<LocalizationState & LocalizationActions>()(
  persist(
    immer((set) => {
      return {
        ...initialState,

        setEntries: (entries) =>
          set((state) => {
            state.entries = entries;
          }),

        setSelectedKey: (key) =>
          set((state) => {
            state.selectedKey = key;
          }),

        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query;
          }),

        toggleTutorial: () =>
          set((state) => {
            state.showTutorial = !state.showTutorial;
          }),

        updateTranslation: (rowIndex, lang, value) =>
          set((state) => {
            if (rowIndex >= 0 && rowIndex < state.entries.length) {
              (state.entries[rowIndex].translations as Record<string, string>)[lang] = value;
            }
          }),

        addEntry: (key) =>
          set((state) => {
            state.entries.push({
              key,
              translations: createDefaultTranslations(),
            });
          }),

        deleteEntry: (index) =>
          set((state) => {
            state.entries.splice(index, 1);
          }),

        importFromCSV: (csvText) =>
          set((state) => {
            const lines = csvText
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0 && !l.startsWith('#'));

            if (lines.length < 2) return;

            const headers = parseCSVLine(lines[0]);
            // Strip leading comma/empty first column if present (game's Loc_TLS format)
            const firstHeader = headers[0] === '' || headers[0] === ',' ? headers.slice(1) : headers;
            const langColumns = firstHeader.filter((h) => h && h !== 'Key') as string[];
            const dataStart = firstHeader !== headers ? 1 : 0; // Offset for empty first column

            const entries: TranslationEntry[] = [];

            for (let i = 1; i < lines.length; i++) {
              const cols = parseCSVLine(lines[i]);
              const dataCols = dataStart && cols[0] === '' ? cols.slice(1) : cols;
              if (dataCols.length < 2) continue;
              const key = dataCols[0];
              const translations: Record<string, string> = {};
              langColumns.forEach((lang, idx) => {
                translations[lang] = dataCols[idx + 1] ?? '';
              });
              entries.push({ key, translations });
            }

            state.entries = entries;
          }),

        exportToCSV: (entries: TranslationEntry[]): string => {
          if (entries.length === 0) return ',Key';
          const langKeys = Object.keys(entries[0].translations);
          const headers = [',Key', ...langKeys];
          const lines = [headers.join(',')];
          entries.forEach((entry) => {
            const row = [
              '',
              csvEscape(entry.key),
              ...langKeys.map((lang) => csvEscape((entry.translations as Record<string, string>)[lang] ?? '')),
            ];
            lines.push(row.join(','));
          });
          return lines.join('\n');
        },
      };
    }),
    {
      name: 'localization-store',
      version: 1,
    }
  )
);

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

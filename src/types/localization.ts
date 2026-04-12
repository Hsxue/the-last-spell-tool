// ============================================================================
// Localization Mod Types
// ============================================================================

/** Built-in game languages (from TextAsset/Loc_TLS) */
export const BUILTIN_LANGUAGES = [
  'English',
  'Français',
  '简体中文',
  '繁體中文',
  '日本語',
  'Русский',
  'Українська',
  'Deutsch',
  'Español',
  'Português (Brasil)',
  '한국어',
] as const;

export type BuiltinLanguage = (typeof BUILTIN_LANGUAGES)[number];

export interface TranslationEntry {
  key: string;
  translations: Record<BuiltinLanguage, string>;
}

export interface LocalizationState {
  /** All translation entries */
  entries: TranslationEntry[];
  /** Currently focused/highlighted translation key */
  selectedKey: string;
  /** Search filter */
  searchQuery: string;
  /** Whether the tutorial is expanded */
  showTutorial: boolean;
}

import type { SupportedLanguage } from '../types/weapon-skill';

/**
 * TextAsset/Loc_TLS format interface
 * Expected JSON structure for translation files
 */
interface TranslationFileFormat {
  key: string;
  en?: string;  // English (fallback)
  fr?: string;  // Français
  zh?: string;  // 简体中文
  ja?: string;  // 日本語
  de?: string;  // Deutsch
  es?: string;  // Español
}

/**
 * Storage for translations: key -> {language -> text}
 */
class LocalizationManager {
  private translations: Map<string, Map<SupportedLanguage, string>> = new Map();
  private _loadedLanguages: Set<SupportedLanguage> = new Set();

  /**
   * Load localization data from translation file(s)
   * @param translationData Array of translation entries in TextAsset/Loc_TLS format
   * @returns Promise that resolves when loading is complete
   */
  async loadLocalization(translationData: TranslationFileFormat[]): Promise<void> {
    this.translations.clear();
    
    // Clear and rebuild language set
    this._loadedLanguages.clear();
    this._loadedLanguages.add('English');  // Always have English as base
    
    // Process each translation entry
    for (const entry of translationData) {
      const { key, en, fr, zh, ja, de, es } = entry;
      
      if (!key) continue; // Skip entries without keys
      
      // Create map for this key's translations
      const keyTranslations: Map<SupportedLanguage, string> = new Map();
      
      // Map each language to its corresponding translation
      if (en) {
        keyTranslations.set('English', en);
        this._loadedLanguages.add('English');
      }
      if (fr) {
        keyTranslations.set('Français', fr);
        this._loadedLanguages.add('Français');
      }
      if (zh) {
        keyTranslations.set('简体中文', zh);
        this._loadedLanguages.add('简体中文');
      }
      if (ja) {
        keyTranslations.set('日本語', ja);
        this._loadedLanguages.add('日本語');
      }
      if (de) {
        keyTranslations.set('Deutsch', de);
        this._loadedLanguages.add('Deutsch');
      }
      if (es) {
        keyTranslations.set('Español', es);
        this._loadedLanguages.add('Español');
      }
      
      // Store this key's translations
      this.translations.set(key, keyTranslations);
    }
    
    return Promise.resolve();
  }

  /**
   * Get translation for a specific key in the requested language
   * Falls back to English if the translation doesn't exist in the requested language
   * @param key Translation key
   * @param language Target language
   * @returns Translation string or empty string if not found
   */
  getTranslation(key: string, language: SupportedLanguage): string {
    const keyTranslations = this.translations.get(key);
    
    if (!keyTranslations) {
      // If key doesn't exist at all, return empty string
      return '';
    }
    
    // Try to get translation in requested language
    const translation = keyTranslations.get(language);
    
    if (translation !== undefined && translation.trim() !== '') {
      // Return the translation if available and not empty
      return translation;
    }
    
    // Fallback to English if translation not available in requested language
    const englishTranslation = keyTranslations.get('English');
    if (englishTranslation !== undefined) {
      return englishTranslation;
    }
    
    // If no English fallback is available, return the first available translation
    for (const [, trans] of keyTranslations.entries()) {
      if (trans && trans.trim() !== '') {
        return trans;
      }
    }
    
    // If no translations exist for this key, return empty string
    return '';
  }

  /**
   * Get all supported languages that have been loaded
   */
  get loadedLanguages(): SupportedLanguage[] {
    return Array.from(this._loadedLanguages);
  }

  /**
   * Check if a particular language is supported
   */
  hasLanguage(language: SupportedLanguage): boolean {
    return this._loadedLanguages.has(language);
  }

  /**
   * Check if translation key exists
   */
  hasKey(key: string): boolean {
    return this.translations.has(key);
  }
}

// Default export singleton instance
const localizationManager = new LocalizationManager();
export default localizationManager;

// Also export for cases where multiple instances are needed
export { LocalizationManager };
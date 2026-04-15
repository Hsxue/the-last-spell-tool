/**
 * Custom hook wrapping react-i18next for language switching.
 * Returns current language, changeLanguage function, and t function.
 * Avoids Zustand store duplication — uses i18next directly.
 */

import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

type Locale = 'en' | 'zh';

interface UseCurrentLanguageReturn {
  currentLanguage: Locale;
  changeLanguage: (lng: Locale) => Promise<void>;
  t: TFunction<'common'>;
  te: TFunction<'editor'>;
}

export function useCurrentLanguage(): UseCurrentLanguageReturn {
  const { t: tCommon, i18n } = useTranslation('common');
  const { t: tEditor } = useTranslation('editor');

  const changeLanguage = async (lng: Locale): Promise<void> => {
    await i18n.changeLanguage(lng);
  };

  return {
    currentLanguage: i18n.language as Locale,
    changeLanguage,
    t: tCommon,
    te: tEditor,
  };
}

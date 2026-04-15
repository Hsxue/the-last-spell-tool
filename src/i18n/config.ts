import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import zhCommon from './locales/zh/common.json';
import enEditor from './locales/en/editor.json';
import zhEditor from './locales/zh/editor.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, editor: enEditor },
      zh: { common: zhCommon, editor: zhEditor },
    },
    ns: ['common', 'editor'],
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'app-locale',
      caches: ['localStorage'],
    },
    saveMissing: import.meta.env.DEV,
  });

export default i18n;

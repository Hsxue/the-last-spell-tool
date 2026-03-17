import { useState } from 'react';
import type { SupportedLanguage } from '../../types/weapon-skill';

const LANGUAGES: SupportedLanguage[] = ['English', 'Français', '简体中文', '日本語', 'Deutsch', 'Español'];

export function LanguageSelector() {
  const [language, setLanguage] = useState<SupportedLanguage>('English');

  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
      className="px-2 py-1 text-xs border rounded"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>{lang}</option>
      ))}
    </select>
  );
}
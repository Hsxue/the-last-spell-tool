/**
 * LanguageSwitcher Component
 * Language toggle button for the header. Shows the OTHER language name to click into.
 */

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, t } = useCurrentLanguage();

  const toggleLanguage = async () => {
    await changeLanguage(currentLanguage === 'en' ? 'zh' : 'en');
  };

  // Show the OTHER language's name (click "中文" when on EN, click "English" when on ZH)
  const displayLabel = currentLanguage === 'en'
    ? t('language.chinese')
    : t('language.english');

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      title={displayLabel}
      data-testid="language-switcher"
    >
      <Languages className="h-4 w-4 mr-1" />
      {displayLabel}
    </Button>
  );
}

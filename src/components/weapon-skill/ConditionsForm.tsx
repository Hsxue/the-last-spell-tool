import { useTranslation } from 'react-i18next';

export function ConditionsForm() {
  const { t } = useTranslation('common');
  return (
    <div className="p-4 space-y-3 border-t">
      <h3 className="text-sm font-semibold">{t('weapon.placeholderForms.conditions')}</h3>
      <div><label className="text-xs">{t('weapon.skillEffects.phase')}</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="Combat" /></div>
      <p className="text-xs text-gray-400">{t('weapon.placeholderForms.conditionsForm')}</p>
    </div>
  );
}

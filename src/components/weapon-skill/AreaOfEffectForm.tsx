import { useTranslation } from 'react-i18next';

export function AreaOfEffectForm() {
  const { t } = useTranslation('common');
  return (
    <div className="p-4 space-y-3 border-t">
      <h3 className="text-sm font-semibold">{t('weapon.placeholderForms.areaOfEffect')}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs">{t('weapon.areaOfEffectForm.originX')}</label><input type="number" className="w-full border rounded px-2 py-1 text-xs" defaultValue={0} /></div>
        <div><label className="text-xs">{t('weapon.areaOfEffectForm.originY')}</label><input type="number" className="w-full border rounded px-2 py-1 text-xs" defaultValue={0} /></div>
      </div>
      <div><label className="text-xs">{t('weapon.areaOfEffectForm.pattern')}</label><textarea className="w-full border rounded px-2 py-1 text-xs" rows={3} placeholder={t('weapon.areaOfEffectForm.patternPlaceholder')} /></div>
      <p className="text-xs text-gray-400">{t('weapon.placeholderForms.aoeForm')}</p>
    </div>
  );
}

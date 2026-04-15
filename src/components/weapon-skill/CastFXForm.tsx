import { useTranslation } from 'react-i18next';

export function CastFXForm() {
  const { t } = useTranslation('common');
  return (
    <div className="p-4 space-y-3 border-t">
      <h3 className="text-sm font-semibold">{t('weapon.placeholderForms.castEffects')}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs">{t('weapon.skillEffects.vfx')}</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="" /></div>
        <div><label className="text-xs">{t('weapon.skillEffects.sound')}</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="" /></div>
        <div><label className="text-xs">{t('weapon.skillEffects.camShake')}</label><input type="number" step="0.1" className="w-full border rounded px-2 py-1 text-xs" defaultValue={0} /></div>
        <div><label className="text-xs">{t('weapon.skillEffects.casterAnim')}</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="" /></div>
      </div>
      <p className="text-xs text-gray-400">{t('weapon.placeholderForms.castFxForm')}</p>
    </div>
  );
}

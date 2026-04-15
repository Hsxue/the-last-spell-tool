import { useTranslation } from 'react-i18next';

export function ConfigTab() {
  const { t } = useTranslation('common');
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">{t('weapon.configTab.title')}</h2>
      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="text-sm font-semibold mb-2">{t('weapon.configTab.weaponCategory')}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>MeleeWeapon</span><span className="text-gray-400">{t('weapon.categories.meleeWeapon')}</span></div>
            <div className="flex justify-between"><span>RangeWeapon</span><span className="text-gray-400">{t('weapon.categories.rangeWeapon')}</span></div>
            <div className="flex justify-between"><span>MagicWeapon</span><span className="text-gray-400">{t('weapon.categories.magicWeapon')}</span></div>
          </div>
          <p className="text-xs text-gray-400 mt-3">{t('weapon.configTab.fixedNote')}</p>
        </div>
        <div className="border rounded p-4">
          <h3 className="text-sm font-semibold mb-2">{t('weapon.configTab.skillCategory')}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>MeleeWeapons - {t('weapon.categories.meleeWeaponSkill')}</div>
            <div>RangeWeapons - {t('weapon.categories.rangeWeaponSkill')}</div>
            <div>MagicWeapons - {t('weapon.categories.magicWeaponSkill')}</div>
            <div>General - {t('weapon.categories.generalSkill')}</div>
          </div>
        </div>
        <div className="border rounded p-4">
          <h3 className="text-sm font-semibold mb-2">{t('weapon.configTab.stats')}</h3>
          <p className="text-sm text-gray-600">{t('weapon.configTab.configDesc')}</p>
        </div>
      </div>
    </div>
  );
}

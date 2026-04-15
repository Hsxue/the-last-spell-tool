import { useTranslation } from 'react-i18next';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';

export function WeaponEditor() {
  const { t } = useTranslation('common');
  const selectedWeapon = useWeaponSkillStore((state: any) => {
    if (!state.selectedWeaponId) return null;
    return state.weapons.find((w: any) => w.id === state.selectedWeaponId);
  });

  if (!selectedWeapon) {
    return (<div className="p-8 text-center text-gray-500"><p className="text-sm">{t('weapon.common.selectWeapon')}</p></div>);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="border-b pb-2">
        <h2 className="text-lg font-semibold">{selectedWeapon.id}</h2>
        <p className="text-sm text-gray-500">{t('weapon.common.category')}: {selectedWeapon.category}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">{t('weapon.placeholderForms.weaponEditorComingSoon')}</p>
        <p className="text-xs text-gray-400">{t('weapon.placeholderForms.weaponEditorTasks')}</p>
        <ul className="text-xs text-gray-400 list-disc list-inside">
          <li>{t('weapon.placeholderForms.weaponBasicInfoForm')}</li>
          <li>{t('weapon.placeholderForms.weaponLevelConfiguration')}</li>
          <li>{t('weapon.placeholderForms.weaponStatBonusesEditor')}</li>
          <li>{t('weapon.placeholderForms.weaponSkillsAssignment')}</li>
        </ul>
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';

export function WeaponLevelForm() {
  const { t } = useTranslation('common');
  const selectedWeapon = useWeaponSkillStore((state: any) => state.weapons.find((w: any) => w.id === state.selectedWeaponId));
  if (!selectedWeapon) return <div className="p-4 text-sm text-gray-500">{t('weapon.placeholderForms.selectWeaponFirst')}</div>;
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold">{t('weapon.placeholderForms.levelConfig')}</h3>
      <p className="text-xs text-gray-400">{t('weapon.placeholderForms.weaponLevelForm')}</p>
    </div>
  );
}

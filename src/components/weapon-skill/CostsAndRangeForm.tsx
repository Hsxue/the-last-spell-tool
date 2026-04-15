import { useTranslation } from 'react-i18next';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { Input, Label } from '../ui';

export function CostsAndRangeForm() {
  const { t } = useTranslation('common');
  const selectedSkill = useWeaponSkillStore((state: any) => state.skills.find((s: any) => s.id === state.selectedSkillId));
  if (!selectedSkill) return <div className="p-4 text-sm text-gray-500">{t('weapon.placeholderForms.selectSkillFirst')}</div>;

  return (
    <div className="p-4 space-y-4 border-t">
      <h3 className="text-sm font-semibold">{t('weapon.placeholderForms.costsAndRange')}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">{t('weapon.skillEditor.apCost')}</Label><Input type="number" className="text-xs" defaultValue={selectedSkill.actionPointsCost || 0} /></div>
        <div><Label className="text-xs">{t('weapon.skillEditor.manaCost')}</Label><Input type="number" className="text-xs" defaultValue={selectedSkill.manaCost || 0} /></div>
        <div><Label className="text-xs">{t('weapon.skillEditor.healthCost')}</Label><Input type="number" className="text-xs" defaultValue={selectedSkill.healthCost || 0} /></div>
        <div><Label className="text-xs">{t('weapon.costsAndRangeForm.usesPerTurn')}</Label><Input type="number" className="text-xs" defaultValue={selectedSkill.usesPerTurnCount || 1} /></div>
      </div>
      <div className="border-t pt-3">
        <h4 className="text-xs font-medium mb-2">{t('weapon.placeholderForms.range')}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">{t('weapon.costsAndRangeForm.min')}</Label><Input type="number" className="text-xs" defaultValue={selectedSkill.skillRange?.min || 1} /></div>
          <div><Label className="text-xs">{t('weapon.costsAndRangeForm.max')}</Label><Input type="number" className="text-xs" defaultValue={selectedSkill.skillRange?.max || 5} /></div>
        </div>
      </div>
      <p className="text-xs text-gray-400">{t('weapon.placeholderForms.costsAndRangeForm')}</p>
    </div>
  );
}

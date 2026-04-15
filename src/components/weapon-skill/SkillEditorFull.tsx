import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { SkillEffectForms } from './SkillEffectForms';
import { SkillXMLButton } from './SkillXMLButton';

export function SkillEditorFull() {
  const { t } = useTranslation('common');
  const selectedSkill = useWeaponSkillStore((state) => {
    if (!state.selectedSkillId) return null;
    return state.skills.find((s) => s.id === state.selectedSkillId);
  });
  const updateSkill = useWeaponSkillStore((state) => state.updateSkill);
  const [editedSkill, setEditedSkill] = useState<any>(null);

  useEffect(() => { setEditedSkill(selectedSkill); }, [selectedSkill]);

  const handleSkillEffectChange = (updates: any) => { setEditedSkill({ ...editedSkill, ...updates }); };
  const handleSave = () => { updateSkill(editedSkill); };

  if (!selectedSkill || !editedSkill) {
    return (<div className="p-8 text-center text-gray-500"><p className="text-sm">{t('weapon.common.selectSkill')}</p></div>);
  }

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="border-b pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{selectedSkill.id}</h2>
          <p className="text-sm text-gray-500">{t('weapon.common.category')}: {selectedSkill.category}</p>
        </div>
        <SkillXMLButton skillId={selectedSkill.id} />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t('weapon.common.basicInfo')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.common.id')}</label>
            <input type="text" value={editedSkill.id || ''} onChange={(e) => setEditedSkill({...editedSkill, id: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.common.category')}</label>
            <select value={editedSkill.category || ''} onChange={(e) => setEditedSkill({...editedSkill, category: e.target.value})} className="w-full border rounded px-2 py-1 text-xs">
              <option value="MeleeWeapons">{t('weapon.categories.meleeWeaponSkill')}</option>
              <option value="RangeWeapons">{t('weapon.categories.rangeWeaponSkill')}</option>
              <option value="MagicWeapons">{t('weapon.categories.magicWeaponSkill')}</option>
              <option value="General">{t('weapon.categories.generalSkill')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.skillEditor.effectType')}</label>
            <select value={editedSkill.effectType || 'AttackAction'} onChange={(e) => setEditedSkill({...editedSkill, effectType: e.target.value})} className="w-full border rounded px-2 py-1 text-xs">
              <option value="AttackAction">{t('weapon.effectTypes.attackAction')}</option>
              <option value="CastEffect">{t('weapon.effectTypes.castEffect')}</option>
              <option value="GenericAction">{t('weapon.effectTypes.genericAction')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.skillEditor.description')}</label>
            <input type="text" value={editedSkill.description || ''} onChange={(e) => setEditedSkill({...editedSkill, description: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t('weapon.skillEditor.effectConfig')}</h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.skillEditor.apCost')}</label>
            <input type="number" value={editedSkill.actionPointsCost || 0} onChange={(e) => setEditedSkill({...editedSkill, actionPointsCost: parseInt(e.target.value)})} className="w-full border rounded px-2 py-1 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.skillEditor.manaCost')}</label>
            <input type="number" value={editedSkill.manaCost || 0} onChange={(e) => setEditedSkill({...editedSkill, manaCost: parseInt(e.target.value)})} className="w-full border rounded px-2 py-1 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.skillEditor.healthCost')}</label>
            <input type="number" value={editedSkill.healthCost || 0} onChange={(e) => setEditedSkill({...editedSkill, healthCost: parseInt(e.target.value)})} className="w-full border rounded px-2 py-1 text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.skillEditor.minRange')}</label>
            <input type="number" value={editedSkill.skillRange?.min || 1} onChange={(e) => setEditedSkill({...editedSkill, skillRange: {...(editedSkill.skillRange || {}), min: parseInt(e.target.value)}})} className="w-full border rounded px-2 py-1 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.skillEditor.maxRange')}</label>
            <input type="number" value={editedSkill.skillRange?.max || 5} onChange={(e) => setEditedSkill({...editedSkill, skillRange: {...(editedSkill.skillRange || {}), max: parseInt(e.target.value)}})} className="w-full border rounded px-2 py-1 text-xs" />
          </div>
        </div>
        <p className="text-xs text-gray-400">{t('weapon.skillEditor.moreEffectsHint')}</p>
      </div>

      <SkillEffectForms skill={editedSkill} onChange={handleSkillEffectChange} />

      <div className="pt-4 border-t">
        <button onClick={handleSave} className="w-full py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          {t('weapon.common.saveChanges')}
        </button>
      </div>
    </div>
  );
}

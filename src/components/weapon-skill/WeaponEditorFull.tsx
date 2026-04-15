import { useTranslation } from 'react-i18next';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { useState, useEffect } from 'react';
import { WeaponLevelDetailEditor } from './WeaponLevelDetailEditor';
import { WeaponXMLButton } from './WeaponXMLButton';

export function WeaponEditorFull() {
  const { t } = useTranslation('common');
  const selectedWeapon = useWeaponSkillStore((state: any) => {
    if (!state.selectedWeaponId) return null;
    return state.weapons.find((w: any) => w.id === state.selectedWeaponId);
  });
  const updateWeapon = useWeaponSkillStore((state: any) => state.updateWeapon);
  const [editedWeapon, setEditedWeapon] = useState<any>(null);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);

  useEffect(() => {
    if (selectedWeapon) setEditedWeapon({...selectedWeapon});
  }, [selectedWeapon]);

  if (!selectedWeapon || !editedWeapon) {
    return (<div className="p-8 text-center text-gray-500"><p className="text-sm">{t('weapon.common.selectWeapon')}</p></div>);
  }

  const handleSave = () => { updateWeapon(editedWeapon); };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="border-b pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{selectedWeapon.id}</h2>
          <p className="text-sm text-gray-500">{t('weapon.common.category')}: {selectedWeapon.category}</p>
        </div>
        <WeaponXMLButton weaponId={selectedWeapon.id} />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t('weapon.common.basicInfo')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.common.id')}</label>
            <input type="text" value={editedWeapon.id || ''} onChange={(e) => setEditedWeapon({...editedWeapon, id: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.common.category')}</label>
            <select value={editedWeapon.category || ''} onChange={(e) => setEditedWeapon({...editedWeapon, category: e.target.value})} className="w-full border rounded px-2 py-1 text-xs">
              <option value="MeleeWeapon">{t('weapon.categories.meleeWeapon')}</option>
              <option value="RangeWeapon">{t('weapon.categories.rangeWeapon')}</option>
              <option value="MagicWeapon">{t('weapon.categories.magicWeapon')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.weaponEditor.hands')}</label>
            <select value={editedWeapon.hands || 'OneHand'} onChange={(e) => setEditedWeapon({...editedWeapon, hands: e.target.value})} className="w-full border rounded px-2 py-1 text-xs">
              <option value="OneHand">{t('weapon.hands.oneHand')}</option>
              <option value="TwoHand">{t('weapon.hands.twoHand')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('weapon.weaponEditor.tags')}</label>
            <input type="text" value={editedWeapon.tags?.join(', ') || ''} onChange={(e) => setEditedWeapon({...editedWeapon, tags: e.target.value.split(',').map((t:string) => t.trim())})} className="w-full border rounded px-2 py-1 text-xs" placeholder={t('weapon.weaponEditor.tagsPlaceholder')} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t('weapon.weaponEditor.levelConfig')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2,3,4,5].map((level) => {
            const hasLevel = editedWeapon.levelVariations instanceof Map ? editedWeapon.levelVariations.has(level) : editedWeapon.levelVariations?.[level] !== undefined;
            return (
              <button key={level} onClick={() => setEditingLevel(level)} className={`px-3 py-2 text-xs rounded border ${hasLevel ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {t('weapon.weaponEditor.level', { level })}
              </button>
            );
          })}
        </div>
      </div>

      {editingLevel !== null && (<WeaponLevelDetailEditor level={editingLevel} onClose={() => setEditingLevel(null)} />)}

      <div className="pt-4 border-t">
        <button onClick={handleSave} className="w-full py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          {t('weapon.common.saveChanges')}
        </button>
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { useState, useEffect } from 'react';

interface WeaponLevelDetailEditorProps { level: number; onClose: () => void; }

export function WeaponLevelDetailEditor({ level, onClose }: WeaponLevelDetailEditorProps) {
  const { t } = useTranslation('common');
  const selectedWeaponId = useWeaponSkillStore((state) => state.selectedWeaponId);
  const updateWeapon = useWeaponSkillStore((state) => state.updateWeapon);
  const selectedWeapon = useWeaponSkillStore((state) => {
    if (!state.selectedWeaponId) return null;
    return state.weapons.find((w) => w.id === state.selectedWeaponId);
  });
  const currentLevel = selectedWeapon?.levelVariations?.[level];
  
  const [damageMin, setDamageMin] = useState(currentLevel?.baseDamage?.[0] || 0);
  const [damageMax, setDamageMax] = useState(currentLevel?.baseDamage?.[1] || 0);
  const [price, setPrice] = useState(currentLevel?.basePrice || 0);
  const [statBonuses, setStatBonuses] = useState<string>(() => {
    if (!currentLevel?.baseStatBonuses) return '';
    const bonuses = currentLevel.baseStatBonuses instanceof Map
      ? Array.from(currentLevel.baseStatBonuses.entries())
      : typeof currentLevel.baseStatBonuses === 'object'
        ? Object.entries(currentLevel.baseStatBonuses) : [];
    return bonuses.map(([key, value]) => `${key}=${value}`).join(', ');
  });

  useEffect(() => {
    if (currentLevel) {
      setDamageMin(currentLevel.baseDamage?.[0] || 0);
      setDamageMax(currentLevel.baseDamage?.[1] || 0);
      setPrice(currentLevel.basePrice || 0);
      const bonuses = currentLevel.baseStatBonuses instanceof Map
        ? Array.from(currentLevel.baseStatBonuses.entries())
        : typeof currentLevel.baseStatBonuses === 'object'
          ? Object.entries(currentLevel.baseStatBonuses || {}) : [];
      setStatBonuses(bonuses.map(([key, value]) => `${key}=${value}`).join(', '));
    }
  }, [currentLevel]);

  const handleSave = () => {
    if (!selectedWeaponId || !selectedWeapon) return;
    const statBonusesMap = new Map<string, number>();
    statBonuses.split(',').forEach((pair: string) => {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value) statBonusesMap.set(key, parseInt(value) || 0);
    });
    const levelVariations: Record<number, any> = { ...(selectedWeapon.levelVariations || {}) };
    const newLevelData = {
      baseDamage: [damageMin, damageMax] as [number, number],
      basePrice: price,
      baseStatBonuses: new Map(statBonusesMap),
      skills: Array.isArray(currentLevel?.skills) ? currentLevel.skills : [],
    };
    levelVariations[level] = newLevelData;
    updateWeapon({ ...selectedWeapon, levelVariations });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">{t('weapon.weaponLevelDetail.editLevel', { level })}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('weapon.weaponLevelDetail.baseDamage')}</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">{t('weapon.weaponLevelDetail.min')}</label>
                <input type="number" value={damageMin} onChange={(e) => setDamageMin(parseInt(e.target.value) || 0)} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">{t('weapon.weaponLevelDetail.max')}</label>
                <input type="number" value={damageMax} onChange={(e) => setDamageMax(parseInt(e.target.value) || 0)} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('weapon.weaponLevelDetail.basePrice')}</label>
            <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('weapon.weaponLevelDetail.statBonuses')}</label>
            <input type="text" value={statBonuses} onChange={(e) => setStatBonuses(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder={t('weapon.weaponLevelDetail.statBonusesPlaceholder')} />
            <p className="text-xs text-gray-400 mt-1">{t('weapon.weaponLevelDetail.statBonusesHint')}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">{t('weapon.common.cancel')}</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">{t('weapon.common.save')}</button>
        </div>
      </div>
    </div>
  );
}

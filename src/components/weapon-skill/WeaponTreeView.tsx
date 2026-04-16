import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';

type WeaponCategory = 'MeleeWeapon' | 'RangeWeapon' | 'MagicWeapon';

interface Weapon { id: string; category: string; }

interface WeaponSkillState { weapons: Weapon[]; selectedWeaponId: string | null; setSelectedWeapon: (id: string) => void; }

const CATEGORY_TRANSLATION_KEYS: Record<WeaponCategory, string> = {
  MeleeWeapon: 'weapon.treeView.meleeWeapon',
  RangeWeapon: 'weapon.treeView.rangeWeapon',
  MagicWeapon: 'weapon.treeView.magicWeapon',
};

export function WeaponTreeView() {
  const { t } = useTranslation('common');
  const weapons = useWeaponSkillStore((state: WeaponSkillState) => state.weapons);
  const selectedId = useWeaponSkillStore((state: WeaponSkillState) => state.selectedWeaponId);
  const setSelected = useWeaponSkillStore((state: WeaponSkillState) => state.setSelectedWeapon);
  const [expanded, setExpanded] = useState<Set<WeaponCategory>>(new Set(['MeleeWeapon']));

  const toggleCategory = (category: WeaponCategory) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category); else next.add(category);
      return next;
    });
  };

  const categories: WeaponCategory[] = ['MeleeWeapon', 'RangeWeapon', 'MagicWeapon'];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {categories.map((category) => {
          const isExpanded = expanded.has(category);
          const categoryWeapons = weapons.filter((w: Weapon) => w.category === category);
          return (
            <div key={category} className="border rounded-md mb-2">
              <div className="py-2 px-3 bg-gray-100 flex items-center gap-2">
                <button className="h-6 w-6 p-0.5 hover:bg-gray-200 rounded" onClick={() => toggleCategory(category)}>
                  {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  )}
                </button>
                <span className="text-sm font-medium">{t(CATEGORY_TRANSLATION_KEYS[category])}</span>
              </div>
              {isExpanded && (
                <div className="py-2 px-2">
                  <div className="space-y-1">
                    {categoryWeapons.map((weapon: Weapon) => (
                      <button key={weapon.id} className={`w-full text-left px-3 py-1 text-xs rounded ${selectedId === weapon.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`} onClick={() => setSelected(weapon.id)}>
                        {weapon.id}
                      </button>
                    ))}
                    {categoryWeapons.length === 0 && <p className="text-xs text-gray-500 pl-8">{t('weapon.treeView.noWeapons')}</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

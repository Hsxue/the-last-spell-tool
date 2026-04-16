import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';

type SkillCategory = 'MeleeWeapons' | 'RangeWeapons' | 'MagicWeapons' | 'General';

interface Skill { id: string; category: string; }

const CATEGORY_TRANSLATION_KEYS: Record<SkillCategory, string> = {
  MeleeWeapons: 'weapon.treeView.meleeWeaponSkill',
  RangeWeapons: 'weapon.treeView.rangeWeaponSkill',
  MagicWeapons: 'weapon.treeView.magicWeaponSkill',
  General: 'weapon.treeView.generalSkill',
};

export function SkillTreeView() {
  const { t } = useTranslation('common');
  const skills = useWeaponSkillStore((state: any) => state.skills);
  const selectedId = useWeaponSkillStore((state: any) => state.selectedSkillId);
  const setSelected = useWeaponSkillStore((state: any) => state.setSelectedSkill);
  const [expanded, setExpanded] = useState<Set<SkillCategory>>(new Set(['MeleeWeapons']));

  const toggleCategory = (category: SkillCategory) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category); else next.add(category);
      return next;
    });
  };

  const categories: SkillCategory[] = ['MeleeWeapons', 'RangeWeapons', 'MagicWeapons', 'General'];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {categories.map((category) => {
          const isExpanded = expanded.has(category);
          const categorySkills = skills.filter((s: Skill) => s.category === category);
          return (
            <div key={category} className="border rounded-md mb-2">
              <div className="py-2 px-3 bg-gray-100 flex items-center gap-2">
                <button className="h-6 w-6 p-0.5 hover:bg-gray-200 rounded" onClick={() => toggleCategory(category)}>
                  {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  )}
                </button>
                <span className="text-sm font-medium">{t(CATEGORY_TRANSLATION_KEYS[category])}</span>
              </div>
              {isExpanded && (
                <div className="py-2 px-2">
                  <div className="space-y-1">
                    {categorySkills.map((skill: Skill) => (
                      <button key={skill.id} className={`w-full text-left px-3 py-1 text-xs rounded ${selectedId === skill.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`} onClick={() => setSelected(skill.id)}>
                        {skill.id}
                      </button>
                    ))}
                    {categorySkills.length === 0 && <p className="text-xs text-gray-500 pl-8">{t('weapon.treeView.noSkills')}</p>}
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

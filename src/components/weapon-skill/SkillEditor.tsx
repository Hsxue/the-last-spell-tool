import { useWeaponSkillStore } from '../../store/weaponSkillStore';

export function SkillEditor() {
  const selectedSkill = useWeaponSkillStore((state: any) => 
    state.skills.find((s: any) => s.id === state.selectedSkillId)
  );

  if (!selectedSkill) return <div className="p-4 text-sm text-gray-500">Select a skill first</div>;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold">{selectedSkill.id}</h3>
      <p className="text-xs text-gray-400">Skill editor (Task 12)</p>
    </div>
  );
}
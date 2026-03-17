import { useWeaponSkillStore } from '../../store/weaponSkillStore';

export function WeaponLevelForm() {
  const selectedWeapon = useWeaponSkillStore((state: any) => 
    state.weapons.find((w: any) => w.id === state.selectedWeaponId)
  );

  if (!selectedWeapon) return <div className="p-4 text-sm text-gray-500">Select a weapon first</div>;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold">Level Configuration</h3>
      <p className="text-xs text-gray-400">Form for editing weapon levels (Task 11)</p>
    </div>
  );
}
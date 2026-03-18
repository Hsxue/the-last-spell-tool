import { useWeaponSkillStore } from '../../store/weaponSkillStore';

export function WeaponEditor() {
  const selectedWeapon = useWeaponSkillStore((state: any) => {
    if (!state.selectedWeaponId) return null;
    return state.weapons.find((w: any) => w.id === state.selectedWeaponId);
  });

  if (!selectedWeapon) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-sm">Select a weapon to edit</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="border-b pb-2">
        <h2 className="text-lg font-semibold">{selectedWeapon.id}</h2>
        <p className="text-sm text-gray-500">Category: {selectedWeapon.category}</p>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Weapon Editor - Coming Soon</p>
        <p className="text-xs text-gray-400">
          Tasks 10-11 will add:
        </p>
        <ul className="text-xs text-gray-400 list-disc list-inside">
          <li>Basic info form (name, category, hands)</li>
          <li>Level configuration</li>
          <li>Stat bonuses editor</li>
          <li>Skills assignment</li>
        </ul>
      </div>
    </div>
  );
}
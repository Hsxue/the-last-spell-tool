import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { Input, Label } from '../ui';

export function CostsAndRangeForm() {
  const selectedSkill = useWeaponSkillStore((state: any) => 
    state.skills.find((s: any) => s.id === state.selectedSkillId)
  );

  if (!selectedSkill) return <div className="p-4 text-sm text-gray-500">Select a skill first</div>;

  return (
    <div className="p-4 space-y-4 border-t">
      <h3 className="text-sm font-semibold">Costs & Range</h3>
      
      {/* Costs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">AP Cost</Label>
          <Input type="number" className="text-xs" defaultValue={selectedSkill.actionPointsCost || 0} />
        </div>
        <div>
          <Label className="text-xs">Mana Cost</Label>
          <Input type="number" className="text-xs" defaultValue={selectedSkill.manaCost || 0} />
        </div>
        <div>
          <Label className="text-xs">Health Cost</Label>
          <Input type="number" className="text-xs" defaultValue={selectedSkill.healthCost || 0} />
        </div>
        <div>
          <Label className="text-xs">Uses/Turn</Label>
          <Input type="number" className="text-xs" defaultValue={selectedSkill.usesPerTurnCount || 1} />
        </div>
      </div>

      {/* Range */}
      <div className="border-t pt-3">
        <h4 className="text-xs font-medium mb-2">Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Min</Label>
            <Input type="number" className="text-xs" defaultValue={selectedSkill.skillRange?.min || 1} />
          </div>
          <div>
            <Label className="text-xs">Max</Label>
            <Input type="number" className="text-xs" defaultValue={selectedSkill.skillRange?.max || 5} />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">Task 14 - CostsAndRangeForm placeholder</p>
    </div>
  );
}
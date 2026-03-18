import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { useState } from 'react';

interface WeaponLevelDetailEditorProps {
  level: number;
  onClose: () => void;
}

export function WeaponLevelDetailEditor({ level, onClose }: WeaponLevelDetailEditorProps) {
  const selectedWeaponId = useWeaponSkillStore((state: any) => state.selectedWeaponId);
  const updateWeapon = useWeaponSkillStore((state: any) => state.updateWeapon);
  
  const selectedWeapon = useWeaponSkillStore((state: any) => 
    state.weapons.find((w: any) => w.id === state.selectedWeaponId)
  );
  
  const currentLevel = selectedWeapon?.levels?.[level];
  
  const [damageMin, setDamageMin] = useState(currentLevel?.baseDamage?.min || 0);
  const [damageMax, setDamageMax] = useState(currentLevel?.baseDamage?.max || 0);
  const [price, setPrice] = useState(currentLevel?.basePrice || 0);
  const [statBonuses, setStatBonuses] = useState<string>(
    currentLevel?.baseStatBonuses ? Object.entries(currentLevel.baseStatBonuses)
      .map(([key, value]: [string, any]) => `${key}=${value}`).join(', ') : ''
  );

  const handleSave = () => {
    if (!selectedWeaponId) return;
    
    const updatedLevels = [...(selectedWeapon?.levels || [])];
    updatedLevels[level] = {
      ...currentLevel,
      baseDamage: { min: damageMin, max: damageMax },
      basePrice: price,
      baseStatBonuses: statBonuses.split(',').reduce((acc: any, pair: string) => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key && value) acc[key] = parseInt(value) || 0;
        return acc;
      }, {}),
    };
    
    updateWeapon({ ...selectedWeapon, levels: updatedLevels });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">编辑级别 {level}</h2>
        
        <div className="space-y-4">
          {/* 伤害 */}
          <div>
            <label className="block text-sm font-medium mb-2">基础伤害</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">最小</label>
                <input 
                  type="number" 
                  value={damageMin}
                  onChange={(e) => setDamageMin(parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">最大</label>
                <input 
                  type="number" 
                  value={damageMax}
                  onChange={(e) => setDamageMax(parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 价格 */}
          <div>
            <label className="block text-sm font-medium mb-1">基础价格</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          {/* 属性加成 */}
          <div>
            <label className="block text-sm font-medium mb-1">属性加成</label>
            <input 
              type="text" 
              value={statBonuses}
              onChange={(e) => setStatBonuses(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="例如：Strength=5, Agility=3"
            />
            <p className="text-xs text-gray-400 mt-1">格式：属性名=数值，用逗号分隔</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
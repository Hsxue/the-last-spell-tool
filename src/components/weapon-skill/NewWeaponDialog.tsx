import { useState } from 'react';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';

interface NewWeaponDialogProps {
  open: boolean;
  onClose: () => void;
}

type WeaponCategory = 'MeleeWeapon' | 'RangeWeapon' | 'MagicWeapon';

export function NewWeaponDialog({ open, onClose }: NewWeaponDialogProps) {
  const addWeapon = useWeaponSkillStore((state: any) => state.addWeapon);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WeaponCategory>('MeleeWeapon');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    addWeapon({
      id: name.trim(),
      category,
      hands: 'OneHand',
      tags: [],
      levelVariations: {},
    });
    
    setName('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">新建武器</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">武器名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="例如：IronSword"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">类别</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WeaponCategory)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="MeleeWeapon">近战武器</option>
              <option value="RangeWeapon">远程武器</option>
              <option value="MagicWeapon">魔法武器</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded disabled:opacity-50"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
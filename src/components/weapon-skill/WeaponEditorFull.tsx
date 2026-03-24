import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { useState, useEffect } from 'react';
import { WeaponLevelDetailEditor } from './WeaponLevelDetailEditor';
import { WeaponXMLButton } from './WeaponXMLButton';

export function WeaponEditorFull() {
  const selectedWeapon = useWeaponSkillStore((state: any) => {
    if (!state.selectedWeaponId) return null;
    return state.weapons.find((w: any) => w.id === state.selectedWeaponId);
  });
  const updateWeapon = useWeaponSkillStore((state: any) => state.updateWeapon);
  const [editedWeapon, setEditedWeapon] = useState<any>(null);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);

  // 当 selectedWeapon 变化时更新 editedWeapon
  useEffect(() => {
    if (selectedWeapon) {
      setEditedWeapon({...selectedWeapon}); // 创建副本避免直接引用
    }
  }, [selectedWeapon]);

  // 没有选中武器或数据未加载时显示空状态
  if (!selectedWeapon || !editedWeapon) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-sm">选择武器以编辑</p>
      </div>
    );
  }

  const handleSave = () => {
    updateWeapon(editedWeapon);
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="border-b pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{selectedWeapon.id}</h2>
          <p className="text-sm text-gray-500">类别：{selectedWeapon.category}</p>
        </div>
        <WeaponXMLButton weaponId={selectedWeapon.id} />
      </div>
      
      {/* 基本信息 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">基本信息</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Id</label>
            <input 
              type="text" 
              value={editedWeapon.id || ''}
              onChange={(e) => setEditedWeapon({...editedWeapon, id: e.target.value})}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">类别</label>
            <select
              value={editedWeapon.category || ''}
              onChange={(e) => setEditedWeapon({...editedWeapon, category: e.target.value})}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="MeleeWeapon">近战武器</option>
              <option value="RangeWeapon">远程武器</option>
              <option value="MagicWeapon">魔法武器</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">持握方式</label>
            <select
              value={editedWeapon.hands || 'OneHand'}
              onChange={(e) => setEditedWeapon({...editedWeapon, hands: e.target.value})}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="OneHand">单手</option>
              <option value="TwoHand">双手</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">标签</label>
            <input 
              type="text" 
              value={editedWeapon.tags?.join(', ') || ''}
              onChange={(e) => setEditedWeapon({...editedWeapon, tags: e.target.value.split(',').map((t:string) => t.trim())})}
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder="用逗号分隔"
            />
          </div>
        </div>
      </div>

      {/* 级别配置 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">级别配置 (0-5)</h3>
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2,3,4,5].map((level) => (
            <button
              key={level}
              onClick={() => setEditingLevel(level)}
              className={`px-3 py-2 text-xs rounded border ${
                selectedWeapon.levels?.[level] 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              级别 {level}
            </button>
          ))}
        </div>
      </div>

      {/* 级别详细编辑器 */}
      {editingLevel !== null && (
        <WeaponLevelDetailEditor 
          level={editingLevel} 
          onClose={() => setEditingLevel(null)} 
        />
      )}

      {/* 保存按钮 */}
      <div className="pt-4 border-t">
        <button
          onClick={handleSave}
          className="w-full py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          保存更改
        </button>
      </div>
    </div>
  );
}
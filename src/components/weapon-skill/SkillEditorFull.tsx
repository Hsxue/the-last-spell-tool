import { useEffect, useState } from 'react';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { SkillEffectForms } from './SkillEffectForms';
import { SkillXMLButton } from './SkillXMLButton';

export function SkillEditorFull() {
  const selectedSkill = useWeaponSkillStore((state) => {
    if (!state.selectedSkillId) return null;
    return state.skills.find((s) => s.id === state.selectedSkillId);
  });
  const updateSkill = useWeaponSkillStore((state) => state.updateSkill);

  const [editedSkill, setEditedSkill] = useState<any>(null);

  // Sync editedSkill with selectedSkill
  useEffect(() => {
    setEditedSkill(selectedSkill);
  }, [selectedSkill]);

  const handleSkillEffectChange = (updates: any) => {
    setEditedSkill({ ...editedSkill, ...updates });
  };

  const handleSave = () => {
    updateSkill(editedSkill);
  };

  if (!selectedSkill || !editedSkill) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-sm">选择技能以编辑</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="border-b pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{selectedSkill.id}</h2>
          <p className="text-sm text-gray-500">类别：{selectedSkill.category}</p>
        </div>
        <SkillXMLButton skillId={selectedSkill.id} />
      </div>
      
      {/* 基本信息 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">基本信息</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Id</label>
            <input 
              type="text" 
              value={editedSkill.id || ''}
              onChange={(e) => setEditedSkill({...editedSkill, id: e.target.value})}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">类别</label>
            <select
              value={editedSkill.category || ''}
              onChange={(e) => setEditedSkill({...editedSkill, category: e.target.value})}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="MeleeWeapons">近战武器技能</option>
              <option value="RangeWeapons">远程武器技能</option>
              <option value="MagicWeapons">魔法武器技能</option>
              <option value="General">通用技能</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">效果类型</label>
            <select
              value={editedSkill.effectType || 'AttackAction'}
              onChange={(e) => setEditedSkill({...editedSkill, effectType: e.target.value})}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="AttackAction">攻击动作</option>
              <option value="CastEffect">施法效果</option>
              <option value="GenericAction">通用动作</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">描述</label>
            <input 
              type="text" 
              value={editedSkill.description || ''}
              onChange={(e) => setEditedSkill({...editedSkill, description: e.target.value})}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 效果配置区域 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">效果配置</h3>
        {/* 成本 */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">AP 消耗</label>
            <input 
              type="number" 
              value={editedSkill.actionPointsCost || 0}
              onChange={(e) => setEditedSkill({...editedSkill, actionPointsCost: parseInt(e.target.value)})}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">法力消耗</label>
            <input 
              type="number" 
              value={editedSkill.manaCost || 0}
              onChange={(e) => setEditedSkill({...editedSkill, manaCost: parseInt(e.target.value)})}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">生命消耗</label>
            <input 
              type="number" 
              value={editedSkill.healthCost || 0}
              onChange={(e) => setEditedSkill({...editedSkill, healthCost: parseInt(e.target.value)})}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>
        </div>
        
        {/* 范围 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">最小范围</label>
            <input 
              type="number" 
              value={editedSkill.skillRange?.min || 1}
              onChange={(e) => setEditedSkill({...editedSkill, skillRange: {...(editedSkill.skillRange || {}), min: parseInt(e.target.value)}})}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">最大范围</label>
            <input 
              type="number" 
              value={editedSkill.skillRange?.max || 5}
              onChange={(e) => setEditedSkill({...editedSkill, skillRange: {...(editedSkill.skillRange || {}), max: parseInt(e.target.value)}})}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-400">更多效果配置 (任务 8 实现)</p>
      </div>

      {/* 效果表单 */}
      <SkillEffectForms 
        skill={editedSkill} 
        onChange={handleSkillEffectChange} 
      />

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
import { useState } from 'react';

interface SkillEffectFormsProps {
  skill: any;
  onChange: (updates: any) => void;
}

export function SkillEffectForms({ skill, onChange }: SkillEffectFormsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('attack');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">效果配置</h3>
      
      {/* 攻击动作 */}
      <div className="border rounded">
        <button
          onClick={() => toggleSection('attack')}
          className="w-full px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
        >
          <span>攻击动作</span>
          <span>{expandedSection === 'attack' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'attack' && (
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">伤害倍率</label>
                <input
                  type="number"
                  step="0.1"
                  value={skill.attackAction?.damageMultiplier || 1.0}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, damageMultiplier: parseFloat(e.target.value) }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">暴击几率 (%)</label>
                <input
                  type="number"
                  value={skill.attackAction?.criticalChance || 10}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, criticalChance: parseInt(e.target.value) }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">基础伤害 Min</label>
                <input
                  type="number"
                  value={skill.attackAction?.baseDamage?.[0] || 0}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, baseDamage: [parseInt(e.target.value), skill.attackAction?.baseDamage?.[1] || 0] }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">基础伤害 Max</label>
                <input
                  type="number"
                  value={skill.attackAction?.baseDamage?.[1] || 0}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, baseDamage: [skill.attackAction?.baseDamage?.[0] || 0, parseInt(e.target.value)] }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">攻击类型</label>
                <select
                  value={skill.attackAction?.attackType || 'Physical'}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, attackType: e.target.value }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                >
                  <option value="Physical">物理</option>
                  <option value="Magical">魔法</option>
                  <option value="Ranged">远程</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-gray-500">效果标志</label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={skill.attackAction?.effects?.follow || false}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, effects: { ...skill.attackAction?.effects, follow: e.target.checked } }
                  })}
                />
                Follow
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={skill.attackAction?.effects?.maneuver || false}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, effects: { ...skill.attackAction?.effects, maneuver: e.target.checked } }
                  })}
                />
                Maneuver
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={skill.attackAction?.effects?.multiHit || false}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, effects: { ...skill.attackAction?.effects, multiHit: e.target.checked } }
                  })}
                />
                MultiHit
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={skill.attackAction?.effects?.armorPiercing || false}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, effects: { ...skill.attackAction?.effects, armorPiercing: e.target.checked } }
                  })}
                />
                ArmorPiercing
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 通用动作 */}
      <div className="border rounded">
        <button
          onClick={() => toggleSection('generic')}
          className="w-full px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
        >
          <span>通用动作</span>
          <span>{expandedSection === 'generic' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'generic' && (
          <div className="p-3 space-y-2">
            <div>
              <label className="block text-xs text-gray-500">动作类型</label>
              <input
                type="text"
                value={skill.genericAction?.actionType || ''}
                onChange={(e) => onChange({
                  genericAction: { ...skill.genericAction, actionType: e.target.value }
                })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* 施法效果 */}
      <div className="border rounded">
        <button
          onClick={() => toggleSection('cast')}
          className="w-full px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
        >
          <span>施法效果</span>
          <span>{expandedSection === 'cast' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'cast' && (
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">VFX</label>
                <input
                  type="text"
                  value={skill.castFx?.vfx || ''}
                  onChange={(e) => onChange({
                    castFx: { ...skill.castFx, vfx: e.target.value }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="特效名称"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">音效</label>
                <input
                  type="text"
                  value={skill.castFx?.sound || ''}
                  onChange={(e) => onChange({
                    castFx: { ...skill.castFx, sound: e.target.value }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="音效名称"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">摄像机震动</label>
                <input
                  type="number"
                  step="0.1"
                  value={skill.castFx?.camShake || 0}
                  onChange={(e) => onChange({
                    castFx: { ...skill.castFx, camShake: parseFloat(e.target.value) }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">施法动画</label>
                <input
                  type="text"
                  value={skill.castFx?.casterAnim || ''}
                  onChange={(e) => onChange({
                    castFx: { ...skill.castFx, casterAnim: e.target.value }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 条件 */}
      <div className="border rounded">
        <button
          onClick={() => toggleSection('conditions')}
          className="w-full px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
        >
          <span>条件</span>
          <span>{expandedSection === 'conditions' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'conditions' && (
          <div className="p-3 space-y-2">
            <div>
              <label className="block text-xs text-gray-500">阶段</label>
              <input
                type="text"
                value={skill.conditions?.phase || ''}
                onChange={(e) => onChange({
                  conditions: { ...skill.conditions, phase: e.target.value }
                })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={skill.conditions?.targetInRange || false}
                onChange={(e) => onChange({
                  conditions: { ...skill.conditions, targetInRange: e.target.checked }
                })}
              />
              目标必须在范围内
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={skill.conditions?.inWatchtower || false}
                onChange={(e) => onChange({
                  conditions: { ...skill.conditions, inWatchtower: e.target.checked }
                })}
              />
              必须在瞭望塔内
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
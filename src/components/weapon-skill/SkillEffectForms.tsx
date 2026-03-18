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
                  value={skill.attackAction?.critChance || 10}
                  onChange={(e) => onChange({
                    attackAction: { ...skill.attackAction, critChance: parseInt(e.target.value) }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
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
                  value={skill.castEffect?.vfx || ''}
                  onChange={(e) => onChange({
                    castEffect: { ...skill.castEffect, vfx: e.target.value }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="特效名称"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">音效</label>
                <input
                  type="text"
                  value={skill.castEffect?.sound || ''}
                  onChange={(e) => onChange({
                    castEffect: { ...skill.castEffect, sound: e.target.value }
                  })}
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="音效名称"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500">摄像机震动</label>
              <input
                type="number"
                step="0.1"
                value={skill.castEffect?.camShake || 0}
                onChange={(e) => onChange({
                  castEffect: { ...skill.castEffect, camShake: parseFloat(e.target.value) }
                })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
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
                value={skill.conditions?.phase || 'Combat'}
                onChange={(e) => onChange({
                  conditions: { ...skill.conditions, phase: e.target.value }
                })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
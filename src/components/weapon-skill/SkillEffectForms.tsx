import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface SkillEffectFormsProps { skill: any; onChange: (updates: any) => void; }

export function SkillEffectForms({ skill, onChange }: SkillEffectFormsProps) {
  const { t } = useTranslation('common');
  const [expandedSection, setExpandedSection] = useState<string | null>('attack');

  const toggleSection = (section: string) => { setExpandedSection(expandedSection === section ? null : section); };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{t('weapon.skillEffects.sectionTitle')}</h3>
      
      <div className="border rounded">
        <button onClick={() => toggleSection('attack')} className="w-full px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
          <span>{t('weapon.skillEffects.attackAction')}</span>
          <span>{expandedSection === 'attack' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'attack' && (
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.damageMultiplier')}</label>
                <input type="number" step="0.1" value={skill.attackAction?.damageMultiplier || 1.0} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, damageMultiplier: parseFloat(e.target.value) } })} className="w-full border rounded px-2 py-1 text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.criticalChance')}</label>
                <input type="number" value={skill.attackAction?.criticalChance || 10} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, criticalChance: parseInt(e.target.value) } })} className="w-full border rounded px-2 py-1 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.baseDamageMin')}</label>
                <input type="number" value={skill.attackAction?.baseDamage?.[0] || 0} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, baseDamage: [parseInt(e.target.value), skill.attackAction?.baseDamage?.[1] || 0] } })} className="w-full border rounded px-2 py-1 text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.baseDamageMax')}</label>
                <input type="number" value={skill.attackAction?.baseDamage?.[1] || 0} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, baseDamage: [skill.attackAction?.baseDamage?.[0] || 0, parseInt(e.target.value)] } })} className="w-full border rounded px-2 py-1 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.attackType')}</label>
                <select value={skill.attackAction?.attackType || 'Physical'} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, attackType: e.target.value } })} className="w-full border rounded px-2 py-1 text-xs">
                  <option value="Physical">{t('weapon.attackTypes.physical')}</option>
                  <option value="Magical">{t('weapon.attackTypes.magical')}</option>
                  <option value="Ranged">{t('weapon.attackTypes.ranged')}</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-gray-500">{t('weapon.skillEffects.effectFlags')}</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={skill.attackAction?.effects?.follow || false} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, effects: { ...skill.attackAction?.effects, follow: e.target.checked } } })} /> Follow</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={skill.attackAction?.effects?.maneuver || false} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, effects: { ...skill.attackAction?.effects, maneuver: e.target.checked } } })} /> Maneuver</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={skill.attackAction?.effects?.multiHit || false} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, effects: { ...skill.attackAction?.effects, multiHit: e.target.checked } } })} /> MultiHit</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={skill.attackAction?.effects?.armorPiercing || false} onChange={(e) => onChange({ attackAction: { ...skill.attackAction, effects: { ...skill.attackAction?.effects, armorPiercing: e.target.checked } } })} /> ArmorPiercing</label>
            </div>
          </div>
        )}
      </div>

      <div className="border rounded">
        <button onClick={() => toggleSection('generic')} className="w-full px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
          <span>{t('weapon.skillEffects.genericAction')}</span>
          <span>{expandedSection === 'generic' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'generic' && (
          <div className="p-3 space-y-2">
            <div>
              <label className="block text-xs text-gray-500">{t('weapon.skillEffects.actionType')}</label>
              <input type="text" value={skill.genericAction?.actionType || ''} onChange={(e) => onChange({ genericAction: { ...skill.genericAction, actionType: e.target.value } })} className="w-full border rounded px-2 py-1 text-xs" />
            </div>
          </div>
        )}
      </div>

      <div className="border rounded">
        <button onClick={() => toggleSection('cast')} className="w-full px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
          <span>{t('weapon.skillEffects.castEffect')}</span>
          <span>{expandedSection === 'cast' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'cast' && (
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.vfx')}</label>
                <input type="text" value={skill.castFx?.vfx || ''} onChange={(e) => onChange({ castFx: { ...skill.castFx, vfx: e.target.value } })} className="w-full border rounded px-2 py-1 text-xs" placeholder={t('weapon.skillEffects.vfxPlaceholder')} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.sound')}</label>
                <input type="text" value={skill.castFx?.sound || ''} onChange={(e) => onChange({ castFx: { ...skill.castFx, sound: e.target.value } })} className="w-full border rounded px-2 py-1 text-xs" placeholder={t('weapon.skillEffects.soundPlaceholder')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.camShake')}</label>
                <input type="number" step="0.1" value={skill.castFx?.camShake || 0} onChange={(e) => onChange({ castFx: { ...skill.castFx, camShake: parseFloat(e.target.value) } })} className="w-full border rounded px-2 py-1 text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">{t('weapon.skillEffects.casterAnim')}</label>
                <input type="text" value={skill.castFx?.casterAnim || ''} onChange={(e) => onChange({ castFx: { ...skill.castFx, casterAnim: e.target.value } })} className="w-full border rounded px-2 py-1 text-xs" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border rounded">
        <button onClick={() => toggleSection('conditions')} className="w-full px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
          <span>{t('weapon.skillEffects.conditions')}</span>
          <span>{expandedSection === 'conditions' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'conditions' && (
          <div className="p-3 space-y-2">
            <div>
              <label className="block text-xs text-gray-500">{t('weapon.skillEffects.phase')}</label>
              <input type="text" value={skill.conditions?.phase || ''} onChange={(e) => onChange({ conditions: { ...skill.conditions, phase: e.target.value } })} className="w-full border rounded px-2 py-1 text-xs" />
            </div>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={skill.conditions?.targetInRange || false} onChange={(e) => onChange({ conditions: { ...skill.conditions, targetInRange: e.target.checked } })} /> {t('weapon.skillEffects.targetInRange')}</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={skill.conditions?.inWatchtower || false} onChange={(e) => onChange({ conditions: { ...skill.conditions, inWatchtower: e.target.checked } })} /> {t('weapon.skillEffects.inWatchtower')}</label>
          </div>
        )}
      </div>
    </div>
  );
}

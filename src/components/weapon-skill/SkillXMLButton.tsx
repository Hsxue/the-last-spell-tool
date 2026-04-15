import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { useWeaponSkillStore } from '@/store/weaponSkillStore';
import { exportSkills, parseSkills } from '@/lib/xml/skill-xml-parser';

interface SkillXMLButtonProps { skillId: string; }

export function SkillXMLButton({ skillId }: SkillXMLButtonProps) {
  const { t } = useTranslation('common');
  const { skills, updateSkill } = useWeaponSkillStore();
  const skill = skills.find(s => s.id === skillId);
  const [isXMLMode, setIsXMLMode] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  const handleOpenXMLMode = () => {
    if (!skill) return;
    try {
      const allSkills = exportSkills([skill]);
      const match = allSkills.match(/<Skill>[\s\S]*<\/Skill>/);
      setXmlContent(match ? match[0] : '');
      setIsXMLMode(true);
    } catch (error) { console.error('Failed to generate skill XML:', error); }
  };

  const handleCloseXMLMode = () => { setIsXMLMode(false); setXmlContent(''); };

  const handleApplyXml = (xml: string) => {
    try {
      const wrapped = '<?xml version="1.0" encoding="utf-16"?>\n<Skills>' + xml + '</Skills>';
      const parsed = parseSkills(wrapped);
      if (parsed.length > 0) updateSkill(parsed[0]);
      handleCloseXMLMode();
    } catch (error) { console.error('Failed to parse skill XML:', error); throw error; }
  };

  if (!skill) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpenXMLMode}>📄 XML</Button>
      <XMLEditorModal isOpen={isXMLMode} onClose={handleCloseXMLMode} value={xmlContent} onApply={handleApplyXml} language="xml" title={t('weapon.xml.skillTitle', { id: skill.id })} />
    </>
  );
}

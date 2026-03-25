/**
 * SkillXMLButton - Button to edit skill in XML mode
 * Uses the dedicated skill-xml-parser for proper serialization
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { useWeaponSkillStore } from '@/store/weaponSkillStore';
import { exportSkills, parseSkills } from '@/lib/xml/skill-xml-parser';

interface SkillXMLButtonProps {
  skillId: string;
}

export function SkillXMLButton({ skillId }: SkillXMLButtonProps) {
  const { skills, updateSkill } = useWeaponSkillStore();
  const skill = skills.find(s => s.id === skillId);
  const [isXMLMode, setIsXMLMode] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  const handleOpenXMLMode = () => {
    if (!skill) return;
    try {
      // Use skill-xml-parser to generate proper XML
      const allSkills = exportSkills([skill]);
      // Extract just the Skill element
      const match = allSkills.match(/<Skill>[\s\S]*<\/Skill>/);
      const skillXml = match ? match[0] : '';
      setXmlContent(skillXml);
      setIsXMLMode(true);
    } catch (error) {
      console.error('Failed to generate skill XML:', error);
    }
  };

  const handleCloseXMLMode = () => {
    setIsXMLMode(false);
    setXmlContent('');
  };

  const handleApplyXml = (xml: string) => {
    try {
      // Wrap single skill in Skills root element for parsing
      const wrapped = `<?xml version="1.0" encoding="utf-16"?>\n<Skills>${xml}</Skills>`;
      const parsed = parseSkills(wrapped);
      if (parsed.length > 0) {
        updateSkill(parsed[0]);
      }
      handleCloseXMLMode();
    } catch (error) {
      console.error('Failed to parse skill XML:', error);
      throw error;
    }
  };

  if (!skill) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpenXMLMode}>
        📄 XML
      </Button>
      <XMLEditorModal
        isOpen={isXMLMode}
        onClose={handleCloseXMLMode}
        value={xmlContent}
        onApply={handleApplyXml}
        language="xml"
        title={`技能编辑 - ${skill.id} - XML 模式`}
      />
    </>
  );
}

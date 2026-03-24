/**
 * SkillXMLButton - Button to edit skill in XML mode
 */

import { Button } from '@/components/ui/button';
import { useXMLMode } from '@/hooks/useXMLMode';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { skillSchema } from '@/types/XMLSchemas';
import { useWeaponSkillStore } from '@/store/weaponSkillStore';
import type { SkillDefinition } from '@/types/weapon-skill';

interface SkillXMLButtonProps {
  skillId: string;
}

export function SkillXMLButton({ skillId }: SkillXMLButtonProps) {
  const { skills, updateSkill } = useWeaponSkillStore();
  const skill = skills.find(s => s.id === skillId);
  
  const { isXMLMode, openXMLMode, closeXMLMode, handleApply, xmlContent } = useXMLMode({
    gameObject: skill || ({} as SkillDefinition),
    schema: skillSchema,
    onApply: (updatedSkill) => {
      updateSkill(updatedSkill);
    },
  });

  if (!skill) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={openXMLMode}>
        📄 XML
      </Button>
      <XMLEditorModal
        isOpen={isXMLMode}
        onClose={closeXMLMode}
        value={xmlContent}
        onApply={handleApply}
        language="xml"
        title={`技能编辑 - ${skill.id} - XML 模式`}
      />
    </>
  );
}

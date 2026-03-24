/**
 * WeaponXMLButton - Button to edit weapon in XML mode
 */

import { Button } from '@/components/ui/button';
import { useXMLMode } from '@/hooks/useXMLMode';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { weaponSchema } from '@/types/XMLSchemas';
import { useWeaponSkillStore } from '@/store/weaponSkillStore';
import type { WeaponDefinition } from '@/types/weapon-skill';

interface WeaponXMLButtonProps {
  weaponId: string;
}

export function WeaponXMLButton({ weaponId }: WeaponXMLButtonProps) {
  const { weapons, updateWeapon } = useWeaponSkillStore();
  const weapon = weapons.find(w => w.id === weaponId);
  
  const { isXMLMode, openXMLMode, closeXMLMode, handleApply, xmlContent } = useXMLMode({
    gameObject: weapon || ({} as WeaponDefinition),
    schema: weaponSchema,
    onApply: (updatedWeapon) => {
      updateWeapon(updatedWeapon);
    },
  });

  if (!weapon) return null;

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
        title={`武器编辑 - ${weapon.id} - XML 模式`}
      />
    </>
  );
}

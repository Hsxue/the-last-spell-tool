/**
 * WeaponXMLButton - Button to edit weapon in XML mode
 * Uses the dedicated weapon-xml-parser for proper serialization
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { useWeaponSkillStore } from '@/store/weaponSkillStore';
import { exportWeapons, parseWeapons } from '@/lib/xml/weapon-xml-parser';

interface WeaponXMLButtonProps {
  weaponId: string;
}

export function WeaponXMLButton({ weaponId }: WeaponXMLButtonProps) {
  const { weapons, updateWeapon } = useWeaponSkillStore();
  const [isXMLMode, setIsXMLMode] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  const handleOpenXMLMode = () => {
    // Re-read weapon from store at click time to get latest data
    const weapon = weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    
    console.log('[WeaponXMLButton] Opening XML mode for weapon:', weaponId);
    console.log('[WeaponXMLButton] weapon.levelVariations:', weapon.levelVariations);
    if (weapon.levelVariations instanceof Map) {
      console.log('[WeaponXMLButton] levelVariations size:', weapon.levelVariations.size);
      weapon.levelVariations.forEach((data, level) => {
        console.log(`[WeaponXMLButton] Level ${level}:`, data);
        console.log(`[WeaponXMLButton]   baseDamage:`, (data as any).baseDamage);
      });
    }
    
    try {
      // Use weapon-xml-parser to generate proper XML
      const allWeapons = exportWeapons([weapon]);
      // Extract just the Weapon element
      const match = allWeapons.match(/<Weapon>[\s\S]*<\/Weapon>/);
      const weaponXml = match ? match[0] : '';
      console.log('[WeaponXMLButton] Generated XML:', weaponXml.substring(0, 500));
      setXmlContent(weaponXml);
      setIsXMLMode(true);
    } catch (error) {
      console.error('Failed to generate weapon XML:', error);
    }
  };

  const handleCloseXMLMode = () => {
    setIsXMLMode(false);
    setXmlContent('');
  };

  const handleApplyXml = (xml: string) => {
    try {
      // Wrap single weapon in Weapons root element for parsing
      const wrapped = `<?xml version="1.0" encoding="utf-16"?>\n<Weapons>${xml}</Weapons>`;
      const parsed = parseWeapons(wrapped);
      if (parsed.length > 0) {
        updateWeapon(parsed[0]);
      }
      handleCloseXMLMode();
    } catch (error) {
      console.error('Failed to parse weapon XML:', error);
      throw error;
    }
  };

  const weapon = weapons.find(w => w.id === weaponId);
  if (!weapon) return null;

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
        title={`武器编辑 - ${weapon.id} - XML 模式`}
      />
    </>
  );
}

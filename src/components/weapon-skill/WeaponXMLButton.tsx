import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { useWeaponSkillStore } from '@/store/weaponSkillStore';
import { exportWeapons, parseWeapons } from '@/lib/xml/weapon-xml-parser';

interface WeaponXMLButtonProps { weaponId: string; }

export function WeaponXMLButton({ weaponId }: WeaponXMLButtonProps) {
  const { t } = useTranslation('common');
  const { weapons, updateWeapon } = useWeaponSkillStore();
  const [isXMLMode, setIsXMLMode] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  const handleOpenXMLMode = () => {
    const weapon = weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    try {
      const allWeapons = exportWeapons([weapon]);
      const match = allWeapons.match(/<Weapon>[\s\S]*<\/Weapon>/);
      setXmlContent(match ? match[0] : '');
      setIsXMLMode(true);
    } catch (error) { console.error('Failed to generate weapon XML:', error); }
  };

  const handleCloseXMLMode = () => { setIsXMLMode(false); setXmlContent(''); };

  const handleApplyXml = (xml: string) => {
    try {
      const wrapped = '<?xml version="1.0" encoding="utf-16"?>\n<Weapons>' + xml + '</Weapons>';
      const parsed = parseWeapons(wrapped);
      if (parsed.length > 0) updateWeapon(parsed[0]);
      handleCloseXMLMode();
    } catch (error) { console.error('Failed to parse weapon XML:', error); throw error; }
  };

  const weapon = weapons.find(w => w.id === weaponId);
  if (!weapon) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpenXMLMode}>📄 XML</Button>
      <XMLEditorModal isOpen={isXMLMode} onClose={handleCloseXMLMode} value={xmlContent} onApply={handleApplyXml} language="xml" title={t('weapon.xml.weaponTitle', { id: weapon.id })} />
    </>
  );
}

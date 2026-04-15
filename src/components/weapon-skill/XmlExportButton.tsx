import { useTranslation } from 'react-i18next';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { exportWeaponsToBuffer } from '../../lib/xml/weapon-xml-parser';
import { exportSkillsToBuffer } from '../../lib/xml/skill-xml-parser';

export function XmlExportButton() {
  const { t } = useTranslation('common');
  const weapons = useWeaponSkillStore((state: any) => state.weapons);
  const skills = useWeaponSkillStore((state: any) => state.skills);
  const currentView = useWeaponSkillStore((state: any) => state.currentView);

  const handleExport = () => {
    const buffer = currentView === 'weapons' ? exportWeaponsToBuffer(weapons) : exportSkillsToBuffer(skills);
    const blob = new Blob([buffer as BlobPart], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentView === 'weapons' ? 'weapons.xml' : 'skills.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
      {t('weapon.xml.export', { item: currentView === 'weapons' ? 'Weapons' : 'Skills' })}
    </button>
  );
}

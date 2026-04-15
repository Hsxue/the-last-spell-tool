import { useTranslation } from 'react-i18next';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { parseWeaponsFromBuffer } from '../../lib/xml/weapon-xml-parser';
import { parseSkillsFromBuffer } from '../../lib/xml/skill-xml-parser';

export function XmlImportButton() {
  const { t } = useTranslation('common');
  const currentView = useWeaponSkillStore((state: any) => state.currentView);
  const addWeapon = useWeaponSkillStore((state: any) => state.addWeapon);
  const addSkill = useWeaponSkillStore((state: any) => state.addSkill);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (currentView === 'weapons') {
        parseWeaponsFromBuffer(buffer).forEach((w: any) => addWeapon(w));
      } else {
        parseSkillsFromBuffer(buffer).forEach((s: any) => addSkill(s));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <label className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer">
      {t('weapon.xml.import', { item: currentView === 'weapons' ? 'Weapons' : 'Skills' })}
      <input type="file" accept=".xml" onChange={handleImport} className="hidden" />
    </label>
  );
}

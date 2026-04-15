import { useTranslation } from 'react-i18next';
import { XmlImportButton } from './XmlImportButton';
import { XmlExportButton } from './XmlExportButton';
import { LanguageSelector } from './LanguageSelector';
import { useState } from 'react';
import { NewWeaponDialog } from './NewWeaponDialog';
import { NewSkillDialog } from './NewSkillDialog';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';

export function Toolbar() {
  const { t } = useTranslation('common');
  const currentView = useWeaponSkillStore((state) => state.currentView);
  const [showNewWeapon, setShowNewWeapon] = useState(false);
  const [showNewSkill, setShowNewSkill] = useState(false);

  const handleNew = () => {
    if (currentView === 'weapons') { setShowNewWeapon(true); }
    else { setShowNewSkill(true); }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50">
      <button onClick={handleNew} className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
        {currentView === 'weapons' ? t('weapon.toolbar.newWeapon') : t('weapon.toolbar.newSkill')}
      </button>
      <LanguageSelector />
      <div className="flex-1" />
      <XmlImportButton />
      <XmlExportButton />
      <NewWeaponDialog open={showNewWeapon} onClose={() => setShowNewWeapon(false)} />
      <NewSkillDialog open={showNewSkill} onClose={() => setShowNewSkill(false)} />
    </div>
  );
}

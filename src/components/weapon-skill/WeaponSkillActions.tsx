import { useTranslation } from 'react-i18next';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { useState } from 'react';

export function WeaponSkillActions() {
  const { t } = useTranslation('common');
  const currentView = useWeaponSkillStore((state: any) => state.currentView);
  const selectedWeaponId = useWeaponSkillStore((state: any) => state.selectedWeaponId);
  const selectedSkillId = useWeaponSkillStore((state: any) => state.selectedSkillId);
  const duplicateWeapon = useWeaponSkillStore((state: any) => state.duplicateWeapon);
  const removeWeapon = useWeaponSkillStore((state: any) => state.removeWeapon);
  const duplicateSkill = useWeaponSkillStore((state: any) => state.duplicateSkill);
  const removeSkill = useWeaponSkillStore((state: any) => state.removeSkill);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedId = currentView === 'weapons' ? selectedWeaponId : selectedSkillId;
  const hasSelection = !!selectedId;

  const handleDuplicate = () => {
    if (currentView === 'weapons' && selectedWeaponId) duplicateWeapon(selectedWeaponId);
    else if (selectedSkillId) duplicateSkill(selectedSkillId);
  };

  const handleDelete = () => {
    if (currentView === 'weapons' && selectedWeaponId) removeWeapon(selectedWeaponId);
    else if (selectedSkillId) removeSkill(selectedSkillId);
    setShowDeleteConfirm(false);
  };

  if (!hasSelection) {
    return (
      <div className="flex gap-2 px-4 py-2 border-t bg-gray-50">
        <p className="text-xs text-gray-400">{t('weapon.common.selectItemActions')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 px-4 py-2 border-t bg-gray-50">
        <button onClick={handleDuplicate} className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
          {t('weapon.common.duplicate')}
        </button>
        <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
          {t('weapon.common.delete')}
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-base font-semibold mb-4">{t('weapon.common.confirmDeleteTitle')}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {t('weapon.common.confirmDeleteMsg', { item: currentView === 'weapons' ? t('weapon.toolbar.newWeapon').replace('+ New ', '') : t('weapon.toolbar.newSkill').replace('+ New ', '') })}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">
                {t('weapon.common.cancel')}
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                {t('weapon.common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

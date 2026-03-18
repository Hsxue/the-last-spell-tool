import { useWeaponSkillStore } from '../../store/weaponSkillStore';
import { useState } from 'react';

export function WeaponSkillActions() {
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
    if (currentView === 'weapons' && selectedWeaponId) {
      duplicateWeapon(selectedWeaponId);
    } else if (selectedSkillId) {
      duplicateSkill(selectedSkillId);
    }
  };

  const handleDelete = () => {
    if (currentView === 'weapons' && selectedWeaponId) {
      removeWeapon(selectedWeaponId);
    } else if (selectedSkillId) {
      removeSkill(selectedSkillId);
    }
    setShowDeleteConfirm(false);
  };

  if (!hasSelection) {
    return (
      <div className="flex gap-2 px-4 py-2 border-t bg-gray-50">
        <p className="text-xs text-gray-400">选择项目以启用操作</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 px-4 py-2 border-t bg-gray-50">
        <button
          onClick={handleDuplicate}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          复制
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        >
          删除
        </button>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-base font-semibold mb-4">确认删除</h3>
            <p className="text-sm text-gray-600 mb-6">
              确定要删除这个{currentView === 'weapons' ? '武器' : '技能'}吗？此操作不可恢复。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
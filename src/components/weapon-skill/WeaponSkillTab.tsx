import { WeaponTreeView } from './WeaponTreeView';
import { SkillTreeView } from './SkillTreeView';
import { WeaponEditorFull } from './WeaponEditorFull';
import { SkillEditorFull } from './SkillEditorFull';
import { WeaponSkillActions } from './WeaponSkillActions';
import { Toolbar } from './Toolbar';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';

export function WeaponSkillTab() {
  const currentView = useWeaponSkillStore((state) => state.currentView);
  const setCurrentView = useWeaponSkillStore((state) => state.setCurrentView);

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 - 包含新建按钮 */}
      <Toolbar />
      
      {/* Tab Header */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            currentView === 'weapons' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setCurrentView('weapons')}
        >
          武器
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            currentView === 'skills' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setCurrentView('skills')}
        >
          技能
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'weapons' ? (
          <div className="h-full">
            <div className="grid grid-cols-2 h-full">
              <div className="border-r">
                <WeaponTreeView />
              </div>
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                  <WeaponEditorFull />
                </div>
                <WeaponSkillActions />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <div className="grid grid-cols-2 h-full">
              <div className="border-r">
                <SkillTreeView />
              </div>
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                  <SkillEditorFull />
                </div>
                <WeaponSkillActions />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
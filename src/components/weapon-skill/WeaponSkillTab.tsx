import { useState } from 'react';
import { WeaponTreeView } from './WeaponTreeView';
import { SkillTreeView } from './SkillTreeView';

type TabType = 'weapons' | 'skills';

export function WeaponSkillTab() {
  const [activeTab, setActiveTab] = useState<TabType>('weapons');

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'weapons' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('weapons')}
        >
          Weapons
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'skills' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'weapons' ? (
          <div className="h-full">
            <div className="grid grid-cols-2 h-full">
              <div className="border-r">
                <WeaponTreeView />
              </div>
              <div>
                <p className="p-4 text-sm text-gray-500">Weapon Editor (coming soon)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <div className="grid grid-cols-2 h-full">
              <div className="border-r">
                <SkillTreeView />
              </div>
              <div>
                <p className="p-4 text-sm text-gray-500">Skill Editor (coming soon)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { useConfigStore } from '@/store/configStore';
import type { ConfigTab } from '@/types/config';
import { ConfigToolbar } from './ConfigToolbar';
import BasicConfigTab from './BasicConfigTab';
import SpawnConfigTab from './SpawnConfigTab';
import ResourcesConfigTab from './ResourcesConfigTab';
import CorruptionConfigTab from './CorruptionConfigTab';
import FogConfigTab from './FogConfigTab';
import WavesConfigTab from './WavesConfigTab';
import ElitesConfigTab from './ElitesConfigTab';
import DirectionsConfigTab from './DirectionsConfigTab';
import WaveDefinitionsTab from './WaveDefinitionsTab';

export const ConfigTabs: React.FC = () => {
  const { ui, setActiveTab } = useConfigStore();

  // Tab configurations with Chinese labels using the exact ConfigTab values
  const tabConfigurations: Array<{ value: ConfigTab; label: string }> = [
    { value: 'basic', label: '基础配置' },
    { value: 'spawn', label: '生成配置' },
    { value: 'waves', label: '敌人波次' },
    { value: 'elites', label: '精英配置' },
    { value: 'corruption', label: '腐化配置' },
    { value: 'fog', label: '迷雾配置' },
    { value: 'resources', label: '资源' },
    { value: 'wave-definitions', label: '波次定义' },
    { value: 'directions', label: '生成方向' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar at the top */}
      <div className="flex-shrink-0 p-2 bg-background border-b">
        <ConfigToolbar className="" />
      </div>
      
      {/* Tab navigation */}
      <div className="flex-shrink-0 p-2 border-b bg-muted/30">
        <div className="grid w-full grid-cols-9 gap-1">
          {tabConfigurations.map(({ value, label }) => (
            <button
              key={value}
              data-testid={`tab-${label}`}
              className={`whitespace-nowrap overflow-hidden text-ellipsis px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                ui.activeTab === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              onClick={() => setActiveTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {tabConfigurations.map(({ value }) => (
          <div key={value} className={ui.activeTab === value ? 'block' : 'hidden'}>
            {value === 'basic' && <BasicConfigTab />}
            {value === 'spawn' && <SpawnConfigTab />}
            {value === 'resources' && <ResourcesConfigTab />}
            {value === 'corruption' && <CorruptionConfigTab />}
            {value === 'fog' && <FogConfigTab />}
            {value === 'waves' && <WavesConfigTab />}
            {value === 'elites' && <ElitesConfigTab />}
            {value === 'wave-definitions' && <WaveDefinitionsTab />}
            {value === 'directions' && <DirectionsConfigTab />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigTabs;
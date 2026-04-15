import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');
  const { ui, setActiveTab } = useConfigStore();

  const tabConfigurations: Array<{ value: ConfigTab; label: string }> = [
    { value: 'basic', label: t('configTab.tabs.basic') },
    { value: 'spawn', label: t('configTab.tabs.spawn') },
    { value: 'waves', label: t('configTab.tabs.waves') },
    { value: 'elites', label: t('configTab.tabs.elites') },
    { value: 'corruption', label: t('configTab.tabs.corruption') },
    { value: 'fog', label: t('configTab.tabs.fog') },
    { value: 'resources', label: t('configTab.tabs.resources') },
    { value: 'wave-definitions', label: t('configTab.tabs.waveDefinitions') },
    { value: 'directions', label: t('configTab.tabs.directions') },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 p-2 bg-background border-b">
        <ConfigToolbar className="" />
      </div>
      <div className="flex-shrink-0 p-2 border-b bg-muted/30">
        <div className="grid w-full grid-cols-9 gap-1">
          {tabConfigurations.map(({ value, label }) => (
            <button
              key={value}
              data-testid={`tab-${value}`}
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

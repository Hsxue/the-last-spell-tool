import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { useConfigStore } from '../../store/configStore';
import { serializeConfigToXml } from '../../lib/configSerializer';
import { useUIStore } from '../../store/uiStore';

interface ExportButtonProps { className?: string; }

export const ExportButton: React.FC<ExportButtonProps> = ({ className }) => {
  const { t } = useTranslation('common');
  const gameConfig = useConfigStore((state) => state.gameConfig);
  const addToast = useUIStore((state) => state.addToast);

  const handleExport = async () => {
    try {
      const xmlContent = serializeConfigToXml(gameConfig);
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${gameConfig.mapId}-config.xml`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast({ title: t('configTab.export.successTitle'), description: t('configTab.export.successDesc', { filename: `${gameConfig.mapId}-config.xml` }), type: 'success' });
    } catch (error) {
      console.error('Failed to export configuration:', error);
      addToast({ title: t('configTab.export.failedTitle'), description: error instanceof Error ? error.message : t('configTab.export.unknownError'), type: 'error' });
    }
  };

  return (
    <Button onClick={handleExport} data-testid="export-button" className={className}>
      {t('configTab.export.button')}
    </Button>
  );
};

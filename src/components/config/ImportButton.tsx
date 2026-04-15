import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { useConfigStore } from '../../store/configStore';
import { deserializeXmlToConfig } from '../../lib/configSerializer';
import { useUIStore } from '../../store/uiStore';

interface ImportButtonProps { className?: string; }

export const ImportButton: React.FC<ImportButtonProps> = ({ className }) => {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setGameConfig = useConfigStore((state) => state.setGameConfig);
  const addToast = useUIStore((state) => state.addToast);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlString = e.target?.result as string;
        const parsedConfig = deserializeXmlToConfig(xmlString);
        if (!parsedConfig.mapId) throw new Error('Missing required field: mapId');
        if (!parsedConfig.victoryDays) throw new Error('Missing required field: victoryDays');
        if (!parsedConfig.difficulty) throw new Error('Missing required field: difficulty');
        if (!parsedConfig.fogId) throw new Error('Missing required field: fogId');
        setGameConfig(parsedConfig);
        addToast({ title: t('configTab.import.successTitle'), description: t('configTab.import.successDesc', { mapId: parsedConfig.mapId }), type: 'success' });
      } catch (error) {
        console.error('Failed to import configuration:', error);
        let errorMessage = t('configTab.import.unknownError');
        if (error instanceof Error) {
          if (error.message.includes('Invalid XML')) errorMessage = t('configTab.import.invalidXml');
          else if (error.message.includes('Missing required field')) { const fieldName = error.message.split("'")[1]; errorMessage = t('configTab.import.missingField', { field: fieldName }); }
          else if (error.message.includes('Invalid value')) errorMessage = error.message;
          else errorMessage = error.message;
        }
        addToast({ title: t('configTab.import.failedTitle'), description: errorMessage, type: 'error' });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      addToast({ title: t('configTab.import.failedTitle'), description: t('configTab.import.readFileFailed'), type: 'error' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleClick = () => { fileInputRef.current?.click(); };

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".xml" onChange={handleFileSelect} style={{ display: 'none' }} data-testid="import-file-input" />
      <Button onClick={handleClick} data-testid="import-button" className={className}>
        {t('configTab.import.button')}
      </Button>
    </>
  );
};

/**
 * Import Button Component - Imports game configuration from XML file
 * TileMapEditor Web
 */

import React, { useRef } from 'react';
import { Button } from '../ui/button';
import { useConfigStore } from '../../store/configStore';
import { deserializeXmlToConfig } from '../../lib/configSerializer';
import { useUIStore } from '../../store/uiStore';

interface ImportButtonProps {
  className?: string;
}

export const ImportButton: React.FC<ImportButtonProps> = ({ className }) => {
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
        
        // Deserialize XML to config
        const parsedConfig = deserializeXmlToConfig(xmlString);
        
        // Validate required fields (deserializeXmlToConfig already does basic validation)
        // Additional validation can be added here if needed
        if (!parsedConfig.mapId) {
          throw new Error('Missing required field: mapId');
        }
        if (!parsedConfig.victoryDays) {
          throw new Error('Missing required field: victoryDays');
        }
        if (!parsedConfig.difficulty) {
          throw new Error('Missing required field: difficulty');
        }
        if (!parsedConfig.fogId) {
          throw new Error('Missing required field: fogId');
        }
        
        // Apply to config store
        setGameConfig(parsedConfig);
        
        // Show success toast with map name
        addToast({
          title: '配置导入成功',
          description: `已导入地图：${parsedConfig.mapId}`,
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to import configuration:', error);
        
        // Handle different error types
        let errorMessage = '未知错误';
        if (error instanceof Error) {
          if (error.message.includes('Invalid XML')) {
            errorMessage = 'Invalid XML format';
          } else if (error.message.includes('Missing required field')) {
            const fieldName = error.message.split("'")[1];
            errorMessage = `Missing required field: ${fieldName}`;
          } else if (error.message.includes('Invalid value')) {
            errorMessage = error.message;
          } else {
            errorMessage = error.message;
          }
        }
        
        // Show error toast
        addToast({
          title: '配置导入失败',
          description: errorMessage,
          type: 'error',
        });
      }
      
      // Reset file input to allow re-importing the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      addToast({
        title: '配置导入失败',
        description: 'Failed to read file',
        type: 'error',
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        data-testid="import-file-input"
      />
      <Button
        onClick={handleClick}
        data-testid="import-button"
        className={className}
      >
        导入配置
      </Button>
    </>
  );
};

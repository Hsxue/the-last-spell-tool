/**
 * Export Button Component - Exports game configuration to XML file
 * TileMapEditor Web
 */

import React from 'react';
import { Button } from '../ui/button';
import { useConfigStore } from '../../store/configStore';
import { serializeConfigToXml } from '../../lib/configSerializer';
import { useUIStore } from '../../store/uiStore';

interface ExportButtonProps {
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ className }) => {
  const gameConfig = useConfigStore((state) => state.gameConfig);
  const addToast = useUIStore((state) => state.addToast);

  const handleExport = async () => {
    try {
      // Serialize the configuration to XML
      const xmlContent = serializeConfigToXml(gameConfig);
      
      // Create a Blob with the XML content
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      
      // Create download link with filename containing mapId
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${gameConfig.mapId}-config.xml`;
      link.style.display = 'none';
      
      // Add link to document, click it, then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the URL object
      URL.revokeObjectURL(url);
      
      // Show success toast
      addToast({
        title: '配置导出成功',
        description: `已导出 ${gameConfig.mapId}-config.xml`,
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to export configuration:', error);
      
      // Show error toast
      addToast({
        title: '配置导出失败',
        description: error instanceof Error ? error.message : '未知错误',
        type: 'error',
      });
    }
  };

  return (
    <Button 
      onClick={handleExport}
      data-testid="export-button"
      className={className}
    >
      导出配置
    </Button>
  );
};
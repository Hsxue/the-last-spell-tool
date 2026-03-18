/**
 * Config Toolbar Component - Container for export/import buttons
 * TileMapEditor Web
 */

import React from 'react';
import { ExportButton } from './ExportButton';
import { ImportButton } from './ImportButton';

interface ConfigToolbarProps {
  className?: string;
}

export const ConfigToolbar: React.FC<ConfigToolbarProps> = ({ className = '' }) => {
  return (
    <div 
      className={`flex gap-4 items-center ${className}`}
      data-testid="config-toolbar"
    >
      <ExportButton />
      <ImportButton />
    </div>
  );
};
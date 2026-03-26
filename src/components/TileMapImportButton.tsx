import { useRef, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/store/mapStore';
import { useUIStore } from '@/store/uiStore';
import { parseTileMap, parseBuildings } from '@/lib/mapXmlImporter';
import type { MapData, Building } from '@/types/map';

interface TileMapImportButtonProps {
  className?: string;
}

export function TileMapImportButton({ className }: TileMapImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setMapData = useMapStore((state) => state.setMapData);
  const addToast = useUIStore((state) => state.addToast);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      let tileMapData: MapData | null = null;
      let buildingsData: Building[] = [];

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();

        if (file.name.endsWith('TileMap.xml') || file.name.includes('TileMap')) {
          tileMapData = parseTileMap(arrayBuffer);
          
          // Auto-load corresponding Buildings file if it exists
          // e.g., "Glenwald_TileMap.xml" -> "Glenwald_Buildings.xml"
          const baseName = file.name.replace('_TileMap.xml', '');
          const buildingsFileName = `${baseName}_Buildings.xml`;
          
          // Look for buildings file in the same selection
          for (const otherFile of files) {
            if (otherFile.name === buildingsFileName) {
              const buildingsBuffer = await otherFile.arrayBuffer();
              buildingsData = parseBuildings(buildingsBuffer);
              break;
            }
          }
        } else if (file.name.endsWith('Buildings.xml') || file.name.includes('Building')) {
          // Only parse if not already parsed from auto-load
          if (buildingsData.length === 0) {
            buildingsData = parseBuildings(arrayBuffer);
          }
        }
      }

      if (!tileMapData) {
        throw new Error('No valid TileMap file found. Please select a TileMap.xml file.');
      }

      // Merge buildings data into tile map data if available
      if (buildingsData.length > 0) {
        tileMapData = {
          ...tileMapData,
          buildings: buildingsData,
        };
      }

      setMapData(tileMapData);
      addToast({
        title: 'Map Loaded',
        description: `Successfully loaded map (${tileMapData.width}x${tileMapData.height}) with ${tileMapData.buildings.length} buildings`,
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addToast({
        title: 'Failed to Load Map',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className={className}
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        {isLoading ? 'Loading...' : 'Load Map'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select TileMap and Buildings XML files"
      />
    </>
  );
}

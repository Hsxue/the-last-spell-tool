import { useRef, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/store/mapStore';
import { useUIStore } from '@/store/uiStore';
import { parseTileMap, parseBuildings } from '@/lib/mapXmlImporter';
import type { MapData } from '@/types/map';

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
      let buildingsData: unknown[] = [];

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();

        if (file.name.endsWith('TileMap.xml') || file.name.includes('TileMap')) {
          tileMapData = parseTileMap(arrayBuffer);
        } else if (file.name.endsWith('Buildings.xml') || file.name.includes('Building')) {
          buildingsData = parseBuildings(arrayBuffer);
        }
      }

      if (tileMapData) {
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
          description: `Successfully loaded map (${tileMapData.width}x${tileMapData.height})`,
          type: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('No valid TileMap file found. Please select a TileMap.xml file.');
      }
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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { useMapStore } from '@/store/mapStore';
import { useUIStore } from '@/store/uiStore';
import { parseTileMap, parseBuildings } from '@/lib/mapXmlImporter';
import {
  fetchBuiltinMapsList,
  loadMapXml,
  type BuiltinMapEntry,
} from '@/data/builtinMaps';

const DIFFICULTY_LABELS: Record<number, string> = {
  0: 'builtinMap.difficulty.0',
  1: 'builtinMap.difficulty.1',
  2: 'builtinMap.difficulty.2',
  3: 'builtinMap.difficulty.3',
  4: 'builtinMap.difficulty.4',
  5: 'builtinMap.difficulty.5',
};

interface BuiltinMapSelectorProps {
  className?: string;
}

export function BuiltinMapButton({ className }: BuiltinMapSelectorProps) {
  const { t } = useTranslation('common');
  const [maps, setMaps] = useState<BuiltinMapEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setMapData = useMapStore((state) => state.setMapData);
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    fetchBuiltinMapsList()
      .then((data) => setMaps(data))
      .catch((err) => console.error('Failed to fetch built-in maps:', err));
  }, []);

  const handleSelect = async (mapId: string) => {
    const mapEntry = maps.find((m) => m.id === mapId);
    if (!mapEntry) return;

    setIsLoading(true);
    try {
      const [tileMapResult, buildingsResult] = await Promise.allSettled([
        loadMapXml(mapEntry.tileMap),
        loadMapXml(mapEntry.buildings),
      ]);

      if (tileMapResult.status !== 'fulfilled') {
        throw new Error(t('builtinMap.tilemapFailed'));
      }

      const tileMapData = parseTileMap(tileMapResult.value);

      let buildingsData: Record<string, unknown>[] = [];
      if (buildingsResult.status === 'fulfilled') {
        try {
          buildingsData = parseBuildings(buildingsResult.value) as unknown as Record<string, unknown>[];
        } catch { /* empty */ }
      }

      const mergedData = {
        ...tileMapData,
        buildings: buildingsData.length > 0 ? buildingsData : tileMapData.buildings,
      } as any;

      setMapData(mergedData);
      addToast({
        title: t('builtinMap.loadSuccess'),
        description: t('builtinMap.loadSuccessDesc', {
          name: mapEntry.name,
          width: mergedData.width,
          height: mergedData.height,
          count: mergedData.buildings.length,
        }),
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('builtinMap.unknownError');
      addToast({
        title: t('builtinMap.loadFailed'),
        description: t('builtinMap.loadFailedDesc', { name: mapEntry.name, msg }),
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select onValueChange={handleSelect} disabled={isLoading || maps.length === 0}>
      <SelectTrigger className={'h-8 text-xs ' + (className ?? '')}>
        {isLoading ? (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('builtinMap.loading')}
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <MapIcon className="h-3.5 w-3.5" />
            {t('builtinMap.label')}
          </span>
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('builtinMap.groupLabel')}</SelectLabel>
          {maps.map((map) => (
            <SelectItem key={map.id} value={map.id}>
              <div className="flex items-center justify-between w-full gap-4">
                <span>{map.name}</span>
                <span className="text-muted-foreground text-xs">
                   {t(DIFFICULTY_LABELS[map.difficulty], `Lv.${map.difficulty}`)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

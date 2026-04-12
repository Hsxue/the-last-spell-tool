import { useState, useEffect } from 'react';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  0: '自由模式',
  1: '★',
  2: '★★',
  3: '★★★',
  4: '★★★★',
  5: '★★★★★',
};

interface BuiltinMapSelectorProps {
  className?: string;
}

export function BuiltinMapButton({ className }: BuiltinMapSelectorProps) {
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
        throw new Error('TileMap load failed');
      }

      const tileMapData = parseTileMap(tileMapResult.value);

      let buildingsData: any[] = [];
      if (buildingsResult.status === 'fulfilled') {
        try {
          buildingsData = parseBuildings(buildingsResult.value);
        } catch { /* empty */ }
      }

      const mergedData = {
        ...tileMapData,
        buildings: buildingsData.length > 0 ? buildingsData : tileMapData.buildings,
      };

      setMapData(mergedData);
      addToast({
        title: '地图加载成功',
        description: '已加载 "' + mapEntry.name + '" (' + mergedData.width + 'x' + mergedData.height + ', ' + mergedData.buildings.length + ' 建筑)',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : '未知错误';
      addToast({
        title: '加载失败',
        description: '无法加载 ' + mapEntry.name + ': ' + msg,
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
            加载中...
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <MapIcon className="h-3.5 w-3.5" />
            内置地图
          </span>
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>游戏内置地图</SelectLabel>
          {maps.map((map) => (
            <SelectItem key={map.id} value={map.id}>
              <div className="flex items-center justify-between w-full gap-4">
                <span>{map.name}</span>
                <span className="text-muted-foreground text-xs">
                  {DIFFICULTY_LABELS[map.difficulty] ?? '难度 ' + map.difficulty}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
import React, { useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import type { FogDensityName } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Fog density display names in Chinese
const FOG_DENSITY_LABELS: Record<FogDensityName, string> = {
  VeryThin: '非常稀薄',
  Thin: '稀薄',
  Average: '普通',
  Dense: '浓密',
  VeryDense: '非常浓密',
};

// Fog density indices (0-4)
const FOG_DENSITY_INDICES: Array<{ index: number; name: FogDensityName }> = [
  { index: 0, name: 'VeryThin' },
  { index: 1, name: 'Thin' },
  { index: 2, name: 'Average' },
  { index: 3, name: 'Dense' },
  { index: 4, name: 'VeryDense' },
];

export const FogConfigTab: React.FC = () => {
  const {
    gameConfig,
    setFogDensity,
    setIncreaseEveryXDays,
    setInitialDensityIndex,
    setDayException,
    removeDayException,
  } = useConfigStore();

  const fogConfig = gameConfig.fogConfig;

  // State for adding new day exception
  const [newExceptionDay, setNewExceptionDay] = useState<string>('');
  const [newExceptionDensity, setNewExceptionDensity] = useState<FogDensityName>('Average');

  const handleIncreaseEveryXDaysChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setIncreaseEveryXDays(numValue);
    }
  };

  const handleInitialDensityIndexChange = (value: string) => {
    setInitialDensityIndex(parseInt(value, 10));
  };

  const handleFogDensityChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const densityName = fogConfig.fogDensities[index]?.[0];
      if (densityName) {
        setFogDensity(index, densityName, numValue);
      }
    }
  };

  const handleAddException = () => {
    const day = parseInt(newExceptionDay, 10);
    if (!isNaN(day) && day >= 1) {
      setDayException(day, newExceptionDensity);
      setNewExceptionDay('');
      setNewExceptionDensity('Average');
    }
  };

  const handleRemoveException = (day: number) => {
    removeDayException(day);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>迷雾配置 (Fog Configuration)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Increase Every X Days */}
        <div className="space-y-2">
          <Label htmlFor="increaseEveryXDays-input">
            每几天增加迷雾 (Increase Every X Days)
          </Label>
          <Input
            id="increaseEveryXDays-input"
            type="number"
            min={1}
            value={fogConfig.increaseEveryXDays}
            onChange={(e) => handleIncreaseEveryXDaysChange(e.target.value)}
            data-testid="increaseEveryXDays-input"
            placeholder="输入天数..."
          />
          <p className="text-xs text-muted-foreground">
            每隔 X 天迷雾密度会增加一级
          </p>
        </div>

        {/* Initial Density Index */}
        <div className="space-y-2">
          <Label htmlFor="initialDensityIndex-select">
            初始密度索引 (Initial Density Index)
          </Label>
          <Select
            value={fogConfig.initialDensityIndex.toString()}
            onValueChange={handleInitialDensityIndexChange}
          >
            <SelectTrigger
              id="initialDensityIndex-select"
              data-testid="initialDensityIndex-select"
              className="w-full"
            >
              <SelectValue placeholder="选择初始迷雾密度..." />
            </SelectTrigger>
            <SelectContent>
              {FOG_DENSITY_INDICES.map(({ index, name }) => (
                <SelectItem key={index} value={index.toString()}>
                  索引 {index} - {FOG_DENSITY_LABELS[name]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            游戏开始时的迷雾密度等级 (0-4)
          </p>
        </div>

        {/* Fog Density List */}
        <div className="space-y-3">
          <Label>迷雾密度列表 (Fog Density Values)</Label>
          <div className="space-y-2">
            {fogConfig.fogDensities.map(([name, value], index) => (
              <div
                key={name}
                className="flex items-center gap-3"
                data-testid={`fog-density-row-${index}`}
              >
                <div className="w-32 text-sm text-muted-foreground">
                  索引 {index} - {FOG_DENSITY_LABELS[name]}
                </div>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => handleFogDensityChange(index, e.target.value)}
                  data-testid={`fog-density-value-${index}`}
                  className="w-32"
                  placeholder="密度值..."
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            各密度等级的具体数值（数值越小迷雾越浓）
          </p>
        </div>

        {/* Day Exceptions */}
        <div className="space-y-3">
          <Label>日期例外 (Day Exceptions)</Label>
          
          {/* Add Exception Form */}
          <div className="flex items-end gap-3">
            <div className="space-y-2 flex-1">
              <Label htmlFor="exceptionDay-input">天数</Label>
              <Input
                id="exceptionDay-input"
                type="number"
                min={1}
                value={newExceptionDay}
                onChange={(e) => setNewExceptionDay(e.target.value)}
                data-testid="exceptionDay-input"
                placeholder="输入天数..."
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="exceptionDensity-select">密度</Label>
              <Select
                value={newExceptionDensity}
                onValueChange={(value) => setNewExceptionDensity(value as FogDensityName)}
              >
                <SelectTrigger
                  id="exceptionDensity-select"
                  data-testid="exceptionDensity-select"
                  className="w-full"
                >
                  <SelectValue placeholder="选择密度..." />
                </SelectTrigger>
                <SelectContent>
                  {FOG_DENSITY_INDICES.map(({ index, name }) => (
                    <SelectItem key={name} value={name}>
                      {FOG_DENSITY_LABELS[name]} (索引 {index})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddException}
              data-testid="addException-button"
              className="mb-0.5"
            >
              添加例外
            </Button>
          </div>

          {/* Exception List */}
          <div className="space-y-2">
            {fogConfig.dayExceptions.size === 0 ? (
              <p className="text-sm text-muted-foreground">
                暂无日期例外配置
              </p>
            ) : (
              Array.from(fogConfig.dayExceptions.entries()).map(([day, densityName]) => (
                <div
                  key={day}
                  className="flex items-center justify-between p-2 border rounded-md"
                  data-testid={`day-exception-row-${day}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">第 {day} 天</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{FOG_DENSITY_LABELS[densityName]} (索引 {FOG_DENSITY_INDICES.findIndex(d => d.name === densityName)})</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveException(day)}
                    data-testid={`removeException-button-${day}`}
                  >
                    删除
                  </Button>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            为特定日期设置自定义迷雾密度（覆盖默认的密度递增规则）
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FogConfigTab;

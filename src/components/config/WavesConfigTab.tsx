import React, { useState } from 'react';
import { useConfigStore } from '@/store/configStore';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const WavesConfigTab: React.FC = () => {
  const { gameConfig, addSpawnWave, removeSpawnWave } = useConfigStore();

  const spawnConfig = gameConfig.spawnConfig;
  const spawnWavesPerDay = spawnConfig?.spawnWavesPerDay ?? new Map();

  // State for night selector
  const [selectedNight, setSelectedNight] = useState<string>('1');

  // State for adding new wave
  const [newWaveId, setNewWaveId] = useState<string>('');
  const [newWeight, setNewWeight] = useState<string>('');

  // Generate night options (1-20)
  const nightOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  // Get waves for selected night
  const selectedNightNum = parseInt(selectedNight);
  const currentWaves = spawnWavesPerDay.get(selectedNightNum) || [];

  const handleAddSpawnWave = () => {
    const waveId = newWaveId.trim();
    const weight = parseFloat(newWeight);
    if (waveId && !isNaN(weight)) {
      addSpawnWave(selectedNightNum, waveId, weight);
      setNewWaveId('');
      setNewWeight('');
    }
  };

  const handleRemoveSpawnWave = (waveId: string) => {
    removeSpawnWave(selectedNightNum, waveId);
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>敌人波次 (Enemy Waves)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Night Selector */}
        <div className="space-y-2">
          <Label htmlFor="night-selector">选择夜晚 (Select Night)</Label>
          <Select value={selectedNight} onValueChange={setSelectedNight}>
            <SelectTrigger id="night-selector" data-testid="night-selector">
              <SelectValue placeholder="选择夜晚" />
            </SelectTrigger>
            <SelectContent>
              {nightOptions.map((night) => (
                <SelectItem key={night} value={night.toString()} data-testid={`night-option-${night}`}>
                  第 {night} 夜 (Night {night})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Wave Form */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">添加波次 (Add Wave)</Label>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="wave-id-input" className="text-xs">
                波次 ID (Wave ID)
              </Label>
              <Input
                id="wave-id-input"
                type="text"
                value={newWaveId}
                onChange={(e) => setNewWaveId(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddSpawnWave)}
                data-testid="wave-id-input"
                placeholder="输入波次 ID"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="wave-weight-input" className="text-xs">
                权重 (Weight)
              </Label>
              <Input
                id="wave-weight-input"
                type="number"
                step="0.1"
                min={0}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddSpawnWave)}
                data-testid="wave-weight-input"
                placeholder="权重值"
              />
            </div>
            <Button
              onClick={handleAddSpawnWave}
              data-testid="wave-add-button"
              type="button"
            >
              添加
            </Button>
          </div>
        </div>

        {/* Waves Table */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            第 {selectedNight} 夜波次配置 (Night {selectedNight} Waves)
          </Label>
          <Table data-testid="waves-table">
            <TableHeader>
              <TableRow>
                <TableHead>波次 ID (Wave ID)</TableHead>
                <TableHead>权重 (Weight)</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentWaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    暂无波次，请添加
                  </TableCell>
                </TableRow>
              ) : (
                currentWaves.map(([waveId, weight]) => (
                  <TableRow key={waveId} data-testid={`wave-row-${waveId}`}>
                    <TableCell>{waveId}</TableCell>
                    <TableCell>{weight}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSpawnWave(waveId)}
                        data-testid={`wave-remove-${waveId}`}
                      >
                        移除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WavesConfigTab;

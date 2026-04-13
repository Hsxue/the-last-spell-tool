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

// Predefined direction options
const DIRECTION_OPTIONS = [
  { value: 'AllIn_T100-2', label: '全方向 T100-2 (All In)' },
  { value: 'Corner_TR-2', label: '角落 TR-2 (Corner)' },
  { value: 'Parallel_LR', label: '平行左右 (Parallel L-R)' },
  { value: 'Four_TopBottom', label: '四向上下 (Four Top-Bottom)' },
  { value: 'AllIn', label: '全方向 (All In)' },
  { value: 'Corner_TL', label: '角落左上 (Corner TL)' },
  { value: 'Corner_TR', label: '角落右上 (Corner TR)' },
  { value: 'Corner_BL', label: '角落左下 (Corner BL)' },
  { value: 'Corner_BR', label: '角落右下 (Corner BR)' },
  { value: 'Parallel_TB', label: '平行上下 (Parallel T-B)' },
  { value: 'Four_Corners', label: '四角 (Four Corners)' },
  { value: 'Four_LeftRight', label: '四向左右 (Four Left-Right)' },
];

export const DirectionsConfigTab: React.FC = () => {
  const { gameConfig, addSpawnDirection, removeSpawnDirection } = useConfigStore();

  const spawnConfig = gameConfig.spawnConfig;
  const spawnDirections = spawnConfig?.spawnDirections ?? new Map();

  // State for night selector
  const [selectedNight, setSelectedNight] = useState<string>('1');

  // State for adding new direction
  const [newDirectionId, setNewDirectionId] = useState<string>('');
  const [newWeight, setNewWeight] = useState<string>('');

  // Generate night options (1-20)
  const nightOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  // Get directions for selected night
  const selectedNightNum = parseInt(selectedNight);
  const currentDirections = spawnDirections.get(selectedNightNum) || [];

  const handleAddSpawnDirection = () => {
    const directionId = newDirectionId.trim();
    const weight = parseFloat(newWeight);
    if (directionId && !isNaN(weight)) {
      addSpawnDirection(selectedNightNum, directionId, weight);
      setNewDirectionId('');
      setNewWeight('');
    }
  };

  const handleRemoveSpawnDirection = (directionId: string) => {
    removeSpawnDirection(selectedNightNum, directionId);
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>生成方向 (Spawn Directions)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Night Selector */}
        <div className="space-y-2">
          <Label htmlFor="direction-night-selector">选择夜晚 (Select Night)</Label>
          <Select value={selectedNight} onValueChange={setSelectedNight}>
            <SelectTrigger id="direction-night-selector" data-testid="direction-night-selector">
              <SelectValue placeholder="选择夜晚" />
            </SelectTrigger>
            <SelectContent>
              {nightOptions.map((night) => (
                <SelectItem key={night} value={night.toString()} data-testid={`direction-night-option-${night}`}>
                  第 {night} 夜 (Night {night})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            为特定夜晚配置敌人生成方向。方向控制敌人从哪个方位进入战场（如四角、一侧等）
          </p>
        </div>

        {/* Add Direction Form */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">添加方向 (Add Direction)</Label>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="direction-id-select" className="text-xs">
                方向 ID (Direction ID)
              </Label>
              <Select value={newDirectionId} onValueChange={setNewDirectionId}>
                <SelectTrigger id="direction-id-select" data-testid="direction-id-select">
                  <SelectValue placeholder="选择方向" />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTION_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value} data-testid={`direction-option-${value}`}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="direction-weight-input" className="text-xs">
                权重 (Weight)
              </Label>
              <Input
                id="direction-weight-input"
                type="number"
                step="0.1"
                min={0}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddSpawnDirection)}
                data-testid="direction-weight-input"
                placeholder="权重值"
              />
            </div>
            <Button
              onClick={handleAddSpawnDirection}
              data-testid="direction-add-button"
              type="button"
            >
              添加
            </Button>
          </div>
        </div>

        {/* Directions Table */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            第 {selectedNight} 夜方向配置 (Night {selectedNight} Directions)
          </Label>
          <Table data-testid="directions-table">
            <TableHeader>
              <TableRow>
                <TableHead>方向 ID (Direction ID)</TableHead>
                <TableHead>权重 (Weight)</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDirections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    暂无方向，请添加
                  </TableCell>
                </TableRow>
              ) : (
                currentDirections.map(([directionId, weight]) => (
                  <TableRow key={directionId} data-testid={`direction-row-${directionId}`}>
                    <TableCell>{directionId}</TableCell>
                    <TableCell>{weight}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSpawnDirection(directionId)}
                        data-testid={`direction-remove-${directionId}`}
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

export default DirectionsConfigTab;

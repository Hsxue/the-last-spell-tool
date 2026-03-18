import React, { useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const SpawnConfigTab: React.FC = () => {
  const {
    gameConfig,
    setSpawnMultiplier,
    removeSpawnMultiplier,
    setSpawnsPerWaveFormula,
    setMaxDistancePerDay,
    removeMaxDistancePerDay,
    addDisallowedEnemy,
    removeDisallowedEnemy,
    setSpawnPointsPerGroup,
    setSpawnPointRectWidth,
    setSpawnPointRectHeight,
  } = useConfigStore();

  const spawnConfig = gameConfig.spawnConfig;

  // State for adding new entries
  const [newNight, setNewNight] = useState<string>('');
  const [newMultiplier, setNewMultiplier] = useState<string>('');
  const [newDistance, setNewDistance] = useState<string>('');
  const [newEnemyId, setNewEnemyId] = useState<string>('');

  // Convert Map to sorted array for rendering
  const spawnMultipliersArray = Array.from(spawnConfig.spawnMultipliers.entries()).sort(
    (a, b) => a[0] - b[0]
  );
  const maxDistancePerDayArray = Array.from(spawnConfig.maxDistancePerDay.entries()).sort(
    (a, b) => a[0] - b[0]
  );

  const handleAddSpawnMultiplier = () => {
    const night = parseInt(newNight);
    const multiplier = parseFloat(newMultiplier);
    if (!isNaN(night) && !isNaN(multiplier)) {
      setSpawnMultiplier(night, multiplier);
      setNewNight('');
      setNewMultiplier('');
    }
  };

  const handleAddMaxDistance = () => {
    const night = parseInt(newNight);
    const distance = parseFloat(newDistance);
    if (!isNaN(night) && !isNaN(distance)) {
      setMaxDistancePerDay(night, distance);
      setNewNight('');
      setNewDistance('');
    }
  };

  const handleAddDisallowedEnemy = () => {
    if (newEnemyId.trim()) {
      addDisallowedEnemy(newEnemyId.trim());
      setNewEnemyId('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>生成配置 (Spawn Configuration)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1. 每晚生成倍率 (Spawn Multipliers) - Table CRUD */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">每晚生成倍率 (Spawn Multipliers)</Label>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="spawn-multiplier-night" className="text-xs">
                夜晚 (Night N)
              </Label>
              <Input
                id="spawn-multiplier-night"
                type="number"
                min={1}
                value={newNight}
                onChange={(e) => setNewNight(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddSpawnMultiplier)}
                data-testid="spawn-multiplier-night-input"
                placeholder="夜晚 N"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="spawn-multiplier-value" className="text-xs">
                倍率 (Multiplier)
              </Label>
              <Input
                id="spawn-multiplier-value"
                type="number"
                step="0.1"
                min={0}
                value={newMultiplier}
                onChange={(e) => setNewMultiplier(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddSpawnMultiplier)}
                data-testid="spawn-multiplier-value-input"
                placeholder="倍率值"
              />
            </div>
            <Button
              onClick={handleAddSpawnMultiplier}
              data-testid="spawn-multiplier-add-button"
              type="button"
            >
              添加
            </Button>
          </div>

          <Table data-testid="spawn-multipliers-table">
            <TableHeader>
              <TableRow>
                <TableHead>夜晚 (Night)</TableHead>
                <TableHead>倍率 (Multiplier)</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spawnMultipliersArray.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    暂无数据，请添加
                  </TableCell>
                </TableRow>
              ) : (
                spawnMultipliersArray.map(([night, multiplier]) => (
                  <TableRow key={night} data-testid={`spawn-multiplier-row-${night}`}>
                    <TableCell>{night}</TableCell>
                    <TableCell>{multiplier}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpawnMultiplier(night)}
                        data-testid={`spawn-multiplier-delete-${night}`}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 2. 每波公式 (Spawns Per Wave Formula) - Textarea */}
        <div className="space-y-2">
          <Label htmlFor="spawns-formula-textarea">
            每波公式 (Spawns Per Wave Formula)
          </Label>
          <Textarea
            id="spawns-formula-textarea"
            value={spawnConfig.spawnsPerWaveFormula}
            onChange={(e) => setSpawnsPerWaveFormula(e.target.value)}
            data-testid="spawns-formula-textarea"
            placeholder="输入每波生成公式，例如：60 + Night * Multiplier"
            rows={3}
          />
        </div>

        {/* 3. 最大生成距离 (Max Distance Per Day) - Table CRUD */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">最大生成距离 (Max Distance Per Day)</Label>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="max-distance-night" className="text-xs">
                夜晚 (Night N)
              </Label>
              <Input
                id="max-distance-night"
                type="number"
                min={1}
                value={newNight}
                onChange={(e) => setNewNight(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddMaxDistance)}
                data-testid="max-distance-night-input"
                placeholder="夜晚 N"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="max-distance-value" className="text-xs">
                距离 (Distance)
              </Label>
              <Input
                id="max-distance-value"
                type="number"
                step="0.1"
                min={0}
                value={newDistance}
                onChange={(e) => setNewDistance(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddMaxDistance)}
                data-testid="max-distance-value-input"
                placeholder="距离值"
              />
            </div>
            <Button
              onClick={handleAddMaxDistance}
              data-testid="max-distance-add-button"
              type="button"
            >
              添加
            </Button>
          </div>

          <Table data-testid="max-distance-table">
            <TableHeader>
              <TableRow>
                <TableHead>夜晚 (Night)</TableHead>
                <TableHead>距离 (Distance)</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maxDistancePerDayArray.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    暂无数据，请添加
                  </TableCell>
                </TableRow>
              ) : (
                maxDistancePerDayArray.map(([night, distance]) => (
                  <TableRow key={night} data-testid={`max-distance-row-${night}`}>
                    <TableCell>{night}</TableCell>
                    <TableCell>{distance}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaxDistancePerDay(night)}
                        data-testid={`max-distance-delete-${night}`}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 4. 禁止敌人 (Disallowed Enemies) - Input + add/remove list */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">禁止敌人 (Disallowed Enemies)</Label>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="disallowed-enemy-input" className="text-xs">
                敌人 ID (Enemy ID)
              </Label>
              <Input
                id="disallowed-enemy-input"
                type="text"
                value={newEnemyId}
                onChange={(e) => setNewEnemyId(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddDisallowedEnemy)}
                data-testid="disallowed-enemy-input"
                placeholder="输入敌人 ID..."
              />
            </div>
            <Button
              onClick={handleAddDisallowedEnemy}
              data-testid="disallowed-enemy-add-button"
              type="button"
            >
              添加
            </Button>
          </div>

          <div className="border rounded-md p-3 space-y-2" data-testid="disallowed-enemies-list">
            {spawnConfig.disallowedEnemies.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                暂无禁止的敌人
              </p>
            ) : (
              spawnConfig.disallowedEnemies.map((enemyId) => (
                <div
                  key={enemyId}
                  className="flex justify-between items-center bg-muted px-3 py-2 rounded"
                  data-testid={`disallowed-enemy-item-${enemyId}`}
                >
                  <span className="font-mono text-sm">{enemyId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDisallowedEnemy(enemyId)}
                    data-testid={`disallowed-enemy-remove-${enemyId}`}
                  >
                    移除
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. 每组生成点数 (Spawn Points Per Group) */}
        <div className="space-y-2">
          <Label htmlFor="spawn-points-per-group-input">
            每组生成点数 (Spawn Points Per Group)
          </Label>
          <Input
            id="spawn-points-per-group-input"
            type="number"
            min={1}
            value={spawnConfig.spawnPointsPerGroup}
            onChange={(e) => setSpawnPointsPerGroup(parseInt(e.target.value) || 0)}
            data-testid="spawn-points-per-group-input"
            placeholder="输入每组生成点数..."
          />
        </div>

        {/* 6. 生成区域宽度 (Spawn Point Rect Width) */}
        <div className="space-y-2">
          <Label htmlFor="spawn-rect-width-input">
            生成区域宽度 (Spawn Point Rect Width)
          </Label>
          <Input
            id="spawn-rect-width-input"
            type="number"
            min={1}
            value={spawnConfig.spawnPointRectWidth}
            onChange={(e) => setSpawnPointRectWidth(parseInt(e.target.value) || 0)}
            data-testid="spawn-rect-width-input"
            placeholder="输入生成区域宽度..."
          />
        </div>

        {/* 7. 生成区域高度 (Spawn Point Rect Height) */}
        <div className="space-y-2">
          <Label htmlFor="spawn-rect-height-input">
            生成区域高度 (Spawn Point Rect Height)
          </Label>
          <Input
            id="spawn-rect-height-input"
            type="number"
            min={1}
            value={spawnConfig.spawnPointRectHeight}
            onChange={(e) => setSpawnPointRectHeight(parseInt(e.target.value) || 0)}
            data-testid="spawn-rect-height-input"
            placeholder="输入生成区域高度..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SpawnConfigTab;

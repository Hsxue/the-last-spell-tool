import React, { useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import type { SpawnWaveDefinition } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const WaveDefinitionsTab: React.FC = () => {
  const {
    gameConfig,
    addWaveDefinition,
    updateWaveDefinition,
    removeWaveDefinition,
    moveWaveDefinition,
  } = useConfigStore();

  const waveDefinitions = gameConfig?.spawnConfig?.waveDefinitions ?? [];

  // State for selected wave (for editing)
  const [selectedWaveId, setSelectedWaveId] = useState<string | null>(null);

  // State for create dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWaveId, setNewWaveId] = useState('');
  const [newSpawnMultiplier, setNewSpawnMultiplier] = useState('1');

  // State for editing wave
  const [editForm, setEditForm] = useState<SpawnWaveDefinition | null>(null);

  // Enemy types table state
  const [newEnemyId, setNewEnemyId] = useState('');
  const [newEnemyWeight, setNewEnemyWeight] = useState('1');

  // Tier distribution table state
  const [newTier, setNewTier] = useState('1');
  const [newTierMultiplier, setNewTierMultiplier] = useState('1');

  // Time distribution table state
  const [newTurn, setNewTurn] = useState('1');
  const [newTurnWeight, setNewTurnWeight] = useState('1');

  // Get selected wave definition
  const selectedWave = waveDefinitions.find((w) => w.id === selectedWaveId) || null;

  // Handle creating new wave definition
  const handleCreateWave = () => {
    if (newWaveId.trim()) {
      const multiplier = parseFloat(newSpawnMultiplier) || 1;
      addWaveDefinition({
        id: newWaveId.trim(),
        spawnMultiplier: multiplier,
        isBossWave: false,
        isInfinite: false,
        enemyTypes: [],
        tierDistribution: [],
        timeDistribution: [],
      });
      setNewWaveId('');
      setNewSpawnMultiplier('1');
      setIsCreateDialogOpen(false);
    }
  };

  // Handle selecting a wave for editing
  const handleSelectWave = (waveId: string) => {
    const wave = waveDefinitions.find((w) => w.id === waveId);
    if (wave) {
      setSelectedWaveId(waveId);
      setEditForm({ ...wave });
    }
  };

  // Handle updating wave field
  const handleUpdateField = <K extends keyof SpawnWaveDefinition>(
    field: K,
    value: SpawnWaveDefinition[K]
  ) => {
    if (editForm && selectedWaveId) {
      const updated = { ...editForm, [field]: value };
      setEditForm(updated);
      updateWaveDefinition(selectedWaveId, { [field]: value });
    }
  };

  // Handle moving wave
  const handleMoveWave = (direction: 'up' | 'down') => {
    if (selectedWaveId) {
      moveWaveDefinition(selectedWaveId, direction);
    }
  };

  // Handle deleting wave
  const handleDeleteWave = () => {
    if (selectedWaveId) {
      removeWaveDefinition(selectedWaveId);
      setSelectedWaveId(null);
      setEditForm(null);
    }
  };

  // Add enemy type
  const handleAddEnemyType = () => {
    if (editForm && selectedWaveId && newEnemyId.trim()) {
      const weight = parseFloat(newEnemyWeight) || 1;
      const newEntry: [string, number] = [newEnemyId.trim(), weight];
      const updatedEnemyTypes: [string, number][] = [...editForm.enemyTypes, newEntry];
      setEditForm({ ...editForm, enemyTypes: updatedEnemyTypes });
      updateWaveDefinition(selectedWaveId, { enemyTypes: updatedEnemyTypes });
      setNewEnemyId('');
      setNewEnemyWeight('1');
    }
  };

  // Remove enemy type
  const handleRemoveEnemyType = (enemyId: string) => {
    if (editForm && selectedWaveId) {
      const updatedEnemyTypes: [string, number][] = editForm.enemyTypes.filter(
        ([id]) => id !== enemyId
      );
      setEditForm({ ...editForm, enemyTypes: updatedEnemyTypes });
      updateWaveDefinition(selectedWaveId, { enemyTypes: updatedEnemyTypes });
    }
  };

  // Add tier distribution
  const handleAddTier = () => {
    if (editForm && selectedWaveId) {
      const tier = parseInt(newTier) || 1;
      const multiplier = parseFloat(newTierMultiplier) || 1;
      const newEntry: [number, number] = [tier, multiplier];
      const updatedTierDistribution: [number, number][] = [
        ...editForm.tierDistribution,
        newEntry,
      ];
      setEditForm({ ...editForm, tierDistribution: updatedTierDistribution });
      updateWaveDefinition(selectedWaveId, { tierDistribution: updatedTierDistribution });
      setNewTier('1');
      setNewTierMultiplier('1');
    }
  };

  // Remove tier distribution
  const handleRemoveTier = (tier: number) => {
    if (editForm && selectedWaveId) {
      const updatedTierDistribution: [number, number][] = editForm.tierDistribution.filter(
        ([t]) => t !== tier
      );
      setEditForm({ ...editForm, tierDistribution: updatedTierDistribution });
      updateWaveDefinition(selectedWaveId, { tierDistribution: updatedTierDistribution });
    }
  };

  // Add time distribution
  const handleAddTime = () => {
    if (editForm && selectedWaveId) {
      const turn = parseInt(newTurn) || 1;
      const weight = parseFloat(newTurnWeight) || 1;
      const newEntry: [number, number] = [turn, weight];
      const updatedTimeDistribution: [number, number][] = [
        ...editForm.timeDistribution,
        newEntry,
      ];
      setEditForm({ ...editForm, timeDistribution: updatedTimeDistribution });
      updateWaveDefinition(selectedWaveId, { timeDistribution: updatedTimeDistribution });
      setNewTurn('1');
      setNewTurnWeight('1');
    }
  };

  // Remove time distribution
  const handleRemoveTime = (turn: number) => {
    if (editForm && selectedWaveId) {
      const updatedTimeDistribution: [number, number][] = editForm.timeDistribution.filter(
        ([t]) => t !== turn
      );
      setEditForm({ ...editForm, timeDistribution: updatedTimeDistribution });
      updateWaveDefinition(selectedWaveId, { timeDistribution: updatedTimeDistribution });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  return (
    <div className="flex gap-4 h-full">
      {/* LEFT: Wave definitions list */}
      <Card className="w-80 flex-shrink-0" data-testid="wave-list-card">
        <CardHeader>
          <CardTitle>波次列表 (Wave List)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Top: Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="wave-create-button"
              size="sm"
            >
              新建
            </Button>
            <Button
              onClick={handleDeleteWave}
              disabled={!selectedWaveId}
              data-testid="wave-delete-button"
              size="sm"
              variant="destructive"
            >
              删除
            </Button>
            <Button
              onClick={() => handleMoveWave('up')}
              disabled={!selectedWaveId}
              data-testid="wave-move-up-button"
              size="sm"
              variant="outline"
            >
              上移
            </Button>
            <Button
              onClick={() => handleMoveWave('down')}
              disabled={!selectedWaveId}
              data-testid="wave-move-down-button"
              size="sm"
              variant="outline"
            >
              下移
            </Button>
          </div>

          {/* Wave list */}
          <div className="border rounded-md" data-testid="wave-list">
            {waveDefinitions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                暂无波次定义，请新建
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {waveDefinitions.map((wave) => (
                  <div
                    key={wave.id}
                    className={`p-2 border-b last:border-b-0 cursor-pointer hover:bg-muted ${
                      selectedWaveId === wave.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectWave(wave.id)}
                    data-testid={`wave-item-${wave.id}`}
                  >
                    <div className="font-medium text-sm">{wave.id}</div>
                    <div className="text-xs text-muted-foreground">
                      乘数：{wave.spawnMultiplier}
                      {wave.isBossWave && ' | Boss'}
                      {wave.isInfinite && ' | 无限'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIGHT: Wave detail editor */}
      <Card className="flex-1" data-testid="wave-editor-card">
        <CardHeader>
          <CardTitle>
            {selectedWave ? `编辑波次：${selectedWave.id}` : '选择一个波次进行编辑'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedWave && editForm ? (
            <div className="space-y-6">
              {/* Basic fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wave-id-input">波次 ID</Label>
                  <Input
                    id="wave-id-input"
                    value={editForm.id}
                    onChange={(e) => handleUpdateField('id', e.target.value)}
                    data-testid="wave-id-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wave-spawn-multiplier-input">生成乘数</Label>
                  <Input
                    id="wave-spawn-multiplier-input"
                    type="number"
                    step="0.1"
                    min={0}
                    value={editForm.spawnMultiplier}
                    onChange={(e) =>
                      handleUpdateField('spawnMultiplier', parseFloat(e.target.value) || 0)
                    }
                    data-testid="wave-spawn-multiplier-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    该波次内的敌人数量乘数。1.0 为基准，越大敌人越多
                  </p>
                </div>
              </div>

              {/* Boss wave options */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2" data-testid="wave-is-boss-wave-checkbox">
                  <Checkbox
                    id="wave-is-boss-wave"
                    checked={editForm.isBossWave}
                    onChange={(e) => handleUpdateField('isBossWave', e.target.checked)}
                  />
                  <Label htmlFor="wave-is-boss-wave">Boss 波次</Label>
                </div>
                {editForm.isBossWave && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="wave-boss-id-input">Boss ID:</Label>
                    <Input
                      id="wave-boss-id-input"
                      value={editForm.bossId || ''}
                      onChange={(e) => handleUpdateField('bossId', e.target.value)}
                      data-testid="wave-boss-id-input"
                      className="w-48"
                    />
                  </div>
                )}
              </div>
              {editForm.isBossWave && (
                <p className="text-xs text-muted-foreground">
                  Boss 波次将在该波次最后生成指定 Boss。Boss ID 需与游戏内 Boss 定义一致
                </p>
              )}

              {/* Infinite wave checkbox */}
              <div className="flex items-center gap-2" data-testid="wave-is-infinite-checkbox">
                <Checkbox
                  id="wave-is-infinite"
                  checked={editForm.isInfinite}
                  onChange={(e) => handleUpdateField('isInfinite', e.target.checked)}
                />
                <Label htmlFor="wave-is-infinite">无限波次</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                无限波次会在所有普通波次完成后持续生成敌人，直到玩家胜利。用于延长游戏时长
              </p>

              {/* Enemy types table */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">敌人类型 (Enemy Types)</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="wave-enemy-id-input" className="text-xs">
                      敌人 ID
                    </Label>
                    <Input
                      id="wave-enemy-id-input"
                      value={newEnemyId}
                      onChange={(e) => setNewEnemyId(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddEnemyType)}
                      data-testid="wave-enemy-id-input"
                      placeholder="EnemyId"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-enemy-weight-input" className="text-xs">
                      权重
                    </Label>
                    <Input
                      id="wave-enemy-weight-input"
                      type="number"
                      step="0.1"
                      min={0}
                      value={newEnemyWeight}
                      onChange={(e) => setNewEnemyWeight(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddEnemyType)}
                      data-testid="wave-enemy-weight-input"
                      placeholder="Weight"
                    />
                  </div>
                  <Button
                    onClick={handleAddEnemyType}
                    data-testid="wave-enemy-add-button"
                    type="button"
                    size="sm"
                  >
                    添加
                  </Button>
                </div>
                <Table data-testid="wave-enemy-types-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>EnemyId</TableHead>
                      <TableHead>Weight (相对概率)</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editForm.enemyTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          暂无敌人类型
                        </TableCell>
                      </TableRow>
                    ) : (
                      editForm.enemyTypes.map(([enemyId, weight]) => (
                        <TableRow key={enemyId} data-testid={`wave-enemy-row-${enemyId}`}>
                          <TableCell>{enemyId}</TableCell>
                          <TableCell>{weight}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEnemyType(enemyId)}
                              data-testid={`wave-enemy-remove-${enemyId}`}
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

              {/* Tier distribution table */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Tier 分布 (Tier Distribution)</Label>
                <div className="flex gap-2 items-end">
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-tier-input" className="text-xs">
                      Tier
                    </Label>
                    <Input
                      id="wave-tier-input"
                      type="number"
                      min={1}
                      value={newTier}
                      onChange={(e) => setNewTier(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddTier)}
                      data-testid="wave-tier-input"
                      placeholder="Tier"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-tier-multiplier-input" className="text-xs">
                      乘数
                    </Label>
                    <Input
                      id="wave-tier-multiplier-input"
                      type="number"
                      step="0.1"
                      min={0}
                      value={newTierMultiplier}
                      onChange={(e) => setNewTierMultiplier(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddTier)}
                      data-testid="wave-tier-multiplier-input"
                      placeholder="Multiplier"
                    />
                  </div>
                  <Button
                    onClick={handleAddTier}
                    data-testid="wave-tier-add-button"
                    type="button"
                    size="sm"
                  >
                    添加
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tier 代表敌人等级（1=低级/3=高级）。乘数越高，该等级敌人在波次中出现的概率越大
                </p>
                <Table data-testid="wave-tier-distribution-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editForm.tierDistribution.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          暂无 Tier 分布
                        </TableCell>
                      </TableRow>
                    ) : (
                      editForm.tierDistribution.map(([tier, multiplier]) => (
                        <TableRow key={tier} data-testid={`wave-tier-row-${tier}`}>
                          <TableCell>Tier {tier}</TableCell>
                          <TableCell>{multiplier}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTier(tier)}
                              data-testid={`wave-tier-remove-${tier}`}
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

              {/* Time distribution table */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  时间分布 (Time Distribution)
                </Label>
                <div className="flex gap-2 items-end">
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-turn-input" className="text-xs">
                      回合 (Turn)
                    </Label>
                    <Input
                      id="wave-turn-input"
                      type="number"
                      min={1}
                      value={newTurn}
                      onChange={(e) => setNewTurn(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddTime)}
                      data-testid="wave-turn-input"
                      placeholder="Turn"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-turn-weight-input" className="text-xs">
                      权重
                    </Label>
                    <Input
                      id="wave-turn-weight-input"
                      type="number"
                      step="0.1"
                      min={0}
                      value={newTurnWeight}
                      onChange={(e) => setNewTurnWeight(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddTime)}
                      data-testid="wave-turn-weight-input"
                      placeholder="Weight"
                    />
                  </div>
                  <Button
                    onClick={handleAddTime}
                    data-testid="wave-time-add-button"
                    type="button"
                    size="sm"
                  >
                    添加
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  回合权重控制敌人在不同回合的生成概率。Turn 1=第一回合，权重越高该回合生成敌人越多
                </p>
                <Table data-testid="wave-time-distribution-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Turn</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editForm.timeDistribution.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          暂无时间分布
                        </TableCell>
                      </TableRow>
                    ) : (
                      editForm.timeDistribution.map(([turn, weight]) => (
                        <TableRow key={turn} data-testid={`wave-time-row-${turn}`}>
                          <TableCell>Turn {turn}</TableCell>
                          <TableCell>{weight}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTime(turn)}
                              data-testid={`wave-time-remove-${turn}`}
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
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              请从左侧选择一个波次进行编辑
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Wave Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="wave-create-dialog">
          <DialogHeader>
            <DialogTitle>新建波次定义</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-wave-id-input">波次 ID</Label>
              <Input
                id="new-wave-id-input"
                value={newWaveId}
                onChange={(e) => setNewWaveId(e.target.value)}
                data-testid="new-wave-id-input"
                placeholder="输入波次 ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-wave-spawn-multiplier-input">生成乘数</Label>
              <Input
                id="new-wave-spawn-multiplier-input"
                type="number"
                step="0.1"
                min={0}
                value={newSpawnMultiplier}
                onChange={(e) => setNewSpawnMultiplier(e.target.value)}
                data-testid="new-wave-spawn-multiplier-input"
                placeholder="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              data-testid="wave-create-dialog-cancel"
            >
              取消
            </Button>
            <Button
              onClick={handleCreateWave}
              data-testid="wave-create-dialog-confirm"
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaveDefinitionsTab;

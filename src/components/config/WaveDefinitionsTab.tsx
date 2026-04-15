import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import type { SpawnWaveDefinition } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const WaveDefinitionsTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig, addWaveDefinition, updateWaveDefinition, removeWaveDefinition, moveWaveDefinition } = useConfigStore();

  const waveDefinitions = gameConfig?.spawnConfig?.waveDefinitions ?? [];

  const [selectedWaveId, setSelectedWaveId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWaveId, setNewWaveId] = useState('');
  const [newSpawnMultiplier, setNewSpawnMultiplier] = useState('1');
  const [editForm, setEditForm] = useState<SpawnWaveDefinition | null>(null);

  const [newEnemyId, setNewEnemyId] = useState('');
  const [newEnemyWeight, setNewEnemyWeight] = useState('1');
  const [newTier, setNewTier] = useState('1');
  const [newTierMultiplier, setNewTierMultiplier] = useState('1');
  const [newTurn, setNewTurn] = useState('1');
  const [newTurnWeight, setNewTurnWeight] = useState('1');

  const selectedWave = waveDefinitions.find((w) => w.id === selectedWaveId) || null;

  const handleCreateWave = () => {
    if (newWaveId.trim()) {
      const multiplier = parseFloat(newSpawnMultiplier) || 1;
      addWaveDefinition({ id: newWaveId.trim(), spawnMultiplier: multiplier, isBossWave: false, isInfinite: false, enemyTypes: [], tierDistribution: [], timeDistribution: [] });
      setNewWaveId(''); setNewSpawnMultiplier('1'); setIsCreateDialogOpen(false);
    }
  };

  const handleSelectWave = (waveId: string) => {
    const wave = waveDefinitions.find((w) => w.id === waveId);
    if (wave) { setSelectedWaveId(waveId); setEditForm({ ...wave }); }
  };

  const handleUpdateField = <K extends keyof SpawnWaveDefinition>(field: K, value: SpawnWaveDefinition[K]) => {
    if (editForm && selectedWaveId) {
      const updated = { ...editForm, [field]: value };
      setEditForm(updated);
      updateWaveDefinition(selectedWaveId, { [field]: value });
    }
  };

  const handleMoveWave = (direction: 'up' | 'down') => { if (selectedWaveId) moveWaveDefinition(selectedWaveId, direction); };

  const handleDeleteWave = () => { if (selectedWaveId) { removeWaveDefinition(selectedWaveId); setSelectedWaveId(null); setEditForm(null); } };

  const handleAddEnemyType = () => {
    if (editForm && selectedWaveId && newEnemyId.trim()) {
      const weight = parseFloat(newEnemyWeight) || 1;
      const newEntry:[string, number] = [newEnemyId.trim(), weight];
      const updated: [string, number][] = [...editForm.enemyTypes, newEntry];
      setEditForm({ ...editForm, enemyTypes: updated });
      updateWaveDefinition(selectedWaveId, { enemyTypes: updated });
      setNewEnemyId(''); setNewEnemyWeight('1');
    }
  };

  const handleRemoveEnemyType = (enemyId: string) => {
    if (editForm && selectedWaveId) {
      const updated: [string, number][] = editForm.enemyTypes.filter(([id]) => id !== enemyId);
      setEditForm({ ...editForm, enemyTypes: updated });
      updateWaveDefinition(selectedWaveId, { enemyTypes: updated });
    }
  };

  const handleAddTier = () => {
    if (editForm && selectedWaveId) {
      const tier = parseInt(newTier) || 1;
      const multiplier = parseFloat(newTierMultiplier) || 1;
      const newEntry: [number, number] = [tier, multiplier];
      const updated: [number, number][] = [...editForm.tierDistribution, newEntry];
      setEditForm({ ...editForm, tierDistribution: updated });
      updateWaveDefinition(selectedWaveId, { tierDistribution: updated });
      setNewTier('1'); setNewTierMultiplier('1');
    }
  };

  const handleRemoveTier = (tier: number) => {
    if (editForm && selectedWaveId) {
      const updated: [number, number][] = editForm.tierDistribution.filter(([t]) => t !== tier);
      setEditForm({ ...editForm, tierDistribution: updated });
      updateWaveDefinition(selectedWaveId, { tierDistribution: updated });
    }
  };

  const handleAddTime = () => {
    if (editForm && selectedWaveId) {
      const turn = parseInt(newTurn) || 1;
      const weight = parseFloat(newTurnWeight) || 1;
      const newEntry: [number, number] = [turn, weight];
      const updated: [number, number][] = [...editForm.timeDistribution, newEntry];
      setEditForm({ ...editForm, timeDistribution: updated });
      updateWaveDefinition(selectedWaveId, { timeDistribution: updated });
      setNewTurn('1'); setNewTurnWeight('1');
    }
  };

  const handleRemoveTime = (turn: number) => {
    if (editForm && selectedWaveId) {
      const updated: [number, number][] = editForm.timeDistribution.filter(([t]) => t !== turn);
      setEditForm({ ...editForm, timeDistribution: updated });
      updateWaveDefinition(selectedWaveId, { timeDistribution: updated });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => { if (e.key === 'Enter') handler(); };

  return (
    <div className="flex gap-4 h-full">
      <Card className="w-80 flex-shrink-0" data-testid="wave-list-card">
        <CardHeader><CardTitle>{t('configTab.waveDef.waveListTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="wave-create-button" size="sm">{t('configTab.waveDef.new')}</Button>
            <Button onClick={handleDeleteWave} disabled={!selectedWaveId} data-testid="wave-delete-button" size="sm" variant="destructive">{t('configTab.waveDef.delete')}</Button>
            <Button onClick={() => handleMoveWave('up')} disabled={!selectedWaveId} data-testid="wave-move-up-button" size="sm" variant="outline">{t('configTab.waveDef.moveUp')}</Button>
            <Button onClick={() => handleMoveWave('down')} disabled={!selectedWaveId} data-testid="wave-move-down-button" size="sm" variant="outline">{t('configTab.waveDef.moveDown')}</Button>
          </div>
          <div className="border rounded-md" data-testid="wave-list">
            {waveDefinitions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">{t('configTab.waveDef.noData')}</div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {waveDefinitions.map((wave) => (
                  <div key={wave.id} className={`p-2 border-b last:border-b-0 cursor-pointer hover:bg-muted ${selectedWaveId === wave.id ? 'bg-muted' : ''}`} onClick={() => handleSelectWave(wave.id)} data-testid={`wave-item-${wave.id}`}>
                    <div className="font-medium text-sm">{wave.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('configTab.waveDef.multiplierLabel')}{wave.spawnMultiplier}
                      {wave.isBossWave && ` | ${t('configTab.waveDef.bossLabel')}`}
                      {wave.isInfinite && ` | ${t('configTab.waveDef.infiniteLabel')}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1" data-testid="wave-editor-card">
        <CardHeader>
          <CardTitle>{selectedWave ? `${t('configTab.waveDef.editTitle')}${selectedWave.id}` : t('configTab.waveDef.selectPrompt')}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedWave && editForm ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wave-id-input">{t('configTab.waveDef.waveId')}</Label>
                  <Input id="wave-id-input" value={editForm.id} onChange={(e) => handleUpdateField('id', e.target.value)} data-testid="wave-id-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wave-spawn-multiplier-input">{t('configTab.waveDef.spawnMultiplier')}</Label>
                  <Input id="wave-spawn-multiplier-input" type="number" step="0.1" min={0} value={editForm.spawnMultiplier} onChange={(e) => handleUpdateField('spawnMultiplier', parseFloat(e.target.value) || 0)} data-testid="wave-spawn-multiplier-input" />
                  <p className="text-xs text-muted-foreground">{t('configTab.waveDef.spawnMultiplierDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2" data-testid="wave-is-boss-wave-checkbox">
                  <Checkbox id="wave-is-boss-wave" checked={editForm.isBossWave} onChange={(e) => handleUpdateField('isBossWave', e.target.checked)} />
                  <Label htmlFor="wave-is-boss-wave">{t('configTab.waveDef.bossWave')}</Label>
                </div>
                {editForm.isBossWave && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="wave-boss-id-input">{t('configTab.waveDef.bossId')}</Label>
                    <Input id="wave-boss-id-input" value={editForm.bossId || ''} onChange={(e) => handleUpdateField('bossId', e.target.value)} data-testid="wave-boss-id-input" className="w-48" />
                  </div>
                )}
              </div>
              {editForm.isBossWave && (<p className="text-xs text-muted-foreground">{t('configTab.waveDef.bossWaveDesc')}</p>)}
              <div className="flex items-center gap-2" data-testid="wave-is-infinite-checkbox">
                <Checkbox id="wave-is-infinite" checked={editForm.isInfinite} onChange={(e) => handleUpdateField('isInfinite', e.target.checked)} />
                <Label htmlFor="wave-is-infinite">{t('configTab.waveDef.infiniteWave')}</Label>
              </div>
              <p className="text-xs text-muted-foreground">{t('configTab.waveDef.infiniteWaveDesc')}</p>
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('configTab.waveDef.enemyTypes')}</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="wave-enemy-id-input" className="text-xs">{t('configTab.waveDef.enemyId')}</Label>
                    <Input id="wave-enemy-id-input" value={newEnemyId} onChange={(e) => setNewEnemyId(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddEnemyType)} data-testid="wave-enemy-id-input" placeholder={t('configTab.waveDef.enemyIdPlaceholder')} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-enemy-weight-input" className="text-xs">{t('configTab.waveDef.weight')}</Label>
                    <Input id="wave-enemy-weight-input" type="number" step="0.1" min={0} value={newEnemyWeight} onChange={(e) => setNewEnemyWeight(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddEnemyType)} data-testid="wave-enemy-weight-input" placeholder={t('configTab.waveDef.weightPlaceholder')} />
                  </div>
                  <Button onClick={handleAddEnemyType} data-testid="wave-enemy-add-button" type="button" size="sm">{t('configTab.waveDef.add')}</Button>
                </div>
                <Table data-testid="wave-enemy-types-table">
                  <TableHeader><TableRow><TableHead>{t('configTab.waveDef.tableEnemyId')}</TableHead><TableHead>{t('configTab.waveDef.tableWeight')}</TableHead><TableHead className="w-20">{t('configTab.waveDef.actions')}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {editForm.enemyTypes.length === 0 ? (<TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('configTab.waveDef.noEnemyTypes')}</TableCell></TableRow>) : (
                      editForm.enemyTypes.map(([enemyId, weight]) => (
                        <TableRow key={enemyId} data-testid={`wave-enemy-row-${enemyId}`}>
                          <TableCell>{enemyId}</TableCell><TableCell>{weight}</TableCell>
                          <TableCell><Button variant="ghost" size="sm" onClick={() => handleRemoveEnemyType(enemyId)} data-testid={`wave-enemy-remove-${enemyId}`}>{t('configTab.waveDef.delete')}</Button></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('configTab.waveDef.tierDistribution')}</Label>
                <div className="flex gap-2 items-end">
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-tier-input" className="text-xs">{t('configTab.waveDef.tier')}</Label>
                    <Input id="wave-tier-input" type="number" min={1} value={newTier} onChange={(e) => setNewTier(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddTier)} data-testid="wave-tier-input" placeholder={t('configTab.waveDef.tierPlaceholder')} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-tier-multiplier-input" className="text-xs">{t('configTab.waveDef.multiplier')}</Label>
                    <Input id="wave-tier-multiplier-input" type="number" step="0.1" min={0} value={newTierMultiplier} onChange={(e) => setNewTierMultiplier(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddTier)} data-testid="wave-tier-multiplier-input" placeholder={t('configTab.waveDef.multiplierPlaceholder')} />
                  </div>
                  <Button onClick={handleAddTier} data-testid="wave-tier-add-button" type="button" size="sm">{t('configTab.waveDef.add')}</Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('configTab.waveDef.tierDesc')}</p>
                <Table data-testid="wave-tier-distribution-table">
                  <TableHeader><TableRow><TableHead>{t('configTab.waveDef.tableTier')}</TableHead><TableHead>{t('configTab.waveDef.tableMultiplier')}</TableHead><TableHead className="w-20">{t('configTab.waveDef.actions')}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {editForm.tierDistribution.length === 0 ? (<TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('configTab.waveDef.noTierDistribution')}</TableCell></TableRow>) : (
                      editForm.tierDistribution.map(([tier, multiplier]) => (
                        <TableRow key={tier} data-testid={`wave-tier-row-${tier}`}>
                          <TableCell>Tier {tier}</TableCell><TableCell>{multiplier}</TableCell>
                          <TableCell><Button variant="ghost" size="sm" onClick={() => handleRemoveTier(tier)} data-testid={`wave-tier-remove-${tier}`}>{t('configTab.waveDef.delete')}</Button></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('configTab.waveDef.timeDistribution')}</Label>
                <div className="flex gap-2 items-end">
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-turn-input" className="text-xs">{t('configTab.waveDef.turn')}</Label>
                    <Input id="wave-turn-input" type="number" min={1} value={newTurn} onChange={(e) => setNewTurn(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddTime)} data-testid="wave-turn-input" placeholder={t('configTab.waveDef.turnPlaceholder')} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label htmlFor="wave-turn-weight-input" className="text-xs">{t('configTab.waveDef.weight')}</Label>
                    <Input id="wave-turn-weight-input" type="number" step="0.1" min={0} value={newTurnWeight} onChange={(e) => setNewTurnWeight(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddTime)} data-testid="wave-turn-weight-input" placeholder={t('configTab.waveDef.turnWeightPlaceholder')} />
                  </div>
                  <Button onClick={handleAddTime} data-testid="wave-time-add-button" type="button" size="sm">{t('configTab.waveDef.add')}</Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('configTab.waveDef.timeDesc')}</p>
                <Table data-testid="wave-time-distribution-table">
                  <TableHeader><TableRow><TableHead>{t('configTab.waveDef.tableTurn')}</TableHead><TableHead>{t('configTab.waveDef.tableTurnWeight')}</TableHead><TableHead className="w-20">{t('configTab.waveDef.actions')}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {editForm.timeDistribution.length === 0 ? (<TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('configTab.waveDef.noTimeDistribution')}</TableCell></TableRow>) : (
                      editForm.timeDistribution.map(([turn, weight]) => (
                        <TableRow key={turn} data-testid={`wave-time-row-${turn}`}>
                          <TableCell>Turn {turn}</TableCell><TableCell>{weight}</TableCell>
                          <TableCell><Button variant="ghost" size="sm" onClick={() => handleRemoveTime(turn)} data-testid={`wave-time-remove-${turn}`}>{t('configTab.waveDef.delete')}</Button></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">{t('configTab.waveDef.noSelection')}</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="wave-create-dialog">
          <DialogHeader><DialogTitle>{t('configTab.waveDef.createDialogTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-wave-id-input">{t('configTab.waveDef.waveId')}</Label>
              <Input id="new-wave-id-input" value={newWaveId} onChange={(e) => setNewWaveId(e.target.value)} data-testid="new-wave-id-input" placeholder={t('configTab.waveDef.createDialogWaveIdPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-wave-spawn-multiplier-input">{t('configTab.waveDef.spawnMultiplier')}</Label>
              <Input id="new-wave-spawn-multiplier-input" type="number" step="0.1" min={0} value={newSpawnMultiplier} onChange={(e) => setNewSpawnMultiplier(e.target.value)} data-testid="new-wave-spawn-multiplier-input" placeholder="1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="wave-create-dialog-cancel">{t('configTab.waveDef.createDialogCancel')}</Button>
            <Button onClick={handleCreateWave} data-testid="wave-create-dialog-confirm">{t('configTab.waveDef.createDialogCreate')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaveDefinitionsTab;

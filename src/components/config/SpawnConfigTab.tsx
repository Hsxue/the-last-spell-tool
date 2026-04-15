import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const SpawnConfigTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig, setSpawnMultiplier, removeSpawnMultiplier, setSpawnsPerWaveFormula, setMaxDistancePerDay, removeMaxDistancePerDay, addDisallowedEnemy, removeDisallowedEnemy, setSpawnPointsPerGroup, setSpawnPointRectWidth, setSpawnPointRectHeight } = useConfigStore();

  const spawnConfig = gameConfig.spawnConfig;
  const [newNight, setNewNight] = useState<string>('');
  const [newMultiplier, setNewMultiplier] = useState<string>('');
  const [newDistance, setNewDistance] = useState<string>('');
  const [newEnemyId, setNewEnemyId] = useState<string>('');

  const spawnMultipliersArray = Array.from(spawnConfig?.spawnMultipliers?.entries() ?? []).sort((a, b) => a[0] - b[0]);
  const maxDistancePerDayArray = Array.from(spawnConfig?.maxDistancePerDay?.entries() ?? []).sort((a, b) => a[0] - b[0]);

  const handleAddSpawnMultiplier = () => {
    const night = parseInt(newNight);
    const multiplier = parseFloat(newMultiplier);
    if (!isNaN(night) && !isNaN(multiplier)) { setSpawnMultiplier(night, multiplier); setNewNight(''); setNewMultiplier(''); }
  };

  const handleAddMaxDistance = () => {
    const night = parseInt(newNight);
    const distance = parseFloat(newDistance);
    if (!isNaN(night) && !isNaN(distance)) { setMaxDistancePerDay(night, distance); setNewNight(''); setNewDistance(''); }
  };

  const handleAddDisallowedEnemy = () => { if (newEnemyId.trim()) { addDisallowedEnemy(newEnemyId.trim()); setNewEnemyId(''); } };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => { if (e.key === 'Enter') handler(); };

  return (
    <Card>
      <CardHeader><CardTitle>{t('configTab.spawn.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <Label className="text-base font-semibold">{t('configTab.spawn.spawnMultipliers')}</Label>
            <p className="text-xs text-muted-foreground mt-1">{t('configTab.spawn.spawnMultipliersDesc')}</p>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="spawn-multiplier-night" className="text-xs">{t('configTab.spawn.night')} N</Label>
              <Input id="spawn-multiplier-night" type="number" min={1} value={newNight} onChange={(e) => setNewNight(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddSpawnMultiplier)} data-testid="spawn-multiplier-night-input" placeholder={t('configTab.spawn.night')} />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="spawn-multiplier-value" className="text-xs">{t('configTab.spawn.multiplier')}</Label>
              <Input id="spawn-multiplier-value" type="number" step="0.1" min={0} value={newMultiplier} onChange={(e) => setNewMultiplier(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddSpawnMultiplier)} data-testid="spawn-multiplier-value-input" placeholder={t('configTab.spawn.multiplierPlaceholder')} />
            </div>
            <Button onClick={handleAddSpawnMultiplier} data-testid="spawn-multiplier-add-button" type="button">{t('configTab.spawn.add')}</Button>
          </div>
          <Table data-testid="spawn-multipliers-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t('configTab.spawn.night')}</TableHead>
                <TableHead>{t('configTab.spawn.multiplier')}</TableHead>
                <TableHead className="w-20">{t('configTab.spawn.actions') || t('configTab.spawn.night')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spawnMultipliersArray.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('configTab.spawn.noData')}</TableCell></TableRow>
              ) : (
                spawnMultipliersArray.map(([night, multiplier]) => (
                  <TableRow key={night} data-testid={`spawn-multiplier-row-${night}`}>
                    <TableCell>{night}</TableCell>
                    <TableCell>{multiplier}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => removeSpawnMultiplier(night)} data-testid={`spawn-multiplier-delete-${night}`}>{t('configTab.spawn.delete')}</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-2">
          <Label htmlFor="spawns-formula-textarea">{t('configTab.spawn.spawnsFormula')}</Label>
          <Textarea id="spawns-formula-textarea" value={spawnConfig?.spawnsPerWaveFormula ?? ''} onChange={(e) => setSpawnsPerWaveFormula(e.target.value)} data-testid="spawns-formula-textarea" placeholder={t('configTab.spawn.spawnsFormulaPlaceholder')} rows={3} />
          <p className="text-xs text-muted-foreground">{t('configTab.spawn.spawnsFormulaDesc')}</p>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-base font-semibold">{t('configTab.spawn.maxDistance')}</Label>
            <p className="text-xs text-muted-foreground mt-1">{t('configTab.spawn.maxDistanceDesc')}</p>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="max-distance-night" className="text-xs">{t('configTab.spawn.night')} N</Label>
              <Input id="max-distance-night" type="number" min={1} value={newNight} onChange={(e) => setNewNight(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddMaxDistance)} data-testid="max-distance-night-input" placeholder={t('configTab.spawn.night')} />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="max-distance-value" className="text-xs">{t('configTab.spawn.distance')}</Label>
              <Input id="max-distance-value" type="number" step="0.1" min={0} value={newDistance} onChange={(e) => setNewDistance(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddMaxDistance)} data-testid="max-distance-value-input" placeholder={t('configTab.spawn.distancePlaceholder')} />
            </div>
            <Button onClick={handleAddMaxDistance} data-testid="max-distance-add-button" type="button">{t('configTab.spawn.add')}</Button>
          </div>
          <Table data-testid="max-distance-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t('configTab.spawn.night')}</TableHead>
                <TableHead>{t('configTab.spawn.distance')}</TableHead>
                <TableHead className="w-20">{t('configTab.spawn.actions') || t('configTab.spawn.night')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maxDistancePerDayArray.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('configTab.spawn.noData')}</TableCell></TableRow>
              ) : (
                maxDistancePerDayArray.map(([night, distance]) => (
                  <TableRow key={night} data-testid={`max-distance-row-${night}`}>
                    <TableCell>{night}</TableCell>
                    <TableCell>{distance}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => removeMaxDistancePerDay(night)} data-testid={`max-distance-delete-${night}`}>{t('configTab.spawn.delete')}</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-base font-semibold">{t('configTab.spawn.disallowedEnemies')}</Label>
            <p className="text-xs text-muted-foreground mt-1">{t('configTab.spawn.disallowedEnemiesDesc')}</p>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="disallowed-enemy-input" className="text-xs">{t('configTab.spawn.disallowedEnemyId')}</Label>
              <Input id="disallowed-enemy-input" type="text" value={newEnemyId} onChange={(e) => setNewEnemyId(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddDisallowedEnemy)} data-testid="disallowed-enemy-input" placeholder={t('configTab.spawn.disallowedEnemyPlaceholder')} />
            </div>
            <Button onClick={handleAddDisallowedEnemy} data-testid="disallowed-enemy-add-button" type="button">{t('configTab.spawn.add')}</Button>
          </div>
          <div className="border rounded-md p-3 space-y-2" data-testid="disallowed-enemies-list">
            {spawnConfig?.disallowedEnemies?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">{t('configTab.spawn.noDisallowedEnemies')}</p>
            ) : (
              spawnConfig?.disallowedEnemies?.map((enemyId) => (
                <div key={enemyId} className="flex justify-between items-center bg-muted px-3 py-2 rounded" data-testid={`disallowed-enemy-item-${enemyId}`}>
                  <span className="font-mono text-sm">{enemyId}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeDisallowedEnemy(enemyId)} data-testid={`disallowed-enemy-remove-${enemyId}`}>{t('configTab.spawn.remove')}</Button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="spawn-points-per-group-input">{t('configTab.spawn.spawnPointsPerGroup')}</Label>
          <Input id="spawn-points-per-group-input" type="number" min={1} value={spawnConfig?.spawnPointsPerGroup ?? 0} onChange={(e) => setSpawnPointsPerGroup(parseInt(e.target.value) || 0)} data-testid="spawn-points-per-group-input" placeholder={t('configTab.spawn.spawnPointsPerGroupPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.spawn.spawnPointsPerGroupDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="spawn-rect-width-input">{t('configTab.spawn.spawnRectWidth')}</Label>
          <Input id="spawn-rect-width-input" type="number" min={1} value={spawnConfig?.spawnPointRectWidth ?? 0} onChange={(e) => setSpawnPointRectWidth(parseInt(e.target.value) || 0)} data-testid="spawn-rect-width-input" placeholder={t('configTab.spawn.spawnRectWidthPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.spawn.spawnRectWidthDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="spawn-rect-height-input">{t('configTab.spawn.spawnRectHeight')}</Label>
          <Input id="spawn-rect-height-input" type="number" min={1} value={spawnConfig?.spawnPointRectHeight ?? 0} onChange={(e) => setSpawnPointRectHeight(parseInt(e.target.value) || 0)} data-testid="spawn-rect-height-input" placeholder={t('configTab.spawn.spawnRectHeightPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.spawn.spawnRectHeightDesc')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpawnConfigTab;

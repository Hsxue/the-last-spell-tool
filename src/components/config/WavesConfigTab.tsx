import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const WavesConfigTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig, addSpawnWave, removeSpawnWave } = useConfigStore();
  const spawnConfig = gameConfig.spawnConfig;
  const spawnWavesPerDay = spawnConfig?.spawnWavesPerDay ?? new Map();

  const [selectedNight, setSelectedNight] = useState<string>('1');
  const [newWaveId, setNewWaveId] = useState<string>('');
  const [newWeight, setNewWeight] = useState<string>('');

  const nightOptions = Array.from({ length: 20 }, (_, i) => i + 1);
  const selectedNightNum = parseInt(selectedNight);
  const currentWaves = spawnWavesPerDay.get(selectedNightNum) || [];

  const handleAddSpawnWave = () => {
    const waveId = newWaveId.trim();
    const weight = parseFloat(newWeight);
    if (waveId && !isNaN(weight)) { addSpawnWave(selectedNightNum, waveId, weight); setNewWaveId(''); setNewWeight(''); }
  };

  const handleRemoveSpawnWave = (waveId: string) => { removeSpawnWave(selectedNightNum, waveId); };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => { if (e.key === 'Enter') handler(); };

  return (
    <Card>
      <CardHeader><CardTitle>{t('configTab.waves.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="night-selector">{t('configTab.waves.selectNight')}</Label>
          <Select value={selectedNight} onValueChange={setSelectedNight}>
            <SelectTrigger id="night-selector" data-testid="night-selector"><SelectValue placeholder={t('configTab.waves.selectNightPlaceholder')} /></SelectTrigger>
            <SelectContent>
              {nightOptions.map((night) => (
                <SelectItem key={night} value={night.toString()} data-testid={`night-option-${night}`}>{t('configTab.waves.nightOption', { night })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('configTab.waves.nightDesc')}</p>
        </div>
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('configTab.waves.addWave')}</Label>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="wave-id-input" className="text-xs">{t('configTab.waves.waveId')}</Label>
              <Input id="wave-id-input" type="text" value={newWaveId} onChange={(e) => setNewWaveId(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddSpawnWave)} data-testid="wave-id-input" placeholder={t('configTab.waves.waveIdPlaceholder')} />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="wave-weight-input" className="text-xs">{t('configTab.waves.weight')}</Label>
              <Input id="wave-weight-input" type="number" step="0.1" min={0} value={newWeight} onChange={(e) => setNewWeight(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddSpawnWave)} data-testid="wave-weight-input" placeholder={t('configTab.waves.weightPlaceholder')} />
            </div>
            <Button onClick={handleAddSpawnWave} data-testid="wave-add-button" type="button">{t('configTab.waves.add')}</Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('configTab.waves.nightWavesTitle', { night: selectedNight })}</Label>
          <p className="text-xs text-muted-foreground">{t('configTab.waves.weightDesc')}</p>
          <Table data-testid="waves-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t('configTab.waves.tableWaveId')}</TableHead>
                <TableHead>{t('configTab.waves.tableWeight')}</TableHead>
                <TableHead className="w-20">{t('configTab.waves.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentWaves.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('configTab.waves.noData')}</TableCell></TableRow>
              ) : (
                currentWaves.map(([waveId, weight]) => (
                  <TableRow key={waveId} data-testid={`wave-row-${waveId}`}>
                    <TableCell>{waveId}</TableCell>
                    <TableCell>{weight}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveSpawnWave(waveId)} data-testid={`wave-remove-${waveId}`}>{t('configTab.waves.remove')}</Button>
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

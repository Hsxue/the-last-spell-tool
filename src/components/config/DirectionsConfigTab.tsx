import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const DirectionsConfigTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig, addSpawnDirection, removeSpawnDirection } = useConfigStore();

  const DIRECTION_OPTIONS = [
    { value: 'AllIn_T100-2', key: 'AllIn_T100-2' },
    { value: 'Corner_TR-2', key: 'Corner_TR-2' },
    { value: 'Parallel_LR', key: 'Parallel_LR' },
    { value: 'Four_TopBottom', key: 'Four_TopBottom' },
    { value: 'AllIn', key: 'AllIn' },
    { value: 'Corner_TL', key: 'Corner_TL' },
    { value: 'Corner_TR', key: 'Corner_TR' },
    { value: 'Corner_BL', key: 'Corner_BL' },
    { value: 'Corner_BR', key: 'Corner_BR' },
    { value: 'Parallel_TB', key: 'Parallel_TB' },
    { value: 'Four_Corners', key: 'Four_Corners' },
    { value: 'Four_LeftRight', key: 'Four_LeftRight' },
  ];

  const spawnConfig = gameConfig.spawnConfig;
  const spawnDirections = spawnConfig?.spawnDirections ?? new Map();

  const [selectedNight, setSelectedNight] = useState<string>('1');
  const [newDirectionId, setNewDirectionId] = useState<string>('');
  const [newWeight, setNewWeight] = useState<string>('');

  const nightOptions = Array.from({ length: 20 }, (_, i) => i + 1);
  const selectedNightNum = parseInt(selectedNight);
  const currentDirections = spawnDirections.get(selectedNightNum) || [];

  const handleAddSpawnDirection = () => {
    const directionId = newDirectionId.trim();
    const weight = parseFloat(newWeight);
    if (directionId && !isNaN(weight)) { addSpawnDirection(selectedNightNum, directionId, weight); setNewDirectionId(''); setNewWeight(''); }
  };

  const handleRemoveSpawnDirection = (directionId: string) => { removeSpawnDirection(selectedNightNum, directionId); };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => { if (e.key === 'Enter') handler(); };

  return (
    <Card>
      <CardHeader><CardTitle>{t('configTab.directions.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="direction-night-selector">{t('configTab.directions.selectNight')}</Label>
          <Select value={selectedNight} onValueChange={setSelectedNight}>
            <SelectTrigger id="direction-night-selector" data-testid="direction-night-selector"><SelectValue placeholder={t('configTab.directions.selectNightPlaceholder')} /></SelectTrigger>
            <SelectContent>
              {nightOptions.map((night) => (
                <SelectItem key={night} value={night.toString()} data-testid={`direction-night-option-${night}`}>{t('configTab.directions.nightOption', { night })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('configTab.directions.nightDesc')}</p>
        </div>
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('configTab.directions.addDirection')}</Label>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="direction-id-select" className="text-xs">{t('configTab.directions.directionId')}</Label>
              <Select value={newDirectionId} onValueChange={setNewDirectionId}>
                <SelectTrigger id="direction-id-select" data-testid="direction-id-select"><SelectValue placeholder={t('configTab.directions.directionIdPlaceholder')} /></SelectTrigger>
                <SelectContent>
                  {DIRECTION_OPTIONS.map(({ value, key }) => (
                    <SelectItem key={key} value={value} data-testid={`direction-option-${value}`}>{t(`configTab.directions.directions.${key}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="direction-weight-input" className="text-xs">{t('configTab.directions.weight')}</Label>
              <Input id="direction-weight-input" type="number" step="0.1" min={0} value={newWeight} onChange={(e) => setNewWeight(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddSpawnDirection)} data-testid="direction-weight-input" placeholder={t('configTab.directions.weightPlaceholder')} />
            </div>
            <Button onClick={handleAddSpawnDirection} data-testid="direction-add-button" type="button">{t('configTab.directions.add')}</Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('configTab.directions.nightDirectionsTitle', { night: selectedNight })}</Label>
          <Table data-testid="directions-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t('configTab.directions.tableDirectionId')}</TableHead>
                <TableHead>{t('configTab.directions.tableWeight')}</TableHead>
                <TableHead className="w-20">{t('configTab.directions.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDirections.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('configTab.directions.noData')}</TableCell></TableRow>
              ) : (
                currentDirections.map(([directionId, weight]) => (
                  <TableRow key={directionId} data-testid={`direction-row-${directionId}`}>
                    <TableCell>{directionId}</TableCell>
                    <TableCell>{weight}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveSpawnDirection(directionId)} data-testid={`direction-remove-${directionId}`}>{t('configTab.directions.remove')}</Button>
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

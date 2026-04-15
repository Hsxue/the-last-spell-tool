import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import type { FogDensityName } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FOG_DENSITY_INDICES: Array<{ index: number; name: FogDensityName }> = [
  { index: 0, name: 'VeryThin' },
  { index: 1, name: 'Thin' },
  { index: 2, name: 'Average' },
  { index: 3, name: 'Dense' },
  { index: 4, name: 'VeryDense' },
];

function getFogDensityLabel(name: FogDensityName, t: (key: string) => string): string {
  return t(`configTab.fog.fogDensity.${name}`);
}

export const FogConfigTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig, setFogDensity, setIncreaseEveryXDays, setInitialDensityIndex, setDayException, removeDayException } = useConfigStore();

  const fogConfig = gameConfig.fogConfig;
  const [newExceptionDay, setNewExceptionDay] = useState<string>('');
  const [newExceptionDensity, setNewExceptionDensity] = useState<FogDensityName>('Average');

  const handleIncreaseEveryXDaysChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) setIncreaseEveryXDays(numValue);
  };

  const handleInitialDensityIndexChange = (value: string) => { setInitialDensityIndex(parseInt(value, 10)); };

  const handleFogDensityChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const densityName = fogConfig?.fogDensities?.[index]?.[0];
      if (densityName) setFogDensity(index, densityName, numValue);
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

  const handleRemoveException = (day: number) => { removeDayException(day); };

  return (
    <Card>
      <CardHeader><CardTitle>{t('configTab.fog.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="increaseEveryXDays-input">{t('configTab.fog.increaseEvery')}</Label>
          <Input id="increaseEveryXDays-input" type="number" min={1} value={fogConfig?.increaseEveryXDays ?? 1} onChange={(e) => handleIncreaseEveryXDaysChange(e.target.value)} data-testid="increaseEveryXDays-input" placeholder={t('configTab.fog.increaseEveryPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.fog.increaseEveryDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="initialDensityIndex-select">{t('configTab.fog.initialDensity')}</Label>
          <Select value={(fogConfig?.initialDensityIndex ?? 0).toString()} onValueChange={handleInitialDensityIndexChange}>
            <SelectTrigger id="initialDensityIndex-select" data-testid="initialDensityIndex-select" className="w-full">
              <SelectValue placeholder={t('configTab.fog.initialDensityPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {FOG_DENSITY_INDICES.map(({ index, name }) => (
                <SelectItem key={index} value={index.toString()}>
                  {t('configTab.fog.densityLabel', { index })} {getFogDensityLabel(name, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('configTab.fog.initialDensityDesc')}</p>
        </div>
        <div className="space-y-3">
          <Label>{t('configTab.fog.densityList')}</Label>
          <div className="space-y-2">
            {fogConfig?.fogDensities?.map(([name, value], index) => (
              <div key={name} className="flex items-center gap-3" data-testid={`fog-density-row-${index}`}>
                <div className="w-32 text-sm text-muted-foreground">
                  {t('configTab.fog.densityLabel', { index })} {getFogDensityLabel(name, t)}
                </div>
                <Input type="number" value={value} onChange={(e) => handleFogDensityChange(index, e.target.value)} data-testid={`fog-density-value-${index}`} className="w-32" placeholder={t('configTab.fog.densityValuePlaceholder')} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t('configTab.fog.densityDesc')}</p>
        </div>
        <div className="space-y-3">
          <Label>{t('configTab.fog.dayExceptions')}</Label>
          <div className="flex items-end gap-3">
            <div className="space-y-2 flex-1">
              <Label htmlFor="exceptionDay-input">{t('configTab.fog.exceptionDay')}</Label>
              <Input id="exceptionDay-input" type="number" min={1} value={newExceptionDay} onChange={(e) => setNewExceptionDay(e.target.value)} data-testid="exceptionDay-input" placeholder={t('configTab.fog.exceptionDayPlaceholder')} />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="exceptionDensity-select">{t('configTab.fog.exceptionDensity')}</Label>
              <Select value={newExceptionDensity} onValueChange={(value) => setNewExceptionDensity(value as FogDensityName)}>
                <SelectTrigger id="exceptionDensity-select" data-testid="exceptionDensity-select" className="w-full">
                  <SelectValue placeholder={t('configTab.fog.exceptionDensityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {FOG_DENSITY_INDICES.map(({ index, name }) => (
                    <SelectItem key={name} value={name}>{getFogDensityLabel(name, t)} ({t('configTab.fog.densityLabel', { index })})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddException} data-testid="addException-button" className="mb-0.5">{t('configTab.fog.addException')}</Button>
          </div>
          <div className="space-y-2">
            {fogConfig?.dayExceptions?.size === 0 ? (
              <p className="text-sm text-muted-foreground">{t('configTab.fog.noExceptions')}</p>
            ) : (
              Array.from(fogConfig?.dayExceptions?.entries() ?? []).map(([day, densityName]) => (
                <div key={day} className="flex items-center justify-between p-2 border rounded-md" data-testid={`day-exception-row-${day}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{t('configTab.fog.exceptionDayLabel', { day })}</span>
                    <span className="text-muted-foreground">&#8594;</span>
                    <span>{getFogDensityLabel(densityName, t)} ({t('configTab.fog.densityLabel', { index: FOG_DENSITY_INDICES.findIndex(d => d.name === densityName) })})</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveException(day)} data-testid={`removeException-button-${day}`}>{t('configTab.fog.delete')}</Button>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t('configTab.fog.exceptionsDesc')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FogConfigTab;

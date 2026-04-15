import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const CorruptionConfigTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig: { corruptionConfig }, setCorruption, removeCorruption } = useConfigStore();

  const [newNight, setNewNight] = useState<number>(1);
  const [newValue, setNewValue] = useState<number>(0);

  const handleAddEntry = () => {
    if (newNight > 0 && newValue >= 0) {
      setCorruption(newNight, newValue);
      setNewNight(Math.max(1, Math.floor(Math.random() * 20)));
      setNewValue(0);
    }
  };

  const handleRemoveEntry = (night: number) => { removeCorruption(night); };

  const corruptionEntries = Array.from(corruptionConfig?.corruptionByNight?.entries() ?? []).sort(
    ([nightA], [nightB]) => nightA - nightB
  );

  return (
    <Card>
      <CardHeader><CardTitle>{t('configTab.corruption.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 p-4 bg-muted rounded-md">
          <div>
            <h3 className="font-medium">{t('configTab.corruption.addNight')}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t('configTab.corruption.addNightDesc')}</p>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="night-input">{t('configTab.corruption.night')}</Label>
              <Input id="night-input" type="number" min="1" value={newNight} onChange={(e) => setNewNight(Math.max(1, parseInt(e.target.value) || 1))} data-testid="corruption-night-input" placeholder={t('configTab.corruption.nightPlaceholder')} />
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="corruption-value-input">{t('configTab.corruption.corruptionValue')}</Label>
              <Input id="corruption-value-input" type="number" min="0" value={newValue} onChange={(e) => setNewValue(Math.max(0, parseInt(e.target.value) || 0))} data-testid="corruption-value-input" placeholder={t('configTab.corruption.corruptionValuePlaceholder')} />
            </div>
            <Button onClick={handleAddEntry} variant="outline" className="mb-1 h-10 px-4" data-testid="corruption-add-btn">{t('configTab.corruption.add')}</Button>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-medium">{t('configTab.corruption.progressTitle')}</h3>
          {corruptionEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-200 px-4 py-2 text-left">{t('configTab.corruption.tableNight')}</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">{t('configTab.corruption.tableCorruptionValue')}</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">{t('configTab.corruption.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {corruptionEntries.map(([night, value]) => (
                    <tr key={night} className="hover:bg-muted/50">
                      <td className="border border-gray-200 px-4 py-2">{night}</td>
                      <td className="border border-gray-200 px-4 py-2">{value}</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        <Button onClick={() => handleRemoveEntry(night)} variant="destructive" size="sm" data-testid={`corruption-remove-btn-${night}`}>{t('configTab.corruption.remove')}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-32 border-2 border-dashed border-gray-300 rounded-md bg-muted">
              <p className="text-muted-foreground">{t('configTab.corruption.noData')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CorruptionConfigTab;

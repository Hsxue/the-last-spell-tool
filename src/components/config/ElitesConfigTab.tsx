import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const ElitesConfigTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig, setElitesPerDay, removeElitesPerDay } = useConfigStore();
  const spawnConfig = gameConfig.spawnConfig;

  const [selectedNight, setSelectedNight] = useState<string>('1');
  const [selectedTier, setSelectedTier] = useState<string>('1');
  const [newCount, setNewCount] = useState<string>('');

  const elitesPerDayArray = Array.from(spawnConfig?.elitesPerDay?.entries() ?? []).sort((a, b) => a[0] - b[0]);
  const nightOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleAddElite = () => {
    const night = parseInt(selectedNight);
    const tier = parseInt(selectedTier);
    const count = parseInt(newCount);
    if (!isNaN(night) && !isNaN(tier) && !isNaN(count) && count > 0) {
      setElitesPerDay(night, tier, count);
      setNewCount('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => { if (e.key === 'Enter') handler(); };

  return (
    <Card>
      <CardHeader><CardTitle>{t('configTab.elites.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">{t('configTab.elites.elitesPerDay')}</Label>
              <p className="text-xs text-muted-foreground mt-1">{t('configTab.elites.elitesPerDayDesc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="elite-night-select" className="text-sm">{t('configTab.elites.selectNight')}</Label>
              <Select value={selectedNight} onValueChange={setSelectedNight}>
                <SelectTrigger id="elite-night-select" className="w-[120px]"><SelectValue placeholder={t('configTab.elites.night', { night: selectedNight })} /></SelectTrigger>
                <SelectContent>
                  {nightOptions.map((night) => (
                    <SelectItem key={night} value={night.toString()}>{t('configTab.elites.night', { night })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="elite-tier-select" className="text-xs">{t('configTab.elites.tableTier')}</Label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger id="elite-tier-select"><SelectValue placeholder={t('configTab.elites.tierSelectPlaceholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('configTab.elites.tier1')}</SelectItem>
                  <SelectItem value="2">{t('configTab.elites.tier2')}</SelectItem>
                  <SelectItem value="3">{t('configTab.elites.tier3')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="elite-count-input" className="text-xs">{t('configTab.elites.count')}</Label>
              <Input id="elite-count-input" type="number" min={1} value={newCount} onChange={(e) => setNewCount(e.target.value)} onKeyPress={(e) => handleKeyPress(e, handleAddElite)} data-testid="elite-count-input" placeholder={t('configTab.elites.countPlaceholder')} />
            </div>
            <Button onClick={handleAddElite} data-testid="elite-add-button" type="button">{t('configTab.elites.add')}</Button>
          </div>
          <Table data-testid="elites-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t('configTab.elites.tableTier')}</TableHead>
                <TableHead>{t('configTab.elites.tableCount')}</TableHead>
                <TableHead className="w-20">{t('configTab.elites.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const nightElites = spawnConfig?.elitesPerDay?.get(parseInt(selectedNight)) || [];
                const sortedElites = [...nightElites].sort((a, b) => a[0] - b[0]);
                if (sortedElites.length === 0) {
                  return (<TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('configTab.elites.noData')}</TableCell></TableRow>);
                }
                return sortedElites.map(([tier, count]) => (
                  <TableRow key={tier} data-testid={`elite-row-${tier}`}>
                    <TableCell>Tier {tier}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => removeElitesPerDay(parseInt(selectedNight), tier)} data-testid={`elite-remove-${tier}`}>{t('configTab.elites.remove')}</Button>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('configTab.elites.summaryTitle')}</Label>
          <div className="border rounded-md p-3 space-y-2" data-testid="elites-summary-list">
            {elitesPerDayArray.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">{t('configTab.elites.summaryNoData')}</p>
            ) : (
              elitesPerDayArray.map(([night, elites]) => {
                const sortedElites = [...elites].sort((a, b) => a[0] - b[0]);
                return (
                  <div key={night} className="flex justify-between items-center bg-muted px-3 py-2 rounded" data-testid={`elites-summary-night-${night}`}>
                    <span className="font-semibold">{t('configTab.elites.summaryNightLabel', { night })}</span>
                    <span className="text-sm text-muted-foreground">{sortedElites.map(([tier, count]) => `Tier ${tier}: ${count}`).join(' | ')}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElitesConfigTab;

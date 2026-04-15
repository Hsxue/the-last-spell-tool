import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import { CITY_TEMPLATES } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BasicConfigTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig, setMapId, setVictoryDays, setDifficulty, setEnemiesOffset, setMaxGlyphPoints, setFogId } = useConfigStore();

  const handleTemplateChange = (templateName: string) => {
    const template = CITY_TEMPLATES[templateName];
    if (template) {
      setMapId(template.name);
      setVictoryDays(template.victoryDays);
      setDifficulty(template.difficulty.toString());
      setMaxGlyphPoints(template.maxGlyphPoints);
      setFogId(template.name);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t('configTab.basic.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="template-select">{t('configTab.basic.template')}</Label>
          <Select onValueChange={handleTemplateChange} defaultValue="">
            <SelectTrigger id="template-select" data-testid="template-select" className="w-full">
              <SelectValue placeholder={t('configTab.basic.templatePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CITY_TEMPLATES).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  {t('configTab.basic.templateItem', { name: template.name, days: template.victoryDays, difficulty: template.difficulty })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('configTab.basic.templateDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mapId-input">{t('configTab.basic.mapId')}</Label>
          <Input id="mapId-input" type="text" value={gameConfig.mapId} onChange={(e) => setMapId(e.target.value)} data-testid="mapId-input" placeholder={t('configTab.basic.mapIdPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.basic.mapIdDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fogId-input">{t('configTab.basic.fogId')}</Label>
          <Input id="fogId-input" type="text" value={gameConfig.fogId} readOnly data-testid="fogId-input" className="bg-muted cursor-not-allowed" placeholder={t('configTab.basic.fogIdPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.basic.fogIdDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="victoryDays-input">{t('configTab.basic.victoryDays')}</Label>
          <Input id="victoryDays-input" type="number" min={1} value={gameConfig.victoryDays} onChange={(e) => setVictoryDays(parseInt(e.target.value) || 0)} data-testid="victoryDays-input" placeholder={t('configTab.basic.victoryDaysPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.basic.victoryDaysDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty-select">{t('configTab.basic.difficulty')}</Label>
          <Select value={gameConfig.difficulty} onValueChange={(value) => setDifficulty(value)}>
            <SelectTrigger id="difficulty-select" data-testid="difficulty-select" className="w-full">
              <SelectValue placeholder={t('configTab.basic.difficultyPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t('configTab.basic.difficulty1')}</SelectItem>
              <SelectItem value="2">{t('configTab.basic.difficulty2')}</SelectItem>
              <SelectItem value="3">{t('configTab.basic.difficulty3')}</SelectItem>
              <SelectItem value="4">{t('configTab.basic.difficulty4')}</SelectItem>
              <SelectItem value="5">{t('configTab.basic.difficulty5')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('configTab.basic.difficultyDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="enemiesOffset-input">{t('configTab.basic.enemiesOffset')}</Label>
          <Input id="enemiesOffset-input" type="number" value={gameConfig.enemiesOffset} onChange={(e) => setEnemiesOffset(parseInt(e.target.value) || 0)} data-testid="enemiesOffset-input" placeholder={t('configTab.basic.enemiesOffsetPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.basic.enemiesOffsetDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxGlyphPoints-input">{t('configTab.basic.maxGlyphPoints')}</Label>
          <Input id="maxGlyphPoints-input" type="number" min={0} value={gameConfig.maxGlyphPoints} onChange={(e) => setMaxGlyphPoints(parseInt(e.target.value) || 0)} data-testid="maxGlyphPoints-input" placeholder={t('configTab.basic.maxGlyphPointsPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.basic.maxGlyphPointsDesc')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicConfigTab;

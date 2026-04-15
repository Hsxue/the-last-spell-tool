import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ResourcesConfigTab: React.FC = () => {
  const { t } = useTranslation('common');
  const { gameConfig, setGold, setMaterials, setDamnedSouls } = useConfigStore();

  const resourceConfig = gameConfig?.resourceConfig ?? { gold: 0, materials: 0, damnedSouls: 0 };

  return (
    <Card>
      <CardHeader><CardTitle>{t('configTab.resources.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="gold-input">{t('configTab.resources.gold')}</Label>
          <Input id="gold-input" type="number" min={0} value={resourceConfig.gold} onChange={(e) => setGold(parseInt(e.target.value) || 0)} data-testid="gold-input" placeholder={t('configTab.resources.goldPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.resources.goldDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="materials-input">{t('configTab.resources.materials')}</Label>
          <Input id="materials-input" type="number" min={0} value={resourceConfig.materials} onChange={(e) => setMaterials(parseInt(e.target.value) || 0)} data-testid="materials-input" placeholder={t('configTab.resources.materialsPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.resources.materialsDesc')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="damnedSouls-input">{t('configTab.resources.damnedSouls')}</Label>
          <Input id="damnedSouls-input" type="number" min={0} value={resourceConfig.damnedSouls ?? 0} onChange={(e) => setDamnedSouls(parseInt(e.target.value) || 0)} data-testid="damnedSouls-input" placeholder={t('configTab.resources.damnedSoulsPlaceholder')} />
          <p className="text-xs text-muted-foreground">{t('configTab.resources.damnedSoulsDesc')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesConfigTab;

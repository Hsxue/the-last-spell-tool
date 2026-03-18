import React from 'react';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ResourcesConfigTab: React.FC = () => {
  const {
    gameConfig: { resourceConfig },
    setGold,
    setMaterials,
    setDamnedSouls,
  } = useConfigStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>资源 (Resources)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initial Gold */}
        <div className="space-y-2">
          <Label htmlFor="gold-input">初始金币 (Gold)</Label>
          <Input
            id="gold-input"
            type="number"
            min={0}
            value={resourceConfig.gold}
            onChange={(e) => setGold(parseInt(e.target.value) || 0)}
            data-testid="gold-input"
            placeholder="输入初始金币数量..."
          />
        </div>

        {/* Initial Materials */}
        <div className="space-y-2">
          <Label htmlFor="materials-input">初始材料 (Materials)</Label>
          <Input
            id="materials-input"
            type="number"
            min={0}
            value={resourceConfig.materials}
            onChange={(e) => setMaterials(parseInt(e.target.value) || 0)}
            data-testid="materials-input"
            placeholder="输入初始材料数量..."
          />
        </div>

        {/* Initial Damned Souls */}
        <div className="space-y-2">
          <Label htmlFor="damnedSouls-input">初始诅咒灵魂 (Damned Souls)</Label>
          <Input
            id="damnedSouls-input"
            type="number"
            min={0}
            value={resourceConfig.damnedSouls ?? 0}
            onChange={(e) => setDamnedSouls(parseInt(e.target.value) || 0)}
            data-testid="damnedSouls-input"
            placeholder="输入初始诅咒灵魂数量..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesConfigTab;
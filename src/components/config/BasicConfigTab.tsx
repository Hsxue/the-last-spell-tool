import React from 'react';
import { useConfigStore } from '@/store/configStore';
import { CITY_TEMPLATES } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const BasicConfigTab: React.FC = () => {
  const {
    gameConfig,
    setMapId,
    setVictoryDays,
    setDifficulty,
    setEnemiesOffset,
    setMaxGlyphPoints,
    setFogId,
  } = useConfigStore();

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
      <CardHeader>
        <CardTitle>基础配置 (Basic Configuration)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selector */}
        <div className="space-y-2">
          <Label htmlFor="template-select">预设模板 (Template)</Label>
          <Select
            onValueChange={handleTemplateChange}
            defaultValue=""
          >
            <SelectTrigger
              id="template-select"
              data-testid="template-select"
              className="w-full"
            >
              <SelectValue placeholder="选择一个预设模板..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CITY_TEMPLATES).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  {template.name} - {template.victoryDays}天 / 难度{template.difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Map ID */}
        <div className="space-y-2">
          <Label htmlFor="mapId-input">地图 ID (Map ID)</Label>
          <Input
            id="mapId-input"
            type="text"
            value={gameConfig.mapId}
            onChange={(e) => setMapId(e.target.value)}
            data-testid="mapId-input"
            placeholder="输入地图 ID..."
          />
        </div>

        {/* Fog ID (Read-only, same as mapId) */}
        <div className="space-y-2">
          <Label htmlFor="fogId-input">迷雾 ID (Fog ID)</Label>
          <Input
            id="fogId-input"
            type="text"
            value={gameConfig.fogId}
            readOnly
            data-testid="fogId-input"
            className="bg-muted cursor-not-allowed"
            placeholder="与地图 ID 相同"
          />
          <p className="text-xs text-muted-foreground">
            迷雾 ID 与地图 ID 保持一致
          </p>
        </div>

        {/* Victory Days */}
        <div className="space-y-2">
          <Label htmlFor="victoryDays-input">胜利天数 (Victory Days)</Label>
          <Input
            id="victoryDays-input"
            type="number"
            min={1}
            value={gameConfig.victoryDays}
            onChange={(e) => setVictoryDays(parseInt(e.target.value) || 0)}
            data-testid="victoryDays-input"
            placeholder="输入胜利所需天数..."
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="difficulty-select">难度 (Difficulty)</Label>
          <Select
            value={gameConfig.difficulty}
            onValueChange={(value) => setDifficulty(value)}
          >
            <SelectTrigger
              id="difficulty-select"
              data-testid="difficulty-select"
              className="w-full"
            >
              <SelectValue placeholder="选择难度等级..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">难度 1 (最简单)</SelectItem>
              <SelectItem value="2">难度 2 (简单)</SelectItem>
              <SelectItem value="3">难度 3 (普通)</SelectItem>
              <SelectItem value="4">难度 4 (困难)</SelectItem>
              <SelectItem value="5">难度 5 (最难)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Enemies Offset */}
        <div className="space-y-2">
          <Label htmlFor="enemiesOffset-input">敌人偏移 (Enemies Offset)</Label>
          <Input
            id="enemiesOffset-input"
            type="number"
            value={gameConfig.enemiesOffset}
            onChange={(e) => setEnemiesOffset(parseInt(e.target.value) || 0)}
            data-testid="enemiesOffset-input"
            placeholder="输入敌人偏移值..."
          />
        </div>

        {/* Max Glyph Points */}
        <div className="space-y-2">
          <Label htmlFor="maxGlyphPoints-input">最大符文点 (Max Glyph Points)</Label>
          <Input
            id="maxGlyphPoints-input"
            type="number"
            min={0}
            value={gameConfig.maxGlyphPoints}
            onChange={(e) => setMaxGlyphPoints(parseInt(e.target.value) || 0)}
            data-testid="maxGlyphPoints-input"
            placeholder="输入最大符文点数..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicConfigTab;

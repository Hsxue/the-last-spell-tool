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
          <p className="text-xs text-muted-foreground">
            快速加载预设城市配置，将同时覆盖地图 ID、胜利天数、难度和迷雾 ID
          </p>
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
          <p className="text-xs text-muted-foreground">
            地图的唯一标识符，用于游戏内引用和存档。命名规范：大写字母开头 + 下划线分隔（如 LakeBurg）
          </p>
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
          <p className="text-xs text-muted-foreground">
            玩家需要在夜晚存活的天数。达到此数值后显示胜利画面
          </p>
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
          <p className="text-xs text-muted-foreground">
            影响敌人数量、精英怪比例和生成频率。难度 1 生成倍率约 0.5x，难度 5 约 2.0x
          </p>
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
          <p className="text-xs text-muted-foreground">
            在每波生成公式中增加的额外敌人数量。公式：基础数量 + (夜晚数 × 倍率 + 偏移值)
          </p>
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
          <p className="text-xs text-muted-foreground">
            城市可放置的符文建筑点数上限。每种符文建筑消耗不同点数，超过上限无法再建造
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicConfigTab;

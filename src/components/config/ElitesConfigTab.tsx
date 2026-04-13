import React, { useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const ElitesConfigTab: React.FC = () => {
  const { gameConfig, setElitesPerDay, removeElitesPerDay } = useConfigStore();

  const spawnConfig = gameConfig.spawnConfig;

  // State for adding new entries
  const [selectedNight, setSelectedNight] = useState<string>('1');
  const [selectedTier, setSelectedTier] = useState<string>('1');
  const [newCount, setNewCount] = useState<string>('');

  // Convert Map to sorted array for rendering
  const elitesPerDayArray = Array.from(spawnConfig?.elitesPerDay?.entries() ?? []).sort(
    (a, b) => a[0] - b[0]
  );

  // Generate night options (1-20)
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

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>精英配置 (Elite Configuration)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Night-based Elite Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">
                每晚精英配置 (Elites Per Day)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                精英怪是强化版敌人，拥有更多生命值和属性。Tier 越高精英怪越强，数量越多难度越大
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="elite-night-select" className="text-sm">
                选择夜晚：
              </Label>
              <Select value={selectedNight} onValueChange={setSelectedNight}>
                <SelectTrigger id="elite-night-select" className="w-[120px]">
                  <SelectValue placeholder="选择夜晚" />
                </SelectTrigger>
                <SelectContent>
                  {nightOptions.map((night) => (
                    <SelectItem key={night} value={night.toString()}>
                      第 {night} 夜
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Elite Form */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="elite-tier-select" className="text-xs">
                精英等级 (Tier)
              </Label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger id="elite-tier-select">
                  <SelectValue placeholder="选择等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1 — 低级精英（少量额外属性）</SelectItem>
                  <SelectItem value="2">Tier 2 — 中级精英（明显强化）</SelectItem>
                  <SelectItem value="3">Tier 3 — 高级精英（大幅强化 + 额外词条）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="elite-count-input" className="text-xs">
                数量 (Count)
              </Label>
              <Input
                id="elite-count-input"
                type="number"
                min={1}
                value={newCount}
                onChange={(e) => setNewCount(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddElite)}
                data-testid="elite-count-input"
                placeholder="数量"
              />
            </div>
            <Button onClick={handleAddElite} data-testid="elite-add-button" type="button">
              添加
            </Button>
          </div>

          {/* Elites Table */}
          <Table data-testid="elites-table">
            <TableHeader>
              <TableRow>
                <TableHead>等级 (Tier)</TableHead>
                <TableHead>数量 (Count)</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const nightElites = spawnConfig?.elitesPerDay?.get(parseInt(selectedNight)) || [];
                const sortedElites = [...nightElites].sort((a, b) => a[0] - b[0]);

                if (sortedElites.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        暂无数据，请添加
                      </TableCell>
                    </TableRow>
                  );
                }

                return sortedElites.map(([tier, count]) => (
                  <TableRow key={tier} data-testid={`elite-row-${tier}`}>
                    <TableCell>Tier {tier}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeElitesPerDay(parseInt(selectedNight), tier)}
                        data-testid={`elite-remove-${tier}`}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </div>

        {/* Summary Section - Show all nights with elites */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            所有夜晚精英概览 (All Nights Summary)
          </Label>
          <div className="border rounded-md p-3 space-y-2" data-testid="elites-summary-list">
            {elitesPerDayArray.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                暂无任何夜晚的精英配置
              </p>
            ) : (
              elitesPerDayArray.map(([night, elites]) => {
                const sortedElites = [...elites].sort((a, b) => a[0] - b[0]);
                return (
                  <div
                    key={night}
                    className="flex justify-between items-center bg-muted px-3 py-2 rounded"
                    data-testid={`elites-summary-night-${night}`}
                  >
                    <span className="font-semibold">第 {night} 夜:</span>
                    <span className="text-sm text-muted-foreground">
                      {sortedElites.map(([tier, count]) => `Tier ${tier}: ${count}`).join(' | ')}
                    </span>
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

import React, { useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const CorruptionConfigTab: React.FC = () => {
  const {
    gameConfig: { corruptionConfig },
    setCorruption,
    removeCorruption,
  } = useConfigStore();

  // State for new entry inputs
  const [newNight, setNewNight] = useState<number>(1);
  const [newValue, setNewValue] = useState<number>(0);

  const handleAddEntry = () => {
    if (newNight > 0 && newValue >= 0) {
      setCorruption(newNight, newValue);
      // Reset input values
      setNewNight(Math.max(1, Math.floor(Math.random() * 20))); // Default to random night > 0
      setNewValue(0);
    }
  };

  const handleRemoveEntry = (night: number) => {
    removeCorruption(night);
  };

  // Convert Map to array for easier iteration
  const corruptionEntries = Array.from(corruptionConfig?.corruptionByNight?.entries() ?? []).sort(
    ([nightA], [nightB]) => nightA - nightB
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>腐化配置 (Corruption Configuration)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Entry Form */}
        <div className="space-y-4 p-4 bg-muted rounded-md">
          <div>
            <h3 className="font-medium">添加新夜晚 (Add New Night)</h3>
            <p className="text-xs text-muted-foreground mt-1">
              腐化系统在特定夜晚达到指定腐化值时触发环境变化（如更浓的迷雾、更强的敌人）。
              腐化值通常在 0-100 范围内，值越高腐化效果越强
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="night-input">夜晚 (Night)</Label>
              <Input
                id="night-input"
                type="number"
                min="1"
                value={newNight}
                onChange={(e) => setNewNight(Math.max(1, parseInt(e.target.value) || 1))}
                data-testid="corruption-night-input"
                placeholder="输入夜晚编号..."
              />
            </div>
            
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="corruption-value-input">腐化值 (Corruption Value)</Label>
              <Input
                id="corruption-value-input"
                type="number"
                min="0"
                value={newValue}
                onChange={(e) => setNewValue(Math.max(0, parseInt(e.target.value) || 0))}
                data-testid="corruption-value-input"
                placeholder="输入腐化值..."
              />
            </div>
            
            <Button
              onClick={handleAddEntry}
              variant="outline"
              className="mb-1 h-10 px-4"
              data-testid="corruption-add-btn"
            >
              添加 (Add)
            </Button>
          </div>
        </div>

        {/* Corruption Entries Table */}
        <div className="space-y-4">
          <h3 className="font-medium">腐化进度表 (Corruption Progression)</h3>
          
          {corruptionEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-200 px-4 py-2 text-left">夜晚 (Night)</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">腐化值 (Corruption Value)</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {corruptionEntries.map(([night, value]) => (
                    <tr key={night} className="hover:bg-muted/50">
                      <td className="border border-gray-200 px-4 py-2">{night}</td>
                      <td className="border border-gray-200 px-4 py-2">{value}</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        <Button
                          onClick={() => handleRemoveEntry(night)}
                          variant="destructive"
                          size="sm"
                          data-testid={`corruption-remove-btn-${night}`}
                        >
                          移除 (Remove)
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-32 border-2 border-dashed border-gray-300 rounded-md bg-muted">
              <p className="text-muted-foreground">未配置任何夜晚的腐化值 (No corruption values configured)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CorruptionConfigTab;
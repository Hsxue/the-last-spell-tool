export function ConfigTab() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">游戏配置</h2>
      
      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="text-sm font-semibold mb-2">武器类别</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>MeleeWeapon</span>
              <span className="text-gray-400">近战武器</span>
            </div>
            <div className="flex justify-between">
              <span>RangeWeapon</span>
              <span className="text-gray-400">远程武器</span>
            </div>
            <div className="flex justify-between">
              <span>MagicWeapon</span>
              <span className="text-gray-400">魔法武器</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">类别由游戏固定，不可修改</p>
        </div>

        <div className="border rounded p-4">
          <h3 className="text-sm font-semibold mb-2">技能类别</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>MeleeWeapons - 近战武器技能</div>
            <div>RangeWeapons - 远程武器技能</div>
            <div>MagicWeapons - 魔法武器技能</div>
            <div>General - 通用技能</div>
          </div>
        </div>

        <div className="border rounded p-4">
          <h3 className="text-sm font-semibold mb-2">统计</h3>
          <p className="text-sm text-gray-600">配置界面用于查看和管理游戏数据结构</p>
        </div>
      </div>
    </div>
  );
}
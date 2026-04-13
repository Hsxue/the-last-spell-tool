/**
 * Tutorial Panel Component
 * Shows instructions on how to use the localization editor and create language mods.
 */

import { ScrollArea } from '../ui/scroll-area';
import {
  FolderTree,
  Globe,
  Lightbulb,
  Package,
} from 'lucide-react';

const TUTORIAL_SECTIONS = [
  {
    id: 'reference',
    icon: FolderTree,
    title: '📂 文件位置速查',
    content: (
      <div className="space-y-2">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="border-b border-muted text-foreground">
              <th className="text-left py-1 font-medium">类型</th>
              <th className="text-left py-1 font-medium">存放路径</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-muted">
              <td className="py-1 font-mono text-foreground">地图</td>
              <td className="py-1"><code>plugins/LastSpellMapMod/Maps/</code></td>
            </tr>
            <tr className="border-b border-muted">
              <td className="py-1 font-mono text-foreground">技能</td>
              <td className="py-1"><code>plugins/LastSpellMapMod/Skills/</code></td>
            </tr>
            <tr className="border-b border-muted">
              <td className="py-1 font-mono text-foreground">武器</td>
              <td className="py-1"><code>plugins/LastSpellMapMod/Items/</code></td>
            </tr>
            <tr className="border-b border-muted">
              <td className="py-1 font-mono text-foreground">翻译</td>
              <td className="py-1"><code>任一插件/Localization/</code></td>
            </tr>
          </tbody>
        </table>
        <p className="text-[10px] text-muted-foreground">
          所有路径均相对于 <code className="bg-muted px-0.5 rounded">BepInEx\</code> 文件夹。
        </p>
      </div>
    ),
  },
  {
    id: 'install',
    icon: Package,
    title: '📦 安装步骤（重要）',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>请按照以下步骤将翻译文件放入游戏：</p>
        
        <h4 className="text-xs font-semibold text-foreground mt-2">1. 找到游戏目录</h4>
        <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
          <li>打开 <strong>Steam</strong>，在库中找到 <em>The Last Spell</em>。</li>
          <li>右键点击游戏 → 管理 → <strong>浏览本地文件</strong>。</li>
          <li>这将打开游戏安装位置（例如：</li>
          <code className="block px-1.5 py-1 rounded bg-muted text-[10px] mt-1 break-all">
            D:\SteamLibrary\steamapps\common\The Last Spell
          </code>
        </ul>

        <h4 className="text-xs font-semibold text-foreground mt-2">2. 找到插件文件夹</h4>
        <p className="text-xs">翻译文件可以放在以下任意位置：</p>
        <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
          <li><code className="px-1 py-0.5 rounded bg-muted text-[10px]">BepInEx\plugins\任意Mod文件夹\</code>（本地手动安装的 Mod）</li>
          <li><code className="px-1 py-0.5 rounded bg-muted text-[10px]">steamapps\workshop\content\1597230\&lt;ModID&gt;\</code>（Steam 创意工坊 Mod）</li>
        </ul>

        <h4 className="text-xs font-semibold text-foreground mt-2">3. 放入翻译文件</h4>
        <p className="text-xs">在选中的 Mod 文件夹下，创建名为 <strong>Localization</strong> 的文件夹。</p>
        <p className="text-xs">将你从本工具导出的 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">.txt</code> 文件移动进去。</p>
        <p className="text-xs mt-1 text-[10px] text-muted-foreground">* 对于 Steam 创意工坊 Mod，你需要找到该 Mod 在本地的工作目录（可通过 Steam 创意工坊页面 → 属性 → 本地文件获取路径）。</p>
        
        <pre className="whitespace-pre text-[11px] bg-muted p-3 rounded-md overflow-x-auto leading-snug mt-2 text-left font-mono">
{`本地 BepInEx:
游戏目录/
├── BepInEx/
│   └── plugins/
│       └── 你的Mod文件夹/   ← 创建 Localization 文件夹
│           └── Italiano.txt ← 放入翻译文件

Steam 创意工坊:
游戏目录/
├── steamapps/
│   └── workshop/
│       └── content/
│           └── 1597230/     ← The Last Spell AppID
│               └── <某ModID>/ ← 已订阅的创意工坊Mod
│                   └── Localization/
│                       └── Italiano.txt`}
        </pre>

        <div className="mt-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-[10px] text-yellow-600">
            <strong>注意：</strong>文件夹名称大小写必须完全一致（Localization）。
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'overview',
    icon: Globe,
    title: '💡 本地化简介',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          The Last Spell 使用 CSV 格式的文本文件管理多语言翻译。游戏内置 11
          种语言（英文、法文、简体中文、繁体中文、日文等）。
        </p>
        <p>
          本编辑器帮你创建自定义本地化模组，可以为游戏添加新语言（如意大利语），或修改现有翻译。
          <strong>无需编译代码</strong>，只需导出 `.txt` 文件并放入指定目录，LastSpellMapMod 会自动加载。
        </p>
      </div>
    ),
  },
  {
    id: 'tips',
    icon: Lightbulb,
    title: '📝 格式与技巧',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <h4 className="text-xs font-semibold text-foreground">文件命名规则</h4>
        <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
          <li>扩展名必须为 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">.txt</code>（CSV 格式）</li>
          <li>文件名即语言显示名称（如 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">Italiano.txt</code> → Italiano [CUSTOM]）</li>
        </ul>

        <h4 className="text-xs font-semibold text-foreground mt-2">CSV 格式</h4>
        <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
          <li>首列为空，第二列为 Key（见示例）</li>
          <li>以 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">#</code> 开头的行为注释，不会被加载</li>
          <li>支持 TextMeshPro 标签（如 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">&lt;b&gt;加粗&lt;/b&gt;</code>）</li>
        </ul>

        <h4 className="text-xs font-semibold text-foreground mt-2">更新翻译</h4>
        <p className="text-xs">
          修改 `.txt` 文件后，只需保存即可。如果游戏内未生效，尝试在地图上保存一次或切换菜单界面。
        </p>
      </div>
    ),
  },
];

export function TutorialPanel() {
  return (
    <div className="border rounded-md bg-card">
      <ScrollArea className="h-full">
        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            使用教程
          </h3>
          <div className="space-y-3">
            {TUTORIAL_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-xs font-medium">{section.title}</span>
                  </div>
                  <div className="pl-6 pr-2 pb-2 text-xs">
                    {section.content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

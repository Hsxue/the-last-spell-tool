/**
 * Tutorial Panel Component
 * Shows instructions on how to use the localization editor and create language mods.
 */

import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  FolderTree,
  Globe,
  Lightbulb,
  Package,
} from 'lucide-react';

const TUTORIAL_SECTIONS = [
  {
    id: 'overview',
    icon: Globe,
    title: '本地化模组简介',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          The Last Spell 使用 CSV 格式的文本文件管理多语言翻译。游戏内置 11
          种语言（英文、法文、简体中文、繁体中文、日文、俄文、乌克兰文、德文、西班牙文、葡萄牙文、韩文）。
        </p>
        <p>
          本编辑器帮你创建自定义本地化模组，可以为游戏添加新语言（如意大利语），或修改现有翻译。
          <strong>无需编译代码</strong>，只需导出 `.txt` 文件并放入指定目录，LastSpellMapMod 会自动加载。
        </p>
      </div>
    ),
  },
  {
    id: 'structure',
    icon: FolderTree,
    title: '文件存放位置',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>将导出的翻译文件放到 LastSpellMapMod 的 <code className="px-1 py-0.5 rounded bg-muted text-xs">Localization/</code> 目录下：</p>
        <pre className="whitespace-pre font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto leading-5">
{`The Last Spell/
└── BepInEx/
    └── plugins/
        └── LastSpellMapMod/
            ├── dll/...                  # 模组核心程序
            ├── maps/...                 # 地图文件
            └── Localization/            ← 你的翻译文件放这里
                ├── Italiano.txt         ← 导出的意大利语
                ├── Nederlands.txt       ← 导出的荷兰语
                └── 简体中文.txt         ← 导出的中文`}
        </pre>
        <p className="text-xs mt-1">
          <strong>注意：</strong>如果 <code className="px-1 py-0.5 rounded bg-muted text-xs">Localization/</code> 文件夹不存在，请手动创建。
        </p>
      </div>
    ),
  },
  {
    id: 'export',
    icon: Package,
    title: '从编辑器导出并安装',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <h4 className="text-xs font-semibold text-foreground">1. 点击"导出"按钮</h4>
        <p className="text-xs">
          在编辑器顶部点击 <strong>导出</strong>，输入语言名称（如 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">Italiano.txt</code>）。
          文件将自动下载。
        </p>

        <h4 className="text-xs font-semibold text-foreground mt-2">2. 放置文件</h4>
        <p className="text-xs">
          将下载好的 `.txt` 文件移动到游戏的 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">BepInEx/plugins/LastSpellMapMod/Localization/</code> 目录。
        </p>

        <h4 className="text-xs font-semibold text-foreground mt-2">3. 启动游戏</h4>
        <p className="text-xs">
          重启游戏，进入设置 → 语言选项，你添加的新语言应该会出现在列表中（后缀可能带有 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">[CUSTOM]</code>）。
        </p>
        
        <div className="mt-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
          <p className="text-[10px] text-green-600">
            <strong>提示：</strong>你可以放多个 `.txt` 文件，游戏会自动加载所有语言。无需重启游戏，只需重新加载地图或保存即可生效。
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'tips',
    icon: Lightbulb,
    title: '格式与技巧',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <h4 className="text-xs font-semibold text-foreground">文件命名规则</h4>
        <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
          <li>扩展名必须为 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">.txt</code>（CSV 格式）</li>
          <li>文件名即语言显示名称（如 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">Italiano.txt</code> → Italiano [CUSTOM]）</li>
        </ul>

        <h4 className="text-xs font-semibold text-foreground mt-2">CSV 格式</h4>
        <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
          <li>首列为空，第二列为 Key（如 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">,ItemName_Excalibur,Excalibur</code>）</li>
          <li>以 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">#</code> 开头的行为注释</li>
          <li>支持 TextMeshPro 标签（如 <code className="px-1 py-0.5 rounded bg-muted text-[10px]">&lt;b&gt;加粗&lt;/b&gt;</code>）</li>
        </ul>

        <h4 className="text-xs font-semibold text-foreground mt-2">更新翻译</h4>
        <p className="text-xs">
          修改 `.txt` 文件后，只需保存即可，无需重启编辑器。如果游戏内未生效，尝试在地图上保存一次或切换菜单界面。
        </p>
      </div>
    ),
  },
];

export function TutorialPanel() {
  const [expanded, setExpanded] = useState<string>('overview');

  return (
    <div className="border rounded-md bg-card">
      <ScrollArea className="h-48">
        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            使用教程
          </h3>
          <div className="space-y-2">
            {TUTORIAL_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isOpen = expanded === section.id;
              return (
                <Collapsible key={section.id} open={isOpen} onOpenChange={() => setExpanded(isOpen ? '' : section.id)}>
                  <CollapsibleTrigger
                    className="w-full justify-between text-left px-2 py-1.5 cursor-pointer text-muted-foreground hover:text-foreground bg-transparent border-none"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{section.title}</span>
                    </span>
                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 pr-2 pb-2 text-xs">
                    {section.content}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

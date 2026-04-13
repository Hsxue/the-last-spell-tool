/**
 * Tutorial Dialog for Localization Editor
 * Shows comprehensive instructions on mod file placement and translation creation.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Copy, Download, FileText, FolderTree, Globe, HelpCircle, Hammer, Eye, Package2, Scroll, Sword, Wrench } from 'lucide-react';

function ModFeaturesSection() {
  const features = [
    {
      category: "核心模组功能",
      icon: <Hammer className="h-4 w-4 text-primary" />,
      items: [
        { icon: <Scroll className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>自定义地图：</strong>支持从 Maps/ 文件夹加载 .TileMap 格式地图，含建筑数据分离加载。</>, },
        { icon: <Sword className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>自定义物品：</strong>从 Items/ 文件夹批量导入 XML 物品定义，自动注入游戏数据库。</>, },
        { icon: <Wrench className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>自定义技能：</strong>从 Skills/ 文件夹加载技能定义，支持 Contextual 检测。</>, },
      ],
    },
    {
      category: "调试面板（F9）",
      icon: <Eye className="h-4 w-4 text-primary" />,
      items: [
        { icon: <Copy className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>金币操控：</strong>实时查看当前金币，输入数量添加或快捷 +1000。</>, },
        { icon: <Sword className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>武器生成：</strong>通过 ID 查找武器，列出所有可用武器并点击获取。</>, },
        { icon: <FileText className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>操作日志：</strong>实时记录所有调试操作（带时间戳），最多 50 条，支持清空。</>, },
      ],
    },
    {
      category: "地图选择器",
      icon: <Package2 className="h-4 w-4 text-primary" />,
      items: [
        { icon: <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>地图浏览面板：</strong>在游戏外浮动显示已加载的自定义地图列表（名称/尺寸/难度），支持拖拽。</>, },
        { icon: <Package2 className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>一键加载：</strong>选择地图后点击 Play 按钮即可进入自定义地图游戏。</>, },
      ],
    },
    {
      category: "Steam 创意工坊集成",
      icon: <Globe className="h-4 w-4 text-primary" />,
      items: [
        { icon: <Download className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>自动发现 Mod：</strong>扫描 Steam 订阅的创意工坊 Mod + 本地 BepInEx/plugins 文件夹。</>, },
        { icon: <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />, text: <><strong>多路径翻译加载：</strong>自动加载所有已发现 Mod 目录下的 Localization/*.txt 翻译文件。</>, },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {features.map((cat, i) => (
        <div key={i} className="space-y-2">
          <h4 className="flex items-center gap-2 font-medium text-foreground">
            {cat.icon}
            {cat.category}
          </h4>
          <ul className="space-y-1.5">
            {cat.items.map((item, j) => (
              <li key={j} className="flex gap-2 items-start text-sm text-muted-foreground">
                <span className="mt-0.5 shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Tutorial Sections Data
// ============================================================================

function QuickReferenceTable() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        编辑器支持导出四种模组文件类型，以下为各文件的默认存放位置：
      </p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 font-medium text-foreground">类型</th>
            <th className="text-left py-2 font-medium text-foreground">存放路径</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          <tr className="border-b border-muted">
            <td className="py-2">
              <span className="flex items-center gap-2 font-mono text-foreground font-medium">
                🗺️ 地图
              </span>
            </td>
            <td className="py-2">
              <code className="px-1.5 py-0.5 rounded bg-muted text-xs block">
                BepInEx\plugins\LastSpellMapMod\Maps\
              </code>
            </td>
          </tr>
          <tr className="border-b border-muted">
            <td className="py-2">
              <span className="flex items-center gap-2 font-mono text-foreground font-medium">
                ⚔️ 技能
              </span>
            </td>
            <td className="py-2">
              <code className="px-1.5 py-0.5 rounded bg-muted text-xs block">
                BepInEx\plugins\LastSpellMapMod\Skills\
              </code>
            </td>
          </tr>
          <tr className="border-b border-muted">
            <td className="py-2">
              <span className="flex items-center gap-2 font-mono text-foreground font-medium">
                🗡️ 武器与物品
              </span>
            </td>
            <td className="py-2">
              <code className="px-1.5 py-0.5 rounded bg-muted text-xs block">
                BepInEx\plugins\LastSpellMapMod\Items\
              </code>
            </td>
          </tr>
          <tr>
            <td className="py-2">
              <span className="flex items-center gap-2 font-mono text-foreground font-medium">
                🌐 翻译
              </span>
            </td>
            <td className="py-2">
              <code className="px-1.5 py-0.5 rounded bg-muted text-xs block">
                BepInEx\plugins\&lt;任意Mod文件夹&gt;\Localization\
              </code>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground">
        所有路径均相对于游戏根目录下的 <code className="bg-muted px-0.5 rounded">BepInEx\</code> 文件夹。
      </p>
    </div>
  );
}

function TranslationGuide() {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground">本地化模组制作流程</h4>
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-foreground">步骤 1：导出翻译文件</h5>
        <p className="text-sm text-muted-foreground">
          在编辑器中修改完翻译后，点击工具栏的 <strong>"导出为 .txt"</strong> 按钮，会下载一个 CSV 格式的文本文件。
        </p>

        <h5 className="text-sm font-medium text-foreground pt-1">步骤 2：找到或创建 Localization 文件夹</h5>
        <p className="text-sm text-muted-foreground">
          在游戏的 <code className="px-1 py-0.5 rounded bg-muted text-xs">BepInEx\plugins\</code> 文件夹下，找到或创建 <code className="px-1 py-0.5 rounded bg-muted text-xs">Localization</code> 文件夹。
        </p>
        <p className="text-sm text-muted-foreground">翻译文件可以放在已安装的任何 Mod 文件夹内，推荐放在 <code className="px-1 py-0.5 rounded bg-muted text-xs">LastSpellMapMod</code> 目录下。</p>

        <h5 className="text-sm font-medium text-foreground pt-1">步骤 3：放入翻译文件</h5>
        <p className="text-sm text-muted-foreground">
          将导出的 <code className="px-1 py-0.5 rounded bg-muted text-xs">.txt</code> 文件放入 <code className="px-1 py-0.5 rounded bg-muted text-xs">Localization</code> 文件夹中。
        </p>
        <div className="bg-muted p-3 rounded-md">
          <pre className="text-xs font-mono leading-snug">
{`LastSpellMapMod/
├── LastSpellMapMod.dll
├── Maps/
├── Items/
└── Localization/          ← 必须命名为 "Localization"
    └── Italiano.txt       ← 你的翻译文件在这里`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function TipsSection() {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-foreground">格式与技巧</h4>
      <ul className="text-sm text-muted-foreground space-y-2">
        <li className="flex gap-2 items-start">
          <Download className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p><strong className="text-foreground">文件命名规则：</strong>扩展名必须为 <code className="px-1 py-0.5 rounded bg-muted text-xs">.txt</code>，文件名即游戏内语言显示名称（如 <code className="px-1 py-0.5 rounded bg-muted text-xs">Italiano.txt</code> → Italiano [CUSTOM]）。</p>
          </div>
        </li>
        <li className="flex gap-2 items-start">
          <FileText className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p><strong className="text-foreground">CSV 格式：</strong>首列为空，第二列为 Key。以 <code className="px-1 py-0.5 rounded bg-muted text-xs">#</code> 开头的行为注释，不会被加载。</p>
          </div>
        </li>
        <li className="flex gap-2 items-start">
          <FolderTree className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p><strong className="text-foreground">更新翻译：</strong>修改文件后保存即可生效。如未立即看到效果，尝试在游戏中保存一次或切换菜单界面。</p>
          </div>
        </li>
      </ul>
    </div>
  );
}

// ============================================================================
// Tutorial Dialog Component
// ============================================================================

export function LocalizationTutorialDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          <HelpCircle className="h-4 w-4" />
          使用教程
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            本地化模组使用教程
          </DialogTitle>
          <DialogDescription>
            了解 Mod 工具功能、文件存放位置及翻译模组制作流程。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Section 1: Quick Reference */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Copy className="h-4 w-4 text-primary" />
              📂 文件位置速查
            </h3>
            <QuickReferenceTable />
          </div>

          <div className="border-t border-muted" />

          {/* Section 2: Mod Features */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Hammer className="h-4 w-4 text-primary" />
              🔧 Mod 工具功能说明
            </h3>
            <ModFeaturesSection />
          </div>

          <div className="border-t border-muted" />

          {/* Section 3: Translation Guide */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Download className="h-4 w-4 text-primary" />
              🌐 翻译模组制作流程
            </h3>
            <TranslationGuide />
          </div>

          <div className="border-t border-muted" />

          {/* Section 4: Tips */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <HelpCircle className="h-4 w-4 text-primary" />
              📝 格式与技巧
            </h3>
            <TipsSection />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

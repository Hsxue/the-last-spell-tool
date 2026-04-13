/**
 * Feature Release Notes Dialog
 * Shows a comprehensive changelog of mod tool features and updates.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { BookOpen, Eye, Package2, FolderTree, Globe, Hammer, Sparkles } from 'lucide-react';

// ============================================================================
// Release Notes Data
// ============================================================================

interface ReleaseVersion {
  version: string;
  date: string;
  tag?: 'latest' | 'beta';
  sections: {
    title: string;
    icon: React.ReactNode;
    items: string[];
  }[];
}

const releaseNotes: ReleaseVersion[] = [
  {
    version: 'v1.2.0',
    date: '2026-04-13',
    tag: 'latest',
    sections: [
      {
        title: '核心模组功能',
        icon: <Hammer className="h-4 w-4 text-primary" />,
        items: [
          '新增自定义地图加载器，支持从 Maps/ 文件夹加载 .TileMap 格式地图',
          '新增自定义物品系统，从 Items/ 文件夹批量导入 XML 物品定义并自动注入游戏数据库',
          '新增自定义技能系统，从 Skills/ 文件夹加载技能定义，支持 Contextual 检测',
        ],
      },
      {
        title: '调试面板（F9）',
        icon: <Eye className="h-4 w-4 text-primary" />,
        items: [
          '新增金币操控功能：实时查看当前金币，支持输入数量添加或快捷 +1000',
          '新增武器生成功能：通过 ID 查找武器，列出所有可用武器并点击获取',
          '新增操作日志：实时记录所有调试操作（带时间戳），最多 50 条，支持清空',
        ],
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-04-01',
    sections: [
      {
        title: '地图选择器',
        icon: <Package2 className="h-4 w-4 text-primary" />,
        items: [
          '新增地图浏览面板：在游戏外浮动显示已加载的自定义地图列表（名称/尺寸/难度），支持拖拽排序',
          '新增一键加载：选择地图后点击 Play 按钮即可进入自定义地图游戏',
        ],
      },
      {
        title: 'Steam 创意工坊集成',
        icon: <Globe className="h-4 w-4 text-primary" />,
        items: [
          '新增自动发现 Mod 功能：扫描 Steam 订阅的创意工坊 Mod + 本地 BepInEx/plugins 文件夹',
          '新增多路径翻译加载：自动加载所有已发现 Mod 目录下的 Localization/*.txt 翻译文件',
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-03-15',
    sections: [
      {
        title: '初始版本功能',
        icon: <Sparkles className="h-4 w-4 text-primary" />,
        items: [
          '基础地图编辑器：支持地形绘制、建筑放置、旗帜标记',
          'XML 数据导出：支持导出 .TileMap.xml 和 _Buildings.xml 格式',
          '内置地图选择：支持快速加载游戏原版地图作为模板',
          '本地化模组：支持游戏文本翻译与多语言切换',
          'Harmony 补丁系统：底层注入框架，确保模组与游戏本体兼容',
        ],
      },
    ],
  },
];

// ============================================================================
// Sub-Components
// ============================================================================

function QuickPathReference() {
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <FolderTree className="h-4 w-4 text-muted-foreground" />
        模组文件路径速查
      </h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="shrink-0">🗺️</span>
          <code className="text-xs bg-background px-1.5 py-0.5 rounded">BepInEx\plugins\LastSpellMapMod\Maps\</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0">⚔️</span>
          <code className="text-xs bg-background px-1.5 py-0.5 rounded">BepInEx\plugins\LastSpellMapMod\Skills\</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0">🗡️</span>
          <code className="text-xs bg-background px-1.5 py-0.5 rounded">BepInEx\plugins\LastSpellMapMod\Items\</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0">🌐</span>
          <code className="text-xs bg-background px-1.5 py-0.5 rounded">BepInEx\plugins\&lt;Mod文件夹&gt;\Localization\</code>
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
      {text}
    </span>
  );
}

// ============================================================================
// Main Dialog Component
// ============================================================================

export function FeatureNotesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          <BookOpen className="h-4 w-4" />
          功能说明
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            功能发布说明
          </DialogTitle>
          <DialogDescription>
            LastSpellMapMod 工具功能清单与更新记录
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Reference Card */}
          <QuickPathReference />

          {/* Feature Tags Overview */}
          <div className="flex flex-wrap gap-2">
            <FeatureBadge text="F9 调试面板" />
            <FeatureBadge text="自定义地图" />
            <FeatureBadge text="自定义物品" />
            <FeatureBadge text="自定义技能" />
            <FeatureBadge text="Steam 创意工坊" />
            <FeatureBadge text="本地化模组" />
            <FeatureBadge text="地图选择器" />
            <FeatureBadge text="Harmony 补丁" />
          </div>

          {/* Version Timeline */}
          <div className="space-y-6">
            {releaseNotes.map((release, idx) => (
              <div key={release.version} className="relative">
                {/* Version Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {release.version}
                    </h3>
                    {release.tag && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                        {release.tag === 'latest' ? '最新' : release.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{release.date}</span>
                </div>

                {/* Sections */}
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {release.sections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {section.icon}
                        {section.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {section.items.map((item, iIdx) => (
                          <li key={iIdx} className="flex gap-2 items-start text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Separator (except last) */}
                {idx < releaseNotes.length - 1 && (
                  <div className="border-t border-muted mt-6" />
                )}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground text-center">
            更多详细教程与文件格式说明，请参阅 <strong>"使用教程"</strong> 弹窗。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

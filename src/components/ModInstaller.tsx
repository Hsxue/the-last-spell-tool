/**
 * ModInstaller Component
 * One-click download button that packages the LastSpellMapMod release files into a ZIP
 * and triggers a browser download, then shows installation instructions dialog.
 */

import { useState } from 'react';
import JSZip from 'jszip';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useUIStore } from '../store/uiStore';
import { Download, Info } from 'lucide-react';

const MOD_RELEASE = `${import.meta.env.BASE_URL}mod-release`;

// Fallback file list if manifest fails to load
const FALLBACK_FILES = [
  'BepInEx/plugins/LastSpellMapMod/LastSpellMapMod.dll',
  'BepInEx/plugins/LastSpellMapMod/LastSpellMapMod.deps.json',
  'README_CN.md',
];

const INSTALL_PHASES = [
  {
    phase: '一',
    title: '解压到游戏根目录',
    subtitle: '一键安装，解压即完成',
    steps: [
      {
        step: 1,
        title: '打开游戏目录',
        description:
          '在 Steam 库中右键《The Last Spell》 → 管理 → 浏览本地文件，找到游戏安装位置。',
      },
      {
        step: 2,
        title: '解压全部文件到游戏根目录',
        description: (
          <>
            将下载的 <code className="px-1 py-0.5 rounded bg-muted text-xs">LastSpellModPack.zip</code> 解压至游戏根目录（与 <code className="px-1 py-0.5 rounded bg-muted text-xs">The Last Spell.exe</code> 同级），确保文件覆盖合并。
            压缩包已包含 BepInEx 6.0.0-pre.1 框架和 LastSpellMapMod 插件。
          </>
        ),
      },
      {
        step: 3,
        title: '确认文件结构',
        description: (
          <>
            游戏目录下应存在：
            <pre className="whitespace-pre font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto leading-5 mt-1">
{`├── winhttp.dll          # BepInEx Doorstop 入口
├── doorstop_config.ini
├── The Last Spell.exe
├── BepInEx/
│   ├── core/               # BepInEx 核心
│   ├── config/
│   └── plugins/
│       └── LastSpellMapMod/
│           ├── LastSpellMapMod.dll
│           ├── maps/       # 示例地图
│           ├── items/      # 示例武器
│           └── skills/     # 示例技能`}
            </pre>
          </>
        ),
      },
      {
        step: 4,
        title: '启动游戏',
        description: (
          <>
            通过 Steam 启动游戏。检查 <code className="px-1 py-0.5 rounded bg-muted text-xs">BepInEx/LogOutput.log</code> 首行显示 <code className="px-1 py-0.5 rounded bg-muted text-xs">BepInEx 6.0.0-pre.1</code>，
            并且有 <code className="px-1 py-0.5 rounded bg-muted text-xs">Loading [LastSpellMapMod 1.0.0]</code>。
            在城市选择界面应能看到 "Example Map" 和 "LakeBurg" 选项。
          </>
        ),
      },
    ],
  },
];

interface ModManifest {
  modId: string;
  version: string;
  files: string[];
}

export function ModInstaller() {
  const { addToast } = useUIStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch manifest to get current file list (from release root, not mod dir)
      const manifestRes = await fetch(`${MOD_RELEASE}/manifest.json`);
      let modFiles: string[];

      if (manifestRes.ok) {
        const manifest: ModManifest = await manifestRes.json();
        modFiles = manifest.files;
      } else {
        console.warn('Manifest not found, using fallback file list');
        modFiles = FALLBACK_FILES;
      }

      const zip = new JSZip();

      // Fetch each file and add to ZIP
      // Use Promise.allSettled to tolerate non-critical file fetch failures (e.g., dotfiles)
      const fetchPromises = modFiles.map(async (filePath) => {
        try {
          const response = await fetch(`${MOD_RELEASE}/${filePath}`);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(filePath, blob);
          } else {
            console.warn(`[ModInstaller] Skipping file (fetch failed): ${filePath}`);
          }
        } catch (err) {
          console.warn(`[ModInstaller] Skipping file (error): ${filePath}`, err);
        }
      });

      await Promise.all(fetchPromises);

      // Verify we got at least the main DLL, otherwise throw error

      // Generate ZIP and trigger download
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LastSpellModPack.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({
        title: 'Mod 下载完成',
        description: 'LastSpellModPack.zip 已保存',
        type: 'success',
        duration: 5000,
      });

      // Show installation instructions dialog
      setShowDialog(true);
    } catch (error) {
      console.error('Mod download failed:', error);
      addToast({
        title: '下载失败',
        description: error instanceof Error ? error.message : '未知错误',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
        title="下载 BepInEx + LastSpellMapMod 一体包"
      >
        {isDownloading ? (
          <Info className="h-4 w-4 mr-2 animate-pulse" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isDownloading ? '打包中...' : '下载 Mod 一体包'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Mod 一体包安装说明
            </DialogTitle>
            <DialogDescription>
              BepInEx 6 + LastSpellMapMod 已打包，解压到游戏目录即可
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto pr-1">
            {INSTALL_PHASES.map((phase) => (
              <div key={phase.phase}>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    第{phase.phase}阶段：{phase.title}
                  </h3>
                  {phase.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {phase.subtitle}
                    </p>
                  )}
                </div>
                <div className="space-y-3 ml-1">
                  {phase.steps.map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              使用 WebDev2 创建的地图/武器/技能文件，导出后可直接放入{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-xs break-all">
                BepInEx/plugins/LastSpellMapMod/maps/
              </code>
              、<code className="px-1 py-0.5 rounded bg-muted text-xs break-all">items/</code>
              、<code className="px-1 py-0.5 rounded bg-muted text-xs break-all">skills/</code> 目录，游戏中即时生效。
              本地化 CSV 文件放入{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-xs break-all">Localization/</code> 目录。
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

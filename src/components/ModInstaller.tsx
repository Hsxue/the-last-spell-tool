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

// Fallback file list if manifest fails to load
const FALLBACK_FILES = [
  'BepInEx/plugins/LastSpellMapMod/LastSpellMapMod.dll',
  'BepInEx/plugins/LastSpellMapMod/LastSpellMapMod.deps.json',
  'README_CN.md',
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
      const manifestRes = await fetch('/mod-release/manifest.json');
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
      const fetchPromises = modFiles.map(async (filePath) => {
        const response = await fetch(`/mod-release/${filePath}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
        }
        const blob = await response.blob();
        zip.file(filePath, blob);
      });

      await Promise.all(fetchPromises);

      // Generate ZIP and trigger download
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LastSpellMapMod.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({
        title: 'Mod 下载完成',
        description: 'LastSpellMapMod.zip 已保存',
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
        title="下载 LastSpellMapMod 并查看安装说明"
      >
        {isDownloading ? (
          <Info className="h-4 w-4 mr-2 animate-pulse" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isDownloading ? '打包中...' : '下载 Mod'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              LastSpellMapMod 安装说明
            </DialogTitle>
            <DialogDescription>
              按照以下步骤将 Mod 安装到游戏目录
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {INSTALL_STEPS.map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              自定义地图文件可放置在
              <code className="px-1 py-0.5 rounded bg-muted text-xs break-all">
                BepInEx/plugins/LastSpellMapMod/maps/
              </code>
              目录下，支持 Python TileMapEditor 导出的 .TileMap 文件。
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

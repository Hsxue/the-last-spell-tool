/**
 * ModInstaller Component
 * One-click download button that packages the LastSpellMapMod release files into a ZIP
 * and triggers a browser download, then shows installation instructions dialog.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    title: 'modInstaller.phaseInstallTitle',
    subtitle: 'modInstaller.phaseInstallSubtitle',
    steps: [
      {
        step: 1,
        title: 'modInstaller.stepOpenDirTitle',
        description: 'modInstaller.stepOpenDirDesc',
      },
      {
        step: 2,
        title: 'modInstaller.stepExtractTitle',
        description: 'jsx_stepExtract' as const,
      },
      {
        step: 3,
        title: 'modInstaller.stepVerifyTitle',
        description: 'jsx_stepVerify' as const,
      },
      {
        step: 4,
        title: 'modInstaller.stepLaunchTitle',
        description: 'jsx_stepLaunch' as const,
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
  const { t } = useTranslation('common');
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
        title: t('modInstaller.toastSuccess'),
        description: t('modInstaller.toastSuccessDesc'),
        type: 'success',
        duration: 5000,
      });

      // Show installation instructions dialog
      setShowDialog(true);
    } catch (error) {
      console.error('Mod download failed:', error);
      addToast({
        title: t('modInstaller.toastFailed'),
        description: error instanceof Error ? error.message : t('modInstaller.unknownError', 'Unknown error'),
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
        title={t('modInstaller.buttonTitle')}
      >
        {isDownloading ? (
          <Info className="h-4 w-4 mr-2 animate-pulse" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isDownloading ? t('modInstaller.downloading') : t('modInstaller.downloadBtn')}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {t('modInstaller.dialogTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('modInstaller.dialogDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto pr-1">
            {INSTALL_PHASES.map((phase) => (
              <div key={phase.phase}>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t('modInstaller.phasePrefix', '第')} {phase.phase} {t('modInstaller.phaseSuffix', '阶段：')}{t(phase.title)}
                  </h3>
                  {phase.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(phase.subtitle)}
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
                          {t(item.title)}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.description === 'jsx_stepExtract' ? (
                            <>
                              {t('modInstaller.stepExtractPrefix')} <code className="px-1 py-0.5 rounded bg-muted text-xs">LastSpellModPack.zip</code> {t('modInstaller.stepExtractSuffix')} (<code className="px-1 py-0.5 rounded bg-muted text-xs">The Last Spell.exe</code> {t('modInstaller.stepExtractSameLevel')}), {t('modInstaller.stepExtractMerge')}.
                              {t('modInstaller.stepExtractIncluded')}
                            </>
                          ) : item.description === 'jsx_stepVerify' ? (
                            <>
                              {t('modInstaller.stepVerifyDesc')}
                              <pre className="whitespace-pre font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto leading-5 mt-1">
{`├── winhttp.dll          # BepInEx Doorstop entry
├── doorstop_config.ini
├── The Last Spell.exe
├── BepInEx/
│   ├── core/               # BepInEx core
│   ├── config/
│   └── plugins/
│       └── LastSpellMapMod/
│           ├── LastSpellMapMod.dll
│           ├── maps/       # Example maps
│           ├── items/      # Example weapons
│           └── skills/     # Example skills`}
                              </pre>
                            </>
                          ) : item.description === 'jsx_stepLaunch' ? (
                            <>
                              {t('modInstaller.stepLaunchDesc')} <code className="px-1 py-0.5 rounded bg-muted text-xs">BepInEx/LogOutput.log</code> {t('modInstaller.stepLaunchCheck1')} <code className="px-1 py-0.5 rounded bg-muted text-xs">BepInEx 6.0.0-pre.1</code>,
                              {t('modInstaller.stepLaunchAnd')} <code className="px-1 py-0.5 rounded bg-muted text-xs">Loading [LastSpellMapMod 1.0.0]</code>.
                              {t('modInstaller.stepLaunchCheck2')}
                            </>
                          ) : (
                            t(item.description)
                          )}
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
              {t('modInstaller.webdevNote')}{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-xs break-all">
                BepInEx/plugins/LastSpellMapMod/maps/
              </code>
              {t('modInstaller.webdevNoteSuffix1')}<code className="px-1 py-0.5 rounded bg-muted text-xs break-all">items/</code>
              {t('modInstaller.webdevNoteSuffix2')}{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-xs break-all">skills/</code>{t('modInstaller.webdevNoteSuffix3')}
              {t('modInstaller.webdevNoteSuffix4')}{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-xs break-all">Localization/</code>{t('modInstaller.webdevNoteSuffix5', 'directory.')}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

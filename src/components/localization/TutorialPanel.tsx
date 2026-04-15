/**
 * Tutorial Panel Component
 * Shows instructions on how to use the localization editor and create language mods.
 */

import { useTranslation } from 'react-i18next';
import { ScrollArea } from '../ui/scroll-area';
import {
  FolderTree,
  Globe,
  Lightbulb,
  Package,
} from 'lucide-react';

function TutorialContent() {
  const { t } = useTranslation('common');

  const sections = [
    {
      id: 'reference',
      icon: FolderTree,
      title: t('tutorialPanel.secRef'),
      content: (
        <div className="space-y-2">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-muted text-foreground">
                <th className="text-left py-1 font-medium">{t('tutorialPanel.refType')}</th>
                <th className="text-left py-1 font-medium">{t('tutorialPanel.refPath')}</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-muted">
                <td className="py-1 font-mono text-foreground">{t('tutorialPanel.refMaps')}</td>
                <td className="py-1"><code>plugins/LastSpellMapMod/Maps/</code></td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-1 font-mono text-foreground">{t('tutorialPanel.refSkills')}</td>
                <td className="py-1"><code>plugins/LastSpellMapMod/Skills/</code></td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-1 font-mono text-foreground">{t('tutorialPanel.refItems')}</td>
                <td className="py-1"><code>plugins/LastSpellMapMod/Items/</code></td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-1 font-mono text-foreground">{t('tutorialPanel.refLocalization')}</td>
                <td className="py-1"><code>{t('tutorialPanel.refAnyMod')}/Localization/</code></td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] text-muted-foreground">
            {t('tutorialPanel.refNotePrefix')} <code className="bg-muted px-0.5 rounded">BepInEx\</code> {t('tutorialPanel.refNoteSuffix')}
          </p>
        </div>
      ),
    },
    {
      id: 'install',
      icon: Package,
      title: t('tutorialPanel.secInstall'),
      content: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{t('tutorialPanel.installIntro')}</p>

          <h4 className="text-xs font-semibold text-foreground mt-2">{t('tutorialPanel.installStep1')}</h4>
          <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
            <li>{t('tutorialPanel.installStep1a')} <strong>Steam</strong>{t('tutorialPanel.installStep1b')} <em>The Last Spell</em>{t('tutorialPanel.installStep1c')}</li>
            <li>{t('tutorialPanel.installStep1d')} <strong>{t('tutorialPanel.installStep1e')}</strong>{t('tutorialPanel.installStep1f')}</li>
            <code className="block px-1.5 py-1 rounded bg-muted text-[10px] mt-1 break-all">
              D:\SteamLibrary\steamapps\common\The Last Spell
            </code>
          </ul>

          <h4 className="text-xs font-semibold text-foreground mt-2">{t('tutorialPanel.installStep2')}</h4>
          <p className="text-xs">{t('tutorialPanel.installStep2a')}</p>
          <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
            <li><code className="px-1 py-0.5 rounded bg-muted text-[10px]">BepInEx\plugins\{t('tutorialPanel.refAnyMod')}\</code> {t('tutorialPanel.installStep2b')}</li>
            <li><code className="px-1 py-0.5 rounded bg-muted text-[10px]">steamapps\workshop\content\1597230\&lt;ModID&gt;\</code> {t('tutorialPanel.installStep2c')}</li>
          </ul>

          <h4 className="text-xs font-semibold text-foreground mt-2">{t('tutorialPanel.installStep3')}</h4>
          <p className="text-xs">{t('tutorialPanel.installStep3a')} <strong>{t('tutorialPanel.guideDirMust')}</strong>{t('tutorialPanel.installStep3b')}</p>
          <p className="text-xs">{t('tutorialPanel.installStep3c')} <code className="px-1 py-0.5 rounded bg-muted text-[10px]">.txt</code> {t('tutorialPanel.installStep3d')}</p>
          <p className="text-xs mt-1 text-[10px] text-muted-foreground">{t('tutorialPanel.installStep3e')}</p>

          <pre className="whitespace-pre text-[11px] bg-muted p-3 rounded-md overflow-x-auto leading-snug mt-2 text-left font-mono">
{`本地 BepInEx:
游戏目录/
├── BepInEx/
│   └── plugins/
│       └── ${t('tutorialPanel.refAnyMod')}/   ← ${t('tutorialPanel.guideDirMust')}
│           └── Italiano.txt ← ${t('localizationTutorial.guideFileHere')}

Steam 创意工坊:
游戏目录/
├── steamapps/
│   └── workshop/
│       └── content/
│           └── 1597230/     ← The Last Spell AppID
│               └── <某ModID>/ ← ${t('localizationTutorial.modFeatDiscoverStrong')}
│                   └── Localization/
│                       └── Italiano.txt`}
          </pre>

          <div className="mt-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-[10px] text-yellow-600">
              <strong>{t('tutorialPanel.installWarningStrong')}</strong>{t('tutorialPanel.installWarning')}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'overview',
      icon: Globe,
      title: t('tutorialPanel.secOverview'),
      content: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {t('tutorialPanel.overviewDesc1')}
          </p>
          <p>
            {t('tutorialPanel.overviewDesc2a')}
            <strong>{t('tutorialPanel.overviewDesc2b')}</strong>{t('tutorialPanel.overviewDesc2c')}
          </p>
        </div>
      ),
    },
    {
      id: 'tips',
      icon: Lightbulb,
      title: t('tutorialPanel.secTips'),
      content: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <h4 className="text-xs font-semibold text-foreground">{t('tutorialPanel.tipFileNaming')}</h4>
          <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
            <li>{t('tutorialPanel.tipExtension')} <code className="px-1 py-0.5 rounded bg-muted text-[10px]">.txt</code> {t('tutorialPanel.tipExtensionEnd')}</li>
            <li>{t('tutorialPanel.tipFilename')} <code className="px-1 py-0.5 rounded bg-muted text-[10px]">Italiano.txt</code> {t('tutorialPanel.tipFilenameEnd')}</li>
          </ul>

          <h4 className="text-xs font-semibold text-foreground mt-2">{t('tutorialPanel.tipCsvFormat')}</h4>
          <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
            <li>{t('tutorialPanel.tipColumns')}</li>
            <li>{t('tutorialPanel.tipComments')} <code className="px-1 py-0.5 rounded bg-muted text-[10px]">#</code> {t('tutorialPanel.tipCommentsEnd')}</li>
            <li>{t('tutorialPanel.tipRichText')} <code className="px-1 py-0.5 rounded bg-muted text-[10px]">&lt;b&gt;加粗&lt;/b&gt;</code> {t('tutorialPanel.tipRichTextEnd')}</li>
          </ul>

          <h4 className="text-xs font-semibold text-foreground mt-2">{t('tutorialPanel.tipUpdate')}</h4>
          <p className="text-xs">
            {t('tutorialPanel.tipUpdateDesc')}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="border rounded-md bg-card">
      <ScrollArea className="h-full">
        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            {t('tutorialPanel.title')}
          </h3>
          <div className="space-y-3">
            {sections.map((section) => {
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

export function TutorialPanel() {
  return <TutorialContent />;
}

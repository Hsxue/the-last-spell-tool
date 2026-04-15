/**
 * Feature Release Notes Dialog
 * Shows a comprehensive changelog of mod tool features and updates.
 */

import { useTranslation } from 'react-i18next';
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
    titleKey: string;
    icon: React.ReactNode;
    itemsKey: string[];
  }[];
}

function useReleaseNotes(): ReleaseVersion[] {
  return [
    {
      version: 'v1.2.0',
      date: '2026-04-13',
      tag: 'latest',
      sections: [
        {
          titleKey: 'featureNotes.secCoreTitle',
          icon: <Hammer className="h-4 w-4 text-primary" />,
          itemsKey: [
            'featureNotes.secCore1',
            'featureNotes.secCore2a',
            'featureNotes.secCore2b',
          ],
        },
        {
          titleKey: 'featureNotes.secDebugTitle',
          icon: <Eye className="h-4 w-4 text-primary" />,
          itemsKey: [
            'featureNotes.secDebug1a',
            'featureNotes.secDebug1b',
            'featureNotes.secDebug1c',
          ],
        },
      ],
    },
    {
      version: 'v1.1.0',
      date: '2026-04-01',
      sections: [
        {
          titleKey: 'featureNotes.secMapTitle',
          icon: <Package2 className="h-4 w-4 text-primary" />,
          itemsKey: [
            'featureNotes.secMap1a',
            'featureNotes.secMap1b',
          ],
        },
        {
          titleKey: 'featureNotes.secWorkshopTitle',
          icon: <Globe className="h-4 w-4 text-primary" />,
          itemsKey: [
            'featureNotes.secWorkshop1a',
            'featureNotes.secWorkshop1b',
          ],
        },
      ],
    },
    {
      version: 'v1.0.0',
      date: '2026-03-15',
      sections: [
        {
          titleKey: 'featureNotes.secInitTitle',
          icon: <Sparkles className="h-4 w-4 text-primary" />,
          itemsKey: [
            'featureNotes.secInit1a',
            'featureNotes.secInit1b',
            'featureNotes.secInit1c',
            'featureNotes.secInit1d',
            'featureNotes.secInit1e',
          ],
        },
      ],
    },
  ];
}

// ============================================================================
// Sub-Components
// ============================================================================

function QuickPathReference() {
  const t = useTranslation('common').t;
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <FolderTree className="h-4 w-4 text-muted-foreground" />
        {t('featureNotes.pathRefTitle')}
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
  const { t } = useTranslation('common');
  const releaseNotes = useReleaseNotes();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          <BookOpen className="h-4 w-4" />
          {t('featureNotes.triggerText')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('featureNotes.dialogTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('featureNotes.dialogDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Reference Card */}
          <QuickPathReference />

          {/* Feature Tags Overview */}
          <div className="flex flex-wrap gap-2">
            <FeatureBadge text={t('featureNotes.badgeF9')} />
            <FeatureBadge text={t('featureNotes.badgeMap')} />
            <FeatureBadge text={t('featureNotes.badgeItem')} />
            <FeatureBadge text={t('featureNotes.badgeSkill')} />
            <FeatureBadge text={t('featureNotes.badgeWorkshop')} />
            <FeatureBadge text={t('featureNotes.badgeLocal')} />
            <FeatureBadge text={t('featureNotes.badgeMapSelector')} />
            <FeatureBadge text={t('featureNotes.badgeHarmony')} />
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
                        {release.tag === 'latest' ? t('featureNotes.tagLatest') : release.tag}
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
                        {t(section.titleKey)}
                      </h4>
                      <ul className="space-y-1.5">
                        {section.itemsKey.map((itemKey, iIdx) => (
                          <li key={iIdx} className="flex gap-2 items-start text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                            <span>{t(itemKey)}</span>
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
            {t('featureNotes.footerNote')}<strong>{t('featureNotes.footerNoteTutorial')}</strong>{t('featureNotes.footerNoteEnd')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

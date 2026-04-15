/**
 * Tutorial Dialog for Localization Editor
 * Shows comprehensive instructions on mod file placement and translation creation.
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
import { Copy, Download, FileText, FolderTree, Globe, HelpCircle, Hammer, Eye, Package2, Scroll, Sword, Wrench } from 'lucide-react';

function ModFeaturesSection() {
  const t = useTranslation('common').t;
  const features = [
    {
      category: t('localizationTutorial.modCatCore'),
      icon: <Hammer className="h-4 w-4 text-primary" />,
      items: [
        {
          icon: <Scroll className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatMapStrong')}</strong>{t('localizationTutorial.modFeatMap')}</>),
        },
        {
          icon: <Sword className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatItemStrong')}</strong>{t('localizationTutorial.modFeatItem')}</>),
        },
        {
          icon: <Wrench className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatSkillStrong')}</strong>{t('localizationTutorial.modFeatSkill')}</>),
        },
      ],
    },
    {
      category: t('localizationTutorial.modCatDebug'),
      icon: <Eye className="h-4 w-4 text-primary" />,
      items: [
        {
          icon: <Copy className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatGoldStrong')}</strong>{t('localizationTutorial.modFeatGold')}</>),
        },
        {
          icon: <Sword className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatWeaponStrong')}</strong>{t('localizationTutorial.modFeatWeapon')}</>),
        },
        {
          icon: <FileText className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatLogStrong')}</strong>{t('localizationTutorial.modFeatLog')}</>),
        },
      ],
    },
    {
      category: t('localizationTutorial.modCatMapSel'),
      icon: <Package2 className="h-4 w-4 text-primary" />,
      items: [
        {
          icon: <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatBrowserStrong')}</strong>{t('localizationTutorial.modFeatBrowser')}</>),
        },
        {
          icon: <Package2 className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatOneClickStrong')}</strong>{t('localizationTutorial.modFeatOneClick')}</>),
        },
      ],
    },
    {
      category: t('localizationTutorial.modCatWorkshop'),
      icon: <Globe className="h-4 w-4 text-primary" />,
      items: [
        {
          icon: <Download className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatDiscoverStrong')}</strong>{t('localizationTutorial.modFeatDiscover')}</>),
        },
        {
          icon: <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />,
          text: (<><strong>{t('localizationTutorial.modFeatMultiPathStrong')}</strong>{t('localizationTutorial.modFeatMultiPath')}</>),
        },
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
  const t = useTranslation('common').t;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('localizationTutorial.qrDesc')}
      </p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 font-medium text-foreground">{t('localizationTutorial.qrType')}</th>
            <th className="text-left py-2 font-medium text-foreground">{t('localizationTutorial.qrPath')}</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          <tr className="border-b border-muted">
            <td className="py-2">
              <span className="flex items-center gap-2 font-mono text-foreground font-medium">
                {t('localizationTutorial.qrMap')}
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
                {t('localizationTutorial.qrSkill')}
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
                {t('localizationTutorial.qrWeapon')}
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
                {t('localizationTutorial.qrTranslation')}
              </span>
            </td>
            <td className="py-2">
              <code className="px-1.5 py-0.5 rounded bg-muted text-xs block">
                BepInEx\plugins\&lt;{t('localizationTutorial.qrAnyMod')}&gt;\Localization\
              </code>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground">
        {t('localizationTutorial.qrNotePrefix')} <code className="bg-muted px-0.5 rounded">BepInEx\</code> {t('localizationTutorial.qr')}
      </p>
    </div>
  );
}

function TranslationGuide() {
  const t = useTranslation('common').t;
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground">{t('localizationTutorial.guideTitle')}</h4>
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-foreground">{t('localizationTutorial.guideStep1')}</h5>
        <p className="text-sm text-muted-foreground">
          {t('localizationTutorial.guideStep1Desc')} <strong>{t('localizationTutorial.guideStep1Btn')}</strong> {t('localizationTutorial.guideStep1Desc2')}
        </p>

        <h5 className="text-sm font-medium text-foreground pt-1">{t('localizationTutorial.guideStep2')}</h5>
        <p className="text-sm text-muted-foreground">
          {t('localizationTutorial.guideStep2Desc1')} <code className="px-1 py-0.5 rounded bg-muted text-xs">BepInEx\plugins\</code> {t('localizationTutorial.guideStep2Desc2')} <code className="px-1 py-0.5 rounded bg-muted text-xs">Localization</code> {t('localizationTutorial.guideStep2Desc3')}
        </p>
        <p className="text-sm text-muted-foreground">{t('localizationTutorial.guideStep2Desc4')} <code className="px-1 py-0.5 rounded bg-muted text-xs">LastSpellMapMod</code> {t('localizationTutorial.guideStep2Desc5')}</p>

        <h5 className="text-sm font-medium text-foreground pt-1">{t('localizationTutorial.guideStep3')}</h5>
        <p className="text-sm text-muted-foreground">
          {t('localizationTutorial.guideStep3Desc1')} <code className="px-1 py-0.5 rounded bg-muted text-xs">.txt</code> {t('localizationTutorial.guideStep3Desc2')} <code className="px-1 py-0.5 rounded bg-muted text-xs">Localization</code> {t('localizationTutorial.guideStep3Desc3')}
        </p>
        <div className="bg-muted p-3 rounded-md">
          <pre className="text-xs font-mono leading-snug">
{`LastSpellMapMod/
├── LastSpellMapMod.dll
├── Maps/
├── Items/
└── Localization/          ← ${t('localizationTutorial.guideDirMust')}
    └── Italiano.txt       ← ${t('localizationTutorial.guideFileHere')}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function TipsSection() {
  const t = useTranslation('common').t;
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-foreground">{t('localizationTutorial.tipFileNaming')}</h4>
      <ul className="text-sm text-muted-foreground space-y-2">
        <li className="flex gap-2 items-start">
          <Download className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p><strong className="text-foreground">{t('localizationTutorial.tipFileNaming')}</strong>{t('localizationTutorial.tipFileNamingDesc')} <code className="px-1 py-0.5 rounded bg-muted text-xs">.txt</code>{t('localizationTutorial.tipFileNamingDesc2')} <code className="px-1 py-0.5 rounded bg-muted text-xs">Italiano.txt</code> {t('localizationTutorial.tipFileNamingDesc3')}</p>
          </div>
        </li>
        <li className="flex gap-2 items-start">
          <FileText className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p><strong className="text-foreground">{t('localizationTutorial.tipCsvFormat')}</strong>{t('localizationTutorial.tipCsvDesc')} <code className="px-1 py-0.5 rounded bg-muted text-xs">#</code> {t('localizationTutorial.tipCsvDesc2')}</p>
          </div>
        </li>
        <li className="flex gap-2 items-start">
          <FolderTree className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p><strong className="text-foreground">{t('localizationTutorial.tipUpdate')}</strong>{t('localizationTutorial.tipUpdateDesc')}</p>
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
  const { t } = useTranslation('common');
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          <HelpCircle className="h-4 w-4" />
          {t('localizationTutorial.triggerText')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t('localizationTutorial.dialogTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('localizationTutorial.dialogDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Section 1: Quick Reference */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Copy className="h-4 w-4 text-primary" />
              {t('localizationTutorial.secFileRef')}
            </h3>
            <QuickReferenceTable />
          </div>

          <div className="border-t border-muted" />

          {/* Section 2: Mod Features */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Hammer className="h-4 w-4 text-primary" />
              {t('localizationTutorial.secModFeatures')}
            </h3>
            <ModFeaturesSection />
          </div>

          <div className="border-t border-muted" />

          {/* Section 3: Translation Guide */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Download className="h-4 w-4 text-primary" />
              {t('localizationTutorial.secTranslationGuide')}
            </h3>
            <TranslationGuide />
          </div>

          <div className="border-t border-muted" />

          {/* Section 4: Tips */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <HelpCircle className="h-4 w-4 text-primary" />
              {t('localizationTutorial.secTips')}
            </h3>
            <TipsSection />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

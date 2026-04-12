/**
 * Localization Tab Component
 * Main container for the localization editor, combining tutorial and translation table.
 */

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useLocalizationStore } from '../../store/localizationStore';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { TutorialPanel } from './TutorialPanel';
import { TranslationTable } from './TranslationTable';

export function LocalizationTab() {
  const { showTutorial, toggleTutorial } = useLocalizationStore();

    return (
      <div className="flex h-full">
        {/* Left Side: Translation Table (Main Editor) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden border-r">
          <TranslationTable />
        </div>

        {/* Right Side: Tutorial Panel (Reference) */}
        <div className="w-80 shrink-0 bg-card flex flex-col h-full">
          <Collapsible open={showTutorial} onOpenChange={toggleTutorial}>
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                使用教程
              </h3>
              <CollapsibleTrigger className="text-muted-foreground hover:text-foreground">
                {showTutorial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex-1 overflow-hidden">
              <TutorialPanel />
            </CollapsibleContent>
          </Collapsible>

          {!showTutorial && (
            <div className="p-3 border-t text-xs text-muted-foreground">
              <p>双击单元格开始编辑</p>
              <p className="mt-1">按 Enter 保存，Esc 取消</p>
            </div>
          )}
        </div>
      </div>
    );
  );
}

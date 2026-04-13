/**
 * Localization Tab Component
 * Main container for the localization editor with translation table.
 */

import { TranslationTable } from './TranslationTable';

export function LocalizationTab() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col">
        <TranslationTable />
      </div>
    </div>
  );
}

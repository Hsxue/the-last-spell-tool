import { XmlImportButton } from './XmlImportButton';
import { XmlExportButton } from './XmlExportButton';
import { LanguageSelector } from './LanguageSelector';

export function Toolbar() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50">
      <LanguageSelector />
      <div className="flex-1" />
      <XmlImportButton />
      <XmlExportButton />
    </div>
  );
}
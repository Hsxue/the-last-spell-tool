/**
 * Localization Table Component
 * Tree view: each translation key is a parent node, expanding to show all language translations.
 * One language per row for easy readability.
 */

import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizationStore } from '../../store/localizationStore';
import { BUILTIN_LANGUAGES, type BuiltinLanguage } from '../../types/localization';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Search, Plus, Trash2, Download, Upload, Languages, ChevronRight, ChevronDown, Check, File } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';

export function TranslationTable() {
  const { t } = useTranslation('common');
  const {
    entries,
    selectedKey,
    searchQuery,
    setSelectedKey,
    setSearchQuery,
    updateTranslation,
    addEntry,
    deleteEntry,
    importFromCSV,
    exportToCSV,
  } = useLocalizationStore();

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ key: string; lang: BuiltinLanguage } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter entries based on search
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.key.toLowerCase().includes(q) ||
        Object.values(e.translations as Record<string, string>).some((tv: string) => tv.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  // Toggle expand/collapse
  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Start editing a translation
  const startEdit = (key: string, lang: BuiltinLanguage) => {
    const entry = entries.find((e) => e.key === key);
    if (!entry) return;
    setEditingCell({ key, lang });
    setEditValue((entry.translations as Record<string, string>)[lang] ?? '');
  };

  // Save the edited value
  const saveEdit = () => {
    if (!editingCell) return;
    const index = entries.findIndex((e) => e.key === editingCell.key);
    if (index >= 0) {
      updateTranslation(index, editingCell.lang, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  };

  // Handle keyboard shortcuts in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') setEditingCell(null);
  };

  // Import CSV file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try { importFromCSV(text); } catch (err) { console.error('Failed to import CSV:', err); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export as game-compatible localization .txt file
  const [exportFileName, setExportFileName] = useState('English.txt');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const confirmExport = () => {
    const csv = exportToCSV(entries);
    const fileName = exportFileName.endsWith('.txt') ? exportFileName : `${exportFileName}.txt`;
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };

  // Expand/collapse all
  const isAllExpanded = filteredEntries.length > 0 && filteredEntries.every((e) => expandedKeys.has(e.key));
  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(filteredEntries.map((e) => e.key)));
    }
  };

  // Get language badge styling
  const getLangBadge = (lang: BuiltinLanguage) => {
    const colors: Record<string, string> = {
      'English': 'bg-blue-100 text-blue-700',
      'Français': 'bg-purple-100 text-purple-700',
      '简体中文': 'bg-red-100 text-red-700',
      '繁體中文': 'bg-red-50 text-red-600',
      '日本語': 'bg-pink-100 text-pink-700',
      'Русский': 'bg-cyan-100 text-cyan-700',
      'Українська': 'bg-blue-50 text-blue-600',
      'Deutsch': 'bg-yellow-100 text-yellow-800',
      'Español': 'bg-orange-100 text-orange-700',
      'Portugu\u{00EA}s \(Brasil\)': 'bg-green-100 text-green-700',
      '한국어': 'bg-teal-100 text-teal-700',
    };
    const baseColors = 'px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors shrink-0';
    return `${baseColors} ${colors[lang] || 'bg-muted text-muted-foreground'}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('translationTable.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1" />
            {t('translationTable.importBtn')}
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleImport} />

          <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" />
            {t('translationTable.exportBtn')}
          </Button>

          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={toggleAll}>
            {isAllExpanded ? <ChevronDown className="h-3.5 w-3.5 mr-1" /> : <ChevronRight className="h-3.5 w-3.5 mr-1" />}
            {isAllExpanded ? t('translationTable.collapseAll') : t('translationTable.expandAll')}
          </Button>
        </div>
      </div>

      {/* Add new key bar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <Input
          placeholder={t('translationTable.addKeyPlaceholder')}
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="h-7 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newKey.trim()) {
              addEntry(newKey.trim()); setNewKey('');
            }
          }}
        />
        <Button variant="secondary" size="sm" className="h-7 px-2" onClick={() => {
          if (newKey.trim()) { addEntry(newKey.trim()); setNewKey(''); }
        }}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t('translationTable.addBtn')}
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {t('translationTable.entriesCountPrefix')} {entries.length} {t('translationTable.noData').split(' ')[0] || '条'}
        </span>
      </div>

      {/* Tree Table */}
      <div className="flex-1 overflow-auto">
        {filteredEntries.length === 0 && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Languages className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">{t('translationTable.noData')}</p>
            <p className="text-xs mt-1">{t('translationTable.noDataHint')}</p>
          </div>
        )}
        {filteredEntries.length === 0 && entries.length > 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">{t('translationTable.noData')}</p>
          </div>
        )}

        <div className="py-1">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedKeys.has(entry.key);
            const isSelected = selectedKey === entry.key;

            return (
              <div key={entry.key} className="mb-0.5">
                {/* Parent row (Key) */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors border-l-2 text-sm ${
                    isSelected
                      ? 'bg-primary/5 border-primary'
                      : 'border-transparent hover:bg-muted/30'
                  }`}
                  onClick={() => setSelectedKey(entry.key)}
                  onDoubleClick={() => toggleExpand(entry.key)}
                >
                  <button
                    className="shrink-0 p-0.5 rounded hover:bg-muted"
                    onClick={(e) => { e.stopPropagation(); toggleExpand(entry.key); }}
                  >
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                  <code className="font-mono text-xs font-medium text-foreground flex-1 truncate">
                    {entry.key}
                  </code>
                  <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                    {Object.values(entry.translations as Record<string, string>).filter(Boolean).length}/{BUILTIN_LANGUAGES.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entries.indexOf(entry));
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Child rows (Translations per language) */}
                {isExpanded && (
                  <div className="ml-6 border-l border-border">
                    {BUILTIN_LANGUAGES.map((lang) => {
                      const translation = (entry.translations as Record<string, string>)[lang] ?? '';
                      const isEditing = editingCell?.key === entry.key && editingCell?.lang === lang;

                      return (
                        <div
                          key={lang}
                          className={`px-2 flex items-center gap-2 text-xs border-b border-border/50 transition-colors bg-card`}
                        >
                          {/* Language badge */}
                          <span className={getLangBadge(lang)}>
                            {lang}
                          </span>

                          {/* Translation value or editor */}
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex gap-1 items-start">
                                <div className="flex-1">
                                  <CodeMirror
                                    value={editValue}
                                    onChange={setEditValue}
                                    onKeyDown={handleEditKeyDown}
                                    extensions={[xml()]}
                                    theme={oneDark}
                                    basicSetup={{
                                      lineNumbers: false,
                                      foldGutter: false,
                                      highlightActiveLine: false,
                                      highlightSelectionMatches: false,
                                      autocompletion: false,
                                    }}
                                    className="!h-auto [&_.cm-content]:!py-1"
                                  />
                                </div>
                                <Button size="sm" className="h-6 px-2 text-[10px]" onClick={saveEdit}>
                                  <Check className="h-3 w-3 mr-1" />
                                  {t('translationTable.saveBtn')}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => setEditingCell(null)}>
                                  {t('translationTable.cancelBtn')}
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 min-h-[1.75rem] whitespace-pre-wrap break-words"
                                onDoubleClick={() => startEdit(entry.key, lang)}
                              >
                                {translation ? (
                                  <span className="text-foreground">{translation}</span>
                                ) : (
                                  <span className="text-muted-foreground/50 italic">{t('translationTable.untranslated')}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Export dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="h-4 w-4" />
              {t('translationTable.exportTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('translationTable.exportDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('translationTable.exportLabel')}</label>
              <Input
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                placeholder="English.txt"
                className="h-8"
                onKeyDown={(e) => e.key === 'Enter' && confirmExport()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-7" onClick={() => setShowExportDialog(false)}>
                {t('translationTable.exportCancel')}
              </Button>
              <Button size="sm" className="h-7" onClick={confirmExport}>
                <Download className="h-3.5 w-3.5 mr-1" />
                {t('translationTable.exportConfirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



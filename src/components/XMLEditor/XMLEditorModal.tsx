/**
 * XMLEditorModal - Modal component for editing XML/JSON content with CodeMirror 6
 * Provides syntax highlighting, formatting, and keyboard shortcuts
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
// highlightSelectionMatches is now part of basic setup
import { linter, type Diagnostic } from '@codemirror/lint';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatContent } from '@/utils/xmlFormatter';
import { createDebouncedValidator, type ValidationResult } from '@/utils/xmlValidator';

// ============================================================================
// Types
// ============================================================================

export interface XMLEditorModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Current editor value */
  value: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Language type for syntax highlighting */
  language?: 'xml' | 'json';
  /** Callback when apply button is pressed */
  onApply?: (value: string) => void;
  /** Whether editor is read-only */
  readOnly?: boolean;
  /** Modal title */
  title?: string;
}

// ============================================================================
// Component
// ============================================================================

export function XMLEditorModal({
  isOpen,
  onClose,
  value,
  onChange,
  language = 'xml',
  onApply,
  readOnly = false,
  title,
}: XMLEditorModalProps) {
  const { t } = useTranslation('common');
  const [editorValue, setEditorValue] = useState(value);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: true });
  const debouncedValidate = useCallback(createDebouncedValidator(500), []);

  const displayTitle = title ?? t('xmlEditorModal.defaultTitle');

  // Validate content on change with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      debouncedValidate(editorValue, language).then((result) => {
        setValidationResult(result);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [editorValue, language, isOpen, debouncedValidate]);

  // Sync internal value when prop changes
  useEffect(() => {
    setEditorValue(value);
  }, [value]);
  useEffect(() => {
    if (!isOpen) return;

    const handleApply = () => {
      onApply?.(editorValue);
      onClose();
    };

    const handleFormat = async () => {
      try {
        setError(null);
        const formatted = formatContent(editorValue, language);
        setEditorValue(formatted);
        onChange?.(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('xmlEditorModal.formatError'));
      }
    };

    window.addEventListener('editor-apply', handleApply);
    window.addEventListener('editor-format', handleFormat);

    return () => {
      window.removeEventListener('editor-apply', handleApply);
      window.removeEventListener('editor-format', handleFormat);
    };
  }, [isOpen, editorValue, language, onApply, onChange, onClose, t]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Create editor extensions with language support and linting
  const extensions = useCallback(
    () => [
      language === 'json' ? json() : xml(),

      linter((view) => {
        if (!validationResult.valid && validationResult.error) {
          const parseError = validationResult.error;
          const diagnostic: Diagnostic = {
            from: 0,
            to: view.state.doc.length,
            severity: 'error',
            message: parseError.message,
          };
          return [diagnostic];
        }
        return [];
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          setEditorValue(newValue);
          onChange?.(newValue);
        }
        if (update.selectionSet) {
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          setCursorPosition({
            line: line.number,
            column: pos - line.from + 1,
          });
        }
      }),
      EditorView.editable.of(!readOnly),
    ],
    [onChange, readOnly, language, validationResult]
  );

  const handleApply = () => {
    onApply?.(editorValue);
    onClose();
  };

  const handleCancel = () => {
    setEditorValue(value);
    setError(null);
    onClose();
  };

  const handleFormat = async () => {
    try {
      setError(null);
      const formatted = formatContent(editorValue, language);
      setEditorValue(formatted);
      onChange?.(formatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('xmlEditorModal.formatError'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{displayTitle}</DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                {language.toUpperCase()}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
          {error && (
            <div className="mb-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
              {error}
            </div>
          )}
          <div className="flex-1 border border-border rounded-md overflow-hidden">
            <CodeMirror
              value={editorValue}
              height="100%"
              extensions={extensions()}
              theme="light"
              readOnly={readOnly}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: false,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: false,
                rectangularSelection: false,
                crosshairCursor: false,
                highlightSelectionMatches: false,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: false,
                historyKeymap: true,
                foldKeymap: true,
                lintKeymap: true,
              }}
              className="h-full text-sm"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFormat}
              disabled={readOnly}
              title={t('xmlEditorModal.formatTitle')}
            >
              {t('xmlEditorModal.formatBtn')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              disabled={readOnly || !validationResult.valid}
              title={
                !validationResult.valid
                  ? t('xmlEditorModal.applyTitleInvalid')
                  : t('xmlEditorModal.applyTitleValid')
              }
            >
              {t('xmlEditorModal.applyBtn')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              title={t('xmlEditorModal.cancelTitle')}
            >
              {t('xmlEditorModal.cancelBtn')}
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>
                {t('xmlEditorModal.statusLine')} {cursorPosition.line}, {t('xmlEditorModal.statusCol')} {cursorPosition.column}
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span>
                {t('xmlEditorModal.statusLang')}: {language.toUpperCase()}
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span className={validationResult.valid ? 'text-green-600' : 'text-destructive'}>
                {validationResult.valid
                  ? t('xmlEditorModal.statusValid')
                  : `${t('xmlEditorModal.statusInvalid')} ${validationResult.error?.message}`}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {editorValue.length} {t('xmlEditorModal.statusChars')}
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span>
                {editorValue.split('\n').length} {t('xmlEditorModal.statusLines')}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Sparkles } from 'lucide-react';

interface InlineTextEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  position: { x: number; y: number; width: number; height: number };
  maxWidth?: number;
  maxHeight?: number;
}

interface FormattingButton {
  id: string;
  icon: React.ReactNode;
  command: string;
  title: string;
}

const FORMATTING_BUTTONS: FormattingButton[] = [
  { id: 'bold', icon: <Bold size={14} />, command: 'bold', title: 'Bold (Ctrl+B)' },
  { id: 'italic', icon: <Italic size={14} />, command: 'italic', title: 'Italic (Ctrl+I)' },
  { id: 'underline', icon: <Underline size={14} />, command: 'underline', title: 'Underline (Ctrl+U)' },
  { id: 'divider1', icon: null, command: '', title: '' },
  { id: 'alignLeft', icon: <AlignLeft size={14} />, command: 'justifyLeft', title: 'Align Left' },
  { id: 'alignCenter', icon: <AlignCenter size={14} />, command: 'justifyCenter', title: 'Center' },
  { id: 'alignRight', icon: <AlignRight size={14} />, command: 'justifyRight', title: 'Align Right' },
  { id: 'divider2', icon: null, command: '', title: '' },
  { id: 'bulletList', icon: <List size={14} />, command: 'insertUnorderedList', title: 'Bullet List' },
  { id: 'numberedList', icon: <ListOrdered size={14} />, command: 'insertOrderedList', title: 'Numbered List' },
];

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
  position,
  maxWidth = 600,
  maxHeight = 400,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [hasSelection, setHasSelection] = useState(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
      editorRef.current.focus();
      
      // Place cursor at end
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [initialContent]);

  // Handle selection changes to show/hide toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0 && editorRef.current?.contains(selection.anchorNode)) {
        setHasSelection(true);
        
        // Position toolbar above selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setToolbarPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
        });
        setShowToolbar(true);
      } else {
        setHasSelection(false);
        setShowToolbar(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSave();
      } else if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            document.execCommand('underline');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSave = useCallback(() => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML);
    }
  }, [onSave]);

  const executeCommand = useCallback((command: string) => {
    document.execCommand(command);
    editorRef.current?.focus();
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      editorRef.current && 
      !editorRef.current.contains(e.target as Node) &&
      toolbarRef.current &&
      !toolbarRef.current.contains(e.target as Node)
    ) {
      handleSave();
    }
  }, [handleSave]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <>
      {/* Floating Toolbar */}
      {showToolbar && hasSelection && (
        <div
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-1 px-2 py-1.5 bg-slate-800 rounded-lg shadow-xl"
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {FORMATTING_BUTTONS.map((button) => {
            if (button.id.startsWith('divider')) {
              return <div key={button.id} className="w-px h-4 bg-slate-600 mx-1" />;
            }
            return (
              <button
                key={button.id}
                onClick={() => executeCommand(button.command)}
                className="p-1.5 text-white hover:bg-slate-700 rounded transition-colors"
                title={button.title}
              >
                {button.icon}
              </button>
            );
          })}
          
          <div className="w-px h-4 bg-slate-600 mx-1" />
          
          <button
            className="flex items-center gap-1 px-2 py-1 text-sky-400 hover:bg-slate-700 rounded transition-colors text-xs"
            title="AI Rewrite"
          >
            <Sparkles size={12} />
            AI
          </button>
        </div>
      )}

      {/* Editor Container */}
      <div
        className="fixed z-40 bg-surface-1 border-2 border-sky-500 rounded-lg shadow-xl overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
          width: Math.min(position.width + 40, maxWidth),
          minHeight: position.height + 20,
          maxHeight,
        }}
      >
        {/* Editable content */}
        <div
          ref={editorRef}
          contentEditable
          className="p-3 text-sm text-slate-800 outline-none min-h-[100px] overflow-auto"
          style={{ maxHeight: maxHeight - 50 }}
          suppressContentEditableWarning
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 dark:bg-elevation-2 border-t border-light-border dark:border-dark-border">
          <span className="text-xs text-slate-400">
            Ctrl+Enter to save • Esc to cancel
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-surface-4 dark:hover:bg-elevation-muted rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-sky-500 text-white hover:bg-sky-600 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InlineTextEditor;


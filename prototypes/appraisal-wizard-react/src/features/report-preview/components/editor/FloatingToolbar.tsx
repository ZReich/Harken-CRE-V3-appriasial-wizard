import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Sparkles,
  Type,
} from 'lucide-react';

interface FloatingToolbarProps {
  position: { x: number; y: number };
  visible: boolean;
  onFormat: (command: string, value?: string) => void;
  onAIRewrite?: () => void;
  activeFormats?: string[];
}

interface ToolbarAction {
  id: string;
  icon?: React.ReactNode;
  label?: string;
  command?: string;
  type: 'button' | 'divider' | 'dropdown';
  options?: { label: string; value: string }[];
}

const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 24];

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { id: 'bold', icon: <Bold size={14} />, command: 'bold', type: 'button' },
  { id: 'italic', icon: <Italic size={14} />, command: 'italic', type: 'button' },
  { id: 'underline', icon: <Underline size={14} />, command: 'underline', type: 'button' },
  { id: 'divider1', type: 'divider' },
  { id: 'fontSize', icon: <Type size={14} />, type: 'dropdown', options: FONT_SIZES.map(s => ({ label: `${s}pt`, value: `${s}` })) },
  { id: 'divider2', type: 'divider' },
  { id: 'alignLeft', icon: <AlignLeft size={14} />, command: 'justifyLeft', type: 'button' },
  { id: 'alignCenter', icon: <AlignCenter size={14} />, command: 'justifyCenter', type: 'button' },
  { id: 'alignRight', icon: <AlignRight size={14} />, command: 'justifyRight', type: 'button' },
  { id: 'divider3', type: 'divider' },
  { id: 'bulletList', icon: <List size={14} />, command: 'insertUnorderedList', type: 'button' },
  { id: 'numberedList', icon: <ListOrdered size={14} />, command: 'insertOrderedList', type: 'button' },
  { id: 'divider4', type: 'divider' },
  { id: 'ai', icon: <Sparkles size={14} />, label: 'AI Rewrite', type: 'button' },
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  position,
  visible,
  onFormat,
  onAIRewrite,
  activeFormats = [],
}) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  if (!visible) return null;

  const handleButtonClick = (action: ToolbarAction) => {
    if (action.id === 'ai') {
      onAIRewrite?.();
    } else if (action.command) {
      onFormat(action.command);
    }
  };

  const handleDropdownSelect = (actionId: string, value: string) => {
    if (actionId === 'fontSize') {
      onFormat('fontSize', value);
    } else if (actionId === 'fontFamily') {
      onFormat('fontName', value);
    }
    setOpenDropdown(null);
  };

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 px-2 py-1.5 bg-slate-800 rounded-lg shadow-xl animate-fade-in"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {TOOLBAR_ACTIONS.map((action) => {
        if (action.type === 'divider') {
          return (
            <div key={action.id} className="w-px h-4 bg-slate-600 mx-1" />
          );
        }

        if (action.type === 'dropdown') {
          return (
            <div key={action.id} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === action.id ? null : action.id)}
                className="flex items-center gap-1 p-1.5 text-white hover:bg-slate-700 rounded transition-colors"
              >
                {action.icon}
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              
              {openDropdown === action.id && action.options && (
                <div className="absolute top-full left-0 mt-1 bg-surface-1 border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden min-w-[100px]">
                  {action.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDropdownSelect(action.id, option.value)}
                      className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-surface-3 dark:hover:bg-elevation-subtle"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        const isActive = action.command && activeFormats.includes(action.command);

        return (
          <button
            key={action.id}
            onClick={() => handleButtonClick(action)}
            className={`flex items-center gap-1 p-1.5 rounded transition-colors ${
              isActive
                ? 'bg-sky-500 text-white'
                : action.id === 'ai'
                ? 'text-sky-400 hover:bg-slate-700'
                : 'text-white hover:bg-slate-700'
            }`}
            title={action.label}
          >
            {action.icon}
            {action.label && <span className="text-xs">{action.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default FloatingToolbar;


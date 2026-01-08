import React from 'react';
import {
  Plus,
  Type,
  Heading,
  Table,
  Image,
  Minus,
  FileDown,
  List,
  ListOrdered,
  MessageSquare,
  X,
} from 'lucide-react';

interface AddContentMenuProps {
  position: { x: number; y: number };
  visible: boolean;
  onClose: () => void;
  onAdd: (contentType: string) => void;
}

interface ContentOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const CONTENT_OPTIONS: ContentOption[] = [
  {
    id: 'text-block',
    label: 'Text Block',
    description: 'Add a paragraph of text',
    icon: <Type size={20} />,
  },
  {
    id: 'heading',
    label: 'Heading',
    description: 'Add a section heading',
    icon: <Heading size={20} />,
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a data table',
    icon: <Table size={20} />,
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Upload or select an image',
    icon: <Image size={20} />,
  },
  {
    id: 'divider',
    label: 'Divider Line',
    description: 'Add a horizontal rule',
    icon: <Minus size={20} />,
  },
  {
    id: 'page-break',
    label: 'Page Break',
    description: 'Force new page',
    icon: <FileDown size={20} />,
  },
  {
    id: 'bulleted-list',
    label: 'Bullet List',
    description: 'Add a bulleted list',
    icon: <List size={20} />,
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    description: 'Add a numbered list',
    icon: <ListOrdered size={20} />,
  },
  {
    id: 'callout',
    label: 'Callout Box',
    description: 'Highlighted note',
    icon: <MessageSquare size={20} />,
  },
];

export const AddContentMenu: React.FC<AddContentMenuProps> = ({
  position,
  visible,
  onClose,
  onAdd,
}) => {
  if (!visible) return null;

  const handleOptionClick = (optionId: string) => {
    onAdd(optionId);
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-surface-1 border border-light-border dark:border-dark-border rounded-xl shadow-xl p-4 w-[320px] animate-fade-in"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-800">Add Content</h4>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-3 dark:hover:bg-elevation-subtle rounded"
        >
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-3 gap-2">
        {CONTENT_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-light-border dark:border-dark-border hover:border-sky-300 hover:bg-sky-50 transition-colors"
            title={option.description}
          >
            <div className="text-slate-500">{option.icon}</div>
            <span className="text-xs text-slate-700 text-center leading-tight">
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tip */}
      <p className="text-xs text-slate-400 text-center mt-3">
        Drag content blocks to reorder
      </p>
    </div>
  );
};

// Floating add button that appears between elements
export const FloatingAddButton: React.FC<{
  position: { x: number; y: number };
  visible: boolean;
  onClick: () => void;
}> = ({ position, visible, onClick }) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed z-40 w-6 h-6 bg-sky-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-sky-600 transition-colors animate-fade-in"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Plus size={14} />
    </button>
  );
};

export default AddContentMenu;


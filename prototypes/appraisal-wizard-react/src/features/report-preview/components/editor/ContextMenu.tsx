import React, { useEffect, useRef } from 'react';
import {
  Pencil,
  Copy,
  Clipboard,
  Sparkles,
  Maximize2,
  Minimize2,
  Type,
  MoveVertical,
  Trash2,
  Image,
  Crop,
  ChevronUp,
  ChevronDown,
  EyeOff,
  FileDown,
  ChevronRight,
} from 'lucide-react';

type MenuItemType = 'action' | 'divider' | 'submenu';

interface MenuItem {
  id: string;
  type: MenuItemType;
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
  onClick?: () => void;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  visible: boolean;
  elementType: 'text' | 'image' | 'table' | 'section' | 'page';
  onClose: () => void;
  onAction: (actionId: string, data?: unknown) => void;
}

const TEXT_MENU_ITEMS: MenuItem[] = [
  { id: 'edit', type: 'action', label: 'Edit Text', icon: <Pencil size={14} /> },
  { id: 'copy', type: 'action', label: 'Copy', icon: <Copy size={14} />, shortcut: 'Ctrl+C' },
  { id: 'paste', type: 'action', label: 'Paste', icon: <Clipboard size={14} />, shortcut: 'Ctrl+V' },
  { id: 'divider1', type: 'divider' },
  { id: 'ai-draft', type: 'action', label: 'AI Draft This Section', icon: <Sparkles size={14} /> },
  { id: 'ai-expand', type: 'action', label: 'AI Expand Content', icon: <Maximize2 size={14} /> },
  { id: 'ai-shorten', type: 'action', label: 'AI Shorten Content', icon: <Minimize2 size={14} /> },
  { id: 'divider2', type: 'divider' },
  {
    id: 'format',
    type: 'submenu',
    label: 'Format',
    icon: <Type size={14} />,
    submenu: [
      { id: 'format-bold', type: 'action', label: 'Bold', shortcut: 'Ctrl+B' },
      { id: 'format-italic', type: 'action', label: 'Italic', shortcut: 'Ctrl+I' },
      { id: 'format-underline', type: 'action', label: 'Underline', shortcut: 'Ctrl+U' },
      { id: 'divider', type: 'divider' },
      { id: 'format-larger', type: 'action', label: 'Increase Size' },
      { id: 'format-smaller', type: 'action', label: 'Decrease Size' },
    ],
  },
  { id: 'spacing', type: 'action', label: 'Adjust Spacing', icon: <MoveVertical size={14} /> },
  { id: 'divider3', type: 'divider' },
  { id: 'delete', type: 'action', label: 'Delete Block', icon: <Trash2 size={14} />, destructive: true },
];

const IMAGE_MENU_ITEMS: MenuItem[] = [
  { id: 'replace', type: 'action', label: 'Replace Image', icon: <Image size={14} /> },
  { id: 'edit-caption', type: 'action', label: 'Edit Caption', icon: <Type size={14} /> },
  { id: 'crop', type: 'action', label: 'Crop Image', icon: <Crop size={14} /> },
  {
    id: 'fit',
    type: 'submenu',
    label: 'Fit Options',
    submenu: [
      { id: 'fit-fill', type: 'action', label: 'Fill' },
      { id: 'fit-contain', type: 'action', label: 'Fit' },
      { id: 'fit-stretch', type: 'action', label: 'Stretch' },
      { id: 'fit-original', type: 'action', label: 'Original' },
    ],
  },
  { id: 'divider1', type: 'divider' },
  { id: 'move-up', type: 'action', label: 'Move Up', icon: <ChevronUp size={14} /> },
  { id: 'move-down', type: 'action', label: 'Move Down', icon: <ChevronDown size={14} /> },
  { id: 'divider2', type: 'divider' },
  { id: 'delete', type: 'action', label: 'Remove Image', icon: <Trash2 size={14} />, destructive: true },
];

const SECTION_MENU_ITEMS: MenuItem[] = [
  { id: 'collapse', type: 'action', label: 'Collapse Section', icon: <ChevronUp size={14} /> },
  { id: 'disable', type: 'action', label: 'Hide from Report', icon: <EyeOff size={14} /> },
  { id: 'page-break', type: 'action', label: 'Add Page Break Before', icon: <FileDown size={14} /> },
  { id: 'divider1', type: 'divider' },
  {
    id: 'move-section',
    type: 'submenu',
    label: 'Move Section',
    submenu: [
      { id: 'move-up', type: 'action', label: 'Up' },
      { id: 'move-down', type: 'action', label: 'Down' },
      { id: 'move-addenda', type: 'action', label: 'To Addenda' },
    ],
  },
];

const TABLE_MENU_ITEMS: MenuItem[] = [
  { id: 'edit-cell', type: 'action', label: 'Edit Cell', icon: <Pencil size={14} /> },
  { id: 'copy', type: 'action', label: 'Copy', icon: <Copy size={14} />, shortcut: 'Ctrl+C' },
  { id: 'divider1', type: 'divider' },
  { id: 'add-row', type: 'action', label: 'Add Row' },
  { id: 'add-column', type: 'action', label: 'Add Column' },
  { id: 'divider2', type: 'divider' },
  { id: 'delete-row', type: 'action', label: 'Delete Row', destructive: true },
  { id: 'delete-column', type: 'action', label: 'Delete Column', destructive: true },
];

const PAGE_MENU_ITEMS: MenuItem[] = [
  { id: 'add-page-before', type: 'action', label: 'Add Page Before' },
  { id: 'add-page-after', type: 'action', label: 'Add Page After' },
  { id: 'divider1', type: 'divider' },
  { id: 'duplicate-page', type: 'action', label: 'Duplicate Page' },
  { id: 'delete-page', type: 'action', label: 'Delete Page', icon: <Trash2 size={14} />, destructive: true },
];

export const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  visible,
  elementType,
  onClose,
  onAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, onClose]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const getMenuItems = (): MenuItem[] => {
    switch (elementType) {
      case 'text':
        return TEXT_MENU_ITEMS;
      case 'image':
        return IMAGE_MENU_ITEMS;
      case 'table':
        return TABLE_MENU_ITEMS;
      case 'section':
        return SECTION_MENU_ITEMS;
      case 'page':
        return PAGE_MENU_ITEMS;
      default:
        return TEXT_MENU_ITEMS;
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.type === 'submenu') return;
    if (item.disabled) return;
    
    onAction(item.id);
    onClose();
  };

  const handleSubmenuHover = (item: MenuItem, _e: React.MouseEvent) => {
    if (item.type === 'submenu' && item.submenu) {
      setActiveSubmenu(item.id);
    } else {
      setActiveSubmenu(null);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === 'divider') {
      return <div key={item.id} className="border-t border-light-border dark:border-dark-border my-1" />;
    }

    return (
      <div
        key={item.id}
        className={`
          relative flex items-center gap-3 px-3 py-2 cursor-pointer
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-3 dark:hover:bg-elevation-subtle'}
          ${item.destructive ? 'text-harken-error hover:bg-accent-red-light' : 'text-slate-700'}
        `}
        onClick={() => handleItemClick(item)}
        onMouseEnter={(e) => handleSubmenuHover(item, e)}
      >
        <span className="w-4 flex-shrink-0">{item.icon}</span>
        <span className="flex-1 text-sm">{item.label}</span>
        {item.shortcut && (
          <span className="text-xs text-slate-400">{item.shortcut}</span>
        )}
        {item.type === 'submenu' && (
          <ChevronRight size={14} className="text-slate-400" />
        )}

        {/* Submenu */}
        {item.type === 'submenu' && activeSubmenu === item.id && item.submenu && (
          <div
            className="absolute left-full top-0 ml-1 min-w-[160px] bg-surface-1 border border-light-border dark:border-dark-border rounded-lg shadow-lg py-1"
          >
            {item.submenu.map((subItem) => renderMenuItem(subItem))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-surface-1 border border-light-border dark:border-dark-border rounded-lg shadow-xl py-1 animate-fade-in"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {getMenuItems().map(renderMenuItem)}
    </div>
  );
};

export default ContextMenu;


import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2, Bold, Italic, Underline, AlignLeft, AlignCenter, List, Image as ImageIcon, MessageSquare } from 'lucide-react';

interface NotesEditorModalProps {
    isOpen: boolean;
    title: string;
    content: string;
    onClose: () => void;
    onSave?: () => void; // Optional if saving happens onInput or via external state management
    onInput: (content: string) => void;
    applyFormatting?: (format: string) => void; // Optional, can be internal if we move logic here, but keeping API compatible for now
}

export const NotesEditorModal: React.FC<NotesEditorModalProps> = ({
    isOpen,
    title,
    content,
    onClose,
    onSave,
    onInput,
    applyFormatting: externalApplyFormatting
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fallback formatting logic if not provided
    const applyFormatting = (command: string, value?: string) => {
        if (externalApplyFormatting) {
            externalApplyFormatting(command);
            return;
        }
        document.execCommand(command, false, value);
        // Focus back on editor
        const editor = document.getElementById('notes-editor');
        if (editor) editor.focus();
    };

    if (!isOpen) return null;

    // Fullscreen mode - centered modal with blur
    if (isFullscreen) {
        return createPortal(
            <div className="fixed inset-0 z-[99999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-0">
                <div
                    className="bg-surface-1 dark:bg-elevation-1 w-full h-full rounded-none shadow-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gradient-action-start to-gradient-action-end px-5 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-white/80" />
                            <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                                Editing Notes: {title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="p-1 rounded hover:bg-surface-1/20 transition-colors text-white mr-1"
                                title="Exit Full Screen"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1 rounded hover:bg-surface-1/20 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Formatting Toolbar */}
                    <div className="px-5 py-3 border-b border-light-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1 flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => applyFormatting('bold')}
                            className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Bold"
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => applyFormatting('italic')}
                            className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Italic"
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => applyFormatting('underline')}
                            className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Underline"
                        >
                            <Underline className="w-4 h-4" />
                        </button>
                        <div className="w-px h-5 bg-surface-4 dark:bg-elevation-muted mx-1"></div>
                        <button
                            onClick={() => applyFormatting('justifyLeft')}
                            className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Align Left"
                        >
                            <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => applyFormatting('justifyCenter')}
                            className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Align Center"
                        >
                            <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => applyFormatting('insertUnorderedList')}
                            className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Bullet List"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Rich Text Editor */}
                    <div className="p-5 flex-1 flex flex-col min-h-0 bg-surface-1 dark:bg-elevation-1 overflow-hidden">
                        <div
                            id="notes-editor"
                            contentEditable
                            onInput={(e) => onInput(e.currentTarget.innerHTML)}
                            dangerouslySetInnerHTML={{ __html: content }}
                            className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-harken-blue/30 focus:border-harken-blue overflow-y-auto transition-all empty:before:content-['Type_your_analysis_and_assumptions_here...'] empty:before:text-slate-400 dark:bg-elevation-1/50 flex-1 text-base leading-relaxed p-6"
                        />
                    </div>

                    {/* Actions */}
                    <div className="px-5 py-4 bg-surface-2 dark:bg-elevation-2 border-t border-light-border dark:border-dark-border flex items-center justify-end gap-3 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-surface-4 dark:hover:bg-elevation-muted rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (onSave) onSave();
                                onClose();
                            }}
                            className="px-6 py-2 bg-harken-blue hover:bg-harken-blue/90 text-white font-bold rounded-lg shadow-sm transition-all transform active:scale-95"
                        >
                            Save Notes
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // Compact mode - side panel without blur
    return createPortal(
        <>
            {/* Invisible click-catcher layer */}
            <div 
                className="fixed inset-0 z-[99998]" 
                onClick={onClose}
            />
            
            {/* Side panel */}
            <div 
                className="fixed top-1/2 right-8 -translate-y-1/2 z-[99999] w-[480px] max-h-[85vh] bg-surface-1 dark:bg-elevation-1 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-gradient-action-start to-gradient-action-end px-5 py-3 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-white/80" />
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                            Editing Notes: {title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="p-1 rounded hover:bg-surface-1/20 transition-colors text-white mr-1"
                            title="Full Screen"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-surface-1/20 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Formatting Toolbar */}
                <div className="px-5 py-3 border-b border-light-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1 flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => applyFormatting('bold')}
                        className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => applyFormatting('italic')}
                        className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => applyFormatting('underline')}
                        className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Underline"
                    >
                        <Underline className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-surface-4 dark:bg-elevation-muted mx-1"></div>
                    <button
                        onClick={() => applyFormatting('justifyLeft')}
                        className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => applyFormatting('justifyCenter')}
                        className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Align Center"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => applyFormatting('insertUnorderedList')}
                        className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Rich Text Editor */}
                <div className="p-5 flex-1 flex flex-col min-h-0 bg-surface-1 dark:bg-elevation-1">
                    <div
                        id="notes-editor"
                        contentEditable
                        onInput={(e) => onInput(e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ __html: content }}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-harken-blue/30 focus:border-harken-blue overflow-y-auto transition-all empty:before:content-['Type_your_analysis_and_assumptions_here...'] empty:before:text-slate-400 dark:bg-elevation-1/50 min-h-[192px]"
                        style={{ minHeight: '192px' }}
                    />
                </div>

                {/* Actions */}
                <div className="px-5 py-4 bg-surface-2 dark:bg-elevation-2 border-t border-light-border dark:border-dark-border flex items-center justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-surface-4 dark:hover:bg-elevation-muted rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (onSave) onSave();
                            onClose();
                        }}
                        className="px-6 py-2 bg-harken-blue hover:bg-harken-blue/90 text-white font-bold rounded-lg shadow-sm transition-all transform active:scale-95"
                    >
                        Save Notes
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
};

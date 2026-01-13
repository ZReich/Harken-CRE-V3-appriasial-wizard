/**
 * FindReplacePanel - Find and Replace overlay for Report Editor
 * 
 * Features:
 * - Search across all report content
 * - Replace single or all matches
 * - Keyboard shortcuts (Ctrl+F to open, Escape to close)
 * - Match highlighting and navigation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronUp, ChevronDown, Replace, ReplaceAll } from 'lucide-react';

// =================================================================
// TYPES
// =================================================================

export interface SearchResult {
  elementId: string;
  matchIndex: number;
  startIndex: number;
  endIndex: number;
  context: string;
}

interface FindReplacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (term: string, caseSensitive: boolean) => SearchResult[];
  onReplace: (term: string, replacement: string, all?: boolean) => number;
  onNavigateToMatch: (result: SearchResult) => void;
  searchResults: SearchResult[];
  currentMatchIndex: number;
  onCurrentMatchChange: (index: number) => void;
}

// =================================================================
// MAIN COMPONENT
// =================================================================

export function FindReplacePanel({
  isOpen,
  onClose,
  onSearch,
  onReplace,
  onNavigateToMatch,
  searchResults,
  currentMatchIndex,
  onCurrentMatchChange,
}: FindReplacePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when panel opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      onSearch(term, caseSensitive);
    }
  }, [onSearch, caseSensitive]);

  // Navigate to next match
  const handleNextMatch = useCallback(() => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchResults.length;
    onCurrentMatchChange(nextIndex);
    onNavigateToMatch(searchResults[nextIndex]);
  }, [searchResults, currentMatchIndex, onCurrentMatchChange, onNavigateToMatch]);

  // Navigate to previous match
  const handlePrevMatch = useCallback(() => {
    if (searchResults.length === 0) return;
    const prevIndex = currentMatchIndex === 0 ? searchResults.length - 1 : currentMatchIndex - 1;
    onCurrentMatchChange(prevIndex);
    onNavigateToMatch(searchResults[prevIndex]);
  }, [searchResults, currentMatchIndex, onCurrentMatchChange, onNavigateToMatch]);

  // Handle replace single
  const handleReplace = useCallback(() => {
    if (searchTerm && replaceTerm !== undefined) {
      const replaced = onReplace(searchTerm, replaceTerm, false);
      if (replaced > 0) {
        // Re-search to update results
        onSearch(searchTerm, caseSensitive);
      }
    }
  }, [searchTerm, replaceTerm, onReplace, onSearch, caseSensitive]);

  // Handle replace all
  const handleReplaceAll = useCallback(() => {
    if (searchTerm && replaceTerm !== undefined) {
      const replaced = onReplace(searchTerm, replaceTerm, true);
      if (replaced > 0) {
        // Re-search to update results
        onSearch(searchTerm, caseSensitive);
      }
    }
  }, [searchTerm, replaceTerm, onReplace, onSearch, caseSensitive]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleNextMatch();
      }
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        handlePrevMatch();
      }
      // Ctrl+H focuses replace field
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowReplace(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNextMatch, handlePrevMatch]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Search size={16} className="text-[#0da1c7]" />
          Find & Replace
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
        >
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 space-y-2">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Find..."
            className="w-full pl-3 pr-20 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/30 focus:border-[#0da1c7]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchResults.length > 0 && (
              <span className="text-xs text-slate-500 mr-1">
                {currentMatchIndex + 1}/{searchResults.length}
              </span>
            )}
            <button
              onClick={handlePrevMatch}
              disabled={searchResults.length === 0}
              className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous match (Shift+Enter)"
            >
              <ChevronUp size={14} className="text-slate-500" />
            </button>
            <button
              onClick={handleNextMatch}
              disabled={searchResults.length === 0}
              className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next match (Enter)"
            >
              <ChevronDown size={14} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Options Row */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => {
                setCaseSensitive(e.target.checked);
                if (searchTerm) {
                  onSearch(searchTerm, e.target.checked);
                }
              }}
              className="w-3.5 h-3.5 rounded border-slate-300 text-[#0da1c7] focus:ring-[#0da1c7]/30"
            />
            Case sensitive
          </label>
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
              showReplace
                ? 'bg-[#0da1c7]/10 text-[#0da1c7]'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Replace
          </button>
        </div>

        {/* Replace Section */}
        {showReplace && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Replace with..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/30 focus:border-[#0da1c7]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReplace}
                disabled={searchResults.length === 0 || !searchTerm}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#0da1c7] text-white rounded-lg hover:bg-[#0da1c7]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Replace size={14} />
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={searchResults.length === 0 || !searchTerm}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ReplaceAll size={14} />
                Replace All
              </button>
            </div>
          </div>
        )}

        {/* No results message */}
        {searchTerm && searchResults.length === 0 && (
          <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            No matches found for "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}

export default FindReplacePanel;

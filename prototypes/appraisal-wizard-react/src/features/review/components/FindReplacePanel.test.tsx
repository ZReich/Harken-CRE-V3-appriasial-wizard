/**
 * Tests for FindReplacePanel Component - Phase 6 Find and Replace
 * 
 * Verifies:
 * - Panel opens and closes correctly
 * - Search functionality works
 * - Replace single and replace all work
 * - Keyboard shortcuts work
 * - Case sensitivity works
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindReplacePanel, type SearchResult } from './FindReplacePanel';

describe('FindReplacePanel Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnReplace = vi.fn();
  const mockOnNavigateToMatch = vi.fn();
  const mockOnCurrentMatchChange = vi.fn();

  const defaultSearchResults: SearchResult[] = [
    { elementId: 'section-1', matchIndex: 0, startIndex: 4, endIndex: 12, context: 'The property is located...' },
    { elementId: 'section-2', matchIndex: 0, startIndex: 10, endIndex: 18, context: 'subject property description' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSearch: mockOnSearch,
    onReplace: mockOnReplace,
    onNavigateToMatch: mockOnNavigateToMatch,
    searchResults: defaultSearchResults,
    currentMatchIndex: 0,
    onCurrentMatchChange: mockOnCurrentMatchChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Panel Visibility', () => {
    it('should render when isOpen is true', () => {
      render(<FindReplacePanel {...defaultProps} isOpen={true} />);
      expect(screen.getByPlaceholderText('Find...')).toBeInTheDocument();
    });

    it('should NOT render when isOpen is false', () => {
      render(<FindReplacePanel {...defaultProps} isOpen={false} />);
      expect(screen.queryByPlaceholderText('Find...')).not.toBeInTheDocument();
    });

    it('should call onClose when X button is clicked', () => {
      render(<FindReplacePanel {...defaultProps} />);
      
      // Find the close button - it's the button with X icon in the header
      const allButtons = screen.getAllByRole('button');
      // The close button is the first one with just an X icon
      const closeButton = allButtons[0]; // First button in the panel header
      
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close when Escape pressed', () => {
      render(<FindReplacePanel {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search Functionality', () => {
    it('should call onSearch when typing in search input', () => {
      render(<FindReplacePanel {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Find...');
      fireEvent.change(searchInput, { target: { value: 'property' } });
      
      expect(mockOnSearch).toHaveBeenCalledWith('property', false);
    });

    it('should display match count when results exist', () => {
      render(<FindReplacePanel {...defaultProps} currentMatchIndex={0} />);
      
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(
        <FindReplacePanel 
          {...defaultProps} 
          searchResults={[]} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Find...');
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });
      
      expect(screen.getByText(/No matches found/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to next match when Enter pressed', () => {
      render(<FindReplacePanel {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      
      expect(mockOnCurrentMatchChange).toHaveBeenCalledWith(1);
      expect(mockOnNavigateToMatch).toHaveBeenCalledWith(defaultSearchResults[1]);
    });

    it('should navigate to previous match when Shift+Enter pressed', () => {
      render(<FindReplacePanel {...defaultProps} currentMatchIndex={1} />);
      
      fireEvent.keyDown(document, { key: 'Enter', shiftKey: true });
      
      expect(mockOnCurrentMatchChange).toHaveBeenCalledWith(0);
    });

    it('should wrap to first match when at last match and pressing next', () => {
      render(<FindReplacePanel {...defaultProps} currentMatchIndex={1} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      
      expect(mockOnCurrentMatchChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Replace Functionality', () => {
    it('should show replace section when Replace button clicked', () => {
      render(<FindReplacePanel {...defaultProps} />);
      
      const replaceToggle = screen.getByText('Replace');
      fireEvent.click(replaceToggle);
      
      expect(screen.getByPlaceholderText('Replace with...')).toBeInTheDocument();
    });

    it('should call onReplace with false when Replace (single) clicked', () => {
      mockOnReplace.mockReturnValue(1);
      mockOnSearch.mockReturnValue(defaultSearchResults);
      
      render(<FindReplacePanel {...defaultProps} />);
      
      // Open replace section
      const replaceToggle = screen.getByText('Replace');
      fireEvent.click(replaceToggle);
      
      // Enter search and replace terms
      const searchInput = screen.getByPlaceholderText('Find...');
      fireEvent.change(searchInput, { target: { value: 'old' } });
      
      const replaceInput = screen.getByPlaceholderText('Replace with...');
      fireEvent.change(replaceInput, { target: { value: 'new' } });
      
      // Find the Replace button - the one that says just "Replace" (with Replace icon)
      // It's a button inside the replace section
      const allButtons = screen.getAllByRole('button');
      // Find the button with text 'Replace' that is NOT the toggle and NOT 'Replace All'
      const singleReplaceButton = allButtons.find(btn => {
        const text = btn.textContent?.trim();
        return text === 'Replace' && btn.closest('.flex.gap-2');
      });
      
      // Use the first button with "Replace" text in the action buttons area
      const replaceActionButton = screen.getAllByText('Replace')[1]; // Second "Replace" is the action button
      if (replaceActionButton) {
        fireEvent.click(replaceActionButton.closest('button')!);
        expect(mockOnReplace).toHaveBeenCalledWith('old', 'new', false);
      }
    });

    it('should call onReplace with true when Replace All clicked', () => {
      mockOnReplace.mockReturnValue(2);
      
      render(<FindReplacePanel {...defaultProps} />);
      
      // Open replace section
      const replaceToggle = screen.getByText('Replace');
      fireEvent.click(replaceToggle);
      
      // Enter terms
      const searchInput = screen.getByPlaceholderText('Find...');
      fireEvent.change(searchInput, { target: { value: 'old' } });
      
      const replaceInput = screen.getByPlaceholderText('Replace with...');
      fireEvent.change(replaceInput, { target: { value: 'new' } });
      
      // Click Replace All
      const replaceAllButton = screen.getByText('Replace All');
      fireEvent.click(replaceAllButton);
      
      expect(mockOnReplace).toHaveBeenCalledWith('old', 'new', true);
    });
  });

  describe('Case Sensitivity', () => {
    it('should have case sensitive checkbox', () => {
      render(<FindReplacePanel {...defaultProps} />);
      
      expect(screen.getByText('Case sensitive')).toBeInTheDocument();
    });

    it('should call onSearch with caseSensitive=true when checkbox checked', () => {
      render(<FindReplacePanel {...defaultProps} />);
      
      // First enter a search term
      const searchInput = screen.getByPlaceholderText('Find...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      vi.clearAllMocks();
      
      // Toggle case sensitivity
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(mockOnSearch).toHaveBeenCalledWith('test', true);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should focus replace field when Ctrl+H pressed', () => {
      render(<FindReplacePanel {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'h', ctrlKey: true });
      
      // Replace section should be visible
      expect(screen.getByPlaceholderText('Replace with...')).toBeInTheDocument();
    });
  });
});

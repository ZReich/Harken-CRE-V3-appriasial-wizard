/**
 * Tests for PropertiesPanelSimplified Component - Phase 1 Cleanup
 * 
 * Verifies:
 * - Content textarea is removed
 * - Edit button is removed
 * - Copy button copies text to clipboard
 * - Delete button works correctly
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PropertiesPanelSimplified } from './PropertiesPanelSimplified';
import type { ElementStyles, ElementContent } from './PropertiesPanelSimplified';

describe('PropertiesPanelSimplified Component', () => {
  const mockOnStyleChange = vi.fn();
  const mockOnDeleteElement = vi.fn();
  const mockOnSave = vi.fn();

  const defaultElementStyles: ElementStyles = {
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontWeight: 'normal',
    color: '#1c3643',
    textAlign: 'left',
  };

  const defaultElementContent: ElementContent = {
    'test-element': {
      text: 'Sample text content for testing',
      styles: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('No Element Selected State', () => {
    it('shows "No Element Selected" when no element is selected', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement={null}
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      expect(screen.getByText('No Element Selected')).toBeInTheDocument();
    });

    it('shows helper text when no element is selected', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement={null}
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      expect(screen.getByText(/Click on any text, image, or section/)).toBeInTheDocument();
    });
  });

  describe('Content Textarea Removal (Phase 1)', () => {
    it('should NOT render content textarea', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      // Content textarea should not exist
      expect(screen.queryByPlaceholderText('Enter text content...')).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /content/i })).not.toBeInTheDocument();
    });

    it('should NOT render Content label', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      // Content label should not exist as a standalone section header
      const contentLabels = screen.queryAllByText('Content');
      // Should have zero Content labels (we removed the textarea section)
      expect(contentLabels.length).toBe(0);
    });
  });

  describe('Edit Button Removal (Phase 1)', () => {
    it('should NOT render Edit button', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  describe('Copy Button Functionality (Phase 1)', () => {
    it('renders Copy button', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('copies text to clipboard when Copy button is clicked', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      const copyButton = screen.getByText('Copy').closest('button');
      expect(copyButton).toBeInTheDocument();
      
      fireEvent.click(copyButton!);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('Sample text content for testing');
      });
    });

    it('handles clipboard error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockClipboard = {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard access denied')),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      const copyButton = screen.getByText('Copy').closest('button');
      fireEvent.click(copyButton!);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy text:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Delete Button Functionality', () => {
    it('renders Delete button', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onDeleteElement when Delete button is clicked', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      const deleteButton = screen.getByText('Delete').closest('button');
      fireEvent.click(deleteButton!);

      expect(mockOnDeleteElement).toHaveBeenCalledTimes(1);
    });
  });

  describe('Quick Actions Grid', () => {
    it('renders Copy and Delete buttons in 2-column grid', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      // Quick Actions section exists
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      
      // Both buttons exist
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      
      // Edit button should NOT exist
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  describe('Typography Controls', () => {
    it('renders font family selector', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      expect(screen.getByDisplayValue('Montserrat')).toBeInTheDocument();
    });

    it('calls onStyleChange when font family is changed', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      const fontSelect = screen.getByDisplayValue('Montserrat');
      fireEvent.change(fontSelect, { target: { value: 'Georgia' } });

      expect(mockOnStyleChange).toHaveBeenCalledWith({ fontFamily: 'Georgia' });
    });

    it('calls onStyleChange when font size is changed', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
        />
      );

      const sizeSelect = screen.getByDisplayValue('14px');
      fireEvent.change(sizeSelect, { target: { value: '18' } });

      expect(mockOnStyleChange).toHaveBeenCalledWith({ fontSize: 18 });
    });
  });

  describe('Save Button', () => {
    it('shows Save button when isDirty is true', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
          isDirty={true}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('does NOT show Save button when isDirty is false', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
          isDirty={false}
          onSave={mockOnSave}
        />
      );

      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
      render(
        <PropertiesPanelSimplified
          selectedElement="test-element"
          elementStyles={defaultElementStyles}
          elementContent={defaultElementContent}
          onStyleChange={mockOnStyleChange}
          onDeleteElement={mockOnDeleteElement}
          isDirty={true}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByText('Save Changes'));
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });
});

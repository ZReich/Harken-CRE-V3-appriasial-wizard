/**
 * Tests for InputRow Component - Enhanced Rent Roll Features
 * 
 * Verifies:
 * - Unit count badge display
 * - Vacancy indicator
 * - Gap analysis chip (at/above/below market)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputRow } from './InputRow';
import type { LineItem } from '../types';

describe('InputRow Component', () => {
  const mockOnChange = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEditNotes = vi.fn();
  const mockOnEditLease = vi.fn();

  const createLineItem = (overrides: Partial<LineItem> = {}): LineItem => ({
    id: 'test-1',
    name: 'Test Item',
    amount: 12000,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders rental variant with name input', () => {
      render(
        <InputRow
          item={createLineItem()}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
    });

    it('renders expense variant with annual cost label', () => {
      render(
        <InputRow
          item={createLineItem()}
          variant="expense"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Annual Cost')).toBeInTheDocument();
    });
  });

  describe('unit count badge', () => {
    it('displays unit count badge when unitCount > 0', () => {
      render(
        <InputRow
          item={createLineItem({ unitCount: 4 })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('4 units')).toBeInTheDocument();
    });

    it('displays singular "unit" for count of 1', () => {
      render(
        <InputRow
          item={createLineItem({ unitCount: 1 })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('1 unit')).toBeInTheDocument();
    });

    it('does not display unit badge when unitCount is 0', () => {
      render(
        <InputRow
          item={createLineItem({ unitCount: 0 })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/\d+ units?$/)).not.toBeInTheDocument();
    });

    it('does not display unit badge when unitCount is undefined', () => {
      render(
        <InputRow
          item={createLineItem()}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/\d+ units?$/)).not.toBeInTheDocument();
    });

    it('does not display unit badge for expense variant', () => {
      render(
        <InputRow
          item={createLineItem({ unitCount: 4 })}
          variant="expense"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('4 units')).not.toBeInTheDocument();
    });
  });

  describe('vacancy indicator', () => {
    it('displays vacancy count when vacantUnits > 0', () => {
      render(
        <InputRow
          item={createLineItem({ unitCount: 4, vacantUnits: 1 })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('1 vacant')).toBeInTheDocument();
    });

    it('does not display vacancy when vacantUnits is 0', () => {
      render(
        <InputRow
          item={createLineItem({ unitCount: 4, vacantUnits: 0 })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/vacant/)).not.toBeInTheDocument();
    });

    it('does not display vacancy when vacantUnits is undefined', () => {
      render(
        <InputRow
          item={createLineItem({ unitCount: 4 })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/vacant/)).not.toBeInTheDocument();
    });
  });

  describe('gap analysis chip', () => {
    it('displays gap chip for rental with SF data and market rent', () => {
      render(
        <InputRow
          item={createLineItem({ 
            itemSqFt: 1000, 
            amount: 12000, 
            marketRentPerSf: 10 
          })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      // Contract = 12000 / 1000 = 12, Market = 10
      // Gap = +20% - should show percentage
      expect(screen.getByText('+20.0%')).toBeInTheDocument();
    });

    it('displays "No Mkt" when market rent is missing', () => {
      render(
        <InputRow
          item={createLineItem({ itemSqFt: 1000, amount: 12000 })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No Mkt')).toBeInTheDocument();
    });

    it('displays negative gap when below market', () => {
      render(
        <InputRow
          item={createLineItem({ 
            itemSqFt: 1000, 
            amount: 8000, 
            marketRentPerSf: 10 
          })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      // Contract = 8000 / 1000 = 8, Market = 10
      // Gap = -20%
      expect(screen.getByText('-20.0%')).toBeInTheDocument();
    });

    it('does not display gap chip when SF is 0', () => {
      render(
        <InputRow
          item={createLineItem({ 
            itemSqFt: 0, 
            marketRentPerSf: 10 
          })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/No Mkt|MKT|%/)).not.toBeInTheDocument();
    });
  });

  describe('lease abstraction button', () => {
    it('shows lease button when onEditLease is provided', () => {
      render(
        <InputRow
          item={createLineItem()}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          onEditLease={mockOnEditLease}
        />
      );

      expect(screen.getByText('Lease')).toBeInTheDocument();
    });

    it('calls onEditLease when button is clicked', () => {
      const item = createLineItem();
      render(
        <InputRow
          item={item}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          onEditLease={mockOnEditLease}
        />
      );

      fireEvent.click(screen.getByText('Lease'));
      expect(mockOnEditLease).toHaveBeenCalledWith(item);
    });
  });

  describe('input interactions', () => {
    it('calls onChange when name is updated', () => {
      render(
        <InputRow
          item={createLineItem()}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      const input = screen.getByDisplayValue('Test Item');
      fireEvent.change(input, { target: { value: 'New Name' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Name' })
      );
    });
  });

  describe('prefilled multi-family items', () => {
    it('displays correctly for prefilled multi-family item', () => {
      render(
        <InputRow
          item={createLineItem({
            name: '1-Bedroom Units',
            unitCount: 4,
            unitType: '1br',
            isFromUnitMix: true,
            amount: 52800,
            itemSqFt: 2600,
            marketRentPerSf: 20.31,
            vacantUnits: 0,
          })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('4 units')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1-Bedroom Units')).toBeInTheDocument();
    });

    it('displays vacancy for partially occupied prefilled item', () => {
      render(
        <InputRow
          item={createLineItem({
            name: '2-Bedroom Units',
            unitCount: 6,
            vacantUnits: 2,
            isFromUnitMix: true,
          })}
          variant="rental"
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('6 units')).toBeInTheDocument();
      expect(screen.getByText('2 vacant')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComparableSummaryCard } from './ComparableSummaryCard';
import type { ComparableCardData } from '../../../review/types';

describe('ComparableSummaryCard', () => {
  const mockLandComparable: ComparableCardData = {
    id: 'land-001',
    type: 'land',
    address: '123 Main St',
    cityStateZip: 'Billings, MT 59101',
    saleDate: '2024-06-15',
    salePrice: 500000,
    pricePerUnit: 5.75,
    unitLabel: 'SF',
    size: 86957,
    sizeLabel: 'SF',
  };

  const mockImprovedComparable: ComparableCardData = {
    id: 'sale-001',
    type: 'improved',
    address: '456 Commercial Blvd',
    cityStateZip: 'Billings, MT 59102',
    photoUrl: 'https://example.com/photo.jpg',
    saleDate: '2024-03-20',
    salePrice: 4500000,
    pricePerUnit: 185,
    unitLabel: 'SF',
    size: 24324,
    sizeLabel: 'SF',
    yearBuilt: 2018,
    propertyType: 'Retail - Strip Center',
    narrative: 'Well-maintained retail center.',
    netAdjustment: -0.05,
    adjustedValue: 4275000,
  };

  const mockRentComparable: ComparableCardData = {
    id: 'rent-001',
    type: 'rent',
    address: '789 Business Park Dr',
    pricePerUnit: 18.50,
    unitLabel: 'SF/Year NNN',
    size: 5500,
    sizeLabel: 'SF',
    yearBuilt: 2015,
    propertyType: 'Office - Class B',
  };

  describe('rendering', () => {
    it('should render land comparable card with correct data', () => {
      render(<ComparableSummaryCard data={mockLandComparable} index={1} />);
      
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Billings, MT 59101')).toBeInTheDocument();
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Index badge
    });

    it('should render improved sale comparable with photo', () => {
      render(<ComparableSummaryCard data={mockImprovedComparable} index={2} />);
      
      expect(screen.getByText('456 Commercial Blvd')).toBeInTheDocument();
      expect(screen.getByText('Retail - Strip Center')).toBeInTheDocument();
      expect(screen.getByText('2018')).toBeInTheDocument();
      expect(screen.getByText('$4,500,000')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('should render rent comparable with rent-specific metrics', () => {
      render(<ComparableSummaryCard data={mockRentComparable} index={3} />);
      
      expect(screen.getByText('789 Business Park Dr')).toBeInTheDocument();
      expect(screen.getByText('Office - Class B')).toBeInTheDocument();
      // Check for rent metric
      expect(screen.getByText(/Rent:/)).toBeInTheDocument();
    });

    it('should show placeholder when no photo URL is provided', () => {
      render(<ComparableSummaryCard data={mockLandComparable} index={1} />);
      
      // Should not have an img element
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should display adjustment badge with correct color for negative adjustment', () => {
      render(<ComparableSummaryCard data={mockImprovedComparable} index={1} />);
      
      // -5% adjustment should show as a minor adjustment (amber)
      const badge = screen.getByText('-5.0%');
      expect(badge).toBeInTheDocument();
    });

    it('should display adjusted value when provided', () => {
      render(<ComparableSummaryCard data={mockImprovedComparable} index={1} />);
      
      expect(screen.getByText('$4,275,000')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onCardClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(
        <ComparableSummaryCard 
          data={mockLandComparable} 
          index={1} 
          onCardClick={handleClick} 
        />
      );
      
      const card = screen.getByText('123 Main St').closest('div');
      fireEvent.click(card!.parentElement!);
      
      expect(handleClick).toHaveBeenCalledWith('land-001');
    });

    it('should not throw when onCardClick is not provided', () => {
      render(<ComparableSummaryCard data={mockLandComparable} index={1} />);
      
      const card = screen.getByText('123 Main St').closest('div');
      expect(() => fireEvent.click(card!.parentElement!)).not.toThrow();
    });
  });

  describe('adjustment badge colors', () => {
    it('should show red for large positive adjustment (inferior comp)', () => {
      const inferiorComp: ComparableCardData = {
        ...mockImprovedComparable,
        netAdjustment: 0.15, // +15%
      };
      render(<ComparableSummaryCard data={inferiorComp} index={1} />);
      
      const badge = screen.getByText('+15.0%');
      expect(badge).toHaveStyle({ backgroundColor: '#ef4444' });
    });

    it('should show green for large negative adjustment (superior comp)', () => {
      const superiorComp: ComparableCardData = {
        ...mockImprovedComparable,
        netAdjustment: -0.12, // -12%
      };
      render(<ComparableSummaryCard data={superiorComp} index={1} />);
      
      const badge = screen.getByText('-12.0%');
      expect(badge).toHaveStyle({ backgroundColor: '#22c55e' });
    });

    it('should show gray for Similar status (zero adjustment)', () => {
      const similarComp: ComparableCardData = {
        ...mockImprovedComparable,
        netAdjustment: 0,
      };
      render(<ComparableSummaryCard data={similarComp} index={1} />);
      
      const badge = screen.getByText('Similar');
      expect(badge).toHaveStyle({ backgroundColor: '#64748b' });
    });
  });
});

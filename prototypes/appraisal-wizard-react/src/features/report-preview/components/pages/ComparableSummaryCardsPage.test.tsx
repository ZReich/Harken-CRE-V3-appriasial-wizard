import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparableSummaryCardsPage, splitComparablesIntoPages } from './ComparableSummaryCardsPage';
import type { ComparableCardsPageData, ComparableCardData } from '../../../review/types';

// Factory function to create mock comparables
const createMockComparable = (id: string, index: number): ComparableCardData => ({
  id,
  type: 'improved',
  address: `${100 + index} Test Street`,
  cityStateZip: `City ${index}, MT 59101`,
  saleDate: '2024-06-15',
  salePrice: 1000000 + (index * 100000),
  pricePerUnit: 150 + index,
  unitLabel: 'SF',
  size: 10000 + (index * 500),
  sizeLabel: 'SF',
  yearBuilt: 2015 + index,
  propertyType: 'Retail',
});

describe('ComparableSummaryCardsPage', () => {
  const createPageData = (count: number): ComparableCardsPageData => ({
    approachType: 'sales',
    scenarioId: 1,
    scenarioName: 'As Is',
    comparables: Array.from({ length: count }, (_, i) => 
      createMockComparable(`comp-${i + 1}`, i + 1)
    ),
  });

  describe('rendering', () => {
    it('should render page header with approach title', () => {
      render(<ComparableSummaryCardsPage data={createPageData(1)} />);
      
      expect(screen.getByText('Improved Sales Comparison')).toBeInTheDocument();
      expect(screen.getByText('As Is Valuation')).toBeInTheDocument();
    });

    it('should render scenario badge with correct color', () => {
      render(<ComparableSummaryCardsPage data={createPageData(1)} />);
      
      const badge = screen.getByText('As Is');
      expect(badge).toHaveStyle({ backgroundColor: '#3b82f6' }); // blue
    });

    it('should render green badge for As Completed scenario', () => {
      const data: ComparableCardsPageData = {
        ...createPageData(1),
        scenarioName: 'As Completed',
      };
      render(<ComparableSummaryCardsPage data={data} />);
      
      const badge = screen.getByText('As Completed');
      expect(badge).toHaveStyle({ backgroundColor: '#22c55e' }); // green
    });

    it('should render purple badge for As Stabilized scenario', () => {
      const data: ComparableCardsPageData = {
        ...createPageData(1),
        scenarioName: 'As Stabilized',
      };
      render(<ComparableSummaryCardsPage data={data} />);
      
      const badge = screen.getByText('As Stabilized');
      expect(badge).toHaveStyle({ backgroundColor: '#a855f7' }); // purple
    });

    it('should render summary stats on first page', () => {
      render(<ComparableSummaryCardsPage data={createPageData(3)} pageNumber={1} />);
      
      // Find the summary section by looking for the "Comparables" label
      expect(screen.getByText('Comparables')).toBeInTheDocument();
      // The count appears with the label - verify the parent container exists
      const summarySection = screen.getByText('Comparables').closest('.grid');
      expect(summarySection).toBeInTheDocument();
    });

    it('should not render summary stats on page 2+', () => {
      render(<ComparableSummaryCardsPage data={createPageData(6)} pageNumber={2} />);
      
      // Summary stats section should not be present
      expect(screen.queryByText('Comparables')).not.toBeInTheDocument();
    });

    it('should render empty state when no comparables', () => {
      render(<ComparableSummaryCardsPage data={createPageData(0)} />);
      
      expect(screen.getByText('No comparables available')).toBeInTheDocument();
    });
  });

  describe('card rendering with various counts', () => {
    it('should render 1 card when 1 comparable provided', () => {
      render(<ComparableSummaryCardsPage data={createPageData(1)} />);
      
      expect(screen.getByText('101 Test Street')).toBeInTheDocument();
    });

    it('should render 3 cards when 3 comparables provided', () => {
      render(<ComparableSummaryCardsPage data={createPageData(3)} />);
      
      expect(screen.getByText('101 Test Street')).toBeInTheDocument();
      expect(screen.getByText('102 Test Street')).toBeInTheDocument();
      expect(screen.getByText('103 Test Street')).toBeInTheDocument();
    });

    it('should only render first 3 cards on page 1 when 6 provided', () => {
      render(<ComparableSummaryCardsPage data={createPageData(6)} pageNumber={1} />);
      
      expect(screen.getByText('101 Test Street')).toBeInTheDocument();
      expect(screen.getByText('102 Test Street')).toBeInTheDocument();
      expect(screen.getByText('103 Test Street')).toBeInTheDocument();
      expect(screen.queryByText('104 Test Street')).not.toBeInTheDocument();
    });

    it('should render cards 4-6 on page 2 when 6 provided', () => {
      render(<ComparableSummaryCardsPage data={createPageData(6)} pageNumber={2} />);
      
      expect(screen.queryByText('101 Test Street')).not.toBeInTheDocument();
      expect(screen.getByText('104 Test Street')).toBeInTheDocument();
      expect(screen.getByText('105 Test Street')).toBeInTheDocument();
      expect(screen.getByText('106 Test Street')).toBeInTheDocument();
    });

    it('should handle 10 comparables across 4 pages', () => {
      const data = createPageData(10);
      
      // Page 1: cards 1-3
      const { rerender } = render(
        <ComparableSummaryCardsPage data={data} pageNumber={1} totalPages={4} />
      );
      expect(screen.getByText('Page 1 of 4')).toBeInTheDocument();
      
      // Page 4: card 10 only
      rerender(
        <ComparableSummaryCardsPage data={data} pageNumber={4} totalPages={4} />
      );
      expect(screen.getByText('110 Test Street')).toBeInTheDocument();
    });
  });

  describe('land comparables', () => {
    it('should render correct title for land approach', () => {
      const landData: ComparableCardsPageData = {
        ...createPageData(1),
        approachType: 'land',
      };
      render(<ComparableSummaryCardsPage data={landData} />);
      
      expect(screen.getByText('Land Sales Comparison')).toBeInTheDocument();
    });
  });

  describe('rent comparables', () => {
    it('should render correct title for rent approach', () => {
      const rentData: ComparableCardsPageData = {
        ...createPageData(1),
        approachType: 'rent',
        comparables: [{
          id: 'rent-1',
          type: 'rent',
          address: '123 Rent St',
          pricePerUnit: 18.50,
          unitLabel: 'SF/Year',
          size: 5000,
          sizeLabel: 'SF',
        }],
      };
      render(<ComparableSummaryCardsPage data={rentData} />);
      
      expect(screen.getByText('Rent Comparable Analysis')).toBeInTheDocument();
    });
  });
});

describe('splitComparablesIntoPages', () => {
  const createPageData = (count: number): ComparableCardsPageData => ({
    approachType: 'sales',
    scenarioId: 1,
    scenarioName: 'As Is',
    comparables: Array.from({ length: count }, (_, i) => 
      createMockComparable(`comp-${i + 1}`, i + 1)
    ),
  });

  it('should return 1 page for 3 or fewer comparables', () => {
    const pages = splitComparablesIntoPages(createPageData(3));
    expect(pages).toHaveLength(1);
    expect(pages[0][0].comparables).toHaveLength(3);
  });

  it('should return 2 pages for 4-6 comparables', () => {
    const pages = splitComparablesIntoPages(createPageData(6));
    expect(pages).toHaveLength(2);
    expect(pages[0][0].comparables).toHaveLength(3);
    expect(pages[1][0].comparables).toHaveLength(3);
  });

  it('should return 4 pages for 10 comparables', () => {
    const pages = splitComparablesIntoPages(createPageData(10));
    expect(pages).toHaveLength(4);
    expect(pages[0][0].comparables).toHaveLength(3);
    expect(pages[1][0].comparables).toHaveLength(3);
    expect(pages[2][0].comparables).toHaveLength(3);
    expect(pages[3][0].comparables).toHaveLength(1);
  });

  it('should return 1 page for empty comparables', () => {
    const pages = splitComparablesIntoPages(createPageData(0));
    expect(pages).toHaveLength(1);
    expect(pages[0][0].comparables).toHaveLength(0);
  });

  it('should preserve scenario data across pages', () => {
    const data: ComparableCardsPageData = {
      ...createPageData(5),
      scenarioName: 'As Completed',
    };
    const pages = splitComparablesIntoPages(data);
    
    pages.forEach(page => {
      expect(page[0].scenarioName).toBe('As Completed');
      expect(page[0].approachType).toBe('sales');
    });
  });

  it('should support custom cards per page', () => {
    const pages = splitComparablesIntoPages(createPageData(10), 5);
    expect(pages).toHaveLength(2);
    expect(pages[0][0].comparables).toHaveLength(5);
    expect(pages[1][0].comparables).toHaveLength(5);
  });
});

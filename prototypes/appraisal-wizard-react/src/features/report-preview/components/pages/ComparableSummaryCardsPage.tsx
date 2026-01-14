/**
 * ComparableSummaryCardsPage - ROVE-style 3 Cards Per Page Layout
 * ================================================================
 * 
 * Renders comparable property cards in a compact format suitable for
 * professional appraisal reports. Each page contains up to 3 comparable
 * cards with photos, metrics, and adjustment summaries.
 * 
 * Features:
 * - 3 cards per page layout (optimal for 8.5x11 format)
 * - Automatic page splitting for large datasets
 * - Support for land, improved sale, and rent comparables
 * - Scenario-aware header styling
 */

import React from 'react';
import type { ComparableCardData, ComparableCardsPageData } from '../../../review/types';
import { ComparableSummaryCard } from './ComparableSummaryCard';
import { ReportPageBase } from './ReportPageBase';

interface ComparableSummaryCardsPageProps {
  data: ComparableCardsPageData;
  /** Internal page index for cards pagination (1-based within the comparable-cards section) */
  pageNumber?: number;
  /** Report page number for footer/sidebar (keeps ReportEditor numbering correct) */
  reportPageNumber?: number;
  totalPages?: number;
  onCardClick?: (id: string) => void;
}

/**
 * Gets the approach title based on type
 */
const getApproachTitle = (type: ComparableCardsPageData['approachType']): string => {
  switch (type) {
    case 'land':
      return 'Land Sales Comparison';
    case 'sales':
      return 'Improved Sales Comparison';
    case 'rent':
      return 'Rent Comparable Analysis';
    default:
      return 'Comparable Analysis';
  }
};

/**
 * Gets the scenario color based on name
 */
const getScenarioColor = (scenarioName: string): string => {
  const lower = scenarioName.toLowerCase();
  if (lower.includes('completed') || lower.includes('prospective')) {
    return '#22c55e'; // green
  } else if (lower.includes('stabilized')) {
    return '#a855f7'; // purple
  }
  return '#3b82f6'; // blue (As Is default)
};

export const ComparableSummaryCardsPage: React.FC<ComparableSummaryCardsPageProps> = ({
  data,
  pageNumber = 1,
  reportPageNumber,
  totalPages = 1,
  onCardClick,
}) => {
  const { approachType, scenarioId, scenarioName, comparables } = data;
  const scenarioColor = getScenarioColor(scenarioName);

  // Calculate which cards to show on this page (3 per page)
  const cardsPerPage = 3;
  const startIndex = (pageNumber - 1) * cardsPerPage;
  const pageCards = comparables.slice(startIndex, startIndex + cardsPerPage);

  const getSidebarLabel = () => {
    switch (approachType) {
      case 'land': return 'LAND SALES';
      case 'sales': return 'SALES';
      case 'rent': return 'RENT COMP';
      default: return 'COMPARABLES';
    }
  };

  return (
    <ReportPageBase
      title={getApproachTitle(approachType)}
      sidebarLabel={getSidebarLabel()}
      pageNumber={reportPageNumber ?? pageNumber}
      sectionNumber={6}
      sectionTitle="VALUATION"
      contentPadding="p-10"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2" style={{ borderColor: scenarioColor }}>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {getApproachTitle(approachType)}
          </h2>
          <p className="text-sm text-slate-500">
            {scenarioName} Valuation
          </p>
        </div>
        <div className="text-right">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: scenarioColor }}
          >
            {scenarioName}
          </span>
          {totalPages > 1 && (
            <p className="text-xs text-slate-400 mt-1">
              Page {pageNumber} of {totalPages}
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats (first page only) */}
      {pageNumber === 1 && comparables.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{comparables.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Comparables</p>
          </div>
          {approachType !== 'rent' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {formatPriceRange(comparables, 'salePrice')}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Price Range</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {formatAverage(comparables, 'pricePerUnit')}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Avg $/Unit</p>
              </div>
            </>
          )}
          {approachType === 'rent' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {formatPriceRange(comparables, 'pricePerUnit')}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Rent Range</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {formatAverage(comparables, 'pricePerUnit')}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Avg Rent/SF</p>
              </div>
            </>
          )}
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">
              {formatSizeRange(comparables)}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Size Range</p>
          </div>
        </div>
      )}

      {/* Comparable Cards */}
      <div className="space-y-4">
        {pageCards.map((card, idx) => (
          <ComparableSummaryCard
            key={card.id}
            data={card}
            index={startIndex + idx + 1}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      {/* Empty State */}
      {pageCards.length === 0 && (
        <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
          <div className="text-center text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>No comparables available</p>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <div className="mt-auto pt-4 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>
          {getApproachTitle(approachType)} - {scenarioName}
        </p>
      </div>
    </ReportPageBase>
  );
};

/**
 * Helper function to format price range
 */
function formatPriceRange(cards: ComparableCardData[], field: 'salePrice' | 'pricePerUnit'): string {
  const values = cards.map(c => c[field]).filter((v): v is number => v !== undefined && v !== null);
  if (values.length === 0) return 'N/A';
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  if (min === max) {
    return formatCompact(min);
  }
  
  return `${formatCompact(min)} - ${formatCompact(max)}`;
}

/**
 * Helper function to format size range
 */
function formatSizeRange(cards: ComparableCardData[]): string {
  const values = cards.map(c => c.size).filter((v): v is number => v !== undefined && v !== null);
  if (values.length === 0) return 'N/A';
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  if (min === max) {
    return formatCompact(min);
  }
  
  return `${formatCompact(min)} - ${formatCompact(max)}`;
}

/**
 * Helper function to format average
 */
function formatAverage(cards: ComparableCardData[], field: 'pricePerUnit'): string {
  const values = cards.map(c => c[field]).filter((v): v is number => v !== undefined && v !== null);
  if (values.length === 0) return 'N/A';
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return `$${formatCompact(avg)}`;
}

/**
 * Helper to format numbers compactly
 */
function formatCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
}

/**
 * Utility to split comparables into multiple pages
 */
export function splitComparablesIntoPages(
  data: ComparableCardsPageData,
  cardsPerPage = 3
): ComparableCardsPageData[][] {
  const pages: ComparableCardsPageData[][] = [];
  const totalPages = Math.ceil(data.comparables.length / cardsPerPage);
  
  for (let i = 0; i < totalPages; i++) {
    const startIdx = i * cardsPerPage;
    const pageComps = data.comparables.slice(startIdx, startIdx + cardsPerPage);
    pages.push([{
      ...data,
      comparables: pageComps,
    }]);
  }
  
  return pages.length > 0 ? pages : [[data]];
}

export default ComparableSummaryCardsPage;

/**
 * ComparableSummaryCard - ROVE-style Comparable Summary Card
 * ===========================================================
 * 
 * A compact card component for displaying comparable property data.
 * Designed to fit 3 cards per page in the ROVE evaluation style.
 * 
 * Features:
 * - Photo thumbnail (left side)
 * - Property name and address
 * - Key metrics (SF, price, $/SF, date)
 * - Brief narrative description (if available)
 * - Adjustment summary indicator
 */

import React from 'react';
import type { ComparableCardData } from '../../../review/types';

interface ComparableSummaryCardProps {
  data: ComparableCardData;
  index: number; // 1-based index for display
  onCardClick?: (id: string) => void;
}

/**
 * Formats a number as currency
 */
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a number with commas
 */
const formatNumber = (value: number | undefined, decimals = 0): string => {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formats a date string
 */
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Gets the adjustment badge color and text
 */
const getAdjustmentBadge = (adjustment: number | undefined): { color: string; text: string } => {
  if (adjustment === undefined || adjustment === null) {
    return { color: '#64748b', text: 'N/A' };
  }
  
  const percentage = Math.abs(adjustment * 100);
  const sign = adjustment >= 0 ? '+' : '-';
  
  if (adjustment > 0.1) {
    return { color: '#ef4444', text: `${sign}${percentage.toFixed(1)}%` }; // Inferior - needs + adjustment
  } else if (adjustment < -0.1) {
    return { color: '#22c55e', text: `${sign}${percentage.toFixed(1)}%` }; // Superior - needs - adjustment
  } else if (adjustment !== 0) {
    return { color: '#f59e0b', text: `${sign}${percentage.toFixed(1)}%` }; // Minor adjustment
  }
  return { color: '#64748b', text: 'Similar' };
};

export const ComparableSummaryCard: React.FC<ComparableSummaryCardProps> = ({
  data,
  index,
  onCardClick,
}) => {
  const adjustmentBadge = getAdjustmentBadge(data.netAdjustment);

  return (
    <div
      className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onCardClick?.(data.id)}
      style={{ minHeight: '160px' }}
    >
      {/* Photo Thumbnail - Left Side */}
      <div className="flex-shrink-0 w-32 h-32 relative">
        {data.photoUrl ? (
          <img
            src={data.photoUrl}
            alt={`Comparable ${index}`}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 rounded-md flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Index Badge */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {index}
        </div>
      </div>

      {/* Content - Right Side */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Header Row */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 truncate">
            {data.address}
          </h4>
          {data.cityStateZip && (
            <p className="text-xs text-slate-500 truncate">
              {data.cityStateZip}
            </p>
          )}
          {data.propertyType && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
              {data.propertyType}
            </span>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
          {data.type === 'rent' ? (
            // Rent comparable metrics
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500">Rent:</span>
                <span className="text-sm font-medium text-slate-800">
                  {formatCurrency(data.pricePerUnit)}/{data.unitLabel || 'SF'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500">Size:</span>
                <span className="text-sm font-medium text-slate-800">
                  {formatNumber(data.size)} {data.sizeLabel || 'SF'}
                </span>
              </div>
            </>
          ) : (
            // Sale comparable metrics (land or improved)
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500">Price:</span>
                <span className="text-sm font-medium text-slate-800">
                  {formatCurrency(data.salePrice)}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500">Date:</span>
                <span className="text-sm font-medium text-slate-800">
                  {formatDate(data.saleDate)}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500">
                  ${data.unitLabel || 'SF'}:
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {formatCurrency(data.pricePerUnit)}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500">Size:</span>
                <span className="text-sm font-medium text-slate-800">
                  {formatNumber(data.size)} {data.sizeLabel || 'SF'}
                </span>
              </div>
            </>
          )}
          {data.yearBuilt && (
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-500">Built:</span>
              <span className="text-sm font-medium text-slate-800">
                {data.yearBuilt}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Row - Adjustment & Adjusted Value */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Net Adj:</span>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: adjustmentBadge.color }}
            >
              {adjustmentBadge.text}
            </span>
          </div>
          {data.adjustedValue !== undefined && (
            <div className="text-right">
              <span className="text-xs text-slate-500">Adj. Value: </span>
              <span className="text-sm font-semibold text-slate-800">
                {formatCurrency(data.adjustedValue)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparableSummaryCard;

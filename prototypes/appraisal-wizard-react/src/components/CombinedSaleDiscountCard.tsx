/**
 * CombinedSaleDiscountCard.tsx
 * Card for configuring combined sale discount in reconciliation.
 * Used when selling multiple components together as a package.
 */

import React, { useState, useCallback } from 'react';
import { Percent, Info, Calculator, TrendingDown } from 'lucide-react';
import type { CombinedSaleDiscount } from '../types';

interface CombinedSaleDiscountCardProps {
  discount: CombinedSaleDiscount | undefined;
  onChange: (discount: CombinedSaleDiscount | undefined) => void;
  sumOfParts: number;
  className?: string;
}

const DEFAULT_RATIONALE = 
  'Properties sold together typically trade at a discount compared to the sum of individual component values due to a more limited buyer pool capable of acquiring a mixed-use property of this nature.';

export function CombinedSaleDiscountCard({
  discount,
  onChange,
  sumOfParts,
  className = '',
}: CombinedSaleDiscountCardProps) {
  const [isExpanded, setIsExpanded] = useState(discount?.enabled || false);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate discounted value
  const discountPercentage = discount?.percentage || 10;
  const discountAmount = sumOfParts * (discountPercentage / 100);
  const discountedValue = sumOfParts - discountAmount;

  // Handle toggle
  const handleToggle = useCallback(() => {
    if (discount?.enabled) {
      // Disable discount
      onChange({ ...discount, enabled: false });
    } else {
      // Enable discount with defaults
      onChange({
        enabled: true,
        percentage: discount?.percentage || 10,
        rationale: discount?.rationale || DEFAULT_RATIONALE,
      });
    }
  }, [discount, onChange]);

  // Handle percentage change
  const handlePercentageChange = useCallback((value: number) => {
    onChange({
      enabled: true,
      percentage: value,
      rationale: discount?.rationale || DEFAULT_RATIONALE,
    });
  }, [discount?.rationale, onChange]);

  // Handle rationale change
  const handleRationaleChange = useCallback((value: string) => {
    onChange({
      enabled: true,
      percentage: discount?.percentage || 10,
      rationale: value,
    });
  }, [discount?.percentage, onChange]);

  return (
    <div className={`bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-harken-gray/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-border dark:border-harken-gray/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
            <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-harken-dark dark:text-white">
              Combined Sale Discount
            </h3>
            <p className="text-xs text-harken-gray-med dark:text-slate-400">
              Apply discount for selling all components together
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            discount?.enabled
              ? 'bg-amber-500'
              : 'bg-harken-gray-light dark:bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              discount?.enabled ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Content - shows when enabled */}
      {discount?.enabled && (
        <div className="p-5 space-y-4">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              The sum of individual component values is typically higher than the combined market value 
              due to a more limited buyer pool for mixed-use properties.
            </p>
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-xs font-medium text-harken-gray-med dark:text-slate-400 mb-2">
              Discount Percentage
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={discountPercentage}
                onChange={(e) => handlePercentageChange(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <Percent className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={discountPercentage}
                  onChange={(e) => handlePercentageChange(Number(e.target.value))}
                  className="w-12 bg-transparent text-sm font-bold text-amber-700 dark:text-amber-400 text-center outline-none"
                />
              </div>
            </div>
          </div>

          {/* Calculation Display */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
              <span className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-0.5">
                Sum of Parts
              </span>
              <span className="text-sm font-bold text-harken-dark dark:text-white">
                {formatCurrency(sumOfParts)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <span className="block text-[10px] uppercase tracking-wide text-red-600 dark:text-red-400 mb-0.5">
                Discount
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ({formatCurrency(discountAmount)})
              </span>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
              <span className="block text-[10px] uppercase tracking-wide text-green-600 dark:text-green-400 mb-0.5">
                Combined Value
              </span>
              <span className="text-sm font-bold text-green-700 dark:text-green-400">
                {formatCurrency(discountedValue)}
              </span>
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="block text-xs font-medium text-harken-gray-med dark:text-slate-400 mb-2">
              Discount Rationale
            </label>
            <textarea
              value={discount.rationale || ''}
              onChange={(e) => handleRationaleChange(e.target.value)}
              placeholder="Explain the rationale for the combined sale discount..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-sm text-harken-dark dark:text-white placeholder:text-harken-gray-med focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Use Default Button */}
          {discount.rationale !== DEFAULT_RATIONALE && (
            <button
              onClick={() => handleRationaleChange(DEFAULT_RATIONALE)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              Use default rationale
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CombinedSaleDiscountCard;

/**
 * DCFProjectionPage - Discounted Cash Flow Analysis
 * ===================================================
 * 
 * Renders a full-page DCF analysis with 10-year cash flow projections.
 * Includes assumptions, yearly projections table, reversion calculation,
 * and sensitivity analysis matrix.
 * 
 * Features:
 * - 10-year cash flow projection table
 * - Present value calculations
 * - Terminal/reversion value
 * - Sensitivity analysis (optional)
 * - Scenario-aware styling
 */

import React from 'react';
import type { DCFProjectionPageData } from '../../../review/types';

interface DCFProjectionPageProps {
  data: DCFProjectionPageData;
  pageNumber?: number;
}

/**
 * Formats a number as currency
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a percentage
 */
const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

/**
 * Formats a decimal as percentage
 */
const formatPvFactor = (value: number): string => {
  return value.toFixed(6);
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

export const DCFProjectionPage: React.FC<DCFProjectionPageProps> = ({
  data,
  pageNumber = 1,
}) => {
  const {
    scenarioName,
    holdingPeriod,
    discountRate,
    terminalCapRate,
    annualGrowthRate,
    yearlyProjections,
    reversionValue,
    pvReversion,
    totalPresentValue,
  } = data;

  const scenarioColor = getScenarioColor(scenarioName);

  // Calculate totals for summary
  const totalNoi = yearlyProjections.reduce((sum, yr) => sum + yr.noi, 0);
  const totalPvCashFlows = yearlyProjections.reduce((sum, yr) => sum + yr.pvCashFlow, 0);

  return (
    <div
      className="bg-white shadow-lg overflow-hidden"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '0.5in',
        boxSizing: 'border-box',
      }}
    >
      {/* Page Header */}
      <div
        className="flex items-center justify-between mb-6 pb-3 border-b-2"
        style={{ borderColor: scenarioColor }}
      >
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Discounted Cash Flow Analysis
          </h2>
          <p className="text-sm text-slate-500">{scenarioName} Valuation</p>
        </div>
        <div className="text-right">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: scenarioColor }}
          >
            {scenarioName}
          </span>
          {pageNumber && (
            <p className="text-xs text-slate-400 mt-1">Page {pageNumber}</p>
          )}
        </div>
      </div>

      {/* Assumptions Section */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          DCF Assumptions
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{holdingPeriod}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Holding Period (Years)
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">
              {formatPercent(discountRate)}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Discount Rate
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">
              {formatPercent(terminalCapRate)}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Terminal Cap Rate
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">
              {formatPercent(annualGrowthRate)}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Annual Growth Rate
            </p>
          </div>
        </div>
      </div>

      {/* Cash Flow Projections Table */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          {holdingPeriod}-Year Cash Flow Projection
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="py-2 px-3 text-left font-semibold text-slate-700 border-b border-slate-200">
                Year
              </th>
              <th className="py-2 px-3 text-right font-semibold text-slate-700 border-b border-slate-200">
                Net Operating Income
              </th>
              <th className="py-2 px-3 text-right font-semibold text-slate-700 border-b border-slate-200">
                PV Factor
              </th>
              <th className="py-2 px-3 text-right font-semibold text-slate-700 border-b border-slate-200">
                Present Value
              </th>
            </tr>
          </thead>
          <tbody>
            {yearlyProjections.map((yr, idx) => (
              <tr
                key={yr.year}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                <td className="py-2 px-3 text-left text-slate-800 border-b border-slate-100">
                  Year {yr.year}
                </td>
                <td className="py-2 px-3 text-right text-slate-800 border-b border-slate-100">
                  {formatCurrency(yr.noi)}
                </td>
                <td className="py-2 px-3 text-right text-slate-600 border-b border-slate-100">
                  {formatPvFactor(yr.pvFactor)}
                </td>
                <td className="py-2 px-3 text-right font-medium text-slate-800 border-b border-slate-100">
                  {formatCurrency(yr.pvCashFlow)}
                </td>
              </tr>
            ))}
            {/* Subtotal Row */}
            <tr className="bg-slate-100 font-medium">
              <td className="py-2 px-3 text-left text-slate-700 border-b border-slate-200">
                Subtotal - Cash Flows
              </td>
              <td className="py-2 px-3 text-right text-slate-700 border-b border-slate-200">
                {formatCurrency(totalNoi)}
              </td>
              <td className="py-2 px-3 text-right text-slate-700 border-b border-slate-200">
                —
              </td>
              <td className="py-2 px-3 text-right text-slate-800 border-b border-slate-200">
                {formatCurrency(totalPvCashFlows)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Reversion Calculation */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Reversion Calculation
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Year {holdingPeriod} NOI</p>
            <p className="text-lg font-medium text-slate-800">
              {yearlyProjections.length > 0
                ? formatCurrency(yearlyProjections[yearlyProjections.length - 1].noi)
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">
              ÷ Terminal Cap Rate ({formatPercent(terminalCapRate)})
            </p>
            <p className="text-lg font-medium text-slate-800">
              {formatCurrency(reversionValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Present Value of Reversion</p>
            <p className="text-lg font-semibold" style={{ color: scenarioColor }}>
              {formatCurrency(pvReversion)}
            </p>
          </div>
        </div>
      </div>

      {/* Value Conclusion */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: `${scenarioColor}10`, border: `2px solid ${scenarioColor}` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">
              DCF Value Conclusion
            </h3>
            <p className="text-xs text-slate-500">
              PV of Cash Flows ({formatCurrency(totalPvCashFlows)}) + PV of Reversion ({formatCurrency(pvReversion)})
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: scenarioColor }}>
              {formatCurrency(totalPresentValue)}
            </p>
            <p className="text-xs text-slate-500">Total Present Value</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>
          Discounted Cash Flow Analysis - {scenarioName} - {holdingPeriod}-Year Holding Period
        </p>
      </div>
    </div>
  );
};

export default DCFProjectionPage;

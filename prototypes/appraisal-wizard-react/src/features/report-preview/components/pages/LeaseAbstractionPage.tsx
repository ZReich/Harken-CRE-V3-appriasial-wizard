/**
 * LeaseAbstractionPage - Per-Tenant Lease Detail Page
 * =====================================================
 * 
 * Renders a full-page lease abstraction for a single tenant.
 * Displays comprehensive lease information including terms,
 * rent schedule, escalations, and options.
 * 
 * Features:
 * - Tenant information section
 * - Premises details
 * - Rent escalation schedule
 * - Options and TI summary
 * - Expense recovery terms
 */

import React from 'react';
import type { LeaseAbstractionPageData } from '../../../review/types';

interface LeaseAbstractionPageProps {
  data: LeaseAbstractionPageData;
  pageNumber?: number;
  scenarioName?: string;
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
 * Formats a number with decimals
 */
const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formats a date string
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Gets tenant type badge color
 */
const getTenantTypeColor = (type: LeaseAbstractionPageData['tenantType']): string => {
  switch (type) {
    case 'national':
      return '#3b82f6'; // blue
    case 'regional':
      return '#22c55e'; // green
    case 'local':
      return '#f59e0b'; // amber
    case 'government':
      return '#6366f1'; // indigo
    case 'non_profit':
      return '#8b5cf6'; // purple
    default:
      return '#64748b'; // slate
  }
};

/**
 * Formats tenant type for display
 */
const formatTenantType = (type: LeaseAbstractionPageData['tenantType']): string => {
  switch (type) {
    case 'national':
      return 'National Credit';
    case 'regional':
      return 'Regional';
    case 'local':
      return 'Local';
    case 'government':
      return 'Government';
    case 'non_profit':
      return 'Non-Profit';
    default:
      return 'Unknown';
  }
};

/**
 * Calculates lease term in years and months
 */
const calculateLeaseTerm = (startDate: string, endDate: string): string => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} Year${years !== 1 ? 's' : ''}`;
    }
    return `${years} Year${years !== 1 ? 's' : ''}, ${remainingMonths} Month${remainingMonths !== 1 ? 's' : ''}`;
  } catch {
    return 'N/A';
  }
};

export const LeaseAbstractionPage: React.FC<LeaseAbstractionPageProps> = ({
  data,
  pageNumber = 1,
  scenarioName = 'As Is',
}) => {
  const {
    tenantName,
    tenantLegalName,
    tenantType,
    suiteNumber,
    leasedSqFt,
    leaseType,
    leaseStartDate,
    leaseEndDate,
    currentBaseRent,
    rentPerSf,
    escalations = [],
    options = [],
    notes,
  } = data;

  const tenantTypeColor = getTenantTypeColor(tenantType);
  const leaseTerm = calculateLeaseTerm(leaseStartDate, leaseEndDate);

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
      <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Lease Abstraction
          </h2>
          <p className="text-sm text-slate-500">{scenarioName} - Income Approach</p>
        </div>
        {pageNumber && (
          <span className="text-sm text-slate-400">Page {pageNumber}</span>
        )}
      </div>

      {/* Tenant Header */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{tenantName}</h3>
            {tenantLegalName && tenantLegalName !== tenantName && (
              <p className="text-sm text-slate-500 mt-1">
                Legal Name: {tenantLegalName}
              </p>
            )}
          </div>
          {tenantType && (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: tenantTypeColor }}
            >
              {formatTenantType(tenantType)}
            </span>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Premises Details */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Premises Details
          </h4>
          <table className="w-full text-sm">
            <tbody>
              {suiteNumber && (
                <tr>
                  <td className="py-1.5 text-slate-500">Suite Number:</td>
                  <td className="py-1.5 text-right font-medium text-slate-800">
                    {suiteNumber}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-1.5 text-slate-500">Leased Area:</td>
                <td className="py-1.5 text-right font-medium text-slate-800">
                  {formatNumber(leasedSqFt, 0)} SF
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-500">Lease Type:</td>
                <td className="py-1.5 text-right font-medium text-slate-800">
                  {leaseType}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Lease Term */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Lease Term
          </h4>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1.5 text-slate-500">Commencement:</td>
                <td className="py-1.5 text-right font-medium text-slate-800">
                  {formatDate(leaseStartDate)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-500">Expiration:</td>
                <td className="py-1.5 text-right font-medium text-slate-800">
                  {formatDate(leaseEndDate)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-500">Term:</td>
                <td className="py-1.5 text-right font-medium text-slate-800">
                  {leaseTerm}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rent Schedule */}
      <div className="mb-6 p-4 border border-slate-200 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Rent Schedule
        </h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(currentBaseRent)}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Annual Base Rent
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(currentBaseRent / 12)}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Monthly Rent
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">
              ${rentPerSf ? formatNumber(rentPerSf, 2) : formatNumber(currentBaseRent / leasedSqFt, 2)}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Rent per SF
            </p>
          </div>
        </div>

        {/* Escalations */}
        {escalations.length > 0 && (
          <div className="mt-4">
            <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Escalations
            </h5>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-2 px-3 text-left font-medium text-slate-600">
                    Type
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-slate-600">
                    Rate
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-slate-600">
                    Effective Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {escalations.map((esc, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-800">{esc.type}</td>
                    <td className="py-2 px-3 text-right text-slate-800">
                      {esc.rate ? `${esc.rate}%` : 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {esc.effectiveDate ? formatDate(esc.effectiveDate) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Options */}
      {options.length > 0 && (
        <div className="mb-6 p-4 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Lease Options
          </h4>
          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-800">{opt.type}</p>
                  {opt.terms && (
                    <p className="text-sm text-slate-500 mt-0.5">{opt.terms}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
            Additional Notes
          </h4>
          <p className="text-sm text-slate-600">{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>
          Lease Abstraction - {tenantName} - {leaseType} Lease
        </p>
      </div>
    </div>
  );
};

export default LeaseAbstractionPage;

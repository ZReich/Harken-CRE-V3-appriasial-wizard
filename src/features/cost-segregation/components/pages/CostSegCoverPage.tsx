/**
 * CostSegCoverPage Component
 * 
 * Cover page for the Cost Segregation Report PDF.
 */

import React from 'react';
import type { CostSegAnalysis } from '../../types';

interface CostSegCoverPageProps {
  analysis: CostSegAnalysis;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function CostSegCoverPage({ analysis }: CostSegCoverPageProps) {
  return (
    <div className="min-h-[11in] bg-white p-12 flex flex-col" data-page="cover">
      {/* Top Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        {/* Logo / Branding */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#0da1c7] to-[#0b8fb3] rounded-xl">
            <svg
              viewBox="0 0 40 40"
              className="w-10 h-10 text-white"
              fill="currentColor"
            >
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 20h16M20 12v16" strokeWidth="2" stroke="currentColor" />
            </svg>
            <span className="text-2xl font-bold text-white tracking-wide">HARKEN</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Cost Segregation Study
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          IRS-Compliant Component Depreciation Analysis
        </p>

        {/* Property Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-2xl w-full mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {analysis.propertyAddress}
          </h2>
          
          <div className="grid grid-cols-2 gap-6 text-left">
            <div>
              <div className="text-sm text-gray-500">Property Class</div>
              <div className="font-medium text-gray-900">
                {analysis.propertyClass === 'residential-rental' 
                  ? 'Residential Rental (27.5-Year)' 
                  : 'Nonresidential (39-Year)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Analysis Date</div>
              <div className="font-medium text-gray-900">
                {formatDate(analysis.analysisDate)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Project Cost</div>
              <div className="font-medium text-gray-900">
                {formatCurrency(analysis.totalProjectCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Depreciable Basis</div>
              <div className="font-medium text-gray-900">
                {formatCurrency(analysis.depreciableBasis)}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl w-full">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrency(analysis.taxBenefitProjection.additionalYear1Deductions)}
            </div>
            <div className="text-sm text-emerald-700 mt-1">
              Additional Year 1 Deductions
            </div>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-sky-600">
              {formatCurrency(analysis.taxBenefitProjection.year1TaxSavings)}
            </div>
            <div className="text-sm text-sky-700 mt-1">
              Estimated Year 1 Tax Savings
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {analysis.components.length}
            </div>
            <div className="text-sm text-amber-700 mt-1">
              Components Classified
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Prepared by {analysis.preparedBy || 'Harken Appraisal'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Placement in Service Date: {formatDate(analysis.placementInServiceDate)}
        </p>
      </div>
    </div>
  );
}

export default CostSegCoverPage;


/**
 * CostSegMethodologyPage Component
 * 
 * Methodology and IRS guidelines page for the Cost Seg report.
 */

import React from 'react';
import type { CostSegAnalysis } from '../../types';

interface CostSegMethodologyPageProps {
  analysis: CostSegAnalysis;
  customNarrative?: string;
}

export function CostSegMethodologyPage({ analysis, customNarrative }: CostSegMethodologyPageProps) {
  const defaultNarrative = `
    This Cost Segregation Study was prepared in accordance with Internal Revenue Service 
    guidelines and Treasury Regulations. The study identifies and reclassifies building 
    components into their appropriate depreciation categories as defined by the Modified 
    Accelerated Cost Recovery System (MACRS) under IRC Section 168.
  `;

  return (
    <div className="min-h-[11in] bg-white p-12" data-page="methodology">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Methodology</h1>
          <p className="text-sm text-gray-500 mt-1">Classification Approach & IRS Guidelines</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {analysis.propertyAddress}
        </div>
      </div>

      {/* Introduction */}
      <div className="prose max-w-none mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Study Approach</h2>
        <p className="text-gray-700 leading-relaxed">
          {customNarrative || defaultNarrative.trim()}
        </p>
      </div>

      {/* IRS Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">IRS Guidance Applied</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Primary References</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#0da1c7]">•</span>
                <span>IRC Section 168 - Accelerated Cost Recovery System</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0da1c7]">•</span>
                <span>IRC Section 1245 - Personal Property Definitions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0da1c7]">•</span>
                <span>IRC Section 1250 - Real Property Definitions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0da1c7]">•</span>
                <span>Treasury Regulation 1.263(a)-3 - Building Systems</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Key Court Cases</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#0da1c7]">•</span>
                <span>Hospital Corporation of America v. Commissioner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0da1c7]">•</span>
                <span>Whiteco Industries v. Commissioner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0da1c7]">•</span>
                <span>Morrison v. Commissioner</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Classification Criteria */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Classification Criteria</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50">
            <h3 className="font-medium text-emerald-800 mb-2">5-Year Property</h3>
            <p className="text-sm text-emerald-700">
              Items that are considered personal property, typically not permanently attached 
              or specifically designed for the building. Examples include carpeting, decorative 
              lighting, specialty electrical, and accent finishes.
            </p>
          </div>
          <div className="border border-teal-200 rounded-xl p-4 bg-teal-50">
            <h3 className="font-medium text-teal-800 mb-2">7-Year Property</h3>
            <p className="text-sm text-teal-700">
              Office furniture, fixtures, and equipment with no specific class life. 
              This includes built-in cabinetry, certain HVAC components, and specialized 
              equipment that serves the business.
            </p>
          </div>
          <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
            <h3 className="font-medium text-amber-800 mb-2">15-Year Property</h3>
            <p className="text-sm text-amber-700">
              Land improvements including parking lots, sidewalks, landscaping, fencing, 
              exterior lighting, and other site improvements that are not part of the 
              building structure.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Details */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Methodology</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#0da1c7] text-white text-sm font-medium rounded-full">
              {analysis.methodology === 'detailed-engineering' ? 'Detailed Engineering' :
               analysis.methodology === 'cost-estimate' ? 'Cost Estimate' : 'Hybrid'}
            </span>
          </div>
          <p className="text-gray-700 text-sm">
            This study utilized {analysis.methodology === 'detailed-engineering' 
              ? 'a detailed engineering approach with physical inspection and component-level cost estimation'
              : analysis.methodology === 'cost-estimate'
              ? 'cost estimation methodology based on Marshall & Swift cost data and industry-standard allocation percentages'
              : 'a hybrid approach combining engineering analysis with cost estimation techniques'
            }. Building components were identified, classified according to IRS guidelines, 
            and allocated costs based on their function and relationship to the building structure.
          </p>
          {analysis.methodologyNotes && (
            <p className="text-gray-600 text-sm mt-3 italic">
              Note: {analysis.methodologyNotes}
            </p>
          )}
        </div>
      </div>

      {/* Bonus Depreciation Note */}
      {analysis.bonusDepreciationRate > 0 && (
        <div className="border border-sky-200 rounded-xl p-6 bg-sky-50">
          <h3 className="font-medium text-sky-800 mb-2">Bonus Depreciation</h3>
          <p className="text-sm text-sky-700">
            Eligible 5-year, 7-year, and 15-year property qualifies for first-year bonus 
            depreciation of {(analysis.bonusDepreciationRate * 100).toFixed(0)}% under current 
            tax law. The remaining basis is depreciated over the applicable recovery period 
            using the MACRS rates. Note that bonus depreciation phases down annually through 2026.
          </p>
        </div>
      )}
    </div>
  );
}

export default CostSegMethodologyPage;


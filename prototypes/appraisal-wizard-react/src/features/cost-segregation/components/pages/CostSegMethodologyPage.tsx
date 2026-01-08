/**
 * CostSegMethodologyPage Component
 * 
 * Methodology and IRS compliance documentation for the Cost Segregation report.
 */

import React from 'react';
import type { CostSegAnalysis } from '../../../../types';
import { getBonusDepreciationRate, formatCostSegPercent } from '../../../../services/costSegregationService';

interface CostSegMethodologyPageProps {
  analysis: CostSegAnalysis;
  className?: string;
}

export const CostSegMethodologyPage: React.FC<CostSegMethodologyPageProps> = ({
  analysis,
  className = '',
}) => {
  const taxYear = new Date(analysis.analysisDate).getFullYear();
  const bonusRate = getBonusDepreciationRate(taxYear);

  return (
    <div className={`bg-surface-1 p-12 ${className}`}>
      <h2 className="text-2xl font-bold text-[#1c3643] mb-6 pb-4 border-b-2 border-[#0da1c7]">
        Methodology & IRS Compliance
      </h2>

      {/* Study Approach */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-3">Study Approach</h3>
        <div className="prose prose-slate max-w-none text-sm">
          <p>
            This cost segregation study was prepared using the <strong>Cost Estimate Approach</strong>, 
            which is one of the three IRS-accepted methodologies for cost segregation studies. This 
            approach allocates construction costs to individual building components based on industry-standard 
            cost data and engineering estimates.
          </p>
          <p>
            The allocation percentages are derived from Marshall & Swift cost data, RS Means construction 
            cost references, and industry cost segregation studies for similar property types. Each component 
            is assigned to the appropriate IRS depreciation class based on the criteria established in 
            IRS Revenue Procedure 87-56 and Treasury Decision 9636.
          </p>
        </div>
      </div>

      {/* IRS Authority */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-3">IRS Authority & Legal Basis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-harken-gray-light rounded-lg p-4 border border-light-border">
            <h4 className="font-medium text-slate-900 mb-2">Asset Classification</h4>
            <ul className="text-sm text-harken-gray space-y-1">
              <li>• IRC Section 1245 - Tangible Personal Property</li>
              <li>• IRC Section 1250 - Real Property</li>
              <li>• Revenue Procedure 87-56 - Asset Class Lives</li>
            </ul>
          </div>
          <div className="bg-harken-gray-light rounded-lg p-4 border border-light-border">
            <h4 className="font-medium text-slate-900 mb-2">Depreciation Rules</h4>
            <ul className="text-sm text-harken-gray space-y-1">
              <li>• IRC Section 167 - Depreciation Deduction</li>
              <li>• IRC Section 168 - MACRS Depreciation</li>
              <li>• IRC Section 168(k) - Bonus Depreciation</li>
            </ul>
          </div>
          <div className="bg-harken-gray-light rounded-lg p-4 border border-light-border">
            <h4 className="font-medium text-slate-900 mb-2">Tangible Property Regulations</h4>
            <ul className="text-sm text-harken-gray space-y-1">
              <li>• Treasury Decision 9636 (Final Regulations)</li>
              <li>• Unit of Property Rules</li>
              <li>• Nine Building Systems Framework</li>
            </ul>
          </div>
          <div className="bg-harken-gray-light rounded-lg p-4 border border-light-border">
            <h4 className="font-medium text-slate-900 mb-2">IRS Audit Guide</h4>
            <ul className="text-sm text-harken-gray space-y-1">
              <li>• Cost Segregation Audit Techniques Guide</li>
              <li>• Principal Elements and Minimum Requirements</li>
              <li>• Documentation Standards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Classification Criteria */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-3">Classification Criteria</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-border-muted dark:border-dark-border-muted bg-harken-gray-light">
              <th className="text-left py-3 px-4 font-semibold text-harken-gray">Class</th>
              <th className="text-left py-3 px-4 font-semibold text-harken-gray">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-harken-gray">Key Criteria</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-light-border">
              <td className="py-3 px-4 font-medium text-accent-teal-mint">5-Year</td>
              <td className="py-3 px-4 text-harken-gray">Tangible Personal Property</td>
              <td className="py-3 px-4 text-harken-gray">
                Not inherently permanent; removable without damage; serves business function
              </td>
            </tr>
            <tr className="border-b border-light-border">
              <td className="py-3 px-4 font-medium text-accent-teal-mint">7-Year</td>
              <td className="py-3 px-4 text-harken-gray">Office Furniture & Equipment</td>
              <td className="py-3 px-4 text-harken-gray">
                Default class for personal property not elsewhere classified
              </td>
            </tr>
            <tr className="border-b border-light-border">
              <td className="py-3 px-4 font-medium text-blue-700">15-Year</td>
              <td className="py-3 px-4 text-harken-gray">Land Improvements</td>
              <td className="py-3 px-4 text-harken-gray">
                Improvements to land, not building; inherently permanent but separate from structure
              </td>
            </tr>
            <tr className="border-b border-light-border">
              <td className="py-3 px-4 font-medium text-harken-gray">
                {analysis.isResidential ? '27.5-Year' : '39-Year'}
              </td>
              <td className="py-3 px-4 text-harken-gray">
                {analysis.isResidential ? 'Residential Real Property' : 'Nonresidential Real Property'}
              </td>
              <td className="py-3 px-4 text-harken-gray">
                Structural components; inherently permanent; integral to building
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bonus Depreciation */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-3">Bonus Depreciation ({taxYear})</h3>
        <div className="bg-accent-amber-gold-light border border-accent-amber-gold rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-accent-amber-gold rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {Math.round(bonusRate * 100)}%
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-accent-amber-gold mb-1">
                {taxYear} Bonus Depreciation Rate: {formatCostSegPercent(bonusRate)}
              </h4>
              <p className="text-sm text-accent-amber-gold mb-3">
                Under IRC Section 168(k), eligible property placed in service in {taxYear} qualifies for 
                {formatCostSegPercent(bonusRate)} first-year bonus depreciation. This applies to 5-year, 
                7-year, and 15-year property.
              </p>
              <div className="text-xs text-accent-amber-gold bg-accent-amber-gold-light rounded-lg p-3">
                <strong>TCJA Phase-Down Schedule:</strong> 100% (2022) → 80% (2023) → 60% (2024) → 
                40% (2025) → 20% (2026) → 0% (2027+)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Standards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-3">Documentation Standards</h3>
        <div className="prose prose-slate max-w-none text-sm">
          <p>
            This study meets the documentation requirements outlined in the IRS Cost Segregation 
            Audit Techniques Guide, including:
          </p>
          <ul>
            <li>Clear identification of all building components analyzed</li>
            <li>Cost basis for each component category</li>
            <li>Legal support and citations for asset classifications</li>
            <li>Depreciation calculations using proper MACRS conventions</li>
            <li>Qualification for bonus depreciation where applicable</li>
          </ul>
        </div>
      </div>

      {/* Quality Control */}
      <div className="bg-harken-gray-light rounded-xl p-6 border border-light-border">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Quality Control & Review</h3>
        <p className="text-sm text-harken-gray mb-4">
          This cost segregation study has been prepared in accordance with professional standards 
          and is intended to be used in conjunction with advice from the property owner's tax advisor. 
          The classifications and calculations herein are based on current IRS guidance and are 
          subject to change based on future regulations or court decisions.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-harken-gray-med uppercase tracking-wide mb-1">Methodology</div>
            <div className="font-medium text-slate-900">Cost Estimate Approach</div>
          </div>
          <div>
            <div className="text-xs text-harken-gray-med uppercase tracking-wide mb-1">Components Analyzed</div>
            <div className="font-medium text-slate-900">{analysis.components.length}</div>
          </div>
          <div>
            <div className="text-xs text-harken-gray-med uppercase tracking-wide mb-1">Building Systems</div>
            <div className="font-medium text-slate-900">
              {analysis.buildingSystems.filter(s => s.depreciableCost > 0).length} of 9
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSegMethodologyPage;

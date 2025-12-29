/**
 * CostSegDisclaimerPage Component
 * 
 * Disclaimer and certification page for the Cost Seg report.
 */

import React from 'react';
import type { CostSegAnalysis } from '../../types';
import { COST_SEG_DISCLAIMER } from '../../constants';

interface CostSegDisclaimerPageProps {
  analysis: CostSegAnalysis;
  customDisclaimer?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function CostSegDisclaimerPage({ analysis, customDisclaimer }: CostSegDisclaimerPageProps) {
  return (
    <div className="min-h-[11in] bg-white p-12" data-page="disclaimer">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disclaimer & Certification</h1>
          <p className="text-sm text-gray-500 mt-1">Important Notices</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {analysis.propertyAddress}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-amber-900 mb-4">Disclaimer</h2>
        <p className="text-sm text-amber-800 whitespace-pre-line leading-relaxed">
          {customDisclaimer || COST_SEG_DISCLAIMER}
        </p>
      </div>

      {/* Study Limitations */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Limitations</h2>
        <ul className="text-sm text-gray-700 space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-[#0da1c7] font-bold">1.</span>
            <span>
              This Cost Segregation Study is based on information provided by the property 
              owner and/or obtained from public records. The accuracy of the study is dependent 
              on the accuracy of this information.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0da1c7] font-bold">2.</span>
            <span>
              Cost allocations are based on industry-standard methodologies and may differ 
              from actual construction costs. The allocations represent reasonable estimates 
              based on available data.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0da1c7] font-bold">3.</span>
            <span>
              This study does not constitute a detailed engineering study. For properties 
              with significant specialized equipment or unique construction, a more detailed 
              analysis may be warranted.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0da1c7] font-bold">4.</span>
            <span>
              The IRS may challenge cost segregation positions on audit. Property owners 
              should maintain adequate documentation to support the classifications made 
              in this study.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0da1c7] font-bold">5.</span>
            <span>
              Tax law is subject to change. The depreciation rates and bonus depreciation 
              provisions in effect at the time of this study may be modified by future 
              legislation.
            </span>
          </li>
        </ul>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Professional Consultation</h2>
        <p className="text-sm text-blue-800">
          We recommend that property owners consult with a qualified tax professional 
          before implementing the cost segregation strategy outlined in this study. 
          A tax professional can provide guidance on the specific tax implications for 
          your situation, including consideration of Alternative Minimum Tax (AMT), 
          state tax conformity, and recapture provisions.
        </p>
      </div>

      {/* Study Information */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Information</h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="text-gray-500">Property Address</div>
            <div className="font-medium text-gray-900">{analysis.propertyAddress}</div>
          </div>
          <div>
            <div className="text-gray-500">Analysis Date</div>
            <div className="font-medium text-gray-900">{formatDate(analysis.analysisDate)}</div>
          </div>
          <div>
            <div className="text-gray-500">Prepared By</div>
            <div className="font-medium text-gray-900">{analysis.preparedBy || 'Harken Appraisal'}</div>
          </div>
          <div>
            <div className="text-gray-500">Methodology</div>
            <div className="font-medium text-gray-900">
              {analysis.methodology === 'detailed-engineering' ? 'Detailed Engineering' :
               analysis.methodology === 'cost-estimate' ? 'Cost Estimate' : 'Hybrid'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Placement in Service Date</div>
            <div className="font-medium text-gray-900">{formatDate(analysis.placementInServiceDate)}</div>
          </div>
          <div>
            <div className="text-gray-500">Report Version</div>
            <div className="font-medium text-gray-900">v{analysis.version}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>This Cost Segregation Study was prepared using Harken Appraisal software.</p>
        <p className="mt-1">
          Report generated on {formatDate(analysis.lastModified)}
        </p>
      </div>
    </div>
  );
}

export default CostSegDisclaimerPage;


/**
 * CostSegDisclaimerPage Component
 * 
 * Disclaimer and certification page for the Cost Segregation report.
 */

import React from 'react';
import type { CostSegAnalysis } from '../../../../types';

interface CostSegDisclaimerPageProps {
  analysis: CostSegAnalysis;
  firmName?: string;
  preparerName?: string;
  preparerCredentials?: string;
  className?: string;
}

export const CostSegDisclaimerPage: React.FC<CostSegDisclaimerPageProps> = ({
  analysis,
  firmName = 'Harken Appraisal Services',
  preparerName,
  preparerCredentials,
  className = '',
}) => {
  const analysisDate = new Date(analysis.analysisDate);
  const formattedDate = analysisDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`bg-surface-1 p-12 ${className}`}>
      <h2 className="text-2xl font-bold text-[#1c3643] mb-6 pb-4 border-b-2 border-[#0da1c7]">
        Limiting Conditions & Disclaimer
      </h2>

      {/* General Disclaimer */}
      <div className="prose prose-slate prose-sm max-w-none mb-8">
        <h3>General Disclaimer</h3>
        <p>
          This cost segregation study has been prepared for the purpose of allocating building 
          and site improvement costs to the appropriate IRS depreciation classes. The analysis 
          is based on information provided by the property owner and publicly available data. 
          We have not independently verified all information and assume no responsibility for 
          the accuracy of information supplied by others.
        </p>

        <h3>Tax Advice Disclaimer</h3>
        <p>
          <strong>This study does not constitute tax advice.</strong> The conclusions and 
          recommendations contained herein are intended to assist the property owner and their 
          tax advisors in understanding the potential tax benefits of cost segregation. The 
          property owner should consult with a qualified tax professional (CPA, tax attorney, 
          or enrolled agent) before implementing any tax strategies based on this study.
        </p>

        <h3>IRS Compliance</h3>
        <p>
          While this study has been prepared in accordance with IRS guidelines, including 
          Revenue Procedure 87-56 and Treasury Decision 9636, the final determination of 
          depreciation classifications rests with the Internal Revenue Service. Tax laws and 
          regulations are subject to change and varying interpretations, and there can be no 
          guarantee that the IRS will accept all classifications made in this study.
        </p>

        <h3>Limitations of Methodology</h3>
        <p>
          This study was prepared using the Cost Estimate Approach, which allocates costs 
          based on industry-standard percentages and engineering estimates. The accuracy of 
          the allocations depends on the quality and completeness of the underlying cost data. 
          A detailed engineering-based study or actual cost records may yield different results.
        </p>

        <h3>Bonus Depreciation</h3>
        <p>
          The bonus depreciation rates referenced in this study are based on current tax law 
          as of the date of this report. The Tax Cuts and Jobs Act of 2017 established a 
          phase-down schedule for bonus depreciation, and future legislative changes may 
          affect the availability or rate of bonus depreciation.
        </p>

        <h3>Use of Report</h3>
        <p>
          This report is intended solely for use by the property owner named herein and their 
          designated tax advisors. It may not be reproduced, distributed, or relied upon by 
          third parties without the express written consent of {firmName}.
        </p>
      </div>

      {/* Assumptions */}
      <div className="bg-harken-gray-light border border-light-border rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-slate-900 mb-3">Assumptions & Limiting Conditions</h3>
        <ul className="text-sm text-harken-gray space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-harken-gray-med">1.</span>
            <span>The property is held for use in a trade or business or for the production of income.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-harken-gray-med">2.</span>
            <span>The cost data provided represents the actual cost basis of the property for tax purposes.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-harken-gray-med">3.</span>
            <span>The property has been placed in service and is depreciable under MACRS.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-harken-gray-med">4.</span>
            <span>No elections have been made that would preclude the use of accelerated depreciation methods.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-harken-gray-med">5.</span>
            <span>The property type and use classification provided accurately reflects the actual use of the property.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-harken-gray-med">6.</span>
            <span>For residential rental property, 80% or more of gross rental income is from dwelling units.</span>
          </li>
        </ul>
      </div>

      {/* Certification */}
      <div className="bg-[#1c3643] text-white rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-lg mb-4">Preparer Certification</h3>
        <p className="text-sm text-slate-300 mb-6">
          I certify that this cost segregation study was prepared in accordance with IRS guidelines 
          and represents my professional opinion regarding the classification of building components 
          for depreciation purposes. The analysis was performed using accepted methodologies and is 
          based on information believed to be reliable.
        </p>
        <div className="border-t border-slate-600 pt-4">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Prepared By</div>
              <div className="font-medium">{preparerName || '[Preparer Name]'}</div>
              {preparerCredentials && (
                <div className="text-sm text-slate-300">{preparerCredentials}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Date</div>
              <div className="font-medium">{formattedDate}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Firm</div>
              <div className="font-medium">{firmName}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Property</div>
              <div className="font-medium text-sm">{analysis.propertyName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="text-center text-sm text-harken-gray-med">
        <p className="mb-2">
          For questions regarding this study, please contact:
        </p>
        <p className="font-medium text-harken-gray">{firmName}</p>
      </div>
    </div>
  );
};

export default CostSegDisclaimerPage;

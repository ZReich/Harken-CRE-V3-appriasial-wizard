/**
 * Cost Seg Audit Risk Assessment
 * 
 * Real-time evaluation of IRS audit risk based on allocations,
 * documentation, and industry benchmarks.
 */

import React, { useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { CostSegAuditRisk } from '../types';

interface CostSegAuditRiskProps {
  totalCost: number;
  fiveYearTotal: number;
  fifteenYearTotal: number;
  thirtyNineYearTotal: number;
  hasPhotos: boolean;
  hasMeasurements: boolean;
  propertyType: string;
}

export const CostSegAuditRiskPanel: React.FC<CostSegAuditRiskProps> = ({
  totalCost,
  fiveYearTotal,
  fifteenYearTotal,
  thirtyNineYearTotal,
  hasPhotos,
  hasMeasurements,
  propertyType,
}) => {
  const riskAssessment = useMemo((): CostSegAuditRisk => {
    const personalPropertyPercent = (fiveYearTotal / totalCost) * 100;
    const landImprovementPercent = (fifteenYearTotal / totalCost) * 100;
    const realPropertyPercent = (thirtyNineYearTotal / totalCost) * 100;

    const flags: CostSegAuditRisk['flags'] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Personal property percentage check
    if (personalPropertyPercent > 30) {
      flags.push({
        type: 'warning',
        message: `Personal property allocation (${personalPropertyPercent.toFixed(1)}%) is aggressive`,
        recommendation: 'Ensure all 5-year allocations are well-documented with photos and measurements'
      });
      score -= 20;
    } else if (personalPropertyPercent >= 25) {
      flags.push({
        type: 'info',
        message: `Personal property allocation (${personalPropertyPercent.toFixed(1)}%) is above typical range`,
      });
      score -= 10;
    } else if (personalPropertyPercent < 10) {
      flags.push({
        type: 'info',
        message: 'Consider reviewing for missed personal property opportunities',
      });
    }

    // Documentation checks
    if (!hasPhotos) {
      flags.push({
        type: 'warning',
        message: 'No photos linked to cost seg components',
        recommendation: 'Add photos of key components for IRS audit support'
      });
      score -= 15;
    }

    if (!hasMeasurements) {
      flags.push({
        type: 'warning',
        message: 'No measurements documented',
        recommendation: 'Add measurements (LF, SF, EA) to support allocations'
      });
      score -= 15;
    }

    // Success flags
    if (hasPhotos && hasMeasurements) {
      flags.push({
        type: 'success',
        message: 'Documentation is complete with photos and measurements'
      });
    }

    if (personalPropertyPercent >= 15 && personalPropertyPercent <= 25) {
      flags.push({
        type: 'success',
        message: `Personal property allocation (${personalPropertyPercent.toFixed(1)}%) is within typical range`
      });
    }

    // Overall risk determination
    let overallRisk: 'low' | 'moderate' | 'high';
    if (score >= 80) overallRisk = 'low';
    else if (score >= 60) overallRisk = 'moderate';
    else overallRisk = 'high';

    return {
      overallRisk,
      personalPropertyPercent,
      landImprovementPercent,
      realPropertyPercent,
      flags,
      recommendations,
      score,
    };
  }, [totalCost, fiveYearTotal, fifteenYearTotal, thirtyNineYearTotal, hasPhotos, hasMeasurements]);

  const riskColor = {
    low: { bg: 'bg-accent-teal-mint-light', border: 'border-accent-teal-mint', text: 'text-accent-teal-mint', icon: 'text-accent-teal-mint' },
    moderate: { bg: 'bg-accent-amber-gold-light', border: 'border-accent-amber-gold', text: 'text-accent-amber-gold', icon: 'text-accent-amber-gold' },
    high: { bg: 'bg-accent-red-light', border: 'border-harken-error/20', text: 'text-harken-error', icon: 'text-harken-error' },
  }[riskAssessment.overallRisk];

  return (
    <div className={`border-2 ${riskColor.border} ${riskColor.bg} rounded-xl p-4 space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${riskColor.icon}`} />
          <h3 className={`text-lg font-bold ${riskColor.text}`}>Audit Risk Assessment</h3>
        </div>
        <div className={`px-3 py-1 rounded-full font-bold text-sm ${riskColor.text} bg-surface-1 border ${riskColor.border}`}>
          {riskAssessment.overallRisk.toUpperCase()}
        </div>
      </div>

      {/* Score */}
      <div className="bg-surface-1 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-harken-gray">Risk Score</span>
          <span className={`text-lg font-bold ${riskColor.text}`}>{riskAssessment.score}/100</span>
        </div>
        <div className="h-2 bg-harken-gray-med-lt rounded-full overflow-hidden">
          <div
            className={`h-full ${riskAssessment.overallRisk === 'low' ? 'bg-accent-teal-mint' : riskAssessment.overallRisk === 'moderate' ? 'bg-accent-amber-gold' : 'bg-harken-error'}`}
            style={{ width: `${riskAssessment.score}%` }}
          />
        </div>
      </div>

      {/* Flags */}
      <div className="space-y-2">
        {riskAssessment.flags.map((flag, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 p-2 rounded-lg ${
              flag.type === 'warning'
                ? 'bg-accent-amber-gold-light'
                : flag.type === 'success'
                ? 'bg-accent-teal-mint-light'
                : 'bg-blue-100'
            }`}
          >
            {flag.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-accent-amber-gold mt-0.5 flex-shrink-0" />
            ) : flag.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-accent-teal-mint mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="text-xs flex-1">
              <p className={`font-medium ${flag.type === 'warning' ? 'text-accent-amber-gold' : flag.type === 'success' ? 'text-accent-teal-mint' : 'text-blue-900'}`}>
                {flag.message}
              </p>
              {flag.recommendation && (
                <p className={`mt-1 ${flag.type === 'warning' ? 'text-accent-amber-gold' : 'text-blue-700'}`}>
                  → {flag.recommendation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostSegAuditRiskPanel;

import React, { useMemo } from 'react';
import { X, CheckCircle, AlertTriangle, AlertOctagon, FileCheck } from 'lucide-react';
import type { FinancialSummary, ExpenseData, IncomeData, PropertyMeta, ValuationData } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  summary: FinancialSummary;
  expenses: ExpenseData;
  income: IncomeData;
  propertyMeta: PropertyMeta;
  valuationData?: ValuationData;
  directCapValue?: number;
  dcfValue?: number;
}

interface RiskCheck {
  id: string;
  title: string;
  status: 'pass' | 'warning' | 'danger';
  message: string;
}

export const RiskAnalysisModal: React.FC<Props> = ({ 
  isOpen, onClose, summary, expenses, income, propertyMeta, 
  valuationData, directCapValue = 0, dcfValue = 0 
}) => {
  if (!isOpen) return null;

  // --- ANALYSIS LOGIC ---
  const analysis = useMemo(() => {
    const checks: RiskCheck[] = [];
    let score = 100;

    // --- 1. DATA INTEGRITY ---
    const zeroExpenses = expenses.expenses.filter(e => e.amount === 0);
    if (zeroExpenses.length > 0) {
      checks.push({
        id: 'zero_val',
        title: 'Incomplete Expense Data',
        status: 'warning',
        message: `${zeroExpenses.length} expense item(s) have a $0 value. Please verify.`
      });
      score -= 5;
    } else {
      checks.push({
        id: 'data_ok',
        title: 'Data Integrity',
        status: 'pass',
        message: 'All line items contain valid numerical values.'
      });
    }

    // --- 2. CRITICAL EXPENSES ---
    const hasTaxes = expenses.expenses.some(e => e.name.toLowerCase().includes('tax'));
    const hasInsurance = expenses.expenses.some(e => e.name.toLowerCase().includes('insurance'));

    if (!hasTaxes) {
      checks.push({
        id: 'tax_missing',
        title: 'Missing Real Estate Taxes',
        status: 'danger',
        message: 'Real Estate Taxes are critical for NOI. Lenders will reject this analysis.'
      });
      score -= 20;
    } else {
      checks.push({
        id: 'tax_ok',
        title: 'Real Estate Taxes',
        status: 'pass',
        message: 'Property tax line item identified.'
      });
    }

    if (!hasInsurance) {
      checks.push({
        id: 'ins_missing',
        title: 'Missing Insurance',
        status: 'danger',
        message: 'Property Insurance is required for credible underwriting.'
      });
      score -= 15;
    } else {
      checks.push({
        id: 'ins_ok',
        title: 'Insurance',
        status: 'pass',
        message: 'Property insurance coverage identified.'
      });
    }

    // --- 3. EXPENSE RATIOS ---
    const ratio = summary.expenseRatio;
    let expectedRatioMin = 30;
    
    // NNN Leases (Retail/Industrial/Office) typically have lower landlord expense ratios
    const isCommercial = ['retail', 'industrial', 'office'].includes(propertyMeta.type);
    if (isCommercial) expectedRatioMin = 15;

    if (ratio < expectedRatioMin) {
      checks.push({
        id: 'ratio_low',
        title: 'Low Expense Ratio',
        status: 'warning',
        message: `A ${ratio.toFixed(1)}% expense ratio is low for ${propertyMeta.type}. Verify all OpEx is captured or that leases are absolute NNN.`,
      });
      score -= 5;
    } else if (ratio > 70) {
      checks.push({
        id: 'ratio_high',
        title: 'High Expense Ratio',
        status: 'warning',
        message: `A ${ratio.toFixed(1)}% ratio suggests operational inefficiency or miscategorized CapEx/Debt items.`,
      });
      score -= 10;
    } else {
      checks.push({
        id: 'ratio_ok',
        title: 'Expense Ratio',
        status: 'pass',
        message: `${ratio.toFixed(1)}% is within standard market parameters for this asset class.`,
      });
    }

    // --- 4. REIMBURSEMENTS ---
    if (isCommercial) {
      if (summary.totalReimbursements === 0 && summary.totalExpenses > 0) {
        checks.push({
          id: 'reimb_missing',
          title: 'No Reimbursements',
          status: 'warning',
          message: `Commercial properties usually recapture expenses. Is this a Gross Lease?`,
        });
        score -= 10;
      } else if (summary.totalReimbursements > 0) {
        checks.push({
          id: 'reimb_ok',
          title: 'Expense Recovery',
          status: 'pass',
          message: `Reimbursements of $${summary.totalReimbursements.toLocaleString()} included in revenue.`
        });
      }
    }

    // --- 5. MARKET RENT & ROLLOVER ---
    // Loss to Lease Analysis
    if (summary.potentialBaseRent > summary.potentialMarketRent * 1.10) {
      checks.push({
        id: 'over_rented',
        title: 'Over-Rented Risk',
        status: 'danger',
        message: `Contract rents are >10% above market. Risk of revenue drop at expiry.`,
      });
      score -= 15;
    } else if (summary.potentialMarketRent > summary.potentialBaseRent * 1.10) {
      checks.push({
        id: 'under_rented',
        title: 'Upside Potential',
        status: 'pass',
        message: `Property is under-rented. Significant value creation opportunity.`,
      });
    } else {
      checks.push({
        id: 'market_aligned',
        title: 'Market Rent Alignment',
        status: 'pass',
        message: `Contract rents are in line with market levels.`,
      });
    }

    // Lease Expiry Check
    const now = new Date();
    const hasRolloverRisk = income.rentalIncome.some(item => {
      if (!item.leaseExpiry) return false;
      const expiry = new Date(item.leaseExpiry);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > 0 && diffDays < 365;
    });

    if (hasRolloverRisk) {
      checks.push({
        id: 'rollover',
        title: 'Near-Term Rollover',
        status: 'warning',
        message: `Leases expiring within 12 months detected. Ensure vacancy loss is budgeted.`,
      });
      score -= 5;
    } else {
      checks.push({
        id: 'rollover_ok',
        title: 'Lease Schedule',
        status: 'pass',
        message: 'No near-term lease expirations (<12 months) detected.',
      });
    }

    // --- 6. VACANCY STANDARD ---
    if (income.vacancyRate < 3.0) {
      checks.push({
        id: 'vac_low',
        title: 'Aggressive Vacancy',
        status: 'warning',
        message: `Used ${income.vacancyRate}%. Standard underwriting requires ~5% vacancy/credit loss.`,
      });
      score -= 5;
    } else {
      checks.push({
        id: 'vac_ok',
        title: 'Vacancy Assumption',
        status: 'pass',
        message: `${income.vacancyRate}% is a defensible stabilized vacancy rate.`,
      });
    }

    // --- 7. RESERVES ---
    const hasReserves = expenses.reserves.length > 0 && summary.totalReserves > 0;
    if (!hasReserves) {
      checks.push({
        id: 'reserves_missing',
        title: 'No Capital Reserves',
        status: 'warning',
        message: 'Appraisal Institute guidelines require "Below the Line" reserves for replacement.',
      });
      score -= 5;
    } else {
      checks.push({
        id: 'reserves_ok',
        title: 'Capital Reserves',
        status: 'pass',
        message: 'Replacement reserves included in analysis.',
      });
    }

    // --- 8. VALUATION CHECKS (if valuationData provided) ---
    if (valuationData) {
      // Cap Rate Reasonableness
      if (valuationData.marketCapRate < 3) {
        checks.push({
          id: 'cap_rate_low',
          title: 'Unusually Low Cap Rate',
          status: 'danger',
          message: `A ${valuationData.marketCapRate}% cap rate is extremely aggressive. Verify market support.`,
        });
        score -= 15;
      } else if (valuationData.marketCapRate > 15) {
        checks.push({
          id: 'cap_rate_high',
          title: 'Unusually High Cap Rate',
          status: 'warning',
          message: `A ${valuationData.marketCapRate}% cap rate suggests distressed asset or data entry error.`,
        });
        score -= 10;
      } else {
        checks.push({
          id: 'cap_rate_ok',
          title: 'Cap Rate',
          status: 'pass',
          message: `${valuationData.marketCapRate}% cap rate is within typical market range.`,
        });
      }

      // Discount Rate vs Cap Rate Spread
      const spreadToDiscount = valuationData.discountRate - valuationData.marketCapRate;
      if (spreadToDiscount < 0) {
        checks.push({
          id: 'discount_spread_negative',
          title: 'Discount Rate Below Cap Rate',
          status: 'danger',
          message: `Discount rate (${valuationData.discountRate}%) should typically exceed going-in cap rate (${valuationData.marketCapRate}%).`,
        });
        score -= 15;
      } else if (spreadToDiscount > 5) {
        checks.push({
          id: 'discount_spread_wide',
          title: 'Wide Discount-to-Cap Spread',
          status: 'warning',
          message: `${spreadToDiscount.toFixed(1)}% spread between discount and cap rate is unusually wide. Verify assumptions.`,
        });
        score -= 5;
      } else {
        checks.push({
          id: 'discount_spread_ok',
          title: 'Rate Spread',
          status: 'pass',
          message: `${spreadToDiscount.toFixed(1)}% spread between discount and cap rate is reasonable.`,
        });
      }

      // Terminal Cap Rate vs Going-In
      if (valuationData.terminalCapRate <= valuationData.marketCapRate) {
        checks.push({
          id: 'terminal_cap_low',
          title: 'Terminal Cap Rate Issue',
          status: 'warning',
          message: `Terminal cap (${valuationData.terminalCapRate}%) should typically exceed going-in cap (${valuationData.marketCapRate}%) to reflect reversion risk.`,
        });
        score -= 5;
      } else {
        checks.push({
          id: 'terminal_cap_ok',
          title: 'Terminal Cap Rate',
          status: 'pass',
          message: `Terminal cap rate (${valuationData.terminalCapRate}%) appropriately exceeds going-in cap.`,
        });
      }

      // Holding Period Check
      if (valuationData.holdingPeriod < 5) {
        checks.push({
          id: 'holding_short',
          title: 'Short Holding Period',
          status: 'warning',
          message: `${valuationData.holdingPeriod}-year holding period is short. Standard DCF uses 10-year projections.`,
        });
        score -= 3;
      } else if (valuationData.holdingPeriod > 15) {
        checks.push({
          id: 'holding_long',
          title: 'Extended Holding Period',
          status: 'warning',
          message: `${valuationData.holdingPeriod}-year projection may introduce significant forecast uncertainty.`,
        });
        score -= 3;
      } else {
        checks.push({
          id: 'holding_ok',
          title: 'Holding Period',
          status: 'pass',
          message: `${valuationData.holdingPeriod}-year projection is within standard parameters.`,
        });
      }

      // Growth Rate Reasonableness
      if (valuationData.annualGrowthRate > 5) {
        checks.push({
          id: 'growth_high',
          title: 'Aggressive Growth Assumption',
          status: 'warning',
          message: `${valuationData.annualGrowthRate}% annual growth exceeds typical inflation-linked increases.`,
        });
        score -= 5;
      } else if (valuationData.annualGrowthRate < 0) {
        checks.push({
          id: 'growth_negative',
          title: 'Negative Growth Assumption',
          status: 'warning',
          message: `Negative growth (${valuationData.annualGrowthRate}%) indicates declining market. Verify support.`,
        });
        score -= 5;
      } else {
        checks.push({
          id: 'growth_ok',
          title: 'Growth Assumption',
          status: 'pass',
          message: `${valuationData.annualGrowthRate}% annual growth is reasonable.`,
        });
      }
    }

    // --- 9. VALUE RECONCILIATION CHECK ---
    if (directCapValue > 0 && dcfValue > 0) {
      const valueDiff = Math.abs(directCapValue - dcfValue);
      const avgValue = (directCapValue + dcfValue) / 2;
      const percentDiff = (valueDiff / avgValue) * 100;

      if (percentDiff > 20) {
        checks.push({
          id: 'value_reconcile_high',
          title: 'Significant Value Discrepancy',
          status: 'danger',
          message: `Direct Cap ($${directCapValue.toLocaleString()}) and DCF ($${dcfValue.toLocaleString()}) differ by ${percentDiff.toFixed(0)}%. Reconciliation required.`,
        });
        score -= 15;
      } else if (percentDiff > 10) {
        checks.push({
          id: 'value_reconcile_moderate',
          title: 'Value Reconciliation Needed',
          status: 'warning',
          message: `Direct Cap and DCF values differ by ${percentDiff.toFixed(0)}%. Consider adjusting assumptions.`,
        });
        score -= 5;
      } else {
        checks.push({
          id: 'value_reconcile_ok',
          title: 'Value Reconciliation',
          status: 'pass',
          message: `Direct Cap and DCF values are within ${percentDiff.toFixed(0)}% of each other.`,
        });
      }
    }

    // --- 10. PROPERTY DATA COMPLETENESS ---
    if (propertyMeta.sqFt === 0) {
      checks.push({
        id: 'sqft_missing',
        title: 'Missing Building Size',
        status: 'danger',
        message: 'Building square footage is required for per-SF analysis and unit value metrics.',
      });
      score -= 20;
    } else {
      checks.push({
        id: 'sqft_ok',
        title: 'Building Size',
        status: 'pass',
        message: `${propertyMeta.sqFt.toLocaleString()} SF recorded for subject property.`,
      });
    }

    // --- 11. NOI SANITY CHECK ---
    if (summary.netOperatingIncome <= 0) {
      checks.push({
        id: 'noi_negative',
        title: 'Negative NOI',
        status: 'danger',
        message: 'Net Operating Income is zero or negative. Income approach may not be applicable.',
      });
      score -= 25;
    } else if (summary.noiPerSf < 5 && propertyMeta.sqFt > 0) {
      checks.push({
        id: 'noi_low',
        title: 'Low NOI per SF',
        status: 'warning',
        message: `$${summary.noiPerSf.toFixed(2)}/SF is below typical thresholds. Verify income and expenses.`,
      });
      score -= 5;
    } else {
      checks.push({
        id: 'noi_ok',
        title: 'Net Operating Income',
        status: 'pass',
        message: `NOI of $${summary.netOperatingIncome.toLocaleString()} ($${summary.noiPerSf.toFixed(2)}/SF) calculated.`,
      });
    }

    return { checks, score: Math.max(0, score) };
  }, [summary, expenses, income, propertyMeta, valuationData, directCapValue, dcfValue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-gradient-action-start to-gradient-action-end p-6 flex justify-between items-start text-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileCheck className={analysis.score > 80 ? "text-accent-teal-mint" : "text-accent-amber-gold"} size={24} />
              <h2 className="text-xl font-bold">Pre-Flight Check Report</h2>
            </div>
            <p className="text-white/70 text-sm">Comprehensive USPAP, Methodology & Data Validation</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-1/10 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 border-b border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confidence Score</div>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{analysis.score}/100</div>
          </div>
          <div className="w-32 h-2 bg-harken-gray-light dark:bg-elevation-1 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ease-out ${analysis.score > 80 ? 'bg-accent-teal-mint' : analysis.score > 50 ? 'bg-accent-amber-gold' : 'bg-harken-error'}`} style={{ width: `${analysis.score}%` }}></div>
          </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          {analysis.checks.map(check => (
            <div key={check.id} className="flex gap-4 group">
              <div className="flex-shrink-0 mt-1">
                {check.status === 'pass' && <CheckCircle className="text-accent-teal-mint" size={20} />}
                {check.status === 'warning' && <AlertTriangle className="text-accent-amber-gold" size={20} />}
                {check.status === 'danger' && <AlertOctagon className="text-harken-error" size={20} />}
              </div>
              <div>
                <h4 className={`text-sm font-bold ${check.status === 'pass' ? 'text-harken-gray' : check.status === 'danger' ? 'text-harken-error' : 'text-accent-amber-gold'}`}>{check.title}</h4>
                <p className="text-sm text-harken-gray leading-relaxed mt-1">{check.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2 text-center flex-shrink-0">
          <button onClick={onClose} className="text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-harken-blue transition-colors w-full py-2 rounded-lg hover:bg-surface-3 dark:hover:bg-elevation-3">Return to Editor</button>
        </div>
      </div>
    </div>
  );
};


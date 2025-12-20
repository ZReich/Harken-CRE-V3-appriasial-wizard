
import React, { useMemo } from 'react';
import { X, CheckCircle, AlertTriangle, AlertOctagon, ShieldCheck } from 'lucide-react';
import { FinancialSummary, ExpenseData, IncomeData, PropertyMeta } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  summary: FinancialSummary;
  expenses: ExpenseData;
  income: IncomeData;
  propertyMeta: PropertyMeta;
}

interface RiskCheck {
    id: string;
    title: string;
    status: 'pass' | 'warning' | 'danger';
    message: string;
}

export const RiskAnalysisModal: React.FC<Props> = ({ isOpen, onClose, summary, expenses, income, propertyMeta }) => {
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

    return { checks, score: Math.max(0, score) };
  }, [summary, expenses, income, propertyMeta]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-6 flex justify-between items-start text-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className={analysis.score > 80 ? "text-emerald-400" : "text-amber-400"} size={24} />
                <h2 className="text-xl font-bold">Risk Analysis Report</h2>
            </div>
            <p className="text-slate-400 text-sm">Automated USPAP & Methodology Review.</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confidence Score</div>
                <div className="text-3xl font-black text-slate-800">{analysis.score}/100</div>
            </div>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ease-out ${analysis.score > 80 ? 'bg-emerald-500' : analysis.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${analysis.score}%` }}></div>
            </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
            {analysis.checks.map(check => (
                <div key={check.id} className="flex gap-4 group">
                    <div className="flex-shrink-0 mt-1">
                        {check.status === 'pass' && <CheckCircle className="text-emerald-500" size={20} />}
                        {check.status === 'warning' && <AlertTriangle className="text-amber-500" size={20} />}
                        {check.status === 'danger' && <AlertOctagon className="text-rose-500" size={20} />}
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold ${check.status === 'pass' ? 'text-slate-700' : check.status === 'danger' ? 'text-rose-700' : 'text-amber-700'}`}>{check.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed mt-1">{check.message}</p>
                    </div>
                </div>
            ))}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center flex-shrink-0">
            <button onClick={onClose} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors w-full py-2 rounded-lg hover:bg-slate-100">Return to Editor</button>
        </div>
      </div>
    </div>
  );
};

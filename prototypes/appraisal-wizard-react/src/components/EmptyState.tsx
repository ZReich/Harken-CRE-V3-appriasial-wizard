import React from 'react';
import { Plus, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'subtle' | 'info';
}

/**
 * EmptyState - Helpful empty state prompts for new sections
 * 
 * Provides guidance when a section has no data yet, encouraging
 * the appraiser to add their first entry.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileText,
  title,
  message,
  actionLabel,
  onAction,
  variant = 'default',
}) => {
  const variants = {
    default: {
      container: 'bg-surface-1 border-2 border-dashed border-slate-300 dark:bg-elevation-1 dark:border-dark-border',
      iconBg: 'bg-slate-100 dark:bg-elevation-1',
      iconColor: 'text-slate-400 dark:text-slate-200',
      titleColor: 'text-slate-700 dark:text-white',
      messageColor: 'text-slate-500 dark:text-slate-400',
    },
    subtle: {
      container: 'bg-slate-50 border border-slate-200 dark:bg-elevation-1/50 dark:border-dark-border',
      iconBg: 'bg-surface-1 dark:bg-elevation-1',
      iconColor: 'text-slate-400 dark:text-slate-200',
      titleColor: 'text-slate-600 dark:text-slate-200',
      messageColor: 'text-slate-400 dark:text-slate-400',
    },
    info: {
      container: 'bg-blue-50 border border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
    },
  };

  const style = variants[variant];

  return (
    <div className={`${style.container} rounded-xl p-8 text-center`}>
      <div className={`${style.iconBg} w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${style.iconColor}`} />
      </div>
      <h3 className={`text-lg font-bold ${style.titleColor} mb-2`}>
        {title}
      </h3>
      <p className={`text-sm ${style.messageColor} max-w-md mx-auto mb-6`}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-harken-blue text-white font-bold rounded-xl hover:bg-harken-blue/90 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// =================================================================
// PREDEFINED EMPTY STATES FOR COMMON SECTIONS
// =================================================================

export const EMPTY_STATE_MESSAGES = {
  rentComps: {
    title: 'No Rent Comparables Yet',
    message: 'Add your first rent comparable to establish market rent support. Compare rental rates from similar properties to validate your income assumptions.',
    actionLabel: 'Add First Rent Comparable',
  },
  expenseComps: {
    title: 'No Expense Comparables Yet',
    message: 'Add expense comparables or skip if using the subject\'s actual expenses. Expense comps help validate your operating expense assumptions against similar properties.',
    actionLabel: 'Add First Expense Comparable',
  },
  landSales: {
    title: 'No Land Sales Yet',
    message: 'Add land sales to support your land value conclusion. Land comparables are essential for the Cost Approach and for understanding land-to-building ratios.',
    actionLabel: 'Add First Land Sale',
  },
  salesComps: {
    title: 'No Sales Comparables Yet',
    message: 'Add comparable sales to support your value conclusion through the Sales Comparison Approach. Select properties that are similar in use, size, and location.',
    actionLabel: 'Add First Comparable Sale',
  },
  hbu: {
    title: 'Complete Analysis First',
    message: 'Complete at least one valuation approach to enable AI Draft for Highest and Best Use analysis. The AI uses your property and market data to generate professional narratives.',
  },
  income: {
    title: 'No Income Data Yet',
    message: 'Start building your income pro forma by adding rent roll entries and expense line items. The system will calculate NOI and valuation metrics automatically.',
    actionLabel: 'Start Income Analysis',
  },
};

export default EmptyState;


// src/components/guidance/InlineHelp.tsx
// Inline help text component for forms and wizards

import React from 'react';
import { Info, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

export type InlineHelpVariant = 'info' | 'tip' | 'success' | 'warning';

interface InlineHelpProps {
  /** Help text content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: InlineHelpVariant;
  /** If true, shows as a compact inline element instead of block */
  inline?: boolean;
  /** Custom className */
  className?: string;
  /** If true, shows the icon */
  showIcon?: boolean;
  /** Custom title */
  title?: string;
}

const VARIANT_CONFIG = {
  info: {
    Icon: Info,
    bg: 'bg-harken-blue/5 dark:bg-cyan-500/10',
    border: 'border-harken-blue/20 dark:border-cyan-500/30',
    text: 'text-harken-gray dark:text-slate-300',
    iconColor: 'text-harken-blue dark:text-cyan-400',
    titleColor: 'text-harken-blue dark:text-cyan-400',
  },
  tip: {
    Icon: Lightbulb,
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    text: 'text-harken-gray dark:text-slate-300',
    iconColor: 'text-amber-500 dark:text-amber-400',
    titleColor: 'text-amber-600 dark:text-amber-400',
  },
  success: {
    Icon: CheckCircle,
    bg: 'bg-accent-teal-mint/5 dark:bg-green-500/10',
    border: 'border-accent-teal-mint/20 dark:border-green-500/20',
    text: 'text-harken-gray dark:text-slate-300',
    iconColor: 'text-accent-teal-mint dark:text-green-400',
    titleColor: 'text-accent-teal-mint dark:text-green-400',
  },
  warning: {
    Icon: AlertCircle,
    bg: 'bg-rose-50 dark:bg-rose-900/10',
    border: 'border-rose-200 dark:border-rose-500/20',
    text: 'text-harken-gray dark:text-slate-300',
    iconColor: 'text-rose-500 dark:text-rose-400',
    titleColor: 'text-rose-600 dark:text-rose-400',
  },
};

export function InlineHelp({
  children,
  variant = 'info',
  inline = false,
  className = '',
  showIcon = true,
  title,
}: InlineHelpProps) {
  const config = VARIANT_CONFIG[variant];
  const { Icon } = config;

  if (inline) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs ${config.text} ${className}`}
      >
        {showIcon && <Icon size={14} className={config.iconColor} />}
        <span>{children}</span>
      </span>
    );
  }

  return (
    <div
      className={`
        rounded-lg px-4 py-3 border
        ${config.bg} ${config.border}
        ${className}
      `}
    >
      <div className="flex gap-3">
        {showIcon && (
          <div className="flex-shrink-0 pt-0.5">
            <Icon size={18} className={config.iconColor} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          <div className={`text-sm ${config.text} leading-relaxed`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InlineHelp;

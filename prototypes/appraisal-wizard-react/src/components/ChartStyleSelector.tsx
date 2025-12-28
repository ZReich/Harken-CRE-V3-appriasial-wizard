/**
 * Chart Style Selector Component
 * 
 * Allows users to select from 5 premium chart visualization styles
 * for economic data in the report. Uses the ButtonSelector pattern.
 */

import ButtonSelector from './ButtonSelector';
import { Waves, LayoutGrid, Layers, Zap, GitCompareArrows } from 'lucide-react';

export type ChartStyle = 'gradient' | 'glass' | 'horizon' | 'pulse' | 'diverging';

const CHART_STYLE_OPTIONS = [
  { value: 'gradient', label: 'Flow', icon: <Waves className="w-4 h-4" /> },
  { value: 'glass', label: 'Glass', icon: <LayoutGrid className="w-4 h-4" /> },
  { value: 'horizon', label: 'Bands', icon: <Layers className="w-4 h-4" /> },
  { value: 'pulse', label: 'Pulse', icon: <Zap className="w-4 h-4" /> },
  { value: 'diverging', label: 'Compare', icon: <GitCompareArrows className="w-4 h-4" /> },
];

interface ChartStyleSelectorProps {
  value: ChartStyle;
  onChange: (style: ChartStyle) => void;
  label?: string;
  className?: string;
}

export function ChartStyleSelector({ 
  value, 
  onChange, 
  label = 'Chart Style',
  className = '' 
}: ChartStyleSelectorProps) {
  return (
    <ButtonSelector
      options={CHART_STYLE_OPTIONS}
      value={value}
      onChange={(v) => onChange(v as ChartStyle)}
      label={label}
      size="sm"
      className={className}
    />
  );
}

export default ChartStyleSelector;



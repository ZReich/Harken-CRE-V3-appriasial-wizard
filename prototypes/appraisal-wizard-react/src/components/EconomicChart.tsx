/**
 * Economic Chart Component
 * 
 * Renders economic time series data using recharts with 5 premium styles:
 * - Gradient Flow: Smooth bezier curve with gradient fill
 * - Glass Cards: Glassmorphism stat cards with sparklines
 * - Horizon Bands: Layered color bands showing range
 * - Pulse Line: Minimal line with glowing current marker
 * - Diverging Bars: Horizontal bars from center baseline
 */

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { ChartStyle } from './ChartStyleSelector';

interface DataPoint {
  date: string;
  value: number;
}

interface EconomicChartProps {
  data: DataPoint[];
  chartStyle: ChartStyle;
  title: string;
  color?: string;
  height?: number;
  unit?: string;
  showAxis?: boolean;
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label, unit }: { 
  active?: boolean; 
  payload?: Array<{ value: number }>; 
  label?: string;
  unit?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(label || '')}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-white">
          {payload[0].value.toFixed(2)}{unit || '%'}
        </p>
      </div>
    );
  }
  return null;
};

// Calculate diverging values (difference from mean)
const calculateDiverging = (data: DataPoint[]) => {
  if (data.length === 0) return [];
  const mean = data.reduce((acc, d) => acc + d.value, 0) / data.length;
  return data.map(d => ({
    ...d,
    deviation: d.value - mean,
    mean,
  }));
};

export function EconomicChart({
  data: rawData,
  chartStyle,
  title,
  color = '#0da1c7',
  height = 200,
  unit = '%',
  showAxis = true,
}: EconomicChartProps) {
  if (!rawData || rawData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-slate-400" 
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  // Reverse data so time flows left-to-right (oldest → newest)
  // FRED API returns data in descending order (newest first)
  const data = [...rawData].reverse();
  
  // Current value is now the last element (rightmost on chart)
  const currentValue = data[data.length - 1]?.value;
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));

  // Gradient Flow Style
  if (chartStyle === 'gradient') {
    return (
      <div className="relative">
        <div className="absolute top-0 right-0 text-right">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">{currentValue?.toFixed(2)}{unit}</span>
          <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 40, right: 80, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {showAxis && (
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Glass Cards Style
  if (chartStyle === 'glass') {
    const sparklineData = data.slice(-12); // Last 12 data points for sparkline
    return (
      <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-xl border border-white/50 dark:border-slate-700/50 shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{currentValue?.toFixed(2)}{unit}</p>
          </div>
          <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color} 
                  strokeWidth={1.5} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="text-slate-400">Low: </span>
            <span className="font-medium text-slate-600 dark:text-slate-400">{minValue.toFixed(2)}{unit}</span>
          </div>
          <div>
            <span className="text-slate-400">High: </span>
            <span className="font-medium text-slate-600 dark:text-slate-400">{maxValue.toFixed(2)}{unit}</span>
          </div>
        </div>
      </div>
    );
  }

  // Horizon Bands Style
  if (chartStyle === 'horizon') {
    const range = maxValue - minValue;
    const third = range / 3;
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute top-2 left-2 z-10">
          <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{currentValue?.toFixed(2)}{unit}</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 50, right: 0, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id={`horizon-high-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id={`horizon-mid-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={color} stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id={`horizon-low-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <ReferenceLine y={minValue + third * 2} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={minValue + third} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
            {showAxis && (
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="stepAfter"
              dataKey="value"
              stroke={color}
              strokeWidth={1}
              fill={`url(#horizon-mid-${title})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Pulse Line Style
  if (chartStyle === 'pulse') {
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute top-2 right-2 text-right z-10">
          <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: color }} />
            </span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{currentValue?.toFixed(2)}{unit}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 45, right: 80, left: 0, bottom: 20 }}>
            <defs>
              <filter id="pulseGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {showAxis && (
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              filter="url(#pulseGlow)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Diverging Bars Style
  if (chartStyle === 'diverging') {
    const divergingData = calculateDiverging(data);
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute top-2 left-2 z-10">
          <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{currentValue?.toFixed(2)}{unit}</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={divergingData} 
            layout="vertical"
            margin={{ top: 45, right: 20, left: 60, bottom: 20 }}
          >
            {showAxis && (
              <YAxis 
                dataKey="date" 
                type="category"
                tickFormatter={formatDate} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            <XAxis type="number" hide />
            <ReferenceLine x={0} stroke="#64748b" />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Bar dataKey="deviation" radius={[0, 4, 4, 0]}>
              {divergingData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.deviation >= 0 ? '#10b981' : '#ef4444'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default fallback
  return null;
}

export default EconomicChart;



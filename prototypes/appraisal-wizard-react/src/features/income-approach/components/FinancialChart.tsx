import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import type { FinancialSummary } from '../types';
import { useChartColors } from '../../../hooks/useThemeColors';

interface Props {
  summary: FinancialSummary;
}

export const FinancialChart: React.FC<Props> = ({ summary }) => {
  const chartColors = useChartColors();
  
  const data = [
    { name: 'PGI', value: summary.potentialGrossIncome, type: 'income' },
    { name: 'Loss', value: -1 * (summary.potentialGrossIncome - summary.effectiveGrossIncome), type: 'loss' },
    { name: 'Expenses', value: -1 * summary.totalExpenses, type: 'expense' },
    { name: 'NOI', value: summary.netOperatingIncome, type: 'net' },
  ];

  // Map entry types to theme-aware chart colors
  const getBarColor = (type: string) => {
    switch (type) {
      case 'income': return chartColors.income;
      case 'loss': return chartColors.loss;
      case 'expense': return chartColors.expense;
      case 'net': return chartColors.net;
      default: return chartColors.neutral;
    }
  };

  return (
    <div className="h-64 w-full min-w-[200px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={200}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: chartColors.axis, fontSize: 11, fontWeight: 600 }} 
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: `1px solid ${chartColors.grid}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`$${Math.abs(Number(value) || 0).toLocaleString()}`, 'Amount']}
          />
          <ReferenceLine y={0} stroke={chartColors.grid} />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


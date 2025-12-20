import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { FinancialSummary } from '../types';

interface Props {
  summary: FinancialSummary;
}

export const FinancialChart: React.FC<Props> = ({ summary }) => {
  const data = [
    { name: 'PGI', value: summary.potentialGrossIncome, type: 'income' },
    { name: 'Loss', value: -1 * (summary.potentialGrossIncome - summary.effectiveGrossIncome), type: 'loss' },
    { name: 'Expenses', value: -1 * summary.totalExpenses, type: 'expense' },
    { name: 'NOI', value: summary.netOperatingIncome, type: 'net' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }} 
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`$${Math.abs(value).toLocaleString()}`, 'Amount']}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => {
              // HARKEN Palette
              let color = '#94a3b8';
              if (entry.type === 'income') color = '#0ea5e9'; // Sky-500
              if (entry.type === 'loss') color = '#f43f5e'; // Rose-500
              if (entry.type === 'expense') color = '#f59e0b'; // Amber-500
              if (entry.type === 'net') color = '#10b981'; // Emerald-500
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Property, PropertyValues } from '../types';

interface PriceChartProps {
  properties: Property[];
  values: PropertyValues;
}

export const PriceChart: React.FC<PriceChartProps> = ({ properties, values }) => {
  // Filter out subject if it has no price
  const data = properties
    .filter(p => p.type === 'comp' && values[p.id]?.price_sf?.value)
    .map(p => ({
      name: p.name.split(' ')[0], // First word only for brevity
      price: values[p.id].price_sf.value as number,
      id: p.id
    }));

  const avgPrice = data.reduce((acc, curr) => acc + curr.price, 0) / data.length;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
        <span className="p-1 rounded bg-purple-100 text-purple-600">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </span>
        Price per SF Analysis
      </h4>
      <div className="flex-1 w-full min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price/SF']}
            />
            <ReferenceLine y={avgPrice} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'right', value: 'Avg', fontSize: 10, fill: '#94a3b8' }} />
            <Bar dataKey="price" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.price > avgPrice ? '#10b981' : '#3b82f6'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-slate-400 text-center">
        Comparison of adjusted price per square foot across sales
      </div>
    </div>
  );
};

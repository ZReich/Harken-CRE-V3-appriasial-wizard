/**
 * Cost Seg Measurement Calculator
 * 
 * Inline calculator for determining component costs from physical measurements.
 * Supports linear feet, square feet, equipment count, and other units.
 */

import React, { useState, useCallback } from 'react';
import { Calculator, Plus, Trash2, Check } from 'lucide-react';

interface Measurement {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

interface MeasurementCalculatorProps {
  onApply: (total: number, measurements: Measurement[], costPerUnit: number, unit: string) => void;
  suggestedCostPerUnit?: number;
  suggestedUnit?: string;
  initialMeasurements?: Measurement[];
}

const UNIT_OPTIONS = [
  { value: 'LF', label: 'Linear Feet (LF)', typical: [15, 35] },
  { value: 'SF', label: 'Square Feet (SF)', typical: [3, 12] },
  { value: 'EA', label: 'Each (EA)', typical: [100, 5000] },
  { value: 'tons', label: 'Tons (HVAC)', typical: [1000, 3000] },
  { value: 'BTU', label: 'BTU', typical: [0.01, 0.1] },
  { value: 'amps', label: 'Amps', typical: [50, 200] },
  { value: 'kW', label: 'Kilowatts', typical: [100, 500] },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const CostSegMeasurementCalculator: React.FC<MeasurementCalculatorProps> = ({
  onApply,
  suggestedCostPerUnit,
  suggestedUnit = 'LF',
  initialMeasurements = [],
}) => {
  const [measurements, setMeasurements] = useState<Measurement[]>(
    initialMeasurements.length > 0
      ? initialMeasurements
      : [{ id: `m-${Date.now()}`, description: '', quantity: 0, unit: suggestedUnit }]
  );
  const [unit, setUnit] = useState(suggestedUnit);
  const [costPerUnit, setCostPerUnit] = useState(suggestedCostPerUnit || 0);

  const totalQuantity = measurements.reduce((sum, m) => sum + m.quantity, 0);
  const totalCost = totalQuantity * costPerUnit;

  const selectedUnitOption = UNIT_OPTIONS.find(opt => opt.value === unit);
  const typicalRange = selectedUnitOption?.typical;

  const handleAddMeasurement = useCallback(() => {
    setMeasurements(prev => [
      ...prev,
      { id: `m-${Date.now()}`, description: '', quantity: 0, unit },
    ]);
  }, [unit]);

  const handleUpdateMeasurement = useCallback((id: string, updates: Partial<Measurement>) => {
    setMeasurements(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const handleRemoveMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleApply = useCallback(() => {
    onApply(totalCost, measurements, costPerUnit, unit);
  }, [onApply, totalCost, measurements, costPerUnit, unit]);

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-blue-900 font-semibold">
        <Calculator className="w-5 h-5" />
        <h4>Measurement Calculator</h4>
      </div>

      {/* Unit Selection */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-blue-900 mb-1.5">Measurement Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {UNIT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-blue-900 mb-1.5">
            Cost per {unit}
            {typicalRange && (
              <span className="text-blue-600 font-normal ml-1">
                (typical: ${typicalRange[0]}-${typicalRange[1]})
              </span>
            )}
          </label>
          <input
            type="number"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Measurements List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-blue-900">Measurements</label>
          <button
            onClick={handleAddMeasurement}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Line
          </button>
        </div>

        <div className="space-y-2">
          {measurements.map((measurement, index) => (
            <div key={measurement.id} className="flex gap-2">
              <input
                type="text"
                value={measurement.description}
                onChange={(e) => handleUpdateMeasurement(measurement.id, { description: e.target.value })}
                placeholder={`Line ${index + 1} description`}
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={measurement.quantity}
                onChange={(e) => handleUpdateMeasurement(measurement.id, { quantity: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="0.01"
                className="w-28 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-right"
              />
              <span className="flex items-center px-2 text-sm font-medium text-blue-700">
                {unit}
              </span>
              {measurements.length > 1 && (
                <button
                  onClick={() => handleRemoveMeasurement(measurement.id)}
                  className="p-2 text-blue-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Calculation Summary */}
      <div className="bg-white border-2 border-blue-300 rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">Total Quantity:</span>
          <span className="font-bold text-blue-900">
            {totalQuantity.toLocaleString()} {unit}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">Cost per {unit}:</span>
          <span className="font-bold text-blue-900">
            {formatCurrency(costPerUnit)}
          </span>
        </div>
        <div className="h-px bg-blue-200" />
        <div className="flex justify-between text-lg">
          <span className="font-semibold text-blue-900">Total Cost:</span>
          <span className="font-bold text-blue-900">
            {formatCurrency(totalCost)}
          </span>
        </div>
        <div className="text-xs text-blue-600 pt-1">
          {totalQuantity.toLocaleString()} {unit} × {formatCurrency(costPerUnit)} = {formatCurrency(totalCost)}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={totalCost === 0}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        <Check className="w-4 h-4" />
        Apply to Refinement
      </button>
    </div>
  );
};

export default CostSegMeasurementCalculator;

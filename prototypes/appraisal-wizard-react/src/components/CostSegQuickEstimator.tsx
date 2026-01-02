/**
 * Cost Seg Quick Estimator
 * 
 * Provides quick per-SF estimates when detailed measurements aren't available.
 * Property type aware with typical cost ranges.
 */

import React, { useState, useMemo } from 'react';
import { Zap, AlertTriangle, Check } from 'lucide-react';

interface QuickEstimatorProps {
  propertyType?: string;
  buildingSquareFeet: number;
  systemType: 'electrical' | 'plumbing' | 'hvac' | 'fire-protection' | 'elevators' | 'roofing' | 'structural';
  componentDescription: string;
  onApply: (estimatedCost: number, method: string) => void;
}

// Cost per SF ranges by property type and system
const COST_RANGES: Record<string, Record<string, { min: number; max: number; typical: number }>> = {
  office: {
    'electrical-equipment-circuits': { min: 0.50, max: 1.50, typical: 1.00 },
    'electrical-accent-lighting': { min: 0.30, max: 0.80, typical: 0.50 },
    'hvac-process-equipment': { min: 0.40, max: 1.20, typical: 0.80 },
    'plumbing-specialty': { min: 0.20, max: 0.60, typical: 0.40 },
  },
  restaurant: {
    'electrical-equipment-circuits': { min: 2.00, max: 4.00, typical: 3.00 },
    'electrical-accent-lighting': { min: 0.80, max: 2.00, typical: 1.40 },
    'hvac-process-equipment': { min: 1.50, max: 3.50, typical: 2.50 },
    'plumbing-specialty': { min: 1.00, max: 2.50, typical: 1.75 },
  },
  retail: {
    'electrical-equipment-circuits': { min: 1.00, max: 2.50, typical: 1.75 },
    'electrical-accent-lighting': { min: 0.80, max: 2.00, typical: 1.40 },
    'hvac-process-equipment': { min: 0.60, max: 1.50, typical: 1.00 },
    'plumbing-specialty': { min: 0.30, max: 0.80, typical: 0.55 },
  },
  warehouse: {
    'electrical-equipment-circuits': { min: 0.30, max: 0.80, typical: 0.55 },
    'electrical-accent-lighting': { min: 0.10, max: 0.30, typical: 0.20 },
    'hvac-process-equipment': { min: 0.20, max: 0.60, typical: 0.40 },
    'plumbing-specialty': { min: 0.10, max: 0.30, typical: 0.20 },
  },
  industrial: {
    'electrical-equipment-circuits': { min: 1.50, max: 3.50, typical: 2.50 },
    'electrical-accent-lighting': { min: 0.20, max: 0.60, typical: 0.40 },
    'hvac-process-equipment': { min: 1.00, max: 2.50, typical: 1.75 },
    'plumbing-specialty': { min: 0.50, max: 1.50, typical: 1.00 },
  },
};

const ESTIMATE_CATEGORIES = [
  { id: 'electrical-equipment-circuits', label: 'Equipment Dedicated Circuits', systemType: 'electrical' },
  { id: 'electrical-accent-lighting', label: 'Accent/Task Lighting Circuits', systemType: 'electrical' },
  { id: 'hvac-process-equipment', label: 'Process/Specialty HVAC', systemType: 'hvac' },
  { id: 'plumbing-specialty', label: 'Specialty Plumbing Fixtures', systemType: 'plumbing' },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const CostSegQuickEstimator: React.FC<QuickEstimatorProps> = ({
  propertyType = 'office',
  buildingSquareFeet,
  systemType,
  componentDescription,
  onApply,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [costPerSF, setCostPerSF] = useState<number>(0);

  // Get relevant estimate categories for this system type
  const relevantCategories = useMemo(() => {
    return ESTIMATE_CATEGORIES.filter(cat => cat.systemType === systemType);
  }, [systemType]);

  // Get cost range for selected category and property type
  const costRange = useMemo(() => {
    if (!selectedCategory || !propertyType) return null;
    
    const typeRanges = COST_RANGES[propertyType.toLowerCase()];
    if (!typeRanges) return null;
    
    return typeRanges[selectedCategory];
  }, [selectedCategory, propertyType]);

  // Calculate estimated cost
  const estimatedCost = useMemo(() => {
    return costPerSF * buildingSquareFeet;
  }, [costPerSF, buildingSquareFeet]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const range = COST_RANGES[propertyType.toLowerCase()]?.[categoryId];
    if (range) {
      setCostPerSF(range.typical);
    }
  };

  const handleApply = () => {
    onApply(estimatedCost, `Quick Estimate: ${costPerSF.toFixed(2)} per SF × ${buildingSquareFeet.toLocaleString()} SF`);
  };

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-amber-900 font-semibold">
        <Zap className="w-5 h-5" />
        <h4>Quick Estimator</h4>
      </div>

      <div className="flex items-start gap-2 p-3 bg-amber-100 border border-amber-300 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-800">
          <p className="font-medium mb-1">Use when detailed measurements aren't available</p>
          <p>These are rough estimates based on industry averages. Actual measurements are preferred for IRS audit support.</p>
        </div>
      </div>

      {/* Property Type Info */}
      <div className="bg-white border border-amber-200 rounded-lg p-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Property Type:</span>
          <span className="font-semibold text-gray-900 capitalize">{propertyType}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Building Size:</span>
          <span className="font-semibold text-gray-900">{buildingSquareFeet.toLocaleString()} SF</span>
        </div>
      </div>

      {/* Category Selection */}
      {relevantCategories.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-amber-900 mb-2">Select Component Type</label>
          <div className="space-y-2">
            {relevantCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-colors ${
                  selectedCategory === cat.id
                    ? 'border-amber-400 bg-amber-100 text-amber-900'
                    : 'border-amber-200 bg-white text-gray-700 hover:border-amber-300'
                }`}
              >
                <div className="font-medium text-sm">{cat.label}</div>
                {costRange && selectedCategory === cat.id && (
                  <div className="text-xs text-amber-700 mt-1">
                    ${costRange.min.toFixed(2)} - ${costRange.max.toFixed(2)} per SF (typical: ${costRange.typical.toFixed(2)})
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cost per SF Input */}
      {costRange && (
        <div>
          <label className="block text-xs font-medium text-amber-900 mb-1.5">
            Cost per SF
            <span className="text-amber-700 font-normal ml-1">
              (adjust as needed)
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={costPerSF}
              onChange={(e) => setCostPerSF(parseFloat(e.target.value) || 0)}
              step="0.01"
              min={costRange.min}
              max={costRange.max}
              className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={() => setCostPerSF(costRange.typical)}
              className="px-3 py-2 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
            >
              Use Typical
            </button>
          </div>
          
          {/* Range Indicator */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-amber-700 mb-1">
              <span>Min: ${costRange.min.toFixed(2)}</span>
              <span>Typical: ${costRange.typical.toFixed(2)}</span>
              <span>Max: ${costRange.max.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-amber-300"
                style={{
                  width: `${((costRange.typical - costRange.min) / (costRange.max - costRange.min)) * 100}%`,
                }}
              />
              <div
                className="absolute top-0 left-0 h-full w-1 bg-amber-600"
                style={{
                  left: `${Math.max(0, Math.min(100, ((costPerSF - costRange.min) / (costRange.max - costRange.min)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Calculation Result */}
      {estimatedCost > 0 && (
        <div className="bg-white border-2 border-amber-300 rounded-lg p-3">
          <div className="text-sm text-amber-700 mb-2">Estimated Cost:</div>
          <div className="text-2xl font-bold text-amber-900">
            {formatCurrency(estimatedCost)}
          </div>
          <div className="text-xs text-amber-600 mt-2">
            {buildingSquareFeet.toLocaleString()} SF × ${costPerSF.toFixed(2)}/SF
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={estimatedCost === 0}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        <Check className="w-4 h-4" />
        Apply Estimate
      </button>
    </div>
  );
};

export default CostSegQuickEstimator;

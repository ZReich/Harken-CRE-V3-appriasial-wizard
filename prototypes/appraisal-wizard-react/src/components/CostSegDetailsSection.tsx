/**
 * CostSegDetailsSection Component
 * 
 * Expandable section for Cost Segregation data entry within building cards.
 * Only visible when Cost Segregation is enabled in wizard setup.
 * Allows auto-fill from M&S allocations and manual override of component costs.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Calculator,
  RefreshCw,
  DollarSign,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { 
  getMSCostSegAllocations, 
  getCSSIComponentName,
  CSSI_COMPONENT_NAMES,
  LAND_IMPROVEMENT_CSSI_COMPONENTS,
  type CostSegAllocation,
} from '../constants/costSegCSSI';
import type { 
  CostSegBuildingDetails, 
  CostSegLineItem 
} from '../types';

interface CostSegDetailsSectionProps {
  buildingId: string;
  buildingName: string;
  occupancyCode: string;
  totalBuildingCost: number;
  yearBuilt?: number | null;
  costSegDetails?: CostSegBuildingDetails;
  onUpdate: (details: CostSegBuildingDetails) => void;
}

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage
const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export default function CostSegDetailsSection({
  buildingId,
  buildingName,
  occupancyCode,
  totalBuildingCost,
  yearBuilt,
  costSegDetails,
  onUpdate,
}: CostSegDetailsSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['personal-property'])
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Generate line items from M&S allocations
  const generateLineItemsFromMS = useCallback((): CostSegLineItem[] => {
    const allocations = getMSCostSegAllocations(occupancyCode);
    
    return allocations.map((alloc, index) => {
      const msAmount = Math.round(totalBuildingCost * (alloc.percent / 100));
      
      return {
        id: `${buildingId}-${alloc.componentId}-${index}`,
        componentId: alloc.componentId,
        displayName: getCSSIComponentName(alloc.componentId),
        category: alloc.depreciationClass === '5-year' || alloc.depreciationClass === '7-year' 
          ? 'personal-property' 
          : alloc.depreciationClass === '15-year' 
            ? 'land-improvement' 
            : 'real-property',
        depreciationClass: alloc.depreciationClass,
        msPercent: alloc.percent,
        msAmount,
        actualAmount: undefined,
        finalAmount: msAmount,
        source: 'auto' as const,
      };
    });
  }, [buildingId, occupancyCode, totalBuildingCost]);

  // Auto-fill handler
  const handleAutoFill = useCallback(() => {
    const lineItems = generateLineItemsFromMS();
    
    // Calculate totals
    const fiveYearTotal = lineItems
      .filter(i => i.depreciationClass === '5-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);
    const sevenYearTotal = lineItems
      .filter(i => i.depreciationClass === '7-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);
    const fifteenYearTotal = lineItems
      .filter(i => i.depreciationClass === '15-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);
    const twentySevenFiveYearTotal = lineItems
      .filter(i => i.depreciationClass === '27.5-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);
    const thirtyNineYearTotal = lineItems
      .filter(i => i.depreciationClass === '39-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);

    const newDetails: CostSegBuildingDetails = {
      buildingId,
      buildingName,
      placedInServiceDate: yearBuilt ? `${yearBuilt}-01-01` : '',
      totalBuildingCost,
      costSource: 'estimated',
      lineItems,
      fiveYearTotal,
      sevenYearTotal,
      fifteenYearTotal,
      twentySevenFiveYearTotal,
      thirtyNineYearTotal,
    };

    onUpdate(newDetails);
  }, [buildingId, buildingName, yearBuilt, totalBuildingCost, generateLineItemsFromMS, onUpdate]);

  // Update a single line item with manual override
  const handleUpdateLineItem = useCallback((itemId: string, actualAmount: number | undefined) => {
    if (!costSegDetails) return;
    
    const updatedItems = costSegDetails.lineItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          actualAmount,
          finalAmount: actualAmount ?? item.msAmount,
          source: actualAmount !== undefined ? 'manual' as const : 'auto' as const,
        };
      }
      return item;
    });

    // Recalculate totals
    const fiveYearTotal = updatedItems
      .filter(i => i.depreciationClass === '5-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);
    const sevenYearTotal = updatedItems
      .filter(i => i.depreciationClass === '7-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);
    const fifteenYearTotal = updatedItems
      .filter(i => i.depreciationClass === '15-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);
    const twentySevenFiveYearTotal = updatedItems
      .filter(i => i.depreciationClass === '27.5-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);
    const thirtyNineYearTotal = updatedItems
      .filter(i => i.depreciationClass === '39-year')
      .reduce((sum, i) => sum + i.finalAmount, 0);

    onUpdate({
      ...costSegDetails,
      lineItems: updatedItems,
      fiveYearTotal,
      sevenYearTotal,
      fifteenYearTotal,
      twentySevenFiveYearTotal,
      thirtyNineYearTotal,
    });
  }, [costSegDetails, onUpdate]);

  // Start editing a line item
  const startEditing = (itemId: string, currentAmount: number) => {
    setEditingItemId(itemId);
    setEditValue(currentAmount.toString());
  };

  // Finish editing
  const finishEditing = (itemId: string) => {
    const numValue = parseFloat(editValue.replace(/[^0-9.]/g, ''));
    if (!isNaN(numValue) && numValue >= 0) {
      handleUpdateLineItem(itemId, numValue);
    }
    setEditingItemId(null);
    setEditValue('');
  };

  // Reset to auto
  const resetToAuto = (itemId: string) => {
    handleUpdateLineItem(itemId, undefined);
  };

  // Group line items by category
  const groupedItems = useMemo(() => {
    if (!costSegDetails?.lineItems) return null;
    
    const groups = {
      'personal-property': costSegDetails.lineItems.filter(i => i.category === 'personal-property'),
      'land-improvement': costSegDetails.lineItems.filter(i => i.category === 'land-improvement'),
      'real-property': costSegDetails.lineItems.filter(i => i.category === 'real-property'),
    };
    
    return groups;
  }, [costSegDetails?.lineItems]);

  // Calculate summary
  const summary = useMemo(() => {
    if (!costSegDetails) return null;
    
    const fiveYear = costSegDetails.fiveYearTotal + (costSegDetails.sevenYearTotal || 0);
    const fifteenYear = costSegDetails.fifteenYearTotal;
    const realProperty = (costSegDetails.twentySevenFiveYearTotal || 0) + costSegDetails.thirtyNineYearTotal;
    const total = fiveYear + fifteenYear + realProperty;
    
    return {
      fiveYear,
      fiveYearPercent: total > 0 ? (fiveYear / total) * 100 : 0,
      fifteenYear,
      fifteenYearPercent: total > 0 ? (fifteenYear / total) * 100 : 0,
      realProperty,
      realPropertyPercent: total > 0 ? (realProperty / total) * 100 : 0,
      total,
    };
  }, [costSegDetails]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // If no data yet, show the auto-fill prompt
  if (!costSegDetails || costSegDetails.lineItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <Calculator className="w-6 h-6 text-emerald-600" />
          </div>
          <h4 className="text-lg font-semibold text-emerald-900 mb-2">
            Cost Segregation Analysis
          </h4>
          <p className="text-sm text-emerald-700 mb-4 max-w-md mx-auto">
            Generate component cost allocations based on Marshall & Swift data for this building type.
            You can override individual costs with actual values if available.
          </p>
          <button
            onClick={handleAutoFill}
            disabled={totalBuildingCost <= 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            Auto-Fill from M&S Data
          </button>
          {totalBuildingCost <= 0 && (
            <p className="text-xs text-amber-600 mt-3 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Enter a total building cost first
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Study Information */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-600" />
          Study Information
        </h5>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Placed in Service Date
            </label>
            <input
              type="date"
              value={costSegDetails.placedInServiceDate}
              onChange={(e) => onUpdate({ ...costSegDetails, placedInServiceDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Total Building Cost
            </label>
            <input
              type="text"
              value={formatCurrency(costSegDetails.totalBuildingCost)}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Cost Source
            </label>
            <select
              value={costSegDetails.costSource}
              onChange={(e) => onUpdate({ ...costSegDetails, costSource: e.target.value as 'actual' | 'estimated' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="estimated">M&S Estimate</option>
              <option value="actual">Actual Costs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
            <h5 className="text-sm font-semibold text-emerald-900">
              Allocation Summary
            </h5>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-2 font-semibold text-gray-700">Recovery Period</th>
                  <th className="pb-2 font-semibold text-gray-700 text-right">Amount</th>
                  <th className="pb-2 font-semibold text-gray-700 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">5-Year Personal Property</td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {formatCurrency(summary.fiveYear)}
                  </td>
                  <td className="py-2 text-right text-emerald-600 font-medium">
                    {formatPercent(summary.fiveYearPercent)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">15-Year Land Improvements</td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {formatCurrency(summary.fifteenYear)}
                  </td>
                  <td className="py-2 text-right text-emerald-600 font-medium">
                    {formatPercent(summary.fifteenYearPercent)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-gray-600">39-Year Real Property</td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {formatCurrency(summary.realProperty)}
                  </td>
                  <td className="py-2 text-right text-emerald-600 font-medium">
                    {formatPercent(summary.realPropertyPercent)}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td className="pt-3 text-gray-900">Total Project Cost</td>
                  <td className="pt-3 text-right text-gray-900">
                    {formatCurrency(summary.total)}
                  </td>
                  <td className="pt-3 text-right text-gray-900">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Component Categories */}
      {groupedItems && (
        <div className="space-y-3">
          {/* 5-Year Personal Property */}
          <CategorySection
            title="5-Year Personal Property"
            subtitle="Building Components"
            items={groupedItems['personal-property']}
            isExpanded={expandedCategories.has('personal-property')}
            onToggle={() => toggleCategory('personal-property')}
            editingItemId={editingItemId}
            editValue={editValue}
            onStartEdit={startEditing}
            onEditValueChange={setEditValue}
            onFinishEdit={finishEditing}
            onResetToAuto={resetToAuto}
            colorClass="emerald"
          />

          {/* 15-Year Land Improvements */}
          <CategorySection
            title="15-Year Land Improvements"
            subtitle="Site Improvements (if applicable)"
            items={groupedItems['land-improvement']}
            isExpanded={expandedCategories.has('land-improvement')}
            onToggle={() => toggleCategory('land-improvement')}
            editingItemId={editingItemId}
            editValue={editValue}
            onStartEdit={startEditing}
            onEditValueChange={setEditValue}
            onFinishEdit={finishEditing}
            onResetToAuto={resetToAuto}
            colorClass="blue"
          />

          {/* 39-Year Real Property */}
          <CategorySection
            title="39-Year Real Property"
            subtitle="Building Structure"
            items={groupedItems['real-property']}
            isExpanded={expandedCategories.has('real-property')}
            onToggle={() => toggleCategory('real-property')}
            editingItemId={editingItemId}
            editValue={editValue}
            onStartEdit={startEditing}
            onEditValueChange={setEditValue}
            onFinishEdit={finishEditing}
            onResetToAuto={resetToAuto}
            colorClass="slate"
          />
        </div>
      )}

      {/* Regenerate Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleAutoFill}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate from M&S
        </button>
      </div>
    </div>
  );
}

// Category Section Component
interface CategorySectionProps {
  title: string;
  subtitle: string;
  items: CostSegLineItem[];
  isExpanded: boolean;
  onToggle: () => void;
  editingItemId: string | null;
  editValue: string;
  onStartEdit: (itemId: string, currentAmount: number) => void;
  onEditValueChange: (value: string) => void;
  onFinishEdit: (itemId: string) => void;
  onResetToAuto: (itemId: string) => void;
  colorClass: 'emerald' | 'blue' | 'slate';
}

function CategorySection({
  title,
  subtitle,
  items,
  isExpanded,
  onToggle,
  editingItemId,
  editValue,
  onStartEdit,
  onEditValueChange,
  onFinishEdit,
  onResetToAuto,
  colorClass,
}: CategorySectionProps) {
  const total = items.reduce((sum, i) => sum + i.finalAmount, 0);
  const manualCount = items.filter(i => i.source === 'manual').length;
  
  const bgColors = {
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    slate: 'bg-slate-50',
  };
  
  const borderColors = {
    emerald: 'border-emerald-200',
    blue: 'border-blue-200',
    slate: 'border-slate-200',
  };
  
  const textColors = {
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    slate: 'text-slate-700',
  };

  if (items.length === 0) return null;

  return (
    <div className={`border ${borderColors[colorClass]} rounded-xl overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${bgColors[colorClass]} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <div className="text-left">
            <span className={`text-sm font-semibold ${textColors[colorClass]}`}>{title}</span>
            <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {manualCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              {manualCount} manual
            </span>
          )}
          <span className={`text-sm font-bold ${textColors[colorClass]}`}>
            {formatCurrency(total)}
          </span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 font-medium text-gray-600">Component</th>
                <th className="px-4 py-2 font-medium text-gray-600 text-right">M&S %</th>
                <th className="px-4 py-2 font-medium text-gray-600 text-right">Amount</th>
                <th className="px-4 py-2 font-medium text-gray-600 text-center w-24">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-700">{item.displayName}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">
                    {formatPercent(item.msPercent)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => onEditValueChange(e.target.value)}
                        onBlur={() => onFinishEdit(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onFinishEdit(item.id);
                          if (e.key === 'Escape') {
                            onEditValueChange('');
                            onFinishEdit(item.id);
                          }
                        }}
                        autoFocus
                        className="w-28 px-2 py-1 border border-emerald-300 rounded text-right text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    ) : (
                      <button
                        onClick={() => onStartEdit(item.id, item.finalAmount)}
                        className="text-gray-900 font-medium hover:text-emerald-600 cursor-pointer"
                      >
                        {formatCurrency(item.finalAmount)}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {item.source === 'manual' ? (
                      <button
                        onClick={() => onResetToAuto(item.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full hover:bg-amber-200 transition-colors"
                        title="Click to reset to auto"
                      >
                        <Edit2 className="w-3 h-3" />
                        Manual
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Auto
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50 font-semibold">
                <td className="px-4 py-2.5 text-gray-700">Total {title}</td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5 text-right text-gray-900">
                  {formatCurrency(total)}
                </td>
                <td className="px-4 py-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

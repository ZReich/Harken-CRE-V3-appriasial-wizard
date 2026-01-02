/**
 * Cost Seg Supplemental Items Component
 * 
 * Manages supplemental items that are specific to cost segregation
 * and not typically captured in a standard appraisal.
 */

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Package, Camera, CheckCircle2, Info } from 'lucide-react';
import type { CostSegSupplementalItem, DepreciationClass } from '../types';

interface CostSegSupplementalItemsProps {
  items: CostSegSupplementalItem[];
  onUpdate: (items: CostSegSupplementalItem[]) => void;
  buildingId?: string;
  propertyType?: string;
  availablePhotos?: { id: string; url: string; caption?: string }[];
  onLinkPhoto?: (itemId: string, photoId: string) => void;
}

const DEPRECIATION_CLASS_OPTIONS: { value: DepreciationClass; label: string; color: string }[] = [
  { value: '5-year', label: '5-Year (Personal Property)', color: 'emerald' },
  { value: '7-year', label: '7-Year (Equipment)', color: 'blue' },
  { value: '15-year', label: '15-Year (Land Improvement)', color: 'amber' },
  { value: '27.5-year', label: '27.5-Year (Residential)', color: 'violet' },
  { value: '39-year', label: '39-Year (Nonresidential)', color: 'slate' },
];

const CATEGORY_OPTIONS = [
  { value: 'personal-property', label: 'Personal Property' },
  { value: 'land-improvement', label: 'Land Improvement' },
  { value: 'tenant-improvement', label: 'Tenant Improvement' },
  { value: 'specialty-equipment', label: 'Specialty Equipment' },
];

// Example items by property type
const EXAMPLE_ITEMS: Record<string, { description: string; category: string; depreciationClass: DepreciationClass; typicalCost: string }[]> = {
  restaurant: [
    { description: 'Commercial Kitchen Equipment Package', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$50,000-$150,000' },
    { description: 'Walk-in Cooler/Freezer', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$15,000-$40,000' },
    { description: 'Bar Equipment & Fixtures', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$20,000-$60,000' },
    { description: 'Decorative Interior Finishes', category: 'tenant-improvement', depreciationClass: '5-year', typicalCost: '$10,000-$30,000' },
  ],
  office: [
    { description: 'Server Room Raised Floor', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$5,000-$15,000' },
    { description: 'Movable Partitions', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$10,000-$30,000' },
    { description: 'Tenant Improvement Allowance', category: 'tenant-improvement', depreciationClass: '5-year', typicalCost: '$20-$50 per SF' },
  ],
  retail: [
    { description: 'Display Fixtures & Shelving', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$15,000-$50,000' },
    { description: 'Decorative Lighting', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$10,000-$30,000' },
    { description: 'Exterior Signage', category: 'land-improvement', depreciationClass: '15-year', typicalCost: '$5,000-$20,000' },
  ],
  industrial: [
    { description: 'Process Equipment', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$100,000-$500,000' },
    { description: 'Material Handling Equipment', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$50,000-$200,000' },
    { description: 'Specialty Exhaust Systems', category: 'personal-property', depreciationClass: '5-year', typicalCost: '$30,000-$100,000' },
  ],
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const CostSegSupplementalItems: React.FC<CostSegSupplementalItemsProps> = ({
  items,
  onUpdate,
  buildingId,
  propertyType = 'office',
  availablePhotos = [],
  onLinkPhoto,
}) => {
  const [showExamples, setShowExamples] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const examples = EXAMPLE_ITEMS[propertyType.toLowerCase()] || [];

  const handleAddItem = useCallback((template?: typeof examples[0]) => {
    const newItem: CostSegSupplementalItem = {
      id: `supp-${Date.now()}`,
      description: template?.description || '',
      category: (template?.category as any) || 'personal-property',
      depreciationClass: template?.depreciationClass || '5-year',
      cost: 0,
      buildingId,
    };
    
    onUpdate([...items, newItem]);
    setEditingItemId(newItem.id);
    setShowExamples(false);
  }, [items, onUpdate, buildingId]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<CostSegSupplementalItem>) => {
    onUpdate(items.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, [items, onUpdate]);

  const handleDeleteItem = useCallback((id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  }, [items, onUpdate]);

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Supplemental Items</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-900">
          Total: {formatCurrency(totalCost)}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-medium mb-1">Add items specific to cost segregation</p>
          <p>Include tenant improvements, specialty equipment, or decorative items not captured in the standard appraisal.</p>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <SupplementalItemCard
              key={item.id}
              item={item}
              index={index}
              isEditing={editingItemId === item.id}
              onEdit={() => setEditingItemId(item.id)}
              onSave={() => setEditingItemId(null)}
              onUpdate={(updates) => handleUpdateItem(item.id, updates)}
              onDelete={() => handleDeleteItem(item.id)}
              availablePhotos={availablePhotos}
              onLinkPhoto={onLinkPhoto}
            />
          ))}
        </div>
      )}

      {/* Add Item Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => handleAddItem()}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border-2 border-dashed border-purple-200 hover:border-purple-300"
        >
          <Plus className="w-4 h-4" />
          Add Custom Item
        </button>

        {examples.length > 0 && (
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {showExamples ? 'Hide' : 'Show'} Example Items for {propertyType}
          </button>
        )}
      </div>

      {/* Example Items */}
      {showExamples && examples.length > 0 && (
        <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">Common Items for {propertyType}</h4>
          <div className="space-y-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleAddItem(example)}
                className="w-full text-left p-2 bg-white border border-purple-200 hover:border-purple-300 rounded-lg transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{example.description}</div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{example.depreciationClass}</span>
                  <span>{example.typicalCost}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Supplemental Item Card Component
interface SupplementalItemCardProps {
  item: CostSegSupplementalItem;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onUpdate: (updates: Partial<CostSegSupplementalItem>) => void;
  onDelete: () => void;
  availablePhotos: { id: string; url: string; caption?: string }[];
  onLinkPhoto?: (itemId: string, photoId: string) => void;
}

const SupplementalItemCard: React.FC<SupplementalItemCardProps> = ({
  item,
  index,
  isEditing,
  onEdit,
  onSave,
  onUpdate,
  onDelete,
  availablePhotos,
  onLinkPhoto,
}) => {
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  const depClassOption = DEPRECIATION_CLASS_OPTIONS.find(opt => opt.value === item.depreciationClass);
  const categoryOption = CATEGORY_OPTIONS.find(opt => opt.value === item.category);

  if (!isEditing) {
    // Display mode
    return (
      <div
        onClick={onEdit}
        className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors border border-purple-200"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{item.description || 'Unnamed item'}</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${depClassOption?.color}-100 text-${depClassOption?.color}-700`}>
              {item.depreciationClass}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="font-semibold text-gray-900">{formatCurrency(item.cost)}</span>
            <span>• {categoryOption?.label}</span>
            {item.linkedPhotoIds && item.linkedPhotoIds.length > 0 && (
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {item.linkedPhotoIds.length} photo{item.linkedPhotoIds.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="p-4 bg-white border-2 border-purple-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">Item #{index + 1}</h4>
        <button
          onClick={onSave}
          className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
        >
          Done
        </button>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="e.g., Commercial Kitchen Equipment Package"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Category and Depreciation Class */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            value={item.category}
            onChange={(e) => onUpdate({ category: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Depreciation Class</label>
          <select
            value={item.depreciationClass}
            onChange={(e) => onUpdate({ depreciationClass: e.target.value as DepreciationClass })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {DEPRECIATION_CLASS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cost */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Cost</label>
        <input
          type="number"
          value={item.cost}
          onChange={(e) => onUpdate({ cost: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea
          value={item.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Optional notes, vendor info, etc..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Photo Linking */}
      <div>
        <button
          onClick={() => setShowPhotoSelector(!showPhotoSelector)}
          className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900"
        >
          <Camera className="w-4 h-4" />
          Link Photos ({item.linkedPhotoIds?.length || 0})
        </button>
        {showPhotoSelector && availablePhotos.length > 0 && (
          <div className="mt-2 p-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {availablePhotos.slice(0, 8).map(photo => (
                <button
                  key={photo.id}
                  onClick={() => {
                    const currentIds = item.linkedPhotoIds || [];
                    const isLinked = currentIds.includes(photo.id);
                    onUpdate({
                      linkedPhotoIds: isLinked
                        ? currentIds.filter(id => id !== photo.id)
                        : [...currentIds, photo.id]
                    });
                  }}
                  className={`relative aspect-square rounded overflow-hidden border-2 ${
                    item.linkedPhotoIds?.includes(photo.id)
                      ? 'border-purple-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                  {item.linkedPhotoIds?.includes(photo.id) && (
                    <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSegSupplementalItems;

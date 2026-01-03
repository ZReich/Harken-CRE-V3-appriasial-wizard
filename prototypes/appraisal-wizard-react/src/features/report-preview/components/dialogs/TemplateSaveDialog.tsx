import React, { useState } from 'react';
import { X, Check, Info, Star } from 'lucide-react';

interface TemplateSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: TemplateFormData) => void;
  initialData?: Partial<TemplateFormData>;
  savedItemsSummary?: {
    scenarios: number;
    customFields: number;
    contentTemplates: number;
  };
}

export interface TemplateFormData {
  name: string;
  description: string;
  useCase: string;
  propertyTypes: string[];
  tags: string[];
  isPublic: boolean;
}

const PROPERTY_TYPE_OPTIONS = [
  'Industrial',
  'Office',
  'Retail',
  'Multi-Family',
  'Land',
  'Mixed-Use',
];

const USE_CASE_OPTIONS = [
  'Standard bank loan appraisal',
  'Internal valuation',
  'Litigation support',
  'Estate planning',
  'Insurance purposes',
  'Tax appeal',
  'Other',
];

export const TemplateSaveDialog: React.FC<TemplateSaveDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  savedItemsSummary,
}) => {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    useCase: initialData.useCase || '',
    propertyTypes: initialData.propertyTypes || [],
    tags: initialData.tags || [],
    isPublic: initialData.isPublic ?? true,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    if (!formData.useCase) {
      newErrors.useCase = 'Please select a use case';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  const handlePropertyTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="text-amber-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Save as Template</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Industrial Shop/Office Appraisal"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.name ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Template for light industrial properties with shop and office components..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            {/* Use Case */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Use Case <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.useCase}
                onChange={e => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.useCase ? 'border-red-300' : 'border-slate-200'
                }`}
              >
                <option value="">Select a use case...</option>
                {USE_CASE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.useCase && (
                <p className="text-sm text-red-500 mt-1">{errors.useCase}</p>
              )}
            </div>

            {/* Property Types */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Property Types (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPE_OPTIONS.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePropertyTypeToggle(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.propertyTypes.includes(type)
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {formData.propertyTypes.includes(type) && (
                      <Check size={14} className="inline mr-1" />
                    )}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tags (comma separated)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="industrial, shop, bank loan"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-sm rounded"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What gets saved info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Info size={16} className="text-slate-400" />
                What gets saved in the template:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={14} />
                  Scenario structure
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={14} />
                  Selected approaches
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={14} />
                  Section visibility
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={14} />
                  {savedItemsSummary?.customFields || 0} custom fields
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={14} />
                  Report styling
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={14} />
                  Content templates
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <X size={14} />
                    Property-specific data
                  </div>
                  <div className="flex items-center gap-2">
                    <X size={14} />
                    Uploaded photos
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.isPublic}
                    onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                    className="w-4 h-4 text-sky-500"
                  />
                  <span className="text-sm text-slate-600">Private - Only I can see this template</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.isPublic}
                    onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                    className="w-4 h-4 text-sky-500"
                  />
                  <span className="text-sm text-slate-600">Team - Share with my organization</span>
                </label>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSaveDialog;


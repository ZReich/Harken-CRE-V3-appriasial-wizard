/**
 * ClassificationGuidance Component
 * 
 * Provides comprehensive guidance on IRS depreciation class assignments,
 * helping users understand why components are classified as they are.
 * 
 * References:
 * - IRS Revenue Procedure 87-56 (Asset Class Lives)
 * - Treasury Decision 9636 (Tangible Property Regulations)
 * - IRC Sections 1245, 1250
 */

import React, { useState } from 'react';
import {
  Info,
  ChevronDown,
  ChevronRight,
  Clock,
  Building2,
  Layers,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Scale,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  DepreciationClass,
  DEPRECIATION_CLASSES,
  ALL_COMPONENT_CLASSIFICATIONS,
  getComponentsByClass,
} from '../../../constants/costSegregation';

interface ClassificationGuidanceProps {
  className?: string;
  highlightClass?: DepreciationClass;
  showExamples?: boolean;
  variant?: 'full' | 'popup' | 'tooltip';
}

interface ClassificationDetail {
  depClass: DepreciationClass;
  title: string;
  description: string;
  irsReference: string;
  keyCharacteristics: string[];
  commonExamples: string[];
  borderlineItems: { item: string; note: string }[];
  taxTreatment: {
    method: string;
    convention: string;
    recapture: string;
  };
  color: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
}

const CLASSIFICATION_DETAILS: ClassificationDetail[] = [
  {
    depClass: '5-year',
    title: '5-Year Personal Property',
    description: 'Tangible personal property with a 5-year MACRS recovery period. These are generally items that can be removed without damaging the building structure.',
    irsReference: 'IRC Section 1245; MACRS Asset Class 00.11-00.4; Rev. Proc. 87-56',
    keyCharacteristics: [
      'Property that is not inherently permanent',
      'Can be moved without significant damage',
      'Primarily serves a business function rather than building function',
      'Does not become part of the building structure',
    ],
    commonExamples: [
      'Carpeting and floor coverings',
      'Decorative lighting and fixtures',
      'Cabinets and millwork',
      'Window treatments (blinds, shades)',
      'Data/communication cabling',
      'Kitchen equipment and appliances',
    ],
    borderlineItems: [
      { item: 'Specialty flooring', note: 'Must be non-structural and removable' },
      { item: 'Built-in cabinets', note: 'Qualifies if primarily decorative/functional, not structural' },
      { item: 'Security systems', note: 'Access control qualifies; structural security may not' },
    ],
    taxTreatment: {
      method: '200% Declining Balance',
      convention: 'Half-Year Convention',
      recapture: 'Section 1245 - Ordinary income recapture',
    },
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      accent: 'bg-emerald-500',
    },
  },
  {
    depClass: '7-year',
    title: '7-Year Personal Property',
    description: 'Office furniture, fixtures, and equipment not specifically assigned to a shorter class. This is the default class for personal property not elsewhere classified.',
    irsReference: 'IRC Section 1245; MACRS Asset Class 57.0',
    keyCharacteristics: [
      'General office furniture and fixtures',
      'Property not assigned to 5-year class',
      'Default class for tangible personal property',
      'Includes agricultural structures and equipment',
    ],
    commonExamples: [
      'Office desks and chairs',
      'Freestanding shelving units',
      'Break room furniture',
      'Agricultural machinery',
      'Certain manufacturing equipment',
    ],
    borderlineItems: [
      { item: 'Modular furniture systems', note: 'May qualify for 5-year if meeting specific criteria' },
      { item: 'Heavy machinery', note: 'Classification depends on specific use and industry' },
    ],
    taxTreatment: {
      method: '200% Declining Balance',
      convention: 'Half-Year Convention',
      recapture: 'Section 1245 - Ordinary income recapture',
    },
    color: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      accent: 'bg-green-500',
    },
  },
  {
    depClass: '15-year',
    title: '15-Year Land Improvements',
    description: 'Improvements to land that are separate from building structures. These are depreciable improvements that are inherently permanent but not part of the building itself.',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    keyCharacteristics: [
      'Improvements made to the land, not the building',
      'Inherently permanent structures outside the building',
      'Items that enhance the use or value of land',
      'Not part of the building foundation or structure',
    ],
    commonExamples: [
      'Parking lots and paving',
      'Sidewalks and curbing',
      'Landscaping and irrigation',
      'Site lighting and poles',
      'Fencing and gates',
      'Exterior signage',
      'Retaining walls (site, not building)',
    ],
    borderlineItems: [
      { item: 'Parking garage', note: 'If attached to building, may be 39-year' },
      { item: 'Covered walkways', note: 'Classification depends on attachment to building' },
      { item: 'Loading docks', note: 'Site-related portions qualify; structural portions may not' },
    ],
    taxTreatment: {
      method: '150% Declining Balance',
      convention: 'Half-Year Convention',
      recapture: 'Section 1250 - Applies to excess depreciation',
    },
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      accent: 'bg-blue-500',
    },
  },
  {
    depClass: '27.5-year',
    title: '27.5-Year Residential Rental Property',
    description: 'Residential rental property and its structural components. Applies to buildings where 80% or more of gross rental income is from dwelling units.',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    keyCharacteristics: [
      'Buildings with 80%+ residential use',
      'Apartments, condos, rental houses',
      'Building shell and structural components',
      'Core building systems (HVAC, electrical, plumbing)',
    ],
    commonExamples: [
      'Foundation and framing',
      'Exterior walls and roof',
      'Central HVAC systems',
      'Electrical service and distribution',
      'Plumbing systems',
      'Elevators and stairs',
    ],
    borderlineItems: [
      { item: 'Mixed-use buildings', note: 'Must meet 80% residential income test' },
      { item: 'Furnished rentals', note: 'Building is 27.5-year; furnishings may be 5-year' },
    ],
    taxTreatment: {
      method: 'Straight-Line',
      convention: 'Mid-Month Convention',
      recapture: 'Section 1250 - Straight-line recapture',
    },
    color: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      accent: 'bg-purple-500',
    },
  },
  {
    depClass: '39-year',
    title: '39-Year Nonresidential Real Property',
    description: 'Commercial and industrial buildings and their structural components. This is the default class for building structures in cost segregation studies.',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    keyCharacteristics: [
      'Office buildings, retail, industrial',
      'Building shell and structural components',
      'Items inherently permanent and integral to structure',
      'Core building systems that serve the entire building',
    ],
    commonExamples: [
      'Foundation, footings, and slab',
      'Structural framing (steel, concrete, wood)',
      'Exterior walls and facade',
      'Roofing systems',
      'Central HVAC equipment and ductwork',
      'Base building electrical and plumbing',
    ],
    borderlineItems: [
      { item: 'Tenant improvements', note: 'QIP may qualify for 15-year treatment' },
      { item: 'Specialty systems', note: 'Process-related may qualify for 5-year' },
    ],
    taxTreatment: {
      method: 'Straight-Line',
      convention: 'Mid-Month Convention',
      recapture: 'Section 1250 - Straight-line recapture',
    },
    color: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      accent: 'bg-slate-500',
    },
  },
];

export const ClassificationGuidance: React.FC<ClassificationGuidanceProps> = ({
  className = '',
  highlightClass,
  showExamples = true,
  variant = 'full',
}) => {
  const [expandedClass, setExpandedClass] = useState<DepreciationClass | null>(
    highlightClass || null
  );

  // Tooltip variant
  if (variant === 'tooltip') {
    const detail = CLASSIFICATION_DETAILS.find(d => d.depClass === highlightClass);
    if (!detail) return null;

    return (
      <div className={`bg-white rounded-lg shadow-lg border border-slate-200 p-4 max-w-sm ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded ${detail.color.accent}`} />
          <span className="font-semibold text-slate-900">{detail.title}</span>
        </div>
        <p className="text-sm text-slate-600 mb-3">{detail.description}</p>
        <div className="text-xs text-slate-500">
          <span className="font-medium">IRS Reference:</span> {detail.irsReference}
        </div>
      </div>
    );
  }

  // Popup variant (simpler, fewer details)
  if (variant === 'popup') {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden max-w-2xl ${className}`}>
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0da1c7]" />
            IRS Depreciation Classes
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {CLASSIFICATION_DETAILS.map((detail) => (
            <div
              key={detail.depClass}
              className={`p-3 rounded-lg border ${detail.color.bg} ${detail.color.border}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2.5 h-2.5 rounded ${detail.color.accent}`} />
                <span className={`font-medium ${detail.color.text}`}>
                  {detail.title}
                </span>
              </div>
              <p className="text-sm text-slate-600 ml-5">
                {detail.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0da1c7]/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#0da1c7]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              IRS Depreciation Class Guide
            </h3>
            <p className="text-sm text-slate-500">
              Understanding component classification for cost segregation
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="mb-2">
              <strong>Cost segregation</strong> reclassifies building components from the default 
              39-year (commercial) or 27.5-year (residential) depreciation to shorter recovery periods. 
              This accelerates depreciation deductions and improves cash flow.
            </p>
            <p>
              Click on each class below to learn about eligibility requirements and common examples.
            </p>
          </div>
        </div>
      </div>

      {/* Class Cards */}
      <div className="p-6 space-y-3">
        {CLASSIFICATION_DETAILS.map((detail) => {
          const isExpanded = expandedClass === detail.depClass;
          const components = showExamples ? getComponentsByClass(detail.depClass) : [];

          return (
            <div
              key={detail.depClass}
              className={`border rounded-xl overflow-hidden transition-all ${
                isExpanded ? detail.color.border : 'border-slate-200'
              } ${highlightClass === detail.depClass ? 'ring-2 ring-offset-2 ring-[#0da1c7]' : ''}`}
            >
              {/* Class Header */}
              <button
                onClick={() => setExpandedClass(isExpanded ? null : detail.depClass)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  isExpanded ? detail.color.bg : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${detail.color.accent} rounded-lg flex items-center justify-center`}>
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{detail.title}</div>
                    <div className="text-xs text-slate-500">{detail.irsReference}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${detail.color.bg} ${detail.color.text} ${detail.color.border} border`}>
                    {detail.taxTreatment.method}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className={`px-4 py-4 ${detail.color.bg} border-t ${detail.color.border}`}>
                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4">
                    {detail.description}
                  </p>

                  {/* Key Characteristics */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                      Key Characteristics
                    </h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {detail.keyCharacteristics.map((char, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Examples */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                      Common Examples
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {detail.commonExamples.map((example, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 text-xs rounded-full bg-white ${detail.color.text} border ${detail.color.border}`}
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Borderline Items */}
                  {detail.borderlineItems.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Borderline Items (Require Analysis)
                      </h5>
                      <div className="space-y-2">
                        {detail.borderlineItems.map((item, idx) => (
                          <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                            <div className="font-medium text-sm text-amber-800">{item.item}</div>
                            <div className="text-xs text-amber-700">{item.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tax Treatment */}
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      Tax Treatment
                    </h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">Depreciation Method</div>
                        <div className="font-medium text-slate-900">{detail.taxTreatment.method}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Convention</div>
                        <div className="font-medium text-slate-900">{detail.taxTreatment.convention}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Recapture</div>
                        <div className="font-medium text-slate-900">{detail.taxTreatment.recapture}</div>
                      </div>
                    </div>
                  </div>

                  {/* Component List from Constants */}
                  {showExamples && components.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        Classified Components ({components.length})
                      </h5>
                      <div className="max-h-40 overflow-y-auto">
                        <ul className="grid grid-cols-2 gap-1 text-xs">
                          {components.slice(0, 20).map((comp) => (
                            <li key={comp.id} className="text-slate-600 truncate" title={comp.notes}>
                              • {comp.label}
                            </li>
                          ))}
                        </ul>
                        {components.length > 20 && (
                          <p className="text-xs text-slate-500 mt-2">
                            And {components.length - 20} more components...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p>
            Component classifications are based on IRS Revenue Procedure 87-56, Treasury Decision 9636, 
            and established engineering-based cost segregation methodology. Individual property analysis 
            may vary based on specific facts and circumstances.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassificationGuidance;

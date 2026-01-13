/**
 * ZoningExhibitPage - Zoning Analysis Exhibit
 * =============================================
 * 
 * Renders a full-page zoning analysis exhibit displaying
 * the property's zoning designation, permitted uses,
 * bulk regulations, and conformance status.
 * 
 * Features:
 * - Zoning designation with code
 * - Permitted/conditional uses table
 * - Bulk regulations (FAR, height, setbacks)
 * - Conformance status analysis
 */

import React from 'react';

interface ZoningData {
  zoningCode?: string;
  zoningDescription?: string;
  permittedUses?: string[];
  conditionalUses?: string[];
  bulkRegulations?: {
    far?: number;
    maxHeight?: number;
    frontSetback?: number;
    sideSetback?: number;
    rearSetback?: number;
    lotCoverage?: number;
    minLotSize?: number;
  };
  currentUse?: string;
  conformanceStatus?: 'conforming' | 'legal-nonconforming' | 'nonconforming' | 'unknown';
  specialOverlays?: string[];
  notes?: string;
}

interface ZoningExhibitPageProps {
  data: ZoningData;
  pageNumber?: number;
  propertyAddress?: string;
}

/**
 * Gets conformance status badge color and label
 */
const getConformanceInfo = (status: ZoningData['conformanceStatus']): { color: string; label: string } => {
  switch (status) {
    case 'conforming':
      return { color: '#22c55e', label: 'Conforming Use' };
    case 'legal-nonconforming':
      return { color: '#f59e0b', label: 'Legal Non-Conforming' };
    case 'nonconforming':
      return { color: '#ef4444', label: 'Non-Conforming' };
    default:
      return { color: '#64748b', label: 'Status Unknown' };
  }
};

export const ZoningExhibitPage: React.FC<ZoningExhibitPageProps> = ({
  data,
  pageNumber = 1,
  propertyAddress = 'Subject Property',
}) => {
  const {
    zoningCode,
    zoningDescription,
    permittedUses = [],
    conditionalUses = [],
    bulkRegulations,
    currentUse,
    conformanceStatus,
    specialOverlays = [],
    notes,
  } = data;

  const conformance = getConformanceInfo(conformanceStatus);

  return (
    <div
      className="bg-white shadow-lg overflow-hidden"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '0.5in',
        boxSizing: 'border-box',
      }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Zoning Analysis</h2>
          <p className="text-sm text-slate-500">{propertyAddress}</p>
        </div>
        {pageNumber && (
          <span className="text-sm text-slate-400">Page {pageNumber}</span>
        )}
      </div>

      {/* Zoning Designation Header */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{zoningCode || 'N/A'}</h3>
            {zoningDescription && (
              <p className="text-sm text-slate-600 mt-1">{zoningDescription}</p>
            )}
          </div>
          <span
            className="px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: conformance.color }}
          >
            {conformance.label}
          </span>
        </div>
        {currentUse && (
          <p className="text-sm text-slate-500 mt-3">
            <span className="font-medium">Current Use:</span> {currentUse}
          </p>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Permitted Uses */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            Permitted Uses
          </h4>
          {permittedUses.length > 0 ? (
            <ul className="space-y-1.5">
              {permittedUses.map((use, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {use}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">Not specified</p>
          )}
        </div>

        {/* Conditional Uses */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            Conditional Uses
          </h4>
          {conditionalUses.length > 0 ? (
            <ul className="space-y-1.5">
              {conditionalUses.map((use, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-amber-500 mt-0.5">◆</span>
                  {use}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">Not specified</p>
          )}
        </div>
      </div>

      {/* Bulk Regulations */}
      {bulkRegulations && (
        <div className="mb-6 p-4 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Bulk Regulations
          </h4>
          <div className="grid grid-cols-4 gap-4">
            {bulkRegulations.far !== undefined && (
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">
                  {bulkRegulations.far.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Floor Area Ratio
                </p>
              </div>
            )}
            {bulkRegulations.maxHeight !== undefined && (
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">
                  {bulkRegulations.maxHeight}'
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Max Height
                </p>
              </div>
            )}
            {bulkRegulations.lotCoverage !== undefined && (
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">
                  {bulkRegulations.lotCoverage}%
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Lot Coverage
                </p>
              </div>
            )}
            {bulkRegulations.minLotSize !== undefined && (
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">
                  {bulkRegulations.minLotSize.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Min Lot Size (SF)
                </p>
              </div>
            )}
          </div>
          
          {/* Setbacks */}
          {(bulkRegulations.frontSetback !== undefined || 
            bulkRegulations.sideSetback !== undefined || 
            bulkRegulations.rearSetback !== undefined) && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {bulkRegulations.frontSetback !== undefined && (
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-lg font-medium text-slate-800">
                    {bulkRegulations.frontSetback}'
                  </p>
                  <p className="text-xs text-slate-500">Front Setback</p>
                </div>
              )}
              {bulkRegulations.sideSetback !== undefined && (
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-lg font-medium text-slate-800">
                    {bulkRegulations.sideSetback}'
                  </p>
                  <p className="text-xs text-slate-500">Side Setback</p>
                </div>
              )}
              {bulkRegulations.rearSetback !== undefined && (
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-lg font-medium text-slate-800">
                    {bulkRegulations.rearSetback}'
                  </p>
                  <p className="text-xs text-slate-500">Rear Setback</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Special Overlays */}
      {specialOverlays.length > 0 && (
        <div className="mb-6 p-4 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
            Special Overlay Districts
          </h4>
          <div className="flex flex-wrap gap-2">
            {specialOverlays.map((overlay, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
              >
                {overlay}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
            Zoning Notes
          </h4>
          <p className="text-sm text-slate-600">{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>Zoning Analysis - {zoningCode || 'N/A'} - {propertyAddress}</p>
      </div>
    </div>
  );
};

export default ZoningExhibitPage;

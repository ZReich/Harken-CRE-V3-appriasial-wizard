/**
 * EnvironmentalExhibitPage - Environmental Summary Exhibit
 * ==========================================================
 * 
 * Renders a full-page environmental summary exhibit displaying
 * environmental status, Phase I/II references, flood zone data,
 * and any hazard disclosures.
 * 
 * Features:
 * - Environmental status overview
 * - Phase I/II study references
 * - FEMA flood zone information
 * - Hazard and contamination disclosures
 */

import React from 'react';
import { ReportPageBase } from './ReportPageBase';

interface EnvironmentalData {
  hasEnvironmentalIssues?: boolean;
  environmentalStatus?: 'clear' | 'rec' | 'nfa' | 'open' | 'unknown';
  phaseIDate?: string;
  phaseIProvider?: string;
  phaseIFindings?: string;
  phaseIIRequired?: boolean;
  phaseIIDate?: string;
  phaseIIProvider?: string;
  phaseIIFindings?: string;
  floodZone?: string;
  floodZoneDate?: string;
  floodInsuranceRequired?: boolean;
  wetlandsPresent?: boolean;
  wetlandsDescription?: string;
  knownContamination?: string[];
  asbestosPresent?: boolean;
  leadPaintPresent?: boolean;
  undergroundTanks?: boolean;
  hazardNotes?: string;
}

interface EnvironmentalExhibitPageProps {
  data: EnvironmentalData;
  pageNumber?: number;
  propertyAddress?: string;
}

/**
 * Gets environmental status badge info
 */
const getStatusInfo = (status: EnvironmentalData['environmentalStatus']): { color: string; label: string; description: string } => {
  switch (status) {
    case 'clear':
      return { 
        color: '#22c55e', 
        label: 'No Issues Identified', 
        description: 'No recognized environmental conditions were identified.' 
      };
    case 'rec':
      return { 
        color: '#f59e0b', 
        label: 'REC Identified', 
        description: 'Recognized Environmental Condition(s) identified requiring further investigation.' 
      };
    case 'nfa':
      return { 
        color: '#22c55e', 
        label: 'No Further Action', 
        description: 'Previous conditions have been remediated; no further action required.' 
      };
    case 'open':
      return { 
        color: '#ef4444', 
        label: 'Open Investigation', 
        description: 'Environmental investigation or remediation is ongoing.' 
      };
    default:
      return { 
        color: '#64748b', 
        label: 'Status Unknown', 
        description: 'Environmental status has not been determined.' 
      };
  }
};

/**
 * Formats a date string
 */
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const EnvironmentalExhibitPage: React.FC<EnvironmentalExhibitPageProps> = ({
  data,
  pageNumber = 1,
  propertyAddress = 'Subject Property',
}) => {
  const {
    environmentalStatus,
    phaseIDate,
    phaseIProvider,
    phaseIFindings,
    phaseIIRequired,
    phaseIIDate,
    phaseIIProvider,
    phaseIIFindings,
    floodZone,
    floodZoneDate,
    floodInsuranceRequired,
    wetlandsPresent,
    wetlandsDescription,
    knownContamination = [],
    asbestosPresent,
    leadPaintPresent,
    undergroundTanks,
    hazardNotes,
  } = data;

  const status = getStatusInfo(environmentalStatus);

  return (
    <ReportPageBase
      title="Environmental Summary"
      sidebarLabel="ENV"
      pageNumber={pageNumber}
      sectionNumber={2}
      sectionTitle="PROPERTY"
      contentPadding="p-10"
    >

      {/* Environmental Status Header */}
      <div
        className="mb-6 p-4 rounded-lg"
        style={{ backgroundColor: `${status.color}15`, border: `2px solid ${status.color}` }}
      >
        <div className="flex items-center gap-4">
          <span
            className="w-12 h-12 flex items-center justify-center rounded-full"
            style={{ backgroundColor: status.color }}
          >
            {environmentalStatus === 'clear' || environmentalStatus === 'nfa' ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : environmentalStatus === 'open' || environmentalStatus === 'rec' ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>
          <div>
            <h3 className="text-xl font-bold" style={{ color: status.color }}>
              {status.label}
            </h3>
            <p className="text-sm text-slate-600">{status.description}</p>
          </div>
        </div>
      </div>

      {/* Phase I Assessment */}
      <div className="mb-6 p-4 border border-slate-200 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Phase I Environmental Site Assessment
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Date Completed</p>
            <p className="text-sm font-medium text-slate-800">{formatDate(phaseIDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Provider</p>
            <p className="text-sm font-medium text-slate-800">{phaseIProvider || 'N/A'}</p>
          </div>
        </div>
        {phaseIFindings && (
          <div className="mt-3 p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-500 mb-1">Findings Summary</p>
            <p className="text-sm text-slate-600">{phaseIFindings}</p>
          </div>
        )}
      </div>

      {/* Phase II Assessment (if applicable) */}
      {phaseIIRequired && (
        <div className="mb-6 p-4 border border-amber-200 rounded-lg bg-amber-50">
          <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-4">
            Phase II Environmental Site Assessment
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-amber-600">Date Completed</p>
              <p className="text-sm font-medium text-slate-800">{formatDate(phaseIIDate)}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600">Provider</p>
              <p className="text-sm font-medium text-slate-800">{phaseIIProvider || 'N/A'}</p>
            </div>
          </div>
          {phaseIIFindings && (
            <div className="mt-3 p-3 bg-white rounded border border-amber-200">
              <p className="text-xs text-amber-600 mb-1">Findings Summary</p>
              <p className="text-sm text-slate-600">{phaseIIFindings}</p>
            </div>
          )}
        </div>
      )}

      {/* Flood Zone Information */}
      <div className="mb-6 p-4 border border-slate-200 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          FEMA Flood Zone Determination
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{floodZone || 'N/A'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Flood Zone</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-lg font-medium text-slate-800">{formatDate(floodZoneDate)}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Determination Date</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p
              className="text-lg font-bold"
              style={{ color: floodInsuranceRequired ? '#ef4444' : '#22c55e' }}
            >
              {floodInsuranceRequired ? 'Required' : 'Not Required'}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Flood Insurance</p>
          </div>
        </div>
      </div>

      {/* Hazard Indicators */}
      <div className="mb-6 p-4 border border-slate-200 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Hazard Indicators
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <HazardIndicator label="Wetlands" present={wetlandsPresent} />
          <HazardIndicator label="Asbestos" present={asbestosPresent} />
          <HazardIndicator label="Lead Paint" present={leadPaintPresent} />
          <HazardIndicator label="USTs" present={undergroundTanks} />
        </div>
        
        {wetlandsPresent && wetlandsDescription && (
          <div className="mt-3 p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-500 mb-1">Wetlands Description</p>
            <p className="text-sm text-slate-600">{wetlandsDescription}</p>
          </div>
        )}
        
        {knownContamination.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
            <p className="text-xs text-red-600 mb-1">Known Contamination</p>
            <ul className="list-disc list-inside text-sm text-slate-600">
              {knownContamination.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Notes */}
      {hazardNotes && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
            Environmental Notes
          </h4>
          <p className="text-sm text-slate-600">{hazardNotes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>Environmental Summary - {propertyAddress}</p>
      </div>
    </ReportPageBase>
  );
};

/**
 * Helper component for hazard indicators
 */
const HazardIndicator: React.FC<{ label: string; present?: boolean }> = ({ label, present }) => (
  <div
    className="text-center p-2 rounded"
    style={{
      backgroundColor: present === undefined ? '#f1f5f9' : present ? '#fef2f2' : '#f0fdf4',
      border: `1px solid ${present === undefined ? '#e2e8f0' : present ? '#fecaca' : '#bbf7d0'}`,
    }}
  >
    <span
      className="text-lg"
      style={{ color: present === undefined ? '#94a3b8' : present ? '#ef4444' : '#22c55e' }}
    >
      {present === undefined ? '?' : present ? '!' : '✓'}
    </span>
    <p className="text-xs text-slate-600 mt-1">{label}</p>
  </div>
);

export default EnvironmentalExhibitPage;

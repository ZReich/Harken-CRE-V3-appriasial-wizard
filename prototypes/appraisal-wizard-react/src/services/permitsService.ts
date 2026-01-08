/**
 * Building Permits Service
 * 
 * Fetches building permit data from the Vercel API routes.
 * - County records for Montana
 * - Cotality data for other states
 */

import { apiPost } from './api';

export interface BuildingPermitEntry {
  id: string;
  permitNumber: string;
  permitType: 'new_construction' | 'addition' | 'alteration' | 'repair' | 'demolition' | 'mechanical' | 'electrical' | 'plumbing' | 'other';
  description: string;
  issuedDate: string;
  completedDate?: string;
  expirationDate?: string;
  status: 'issued' | 'active' | 'completed' | 'expired' | 'cancelled' | 'pending';
  estimatedValue?: number;
  actualValue?: number;
  contractor?: string;
  contractorLicense?: string;
  inspectionsPassed?: number;
  inspectionsRequired?: number;
  address?: string;
  parcelId?: string;
  source: 'county' | 'state' | 'cotality' | 'mock';
}

interface PermitsResponse {
  success: boolean;
  data: BuildingPermitEntry[];
  source: string;
  county?: string;
  note?: string;
  error?: string;
}

/**
 * Fetch building permits for a property
 */
export async function fetchBuildingPermits(params: {
  address?: string;
  city?: string;
  state?: string;
  county?: string;
  parcelId?: string;
  latitude?: number;
  longitude?: number;
}): Promise<{
  data: BuildingPermitEntry[];
  source: string;
  county?: string;
  note?: string;
  error?: string;
}> {
  try {
    const response = await apiPost<PermitsResponse, typeof params>(
      '/permits/query',
      params
    );

    if (!response.success) {
      return {
        data: [],
        source: 'error',
        error: response.error || 'Failed to fetch permit data',
      };
    }

    return {
      data: response.data || [],
      source: response.source || 'unknown',
      county: response.county,
      note: response.note,
    };
  } catch (error) {
    console.error('Permits service error:', error);
    return {
      data: [],
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format permit value for display
 */
export function formatPermitValue(value?: number): string {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Get permit type label
 */
export function getPermitTypeLabel(type: BuildingPermitEntry['permitType']): string {
  const labels: Record<string, string> = {
    new_construction: 'New Construction',
    addition: 'Addition',
    alteration: 'Alteration',
    repair: 'Repair',
    demolition: 'Demolition',
    mechanical: 'Mechanical',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    other: 'Other',
  };
  return labels[type] || type;
}

/**
 * Get status color class
 */
export function getStatusColor(status: BuildingPermitEntry['status']): string {
  const colors: Record<string, string> = {
    issued: 'bg-blue-100 text-blue-700',
    active: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    expired: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-accent-red-light text-harken-error',
    pending: 'bg-harken-gray-light text-harken-gray',
  };
  return colors[status] || 'bg-harken-gray-light text-harken-gray';
}

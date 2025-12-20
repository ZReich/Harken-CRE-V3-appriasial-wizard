// Helper functions for comps pages
import { propertyTypeColors, statusColors } from './design-tokens';

export const formatCurrency = (value: number | string | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatNumber = (value: number | string | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatSquareFeet = (value: number | string | null | undefined): string => {
  const formatted = formatNumber(value, 0);
  return formatted === '-' ? '-' : `${formatted} SF`;
};

export const formatAcres = (value: number | string | null | undefined): string => {
  const formatted = formatNumber(value, 2);
  return formatted === '-' ? '-' : `${formatted} Acres`;
};

export const formatPercent = (value: number | string | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  
  return `${num.toFixed(decimals)}%`;
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
};

export const getPropertyTypeColor = (propertyType: string | null | undefined): string => {
  if (!propertyType) return propertyTypeColors.office;
  
  const type = propertyType.toLowerCase();
  if (type.includes('office')) return propertyTypeColors.office;
  if (type.includes('retail')) return propertyTypeColors.retail;
  if (type.includes('industrial')) return propertyTypeColors.industrial;
  if (type.includes('multifamily') || type.includes('multi-family')) return propertyTypeColors.multifamily;
  if (type.includes('hospitality') || type.includes('hotel')) return propertyTypeColors.hospitality;
  if (type.includes('special')) return propertyTypeColors.special;
  if (type.includes('land')) return propertyTypeColors.land;
  if (type.includes('residential')) return propertyTypeColors.residential;
  
  return propertyTypeColors.office;
};

export const getStatusColor = (status: string | null | undefined): string => {
  if (!status) return statusColors.pending;
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('sold')) return statusColors.sold;
  if (statusLower.includes('lease')) return statusColors.leased;
  if (statusLower.includes('pending')) return statusColors.pending;
  if (statusLower.includes('expired')) return statusColors.expired;
  if (statusLower.includes('active')) return statusColors.active;
  if (statusLower.includes('withdrawn')) return statusColors.withdrawn;
  
  return statusColors.pending;
};

export const getStatusLabel = (compType: string, status: string | null | undefined): string => {
  if (!status) return 'Pending';
  
  // Normalize status
  const statusLower = status.toLowerCase();
  if (statusLower.includes('sold') || statusLower.includes('sale')) return 'Sold';
  if (statusLower.includes('lease')) return 'Leased';
  if (statusLower.includes('pending')) return 'Pending';
  if (statusLower.includes('expired')) return 'Expired';
  if (statusLower.includes('active')) return 'Active';
  if (statusLower.includes('withdrawn')) return 'Withdrawn';
  
  return status;
};

export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getImageUrl = (imageUrl: string | null | undefined, fallback: string): string => {
  if (!imageUrl || imageUrl.trim() === '') return fallback;
  return imageUrl;
};

export const calculateDaysOnMarket = (dateSold: string | null | undefined): number | null => {
  if (!dateSold) return null;
  
  try {
    const soldDate = new Date(dateSold);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - soldDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
};

export const getPricePerUnit = (
  price: number | null | undefined,
  units: number | null | undefined,
  label: string = 'SF'
): string => {
  if (!price || !units || units === 0) return '-';
  const pricePerUnit = price / units;
  return `${formatCurrency(pricePerUnit, 2)}/${label}`;
};

// Debounce utility for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Local storage helpers for preferences
export const getViewPreference = (compType: string): 'cards' | 'table' | 'map' => {
  const saved = localStorage.getItem(`viewPreference_${compType}`);
  if (saved === 'cards' || saved === 'table' || saved === 'map') {
    return saved;
  }
  
  // Default preferences by comp type
  if (compType === 'residential' || compType === 'land_only') {
    return 'cards';
  }
  return 'table'; // Commercial default
};

export const setViewPreference = (compType: string, view: 'cards' | 'table' | 'map'): void => {
  localStorage.setItem(`viewPreference_${compType}`, view);
};



















/**
 * Property Lookup Modal
 * 
 * A modal dialog for looking up property data from:
 * - Montana Cadastral GIS (FREE for MT properties)
 * - Cotality API (for out-of-state properties, mock data currently)
 * 
 * Follows existing dialog patterns (see FinalizeDialog.tsx)
 */

import { useState } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Building2, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Info
} from 'lucide-react';
import ButtonSelector from './ButtonSelector';
import { getPropertyData, getLookupCostInfo, type PropertyLookupResult } from '../services/propertyDataRouter';
import type { CadastralData } from '../types/api';

type LookupMethod = 'address' | 'coordinates' | 'parcelId';

interface PropertyLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: CadastralData) => void;
  initialState?: string;
}

const LOOKUP_METHOD_OPTIONS = [
  { value: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
  { value: 'coordinates', label: 'Coordinates', icon: <Building2 className="w-4 h-4" /> },
  { value: 'parcelId', label: 'Parcel ID', icon: <FileText className="w-4 h-4" /> },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function PropertyLookupModal({ 
  isOpen, 
  onClose, 
  onImport, 
  initialState = 'MT' 
}: PropertyLookupModalProps) {
  const [lookupMethod, setLookupMethod] = useState<LookupMethod>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PropertyLookupResult | null>(null);
  
  // Form fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(initialState);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [parcelId, setParcelId] = useState('');

  if (!isOpen) return null;

  const costInfo = getLookupCostInfo(state);

  const handleSearch = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      let lookupResult: PropertyLookupResult;

      if (lookupMethod === 'address') {
        lookupResult = await getPropertyData({
          address,
          city,
          state,
        });
      } else if (lookupMethod === 'coordinates') {
        lookupResult = await getPropertyData({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          state,
        });
      } else {
        lookupResult = await getPropertyData({
          parcelId,
          state,
        });
      }

      setResult(lookupResult);
    } catch (error) {
      setResult({
        success: false,
        data: null,
        source: 'mock',
        isFreeService: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (result?.success && result.data) {
      onImport(result.data);
      handleClose();
    }
  };

  const handleClose = () => {
    setResult(null);
    setAddress('');
    setCity('');
    setLatitude('');
    setLongitude('');
    setParcelId('');
    onClose();
  };

  const canSearch = () => {
    if (lookupMethod === 'address') {
      return address.trim() && city.trim() && state;
    } else if (lookupMethod === 'coordinates') {
      return latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));
    } else {
      return parcelId.trim() && state;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-harken-blue/10 rounded-lg">
              <Search className="w-5 h-5 text-harken-blue" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-harken-dark dark:text-white">Property Lookup</h2>
              <p className="text-sm text-harken-gray-med dark:text-slate-400">Search for property data to auto-fill fields</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-harken-gray-light rounded-lg transition-colors"
          >
            <X size={20} className="text-harken-gray-med" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Cost indicator */}
          <div className={`mb-6 p-3 rounded-lg flex items-center gap-3 ${
            costInfo.isFree 
              ? 'bg-accent-teal-mint-light border border-light-border' 
              : 'bg-accent-amber-gold-light border border-light-border'
          }`}>
            <div className={`p-2 rounded-full ${
              costInfo.isFree ? 'bg-accent-teal-mint-light' : 'bg-accent-amber-gold-light'
            }`}>
              {costInfo.isFree 
                ? <CheckCircle className="w-4 h-4 text-accent-teal-mint" />
                : <DollarSign className="w-4 h-4 text-accent-amber-gold" />
              }
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                costInfo.isFree ? 'text-accent-teal-mint' : 'text-accent-amber-gold'
              }`}>
                {costInfo.provider}
              </p>
              <p className={`text-xs ${
                costInfo.isFree ? 'text-accent-teal-mint' : 'text-accent-amber-gold'
              }`}>
                {costInfo.note}
              </p>
            </div>
          </div>

          {/* Lookup Method Selector */}
          <ButtonSelector
            options={LOOKUP_METHOD_OPTIONS}
            value={lookupMethod}
            onChange={(v) => setLookupMethod(v as LookupMethod)}
            label="Lookup Method"
            size="sm"
            className="mb-6"
          />

          {/* State Selector - Always visible */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-harken-gray mb-2">
              State <span className="text-harken-error">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg focus:outline-none focus:ring-2 focus:ring-harken-blue focus:border-transparent"
            >
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Address Fields */}
          {lookupMethod === 'address' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-harken-gray mb-2">
                  Street Address <span className="text-harken-error">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border border-light-border rounded-lg focus:outline-none focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-harken-gray mb-2">
                  City <span className="text-harken-error">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Billings"
                  className="w-full px-3 py-2 border border-light-border rounded-lg focus:outline-none focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Coordinate Fields */}
          {lookupMethod === 'coordinates' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-harken-gray mb-2">
                  Latitude <span className="text-harken-error">*</span>
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="45.7833"
                  className="w-full px-3 py-2 border border-light-border rounded-lg focus:outline-none focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-harken-gray mb-2">
                  Longitude <span className="text-harken-error">*</span>
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-108.5007"
                  className="w-full px-3 py-2 border border-light-border rounded-lg focus:outline-none focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Parcel ID Field */}
          {lookupMethod === 'parcelId' && (
            <div>
              <label className="block text-sm font-medium text-harken-gray mb-2">
                Parcel ID / Tax ID <span className="text-harken-error">*</span>
              </label>
              <input
                type="text"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                placeholder="56-0001234-00"
                className="w-full px-3 py-2 border border-light-border rounded-lg focus:outline-none focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              />
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg border ${
              result.success 
                ? 'bg-accent-teal-mint-light border-light-border' 
                : 'bg-accent-red-light border-light-border'
            }`}>
              {result.success && result.data ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-accent-teal-mint" />
                    <span className="font-medium text-accent-teal-mint">Property Found</span>
                    <span className="text-xs bg-accent-teal-mint-light text-accent-teal-mint px-2 py-0.5 rounded">
                      {result.source}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-harken-gray-med dark:text-slate-400">Address:</span>
                      <p className="font-medium text-harken-dark dark:text-white">{result.data.situsAddress}</p>
                    </div>
                    <div>
                      <span className="text-harken-gray-med dark:text-slate-400">Parcel ID:</span>
                      <p className="font-medium text-harken-dark dark:text-white">{result.data.parcelId}</p>
                    </div>
                    <div>
                      <span className="text-harken-gray-med dark:text-slate-400">County:</span>
                      <p className="font-medium text-harken-dark dark:text-white">{result.data.county}</p>
                    </div>
                    <div>
                      <span className="text-harken-gray-med dark:text-slate-400">Size:</span>
                      <p className="font-medium text-harken-dark dark:text-white">
                        {result.data.acres > 0 
                          ? `${result.data.acres.toFixed(2)} acres` 
                          : `${result.data.sqft.toLocaleString()} SF`}
                      </p>
                    </div>
                    <div>
                      <span className="text-harken-gray-med dark:text-slate-400">Owner:</span>
                      <p className="font-medium text-harken-dark dark:text-white">{result.data.ownerName}</p>
                    </div>
                    <div>
                      <span className="text-harken-gray-med dark:text-slate-400">Assessed Value:</span>
                      <p className="font-medium text-harken-dark dark:text-white">{formatCurrency(result.data.totalAssessedValue)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-harken-gray-med dark:text-slate-400">Legal Description:</span>
                      <p className="font-medium text-harken-dark dark:text-white text-xs">{result.data.legalDescription}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-harken-error" />
                  <span className="text-harken-error">{result.error || 'Property not found'}</span>
                </div>
              )}
            </div>
          )}

          {/* Info about mock data */}
          {!costInfo.isFree && (
            <div className="mt-4 p-3 bg-harken-gray-light rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-harken-gray-med mt-0.5 flex-shrink-0" />
              <p className="text-xs text-harken-gray-med dark:text-slate-400">
                Out-of-state lookups currently use simulated data. Full Cotality API integration 
                will be available when the enterprise API key is activated.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-light-border bg-harken-gray-light">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-harken-gray hover:bg-harken-gray-med-lt rounded-lg transition-colors"
          >
            Cancel
          </button>
          {result?.success && result.data ? (
            <button
              onClick={handleImport}
              className="px-6 py-2 bg-accent-teal-mint text-white rounded-lg hover:bg-accent-teal-mint/90 transition-colors font-medium flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Import Data
            </button>
          ) : (
            <button
              onClick={handleSearch}
              disabled={!canSearch() || isLoading}
              className="px-6 py-2 bg-harken-blue text-white rounded-lg hover:bg-harken-blue/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search Property
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyLookupModal;



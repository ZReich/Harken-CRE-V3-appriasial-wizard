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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0da1c7]/10 rounded-lg">
              <Search className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Property Lookup</h2>
              <p className="text-sm text-slate-500">Search for property data to auto-fill fields</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Cost indicator */}
          <div className={`mb-6 p-3 rounded-lg flex items-center gap-3 ${
            costInfo.isFree 
              ? 'bg-emerald-50 border border-emerald-200' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className={`p-2 rounded-full ${
              costInfo.isFree ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              {costInfo.isFree 
                ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                : <DollarSign className="w-4 h-4 text-amber-600" />
              }
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                costInfo.isFree ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {costInfo.provider}
              </p>
              <p className={`text-xs ${
                costInfo.isFree ? 'text-emerald-600' : 'text-amber-600'
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Billings"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Coordinate Fields */}
          {lookupMethod === 'coordinates' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="45.7833"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-108.5007"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Parcel ID Field */}
          {lookupMethod === 'parcelId' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parcel ID / Tax ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                placeholder="56-0001234-00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              />
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg border ${
              result.success 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {result.success && result.data ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-emerald-700">Property Found</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                      {result.source}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Address:</span>
                      <p className="font-medium text-slate-800">{result.data.situsAddress}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Parcel ID:</span>
                      <p className="font-medium text-slate-800">{result.data.parcelId}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">County:</span>
                      <p className="font-medium text-slate-800">{result.data.county}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Size:</span>
                      <p className="font-medium text-slate-800">
                        {result.data.acres > 0 
                          ? `${result.data.acres.toFixed(2)} acres` 
                          : `${result.data.sqft.toLocaleString()} SF`}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Owner:</span>
                      <p className="font-medium text-slate-800">{result.data.ownerName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Assessed Value:</span>
                      <p className="font-medium text-slate-800">{formatCurrency(result.data.totalAssessedValue)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Legal Description:</span>
                      <p className="font-medium text-slate-800 text-xs">{result.data.legalDescription}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{result.error || 'Property not found'}</span>
                </div>
              )}
            </div>
          )}

          {/* Info about mock data */}
          {!costInfo.isFree && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-500">
                Out-of-state lookups currently use simulated data. Full Cotality API integration 
                will be available when the enterprise API key is activated.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {result?.success && result.data ? (
            <button
              onClick={handleImport}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Import Data
            </button>
          ) : (
            <button
              onClick={handleSearch}
              disabled={!canSearch() || isLoading}
              className="px-6 py-2 bg-[#0da1c7] text-white rounded-lg hover:bg-[#0b8fb3] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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



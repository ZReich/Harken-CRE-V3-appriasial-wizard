/**
 * Google Places Autocomplete Input Component
 * Provides address autocomplete using Google Places API
 */
import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useGooglePlaces, type PlaceDetails } from '../hooks/useGooglePlaces';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Start typing an address...',
  className = '',
  disabled = false,
  required = false,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoaded, isLoading, error, initAutocomplete } = useGooglePlaces();
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteInitialized = useRef(false);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteInitialized.current) {
      const autocomplete = initAutocomplete(inputRef.current, (place) => {
        // Update the input value with the street address
        onChange(place.street);
        // Pass full place details to parent
        onPlaceSelect(place);
      });

      if (autocomplete) {
        autocompleteInitialized.current = true;
        console.log('[GooglePlacesAutocomplete] Initialized successfully');
      }
    }
  }, [isLoaded, initAutocomplete, onChange, onPlaceSelect]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Prevent form submission on Enter (let autocomplete handle it)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Check if autocomplete dropdown is visible
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && getComputedStyle(pacContainer).display !== 'none') {
        e.preventDefault();
      }
    }
  };

  const baseInputClass = `w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent transition-all ${className}`;
  
  const inputClass = disabled
    ? `${baseInputClass} bg-gray-100 border-gray-200 cursor-not-allowed`
    : error
      ? `${baseInputClass} border-amber-300 bg-amber-50`
      : `${baseInputClass} border-gray-300`;

  return (
    <div className="relative">
      {/* Input with icon */}
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
          isFocused ? 'text-[#0da1c7]' : 'text-gray-400'
        }`}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : error ? (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={inputClass}
          disabled={disabled}
          required={required}
          autoComplete="off"
        />
      </div>

      {/* Status indicator */}
      {isLoaded && !error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            Autocomplete
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.includes('API key') 
            ? 'Address autocomplete unavailable - you can still type manually'
            : 'Autocomplete unavailable - type manually'}
        </p>
      )}
    </div>
  );
}

// Also export the PlaceDetails type for convenience
export type { PlaceDetails };



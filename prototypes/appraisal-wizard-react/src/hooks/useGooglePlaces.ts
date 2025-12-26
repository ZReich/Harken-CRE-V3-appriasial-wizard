/**
 * Hook to load and manage Google Places API
 */
/// <reference types="@types/google.maps" />
import { useState, useEffect, useCallback, useRef } from 'react';

// Extend Window interface to include Google Maps
declare global {
  interface Window {
    google?: typeof google;
    initGooglePlaces?: () => void;
  }
}

interface UseGooglePlacesOptions {
  apiKey?: string;
  libraries?: string[];
}

interface PlaceDetails {
  street: string;
  city: string;
  state: string;
  stateCode: string;
  zip: string;
  county: string;
  country: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
}

interface UseGooglePlacesReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  initAutocomplete: (
    inputElement: HTMLInputElement,
    onPlaceSelected: (place: PlaceDetails) => void
  ) => google.maps.places.Autocomplete | null;
}

// Script loading state shared across all hook instances
let isScriptLoaded = false;
let isScriptLoading = false;
let scriptLoadError: string | null = null;
const loadCallbacks: (() => void)[] = [];

/**
 * Load the Google Places API script
 */
function loadGooglePlacesScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (isScriptLoaded && window.google?.maps?.places) {
      resolve();
      return;
    }

    // Currently loading - queue the callback
    if (isScriptLoading) {
      loadCallbacks.push(() => {
        if (scriptLoadError) {
          reject(new Error(scriptLoadError));
        } else {
          resolve();
        }
      });
      return;
    }

    // Start loading
    isScriptLoading = true;

    // Create callback function
    window.initGooglePlaces = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
      resolve();
    };

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      scriptLoadError = 'Failed to load Google Maps script';
      isScriptLoading = false;
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
      reject(new Error(scriptLoadError));
    };

    document.head.appendChild(script);
  });
}

/**
 * Parse Google Place result into structured address
 */
function parsePlaceResult(place: google.maps.places.PlaceResult): PlaceDetails {
  const details: PlaceDetails = {
    street: '',
    city: '',
    state: '',
    stateCode: '',
    zip: '',
    county: '',
    country: '',
    formattedAddress: place.formatted_address || '',
    latitude: place.geometry?.location?.lat(),
    longitude: place.geometry?.location?.lng(),
  };

  let streetNumber = '';
  let route = '';

  if (place.address_components) {
    for (const component of place.address_components) {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality')) {
        details.city = component.long_name;
      } else if (types.includes('sublocality_level_1') && !details.city) {
        // Fallback for cities like NYC boroughs
        details.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        details.state = component.long_name;
        details.stateCode = component.short_name;
      } else if (types.includes('administrative_area_level_2')) {
        // County usually has "County" suffix
        details.county = component.long_name.replace(/ County$/i, '');
      } else if (types.includes('postal_code')) {
        details.zip = component.long_name;
      } else if (types.includes('country')) {
        details.country = component.short_name;
      }
    }
  }

  // Combine street number and route
  details.street = [streetNumber, route].filter(Boolean).join(' ');

  return details;
}

export function useGooglePlaces(options: UseGooglePlacesOptions = {}): UseGooglePlacesReturn {
  const apiKey = options.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const [isLoaded, setIsLoaded] = useState(isScriptLoaded);
  const [isLoading, setIsLoading] = useState(isScriptLoading);
  const [error, setError] = useState<string | null>(scriptLoadError);
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load the script
  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in your environment.');
      return;
    }

    if (isScriptLoaded) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    
    loadGooglePlacesScript(apiKey)
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [apiKey]);

  /**
   * Initialize autocomplete on an input element
   */
  const initAutocomplete = useCallback(
    (
      inputElement: HTMLInputElement,
      onPlaceSelected: (place: PlaceDetails) => void
    ): google.maps.places.Autocomplete | null => {
      if (!isLoaded || !window.google?.maps?.places) {
        console.warn('[GooglePlaces] Script not loaded yet');
        return null;
      }

      // Clean up previous instance
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      // Create autocomplete instance
      const autocomplete = new google.maps.places.Autocomplete(inputElement, {
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry'],
        types: ['address'],
      });

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          console.warn('[GooglePlaces] No address components in place result');
          return;
        }

        const details = parsePlaceResult(place);
        console.log('[GooglePlaces] Place selected:', details);
        onPlaceSelected(details);
      });

      autocompleteRef.current = autocomplete;
      return autocomplete;
    },
    [isLoaded]
  );

  return {
    isLoaded,
    isLoading,
    error,
    initAutocomplete,
  };
}

export type { PlaceDetails };


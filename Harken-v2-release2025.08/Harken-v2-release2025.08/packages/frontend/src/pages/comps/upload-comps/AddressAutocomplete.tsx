import LocationOnIcon from '@mui/icons-material/LocationOn';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { getZipCode } from '@/utils/get-zipcode';

type PlacesService = google.maps.places.PlacesService;
type AutocompleteService = google.maps.places.AutocompleteService;
type AutocompletePrediction = google.maps.places.AutocompletePrediction;

const autocompleteService: { current: null | AutocompleteService } = {
  current: null,
};
const placesService: { current: null | PlacesService } = { current: null };

interface AddressAutocompleteProps {
  value?: string;
  onAddressSelected?: (addressData: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
    geometry: { lat: number; lng: number };
  }) => void;
  onManualInput?: (value: string) => void;
  placeholder?: string;
  disableManualInput?: boolean;
}

const AddressAutocomplete = React.memo(function AddressAutocomplete({
  value = '',
  onAddressSelected,
  onManualInput,
  placeholder = 'Enter address...',
  disableManualInput = false,
}: AddressAutocompleteProps): React.ReactElement {
  const [selectedValue, setSelectedValue] =
    useState<AutocompletePrediction | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<AutocompletePrediction[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const autoCompleteRef = useRef(null);

  const debouncedManualInput = useMemo(
    () =>
      debounce((val: string) => {
        if (onManualInput) {
          onManualInput(val);
        }
      }, 300),
    [onManualInput]
  );

  const debouncedAddressSelected = useMemo(
    () =>
      debounce((val: string) => {
        if (onAddressSelected && !disableManualInput) {
          onAddressSelected({
            address: val,
            city: '',
            state: '',
            zipCode: '',
            county: '',
            geometry: { lat: 0, lng: 0 },
          });
        }
      }, 500),
    [onAddressSelected, disableManualInput]
  );

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          request: { input: string },
          callback: (results?: AutocompletePrediction[]) => void
        ) => {
          if (!autocompleteService.current && (window as any).google) {
            autocompleteService.current = new (
              window as any
            ).google.maps.places.AutocompleteService();
          }
          if (autocompleteService.current) {
            (autocompleteService.current as any).getPlacePredictions(
              request,
              callback
            );
          } else {
            callback([]);
          }
        },
        200
      ),
    []
  );

  const instantiatePlacesService = () => {
    if (!placesService.current && (window as any).google) {
      placesService.current = new (
        window as any
      ).google.maps.places.PlacesService(autoCompleteRef.current);
    }
  };

  const fetchPlaceDetails = async (placeId: string, description: string) => {
    if (!placesService.current) instantiatePlacesService();
    if (!placesService.current) {
      return;
    }

    const request = {
      placeId,
      fields: [
        'name',
        'formatted_address',
        'address_component',
        'photos',
        'place_id',
        'geometry',
        'plus_code',
        'types',
      ],
    };

    await new Promise<void>((resolve) => {
      (placesService.current as any).getDetails(
        request,
        async (placeResult: any) => {
          const { lat, lng }: any = placeResult.geometry.location;
          const geometry = {
            lat: lat(),
            lng: lng(),
          };

          try {
            const getZipCodeCity = await getZipCode(
              placeResult?.address_components,
              placeResult?.formatted_address
            );

            if (onAddressSelected) {
              const stateAbbreviations: { [key: string]: string } = {
                Alabama: 'AL',
                Alaska: 'AK',
                Arizona: 'AZ',
                Arkansas: 'AR',
                California: 'CA',
                Colorado: 'CO',
                Connecticut: 'CT',
                Delaware: 'DE',
                Florida: 'FL',
                Georgia: 'GA',
                Hawaii: 'HI',
                Idaho: 'ID',
                Illinois: 'IL',
                Indiana: 'IN',
                Iowa: 'IA',
                Kansas: 'KS',
                Kentucky: 'KY',
                Louisiana: 'LA',
                Maine: 'ME',
                Maryland: 'MD',
                Massachusetts: 'MA',
                Michigan: 'MI',
                Minnesota: 'MN',
                Mississippi: 'MS',
                Missouri: 'MO',
                Montana: 'MT',
                Nebraska: 'NE',
                Nevada: 'NV',
                'New Hampshire': 'NH',
                'New Jersey': 'NJ',
                'New Mexico': 'NM',
                'New York': 'NY',
                'North Carolina': 'NC',
                'North Dakota': 'ND',
                Ohio: 'OH',
                Oklahoma: 'OK',
                Oregon: 'OR',
                Pennsylvania: 'PA',
                'Rhode Island': 'RI',
                'South Carolina': 'SC',
                'South Dakota': 'SD',
                Tennessee: 'TN',
                Texas: 'TX',
                Utah: 'UT',
                Vermont: 'VT',
                Virginia: 'VA',
                Washington: 'WA',
                'West Virginia': 'WV',
                Wisconsin: 'WI',
                Wyoming: 'WY',
              };

              const stateAbbr =
                stateAbbreviations[getZipCodeCity.state] ||
                getZipCodeCity.state ||
                '';

              onAddressSelected({
                address: description,
                city: getZipCodeCity.city || '',
                state: stateAbbr,
                zipCode: getZipCodeCity.zipCode || '',
                county: getZipCodeCity.county || '',
                geometry,
              });
            }
          } catch (error) {
            console.error('Error in fetchPlaceDetails:', error);
          }
          resolve();
        }
      );
    });
  };

  React.useEffect(() => {
    instantiatePlacesService();
  }, []);

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (
        window as any
      ).google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    // Fetch suggestions if user has typed something and it's at least 2 characters
    if (inputValue === '' || inputValue.length < 2) {
      setOptions([]);
      return undefined;
    }

    fetch({ input: inputValue }, (results?: AutocompletePrediction[]) => {
      if (active) {
        setOptions(results || []);
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, fetch]);

  // Update input value when value prop changes, but only if it's different from current input
  useEffect(() => {
    if (value !== inputValue && !isSelecting && !justSelected) {
      setInputValue(value);
    }
  }, [value]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedManualInput.cancel?.();
      debouncedAddressSelected.cancel?.();
    };
  }, [debouncedManualInput, debouncedAddressSelected]);

  return (
    <>
      <Autocomplete
        freeSolo
        disableClearable
        style={{ width: '100%' }}
        id="address-autocomplete"
        getOptionLabel={(option) =>
          typeof option === 'string'
            ? option
            : option.structured_formatting?.main_text || ''
        }
        filterOptions={(x) => x}
        options={options}
        autoComplete
        clearOnBlur={false}
        clearOnEscape
        includeInputInList
        filterSelectedOptions
        inputValue={inputValue}
        value={selectedValue}
        onChange={(_: any, newValue: any) => {
          if (!newValue) {
            setSelectedValue(null);
            setInputValue('');
            setOptions([]);
            setIsSelecting(false);
            setJustSelected(false);
            debouncedManualInput.cancel?.();
            debouncedAddressSelected.cancel?.();
            if (onManualInput) {
              onManualInput('');
            }
          } else {
            setIsSelecting(true);
            setJustSelected(true);

            const selectedAddress =
              newValue?.structured_formatting?.main_text || '';

            debouncedManualInput.cancel?.();
            debouncedAddressSelected.cancel?.();

            setSelectedValue(newValue);
            setInputValue(selectedAddress);
            setOptions([]);

            fetchPlaceDetails(newValue.place_id, selectedAddress);

            setTimeout(() => {
              setIsSelecting(false);
              setJustSelected(false);
            }, 500);
          }
        }}
        onInputChange={(_, newInputValue) => {
          if (isSelecting || justSelected) return;

          setInputValue(newInputValue);
          debouncedManualInput(newInputValue);
          debouncedAddressSelected(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            fullWidth
            placeholder={placeholder}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '14px',
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          const mainText = option.structured_formatting?.main_text || '';
          const secondaryText =
            option.structured_formatting?.secondary_text || '';
          const matches =
            option.structured_formatting?.main_text_matched_substrings || [];
          const parts = parse(
            mainText,
            matches.map((match: any) => [
              match.offset,
              match.offset + match.length,
            ])
          );

          return (
            <li
              {...props}
              className="py-1 text-sm border-t border-gray-400 shadow-md"
            >
              <Grid container spacing={1}>
                <Grid item xs={1}>
                  <LocationOnIcon sx={{ fontSize: '16px' }} />
                </Grid>
                <Grid item xs={11}>
                  <div>
                    {parts.map((part, index) => (
                      <span
                        key={index}
                        style={{ fontWeight: part.highlight ? 700 : 400 }}
                      >
                        {part.text}
                      </span>
                    ))}
                  </div>
                  {secondaryText && (
                    <div style={{ color: '#888', fontSize: 12 }}>
                      {secondaryText}
                    </div>
                  )}
                </Grid>
              </Grid>
            </li>
          );
        }}
      />
      <div ref={autoCompleteRef} />
    </>
  );
});

export default AddressAutocomplete;

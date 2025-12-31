import LocationOnIcon from '@mui/icons-material/LocationOn';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';
import React, { useEffect } from 'react';
import { getZipCode } from '@/utils/get-zipcode';
import { useFormikContext } from 'formik';
// import StarIcon from '@mui/icons-material/Star';
type PlacesService = google.maps.places.PlacesService;
type PlaceResult = google.maps.places.PlaceResult;
type AutocompleteService = google.maps.places.AutocompleteService;
type AutocompletePrediction = google.maps.places.AutocompletePrediction;
const autocompleteService: { current: null | AutocompleteService } = {
  current: null,
};
const placesService: { current: null | PlacesService } = { current: null };

type Props = {
  style?: any;
  variant?: 'outlined' | 'filled' | 'standard';
  onLocationSelected?: (p: AutocompletePrediction | null) => void;
  onSelected?: any;
  onPlaceDetails?: (p: PlaceResult | null) => void;
  onRawInput?: (input: string) => void;
  setPassData?: any;
  setPassDataZipCode?: any;
  passData?: any;
  updateData?: any;
  label?: string;
};

export default function AutocompleteLocation({
  style,
  onLocationSelected,
  onPlaceDetails,
  onRawInput,
  variant = 'outlined',
  onSelected,
  passData,
  updateData,
  label,
}: Props): React.ReactElement {
  const [value, setValue] = React.useState<AutocompletePrediction | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<AutocompletePrediction[]>([]);
  const autoCompleteRef = React.useRef(null);
  const { setFieldValue, values }: any = useFormikContext();

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          request: { input: string },
          callback: (results?: AutocompletePrediction[]) => void
        ) => {
          // (autocompleteService.current as any).getPlacePredictions(
          //   request,
          //   callback
          // );

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
    } else {
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
              onSelected({ ...getZipCodeCity, geometry, description });
            } catch (error) {
              console.error('Error:', error);
            }
            if (placeResult && onPlaceDetails) {
              onPlaceDetails(placeResult as PlaceResult);
            }
            resolve();
          }
        );
      });
    }
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

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results?: AutocompletePrediction[]) => {
      if (active) {
        let newOptions = [] as AutocompletePrediction[];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  useEffect(() => {
    if (passData) {
      setFieldValue({
        description: passData.company,
      });
    }
  }, [passData]);

  useEffect(() => {
    if (updateData) {
      setFieldValue({
        description: updateData.street_address,
      });
    }
  }, [updateData]);
  return (
    <>
      <Autocomplete
        freeSolo
        disableClearable
        style={style}
        id="google-map"
        getOptionLabel={(option) =>
          typeof option === 'string'
            ? option
            : option.structured_formatting?.main_text
        }
        filterOptions={(x) => x}
        options={options}
        autoComplete
        clearOnBlur={false}
        clearOnEscape
        includeInputInList
        filterSelectedOptions
        value={
          (passData && passData.street_address) ||
          value?.structured_formatting?.main_text || // Show only street address
          (updateData && updateData.street_address) ||
          value ||
          (values && values?.company) ||
          (values && values?.street_address)
        }
        sx={{
          '.css-1d3z3hw-MuiOutlinedInput-notchedOutline': {
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
          },
          '.MuiAutocomplete-endAdornment': {
            top: '12px',
            zIndex: '99',
            position: 'relative',
            left: '0',
          },
        }}
        onChange={(_: any, newValue: any) => {
          if (!newValue) {
            setValue(null);
            setInputValue('');
            setOptions([]);
            onLocationSelected?.(null);
            onPlaceDetails?.(null);
          } else {
            setOptions([newValue, ...options]);
            setValue(newValue);
            fetchPlaceDetails(
              newValue.place_id,
              newValue?.structured_formatting?.main_text
            );
          }
        }}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
          onRawInput?.(newInputValue);
        }}
        renderInput={(params) => (
          <div className="streetAddressField">
            <span className="relative text-xs labelText text-customGray top-2">
              {label == 'appraisal' ? 'Company' : ' Street Address'}
              {label !== 'appraisal' ? (
                // <StarIcon className="relative text-[6px] text-red-500 top-[-10px]" />
                <span className="text-red-500"> *</span>
              ) : null}
            </span>
            <TextField
              {...params}
              className="text-[#B1BAC0] addressField"
              variant={variant}
              fullWidth
              value={inputValue} // Use inputValue to manage the field
            />
          </div>
        )}
        renderOption={(props, option) => {
          const mainText = option.structured_formatting?.main_text || '';
          const secondaryText = option.structured_formatting?.secondary_text || '';
          const matches = option.structured_formatting?.main_text_matched_substrings || [];
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
                  <LocationOnIcon />
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
}

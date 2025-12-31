import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';

interface City {
  city: string;
}

interface MultipleSelectCheckmarksProps {
  onChange: (selectedCities: City[]) => void;
  usaCity: City[] | any;
  label: string;
  state?: string | undefined | any;
  value?: City[] | undefined;
  appraisalData: any;
  compFilters?: any;
}

export default function AdvanceFilterMultipleSelectCheckmarks({
  onChange,
  usaCity,
  state,
  value = [],
  compFilters,

  // label,
}: MultipleSelectCheckmarksProps) {
  const [searchText, setSearchText] = React.useState('');
  
  console.log('🏙️ CITY COMPONENT RECEIVED:', {
    compFilters_city: compFilters?.city,
    value_prop: value
  });

  const [selectedCities, setSelectedCities] = React.useState<City[]>(
    value || []
  );
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false);

  React.useEffect(() => {
    if (value && value.length > 0 && !hasUserInteracted) {
      setSelectedCities(value);
    } else if (!value || value.length === 0) {
      // Clear cities when value is empty or null
      setSelectedCities([]);
      setHasUserInteracted(false); // Reset interaction flag when clearing
    }
  }, [value, hasUserInteracted]);

  // Reset search text when usaCity changes, but preserve selectedCities
  React.useEffect(() => {
    setSearchText('');
  }, [usaCity]);

  // Reset user interaction flag when component key changes (when switching between sale/lease)
  React.useEffect(() => {
    setHasUserInteracted(false);
  }, []);

  // Filter cities based on search text
  const filteredCities = React.useMemo(
    () =>
      searchText
        ? usaCity.filter((city: any) =>
            city?.city.toLowerCase().includes(searchText.toLowerCase())
          )
        : usaCity,
    [searchText, usaCity]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleChange = (event: SelectChangeEvent<City[]>) => {
    const newValue = event.target.value as City[];
    console.log('🏙️ CITY CHANGE: User selected:', newValue);
    console.log('🏙️ CITY CHANGE: Previous selectedCities:', selectedCities);

    setHasUserInteracted(true);
    setSelectedCities([...newValue]);
    onChange(newValue);
  };
  const stateLabel = usa_state[0][state] || 'State not found';

  return (
    <div className="demo-checkbox-label-dropdown mx-0">
      <FormControl sx={{ m: 1, width: '100%', marginTop: '0px' }}>
        <Select
          id="demo-multiple-checkbox"
          className="relative"
          multiple
          displayEmpty
          onOpen={() => setSearchText('')}
          value={selectedCities}
          renderValue={(selected: City[] | any) => {
            if (stateLabel === '--Select State--') {
              return 'Select a City';
            }
            if (usaCity?.length === 0) {
              return <div className="truncate">Select a City</div>;
            }
            if (selected?.length === 0 || selected[0] === '') {
              return <div>Select a City</div>;
            }
            return selected
              .map((x: any) => x?.city)
              .filter(Boolean)
              .join(', ');
          }}
          onChange={handleChange}
          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
          input={
            <OutlinedInput
              label="City"
              placeholder="Select a city"
              // sx={{
              //   '& .MuiOutlinedInput-notchedOutline': {
              //     borderRight: 'none',
              //     borderLeft: 'none',
              //     borderTop: 'none',
              //     borderBottom: '1px solid rgba(209, 213, 219, 1)',
              //     borderRadius: 0,
              //   },
              // }}
            />
          }
        >
          <TextField
            placeholder="Search..."
            fullWidth
            variant="outlined"
            size="small"
            onChange={handleSearchChange}
            value={searchText}
            autoFocus
            inputProps={{
              onBlur: (event) => {
                // Force focus back to the input field
                setTimeout(() => event.target.focus(), 0);
              },
            }}
            onMouseDown={(event) => event.stopPropagation()} // Prevent focus loss on click
            onKeyDown={(event) => event.stopPropagation()} // Keep cursor in the field
          />

          {/* Filtered Cities */}
          {filteredCities?.length > 0 ? (
            filteredCities?.map((city: any, index: any) => (
              <MenuItem key={`${city.city}-${index}`} value={city}>
                <Checkbox
                  checked={selectedCities?.some(
                    (selectedCity) => selectedCity?.city === city?.city
                  )}
                  onChange={(e) => {
                    let newSelected;
                    if (e.target.checked) {
                      // Add city
                      newSelected = [...selectedCities, city];
                    } else {
                      // Remove city
                      newSelected = selectedCities.filter(
                        (selectedCity) => selectedCity?.city !== city?.city
                      );
                    }
                    setHasUserInteracted(true);
                    setSelectedCities(newSelected);
                    onChange(newSelected);
                  }}
                />
                <ListItemText primary={city.city} />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No results found</MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
}

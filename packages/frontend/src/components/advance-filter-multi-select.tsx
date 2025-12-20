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
}

export default function AdvanceFilterMultipleSelectCheckmarks({
  onChange,
  usaCity,
  state,
  value = [],
  // label,
}: MultipleSelectCheckmarksProps) {
  const [searchText, setSearchText] = React.useState('');

  // Initialize selectedCities with the value prop
  const [selectedCities, setSelectedCities] = React.useState<City[]>(
    value || []
  );

  // Only update selectedCities when component first mounts or when value prop changes from empty to non-empty
  React.useEffect(() => {
    // Only set initial values, don't override user selections
    if (value && value.length > 0 && selectedCities.length === 0) {
      console.log('🔍 CITY COMPONENT: Setting initial values:', value);
      setSelectedCities(value);
    }
  }, [value]);

  // Reset search text when usaCity changes, but preserve selectedCities
  React.useEffect(() => {
    setSearchText('');
  }, [usaCity]);

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
    setSelectedCities(newValue);
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
          onChange={handleChange}
          MenuProps={{ PaperProps: { sx: { maxHeight: 600 } } }}
          input={
            <OutlinedInput
              label="City"
              placeholder="Select a city"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRight: 'none',
                  borderLeft: 'none',
                  borderTop: 'none',
                  borderBottom: '1px solid rgba(209, 213, 219, 1)',
                  borderRadius: 0,
                },
              }}
            />
          }
          renderValue={(selected: City[] | any) => {
            if (stateLabel === '--Select State--') {
              return 'Select a City';
            }
            // if(stateLabel === 'State not found') {
            //   return 'Select a City';
            // }
            if (usaCity?.length === 0) {
              return (
                <div className="truncate">
                  {/* No cities available in {stateLabel} */}
                  Select a City
                </div>
              );
            }
            if (selected?.length === 0 || selected[0] === '') {
              return <div>Select a City</div>;
            }
            return selected
              .map((x: any) => x?.city)
              .filter(Boolean)
              .join(', ');
          }}
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
              <MenuItem key={index} value={city}>
                <Checkbox
                  checked={selectedCities?.some(
                    (selectedCity) => selectedCity?.city === city?.city
                  )}
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

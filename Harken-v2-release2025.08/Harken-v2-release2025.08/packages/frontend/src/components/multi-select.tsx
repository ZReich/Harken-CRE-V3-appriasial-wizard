import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';

interface City {
  city: string;
}

interface MultipleSelectCheckmarksProps {
  onChange: (selectedCities: City[]) => void;
  usaCity: City[] | any;
  label: any;
  state?: any | undefined;
  value?: City[] | undefined;
  appraisalData: any;
}

export default function MultipleSelectCheckmarks({
  onChange,
  usaCity,
  label,
  state,
  value = [],
  appraisalData,
}: MultipleSelectCheckmarksProps) {
  const [, setIsSelectOpen] = React.useState(false);
  const [selectedCity, setSlectedCity] = React.useState<City[]>(value);
  const defaultCities = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? [{ city: value }]
      : [];
  const [selectedCities, setSelectedCities] =
    React.useState<City[]>(defaultCities);

  const stateLabel = usa_state[0][state] || 'State not found';

  React.useEffect(() => {
    if (value && value?.length > 0) {
      setSlectedCity(value);
    } else {
      let savedCities;
      if (label === 'Commercial') {
        savedCities = localStorage.getItem('selectedCities');
      } else if (label === 'Residential') {
        savedCities = localStorage.getItem('selectedCities_res');
      }
      if (savedCities) {
        try {
          const parsedCities = JSON.parse(savedCities);
          if (Array.isArray(parsedCities)) {
            // Convert string array to City objects if needed
            const cityObjects = parsedCities.map(cityItem => 
              typeof cityItem === 'string' ? { city: cityItem } : cityItem
            );
            setSelectedCities(cityObjects);
          } else {
            setSelectedCities([]);
          }
        } catch (e) {
          console.error('Failed to parse selectedCities from localStorage', e);
          setSelectedCities([]);
        }
      } else {
        setSelectedCities([]);
      }
    }
  }, [usaCity]);

  React.useEffect(() => {
    if (value?.length) {
      const selected = usaCity.filter(
        (city: any) => city.city === appraisalData?.city
      );
      if (selected.length > 0) {
        setSelectedCities(selected);
        setSlectedCity(selected);
      }
    }
  }, [appraisalData?.city, usaCity]);

  const handleChange = (event: SelectChangeEvent<typeof selectedCities>) => {
    const {
      target: { value },
    } = event;
    setSelectedCities(value as City[]);
    setSlectedCity(selectedCity);
    onChange(value as City[]);
  };
  return (
    <div className={`demo-checkbox-label-dropdown`}>
      <FormControl sx={{ m: 1, width: '100%', marginTop: '0px' }}>
        <Select
          id="demo-multiple-checkbox"
          className="relative"
          multiple
          displayEmpty
          value={selectedCities}
          onChange={handleChange}
          onOpen={() => setIsSelectOpen(true)}
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
          renderValue={(selected: City[]) => {
            if (stateLabel === '--Select State--') {
              return 'Select a City';
            }
            //  if (stateLabel === 'State not found') {
            //   return 'Select a City';
            // }
            if (usaCity?.length === 0) {
              return <div className="truncate">
                {/* No cities available in {stateLabel} */}
                Select a City
                </div>;
            }
            
            if (selected?.length === 0) {
              return <div>Select a City</div>;
            }
            return selected
              .map((x) => x?.city)
              .filter(Boolean)
              .join(', ');
          }}
        >
          {usaCity &&
            usaCity.map((city: any, index: any) => (
              <MenuItem key={index} value={city as any}>
                <Checkbox
                  checked={
                    selectedCities.length > 0 &&
                    selectedCities?.some((item) => item?.city === city.city)
                  }
                />
                <ListItemText primary={city.city} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
}

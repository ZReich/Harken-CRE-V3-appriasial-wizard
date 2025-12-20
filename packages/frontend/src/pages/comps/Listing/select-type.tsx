import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { useGet } from '@/hook/useGet';

interface Option {
  id: number;
  name: string;
  code: string;
}

interface MultipleSelectWithAPIProps {
  onChange: (selectedOptions: any) => void; 
  label: string; 
  value?: Option[];
  style?: any; 
  options?: Option[]; 
  setOptions?: React.Dispatch<React.SetStateAction<Option[]>>; 
}

export default function MultipleSelectWithchangesAPI({
  onChange,
  label,
  style,
}: MultipleSelectWithAPIProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]); 

  const [, setStoredValues] = React.useState<string[]>([]); 

  const { data } = useGet<any>({
    queryKey: 'all',
    endPoint: `globalCodes`,
    config: { refetchOnWindowFocus: false },
  });
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('property_type');
      localStorage.removeItem('compStatus');
      localStorage.removeItem('params');
      localStorage.removeItem('start_date');
      localStorage.removeItem('end_date');
      localStorage.removeItem('street_address');
      localStorage.removeItem('all');
      localStorage.removeItem('cap_rate_max');
      localStorage.removeItem('building_sf_min');
      localStorage.removeItem('building_sf_max');
      localStorage.removeItem('price_sf_min');
      localStorage.removeItem('price_sf_max');
      localStorage.removeItem('square_footage_max');
      localStorage.removeItem('square_footage_min');
      localStorage.removeItem('compType');
      localStorage.removeItem('land_sf_max');
      localStorage.removeItem('land_sf_min');
      localStorage.removeItem('comp_type');
      localStorage.removeItem('selectedCities');
      localStorage.removeItem('state');
      localStorage.removeItem('city');
      localStorage.removeItem('lease_type');
      localStorage.removeItem('street_address_comps');
    };

   
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const [options, setOptions] = React.useState<any[]>([]);

 
  const storedPropertyName = localStorage.getItem('property_type');
  React.useEffect(() => {
    if (storedPropertyName) {
      
      const propertyArray = storedPropertyName.split(',');
      setStoredValues(propertyArray); 

      
      setSelectedOptions(propertyArray);
    } else {
      
      setStoredValues([]); 
      setSelectedOptions([]); 
    }
  }, [storedPropertyName]); 

  React.useEffect(() => {
    if (data?.data?.data) {
      const rawData = data?.data?.data;

      
      if (Array.isArray(rawData)) {
        const filteredData = rawData.find(
          (item: any) => item.type === 'property_types'
        );

        if (filteredData && filteredData.options) {
          
          const processedOptions = filteredData.options
            .filter((option: any) => option.code !== 'building_with_land') 
            .flatMap((option: any) => {
              const parentOption = {
                id: option.id,
                name: option.name,
                code: option.code, 
                disabled: false, 
              };

              
              const subOptions =
                option.sub_options
                  ?.filter((subOption: any) => subOption.code !== 'land') 
                  .map((subOption: any) => ({
                    id: subOption.id,
                    name: subOption.name, 
                    code: subOption.code, 
                    disabled: false, 
                  })) || [];

              
              return parentOption.code === 'land'
                ? [...subOptions]
                : [parentOption, ...subOptions];
            });

         
          const uniqueOptions = Array.from(
            new Map(
              processedOptions.map((item: any) => [item.id, item])
            ).values()
          );

          setOptions(uniqueOptions); 
        }
      } else {
        console.error('Expected an array but received:', rawData);
      }
    }
  }, [data]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    
    const updatedSelectedOptions = value as string[];
    setSelectedOptions(updatedSelectedOptions);

    
    const selectedObjects = options.filter((option) =>
      updatedSelectedOptions.includes(option.code)
    );

    
    const selectedCodes = selectedObjects.map((option) => option.code);
    
    setStoredValues(selectedCodes);

 
    if (onChange) {
      onChange(selectedCodes);
    }
  };

  return (
    <div>
      <FormControl sx={{ m: 1, width: '100%', marginTop: '0px' }}>
        <Select
          id="demo-multiple-checkbox"
          className="relative"
          multiple
          displayEmpty
          value={selectedOptions}
          onChange={handleChange}
          style={style}
          input={
            <OutlinedInput
              label={label}
              placeholder={`Select ${label}`}
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
          renderValue={(selected: string[]) => {
            
            const storedPropertyType = localStorage.getItem('property_type');
            if (
              !storedPropertyType ||
              storedPropertyType === 'null' ||
              selected.length === 0
            ) {
              return `Select ${label}`; 
            }
            return selected
              .map(
                (code) => options.find((option) => option.code === code)?.name
              ) 
              .join(', '); 
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.id} value={option.code}>
              <Checkbox checked={selectedOptions.includes(option.code)} />
              <ListItemText primary={option.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

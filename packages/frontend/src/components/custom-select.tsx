import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  label: string;
  onChange?: (event: SelectChangeEvent<string>) => void;
  options: Option[];
  disabled?: boolean;
  className?: string;
  name?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  label,
  onChange,
  options,
  disabled,
  name,
}) => {
  return (
    <FormControl sx={{ width: '100%' }} className="multiselectLabel">
      <InputLabel sx={{ color: '#B1BAC0', fontSize: '0.75rem' }}>
        {label}
      </InputLabel>
      <Select
        value={value}
        name={name}
        className="removeRadius"
        onChange={onChange}
        disabled={disabled}
        label={label}
        MenuProps={{ PaperProps: { sx: { maxHeight: 350 } } }}
        renderValue={(selected) => {
          // Ensure "Show All" is shown when the selected value is an empty string
          return selected === ''
            ? 'Show All'
            : options?.find((option) => option?.value === selected)?.label;
        }}
        sx={{
          boxShadow: 'none',
          ...(value === 'date_sold'
            ? {}
            : {
                '.MuiOutlinedInput-notchedOutline': {
                  borderTop: 0,
                  borderRight: 0,
                  borderLeft: 0,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: 'none',
                },
                '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':
                  {
                    borderTop: 0,
                    borderRight: 0,
                    borderLeft: 0,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: 'none',
                  },
                '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                  {
                    borderTop: 0,
                    borderRight: 0,
                    borderLeft: 0,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: 'none',
                  },
                '&.MuiOutlinedInput-input': { padding: '8px 32px 8px 8px' },
              }),
        }}
      >
        <MenuItem value="" className={label === 'State' ? 'select-state' : ''}>
          {label === 'Parking' || label === 'State' || label === 'Lease Type' ? (
            <em></em>
          ) : (
            <em>--Select--</em>
          )}
        </MenuItem>
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

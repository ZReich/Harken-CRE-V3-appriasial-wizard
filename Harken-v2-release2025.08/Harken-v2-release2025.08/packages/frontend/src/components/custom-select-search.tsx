import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { SelectChangeEvent } from '@mui/material/Select';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectSearchProps {
  value: string | any;
  label: string;
  onChange: (event: SelectChangeEvent) => void;
  options: Option[] | null;
  disabled?: boolean;
  storageKey?: string;
}

export const CustomSelectSearch = ({
  value,
  label,
  onChange,
  options,
  disabled,
  storageKey,
}: CustomSelectSearchProps) => {
  return (
    <FormControl>
      <Select
        value={
          storageKey
            ? localStorage.getItem(storageKey) || value || ''
            : value || ''
        }
        displayEmpty
        onChange={onChange}
        disabled={disabled}
        sx={{
          boxShadow: 'none',
          width: '199px',
          height: '34px',
          borderRadius: '6px',
          '.MuiOutlinedInput-notchedOutline': {
            border: '1px solid rgba(13, 161, 199, 1) !important',
          },
          '& .MuiSelect-select': {
            textAlign: 'left',
            color: '#0009',
            fontWeight: '700',
            fontSize: '11px',
          },
          // ...(label === "Sort by :" ? {
          //     ".css-1d3z3hw-MuiOutlinedInput-notchedOutline": { borderColor: 'rgba(13, 161, 199, 1)', borderRadius: "23px" },
          //
          // } : null)
        }}
        renderValue={(selected) => {
          if (!selected || selected === '') {
            return ` ${label}`;
          }
          const option = options?.find((opt) => opt.value === selected);
          return option ? option.label : selected;
        }}
      >
        <MenuItem value="">
          <em>None</em>
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

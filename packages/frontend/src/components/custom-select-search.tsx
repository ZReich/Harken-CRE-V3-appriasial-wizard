import InputLabel from '@mui/material/InputLabel';
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
    options: Option[] | null ;
    disabled?: boolean;
  }

export const CustomSelectSearch = ({ value, label, onChange, options, disabled }: CustomSelectSearchProps) => {
    return (
        <FormControl>
            <InputLabel
            sx={{
                textAlign: 'center',
                lineHeight:"10px",
                fontSize:"11px",
                fontWeight:"bold"
            }}
            >{label}</InputLabel>
            <Select
                value={value}
                label={label}
                onChange={onChange}
                disabled={disabled} 
                sx={{
                    
                    boxShadow: "none",
                    width: "199px",
                    height:'34px',
                    borderRadius:'6px',
                    ".MuiOutlinedInput-notchedOutline": {border:"1px solid rgba(13, 161, 199, 1) !important"}
                    // ...(label === "Sort by :" ? {
                    //     ".css-1d3z3hw-MuiOutlinedInput-notchedOutline": { borderColor: 'rgba(13, 161, 199, 1)', borderRadius: "23px" },
                    //     
                    // } : null)
                }}
            >
                {options?.map(option => (
                    <MenuItem 
                    key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
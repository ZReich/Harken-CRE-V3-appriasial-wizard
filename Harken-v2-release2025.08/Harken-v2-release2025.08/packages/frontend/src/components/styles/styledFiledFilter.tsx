import { TextField, TextFieldProps } from '@mui/material';
import { FC } from 'react';

interface StyledFieldFilterProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
    label:any;
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    
}

const StyledFieldFilter: FC<StyledFieldFilterProps> = ({ label, name, value, onChange, ...rest }) => (
    <TextField id="standard-basic" label={label} name={name} value={value} onChange={onChange} {...rest} variant="standard" className='[&_div]:pb-2 w-full'/>
);

export default StyledFieldFilter;

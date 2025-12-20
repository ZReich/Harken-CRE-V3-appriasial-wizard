import React from 'react';
import { Field, ErrorMessage} from 'formik';
import { TextField, InputAdornment } from '@mui/material';

interface StyledFieldProps {
  label: React.ReactNode;
  name: string;
  style?: any;
  onFocus?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: any;
  disabled?: boolean;
  maxLength?: any;
}

const StyledFieldFt = ({ label, name, disabled, maxLength, ...rest }: StyledFieldProps) => (
  <div>
    <label
      className="block text-left text-customGray text-xs font-normal"
      style={{ fontFamily: 'montserrat-normal' }}
      htmlFor={name}
    >
      {label}
    </label>
    <Field name={name}>
    {({ field }: any) => (
        <TextField
          {...field}
          style={{ borderBottomWidth: '1px', fontFamily: 'montserrat-normal' }}
          className="relative focus:border-blue-500 focus:outline-none w-full border-t-0 border-r-0 !px-0"
          id={name}
          disabled={disabled}
          inputProps={{ maxLength }}
          InputProps={{
            endAdornment: <InputAdornment position="end">ft</InputAdornment>,
          }}
          {...rest}
        />
      )}
    </Field>
    <ErrorMessage name={name} component="div" className="absolute text-red-500 pt-1  text-[11px] font-sans" />
  </div>
);

export default StyledFieldFt;

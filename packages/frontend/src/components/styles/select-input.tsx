import { useState } from 'react';
import { TextField, MenuItem, FormHelperText } from '@mui/material';
import { ChangeEvent } from 'react';

interface SelectTextFieldProps {
  label?: React.ReactNode;
  value?: string | number | undefined | any;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  options?: ({ value: any; label: any } | '')[] | null | undefined;
  defaultValue?: string | undefined;
  style?: React.CSSProperties;
  error?: string;
  name?: string;
  disabled?: any;
  className?: any;
}

const SelectTextField: React.FC<SelectTextFieldProps> = ({
  label,
  value,
  onChange,
  options,
  defaultValue,
  disabled,
  // style,
  error,
  name,
}) => {
  const [, setIsSelectOpen] = useState(false);

  const handleSelectOpen = () => setIsSelectOpen(true);
  const handleSelectClose = () => setIsSelectOpen(false);

  return (
    <div className='multiSelect'>
      <TextField
      style={{width:'100%'}}
        select
        label={label}
        value={value}
        onChange={onChange}
        onFocus={handleSelectOpen}
        onClick={handleSelectClose}
        fullWidth
        variant="standard"
        defaultValue={defaultValue}
        disabled={disabled}
        SelectProps={{
          onClose: handleSelectClose,
          onOpen: handleSelectOpen,
          displayEmpty: true,
          // renderValue: v => !v && <>Select a value</>
        }}
        InputLabelProps={{
          shrink: true,
        }}
        error={!!error}
        name={name}
      >
        {options?.map((option: any) => (
          <MenuItem
            key={option.value}
            value={option.value}
            style={{ width: '100%' }}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </div>
  );
};

export default SelectTextField;

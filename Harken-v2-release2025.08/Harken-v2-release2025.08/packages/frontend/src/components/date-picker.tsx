import React, { useState } from 'react';
import moment from 'moment';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface DatePickerProps {
  label: any;
  onChange: (date: Date | null) => void;
  name: string;
  value?: moment.Moment | Date | null | string;
  style?: React.CSSProperties;
}

export default function DatePickerComp({
  label,
  onChange,
  name,
  value,
}: DatePickerProps) {
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleInputChange = () => {
    setOpenDatePicker(true);
  };

  const handleClose = () => {
    setOpenDatePicker(false);
  };

  const currentDate :any = moment();

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        label={label}
        onChange={onChange}
        name={name}
        value={value ? moment(value) : currentDate}
        open={openDatePicker}
        onOpen={handleInputChange}
        onClose={handleClose}
        maxDate={label === 'Date of Inspection' ? currentDate : undefined}
        slotProps={{
          textField: {
            onClick: handleInputChange,
            className: 'your-custom-class',
            size: 'small',
            variant: 'outlined',
          },
        }}
        className={ 
          label &&
          label.props &&
          (label.props.children === 'Sale Date Start' ||
            label.props.children === 'Sale Date End')
            ? 'datePickerFieldFilter'
            : 'datePickerField'
        }
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            fontSize: '14px',
          },
          '& .MuiFormLabel-root': {
            fontSize: '14px',
          },
        }}
      />
    </LocalizationProvider>
  );
}

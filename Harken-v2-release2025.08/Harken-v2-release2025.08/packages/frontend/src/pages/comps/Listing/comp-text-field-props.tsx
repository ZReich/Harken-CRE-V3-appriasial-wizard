import React, { useState, useEffect, useCallback } from 'react';
import { TextField } from '@mui/material';

interface CompTextFieldProps {
  index: number;
  col: string;
  row: any;
  formik: any;
  handleFieldChange: (index: number, col: string, value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const CompTextField: React.FC<CompTextFieldProps> = ({
  index,
  col,
  row,
  formik,
  handleFieldChange,
  onBlur,
}) => {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState('');

  // No need for automatic setting - formik initialization handles defaults properly

  // Initialize local value only once and don't sync with row data for custom fields
  useEffect(() => {
    // For custom fields, only initialize once and don't sync with row changes
    if (
      col === 'condition_custom' ||
      col === 'building_sub_type_custom' ||
      col === 'land_type_custom'
    ) {
      if (localValue === '') {
        setLocalValue(getFieldValue());
      }
      return;
    }

    const getFormattedValue = () => {
      if (
        [
          'cap_rate',
          'weight_sf',
          'site_coverage_percent',
          'escalators',
          'term',
          'free_rent',
        ].includes(col) &&
        (row[col] === null || row[col] === undefined || row[col] === '')
      ) {
        return '';
      }

      if (
        [
          'cap_rate',
          'site_coverage_percent',
          'escalators',
          'weight_sf',
        ].includes(col)
      ) {
        return `${row[col]}%`;
      }

      if (
        [
          'sale_price',
          'list_price',
          'operating_income',
          'net_operating_income',
          'total_operating_income',
          'total_concessions',
          'land_value',
          'business_resideual_value',
          'lease_rate',
          'cam',
          'TI_allowance',
          'asking_rent',
          'escalator',
          'price_square_foot',
          'total_operating_expense',
          'operating_expense_psf',
          'est_land_value',
          'est_building_value',
        ].includes(col)
      ) {
        return formatCurrency(row[col]);
      }

      if (
        [
          'sq_fr',
          'gross_Area',
          'net_area',
          'zipcode',
          'land_size_space',
          'space',
        ].includes(col)
      ) {
        return sanitizeNumeric(row[col] || '');
      }

      return row[col] || '';
    };

    const formattedValue = String(getFormattedValue());
    // Only update local value if it's different to prevent unnecessary re-renders
    if (localValue !== formattedValue) {
      setLocalValue(formattedValue);
    }
  }, [
    col === 'condition_custom' ||
    col === 'building_sub_type_custom' ||
    col === 'land_type_custom'
      ? null
      : row[col],
  ]);

  // Debounced update to parent with shorter delay for custom fields
  const debouncedHandleFieldChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: any) => {
        clearTimeout(timeoutId);
        const delay =
          col === 'condition_custom' ||
          col === 'building_sub_type_custom' ||
          col === 'land_type_custom'
            ? 50
            : 10;
        timeoutId = setTimeout(() => {
          handleFieldChange(index, col, value);
        }, delay);
      };
    })(),
    [handleFieldChange, index, col]
  );

  const formatCurrency = (value: any) =>
    value
      ? `$${parseFloat(value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '$0.00';

  const sanitizeNumeric = (value: any) =>
    String(value || '').replace(/\D/g, '');

  // Handle building_sub_type_custom and condition_custom default values
  const getFieldValue = () => {
    // For custom fields, always return the actual row value (formik initialization ensures "Unknown" default)
    return row[col] || '';
  };

  // Add debug log for building_sub_type_custom
  if (col === 'building_sub_type_custom') {
  }

  return (
    <TextField
      className="comptable-input-field"
      fullWidth
      variant="outlined"
      size="small"
      name={`comps[${index}].${col}`}
      value={localValue}
      sx={{
        '& .MuiOutlinedInput-root': {
          fontSize: '14px',
        },
      }}
      onChange={(e) => {
        const newValue = e.target.value;
        if (col === 'land_size') {
          const landDimension = row['land_dimension'] || '';
          if (landDimension === 'SF') {
            // Only allow integers, format as US number
            const digitsOnly = newValue.replace(/\D/g, '');
            const formatted = digitsOnly
              ? new Intl.NumberFormat('en-US').format(parseInt(digitsOnly, 10))
              : '';
            setLocalValue(formatted);
            debouncedHandleFieldChange(formatted);
            return;
          } else if (landDimension === 'ACRE' || landDimension === 'AC') {
            // Always treat as 3 decimal currency-like input
            let digitsOnly = newValue.replace(/\D/g, '');
            // Pad with leading zeros if less than 4 digits
            while (digitsOnly.length < 4) digitsOnly = '0' + digitsOnly;
            // Split into integer and decimal
            const intPart = digitsOnly.slice(0, -3);
            const decPart = digitsOnly.slice(-3);
            let formatted = '';
            if (intPart) {
              formatted = new Intl.NumberFormat('en-US').format(
                Number(intPart)
              );
            }
            formatted = (formatted || '0') + '.' + decPart;
            setLocalValue(formatted === '0.000' ? '' : formatted);
            debouncedHandleFieldChange(formatted === '0.000' ? '' : formatted);
            return;
          }
        }
        // Escalators: allow only numbers with up to two decimals, always show % at end
        if (
          col === 'escalators' ||
          col === 'cap_rate' ||
          col === 'site_coverage_percent'
        ) {
          let sanitized = newValue.replace(/[^\d.]/g, '');
          sanitized = sanitized.replace(/(\..*)\./g, '$1');
          if (/^\d*(\.\d{0,2})?$/.test(sanitized)) {
            setLocalValue(sanitized ? sanitized + '%' : '');
            debouncedHandleFieldChange(sanitized);
          }
          return;
        }
        // For zipcode, allow only up to 5 digits and only integers
        if (col === 'zipcode') {
          // Only allow digits, max 5
          const digitsOnly = newValue.replace(/\D/g, '').slice(0, 5);
          setLocalValue(digitsOnly);
          debouncedHandleFieldChange(digitsOnly);
          return;
        } else if (
          col === 'gross_living_sq_ft' ||
          col === 'building_size' ||
          col === 'beds' ||
          col === 'baths' ||
          col === 'unit_count'
        ) {
          // Format as US number
          const digitsOnly = newValue.replace(/\D/g, '');
          const formattedValue = digitsOnly
            ? new Intl.NumberFormat('en-US').format(
                parseInt(digitsOnly || '0', 10)
              )
            : '';
          setLocalValue(formattedValue);
          debouncedHandleFieldChange(formattedValue);
          return;
        } else if (
          col === 'sale_price' ||
          col === 'list_price' ||
          col === 'total_concessions' ||
          col === 'price_square_foot' ||
          col === 'net_operating_income' ||
          col === 'lease_rate' ||
          col === 'cam' ||
          col === 'TI_allowance' ||
          col === 'asking_rent' ||
          col === 'total_operating_expense' ||
          col === 'operating_expense_psf' ||
          col === 'est_land_value' ||
          col === 'est_building_value'
        ) {
          // Format as currency while typing
          const digitsOnly = newValue.replace(/\D/g, '');
          const numericValue = digitsOnly ? parseFloat(digitsOnly) / 100 : 0;
          const formattedCurrency = numericValue
            ? `$${numericValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '';
          setLocalValue(formattedCurrency);
          // Pass the numeric value (not formatted) to the handler
          debouncedHandleFieldChange(
            numericValue ? numericValue.toFixed(2) : ''
          );
          return;
        } else if (col === 'free_rent' || col === 'term') {
          // Allow only numbers with up to two decimal places
          let sanitized = newValue.replace(/[^\d.]/g, '');
          // Only allow one decimal point
          sanitized = sanitized.replace(/(\..*)\./g, '$1');
          // Restrict to two decimal places
          if (/^\d*(\.\d{0,2})?$/.test(sanitized)) {
            setLocalValue(sanitized);
            debouncedHandleFieldChange(sanitized);
          }
          return;
        }

        // Update local state immediately for responsive UI
        setLocalValue(newValue);

        const rawValue = newValue.replace(/[^\d]/g, '');

        if (
          [
            'operating_income',
            'net_operating_income',
            'total_operating_income',
            'land_value',
            'business_resideual_value',
            'lease_rate',
            'cam',
            'TI_allowance',
            'asking_rent',
            'escalator',
            'price_square_foot',
            'total_operating_expense',
            'operating_expense_psf',
            'est_land_value',
            'est_building_value',
          ].includes(col)
        ) {
          if (!rawValue) {
            debouncedHandleFieldChange('');
            return;
          }
          const numericValue = parseFloat(rawValue) / 100;
          debouncedHandleFieldChange(numericValue.toFixed(2));
        } else if (
          [
            'cap_rate',
            'site_coverage_percent',
            'escalators',
            'term',
            'weight_sf',
          ].includes(col)
        ) {
          const sanitizedInput = newValue.replace(/[%|,]/g, '');
          if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
            debouncedHandleFieldChange(sanitizedInput);
          }
        } else if (
          ['sq_fr', 'gross_Area', 'net_area', 'land_size_space'].includes(col)
        ) {
          debouncedHandleFieldChange(sanitizeNumeric(newValue));
        } else {
          // For custom fields, allow clearing even if it was "Unknown"
          debouncedHandleFieldChange(newValue);
        }
      }}
      onKeyDown={(e) => {
        if (
          [
            'cap_rate',
            'site_coverage_percent',
            'escalators',
            'term',
            'free_rent',
            'weight_sf',
          ].includes(col) &&
          e.code === 'Backspace'
        ) {
          const event = e as React.KeyboardEvent<HTMLInputElement>;
          const { selectionStart, selectionEnd } = e.target as any;
          const inputValue = row[col]?.toString() || '';
          if (selectionStart === 0 && selectionEnd === inputValue.length) {
            handleFieldChange(index, col, '');
            event.preventDefault();
          } else {
            handleFieldChange(index, col, inputValue.slice(0, -1));
            event.preventDefault();
          }
        }
      }}
      onBlur={(e) => {
        formik.handleBlur(e);
        if (onBlur) {
          console.log(`🔥 CompTextField onBlur called for ${col}`);
          onBlur();
        }
      }}
      error={false}
      helperText={null}
    />
  );
};

export default CompTextField;

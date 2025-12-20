import React from 'react';
import { TextField } from '@mui/material';

interface CompTextFieldProps {
  index: number;
  col: string;
  row: any;
  formik: any;
  handleFieldChange: (index: number, col: string, value: any) => void;
}
let changeSubPropertyFlag = true;
let changeConditionFlag = true;

const CompTextField: React.FC<CompTextFieldProps> = ({
  index,
  col,
  row,
  formik,
  handleFieldChange,
}) => {
  const formatCurrency = (value: any) =>
    value
      ? `$${parseFloat(value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '$0.00';

  const sanitizeNumeric = (value: any) =>
    String(value || '').replace(/\D/g, '');

  const error =
    formik.touched.comps?.[index]?.[col] &&
    Boolean(
      (formik.errors.comps as Record<number, Record<string, string>>)?.[
        index
      ]?.[col]
    );

  // Add debug log for building_sub_type_custom
  if (col === 'building_sub_type_custom') {
    console.log('CompTextField - building_sub_type_custom:', {
      index,
      col,
      rowValue: row[col],
      buildingSubType: row.building_sub_type,
      displayValue: row[col] || '',
    });
  }

  // Handle building_sub_type_custom and condition_custom default values
  const getFieldValue = () => {
    if (
      col === 'building_sub_type_custom' &&
      row.building_sub_type === 'Type My Own' &&
      (row[col] === null || row[col] === undefined || row[col] === '') &&
      changeSubPropertyFlag
    ) {
      changeSubPropertyFlag = false;
      return 'Unknown';
    }
    if (
      col === 'condition_custom' &&
      row.condition === 'Type My Own' &&
      (row[col] === null || row[col] === undefined || row[col] === '') &&
      changeConditionFlag
    ) {
      changeConditionFlag = false;
      return 'Unknown';
    }
    return row[col] || '';
  };

  return (
    <TextField
      className="comptable-input-field"
      fullWidth
      variant="outlined"
      name={`comps[${index}].${col}`}
      value={
        col === 'condition_custom' || col === 'building_sub_type_custom'
          ? getFieldValue()
          : [
                'cap_rate',
                'weight_sf',
                'site_coverage_percent',
                'escalators',
                'term',
                'free_rent',
              ].includes(col) &&
              (row[col] === null || row[col] === undefined || row[col] === '')
            ? ''
            : [
                  'cap_rate',
                  'site_coverage_percent',
                  'escalators',
                  'weight_sf',
                ].includes(col)
              ? `${row[col]}%`
              : [
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
                ? formatCurrency(row[col])
                : [
                      'sq_fr',
                      'gross_Area',
                      'net_area',
                      'zipcode',
                      'land_size_space',
                      'space',
                    ].includes(col)
                  ? sanitizeNumeric(row[col] || '')
                  : row[col] || ''
      }
      onChange={(e) => {
        const rawValue = e.target.value.replace(/[^\d]/g, '');

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
          if (!rawValue) {
            handleFieldChange(index, col, '');
            return;
          }
          const numericValue = parseFloat(rawValue) / 100;
          handleFieldChange(index, col, numericValue.toFixed(2));
        } else if (
          [
            'cap_rate',
            'site_coverage_percent',
            'escalators',
            'term',
            'free_rent',
            'weight_sf',
          ].includes(col)
        ) {
          const sanitizedInput = e.target.value.replace(/[%|,]/g, '');
          if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
            handleFieldChange(index, col, sanitizedInput);
          }
        } else if (
          ['sq_fr', 'gross_Area', 'net_area', 'land_size_space'].includes(col)
        ) {
          handleFieldChange(index, col, sanitizeNumeric(e.target.value));
        } else if (col === 'zipcode') {
          if (/^\d{0,5}$/.test(rawValue)) {
            handleFieldChange(index, col, rawValue);
          }
        } else {
          handleFieldChange(index, col, e.target.value);
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
      onBlur={formik.handleBlur}
      error={error}
      helperText={
        error ? (
          <span className="text-red-500 text-[11px] absolute block left-0 -bottom-[12px]">
            {
              (formik.errors.comps as Record<number, Record<string, string>>)?.[
                index
              ]?.[col]
            }
          </span>
        ) : null
      }
    />
  );
};

export default CompTextField;

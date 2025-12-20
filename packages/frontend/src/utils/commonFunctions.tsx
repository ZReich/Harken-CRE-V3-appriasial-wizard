import { NavigateFunction } from 'react-router-dom';

export const globalRouter = { navigate: null } as {
  navigate: null | NavigateFunction;
};

export const formatToPercentage = (value: string) => {
  if (!value) return '';

  // Allow only numbers and one decimal point, and remove existing commas
  const numericValue = value.replace(/,/g, '').replace(/[^\d.]/g, '');
  const isDecimalValue = numericValue.includes('.');

  // Split the number into integer and decimal parts, limiting decimalPart to 2 digits
  const [integerPart, decimalPart] = numericValue.split('.') ?? [];

  // Format the integer part with commas
  const formattedInteger = Number(integerPart).toLocaleString();

  // Combine integer and decimal parts back together, limit decimal part to 2 digits
  const formattedValue = isDecimalValue
    ? `${formattedInteger}.${(decimalPart ?? '').slice(0, 2)}`
    : formattedInteger;

  // Append the percentage sign
  return formattedValue + '%';
};

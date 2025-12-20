import { KeyboardEvent } from 'react';
import { handleInputChange } from '@/utils/sanitize';

export const handleCommonKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    fieldName: string,
    handleChange: any,
    values: { [x: string]: { toString: () => any; }; }
) => {
    const isBack = e.code === 'Backspace';
    const event = e as React.KeyboardEvent<HTMLInputElement>;

    if (isBack) {
        const inputElement = event.currentTarget;
        const { selectionStart, selectionEnd } = inputElement;

        // Handle backspace when all text is selected
        if (selectionStart === 0 && selectionEnd === inputElement.value.length) {
            handleInputChange(handleChange, fieldName, '');
            event.preventDefault();
        } else {
            const input = values[fieldName].toString();
            const inpArr = Array.from(input);
            inpArr.pop(); // Remove the last character on backspace
            handleInputChange(handleChange, fieldName, inpArr.join(''));
        }
    }
};

export const handleCommonChange = (
  e: { target: { value: string } },
  fieldName: string,
  handleChange: any,
  passOperInc: number,
  setIndicatedRate: (value: number) => void
) => {
  const input = e.target.value;

  // Remove everything except digits and dot
  let sanitizedInput = input.replace(/[^0-9.]/g, '');

  const parts = sanitizedInput.split('.');

  // If more than one decimal point, invalid
  if (parts.length > 2) {
    return;
  }

  // Preserve the trailing dot during typing like "5."
  const endsWithDot = sanitizedInput.endsWith('.');

  // Allow only up to two decimal places
  if (parts[1] && parts[1].length > 2) {
    return;
  }

  // Avoid leading zeros unless it's "0." or "0.XX"
  if (
    sanitizedInput.length > 1 &&
    sanitizedInput.startsWith('0') &&
    !sanitizedInput.startsWith('0.')
  ) {
    sanitizedInput = sanitizedInput.replace(/^0+/, '');
  }

  // Parse only if it doesn't end with dot (because "5." is incomplete for parsing)
  const parseableValue = endsWithDot ? `${sanitizedInput}0` : sanitizedInput;
  const parsedInput = parseFloat(parseableValue);

  if (!isNaN(parsedInput) && sanitizedInput !== '') {
    const indicatedMarket = passOperInc / parsedInput;
    setIndicatedRate(100 * indicatedMarket);
    handleInputChange(handleChange, fieldName, sanitizedInput);
  } else {
    handleChange(e); // fallback for completely invalid input
  }
};


  


export const sanitizeInput = (input: string): string => {
    const sanitizedInput = input.replace(/\D/g, '');
    if (sanitizedInput === '') {
        return "";
    }
    const number = parseInt(sanitizedInput) / 100;
    return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const sanitizeInputRent = (input: string): string => {
    const sanitizedInput = input.replace(/[^\d]/g, '');

    if (sanitizedInput === '') {
        return '';
    }

    const number = parseInt(sanitizedInput) / 100;
    return number.toFixed(2);
};



export const sanitizeInputExpense = (input: string): string => {
    const sanitizedInput = input.toString().replace(/\D/g, '');
    if (sanitizedInput === '') {
        return "";
    }
    const number = parseInt(sanitizedInput) / 100;
    return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


export const sanitizeSf = (input: string): string => {
    const sanitizedInput = input.replace(/\D/g, '');
    if (sanitizedInput === '') {
        return "";
    }

    const number = parseInt(sanitizedInput, 10);
    return number.toLocaleString('en-US');
};


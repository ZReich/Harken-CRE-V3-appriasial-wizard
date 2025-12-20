import { topographyOptions } from '@/pages/comps/create-comp/SelectOption';

export const sanitizeInput = (input: string): string => {
  const number = parseInt(input.replace(/\D/g, ''));
  if (isNaN(number)) {
    return '';
  }
  return number.toLocaleString();
};
export const sanitizeInpuAppraisalFile = (input: string): string => {
  // Keep only alphanumeric characters and limit to 30 characters
  const alphanumeric = input.replace(/[^a-zA-Z0-9]/g, '');
  return alphanumeric;
};

export const sanitizeInputZoningType = (input: string): string => {
  const truncatedInput = input.slice(0, 30);
  return truncatedInput;
};

export const sanitizeTwentyFiveChar = (input: string): string => {
  const truncatedInput = input.slice(0, 25);
  return truncatedInput;
};
export const sanitizeFourtyFiveChar = (input: string): string => {
  const truncatedInput = input.slice(0, 45);
  return truncatedInput;
};
export const sanitizeTwoHundredChar = (input: string): string => {
  const truncatedInput = input.slice(0, 200);
  return truncatedInput;
};

export const sanitizeHundredChar = (input: string): string => {
  const truncatedInput = input.slice(0, 100);
  return truncatedInput;
};

export const sanitizeFiveHundredChar = (input: string): string => {
  const truncatedInput = input.slice(0, 500);
  return truncatedInput;
};

export const sanitizePropertyLegal = (input: string): string => {
  const truncatedInput = input.slice(0, 50);
  return truncatedInput;
};

export const sanitizeInputTerm = (input: string): string => {
  const number = parseInt(input.replace(/\D/g, ''));
  if (isNaN(number)) {
    return '';
  }
  return number.toString();
};
export const sanitizeInputTerm1 = (input: string): string => {
  if (typeof input !== 'string') {
    input = String(input); // Convert to string if not already
  }

  const sanitizedInput = input.replace(/[^0-9.]/g, '');
  let [integerPart, decimalPart] = sanitizedInput.split('.');

  if (integerPart && integerPart.length > 11) {
    integerPart = integerPart.slice(0, 11);
  }
  if (decimalPart && decimalPart.length > 2) {
    decimalPart = decimalPart.slice(0, 2);
  }

  return decimalPart !== undefined
    ? `${integerPart}.${decimalPart}`
    : integerPart;
};

export const sanitizeSpecialChar = (input: string): string => {
  const sanitizedInput = input.replace(/[^a-zA-Z0-9]/g, '');

  const truncatedInput = sanitizedInput;

  return truncatedInput;
};

export const sanitizeInputTermFreeRent = (input: string): string => {
  let sanitizedInput = input.replace(/[^0-9.]/g, '');

  const parts = sanitizedInput.split('.');
  if (parts.length > 2) {
    sanitizedInput = `${parts.shift()}.${parts.join('')}`;
  }

  const [integerPart, decimalPart] = sanitizedInput.split('.');
  const sanitizedDecimalPart = decimalPart ? decimalPart.slice(0, 2) : '';

  const finalInput =
    decimalPart !== undefined
      ? `${integerPart}.${sanitizedDecimalPart}`
      : integerPart;

  const number = parseFloat(finalInput);
  if (isNaN(number)) {
    return '';
  }
  return finalInput;
};

export const sanitizeInputLandSize = (input: string): string => {
  const number = parseInt(input.replace(/\D/g, ''));
  if (isNaN(number)) {
    return '';
  }
  return number.toLocaleString();
};
export const sanitizeInputLandSize2 = (input: string): string => {
  // Remove all non-numeric characters except commas
  const number = input.replace(/,/g, '').replace(/\D/g, '');

  if (!number) {
    return ''; // Return empty string if the input is not a valid number
  }

  // Format the number with commas
  return parseInt(number, 10).toLocaleString();
};

export const sanitizeInputLandSize1 = (input: string): string => {
  const number = parseFloat(input.replace(/[^\d.]/g, ''));
  if (isNaN(number)) {
    return '';
  }
  return number.toLocaleString(undefined, { minimumFractionDigits: 3 });
};

// export const sanitizeInputLandSizeAc = (input: string): string => {
//   const number = parseInt(input.replace(/\D/g, '')) / 1000;
//   if (isNaN(number)) {
//     return "";
//   }
//   return number.toFixed(3).toLocaleString();
// };
export const sanitizeInputLandSizeAc = (input: string): string => {
  const number = parseInt(input.toString().replace(/\D/g, '')) / 1000;
  if (isNaN(number)) {
    return '';
  }
  // Format the number to 3 decimal places and then convert to locale string
  return number.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const sanitizeInputLandSizeAcToSF = (input: string): string => {
  const number = parseInt(input.replace(/[,.]/g, ''), 10);

  if (isNaN(number)) {
    return '';
  }

  const formattedNumber = number.toLocaleString();
  return formattedNumber;
};

export const sanitizeInputLandSizeAcAfterSf = (input: string): string => {
  // Remove all non-numeric characters except for the decimal point
  const number = parseFloat(input.replace(/[^\d.]/g, ''));

  // Check if the parsed number is valid
  if (isNaN(number)) {
    return '';
  }

  // Format the number with commas for thousands and 3 decimal places
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

export const sanitizeInputLandSizeAppraisal = (input: string): string => {
  const number = parseFloat(input.replace(/[^\d.]/g, ''));
  if (isNaN(number)) {
    return '';
  }
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

export const sanitizeInputLandSizeAcAfterSF = (input: string): string => {
  const sanitizedInput = input.replace(/(\.\d+)?,/g, '');

  const number = parseInt(sanitizedInput, 10);

  if (isNaN(number)) {
    return '';
  }

  const formattedNumber = number.toLocaleString();
  return formattedNumber;
};

export const sanitizeInputDollarSign = (input: string): string => {
  const sanitizedInput = input.replace(/\D/g, '');
  if (sanitizedInput === '') {
    return '';
  }
  const number = parseInt(sanitizedInput) / 100;
  return '$' + number.toFixed(2).toLocaleString();
};

export const capitalizeWords = (str: any) => {
  if (typeof str !== 'string') {
    return '';
  }

  return str
    .split(/[_\s]+/)
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
};

export const sanitizeInputDollarSignComps = (input: any): string => {
  const strInput = Object.is(input, -0) ? '-0' : String(input ?? '');
  // const isNegative = strInput.startsWith('-') || strInput.startsWith('$-');
  const isNegative = strInput.includes('-');
  const sanitized = strInput.replace(/\D/g, '');
  const sanitizedInput = (sanitized || 0).toString();

  if (sanitizedInput === '') {
    return '';
  }

  const number = parseInt(sanitizedInput, 10) / 100;

  // const prefix = number < 0 || sanitizedInput === '-0' ? '-' : '';
  const prefix = isNegative ? '-$' : '$';
  return (
    prefix +
    Math.abs(number).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};
export const sanitizeInputDollarSignCompsnewdata = (input: any): string => {
  // Special case for direct zero input
  if (input === 0 || input === '0' || input === '$0') {
    return '$0.00';
  }

  const strInput = String(input || ''); // Ensure input is a string

  // Handle special cases
  if (strInput === '' || strInput === '$') {
    return '$0.00';
  }

  // Check if input is just zeros (like "00" or "$00")
  if (/^[$0]+$/.test(strInput)) {
    return '$0.00';
  }

  // Remove non-numeric characters
  const sanitizedInput = strInput.replace(/\D/g, '');

  if (sanitizedInput === '') {
    return '$0.00';
  }

  const number = parseInt(sanitizedInput, 10) / 100;

  return (
    '$' +
    number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

export const sanitizeInputDollarSignCompsnew = (input: any): string => {
  // If input is empty, return $0.00
  if (!input || input === '') {
    return '$0.00';
  }

  // If input is just a dollar sign, return $0.00
  if (input === '$') {
    return '$0.00';
  }

  // Remove the dollar sign if present, but remember it was there
  // const hasDollarSign = input.toString().includes('$');

  // Remove all non-numeric characters except decimal point
  let sanitizedInput = input.toString().replace(/[^0-9.]/g, '');

  // If sanitized input is empty after removing non-numeric chars, return $0.00
  if (sanitizedInput === '' || sanitizedInput === '.') {
    return '$0.00';
  }

  // Handle decimal places
  const parts = sanitizedInput.split('.');
  if (parts.length > 1) {
    // Limit to 2 decimal places
    sanitizedInput = parts[0] + '.' + parts[1].substring(0, 2);
  }

  // Convert to number for formatting
  const number = parseFloat(sanitizedInput);

  // Format with dollar sign and 2 decimal places
  return (
    '$' +
    number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

export const sanitizeInputDollarSignComps1 = (input: string): string => {
  const sanitizedInput = input.replace(/\D/g, ''); // Remove non-digit characters
  if (sanitizedInput === '') {
    return '';
  }
  const number = parseInt(sanitizedInput, 10) / 100;
  return (
    '$' +
    number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};
export const sanitizeInputDollarSignComps2 = (input: string): string => {
  const sanitizedInput = input.replace(/\D/g, ''); // Remove non-digit characters
  if (sanitizedInput === '') {
    return '';
  }
  const number = parseInt(sanitizedInput, 10) / 100;
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const sanitizeInputPercentage = (input: any): string => {
  const sanitizedInput = String(input);

  if (sanitizedInput === '') {
    return sanitizedInput;
  }

  if (/^\d+(\.\d{0,2})?$/.test(sanitizedInput)) {
    return sanitizedInput + '%';
  }

  if (sanitizedInput === 'null') {
    return '';
  }

  const [wholePart, decimalPart] = sanitizedInput.split('.');
  const limitedDecimalPart = decimalPart ? decimalPart.slice(0, 2) : '';
  const result = `${wholePart || '0'}${limitedDecimalPart ? '.' + limitedDecimalPart : ''}`;

  return result + '%';
};

export const numberWithCommas = (value: string): string => {
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export const formatPercentageInput = (input: any): string => {
  let sanitizedInput = String(input);
  if (sanitizedInput === '' || sanitizedInput === 'null') {
    return '';
  }
  sanitizedInput = sanitizedInput.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except '.'
  if (sanitizedInput === '') {
    return sanitizedInput;
  }
  if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
    return numberWithCommas(sanitizedInput) + '%';
  }
  const [wholePart, decimalPart] = sanitizedInput.split('.');
  const limitedDecimalPart = decimalPart ? decimalPart.slice(0, 2) : '';
  const result = `${wholePart || '0'}${limitedDecimalPart ? '.' + limitedDecimalPart : ''}`;
  return numberWithCommas(result) + '%';
};

export const sanitizeExpensePercentage = (input: any): any => {
  const sanitizedInput = String(input).replace('%', '');

  if (sanitizedInput === '') {
    return sanitizedInput;
  }

  if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
    return sanitizedInput + '%';
  }

  const [wholePart, decimalPart] = sanitizedInput.split('.');
  const limitedDecimalPart = decimalPart ? decimalPart.slice(0, 2) : '';
  const result = `${wholePart || '0'}${limitedDecimalPart ? '.' + limitedDecimalPart : ''}`;

  return result + '%';
};

export const sanitizeSfWeightingInputPercentage = (input: any): any => {
  const sanitizedInput = String(input);

  if (sanitizedInput === '') {
    return sanitizedInput;
  }

  if (/^\d+(\.\d{0,2})?$/.test(sanitizedInput)) {
    return sanitizedInput + '%';
  }

  if (sanitizedInput === 'null') {
    return '';
  }

  const [wholePart, decimalPart] = sanitizedInput.split('.');
  const limitedDecimalPart = decimalPart ? decimalPart.slice(0, 2) : '';
  const result = `${wholePart || '0'}${limitedDecimalPart ? '.' + limitedDecimalPart : ''}`;

  return result + '%';
};

export const sanitizeInputPercentageLease = (
  input: string | number | null | undefined
): string => {
  if (input == undefined || input === null) {
    return '';
  }

  const sanitizedInput = String(input);

  if (sanitizedInput === '') {
    return sanitizedInput;
  }

  if (/^\d+$/.test(sanitizedInput)) {
    return sanitizedInput + '%';
  }

  const [wholePart, decimalPart] = sanitizedInput.split('.');
  const limitedDecimalPart = decimalPart ? decimalPart.slice(0, 3) : '';
  const result = `${wholePart}.${limitedDecimalPart}`;

  if (/^\d+(\.\d{0,2})?$/.test(result)) {
    return result + '%';
  } else {
    return '';
  }
};

export const handleInputChange = (
  handleChange: (event: { target: { name: string; value: string } }) => void,
  fieldName: string,
  sanitizedValue: string
) => {
  handleChange({ target: { name: fieldName, value: sanitizedValue } });
};

export const formatNumberAcre = (value: number | string): string => {
  if (!value || isNaN(Number(value))) {
    return 'N/A'; // Return 'N/A' if the value is not a valid number
  }
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

// Utility function to format numbers
export const formatNumber = (value: number | string): string => {
  if (!value || isNaN(Number(value))) {
    return 'N/A'; // Return 'N/A' if the value is not a valid number
  }
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatValue = (value: number | string): string => {
  if (!value || isNaN(Number(value))) {
    return 'N/A'; // Return 'N/A' if the value is not a valid number
  }
  return Number(value).toLocaleString('en-US'); // Format with commas only
};

export const getLabelTopographyValue = (value: any) => {
  // If the value is empty or '--Select a Subtype--', return an empty string
  if (!value || value === '--Select a Subtype--') {
    return '';
  }

  const allOptions = [...topographyOptions];

  // Check if the value matches any of the options
  const option = allOptions.find((option) => option.value === value);
  if (option) {
    return option.label; // Return the matched label
  }

  // If no match, return the original value without any modification
  return value;
};

export const formatPrice = (value: any) => {
  if (value == null) {
    return '$0.00'; // Show $0.00 for null, undefined, or 0
  }
  const strInput = Object.is(value, -0) ? '-0' : String(value ?? '');
  const isNegative = strInput.startsWith('-') || strInput.startsWith('$-');
  const sanitized = strInput.replace(/-\D/g, '').replace('$', '');
  const sanitizedInput = Math.abs(Number(sanitized));

  const prefix = isNegative ? '-$' : '$';
  return `${prefix}${(isNegative
    ? Math.abs(Number(sanitized))
    : sanitizedInput
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`; // Format value with 2 decimals and commas
};

export const formatPriceForLease = (value: any) => {
  if (value == null || value === 0) {
    return ''; // Show $0.00 for null, undefined, or 0
  }
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`; // Format value with 2 decimals and commas
};

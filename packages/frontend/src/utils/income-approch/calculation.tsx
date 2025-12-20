export const sanitizeAndLimitInput = (input: string, maxDigitsBeforeDecimal: number = 12, maxDigitsAfterDecimal: number = 2): string => {
    // Remove commas and non-numeric characters except for the decimal point
    const sanitizedInput = input.replace(/,/g, '').replace(/[^0-9.]/g, '');
  
    // Split input into whole and decimal parts
    const [wholePart, decimalPart] = sanitizedInput.split('.');
  
    // Limit to specified digits before the decimal point
    let result = wholePart.slice(0, maxDigitsBeforeDecimal);
  
    // Limit decimal places if present
    if (decimalPart) {
      result += '.' + decimalPart.slice(0, maxDigitsAfterDecimal);
    }
  
    return result;
  };

  export const sanitizeAndLimitInputAnnualIncome = (input: string, maxDigitsBeforeDecimal: number = 14, maxDigitsAfterDecimal: number = 2): string => {
    // Remove commas and non-numeric characters except for the decimal point
    const sanitizedInput = input.replace(/,/g, '').replace(/[^0-9.]/g, '');
  
    // Split input into whole and decimal parts
    const [wholePart, decimalPart] = sanitizedInput.split('.');
  
    // Limit to specified digits before the decimal point
    let result = wholePart.slice(0, maxDigitsBeforeDecimal);
  
    // Limit decimal places if present
    if (decimalPart) {
      result += '.' + decimalPart.slice(0, maxDigitsAfterDecimal);
    }
  
    return result;
  }
  
export type RowType = {
  id: string | number;
  condition?: string;
  [key: string]: any; // Allow other dynamic keys
};

export const handleSalePriceFocus = (
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  index: number,
  col: string,
  row: RowType,
  handleFieldChange: (index: number, field: string, value: string) => void
) => {
  if (col === 'sale_price' && row[col]) {
    const numericValue = row[col].replace(/[^0-9.]/g, ''); // Remove non-numeric characters
    handleFieldChange(index, col, numericValue);

    setTimeout(() => {
      if ('setSelectionRange' in e.target) {
        e.target.setSelectionRange(numericValue.length, numericValue.length);
      }
    }, 0);
  }
};

export const handleSalePriceBlur = (
  index: number,
  col: string,
  row: RowType,
  handleFieldChange: (index: number, field: string, value: string) => void
) => {
  if (col === 'sale_price') {
    const value = row[col];

    if (!value) {
      handleFieldChange(index, col, ''); // Keep empty if nothing is entered
      return;
    }

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')); // Extract valid number

    if (isNaN(numericValue)) {
      handleFieldChange(index, col, ''); // Ensure it remains empty string
    } else {
      handleFieldChange(
        index,
        col,
        `$${numericValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      );
    }
  }
};

export const handleSalePriceKeyDown = (
  e: React.KeyboardEvent<HTMLDivElement>,
  index: number,
  col: string,
  row: RowType,
  handleFieldChange: (index: number, field: string, value: string) => void
) => {
  if (col === 'sale_price') {
    const isBackspace = e.key === 'Backspace';

    if (isBackspace) {
      const inputElement = e.target as HTMLInputElement;
      const { selectionStart, selectionEnd } = inputElement;
      let value = row[col]?.replace(/[^0-9.]/g, '') || '';

      if (selectionStart === 0 && selectionEnd === inputElement.value.length) {
        handleFieldChange(index, col, '');
        e.preventDefault();
      } else if (value.length > 0) {
        value = value.slice(0, -1); // Remove last character
        const numericValue = parseFloat(value) || 0;

        handleFieldChange(
          index,
          col,
          numericValue
            ? `$${numericValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : ''
        );
        e.preventDefault();
      }
    }
  }
};

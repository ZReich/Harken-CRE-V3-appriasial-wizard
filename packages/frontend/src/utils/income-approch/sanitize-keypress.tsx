import { FormikHandlers } from 'formik';
import { handleInputChange } from '@/utils/sanitize';

export const handleVacancyKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  handleChange: FormikHandlers['handleChange'],
  values: any
) => {
  const event = e as React.KeyboardEvent<HTMLInputElement>;
  const inputValue = event.currentTarget.value;

  const allowedKeys = [
    'Backspace',
    'ArrowLeft',
    'ArrowRight',
    'Delete',
    'Tab',
    '%',
    '.',
  ];

  const isNumber = /\d/.test(e.key);

  if (inputValue.includes('.')) {
    const decimalPart = inputValue.split('.')[1];
    if (decimalPart && decimalPart.length >= 3 && isNumber) {
      event.preventDefault();
      return;
    }
  }

  if (!isNumber && !allowedKeys.includes(e.key)) {
    event.preventDefault();
    return;
  }

  const isBack = e.code === 'Backspace';
  if (isBack) {
    const inputElement = event.currentTarget;
    const { selectionStart, selectionEnd } = inputElement;

    if (selectionStart === 0 && selectionEnd === inputElement.value.length) {
      handleInputChange(handleChange, 'vacancy', '');
      event.preventDefault();
    } else {
      const input = values.vacancy.toString();
      const inpArr = Array.from(input);
      inpArr.pop();
      handleInputChange(handleChange, 'vacancy', inpArr.join(''));
    }
  }
};

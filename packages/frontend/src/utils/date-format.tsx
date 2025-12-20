// export const formatDate = (value: Date | string | number) => {
//   const originalDate = new Date(value);
//   const month = String(originalDate.getMonth() + 1).padStart(2, '0');
//   const date = String(originalDate.getDate()).padStart(2, '0');
//   const year = originalDate.getFullYear();
//   return `${month}/${date}/${year}`;
// };
export const formatDate = (value: Date | string | number) => {
  if (!value) {
    return '';
  }
  const originalDate = new Date(value);
  const localDate = new Date(
    originalDate.getTime() + originalDate.getTimezoneOffset() * 60000
  );
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const date = String(localDate.getDate()).padStart(2, '0');
  const year = localDate.getFullYear();
  return `${month}/${date}/${year}`;
};

export const formatDateFormat = (value: Date | string | number) => {
  if (!value) {
    return '';
  }
  let originalDate: Date;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    // Parse as local date
    const [year, month, day] = value.split('-').map(Number);
    originalDate = new Date(year, month - 1, day);
  } else {
    originalDate = new Date(value);
  }
  const month = String(originalDate.getMonth() + 1).padStart(2, '0');
  const date = String(originalDate.getDate()).padStart(2, '0');
  const year = originalDate.getFullYear();
  return `${month}/${date}/${year}`;
};

export const formatDateToMMDDYYYY = (dateString: string) => {
  if (!dateString) return;

  // Split the input date string (assumed to be in YYYY-MM-DD format)
  const parts = dateString.split('-');

  // Extract year, month, and day
  const year = parts[0];
  const month = parts[1];
  const day = parts[2].slice(0,2); // Ensure we only take the first two characters for day

  // Return the formatted date
  return `${month}/${day}/${year}`;
};

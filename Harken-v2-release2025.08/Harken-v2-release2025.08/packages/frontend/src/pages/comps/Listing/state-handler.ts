// Function to convert state abbreviations to lowercase
export const convertStateToLowercase = (value: any): any => {
  if (typeof value === 'string' && value.length > 0) {
    return value.toLowerCase();
  }
  return value;
};
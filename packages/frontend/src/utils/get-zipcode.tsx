import { UsaStateCodes } from './usaState';

export const getZipCode = async (
  addressComponents: any,
  formattedAddress: any
) => {
  try {
    let zipCode = null;
    let city = null;
    let state = null;
    let county = null;
    for (let i = 0; i < addressComponents.length; i++) {
      if (addressComponents[i].types.includes('postal_code')) {
        zipCode = addressComponents[i].long_name;
      }
      if (addressComponents[i].types.includes('locality')) {
        city = addressComponents[i].long_name;
      }
      if (addressComponents[i].types.includes('administrative_area_level_1')) {
        const stateName = addressComponents[i].long_name;
        if (Object.values(UsaStateCodes).includes(stateName)) {
          state = stateName;
        }
      }
      if (addressComponents[i].types.includes('administrative_area_level_2')) {
        county = addressComponents[i].long_name;
      }
    }
    const mainAddress = formattedAddress.split(',')[0];

    return { zipCode, city, state, county, address: mainAddress };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

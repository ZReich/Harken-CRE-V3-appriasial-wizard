// export enum AdjustmentKeys {
//   OTHER_AMENITIES = 'other_amenities',
// }

// export interface AmenityItem {
//   another_amenity_name: string;
//   another_amenity_value: string;
//   subject_property_check: number;
//   comp_property_check: number;
//   is_extra: number;
//   isExtra: number; // Changed from optional to required
//   is_from_expense?: boolean;
// }

// export const calculateAmenityTotal(extraAmenities: AmenityItem[], existingValue?: string | number | null)
// : number => {
//   // Calculate from the amenities only
//   let total = 0;
//   extraAmenities.forEach((item) => {
//     if (item.another_amenity_value) {
//       const valueStr = String(item.another_amenity_value);
//       if (valueStr.trim() !== '') {
//         const numValue = parseFloat(valueStr.replace(/[$,]/g, '') || '0');
//         if (!isNaN(numValue)) {
//           total += numValue;
//         }
//       }
//     }
//   });

//   return total;
// };
export enum AdjustmentKeys {
  OTHER_AMENITIES = 'other_amenities',
}

export interface AmenityItem {
  another_amenity_name: string;
  another_amenity_value: string;
  subject_property_check: number;
  comp_property_check: number;
  is_extra: number;
  isExtra: number; // Changed from optional to required
  is_from_expense?: boolean;
}

export const calculateAmenityTotal = (
  extraAmenities: AmenityItem[],
  existingValue?: string | number | null
): number => {
  let total = 0;

  // Add existing value if provided
  if (existingValue) {
    const existingStr = String(existingValue);
    const existingNum = parseFloat(existingStr.replace(/[$,]/g, '') || '0');
    if (!isNaN(existingNum)) {
      total += existingNum;
    }
  }

  // Calculate from the amenities
  extraAmenities.forEach((item) => {
    console.log(item);
    // if (item.another_amenity_value) {
    //   const valueStr = String(item.another_amenity_value);
    //   if (valueStr.trim() !== '') {
    //     const numValue = parseFloat(valueStr.replace(/[$,]/g, '') || '0');
    //     if (!isNaN(numValue)) {
    //       total += numValue;
    //     }
    //   }
    // }
  });

  return total;
};

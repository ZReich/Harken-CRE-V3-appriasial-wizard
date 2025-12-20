import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getRequiredColumns } from './filter-initial-values';
import { useMemo } from 'react';

export const useCompsFormik = (
  compsData: any,
  activeType: any,
  onSubmit: any
) => {
  const requiredColumns = getRequiredColumns(activeType, compsData);
  console.log('Required Columns:', requiredColumns);

  // Define valid building sub types - you'll need to replace this with your actual valid values
  const validBuildingSubTypes = [
    'office',
    'retail',
    'industrial',
    'warehouse',
    'medical',
    'restaurant',
    'hotel',
    'mixed_use',
    'other',
    'Type My Own',
    // Add your actual valid building sub types here
  ];

  const validationSchema = useMemo(() => {
    return Yup.object().shape(
      requiredColumns.reduce((acc: any, field) => {
        if (field === 'condition_custom') {
          acc[field] = Yup.string().when('condition', {
            is: (condition: string) => condition === 'Type My Own',
            then: (schema) => schema.required('This field is required'),
            otherwise: (schema) => schema.notRequired(),
          });
        } else if (field === 'building_sub_type_custom') {
          acc[field] = Yup.string().when('building_sub_type', {
            is: (building_sub_type: string) =>
              building_sub_type === 'Type My Own',
            then: (schema) => schema.required('This field is required'),
            otherwise: (schema) => schema.notRequired(),
          });
        } else {
          acc[field] = Yup.string().required('This field is required');
        }
        return acc;
      }, {})
    );
  }, [requiredColumns]); // ✅ Ensure it re-computes when `requiredColumns` changes

  const formik = useFormik({
    initialValues: {
      comps: (compsData || []).map((comp: any) => ({
        ...comp,
        ...requiredColumns.reduce((acc: any, key) => {
          if (key === 'building_type') {
            // Set default to "residential" only for residential case
            if (
              comp[key] === null ||
              comp[key] === undefined ||
              comp[key] === ''
            ) {
              acc[key] = activeType === 'residential' ? 'residential' : '';
            } else {
              acc[key] = comp[key];
            }
          } else if (key === 'building_sub_type') {
            // Set default value to "Type My Own" for building_sub_type if null, undefined, empty, or not in valid list
            if (
              comp[key] === null ||
              comp[key] === undefined ||
              comp[key] === '' ||
              !validBuildingSubTypes.includes(comp[key])
            ) {
              acc[key] = 'Type My Own';
              if (!acc['building_sub_type_custom']) {
                acc['building_sub_type_custom'] = 'Unknown';
              } else {
                acc['building_sub_type_custom'] = comp['building_sub_type_custom'] || 'Unknown';
              }
            } else {
              acc[key] = comp[key];
            }
          } else if (key === 'condition') {
            // Set default value to "Type My Own" for condition if null, undefined, or empty
            if (
              comp[key] === null ||
              comp[key] === undefined ||
              comp[key] === ''
            ) {
              acc[key] = 'Type My Own';
              if (!acc['condition_custom']) {
                acc['condition_custom'] = 'Unknown';
              } else {
                acc['condition_custom'] = comp['condition_custom'] || 'Unknown';
              }
            } else {
              acc[key] = comp[key];
            }
          } else {
            acc[key] = comp[key] ?? ''; // Ensure default values for required columns
          }
          return acc;
        }, {}),
        comparison_basis: comp.comparison_basis ?? 'SF',
        land_dimension: comp.land_dimension ?? 'SF',
        date_sold: comp.date_sold
          ? comp.date_sold
          : new Date().toISOString().split('T')[0], // Default to today if missing
      })),
    },
    validationSchema: Yup.object({
      comps: Yup.array().of(validationSchema),
    }),
    onSubmit,
  });

  return formik;
};

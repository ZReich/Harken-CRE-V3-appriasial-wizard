import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getRequiredColumns } from './filter-initial-values';
import { useMemo, useRef } from 'react';

export const useCompsFormik = (
  compsData: any,
  activeType: any,
  onSubmit: any
) => {
  // Get required columns dynamically based on current data
  const initialRequiredColumns = useMemo(() => {
    return getRequiredColumns(activeType, compsData);
  }, [activeType, compsData]); // Depend on both activeType and compsData

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
    // Create base validation schema
    const baseSchema = initialRequiredColumns.reduce((acc: any, field) => {
      if (field === 'condition_custom') {
        acc[field] = Yup.string().when('condition', {
          is: (condition: string) => {
            // Check if condition is 'Type My Own' OR if it's an invalid value not in valid options
            const validConditionOptions = ['poor', 'fair', 'average', 'good', 'very_good', 'excellent', 'Type My Own'];
            return condition === 'Type My Own' || (condition && !validConditionOptions.includes(condition));
          },
          then: (schema) =>
            schema
              .test('required-field', 'This field is required', (value) => {
                // Accept "Unknown" as a valid default value OR any non-empty string
                const isValid =
                  value === 'Unknown' ||
                  Boolean(value && value.trim().length > 0);

                return isValid;
              })
              .required('This field is required'),
          otherwise: (schema) => schema.notRequired(),
        });
      } else if (field === 'building_sub_type_custom') {
        acc[field] = Yup.string().when('building_sub_type', {
          is: (building_sub_type: string) => {
            // Check if building_sub_type is 'Type My Own' OR if it's an invalid value
            const validBuildingSubTypes = ['residential', 'multifamily', 'office', 'retail', 'industrial', 'hospitality', 'special', 'Type My Own'];
            return building_sub_type === 'Type My Own' || (building_sub_type && !validBuildingSubTypes.includes(building_sub_type));
          },
          then: (schema) =>
            schema
              .test('required-field', 'This field is required', (value) => {
                // Accept "Unknown" as a valid default value OR any non-empty string
                const isValid =
                  value === 'Unknown' ||
                  Boolean(value && value.trim().length > 0);

                return isValid;
              })
              .required('This field is required'),
          otherwise: (schema) => schema.notRequired(),
        });
      } else if (field === 'land_type_custom') {
        acc[field] = Yup.string().when('land_type', {
          is: (land_type: string) => {
            // Check if land_type is 'Type My Own' OR if it's an invalid value
            const validLandTypes = ['vacant', 'improved', 'Type My Own'];
            return land_type === 'Type My Own' || (land_type && !validLandTypes.includes(land_type));
          },
          then: (schema) =>
            schema
              .test('required-field', 'This field is required', (value) => {
                const isValid = Boolean(value && value.trim().length > 0);

                return isValid;
              })
              .required('This field is required'),
          otherwise: (schema) => schema.notRequired(),
        });
      } else {
        acc[field] = Yup.string()
          .test('required-field-check', 'This field is required', (value) => {
            // Check if field is empty or null
            if (!value || value.trim().length === 0) {
              return false;
            }

            // For dropdown fields, check if value matches available options
            const dropdownFields = [
              'building_type', 'building_sub_type', 'condition', 'land_type',
              'comparison_basis', 'lease_type', 'offeror_type', 'acquirer_type',
              'lease_status', 'land_dimension', 'sale_status', 'utilities_select',
              'lot_shape', 'private_comp', 'TI_allowance_unit', 'exterior',
              'roof', 'electrical', 'plumbing', 'heating_cooling', 'windows',
              'garage', 'topography', 'fencing', 'fireplace', 'bedrooms',
              'bathrooms', 'asking_rent_unit', 'lease_rate_unit', 'basement',
              'parking', 'frontage', 'state'
            ];

            if (dropdownFields.includes(field)) {
              // Define valid options for each dropdown field
              const validOptions: { [key: string]: string[] } = {
                building_type: ['residential', 'multifamily', 'office', 'retail', 'industrial', 'hospitality', 'special'],
                condition: ['poor', 'fair', 'average', 'good', 'very_good', 'excellent', 'Type My Own'],
                land_dimension: ['SF', 'ACRE', 'Unit', 'Bed'],
                comparison_basis: ['SF', 'Unit', 'Bed'],
                lease_type: ['gross', 'net', 'modified_gross', 'triple_net'],
                private_comp: ['1', '0', 'Yes', 'No'],
                state: ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy']
              };

              // Check if field has defined valid options and value is not in them
              if (validOptions[field] && !validOptions[field].includes(value)) {
                return false;
              }
            }

            return true;
          })
          .required('This field is required');
      }
      return acc;
    }, {});

    // Always include conditional validation for custom fields that might not be in initialRequiredColumns
    if (!baseSchema.land_type_custom) {
      baseSchema.land_type_custom = Yup.string().when('land_type', {
        is: (land_type: string) => land_type === 'Type My Own',
        then: (schema) =>
          schema
            .test('required-field', 'This field is required', (value) => {
              const isValid = Boolean(value && value.trim().length > 0);

              return isValid;
            })
            .required('This field is required'),
        otherwise: (schema) => schema.notRequired(),
      });
    }

    return Yup.object().shape(baseSchema);
  }, [initialRequiredColumns]); // Only recompute when initial required columns change

  const isInitialized = useRef(false);

  const initialValues = useMemo(() => {
    // Only initialize once, unless it's the very first time
    if (isInitialized.current && compsData && compsData.length > 0) {
      return undefined; // Return undefined to prevent reinitialization
    }

    const values = {
      comps: (compsData || []).map((comp: any) => ({
        ...comp,
        ...initialRequiredColumns.reduce((acc: any, key) => {
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
            } else {
              acc[key] = comp[key];
            }
          } else if (key === 'condition') {
            // Define valid condition options
            const validConditionOptions = [
              '',
              'poor',
              'fair',
              'average',
              'good',
              'very_good',
              'excellent',
              'Type My Own',
            ];

            // Set default value to "Type My Own" for condition if null, undefined, empty, or not in valid list
            if (
              comp[key] === null ||
              comp[key] === undefined ||
              comp[key] === '' ||
              !validConditionOptions.includes(comp[key])
            ) {
              acc[key] = 'Type My Own';
              // Set condition_custom to "Unknown" as default for all cases
              acc['condition_custom'] = comp['condition_custom'] || 'Unknown';
              if (
                !validConditionOptions.includes(comp[key]) &&
                comp[key] !== null &&
                comp[key] !== undefined &&
                comp[key] !== ''
              ) {
                console.log(
                  `🔧 Condition "${comp[key]}" not in valid options, setting condition_custom to Unknown`
                );
              }
            } else {
              acc[key] = comp[key];
              // Also set condition_custom to "Unknown" if condition is "Type My Own" but custom field is empty
              if (comp[key] === 'Type My Own') {
                acc['condition_custom'] = comp['condition_custom'] || 'Unknown';
              }
            }
          } else {
            acc[key] = comp[key] ?? ''; // Ensure default values for required columns
          }
          return acc;
        }, {}),
        // Ensure custom fields always have proper defaults when parent field is "Type My Own"
        building_sub_type_custom: (() => {
          // Get the building_sub_type from the accumulated values (which might have been set to "Type My Own" in the reduce function)
          const accumulatedBuildingSubType = initialRequiredColumns.includes(
            'building_sub_type'
          )
            ? comp.building_sub_type === null ||
              comp.building_sub_type === undefined ||
              comp.building_sub_type === '' ||
              !validBuildingSubTypes.includes(comp.building_sub_type)
              ? 'Type My Own'
              : comp.building_sub_type
            : comp.building_sub_type;

          const finalBuildingSubType =
            accumulatedBuildingSubType || comp.building_sub_type;

          // Determine if we should set "Unknown" as default
          const isCustomFieldEmpty =
            comp.building_sub_type_custom === null ||
            comp.building_sub_type_custom === undefined ||
            comp.building_sub_type_custom === '' ||
            comp.building_sub_type_custom === 'null' ||
            !comp.hasOwnProperty('building_sub_type_custom');

          let customValue;
          if (finalBuildingSubType === 'Type My Own') {
            customValue = isCustomFieldEmpty
              ? 'Unknown'
              : comp.building_sub_type_custom;
          } else {
            customValue = comp.building_sub_type_custom || '';
          }

          return customValue;
        })(),
        condition_custom: (() => {
          const validConditionOptions = [
            '',
            'poor',
            'fair',
            'average',
            'good',
            'very_good',
            'excellent',
            'Type My Own',
          ];

          const isInvalidCondition =
            comp.condition !== null &&
            comp.condition !== undefined &&
            comp.condition !== '' &&
            !validConditionOptions.includes(comp.condition);

          const finalCondition =
            comp.condition === null ||
            comp.condition === undefined ||
            comp.condition === '' ||
            isInvalidCondition
              ? 'Type My Own'
              : comp.condition;

          let customValue;
          if (finalCondition === 'Type My Own') {
            // Always use 'Unknown' as default, regardless of whether condition was invalid
            customValue = comp.condition_custom || 'Unknown';
          } else {
            customValue = comp.condition_custom;
          }

          return customValue;
        })(),
        // Only set one field for the comparison basis, prefer comp.comparison_basis, fallback to comp.land_dimension, then 'SF'
        comparison_basis: comp.comparison_basis || comp.land_dimension || 'SF',
        date_sold: comp.date_sold
          ? comp.date_sold
          : new Date().toISOString().split('T')[0], // Default to today if missing
      })),
    };

    isInitialized.current = true;
    return values;
  }, [compsData, initialRequiredColumns, activeType]);

  const formik = useFormik({
    initialValues: initialValues || { comps: [] },
    enableReinitialize: false, // Prevent reinitializing when props change
    validationSchema: Yup.object({
      comps: Yup.array().of(validationSchema),
    }),
    onSubmit,
  });

  return formik;
};

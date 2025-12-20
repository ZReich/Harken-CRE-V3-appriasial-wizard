export const filterInitialValues = {
  start_date: '',
  end_date: '',
  building_sf_min: '',
  space_sf_min: '',
  space_sf_max: '',
  cap_rate_min: '',
  cap_rate_max: '',
  building_sf_max: '',
  land_sf_min: '',
  land_sf_max: '',
  property_type: '',
  compStatus: '',
  type: '',
  street_address: '',
  state: '',
  formUpdate: false,
  all: '',
  orderByColumn: '',
  lease_type: '',
  square_footage_min: '',
  square_footage_max: '',
  price_sf_max: '',
  price_sf_min: '',
  building_type: '',
  building_sub_type: '',
  building_sub_type_custom: 'Unknown',
  condition_custom: 'Unknown',
};
export const filterAppraisalListInitialValues = {
  dateOfAnalysisFrom: '',
  dateOfAnalysisTo: '',
  streetAddress: '',
  state: '',
  formUpdate: false,
};
export const dateFields = [
  'date_sold',
  'date_commencement',
  'transaction_date',
  'date_expiration',
  'date_list',
  'date_execution',
];
export const dropdownColumns = [
  'property_type',
  'building_type',
  'building_sub_type',
  'conforming_use_determination',
  'land_type',
  'comparison_basis',
  'lease_type',
  'offeror_type',
  'acquirer_type',
  'lease_status',
  'land_dimension',
  'private_comp',
  'frontage',
  'sale_status',
  'building_sub_type',
  'condition',
  'utilities_select',
  'parking',
  'lease_rate_unit',
  'asking_rent_unit',
  'lot_shape',
  'topography',
  'TI_allowance_unit',
  'state',
  'exterior',
  'roof',
  'electrical',
  'plumbing',
  'heating_cooling',
  'windows',
  'garage',
  'fencing',
  'fireplace',
  'bedrooms',
  'bathrooms',
  // Add other dropdown fields here...
];

export const ComparisonBasisOptions = [
  { value: 'SF', label: 'SF' },
  { value: 'Unit', label: 'Unit' },
  { value: 'Bed', label: 'Bed' },
];
export const getRequiredColumns = (activeType: any, comps: any) => {
  const checkType = localStorage.getItem('checkType');
  const approachType = localStorage.getItem('approachType');
  const storedActiveType = localStorage.getItem('activeType');

  // Check if current URL contains cost-approach paths
  const currentPath = window.location.pathname;
  const isCostApproach =
    (currentPath.includes('evaluation/cost-approach') ||
      currentPath.includes('cost-approach')) &&
    !currentPath.includes('residential/evaluation/cost-approach');

  let baseColumns = [];

  if (activeType === 'land_only' && checkType === 'leasesCheckbox') {
    // ✅ Prioritize this case first to prevent overrides
    baseColumns = [
      'street_address',
      'city',
      'state',
      'condition',
      'lease_type',
      'lease_rate',
      'lease_rate_unit',
      'date_sold',
      'building_type',
      'building_sub_type',
      'land_dimension',
      'land_type',
      'land_size',
    ];
  } else if (activeType === 'land_only' && approachType === 'leaseCheck') {
    // ✅ Remove building_type and building_sub_type for this case
    baseColumns = [
      'street_address',
      'city',
      'state',
      'condition',
      'lease_type',
      'lease_rate',
      'lease_rate_unit',
      'date_sold',
      'land_dimension',
      'land_type',
      'land_size',
    ];
  } else if (storedActiveType?.toLowerCase() === 'residential') {
    baseColumns = [
      'street_address',
      'city',
      'state',
      'condition',
      'sale_price',
      'date_sold',
      'basement_finished_sq_ft',
      'basement_unfinished_sq_ft',
      'gross_living_sq_ft',
      'total_sq_ft',
      'weight_sf',
      'building_type',
      'building_sub_type',
      'land_dimension',
    ];
    if (currentPath.includes('residential/evaluation/cost-approach')) {
      baseColumns.push('land_type');
      baseColumns.push('land_size');
    }
  } else if (checkType === 'leasesCheckbox' || approachType === 'leaseCheck') {
    baseColumns = [
      'street_address',
      'city',
      'state',
      'condition',
      'lease_type',
      'lease_rate',
      'lease_rate_unit',
      'date_sold',
      'building_type',
      'building_sub_type',
      'land_dimension',
    ];
  } else {
    baseColumns =
      activeType === 'building_with_land'
        ? [
            'street_address',
            'city',
            'state',
            'condition',
            'sale_price',
            'date_sold',
            'building_type',
            'building_sub_type',
            'land_dimension',
          ]
        : [
            'street_address',
            'city',
            'state',
            'condition',
            'land_type',
            'land_size',
            'sale_price',
            'date_sold',
            'land_dimension',
          ];
  }

  // Handle cost-approach specific columns
  if (isCostApproach) {
    baseColumns = [
      'street_address',
      'city',
      'state',
      'condition',
      'land_type',
      'land_size',
      'sale_price',
      'date_sold',
      'land_dimension',
    ];
  } else {
    // Remove building_type and building_sub_type if it's a cost-approach URL (this is for non-cost-approach paths)
  }

  // Ensure lease_rate_unit is right after lease_rate
  const leaseRateIndex = baseColumns.indexOf('lease_rate');
  if (leaseRateIndex !== -1 && !baseColumns.includes('lease_rate_unit')) {
    baseColumns.splice(leaseRateIndex + 1, 0, 'lease_rate_unit');
  }
  // Ensure land_dimension appears right after land_size
  const landSizeIndex = baseColumns.indexOf('land_size');
  if (landSizeIndex !== -1) {
    // Remove land_dimension if it exists elsewhere
    baseColumns = baseColumns.filter((col) => col !== 'land_dimension');
    // Insert land_dimension right after land_size
    baseColumns.splice(landSizeIndex + 1, 0, 'land_dimension');
  }

  if (checkType === 'leasesCheckbox') {
    baseColumns = baseColumns.filter((col) => col !== 'sale_price');
  }

  // Handle "Type My Own" for building_sub_type (skip for cost-approach)
  if (!isCostApproach) {
    // Check if any comp has building_sub_type as "Type My Own"
    const hasCustomBuildingSubType = Array.isArray(comps)
      ? comps.some((row) => row.building_sub_type === 'Type My Own')
      : false;

    // Only include building_sub_type_custom if building_sub_type is present AND there's a "Type My Own" value
    if (baseColumns.includes('building_sub_type') && hasCustomBuildingSubType) {
      if (!baseColumns.includes('building_sub_type_custom')) {
        const subTypeIndex = baseColumns.indexOf('building_sub_type');
        baseColumns.splice(subTypeIndex + 1, 0, 'building_sub_type_custom');
      }
    }
  }

  // Handle "Type My Own" for condition
  const hasCustomCondition = Array.isArray(comps)
    ? comps.some((row) => row.condition === 'Type My Own')
    : false;

  if (hasCustomCondition) {
    const conditionIndex = baseColumns.indexOf('condition');
    if (conditionIndex !== -1 && !baseColumns.includes('condition_custom')) {
      baseColumns.splice(conditionIndex + 1, 0, 'condition_custom');
    }
  } else {
    baseColumns = baseColumns.filter((col) => col !== 'condition_custom');
  }

  // Ensure comparison_basis and building_size appear after building_type and building_sub_type (skip for cost-approach)
  if (!isCostApproach) {
    const typeIndex =
      baseColumns.indexOf('building_sub_type_custom') !== -1
        ? baseColumns.indexOf('building_sub_type_custom')
        : baseColumns.indexOf('building_sub_type');

    if (typeIndex !== -1) {
      if (
        activeType !== 'residential' &&
        !baseColumns.includes('comparison_basis')
      ) {
        baseColumns.splice(typeIndex + 1, 0, 'comparison_basis');
      }

      if (!baseColumns.includes('building_size')) {
        baseColumns.splice(typeIndex + 1, 0, 'building_size');
      }
    }
  }

  // ✅ Final filter to ensure comparison_basis is *completely removed* when activeType is 'residential'
  if (activeType === 'residential') {
    baseColumns = baseColumns.filter((col) => col !== 'comparison_basis');
  }

  return baseColumns;
};

export const landDimensionOption = [
  { value: 'SF', label: 'SF' },
  { value: 'Unit', label: 'Unit' },
  { value: 'Bed', label: 'Bed' },
];
export const sizeTypeOptions = [
  { value: 'SF', label: 'SF' },
  { value: 'ACRE', label: 'AC' },
];
export const sizeTypeOptions1 = [
  { value: 'SF', label: 'SF' },
  { value: 'AC', label: 'AC' },
];
export const privateComp = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' },
];

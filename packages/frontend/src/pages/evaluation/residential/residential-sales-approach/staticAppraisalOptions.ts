// Static options for different appraisal types
export const appraisalSpecificOptions = {
  general: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'land_size_sf', comparison_value: 'Land Size (SF)' },
    { comparison_key: 'building_size', comparison_value: 'Building Size' }
  ],
  
  office: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'land_size_sf', comparison_value: 'Land Size (SF)' },
    { comparison_key: 'building_size', comparison_value: 'Building Size' },
    { comparison_key: 'year_built_year_remodeled', comparison_value: 'Year Built/Remodeled' }
  ],
  
  retail: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'land_size_sf', comparison_value: 'Land Size (SF)' },
    { comparison_key: 'building_size', comparison_value: 'Building Size' },
    { comparison_key: 'year_built_year_remodeled', comparison_value: 'Year Built/Remodeled' }
  ],
  
  industrial: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'land_size_sf', comparison_value: 'Land Size (SF)' },
    { comparison_key: 'building_size', comparison_value: 'Building Size' },
    { comparison_key: 'year_built_year_remodeled', comparison_value: 'Year Built/Remodeled' }
  ],
  
  multi_family: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'unit', comparison_value: 'Units' },
    { comparison_key: 'unit_mix', comparison_value: 'Unit Mix' },
    { comparison_key: 'year_built_year_remodeled', comparison_value: 'Year Built/Remodeled' }
  ],
  
  hospitality: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'unit', comparison_value: 'Rooms' },
    { comparison_key: 'building_size', comparison_value: 'Building Size' },
    { comparison_key: 'year_built_year_remodeled', comparison_value: 'Year Built/Remodeled' }
  ],
  
  storage: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'land_size_sf', comparison_value: 'Land Size (SF)' },
    { comparison_key: 'building_size', comparison_value: 'Building Size' },
    { comparison_key: 'year_built_year_remodeled', comparison_value: 'Year Built/Remodeled' }
  ],
  
  land: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'land_size_sf', comparison_value: 'Land Size (SF)' },
    { comparison_key: 'land_size_acre', comparison_value: 'Land Size (Acre)' },
    { comparison_key: 'price_per_acre', comparison_value: 'Price per Acre' },
    { comparison_key: 'price_per_sf_land', comparison_value: 'Price per SF' }
  ],
  
  residential: [
    { comparison_key: 'street_address', comparison_value: 'Street Address' },
    { comparison_key: 'city_state', comparison_value: 'City, State' },
    { comparison_key: 'land_size_sf', comparison_value: 'Land Size (SF)' },
    { comparison_key: 'gross_living_area_sf', comparison_value: 'Gross Living Area (SF)' },
    { comparison_key: 'year_built', comparison_value: 'Year Built' },
    { comparison_key: 'bedrooms', comparison_value: 'Bedrooms' },
    { comparison_key: 'bathrooms', comparison_value: 'Bathrooms' }
  ]
};
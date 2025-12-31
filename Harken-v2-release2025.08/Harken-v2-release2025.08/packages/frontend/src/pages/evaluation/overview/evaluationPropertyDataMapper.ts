export const mapPropertyDataToEvaluationFields = (propertyData: any) => {
  if (!propertyData) return {};

  const mappedData: any = {};

  // Property Details mapping
  if (propertyData.street_address) {
    mappedData.street_address = propertyData.street_address;
  }
  if (propertyData.city) {
    mappedData.city = propertyData.city;
  }
  if (propertyData.state) {
    mappedData.state = propertyData.state;
  }
  if (propertyData.zipcode) {
    mappedData.zipcode = propertyData.zipcode;
  }
  if (propertyData.county) {
    mappedData.county = propertyData.county;
  }
  if (propertyData.latitude && propertyData.longitude) {
    mappedData.geometry = {
      lat: propertyData.latitude,
      lng: propertyData.longitude
    };
  }

  // Additional property details from API response
  if (propertyData.owner_of_record) {
    mappedData.owner_of_record = propertyData.owner_of_record;
  }
  if (propertyData.year_built) {
    mappedData.year_built = propertyData.year_built;
  }
  if (propertyData.year_remodeled) {
    mappedData.year_remodeled = propertyData.year_remodeled;
  }
  if (propertyData.building_size) {
    mappedData.building_size = propertyData.building_size;
  }
  if (propertyData.stories) {
    mappedData.no_stories = propertyData.stories;
  }
  if (propertyData.property_legal) {
    mappedData.property_legal = propertyData.property_legal;
  }
  if (propertyData.property_geocode) {
    mappedData.property_geocode = propertyData.property_geocode;
  }
  if (propertyData.parcel_id || propertyData.apn) {
    mappedData.parcel_id_apn = propertyData.parcel_id || propertyData.apn;
  }
  if (propertyData.assessed_value) {
    mappedData.assessed_value = propertyData.assessed_value;
  }
  if (propertyData.market_value) {
    mappedData.market_value = propertyData.market_value;
  }
  if (propertyData.property_type) {
    mappedData.property_type = propertyData.property_type;
  }
  if (propertyData.bedrooms) {
    mappedData.bedrooms = propertyData.bedrooms;
  }
  if (propertyData.bathrooms) {
    mappedData.bathrooms = propertyData.bathrooms;
  }
  if (propertyData.garage) {
    mappedData.garage = propertyData.garage;
  }
  if (propertyData.basement) {
    mappedData.basement = propertyData.basement;
  }
  if (propertyData.heating_cooling) {
    mappedData.heating_cooling = propertyData.heating_cooling;
  }
  if (propertyData.exterior_walls) {
    mappedData.exterior = propertyData.exterior_walls;
  }
  if (propertyData.roof_material) {
    mappedData.roof = propertyData.roof_material;
  }
  if (propertyData.foundation_type) {
    mappedData.foundation = propertyData.foundation_type;
  }
  if (propertyData.construction_type) {
    mappedData.main_structure_base = propertyData.construction_type;
  }
  if (propertyData.condition) {
    mappedData.condition = propertyData.condition;
  }
  if (propertyData.property_class) {
    mappedData.property_class = propertyData.property_class;
  }

  // Specification mapping
  if (propertyData.land_size) {
    // Format land size with commas
    const formattedLandSize = new Intl.NumberFormat('en-US').format(propertyData.land_size);
    mappedData.land_size = formattedLandSize;
  }
  if (propertyData.topography) {
    mappedData.topography = propertyData.topography;
  }
  if (propertyData.frontage) {
    mappedData.frontage = propertyData.frontage;
  }
  if (propertyData.lot_shape) {
    mappedData.lot_shape = propertyData.lot_shape;
  }
  if (propertyData.lot_depth) {
    mappedData.lot_depth = propertyData.lot_depth;
  }
  if (propertyData.front_feet) {
    mappedData.front_feet = propertyData.front_feet;
  }

  // Utilities mapping
  if (propertyData.utilities_select) {
    mappedData.utilities_select = propertyData.utilities_select;
  }
  if (propertyData.utilities_select_custom) {
    mappedData.utilities_select_custom = propertyData.utilities_select_custom;
  }
  if (propertyData.utilities) {
    if (propertyData.utilities.sewer) {
      mappedData.utilities_sewer = propertyData.utilities.sewer;
    }
    if (propertyData.utilities.water) {
      mappedData.utilities_water = propertyData.utilities.water;
    }
    if (propertyData.utilities.electricity) {
      mappedData.utilities_electricity = propertyData.utilities.electricity;
    }
    if (propertyData.utilities.fuel) {
      mappedData.utilities_fuel = propertyData.utilities.fuel;
    }
  }

  // Zoning mapping
  if (propertyData.zoning_type) {
    mappedData.zoning_type = propertyData.zoning_type;
  }
  if (propertyData.zoning_description) {
    mappedData.zoning_description = propertyData.zoning_description;
  }

  // Tax Assessment mapping
  if (propertyData.land_assessment) {
    // Format as currency
    const formattedLandAssessment = `$${new Intl.NumberFormat('en-US').format(propertyData.land_assessment)}`;
    mappedData.land_assessment = formattedLandAssessment;
  }
  if (propertyData.structure_assessment) {
    // Format as currency
    const formattedStructureAssessment = `$${new Intl.NumberFormat('en-US').format(propertyData.structure_assessment)}`;
    mappedData.structure_assessment = formattedStructureAssessment;
  }
  if (propertyData.tax_liability) {
    // Format as currency
    const formattedTaxLiability = `$${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(propertyData.tax_liability)}`;
    mappedData.tax_liability = formattedTaxLiability;
  }
  if (propertyData.taxes_in_arrears) {
    const formattedTaxesInArrears = `$${new Intl.NumberFormat('en-US').format(propertyData.taxes_in_arrears)}`;
    mappedData.taxes_in_arrears = formattedTaxesInArrears;
  }

  return mappedData;
};
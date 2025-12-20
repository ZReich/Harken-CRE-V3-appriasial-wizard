export interface ResidentialCreateComp {
  property_name?: string;
  property_image_url: string;
  street_address: string;
  street_suite: string;
  city: string;
  county: string;
  state: string;
  zipcode: number | string;
  map_pin_lat: string;
  map_pin_lng: string;
  longitude: string;
  latitude: string;
  comp_link: any;

  map_pin_zoom: string;
  summary: string;

  zonings: [
    {
      zone: string;
      sub_zone: string;
      gross_living_sq_ft: number;
      basement_finished_sq_ft: number;
      basement_unfinished_sq_ft: number;
      weight_sf: string;
      total_sq_ft: number;
      id: number;
      sub_zone_custom: string;
    },
  ];
  building_size: number;
  land_size?: any;
  land_dimension: string;
  topography: string;
  lot_shape: string;
  frontage: string;
  year_built: string;
  year_remodeled: string;
  condition: string;
  utilities_select: string;
  zoning_type: string;
  basement: string;
  offeror_type: string;
  offeror_id: number;
  acquirer_type: string;
  acquirer_id: number;
  exterior: string;
  price_square_foot: number;
  roof: string;
  electrical: string;
  plumbing: string;
  heating_cooling: string;
  windows: string;
  bedrooms: string;
  bathrooms: string;
  garage: string;
  fencing: string;
  fireplace: string;

  additional_amenities: string[];
  other_amenities: string;
  sale_price: string | number;
  date_sold: string;
  sale_status: string;
  list_price: number | null;
  date_list: string | null;
  days_on_market: number;
  total_concessions: number | string | null;
  private_comp: string | boolean | number;
  topography_custom: string;
  lot_shape_custom: string;
  frontage_custom: string;
  condition_custom: string;
  utilities_select_custom: string;
  fireplace_custom: string;
  roof_custom: string;
  fencing_custom: string;
  basement_custom: string;
  exterior_custom: string;
  electrical_custom: string;
  plumbing_custom: string;
  heating_cooling_custom: string;
  windows_custom: string;
  garage_custom: string;
  bedrooms_custom: string;
  bathrooms_custom: string;
  geometry?: {
    latitude: string;
    logitude: string;
  };
}

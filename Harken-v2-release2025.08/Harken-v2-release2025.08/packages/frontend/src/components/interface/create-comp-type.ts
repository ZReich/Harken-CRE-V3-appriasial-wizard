export interface CreateCompType {
  other_include_utilities: any;
  acquirer_id: number | string | null;
  property_image_url: string;
  business_name: string;
  street_address: string;
  street_suite: string;
  city: string;
  summary: string;
  state: string;
  zipcode: number | string | any;
  location_desc: string;
  legal_desc: string;
  site_coverage_percent: number | string;
  zoning_type: string;
  occupancy: string;
  grantor: string;
  grantee: string;
  instrument: string;
  confirmed_by: string;
  confirmed_with: string;
  parcel_id_apn: string;
  comparison_basis: string;
  // zone: 'select',
  // sub_zone: 'select',
  // sq_ft: number | string,
  year_built: string;
  // year_modeled: string,
  construction_class: string;
  stories: string;
  // gross_area: string,
  // net_area: string,
  effective_age: string;
  building_comments: string;
  condition: string;
  condition_custom?: string;
  parking: string;
  parking_custom?: string;
  land_size: string | number;
  land_dimension: string;
  topography: string;
  topography_custom?: string;
  lot_shape: string;
  lot_shape_custom?: string;
  frontage: string;
  frontage_custom?: string;
  site_access: string;
  utilities_select: string;
  utilities_select_custom: string;
  site_comments: string;
  sale_price: string | null | number;
  date_sold: string;
  // other_include_utilities?: string
  sale_status: string;
  net_operating_income: number | string | null;
  cap_rate: number | string;
  total_operating_expense: number | null | string;
  operating_expense_psf: number | string | null | any;
  list_price: number | null | string;
  date_list: string;
  days_on_market: number | string;
  total_concessions: number | null | string;
  financing: string;
  marketing_time: string;
  est_land_value: number | null | string;
  est_building_value: number | null | string;
  concessions: string;
  space: number | string | null;
  lease_rate: number | string;
  lease_rate_unit: string;
  lease_type: string;
  cam: number | string | null;
  term: number | string | null;
  date_execution: string;
  date_commencement: string;
  date_expiration: string;
  TI_allowance: number | string | null;
  TI_allowance_unit: string;
  asking_rent: number | string | null;
  escalators: number | string | null;
  free_rent: number | string | null;
  gross_building_area: number | string | null;
  net_building_area: number | string | null;
  lease_status: string;
  asking_rent_unit: string;
  private_comp: number;
  geometry: {
    lng?: any;
    lat?: any;
    latitude: string;
    logitude: string;
  };
  comp_type: string;
  type: string;
  zonings: Zone[];
  offeror_type: string;
  offeror_id: number | string | null;
  acquirer_type: string;
  county: string;
  property_class: string;
  year_remodeled: string;
  price_square_foot: number;
  building_size: number | string;
  map_pin_lat: string;
  map_pin_lng: string;
  map_pin_zoom: number;
  latitude: string;
  longitude: string;
  land_type:string;
  property_units: {
    beds: string | number;
    baths: string | number;
    sq_ft: string | number;
    unit_count: string | number;
    avg_monthly_rent: string | number;
  }[]
}

export type Zone = {
  bed: string | number;
  unit: string | number;
  zone: number | string;
  sub_zone: string;
  sq_ft: string | number;
};

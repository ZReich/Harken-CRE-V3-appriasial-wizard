export interface IComp {
  ai_generated: number;
  state: string;
  business_name: any;
  property_name: any;
  property_image_url: any;
  building_size: number;
  land_size: number;
  latitude: string;
  longitude: string;
  map_pin_lat?: string;
  map_pin_lng?: string;
  label: string;
  street_address: string | any;
  city: string;
  date_sold: string;
  date_list: string;
  zipcode: number;
  comp_type: string;
  cap_rate: number;
  list_price: number;
  lease_rate: any;
  sale_price: any;
  id: number;
  comp_id?: number;
  sale_status: string;
  lease_status: any;
  year_built: any;
  year_remodeled: any;
  land_dimension: any;
  land_type: string;
  type: any;
  condition: string;
  price_square_foot: number;
  lease_type: string;
  sub_type: any;
  bedrooms?: any;
  bathrooms?: any;
}

interface City {
  city: string;
}

export interface IcompMap {
  latitude: string;
  longitude: string;
}

export interface FilterComp {
  type?: string;
  orderByColumn?: string;
  orderBy?: string;
  end_date?: any;
  start_date?: string;
  building_sf_min?: any | null;
  cap_rate_min?: number | null;
  cap_rate_max?: number | null;
  land_sf_min?: number | null;
  building_sf_max?: number | null;
  land_sf_max?: number | null;
  propertyType?: any;
  street_address: string;
  compStatus?: string;
  city?: City[] | any;
  state?: string;
  comp_type?: any;
  lease_type?: any;
  price_sf_max?: any;
  price_sf_min?: any;
  square_footage_min?: any;
  square_footage_max?: any;
  comparison_basis?: any;
  _timestamp?: number;
}

export interface FilterCompResidential {
  type?: string;
  // orderBy: string,
  end_date: string;
  start_date: string;
  building_sf_min: number | null;
  orderByColumn?: string;
  land_sf_min: number | null;
  building_sf_max: number | null;
  land_sf_max: number | null;
  propertyType: string;
  street_address: string;
  comp_type?: string;
  city: City[];
  state: string;
  orderColoumn?: any;
  selectType?: any;
  _timestamp?: number;
}

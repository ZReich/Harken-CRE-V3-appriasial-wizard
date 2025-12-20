export interface CompsViewGetData{
    data:{
        // data:{
            data:{

             TI_allowance:any;
             TI_allowance_unit:string;
             account_id:number;
             acquirer_id:number | null;
             acquirer_type:string;
             asking_rent:any;
             asking_rent_unit:string;
             building_comments:string;
             building_size:number;
             business_name:string;
             cam:any;
             cap_rate:any;
             city:string;
             comp_type:string;
             comparison_basis:string;
             comps_included_utilities:[],
             concessions:string;
             condition:string;
             confirmed_by:string;
             confirmed_with:string;
             construction_class:string;
             county:string;
             created:string;
             date_commencement:string;
             date_execution:string;
             date_expiration:string;
             date_list:string;
             date_sold:string;
             days_on_market:number;
             effective_age:string;
             escalators:any;
             est_building_value:null | number;
             est_land_value:null  | number;
             financing:string;
             free_rent:number | null;
             frontage:string;
             grantee:string;
             grantor:string;
             gross_building_area:null | number;
             id:number;
             included_utilities:null;
             instrument:string;
             land_dimension:string;
             land_size:number;
             land_type:string;
             last_updated:string;
             latitude:string;
             lease_rate:any;
             lease_rate_unit:string;
             lease_status:string;
             lease_type:string;
             legal_desc:string;
             list_price:any;
             location_desc:string;
             longitude:string;
             lot_shape:string;
             map_pin_lat:string;
             map_pin_lng:string;
             map_pin_zoom:number;
             marketing_time:string;
             net_building_area:null | number;
             net_operating_income:any;
             occupancy:string;
             offeror_id:any;
             offeror_type:string;
             operating_expense_psf:any;
             other_include_utilities:string;
             parcel_id_apn:string;
             parking:string;
             price_square_foot:number;
             private_comp:number;
             property_class:string;
             property_id:number;
             property_image_url:string;
             property_units:[],
             sale_price: any;
             sale_status:string;
             site_access:string;
             site_comments:string;
             site_coverage_percent:number;
             space:number | null;
             state:string;
             stories:string;
             street_address:string;
             street_suite:string;
             summary:string;
             term:null | number;
             topography:string;
             total_concessions:any;
             total_operating_expense:any;
             type:string;
             user_id:number;
             utilities_select:string;
             utilities_text:null ;
             year_built:string;
             year_remodeled:string;
             zipcode:number;
             zoning_type:string;
             zonings:[
                {
                    bed:null | number;
                    comp_id:number;
                    created:string;
                    evaluation_id:null | number;
                    id:number;
                    listing_id:null | number;
                    sq_ft:number;
                    sub_zone:string;
                    unit:null | number;
                    weight_sf:number;
                    zone:string;

                }
             ],
             res_zonings:[
                {
                    basement_finished_sq_ft:null | number;
                    basement_sq_ft:number | null;
                    basement_unfinished_sq_ft:number;
                    gross_living_sq_ft:number;
                    id:number;
                    total_sq_ft:number;
                    sub_zone:string;
                    weight_sf:number;
                    zone:string;

                }
             ],
             res_comp_amenities:[
                {
                    additional_amenities:string,

                }
             ],
             property_name:string,
             basement:string,
             exterior:string,
             roof:string,
             electrical:string,
             plumbing:string,
             heating_cooling:string,
             windows:string,
             bedrooms:string,
             bathrooms:string,
             garage:string,
             fencing:string,
             fireplace:string,
             other_amenities:string,
            //  list_price:string,



            }
        // }
    }
}
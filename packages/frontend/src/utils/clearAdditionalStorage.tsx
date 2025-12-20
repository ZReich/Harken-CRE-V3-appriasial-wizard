export const ClearAdditionalStorage = () =>{
    localStorage.removeItem('property_type');
    localStorage.removeItem('comp_type');
    localStorage.removeItem('start_date');
    localStorage.removeItem('end_date');
    localStorage.removeItem('state');
    localStorage.removeItem('street_address');
    localStorage.removeItem('building_sf_min');
    localStorage.removeItem('building_sf_max');
    localStorage.removeItem('land_sf_min');
    localStorage.removeItem('land_sf_max');
    localStorage.removeItem('cap_rate_max');
    localStorage.removeItem('all');
    localStorage.removeItem('selectedCities');
    localStorage.removeItem('params');
}
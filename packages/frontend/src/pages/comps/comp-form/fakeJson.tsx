interface StateAbbreviationMap {
  [abbreviation: string]: string;
}

export const usa_state: StateAbbreviationMap[] = [
  {
    '': '--Select State--',
    al: 'Alabama',
    ak: 'Alaska',
    az: 'Arizona',
    ar: 'Arkansas',
    ca: 'California',
    co: 'Colorado',
    ct: 'Connecticut',
    de: 'Delaware',
    dc: 'District Of Columbia',
    fl: 'Florida',
    ga: 'Georgia',
    hi: 'Hawaii',
    id: 'Idaho',
    il: 'Illinois',
    in: 'Indiana',
    ia: 'Iowa',
    ks: 'Kansas',
    ky: 'Kentucky',
    la: 'Louisiana',
    me: 'Maine',
    md: 'Maryland',
    ma: 'Massachusetts',
    mi: 'Michigan',
    mn: 'Minnesota',
    ms: 'Mississippi',
    mo: 'Missouri',
    mt: 'Montana',
    ne: 'Nebraska',
    nv: 'Nevada',
    nh: 'New Hampshire',
    nj: 'New Jersey',
    nm: 'New Mexico',
    ny: 'New York',
    nc: 'North Carolina',
    nd: 'North Dakota',
    oh: 'Ohio',
    ok: 'Oklahoma',
    or: 'Oregon',
    pw: 'Palau',
    pa: 'Pennsylvania',
    pr: 'Puerto Rico',
    ri: 'Rhode Island',
    sc: 'South Carolina',
    sd: 'South Dakota',
    tn: 'Tennessee',
    tx: 'Texas',
    ut: 'Utah',
    vt: 'Vermont',
    va: 'Virginia',
    wa: 'Washington',
    wv: 'West Virginia',
    wi: 'Wisconsin',
    wy: 'Wyoming',
  },
];
export const roundingOptions = [
  { value: '', label: 'No rounding' },
  { value: '1000', label: 'Round to $1,000' },
  { value: '5000', label: 'Round to $5,000' },
  { value: '10000', label: 'Round to $10,000' },
  { value: '100000', label: 'Round to $100,000' },
  { value: '1000000', label: 'Round to $1MM' },
];
export const parkingJson = [
  { value: 20, label: 'offStreet' },
  { value: 30, label: 'Shared on Street' },
  { value: 20, label: 'Parking Garage' },
  { value: 30, label: 'Type My Own' },
];

export const parkingTypeJson = [
  { value: 20, label: 'Office' },
  { value: 30, label: 'Retail' },
  { value: 20, label: 'Hospitality' },
  { value: 30, label: 'Special' },
  { value: 30, label: 'Residentail' },
  { value: 30, label: 'Industrial' },
  { value: 30, label: 'Multifamily' },
];

export const subPropertyJson = [];

export const sizeTypeJson = [
  { value: 20, label: 'Office' },
  { value: 30, label: 'Retail' },
];

export const conditionTypeJson = [
  { value: 20, label: 'Poor' },
  { value: 30, label: 'Fair' },
  { value: 20, label: 'Average' },
  { value: 30, label: 'Good' },
  { value: 30, label: 'Very Good' },
  { value: 30, label: 'Excellent' },
  { value: 30, label: 'Type My Own' },
];

export const StateJson = [
  { value: 20, label: 'Colorado' },
  { value: 30, label: 'Delaware' },
  { value: 20, label: 'District of Coloumbia' },
  { value: 30, label: 'Connecticut' },
  { value: 30, label: 'Florida' },
  { value: 30, label: 'Georgia' },
  { value: 30, label: 'Hawaii' },
  { value: 30, label: 'Idahi' },
  { value: 30, label: 'Illinosis' },
  { value: 30, label: 'Indiana' },
];
export const options = [
  { value: 20, label: '20%' },
  { value: 17.5, label: '17.5%' },
  { value: 15, label: '15%' },
  { value: 12.5, label: '12.5%' },
  { value: 10, label: '10%' },
  { value: 7.5, label: '7.5%' },
  { value: 5, label: '5%' },
  { value: 2.5, label: '2.5%' },
  { value: 0, label: '0%' },
  { value: -2.5, label: '-2.5%' },
  { value: -5, label: '-5%' },
  { value: -7.5, label: '-7.5%' },
  { value: -10, label: '-10%' },
  { value: -12.5, label: '-12.5%' },
  { value: -15, label: '-15%' },
  { value: -17.5, label: '-17.5%' },
  { value: -20, label: '-20%' },
  { value: 'custom', label: 'Type my own' },
];
export const propertyTypeJson = [
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'special', label: 'Special' },
  { value: 'residential', label: 'Residential' },
];

export const selectTypeJson = [
  { value: 'building_with_land', label: 'Building(s) with Land' },
  { value: 'land_only', label: 'Land Only' },
];
export const selectTypeJsonBuilding = [
  { value: 'building_with_land', label: 'Building(s) with Land' },
  { value: 'land_only', label: 'Land Only' },
];
export const compType = [
  { value: 'sale', label: 'Sale' },
  { value: 'lease', label: 'Lease' },
];

export const compTypeJson = [
  { value: 'lease', label: 'Leases' },
  { value: 'sale', label: 'Sales' },
];

export const sortingJson = [
  { value: 'street_address', label: 'Name' },
  { value: 'sale_price', label: 'Sale Price' },
  { value: 'building_size', label: 'Building Size' },
  { value: 'land_size', label: 'Land Size' },
  { value: 'date_sold', label: 'Date Sold' },
];

export const RetailpropertyTypeJson = [
  { value: 'show_all', label: 'Show All' },
  { value: 'residential', label: 'Residential' },
];

export const SortingTypeJson = [
  { value: 'asc', label: 'Name - A-Z' },
  { value: 'DESC_0', label: 'Name - Z-A' },
  { value: 'asc_0', label: 'Sale Price - Low to High' },
  { value: 'DESC_1', label: 'Sale Price - High to Low' },
  { value: 'asc_1', label: 'Date Sold - Oldest First' },
  { value: 'DESC_2', label: 'Date Sold - Newest First' },
];
export const SortingTypeJsonLeases = [
  { value: 'asc', label: 'Name - A-Z' },
  { value: 'DESC_0', label: 'Name - Z-A' },
  { value: 'asc_0', label: 'Lease Rate - Low to High' },
  { value: 'DESC_1', label: 'Lease Rate - High to Low' },
  { value: 'asc_1', label: 'Date Leased - Oldest First' },
  { value: 'DESC_2', label: 'Date Leased - Newest First' },
];

export const SortingTypeJsonAppraisal = [
  { value: 'asc', label: 'Name - A-Z' },
  { value: 'DESC_0', label: 'Name - Z-A' },
  { value: 'asc_0', label: 'Client - Low to High' },
  { value: 'DESC_1', label: 'Client - High to Low' },
  { value: 'asc_1', label: 'Address - Low to High' },
  { value: 'DESC_2', label: 'Address - High to Low' },
  { value: 'asc_2', label: 'Building(s) with Land - Low to High' },
  { value: 'DESC_3', label: 'Building(s) with Land - High to Low' },
  { value: 'asc_3', label: 'Approaches - Low to High' },
  { value: 'DESC_4', label: 'Approaches - High to Low' },
];

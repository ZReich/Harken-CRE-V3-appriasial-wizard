import upImage from '../../../../images/up.svg';
import downImage from '../../../../images/down.svg';
import leftRightOuter from '../../../../images/left-right-outer.png';

export enum AreaInfoFields {
  CITY_INFO = 'city_info',
  COUNTY_INFO = 'county_info',
  SALES_ARROW = 'property_summary_sales_arrow',
  VACANCY_ARROW = 'property_summary_vacancy_arrow',
  NET_ABSORPTION_ARROW = 'property_summary_net_absorption_arrow',
  CONSTRUCTION_ARROW = 'property_summary_construction_arrow',
  LEASE_RATES_ARROW = 'property_summary_lease_rates_arrow',
}

export enum MarketTrendLabels {
  SALES = 'Sales',
  VACANCY = 'Vacancy',
  NET_ABSORPTION = 'Net Absorption',
  CONSTRUCTION = 'Construction',
  LEASE_RATES = 'Lease rates',
}

export enum ArrowDirections {
  UP = 'up',
  DOWN = 'down',
  EVEN_FLAT = 'even_flat',
}

export enum Routes1 {
  AERIAL_MAP = '/residential/evaluation-aerialmap',
  INCOME_APPROACH = '/residential/evaluation/income-approch',
  SALES_APPROACH = '/residential/sales-approach',
  COST_APPROACH = '/residential/evaluation/cost-approach',
  EXHIBITS = '/residential/evaluation-exhibits',
}
export enum Routes {
  AERIAL_MAP = '/evaluation-aerialmap',
  INCOME_APPROACH = '/evaluation/income-approch',
  CAP_APPROACH = '/evaluation/cap-approach',
  MULTI_FAMILY_APPROACH = '/evaluation/rent-roll',
  //  RENT_ROLL = '/evaluation/rent-roll',
  SALES_APPROACH = '/evaluation/sales-approach',
  COST_APPROACH = '/evaluation/cost-approach',
  LEASE_APPROACH = '/evaluation/lease-approach',
  EXHIBITS = '/evaluation-exhibits',
}

export enum ApproachTypes {
  INCOME = 'has_income_approach',
  CAP = 'has_cap_approach',
  MULTI_FAMILY = 'has_multi_family_approach',
  SALES = 'has_sales_approach',
  COST = 'has_cost_approach',
  LEASE = 'has_lease_approach',
  RENT_ROLL='has_rent_roll_approach'
}

export const ARROW_IMAGES = {
  [ArrowDirections.UP]: upImage,
  [ArrowDirections.DOWN]: downImage,
  [ArrowDirections.EVEN_FLAT]: leftRightOuter,
};

export const MAX_CHAR_LIMIT = 1200;

export const MARKET_TREND_LABELS = [
  MarketTrendLabels.SALES,
  MarketTrendLabels.VACANCY,
  MarketTrendLabels.NET_ABSORPTION,
  MarketTrendLabels.CONSTRUCTION,
  MarketTrendLabels.LEASE_RATES,
];
const PropertyType = {
  SALES: 'sales',
  LEASES: 'leases',
};

const LeaseRateUnit = {
  YEAR: 'year',
  ACRE_YEAR: 'acre_year',
  MONTH: 'month',
  ACRE_MONTH: 'acre_month',
  ANNUAL: 'annual',
  MONTHLY: 'monthly',
};

const CompType = {
  LAND_ONLY: 'land_only',
  NOT_LAND_ONLY: 'not_land_only',
};

export const setPriceSquareFoot = (values: any, calculateBuildingSize: any) => {
  const type = values.type;
  const leaseRateUnit = values.lease_rate_unit;
  const compType = values.comp_type;
  const landDimension = values.land_dimension;
  const salePrice = values.sale_price
    ? parseFloat(values.sale_price.replace(/[$,]/g, ''))
    : 0;
  let buildingSize = calculateBuildingSize;
  let landSize = values.land_size.replace(/[^0-9.-]/gi, '');
  let leaseRate = values.lease_rate.replace(/[^0-9.-]/gi, '');

  if (landDimension === 'ACRE') {
    landSize *= 43560;
  }

  if (buildingSize === '') {
    buildingSize = 1;
  }

  if (landSize === '') {
    landSize = 1;
  }

  if (leaseRate === '') {
    leaseRate = 0;
  }

  let priceSquareFoot = 0;

  if (type === PropertyType.SALES) {
    if (compType !== CompType.LAND_ONLY) {
      priceSquareFoot = parseFloat((salePrice / buildingSize).toFixed(2));
    } else {
      priceSquareFoot = parseFloat((salePrice / landSize).toFixed(2));
    }
  } else if (type === PropertyType.LEASES) {
    if (leaseRateUnit === LeaseRateUnit.YEAR) {
      priceSquareFoot = leaseRate;
    } else if (leaseRateUnit === LeaseRateUnit.ACRE_YEAR) {
      priceSquareFoot = parseFloat((leaseRate / 43560).toFixed(2));
    } else if (leaseRateUnit === LeaseRateUnit.MONTH) {
      priceSquareFoot = parseFloat((leaseRate * 12).toFixed(2));
    } else if (leaseRateUnit === LeaseRateUnit.ACRE_MONTH) {
      priceSquareFoot = parseFloat(((leaseRate / 43560) * 12).toFixed(2));
    } else if (leaseRateUnit === LeaseRateUnit.ANNUAL) {
      const sizeForAnnual =
        compType !== CompType.LAND_ONLY ? buildingSize : landSize;
      priceSquareFoot = parseFloat((leaseRate / sizeForAnnual).toFixed(2));
    } else if (leaseRateUnit === LeaseRateUnit.MONTHLY) {
      const sizeForMonthly =
        compType !== CompType.LAND_ONLY ? buildingSize : landSize;
      priceSquareFoot = parseFloat(
        ((leaseRate * 12) / sizeForMonthly).toFixed(2)
      );
    }
  }

  return priceSquareFoot;
};

import { CotalityPropertyResponse } from './cotality.service';

interface FieldMapping {
	directMappings: Array<{ cotalityField: string; harkenField: string; notes?: string }>;
	calculatedFields: Array<{ harkenField: string; calculation: string; notes?: string }>;
	unmappedFields: Array<{ cotalityField: string; description: string; potentialUse?: string }>;
}

/**
 * Extract nested property value safely
 */
function getNestedValue(obj: any, path: string): any {
	return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Map Cotality API response to Harken comps table fields
 */
export function mapToCompsFields(cotalityData: CotalityPropertyResponse, documentationOnly = false): FieldMapping | Partial<any> {
	if (documentationOnly) {
		return {
			directMappings: [
				{ cotalityField: 'property.address.oneLine', harkenField: 'street_address', notes: 'Full address line' },
				{ cotalityField: 'property.address.line1', harkenField: 'street_address', notes: 'Street address' },
				{ cotalityField: 'property.address.line2', harkenField: 'street_suite', notes: 'Suite/unit number' },
				{ cotalityField: 'property.address.city', harkenField: 'city', notes: 'City name' },
				{ cotalityField: 'property.address.state', harkenField: 'state', notes: 'State abbreviation' },
				{ cotalityField: 'property.address.postal1', harkenField: 'zipcode', notes: 'ZIP code' },
				{ cotalityField: 'property.address.county', harkenField: 'county', notes: 'County name' },
				{ cotalityField: 'property.identifier.apn', harkenField: 'parcel_id_apn', notes: 'Assessor Parcel Number' },
				{ cotalityField: 'property.location.latitude', harkenField: 'latitude', notes: 'Latitude coordinate' },
				{ cotalityField: 'property.location.longitude', harkenField: 'longitude', notes: 'Longitude coordinate' },
				{ cotalityField: 'property.building.yearBuilt', harkenField: 'year_built', notes: 'Year built' },
				{ cotalityField: 'property.building.size.totalSquareFeet', harkenField: 'building_size', notes: 'Building square footage' },
				{ cotalityField: 'property.lot.size.acres', harkenField: 'land_size', notes: 'Land size in acres (may need conversion)' },
				{ cotalityField: 'property.sale.lastSalePrice', harkenField: 'sale_price', notes: 'Last sale price' },
				{ cotalityField: 'property.sale.lastSaleDate', harkenField: 'date_sold', notes: 'Last sale date' },
				{ cotalityField: 'property.building.propertyType', harkenField: 'property_class', notes: 'Property classification' },
				{ cotalityField: 'property.zoning.code', harkenField: 'zoning_type', notes: 'Zoning code' },
				{ cotalityField: 'property.building.stories', harkenField: 'stories', notes: 'Number of stories' },
				{ cotalityField: 'property.owner.name', harkenField: 'owner_of_record', notes: 'Owner name' },
				{ cotalityField: 'property.sale.grantor', harkenField: 'grantor', notes: 'Grantor name' },
				{ cotalityField: 'property.sale.grantee', harkenField: 'grantee', notes: 'Grantee name' },
			],
			calculatedFields: [
				{ harkenField: 'price_square_foot', calculation: 'sale_price / building_size', notes: 'Price per square foot' },
				{ harkenField: 'map_pin_lat', calculation: 'latitude', notes: 'Map pin latitude' },
				{ harkenField: 'map_pin_lng', calculation: 'longitude', notes: 'Map pin longitude' },
			],
			unmappedFields: [
				{ cotalityField: 'property.identifier.clip', description: 'Cotality unique property identifier', potentialUse: 'Unique identifier for tracking' },
				{ cotalityField: 'property.tax.assessedValue', description: 'Tax assessed value', potentialUse: 'Could be used for cost approach' },
				{ cotalityField: 'property.building.roofType', description: 'Roof type', potentialUse: 'Building characteristics' },
				{ cotalityField: 'property.building.exteriorWalls', description: 'Exterior wall material', potentialUse: 'Building characteristics' },
			],
		};
	}

	// Actual mapping
	const property = cotalityData?.property || {};
	const mapped: Partial<any> = {};

	// Address fields
	if (getNestedValue(property, 'address.oneLine')) {
		mapped.street_address = getNestedValue(property, 'address.oneLine');
	} else if (getNestedValue(property, 'address.line1')) {
		mapped.street_address = getNestedValue(property, 'address.line1');
	}
	mapped.street_suite = getNestedValue(property, 'address.line2') || null;
	mapped.city = getNestedValue(property, 'address.city') || null;
	mapped.state = getNestedValue(property, 'address.state') || null;
	mapped.zipcode = getNestedValue(property, 'address.postal1') || null;
	mapped.county = getNestedValue(property, 'address.county') || null;

	// Location fields
	mapped.parcel_id_apn = getNestedValue(property, 'identifier.apn') || null;
	mapped.latitude = getNestedValue(property, 'location.latitude')?.toString() || null;
	mapped.longitude = getNestedValue(property, 'location.longitude')?.toString() || null;
	mapped.map_pin_lat = mapped.latitude;
	mapped.map_pin_lng = mapped.longitude;

	// Building characteristics
	mapped.year_built = getNestedValue(property, 'building.yearBuilt')?.toString() || null;
	mapped.building_size = getNestedValue(property, 'building.size.totalSquareFeet') || null;
	mapped.property_class = getNestedValue(property, 'building.propertyType') || null;
	mapped.stories = getNestedValue(property, 'building.stories')?.toString() || null;
	mapped.construction_class = getNestedValue(property, 'building.constructionType') || null;

	// Land characteristics
	const acres = getNestedValue(property, 'lot.size.acres');
	if (acres) {
		// Convert acres to square feet (1 acre = 43,560 sq ft)
		mapped.land_size = acres * 43560;
	}
	mapped.frontage = getNestedValue(property, 'lot.frontage')?.toString() || null;

	// Sale data
	mapped.sale_price = getNestedValue(property, 'sale.lastSalePrice') || null;
	const saleDate = getNestedValue(property, 'sale.lastSaleDate');
	if (saleDate) {
		mapped.date_sold = saleDate;
	}

	// Calculate price per square foot
	if (mapped.sale_price && mapped.building_size && mapped.building_size > 0) {
		mapped.price_square_foot = mapped.sale_price / mapped.building_size;
	}

	// Owner data
	mapped.owner_of_record = getNestedValue(property, 'owner.name') || null;
	mapped.grantor = getNestedValue(property, 'sale.grantor') || null;
	mapped.grantee = getNestedValue(property, 'sale.grantee') || null;

	// Zoning
	mapped.zoning_type = getNestedValue(property, 'zoning.code') || null;

	return mapped;
}

/**
 * Map fields relevant for Sales Comparison Approach
 */
export function mapToSalesApproachFields(cotalityData: CotalityPropertyResponse, documentationOnly = false): FieldMapping | Partial<any> {
	if (documentationOnly) {
		return {
			directMappings: [
				{ cotalityField: 'property.sale.lastSalePrice', harkenField: 'sale_price', notes: 'Sale price for comparison' },
				{ cotalityField: 'property.sale.lastSaleDate', harkenField: 'date_sold', notes: 'Sale date for time adjustments' },
				{ cotalityField: 'property.building.size.totalSquareFeet', harkenField: 'building_size', notes: 'Building size for SF comparison' },
				{ cotalityField: 'property.lot.size.acres', harkenField: 'land_size', notes: 'Land size for comparison' },
				{ cotalityField: 'property.building.yearBuilt', harkenField: 'year_built', notes: 'Age for condition adjustments' },
				{ cotalityField: 'property.building.propertyType', harkenField: 'property_class', notes: 'Property type for comparability' },
				{ cotalityField: 'property.location.latitude', harkenField: 'latitude', notes: 'Location for proximity analysis' },
				{ cotalityField: 'property.location.longitude', harkenField: 'longitude', notes: 'Location for proximity analysis' },
			],
			calculatedFields: [
				{ harkenField: 'price_square_foot', calculation: 'sale_price / building_size', notes: 'Price per SF for comparison' },
			],
			unmappedFields: [
				{ cotalityField: 'property.sale.saleHistory', description: 'Multiple sale records', potentialUse: 'Historical sales for trend analysis' },
				{ cotalityField: 'property.building.condition', description: 'Property condition', potentialUse: 'Condition adjustments' },
				{ cotalityField: 'property.building.quality', description: 'Building quality grade', potentialUse: 'Quality adjustments' },
			],
		};
	}

	const compsMapped = mapToCompsFields(cotalityData);
	return {
		sale_price: compsMapped.sale_price,
		date_sold: compsMapped.date_sold,
		building_size: compsMapped.building_size,
		land_size: compsMapped.land_size,
		year_built: compsMapped.year_built,
		property_class: compsMapped.property_class,
		price_square_foot: compsMapped.price_square_foot,
		latitude: compsMapped.latitude,
		longitude: compsMapped.longitude,
	};
}

/**
 * Map fields relevant for Cost Approach
 */
export function mapToCostApproachFields(cotalityData: CotalityPropertyResponse, documentationOnly = false): FieldMapping | Partial<any> {
	if (documentationOnly) {
		return {
			directMappings: [
				{ cotalityField: 'property.building.yearBuilt', harkenField: 'year_built', notes: 'Year built for age calculation' },
				{ cotalityField: 'property.building.constructionType', harkenField: 'construction_class', notes: 'Construction type for cost estimation' },
				{ cotalityField: 'property.building.size.totalSquareFeet', harkenField: 'building_size', notes: 'Building size for cost calculation' },
				{ cotalityField: 'property.lot.size.acres', harkenField: 'land_size', notes: 'Land size for land value' },
				{ cotalityField: 'property.building.stories', harkenField: 'stories', notes: 'Number of stories' },
			],
			calculatedFields: [
				{ harkenField: 'effective_age', calculation: 'Current year - year_built', notes: 'Effective age calculation' },
			],
			unmappedFields: [
				{ cotalityField: 'property.building.roofType', description: 'Roof type', potentialUse: 'Replacement cost estimation' },
				{ cotalityField: 'property.building.exteriorWalls', description: 'Exterior wall material', potentialUse: 'Replacement cost estimation' },
				{ cotalityField: 'property.building.heatingType', description: 'Heating system type', potentialUse: 'Replacement cost estimation' },
				{ cotalityField: 'property.building.coolingType', description: 'Cooling system type', potentialUse: 'Replacement cost estimation' },
				{ cotalityField: 'property.improvements', description: 'Improvement details', potentialUse: 'Cost approach improvements' },
			],
		};
	}

	const compsMapped = mapToCompsFields(cotalityData);
	const currentYear = new Date().getFullYear();
	const yearBuilt = compsMapped.year_built ? parseInt(compsMapped.year_built.toString()) : null;

	return {
		year_built: compsMapped.year_built,
		construction_class: compsMapped.construction_class,
		building_size: compsMapped.building_size,
		land_size: compsMapped.land_size,
		stories: compsMapped.stories,
		effective_age: yearBuilt ? (currentYear - yearBuilt).toString() : null,
		gross_building_area: compsMapped.building_size,
	};
}

/**
 * Map fields relevant for Income Approach
 */
export function mapToIncomeApproachFields(cotalityData: CotalityPropertyResponse, documentationOnly = false): FieldMapping | Partial<any> {
	if (documentationOnly) {
		return {
			directMappings: [
				{ cotalityField: 'property.income.netOperatingIncome', harkenField: 'net_operating_income', notes: 'NOI if available' },
				{ cotalityField: 'property.income.grossIncome', harkenField: 'gross_income', notes: 'Gross income if available' },
				{ cotalityField: 'property.building.size.totalSquareFeet', harkenField: 'building_size', notes: 'Building size for income per SF' },
			],
			calculatedFields: [
				{ harkenField: 'cap_rate', calculation: 'net_operating_income / sale_price', notes: 'Cap rate calculation' },
				{ harkenField: 'operating_expense_psf', calculation: 'operating_expenses / building_size', notes: 'Operating expense per SF' },
			],
			unmappedFields: [
				{ cotalityField: 'property.income.rentalIncome', description: 'Rental income data', potentialUse: 'Income approach income sources' },
				{ cotalityField: 'property.expenses.propertyTax', description: 'Property tax expenses', potentialUse: 'Operating expenses' },
				{ cotalityField: 'property.expenses.insurance', description: 'Insurance expenses', potentialUse: 'Operating expenses' },
				{ cotalityField: 'property.occupancy.occupancyRate', description: 'Occupancy rate', potentialUse: 'Vacancy calculation' },
			],
		};
	}

	const property = cotalityData?.property || {};
	const compsMapped = mapToCompsFields(cotalityData);

	const noi = getNestedValue(property, 'income.netOperatingIncome');
	const grossIncome = getNestedValue(property, 'income.grossIncome');
	const operatingExpenses = getNestedValue(property, 'expenses.totalOperatingExpenses');

	const result: Partial<any> = {
		building_size: compsMapped.building_size,
		net_operating_income: noi || null,
	};

	if (compsMapped.sale_price && noi) {
		result.cap_rate = noi / compsMapped.sale_price;
	}

	if (operatingExpenses && compsMapped.building_size && compsMapped.building_size > 0) {
		result.operating_expense_psf = operatingExpenses / compsMapped.building_size;
		result.total_operating_expense = operatingExpenses;
	}

	return result;
}

/**
 * Map fields relevant for Lease Comps Approach
 */
export function mapToLeaseApproachFields(cotalityData: CotalityPropertyResponse, documentationOnly = false): FieldMapping | Partial<any> {
	if (documentationOnly) {
		return {
			directMappings: [
				{ cotalityField: 'property.lease.leaseRate', harkenField: 'lease_rate', notes: 'Lease rate if available' },
				{ cotalityField: 'property.lease.leaseTerm', harkenField: 'term', notes: 'Lease term in months' },
				{ cotalityField: 'property.building.size.totalSquareFeet', harkenField: 'building_size', notes: 'Leased space size' },
			],
			calculatedFields: [
				{ harkenField: 'lease_rate', calculation: 'rentalIncome / building_size', notes: 'Lease rate per SF if rental income available' },
			],
			unmappedFields: [
				{ cotalityField: 'property.lease.leaseType', description: 'Lease type (Gross, Net, NNN)', potentialUse: 'Lease type comparison' },
				{ cotalityField: 'property.lease.concessions', description: 'Lease concessions', potentialUse: 'Concessions adjustments' },
				{ cotalityField: 'property.lease.tenantImprovements', description: 'TI allowance', potentialUse: 'TI allowance comparison' },
				{ cotalityField: 'property.lease.escalations', description: 'Rent escalations', potentialUse: 'Escalation analysis' },
			],
		};
	}

	const property = cotalityData?.property || {};
	const compsMapped = mapToCompsFields(cotalityData);

	const leaseRate = getNestedValue(property, 'lease.leaseRate');
	const leaseTerm = getNestedValue(property, 'lease.leaseTerm');
	const rentalIncome = getNestedValue(property, 'income.rentalIncome');

	const result: Partial<any> = {
		building_size: compsMapped.building_size,
		lease_rate: leaseRate || null,
		term: leaseTerm || null,
	};

	// Calculate lease rate per SF if rental income is available
	if (rentalIncome && compsMapped.building_size && compsMapped.building_size > 0) {
		result.lease_rate = rentalIncome / compsMapped.building_size;
	}

	return result;
}

/**
 * Map fields relevant for Cap Rate Approach
 */
export function mapToCapRateApproachFields(cotalityData: CotalityPropertyResponse, documentationOnly = false): FieldMapping | Partial<any> {
	if (documentationOnly) {
		return {
			directMappings: [
				{ cotalityField: 'property.sale.lastSalePrice', harkenField: 'sale_price', notes: 'Sale price for cap rate extraction' },
				{ cotalityField: 'property.income.netOperatingIncome', harkenField: 'net_operating_income', notes: 'NOI for cap rate calculation' },
				{ cotalityField: 'property.building.size.totalSquareFeet', harkenField: 'building_size', notes: 'Building size' },
			],
			calculatedFields: [
				{ harkenField: 'cap_rate', calculation: 'net_operating_income / sale_price', notes: 'Cap rate extraction' },
			],
			unmappedFields: [
				{ cotalityField: 'property.occupancy.occupancyRate', description: 'Occupancy rate', potentialUse: 'Risk factor for cap rate adjustments' },
				{ cotalityField: 'property.location.quality', description: 'Location quality grade', potentialUse: 'Risk factor for cap rate adjustments' },
				{ cotalityField: 'property.building.condition', description: 'Property condition', potentialUse: 'Risk factor for cap rate adjustments' },
				{ cotalityField: 'property.tenant.creditRating', description: 'Tenant credit rating', potentialUse: 'Risk factor for cap rate adjustments' },
			],
		};
	}

	const property = cotalityData?.property || {};
	const compsMapped = mapToCompsFields(cotalityData);

	const noi = getNestedValue(property, 'income.netOperatingIncome');
	const salePrice = compsMapped.sale_price;

	const result: Partial<any> = {
		sale_price: salePrice,
		net_operating_income: noi || null,
		building_size: compsMapped.building_size,
	};

	if (salePrice && noi && salePrice > 0) {
		result.cap_rate = noi / salePrice;
	}

	return result;
}



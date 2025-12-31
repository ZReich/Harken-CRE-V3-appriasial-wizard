import { EvaluationReportEnum } from '../enums/CommonEnum';
import CompsEnum from '../enums/CompsEnum';
import { EvaluationsEnum } from '../enums/EvaluationsEnum';

export function toCurrency(val: number = 0): string {
	const prefix = val >= 0 ? '$' : '-$';
	return (
		prefix +
		Number(val >= 0 ? val : val * -1).toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	);
}

export function toPercentage(val: number | string): string {
	const num = parseFloat((val || 0) as string);
	return numberFormat(num, 2, '.', ',') + '%';
}

export function checkDimensions(
	comp_type: string,
	analysis_type: string,
	comparison_basis: string,
): string {
	let dimension = ' PSF';
	if (comp_type === CompsEnum.LAND_ONLY && analysis_type === EvaluationsEnum.PRICE_ACRE) {
		dimension = EvaluationReportEnum.PER_AC;
	} else if (comparison_basis !== CompsEnum.SF) {
		dimension = '/' + comparison_basis;
	}
	return dimension;
}

export function getEvalPriceSFeet(
	rounded_value: number,
	comparison_basis: string,
	building_size: number,
): string {
	let price_sf = '';
	if (comparison_basis !== CompsEnum.SF) {
		const weighted_val = rounded_value;
		if (building_size > 0) {
			price_sf = ' or ' + toCurrency(weighted_val / building_size) + EvaluationReportEnum.PER_SF;
		}
	}
	return price_sf;
}

export function getRoundedPSFValue(
	comp_type: string,
	land_size: number,
	land_dimension: string,
	analysis_type: string,
	rounded_value: number,
	comparison_basis: string,
	building_size: number,
	zonings?: any[],
): number {
	if (comp_type === CompsEnum.LAND_ONLY) {
		let landSize = land_size;
		if (land_size > 0) {
			if (land_dimension === CompsEnum.ACRE && analysis_type !== EvaluationsEnum.PRICE_ACRE) {
				landSize = land_size * 43560;
			}
		} else if (land_size === 0) {
			return 0;
		}
		return landSize ? rounded_value / Number(landSize) : 0;
	} else {
		if (comparison_basis !== CompsEnum.SF) {
			let totalSqft = 0;
			if (zonings && zonings.length > 0) {
				const key = comparison_basis.toLowerCase().replace(/ /g, '_');
				totalSqft = zonings.reduce((sum, z) => sum + (z[key] || 0), 0);
			}
			return totalSqft ? rounded_value / Number(totalSqft) : 0.0;
		} else if (building_size > 0) {
			return rounded_value / Number(building_size);
		} else {
			return 0.0;
		}
	}
}

export function getExecutiveSummary(
	summary: string | null,
	data: any[] = [],
	lang?: { executive_summary: string; link_executive_summary: string },
): string {
	if (!summary) {
		summary = lang?.executive_summary || '';
	} else if (summary === EvaluationReportEnum.LINK) {
		summary = lang?.link_executive_summary || '';
	}

	if (!summary) return '';

	data.forEach((val, i) => {
		summary = (summary ?? '').replace(new RegExp(`\\{${i}\\}`, 'g'), val);
	});

	return summary;
}

export function getRoundedValue(totalIncrementalValue: number, rounding: number): number {
	if (rounding === 0) {
		return totalIncrementalValue;
	} else {
		if (rounding === 5000) {
			return Math.round(totalIncrementalValue / rounding) * rounding;
		} else {
			// Negative rounding means round to the nearest 10, 100, 1000, etc.
			// Example: rounding = 2 => -2, so Math.round(val, -2) rounds to nearest 100
			// In JS, use: Math.round(val / 10^n) * 10^n
			const factor = Math.pow(10, Math.abs(rounding));
			return Math.round(totalIncrementalValue / factor) * factor;
		}
	}
}

export function formatDate(
	dateToformat: string | Date | undefined,
	view: boolean = false,
): string | Date | undefined {
	if (view) {
		if (dateToformat) {
			// Format date as "Mon D, YYYY"
			const date = new Date(dateToformat);
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
		} else {
			return 'Unknown';
		}
	} else {
		return dateToformat;
	}
}

export function maskArea(val: number, unit: string, decimals: number = 0): string {
	return `${val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${unit}`;
}

export function getLandSize(
	land_size: number | undefined,
	comp_type: string,
	analysis_type: string,
	land_dimension: string,
	view: boolean = false,
	maskArea: (val: number, unit: string, decimals?: number) => string,
): string | number | undefined {
	if (view) {
		if (land_size !== undefined && land_size !== null) {
			if (
				(comp_type === CompsEnum.LAND_ONLY && analysis_type === EvaluationsEnum.PRICE_ACRE) ||
				(comp_type !== CompsEnum.LAND_ONLY && land_dimension === CompsEnum.ACRE)
			) {
				return maskArea(land_size, CompsEnum.AC, 3);
			} else if (land_dimension === CompsEnum.ACRE) {
				return maskArea(land_size * 43560, CompsEnum.SF);
			} else {
				return maskArea(land_size, CompsEnum.SF);
			}
		} else {
			return '';
		}
	} else {
		return land_size;
	}
}
export function numberFormat(
	number: number,
	decimals: number = 0,
	dec_point: string = '.',
	thousands_sep: string = ',',
): string {
	if (typeof number !== 'number' || isNaN(number)) {
		return '';
	}
	if (!isFinite(number)) number = 0;
	const fixed = number.toFixed(decimals);
	const parts = fixed.split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);
	return parts.length > 1 ? parts.join(dec_point) : parts[0];
}

export function getNotAvailableLabel(): string {
	return EvaluationReportEnum.NOT_AVAILABLE;
}

export function getLandAssessmentPSF(
	land_assessment: number,
	land_size: number,
	land_dimension: string,
	comp_type: string,
	analysis_type: string,
	view: boolean = false,
): string | number {
	if (view) {
		if (land_assessment === 0) {
			return 0;
		} else {
			if (land_size > 0) {
				let landSize = land_size;
				if (
					land_dimension === CompsEnum.ACRE &&
					!(comp_type === CompsEnum.LAND_ONLY && analysis_type === EvaluationsEnum.PRICE_ACRE)
				) {
					landSize = landSize * 43560;
				}
				const total = parseFloat(numberFormat(land_assessment / landSize, 2, '.', ''));
				if (total === 0) {
					return 0;
				} else {
					return toCurrency(total);
				}
			} else {
				return EvaluationReportEnum.NOT_AVAILABLE;
			}
		}
	} else {
		return land_assessment;
	}
}

export function getStructureAssessmentPSF(
	structure_assessment: number,
	land_size: number,
	land_dimension: string,
	analysis_type: string,
	comp_type: string,
	building_size: number,
	view: boolean = false,
): string | number {
	if (view) {
		if (structure_assessment === 0) {
			return 0;
		} else {
			if (comp_type === CompsEnum.LAND_ONLY && land_size > 0) {
				let landSize = land_size;
				if (land_dimension === CompsEnum.ACRE && analysis_type !== EvaluationsEnum.PRICE_ACRE) {
					landSize = landSize * 43560;
				}
				return toCurrency(structure_assessment / landSize);
			}
			if (building_size > 0) {
				return toCurrency(structure_assessment / building_size);
			} else {
				return EvaluationReportEnum.NOT_AVAILABLE;
			}
		}
	} else {
		return structure_assessment;
	}
}

export function getTotalAssessment(
	land_assessment: number,
	structure_assessment: number,
	view: boolean = false,
): string | number {
	if (view) {
		const land: number = Number(land_assessment) === 0 ? 0 : Number(land_assessment);
		const structure: number = Number(structure_assessment) === 0 ? 0 : Number(structure_assessment);
		const total = parseFloat(numberFormat(land + structure, 2, '.', ''));
		if (total === 0) {
			return 0;
		} else {
			return toCurrency(total);
		}
	} else {
		return land_assessment + structure_assessment;
	}
}

export function getTotalAssessmentPSF(
	land_assessment: number,
	structure_assessment: number,
	comp_type: string,
	land_size: number,
	land_dimension: string,
	analysis_type: string,
	building_size: number,
	view: boolean = false,
): string | number {
	if (view) {
		const land: number = Number(land_assessment) === 0 ? 0 : Number(land_assessment);
		const structure: number = Number(structure_assessment) === 0 ? 0 : Number(structure_assessment);

		if (comp_type === CompsEnum.LAND_ONLY && land_size > 0) {
			let landSize: number = land_size;
			if (land_dimension === CompsEnum.ACRE && analysis_type !== EvaluationsEnum.PRICE_ACRE) {
				landSize = landSize * 43560;
			}
			const total = parseFloat(numberFormat((land + structure) / landSize, 2, '.', ''));
			if (total === 0) {
				return 0;
			} else {
				return toCurrency(total);
			}
		} else if (building_size > 0) {
			const total = parseFloat(numberFormat((land + structure) / building_size, 2, '.', ''));
			if (total === 0) {
				return 0;
			} else {
				return toCurrency(total);
			}
		} else {
			return EvaluationReportEnum.NOT_AVAILABLE;
		}
	} else {
		return land_assessment + structure_assessment;
	}
}

export function getData(data: any[], key?: string | null): any {
	if (key == null) {
		// Return object with all key-value pairs
		return data.reduce(
			(acc, item) => {
				acc[item.name] = item.value;
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	const directKeys = [
		'property-summary-sales-arrow',
		'property-summary-vacancy-arrow',
		'property-summary-net-absorption-arrow',
		'property-summary-construction-arrow',
		'property-summary-lease-rates-arrow',
		'county-info',
		'city-info',
		'property_summary_sales_arrow',
		'property_summary_vacancy_arrow',
		'property_summary_net_absorption_arrow',
		'property_summary_construction_arrow',
		'property_summary_lease_rates_arrow',
		'county_info',
		'city_info',
	];

	if (directKeys.includes(key)) {
		const found = data.find((d) => d.name === key);
		if (found) {
			return found.value;
		}
	}

	return false;
}

export function getArrowImage(direction: string): string {
	if (direction === 'up') {
		return '/images/up.svg';
	} else if (direction === 'down') {
		return '/images/down.svg';
	} else if (direction === 'right' || direction === 'left' || direction === 'even_flat') {
		return '/images/left-right-outer.png';
	} else if (direction === 'up_down') {
		return '/images/report/arrows/up_down.svg';
	}
	return '';
}

export function filterByType(data, type: string) {
	return data.filter((entry) => entry.type === type);
}

export function to_area(val) {
	return numberFormat(parseFloat(val)) + ' SF';
}

export function getArrayValue(
	key: string,
	arr: Record<string, any>,
	defaultValue: any = null,
	currency: boolean = false,
): any {
	if (arr && Object.prototype.hasOwnProperty.call(arr, key)) {
		if (currency) {
			return toCurrency(arr[key]);
		} else {
			return arr[key];
		}
	}

	if (currency) {
		return toCurrency(defaultValue);
	} else {
		return defaultValue;
	}
}

export function getLeaseCompsNotes(): string {
	return `<p><strong>Even:</strong> No Adjustment, Similar to Subject Property. <strong class="salesminus">Minus:</strong> Downward adjustment, Better than/Superior to Subject Property. <strong class="salesplus">Plus:</strong> Upward Adjustment, Poorer than/Inferior to Subject Property.</p>`;
}

export function getMultiFamilyNotes(): string {
	return '<p><strong>Even:</strong> No Adjustment, Similar to Subject Property. <strong class="salesminus">Minus:</strong> Downward adjustment, Better than/Superior to Subject Property. <strong class="salesplus">Plus:</strong> Upward Adjustment, Poorer than/Inferior to Subject Property.</p>';
}

export function getSaleNotes(): string {
	return '<p><strong>Even:</strong> No Adjustment, Similar to Subject Property. <strong class="salesminus">Minus:</strong> Downward adjustment, Better than/Superior to Subject Property. <strong class="salesplus">Plus:</strong> Upward Adjustment, Poorer than/Inferior to Subject Property.</p>';
}

export function getInputValue(
	data: Record<string, any>,
	attribute: string,
	defaultValue: any = null,
	multiplier: number | null = null,
): any {
	if (data.hasOwnProperty(attribute)) {
		const value = data[attribute];
		if (multiplier !== null && !isNaN(multiplier) && !isNaN(parseFloat(value))) {
			return multiplier * parseFloat(value);
		} else if (attribute === EvaluationReportEnum.COMMENTS) {
			return value;
		} else if (value === null || value === undefined) {
			return 0;
		} else {
			return value;
		}
	} else {
		return defaultValue;
	}
}

export function getTotals(
	totals: Record<string, any>,
	obj: Record<string, any>,
	key?: string,
): any {
	if (key) {
		if (totals && Object.prototype.hasOwnProperty.call(totals, key)) {
			return totals[key];
		} else if (obj && obj[key] !== undefined) {
			return obj[key];
		} else {
			return undefined;
		}
	} else {
		return totals;
	}
}

export function psf() {
	return EvaluationReportEnum.PER_SF;
}

export function toPsf(val) {
	return toCurrency(val) + psf();
}

export function getWeightedMarketValuePSF(
	weighted_market_value: number | undefined,
	comp_type: string | undefined,
	land_size: number | undefined,
	land_dimension: string | undefined,
	analysis_type: string | undefined,
	building_size: number | undefined,
	comparison_basis: string | undefined,
	zonings: any[] | undefined,
	incremental_value: number,
	view: boolean = false,
): string | number {
	let val = 0;
	if (weighted_market_value !== undefined) {
		if (comp_type === CompsEnum.LAND_ONLY) {
			if (land_size && land_size > 0) {
				let landSize = land_size;
				if (land_dimension === CompsEnum.ACRE && analysis_type !== EvaluationsEnum.PRICE_ACRE) {
					landSize = Math.round(land_size * 43560 * 100) / 100;
				} else {
					landSize = Math.round(land_size * 100) / 100;
				}
				val = landSize ? incremental_value / landSize : 0;
			}
		} else if (building_size !== undefined) {
			val = weighted_market_value / (building_size > 0 ? building_size : 1);
			if (comparison_basis && comparison_basis !== CompsEnum.SF) {
				let totalSqft = 0;
				if (zonings && zonings.length > 0) {
					const key = comparison_basis.toLowerCase().replace(/ /g, '_');
					totalSqft = zonings.reduce((sum, z) => sum + (z[key] || 0), 0);
				}
				val = totalSqft ? weighted_market_value / totalSqft : 0;
			}
		}
	}

	if (view) {
		let dimension = '';
		if (comp_type === CompsEnum.LAND_ONLY && analysis_type === EvaluationsEnum.PRICE_ACRE) {
			dimension = EvaluationReportEnum.PER_AC;
		} else if (comparison_basis) {
			dimension = '/' + comparison_basis;
		}
		return toCurrency(val) + dimension;
	}
	return val;
}

export function getRoundedWeightedValue(
	weighted_market_value: number | undefined,
	rounding: number | undefined,
): number | undefined {
	if (rounding !== undefined && rounding === 0 && weighted_market_value !== undefined) {
		return weighted_market_value;
	} else if (weighted_market_value !== undefined && rounding !== undefined) {
		if (rounding === 5000) {
			return Math.round(weighted_market_value / rounding) * rounding;
		} else {
			// Negative rounding means round to the nearest 10, 100, 1000, etc.
			// Example: rounding = 2 => -2, so Math.round(val, -2) rounds to nearest 100
			const factor = Math.pow(10, Math.abs(rounding));
			return Math.round(weighted_market_value / factor) * factor;
		}
	}
	return undefined;
}

export function getRoundedWeightedMarketPSF(
	comp_type: string,
	land_size: number,
	land_dimension: string,
	analysis_type: string,
	comparison_basis: string,
	building_size: number | undefined,
	zonings: any[] | undefined,
	rounded_weighted_value: number,
): number {
	if (comp_type === CompsEnum.LAND_ONLY && land_size > 0) {
		let landSize = land_size;
		if (land_dimension === CompsEnum.ACRE && analysis_type !== EvaluationsEnum.PRICE_ACRE) {
			landSize = landSize * 43560;
		}
		return rounded_weighted_value / landSize;
	} else {
		if (comparison_basis !== CompsEnum.SF) {
			let totalSqft = 0;
			if (zonings && zonings.length > 0) {
				const key = comparison_basis.toLowerCase().replace(/ /g, '_');
				totalSqft = zonings.reduce((sum, z) => sum + (z[key] || 0), 0);
			}
			return totalSqft ? rounded_weighted_value / totalSqft : 0;
		} else if (building_size !== undefined) {
			return building_size ? rounded_weighted_value / building_size : 0;
		} else {
			return 0.0;
		}
	}
}

export function toTitleCaseWithSpaces(str: string): string {
	return str
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function formatDateFormat(value: Date | string | number) {
	if (!value) {
		return getNotAvailableLabel();
	}
	const originalDate = new Date(value);
	const month = String(originalDate.getMonth() + 1).padStart(2, '0');
	const date = String(originalDate.getDate()).padStart(2, '0');
	const year = originalDate.getFullYear();
	return `${month}/${date}/${year}`;
}

export function getSubOptionNameByCode(options, subCode) {
	for (const option of options) {
		const sub = option.sub_options?.find((s) => s?.code === subCode);
		if (sub) return sub?.name;
	}
	return subCode || 'N/A';
}
export function capitalizeFirstLetter(str) {
	if (typeof str !== 'string') return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

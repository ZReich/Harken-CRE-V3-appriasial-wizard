export interface IIncomeSource {
	id: number;
	appraisal_income_approach_id: number;
	zoning_id: number;
	link_overview: number;
	type: string;
	space: string;
	monthly_income: number;
	annual_income: number;
	rent_unit: number;
	unit: number;
	rent_sq_ft: number;
	square_feet: number;
	rent_bed: number;
	bed: number;
	sf_source: number;
	comments: string;
}

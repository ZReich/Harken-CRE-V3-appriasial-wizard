export interface IResIncomeSource {
	id: number;
	res_evaluation_income_approach_id: number;
	res_zoning_id: number;
	type: string;
	space: string;
	monthly_income: number;
	annual_income: number;
	rent_sq_ft: number;
	square_feet: number;
	comments: string;
	link_overview: number;
}

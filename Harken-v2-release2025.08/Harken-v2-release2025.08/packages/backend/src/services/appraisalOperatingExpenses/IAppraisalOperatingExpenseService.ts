export interface IOperatingExpense {
	id: number;
	appraisal_income_approach_id: number;
	name: string;
	annual_amount: number;
	percentage_of_gross: number;
	total_per_bed: number;
	total_per_unit: number;
	total_per_sq_ft: number;
	comments: string;
}

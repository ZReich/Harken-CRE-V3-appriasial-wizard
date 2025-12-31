export interface ICostImprovements {
	id?: number;
	res_evaluation_cost_approach_id?: number;
	zoning_id: number;
	type: string;
	sf_area: number;
	rsm_code: number;
	adjusted_psf: number;
	depreciation: number;
	adjusted_cost: number;
	depreciation_amount: number;
	structure_cost: number;
	subject_lf: number;
	comp_base: number;
	comp_lf: number;
	perimeter_adj: number;
	location_adj: number;
}

export interface ICostImprovements {
	id?: number;
	evaluation_cost_approach_id?: number;
	zoning_id: number;
	type: string;
	sf_area: number;
	adjusted_psf: number;
	depreciation: number;
	adjusted_cost: number;
	depreciation_amount: number;
	structure_cost: number;
}

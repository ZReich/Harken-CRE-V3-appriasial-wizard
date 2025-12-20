export default interface IResZoning {
	id?: number;
	res_comp_id?: number;
	res_evaluation_id?: number;
	res_zoning_id?: number;
	zone: string;
	sub_zone: string;
	sub_zone_custom?: string;
	total_sq_ft: number;
	gross_living_sq_ft: number;
	basement_finished_sq_ft: number;
	basement_unfinished_sq_ft: number;
	weight_sf: number;
	created: Date;
}

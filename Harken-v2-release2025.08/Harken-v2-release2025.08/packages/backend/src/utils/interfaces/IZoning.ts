export default interface IZoning {
	id?: number;
	listing_id?: number;
	comp_id?: number;
	evaluation_id?: number;
	appraisal_id?: number;
	zone: string;
	sub_zone: string;
	sub_zone_custom?: string;
	sq_ft: number;
	unit?: number;
	bed?: number;
	weight_sf?: number;
}

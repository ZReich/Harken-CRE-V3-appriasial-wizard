export default interface IRentRolls {
	id?: number;
	beds?: number;
	baths?: number;
	sq_ft?: number;
	unit_count?: number;
	avg_monthly_rent?: number;
	rent?: number;
	unit?: string;
	tenant_exp?: string;
	description?: string;
	lease_expiration?: string;
	appraisal_rent_roll_type_id?: number;
}

export interface IRentRollHtml {
	appraisalApproachId: number;
	appraisalId: number;
}

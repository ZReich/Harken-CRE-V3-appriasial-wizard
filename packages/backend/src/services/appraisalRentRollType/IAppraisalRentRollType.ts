import IRentRolls from '../appraisalRentRolls/IRentRolls';

export default interface IRentRollType {
	id?: number;
	appraisal_approach_id?: number;
	type: string;
	rent_rolls: IRentRolls[];
}

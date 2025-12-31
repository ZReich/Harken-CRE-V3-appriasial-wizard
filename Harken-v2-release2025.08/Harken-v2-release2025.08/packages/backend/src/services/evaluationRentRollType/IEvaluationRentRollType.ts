import IRentRolls from '../evaluationRentRolls/IRentRolls';

export default interface IRentRollType {
	id?: number;
	evaluation_scenario_id: number;
	type: string;
	rent_rolls: IRentRolls[];
}

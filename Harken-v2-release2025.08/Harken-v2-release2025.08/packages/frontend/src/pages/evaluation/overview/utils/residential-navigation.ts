import { ApproachTypes, Routes1 } from '../constants/area-info.constants';

export const findNextRoute1 = (scenarios: any[], id: string | null) => {
  if (!scenarios || !Array.isArray(scenarios) || !id) {
    return `${Routes1.EXHIBITS}?id=${id}`;
  }

  // Function to find first scenario with specific approach
  const findFirstScenario = (approachType: string) => {
    return scenarios.find((scenario: any) => scenario[approachType] === 1);
  };

  // Check approaches in order of priority
  const approachChecks = [
    { type: ApproachTypes.INCOME, route: Routes1.INCOME_APPROACH, param: 'IncomeId' },
    { type: ApproachTypes.SALES, route: Routes1.SALES_APPROACH, param: 'salesId' },
    { type: ApproachTypes.COST, route: Routes1.COST_APPROACH, param: 'costId' },
  ];

  for (const check of approachChecks) {
    const scenario = findFirstScenario(check.type);
    if (scenario) {
      return `${check.route}?id=${id}&${check.param}=${scenario.id}`;
    }
  }

  // If no approaches found
  return `${Routes1.EXHIBITS}?id=${id}`;
};
import { Routes } from '../constants/area-info.constants';

export const findNextRoute = (scenarios: any[], id: string | null) => {
  if (!scenarios || !Array.isArray(scenarios) || !id) {
    return `${Routes.EXHIBITS}?id=${id}`;
  }

  // Priority list for forward pass
  const forwardApproachChecks = [
    { key: 'has_income_approach', route: Routes.INCOME_APPROACH, param: 'IncomeId', evalKey: 'evaluation_income_approach' },
    { key: 'has_cap_approach', route: Routes.CAP_APPROACH, param: 'capId', evalKey: 'evaluation_cap_approach' },
    { key: 'has_multi_family_approach', route: Routes.MULTI_FAMILY_APPROACH, param: 'evaluationId', evalKey: null },
  ];

  // Priority list for backward pass
  const backwardApproachChecks = [
    { key: 'has_sales_approach', route: Routes.SALES_APPROACH, param: 'salesId', evalKey: 'evaluation_sales_approach' },
    { key: 'has_lease_approach', route: Routes.LEASE_APPROACH, param: 'leaseId', evalKey: 'evaluation_lease_approach' },
    { key: 'has_cost_approach', route: Routes.COST_APPROACH, param: 'costId', evalKey: 'evaluation_cost_approach' },
  ];

  // Forward pass
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    for (const check of forwardApproachChecks) {
      if (scenario[check.key]) {
        const paramValue = check.evalKey && scenario[check.evalKey] ? scenario.id : scenario.id;
        return `${check.route}?id=${id}&${check.param}=${paramValue}`;
      }
    }
  }

  // Backward pass
  for (let i = scenarios.length - 1; i >= 0; i--) {
    const scenario = scenarios[i];
    for (const check of backwardApproachChecks) {
      if (scenario[check.key]) {
        const paramValue = check.evalKey && scenario[check.evalKey] ? scenario.id : scenario.id;
        return `${check.route}?id=${id}&${check.param}=${paramValue}`;
      }
    }
  }

  // Fallback
  return `${Routes.EXHIBITS}?id=${id}`;
};

import { RoundingValues } from '../../Enum/evaluation-enums';

export const formatCurrency = (
  value: number | string | null | undefined
): string => {
  if (value === null || value === undefined || value === '') {
    return '$0.00';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '$0.00';
  }

  return numValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getApproachValue = (approach: string, data: any) => {
  switch (approach) {
    case 'income':
      return data?.indicated_range_annual;
    case 'sales':
      return data?.sales_approach_value;
    case 'cost':
      return data?.total_cost_valuation;
    default:
      return data?.incremental_value;
  }
};

export const calculateWeightedMarketValue = (scenario: any) => {
  let weightedMarketValue = 0;
  ['income', 'sales', 'cost'].forEach((approach) => {
    const approachKey = `evaluation_${approach}_approach`;
    const data = scenario?.[approachKey];

    if (data?.eval_weight) {
      const approachValue = getApproachValue(approach, data);
      if (approachValue) {
        weightedMarketValue += approachValue * data.eval_weight;
      }
    }
  });
  return weightedMarketValue;
};

export const applyRounding = (value: number, roundingVal: string | number) => {
  if (!roundingVal) return value;

  let acc = 0;
  switch (roundingVal.toString()) {
    case RoundingValues.Thousand.toString():
      acc = RoundingValues.Thousand;
      break;
    case RoundingValues.FiveThousand.toString():
      acc = RoundingValues.FiveThousand;
      break;
    case RoundingValues.TenThousand.toString():
      acc = RoundingValues.TenThousand;
      break;
    case RoundingValues.OneHundredThousand.toString():
      acc = RoundingValues.OneHundredThousand;
      break;
    case RoundingValues.OneMillion.toString():
      acc = RoundingValues.OneMillion;
      break;
    default:
      acc = 0;
  }

  return acc > 0 ? Math.round(value / acc) * acc : value;
};

export const getApproachType = (approachKey: string) => {
  if (approachKey.includes('income')) return 'income';
  if (approachKey.includes('sales')) return 'sale';
  if (approachKey.includes('cost')) return 'cost';
  return '';
};

export const calculatePriceRange = (scenario: any) => {
  let lowestValue = Infinity;
  let highestValue = -Infinity;

  ['income', 'sales', 'cost'].forEach((approach) => {
    const approachKey = `evaluation_${approach}_approach`;
    const data = scenario[approachKey];
    if (data) {
      const approachValue = getApproachValue(approach, data);
      if (approachValue !== null && approachValue !== undefined) {
        lowestValue = Math.min(lowestValue, approachValue);
        highestValue = Math.max(highestValue, approachValue);
      }
    }
  });

  return {
    lowest: lowestValue !== Infinity ? lowestValue : 0,
    highest: highestValue !== -Infinity ? highestValue : 0,
  };
};

export const calculateFinalMarketValue = (scenario: any) => {
  const weightedSum = calculateWeightedMarketValue(scenario);
  return applyRounding(weightedSum, scenario.rounding);
};

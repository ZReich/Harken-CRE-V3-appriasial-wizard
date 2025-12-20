import { EvaluationSetupParams } from '@/components/interface/appraisal-set-up';
import { StorageKeys, ValidationMessages } from '@/enums/storage-keys';
import { toast } from 'react-toastify';

// Helper functions for evaluation setup validation
export const getEvalType = (evaluationType: any): string => {
  return typeof evaluationType === 'string'
    ? evaluationType.trim()
    : typeof evaluationType === 'object' && 'value' in evaluationType
      ? evaluationType.value.trim()
      : '';
};

export const hasDuplicateScenarios = (scenarios: any[]): boolean => {
  const names = scenarios.map((e) => e.name?.trim());
  return names.length !== new Set(names).size;
};

export const hasAnyApproach = (scenario: any): boolean => {
  return Object.entries(scenario)
    .filter(([key]) => key.startsWith('has_') && key.endsWith('_approach'))
    .some(([, value]) => value);
};

// Toast debouncing utility
let lastErrorMessage = '';
export const showErrorToast = (message: string) => {
  if (lastErrorMessage !== message) {
    toast.error(message);
    lastErrorMessage = message;
    setTimeout(() => (lastErrorMessage = ''), 500); // Reset after 500ms
  }
};

// Validation function
export const validateEvaluationSetupFields = (
  values: EvaluationSetupParams
): boolean => {
  // If there's only one scenario, set its name to 'Primary' if empty
  if (values.scenarios.length === 1 && !values.scenarios[0].name?.trim()) {
    values.scenarios[0].name = 'Primary';
  }

  const validationRules = [
    {
      condition: !getEvalType(values.evaluation_type),
      message: ValidationMessages.SELECT_EVALUATION_TYPE,
    },
    {
      // Only check scenario names if there's more than one scenario
      condition:
        values.scenarios.length > 1 &&
        values.scenarios.some((s: any) => !s.name?.trim()),
      message: ValidationMessages.FILL_SCENARIO_NAMES,
    },
    {
      condition: hasDuplicateScenarios(values.scenarios),
      message: ValidationMessages.UNIQUE_SCENARIO_NAMES,
    },
    {
      condition: values.scenarios?.length === 0 || values.scenarios.some((s: any) => !hasAnyApproach(s)),
      message: (s: any) => values.scenarios.length === 0 ? ValidationMessages.SELECT_APPROACH1 :
        ValidationMessages.SELECT_APPROACH.replace(
          '{0}',
          s.name || 'Primary'
        ),
    },
    {
      condition:
        !values.client_id && !localStorage.getItem(StorageKeys.CLIENT_ID),
      message: ValidationMessages.CLIENT_REQUIRED,
    },
  ];

  for (const rule of validationRules) {
    if (rule.condition) {
      const message =
        typeof rule.message === 'function'
          ? rule.message(values.scenarios.find((s: any) => !hasAnyApproach(s)))
          : rule.message;
      showErrorToast(message);
      return false;
    }
  }

  return true;
};

// Prepare payload for submission
export const prepareSubmitPayload = (values: EvaluationSetupParams, clientId: string | null): any => {
  return {
    ...values,
    client_id: clientId ? clientId : values.client_id,
    scenarios: values.scenarios.map((ele: any) => {
      const scenario: any = {
        has_sales_approach: ele.has_sales_approach,
        has_cost_approach: ele.has_cost_approach,
        has_income_approach: ele.has_income_approach,
        has_multi_family_approach: ele.has_multi_family_approach,
        has_cap_approach: ele.has_cap_approach,
        has_lease_approach: ele.has_lease_approach,
      };

      // Only include name if there are multiple scenarios
      if (values.scenarios.length === 1) {
        scenario['name'] = 'primary';
      } else {
        scenario['name'] = ele.name;
      }

      return scenario;
    }),
  };
};
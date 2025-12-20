import { StorageKeys, ValidationMessages } from '@/enums/storage-keys';
import { EvaluationSetupParams } from '@/components/interface/appraisal-set-up';
import { toast } from 'react-toastify';

let lastErrorMessage = '';

export const showErrorToast = (message: string) => {
  if (lastErrorMessage !== message) {
    toast.error(message);
    lastErrorMessage = message;
    setTimeout(() => (lastErrorMessage = ''), 500); // Reset after 500ms
  }
};

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

export const validateEvaluationSetupFields = (
  values: EvaluationSetupParams
): boolean => {
  // If there's only one scenario, set its name to 'Primary' if empty
  if (values.scenarios.length === 1 && !values.scenarios[0].name?.trim()) {
    values.scenarios[0].name = StorageKeys.PRIMARY;
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
        values.scenarios.some((s:any) => !s.name?.trim()),
      message: ValidationMessages.FILL_SCENARIO_NAMES,
    },
    {
      condition: hasDuplicateScenarios(values.scenarios),
      message: ValidationMessages.UNIQUE_SCENARIO_NAMES,
    },
    {
      condition: values.scenarios.some((s:any) => !hasAnyApproach(s)),
      message: (s: any) =>
        ValidationMessages.SELECT_APPROACH.replace(
          '{0}',
          s.name || StorageKeys.PRIMARY
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
          ? rule.message(values.scenarios.find((s:any) => !hasAnyApproach(s)))
          : rule.message;
      showErrorToast(message);
      return false;
    }
  }

  return true;
};
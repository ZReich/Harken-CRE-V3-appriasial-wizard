export enum EvaluationEnum {
  SAVE_AND_CONTINUE = 'Save & Continue',
}

export enum EvaluationSetUpEnum {
  EVALUATION_DETAILS = 'EVALUATION DETAILS',
  EVALUATION_TYPE = 'Evaluation Type',
  EVALUATION_TYPE_NAME = 'evaluation_type',
  VALUATION_SCENARIO = 'Valuation Scenario',
  ADD_MORE = 'Add More',
  CLIENT_DETAILS = 'Client Details',
  SELECT_CLIENT = 'Select Client',
  CLIENT_ID = 'client_id',
  ADD_NEW_CLIENT = 'Add New Client',
}

export enum ApproachEnum {
  SALES = 'has_sales_approach',
  COST = 'has_cost_approach',
  INCOME = 'has_income_approach',
  MULTI_FAMILY = 'has_multi_family_approach',
  CAP = 'has_cap_approach',
  LEASE = 'has_lease_approach',
}

export enum ApproachLabelEnum {
  SALES = 'Sales Comparison Approach',
  COST = 'Cost Approach',
  INCOME = 'Income Approach',
  MULTI_FAMILY = 'Multi-Family',
  CAP = 'Cap Rate Comps',
  LEASE = 'Lease Comps',
}

export enum ScenarioEnum {
  NAME = 'name',
  PRIMARY = 'primary',
  SCENARIO_NAME = 'Scenario Name',
}
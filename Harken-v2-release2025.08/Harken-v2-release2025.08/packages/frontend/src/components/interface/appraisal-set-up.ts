export interface AppraisalSetup {
  appraisal_type: string;
  client_id: number | string;
  approaches: any;
  // comp_type: any;
}
export interface AppraisalSetupScreen {
  appraisal_type: string;
  client_id: number | string;
  approaches: any;
  comp_type: any;
}

export interface EvaluationSetupParams {
  evaluation_type: string | { value: string; label: string };
  // comp_type: any;
  client_id: number | string;
  scenarios:any;
  // scenarios: Array<{
  //   name: any;
  //   has_sales_approach: number;
  //   has_cost_approach: number;
  //   has_cap_approach: number;
  //   has_multi_family_approach: number;
  //   has_lease_approach: number;
  //   has_income_approach: number;
  // }>;
}
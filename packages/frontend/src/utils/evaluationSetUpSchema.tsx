import * as Yup from 'yup';
export const EvaluationSetUpSchema = Yup.object({
  evaluation_type: Yup.string().required('This field is required.'),
  // approaches: Yup.array().of(
  //   Yup.object().shape({
  //     name: Yup.string().required('This field is required.'),
  //   })
  // ),
  client_id: Yup.string().required('This field is required.'),
});
export const ResidentialSetUpSchema = Yup.object({
  evaluation_type: Yup.string().required('This field is required.'),
  // res_evaluation_scenarios: Yup.array().of(
  //   Yup.object().shape({
  //     name: Yup.string().required('This field is required.'),
  //   })
  // ),
  client_id: Yup.string().required('This field is required.'),
});

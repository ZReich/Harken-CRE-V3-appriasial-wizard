import * as Yup from 'yup';
export const AppraisalSetUpSchema = Yup.object({
  appraisal_type: Yup.string().required('This field is required.'),
  approaches: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().required('This field is required.'),
      name: Yup.string().required('This field is required.'),
    })
  ),
  client_id: Yup.string().required('This field is required.'),
});

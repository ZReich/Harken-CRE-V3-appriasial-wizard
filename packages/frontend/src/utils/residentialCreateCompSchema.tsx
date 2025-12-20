import * as Yup from 'yup';
export const residentialCreateCompsValidation = Yup.object({
  // property_name: Yup.string().required('This field is required.'),
  street_address: Yup.string().required('This field is required.'),
  city: Yup.string(),
  state: Yup.string().required('This field is required.'),
  zipcode: Yup.string().required('This field is required.'),
  zonings: Yup.array().of(
    Yup.object().shape({
      zone: Yup.string().required('This field is required.'),
      sub_zone: Yup.string().required('This field is required.'),
      gross_living_sq_ft: Yup.string().required('This field is required.'),
      basement_finished_sq_ft: Yup.string().required('This field is required.'),
      basement_unfinished_sq_ft: Yup.string().required(
        'This field is required.'
      ),
      weight_sf: Yup.string().required('This field is required.'),
      sub_zone_custom: Yup.string().when('sub_zone', ([subZone], schema) =>
        subZone === 'Type My Own'
          ? schema.required('This field is required.')
          : schema.optional()
      ),
    })
  ),
  condition: Yup.string().required('This field is required.'),
  condition_custom: Yup.string().when('condition', ([Condition], schema) =>
    Condition === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
  date_sold: Yup.string().required('This field is required.'),
  sale_price: Yup.string().required('This field is required.'),
});

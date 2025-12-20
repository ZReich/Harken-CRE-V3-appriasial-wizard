import * as Yup from 'yup';

export const forgotPasswordLogin = Yup.object({
  email: Yup.string().required('Please fill in this field'),
});

export const loginValidation = Yup.object({
  email_address: Yup.string().required('The Email Address field is required.'),
  password: Yup.string().required('The Password field is required.'),
});

export const resetPasswordValidation = Yup.object({
  password: Yup.string().required('Please fill in this field'),
  confirm_password: Yup.string().required('Confirm password is required'),
});

export const mapFilterValidation = Yup.object({
  type: Yup.string(),
  property_type: Yup.string(),
  comp_type: Yup.string(),
  state: Yup.string(),
  street_address: Yup.string(),
  start_date: Yup.string(),
  end_date: Yup.string(),
  building_sf_min: Yup.string(),
  building_sf_max: Yup.string(),
  land_sf_min: Yup.string(),
  land_sf_max: Yup.string(),
  cape_rate_min: Yup.string(),
  cap_rate_max: Yup.string(),
  all: Yup.string(),
  city: Yup.string(),
});

export const buildingValidation = Yup.object({
  square_feet: Yup.string().required('This field is required'),
  built_year: Yup.string().required('This field is required'),
});
export const transactionValidation = Yup.object({
  sale_price: Yup.string().required('This field is required'),
});

const zoningUnitSchema = Yup.object().shape({
  zone: Yup.string().required('This field is required.'),
  sub_zone: Yup.string().required('This field is required.'),
  sq_ft: Yup.string().required('This field is required.'),
  unit: Yup.string().required('This field is required.'),
  // weight_sf: Yup.string().required('This field is required.'),
  bed: Yup.string(),
  sub_zone_custom: Yup.string().when('sub_zone', ([subZone], schema) =>
    subZone === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
});

const zoningSfSchema = Yup.object().shape({
  zone: Yup.string().required('This field is required.'),
  sub_zone: Yup.string().required('This field is required.'),
  sq_ft: Yup.string().required('This field is required.'),
  unit: Yup.string(),
  bed: Yup.string(),
  // weight_sf: Yup.string().required('This field is required.'),
  sub_zone_custom: Yup.string().when('sub_zone', ([subZone], schema) =>
    subZone === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
});

const zoningBedSchema = Yup.object().shape({
  zone: Yup.string().required('This field is required.'),
  sub_zone: Yup.string().required('This field is required.'),
  sq_ft: Yup.string().required('This field is required.'),
  unit: Yup.string(),
  // weight_sf: Yup.string().required('This field is required.'),
  bed: Yup.string().required('This field is required.'),
  sub_zone_custom: Yup.string().when('sub_zone', ([subZone], schema) =>
    subZone === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
});

export const createCompValidation = Yup.object({
  comparison_basis: Yup.string(),
  // business_name: Yup.string().required('This field is required'),
  street_address: Yup.string().required('This field is required'),
  state: Yup.string().required('This field is required'),
  zipcode: Yup.string().required('This field is required'),
  geometry: Yup.object().shape({
    latitude: Yup.string(),
    longitude: Yup.string(),
  }),
  condition_custom: Yup.string().when('condition', ([Condition], schema) =>
    Condition === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
  // zonings: Yup.array().of(
  //   Yup.object().shape({
  //     zone: Yup.string().required('This field is required.'),
  //     sub_zone: Yup.string().required('This field is required.'),
  //     sq_ft: Yup.string().required('This field is required.')

  //   })
  // ),
  zonings: Yup.array().when('comparison_basis', {
    is: 'Unit',
    then: (s) => s.of(zoningUnitSchema),
    otherwise: (s) =>
      s.when('comparison_basis', {
        is: 'Bed',
        then: (s) => s.of(zoningBedSchema),
        otherwise: (s) => s.of(zoningSfSchema),
      }),
  }),
});

export const UserUpdateProfileValidation = Yup.object({
  first_name: Yup.string().required('This field is required'),
  last_name: Yup.string().required('This field is required.'),
  email_address: Yup.string().required('This field is required.'),
  phone_number: Yup.string().required('This field is required.'),
  position: Yup.string().required('This field is required.'),
});

export const UserChangePasswordValidation = Yup.object({
  new_password: Yup.string().required('This field is required.'),
  confirm_password: Yup.string().required('This field is required.'),
});

export const UserAccountValidation = Yup.object({
  name: Yup.string().required('This field is required'),
  detail: Yup.string().required('This field is required'),
  phone_number: Yup.string()
    .matches(/^[0-9()\- ]*$/, 'Phone number can only contain digits')
    .min(14, 'Phone number must be at least 10 digits long')
    .max(14, 'Phone number cannot be more than 10 digits long'),
  zipcode: Yup.string()
    .min(5, 'Zipcode must be at least 5 digits long')
    .max(5, 'Zipcode cannot be more than 5 digits long')
    .nullable(),
});

export const createCompValidationLandOnly = Yup.object({
  // business_name: Yup.string().required('This field is required'),
  street_address: Yup.string().required('This field is required'),
  state: Yup.string().required('This field is required'),
  land_type: Yup.string().required('This field is required'),
  land_type_custom: Yup.string().when('land_type', ([landType], schema) =>
    landType === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
  // land_size: Yup.string().required('This field is required'),
  zipcode: Yup.string().required('This field is required'),
  date_sold: Yup.string().required('This field is required'),
});

export const AppraisalClientValidation = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  // email_address: Yup.string().email('Email is invalid'),
});
export const EvaluationClientValidation = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  // email_address: Yup.string().email('Email is invalid'),
});
export const createCompLeaseValidation = Yup.object({
  condition: Yup.string().required('This field is required'),
  // land_size: Yup.string().required('This field is required'),
  condition_custom: Yup.string().when('condition', ([Condition], schema) =>
    Condition === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
  // business_name: Yup.string().required('This field is required'),
  street_address: Yup.string().required('This field is required'),
  state: Yup.string().required('This field is required'),
  // land_type: Yup.string().required('This field is required'),
  land_type_custom: Yup.string().when('land_type', ([landType], schema) =>
    landType === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
  zipcode: Yup.string().required('This field is required'),
  date_sold: Yup.string().required('This field is required'),
  zonings: Yup.array().when('comparison_basis', {
    is: 'Unit',
    then: (s) => s.of(zoningUnitSchema),
    otherwise: (s) =>
      s.when('comparison_basis', {
        is: 'Bed',
        then: (s) => s.of(zoningBedSchema),
        otherwise: (s) => s.of(zoningSfSchema),
      }),
  }),
});
export const createCompLandLeaseValidation = Yup.object({
  condition: Yup.string().required('This field is required'),
  // land_size: Yup.string().required('This field is required'),
  condition_custom: Yup.string().when('condition', ([Condition], schema) =>
    Condition === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
  // business_name: Yup.string().required('This field is required'),
  street_address: Yup.string().required('This field is required'),
  state: Yup.string().required('This field is required'),
  // land_type: Yup.string().required('This field is required'),
  land_type_custom: Yup.string().when('land_type', ([landType], schema) =>
    landType === 'Type My Own'
      ? schema.required('This field is required.')
      : schema.optional()
  ),
  zipcode: Yup.string().required('This field is required'),
  date_sold: Yup.string().required('This field is required'),
});

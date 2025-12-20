import * as Yup from 'yup';

const zoningUnitSchema = Yup.object().shape({
  zone: Yup.string().required('This field is required.'),
  sub_zone: Yup.string().required('This field is required.'),
  sq_ft: Yup.string().required('This field is required.'),
  unit: Yup.string().required('This field is required.'),
  weight_sf: Yup.string().required('This field is required.'),
  bed: Yup.string(),
  //   sub_zone_custom: Yup.string().when('sub_zone', ([subZone], schema) =>
  //   subZone === 'Type My Own'
  //     ? schema.required('This field is required.')
  //     : schema.optional()
  // ),
});

const zoningSfSchema = Yup.object().shape({
  zone: Yup.string().required('This field is required.'),
  sub_zone: Yup.string().required('This field is required.'),
  sq_ft: Yup.string().required('This field is required.'),
  unit: Yup.string(),
  bed: Yup.string(),
  weight_sf: Yup.string().required('This field is required.'),
  //   sub_zone_custom: Yup.string().when('sub_zone', ([subZone], schema) =>
  //   subZone === 'Type My Own'
  //     ? schema.required('This field is required.')
  //     : schema.optional()
  // ),
});

const zoningBedSchema = Yup.object().shape({
  zone: Yup.string().required('This field is required.'),
  sub_zone: Yup.string().required('This field is required.'),
  sq_ft: Yup.string().required('This field is required.'),
  unit: Yup.string(),
  weight_sf: Yup.string().required('This field is required.'),
  bed: Yup.string().required('This field is required.'),
  //   sub_zone_custom: Yup.string().when('sub_zone', ([subZone], schema) =>
  //   subZone === 'Type My Own'
  //     ? schema.required('This field is required.')
  //     : schema.optional()
  // ),
});

const propertyUnitsWithoutSchema = Yup.object().shape({
  beds: Yup.string(),
  baths: Yup.string(),
  sq_ft: Yup.string(),
  unit_count: Yup.string(),
  avg_monthly_rent: Yup.string(),
});

const propertyUnitsWithSchema = Yup.object().shape({
  beds: Yup.string().required('This field is required.'),
  baths: Yup.string().required('This field is required.'),
  sq_ft: Yup.string().required('This field is required.'),
  unit_count: Yup.string().required('This field is required.'),
  // avg_monthly_rent: Yup.string().required('This field is required.'),
});

export const AppraisalOverviewSchema = Yup.object({
  // land_size: Yup.string().required('This field is required.'),
  comparison_basis: Yup.string(),
  street_address: Yup.string().required('This field is required'),
  // business_name: Yup.string().required('This field is required'),
  city: Yup.string().required('This field is required'),
  state: Yup.string().required('This field is required'),
  zipcode: Yup.string().required('This field is required'),
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
  property_units: Yup.array().when(['comparison_basis', 'zonings'], {
    is: (comparison_basis: string, zonings: any[]) =>
      comparison_basis === 'Unit' &&
      zonings.some((zoning) => zoning.zone === 'multi_family'),
    then: (s) => s.of(propertyUnitsWithSchema),
    otherwise: (s) => s.of(propertyUnitsWithoutSchema),
  }),
});
export const ResidentialOverviewSchema = Yup.object({
  land_size: Yup.string().required('This field is required.'),
  street_address: Yup.string().required('This field is required'),
  business_name: Yup.string().required('This field is required'),
  city: Yup.string().required('This field is required'),
  state: Yup.string().required('This field is required'),
  zipcode: Yup.string().required('This field is required'),
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
  // property_units: Yup.array().when(['comparison_basis', 'zonings'], {
  //   is: (comparison_basis: string, zonings: any[]) =>
  //     comparison_basis === 'Unit' &&
  //     zonings.some((zoning) => zoning.zone === 'multi_family'),
  //   then: (s) => s.of(propertyUnitsWithSchema),
  //   otherwise: (s) => s.of(propertyUnitsWithoutSchema),
  // }),
});

export const AppraisalOverviewLandOnlySchema = Yup.object({
  street_address: Yup.string().required('This field is required'),
  // business_name: Yup.string().required('This field is required'),
  city: Yup.string().required('This field is required'),
  state: Yup.string().required('This field is required'),
  zipcode: Yup.string().required('This field is required'),
  land_dimension: Yup.string().required('This field is required.'),
  land_type: Yup.string().required('This field is required.'),
  land_size: Yup.string().required('This field is required.'),
});

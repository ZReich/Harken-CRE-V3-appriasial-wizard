import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { EvaluationMultiFamily } from '../overview/evaluation-multi-family';

const RentRoleSchema = Yup.object().shape({
  rent_rolls: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required('Required'),
      unit: Yup.string().required('This field is required'),
      rent: Yup.string().required('This field is required'),
    })
  ),
});

const EvaluationRentRoleSidebar = () => {
  const handleSubmit = (values: any) => {
    console.log(values);
  };

  const initialValues = {
    rent_rolls: [
      {
        id: null,
        beds: null,
        baths: null,
        sq_ft: null,
        unit_count: null,
        avg_monthly_rent: null,
        description: '',
        tenant: null,
        rent: null,
        lease_expiration: '',
        unit: null,
      },
    ],
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={RentRoleSchema}
      onSubmit={handleSubmit}
    >
      {() => (
        <Form className="w-full">
          <EvaluationMultiFamily />
        </Form>
      )}
    </Formik>
  );
};

export default EvaluationRentRoleSidebar;

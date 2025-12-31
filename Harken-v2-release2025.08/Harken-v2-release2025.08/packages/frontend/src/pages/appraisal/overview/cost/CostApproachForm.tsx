import { Formik, Form } from 'formik';

import { ResponseType } from '@/components/interface/response-type';
import { RequestType, useMutate } from '@/hook/useMutate';
import CostApproach from './cost-approach';

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}
const CostApproachForm: React.FC = () => {
  useMutate<ResponseType, any>({
    queryKey: 'create-comp',
    endPoint: 'comps/create',
    requestType: RequestType.POST,
  });

  const handleSubmit = (v: any) => {
    console.log('FORM VALUES', v);
  };

  const operatingExpensesInitial = [
    { adj_key: 'time', adj_value: 'Time', comparison_basis: 0 },
    { adj_key: 'location', adj_value: 'Location', comparison_basis: 0 },
    { adj_key: 'zonning', adj_value: 'Zonning', comparison_basis: 0 },
    { adj_key: 'services', adj_value: 'Services', comparison_basis: 0 },
    { adj_key: 'demolition', adj_value: 'Demolition', comparison_basis: 0 },
    {
      adj_key: 'economies_of_scale',
      adj_value: 'Economies of Scale',
      comparison_basis: 0,
    },
  ];

  return (
    <>
      <Formik
        initialValues={{
          tableData: [],
          operatingExpenses: [...operatingExpensesInitial],
          averaged_adjusted_psf: 0,
        }}
        onSubmit={handleSubmit}
      >
        {() => {
          return (
            <>
              <>
                <Form className="w-full">
                  <CostApproach />
                </Form>
              </>
            </>
          );
        }}
      </Formik>
    </>
  );
};

export default CostApproachForm;

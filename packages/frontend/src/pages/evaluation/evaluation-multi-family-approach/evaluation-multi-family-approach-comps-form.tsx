import { Formik, Form } from 'formik';
import { ResponseType } from '@/components/interface/response-type';
import { RequestType, useMutate } from '@/hook/useMutate';
import EvaluationMultiFamilyFilterLandMapHeaderOptions from './evaluation-mullti-family-approach-filter-options-map-side';
import EvaluationMultiFamilyFilterMapHeaderOptions from './evaluation-multi-family-approach-filter-option';

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}
const EvaluationMultiFamilyApproachCompsForm: React.FC = () => {
  useMutate<ResponseType, any>({
    queryKey: 'create-comp',
    endPoint: 'comps/create',
    requestType: RequestType.POST,
  });

  const handleSubmit = (v: any) => {
    console.log('FORM VALUES', v);
  };

  const operatingExpensesInitial = [
    { adj_key: 'location', adj_value: 'Location', comparison_basis: 0 },
    { adj_key: 'bed_bath', adj_value: 'Bed/Bath', comparison_basis: 0 },
    { adj_key: 'utilities', adj_value: 'Utilities', comparison_basis: 0 },
    { adj_key: 'parking', adj_value: 'Parking', comparison_basis: 0 },
    { adj_key: 'year_built', adj_value: 'Year Built', comparison_basis: 0 },
    { adj_key: 'condition', adj_value: 'Condition', comparison_basis: 0 },
  ];
  const activeType = localStorage.getItem('activeType');

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
                  {activeType === 'building_with_land' ? (
                    <EvaluationMultiFamilyFilterMapHeaderOptions />
                  ) : (
                    <EvaluationMultiFamilyFilterLandMapHeaderOptions />
                  )}
                </Form>
              </>
            </>
          );
        }}
      </Formik>
    </>
  );
};

export default EvaluationMultiFamilyApproachCompsForm;

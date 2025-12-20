import { Formik, Form } from 'formik';

import { ResponseType } from '@/components/interface/response-type';
import { RequestType, useMutate } from '@/hook/useMutate';
import EvaluationMultiFamilyApproach from './evaluation-multi-family-approach';
import { useEffect, useState } from 'react';
import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}
const EvaluationMultiFamilyApproachSubjectPropertyForm: React.FC = () => {
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const costId = searchParams.get('evaluationId');
  useMutate<ResponseType, any>({
    queryKey: 'create-comp',
    endPoint: 'comps/create',
    requestType: RequestType.POST,
  });
  const [appraisalType, setAppraisalType] = useState<any>();
  // const [compariosnBasis, setComparisonBasis] = useState<string | null>(null);

  const [allAppraisalTpe, setAllAppraisalType] = useState([]);
  const [appraisalSpecificAdjustment, setAppraisalSpecificAdjustment] =
    useState([]);
  const { data } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(costId),
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
        const fetchedAppraisalType = data?.data?.data?.evaluation_type;
        // const comaprisonBasisEvaluation = data?.data?.data?.comparison_basis;
        // setComparisonBasis(comaprisonBasisEvaluation);

        if (fetchedAppraisalType) {
          setAppraisalType(fetchedAppraisalType);
          console.log('Calling fetchCompsData after setting appraisalType...');
          // await fetchCompsData();
        }
      },
    },
  });

  console.log(data);
  const handleSubmit = (v: any) => {
    console.log('FORM VALUES', v);
  };
  useEffect(() => {
    if (!appraisalType) return;

    const fetchAppraisalData = async () => {
      const endPoint = `evaluations/comparative-attributes?evaluation_type=${appraisalType}`;
      try {
        const response = await axios.get(endPoint);
        const fetchSpecificApprisalData = response?.data?.data?.data;
        const defaultAttributes = ['parking', 'year_built_year_remodeled', 'quality_condition'];
        const filteredData = fetchSpecificApprisalData?.filter(
          (item: any) => defaultAttributes.includes(item.code)
        );
        // const filteredData = fetchSpecificApprisalData?.filter(
        //   (item: any) => item?.default === 1
        // );

        const dynamicAppraisalSpecificAdjustments = filteredData.map(
          (option: any) => ({
            comparison_key: option.code,
            comparison_value: option.name,
          })
        );
        setAppraisalSpecificAdjustment(dynamicAppraisalSpecificAdjustments);

        const dynamicAllAppraisalTypeData = fetchSpecificApprisalData.map(
          (option: any) => ({
            comparison_key: option.code,
            comparison_value: option.name,
          })
        );

        setAllAppraisalType(dynamicAllAppraisalTypeData);
      } catch (error) {
        console.error('Error fetching appraisal data:', error);
      }
    };

    fetchAppraisalData();
  }, [appraisalType]);
  const operatingExpensesInitial = [
    { adj_key: 'location', adj_value: 'Location', comparison_basis: 0 },
    { adj_key: 'bed_bath', adj_value: 'Bed/Bath', comparison_basis: 0 },
    { adj_key: 'utilities', adj_value: 'Utilities', comparison_basis: 0 },
    { adj_key: 'parking', adj_value: 'Parking', comparison_basis: 0 },
    { adj_key: 'year_built', adj_value: 'Year Built', comparison_basis: 0 },
    { adj_key: 'condition', adj_value: 'Condition', comparison_basis: 0 },
  ];
  // useEffect(() => {
  //   console.log('FINAL STATE after fetch:');
  // }, [appraisalSpecificAdjustment, allAppraisalTpe]);

  return (
    <>
      {allAppraisalTpe.length && appraisalSpecificAdjustment.length ? (
        <Formik
          initialValues={{
            tableData: [],
            operatingExpenses: [...operatingExpensesInitial],
            appraisalSpecificAdjustment: [...appraisalSpecificAdjustment],
            allAppraisalTpe: [...allAppraisalTpe],
            averaged_adjusted_psf: 0,
          }}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(values: any) => {
            console.log('valuee', values);
            return (
              <Form className="w-full">
                <EvaluationMultiFamilyApproach />
              </Form>
            );
          }}
        </Formik>
      ) : (
        <div>Loading form data...</div>
      )}
    </>
  );
};

export default EvaluationMultiFamilyApproachSubjectPropertyForm;

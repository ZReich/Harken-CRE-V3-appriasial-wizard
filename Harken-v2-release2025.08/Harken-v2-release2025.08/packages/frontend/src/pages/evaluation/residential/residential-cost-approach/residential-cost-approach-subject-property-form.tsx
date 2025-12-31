import { Form, Formik } from 'formik';

import { ResponseType } from '@/components/interface/response-type';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResidentialCostApproach from './residential-cost-approach';
// import EvaluationCostApproach from './evaluation-cost-approach';
export interface EvaluationCostApproachFormValues {
  tableData: any[];
  operatingExpenses: {
    adj_key: string;
    adj_value: string | number;
    comparison_basis: number;
  }[];
  appraisalSpecificAdjustment: {
    comparison_key: string;
    comparison_value: string;
  }[];
  allAppraisalTpe: {
    comparison_key: string;
    comparison_value: string;
  }[];
  averaged_adjusted_psf: number;
}

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}
const ResidentialCostApproachSubjectPropertyForm: React.FC = () => {
  console.log('rendering');
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const costId = searchParams.get('costId');
  useMutate<ResponseType, any>({
    queryKey: 'create-comp',
    endPoint: 'comps/create',
    requestType: RequestType.POST,
  });
  const [appraisalType, setAppraisalType] = useState<any>();
  const [landDimension, setLandDimension] = useState<any>();
  const [allAppraisalTpe, setAllAppraisalType] = useState([]);
  const [appraisalSpecificAdjustment, setAppraisalSpecificAdjustment] =
    useState([]);
  const [operatingExpensesInitial, setOperatingExpensesInitial] = useState([
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
  ]);

  const { data } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: {
      enabled: Boolean(costId),
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
        const fetchedAppraisalType = data?.data?.data?.evaluation_type;
        if (fetchedAppraisalType) {
          setAppraisalType(fetchedAppraisalType);
          console.log('Calling fetchCompsData after setting appraisalType...');
          // await fetchCompsData();
        }
        const fetchedLandDimension = data?.data?.data?.land_dimension;
        if (fetchedLandDimension) {
          setLandDimension(fetchedLandDimension);
        }
      },
    },
  });

  // Fetch cost approach data
  useEffect(() => {
    const fetchCostApproachData = async () => {
      if (!id || !costId) return;

      try {
        const response = await axios.get(
          `res-evaluations/get-cost-approach?evaluationId=${id}&evaluationScenarioId=${costId}`
        );

        const costApproachData = response?.data?.data?.data;

        if (costApproachData) {
          // If cost_subject_property_adjustments exists and is not empty, use it
          if (
            costApproachData.cost_subject_property_adjustments &&
            costApproachData.cost_subject_property_adjustments.length > 0
          ) {
            const formattedOperatingExpenses =
              costApproachData.cost_subject_property_adjustments.map(
                ({ adj_key, adj_value, ...rest }: any) => ({
                  ...rest,
                  adj_key,
                  adj_value,
                  comparison_basis: adj_value || 0,
                })
              );
            setOperatingExpensesInitial(formattedOperatingExpenses);
          }

          // If comparison_attributes exists and is not empty, use it
          if (
            costApproachData.comparison_attributes &&
            costApproachData.comparison_attributes.length > 0
          ) {
            const formattedComparativeAdjustment =
              costApproachData.comparison_attributes.map(
                ({ comparison_key, comparison_value, ...rest }: any) => ({
                  ...rest,
                  comparison_key,
                  comparison_value,
                })
              );
            setAppraisalSpecificAdjustment(formattedComparativeAdjustment);
          }
        }
      } catch (error) {
        console.error('Error fetching cost approach data:', error);
      }
    };

    fetchCostApproachData();
  }, [id, costId]);

  console.log(data);
  const handleSubmit = (v: any) => {
    console.log('FORM VALUES', v);
  };

  useEffect(() => {
    if (!appraisalType) return;

    const fetchAppraisalData = async () => {
      const endPoint = `res-evaluations/comparative-attributes?evaluation_type=${appraisalType}`;
      try {
        const response = await axios.get(endPoint);
        const fetchSpecificApprisalData = response?.data?.data?.data;
        let defaultAttributes = [
          'sale_price',
          'building_size_land_size',
          'zoning_type',
          'utilities_select',
          'frontage',
          'price_per_sf',
        ];
        if (landDimension === 'ACRE') {
          defaultAttributes = [
            'sale_price',
            'building_size_land_size',
            'zoning_type',
            'utilities_select',
            'frontage',
            'price_per_acre',
          ];
        }
        // const filteredData = fetchSpecificApprisalData?.filter(
        //   (item: any) => item?.default === 1
        // );
        const filteredData = fetchSpecificApprisalData?.filter((item: any) =>
          defaultAttributes.includes(item.code)
        );

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

  // useEffect(() => {
  //   console.log('FINAL STATE after fetch:');
  // }, [appraisalSpecificAdjustment, allAppraisalTpe]);

  return (
    <>
      {allAppraisalTpe.length && appraisalSpecificAdjustment.length ? (
        <Formik<EvaluationCostApproachFormValues>
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
                <ResidentialCostApproach />
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

export default ResidentialCostApproachSubjectPropertyForm;

import { Formik, Form } from 'formik';

import { ResponseType } from '@/components/interface/response-type';
import { RequestType, useMutate } from '@/hook/useMutate';
import EvaluationCostApproach from './evaluation-cost-approach';
import { useEffect, useState } from 'react';
import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
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
const EvaluationCostApproachSubjectPropertyForm: React.FC = () => {
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
  const [costApproachData, setCostApproachData] = useState<any>(null);
  const [formValues, setFormValues] = useState<any>(null);

  const { data } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(costId),
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
        const fetchedAppraisalType = data?.data?.data?.evaluation_type;

        if (fetchedAppraisalType) {
          setAppraisalType(fetchedAppraisalType);
          console.log('Calling fetchCompsData after setting appraisalType...');
          fetchCostApproachData();
        }
        const fetchedLandDimension = data?.data?.data?.land_dimension;
        if (fetchedLandDimension) {
          setLandDimension(fetchedLandDimension);
        }
      },
    },
  });

  const fetchCostApproachData = async () => {
    try {
      const response = await axios.get(
        `evaluations/get-cost-approach?evaluationId=${id}&evaluationScenarioId=${costId}`
      );
      setCostApproachData(response?.data?.data?.data);
    } catch (error) {
      console.error('Error fetching cost approach data:', error);
    }
  };
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

        // Check if we have cost approach data with existing adjustments
        if (costApproachData) {
          // Use cost_subject_property_adjustments if available, otherwise use default
          if (
            costApproachData.cost_subject_property_adjustments &&
            costApproachData.cost_subject_property_adjustments.length > 0
          ) {
            const formattedOperatingExpenses =
              costApproachData.cost_subject_property_adjustments.map(
                ({ adj_key, adj_value, ...restAdj }: any) => ({
                  ...restAdj,
                  adj_key,
                  adj_value,
                  comparison_basis: adj_value ? adj_value + '%' : 0,
                })
              );
            setAppraisalSpecificAdjustment(formattedOperatingExpenses);
          } else {
            let defaultAttributes = [
              'sale_price',
              'building_size_land_size',
              'zoning_type',
              'services',
              'frontage',
              'price_per_sf_land',
            ];
            if (landDimension === 'ACRE') {
              defaultAttributes = [
                'sale_price',
                'building_size_land_size',
                'zoning_type',
                'services',
                'frontage',
                'price_per_acre',
              ];
            }
            // Use default filtered data
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
          }

          // Use comparison_attributes if available, otherwise use all appraisal data
          if (
            costApproachData.comparison_attributes &&
            costApproachData.comparison_attributes.length > 0
          ) {
            const formattedComparativeAdjustment =
              costApproachData.comparison_attributes.map(
                ({ comparison_key, comparison_value, ...restAdj }: any) => ({
                  ...restAdj,
                  comparison_key,
                  comparison_value,
                  comparison_basis: comparison_value,
                })
              );
            setAllAppraisalType(formattedComparativeAdjustment);
          } else {
            // Use all appraisal data
            const dynamicAllAppraisalTypeData = fetchSpecificApprisalData.map(
              (option: any) => ({
                comparison_key: option.code,
                comparison_value: option.name,
              })
            );
            setAllAppraisalType(dynamicAllAppraisalTypeData);
          }
        } else {
          let defaultAttributes = [
            'sale_price',
            'building_size_land_size',
            'zoning_type',
            'services',
            'frontage',
            'price_per_sf_land',
          ];
          if (landDimension === 'ACRE') {
            defaultAttributes = [
              'sale_price',
              'building_size_land_size',
              'zoning_type',
              'services',
              'frontage',
              'price_per_acre',
            ];
          }
          // Use default filtered data
          const filteredData = fetchSpecificApprisalData?.filter((item: any) =>
            defaultAttributes.includes(item.code)
          );
          // No cost approach data, use defaults
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
        }
      } catch (error) {
        console.error('Error fetching appraisal data:', error);
      }
    };

    fetchAppraisalData();
  }, [appraisalType, costApproachData]);
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
  useEffect(() => {}, [appraisalSpecificAdjustment, allAppraisalTpe]);

  // Store cost approach values in localStorage when form values change
  useEffect(() => {
    if (formValues) {
      const costApproachValues = {
        operatingExpenses: formValues.operatingExpenses,
        appraisalSpecificAdjustment: formValues.appraisalSpecificAdjustment,
        allAppraisalTpe: formValues.allAppraisalTpe,
      };
      localStorage.setItem('costApproachValues', JSON.stringify(costApproachValues));
    }
  }, [formValues]);

  return (
    <>
      {allAppraisalTpe.length && appraisalSpecificAdjustment.length ? (
        <Formik<EvaluationCostApproachFormValues>
          initialValues={{
            tableData: costApproachData?.comps || [],
            operatingExpenses:
              costApproachData?.cost_subject_property_adjustments?.length > 0
                ? costApproachData.cost_subject_property_adjustments.map(
                    ({ adj_key, adj_value, ...rest }: any) => ({
                      adj_key,
                      adj_value,
                      comparison_basis: 0,
                      ...rest,
                    })
                  )
                : [...operatingExpensesInitial],
            appraisalSpecificAdjustment:
              costApproachData?.comparison_attributes?.length > 0
                ? costApproachData.comparison_attributes.map(
                    ({ comparison_key, comparison_value, ...rest }: any) => ({
                      comparison_key,
                      comparison_value,
                      ...rest,
                    })
                  )
                : [...appraisalSpecificAdjustment],
            allAppraisalTpe: [...allAppraisalTpe],
            averaged_adjusted_psf: costApproachData?.averaged_adjusted_psf || 0,
          }}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formikProps: any) => {
            console.log('Formik values:', formikProps.values);
            
            // Update form values state to trigger localStorage update
            if (JSON.stringify(formValues) !== JSON.stringify(formikProps.values)) {
              setFormValues(formikProps.values);
            }

            return (
              <Form className="w-full">
                <EvaluationCostApproach />
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

export default EvaluationCostApproachSubjectPropertyForm;

import { Formik, Form } from 'formik';
import { ResponseType } from '@/components/interface/response-type';
import { RequestType, useMutate } from '@/hook/useMutate';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
import EvaluationCapApproach from './evaluation-cap-approach';

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}

const EvaluationCapApproachForm: React.FC = () => {
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const capId = searchParams.get('capId');

  const [operatingExpensesInitial, setOperatingExpensesInitial] = useState([]);
  const [operatingAllExpensesInitial, setOperatingAllExpensesInitial] =
    useState([]);
  const [allAppraisalTpe, setAllAppraisalType] = useState([]);

  const [salesCompQualitativeAdjustment, setSalesCompQualitativeAdjustment] =
    useState([]);
  const [appraisalSpecificAdjustment, setAppraisalSpecificAdjustment] =
    useState([]);

  const [appraisalType, setAppraisalType] = useState<any>();
  const [comparisonBasis, setComparisonBasis] = useState<any>();
  const { data } = useGet<any>({
    queryKey: 'evaluations/get/',
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(capId),
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
        const fetchedComparisonBasis = data?.data?.data?.comparison_basis;
        if (fetchedComparisonBasis) {
          setComparisonBasis(fetchedComparisonBasis);
        }
        const fetchedAppraisalType = data?.data?.data?.evaluation_type;

        if (fetchedAppraisalType) {
          setAppraisalType(fetchedAppraisalType);
          console.log('Calling fetchCompsData after setting appraisalType...');
          await fetchCompsData();
        }
      },
    },
  });

  useEffect(() => {
    if (!appraisalType) return;

    const fetchAppraisalData = async () => {
      const endPoint = `evaluations/comparative-attributes?evaluation_type=${appraisalType}`;
      try {
        const response = await axios.get(endPoint);
        const fetchSpecificApprisalData = response?.data?.data?.data;

        let defaultAttributes = [
          'sale_price',
          'building_size_land_size',
          'year_built_year_remodeled',
          'property_type',
          'quality_condition',
          'zoning_type',
        ];
        if (comparisonBasis === 'Unit') {
          defaultAttributes = [
            'sale_price',
            'unit',
            'building_size_land_size',
            'year_built_year_remodeled',
            'quality_condition',
            'zoning_type',
          ];
        } else if (comparisonBasis === 'Bed') {
          defaultAttributes = [
            'sale_price',
            'beds',
            'building_size_land_size',
            'year_built_year_remodeled',
            'quality_condition',
            'zoning_type',
          ];
        }
        const filteredData = fetchSpecificApprisalData?.filter((item: any) =>
          defaultAttributes.includes(item.code)
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

  useEffect(() => {
    fetchCompsData();
  }, [data]);

  // Log or use appraisalType anywhere in your component
  useEffect(() => {
    if (appraisalType) {
      console.log('Updated Appraisal Type:', appraisalType); // Logs when appraisalType updates
    }
  }, [appraisalType]);

  const fetchCompsData = async () => {
    try {
      // Step 1: Make the API call
      const response = await axios.get(`globalCodes`, {});

      // Step 2: Check if the data is in the expected structure
      const responseData = response?.data?.data?.data;
      if (!responseData) {
        console.error('Data not found in the API response!');
        return;
      }

      // Step 3: Handle Quantitative Adjustments
      const quantitativeOptions =
        responseData
          .find(
            (item: any) => item.type === 'sales_comp_quantitative_adjustments'
          )
          ?.options.filter(
            (option: any) =>
              option.code !== 'type_my_own' && option.appraisal_default
          ) || [];

      const dynamicOperatingExpenses = quantitativeOptions.map(
        (option: any) => ({
          adj_key: option.code,
          adj_value: option.name,
          appraisal_default: option.appraisal_default,
        })
      );

      setOperatingExpensesInitial(dynamicOperatingExpenses);
      const quantitativeAllOptions =
        responseData
          .find(
            (item: any) => item.type === 'sales_comp_quantitative_adjustments'
          )
          ?.options.filter((option: any) => option.code !== 'type_my_own') ||
        [];

      const dynamicAllOperatingExpenses = quantitativeAllOptions.map(
        (option: any) => ({
          adj_key: option.code,
          adj_value: option.name,
          appraisal_default: option.appraisal_default,
        })
      );

      setOperatingAllExpensesInitial(dynamicAllOperatingExpenses);
      // Step 4: Handle Qualitative Adjustments
      const qualitativeOptions =
        responseData
          .find(
            (item: any) => item.type === 'sales_comp_qualitative_adjustments'
          )
          ?.options.filter((option: any) => option.code !== 'type_my_own') ||
        [];

      const dynamicQualitativeAdjustments = qualitativeOptions.map(
        (option: any) => ({
          adj_key: option.code,
          adj_value: option.name,
        })
      );

      setSalesCompQualitativeAdjustment(dynamicQualitativeAdjustments);

      // Step 5: Handle Appraisal Specific Adjustments
      let appraisalSpecificOptions = [];

      if (appraisalType === 'general') {
        appraisalSpecificOptions =
          responseData
            .find((item: any) => item.type === 'general_comparative_attribute')
            ?.options.filter((option: any) => option.code !== 'type_my_own') ||
          [];
      } else if (appraisalType === 'office') {
        appraisalSpecificOptions =
          responseData
            .find((item: any) => item.type === 'office_comparative_attribute')
            ?.options.filter((option: any) => option.code !== 'type_my_own') ||
          [];
      } else if (appraisalType === 'retail') {
        appraisalSpecificOptions =
          responseData
            .find((item: any) => item.type === 'retail_comparative_attribute')
            ?.options.filter((option: any) => option.code !== 'type_my_own') ||
          [];
      } else if (appraisalType === 'industrial') {
        appraisalSpecificOptions =
          responseData
            .find(
              (item: any) => item.type === 'industrial_comparative_attribute'
            )
            ?.options.filter((option: any) => option.code !== 'type_my_own') ||
          [];
      } else if (appraisalType === 'multi_family') {
        appraisalSpecificOptions =
          responseData
            .find(
              (item: any) => item.type === 'multi_family_comparative_attribute'
            )
            ?.options.filter((option: any) => option.code !== 'type_my_own') ||
          [];
      } else if (appraisalType === 'hospitality') {
        appraisalSpecificOptions =
          responseData
            .find(
              (item: any) =>
                item.type === 'hospitality_hotel_comparative_attribute'
            )
            ?.options.filter((option: any) => option.code !== 'type_my_own') ||
          [];
      } else if (appraisalType === 'storage') {
        appraisalSpecificOptions =
          responseData
            .find((item: any) => item.type === 'storage_comparative_attribute')
            ?.options.filter((option: any) => option.code !== 'type_my_own') ||
          [];
      } else if (appraisalType === 'land') {
        appraisalSpecificOptions =
          responseData
            .find((item: any) => item.type === 'land_comparative_attribute')
            ?.options.filter((option: any) => option.code !== 'type_my_own') ||
          [];
      }

      // Step 6: Map the Appraisal-Specific Options
      const dynamicAppraisalSpecificAdjustments = appraisalSpecificOptions.map(
        (option: any) => ({
          comparison_key: option.code,
          comparison_value: option.name,
        })
      );
      console.log(dynamicAppraisalSpecificAdjustments);
      // setAppraisalSpecificAdjustment(dynamicAppraisalSpecificAdjustments);
    } catch (error) {
      console.error('Error fetching comps data:', error);
    }
  };

  useMutate<ResponseType, any>({
    queryKey: 'create-comp',
    endPoint: 'comps/create',
    requestType: RequestType.POST,
  });

  const handleSubmit = (v: any) => {
    console.log('FORM VALUES', v);
  };

  const isDataLoaded =
    operatingExpensesInitial.length > 0 &&
    salesCompQualitativeAdjustment.length > 0 &&
    appraisalSpecificAdjustment.length > 0;

  return (
    <>
      {isDataLoaded ? (
        <>
          {operatingExpensesInitial.length === 0 &&
          appraisalSpecificAdjustment.length === 0 &&
          salesCompQualitativeAdjustment.length === 0 ? null : (
            <Formik
              initialValues={{
                tableData: [],
                operatingExpenses: [...operatingExpensesInitial],
                operatingAllExpensesInitial: [...operatingAllExpensesInitial],

                salesCompQualitativeAdjustment: [
                  ...salesCompQualitativeAdjustment,
                ],
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
                    <EvaluationCapApproach />
                  </Form>
                );
              }}
            </Formik>
          )}
        </>
      ) : null}
    </>
  );
};

export default EvaluationCapApproachForm;

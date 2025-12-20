import { Formik, Form } from 'formik';
import { ResponseType } from '@/components/interface/response-type';
import { RequestType, useMutate } from '@/hook/useMutate';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
import EvaluationSalesApproach from './evaluation-sales-approach';

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}

const EvaluationSalesApproachForm: React.FC = () => {
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const salesId = searchParams.get('salesId');

  const [operatingExpensesInitial, setOperatingExpensesInitial] = useState([]);
  const [operatingAllExpensesInitial, setOperatingAllExpensesInitial] =
    useState([]);

  const [salesCompQualitativeAdjustment, setSalesCompQualitativeAdjustment] =
    useState([]);
  const [allAppraisalTpe, setAllAppraisalType] = useState([]);
  const [compType, setCompType] = useState<string | null>(null);
  const [ananlysisType, setAnalysisType] = useState<string | null>(null);

  const [compariosnBasis, setComparisonBasis] = useState<string | null>(null);
  const [appraisalSpecificAdjustment, setAppraisalSpecificAdjustment] =
    useState([]);

  const [appraisalType, setAppraisalType] = useState<any>();
  const [salesApproachData, setSalesApproachData] = useState<any>(null);
  const { data } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(salesId),
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
        const fetchedAppraisalType = data?.data?.data?.evaluation_type;
        const comaprisonBasisEvaluation = data?.data?.data?.comparison_basis;
        const compTypeEvaluation = data?.data?.data?.comp_type;
        const analysisTypeEvaluation = data?.data?.data?.analysis_type;
        setAnalysisType(analysisTypeEvaluation);

        setCompType(compTypeEvaluation);
        setComparisonBasis(comaprisonBasisEvaluation);
        if (fetchedAppraisalType) {
          setAppraisalType(fetchedAppraisalType);
          await fetchCompsData();
        }
      },
    },
  });

  // Fetch sales approach data
  const { data: salesApproachResponse } = useGet<any>({
    queryKey: `evaluations/get-sales-approach-${id}-${salesId}`,
    endPoint: `evaluations/get-sales-approach?evaluationId=${id}&evaluationScenarioId=${salesId}`,
    config: {
      enabled: Boolean(id) && Boolean(salesId),
      refetchOnWindowFocus: false,
      onSuccess: (response: any) => {
        setSalesApproachData(response?.data?.data);
      },
    },
  });
  console.log(salesApproachResponse);
  useEffect(() => {
    if (!appraisalType) return;

    const fetchAppraisalData = async () => {
      // console.log('compbasissss', compariosnBasis);
      const endPoint = `evaluations/comparative-attributes?evaluation_type=${appraisalType}`;
      try {
        const response = await axios.get(endPoint);
        const fetchSpecificApprisalData = response?.data?.data?.data;

        let defaultAttributes: string[] = [];

        if (compariosnBasis === 'Unit') {
          defaultAttributes = [
            'sale_price',
            'unit',
            'building_size_land_size',
            'property_type',
            'year_built_year_remodeled',
            'quality_condition',
            'zoning_type',
            'dollar_per_unit',
            'property_type',
          ];
        } else if (
          compariosnBasis === 'SF' &&
          data?.data?.data?.comp_type === 'building_with_land'
        ) {
          defaultAttributes = [
            'sale_price',
            'building_size_land_size',
            'property_type',
            'year_built_year_remodeled',
            'quality_condition',
            'zoning_type',
            'price_per_sf',
          ];
        } else if (compariosnBasis === 'Bed') {
          defaultAttributes = [
            'sale_price',
            'beds',
            'property_type',
            'building_size_land_size',
            'year_built_year_remodeled',
            'quality_condition',
            'zoning_type',
            'dollar_per_bed',
          ];
        } else if (ananlysisType === '$/SF' && compType === 'land_only') {
          defaultAttributes = [
            'sale_price',
            'land_size_sf',
            'utilities_select',
            'topography',
            'shape',
            'zoning_type',
            'price_per_sf_land',
            'land_type',
            'lot_shape',
          ];
        } else if (ananlysisType === '$/Acre' && compType === 'land_only') {
          defaultAttributes = [
            'sale_price',
            'land_type',
            'land_size_acre',
            'utilities_select',
            'topography',
            'shape',
            'zoning_type',
            'price_per_acre',
            'lot_shape',
          ];
        }

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
              option.code !== 'type_my_own' && option.evaluation_default
          ) || [];

      const dynamicOperatingExpenses = quantitativeOptions.map(
        (option: any) => ({
          adj_key: option.code,
          adj_value: option.name,
          evaluation_default: option.evaluation_default,
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
          evaluation_default: option.evaluation_default,
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
          <Formik
            initialValues={{
              tableData: [],
              operatingExpenses:
                !salesApproachData?.subject_property_adj ||
                salesApproachData?.subject_property_adj.length === 0
                  ? [...operatingExpensesInitial]
                  : salesApproachData.subject_property_adj,
              operatingAllExpensesInitial: [...operatingAllExpensesInitial],
              salesCompQualitativeAdjustment:
                !salesApproachData?.subject_qualitative_adjustments ||
                salesApproachData?.subject_qualitative_adjustments.length === 0
                  ? [...salesCompQualitativeAdjustment]
                  : salesApproachData.subject_qualitative_adjustments,
              appraisalSpecificAdjustment:
                !salesApproachData?.sales_comparison_attributes ||
                salesApproachData?.sales_comparison_attributes.length === 0
                  ? [...appraisalSpecificAdjustment]
                  : salesApproachData.sales_comparison_attributes,
              allAppraisalTpe: [...allAppraisalTpe],
              averaged_adjusted_psf:
                salesApproachData?.averaged_adjusted_psf || 0,
            }}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(values: any) => {
              console.log('valuee', values);

              return (
                <Form className="w-full">
                  <EvaluationSalesApproach />
                </Form>
              );
            }}
          </Formik>
        </>
      ) : null}
    </>
  );
};

export default EvaluationSalesApproachForm;

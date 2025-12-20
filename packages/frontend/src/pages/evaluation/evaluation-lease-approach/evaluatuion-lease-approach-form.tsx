import { Formik, Form } from 'formik';
import { ResponseType } from '@/components/interface/response-type';
import { RequestType, useMutate } from '@/hook/useMutate';
import { useEffect, useState } from 'react';
import axios from 'axios';
import EvaluationLeaseApproach from './evaluation-lease-approach';
import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}

const EvaluationLeaseApproachForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const leaseId = searchParams.get('leaseId');

  const [compType, setCompType] = useState<string | null>(null);

  const [appraisalType, setAppraisalType] = useState<string | null>(null);
  const [operatingExpensesInitial, setOperatingExpensesInitial] = useState([]);
  const [ananlysisType, setAnalysisType] = useState<string | null>(null);

  const [compariosnBasis, setComparisonBasis] = useState<string | null>(null);
  const [allAppraisalTpe, setAllAppraisalType] = useState([]);
  const [salesCompQualitativeAdjustment, setSalesCompQualitativeAdjustment] =
    useState([]);
  const [appraisalSpecificAdjustment, setAppraisalSpecificAdjustment] =
    useState([]);

  const { data } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(leaseId),
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
        }
      },
    },
  });
  console.log(data, 'data');
  const defaultOperatingExpensesInitial = [
    { adj_key: 'time', adj_value: 'Time', comparison_basis: 0 },
    {
      adj_key: 'operating_exp',
      adj_value: 'Operating Expenses',
      comparison_basis: 0,
    },
    { adj_key: 'location', adj_value: 'Location', comparison_basis: 0 },
    {
      adj_key: 'construction',
      adj_value: 'Construction',
      comparison_basis: 0,
    },
    { adj_key: 'condition', adj_value: 'Condition', comparison_basis: 0 },
    { adj_key: 'type', adj_value: 'Type/Use', comparison_basis: 0 },

    {
      adj_key: 'economies_of_scale',
      adj_value: 'Economies Of Scale',
      comparison_basis: 0,
    },
  ];
  useEffect(() => {
    const fetchComposData = async () => {
      try {
        const response = await axios.get(`globalCodes`);
        if (response?.data?.data?.data) {
          const quantitativeOptions = response.data.data.data
            .find((item: any) => item.type === 'lease_quantitative_adjustments')
            ?.options.filter((option: any) => option.code !== 'type_my_own');

          const dynamicOperatingExpenses = (quantitativeOptions || []).map(
            (option: any) => ({
              adj_key: option.code,
              adj_value: option.name,
            })
          );

          setOperatingExpensesInitial(
            dynamicOperatingExpenses || defaultOperatingExpensesInitial
          );

          const qualitativeOptions = response.data.data.data
            .find(
              (item: any) => item.type === 'sales_comp_qualitative_adjustments'
            )
            ?.options.filter((option: any) => option.code !== 'type_my_own');

          const dynamicQualitativeAdjustments = (qualitativeOptions || []).map(
            (option: any) => ({
              adj_key: option.code,
              adj_value: option.name,
            })
          );

          setSalesCompQualitativeAdjustment(dynamicQualitativeAdjustments);
        }
      } catch (error) {
        console.error('Error fetching comps data:', error);
      }
    };

    fetchComposData();
  }, []);

  useEffect(() => {
    if (!appraisalType) return;

    const fetchAppraisalData = async () => {
      try {
        const endPoint = `evaluations/comparative-attributes?evaluation_type=${appraisalType}`;
        const response = await axios.get(endPoint);
        const fetchSpecificApprisalData = response?.data?.data?.data;

        let defaultAttributes: string[] = [];
        // debugger;

        if (compariosnBasis === 'Unit') {
          defaultAttributes = [
            'lease_type',
            'space',
            'term',
            'year_built_year_remodeled',
            'quality_condition',
            'zoning_type',
            'dollar_per_unit',
            'unit'
          ];
        } else if (
          compariosnBasis === 'SF' &&
          data?.data?.data?.comp_type === 'building_with_land'
        ) {
          defaultAttributes = [
            'lease_type',
            'term',
            'building_size_land_size',
            'space',
            'year_built_year_remodeled',
            'quality_condition',
            'zoning_type',
            'price_sf_per_year',
          ];
        } else if (compariosnBasis === 'Bed') {
          defaultAttributes = [
            'lease_type',
            'term',
            'beds',
            'space',
            'year_built_year_remodeled',
            'quality_condition',
            'zoning_type',
            'dollar_per_bed',
          ];
        } else if (ananlysisType === '$/SF' && compType === 'land_only') {
          defaultAttributes = [
            'lease_type',
            'term',
            'land_size_sf',
            'space',
            'quality_condition',
            'zoning_type',
            'price_sf_per_year',
          ];
        } else if (ananlysisType === '$/Acre' && compType === 'land_only') {
          defaultAttributes = [
            'lease_type',
            'term',
            'land_size_acre',
            'space',
            'quality_condition',
            'zoning_type',
            'price_acre_per_year',
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
    appraisalSpecificAdjustment.length > 0 &&
    allAppraisalTpe.length > 0;

  return (
    <>
      {isDataLoaded ? (
        <Formik
          initialValues={{
            tableData: [],
            operatingExpenses: [...operatingExpensesInitial],
            salesCompQualitativeAdjustment: [...salesCompQualitativeAdjustment],
            appraisalSpecificAdjustment: [...appraisalSpecificAdjustment],
            allAppraisalTpe: [...allAppraisalTpe],
            averaged_adjusted_psf: 0,
          }}
          onSubmit={handleSubmit}
        >
          {(formikProps) => {
            console.log('leasevalues', formikProps.values);
            return (
              <Form className="w-full">
                <EvaluationLeaseApproach />
              </Form>
            );
          }}
        </Formik>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default EvaluationLeaseApproachForm;

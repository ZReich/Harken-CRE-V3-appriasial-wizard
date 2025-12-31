import { Formik, Form } from 'formik';
import { ResponseType } from '@/components/interface/response-type';
import { RequestType, useMutate } from '@/hook/useMutate';
import { useEffect, useState } from 'react';
import axios from 'axios';
import EvaluationLeaseFilterHeaderOptions from './evaluation-lease-filter-menu-options-map-side';
import EvaluationLeaseFilterMapHeaderOptions from './evaluation-lease-filter-menu-option';

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}

const EvaluationLeaseApproachAiCompsForm: React.FC = () => {
  console.log('EvaluationLeaseApproachAiCompsForm component loaded');
  
  const [operatingExpensesInitial, setOperatingExpensesInitial] = useState([]);
  const [salesCompQualitativeAdjustment, setSalesCompQualitativeAdjustment] =
    useState([]);

  useEffect(() => {
    fetchComposData();
  }, []);

  const fetchComposData = async () => {
    try {
      // Make the API call using axios
      const response = await axios.get(`globalCodes`, {});
      console.log('dropdownFields', response);

      if (response?.data?.data?.data) {
        // Handle Quantitative Adjustments
        const activeType = localStorage.getItem('activeType');
        console.log('ActiveType in lease form:', activeType);
        
        const quantitativeType = activeType === 'land_only'
          ? 'land_lease_quantitative_adjustments'
          : 'lease_quantitative_adjustments';
        
        console.log('QuantitativeType selected for lease form:', quantitativeType);

        // Filter for quantitative adjustments
        const quantitativeOptions = response.data.data.data
          .find((item: any) => item.type === quantitativeType)
          ?.options.filter((option: any) => option.code !== 'type_my_own')
          .sort((a: any, b: any) => {
            if (a.default_order === null && b.default_order === null) return 0;
            if (a.default_order === null) return 1;
            if (b.default_order === null) return -1;
            return a.default_order - b.default_order;
          });

        console.log('Lease form quantitative options found:', quantitativeOptions);

        const dynamicOperatingExpenses = (quantitativeOptions || []).map(
          (option: any) => ({
            adj_key: option.code,
            adj_value: option.name,
            evaluation_default: option.evaluation_default,
            default_order: option.default_order,
          })
        );

        console.log('Dynamic lease operating expenses:', dynamicOperatingExpenses);
        setOperatingExpensesInitial(dynamicOperatingExpenses);

        // Filter for qualitative adjustments
        const qualitativeOptions = response.data.data.data
          .find(
            (item: any) => item.type === 'sales_comp_qualitative_adjustments'
          )
          ?.options.filter((option: any) => option.code !== 'type_my_own');

        const dynamicQualitativeAdjustments = (qualitativeOptions || []).map(
          (option: any) => ({
            adj_key: option.code,
            adj_value: option.name,
            evaluation_default: option.evaluation_default,
            default_order: option.default_order,
          })
        );

        setSalesCompQualitativeAdjustment(dynamicQualitativeAdjustments);
      }
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
  const activeType = localStorage.getItem('activeType');

  return (
    <>
      {operatingExpensesInitial.length === 0 &&
      salesCompQualitativeAdjustment.length === 0 ? null : (
        <Formik
          initialValues={{
            tableData: [],
            operatingExpenses: [...operatingExpensesInitial],
            salesCompQualitativeAdjustment: [...salesCompQualitativeAdjustment],
            averaged_adjusted_psf: 0,
          }}
          onSubmit={handleSubmit}
        >
          {() => {
            return (
              <Form className="w-full">
                {activeType === 'building_with_land' ? (
                  <EvaluationLeaseFilterHeaderOptions />
                ) : (
                  <EvaluationLeaseFilterMapHeaderOptions />
                )}
              </Form>
            );
          }}
        </Formik>
      )}
    </>
  );
};

export default EvaluationLeaseApproachAiCompsForm;

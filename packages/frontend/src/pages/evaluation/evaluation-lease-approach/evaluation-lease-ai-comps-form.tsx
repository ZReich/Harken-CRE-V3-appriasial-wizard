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
        // Filter for quantitative adjustments
        const quantitativeOptions = response.data.data.data
          .find((item: any) => item.type === 'lease_quantitative_adjustments')
          ?.options.filter((option: any) => option.code !== 'type_my_own');

        const dynamicOperatingExpenses = (quantitativeOptions || []).map(
          (option: any) => ({
            adj_key: option.code,
            adj_value: option.name,
          })
        );

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

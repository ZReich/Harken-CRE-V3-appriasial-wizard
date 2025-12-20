import { ResponseType } from '@/components/interface/response-type';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import ResidentialFilterLandMapHeaderOptions from './residential-sales-filter-menu-options-map-side';
import ResidenatialFilterMapHeaderOptions from './residential-sales-filter-menu-options';
import { useSearchParams } from 'react-router-dom';

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}
interface OperatingExpense {
  adj_name: string;
  adj_key: string;
  adj_value: string | number;
  appraisal_default: boolean;
}

const ResidentialSalesCompsApproach: React.FC = () => {
  console.log('rederingggggg');
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const salesId = searchParams.get('salesId');

  // const [operatingExpensesInitial, setOperatingExpensesInitial] = useState([]);
  const [operatingAllExpensesInitial, setOperatingAllExpensesInitial] =
    useState([]);
  const [allAppraisalTpe, setAllAppraisalType] = useState([]);
  const [operatingExpensesInitial, setOperatingExpensesInitial] = useState<
    OperatingExpense[]
  >([]);

  const [salesCompQualitativeAdjustment, setSalesCompQualitativeAdjustment] =
    useState([]);
  const [appraisalSpecificAdjustment, setAppraisalSpecificAdjustment] =
    useState([]);

  const [appraisalType, setAppraisalType] = useState<any>();

  const { data } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: {
      enabled: Boolean(salesId),
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
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
    const fetchAppraisalData = async () => {
      const endPoint = `res-evaluations/get/${id}`;

      try {
        const response = await axios.get(endPoint);
        console.log(response, 'responseee');
        // const fetchSpecificApprisalData =
        //   response.data?.data?.data?.appraisal_type;
        // console.log(
        //   'fetchSpecificApprisalData---',
        //   response.data?.data?.data?.appraisal_type
        // );
        setAppraisalType(response.data?.data?.data?.evaluation_type);
        // Extract items with `default === 1`.da
      } catch (error) {
        console.error('Error fetching appraisal data:', error);
      }
    };
    fetchAppraisalData();
  }, []);

  useEffect(() => {
    if (!appraisalType) return;

    const fetchAppraisalData = async () => {
      const endPoint = `res-evaluations/comparative-attributes?evaluation_type=${appraisalType}`;
      try {
        const response = await axios.get(endPoint);
        const fetchSpecificApprisalData = response?.data?.data?.data;

        const filteredData = fetchSpecificApprisalData?.filter(
          (item: any) => item?.default === 1
        );
        setAppraisalSpecificAdjustment(filteredData);

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
      // const quantitativeOptions =
      //   responseData
      //     .find(
      //       (item: any) => item.type === 'sales_comp_quantitative_adjustments'
      //     )
      //     ?.options.filter(
      //       (option: any) =>
      //         option.code !== 'type_my_own' && option.appraisal_default
      //     ) || [];

      // Use static fields for operating expenses instead of API data
      const staticOperatingExpenses = [
        {
          adj_name: 'Time',
          adj_key: 'time',
          adj_value: '',
          appraisal_default: true,
        },

        {
          adj_name: 'Location',
          adj_key: 'location',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Gross Living Area SF',
          adj_key: 'gross_living_area_sf',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Basement',
          adj_key: 'basement',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Basement Finished',
          adj_key: 'basement_finished',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Basement Unfinished',
          adj_key: 'basement_unfinished',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Land Size',
          adj_key: 'land_size',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Year Built',
          adj_key: 'year_built',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Bedrooms',
          adj_key: 'bedrooms',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Bathrooms',
          adj_key: 'bathrooms',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Garage',
          adj_key: 'garage',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Heating And Cooling',
          adj_key: 'heating_cooling',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Fencing',
          adj_key: 'fencing',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Fireplace',
          adj_key: 'fireplace',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Other Amenities',
          adj_key: 'other_amenities',
          adj_value: 0.0,
          appraisal_default: true,
        },
        {
          adj_name: 'Condition',
          adj_key: 'condition',
          adj_value: 0.0,
          appraisal_default: true,
        },
      ];

      setOperatingExpensesInitial(staticOperatingExpenses);
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
    operatingExpensesInitial?.length > 0 &&
    salesCompQualitativeAdjustment?.length > 0 &&
    appraisalSpecificAdjustment?.length > 0;

  const activeType = localStorage.getItem('activeType');
  console.log(operatingExpensesInitial?.length);
  console.log(salesCompQualitativeAdjustment?.length);
  console.log(appraisalSpecificAdjustment?.length);

  return (
    <>
      {/* {alert('helloooo')} */}
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
                console.log('values', values);

                return (
                  <Form className="w-full">
                    {activeType === 'building_with_land' ? (
                      <ResidenatialFilterMapHeaderOptions />
                    ) : (
                      <ResidentialFilterLandMapHeaderOptions />
                    )}
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

export default ResidentialSalesCompsApproach;

import React, { useEffect, useState } from 'react';
import { calculateAdjustedMonthlyValue } from './evaluation-multi-family-approach-comps-card';



export const getMinMaxMultiFamilyValues = (values: any, appraisalData: any) => {
  if (!values?.tableData || values.tableData.length === 0) {
    return { min: 0, max: 0 };
  }

  // Calculate adjusted monthly values for all table data entries
  const adjustedValues = values.tableData
    .map((_: any, index: number) =>
      calculateAdjustedMonthlyValue(values, index, appraisalData)
    )
    .filter((val: any) => val !== null && val !== undefined && val !== 0);

  if (adjustedValues.length === 0) {
    return { min: 0, max: 0 };
  }

  const min = Math.min(...adjustedValues);
  const max = Math.max(...adjustedValues);

  return { min, max };
};

// Usage example

// const { min, max } = getMinMaxMultiFamilyValues();

import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import { Button, Grid, Typography } from '@mui/material';
import { useGet } from '@/hook/useGet';
import { FieldArray, useFormikContext } from 'formik';
import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import axios from 'axios';
import TextEditor from '@/components/styles/text-editor';
import defaultPropertImage from '../../../images/default-placeholder.png';
import { options, usa_state } from '@/pages/comps/comp-form/fakeJson';
import {
  conditionOptions,
  //   frontageOptions,
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  // propertyOptions,
  residentialOptions,
  retailOptions,
  specialOptions,
  topographyOptions,
  //   utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import loadingImage from '../../../images/loading.png';
import EvaluationMultiFamilyCompCard from './evaluation-multi-family-approach-comps-card';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import EvaluationUploadMUltiFamilyCompsModal from './evaluation-multi-family-upload-comps-pdf';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import EvaluationAiMultiFamilyCompsTable from './evaluation-multi-family-approach-ai-comp-table';
import SelectTextField from '@/components/styles/select-input';
import { AppraisalEnum } from '@/pages/appraisal/set-up/setUpEnum';
import CommonButton from '@/components/elements/button/Button';
import SubjectPropertyComparitiveAttributes from '@/utils/subject-property-comparitive.attributes';
import { capitalizeWords, formatPrice, formatValue } from '@/utils/sanitize';
import { propertyTypeOptions } from '@/pages/my-profile/significant-transaction/select-option/Select';
import {
  ListingHeaderEnum,
  
  ListingEnum,
  CreateCompsEnum,
  BuildingDetailsEnum,
  MenuOptionsEnum,
  LocalStorageKeysEnum,
  PayloadFieldsEnum,
 } from '@/pages/comps/enum/CompsEnum';

export const calculateCompData = ({
  total,
  weight,
  comp,
  // appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;

  // Calculate adjusted_psf using the requested formula
  const updatedAdjustedPsf =
    (price_square_foot / total) * ListingEnum.HUNDRED + price_square_foot;

  const updatedAverageAdjustedPsf = (updatedAdjustedPsf * weight) / ListingEnum.HUNDRED;
  const updatedBlendedPsf = (price_square_foot * weight) / ListingEnum.HUNDRED;

  return {
    adjusted_psf: updatedAdjustedPsf,
    averaged_adjusted_psf: updatedAverageAdjustedPsf,
    blended_adjusted_psf: updatedBlendedPsf,
    weight,
    total,
  };
};

export const getExpensesTotal = (
  expenses: any,
  expenseIndex: any,
  newExpenseValue: any
) => {
  let total: number = 0;

  if (expenseIndex !== ListingEnum.UNDEFINED) {
    const exp = expenses[expenseIndex];

    if (exp) {
      exp.adj_value = newExpenseValue;
      expenses[expenseIndex] = exp;
    }
  }

  expenses?.forEach((exp: { adj_value: any }) => {
    total += parseFloat(exp.adj_value);
  });

  return { total, expenses };
};

const EvaluationMultiFamilyApproach: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [comparativeFactors, setComparativeFactors] = useState<any[]>([]);
  const [maxUnitCount, setMaxUnitCount] = useState<number>(0);

  const [appraisalId, setAppraisalId] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [landDimesion, setLandDimension] = useState('');
  const { handleChange, values, setValues } = useFormikContext<any>();

  const [landDimensions, setLandDimensions] = useState<any>(null);
  const costId = searchParams.get('evaluationId');
  // const [loader,setLoader]=useState(false);
  // const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [hasIncomeType, setHasIncomeType] = React.useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [costName, setCostName] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [salesNote, setSalesNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [openComps, setCompsOpen] = useState(false);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [comparisonBasis, setComparisonBasis] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [compsLength, setCompsLength] = useState('');
  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [hasCostType, setHasCostType] = React.useState(false);
  const [filtereCostdData, setFilteredCostsData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  const [hasLeaseType, setHasLeaseType] = React.useState(false);
  const [hasRentRollType, setHasRentRollType] = React.useState(false);
  const [hasMultiFamilyType, setHasMultiFamilyType] = React.useState(false);

  const [filtereLeasedData, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereRentRollData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereMultiFamilyData, setFilteredMultiFamilyData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const location = useLocation();
  const updatedCompss = location.state?.updatedComps;
  const updatedCompsMultiFamily = location.state?.updatedCompsMultiFamily;
  const [hasProcessedComps, setHasProcessedComps] = useState(false);
  const [hasProcessedMultiFamilyComps, setHasProcessedMultiFamilyComps] =
    useState(false);
  const [rentRollData, setRentRollData] = useState<
    Array<{
      sq_ft: number;
      beds: number;
      baths: number;
      unit_count: number;
      avg_monthly_rent: number;
    }>
  >([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLabelFromValue = (value: any) => {
    // If the value is empty, null, or '--Select a Subtype--', return an empty string
    if (!value || value === ListingEnum.SELECT_A_SUBTYPE) {
      return '';
    }

    const allOptions = [
      ...retailOptions,
      ...officeOptions,
      ...industrialOptions,
      ...multifamilyOptions,
      ...hospitalityOptions,
      ...specialOptions,
      ...residentialOptions,
      ...conditionOptions,
      ...topographyOptions,
      ...propertyTypeOptions,
    ];
    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label
    }

    // If no match, capitalize the first letter of each word
    return capitalizeWords(value);
  };
  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // });

  const {
    data: areaInfoData,
    refetch,
    isLoading,
  } = useGet<any>({
    queryKey: `evaluations/get`,
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(costId),
      refetchOnWindowFocus: false,
      onSuccess(data: any) {
        setLandDimension(data?.data?.data?.land_dimension); // Set the land dimension
        const landDimension = data?.data?.data?.land_dimension;

        const mapData = data?.data?.data?.scenarios;

        if (mapData.length > ListingEnum.ONE) {
          mapData &&
            mapData.map((item: any) => {
              if (item.id == costId) {
                setCostName(item.name);
              }
            });
        }

        const appraisalApproach = data?.data?.data?.scenarios?.find(
          (approach: any) =>
            costId ? approach.id == parseFloat(costId) : false
        );

        // Find the 'cover' image in the appraisal_files array
        const coverImage = data?.data?.data?.evaluation_files?.find(
          (file: any) => file.title === 'cover'
        );
        const propertyUnits = data?.data?.data?.property_units || [];
        const comparisonBasis = data?.data?.data?.comparison_basis;
        setComparisonBasis(comparisonBasis);

        const maxUnitCount = propertyUnits.reduce(
          (max: number, unit: any) => Math.max(max, unit?.sq_ft || ListingEnum.ZERO),
          0
        );
        setMaxUnitCount(maxUnitCount); // Assuming setMaxUnitCount is your state setter
        // Construct the URL and set the global state
        if (coverImage) {
          const imageUrl = coverImage.dir;
          setCoverImageUrl(imageUrl);
        }
        setLandDimensions(landDimension);

        const appraisalSalesApproachId = appraisalApproach
          ? appraisalApproach.evaluation_multi_family_approach?.id
          : null;

        if (appraisalSalesApproachId) {
          fetchComposData(values, setValues);
        }
      },
    },
  });
  // API FOR GET RECENT PAGE URL
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-position',
    endPoint: `evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      const response = await mutateAsync({
        position: ApiUrl,
      });
      console.log('Update successful:', response);
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync, costId]);
  // Use useEffect to react to changes in landDimension
  useEffect(() => {}, [landDimesion]); // This will run whenever landDimension changes
  useEffect(() => {
    if (!comparativeFactors || comparativeFactors.length === ListingEnum.ZERO) {
      const newComparativeFactors = values.allAppraisalTpe.map(
        (option: any) => ({
          value: option.comparison_key,
          label: option.comparison_value,
        })
      );
      setComparativeFactors(newComparativeFactors);
    }
  }, [values.appraisalSpecificAdjustment, comparativeFactors]);
  useEffect(() => {
    refetch();
  }, [refetch, costId]);

  useEffect(() => {
    if (
      areaInfoData?.data?.data?.evaluation_approaches &&
      !areaInfoData.isStale
    ) {
      const updateData = areaInfoData.data.data.evaluation_approaches;
      const salesApproaches = updateData.filter(
        (item: { type: string }) => item.type === PayloadFieldsEnum.SALE
      );
      setHasSaleType(salesApproaches.length > ListingEnum.ZERO);
      setFilteredSalesData(salesApproaches);

      const incomeApproaches = updateData.filter(
        (item: { type: string }) => item.type === BuildingDetailsEnum.INCOME
      );
      setHasIncomeType(incomeApproaches.length > ListingEnum.ZERO);
      setFilteredData(incomeApproaches);

      const costApproaches = updateData.filter(
        (item: { type: string }) => item.type === BuildingDetailsEnum.COST
      );
      setHasCostType(costApproaches.length > ListingEnum.ZERO);
      setFilteredCostsData(costApproaches);

      const leaseApproaches = updateData.filter(
        (item: { type: string }) => item.type === PayloadFieldsEnum.LEASE
      );
      setHasLeaseType(leaseApproaches.length > ListingEnum.ZERO);
      setFilteredLeaseData(leaseApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === PayloadFieldsEnum.RENT_ROLL
      );

      setHasRentRollType(rentRollApproaches.length > ListingEnum.ZERO);
      setFilteredRentRollData(rentRollApproaches);
      const multiFamilyApproaches = updateData.filter(
        (item: { type: string }) => item.type === BuildingDetailsEnum.MULTIFAMILY
      );

      setHasMultiFamilyType(multiFamilyApproaches.length > ListingEnum.ZERO);
      setFilteredMultiFamilyData(multiFamilyApproaches);
    }
  }, [areaInfoData?.data?.data?.evaluation_approaches]);

  // FETCHING ATTRIBUTES OF APPRAISALS
  const appraisalData = areaInfoData?.data.data || {};
  const { min, max } = getMinMaxMultiFamilyValues(values, appraisalData);

  const includedUtilities = appraisalData?.evaluation_included_utilities
    ?.map((item: any) => item.utility)
    .join(', ');

  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[appraisalData.state];
  const appraisalApproach = areaInfoData?.data?.data?.scenarios?.find(
    (approach: any) => (costId ? approach.id == parseFloat(costId) : false)
  );

  const appraisalSalesApproachId =
    appraisalApproach?.evaluation_multi_family_approach?.id || null;
  console.log('appraisalApproach:', appraisalApproach);
  console.log('appraisalSalesApproachId:', appraisalSalesApproachId);
  // FUNCTION TO FETCH COMPS DATA
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `evaluations/get-multi-family-approach?evaluationId=${id}&evaluationScenarioId=${costId}`,
        {}
      );
      if (response?.data?.data?.statusCode === ListingEnum.TWO_HUNDRED) {
      }
      const compsArr = response?.data?.data?.data?.comps;
      setCompsLength(compsArr?.length || ListingEnum.ZERO);

      localStorage.setItem(
        'compsLengthmultifamilyevaluation',
        compsArr.length || ListingEnum.ZERO
      );

      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      const salesNoteForComp = response?.data?.data?.data?.notes;

      setSalesNote(salesNoteForComp);
      setAppraisalId(appraisalSalesApproachResponseId);
      if (response?.data?.data?.data == null) {
        setValues({
          ...values,
          tableData: [],
          operatingExpenses: values.operatingExpenses,
        });
      }

      const formattedOperatingExpenses =
        response?.data?.data?.data.subject_property_adjustments.map(
          ({ adj_key, adj_value, ...restAdj }: any) => {
            return {
              ...restAdj,
              comparison_basis: adj_value ? adj_value + '%' : ListingEnum.ZERO,
              adj_key: adj_key,
              adj_value: adj_value,
            };
          }
        );
      const formattedComparativeAdjustment =
        response?.data?.data?.data.comparison_attributes.map(
          ({ comparison_key, comparison_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: comparison_key
              ? comparison_value
              : comparison_value,
            comparison_key,
            comparison_value,
          })
        );
      const calculatedComps = []; // Array to store calculated comp data
      for (let i = 0; i < compsArr.length; i++) {
        const c = compsArr[i];
        const weight = c?.weight;
        const total = c?.total_adjustment;
        const appData = appraisalData;

        // Calculate comp data
        const calculatedCompData = calculateCompData({
          total: total,
          weight: weight,
          comp: c?.comp_details,
          appraisalData: appData,
        });

        // Format expenses
        const formattedExpenses = formattedOperatingExpenses.map((oe: any) => {
          const newValue = c.comps_adjustments.find(
            (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
          );

          const isCustom = !options.some(
            (option: { value: any }) => option.value === newValue.adj_value
          );
          return {
            ...oe,
            adj_key: newValue.adj_key,
            adj_value: newValue.adj_value || ListingEnum.ZERO,
            customType: isCustom,
          };
        });
        const avgpsf =
          (total / ListingEnum.HUNDRED) * c?.comp_details?.price_square_foot +
          c?.comp_details?.price_square_foot;
        const finalavgpsf = (avgpsf * weight) / ListingEnum.HUNDRED;

        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          expenses: formattedExpenses,
          id: c.id,
          avg_monthly_rent: c.avg_monthly_rent,
          property_unit_id: c.property_unit_id,
          comp_id: c.comp_id,
          averaged_adjusted_psf: finalavgpsf,
          blended_adjusted_psf: c.blended_adjusted_psf,
          weight: c.weight,
          total: c.total_adjustment,
          adjustment_note: c?.adjustment_note,
          adjusted_psf: c?.adjusted_psf,
        });
      }

      // Set combined values in state once
      setValues({
        ...values,
        tableData: calculatedComps,
        operatingExpenses: formattedOperatingExpenses,
        appraisalSpecificAdjustment: formattedComparativeAdjustment,
      });

      setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      // Handle the error
    }
  };

  // Fetch rent roll data
  const fetchRentRollData = async () => {
    try {
      const response = await axios.get(
        `evaluations/get-rent-roll?evaluationId=${id}&evaluationScenarioId=${costId}`
      );
      if (
        response?.data?.data?.statusCode === ListingEnum.TWO_HUNDRED &&
        response?.data?.data?.data?.rent_rolls
      ) {
        const rentRolls = response.data.data.data.rent_rolls;

        // Extract sq_ft, beds, and baths values
        const extractedData = rentRolls.map((item: any) => ({
          sq_ft: item.sq_ft,
          beds: item.beds,
          baths: item.baths,
          unit_count: item.unit_count,
          avg_monthly_rent: item.avg_monthly_rent,
        }));

        // Set the data to state
        setRentRollData(extractedData);
        return extractedData;
      }
    } catch (error) {
      console.error(ListingEnum.ERROR_FETCHIN_RENT_DATA, error);
    }
  };
  useEffect(() => {
    fetchComposData(values, setValues);
    const getRentRollData = async () => {
      await fetchRentRollData();
    };
    getRentRollData();
  }, [costId]);

  useEffect(() => {
    if (values.operatingExpenses && values.appraisalSpecificAdjustment) {
      const salesApproachValues = {
        operatingExpenses: values.operatingExpenses,
        appraisalSpecificAdjustment: values.appraisalSpecificAdjustment,
      };
      localStorage.setItem(
        'multiFamilyApproachValues',
        JSON.stringify(salesApproachValues)
      );
    }
  }, [
    values.operatingExpenses,
    values.salesCompQualitativeAdjustment,
    values.appraisalSpecificAdjustment,
  ]);

  // VARIABLE TO GET COMPS TABLEDATA LENGTH
  const tableLength = values.tableData.length;
  // FUCNTION TO CALCULATE WEIGHTAGE OF EACH COMPS
  const calculateWeightage = (totalCards: number): string => {
    if (totalCards <= ListingEnum.ZERO) {
      return 'NA';
    }
    const weightage = (ListingEnum.HUNDRED / totalCards).toFixed(2) + '%';
    return weightage;
  };

  const weightage = calculateWeightage(tableLength);
  // Setting operating expenses adjustments from get-data

  function transformOperatingExpensesToAdjustments(operatingExpenses: any[]) {
    return operatingExpenses?.map((expense) => ({
      adj_key: expense?.adj_key?.toLowerCase()?.replace(/\s+/g, '_'),
      adj_value: expense?.adj_value,
    }));
  }
  const subject_property_adjustments = transformOperatingExpensesToAdjustments(
    values.operatingExpenses
  );
  function transformComparitiveAdjustment(appraisalSpecificAdjustment: any[]) {
    return appraisalSpecificAdjustment?.map((expense) => ({
      comparison_key: expense?.comparison_key
        ?.toLowerCase()
        ?.replace(/\s+/g, '_'),
      comparison_value: expense?.comparison_value,
    }));
  }

  const sales_comparison_attributes = transformComparitiveAdjustment(
    values.appraisalSpecificAdjustment
  );

  // function to calculate comps-adjustments data
  const calculateTotalNewAdjustmentData = (
    tableData: any[],
    weightage: string
  ): number => {
    const itemWeightage = parseFloat(weightage);

    const totalNewData = tableData.reduce((total: number, item: any) => {
      // Calculate total comparison basis
      let totalCompBasis = 0;
      item.expenses?.forEach((exp: any) => {
        const expNum = exp.comparison_basis
          ? +exp.comparison_basis.split('%')[0]
          : ListingEnum.ZERO;
        totalCompBasis += expNum;
      });

      const adjustedPricepercentage =
        item.price_square_foot +
        (totalCompBasis / ListingEnum.HUNDRED) * item.price_square_foot;

      const newDataTotal = (adjustedPricepercentage * itemWeightage) / 100;

      return total + newDataTotal;
    }, 0);

    return totalNewData;
  };

  let totalaveragedadjustedpsf = 0;
  values.tableData.forEach((comp: { adjusted_psf: string; weight: any }) => {
    if (comp.adjusted_psf) {
      // Parse the adjusted_psf to a float for calculation
      const adjustedPsfValue = parseFloat(comp.adjusted_psf);

      // Calculate the weighted value and accumulate it
      totalaveragedadjustedpsf += adjustedPsfValue * (comp.weight / ListingEnum.HUNDRED);
    }
  });

  // Example usage
  const totalNewDatas = calculateTotalNewAdjustmentData(
    values.tableData,
    weightage
  );
  console.log('Total New Data:', totalNewDatas.toFixed(2));
  // variable for total sales values
  const FinalResult = totalaveragedadjustedpsf * appraisalData.land_size;
  let totalWeightage = 0;

  values.tableData.forEach((comp: { weight: string }) => {
    if (comp.weight) {
      totalWeightage += parseFloat(comp.weight);
    }
  });
  // comps data
  const comps = values.tableData?.map((item: any, index: number) => {
    const comps_adjustments =
      item.expenses?.map((exp: any) => ({
        adj_key: exp.adj_key,
        adj_value: exp.adj_value,
      })) || [];

    const comp_id = item.comp_id || item.id;

    return {
      ...(appraisalSalesApproachId ? { id: item.id } : {}),

      comp_id: comp_id,
      adjusted_montly_val: item.adjusted_montly_val,

      order: index + 1,
      total_adjustment: item?.total,
      property_unit_id: item.property_unit_id,
      avg_monthly_rent: item.avg_monthly_rent,
      adjusted_psf: isNaN(item.adjusted_psf) ? ListingEnum.ZERO : item.adjusted_psf,
      weight: parseFloat(item.weight),

      comps_adjustments: comps_adjustments,
    };
  });

  const salesApproachData = {
    ...(appraisalId ? { id: appraisalId } : {}),
    //   'id':appraisalId,
    evaluation_scenario_id: costId ? parseFloat(costId) : null,

    notes: salesNote,
    comparison_attributes: sales_comparison_attributes,

    subject_property_adjustments: subject_property_adjustments,
    comps: comps,
  };

  const finalData = {
    evaluation_id: id ? parseFloat(id) : null,
    multi_family_approach: salesApproachData,
  };

  const mutation = useMutate<any, any>({
    queryKey: 'save-multi-family-approach',
    endPoint: 'evaluations/save-multi-family-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'update-multi-family-approach',
    endPoint: 'evaluations/update-multi-family-approach',
    requestType: RequestType.POST,
  });

  const handleSubmit = async () => {
    setLoader(true);
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
        // fetchComposData(values,setValues)

        fetchComposData(values, setValues);
      } else {
        // Add API

        const modifiedPayload = {
          ...finalData,
          multi_family_approach: {
            ...finalData.multi_family_approach,
            comps: finalData.multi_family_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        toast.success(response.data.message);
        setLoader(false);
        navigate(
          `/evaluation/multi-family-comps-map?id=${id}&evaluationId=${costId}`
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  localStorage.setItem(
    'costValuePerUnit',
    (FinalResult / appraisalData.building_size).toString()
  );
  localStorage.setItem('costValuePerUnitForWeightage', FinalResult.toString());

  const handleNextClick = () => {
    handleSubmit();
  };

  const handleBackClick = () => {
    if (hasCostType && filtereCostdData.length > ListingEnum.ONE) {
      //   const costIndex = filtereCostdData.findIndex(
      //     (element) => element.id == costId
      //   );
    }

    if (hasLeaseType) {
      navigate(
        `/evaluation/lease-comps-map?id=${id}&leaseId=${filtereLeasedData?.[filtereLeasedData.length - ListingEnum.ONE]?.id}`
      );
      return;
    }

    if (hasSaleType) {
      navigate(
        `/evaluation/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - ListingEnum.ONE]?.id}`
      );
      return;
    }

    if (hasRentRollType) {
      navigate(
        `/evaluation/rent-roll?id=${filtereRentRollData?.[filtereRentRollData.length - ListingEnum.ONE]?.id}&evaluationId=${id}`
      );
      return;
    }
    if (hasMultiFamilyType) {
      navigate(
        `/evaluation/multi-family-approach?id=${id}&appraisalId=${filtereMultiFamilyData?.[filtereMultiFamilyData.length - ListingEnum.ONE]?.id}`
      );
      return;
    }

    if (hasIncomeType) {
      navigate(
        `/evaluation/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - ListingEnum.ONE]?.id}`
      );
      return;
    }

    navigate(`/evaluation/area-info?id=${id}`);
  };

  const uploadComps = () => {
    localStorage.setItem('compsLengthmultifamilyevaluation', compsLength);

    navigate(
      `/evaluation/upload-multi-family-comps?id=${id}&evaluationId=${costId}`,
      {
        state: {
          operatingExpenses: values.operatingExpenses,
        },
      }
    );
  };
  const handleNavigateToComp = async (itemId: any) => {
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
        // fetchComposData(values,setValues)

        fetchComposData(values, setValues);
      } else {
        // Add API

        const modifiedPayload = {
          ...finalData,
          multi_family_approach: {
            ...finalData.multi_family_approach,
            comps: finalData.multi_family_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }
      if (response && response.data && response.data.message) {
        navigate(
          `/evaluation/update-multi-family-comps/${itemId}/${id}/multiFamily/${costId}`
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };
  useEffect(() => {
    if (updatedCompss && !hasProcessedComps) {
      setTimeout(() => {
        passCompsDataToFilter(updatedCompss);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
        setHasProcessedComps(true);
      }, 2000);
    }
  }, [updatedCompss, hasProcessedComps]);

  const passCompsDataToFilterMultiFamily = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      // Check if we're at the 4 comp limit
      if (oldValues.tableData.length >= 4) {
        toast.error(ListingEnum.MAXIMUM_FOUR_COMPS);
        return oldValues;
      }

      // Filter out comps that would exceed the limit
      const availableSlots = 4 - oldValues.tableData.length;
      const compsToAdd = comps.slice(0, availableSlots);

      if (compsToAdd.length < comps.length) {
        toast.warning(
          `Only ${compsToAdd.length} comp(s) added due to 4 comp limit.`
        );
      }

      // Format new comps to match existing structure
      const formattedNewComps = compsToAdd.map((comp: any) => ({
        ...comp,
        expenses: values.operatingExpenses.map((oe: any) => ({
          ...oe,
          adj_value: 0,
        })),
      }));

      const totalComps = [...oldValues.tableData, ...formattedNewComps];
      const newInitialWeight: number = ListingEnum.HUNDRED / totalComps.length;
      let count = 0;
      const updatedComps = totalComps.map((comp) => {
        count++;
        if (totalComps.length === ListingEnum.THREE && count === totalComps.length) {
          comp.weight = 33.34;
        } else {
          comp.weight = newInitialWeight.toFixed(2);
        }

        const expenses = [...(comp.expenses || [])];

        const { total } = getExpensesTotal(expenses, '', '');

        const calculatedCompData = calculateCompData({
          total,
          weight: comp.weight,
          comp,
          appraisalData,
        });

        const updatedCompData = {
          ...comp,
          ...calculatedCompData,
        };
        return updatedCompData;
      });

      const totalAverageAdjustedPsf = updatedComps.reduce((acc, item) => {
        return acc + item.averaged_adjusted_psf;
      }, 0);

      // Call submit with updated comps after state update
      setTimeout(() => {
        handleSubmitWithUpdatedComps(updatedComps);
      }, 100);

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });
  };

  useEffect(() => {
    if (updatedCompsMultiFamily && !hasProcessedMultiFamilyComps) {
      setTimeout(() => {
        passCompsDataToFilterMultiFamily(updatedCompsMultiFamily);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
        setHasProcessedMultiFamilyComps(true);
      }, 2000);
    }
  }, [updatedCompsMultiFamily, hasProcessedMultiFamilyComps]);

  // function for handle delete comp
  const handleDeleteComp = async () => {
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
        toast.success(response.data.message);
        // fetchComposData(values,setValues)

        fetchComposData(values, setValues);
      } else {
        // Add API

        const modifiedPayload = {
          ...finalData,
          multi_family_approach: {
            ...finalData.multi_family_approach,
            comps: finalData.multi_family_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };
  const handleAddNewComp = () => {
    localStorage.setItem(LocalStorageKeysEnum.CHECK_STATUS, LocalStorageKeysEnum.SALES);
    localStorage.removeItem(LocalStorageKeysEnum.SELECTED_TOGGLE);
    localStorage.removeItem(LocalStorageKeysEnum.VIEW);
    localStorage.setItem(LocalStorageKeysEnum.COMPS_LENGTH_MULTIFAMILY_EVALUATION, compsLength);
    localStorage.setItem(LocalStorageKeysEnum.COMPARISON_BASIS_VIEW, comparisonBasis);

    // localStorage.setItem('activeType', 'land_only');
    // setIsOpen(true);
    navigate(
      `/evaluation/filter-multi-family-comps?id=${id}&approachId=${costId}`,
      {
        state: {
          comparisonBasis: comparisonBasis,
          compsLength: compsLength,
        },
      }
    );
  };

  const handleLinkExistingComps = () => {
    navigate(
      `/evaluation/multi-family/create-comp?id=${id}&approachId=${costId}`,
      {
        state: {
          comparisonBasis: comparisonBasis,
          compsLength: compsLength,
        },
      }
    );
  };

  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    try {
      console.log('areaInfoData', areaInfoData);

      // Get fresh appraisal approach data
      const currentAppraisalApproach =
        areaInfoData?.data?.data?.scenarios?.find((approach: any) =>
          costId ? approach.id == parseFloat(costId) : false
        );
      const currentAppraisalSalesApproachId =
        currentAppraisalApproach?.evaluation_multi_family_approach?.id ||
        appraisalId ||
        null;

      console.log('currentAppraisalSalesApproachId:', areaInfoData);
      console.log('appraisalId from state:', appraisalId);

      // Create updated comps data
      const updatedCompsData = updatedComps.map((item: any, index: number) => {
        const comps_adjustments =
          item.expenses?.map((exp: any) => ({
            adj_key: exp.adj_key,
            adj_value: exp.adj_value,
          })) || [];

        const comp_id = item.comp_id || item.id;
        return {
          // ...(currentAppraisalSalesApproachId ? { id: item.id } : {}),
          comp_id: comp_id,
          order: index + 1,
          adjustment_note: item?.adjustment_note,
          total_adjustment: item?.total,
          adjusted_psf: isNaN(item.adjusted_psf) ? ListingEnum.ZERO : item.adjusted_psf,
          weight: parseFloat(item.weight),
          comps_adjustments: comps_adjustments,
        };
      });

      const updatedSalesApproachData = {
        ...(currentAppraisalSalesApproachId
          ? { id: currentAppraisalSalesApproachId }
          : {}),
        evaluation_scenario_id: costId ? parseFloat(costId) : null,
        notes: salesNote ? salesNote : null,
        comparison_attributes: sales_comparison_attributes,
        subject_property_adjustments: subject_property_adjustments,
        comps: updatedCompsData,
      };

      const updatedFinalData = {
        evaluation_id: id ? parseFloat(id) : null,
        multi_family_approach: updatedSalesApproachData,
      };

      let response;
      if (currentAppraisalSalesApproachId) {
        response = await mutations.mutateAsync(updatedFinalData);
        fetchComposData(values, setValues);
      } else {
        const modifiedPayload = {
          ...updatedFinalData,
          multi_family_approach: {
            ...updatedFinalData.multi_family_approach,
            comps: updatedFinalData.multi_family_approach.comps,
          },
        };
        response = await mutation.mutateAsync(modifiedPayload);
        if (response?.data?.data?.id) {
          console.log('New approach ID:', response.data.data.id);
          fetchComposData(values, setValues);
        }
      }

      if (response && response.data && response.data.message) {
        // toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };
  // function for pass comp data to advance filter
  const passCompsDataToFilter = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = ListingEnum.HUNDRED / totalComps.length;
      let count = 0;

      const updatedComps = totalComps.map((comp) => {
        // comp.weight = newInitialWeight;
        count++;
        if (totalComps.length === ListingEnum.THREE && count === totalComps.length) {
          comp.weight = 33.34;
        } else {
          comp.weight = newInitialWeight.toFixed(2);
        }

        const expenses = [...comp.expenses];

        const { total } = getExpensesTotal(expenses, '', '');

        const calculatedCompData = calculateCompData({
          total,
          weight: comp.weight,
          comp,
          appraisalData,
        });

        const updatedCompData = {
          ...comp,
          ...calculatedCompData,
        };

        return updatedCompData;
      });

      const totalAverageAdjustedPsf = updatedComps.reduce((acc, item) => {
        return acc + item.averaged_adjusted_psf;
      }, ListingEnum.ZERO);

      // Call API with updated comps after state update
      setTimeout(() => {
        handleSubmitWithUpdatedComps(updatedComps);
      }, ListingEnum.HUNDRED);

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });
  };
  const handleDeleteCard = (index: number) => {
    setValues((oldValues: { tableData: any }) => {
      const updatedTableData = oldValues.tableData.filter(
        (_: any, innerIndex: number) => index !== innerIndex
      );

      const newInitialWeight = updatedTableData.length
        ? ListingEnum.HUNDRED / updatedTableData.length
        : ListingEnum.ZERO;
      let count = 0;

      const updatedComps = updatedTableData.map((comp: any) => {
        count++;
        if (
          updatedTableData.length === ListingEnum.THREE &&
          count === updatedTableData.length
        ) {
          comp.weight = 33.34;
        } else {
          comp.weight = newInitialWeight.toFixed(2);
        }

        const expenses = [...comp.expenses];
        const { total } = getExpensesTotal(expenses, '', '');
        const calculatedCompData = calculateCompData({
          total,
          weight: comp.weight,
          comp,
          appraisalData,
        });

        return {
          ...comp,
          ...calculatedCompData,
        };
      });

      const totalAverageAdjustedPsf = updatedComps.reduce(
        (acc: any, item: any) => acc + item.averaged_adjusted_psf,
        0
      );

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });

    setIsDeleted(true);
    // setIsOpen(false);
  };

  useEffect(() => {
    if (isDeleted) {
      handleDeleteComp();
      setIsDeleted(false);
    }
  }, [isDeleted]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || loading || loader) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  const passCompsDataToFilter1 = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = ListingEnum.HUNDRED / totalComps.length;
      let count = 0;

      const updatedComps = totalComps.map((comp) => {
        // comp.weight = newInitialWeight;
        count++;
        if (totalComps.length === 3 && count === totalComps.length) {
          comp.weight = 33.34;
        } else {
          comp.weight = newInitialWeight.toFixed(2);
        }

        const expenses = [...comp.expenses];

        const { total } = getExpensesTotal(expenses, '', '');

        const calculatedCompData = calculateCompData({
          total,
          weight: comp.weight,
          comp,
          appraisalData,
        });

        const updatedCompData = {
          ...comp,
          ...calculatedCompData,
        };

        return updatedCompData;
      });

      const totalAverageAdjustedPsf = updatedComps.reduce((acc, item) => {
        return acc + item.averaged_adjusted_psf;
      }, 0);

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });
  };
  return (
    <EvaluationMenuOptions
      onNextClick={handleNextClick}
      onBackClick={handleBackClick}
    >
      {openComps && (
        <EvaluationUploadMUltiFamilyCompsModal
          open={openComps}
          onClose={() => setCompsOpen(false)}
          setCompsModalOpen={setCompsModalOpen}
          compsLength={compsLength}
          setCompsData={setCompsData}
          compsData={compsData ?? []} // Avoid passing null where an array is needed
        />
      )}
      {compsModalOpen && (
        <EvaluationAiMultiFamilyCompsTable
          passCompsData={passCompsDataToFilter1}
          compsLength={compsLength}
          open={compsModalOpen}
          onClose={() => setCompsModalOpen(false)} // Close CompsForm on click
          compsData={compsData}
          handleClose={() => setCompsModalOpen(false)} // ✅ Add missing prop
        />
      )}
      <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
        <Typography
          variant="h1"
          component="h2"
          className="text-xl font-bold uppercase"
        >
          {ListingEnum.MULTI_FAMILY_APPROACH} <span>{costName ? `(${costName})` : ''}</span>
        </Typography>

        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">
            {CreateCompsEnum.VALUE_OF_PROPERTY}{' '}
          </span>
        </div>
      </div>
      {/* <div className="overflow-auto h-[calc(100vh-280px)]"> */}
      <div className="flex flex-wrap space-x-1.5 xl:px-[44px] px-[15px]">
        <div className="flex flex-col w-[15.5%]">
          <h3 className="px-1 py-5 text-base capitalize invisible font-semibold">
            {CreateCompsEnum.SUBJECT_PROPERTY}
          </h3>
          <div className="lg:p-4 p-2 !pt-0 bg-white flex-1">
            <div className="max-w-full h-[160px]"></div>
            <div className="p-2">
              <div className="flex h-[20px] gap-2 items-center"></div>
              <h2 className="text-gray-500  text-xs font-bold mt-0 min-h-[40px] mt-2 overflow-hidden whitespace-nowrap text-ellipsis">
                {CreateCompsEnum.LOCATION}
              </h2>
              {/* <p className="pb-1 text-xs font-bold">Date Sold </p> */}
            </div>
            <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {MenuOptionsEnum.PROPERTY_TYPE}
              </p>
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {ListingEnum.BED_BATH}
              </p>

              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {CreateCompsEnum.INCLUDE_UTILITIES}
              </p>
              {/* <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                Parking
              </p>
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                Year Built/ Remodeled
              </p>
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                Condition
              </p> */}
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {CreateCompsEnum.RENTAL_RATES_DOLLAR_PER_MONTH}
              </p>
            </div>
            <div className="p-1 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <FieldArray
                name="appraisalSpecificAdjustment"
                render={() => (
                  <>
                    {values.appraisalSpecificAdjustment &&
                    values.appraisalSpecificAdjustment.length > ListingEnum.ZERO ? (
                      values.appraisalSpecificAdjustment.map(
                        (zone: any, i: number) => (
                          <div
                            className="flex items-center quantitate-items justify-between gap-1 h-[20px]"
                            key={i}
                          >
                            <Grid
                              item
                              className="dropdown min-w-[calc(100%-36px)] manageDropdownField w-full"
                            >
                              <SelectTextField
                                className="manage-dropdown"
                                name={`appraisalSpecificAdjustment.${i}.comparison_key`}
                                value={zone.comparison_key}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input = e.target.value;
                                  const label = comparativeFactors.find(
                                    (item: any) => item.value === input
                                  );
                                  setValues((old: any) => {
                                    const appraisalSpecificAdjustment =
                                      old.appraisalSpecificAdjustment.map(
                                        (expense: any, index: number) =>
                                          index === i
                                            ? {
                                                ...expense,
                                                comparison_key: input,
                                                comparison_value: label.label,
                                              }
                                            : expense
                                      );

                                    const compsWithNewAdj = old.tableData.map(
                                      (comp: any) => ({
                                        ...comp,
                                        expenses: comp.expenses.map(
                                          (exp: any, expIndex: number) =>
                                            expIndex === i
                                              ? {
                                                  ...exp,
                                                  comparison_key: input,
                                                }
                                              : exp
                                        ),
                                      })
                                    );

                                    return {
                                      ...old,
                                      appraisalSpecificAdjustment,
                                      tableData: compsWithNewAdj,
                                    };
                                  });
                                }}
                                options={comparativeFactors}
                              />
                            </Grid>
                            <Grid item className="min-w-[36px]">
                              <div className="flex flex-row items-center">
                                {values.appraisalSpecificAdjustment.length >
                                  ListingEnum.ONE && (
                                  <Icons.RemoveCircleOutlineIcon
                                    className="text-red-500 cursor-pointer"
                                    style={{
                                      width: '14px',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                      setValues((old: any) => {
                                        const appraisalSpecificAdjustment =
                                          old.appraisalSpecificAdjustment.filter(
                                            (_: any, index: number) =>
                                              index !== i
                                          );

                                        return {
                                          ...old,
                                          appraisalSpecificAdjustment,
                                          // tableData: updatedTableData,
                                        };
                                      });
                                    }}
                                  />
                                )}
                                {i ===
                                  values.appraisalSpecificAdjustment.length -
                                    ListingEnum.ONE && (
                                  <Icons.AddCircleOutlineIcon
                                    style={{ width: '14px' }}
                                    className="ml-1 text-[#0da1c7] cursor-pointer"
                                    onClick={() => {
                                      setValues((old: any) => ({
                                        ...old,
                                        appraisalSpecificAdjustment: [
                                          ...old.appraisalSpecificAdjustment,
                                          {
                                            comparison_key: '', // No default selected
                                            comparison_value: '', // Start adj_value as empty
                                          },
                                        ],
                                      }));
                                    }}
                                  />
                                )}
                              </div>
                            </Grid>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm font-bold text-gray-500">
                        {CreateCompsEnum.NO_APPRAISAL}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            {/* ------------------------------------------------------------------------------- */}
            <div className="mt-2 px-1 pb-0.5">
              <FieldArray
                name="operatingExpenses"
                render={() => (
                  <>
                    {values.operatingExpenses &&
                    values.operatingExpenses.length > ListingEnum.ZERO ? (
                      values.operatingExpenses.map((zone: any, i: number) => (
                        <div
                          className="flex items-center h-[18px] justify-between gap-1"
                          key={i}
                        >
                          <Grid item className="min-w-[calc(100%-36px)] w-full">
                            <StyledField
                              name={`operatingExpenses.${i}.adj_key`}
                              style={{
                                borderBottomWidth: '1px',
                                color: 'black',
                                padding: '0px',
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                function cleanString(str: string) {
                                  return str
                                    .replace(/[^a-zA-Z0-9\s]/g, '')
                                    .replace(/\s+/g, '_')
                                    .toLowerCase();
                                }
                                const input = e.target.value;

                                const key = cleanString(e.target.value);

                                setValues(
                                  (old: {
                                    operatingExpenses: any;
                                    tableData: any[];
                                  }) => {
                                    const operatingExpenses =
                                      old.operatingExpenses;
                                    const newAdj = {
                                      adj_key: key,
                                      adj_value: input,
                                      comparison_basis: 0,
                                    };

                                    operatingExpenses[i] = newAdj;
                                    const compsWithNewAdj = old.tableData.map(
                                      (comp) => {
                                        const updatedExpenses =
                                          comp.expenses.map(
                                            (
                                              exp: { adj_key: any },
                                              expIndex: number
                                            ) => {
                                              if (expIndex === i) {
                                                exp.adj_key = key;
                                              }

                                              return exp;
                                            }
                                          );

                                        return {
                                          ...comp,
                                          expenses: updatedExpenses,
                                        };
                                      }
                                    );

                                    return {
                                      ...old,
                                      tableData: compsWithNewAdj,
                                    };
                                  }
                                );
                              }}
                              value={zone.adj_value}
                              type="text"
                              label={''}
                            />
                          </Grid>

                          <Grid item className="min-w-[36px]">
                            <div className="flex flex-row items-center">
                              <div
                                onClick={() => {
                                  setValues(
                                    (old: {
                                      operatingExpenses: any[];
                                      tableData: any[];
                                    }) => {
                                      const updatedOperatingExpenses =
                                        old.operatingExpenses.filter(
                                          (_: any, index: number) => index !== i
                                        );

                                      const compsWithUpdatedExpenses =
                                        old.tableData.map((comp) => {
                                          const updatedExpenses =
                                            comp.expenses.filter(
                                              (_: any, expIndex: number) =>
                                                expIndex !== i
                                            );

                                          const newTotal =
                                            updatedExpenses.reduce(
                                              (
                                                acc: any,
                                                item: { adj_value: any }
                                              ) => acc + item.adj_value,
                                              0
                                            );

                                          // Add the calculatedCompData logic here
                                          const weight = comp.weight;
                                          const calculatedCompData =
                                            calculateCompData({
                                              total: newTotal,
                                              weight,
                                              comp,
                                              appraisalData,
                                            });

                                          const updatedCompData = {
                                            ...comp,
                                            ...calculatedCompData,
                                            expenses: [...updatedExpenses],
                                            total: newTotal,
                                          };

                                          return updatedCompData;
                                        });

                                      const totalAverageAdjustedPsf =
                                        compsWithUpdatedExpenses.reduce(
                                          (acc: any, item: any) =>
                                            acc + item.averaged_adjusted_psf,
                                          0
                                        );

                                      return {
                                        ...old,
                                        operatingExpenses:
                                          updatedOperatingExpenses,
                                        tableData: compsWithUpdatedExpenses,
                                        averaged_adjusted_psf:
                                          totalAverageAdjustedPsf,
                                      };
                                    }
                                  );
                                }}
                              >
                                <Icons.RemoveCircleOutlineIcon
                                  style={{ width: '14px' }}
                                  className="text-red-500 cursor-pointer"
                                />
                              </div>

                              {i === values.operatingExpenses.length - 1 && (
                                <div
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setValues(
                                      (old: {
                                        operatingExpenses: any[];
                                        tableData: any[];
                                      }) => {
                                        old.operatingExpenses.push({
                                          adj_key: '',
                                          adj_value: '',
                                        });

                                        const compsWithNewAdj =
                                          old.tableData.map((comp) => {
                                            comp.expenses.push({
                                              adj_key: '',
                                              adj_value: 0,
                                              comparison_basis: 0,
                                            });

                                            return comp;
                                          });

                                        return {
                                          ...old,
                                          comps: [...compsWithNewAdj],
                                        };
                                      }
                                    );
                                  }}
                                >
                                  <Icons.AddCircleOutlineIcon
                                    style={{ width: '14px' }}
                                    className="ml-2 text-[#0da1c7]"
                                  />
                                </div>
                              )}
                            </div>
                          </Grid>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-gray-500">
                        {CreateCompsEnum.NO_OPERATING_EXPENSES}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            {/* //-----------------------------------------------------------------------------------? */}

            <div className="pt-2 space-y-2 flex flex-col gap-[2px] border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="text-xs h-[18px] !m-0 font-semibold italic text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.ADJUSTED_RENTAL_RATES}{' '}
              </p>
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.ADJUSTED_COMP_RANGE}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[15.5%]">
          <h3 className="py-5 text-base capitalize font-semibold">
            {CreateCompsEnum.SUBJECT_PROPERTY}
          </h3>
          <div className="bg-[#f1f3f4] flex-1 w-full">
            <div className="max-w-full h-[160px]">
              <img
                className="w-full h-[160px] object-cover"
                src={
                  coverImageUrl
                    ? import.meta.env.VITE_S3_URL + coverImageUrl
                    : defaultPropertImage
                }
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = defaultPropertImage;
                }}
                alt="building img"
              />
            </div>
            <div className="p-2">
              <div className="flex h-[20px] gap-2 items-center"></div>
              <div className="min-h-[40px] mt-2">
                <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  {appraisalData.street_address || 'No address available'}
                </h2>
                <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  {appraisalData.city ? appraisalData.city + ', ' : ''}
                  {appraisalData.state
                    ? appraisalData.state.toUpperCase() + ', '
                    : ''}
                  {appraisalData.zipcode || ''}
                </h2>
              </div>
              {/* <p className="text-xs text-[#687F8B] pb-1 font-medium overflow-hidden whitespace-nowrap text-ellipsis">
                {'\u00A0'}
              </p> */}
            </div>
            <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {appraisalData?.zonings?.length > ListingEnum.ZERO ? (
                  <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                    {getLabelFromValue(appraisalData.zonings[0]?.zone)} /{' '}
                    {getLabelFromValue(appraisalData.zonings[0]?.sub_zone)}
                    {/* {getLabelFromValue(appraisalData.zonings[0]?.sub_zone)} */}
                  </p>
                ) : null}
              </p>
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {rentRollData && rentRollData.length > ListingEnum.ZERO
                  ? rentRollData
                      .map((item, index) => {
                        const sqFt = item.sq_ft
                          ? formatValue(item.sq_ft) + ' ' + 'SF'
                          : 'N/A';
                        const beds = formatValue(item.beds) ?? 'N/A';
                        const baths = formatValue(item.baths) ?? 'N/A';
                        return `${index > ListingEnum.ZERO ? ', ' : ''}(${sqFt}) ${beds}/${baths}`;
                      })
                      .join('')
                  : APPROACHESENUMS.SPACE}
              </p>
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {includedUtilities}
              </p>
              {/* <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {appraisalData.parking}
              </p>

              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {appraisalData.year_built
                  ? appraisalData.year_built
                  : APPROACHESENUMS.SPACE}
                {appraisalData.year_built && appraisalData.year_remodeled
                  ? ' / '
                  : ''}
                {appraisalData.year_remodeled
                  ? appraisalData.year_remodeled
                  : APPROACHESENUMS.SPACE}
              </p>

              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {getLabelFromValue(appraisalData.condition)}
              </p> */}

              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"></p>
            </div>
            <div className="p-1 space-y-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              {values.appraisalSpecificAdjustment?.length > 0 ? (
                <SubjectPropertyComparitiveAttributes
                  values={values}
                  appraisalData={appraisalData}
                  landDimensions={landDimensions}
                  fullStateName={fullStateName}
                  getLabelFromValue={getLabelFromValue}
                  maxUnitCount={maxUnitCount}
                />
              ) : (
                Array.from(
                  { length: values.appraisalSpecificAdjustment?.length },
                  (_, i) => (
                    <p
                      key={i}
                      className="text-xs font-bold text-transparent"
                      style={{ lineHeight: '0rem!important' }}
                    >
                      {CreateCompsEnum.NO_DATA}
                    </p>
                  )
                )
              )}
            </div>
            <div className="pb-1 mt-2 min-h-[26px] border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
              {values.operatingExpenses?.length > ListingEnum.ZERO
                ? values.operatingExpenses.map((index: number) => (
                    <p
                      key={index}
                      className={`text-xs h-[18px] font-bold text-ellipsis overflow-hidden whitespace-nowrap ${!appraisalData.operatingExpenses?.[index]?.names ? 'text-transparent' : ''}`}
                    >
                      {appraisalData.operatingExpenses?.[index]?.names ||
                        CreateCompsEnum.NO_DATA}
                    </p>
                  ))
                : Array.from(
                    { length: values.operatingExpenses?.length },
                    (_, i) => (
                      <p
                        key={i}
                        className="text-sm font-bold text-transparent"
                        style={{ lineHeight: '0rem!important' }}
                      >
                        {CreateCompsEnum.NO_DATA}
                      </p>
                    )
                  )}
            </div>

            <div className="mt-2 px-1 space-y-2 flex flex-col gap-[2px] pb-2">
              <p className="italic text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap invisible">
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>
              <p className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap"></p>

              <p className="text-xs text-gray-500 h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap font-bold  uppercase">
                {formatPrice(min || ListingEnum.ZERO) + ' - ' + formatPrice(max)}
              </p>
            </div>
          </div>
        </div>
        {values.tableData?.map((item: any, index: any) => (
          <EvaluationMultiFamilyCompCard
            index={index}
            handleChange={handleChange}
            item={item}
            values={values}
            key={item.id}
            totalCards={values.tableData?.length}
            handleDelete={handleDeleteCard}
            dimension={landDimensions}
            handleNavigateToComp={handleNavigateToComp}
            handleDeleteComp={handleDeleteComp}
            appraisalData={appraisalData}
          />
        ))}

        {values.tableData.length == 4 ? null : (
          <div className="flex flex-col items-center p-4 bg-white mt-16 space-y-4 w-[15.5%]">
            {/* Add Comps Button */}
            <div
              onClick={handleAddNewComp}
              className="flex flex-col items-center justify-center w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer"
            >
              <Icons.LinkIcon
                className="text-[#0DA1C7]"
                style={{ fontSize: '40px' }}
              />
              <Typography
                variant="h6"
                className="text-gray-600 text-sm font-semibold mt-2"
              >
                {CreateCompsEnum.LINK_EXISTING_COMPS}{' '}
              </Typography>
            </div>
            <div
              onClick={handleLinkExistingComps}
              className="flex flex-col items-center justify-center xl:w-full w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer"
            >
              <div className="cursor-pointer">
                <Icons.AddCircleIcon
                  className="text-[#0DA1C7] text-xl"
                  style={{ fontSize: '35px' }}
                />
              </div>
              <Typography
                variant="h5"
                className="cursor-pointer text-[#0DA1C7] text-sm font-bold p-0"
                gutterBottom
              >
                {CreateCompsEnum.ADD_COMPS}
              </Typography>
            </div>

            {/* Upload Comp Button */}
            <div
              onClick={uploadComps}
              className="flex flex-col items-center justify-center xl:w-full w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer"
            >
              <Icons.ImportIcon
                className="text-[#0DA1C7]"
                style={{ fontSize: '40px' }}
              />
              <Typography
                variant="h6"
                className="text-gray-600 text-sm font-semibold mt-2"
              >
                {ListingHeaderEnum.IMPORT_COMP}
              </Typography>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5 z-10">
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            // Get all scenarios

            navigate(`/evaluation/rent-roll?id=${id}&evaluationId=${costId}`);
          }}
          className="appraisal-previous-button text-xs p-3 text-white font-medium"
        >
          <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
        </Button>

        <CommonButton
          type="submit"
          variant="contained"
          color="primary"
          size="small"
          style={{ width: '300px', fontSize: '14px' }}
          onClick={handleSubmit}
        >
          {AppraisalEnum.SAVE_AND_CONTINUE}
          <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
        </CommonButton>
        {showScrollTop && (
          <Button
            id="backToTop"
            color="primary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              fontSize: '24px',
              cursor: 'pointer',
              border: 'none',
              padding: '0px',
            }}
          >
            ↑
          </Button>
        )}
      </div>

      <div className="xl:px-[60px] mt-14 pb-32 px-[15px]">
        <h4 className="text-gray-800 text-xs font-medium font-bold">{CreateCompsEnum.NOTES}</h4>
        <TextEditor
          editorData={(content) => setSalesNote(content)}
          editorContent={
            salesNote ||
            '<strong>Even</strong>: No Adjustment, Similar to Subject Property. <strong>Minus</strong>: Downward adjustment, Better than/Superior to Subject Property. <strong>Plus</strong>: Upward Adjustment Poorer than/Inferior to Subject Property.'
          }
          value={salesNote} // Ensure the 'value' prop is provided
        />
      </div>
    </EvaluationMenuOptions>
  );
};

export default EvaluationMultiFamilyApproach;

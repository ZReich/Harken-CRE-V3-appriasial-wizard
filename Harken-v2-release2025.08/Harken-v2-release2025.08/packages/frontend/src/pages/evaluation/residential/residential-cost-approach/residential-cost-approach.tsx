import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
import TextEditor from '@/components/styles/text-editor';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { options, usa_state } from '@/pages/comps/comp-form/fakeJson';
import {
  conditionOptions,
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  residentialOptions,
  retailOptions,
  specialOptions,
  topographyOptions,
} from '@/pages/comps/create-comp/SelectOption';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Grid, Typography } from '@mui/material';
import axios from 'axios';
import { FieldArray, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import defaultPropertImage from '../../../../images/default-placeholder.png';
import SelectTextField from '@/components/styles/select-input';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import loadingImage from '../../../../images/loading.png';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import ResidentialAiCostCompsTable from './residential-cost-approach-ai-comp-table';
import ResidentialCostCompCard from './residential-cost-approach-comps-card';
import ResidentialUploadCostCompsModal from './residential-upload-comps-pdf';
import { capitalizeWords } from '@/utils/sanitize';
import { ListingHeaderEnum } from '@/pages/comps/enum/CompsEnum';

export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  let landSize = comp.land_size;
  if (appraisalData.land_dimension == 'SF' && comp.land_dimension === 'ACRE') {
    landSize = comp.land_size * 43560;
  } else if (
    appraisalData.land_dimension == 'ACRE' &&
    comp.land_dimension === 'SF'
  ) {
    landSize = parseFloat((comp.land_size / 43560).toFixed(3));
  }

  let updatedAdjustedPsf;
  if (appraisalData?.comp_adjustment_mode === 'Dollar') {
    if (
      appraisalData.land_dimension == 'SF' &&
      comp.land_dimension === 'ACRE'
    ) {
      updatedAdjustedPsf = total + comp.sale_price / (comp.land_size * 43560);
    } else if (
      appraisalData.land_dimension == 'ACRE' &&
      comp.land_dimension === 'SF'
    ) {
      updatedAdjustedPsf =
        total +
        comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3));
    } else {
      updatedAdjustedPsf = total + comp.sale_price / comp.land_size;
    }
  } else {
    if (
      appraisalData.land_dimension == 'SF' &&
      comp.land_dimension === 'ACRE'
    ) {
      updatedAdjustedPsf =
        (total / 100) * (comp.sale_price / (comp.land_size * 43560)) +
        comp.sale_price / (comp.land_size * 43560);
    } else if (
      appraisalData.land_dimension == 'ACRE' &&
      comp.land_dimension === 'SF'
    ) {
      updatedAdjustedPsf =
        (total / 100) *
          (comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3))) +
        comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3));
    } else {
      const landPricePerUnit = comp.sale_price / landSize;
      updatedAdjustedPsf = (total / 100) * landPricePerUnit + landPricePerUnit;
    }
  }
  const updatedAverageAdjustedPsf = (updatedAdjustedPsf * weight) / 100;
  const updatedBlendedPsf = (price_square_foot * weight) / 100;

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

  if (expenseIndex !== 'undefined') {
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
const formatNumber = (num: any) => {
  if (num === null || num === undefined) return 'NA';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const ResidentialCostApproach: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [compsLength, setCompsLength] = useState('');

  const id = searchParams.get('id');
  const [comparativeFactors, setComparativeFactors] = useState<any[]>([]);
  const [maxUnitCount, setMaxUnitCount] = useState<number>(0);
  const [evalWeight, setEvalWeight] = useState<number | null>(null);
  const [costValuation, setCostValuation] = useState<number | null>(null);
  const [totalPsfValue, setPsfValue] = useState<number>(0);
  const [loader, setLoader] = useState(false);
  const [appraisalId, setAppraisalId] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [landDimesion, setLandDimension] = useState('');
  const { values, setValues } = useFormikContext<any>();
  const [landDimensions, setLandDimensions] = useState<any>(null);
  const costId = searchParams.get('costId');
  const [totalWeightedValue, setTotalWeightedValue] = useState(0);

  console.log(totalPsfValue, appraisalId);
  const navigate = useNavigate();
  const [hasIncomeType, setHasIncomeType] = React.useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [costName, setCostName] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [salesNote, setSalesNote] = useState(' ');
  const [loading, setLoading] = useState(true);
  const [openComps, setCompsOpen] = useState(false);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [buildingSize, setBuildingSize] = useState('');
  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [improvementsTotalAdjustedCost, setImprovementsTotalAdjustedCost] =
    useState(0);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [hasCostType, setHasCostType] = React.useState(false);
  const [filtereCostdData, setFilteredCostsData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  const [, setHasLeaseType] = React.useState(false);
  const [hasRentRollType, setHasRentRollType] = React.useState(false);

  const [, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereRentRollData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const location = useLocation();
  const updatedCompss = location.state?.updatedComps;
  const [updateEvalCostWeightInParent, setUpdateEvalCostWeightInParent] =
    useState(0);
  const [costValueModified, setCostValueModified] = useState(false);
  const [hasProcessedComps, setHasProcessedComps] = useState(false);
  const [isProcessingComps, setIsProcessingComps] = useState(false);

  const getLabelFromValue = (value: any) => {
    if (!value || value === '--Select a Subtype--') {
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
    ];

    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, return the value as is without capitalizing
    return value;
  };
  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // });

  const {
    data: areaInfoData,
    refetch,
    isLoading,
  } = useGet<any>({
    queryKey: `res-evaluations/get`,
    endPoint: `res-evaluations/get/${id}`,
    config: {
      enabled: Boolean(costId),
      refetchOnWindowFocus: false,
      onSuccess(data: any) {
        setLandDimension(data?.data?.data?.land_dimension); // Set the land dimension
        const landDimension = data?.data?.data?.land_dimension;
        const buildingSize = data?.data?.data?.building_size;
        setBuildingSize(buildingSize);
        const mapData = data?.data?.data?.res_evaluation_scenarios;

        if (mapData.length > 1) {
          mapData &&
            mapData.map((item: any) => {
              if (item.id == costId) {
                setCostName(item.name);
              }
            });
        }

        const appraisalApproach =
          data?.data?.data?.res_evaluation_scenarios?.find((approach: any) =>
            costId ? approach.id == parseFloat(costId) : false
          );

        // Find the 'cover' image in the appraisal_files array
        const coverImage = data?.data?.data?.appraisal_files?.find(
          (file: any) => file.title === 'cover'
        );
        const propertyUnits = data?.data?.data?.property_units || [];
        const maxUnitCount = propertyUnits.reduce(
          (max: number, unit: any) => Math.max(max, unit?.sq_ft || 0),
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
          ? appraisalApproach.res_evaluation_cost_approach.id
          : null;

        if (appraisalSalesApproachId) {
          fetchComposData(values, setValues);
        } else {
          console.error('appraisalSalesApproachId is undefined');
        }
      },
    },
  });
  // API FOR GET RECENT PAGE URL
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'res-evaluations/update-position',
    endPoint: `res-evaluations/update-position/${id}`,
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
  // useEffect(() => {
  //   console.log('Updated landDimension:', landDimesion);
  // }, [landDimesion]); // This will run whenever landDimension changes

  useEffect(() => {
    if (!comparativeFactors || comparativeFactors.length === 0) {
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
      areaInfoData?.data?.data?.res_evaluation_scenarios &&
      !areaInfoData.isStale
    ) {
      const updateData = areaInfoData.data.data.res_evaluation_scenarios;
      const salesApproaches = updateData.filter(
        (item: { has_sales_approach: any }) => item.has_sales_approach === 1
      );
      setHasSaleType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const incomeApproaches = updateData.filter(
        (item: { has_income_approach: any }) => item.has_income_approach === 1
      );
      setHasIncomeType(incomeApproaches.length > 0);
      setFilteredData(incomeApproaches);

      const costApproaches = updateData.filter(
        (item: { has_cost_approach: any }) => item.has_cost_approach === 1
      );
      setHasCostType(costApproaches.length > 0);
      setFilteredCostsData(costApproaches);

      const leaseApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'lease'
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeaseData(leaseApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'rent_roll'
      );
      setHasRentRollType(rentRollApproaches.length > 0);
      setFilteredRentRollData(rentRollApproaches);
    }
  }, [areaInfoData?.data?.data?.res_evaluation_scenarios]);

  // FETCHING ATTRIBUTES OF APPRAISALS
  const appraisalData = areaInfoData?.data.data || {};
  const conditionFormat = (value: any) => {
    const option = conditionOptions.find(
      (option: any) => option.value === value
    );
    if (option) {
      return option.label;
    }
  };
  const totalGrossLivingSqFt = appraisalData?.res_zonings?.reduce(
    (sum: any, item: any) => {
      return sum + (item.gross_living_sq_ft || 0);
    },
    0
  );
  const totalGrossLivingSqFt1 =
    (totalGrossLivingSqFt || 0).toLocaleString() + ' SF';
  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[appraisalData.state];
  const appraisalApproach =
    areaInfoData?.data?.data?.res_evaluation_scenarios?.find((approach: any) =>
      costId ? approach.id == parseFloat(costId) : false
    );

  const appraisalSalesApproachId =
    appraisalApproach?.res_evaluation_cost_approach?.id || null;

  console.log('appraisalidddd', appraisalSalesApproachId);
  // FUNCTION TO FETCH COMPS DATA
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `res-evaluations/get-cost-approach?evaluationId=${id}&evaluationScenarioId=${costId}`,
        {}
      );
      const totalPsfValue = response?.data?.data?.data?.indicated_value_psf;

      const costData = response?.data?.data?.data?.eval_weight;
      const evalWeightValue: any = costData * 100;
      setPsfValue(totalPsfValue);

      const totalCostvalue =
        response?.data?.data?.data?.improvements_total_adjusted_cost;
      setCostValuation(totalCostvalue);
      // const totalCostIndicatedPsf =
      //   response?.data?.data?.data?.indicated_value_psf;
      // setCostIndicatedPsf(totalCostIndicatedPsf);
      // Set the state so it's available throughout the component
      setEvalWeight(evalWeightValue);
      const compsArr = response?.data?.data?.data?.comp_data;
      setCompsLength(compsArr?.length);

      localStorage.setItem('compsLengthCostResidential', compsArr?.length);

      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      const salesNoteForComp = response?.data?.data?.data?.notes;
      const improvementsTotalAdjustedCostValue =
        response?.data?.data?.data?.improvements_total_adjusted_cost || 0;

      setImprovementsTotalAdjustedCost(improvementsTotalAdjustedCostValue);
      setSalesNote(salesNoteForComp);
      if (response?.data?.data?.data == null) {
        setValues({
          ...values,
          tableData: [],
          operatingExpenses: values.operatingExpenses,
        });
        return; // Exit if no data
      }

      // Check if arrays exist and have data
      const hasCostSubjectPropertyAdj =
        response?.data?.data?.data.cost_subject_property_adjustments &&
        response?.data?.data?.data.cost_subject_property_adjustments.length > 0;

      const hasComparisonAttributes =
        response?.data?.data?.data.comparison_attributes &&
        response?.data?.data?.data.comparison_attributes.length > 0;
      const defaultOperatingExpenses = [
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

      // Format arrays if they exist, otherwise use existing values
      const formattedOperatingExpenses = hasCostSubjectPropertyAdj
        ? response?.data?.data?.data.cost_subject_property_adjustments.map(
            ({ adj_key, adj_value, ...restAdj }: any) => ({
              ...restAdj,
              comparison_basis: adj_value ? adj_value + '%' : 0,
              adj_key,
              adj_value,
            })
          )
        : defaultOperatingExpenses;

      const formattedComparativeAdjustment = hasComparisonAttributes
        ? response?.data?.data?.data.comparison_attributes.map(
            ({ comparison_key, comparison_value, ...restAdj }: any) => ({
              ...restAdj,
              comparison_basis: comparison_key
                ? comparison_value
                : comparison_value,
              comparison_key,
              comparison_value,
            })
          )
        : values.appraisalSpecificAdjustment;

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
            (option: { value: any }) => option.value === newValue?.adj_value
          );
          return {
            ...oe,
            adj_key: newValue?.adj_key || oe.adj_key,
            adj_value: newValue?.adj_value || 0,
            customType: isCustom,
          };
        });
        const avgpsf =
          (total / 100) * c?.comp_details?.price_square_foot +
          c?.comp_details?.price_square_foot;
        const finalavgpsf = (avgpsf * weight) / 100;

        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          expenses: formattedExpenses,
          id: c.id,
          comp_id: c.comp_id,
          averaged_adjusted_psf: finalavgpsf,
          blended_adjusted_psf: c.blended_adjusted_psf,
          weight: c.weight,
          total: c.total_adjustment,
          adjustment_note: c?.adjustment_note,
          // adjusted_psf: c?.adjusted_psf,
        });
      }
      const sortedComps = calculatedComps.sort((a: any, b: any) => {
        // Sort by status (pending first, then closed)
        if (a.sale_status === 'Pending' && b.sale_status !== 'Pending') {
          return -1;
        }
        if (a.sale_status !== 'Pending' && b.sale_status === 'Pending') {
          return 1;
        }

        // Step 2: Within Pending, sort by date_sold
        if (a.sale_status === 'Pending' && b.sale_status === 'Pending') {
          return a.business_name.localeCompare(b.business_name);
        }
        if (a.sale_status === 'Closed' && b.sale_status !== 'Closed') {
          return -1;
        }
        if (a.sale_status !== 'Closed' && b.sale_status === 'Closed') {
          return 1;
        }
        if (a.sale_status === 'Closed' && b.sale_status === 'Closed') {
          return (
            (new Date(b.date_sold as any) as any) -
            (new Date(a.date_sold as any) as any)
          );
        }

        // Step 5: For any other sale_status, keep original order
        return 0;
      });
      // Set combined values in state once
      setValues({
        ...values,
        tableData: sortedComps,
        operatingExpenses: formattedOperatingExpenses,
        appraisalSpecificAdjustment: formattedComparativeAdjustment,
      });

      setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      // Handle the error
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchComposData(values, setValues);
    }, 2000);
  }, [costId]);

  useEffect(() => {
    if (values.operatingExpenses) {
      const salesApproachValues = {
        operatingExpenses: values.operatingExpenses,
      };
      localStorage.setItem(
        'costApproachValuesResidential',
        JSON.stringify(salesApproachValues)
      );
    }
  }, [values.operatingExpenses]);
  // VARIABLE TO GET COMPS TABLEDATA LENGTH
  const tableLength = values.tableData.length;
  // FUCNTION TO CALCULATE WEIGHTAGE OF EACH COMPS
  const calculateWeightage = (totalCards: number): string => {
    if (totalCards <= 0) {
      return 'NA';
    }
    const weightage = (100 / totalCards).toFixed(2) + '%';
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
          : 0;
        totalCompBasis += expNum;
      });

      const adjustedPricepercentage =
        item.price_square_foot +
        (totalCompBasis / 100) * item.price_square_foot;

      const newDataTotal = (adjustedPricepercentage * itemWeightage) / 100;

      return total + newDataTotal;
    }, 0);

    return totalNewData;
  };

  let totalaveragedadjustedpsf = 0;

  values.tableData.forEach((comp: { adjusted_psf: string; weight: any }) => {
    if (comp.adjusted_psf) {
      // const adjustedPsfValue = parseFloat(comp.adjusted_psf); // Full value
      const adjustedPsfValue = comp.adjusted_psf
        ? parseFloat(parseFloat(comp.adjusted_psf).toFixed(2))
        : 0;

      // Calculate the weighted value and round to 2 decimals
      const weightedValue = parseFloat(
        (adjustedPsfValue * (comp.weight / 100)).toFixed(2)
      );

      totalaveragedadjustedpsf += weightedValue;
    }
  });

  // Example usage
  const totalNewDatas = calculateTotalNewAdjustmentData(
    values.tableData,
    weightage
  );
  console.log('Total New Data:', totalNewDatas.toFixed(2));
  // variable for total sales values
  console.log('check this out', totalaveragedadjustedpsf);
  const FinalResult = totalaveragedadjustedpsf * appraisalData.land_size;
  let totalWeightage = 0;

  values.tableData.forEach((comp: { weight: string }) => {
    if (comp.weight) {
      totalWeightage += parseFloat(comp.weight);
    }
  });

  // const newFinalResult = FinalResult + costValuation;
  // const costIndicatedPsf = FinalResult / buildingSize;
  const newFinalResult = FinalResult + (costValuation ?? 0);
  const costIndicatedPsf =
    buildingSize && Number(buildingSize) !== 0
      ? FinalResult / Number(buildingSize)
      : 0;

  console.log(
    'newFinalResult',
    FinalResult,
    'costValuation',
    costValuation,
    'newFinalResult',
    newFinalResult
  );

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

      order: index + 1,
      total_adjustment: item?.total,
      adjusted_psf: isNaN(item.adjusted_psf) ? 0 : item.adjusted_psf,
      weight: parseFloat(item.weight),

      comps_adjustments: comps_adjustments,
    };
  });

  const salesApproachData = {
    ...(appraisalSalesApproachId ? { id: appraisalSalesApproachId } : {}),
    // 'id':appraisalId,
    // evaluation_approach_id: costId ? parseFloat(costId) : null,
    res_evaluation_scenario_id: costId ? parseFloat(costId) : null,
    // averaged_adjusted_psf: totalaveragedadjustedpsf,
    averaged_adjusted_psf:
      buildingSize && Number(buildingSize) !== 0
        ? FinalResult / Number(buildingSize)
        : totalaveragedadjustedpsf,

    // averaged_adjusted_psf:
    //   buildingSize && buildingSize !== 0
    //     ? FinalResult / buildingSize
    //     : totalaveragedadjustedpsf,
    weight: parseFloat(totalWeightage.toString()),
    notes: salesNote,
    comparison_attributes: sales_comparison_attributes,

    land_value: FinalResult,
    overall_replacement_cost: 0,
    total_depreciation: 0,
    total_depreciation_percentage: 0,
    total_depreciated_cost: 0,
    total_cost_valuation: FinalResult + improvementsTotalAdjustedCost,
    indicated_value_psf: costIndicatedPsf,
    indicated_value_punit: 0,
    improvements_total_adjusted_cost: costValuation,
    improvements_total_adjusted_ppsf: 0,
    improvements_total_depreciation: 0,
    improvements_total_sf_area: 0,
    cost_subject_property_adjustments: subject_property_adjustments,
    comp_data: comps,
    incremental_value:
      (FinalResult *
        (updateEvalCostWeightInParent !== undefined &&
        updateEvalCostWeightInParent !== 0
          ? updateEvalCostWeightInParent
          : evalWeight || 0)) /
      100,
  };

  const finalData: any = {
    // evaluation_id: id ? parseFloat(id) : null,
    res_evaluation_id: id ? parseFloat(id) : null,
    cost_approach: salesApproachData,
    weighted_market_value: totalWeightedValue,
  };

  const mutation = useMutate<any, any>({
    queryKey: 'save-cost-approach',
    endPoint: 'res-evaluations/save-cost-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'update-cost-approach',
    endPoint: 'res-evaluations/update-cost-approach',
    requestType: RequestType.POST,
  });
  console.log('evalweight', evalWeight);
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
          cost_approach: {
            ...finalData.cost_approach,
            comps: finalData.cost_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        setLoader(false);
        toast.success(response.data.message);
        navigate(
          `/residential/evaluation/cost-comps-map?id=${id}&costId=${costId}`
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
  localStorage.setItem('costValuePerUnitForWeightage1', FinalResult.toString());

  const handleNextClick = () => {
    handleSubmit();
  };

  const handleBackClick = () => {
    if (hasCostType && filtereCostdData.length > 1) {
      const costIndex = filtereCostdData.findIndex(
        (element) => element.id == costId
      );

      if (costIndex > 0) {
        const costIdRedirectIndex = filtereCostdData[costIndex - 1].id;
        navigate(
          `/residential/evaluation/cost-approach-improvement?id=${id}&costId=${costIdRedirectIndex}`
        );
        return;
      }
    }
    if (hasSaleType) {
      navigate(
        `/residential/evaluation/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
      );
      return;
    }

    if (hasRentRollType) {
      navigate(
        `/evaluation/rent-roll?id=${id}&appraisalId=${filtereRentRollData?.[filtereRentRollData.length - 1]?.id}`
      );
      return;
    }

    if (hasIncomeType) {
      navigate(
        `/residential/evaluation/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - 1]?.id}`
      );
      return;
    }

    navigate(`/residential/evaluation-area-info?id=${id}`);
  };

  const uploadComps = () => {
    localStorage.setItem('compsLengthcostresidential', compsLength);

    navigate(
      `/residential/evaluation/upload-cost-comps?id=${id}&costId=${costId}`,
      {
        state: {
          operatingExpenses: values.operatingExpenses,
          salesCompQualitativeAdjustment: values.salesCompQualitativeAdjustment,
          appraisalSpecificAdjustment: values.appraisalSpecificAdjustment,
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
          cost_approach: {
            ...finalData.cost_approach,
            comps: finalData.cost_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }
      if (response && response.data && response.data.message) {
        navigate(
          `/residential/evaluation/update-cost-comps/${itemId}/${id}/cost/${costId}`
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  console.log('anj', values);

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
          cost_approach: {
            ...finalData.cost_approach,
            comps: finalData.cost_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  const handleAddNewComp = () => {
    // localStorage.setItem('activeType', 'land_only');
    // setIsOpen(true);
    localStorage.removeItem('selectedToggle');
    localStorage.removeItem('view');
    localStorage.setItem('compsLengthcostresidential', compsLength);

    navigate(`/residential/filter-cost-comps?id=${id}&approachId=${costId}`, {
      state: {
        compsLength: compsLength,
      },
    });
  };

  const handleLinkExistingComps = () => {
    navigate(`/residential/cost/create-comp?id=${id}&approachId=${costId}`, {
      state: {
        compsLength: compsLength,
      },
    });
  };
  const formatValue = (value: number | string): string => {
    if (!value || isNaN(Number(value))) {
      return 'N/A'; // Return 'N/A' if the value is not a valid number
    }
    return Number(value).toLocaleString('en-US'); // Format with commas only
  };

  const formatNumberAcre = (value: number | string): string => {
    if (!value || isNaN(Number(value))) {
      return 'N/A'; // Return 'N/A' if the value is not a valid number
    }
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };
  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    try {
      console.log('handleSubmitWithUpdatedComps called with:', updatedComps);

      // Recalculate totals with updated comps
      let updatedTotalAveragedAdjustedPsf = 0;
      let updatedTotalWeightage = 0;

      updatedComps.forEach((comp: any) => {
        if (comp.averaged_adjusted_psf) {
          updatedTotalAveragedAdjustedPsf += parseFloat(
            comp.averaged_adjusted_psf
          );
        }
        if (comp.weight) {
          updatedTotalWeightage += parseFloat(comp.weight);
        }
      });

      const updatedFinalResult =
        parseFloat(updatedTotalAveragedAdjustedPsf.toFixed(2)) *
        appraisalData.land_size;

      // Create updated comps data
      const updatedCompsData = updatedComps.map((item: any, index: number) => {
        const comps_adjustments =
          item.expenses?.map((exp: any) => ({
            adj_key: exp.adj_key,
            adj_value: exp.adj_value,
          })) || [];

        const comp_id = item.comp_id || item.id;
        return {
          // ...(appraisalSalesApproachId ? { id: item.id } : {}),
          comp_id: comp_id,
          order: index + 1,
          total_adjustment: item?.total,
          adjusted_psf: isNaN(item.adjusted_psf) ? 0 : item.adjusted_psf,
          weight: parseFloat(item.weight),
          comps_adjustments: comps_adjustments,
        };
      });

      const updatedSalesApproachData = {
        ...(appraisalSalesApproachId ? { id: appraisalSalesApproachId } : {}),
        res_evaluation_scenario_id: costId ? parseFloat(costId) : null,
        averaged_adjusted_psf: updatedTotalAveragedAdjustedPsf,
        weight: parseFloat(updatedTotalWeightage.toString()),
        notes: salesNote,
        land_value: updatedFinalResult,
        overall_replacement_cost: 0,
        total_depreciation: 0,
        total_depreciation_percentage: 0,
        total_depreciated_cost: 0,
        total_cost_valuation: 0,
        indicated_value_psf: 0,
        indicated_value_punit: 0,
        improvements_total_adjusted_cost: 0,
        improvements_total_adjusted_ppsf: 0,
        improvements_total_depreciation: 0,
        improvements_total_sf_area: 0,
        cost_subject_property_adjustments: subject_property_adjustments,
        comp_data: updatedCompsData,
      };

      const updatedFinalData = {
        res_evaluation_id: id ? parseFloat(id) : null,
        cost_approach: updatedSalesApproachData,
      };

      let response;
      if (appraisalSalesApproachId) {
        console.log('Calling mutations.mutateAsync with:', updatedFinalData);
        response = await mutations.mutateAsync(updatedFinalData);
      } else {
        const modifiedPayload = {
          ...updatedFinalData,
          cost_approach: {
            ...updatedFinalData.cost_approach,
            comps: updatedFinalData.cost_approach.comp_data,
          },
        };
        console.log('Calling mutation.mutateAsync with:', modifiedPayload);
        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        toast.success(response.data.message);
        // Only fetch new data if the save was successful
        await fetchComposData(values, setValues);
      }

      return response;
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
      throw error; // Re-throw to allow proper error handling in calling function
    }
  };

  // function for pass comp data to advance filter for cost approach
  const passCompDataFilterCost = (comps: any) => {
    console.log('passCompDataFilterCost called with:', comps);

    // Prevent duplicate processing
    if (isProcessingComps) {
      console.log('Already processing comps, skipping...');
      return;
    }

    setIsProcessingComps(true);

    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = 100 / totalComps.length;
      let count = 0;

      const updatedComps = totalComps.map((comp) => {
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
          total: total,
        };

        return updatedCompData;
      });

      const totalAverageAdjustedPsf = updatedComps.reduce((acc, item) => {
        return acc + item.averaged_adjusted_psf;
      }, 0);

      // Call API with updated comps after state update
      setTimeout(() => {
        console.log('About to call handleSubmitWithUpdatedComps');
        handleSubmitWithUpdatedComps(updatedComps).finally(() => {
          setIsProcessingComps(false);
        });
      }, 100);

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });
  };

  // function for pass comp data to advance filter
  // const passCompsDataToFilter = (comps: any) => {
  //   setValues((oldValues: { tableData: any }) => {
  //     const totalComps = [...oldValues.tableData, ...comps];
  //     const newInitialWeight: number = 100 / totalComps.length;
  //     let count = 0;

  //     const updatedComps = totalComps.map((comp) => {
  //       // comp.weight = newInitialWeight;
  //       count++;
  //       if (totalComps.length === 3 && count === totalComps.length) {
  //         comp.weight = 33.34;
  //       } else {
  //         comp.weight = newInitialWeight.toFixed(2);
  //       }

  //       const expenses = [...comp.expenses];

  //       const { total } = getExpensesTotal(expenses, '', '');

  //       const calculatedCompData = calculateCompData({
  //         total,
  //         weight: comp.weight,
  //         comp,
  //         appraisalData,
  //       });

  //       const updatedCompData = {
  //         ...comp,
  //         ...calculatedCompData,
  //       };

  //       return updatedCompData;
  //     });

  //     const totalAverageAdjustedPsf = updatedComps.reduce((acc, item) => {
  //       return acc + item.averaged_adjusted_psf;
  //     }, 0);

  //     return {
  //       ...oldValues,
  //       tableData: updatedComps,
  //       averaged_adjusted_psf: totalAverageAdjustedPsf,
  //     };
  //   });
  // };

  const handleDeleteCard = (index: number) => {
    setValues((oldValues: { tableData: any }) => {
      const updatedTableData = oldValues.tableData.filter(
        (_: any, innerIndex: number) => index !== innerIndex
      );

      const newInitialWeight = updatedTableData.length
        ? 100 / updatedTableData.length
        : 0;
      let count = 0;

      const updatedComps = updatedTableData.map((comp: any) => {
        count++;
        if (
          updatedTableData.length === 3 &&
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
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (updatedCompss && !hasProcessedComps && !isProcessingComps) {
      setTimeout(() => {
        passCompDataFilterCost(updatedCompss);
        setHasProcessedComps(true);
        // Clear the state to prevent re-processing on refresh
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
      }, 3000);
    }
  }, [updatedCompss, hasProcessedComps, isProcessingComps]);

  if (isLoading || loading || loader) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  // const passCompsDataToFilter1 = (comps: any) => {
  //   setValues((oldValues: { tableData: any }) => {
  //     const totalComps = [...oldValues.tableData, ...comps];
  //     const newInitialWeight: number = 100 / totalComps.length;
  //     let count = 0;
  //     const sortedComps = totalComps.sort((a, b) => {
  //       // Step 1: Sort Pending items first
  //       if (a.sale_status === 'Pending' && b.sale_status !== 'Pending') {
  //         return -1;
  //       }
  //       if (a.sale_status !== 'Pending' && b.sale_status === 'Pending') {
  //         return 1;
  //       }

  //       // Step 2: Within Pending, sort by date_sold
  //       if (a.sale_status === 'Pending' && b.sale_status === 'Pending') {
  //         return a.business_name.localeCompare(b.business_name);
  //       }

  //       // Step 3: Sort Closed items after Pending
  //       if (a.sale_status === 'Closed' && b.sale_status !== 'Closed') {
  //         return -1;
  //       }
  //       if (a.sale_status !== 'Closed' && b.sale_status === 'Closed') {
  //         return 1;
  //       }

  //       // Step 4: Within Closed, sort alphabetically by business_name
  //       if (a.sale_status === 'Closed' && b.sale_status === 'Closed') {
  //         return (
  //           (new Date(b.date_sold as any) as any) -
  //           (new Date(a.date_sold as any) as any)
  //         );
  //       }

  //       // Step 5: For any other sale_status, keep original order
  //       return 0;
  //     });
  //     const updatedComps = sortedComps.map((comp) => {
  //       // comp.weight = newInitialWeight;
  //       count++;
  //       if (sortedComps.length === 3 && count === sortedComps.length) {
  //         comp.weight = 33.34;
  //       } else {
  //         comp.weight = newInitialWeight.toFixed(2);
  //       }

  //       const expenses = [...comp.expenses];

  //       const { total } = getExpensesTotal(expenses, '', '');

  //       const calculatedCompData = calculateCompData({
  //         total,
  //         weight: comp.weight,
  //         comp,
  //         appraisalData,
  //       });

  //       const updatedCompData = {
  //         ...comp,
  //         ...calculatedCompData,
  //       };

  //       return updatedCompData;
  //     });

  //     const totalAverageAdjustedPsf = updatedComps.reduce((acc, item) => {
  //       return acc + item.averaged_adjusted_psf;
  //     }, 0);

  //     return {
  //       ...oldValues,
  //       tableData: updatedComps,
  //       averaged_adjusted_psf: totalAverageAdjustedPsf,
  //     };
  //   });
  // };

  // Add this utility function at the top of your file
  const calculateAdjustment = (
    adjKey: string,
    inputValue: string,
    comp: any,
    appraisalData: any
  ): string => {
    const value = parseFloat(inputValue) || 0;

    // For percentage-based adjustments
    if (['time', 'location', 'condition'].includes(adjKey)) {
      return (((comp.sales_price || comp.sale_price) * value) / 100).toFixed(2);
    }

    // For square footage adjustments
    if (adjKey === 'gross_living_area_sf') {
      const subjectSqFt =
        appraisalData?.res_zonings?.find((z: any) => z?.gross_living_area_sf)
          ?.gross_living_area_sf || 0;
      const compSqFt =
        comp?.res_zonings?.find((z: any) => z?.gross_living_area_sf)
          ?.gross_living_area_sf || 0;
      return ((subjectSqFt - compSqFt) * value).toFixed(2);
    }

    // For land size adjustments
    if (adjKey === 'land_size') {
      const subjectLandSize = appraisalData?.land_size || 0;
      const compLandSize = comp?.land_size || 0;
      return ((subjectLandSize - compLandSize) * value).toFixed(2);
    }

    // For count-based adjustments (bedrooms, bathrooms, fireplace)
    if (['bedrooms', 'bathrooms', 'fireplace'].includes(adjKey)) {
      const subjectCount = appraisalData?.[adjKey] || 0;
      const compCount = comp?.[adjKey] || 0;
      return ((subjectCount - compCount) * value).toFixed(2);
    }

    // Default case - return the input value
    return value.toString();
  };

  return (
    <ResidentialMenuOptions
      totalaveragedadjustedpsfCost={buildingSize}
      totalCostValuation={newFinalResult}
      finalResultCost={newFinalResult}
      costValueModified={costValueModified}
      onNextClick={handleNextClick}
      onBackClick={handleBackClick}
      onUpdateEvalCostWeightChange={(value: any) => {
        setUpdateEvalCostWeightInParent(value);
      }}
      onTotalWeightedChange={(value: any) => {
        setTotalWeightedValue(value);
      }}
      // passCompDataFilterCost={passCompDataFilterCost}
    >
      {openComps && (
        <ResidentialUploadCostCompsModal
          open={openComps}
          onClose={() => setCompsOpen(false)}
          setCompsModalOpen={setCompsModalOpen}
          compsLength={compsLength}
          setCompsData={setCompsData}
          compsData={compsData ?? []} // Avoid passing null where an array is needed
        />
      )}
      {compsModalOpen && (
        <ResidentialAiCostCompsTable
          passCompsData={passCompDataFilterCost}
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
          COST COMPS <span>{costName ? `(${costName})` : ''}</span>
        </Typography>

        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">
            Value of the land based on applicable land comps.
          </span>
        </div>
      </div>
      {/* <div className="overflow-auto h-[calc(100vh-280px)]"> */}
      <div className="flex flex-wrap space-x-1.5 xl:px-[44px] px-[15px]">
        <div className="flex flex-col w-[15.5%]">
          <h3 className="px-1 py-5 text-base capitalize invisible font-semibold">
            Subject Property
          </h3>
          <div className="lg:p-4 p-2 !pt-0 bg-white flex-1 !pb-1">
            <div className="max-w-full h-[160px]"></div>
            <div className="p-2">
              <div className="flex h-[20px] gap-2 items-center"></div>
              <h2 className="text-gray-500  text-xs font-bold mt-0 min-h-[40px] mt-2 overflow-hidden whitespace-nowrap text-ellipsis">
                Location
              </h2>
              <p className="pb-1 text-xs font-bold">Date Sold </p>
            </div>
            <div className="p-1 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <FieldArray
                name="appraisalSpecificAdjustment"
                render={() => (
                  <>
                    {values.appraisalSpecificAdjustment &&
                    values.appraisalSpecificAdjustment.length > 0 ? (
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
                                  1 && (
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
                                    1 && (
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
                        No appraisal specific adjustment data
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            {/* ------------------------------------------------------------------------------- */}
            <div className="p-1 pb-0.5">
              <FieldArray
                name="operatingExpenses"
                render={() => (
                  <>
                    {values.operatingExpenses &&
                    values.operatingExpenses.length > 0 ? (
                      values.operatingExpenses.map((zone: any, i: number) => (
                        <div
                          className="flex items-center h-[20px] justify-between gap-1"
                          key={i}
                        >
                          <Grid
                            item
                            className="min-w-[calc(100%-36px)] manageDropdownField w-full"
                          >
                            <StyledField
                              name={`operatingExpenses.${i}.adj_key`}
                              style={{
                                borderBottomWidth: '1px',
                                color: 'black',
                                padding: '0',
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

                                // Calculate the adjustment value using the utility function
                                const calculatedValue = calculateAdjustment(
                                  key,
                                  input,
                                  values.tableData[0], // Use the first comp as reference
                                  appraisalData
                                );

                                setValues(
                                  (old: {
                                    operatingExpenses: any;
                                    tableData: any[];
                                  }) => {
                                    const operatingExpenses =
                                      old.operatingExpenses;
                                    const newAdj = {
                                      adj_key: key,
                                      adj_value: calculatedValue, // Use the calculated value
                                      comparison_basis: 0,
                                    };

                                    operatingExpenses[i] = newAdj;
                                    const compsWithNewAdj = old.tableData.map(
                                      (comp) => {
                                        const updatedExpenses =
                                          comp.expenses.map(
                                            (
                                              exp: {
                                                adj_key: any;
                                                adj_value: any;
                                              },
                                              expIndex: number
                                            ) => {
                                              if (expIndex === i) {
                                                exp.adj_key = key;
                                                exp.adj_value = calculatedValue; // Update with calculated value
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

                          <Grid item className="min-w-[36px] h-[18px]">
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
                                  style={{ width: '14px', height: '14px' }}
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
                        No operating expenses data
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            {/* //-----------------------------------------------------------------------------------? */}

            <div className="pt-2 flex flex-col gap-[2px] border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="text-xs h-[18px] !m-0 font-semibold italic text-ellipsis overflow-hidden whitespace-nowrap">
                Overall Adjustment
              </p>
              {landDimesion === 'ACRE' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted $/ACRE
                </p>
              ) : (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted $/SF
                </p>
              )}
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Weighting
              </p>

              <p className="text-base h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Total Land Value
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[15.5%]">
          <h3 className="py-5 text-base capitalize font-semibold">
            Subject Property
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
              <p className="text-xs text-[#687F8B] pb-1 font-medium overflow-hidden whitespace-nowrap text-ellipsis">
                {'\u00A0'}
              </p>
            </div>
            <div className="p-1 pb-1.5 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              {values.appraisalSpecificAdjustment?.length > 0
                ? values.appraisalSpecificAdjustment.map(
                    (adjustments: any, index: number) => {
                      const isStreetAddress =
                        adjustments.comparison_key === 'street_address';
                      const isResZoning =
                        adjustments.comparison_key === 'zoning_type';
                      const isLandSizeSF =
                        adjustments.comparison_key === 'land_size_sf';
                      const isLandSizeAcre =
                        adjustments.comparison_key === 'land_size_acre';
                      const isCityState =
                        adjustments.comparison_key === 'city_state';
                      const isDateSold =
                        adjustments.comparison_key === 'date_sold';
                      const isYearBuiltRemodeled =
                        adjustments.comparison_key === 'year_built_remodeled';
                      const isBuildingSize =
                        adjustments.comparison_key === 'building_size';
                      const isSalePrice =
                        adjustments.comparison_key === 'sale_price';
                      const isPricePerSF =
                        adjustments.comparison_key === 'price_per_sf';
                      const isQualityCondition =
                        adjustments.comparison_key === 'quality_condition';
                      const isUnit = adjustments.comparison_key === 'unit';
                      const isHighestBestUse =
                        adjustments.comparison_key === 'highest_best_use';
                      const isBusinessName =
                        adjustments.comparison_key === 'business_name';
                      const isEffectiveAge =
                        adjustments.comparison_key === 'effective_age';
                      const isSalesPrice =
                        adjustments.comparison_key === 'sale_price';
                      const isCapRate =
                        adjustments.comparison_key === 'cap_rate';
                      const isUnitMix =
                        adjustments.comparison_key === 'unit_mix';
                      const isPricePerUnit =
                        adjustments.comparison_key === 'price_per_unit';
                      const isTopography =
                        adjustments.comparison_key === 'topography';
                      const isUtilitiesSelect =
                        adjustments.comparison_key === 'utilities_select';
                      const isZoningType =
                        adjustments.comparison_key === 'zoning_type';
                      const netOperatingIncome =
                        adjustments.comparison_key === 'net_operating_income';
                      const frontage =
                        adjustments.comparison_key === 'frontage';
                      const parking = adjustments.comparison_key === 'parking';
                      const utilities =
                        adjustments.comparison_key === 'services';
                      const isCityCounty =
                        adjustments.comparison_key === 'city_county'; // New condition
                      const basement =
                        adjustments.comparison_key === 'basement_sf';
                      const heatingCooling =
                        adjustments.comparison_key === 'heating_and_cooling';
                      const otherAmenities =
                        adjustments.comparison_key === 'other_amenities';
                      const grossLivingSqFt =
                        adjustments.comparison_key === 'gross_living_area';
                      const isFencing =
                        adjustments.comparison_key === 'fencing';
                      const isGarage = adjustments.comparison_key === 'garage';
                      const isCondition =
                        adjustments.comparison_key === 'condition';
                      const isBedrooms =
                        adjustments.comparison_key === 'bedrooms';
                      const isBathrooms =
                        adjustments.comparison_key === 'bathrooms';
                      const isFireplace =
                        adjustments.comparison_key === 'fireplace';
                      const isBuildingSizeLandSize =
                        adjustments.comparison_key ===
                        'building_size_land_size';
                      let landSize = 'N/A';
                      if (
                        appraisalData.land_size &&
                        appraisalData.land_dimension == 'SF'
                      ) {
                        landSize =
                          formatNumber(appraisalData.land_size) + ' SF';
                      } else if (
                        appraisalData.land_size &&
                        appraisalData.land_dimension == 'ACRE'
                      ) {
                        landSize =
                          formatNumber(appraisalData.land_size.toFixed(3)) +
                          ' AC';
                      }
                      const AdditionalAmenities =
                        appraisalData?.res_evaluation_amenities
                          ?.map((ele: any) => ele.additional_amenities)
                          .join(' ,');

                      return (
                        <p
                          key={index}
                          className={`text-xs !m-0 font-bold h-[18px] flex items-center text-ellipsis overflow-hidden whitespace-nowrap ${
                            !appraisalData.appraisalSpecificAdjustment?.[index]
                              ?.names
                              ? 'text-gray-500 text-xs font-medium'
                              : ''
                          }`}
                        >
                          <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
                            {isBuildingSizeLandSize
                              ? `${formatNumber(appraisalData.building_size || 0)} SF / ${landSize}`
                              : isCondition
                                ? conditionFormat(appraisalData.condition)
                                : isGarage
                                  ? appraisalData.garage
                                  : isBedrooms
                                    ? capitalizeWords(appraisalData.bedrooms)
                                    : isBathrooms
                                      ? capitalizeWords(appraisalData.bathrooms)
                                      : isFireplace
                                        ? capitalizeWords(
                                            appraisalData.fireplace
                                          )
                                        : grossLivingSqFt
                                          ? totalGrossLivingSqFt1 ?? null
                                          : isFencing
                                            ? appraisalData.fencing ?? null
                                            : otherAmenities
                                              ? [
                                                  AdditionalAmenities,
                                                  appraisalData?.other_amenities,
                                                ]
                                              : heatingCooling
                                                ? appraisalData.heating_cooling
                                                : isResZoning
                                                  ? appraisalData?.zoning_type
                                                  : isStreetAddress
                                                    ? appraisalData.street_address
                                                    : frontage
                                                      ? capitalizeWords(
                                                          appraisalData.frontage
                                                        )
                                                      : basement
                                                        ? formatNumber(
                                                            appraisalData?.total_basement ||
                                                              0
                                                          )
                                                        : parking
                                                          ? capitalizeWords(
                                                              appraisalData.parking
                                                            )
                                                          : utilities
                                                            ? capitalizeWords(
                                                                appraisalData.utilities
                                                              )
                                                            : netOperatingIncome &&
                                                                appraisalData?.net_operating_income
                                                              ? appraisalData.net_operating_income
                                                              : isLandSizeSF
                                                                ? appraisalData.land_size !=
                                                                  null
                                                                  ? `${
                                                                      landDimensions ===
                                                                      'ACRE'
                                                                        ? Math.round(
                                                                            appraisalData.land_size *
                                                                              43560
                                                                          ).toLocaleString() // Convert to integer
                                                                        : parseInt(
                                                                            appraisalData.land_size,
                                                                            10
                                                                          ).toLocaleString() // No decimals for SF
                                                                    }`
                                                                  : 'N/A'
                                                                : isLandSizeAcre
                                                                  ? appraisalData.land_size !=
                                                                    null
                                                                    ? `${
                                                                        landDimensions ===
                                                                        'SF'
                                                                          ? formatNumberAcre(
                                                                              (
                                                                                appraisalData.land_size /
                                                                                43560
                                                                              ).toFixed(
                                                                                3
                                                                              ) // Retain three decimal places
                                                                            )
                                                                          : appraisalData.land_size.toLocaleString(
                                                                              'en-US'
                                                                            ) // Integer for Acre
                                                                      } AC`
                                                                    : 'N/A'
                                                                  : isCityState
                                                                    ? `${appraisalData.city}, ${fullStateName}`
                                                                    : isCityCounty
                                                                      ? `${appraisalData.city}, ${appraisalData.county}`
                                                                      : isDateSold
                                                                        ? appraisalData.date_sold
                                                                        : isYearBuiltRemodeled
                                                                          ? `${appraisalData.year_built || APPROACHESENUMS.NA} / ${
                                                                              appraisalData.year_remodeled ||
                                                                              APPROACHESENUMS.NA
                                                                            }`
                                                                          : isBuildingSize
                                                                            ? formatValue(
                                                                                appraisalData.building_size
                                                                              )
                                                                            : isSalePrice
                                                                              ? APPROACHESENUMS.SPACE
                                                                              : isPricePerSF
                                                                                ? appraisalData.price_square_ft
                                                                                : isQualityCondition
                                                                                  ? getLabelFromValue(
                                                                                      appraisalData.condition
                                                                                    ) ||
                                                                                    ''
                                                                                  : isUnit
                                                                                    ? appraisalData.total_units
                                                                                    : isHighestBestUse
                                                                                      ? capitalizeWords(
                                                                                          appraisalData.high_and_best_user
                                                                                        )
                                                                                      : isBusinessName
                                                                                        ? appraisalData.business_name
                                                                                        : isEffectiveAge
                                                                                          ? appraisalData.effective_age
                                                                                          : isSalesPrice
                                                                                            ? APPROACHESENUMS.SPACE
                                                                                            : isCapRate
                                                                                              ? appraisalData.cap_rate
                                                                                                ? `${formatNumber(appraisalData.cap_rate)}%`
                                                                                                : 'N/A'
                                                                                              : isUnitMix
                                                                                                ? `${
                                                                                                    appraisalData?.total_property_beds !=
                                                                                                      null &&
                                                                                                    appraisalData?.total_property_baths !=
                                                                                                      null
                                                                                                      ? appraisalData.total_property_beds +
                                                                                                        ' / ' +
                                                                                                        appraisalData.total_property_baths
                                                                                                      : 'N/A / N/A'
                                                                                                  }`
                                                                                                : isPricePerUnit
                                                                                                  ? appraisalData?.sale_price !=
                                                                                                      null &&
                                                                                                    appraisalData?.total_units !=
                                                                                                      null
                                                                                                    ? formatNumber(
                                                                                                        (
                                                                                                          appraisalData.sale_price /
                                                                                                          appraisalData.total_units
                                                                                                        ).toFixed(
                                                                                                          2
                                                                                                        )
                                                                                                      )
                                                                                                    : null
                                                                                                  : isTopography
                                                                                                    ? getLabelFromValue(
                                                                                                        appraisalData.topography
                                                                                                      )
                                                                                                      ? getLabelFromValue(
                                                                                                          appraisalData.topography
                                                                                                        )
                                                                                                      : APPROACHESENUMS.NA
                                                                                                    : isUtilitiesSelect
                                                                                                      ? appraisalData.utilities_select
                                                                                                        ? appraisalData.utilities_select
                                                                                                        : APPROACHESENUMS.NA
                                                                                                      : isZoningType
                                                                                                        ? appraisalData.zoning_type
                                                                                                          ? appraisalData.zoning_type
                                                                                                          : APPROACHESENUMS.NA
                                                                                                        : adjustments.comparison_key ===
                                                                                                            'unit_size_sq_ft'
                                                                                                          ? formatValue(
                                                                                                              maxUnitCount
                                                                                                            ) // Add this condition
                                                                                                          : appraisalData
                                                                                                              .appraisalSpecificAdjustment?.[
                                                                                                              index
                                                                                                            ]
                                                                                                              ?.names ||
                                                                                                            null}
                          </span>
                        </p>
                      );
                    }
                  )
                : Array.from(
                    { length: values.appraisalSpecificAdjustment?.length },
                    (_, i) => (
                      <p
                        key={i}
                        className="text-xs font-bold text-transparent"
                        style={{ lineHeight: '0rem!important' }}
                      >
                        No data
                      </p>
                    )
                  )}
            </div>
            <div className="pb-1.5 mt-2 min-h-[26px] border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
              {values.operatingExpenses?.length > 0
                ? values.operatingExpenses.map((index: number) => (
                    <p
                      key={index}
                      className={`text-xs h-[18.5px] font-bold text-ellipsis overflow-hidden whitespace-nowrap ${!appraisalData.operatingExpenses?.[index]?.names ? 'text-transparent' : ''}`}
                    >
                      {appraisalData.operatingExpenses?.[index]?.names ||
                        'No data'}
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
                        No data
                      </p>
                    )
                  )}
            </div>

            <div className="mt-2 px-1 flex flex-col gap-[2px] pb-2">
              <p className="italic text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap invisible">
                Overall Adjustment
              </p>
              <p className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap">
                {' '}
                {totalaveragedadjustedpsf?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap">
                {totalWeightage.toFixed(2) + '%'}
              </p>
              <p className="text-[#0da1c7] h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap font-bold text-base uppercase">
                {'$' +
                  FinalResult.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
            </div>
          </div>
        </div>
        {values.tableData?.map((item: any, index: any) => (
          <ResidentialCostCompCard
            index={index}
            handleChange={() => setCostValueModified(true)}
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
                Link Existing Comps{' '}
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
                Add Comps
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

      <div className="xl:px-[60px] mt-14 pb-24 px-[15px]">
        <h4 className="text-gray-800 text-xs font-medium font-bold">Notes</h4>
        <TextEditor
          editorData={(content) => setSalesNote(content)}
          editorContent={salesNote}
          value={salesNote} // Ensure the 'value' prop is provided
        />
      </div>
    </ResidentialMenuOptions>
  );
};

export default ResidentialCostApproach;

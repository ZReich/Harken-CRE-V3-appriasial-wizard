import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
import TextEditor from '@/components/styles/text-editor';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { options, usa_state } from '@/pages/comps/comp-form/fakeJson';
import {
  conditionOptions,
  // frontageOptions,
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
import defaultPropertImage from '../../../images/default-placeholder.png';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';

import SelectTextField from '@/components/styles/select-input';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import loadingImage from '../../../images/loading.png';
import EvaluationAiCostCompsTable from './evaluation-cost-approach-ai-comp-table';
import EvaluationCostCompCard from './evaluation-cost-approach-comps-card';
import EvaluationUploadCostCompsModal from './evaluation-upload-comps-pdf';
import SubjectPropertyComparitiveAttributes from '@/utils/subject-property-comparitive.attributes';
import { propertyTypeOptions } from '@/pages/my-profile/significant-transaction/select-option/Select';
import {
  AnalysisTypes,
  LandDimension,
} from '@/pages/appraisal/overview/OverviewEnum';
import { formatPrice } from '@/utils/sanitize';

export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  let baseAdjustedPsf = comp.land_size ? comp.sale_price / comp.land_size : 0;

  if (appraisalData.comp_type == 'land_only') {
    if (
      appraisalData.analysis_type === AnalysisTypes.SF &&
      comp.land_dimension === LandDimension.ACRE
    ) {
      // Convert land size from acres to square feet
      baseAdjustedPsf = comp.sale_price / (comp.land_size * 43560);
    } else if (
      appraisalData.analysis_type === AnalysisTypes.ACRE &&
      comp.land_dimension === LandDimension.SF
    ) {
      // Convert land size from square feet to acres
      baseAdjustedPsf =
        comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3));
    }
  } else {
    if (
      appraisalData.land_dimension === LandDimension.ACRE &&
      comp.land_dimension === LandDimension.SF
    ) {
      // Convert land size from square feet to acres
      baseAdjustedPsf =
        comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3));
    } else if (
      appraisalData.land_dimension === LandDimension.SF &&
      comp.land_dimension === LandDimension.ACRE
    ) {
      // Convert land size from square feet to acres
      baseAdjustedPsf = parseFloat(
        (comp.sale_price / (comp.land_size * 43560)).toFixed(3)
      );
    }
  }

  // Add logic for comp_adjustment_mode === "Dollar"
  const updatedAdjustedPsf =
    appraisalData.comp_adjustment_mode === 'Dollar'
      ? total + baseAdjustedPsf // Add total directly for "Dollar" mode
      : baseAdjustedPsf + (total / 100) * baseAdjustedPsf; // Add percentage of baseAdjustedPsf to itself
  console.log(
    'appraisalData.comp_adjustment_mode',
    appraisalData.comp_adjustment_mode,
    'total',
    total,
    'baseAdjustedPsf,',
    baseAdjustedPsf,
    'comp',
    comp
  );
  // (total / 100) * price_square_foot + price_square_foot;
  const updatedAverageAdjustedPsf =
    (updatedAdjustedPsf.toFixed(2) * weight) / 100;
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

const EvaluationCostApproach: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [comparativeFactors, setComparativeFactors] = useState<any[]>([]);
  const [maxUnitCount, setMaxUnitCount] = useState<number>(0);

  const [appraisalId, setAppraisalId] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [landDimesion, setLandDimension] = useState('');
  const { handleChange, values, setValues } = useFormikContext<any>();
  const [landDimensions, setLandDimensions] = useState<any>(null);
  const costId = searchParams.get('costId');
  const [buildingSize, setBuildingSize] = useState('');
  const [totalPsfValue, setPsfValue] = useState<number>(0);
  const [totalCostValuation, setTotalCostValuation] = useState<number>(0);

  const [costValuation, setCostValuation] = useState<number | null>(null);
  const [comparisonBasis, setComparisonBasis] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [costIndicatedPsf, setCostIndicatedPsf] = useState<number | null>(null);
  // const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [hasIncomeType, setHasIncomeType] = React.useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [costName, setCostName] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [totalWeightedValue, setTotalWeightedValue] = useState(0);

  const [salesNote, setSalesNote] = useState('new');
  const [improvementsTotalAdjustedCost, setImprovementsTotalAdjustedCost] =
    useState(0);
  const [costValueModified, setCostValueModified] = useState(false);

  const [evalWeight, setEvalWeight] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [openComps, setCompsOpen] = useState(false);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
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

  const [filtereLeasedData, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereRentRollData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const location = useLocation();
  const updatedCompss = location.state?.updatedComps;
  const [updateEvalCostWeightInParent, setUpdateEvalCostWeightInParent] =
    useState(0);
  console.log(
    setCostValueModified,
    costIndicatedPsf,
    totalPsfValue,
    totalCostValuation
  );
  const getLabelFromValue = (value: any) => {
    if (!value || value === '--Select a Subtype--') {
      return '';
    }

    const allOptions = [
      ...propertyTypeOptions,
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

    return value;
  };
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
        const buildingSize = data?.data?.data?.building_size;
        const totalUnits = data?.data?.data?.total_units;
        const totalBeds = data?.data?.data?.total_beds;

        const comparison_basis = data?.data?.data?.comparison_basis;
        setComparisonBasis(comparisonBasis);

        setBuildingSize(
          comparison_basis === 'Unit'
            ? totalUnits
            : comparison_basis === 'Bed'
              ? totalBeds
              : buildingSize
        );
        const mapData = data?.data?.data?.scenarios;

        if (mapData.length > 1) {
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
          ? appraisalApproach.evaluation_cost_approach.id
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
    if (areaInfoData?.data?.data?.scenarios && !areaInfoData.isStale) {
      const updateData = areaInfoData.data.data.scenarios;
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
        (item: { has_lease_approach: any }) => item.has_lease_approach === 1
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeaseData(leaseApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { has_rent_roll_approach: any }) =>
          item.has_rent_roll_approach === 1
      );
      setHasRentRollType(rentRollApproaches.length > 0);
      setFilteredRentRollData(rentRollApproaches);
    }
  }, [areaInfoData?.data?.data?.scenarios]);

  // FETCHING ATTRIBUTES OF APPRAISALS
  const appraisalData = areaInfoData?.data.data || {};

  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[appraisalData.state];
  const appraisalApproach = areaInfoData?.data?.data?.scenarios?.find(
    (approach: any) => (costId ? approach.id == parseFloat(costId) : false)
  );

  const appraisalSalesApproachId =
    appraisalApproach?.evaluation_cost_approach?.id || null;
  // FUNCTION TO FETCH COMPS DATA

  useEffect(() => {
    // if (evalWeight !== null) {
    //   // You can access evalWeight anywhere in the component now
    //   console.log('Evaluation weight available:', evalWeight);
    // }
  }, [evalWeight]);
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `evaluations/get-cost-approach?evaluationId=${id}&evaluationScenarioId=${costId}`,
        {}
      );
      const totalPsfValue = response?.data?.data?.data?.indicated_value_psf;
      const totalCostValuation =
        response?.data?.data?.data?.total_cost_valuation;
      const compsArr = response?.data?.data?.data?.comps;
      setCompsLength(compsArr?.length);
      const costData = response?.data?.data?.data?.eval_weight;
      const evalWeightValue: any = costData * 100;
      setPsfValue(totalPsfValue);
      setTotalCostValuation(totalCostValuation);
      const totalCostvalue =
        response?.data?.data?.data?.improvements_total_adjusted_cost;
      setCostValuation(totalCostvalue);
      const totalCostIndicatedPsf =
        response?.data?.data?.data?.indicated_value_psf;
      setCostIndicatedPsf(totalCostIndicatedPsf);
      // Set the state so it's available throughout the component
      setEvalWeight(evalWeightValue);

      setCompsLength(compsArr.length);

      localStorage.setItem('compsLengthCost', compsArr.length.toString());

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
          appraisalSpecificAdjustment: values.appraisalSpecificAdjustment,
        });
        return; // Exit early if no data
      }

      // Default operating expenses if API returns empty array
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

      // Use API data if available, otherwise use defaults
      const formattedOperatingExpenses =
        response?.data?.data?.data.cost_subject_property_adjustments?.length > 0
          ? response?.data?.data?.data.cost_subject_property_adjustments.map(
              ({ adj_key, adj_value, ...restAdj }: any) => {
                return {
                  ...restAdj,
                  comparison_basis: adj_value ? adj_value + '%' : 0,
                  adj_key: adj_key,
                  adj_value: adj_value,
                };
              }
            )
          : defaultOperatingExpenses;

      // Default appraisal specific adjustments
      const defaultAppraisalAdjustments =
        values.appraisalSpecificAdjustment || [];

      // Use API data if available, otherwise use defaults
      const formattedComparativeAdjustment =
        response?.data?.data?.data.comparison_attributes?.length > 0
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
          : defaultAppraisalAdjustments;
      const calculatedComps = []; // Array to store calculated comp data

      for (let i = 0; i < compsArr.length; i++) {
        const c = compsArr[i];
        const weight = c?.weight;
        const total = c?.total_adjustment;

        // Calculate comp data
        const calculatedCompData = calculateCompData({
          total: total,
          weight: weight,
          comp: c?.comp_details,
          appraisalData,
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
            adj_value: newValue.adj_value || 0,
            customType: isCustom,
          };
        });
        const avgpsf =
          (total / 100) * c?.comp_details?.price_square_foot +
          c?.comp_details?.price_square_foot;
        const finalavgpsf = (avgpsf * weight) / 100;
        // (total / 100) * price_square_foot + price_square_foot;
        // Combine calculated data and formatted expenses
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
        averaged_adjusted_psf:
          response?.data?.data?.data?.averaged_adjusted_psf || 0,
      });

      setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      // Handle the error
    }
  };

  useEffect(() => {
    fetchComposData(values, setValues);
  }, [costId]);
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

  let totalaveragedadjustedpsf = 0;

  values.tableData.forEach((comp: { adjusted_psf: string; weight: any }) => {
    if (comp.adjusted_psf) {
      // Parse the adjusted_psf to a float for calculation
      // const adjustedPsfValue = parseFloat(comp.adjusted_psf);
      const adjustedPsfValue = comp.adjusted_psf
        ? parseFloat(parseFloat(comp.adjusted_psf).toFixed(2))
        : 0;

      // Calculate the weighted value and accumulate it
      totalaveragedadjustedpsf += adjustedPsfValue * (comp.weight / 100);
    }
  });

  const FinalResult =
    parseFloat(totalaveragedadjustedpsf.toFixed(2)) * appraisalData.land_size;
  let totalWeightage = 0;

  values.tableData.forEach((comp: { weight: string }) => {
    if (comp.weight) {
      totalWeightage += parseFloat(comp.weight);
    }
  });
  const newFinalResult = FinalResult + (costValuation || 0);
  console.log('values.tableData', values.tableData);
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
      adjusted_psf: 90,
      weight: parseFloat(item.weight),

      comps_adjustments: comps_adjustments,
    };
  });
  const finalcCostValuation = FinalResult + improvementsTotalAdjustedCost;
  const salesApproachData = {
    ...(appraisalSalesApproachId ? { id: appraisalId } : {}),
    //   'id':appraisalId,
    evaluation_scenario_id: costId ? parseFloat(costId) : null,
    averaged_adjusted_psf: totalaveragedadjustedpsf,
    weight: parseFloat(totalWeightage.toString()),
    notes: salesNote,
    comparison_attributes: sales_comparison_attributes,

    land_value: FinalResult,
    // incremental_value: (FinalResult * evalWeight) / 100,
    incremental_value:
      (FinalResult *
        (updateEvalCostWeightInParent !== undefined &&
        updateEvalCostWeightInParent !== 0
          ? updateEvalCostWeightInParent
          : evalWeight || 0)) /
      100,

    total_cost_valuation: finalcCostValuation,
    indicated_value_psf: Number(finalcCostValuation) / Number(buildingSize),
    indicated_value_punit: 0,

    cost_subject_property_adjustments: subject_property_adjustments,
    comps: comps,
  };

  const finalData = {
    evaluation_id: id ? parseFloat(id) : null,
    cost_approach: salesApproachData,
    weighted_market_value: totalWeightedValue,
  };

  const mutation = useMutate<any, any>({
    queryKey: 'save-cost-approach',
    endPoint: 'evaluations/save-cost-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'update-cost-approach',
    endPoint: 'evaluations/update-cost-approach',
    requestType: RequestType.POST,
  });

  const handleSubmit = async () => {
    setLoader(true);
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
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
        toast.success(response.data.message);
        setLoader(false);
        navigate(`/evaluation/cost-comps-map?id=${id}&costId=${costId}`);
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
    if (hasCostType && filtereCostdData.length > 1) {
      const costIndex = filtereCostdData.findIndex(
        (element) => element.id == costId
      );

      if (costIndex > 0) {
        const costIdRedirectIndex = filtereCostdData[costIndex - 1].id;
        navigate(
          `/evaluation/cost-approach-improvement?id=${id}&costId=${costIdRedirectIndex}`
        );
        return;
      }
    }
    if (hasLeaseType) {
      navigate(
        `/evaluation/lease-comps-map?id=${id}&leaseId=${filtereLeasedData?.[filtereLeasedData.length - 1]?.id}`
      );
      return;
    }
    if (hasSaleType) {
      navigate(
        `/evaluation/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
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
        `/evaluation/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - 1]?.id}`
      );
      return;
    }

    // If none of the above matched, go here
    else {
      navigate(`/evaluation-area-info?id=${id}`);
      return;
    }
  };

  const uploadComps = () => {
    setCompsOpen(true);
  };
  const handleNavigateToComp = async (itemId: any) => {
    localStorage.setItem('activeType', 'land_only');
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
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
          `/evaluation/update-cost-comps/${itemId}/${id}/cost/${costId}`
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  const [hasProcessedComps, setHasProcessedComps] = useState(false);
  useEffect(() => {
    if (updatedCompss && !hasProcessedComps) {
      setTimeout(() => {
        passCompsDataToFilter(updatedCompss);
        setHasProcessedComps(true);
        // Clear the state to prevent re-processing on refresh
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
      }, 3000);
    }
  }, [updatedCompss, hasProcessedComps]);

  // function for handle delete comp
  const handleDeleteComp = async () => {
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
        toast.success(response.data.message);
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
    localStorage.setItem('checkStatus', 'sales');

    localStorage.setItem('activeType', 'land_only');
    // setIsOpen(true);
    navigate(`/evaluation/filter-cost-comps?id=${id}&approachId=${costId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };
  const handleLinkExistingComps = () => {
    localStorage.setItem('activeType', 'land_only');
    navigate(`/evaluation/cost/create-comp?id=${id}&approachId=${costId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };
  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    console.log('updtedcompssssss', updatedComps);
    try {
      // Recalculate totals with updated comps
      let updatedTotalAveragedAdjustedPsf = 0;
      let updatedTotalWeightage = 0;

      updatedComps.forEach((comp: any) => {
        if (comp.adjusted_psf) {
          const adjustedPsfValue = parseFloat(comp.adjusted_psf);
          updatedTotalAveragedAdjustedPsf +=
            adjustedPsfValue * (comp.weight / 100);
        }
        if (comp.weight) {
          updatedTotalWeightage += parseFloat(comp.weight);
        }
      });

      const updatedFinalResult =
        parseFloat(updatedTotalAveragedAdjustedPsf.toFixed(2)) *
        appraisalData.land_size;
      const updatedFinalcCostValuation =
        updatedFinalResult + improvementsTotalAdjustedCost;

      // Create updated comps data
      const updatedCompsData = updatedComps.map((item: any, index: number) => {
        const comps_adjustments =
          item.expenses?.map((exp: any) => ({
            adj_key: exp.adj_key,
            adj_value: exp.adj_value,
          })) || [];
        console.log('item', item);
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
        evaluation_scenario_id: costId ? parseFloat(costId) : null,
        averaged_adjusted_psf: updatedTotalAveragedAdjustedPsf,
        weight: parseFloat(updatedTotalWeightage.toString()),
        notes: salesNote,
        comparison_attributes: sales_comparison_attributes,
        land_value: updatedFinalResult,
        incremental_value:
          (updatedFinalResult *
            (updateEvalCostWeightInParent !== undefined &&
            updateEvalCostWeightInParent !== 0
              ? updateEvalCostWeightInParent
              : evalWeight || 0)) /
          100,
        total_cost_valuation: updatedFinalcCostValuation,
        indicated_value_psf:
          Number(updatedFinalcCostValuation) / Number(buildingSize),
        indicated_value_punit: 0,
        cost_subject_property_adjustments: subject_property_adjustments,
        comps: updatedCompsData,
      };

      const updatedFinalData = {
        evaluation_id: id ? parseFloat(id) : null,
        cost_approach: updatedSalesApproachData,
        weighted_market_value: totalWeightedValue,
      };

      let response;
      if (appraisalSalesApproachId) {
        response = await mutations.mutateAsync(updatedFinalData);
        fetchComposData(values, setValues);
      } else {
        const modifiedPayload = {
          ...updatedFinalData,
          cost_approach: {
            ...updatedFinalData.cost_approach,
            comps: updatedFinalData.cost_approach.comps,
          },
        };
        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  console.log('tabledataa', values.tableData);
  // function for pass comp data to advance filter
  const passCompsDataToFilter = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = 100 / totalComps.length;
      let count = 0;
      const sortedComps = totalComps.sort((a, b) => {
        // Step 1: Sort Pending items first
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

        // Step 3: Sort Closed items after Pending
        if (a.sale_status === 'Closed' && b.sale_status !== 'Closed') {
          return -1;
        }
        if (a.sale_status !== 'Closed' && b.sale_status === 'Closed') {
          return 1;
        }

        // Step 4: Within Closed, sort alphabetically by business_name
        if (a.sale_status === 'Closed' && b.sale_status === 'Closed') {
          return (
            (new Date(b.date_sold as any) as any) -
            (new Date(a.date_sold as any) as any)
          );
        }

        // Step 5: For any other sale_status, keep original order
        return 0;
      });

      const updatedComps = sortedComps.map((comp) => {
        // comp.weight = newInitialWeight;
        count++;
        if (sortedComps.length === 3 && count === sortedComps.length) {
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

      // Call API with updated comps after state update
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
  console.log('updatedcompss', updatedCompss);
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
      const newInitialWeight: number = 100 / totalComps.length;
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
    >
      {openComps && (
        <EvaluationUploadCostCompsModal
          open={openComps}
          onClose={() => setCompsOpen(false)}
          setCompsModalOpen={setCompsModalOpen}
          setCompsData={setCompsData}
          compsLength={compsLength}
          compsData={compsData ?? []} // Avoid passing null where an array is needed
        />
      )}
      {compsModalOpen && (
        <EvaluationAiCostCompsTable
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
          <div className="lg:p-4 p-2 !pt-0 bg-white flex-1">
            <div className="max-w-full h-[160px]"></div>
            <div className="p-2">
              <div className="flex h-[20px] gap-2 items-center"></div>
              <h2 className="text-gray-500  text-xs font-bold mt-0 min-h-[40px] mt-2 overflow-hidden whitespace-nowrap text-ellipsis">
                Location
              </h2>
              <p className="pb-1 text-gray-500 text-xs font-bold text-gray-500">
                Date Sold
              </p>
              {/* <p className="pb-1 text-gray-500 text-xs font-bold text-gray-500">Property Type</p> */}
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
            <div className="mt-2 px-1 pb-1">
              <FieldArray
                name="operatingExpenses"
                render={() => (
                  <>
                    {values.operatingExpenses &&
                    values.operatingExpenses.length > 0 ? (
                      values.operatingExpenses.map((zone: any, i: number) => (
                        <div
                          className="flex items-center justify-between gap-1 h-[20px]"
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
                        No operating expenses data
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            {/* //-----------------------------------------------------------------------------------? */}

            <div className="mt-1.5 flex flex-col gap-[2px]">
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

              <p className="text-base h-[22px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
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
              {/* <div>
                <p className="text-xs font-bold flex h-[20px] text-gray-500">
                  {getLabelFromValue1(appraisalData?.zonings[0]?.zone)}{' '}
                </p>
              </div> */}
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
                      No data
                    </p>
                  )
                )
              )}
            </div>
            <div className="pb-1 flex flex-col gap-[2px] mt-2 min-h-[26px] border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
              {values.operatingExpenses?.length > 0
                ? values.operatingExpenses.map((index: number) => (
                    <p
                      key={index}
                      className={`text-xs h-[18px] font-bold text-ellipsis overflow-hidden whitespace-nowrap ${!appraisalData.operatingExpenses?.[index]?.names ? 'text-transparent' : ''}`}
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
              <p className="text-[#0da1c7] h-[22px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap font-bold text-base uppercase">
                {formatPrice(FinalResult || 0)}
              </p>
            </div>
          </div>
        </div>
        {values.tableData?.map((item: any, index: any) => (
          <EvaluationCostCompCard
            index={index}
            // handleChange={() => setCostValueModified(true)}
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
              <Icons.UploadIcon
                className="text-[#0DA1C7]"
                style={{ fontSize: '40px' }}
              />
              <Typography
                variant="h6"
                className="text-gray-600 text-sm font-semibold mt-2"
              >
                Upload Comp
              </Typography>
            </div>
          </div>
        )}
      </div>

      <div className="xl:px-[60px] mt-14 pb-32 px-[15px]">
        <h4 className="text-gray-800 text-xs font-medium font-bold">Notes</h4>
        <TextEditor
          editorData={(content) => setSalesNote(content)}
          editorContent={
            salesNote || ''
            // '<strong>Even</strong>: No Adjustment, Similar to Subject Property. <strong>Minus</strong>: Downward adjustment, Better than/Superior to Subject Property. <strong>Plus</strong>: Upward Adjustment Poorer than/Inferior to Subject Property.'
          }
          value={salesNote} // Ensure the 'value' prop is provided
        />
      </div>
    </EvaluationMenuOptions>
  );
};

export default EvaluationCostApproach;

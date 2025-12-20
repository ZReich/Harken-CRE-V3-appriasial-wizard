import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
import SelectTextField from '@/components/styles/select-input';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import { options, usa_state } from '@/pages/comps/comp-form/fakeJson';
import {
  AllTypeJson,
  conditionOptions,
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  residentialOptions,
  retailOptions,
  specialOptions,
  topographyOptions,
  landTypeOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Grid, Typography } from '@mui/material';
import axios from 'axios';

import { FieldArray, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import defaultPropertImage from '../../../images/default-placeholder.png';
import loadingImage from '../../../images/loading.png';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import EvaluationSubjectPropertyAdjustmentNoteModal from './evaluation-sales-approach-adjustment-note-modal';
import EvaluationSalesCompCard from './evaluation-sales-comps-card';
import EvaluationAiSalesCompsData from './evaluation-sales-comps-table';
import EvaluationUploadSalesCompsModal from './evaluation-upload-comps-from-sales-approach';
import { propertyTypeOptions } from '@/pages/my-profile/significant-transaction/select-option/Select';
import SubjectPropertyComparitiveAttributes from '@/utils/subject-property-comparitive.attributes';
import {
  AnalysisTypes,
  LandDimension,
  PropertyTypes,
} from '@/pages/appraisal/overview/OverviewEnum';
import { capitalizeWords, formatPrice } from '@/utils/sanitize';

// import FilterMapHeaderOptions from './sales-filter-menu-option';

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

  expenses?.forEach(
    (exp: { adj_value: any; adj_key: string; extra_amenities: any[] }) => {
      // Special handling for other_amenities
      if (
        exp.adj_key === 'other_amenities' &&
        exp.extra_amenities &&
        exp.extra_amenities.length > 0
      ) {
        let amenitiesTotal = 0;
        exp.extra_amenities.forEach((amenity) => {
          if (amenity.another_amenity_value) {
            const valueStr = String(amenity.another_amenity_value);
            if (valueStr.trim() !== '') {
              const numValue = parseFloat(valueStr.replace(/[$,]/g, '') || '0');
              if (!isNaN(numValue)) {
                amenitiesTotal += numValue;
              }
            }
          }
        });

        total += amenitiesTotal;
      } else if (exp.adj_value) {
        // Normal processing for all other expenses
        const valueStr = String(exp.adj_value);
        const numValue = parseFloat(valueStr.replace(/[$,%]/g, '') || '0');
        if (!isNaN(numValue)) {
          total += numValue;
        }
      }
    }
  );

  return { total, expenses };
};
// Function to format the values
let adjFactores: any;
let QualitativeadjFactores: any;
// let comparativeFActors: any;

const EvaluationSalesApproach: React.FC = () => {
  type DropdownField = {
    id: number;
    value: string;
    isTextField: boolean;
    customValue: any;
    input: any;
    placeholder: string;
  };
  const [loader, setLoader] = useState(false);
  const calculateCompData = ({ total, weight, comp, appraisalData }: any) => {
    // const price_square_foot = comp.price_square_foot;
    let price_square_foot: number;
    if (comp?.price_square_foot) {
      price_square_foot = comp?.price_square_foot;
      if (appraisalData.comp_type === PropertyTypes.LAND_ONLY) {
        if (
          appraisalData?.analysis_type === AnalysisTypes.SF &&
          comp.land_dimension === LandDimension.ACRE
        ) {
          price_square_foot = comp.sale_price / (comp.land_size * 43560);
        } else if (
          appraisalData?.analysis_type === AnalysisTypes.ACRE &&
          comp.land_dimension === LandDimension.SF
        ) {
          price_square_foot =
            comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3));
        }
      }
    } else {
      if (appraisalData.comp_type === PropertyTypes.LAND_ONLY) {
        if (
          appraisalData?.analysis_type === AnalysisTypes.SF &&
          comp.land_dimension === LandDimension.ACRE
        ) {
          price_square_foot = comp.sale_price / (comp.land_size * 43560);
        } else if (
          appraisalData?.analysis_type === AnalysisTypes.ACRE &&
          comp.land_dimension === LandDimension.SF
        ) {
          price_square_foot =
            comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3));
        } else {
          price_square_foot = parseFloat(
            (comp.sale_price / comp.land_size).toFixed(2)
          );
        }
      } else {
        price_square_foot = parseFloat(
          (comp.sale_price / comp.building_size).toFixed(2)
        );
      }
    }
    const bedPerSqFit =
      comp.sale_price === 0 && comp.total_beds === 0
        ? 0
        : comp.total_beds === 0
          ? 0
          : comp.sale_price / comp.total_beds;

    const bedUnitPerSqFt =
      comp.total_units === 0 ? 0 : comp.sale_price / comp.total_units;
    const finalBed =
      appraisalData?.comp_adjustment_mode === 'Dollar'
        ? total + bedPerSqFit
        : (total / 100) * bedPerSqFit + bedPerSqFit;

    const finalUnits =
      appraisalData?.comp_adjustment_mode === 'Dollar'
        ? total + bedUnitPerSqFt
        : (total / 100) * bedUnitPerSqFt + bedUnitPerSqFt;

    const updatedAdjustedPsf =
      appraisalData?.comp_adjustment_mode === 'Dollar'
        ? total + price_square_foot
        : (total / 100) * price_square_foot + price_square_foot;

    let finalAdjustePricePerAcre;

    if (appraisalData?.comp_adjustment_mode === 'Dollar') {
      if (
        appraisalData.analysis_type === AnalysisTypes.ACRE &&
        comp.land_dimension === LandDimension.SF
      ) {
        finalAdjustePricePerAcre =
          total + (comp.sale_price / comp?.land_size) * 43560;
      } else if (
        appraisalData.analysis_type === AnalysisTypes.SF &&
        comp.land_dimension === LandDimension.ACRE
      ) {
        finalAdjustePricePerAcre =
          total +
          comp.sale_price / parseFloat((comp?.land_size / 43560).toFixed(2));
      } else {
        finalAdjustePricePerAcre = total + comp.sale_price / comp?.land_size;
      }
    } else {
      if (
        appraisalData.analysis_type === AnalysisTypes.ACRE &&
        comp.land_dimension === LandDimension.SF
      ) {
        finalAdjustePricePerAcre =
          (comp.sale_price / comp?.land_size) * 43560 * ((total + 100) / 100);
      } else if (
        appraisalData.analysis_type === AnalysisTypes.SF &&
        comp.land_dimension === LandDimension.ACRE
      ) {
        finalAdjustePricePerAcre =
          (comp.sale_price / parseFloat((comp?.land_size / 43560).toFixed(2))) *
          ((total + 100) / 100);
      } else {
        finalAdjustePricePerAcre =
          (comp.sale_price / comp?.land_size) * ((total + 100) / 100);
      }
    }

    const updatedAverageAdjustedPsf =
      (updatedAdjustedPsf.toFixed(2) * weight) / 100;

    const updatedAverageAdjustedPsfAcre =
      (finalAdjustePricePerAcre * weight) / 100;

    const bedAveragedAdjustedPsf = (finalBed * weight) / 100;
    const unitAveragedAdjustedPsf = (finalUnits * weight) / 100;

    const updatedBlendedPsf = (price_square_foot * weight) / 100;
    const bedUpdatedBlendedPsf = (bedPerSqFit * weight) / 100;
    const unitUpdatedBlendedPsf = (bedPerSqFit * weight) / 100;

    return {
      adjusted_psf:
        comp?.comparison_basis === 'Bed'
          ? finalBed
          : comp?.comparison_basis === 'Unit'
            ? finalUnits
            : appraisalData.analysis_type === AnalysisTypes.ACRE
              ? finalAdjustePricePerAcre
              : updatedAdjustedPsf,
      // averaged_adjusted_psf: updatedAverageAdjustedPsf,
      averaged_adjusted_psf:
        comp?.comparison_basis == 'Bed'
          ? bedAveragedAdjustedPsf
          : comp.comparison_basis === 'Unit'
            ? unitAveragedAdjustedPsf
            : appraisalData.analysis_type === AnalysisTypes.ACRE
              ? updatedAverageAdjustedPsfAcre
              : updatedAverageAdjustedPsf,
      blended_adjusted_psf:
        comp?.comparison_basis == 'Bed'
          ? bedUpdatedBlendedPsf
          : comp.comparison_basis === 'Unit'
            ? unitUpdatedBlendedPsf
            : updatedBlendedPsf,
      weight,
      total,
    };
  };
  const location = useLocation();
  const updatedCompss = location.state?.updatedComps;
  const [updateEvalSaleWeightInParent, setUpdateEvalSaleWeightInParent] =
    useState(0);

  // Retrieve query parameters
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  // const { salesId } = useParams()
  const [appraisalId, setAppraisalId] = useState('');
  const { handleChange, values, setValues } = useFormikContext<any>();
  if (!adjFactores) adjFactores = values.operatingAllExpensesInitial;

  if (!QualitativeadjFactores)
    QualitativeadjFactores = values.salesCompQualitativeAdjustment;

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  // const [ setIsOpen] = useState(false);
  const [openComps, setCompsOpen] = useState(false);
  const [compsLength, setCompsLength] = useState('');
  const [comparisonBasis, setComparisonBasis] = useState<any>(null);
  const [compsType, setCompsType] = useState<any>(null);
  const [compType, setCompType] = useState<any>(null);
  const [landDimensions, setLandDimensions] = useState<any>(null);
  const [editorValue, setEditorValue] = useState(''); // current editor text
  const salesId = searchParams.get('salesId');
  const [analysisType, setAnalysisType] = useState<any>(null);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [, setAreaInfoData1] = useState<any>();
  const [salesApproachName, setSalesApproachName] = useState('');
  const [buildingSize, setBuildingSize] = useState('');
  const [landSize, setLandSize] = useState('');
  const [totalWeightedValue, setTotalWeightedValue] = useState(0);

  // const [totalSalesValueBed, SetTotalSalesValueBed] = useState('');
  // const [totalSalesValueUnit, SetTotalSalesValueUnit] = useState('');

  const [open] = useState(false);
  const [hasIncomeType, setHasIncomeType] = useState(false);
  const [hasRentRollType, setHasRentRollType] = useState(false);
  const [hasmultiFamilyType, setHasMultiFamilyType] = useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [hasCapType, setHasCapType] = useState(false);
  const [salesNote, setSalesNote] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [className, setClassName] = useState(false);
  const [indexType, setIndexType] = useState<any>();
  const [appraisalType, setAppraisalType] = useState<any>();
  const [maxUnitCount, setMaxUnitCount] = useState<number>(0);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [overallComparabilityData, setOverallComparabilityData] = useState('');
  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filteredCapData, setFilteredCapData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  console.log(appraisalType, overallComparabilityData);
  // const [evaluationWeight, setEvaluationWeght] = useState<any>(null);
  const [filtereRentRolldData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filteredMultiFamilyldData, setFilteredMultiFamilyData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [qualitativeApproachItems, setQualitativeApproaachItems] = useState<
    SubOption[]
  >([]);
  const [quanitativeApproaachItems, setQuanitativeApproaachItems] = useState<
    SubOption[]
  >([]);
  const uploadComps = () => {
    setCompsOpen(true);
  };
  const [comparativeFactors, setComparativeFactors] = useState<any[]>([]);
  const navigate = useNavigate();

  // api for get/appraisals
  const {
    data: areaInfoData,
    refetch,
    isLoading,
  } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(salesId),
      refetchOnWindowFocus: false,
      onSuccess: (data: any) => {
        const comparisonBasis = data?.data?.data?.comparison_basis;
        const landDimension = data?.data?.data?.land_dimension;
        const compsType = data?.data?.data?.comp_type;
        const analysisType = data?.data?.data?.analysis_type;
        const mapData = data?.data?.data?.scenarios;
        const subjectCompType = data?.data?.data?.comp_type;
        const appraisalType = data?.data?.data?.evaluation_type;
        const buildingSize = data?.data?.data?.building_size;
        const landSize = data?.data?.data?.land_size;

        setLandSize(landSize);
        setBuildingSize(buildingSize);

        // Map sales approach name
        if (mapData.length > 1) {
          mapData &&
            mapData.map((item: any) => {
              if (item.id == salesId) {
                setSalesApproachName(item.name);
              }
            });
        }

        // Find and set cover image URL
        const coverImage = data?.data?.data?.evaluation_files?.find(
          (file: any) => file.title === 'cover'
        );
        if (coverImage) {
          const imageUrl = coverImage.dir;
          setCoverImageUrl(imageUrl);
        }

        // Fetch compos data
        if (salesId) {
          fetchComposData(values, setValues);
        } else {
          console.log('error');
        }

        // Set various state values
        setComparisonBasis(comparisonBasis);
        localStorage.setItem('comparisonBasis', comparisonBasis);

        localStorage.setItem('appraisalType', appraisalType);
        setAppraisalType(appraisalType);
        setCompsType(compsType);
        setLandDimensions(landDimension);
        setAnalysisType(analysisType);
        setCompType(subjectCompType);

        if (data?.data?.data?.zonings) {
          const type_sqft = data?.data?.data?.zonings?.map((ele: any) => {
            const findDistributionLabel = (AllTypeJson: any) => {
              const foundItem = AllTypeJson.find(
                (item: { value: string }) => item?.value === ele?.sub_zone
              );
              return foundItem ? foundItem.label : ele?.sub_zone;
            };
            return {
              adjusted_cost: 0,
              adjusted_psf: 0,
              depreciation: 0,
              type: findDistributionLabel(AllTypeJson),
              zoning_id: ele?.id,
              sub_zone_custom: '',
              sf_area: ele?.sq_ft,
              isDisabled: true,
              structure_cost: 0,
              depreciation_amount: 0,
            };
          });
          setAreaInfoData1(type_sqft);
        }

        // Find and set the maximum unit count
        const propertyUnits = data?.data?.data?.property_units || [];
        const maxUnitCount = propertyUnits.reduce(
          (max: number, unit: any) => Math.max(max, unit?.sq_ft || 0),
          0
        );
        setMaxUnitCount(maxUnitCount); // Assuming setMaxUnitCount is your state setter
      },
    },
  });
  // api for global codes
  const { data } = useGet<any>({
    queryKey: 'all',
    endPoint: `globalCodes`,
    config: { refetchOnWindowFocus: false },
  });

  type SubOption = {
    code: string;
    name: string;
  };
  const [dropdownFields, setDropdownFields] = useState<DropdownField[]>([]);
  // fetch sales_qualitative_data on render screen

  useEffect(() => {
    if (data?.data?.data) {
      const initialQualitativeOption = data.data.data.find(
        (item: any) => item.type === 'sales_comp_qualitative_adjustments'
      )?.options;

      setQuanitativeApproaachItems(initialQualitativeOption || []);

      const initialDropdownFields = (initialQualitativeOption || []).map(
        (option: any, index: any) => ({
          id: index + 1,
          value: option.code,
          isTextField: false,
        })
      );

      setDropdownFields(initialDropdownFields);
    }
    if (data?.data?.data) {
      const initialQualitativeOption = data.data.data.find(
        (item: any) => item.type === 'sales_comp_quantitative_adjustments'
      )?.options;

      // Set subOptions based on fetched data
      setQualitativeApproaachItems(initialQualitativeOption || []);

      // Initialize dropdownFields to match the number of subOptions
      const initialDropdownFields = (initialQualitativeOption || []).map(
        (option: any, index: any) => ({
          id: index + 1,
          value: option.code, // Set initial value based on option
          isTextField: false, // Track if this should be a text field
        })
      );

      setDropdownFields(initialDropdownFields);
    }
  }, [data]);

  //api for get recent-page url
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-position',
    endPoint: `evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      await mutateAsync({ position: ApiUrl });
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync, salesId]);

  useEffect(() => {
    refetch();
  }, [areaInfoData?.data?.data, salesId, refetch]);

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

  // for sales-navigation
  useEffect(() => {
    if (areaInfoData?.data?.data?.scenarios && !areaInfoData.isStale) {
      const updateData = areaInfoData.data.data.scenarios;
      const salesApproaches = updateData.filter(
        (item: { has_sales_approach: any }) => item.has_sales_approach === 1
      );
      setHasSaleType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { has_rent_roll_approach: any }) =>
          item.has_rent_roll_approach === 1
      );
      setHasRentRollType(rentRollApproaches.length > 0);
      setFilteredRentRollData(rentRollApproaches);

      const incomeApproaches = updateData.filter(
        (item: { has_income_approach: any }) => item.has_income_approach === 1
      );
      setHasIncomeType(incomeApproaches.length > 0);
      setFilteredData(incomeApproaches);
      const multiFamilyApproaches = updateData.filter(
        (item: { has_multi_family_approach: any }) =>
          item.has_multi_family_approach === 1
      );
      setHasMultiFamilyType(multiFamilyApproaches.length > 0);
      setFilteredMultiFamilyData(multiFamilyApproaches);
      const capApproaches = updateData.filter(
        (item: { has_cap_approach: any }) => item.has_cap_approach === 1
      );
      setHasCapType(capApproaches.length > 0);
      setFilteredCapData(capApproaches);
    }
  }, [areaInfoData?.data?.data?.scenarios]);

  const appraisalData = areaInfoData?.data.data || {};
  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[appraisalData.state];
  const zonningsData = areaInfoData?.data?.data?.zonings || [];

  const appraisalApproach = areaInfoData?.data?.data?.scenarios?.find(
    (approach: any) => (salesId ? approach.id == parseFloat(salesId) : false)
  );

  const appraisalSalesApproachId =
    appraisalApproach?.evaluation_sales_approach?.id || null;
  // State for evaluation weight
  const [evaluationWeight, setEvaluationWeight] = useState<number | null>(null);

  // Make evaluation weight available throughout the component

  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `evaluations/get-sales-approach?evaluationId=${id}&evaluationScenarioId=${salesId}`,
        {}
      );

      const salesData = response?.data?.data?.data?.eval_weight;

      const evalWeight: any = salesData * 100;
      setEvaluationWeight(evalWeight); // Using the new state setter
      localStorage.setItem(
        'evalWeightSales',
        response?.data?.data?.data?.eval_weight
      );
      const compsArr = response?.data?.data?.data?.comp_data;
      setCompsLength(compsArr?.length);
      localStorage.setItem('evaluationcompsLenght', compsArr?.length);
      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      const salesNoteForComp = response?.data?.data?.data?.note;
      setSalesNote(salesNoteForComp);
      if (!compsArr) {
        setValues({
          ...values,
          tableData: [],
          operatingExpenses: values.operatingExpenses,
        });
        return; // Exit if no data
      }
      // Use existing data or default to values from state based on array emptiness
      const responseData = response?.data?.data?.data;

      const formattedOperatingExpenses =
        responseData?.subject_property_adj?.length > 0
          ? responseData.subject_property_adj.map(
              ({ adj_key, adj_value, ...restAdj }: any) => ({
                ...restAdj,
                comparison_basis: adj_value ? adj_value + '%' : 0,
                adj_key,
                adj_value,
              })
            )
          : values.operatingExpenses;

      const formattedQualitativeExpenses =
        responseData?.subject_qualitative_adjustments?.length > 0
          ? responseData.subject_qualitative_adjustments.map(
              ({ adj_key, adj_value, ...restAdj }: any) => ({
                ...restAdj,
                comparison_basis: adj_value ? adj_value : 'Similar',
                adj_key,
                adj_value,
              })
            )
          : values.salesCompQualitativeAdjustment;

      const formattedComparativeAdjustment =
        responseData?.sales_comparison_attributes?.length > 0
          ? responseData.sales_comparison_attributes.map(
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

      const calculatedComps = [];
      for (let i = 0; i < compsArr.length; i++) {
        const c = compsArr[i];
        const weight = c?.weight;
        const total = c?.total_adjustment;

        const calculatedCompData = calculateCompData({
          total: total,
          weight: weight,
          comp: c?.comp_details,
          appraisalData,
        });

        const formattedExpenses = formattedOperatingExpenses.map((oe: any) => {
          const newValue = c.comps_adjustments.find(
            (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
          );

          const isCustom = !options.some(
            (option: { value: any }) => option.value === newValue?.adj_value // Safely access adj_value
          );

          return {
            ...oe,
            adj_key: newValue?.adj_key || '', // Provide a fallback if newValue or adj_key is undefined
            adj_value:
              typeof newValue?.adj_value === 'string' &&
              !isNaN(Number(newValue.adj_value)) // Check if adj_value is a string and can be converted to a number
                ? parseFloat(newValue.adj_value) // Convert to a number
                : newValue?.adj_value || 0, // Use the value as-is or provide a fallback to 0
            customType: isCustom,
          };
        });

        const formattedQualitativeApproach = formattedQualitativeExpenses.map(
          (oe: any) => {
            // Find matching adjustment or use default
            const newValue = c.comps_qualitative_adjustments.find(
              (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
            ) || { adj_key: oe.adj_key, adj_value: 'Similar' };

            // Ensure adj_value exists before checking
            const adjValue = newValue.adj_value || 'Similar';

            // Check if it's a custom value
            const isCustom =
              adjValue &&
              !formattedDropdownOptions.some(
                (option: { value: any }) =>
                  String(option.value).toLowerCase() ===
                  String(adjValue).toLowerCase()
              );

            return {
              ...oe,
              adj_key: newValue.adj_key,
              adj_value:
                typeof adjValue === 'string'
                  ? adjValue.replace(/_/g, ' ')
                  : String(adjValue),
              customType: isCustom,
            };
          }
        );

        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          expenses: formattedExpenses,
          quantitativeAdjustments: formattedQualitativeApproach,
          // appraisalSpecificAdjustment: formattedComparativeApproach,
          id: c.id,
          comp_id: c.comp_id,
          overall_comparability: c.overall_comparability,
          // averaged_adjusted_psf: avgpsf,
          blended_adjusted_psf: c.blended_adjusted_psf,
          weight: c.weight,
          total: c.total_adjustment,
          adjustment_note: c?.adjustment_note,
        });
      }
      //chekc this tomorrow
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
      setValues({
        ...values,
        tableData: sortedComps,
        operatingExpenses: formattedOperatingExpenses,
        salesCompQualitativeAdjustment: formattedQualitativeExpenses,
        appraisalSpecificAdjustment: formattedComparativeAdjustment,
      });

      setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      console.error('Error fetching comps data:', error);
      // Handle the error appropriately
    }
  };
  useEffect(() => {
    fetchComposData(values, setValues);
  }, [salesId]);

  // Store sales values in localStorage for create-comp flow
  useEffect(() => {
    if (
      values.operatingExpenses &&
      values.salesCompQualitativeAdjustment &&
      values.appraisalSpecificAdjustment
    ) {
      const salesApproachValues = {
        operatingExpenses: values.operatingExpenses,
        salesCompQualitativeAdjustment: values.salesCompQualitativeAdjustment,
        appraisalSpecificAdjustment: values.appraisalSpecificAdjustment,
      };
      localStorage.setItem(
        'salesApproachValues',
        JSON.stringify(salesApproachValues)
      );
    }
  }, [
    values.operatingExpenses,
    values.salesCompQualitativeAdjustment,
    values.appraisalSpecificAdjustment,
  ]);

  // const tableLength = values.tableData.length;
  // const tableData = values?.tableData;

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

  function transformsalesCompQualitativeAdjustmentToAdjustments(
    salesCompQualitativeAdjustment: any[]
  ) {
    return salesCompQualitativeAdjustment?.map((expense) => ({
      adj_key: expense?.adj_key?.toLowerCase()?.replace(/\s+/g, '_'),
      adj_value: expense?.adj_value,
      subject_property_value: expense?.subject_property_value
        ? expense?.subject_property_value
        : '',
    }));
  }
  const subject_qualitative_adjustments =
    transformsalesCompQualitativeAdjustmentToAdjustments(
      values.salesCompQualitativeAdjustment
    );

  let totalaveragedadjustedpsf: any = 0;

  values.tableData.forEach((comp: { averaged_adjusted_psf: string }) => {
    if (comp.averaged_adjusted_psf) {
      totalaveragedadjustedpsf += parseFloat(comp.averaged_adjusted_psf);
    }
  });

  // calculation of totaal zoning data
  const calculateTotalZoningValue = (zonings: any[]) => {
    return zonings.reduce((total, zoning) => {
      const sqFt = parseFloat(zoning.sq_ft);
      const weightSf = parseFloat(zoning.weight_sf);

      if (!isNaN(sqFt) && !isNaN(weightSf)) {
        const calculatedValue = (sqFt * weightSf) / 100;

        return total + calculatedValue;
      }
      return total;
    }, 0);
  };

  const result = calculateTotalZoningValue(zonningsData);
  const calculateTotalBeds = (data: any) => {
    return data.reduce((total: any, item: any) => total + (item.bed || 0), 0);
  };
  const totalBeds = calculateTotalBeds(zonningsData);

  const calculateTotalUnits = (data: any) => {
    return data.reduce((total: any, item: any) => total + (item.unit || 0), 0);
  };
  const totalUnits = calculateTotalUnits(zonningsData);
  const totalSaleValue = totalBeds * totalaveragedadjustedpsf;
  const totalSaleValueUnit = totalUnits * totalaveragedadjustedpsf;
  totalaveragedadjustedpsf = parseFloat(totalaveragedadjustedpsf.toFixed(2));

  const FinalResult = result * totalaveragedadjustedpsf;
  // const costIndicatedPsf = FinalResult / buildingSize;
  // const costIndicatedPsf = FinalResult / Number(buildingSize);

  const totalSalesUnitOfSquareftOrACre =
    totalaveragedadjustedpsf * appraisalData.land_size;

  const newcostIndicatedPsf =
    compsType === 'land_only'
      ? totalSalesUnitOfSquareftOrACre / Number(landSize)
      : FinalResult / Number(buildingSize);

  let totalWeightage = 0;
  values.tableData.forEach((comp: { weight: string }) => {
    if (comp.weight) {
      totalWeightage += parseFloat(comp.weight);
    }
  });
  const comp_data = values.tableData?.map((item: any, index: number) => {
    const comps_adjustments =
      item.expenses?.map((exp: any) => ({
        adj_key: exp.adj_key
          ? exp.adj_key.trim().toLowerCase().replace(/\s+/g, '_')
          : '',
        adj_value: exp.adj_value,
      })) || [];

    const comps_qualitative_adjustments =
      item.quantitativeAdjustments?.map((qualExp: any) => ({
        adj_key: qualExp.adj_key ? qualExp.adj_key.replace(/\s+/g, '_') : '',
        adj_value: qualExp.adj_value,
        // isCustom: false
      })) || [];

    const comp_id = item.comp_id || item.id;
    return {
      ...(appraisalSalesApproachId ? { id: item.id } : {}),

      comp_id: comp_id,

      order: index + 1,
      overall_comparability: item.overall_comparability
        ? item.overall_comparability
        : 'similar',
      adjustment_note: item?.adjustment_note,
      total_adjustment: item?.total,
      adjusted_psf: item.adjusted_psf,
      weight: parseFloat(item.weight),
      blended_adjusted_psf: item.blended_adjusted_psf,
      // averaged_adjusted_psf: item.averaged_adjusted_psf,
      averaged_adjusted_psf: item.averaged_adjusted_psf,
      comps_adjustments: comps_adjustments,
      comps_qualitative_adjustments: comps_qualitative_adjustments,
    };
  });
  const salesApproachData = {
    ...(appraisalSalesApproachId ? { id: appraisalId } : {}),
    evaluation_scenario_id: salesId ? parseFloat(salesId) : null,

    averaged_adjusted_psf: totalaveragedadjustedpsf,

    sales_approach_value:
      compsType === 'land_only'
        ? totalSalesUnitOfSquareftOrACre
        : comparisonBasis === 'Bed'
          ? totalSaleValue
          : comparisonBasis === 'Unit'
            ? totalSaleValueUnit
            : FinalResult,

    incremental_value:
      compsType === 'land_only'
        ? (totalSalesUnitOfSquareftOrACre *
            (updateEvalSaleWeightInParent !== undefined &&
            updateEvalSaleWeightInParent !== 0
              ? updateEvalSaleWeightInParent
              : evaluationWeight || 0)) /
          100
        : comparisonBasis === 'Bed'
          ? (totalSaleValue *
              (updateEvalSaleWeightInParent !== undefined &&
              updateEvalSaleWeightInParent !== 0
                ? updateEvalSaleWeightInParent
                : evaluationWeight || 0)) /
            100
          : comparisonBasis === 'Unit'
            ? (totalSaleValueUnit *
                (updateEvalSaleWeightInParent !== undefined &&
                updateEvalSaleWeightInParent !== 0
                  ? updateEvalSaleWeightInParent
                  : evaluationWeight || 0)) /
              100
            : (FinalResult *
                (updateEvalSaleWeightInParent !== undefined &&
                updateEvalSaleWeightInParent !== 0
                  ? updateEvalSaleWeightInParent
                  : evaluationWeight || 0)) /
              100,

    weight: parseFloat(totalWeightage.toString()),
    note: salesNote,
    subject_property_adj: subject_property_adjustments,
    subject_qualitative_adjustments: subject_qualitative_adjustments,
    sales_comparison_attributes: sales_comparison_attributes,
    sales_approach_indicated_val: FinalResult,

    comp_data: comp_data,
  };
  // const indicatedAnnualRangeforWeightage = localStorage.getItem(
  //   'indicatedAnnualRangeforWeightage'
  // );
  const finalData = {
    evaluation_id: id ? parseFloat(id) : null,
    sales_approach: salesApproachData,
    weighted_market_value: totalWeightedValue,
  };
  const mutation = useMutate<any, any>({
    queryKey: 'save-sale-approach',
    endPoint: 'evaluations/save-sales-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'save-sale-approach',
    endPoint: 'evaluations/update-sales-approach',
    requestType: RequestType.POST,
  });
  const handleAddNewComp = () => {
    // handleSubmit();
    localStorage.setItem('checkStatus', 'sales');

    navigate(`/evaluation/filter-comps?id=${id}&approachId=${salesId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };

  const handleLinkExistingComps = () => {
    navigate(`/evaluation/sales/create-comp?id=${id}&approachId=${salesId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };
  const handleSubmit = async () => {
    setLoader(true);
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);

        fetchComposData(values, setValues);
      } else {
        // Add API

        const modifiedPayload = {
          ...finalData,
          sales_approach: {
            ...finalData.sales_approach,
            comp_data: finalData.sales_approach.comp_data,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        toast.success(response.data.message);
        setLoader(false);
        navigate(`/evaluation/sales-comps-map?id=${id}&salesId=${salesId}`);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleSaveAdjustmentNote = async () => {
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
        // fetchComposData(values,setValues,appraisalSalesApproachId)

        fetchComposData(values, setValues);
      } else {
        // Add API

        const modifiedPayload = {
          ...finalData,
          sales_approach: {
            ...finalData.sales_approach,
            comp_data: finalData.sales_approach.comp_data,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
        refetch();
      }

      if (response && response.data && response.data.message) {
        // toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleNavigateToComp = async (itemId: any) => {
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
        // fetchComposData(values,setValues,appraisalSalesApproachId)

        fetchComposData(values, setValues);
      } else {
        // Add API
        const modifiedPayload = {
          ...finalData,
          sales_approach: {
            ...finalData.sales_approach,
            comp_data: finalData.sales_approach.comp_data,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        navigate(`/evaluation/update-comps/${itemId}/${id}/sales/${salesId}`);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };
  const [hasProcessedComps, setHasProcessedComps] = useState(false);
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

  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    try {
      const combined_comp_data = updatedComps.map(
        (item: any, index: number) => {
          const comps_adjustments =
            item.expenses?.map((exp: any) => ({
              adj_key: exp.adj_key
                ? exp.adj_key.trim().toLowerCase().replace(/\s+/g, '_')
                : '',
              adj_value: exp.adj_value,
            })) || [];

          const comps_qualitative_adjustments =
            item.quantitativeAdjustments?.map((qualExp: any) => ({
              adj_key: qualExp.adj_key
                ? qualExp.adj_key.replace(/\s+/g, '_')
                : '',
              adj_value: qualExp.adj_value,
            })) || [];

          const comp_id = item.comp_id || item.id;
          return {
            // ...(appraisalSalesApproachId ? { id: item.id } : {}),
            comp_id: comp_id,
            order: index + 1,
            overall_comparability: item.overall_comparability || 'similar',
            adjustment_note: item?.adjustment_note,
            total_adjustment: item?.total,
            adjusted_psf: item.adjusted_psf,
            weight: parseFloat(item.weight),
            blended_adjusted_psf: item.blended_adjusted_psf,
            averaged_adjusted_psf: item.averaged_adjusted_psf,
            comps_adjustments: comps_adjustments,
            comps_qualitative_adjustments: comps_qualitative_adjustments,
          };
        }
      );

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

      const updatedFinalResult = result * updatedTotalAveragedAdjustedPsf;
      const updatedTotalSalesUnitOfSquareftOrACre =
        updatedTotalAveragedAdjustedPsf * appraisalData.land_size;

      const salesApproachDataWithNewComps = {
        ...(appraisalSalesApproachId ? { id: appraisalSalesApproachId } : {}),
        evaluation_scenario_id: salesId ? parseFloat(salesId) : null,
        averaged_adjusted_psf:
          compsType === 'land_only'
            ? updatedTotalSalesUnitOfSquareftOrACre
            : comparisonBasis === 'Bed'
              ? totalSaleValue / appraisalData.building_size
              : comparisonBasis === 'Unit'
                ? totalSaleValueUnit / appraisalData.building_size
                : FinalResult / appraisalData.building_size,
        sales_approach_value:
          compsType === 'land_only'
            ? updatedTotalSalesUnitOfSquareftOrACre
            : comparisonBasis === 'Bed'
              ? totalSaleValue
              : comparisonBasis === 'Unit'
                ? totalSaleValueUnit
                : FinalResult,
        incremental_value:
          compsType === 'land_only'
            ? (updatedTotalSalesUnitOfSquareftOrACre *
                (updateEvalSaleWeightInParent !== undefined &&
                updateEvalSaleWeightInParent !== 0
                  ? updateEvalSaleWeightInParent
                  : evaluationWeight || 0)) /
              100
            : comparisonBasis === 'Bed'
              ? (totalSaleValue *
                  (updateEvalSaleWeightInParent !== undefined &&
                  updateEvalSaleWeightInParent !== 0
                    ? updateEvalSaleWeightInParent
                    : evaluationWeight || 0)) /
                100
              : comparisonBasis === 'Unit'
                ? (totalSaleValueUnit *
                    (updateEvalSaleWeightInParent !== undefined &&
                    updateEvalSaleWeightInParent !== 0
                      ? updateEvalSaleWeightInParent
                      : evaluationWeight || 0)) /
                  100
                : (FinalResult *
                    (updateEvalSaleWeightInParent !== undefined &&
                    updateEvalSaleWeightInParent !== 0
                      ? updateEvalSaleWeightInParent
                      : evaluationWeight || 0)) /
                  100,
        weight: parseFloat(updatedTotalWeightage.toString()),
        note: salesNote,
        subject_property_adj: subject_property_adjustments,
        subject_qualitative_adjustments: subject_qualitative_adjustments,
        sales_comparison_attributes: sales_comparison_attributes,
        sales_approach_indicated_val: updatedFinalResult,
        comp_data: combined_comp_data,
      };

      const finalDataWithNewComps = {
        evaluation_id: id ? parseFloat(id) : null,
        sales_approach: salesApproachDataWithNewComps,
        weighted_market_value: totalWeightedValue,
      };

      let response;
      if (appraisalSalesApproachId) {
        response = await mutations.mutateAsync(finalDataWithNewComps);
        fetchComposData(values, setValues);
      } else {
        const modifiedPayload = {
          ...finalDataWithNewComps,
          sales_approach: {
            ...finalDataWithNewComps.sales_approach,
            comp_data: finalDataWithNewComps.sales_approach.comp_data,
          },
        };
        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        // toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const passCompsDataToFilter = (comps: any) => {
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

  const handleDeleteComp = async () => {
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
        toast.success(response.data.message);

        fetchComposData(values, setValues);
      } else {
        // Add API
        const modifiedPayload = {
          ...finalData,
          sales_approach: {
            ...finalData.sales_approach,
            comp_data: finalData.sales_approach.comp_data,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
        refetch();
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const passCompsDataToFilter1 = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = 100 / totalComps.length;
      let count = 0;

      // Custom sorting logic
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

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });

    // setIsOpen(false);
  };

  const newfinalresult =
    compsType === 'land_only'
      ? totalSalesUnitOfSquareftOrACre
      : comparisonBasis === 'Unit'
        ? totalSaleValueUnit
        : comparisonBasis === 'Bed'
          ? totalSaleValue
          : FinalResult;

  const averageadjustedBedSf = totalSaleValue / appraisalData.building_size;
  const averageadjustedUnitSf =
    totalSaleValueUnit / appraisalData.building_size;
  let valueToStore: any = '';

  if (comparisonBasis === 'Bed') {
    valueToStore = totalSaleValue;
  } else if (comparisonBasis === 'Unit') {
    valueToStore = totalSaleValueUnit;
  } else if (compsType === 'land_only') {
    valueToStore = totalSalesUnitOfSquareftOrACre;
  } else {
    valueToStore = FinalResult;
  }
  localStorage.setItem('salesValuePerUnit', totalaveragedadjustedpsf);
  localStorage.setItem('salesValuePerUnitForWeightage', valueToStore);

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
      ...landTypeOptions,
    ];
    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, return the value as is without capitalizing
    return value;
  };
  const getLabelFromValue1 = (value: any) => {
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
      ...landTypeOptions,
    ];
    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, return the value as is without capitalizing
    return capitalizeWords(value);
  };

  const formattedDropdownOptions = qualitativeApproachItems.map((option) => ({
    value: option.code,
    label: option.name,
  }));

  const formattedQualitativeDropdownOptions = quanitativeApproaachItems.map(
    (option) => ({
      value: option.code,
      label: option.name,
    })
  );

  // format number only for formatting

  const [loading, setLoading] = useState(true);
  // loader
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

  const handleNote = () => {
    setEditorValue(salesNote); // Load the saved value
    setNoteModalOpen(true);
  };

  const handleSave = () => {
    // handleSaveAdjustmentNote();
    setSalesNote(editorValue); // Save the current text
    setNoteModalOpen(false); // Close modal
  };

  const passcomparabilityData = (event: any) => {
    setOverallComparabilityData(event);
  };
  const handleNextClick = () => {
    handleSubmit();
  };

  const handleBackClick = () => {
    if (hasSaleType && filtereSalesdData.length > 1) {
      const leaseIndex = filtereSalesdData.findIndex(
        (element) => element.id == salesId
      );

      if (leaseIndex > 0) {
        const leaseIdRedirectIndex = filtereSalesdData[leaseIndex - 1].id;
        navigate(
          `/evaluation/sales-comps-map?id=${id}&salesId=${leaseIdRedirectIndex}`
        );
        return;
      }
    }
    if (hasmultiFamilyType) {
      navigate(
        `/evaluation/multi-family-comps-map?id=${id}&evaluationId=${filteredMultiFamilyldData?.[filteredMultiFamilyldData.length - 1]?.id}`
      );
      return;
    }
    if (hasRentRollType) {
      navigate(
        `/evaluation/rent-roll?id=${id}&evaluationId=${filtereRentRolldData?.[filtereRentRolldData.length - 1]?.id}`
      );
      return;
    }
    if (hasCapType) {
      navigate(
        `/evaluation/cap-comps-map?id=${id}&capId=${filteredCapData?.[filteredCapData.length - 1]?.id}`
      );
      return;
    }

    if (hasIncomeType) {
      navigate(
        `/evaluation/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - 1]?.id}`
      );
      return;
    }

    navigate(`/evaluation-area-info?id=${id}`);
  };

  return (
    <EvaluationMenuOptions
      finalResults={newfinalresult}
      totalaveragedadjustedpsfSales={newcostIndicatedPsf}
      onNextClick={handleNextClick}
      onBackClick={handleBackClick}
      onUpdateEvalSaleWeightChange={(value: any) => {
        setUpdateEvalSaleWeightInParent(value);
      }}
      onTotalWeightedChange={(value: any) => {
        setTotalWeightedValue(value);
      }}
    >
      {' '}
      {openComps && (
        <EvaluationUploadSalesCompsModal
          open={openComps}
          onClose={() => setCompsOpen(false)}
          setCompsModalOpen={setCompsModalOpen}
          setCompsData={setCompsData}
          compsLength={compsLength}
          compsData={compsData ?? []} // Avoid passing null where an array is needed
        />
      )}
      {compsModalOpen && (
        <EvaluationAiSalesCompsData
          passCompsData={passCompsDataToFilter1}
          open={compsModalOpen}
          onClose={() => setCompsModalOpen(false)} // Close CompsForm on click
          handleClose={() => setCompsModalOpen(false)} // ✅ Add missing prop
          compsData={compsData}
          compsLength={compsLength}
        />
      )}
      <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
        <Typography
          variant="h1"
          component="h2"
          className="text-xl font-bold uppercase"
        >
          Sales Comparison Approach{' '}
          <span>{salesApproachName ? `(${salesApproachName})` : ''}</span>
        </Typography>

        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">
            Value of the property based on applicable sales comps
          </span>
        </div>
      </div>
      {/* <div className="overflow-auto h-[calc(100vh-280px)]"> */}
      <div className="flex flex-wrap items-start space-x-2 mb-20 xl:px-[44px] px-[15px]">
        <div className="flex flex-col w-[15.5%]">
          <h3 className="px-4 py-5 text-base capitalize invisible font-semibold text-ellipsis overflow-hidden h-16">
            Subject Property
          </h3>
          <div className="lg:p-4 p-2 !pt-0 bg-white flex-1">
            <div className="max-w-full h-[160px]">
              <div className="w-full h-[160px] bg-white-200"></div>
            </div>
            <div className="p-2">
              <p className="text-sm font-bold invisible flex h-[20px]">
                Sales Price
              </p>
              <h2 className="text-gray-500  text-xs font-bold mt-0 min-h-[40px] mt-2 overflow-hidden whitespace-nowrap text-ellipsis">
                Location
              </h2>
              <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                Date Sold
              </p>
              {localStorage.getItem('activeType') === 'building_with_land' && (
                <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                  Property Type
                </p>
              )}
              {localStorage.getItem('activeType') === 'land_only' && (
                <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                  Land Type
                </p>
              )}
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

            <div className="border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5] py-1">
              <FieldArray
                name="operatingExpenses"
                render={() => (
                  <>
                    {values.operatingExpenses &&
                    values.operatingExpenses.length > 0 ? (
                      values.operatingExpenses.map((zone: any, i: number) => (
                        <div
                          className="flex items-center quantitate-items justify-between gap-1 h-[20px] "
                          key={i}
                        >
                          <Grid
                            item
                            className="dropdown min-w-[calc(100%-36px)] manageDropdownField w-full"
                          >
                            {zone.adj_key === '' ||
                            adjFactores.some(
                              (expense: any) => expense.adj_key === zone.adj_key
                            ) ? (
                              <SelectTextField
                                name={`operatingExpenses.${i}.adj_key`}
                                value={zone.adj_key}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input = e.target.value;
                                  setValues((old: any) => {
                                    const matchingOption =
                                      old.operatingAllExpensesInitial.find(
                                        (option: any) =>
                                          option.adj_key === input
                                      );
                                    const operatingExpenses =
                                      old.operatingExpenses.map(
                                        (expense: any, index: number) =>
                                          index === i
                                            ? {
                                                ...expense,
                                                adj_key: input,
                                                adj_value: matchingOption
                                                  ? matchingOption.adj_value
                                                  : input,
                                                isTypeMyOwnSelected:
                                                  input === 'type_my_own',
                                              }
                                            : expense
                                      );

                                    const compsWithNewAdj = old.tableData.map(
                                      (comp: any) => ({
                                        ...comp,
                                        expenses: comp.expenses.map(
                                          (exp: any, expIndex: number) =>
                                            expIndex === i
                                              ? { ...exp, adj_key: input }
                                              : exp
                                        ),
                                      })
                                    );

                                    return {
                                      ...old,
                                      operatingExpenses,
                                      tableData: compsWithNewAdj,
                                    };
                                  });
                                }}
                                options={formattedDropdownOptions}
                              />
                            ) : (
                              <StyledField
                                type="text"
                                name={`operatingExpenses.${i}.adj_key`}
                                value={
                                  zone.adj_value === 'type_my_own'
                                    ? ''
                                    : zone.adj_value
                                }
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input = e.target.value;
                                  setValues((old: any) => {
                                    const operatingExpenses =
                                      old.operatingExpenses.map(
                                        (expense: any, index: number) =>
                                          index === i
                                            ? {
                                                ...expense,
                                                adj_key: input,
                                                adj_value: input,
                                              }
                                            : expense
                                      );

                                    const compsWithNewAdj = old.tableData.map(
                                      (comp: any) => ({
                                        ...comp,
                                        expenses: comp.expenses.map(
                                          (exp: any, expIndex: number) =>
                                            expIndex === i
                                              ? { ...exp, adj_key: input }
                                              : exp
                                        ),
                                      })
                                    );

                                    return {
                                      ...old,
                                      operatingExpenses,
                                      tableData: compsWithNewAdj,
                                    };
                                  });
                                }}
                                style={{
                                  fontSize: '12px',
                                  borderBottomWidth: '1px',
                                  color: 'black',
                                  width: '100%',
                                  // minHeight: '36px',
                                  padding: '0',
                                  fontWeight: 400,
                                }}
                              />
                            )}
                          </Grid>
                          <Grid item className="min-w-[36px]">
                            <div className="flex flex-row items-center ">
                              {zone.adj_key === '' ||
                              adjFactores.some(
                                (expense: any) =>
                                  expense.adj_key === zone.adj_key
                              ) ? null : (
                                <Icons.SwitchIcon
                                  style={{ width: '14px' }}
                                  className="text-blue-500 cursor-pointer"
                                  onClick={() => {
                                    setValues((old: any) => {
                                      const updatedOperatingExpenses =
                                        old.operatingExpenses.map(
                                          (expense: any, index: number) => {
                                            if (index === i) {
                                              const isTypeMyOwn =
                                                expense.adj_key ===
                                                  'type_my_own' ||
                                                !adjFactores.some(
                                                  (option: any) =>
                                                    option.value ===
                                                    expense.adj_key
                                                );

                                              const newAdjKey = isTypeMyOwn
                                                ? ''
                                                : 'type_my_own';
                                              const newAdjValue = isTypeMyOwn
                                                ? ''
                                                : expense.adj_value;

                                              return {
                                                ...expense,
                                                adj_key: newAdjKey,
                                                adj_value: newAdjValue, // Set to empty when toggling
                                              };
                                            }
                                            return expense;
                                          }
                                        );

                                      return {
                                        ...old,
                                        operatingExpenses:
                                          updatedOperatingExpenses,
                                      };
                                    });
                                  }}
                                />
                              )}
                              {values.operatingExpenses.length > 1 && (
                                <Icons.RemoveCircleOutlineIcon
                                  className="text-red-500 cursor-pointer"
                                  style={{
                                    width: '14px',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => {
                                    setValues((old: any) => {
                                      const operatingExpenses =
                                        old.operatingExpenses.filter(
                                          (_: any, index: number) => index !== i
                                        );

                                      const updatedTableData =
                                        old.tableData.map((comp: any) => {
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
                                            expenses: updatedExpenses,
                                            total: newTotal,
                                          };

                                          return updatedCompData;
                                        });

                                      const totalAverageAdjustedPsf =
                                        updatedTableData.reduce(
                                          (acc: any, item: any) =>
                                            acc + item.averaged_adjusted_psf,
                                          0
                                        );

                                      return {
                                        ...old,
                                        operatingExpenses,
                                        tableData: updatedTableData,
                                        averaged_adjusted_psf:
                                          totalAverageAdjustedPsf,
                                      };
                                    });
                                  }}
                                />
                              )}

                              {i === values.operatingExpenses.length - 1 && (
                                <Icons.AddCircleOutlineIcon
                                  style={{ width: '14px' }}
                                  className="ml-1 text-[#0da1c7] cursor-pointer"
                                  onClick={() => {
                                    setValues((old: any) => ({
                                      ...old,
                                      operatingExpenses: [
                                        ...old.operatingExpenses,
                                        {
                                          adj_key: '',
                                          adj_value: '',
                                        },
                                      ],
                                      tableData: old.tableData.map(
                                        (comp: any) => ({
                                          ...comp,
                                          expenses: [
                                            ...comp.expenses,
                                            {
                                              adj_key: '',
                                              adj_value: 0,
                                              comparison_basis: 0,
                                            },
                                          ],
                                        })
                                      ),
                                    }));
                                  }}
                                />
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

            <FieldArray
              name="salesCompQualitativeAdjustment"
              render={() => (
                <>
                  {values.salesCompQualitativeAdjustment &&
                  values.salesCompQualitativeAdjustment.length > 0 ? (
                    values.salesCompQualitativeAdjustment.map(
                      (zone: any, i: number) => {
                        return (
                          <div
                            className="flex items-center quantitate-items justify-between gap-1 h-[20px]"
                            key={i}
                          >
                            <Grid
                              item
                              className="dropdown min-w-[calc(100%-36px)] manageDropdownField w-full"
                            >
                              {zone.adj_key === '' ||
                              QualitativeadjFactores.some(
                                (expense: any) =>
                                  expense.adj_key === zone.adj_key
                              ) ? (
                                <SelectTextField
                                  style={{
                                    fontSize: '12px',
                                    borderBottomWidth: '1px',
                                    color: 'black',
                                    fontWeight: 400,
                                  }}
                                  name={`salesCompQualitativeAdjustment.${i}.adj_key`}
                                  value={zone.adj_key || ''}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input = e.target.value;

                                    setValues((old: any) => {
                                      const salesCompQualitativeAdjustment =
                                        old.salesCompQualitativeAdjustment.map(
                                          (expense: any, index: number) =>
                                            index === i
                                              ? {
                                                  ...expense,
                                                  adj_key: input,
                                                  adj_value: input,
                                                  subject_property_value: '', // Reset the styled field value
                                                }
                                              : expense
                                        );

                                      const compsWithNewAdj = old.tableData.map(
                                        (comp: any) => ({
                                          ...comp,
                                          quantitativeAdjustments:
                                            comp.quantitativeAdjustments.map(
                                              (exp: any, expIndex: number) =>
                                                expIndex === i
                                                  ? {
                                                      ...exp,
                                                      adj_key: input,
                                                    }
                                                  : exp
                                            ),
                                        })
                                      );

                                      return {
                                        ...old,
                                        salesCompQualitativeAdjustment,
                                        tableData: compsWithNewAdj,
                                      };
                                    });
                                  }}
                                  options={formattedQualitativeDropdownOptions}
                                />
                              ) : (
                                <StyledField
                                  type="text"
                                  name={`salesCompQualitativeAdjustment.${i}.adj_value`}
                                  value={
                                    zone.adj_value === 'type_my_own'
                                      ? ''
                                      : zone.adj_value
                                  }
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input = e.target.value;
                                    setValues((old: any) => {
                                      const salesCompQualitativeAdjustment =
                                        old.salesCompQualitativeAdjustment.map(
                                          (expense: any, index: number) =>
                                            index === i
                                              ? {
                                                  ...expense,
                                                  adj_key: input,
                                                  adj_value: input,
                                                }
                                              : expense
                                        );

                                      const compsWithNewAdj = old.tableData.map(
                                        (comp: any) => ({
                                          ...comp,
                                          quantitativeAdjustments:
                                            comp.quantitativeAdjustments.map(
                                              (exp: any, expIndex: number) =>
                                                expIndex === i
                                                  ? {
                                                      ...exp,
                                                      adj_key: input,
                                                    }
                                                  : exp
                                            ),
                                        })
                                      );

                                      return {
                                        ...old,
                                        salesCompQualitativeAdjustment,
                                        tableData: compsWithNewAdj,
                                      };
                                    });
                                  }}
                                  style={{
                                    fontSize: '12px',
                                    borderBottomWidth: '1px',
                                    color: 'black',
                                    width: '100%',
                                    // minHeight: '36px',
                                    fontWeight: 400,
                                  }}
                                />
                              )}
                            </Grid>
                            <Grid item className="min-w-[36px]">
                              <div className="flex flex-row items-center ">
                                {zone.adj_key === '' ||
                                QualitativeadjFactores.some(
                                  (expense: any) =>
                                    expense.adj_key === zone.adj_key
                                ) ? null : (
                                  <Icons.SwitchIcon
                                    style={{ width: '14px' }}
                                    className="text-blue-500 cursor-pointer"
                                    onClick={() => {
                                      setValues((old: any) => {
                                        const updatedSalesCompQualitativeAdjustment =
                                          old.salesCompQualitativeAdjustment.map(
                                            (expense: any, index: number) => {
                                              if (index === i) {
                                                const isTypeMyOwn =
                                                  expense.adj_key ===
                                                    'type_my_own' ||
                                                  !QualitativeadjFactores.some(
                                                    (option: any) =>
                                                      option.value ===
                                                      expense.adj_key
                                                  );

                                                const newAdjKey = isTypeMyOwn
                                                  ? ''
                                                  : 'type_my_own';

                                                return {
                                                  ...expense,
                                                  adj_key: newAdjKey,
                                                  adj_value: '', // Always reset adj_value to empty when toggling
                                                };
                                              }
                                              return expense;
                                            }
                                          );

                                        return {
                                          ...old,
                                          salesCompQualitativeAdjustment:
                                            updatedSalesCompQualitativeAdjustment,
                                        };
                                      });
                                    }}
                                  />
                                )}

                                {/* Condition to hide Remove icon if only one item is left */}
                                {values.salesCompQualitativeAdjustment.length >
                                  1 && (
                                  <Icons.RemoveCircleOutlineIcon
                                    className="text-red-500 cursor-pointer"
                                    style={{
                                      width: '14px',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                      setValues((old: any) => {
                                        const salesCompQualitativeAdjustment =
                                          old.salesCompQualitativeAdjustment.filter(
                                            (_: any, index: number) =>
                                              index !== i
                                          );
                                        const updatedTableData =
                                          old.tableData.map((comp: any) => ({
                                            ...comp,
                                            quantitativeAdjustments:
                                              comp.quantitativeAdjustments.filter(
                                                (_: any, expIndex: number) =>
                                                  expIndex !== i
                                              ),
                                          }));

                                        return {
                                          ...old,
                                          salesCompQualitativeAdjustment,
                                          tableData: updatedTableData,
                                        };
                                      });
                                    }}
                                  />
                                )}
                                {i ===
                                  values.salesCompQualitativeAdjustment.length -
                                    1 && (
                                  <Icons.AddCircleOutlineIcon
                                    style={{ width: '14px' }}
                                    className="ml-1 text-[#0da1c7] cursor-pointer"
                                    onClick={() => {
                                      setValues((old: any) => ({
                                        ...old,
                                        salesCompQualitativeAdjustment: [
                                          ...old.salesCompQualitativeAdjustment,
                                          { adj_key: '', adj_value: '' },
                                        ],
                                        tableData: old.tableData.map(
                                          (comp: any) => ({
                                            ...comp,
                                            quantitativeAdjustments: [
                                              ...comp.quantitativeAdjustments,
                                              {
                                                adj_key: '',
                                                adj_value: 'similar',
                                                comparison_basis: 0,
                                              },
                                            ],
                                          })
                                        ),
                                      }));
                                    }}
                                  />
                                )}
                              </div>
                            </Grid>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <p className="text-sm font-bold text-gray-500">
                      No sales comp qualitative adjustment data
                    </p>
                  )}
                </>
              )}
            />

            {/* //-----------------------------------------------------------------------------------? */}
            <div className="border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] px-1 flex items-center  h-10 mt-[3px]">
              <p className="text-xs font-bold border-below">Notes</p>
            </div>
            <div className="space-y-2 flex flex-col gap-[2px]">
              <p className="text-xs font-semibold mb-1 italic h-[37px] flex items-end text-ellipsis overflow-hidden whitespace-nowrap">
                Overall Comparability
              </p>
              <p className="text-xs h-[18px] !m-0 font-semibold italic text-ellipsis overflow-hidden whitespace-nowrap">
                Overall Adjustment
              </p>

              {comparisonBasis === 'Bed' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  adjusted Price Per Bed
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted Price Per Unit
                </p>
              ) : analysisType === '$/Acre' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted Price Per Acre
                </p>
              ) : (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted Price Per SF
                </p>
              )}
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Weighting
              </p>

              {comparisonBasis === 'Bed' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Sales Value $/Bed
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Sales Value $/Unit
                </p>
              ) : analysisType === '$/Acre' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Sales Value Per Acre
                </p>
              ) : (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Sales Value $/SF
                </p>
              )}

              {comparisonBasis === 'Bed' || comparisonBasis === 'Unit' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Average Adjusted $/SF
                </p>
              ) : null}
              <p className="text-base h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap uppercase">
                Total Sales Value
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[15.5%]">
          <h3 className="py-5 text-base capitalize font-semibold text-ellipsis overflow-hidden ">
            Subject Property
          </h3>
          <div className="bg-slate-100 flex-1">
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
              <p className="text-sm font-bold invisible flex h-[20px]">
                Sales Price
              </p>
              <div className="min-h-[40px] mt-2">
                {/* Street address on one line */}
                <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  {appraisalData.street_address || 'No address available'}
                </h2>

                {/* City, state (uppercase), and zipcode on the next line */}
                <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  {appraisalData.city ? appraisalData.city + ', ' : ''}
                  {appraisalData.state
                    ? appraisalData.state.toUpperCase() + ', '
                    : ''}
                  {appraisalData.zipcode || ''}
                </h2>
              </div>
              <p className="text-gray-500 text-xs font-medium pb-1 overflow-hidden whitespace-nowrap text-ellipsis">
                {APPROACHESENUMS.SPACE}
              </p>
              <div>
                {localStorage.getItem('activeType') ===
                  'building_with_land' && (
                  // <p className="text-xs font-bold  flex h-[20px] text-gray-500">
                  <p className="text-gray-500 text-xs font-bold pb-1 overflow-hidden whitespace-nowrap text-ellipsis">
                    {getLabelFromValue1(appraisalData?.zonings[0]?.zone)} /{' '}
                    {getLabelFromValue1(appraisalData?.zonings[0]?.sub_zone)}
                  </p>
                )}
                {localStorage.getItem('activeType') === 'land_only' && (
                  <p className="text-xs font-bold  flex h-[20px] text-gray-500">
                    {getLabelFromValue1(appraisalData?.land_type)}
                  </p>
                )}
              </div>
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

            <div className="p-1 mt-1 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
              {values.operatingExpenses?.length > 0
                ? values.operatingExpenses.map((index: number) => (
                    <p
                      key={index}
                      className={`text-xs font-bold h-[20px] ${!appraisalData.operatingExpenses?.[index]?.names ? 'text-transparent' : ''}`}
                      // style={{ lineHeight: '4em' }}
                    >
                      {appraisalData.operatingExpenses?.[index]?.names || null}
                    </p>
                  ))
                : Array.from(
                    { length: values.operatingExpenses?.length },
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
            {values.salesCompQualitativeAdjustment.map(
              (field: any, idx: number) => {
                const isBuildingSize = field.adj_key === 'building_size';
                const isSidewallHeight = field.adj_key === 'sidewall_height';
                const isOfficeArea = field.adj_key === 'office_area';

                return (
                  <div
                    key={field.id}
                    className="px-2 subject-property-input min-h-[19.5px]"
                  >
                    <StyledField
                      name={`subjectProperty.${idx}`}
                      style={{
                        borderBottomWidth: '1px',
                        color: 'black',
                        padding: '0',
                        paddingRight: isSidewallHeight ? '24px' : undefined,
                        boxSizing: 'border-box',
                      }}
                      value={
                        isBuildingSize
                          ? appraisalData?.building_size
                            ? `${appraisalData.building_size.toLocaleString()} SF`
                            : 'N/A'
                          : field?.subject_property_value || ''
                      }
                      disabled={isBuildingSize}
                      onKeyDown={(e: any) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                          return; // Let the browser handle select all
                        }
                        if (isOfficeArea) {
                          let nStr = e.target.value.replace('%', '');
                          const { selectionStart, selectionEnd }: any =
                            e.target;

                          if (e.keyCode === 8) {
                            if (
                              selectionStart === 0 &&
                              selectionEnd >= nStr.length
                            ) {
                              nStr = '';
                            } else {
                              nStr = nStr.slice(0, -1);
                            }
                          } else if (
                            e.key === 'ArrowLeft' ||
                            e.key === 'ArrowRight' ||
                            e.key === 'Backspace'
                          ) {
                            return;
                          } else if (/\d/.test(e.key)) {
                            nStr += e.key;
                          } else if (e.key === '.' && !nStr.includes('.')) {
                            nStr += '.';
                          } else if (e.key === '-' && nStr.length === 0) {
                            nStr = '-';
                            return;
                          } else {
                            e.preventDefault();
                            return;
                          }

                          if (parseFloat(nStr) < -100) {
                            nStr = '-100';
                          } else if (parseFloat(nStr) > 100) {
                            nStr = '100';
                          }

                          const parts = nStr.split('.');
                          if (
                            parts.length > 2 ||
                            (parts.length === 2 && parts[1].length > 2)
                          ) {
                            e.preventDefault();
                            return;
                          }

                          if (parts[0].length > 3 && !nStr.includes('.')) {
                            e.preventDefault();
                            return;
                          }

                          const updatedValue = nStr !== '' ? nStr + '%' : nStr;

                          setValues((old: any) => {
                            const salesCompQualitativeAdjustment =
                              old.salesCompQualitativeAdjustment.map(
                                (expense: any, expenseIndex: number) => ({
                                  ...expense,
                                  subject_property_value:
                                    expenseIndex === idx
                                      ? updatedValue
                                      : expense.adj_key === 'building_size'
                                        ? appraisalData?.building_size
                                          ? appraisalData.building_size.toString()
                                          : ''
                                        : expense.subject_property_value,
                                })
                              );

                            const compsWithNewAdj = old.tableData.map(
                              (comp: any) => ({
                                ...comp,
                                expenses: comp.expenses.map(
                                  (exp: any, expIndex: number) => ({
                                    ...exp,
                                    subject_property_value:
                                      expIndex === idx
                                        ? updatedValue
                                        : exp.adj_key === 'building_size'
                                          ? appraisalData?.building_size
                                            ? appraisalData.building_size.toString()
                                            : ''
                                          : exp.subject_property_value,
                                  })
                                ),
                              })
                            );

                            return {
                              ...old,
                              salesCompQualitativeAdjustment,
                              tableData: compsWithNewAdj,
                            };
                          });
                        } else if (isSidewallHeight) {
                          // Restrict input to integers only for sidewall_height
                          if (!/^\d*$/.test(e.key) && e.key !== 'Backspace') {
                            e.preventDefault();
                          }
                        }
                      }}
                      onChange={(e: any) => {
                        if (isSidewallHeight) {
                          const onlyDigits = e.target.value.replace(/\D/g, '');
                          const formattedValue =
                            onlyDigits === ''
                              ? ''
                              : Number(onlyDigits).toLocaleString();

                          setValues((old: any) => {
                            const salesCompQualitativeAdjustment =
                              old.salesCompQualitativeAdjustment.map(
                                (expense: any, expenseIndex: number) => ({
                                  ...expense,
                                  subject_property_value:
                                    expenseIndex === idx
                                      ? formattedValue
                                      : expense.subject_property_value,
                                })
                              );

                            return {
                              ...old,
                              salesCompQualitativeAdjustment,
                            };
                          });
                        } else if (!isOfficeArea) {
                          const newValue = e.target.value;

                          setValues((old: any) => {
                            const salesCompQualitativeAdjustment =
                              old.salesCompQualitativeAdjustment.map(
                                (expense: any, expenseIndex: number) => ({
                                  ...expense,
                                  subject_property_value:
                                    expenseIndex === idx
                                      ? newValue
                                      : expense.subject_property_value,
                                })
                              );

                            return {
                              ...old,
                              salesCompQualitativeAdjustment,
                            };
                          });
                        }
                      }}
                    />

                    {isSidewallHeight && (
                      <span
                        style={{
                          position: 'absolute',
                          // right: '8px',
                          // top: '50%',
                          transform: 'translateY(-87%)',
                          color: 'gray',
                          pointerEvents: 'none',
                          left: '471px',
                        }}
                      >
                        {/* ft. */}
                      </span>
                    )}
                  </div>
                );
              }
            )}
            <p
              className="text-xs mt-[3px] h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below text-[#0DA1C7] p-1 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer"
              // onClick={() => handleOpen(item, index)}
              onClick={handleNote}
            >
              Click to Enter Property Notes
            </p>

            <div className="px-1 space-y-2 flex flex-col gap-[2px] pb-2 ">
              <p
                className="text-xs text-gray-500 font-medium border-below h-[28px] mt-3.5 flex items-end text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                Overall Adjustment
              </p>
              <p
                className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                Overall Adjustment
              </p>

              <p
                className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                Overall Adjustment
              </p>

              <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {totalWeightage.toFixed(2) + '%'}
              </p>

              <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {totalaveragedadjustedpsf?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {comparisonBasis === 'Bed'
                  ? ' / Bed'
                  : comparisonBasis === 'Unit'
                    ? ' / Unit'
                    : analysisType === '$/Acre'
                      ? ' / AC'
                      : ' / SF'}
              </p>

              {comparisonBasis === 'Bed' ? (
                <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                  {averageadjustedBedSf?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  / SF
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                  {averageadjustedUnitSf?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  / SF
                </p>
              ) : null}
              <p className="text-base text-green-600 h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap uppercase">
                {comparisonBasis === 'Bed'
                  ? totalSaleValue
                    ? formatPrice(totalSaleValue || 0)
                    : APPROACHESENUMS.NA
                  : comparisonBasis === 'Unit'
                    ? totalSaleValueUnit
                      ? formatPrice(totalSaleValueUnit || 0)
                      : APPROACHESENUMS.NA
                    : compsType === 'land_only'
                      ? totalSalesUnitOfSquareftOrACre
                        ? formatPrice(totalSalesUnitOfSquareftOrACre || 0)
                        : APPROACHESENUMS.NA
                      : FinalResult
                        ? formatPrice(FinalResult || 0)
                        : APPROACHESENUMS.NA}
              </p>
            </div>
          </div>
        </div>
        {!className || !open
          ? values.tableData?.map((item: any, index: any) => (
              <EvaluationSalesCompCard
                key={item.id}
                index={index}
                handleChange={handleChange}
                item={item}
                appraisalData={appraisalData}
                values={values}
                totalCards={values.tableData?.length}
                handleDelete={handleDeleteCard}
                subjectcompType={compType}
                dimension={landDimensions}
                handleNavigateToComp={handleNavigateToComp}
                handleDeleteComp={handleDeleteComp}
                handleSaveAdjustmentNote={handleSaveAdjustmentNote}
                dropdownField={dropdownFields}
                setDropdownField={setDropdownFields}
                setSubOption={setQuanitativeApproaachItems}
                subOption={quanitativeApproaachItems}
                indexType={indexType}
                setIndexType={setIndexType}
                setClassName={setClassName}
                handleSubmit={handleSubmit}
                landDimensions={landDimensions}
                passcomparabilityData={passcomparabilityData}
              />
            ))
          : values?.tableData?.map((item: any, index: any) =>
              index === indexType ? (
                <div key={item.id}>
                  <EvaluationSalesCompCard
                    index={index}
                    handleChange={handleChange}
                    item={item}
                    appraisalData={appraisalData}
                    values={values}
                    totalCards={values.tableData?.length}
                    handleDelete={handleDeleteCard}
                    subjectcompType={compType}
                    dimension={landDimensions}
                    handleNavigateToComp={handleNavigateToComp}
                    handleDeleteComp={handleDeleteComp}
                    handleSaveAdjustmentNote={handleSaveAdjustmentNote}
                    dropdownField={dropdownFields}
                    setDropdownField={setDropdownFields}
                    setSubOption={setQuanitativeApproaachItems}
                    subOption={quanitativeApproaachItems}
                    indexType={indexType}
                    setIndexType={setIndexType}
                    setClassName={setClassName}
                    handleSubmit={handleSubmit}
                    landDimensions={landDimensions}
                    passcomparabilityData={passcomparabilityData}
                  />
                </div>
              ) : null
            )}

        {values.tableData.length == 4 ? null : (
          <>
            <div className="flex flex-col items-center space-y-6 mt-16 flex-1 max-w-[220px]">
              {/* Add New Comp */}
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
                className="flex flex-col items-center justify-center w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer"
              >
                <Icons.AddCircleIcon
                  className="text-[#0DA1C7]"
                  style={{ fontSize: '40px' }}
                />
                <Typography
                  variant="h6"
                  className="text-gray-600 text-sm font-semibold mt-2"
                >
                  Add New Comp
                </Typography>
              </div>

              {/* Upload Comp */}
              <div
                onClick={uploadComps}
                className="flex flex-col items-center justify-center max-w-[220px] w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer"
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
          </>
        )}
      </div>
      <EvaluationSubjectPropertyAdjustmentNoteModal
        open={noteModalOpen}
        setNoteModalOpen={setNoteModalOpen}
        editorText={setEditorValue}
        handleSave={handleSave}
        salesNote={editorValue}
      />
    </EvaluationMenuOptions>
  );
};

export default EvaluationSalesApproach;

import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
import SelectTextField from '@/components/styles/select-input';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import CloseIcon from '@mui/icons-material/Close';
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
} from '@/pages/comps/create-comp/SelectOption';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Grid, Typography } from '@mui/material';
import axios from 'axios';
import { FieldArray, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import defaultPropertImage from '../../../../images/default-placeholder.png';
import loadingImage from '../../../../images/loading.png';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import ResidentialSubjectPropertyAdjustmentNoteModal from './residential-sales-approach-adjustment-note-modal';
import ResidentialSalesCompCard from './residential-sales-comps-card';
import ResidentialSalesCompsData from './residential-sales-comps-table';
import ResidentialUploadSalesCompsModal from './residential-upload-comps-from-sales-approach';
import {
  capitalizeWords,
  formatNumberAcre,
  formatPrice,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
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

  expenses?.forEach((exp: { adj_value: any }) => {
    if (exp.adj_value) {
      const valueStr = String(exp.adj_value);
      // Preserve negative sign by checking if the original value was negative
      const isNegative = valueStr.includes('-');
      const cleanedValue = valueStr.replace(/[$,%]/g, '');
      const numValue = parseFloat(cleanedValue || '0');
      if (!isNaN(numValue)) {
        total += isNegative ? -numValue : numValue;
      }
    }
  });

  return { total, expenses };
};

// Function to format the values
let adjFactores: any;
let QualitativeadjFactores: any;
// let comparativeFActors: any;

const ResidentialSalesApproach: React.FC = () => {
  type DropdownField = {
    id: number;
    value: string;
    isTextField: boolean;
    customValue: any;
    input: any;
    placeholder: string;
  };
  const calculateCompData = ({ total, weight, comp }: any) => {
    const price_square_foot = comp.price_square_foot;
    const bedPerSqFit =
      comp.sale_price === 0 && comp.total_beds === 0
        ? 0
        : comp.total_beds === 0
          ? 0
          : comp.sale_price / comp.total_beds;

    const bedUnitPerSqFt =
      comp.total_units === 0 ? 0 : comp.sale_price / comp.total_units;
    const finalBed = (total / 100) * bedPerSqFit + bedPerSqFit;

    const finalUnits = (total / 100) * bedUnitPerSqFt + bedUnitPerSqFt;
    const finalAdjustePricePerAcre =
      (comp.sale_price / comp?.land_size) * 43560;
    const updatedAdjustedPsf = total + comp.sale_price;

    const updatedAverageAdjustedPsf = (updatedAdjustedPsf * weight) / 100;
    const bedAveragedAdjustedPsf = (finalBed * weight) / 100;
    const unitAveragedAdjustedPsf = (finalUnits * weight) / 100;

    const updatedBlendedPsf = (price_square_foot * weight) / 100;
    const bedUpdatedBlendedPsf = (bedPerSqFit * weight) / 100;
    const unitUpdatedBlendedPsf = (bedPerSqFit * weight) / 100;

    return {
      adjusted_psf:
        landDimensions === 'ACRE'
          ? finalAdjustePricePerAcre
          : comp?.comparison_basis === 'Bed'
            ? finalBed
            : comp?.comparison_basis === 'Unit'
              ? finalUnits
              : updatedAdjustedPsf,
      averaged_adjusted_psf:
        comp?.comparison_basis == 'Bed'
          ? bedAveragedAdjustedPsf
          : comp.comparison_basis === 'Unit'
            ? unitAveragedAdjustedPsf
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
  const [evaluationWeight, setEvaluationWeight] = useState<number | null>(null);

  const [comparisonBasis, setComparisonBasis] = useState<any>(null);
  const [compsType, setCompsType] = useState<any>(null);
  const [compType, setCompType] = useState<any>(null);
  const [landDimensions, setLandDimensions] = useState<any>(null);
  const [editorValue, setEditorValue] = useState(''); // current editor text
  const salesId = searchParams.get('salesId');
  const [, setAnalysisType] = useState<any>(null);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [, setAreaInfoData1] = useState<any>();
  const [salesApproachName, setSalesApproachName] = useState('');
  const [open] = useState(false);
  const [loader, setLoader] = useState(false);
  const [compsLength, setCompsLength] = useState('');
  const [totalWeightedValue, setTotalWeightedValue] = useState(0);

  const [hasIncomeType, setHasIncomeType] = useState(false);
  const [hasRentRollType, setHasRentRollType] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBasementIndex, setCurrentBasementIndex] = useState<
    number | null
  >(null);
  const [finishedValue, setFinishedValue] = useState('');
  const [recalcBasementVersion, setRecalcBasementVersion] = useState(0);

  const [unfinishedValue, setUnfinishedValue] = useState('');
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [salesNote, setSalesNote] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [className, setClassName] = useState(false);
  const [indexType, setIndexType] = useState<any>();
  const [, setAppraisalType] = useState<any>();
  const [maxUnitCount, setMaxUnitCount] = useState<number>(0);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [overallComparabilityData, setOverallComparabilityData] = useState('');
  const [buildingSize, setBuildingSize] = useState('');

  console.log(overallComparabilityData, 'valuesinapproacch');
  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereRentRolldData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [qualitativeApproachItems, setQualitativeApproaachItems] = useState<
    SubOption[]
  >([]);
  const [quanitativeApproaachItems, setQuanitativeApproaachItems] = useState<
    SubOption[]
  >([]);
  const [quantitativeAdjustmentItems, setQuantitativeAdjustmentItems] =
    useState<SubOption[]>([]);
  const uploadComps = () => {
    setCompsOpen(true);
  };
  const [comparativeFactors, setComparativeFactors] = useState<any[]>([]);
  const navigate = useNavigate();
  const handleCurrencyChange = (e: any) => {
    const input = e.target.value;
    const isNegative = input.includes('-');
    // Remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, '');

    // Convert to cents-based float (e.g., '1234' → 12.34)
    const number = parseFloat(digitsOnly || 0) / 100;

    // // Format to currency if valid
    // const formatted = digitsOnly
    //   ? `$${number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    //   : '';
    const formatted = formatPrice(isNegative ? '-' + number : '' + number);

    setFinishedValue(formatted);
  };
  const handleCurrencyChange1 = (e: any) => {
    const input = e.target.value;
    const isNegative = input.includes('-');
    // Remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, '');

    // Convert to cents-based float (e.g., '1234' → 12.34)
    const number = parseFloat(digitsOnly || 0) / 100;

    const formatted = formatPrice(isNegative ? '-' + number : '' + number);

    setUnfinishedValue(formatted);
  };

  // api for get/appraisals
  const {
    data: areaInfoData,
    refetch,
    isLoading,
  } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: {
      enabled: Boolean(salesId),
      refetchOnWindowFocus: false,
      onSuccess: (data: any) => {
        const comparisonBasis = data?.data?.data?.comparison_basis;
        const landDimension = data?.data?.data?.land_dimension;
        const compsType = data?.data?.data?.comp_type;
        const analysisType = data?.data?.data?.analysis_type;
        const mapData = data?.data?.data?.res_evaluation_scenarios;
        const subjectCompType = data?.data?.data?.comp_type;
        const appraisalType = data?.data?.data?.evaluation_type;
        const buildingSize = data?.data?.data?.building_size;
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

        if (data?.data?.data?.res_zonings) {
          const type_sqft = data?.data?.data?.res_zonings?.map((ele: any) => {
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
    if (data?.data?.data) {
      const initialQuantitativeOption = data.data.data.find(
        (item: any) => item.type === 'sales_res_comp_quantitative_adjustments'
      )?.options;

      // Set quantitative adjustment items based on fetched data
      setQuantitativeAdjustmentItems(initialQuantitativeOption || []);
    }
  }, [data]);

  //api for get recent-page url
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'res-evaluations/update-position',
    endPoint: `res-evaluations/update-position/${id}`,
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
  }, [values?.appraisalSpecificAdjustment, comparativeFactors]);

  // for sales-navigation
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

      const rentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'rent_roll'
      );
      setHasRentRollType(rentRollApproaches.length > 0);
      setFilteredRentRollData(rentRollApproaches);

      const incomeApproaches = updateData.filter(
        (item: { has_income_approach: any }) => item.has_income_approach === 1
      );
      setHasIncomeType(incomeApproaches.length > 0);
      setFilteredData(incomeApproaches);
    }
  }, [areaInfoData?.data?.data?.res_evaluation_scenarios]);

  const appraisalData = areaInfoData?.data.data || {};
  const formatConditionOption = (value: any) => {
    const option = value
      ? conditionOptions.find((option: any) => option.value === value)
      : '';
    if (option) {
      return option.label;
    }
  };
  const AdditionalAmenities = appraisalData?.res_evaluation_amenities
    ?.map((ele: any) => ele.additional_amenities)
    .join(' ,');
  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[appraisalData.state];
  const zonningsData = areaInfoData?.data?.data?.res_zonings || [];

  const appraisalApproach =
    areaInfoData?.data?.data?.res_evaluation_scenarios?.find((approach: any) =>
      salesId ? approach.id == parseFloat(salesId) : false
    );

  const appraisalSalesApproachId =
    appraisalApproach?.res_evaluation_sales_approach?.id || null;
  useEffect(() => {}, [evaluationWeight]);
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `res-evaluations/get-sales-approach?evaluationId=${id}&evaluationScenarioId=${salesId}`,
        {}
      );
      const salesData = response?.data?.data?.data?.eval_weight;

      const evalWeight: any = salesData * 100;
      setEvaluationWeight(evalWeight); // Using the new state setter
      const compsArr = response?.data?.data?.data?.comp_data;
      setCompsLength(compsArr?.length);
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

      // Check if arrays exist and have data
      const hasSubjectPropertyAdj =
        response?.data?.data?.data.subject_property_adj &&
        response?.data?.data?.data.subject_property_adj.length > 0;

      const hasQualitativeAdjustments =
        response?.data?.data?.data.subject_qualitative_adjustments &&
        response?.data?.data?.data.subject_qualitative_adjustments.length > 0;

      const hasComparisonAttributes =
        response?.data?.data?.data.sales_comparison_attributes &&
        response?.data?.data?.data.sales_comparison_attributes.length > 0;

      let mergedOperatingExpenses = [];

      if (hasSubjectPropertyAdj) {
        // Directly use the subject_property_adj array from API response
        mergedOperatingExpenses =
          response?.data?.data?.data.subject_property_adj || [];
      } else {
        mergedOperatingExpenses = values.operatingExpenses || [];
      }
      console.log(
        'response?.data?.data?.data.subject_property_adj',
        response?.data?.data?.data.subject_property_adj
      );
      const formatAdjValue = (adj_key: string, value: any): string => {
        const numeric =
          typeof value === 'string'
            ? parseFloat(value.replace(/[$,%]/g, '')) || 0
            : parseFloat(value) || 0;

        if (['time', 'location', 'condition'].includes(adj_key)) {
          return `${numeric.toFixed(2)}%`;
        }

        if (
          [
            'gross_living_area_sf',
            'land_size',
            'year_built',
            'bedrooms',
            'bathrooms',
            'fireplace',
            'basement_finished',
            'basement_unfinished',
          ].includes(adj_key)
        ) {
          return `$${numeric.toFixed(2)}`;
        }

        return value || '';
      };

      const formattedOperatingExpenses = mergedOperatingExpenses;
      const formattedQualitativeExpenses = hasQualitativeAdjustments
        ? response?.data?.data?.data.subject_qualitative_adjustments.map(
            ({ adj_key, adj_value, ...restAdj }: any) => {
              const formattedValue = formatAdjValue(adj_key, adj_value);

              return {
                ...restAdj,
                comparison_basis: adj_value ? adj_value : 'Similar',
                adj_key,
                adj_value: formattedValue,
              };
            }
          )
        : values.salesCompQualitativeAdjustment;

      const formattedComparativeAdjustment = hasComparisonAttributes
        ? response?.data?.data?.data.sales_comparison_attributes.map(
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
        });

        // Ensure amenityOptions is defined in this scope
        const amenityOptions = [
          'Patio (Uncovered)',
          'Patio (Covered)',
          'Deck (Uncovered)',
          'Deck (Covered)',
          'Underground Sprinklers',
          'Shed',
          'Pool',
          'Hot Tub',
          'Outdoor Kitchen',
          'Landscaping',
        ];

        // Ensure subjectAmenities is defined in this scope
        const subjectAmenities =
          data?.data?.data?.res_evaluation_amenities || [];

        // Use the comp variable from the for loop for comp.res_comp_amenities
        const defaultAmenities = amenityOptions.map((option) => {
          const subjectHasAmenity = subjectAmenities.some((a: any) => {
            const normalizedOption = option.toLowerCase().replace(/\s+/g, '');
            const normalizedAmenity = a.additional_amenities
              .toLowerCase()
              .replace(/\s+/g, '');
            return normalizedOption === normalizedAmenity;
          });

          const compHasAmenity =
            c.comp_details?.res_comp_amenities?.some((a: any) => {
              const normalizedOption = option.toLowerCase().replace(/\s+/g, '');
              const normalizedAmenity = a.additional_amenities
                .toLowerCase()
                .replace(/\s+/g, '');
              return normalizedOption === normalizedAmenity;
            }) || false;

          return {
            another_amenity_name: option,
            another_amenity_value: 0.0,
            subject_property_check: subjectHasAmenity ? 1 : 0,
            comp_property_check: compHasAmenity ? 1 : 0,
            is_extra: 0,
          };
        });

        const formattedExpenses = formattedOperatingExpenses.map((oe: any) => {
          const newValue = c.comps_adjustments.find(
            (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
          );
          const rawVal = newValue?.adj_value;
          let numericValue = 0;

          if (rawVal !== undefined && !isNaN(rawVal)) {
            numericValue = parseFloat(rawVal);
          }

          return {
            ...oe,
            adj_key: newValue?.adj_key || oe.adj_key,
            adj_value: numericValue.toString(), // Store raw numeric value as string
            customType: true,
          };
        });

        // Transform extraAmenities to match the formattedExpenses format
        const extraAmenitiesAsExpenses = defaultAmenities.map((amenity) => {
          const amenityKey = amenity.another_amenity_name
            .replace(/[^\p{L}\p{N}\s]/gu, '')
            .replace(/\s+/g, '_')
            .toLowerCase();

          // Look directly in c.comps_adjustments for the amenity value
          const matchingAdjustment = c.comps_adjustments.find(
            (adj: { adj_key: string }) => adj.adj_key === amenityKey
          );

          const numericValue = matchingAdjustment?.adj_value
            ? parseFloat(matchingAdjustment.adj_value)
            : Number(amenity.another_amenity_value);

          return {
            adj_name: amenity.another_amenity_name,
            adj_key: amenityKey,
            adj_value: numericValue.toString(), // Store raw numeric value as string
            appraisal_default: true,
            customType: true,
          };
        });

        // Merge the arrays
        const mergedFormattedExpenses = [
          ...formattedExpenses,
          ...extraAmenitiesAsExpenses,
        ];

        const formattedQualitativeApproach = formattedQualitativeExpenses.map(
          (oe: any) => {
            const newValue = c.comps_qualitative_adjustments.find(
              (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
            );

            // Add null check for newValue
            if (!newValue) {
              return {
                ...oe,
                adj_key: oe.adj_key,
                adj_value: 'Similar',
                customType: false,
              };
            }

            const isCustom = !formattedDropdownOptions?.some(
              (option: { value: any }) => option?.value === newValue?.adj_value
            );
            return {
              ...oe,
              adj_key: newValue.adj_key,
              adj_value:
                typeof newValue?.adj_value === 'string' // Check if adj_value is a string
                  ? newValue.adj_value.replace(/_/g, ' ') // Replace underscores with spaces
                  : String(newValue?.adj_value || 'Similar'),
              customType: isCustom,
            };
          }
        );

        console.log('subject', c);

        // Update existing c.extra_amenities with API values for subject_property_check and comp_property_check
        const finalExtraAmenities = c.extra_amenities
          ? c.extra_amenities.map((existingAmenity: any) => {
              return {
                ...existingAmenity,
                subject_property_check:
                  existingAmenity.subject_property_check || 0,
                comp_property_check: existingAmenity.comp_property_check || 0,
              };
            })
          : [];
        console.log('fornatedexpenses', formattedExpenses),
          calculatedComps.push({
            ...c.comp_details,
            ...calculatedCompData,
            expenses: mergedFormattedExpenses,
            quantitativeAdjustments: formattedQualitativeApproach,
            id: c.id,
            comp_id: c.comp_id,
            overall_comparability: c.overall_comparability,
            blended_adjusted_psf: c.blended_adjusted_psf,
            weight: c.weight,
            total: c.total_adjustment,
            adjustment_note: c?.adjustment_note,
            extra_amenities: finalExtraAmenities,
            default_amenities: defaultAmenities,
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
          return a.business_name?.localeCompare(b.business_name);
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
      setValues({
        ...values,
        tableData: sortedComps,
        operatingExpenses: formattedOperatingExpenses, // ✅ Correct variable
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
        'salesApproachValuesResidential',
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
      adj_key: expense?.adj_key?.trim()?.toLowerCase()?.replace(/\s+/g, '_'),
      adj_value:
        typeof expense?.adj_value === 'string' &&
        expense?.adj_value.includes('$')
          ? parseFloat(expense?.adj_value.replace(/[$,]/g, '')) || 0
          : parseFloat(expense?.adj_value) || 0,
    }));
  }

  const subject_property_adjustments = transformOperatingExpensesToAdjustments(
    values?.operatingExpenses
  );

  function transformComparitiveAdjustment(appraisalSpecificAdjustment: any[]) {
    return appraisalSpecificAdjustment?.map((expense) => ({
      comparison_key: expense?.comparison_key
        ?.trim()
        ?.toLowerCase()
        ?.replace(/\s+/g, '_'),
      comparison_value: expense?.comparison_value,
    }));
  }

  const sales_comparison_attributes = transformComparitiveAdjustment(
    values?.appraisalSpecificAdjustment
  );

  function transformsalesCompQualitativeAdjustmentToAdjustments(
    salesCompQualitativeAdjustment: any[]
  ) {
    return salesCompQualitativeAdjustment?.map((expense) => ({
      adj_key: expense?.adj_key?.trim()?.toLowerCase()?.replace(/\s+/g, '_'),
      adj_value: expense?.adj_value,
      subject_property_value: expense?.subject_property_value
        ? expense?.subject_property_value
        : '',
    }));
  }

  const subject_qualitative_adjustments =
    transformsalesCompQualitativeAdjustmentToAdjustments(
      values?.salesCompQualitativeAdjustment
    );

  let totalaveragedadjustedpsf: any = 0;

  values?.tableData.forEach((comp: { averaged_adjusted_psf: string }) => {
    if (comp.averaged_adjusted_psf) {
      totalaveragedadjustedpsf += parseFloat(comp.averaged_adjusted_psf);
    }
  });
  // calculation of totaal zoning data
  const calculateTotalZoningValue = (zonings: any[]) => {
    return zonings.reduce((total, zoning) => {
      const sqFt = parseFloat(zoning.total_sq_ft);
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

  totalaveragedadjustedpsf = parseFloat(totalaveragedadjustedpsf.toFixed(2));
  const FinalResult =
    result *
    parseFloat(
      (totalaveragedadjustedpsf / appraisalData.building_size).toFixed(2)
    );
  // const costIndicatedPsf = FinalResult / buildingSize;
  const costIndicatedPsf = FinalResult / Number(buildingSize);
  const totalSalesUnitOfSquareftOrACre =
    totalaveragedadjustedpsf * appraisalData.land_size;

  let totalWeightage = 0;

  values?.tableData.forEach((comp: { weight: string }) => {
    if (comp.weight) {
      totalWeightage += parseFloat(comp.weight);
    }
  });

  const comp_data = values?.tableData?.map((item: any, index: number) => {
    const comps_adjustments =
      item.expenses?.map((exp: any) => ({
        adj_key: exp.adj_key
          ? exp.adj_key.trim().toLowerCase().replace(/\s+/g, '_')
          : exp.adj_name === 'Basement Finished' ||
              exp.adj_name === 'Basement Unfinished'
            ? exp.adj_name.trim().toLowerCase().replace(/\s+/g, '_')
            : '',
        adj_value:
          typeof exp.adj_value === 'string' && exp.adj_value.includes('$')
            ? parseFloat(exp.adj_value.replace(/[$,]/g, '')) || 0
            : parseFloat(exp.adj_value) || 0,
      })) || [];

    const comps_qualitative_adjustments =
      item.quantitativeAdjustments?.map((qualExp: any) => ({
        adj_key: qualExp.adj_key ? qualExp.adj_key.replace(/\s+/g, '_') : '',
        adj_value: qualExp.adj_value,
        // isCustom: false
      })) || [];

    // Map extra_amenities array
    const extra_amenities =
      item.extra_amenities?.map((amenity: any) => ({
        another_amenity_name: amenity.another_amenity_name,
        another_amenity_value:
          typeof amenity.another_amenity_value === 'string' &&
          amenity.another_amenity_value.trim() !== ''
            ? parseFloat(amenity.another_amenity_value.replace(/[$,]/g, '')) ||
              0
            : parseFloat(amenity.another_amenity_value) || 0,
        subject_property_check: amenity.subject_property_check,
        comp_property_check: amenity.comp_property_check,
        is_extra: amenity.is_extra,
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
      averaged_adjusted_psf: item.averaged_adjusted_psf,
      comps_adjustments: comps_adjustments,
      comps_qualitative_adjustments: comps_qualitative_adjustments,
      extra_amenities: extra_amenities,
    };
  });

  const salesApproachData = {
    ...(appraisalSalesApproachId ? { id: appraisalId } : {}),
    res_evaluation_scenario_id: salesId ? parseFloat(salesId) : null,
    incremental_value:
      (FinalResult *
        (updateEvalSaleWeightInParent !== undefined &&
        updateEvalSaleWeightInParent !== 0
          ? updateEvalSaleWeightInParent
          : evaluationWeight || 0)) /
      100,
    averaged_adjusted_psf:
      buildingSize && Number(buildingSize) !== 0
        ? FinalResult / Number(buildingSize)
        : totalaveragedadjustedpsf,

    // averaged_adjusted_psf: totalaveragedadjustedpsf,
    // averaged_adjusted_psf:
    //   buildingSize && buildingSize !== 0
    //     ? FinalResult / buildingSize
    //     : totalaveragedadjustedpsf,
    sales_approach_value: FinalResult,
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
    res_evaluation_id: id ? parseFloat(id) : null,
    sales_approach: salesApproachData,
    weighted_market_value: totalWeightedValue,
  };
  const mutation = useMutate<any, any>({
    queryKey: 'save-sale-approach',
    endPoint: 'res-evaluations/save-sales-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'save-sale-approach',
    endPoint: 'res-evaluations/update-sales-approach',
    requestType: RequestType.POST,
  });
  const handleAddNewComp = () => {
    // setIsOpen(true);
    // localStorage.setItem('activeType', 'building_with_land');
    navigate(`/residential/filter-sales-comps?id=${id}&approachId=${salesId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
        values: values,
      },
    });
  };
  console.log('checkvaluessss', values);
  const handleLinkExistingComps = () => {
    navigate(`/residential/sales/create-comp?id=${id}&approachId=${salesId}`, {
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
        toast.success(response.data.message);
        setLoader(false);
        navigate(
          `/residential/evaluation/sales-comps-map?id=${id}&salesId=${salesId}`
        );
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };
  const handleSubmitForOtherAmenities = async () => {
    setLoader(true);
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
        //  toast.success(response.data.message);
        setLoader(false);
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
        navigate(
          `/residential/update-sales-comps/${itemId}/${id}/sales/${salesId}`
        );
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };
  console.log('updatedompsssss', updatedCompss);
  useEffect(() => {
    if (updatedCompss) {
      setTimeout(() => {
        passCompsDataToFilter(updatedCompss);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
      }, 1000);
    }
  }, [updatedCompss]);
  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    try {
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

      // Create updated comps data
      const updatedCompsData = updatedComps.map((item: any, index: number) => {
        const comps_adjustments =
          item.expenses?.map((exp: any) => ({
            adj_key: exp.adj_key
              ? exp.adj_key
              : exp.adj_name === 'Basement Finished' ||
                  exp.adj_name === 'Basement Unfinished'
                ? exp.adj_name.trim().toLowerCase().replace(/\s+/g, '_')
                : '',
            adj_value:
              typeof exp.adj_value === 'string' && exp.adj_value.includes('$')
                ? parseFloat(exp.adj_value.replace(/[$,]/g, '')) || 0
                : parseFloat(exp.adj_value) || 0,
          })) || [];

        const comps_qualitative_adjustments =
          item.quantitativeAdjustments?.map((qualExp: any) => ({
            adj_key: qualExp.adj_key
              ? qualExp.adj_key.replace(/\s+/g, '_')
              : '',
            adj_value: qualExp.adj_value,
          })) || [];

        const extra_amenities =
          item.extra_amenities?.map((amenity: any) => ({
            another_amenity_name: amenity.another_amenity_name,
            another_amenity_value:
              typeof amenity.another_amenity_value === 'string' &&
              amenity.another_amenity_value.trim() !== ''
                ? parseFloat(
                    amenity.another_amenity_value.replace(/[$,]/g, '')
                  ) || 0
                : parseFloat(amenity.another_amenity_value) || 0,
            subject_property_check: amenity.subject_property_check,
            comp_property_check: amenity.comp_property_check,
            is_extra: amenity.is_extra,
          })) || [];

        const comp_id = item.comp_id || item.id;
        return {
          // ...(appraisalSalesApproachId ? { id: item.id } : {}),
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
          averaged_adjusted_psf: item.averaged_adjusted_psf,
          comps_adjustments: comps_adjustments,
          comps_qualitative_adjustments: comps_qualitative_adjustments,
          extra_amenities: extra_amenities,
        };
      });

      // Find the first comp that has operatingExpenses with non-zero values
      let bestOperatingExpenses = [];

      // Loop through all comps to find the best operatingExpenses to use
      for (const comp of updatedComps) {
        if (comp.operatingExpenses && comp.operatingExpenses.length > 0) {
          // Check if this comp has any non-zero values
          const hasNonZeroValues = comp.operatingExpenses.some((exp: any) => {
            const value =
              typeof exp.adj_value === 'number'
                ? exp.adj_value
                : parseFloat(exp.adj_value) || 0;
            return value !== 0;
          });

          if (hasNonZeroValues) {
            bestOperatingExpenses = comp.operatingExpenses;
            console.log(
              'Found comp with non-zero operatingExpenses:',
              comp.id || comp.comp_id
            );
            break;
          } else if (bestOperatingExpenses.length === 0) {
            // If we haven't found any operatingExpenses yet, use this one
            bestOperatingExpenses = comp.operatingExpenses;
          }
        }
      }

      // Create subject_property_adj from the best operating expenses
      const updatedSubjectPropertyAdj =
        bestOperatingExpenses.length > 0
          ? bestOperatingExpenses.map((exp: any) => ({
              adj_key: exp.adj_key,
              adj_value:
                typeof exp.adj_value === 'number'
                  ? exp.adj_value
                  : typeof exp.adj_value === 'string' &&
                      exp.adj_value.includes('$')
                    ? parseFloat(exp.adj_value.replace(/[$,]/g, '')) || 0
                    : parseFloat(exp.adj_value) || 0,
            }))
          : subject_property_adjustments;

      console.log(
        'Using original operating expenses for subject_property_adj:',
        updatedSubjectPropertyAdj
      );

      const updatedSalesApproachData = {
        ...(appraisalSalesApproachId ? { id: appraisalSalesApproachId } : {}),
        res_evaluation_scenario_id: salesId ? parseFloat(salesId) : null,
        incremental_value:
          (FinalResult *
            (updateEvalSaleWeightInParent !== undefined &&
            updateEvalSaleWeightInParent !== 0
              ? updateEvalSaleWeightInParent
              : evaluationWeight || 0)) /
          100,
        averaged_adjusted_psf:
          buildingSize && Number(buildingSize) !== 0
            ? FinalResult / Number(buildingSize)
            : updatedTotalAveragedAdjustedPsf,
        sales_approach_value: FinalResult,
        weight: parseFloat(updatedTotalWeightage.toString()),
        note: salesNote,
        subject_property_adj: updatedSubjectPropertyAdj,
        subject_qualitative_adjustments: subject_qualitative_adjustments,
        sales_comparison_attributes: sales_comparison_attributes,
        sales_approach_indicated_val: FinalResult,
        comp_data: updatedCompsData,
      };

      const updatedFinalData = {
        res_evaluation_id: id ? parseFloat(id) : null,
        sales_approach: updatedSalesApproachData,
        weighted_market_value: totalWeightedValue,
      };

      let response;
      if (appraisalSalesApproachId) {
        response = await mutations.mutateAsync(updatedFinalData);
        fetchComposData(values, setValues);
      } else {
        const modifiedPayload = {
          ...updatedFinalData,
          sales_approach: {
            ...updatedFinalData.sales_approach,
            comp_data: updatedFinalData.sales_approach.comp_data,
          },
        };
        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        toast.success(response.data.message);
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
      // Log the first comp to see if operatingExpenses exists
      console.log('First comp in totalComps:', totalComps[0]);

      const updatedComps = totalComps.map((comp) => {
        count++;
        if (totalComps.length === 3 && count === totalComps.length) {
          comp.weight = 33.34;
        } else {
          comp.weight = newInitialWeight.toFixed(2);
        }

        // Preserve the original operatingExpenses if available
        const originalOperatingExpenses = comp.operatingExpenses || [];

        // Use expenses for calculations but don't modify them
        const expenses = [...comp.expenses];

        // Calculate total without modifying the original expenses
        let total = 0;
        expenses.forEach((exp: any) => {
          if (exp.adj_value) {
            const value =
              typeof exp.adj_value === 'string' && exp.adj_value.includes('$')
                ? parseFloat(exp.adj_value.replace(/[$,]/g, ''))
                : typeof exp.adj_value === 'number'
                  ? exp.adj_value
                  : parseFloat(exp.adj_value) || 0;
            if (!isNaN(value)) {
              total += value;
            }
          }
        });

        const calculatedCompData = calculateCompData({
          total,
          weight: comp.weight,
          comp,
        });

        const updatedCompData = {
          ...comp,
          ...calculatedCompData,
          // Make sure to preserve the original operatingExpenses
          operatingExpenses: originalOperatingExpenses,
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

  const totalSaleValue = totalBeds * totalaveragedadjustedpsf;
  const totalSaleValueUnit = totalUnits * totalaveragedadjustedpsf;

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
  localStorage.setItem('salesValuePerUnitForWeightage1', valueToStore);

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

  const formattedQuantitativeDropdownOptions = quantitativeAdjustmentItems.map(
    (option) => ({
      value: option.code,
      label: option.name,
    })
  );
  // Utility function to format numbers
  const formatNumber = (value: number | string): string => {
    if (!value || isNaN(Number(value))) {
      return 'N/A'; // Return 'N/A' if the value is not a valid number
    }
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  // format number only for formatting
  const formatValue = (value: number | string): string => {
    if (!value || isNaN(Number(value))) {
      return 'N/A'; // Return 'N/A' if the value is not a valid number
    }
    return Number(value).toLocaleString('en-US'); // Format with commas only
  };

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
          `/residential/evaluation/sales-comps-map?id=${id}&salesId=${leaseIdRedirectIndex}`
        );
        return;
      }
    }
    if (hasRentRollType) {
      navigate(
        `/evaluation/rent-roll?id=${id}&evaluationId=${filtereRentRolldData?.[filtereRentRolldData.length - 1]?.id}`
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

  return (
    <ResidentialMenuOptions
      finalResults={FinalResult}
      totalaveragedadjustedpsfSales={costIndicatedPsf}
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
        <ResidentialUploadSalesCompsModal
          open={openComps}
          onClose={() => setCompsOpen(false)}
          setCompsModalOpen={setCompsModalOpen}
          compsLength={compsLength}
          setCompsData={setCompsData}
          compsData={compsData ?? []} // Avoid passing null where an array is needed
        />
      )}
      {compsModalOpen && (
        <ResidentialSalesCompsData
          passCompsData={passCompsDataToFilter1}
          compsLength={compsLength}
          open={compsModalOpen}
          onClose={() => setCompsModalOpen(false)} // Close CompsForm on click
          handleClose={() => setCompsModalOpen(false)} // ✅ Add missing prop
          compsData={compsData}
        />
      )}
      <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
        <Typography
          variant="h1"
          component="h2"
          className="text-xl font-bold uppercase"
        >
          Sales comps{' '}
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
              <p className="pb-1 text-xs font-bold">Date Sold</p>
            </div>
            <div className="p-1 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <FieldArray
                name="appraisalSpecificAdjustment"
                render={() => (
                  <>
                    {values?.appraisalSpecificAdjustment &&
                    values?.appraisalSpecificAdjustment.length > 0 ? (
                      values?.appraisalSpecificAdjustment.map(
                        (zone: any, i: number) => (
                          <div
                            className="flex items-center quantitate-items justify-between gap-1 h-[20px]"
                            key={i}
                          >
                            <Grid
                              item
                              className="dropdown min-w-[calc(100%-36px)] w-full manageDropdownField "
                            >
                              {zone.comparison_key === '' ||
                              (zone.comparison_key !== 'type_my_own' &&
                                comparativeFactors.some(
                                  (option: any) =>
                                    option.value === zone.comparison_key
                                )) ? (
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
                                                  comparison_value:
                                                    input === 'type_my_own'
                                                      ? ''
                                                      : label?.label || '',
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
                                  options={[
                                    ...comparativeFactors,
                                    {
                                      value: 'type_my_own',
                                      label: 'Type My Own',
                                    },
                                  ]}
                                />
                              ) : (
                                <StyledField
                                  type="text"
                                  name={`appraisalSpecificAdjustment.${i}.comparison_value`}
                                  value={zone.comparison_value || ''}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input = e.target.value;
                                    // Convert spaces to underscores for comparison_key
                                    const comparisonKeyValue = input.replace(
                                      /\s+/g,
                                      '_'
                                    );

                                    setValues((old: any) => {
                                      const appraisalSpecificAdjustment =
                                        old.appraisalSpecificAdjustment.map(
                                          (expense: any, index: number) =>
                                            index === i
                                              ? {
                                                  ...expense,
                                                  comparison_key:
                                                    comparisonKeyValue, // Set to the custom input value with underscores
                                                  comparison_value: input, // Keep original input for display
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
                                                    comparison_key:
                                                      comparisonKeyValue, // Use underscore version
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
                                  style={{
                                    fontSize: '12px',
                                    borderBottomWidth: '1px',
                                    color: 'black',
                                    width: '100%',
                                    minHeight: '36px',
                                    fontWeight: 400,
                                  }}
                                />
                              )}
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
                    {values?.operatingExpenses &&
                    values?.operatingExpenses.length > 0 ? (
                      values?.operatingExpenses
                        .filter(
                          (zone: any) =>
                            (zone.appraisal_default !== false ||
                              (zone.adj_key &&
                                zone.adj_key !== '' &&
                                !formattedQuantitativeDropdownOptions.some(
                                  (option: any) => option.value === zone.adj_key
                                ))) &&
                            zone.adj_key !== 'basement_finished' &&
                            zone.adj_key !== 'basement_unfinished'
                        )
                        .map((zone: any, i: number) => {
                          // Get the actual index in the original array by finding the i-th item that matches our filter
                          const filteredItems = values.operatingExpenses.filter(
                            (item: any) =>
                              (item.appraisal_default !== false ||
                                (item.adj_key &&
                                  item.adj_key !== '' &&
                                  !formattedQuantitativeDropdownOptions.some(
                                    (option: any) =>
                                      option.value === item.adj_key
                                  ))) &&
                              item.adj_key !== 'basement_finished' &&
                              item.adj_key !== 'basement_unfinished'
                          );
                          const actualIndex = values.operatingExpenses.indexOf(
                            filteredItems[i]
                          );

                          return (
                            <div
                              className="flex items-center quantitate-items justify-between gap-1 h-[19px]"
                              key={actualIndex}
                            >
                              <Grid
                                item
                                className="dropdown min-w-[calc(100%-36px)] manageDropdownField w-full"
                              >
                                {zone.adj_key === '' ||
                                (zone.adj_key !== 'type_my_own' &&
                                  zone.adj_key !== '' &&
                                  formattedQuantitativeDropdownOptions.some(
                                    (option: any) =>
                                      option.value === zone.adj_key
                                  )) ? (
                                  <SelectTextField
                                    style={{
                                      fontSize: '12px',
                                      borderBottomWidth: '1px',
                                      color: 'black',
                                      fontWeight: 400,
                                    }}
                                    name={`operatingExpenses.${i}.adj_key`}
                                    value={zone.adj_key || ''}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      const input = e.target.value;

                                      setValues((old: any) => {
                                        // Find the actual index in the original array
                                        const actualIndex =
                                          old.operatingExpenses.findIndex(
                                            (item: any) =>
                                              item.adj_key === zone.adj_key
                                          );

                                        const operatingExpenses =
                                          old.operatingExpenses.map(
                                            (expense: any, index: number) =>
                                              index === actualIndex
                                                ? {
                                                    ...expense,
                                                    adj_key: input,
                                                    adj_name:
                                                      input === 'type_my_own'
                                                        ? ''
                                                        : expense.adj_name,
                                                    adj_value:
                                                      input === 'type_my_own'
                                                        ? 0.0
                                                        : expense.adj_value,
                                                  }
                                                : expense
                                          );

                                        const compsWithNewAdj =
                                          old.tableData.map((comp: any) => ({
                                            ...comp,
                                            quantitativeAdjustments:
                                              comp.quantitativeAdjustments.map(
                                                (exp: any, expIndex: number) =>
                                                  expIndex === actualIndex
                                                    ? {
                                                        ...exp,
                                                        adj_key: input,
                                                      }
                                                    : exp
                                              ),
                                            // Sync only adj_key to expenses array, not adj_value
                                            expenses: (comp.expenses || []).map(
                                              (exp: any, expIndex: number) =>
                                                expIndex === actualIndex
                                                  ? {
                                                      ...exp,
                                                      adj_key: input,
                                                      adj_name:
                                                        input === 'type_my_own'
                                                          ? ''
                                                          : exp.adj_name,
                                                    }
                                                  : exp
                                            ),
                                          }));

                                        return {
                                          ...old,
                                          operatingExpenses,
                                          tableData: compsWithNewAdj,
                                        };
                                      });
                                    }}
                                    options={
                                      formattedQuantitativeDropdownOptions
                                    }
                                  />
                                ) : (
                                  <StyledField
                                    type="text"
                                    name={`operatingExpenses.${i}.adj_value`}
                                    value={
                                      zone.adj_key === 'type_my_own'
                                        ? ''
                                        : (
                                            zone.adj_name ||
                                            zone.adj_key ||
                                            ''
                                          ).replace(/_/g, ' ')
                                    }
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      const input = e.target.value;
                                      // Convert input to adj_key format (replace spaces with underscores)
                                      const adjKey = input.replace(/\s+/g, '_');

                                      setValues((old: any) => {
                                        // Use the actualIndex we calculated earlier in the map function
                                        const currentActualIndex = actualIndex;

                                        const operatingExpenses =
                                          old.operatingExpenses.map(
                                            (expense: any, index: number) =>
                                              index === currentActualIndex
                                                ? {
                                                    ...expense,
                                                    adj_key: adjKey, // Set to the formatted adj_key value
                                                    adj_name: input, // Keep original input for display
                                                    adj_value: 0.0,
                                                  }
                                                : expense
                                          );

                                        const compsWithNewAdj =
                                          old.tableData.map((comp: any) => ({
                                            ...comp,
                                            quantitativeAdjustments:
                                              comp.quantitativeAdjustments.map(
                                                (exp: any, expIndex: number) =>
                                                  expIndex ===
                                                  currentActualIndex
                                                    ? {
                                                        ...exp,
                                                        adj_key: input,
                                                      }
                                                    : exp
                                              ),
                                            // Sync only adj_key to expenses array, not adj_value
                                            expenses: (comp.expenses || []).map(
                                              (exp: any, expIndex: number) =>
                                                expIndex === currentActualIndex
                                                  ? {
                                                      ...exp,
                                                      adj_key: adjKey,
                                                      adj_name: input,
                                                    }
                                                  : exp
                                            ),
                                          }));

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
                                      minHeight: '36px',
                                      fontWeight: 400,
                                    }}
                                  />
                                )}
                              </Grid>
                              <Grid item className="min-w-[36px]">
                                <div className="flex flex-row items-center ">
                                  {(zone.adj_key === 'type_my_own' ||
                                    (zone.adj_key &&
                                      zone.adj_key !== '' &&
                                      !formattedQuantitativeDropdownOptions.some(
                                        (option: any) =>
                                          option.value === zone.adj_key
                                      ))) && (
                                    <Icons.SwitchIcon
                                      style={{ width: '14px' }}
                                      className="text-blue-500 cursor-pointer"
                                      onClick={() => {
                                        setValues((old: any) => {
                                          // Use the actualIndex we calculated earlier in the map function
                                          const currentActualIndex =
                                            actualIndex;

                                          const updatedOperatingExpenses =
                                            old.operatingExpenses.map(
                                              (expense: any, index: number) => {
                                                if (
                                                  index === currentActualIndex
                                                ) {
                                                  return {
                                                    ...expense,
                                                    adj_key: '', // Clear to switch back to dropdown
                                                    adj_name: '',
                                                    adj_value: 0.0,
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

                                  {/* Remove icon - show for all items except when only one remains */}
                                  {values.operatingExpenses.length > 1 && (
                                    <Icons.RemoveCircleOutlineIcon
                                      className="text-red-500 cursor-pointer"
                                      style={{
                                        width: '14px',
                                        cursor: 'pointer',
                                        height: '14px',
                                      }}
                                      onClick={() => {
                                        setValues((old: any) => {
                                          // Use the actualIndex we calculated earlier in the map function
                                          const currentActualIndex =
                                            actualIndex;
                                          // Remove the specific item at actual index
                                          const operatingExpenses =
                                            old.operatingExpenses.filter(
                                              (_: any, index: number) =>
                                                index !== currentActualIndex
                                            );
                                          const updatedTableData =
                                            old.tableData.map((comp: any) => ({
                                              ...comp,
                                              quantitativeAdjustments:
                                                comp.quantitativeAdjustments.filter(
                                                  (_: any, expIndex: number) =>
                                                    expIndex !==
                                                    currentActualIndex
                                                ),
                                              // Also remove from expenses array for the comp card display
                                              expenses: (
                                                comp.expenses || []
                                              ).filter(
                                                (_: any, expIndex: number) =>
                                                  expIndex !==
                                                  currentActualIndex
                                              ),
                                            }));

                                          return {
                                            ...old,
                                            operatingExpenses,
                                            tableData: updatedTableData,
                                          };
                                        });
                                      }}
                                    />
                                  )}
                                  {/* Add icon - show only with the last item */}
                                  {i ===
                                    values.operatingExpenses.filter(
                                      (zone: any) =>
                                        (zone.appraisal_default !== false ||
                                          (zone.adj_key &&
                                            zone.adj_key !== '' &&
                                            !formattedQuantitativeDropdownOptions.some(
                                              (option: any) =>
                                                option.value === zone.adj_key
                                            ))) &&
                                        zone.adj_key !== 'basement_finished' &&
                                        zone.adj_key !== 'basement_unfinished'
                                    ).length -
                                      1 && (
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
                                              adj_name: '',
                                              adj_value: 0.0,
                                            },
                                          ],
                                          tableData: old.tableData.map(
                                            (comp: any) => ({
                                              ...comp,
                                              // Only add to expenses array for the comp card display
                                              // Sync expenses array with operatingExpenses structure
                                              expenses: [
                                                ...(comp.expenses || []).slice(
                                                  0,
                                                  old.operatingExpenses.length
                                                ),
                                                {
                                                  adj_key: '',
                                                  adj_name: '',
                                                  adj_value: '$0.00',
                                                  appraisal_default: true,
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
                        })
                    ) : (
                      <p className="text-sm font-bold text-gray-500">
                        No operating expenses data
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="py-1 pb-0.5">
              <FieldArray
                name="salesCompQualitativeAdjustment"
                render={() => (
                  <>
                    {values?.salesCompQualitativeAdjustment &&
                    values?.salesCompQualitativeAdjustment.length > 0 ? (
                      values?.salesCompQualitativeAdjustment.map(
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

                                        const compsWithNewAdj =
                                          old.tableData.map((comp: any) => ({
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
                                          }));

                                        return {
                                          ...old,
                                          salesCompQualitativeAdjustment,
                                          tableData: compsWithNewAdj,
                                        };
                                      });
                                    }}
                                    options={
                                      formattedQualitativeDropdownOptions
                                    }
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

                                        const compsWithNewAdj =
                                          old.tableData.map((comp: any) => ({
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
                                          }));

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
                                      minHeight: '36px',
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
                                  {values.salesCompQualitativeAdjustment
                                    .length > 1 && (
                                    <Icons.RemoveCircleOutlineIcon
                                      className="text-red-500 cursor-pointer"
                                      style={{
                                        width: '14px',
                                        cursor: 'pointer',
                                        height: '14px',
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
                                    values.salesCompQualitativeAdjustment
                                      .length -
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
            </div>
            {/* //-----------------------------------------------------------------------------------? */}
            <div className="border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] px-1 flex items-center  h-10 mt-[3px]">
              <p className="text-xs font-bold border-below">Notes</p>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <p className="text-xs h-[18px] !m-0 font-semibold italic text-ellipsis overflow-hidden whitespace-nowrap">
                Overall Adjustment
              </p>

              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Adjusted Sale Price
              </p>

              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Weighting
              </p>

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
                {appraisalData.close_date
                  ? new Date(appraisalData.close_date).toLocaleDateString()
                  : APPROACHESENUMS.SPACE}
              </p>
            </div>
            <div className="p-1 space-y-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              {values?.appraisalSpecificAdjustment?.length > 0
                ? values?.appraisalSpecificAdjustment.map(
                    (adjustments: any, index: number) => {
                      const isStreetAddress =
                        adjustments.comparison_key === 'street_address';
                      const isLandSizeSF =
                        adjustments.comparison_key === 'land_size_sf';
                      const isLandSizeAcre =
                        adjustments.comparison_key === 'land_size_acre';
                      const isCityState =
                        adjustments.comparison_key === 'city_state';
                      const isDateSold =
                        adjustments.comparison_key === 'date_sold';

                      const bedroom = adjustments.comparison_key === 'bedrooms';
                      const bathrooms =
                        adjustments.comparison_key === 'bathrooms';
                      const fencing = adjustments.comparison_key === 'fencing';
                      const zoning =
                        adjustments.comparison_key === 'zoning_type';
                      const fireplace =
                        adjustments.comparison_key === 'fireplace';
                      const grossLivingSqFt =
                        adjustments.comparison_key === 'gross_living_area';
                      const basement =
                        adjustments.comparison_key === 'basement_sf';

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
                      const isCityCounty =
                        adjustments.comparison_key === 'city_county';
                      const netOperatingIncome =
                        adjustments.comparison_key === 'net_operating_income';
                      const frontage =
                        adjustments.comparison_key === 'frontage';
                      const parking = adjustments.comparison_key === 'parking';
                      const utilities =
                        adjustments.comparison_key === 'services';
                      const otherAmenities =
                        adjustments.comparison_key === 'other_amenities';
                      const heatingCooling =
                        adjustments.comparison_key === 'heating_and_cooling';
                      const isGarage = adjustments.comparison_key === 'garage';
                      const isCondition =
                        adjustments.comparison_key === 'condition';
                      const isBuildingSizeLandSize =
                        adjustments.comparison_key ===
                        'building_size_land_size';
                      // New condition
                      const totalGrossLivingSqFt =
                        appraisalData?.res_zonings?.reduce(
                          (sum: any, item: any) => {
                            return sum + (item.gross_living_sq_ft || 0);
                          },
                          0
                        );
                      const totalGrossLivingSqFt1 =
                        (totalGrossLivingSqFt || 0).toLocaleString() + ' SF';
                      let landSize = 'N/A';
                      if (
                        appraisalData.land_size &&
                        appraisalData.land_dimension == 'SF'
                      ) {
                        landSize =
                          appraisalData.land_size
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' SF';
                      } else if (
                        appraisalData.land_size &&
                        appraisalData.land_dimension == 'ACRE'
                      ) {
                        landSize =
                          formatNumberAcre(appraisalData.land_size.toFixed(3)) +
                          ' AC';
                      }
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
                              ? `${(appraisalData.building_size || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} SF / ${landSize}`
                              : isCondition
                                ? formatConditionOption(appraisalData.condition)
                                : isGarage
                                  ? appraisalData?.garage
                                  : otherAmenities
                                    ? [
                                        AdditionalAmenities,
                                        appraisalData.other_amenities,
                                      ]
                                        .filter(Boolean) // Removes undefined/null/empty values
                                        .join(', ')
                                    : heatingCooling
                                      ? appraisalData?.heating_cooling
                                      : isStreetAddress
                                        ? appraisalData.street_address
                                        : frontage
                                          ? capitalizeWords(
                                              appraisalData.frontage
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
                                                                ).toFixed(3) // Retain three decimal places
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
                                                          : basement
                                                            ? appraisalData?.total_basement
                                                              ? appraisalData?.total_basement
                                                                  .toString()
                                                                  .replace(
                                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                                    ','
                                                                  )
                                                              : ''
                                                            : grossLivingSqFt
                                                              ? totalGrossLivingSqFt1 ??
                                                                null
                                                              : zoning
                                                                ? appraisalData.zoning_type
                                                                : bedroom
                                                                  ? capitalizeWords(
                                                                      appraisalData.bedrooms
                                                                    )
                                                                  : bathrooms
                                                                    ? capitalizeWords(
                                                                        appraisalData.bathrooms
                                                                      )
                                                                    : fencing
                                                                      ? appraisalData.fencing
                                                                      : fireplace
                                                                        ? capitalizeWords(
                                                                            appraisalData.fireplace
                                                                          )
                                                                        : isYearBuiltRemodeled
                                                                          ? `${
                                                                              appraisalData.year_built ||
                                                                              APPROACHESENUMS.NA
                                                                            } / ${
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
                                                                                                      ? appraisalData.additional_amenities
                                                                                                        ? appraisalData.additional_amenities
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
                    { length: values?.appraisalSpecificAdjustment?.length },
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

            <div className="p-1 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
              <FieldArray
                name="operatingExpenses"
                render={() => {
                  const handleBasementClick = (index: number) => {
                    setCurrentBasementIndex(index);

                    const finished = values.operatingExpenses.find(
                      (exp: any) => exp.adj_key === 'basement_finished'
                    )?.adj_value;

                    const unfinished = values.operatingExpenses.find(
                      (exp: any) => exp.adj_key === 'basement_unfinished'
                    )?.adj_value;

                    const formatDollar = (val: any) => {
                      if (!val) return '$0.00';

                      // Handle string values
                      let cleanValue = val;
                      if (typeof val === 'string') {
                        cleanValue = val.replace(/[$,]/g, '');
                      }

                      const num = parseFloat(cleanValue);
                      if (isNaN(num)) return '$0.00';

                      return `$${num.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;
                    };

                    setFinishedValue(
                      finished ? formatDollar(finished) : '$0.00'
                    );
                    setUnfinishedValue(
                      unfinished ? formatDollar(unfinished) : '$0.00'
                    );

                    setIsModalOpen(true);
                  };

                  const handleCalculate = () => {
                    if (currentBasementIndex !== null) {
                      const finishedNum =
                        parseFloat(finishedValue.replace(/[$,]/g, '')) || 0;
                      const unfinishedNum =
                        parseFloat(unfinishedValue.replace(/[$,]/g, '')) || 0;

                      setValues((old: any) => {
                        const operatingExpenses = [...old.operatingExpenses];

                        // Update the visible basement field with both values and their sum
                        operatingExpenses[currentBasementIndex] = {
                          ...operatingExpenses[currentBasementIndex],
                          adj_value: ` (${finishedValue} / ${unfinishedValue})`,
                          isModified: true, // ✅ Mark this as modified
                        };

                        // Update hidden finished - store raw number without formatting
                        const finishedIndex = operatingExpenses.findIndex(
                          (exp) => exp.adj_key === 'basement_finished'
                        );
                        if (finishedIndex !== -1) {
                          operatingExpenses[finishedIndex] = {
                            ...operatingExpenses[finishedIndex],
                            adj_value: finishedNum.toFixed(2),
                            isModified: true, // ✅ Mark this as modified
                          };
                        }

                        // Update hidden unfinished - store raw number without formatting
                        const unfinishedIndex = operatingExpenses.findIndex(
                          (exp) => exp.adj_key === 'basement_unfinished'
                        );
                        if (unfinishedIndex !== -1) {
                          operatingExpenses[unfinishedIndex] = {
                            ...operatingExpenses[unfinishedIndex],
                            adj_value: unfinishedNum.toFixed(2),
                            isModified: true, // ✅ Mark this as modified
                          };
                        }

                        return {
                          ...old,
                          operatingExpenses,
                        };
                      });

                      // ✅ Trigger recalculation
                      setRecalcBasementVersion((prev) => prev + 1);

                      // ✅ Close modal
                      setIsModalOpen(false);
                    }
                  };

                  return (
                    <>
                      {values?.operatingExpenses &&
                      values?.operatingExpenses.length > 0 ? (
                        values?.operatingExpenses.map(
                          (zone: any, i: number) => {
                            // Skip hidden fields completely
                            if (
                              [
                                'basement_finished',
                                'basement_unfinished',
                              ].includes(zone.adj_key)
                            ) {
                              return null;
                            }

                            const noInputKeys = [
                              'garage',
                              'heating_cooling',
                              'fencing',
                              'other_amenities',
                              'time',
                              'location',
                              'condition',
                            ];

                            // Check if this is a custom input (not in default options)
                            const isCustomInput =
                              zone.adj_key &&
                              !formattedQuantitativeDropdownOptions.some(
                                (option: any) => option.value === zone.adj_key
                              );

                            // Show empty row if it's a noInputKey OR if it's a custom input that's also a noInputKey OR if it's type_my_own OR if it's a custom input that should not show value field
                            const shouldShowEmptyRow =
                              noInputKeys.includes(zone.adj_key) ||
                              (isCustomInput &&
                                noInputKeys.includes(zone.adj_key)) ||
                              zone.adj_key === 'type_my_own' ||
                              (isCustomInput &&
                                !zone.adj_key.match(
                                  /^(basement|bathrooms|bedrooms|condition|fencing|fireplace|garage|gross_living_area_sf|heating_cooling|land_size|year_built)$/
                                ));

                            return (
                              <div
                                className="flex items-center quantitate-items justify-between gap-1 h-[19.2px]"
                                key={i}
                              >
                                <Grid item className="w-full">
                                  {shouldShowEmptyRow ? (
                                    <div
                                      className="h-[18px] border-b border-gray-300"
                                      style={{ backgroundColor: 'inherit' }}
                                    ></div>
                                  ) : zone.adj_key === 'basement' ? (
                                    <div
                                      style={{
                                        borderBottom: '1px solid #ccc',
                                      }}
                                      className="cursor-pointer text-[#0DA1C7] underline text-xs bg-inherit min-h-[18px] focus:outline-none w-full p-[0px] overflow-hidden whitespace-nowrap text-ellipsis"
                                      onClick={() => handleBasementClick(i)}
                                    >
                                      {(() => {
                                        const finished =
                                          values.operatingExpenses.find(
                                            (exp: any) =>
                                              exp.adj_key ===
                                              'basement_finished'
                                          )?.adj_value;

                                        const unfinished =
                                          values.operatingExpenses.find(
                                            (exp: any) =>
                                              exp.adj_key ===
                                              'basement_unfinished'
                                          )?.adj_value;

                                        return finished || unfinished
                                          ? `(${formatPrice(finished)} / ${formatPrice(unfinished)})`
                                          : 'Click to add';
                                      })()}
                                    </div>
                                  ) : (
                                    <StyledField
                                      type="text"
                                      name={`operatingExpenses.${i}.adj_value`}
                                      value={(() => {
                                        if (
                                          [
                                            'time',
                                            'location',
                                            'condition',
                                          ].includes(zone.adj_key)
                                        ) {
                                          const val = zone.adj_value || '0%';
                                          if (val === '0%') return val;
                                          const numericValue = parseFloat(
                                            String(val).replace(/[%]/g, '')
                                          );
                                          return isNaN(numericValue)
                                            ? val
                                            : `${String(val).replace(/[%]/g, '').toLocaleString()}%`;
                                          // return isNaN(numericValue)
                                          //   ? val
                                          //   : `${numericValue % 1 === 0 ? numericValue.toLocaleString('en-US') : numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
                                        }
                                        if (
                                          [
                                            'gross_living_area_sf',
                                            'land_size',
                                            'year_built',
                                            'bedrooms',
                                            'bathrooms',
                                            'fireplace',
                                          ].includes(zone.adj_key)
                                        ) {
                                          const val = zone.adj_value || '$0.00';
                                          if (val === '$0.00') return val;
                                          const numericValue = parseFloat(
                                            String(val).replace(/[$,]/g, '')
                                          );
                                          return isNaN(numericValue)
                                            ? val
                                            : formatPrice(numericValue);
                                          // : `$${numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                        }
                                        return zone.adj_value || '';
                                      })()}
                                      onFocus={(
                                        e: React.FocusEvent<HTMLInputElement>
                                      ) => {
                                        e.target.select(); // Select all text on focus
                                      }}
                                      onKeyDown={(e: any) => {
                                        if (e.key === 'Backspace') {
                                          const input =
                                            e.target as HTMLInputElement;
                                          const value = input.value;
                                          const cursorPos =
                                            input.selectionStart || 0;
                                          const selectionEnd =
                                            input.selectionEnd || 0;

                                          // If text is selected (like on focus), clear entire value
                                          if (cursorPos !== selectionEnd) {
                                            e.preventDefault();
                                            setValues((old: any) => {
                                              const operatingExpenses = [
                                                ...old.operatingExpenses,
                                              ];
                                              operatingExpenses[i] = {
                                                ...operatingExpenses[i],
                                                adj_value: '$0.00',
                                              };
                                              return {
                                                ...old,
                                                operatingExpenses,
                                              };
                                            });
                                            return;
                                          }

                                          // Allow default backspace behavior for most cases
                                          if (cursorPos > 0) {
                                            return; // Let default backspace work
                                          }

                                          // Only handle special cases when cursor is at the beginning
                                          if (cursorPos === 0) {
                                            e.preventDefault();
                                            let newValue = value.slice(0, -1);

                                            // Handle currency formatting
                                            if (value.startsWith('$')) {
                                              newValue = newValue.replace(
                                                /[$,]/g,
                                                ''
                                              );
                                              if (newValue === '') {
                                                newValue = '0';
                                              }
                                              const formattedValue =
                                                formatPrice(
                                                  parseFloat(newValue)
                                                );

                                              setValues((old: any) => {
                                                const operatingExpenses = [
                                                  ...old.operatingExpenses,
                                                ];
                                                operatingExpenses[i] = {
                                                  ...operatingExpenses[i],
                                                  adj_value: formattedValue,
                                                };
                                                return {
                                                  ...old,
                                                  operatingExpenses,
                                                };
                                              });
                                            }
                                          }
                                        } else if (/^[0-9]$/.test(e.key)) {
                                          // Allow normal input behavior for numbers
                                          // We'll handle the formatting in onChange
                                          return;
                                        } else if (e.key === '-') {
                                          // Handle negative sign logic
                                          const input =
                                            e.target as HTMLInputElement;
                                          const value = input.value;
                                          const cursorPos =
                                            input.selectionStart || 0;

                                          if (
                                            cursorPos === value.length &&
                                            value.startsWith('$')
                                          ) {
                                            e.preventDefault();
                                            const newValue = value.length
                                              ? ('-' + value)
                                                  .replace(/-+/g, '-')
                                                  .replace(/(?!^)-/g, '')
                                              : '-0';

                                            setValues((old: any) => {
                                              const operatingExpenses = [
                                                ...old.operatingExpenses,
                                              ];
                                              const formattedValue = newValue
                                                ? formatPrice(
                                                    parseFloat(
                                                      newValue.replace(
                                                        /[$,]/g,
                                                        ''
                                                      )
                                                    )
                                                  )
                                                : '$0.00';

                                              operatingExpenses[i] = {
                                                ...operatingExpenses[i],
                                                adj_value: formattedValue,
                                              };

                                              return {
                                                ...old,
                                                operatingExpenses,
                                              };
                                            });
                                          }
                                        }
                                      }}
                                      onChange={(e: any) => {
                                        let value = e.target.value;
                                        let isNegative = false;
                                        // if (e.key === '-') {
                                        //   // Allow negative sign at the start
                                        //   value = value.length
                                        //     ? ('-' + value)
                                        //         .replace(/-+/g, '-')
                                        //         .replace(/(?!^)-/g, '')
                                        //     : '-0';
                                        // }
                                        if (value.includes('-')) {
                                          isNegative = true;
                                        }

                                        if (
                                          [
                                            'time',
                                            'location',
                                            'condition',
                                          ].includes(zone.adj_key)
                                        ) {
                                          value = value.replace(/[^0-9.]/g, '');
                                          value = value.replace(/^0+(?!$)/, ''); // remove leading zeros

                                          const parts = value.split('.');
                                          if (
                                            parts.length > 1 &&
                                            parts[1].length > 2
                                          ) {
                                            value =
                                              parts[0] +
                                              '.' +
                                              parts[1].substring(0, 2);
                                          }
                                          if (parseFloat(value) > 100) return;
                                          const prefix = isNegative ? '-' : '';

                                          const formattedValue = value
                                            ? prefix + value + '%'
                                            : prefix + '0%';

                                          setValues((old: any) => {
                                            const operatingExpenses = [
                                              ...old.operatingExpenses,
                                            ];
                                            operatingExpenses[i] = {
                                              ...operatingExpenses[i],
                                              adj_value: formattedValue,
                                              isModified: true,
                                            };
                                            return {
                                              ...old,
                                              operatingExpenses,
                                            };
                                          });
                                        } else if (
                                          [
                                            'gross_living_area_sf',
                                            'land_size',
                                            'year_built',
                                            'bedrooms',
                                            'bathrooms',
                                            'fireplace',
                                          ].includes(zone.adj_key)
                                        ) {
                                          const input =
                                            sanitizeInputDollarSignComps(
                                              e.target.value
                                            );

                                          setValues((old: any) => {
                                            const operatingExpenses = [
                                              ...old.operatingExpenses,
                                            ];
                                            operatingExpenses[i] = {
                                              ...operatingExpenses[i],
                                              adj_value: input || '$0.00',
                                              isModified: true,
                                            };
                                            return {
                                              ...old,
                                              operatingExpenses,
                                            };
                                          });
                                        } else {
                                          // Handle currency input for other fields
                                          const input =
                                            e.target as HTMLInputElement;
                                          const selectionStart =
                                            input.selectionStart || 0;
                                          const selectionEnd =
                                            input.selectionEnd || 0;

                                          // If text is selected (like on focus), replace entire value
                                          if (selectionStart !== selectionEnd) {
                                            // Replace with new input
                                            const newValue =
                                              e.target.value.replace(
                                                /[^0-9]/g,
                                                ''
                                              );
                                            if (newValue) {
                                              const numericValue =
                                                parseFloat(newValue) / 100;
                                              const formattedValue = `$${numericValue.toFixed(2)}`;

                                              setValues((old: any) => {
                                                const operatingExpenses = [
                                                  ...old.operatingExpenses,
                                                ];
                                                operatingExpenses[i] = {
                                                  ...operatingExpenses[i],
                                                  adj_value: formattedValue,
                                                  isModified: true,
                                                };
                                                return {
                                                  ...old,
                                                  operatingExpenses,
                                                };
                                              });
                                              return;
                                            }
                                          } else {
                                            // Build up progressively
                                            const currentValue =
                                              e.target.value || '$0.00';
                                            const currentDigits =
                                              currentValue.replace(/[$,]/g, '');
                                            const newDigits =
                                              currentDigits +
                                              e.target.value.replace(
                                                /[^0-9]/g,
                                                ''
                                              );
                                            const numericValue =
                                              parseFloat(newDigits) / 100;
                                            const formattedValue = `$${numericValue.toFixed(2)}`;

                                            setValues((old: any) => {
                                              const operatingExpenses = [
                                                ...old.operatingExpenses,
                                              ];
                                              operatingExpenses[i] = {
                                                ...operatingExpenses[i],
                                                adj_value: formattedValue,
                                                isModified: true,
                                              };
                                              return {
                                                ...old,
                                                operatingExpenses,
                                              };
                                            });
                                            return;
                                          }

                                          setValues((old: any) => {
                                            const operatingExpenses = [
                                              ...old.operatingExpenses,
                                            ];
                                            operatingExpenses[i] = {
                                              ...operatingExpenses[i],
                                              adj_value: value,
                                              isModified: true,
                                            };
                                            return {
                                              ...old,
                                              operatingExpenses,
                                            };
                                          });
                                        }
                                      }}
                                      style={{
                                        fontSize: '12px',
                                        borderBottomWidth: '1px',
                                        color: 'black',
                                        width: '100%',
                                        minHeight: '19px',
                                        fontWeight: 400,
                                        padding: '0',
                                      }}
                                    />
                                  )}
                                </Grid>
                              </div>
                            );
                          }
                        )
                      ) : (
                        <p className="text-sm font-bold text-gray-500">
                          No operating expenses data
                        </p>
                      )}

                      {/* Basement Modal */}
                      {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white p-12 rounded-lg w-3/5">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-semibold text-2xl w-full text-center mb-5 uppercase">
                                Basement Details
                              </h3>

                              <CloseIcon
                                className="closeIcon text-gray-500 hover:text-gray-700 cursor-pointer"
                                onClick={() => setIsModalOpen(false)}
                              />
                            </div>

                            <div className="flex gap-6 w-full">
                              <div className="mb-4 flex-1">
                                <label className="block text-sm font-medium mb-1 text-[#9e9e9e]">
                                  Basement Finished
                                </label>
                                <input
                                  type="text"
                                  value={finishedValue}
                                  onFocus={(e) => {
                                    e.target.select(); // Select all text on focus
                                  }}
                                  onChange={handleCurrencyChange}
                                  // onChange={(e) =>
                                  //   setFinishedValue(e.target.value)
                                  // }
                                  className="w-full border border-t-0 border-l-0 border-r-0 border-gray-300 rounded-0 focus:outline-none focus:!border-[#0DA1C7] px-0 py-2"
                                />
                              </div>

                              <div className="mb-6 flex-1">
                                <label className="block text-sm font-medium mb-1 text-[#9e9e9e]">
                                  Basement Unfinished
                                </label>
                                <input
                                  type="text"
                                  value={unfinishedValue}
                                  onFocus={(e) => {
                                    e.target.select(); // Select all text on focus
                                  }}
                                  onChange={handleCurrencyChange1}
                                  // onChange={(e) =>
                                  //   setUnfinishedValue(e.target.value)
                                  // }
                                  className="w-full border border-t-0 border-l-0 border-r-0 border-gray-300 rounded-0 focus:outline-none focus:!border-[#0DA1C7] px-0 py-2"
                                />
                              </div>
                            </div>

                            <div className="text-center">
                              <button
                                onClick={handleCalculate}
                                className="px-5 py-3 bg-[#0DA1C7] border-none text-white rounded uppercase font-medium cursor-pointer"
                              >
                                Calculate
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                }}
              />
            </div>
            <div className="p-1">
              {values?.salesCompQualitativeAdjustment.map(
                (field: any, idx: number) => {
                  const isBuildingSize = field.adj_key === 'building_size';
                  const isSidewallHeight = field.adj_key === 'sidewall_height';
                  const isOfficeArea = field.adj_key === 'office_area';

                  return (
                    <div
                      key={field.id}
                      className="px-2 subject-property-input min-h-[20px] hideLabel relative"
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

                            const updatedValue =
                              nStr !== '' ? nStr + '%' : nStr;

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
                            const onlyDigits = e.target.value.replace(
                              /\D/g,
                              ''
                            );
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
                            right: '8px',
                            top: '-2px',
                            color: 'gray',
                            pointerEvents: 'none',
                            // left: '463px',
                          }}
                        >
                          ft.
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
            <p
              className="text-xs h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below text-[#0DA1C7] p-1 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] "
              // onClick={() => handleOpen(item, index)}
              // onClick={handleNote}
            >
              {/* Click to Enter Property Notes */}
            </p>

            <div className="mt-4 px-1 space-y-2 flex flex-col gap-1 pb-2">
              <p
                className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                Overall Adjustment
              </p>
              <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {/* {totalaveragedadjustedpsf?.toLocaleString('en-US', {
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
                      ? ' / Acre'
                      : ' / SF'} */}
              </p>
              <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {totalWeightage.toFixed(2) + '%'}
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
                    ? formatPrice(totalSaleValue)
                    : // ? `$${totalSaleValue.toLocaleString(undefined, {
                      //     minimumFractionDigits: 2,
                      //     maximumFractionDigits: 2,
                      //   })}`
                      APPROACHESENUMS.NA
                  : comparisonBasis === 'Unit'
                    ? totalSaleValueUnit
                      ? formatPrice(totalSaleValueUnit)
                      : // ? `$${totalSaleValueUnit.toLocaleString(undefined, {
                        //     minimumFractionDigits: 2,
                        //     maximumFractionDigits: 2,
                        //   })}`
                        APPROACHESENUMS.NA
                    : compsType === 'land_only'
                      ? totalSalesUnitOfSquareftOrACre
                        ? formatPrice(totalSalesUnitOfSquareftOrACre)
                        : // ? `$${totalSalesUnitOfSquareftOrACre.toLocaleString(
                          //     undefined,
                          //     {
                          //       minimumFractionDigits: 2,
                          //       maximumFractionDigits: 2,
                          //     }
                          //   )}`
                          APPROACHESENUMS.NA
                      : FinalResult
                        ? formatPrice(FinalResult)
                        : // ? `$${FinalResult.toLocaleString(undefined, {
                          //     minimumFractionDigits: 2,
                          //     maximumFractionDigits: 2,
                          //   })}`
                          APPROACHESENUMS.NA}
              </p>
            </div>
          </div>
        </div>
        {!className || !open
          ? values?.tableData?.map((item: any, index: any) => (
              <ResidentialSalesCompCard
                key={item.id}
                index={index}
                handleChange={handleChange}
                item={item}
                values={values}
                appraisalData={appraisalData}
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
                handleSubmitForOtherAmenities={handleSubmitForOtherAmenities}
                // handleSubmit={handleSubmit}
                passcomparabilityData={passcomparabilityData}
                recalcBasementVersion={recalcBasementVersion}
              />
            ))
          : values?.tableData?.map((item: any, index: any) =>
              index === indexType ? (
                <div key={item.id}>
                  <ResidentialSalesCompCard
                    appraisalData={appraisalData}
                    index={index}
                    handleChange={handleChange}
                    item={item}
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
                    handleSubmitForOtherAmenities={
                      handleSubmitForOtherAmenities
                    }
                    subOption={quanitativeApproaachItems}
                    indexType={indexType}
                    setIndexType={setIndexType}
                    setClassName={setClassName}
                    handleSubmit={handleSubmit}
                    landDimensions={landDimensions}
                    passcomparabilityData={passcomparabilityData}
                    recalcBasementVersion={recalcBasementVersion}
                  />
                </div>
              ) : null
            )}

        {values?.tableData.length == 4 ? null : (
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
      <ResidentialSubjectPropertyAdjustmentNoteModal
        open={noteModalOpen}
        setNoteModalOpen={setNoteModalOpen}
        editorText={setEditorValue}
        handleSave={handleSave}
        salesNote={editorValue}
      />
    </ResidentialMenuOptions>
  );
};

export default ResidentialSalesApproach;

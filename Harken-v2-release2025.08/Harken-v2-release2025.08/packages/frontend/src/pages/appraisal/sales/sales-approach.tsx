import React, { useEffect, useState } from 'react';
import AppraisalMenu from '../set-up/appraisa-menu';
import { Grid, Typography } from '@mui/material';
import { useGet } from '@/hook/useGet';
import { FieldArray, useFormikContext } from 'formik';
import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
import SelectTextField from '@/components/styles/select-input';
import { RequestType, useMutate } from '@/hook/useMutate';
import CommonButton from '@/components/elements/button/Button';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@mui/material';
import defaultPropertImage from '../../../images/default-placeholder.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { options } from '@/pages/comps/comp-form/fakeJson';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import loadingImage from '../../../images/loading.png';
import SalesApproachNote from './salesApproachNote';
import CompCard from './compsCard';
import {
  AllTypeJson,
  retailOptions,
  officeOptions,
  industrialOptions,
  multifamilyOptions,
  hospitalityOptions,
  specialOptions,
  residentialOptions,
  conditionOptions,
  topographyOptions,
  landTypeOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { AppraisalEnum } from '../set-up/setUpEnum';
import SalesCompsForm from './sales-table-comps';
import UploadSalesCompsModal from './upload-comps-from-sales';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import { capitalizeWords, formatPrice } from '@/utils/sanitize';
import { propertyTypeOptions } from '@/pages/my-profile/significant-transaction/select-option/Select';
import { ListingHeaderEnum,
  ListingEnum,
  CreateCompsEnum,
  BuildingDetailsEnum,
  MenuOptionsEnum,
  SortingEnum,
  ValidationStatusEnum,
  LocalStorageKeysEnum,
  FieldNamesEnum,
  CustomFieldValuesEnum,
  PayloadFieldsEnum,
  UnitsEnum,
  UploadStatusEnum,
 } from '@/pages/comps/enum/CompsEnum';
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
    total += parseFloat(exp.adj_value);
  });

  return { total, expenses };
};
// Function to format the values
let adjFactores: any;
let QualitativeadjFactores: any;
// let comparativeFActors: any;

const SalesApproach: React.FC = () => {
  type DropdownField = {
    id: number;
    value: string;
    isTextField: boolean;
    customValue: any;
    input: any;
    placeholder: string;
  };
  const calculateCompData = ({ total, weight, comp, appraisalData }: any) => {
    const price_square_foot = comp.price_square_foot;
    const bedPerSqFit =
      comp.sale_price === ListingEnum.ZERO && comp.total_beds === ListingEnum.ZERO
        ? ListingEnum.ZERO
        : comp.total_beds === ListingEnum.ZERO
          ? ListingEnum.ZERO
          : comp.sale_price / comp.total_beds;

    const bedUnitPerSqFt =
      comp.total_units === ListingEnum.ZERO ? ListingEnum.ZERO : comp.sale_price / comp.total_units;
    comp.total_units === ListingEnum.ZERO ? ListingEnum.ZERO : comp.sale_price / comp.total_units;
    const finalBed =
      appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR
        ? total + bedPerSqFit
        : (total / ListingEnum.HUNDRED) * bedPerSqFit + bedPerSqFit;

    const finalUnits =
      appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR
        ? total + bedUnitPerSqFt
        : (total / ListingEnum.HUNDRED) * bedUnitPerSqFt + bedUnitPerSqFt;
    const updatedAdjustedPsf =
      appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR
        ? total + price_square_foot
        : (total / ListingEnum.HUNDRED) * price_square_foot + price_square_foot;
    // const finalBed = (total / ListingEnum.HUNDRED) * bedPerSqFit + bedPerSqFit;

    // const finalUnits = (total / ListingEnum.HUNDRED) * bedUnitPerSqFt + bedUnitPerSqFt;
    // const updatedAdjustedPsf =
    // (total / ListingEnum.HUNDRED) * price_square_foot + price_square_foot;
    const finalAdjustePricePerAcre =
      (comp.sale_price / comp?.land_size) * ListingEnum.SQFT_ACRE;

    const updatedAverageAdjustedPsf = (updatedAdjustedPsf * weight) / ListingEnum.HUNDRED;
    const bedAveragedAdjustedPsf = (finalBed * weight) / ListingEnum.HUNDRED;
    const unitAveragedAdjustedPsf = (finalUnits * weight) / ListingEnum.HUNDRED;

    const updatedBlendedPsf = (price_square_foot * weight) / ListingEnum.HUNDRED;
    const bedUpdatedBlendedPsf = (bedPerSqFit * weight) / ListingEnum.HUNDRED;
    const unitUpdatedBlendedPsf = (bedPerSqFit * weight) / ListingEnum.HUNDRED;

    return {
      adjusted_psf:
        landDimensions === UnitsEnum.ACRE
          ? finalAdjustePricePerAcre
          : comp?.comparison_basis === BuildingDetailsEnum.Bed
            ? finalBed
            : comp?.comparison_basis === BuildingDetailsEnum.UNIT
              ? finalUnits
              : updatedAdjustedPsf,
      averaged_adjusted_psf:
        comp?.comparison_basis == BuildingDetailsEnum.Bed
          ? bedAveragedAdjustedPsf
          : comp.comparison_basis === BuildingDetailsEnum.UNIT
            ? unitAveragedAdjustedPsf
            : updatedAverageAdjustedPsf,
      blended_adjusted_psf:
        comp?.comparison_basis == BuildingDetailsEnum.Bed
          ? bedUpdatedBlendedPsf
          : comp.comparison_basis === BuildingDetailsEnum.UNIT
            ? unitUpdatedBlendedPsf
            : updatedBlendedPsf,
      weight,
      total,
    };
  };
  const location = useLocation();
  const updatedCompss = location.state?.updatedComps;
  const updatedCompssales = location.state?.updatedCompssales;
  const [hasProcessedComps, setHasProcessedComps] = useState(false);
  const [hasProcessedSalesComps, setHasProcessedSalesComps] = useState(false);

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
  const [open] = useState(false);
  const [hasIncomeType, setHasIncomeType] = useState(false);
  const [hasRentRollType, setHasRentRollType] = useState(false);
  const [loader, setLoader] = useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [salesNote, setSalesNote] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [className, setClassName] = useState(false);
  const [indexType, setIndexType] = useState<any>();
  const [compsLength, setCompsLength] = useState('');

  const [appraisalType, setAppraisalType] = useState<any>();
  const [maxUnitCount, setMaxUnitCount] = useState<number>(0);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [overallComparabilityData, setOverallComparabilityData] = useState('');
  console.log('appraisaltype', appraisalType);
  console.log(overallComparabilityData);
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
  const uploadComps = () => {
    localStorage.setItem(LocalStorageKeysEnum.COMPS_LENGTH_SALES_APPRAISAL, compsLength);
    // Preserve the current compsType to prevent automatic change to 'building_with_land'
    localStorage.setItem(LocalStorageKeysEnum.PRESERVED_ACTIVE_TYPE, compsType || MenuOptionsEnum.BUILDING_WITH_LAND);

    navigate(`/appraisal/upload-sales-comps?id=${id}&salesId=${salesId}`, {
      state: {
        operatingExpenses: values.operatingExpenses,
        salesCompQualitativeAdjustment: values.salesCompQualitativeAdjustment,
        appraisalSpecificAdjustment: values.appraisalSpecificAdjustment,
      },
    });
  };
  const [comparativeFactors, setComparativeFactors] = useState<any[]>([]);
  console.log('filtereSalesdData', filtereSalesdData, hasSaleType);
  const navigate = useNavigate();

  // api for get/appraisals
  const {
    data: areaInfoData,
    refetch,
    isLoading,
  } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: {
      enabled: Boolean(salesId),
      refetchOnWindowFocus: false,
      onSuccess: (data: any) => {
        const comparisonBasis = data?.data?.data?.comparison_basis;
        const landDimension = data?.data?.data?.land_dimension;
        const compsType = data?.data?.data?.comp_type;
        const analysisType = data?.data?.data?.analysis_type;
        const mapData = data?.data?.data?.appraisal_approaches;
        const subjectCompType = data?.data?.data?.comp_type;
        const appraisalType = data?.data?.data?.appraisal_type;

        // Map sales approach name
        mapData &&
          mapData.map((item: any) => {
            if (item.id == salesId) {
              setSalesApproachName(item.name);
            }
          });

        // Find and set cover image URL
        const coverImage = data?.data?.data?.appraisal_files?.find(
          (file: any) => file.title === ListingEnum.COVER
        );
        if (coverImage) {
          const imageUrl = coverImage.dir;
          setCoverImageUrl(imageUrl);
        }

        // Fetch compos data
        if (salesId) {
          fetchComposData(values, setValues);
        } else {
          console.log(ValidationStatusEnum.ERROR);
        }

        // Set various state values
        setComparisonBasis(comparisonBasis);
        localStorage.setItem(LocalStorageKeysEnum.COMPARISON_BASIS, comparisonBasis);

        localStorage.setItem(LocalStorageKeysEnum.APPRAISAL_TYPE, appraisalType);
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
              adjusted_cost: ListingEnum.ZERO,
              adjusted_psf: ListingEnum.ZERO,
              depreciation: ListingEnum.ZERO,
              type: findDistributionLabel(AllTypeJson),
              zoning_id: ele?.id,
              sub_zone_custom: '',
              sf_area: ele?.sq_ft,
              isDisabled: true,
              structure_cost: ListingEnum.ZERO,
              depreciation_amount: ListingEnum.ZERO,
            };
          });
          setAreaInfoData1(type_sqft);
        }

        // Find and set the maximum unit count
        const propertyUnits = data?.data?.data?.property_units || [];
        const maxUnitCount = propertyUnits.reduce(
          (max: number, unit: any) => Math.max(max, unit?.sq_ft || ListingEnum.ZERO),
          ListingEnum.ZERO
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
        (item: any) => item.type === ListingEnum.SALES_COMP_QUALITATIVE_ADJUSTMENT
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
        (item: any) => item.type === ListingEnum.SALES_COMP_QUANTITATIVE_ADJUSTMENT
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
    queryKey: 'appraisals/update-position',
    endPoint: `appraisals/update-position/${id}`,
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
  // for sales-navigation
  useEffect(() => {
    if (
      areaInfoData?.data?.data?.appraisal_approaches &&
      !areaInfoData.isStale
    ) {
      const updateData = areaInfoData.data.data.appraisal_approaches;
      const salesApproaches = updateData.filter(
        (item: { type: string }) => item.type === PayloadFieldsEnum.SALE
      );
      setHasSaleType(salesApproaches.length > ListingEnum.ZERO);
      setFilteredSalesData(salesApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === PayloadFieldsEnum.RENT_ROLL
      );
      setHasRentRollType(rentRollApproaches.length > ListingEnum.ZERO);
      setFilteredRentRollData(rentRollApproaches);

      const incomeApproaches = updateData.filter(
        (item: { type: string }) => item.type === BuildingDetailsEnum.INCOME
      );
      setHasIncomeType(incomeApproaches.length > ListingEnum.ZERO);
      setFilteredData(incomeApproaches);
    }
  }, [areaInfoData?.data?.data?.appraisal_approaches]);

  const appraisalData = areaInfoData?.data.data || {};
  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[appraisalData.state];
  const zonningsData = areaInfoData?.data?.data?.zonings || [];

  const appraisalApproach =
    areaInfoData?.data?.data?.appraisal_approaches?.find(
      (approach: any) => (salesId ? approach.id == parseFloat(salesId) : false)
      //  && approach.appraisal_sales_approach
    );

  const appraisalSalesApproachId =
    appraisalApproach?.appraisal_sales_approach?.id || null;

  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `appraisals/get-sales-approach?appraisalId=${id}&appraisalApproachId=${salesId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;
      setCompsLength(compsArr?.length || ListingEnum.ZERO);

      localStorage.setItem('compsLengthsalesappraisal', compsArr.length);
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
      const formattedOperatingExpenses =
        response?.data?.data?.data.subject_property_adjustments.map(
          ({ adj_key, adj_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: adj_value ? adj_value + '%' : ListingEnum.ZERO,
            adj_key,
            adj_value,
          })
        );

      const formattedQualitativeExpenses =
        response?.data?.data?.data.subject_qualitative_adjustments.map(
          ({ adj_key, adj_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: adj_value ? adj_value : ListingEnum.SIMILAR_,
            adj_key,
            adj_value,
          })
        );

      const formattedComparativeAdjustment =
        response?.data?.data?.data.sales_comparison_attributes.map(
          ({ comparison_key, comparison_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: comparison_key
              ? comparison_value
              : comparison_value,
            comparison_key,
            comparison_value,
          })
        );

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
                : newValue?.adj_value || ListingEnum.ZERO, // Use the value as-is or provide a fallback to 0
            customType: isCustom,
          };
        });

        const formattedQualitativeApproach = formattedQualitativeExpenses.map(
          (oe: any) => {
            const newValue = c.comps_qualitative_adjustments.find(
              (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
            );
            const isCustom = !formattedDropdownOptions.some(
              (option: { value: any }) => option.value === newValue.adj_value
            );
            return {
              ...oe,
              adj_key: newValue.adj_key,
              adj_value:
                typeof newValue?.adj_value === 'string' // Check if adj_value is a string
                  ? newValue.adj_value.replace(/_/g, ' ') // Replace underscores with spaces
                  : String(newValue?.adj_value || ListingEnum.SIMILAR_),
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
        if (a.sale_status === UploadStatusEnum.PENDING && b.sale_status !== UploadStatusEnum.PENDING) {
          return -1;
        }
        if (a.sale_status !== UploadStatusEnum.PENDING && b.sale_status === UploadStatusEnum.PENDING) {
          return 1;
        }

        // Step 2: Within Pending, sort by date_sold
        if (a.sale_status === UploadStatusEnum.PENDING && b.sale_status === UploadStatusEnum.PENDING) {
          return a.business_name.localeCompare(b.business_name);
        }

        // Step 3: Sort Closed items after Pending
        if (a.sale_status === ValidationStatusEnum.CLOSED && b.sale_status !== ValidationStatusEnum.CLOSED) {
          return -1;
        }
        if (a.sale_status !== ValidationStatusEnum.CLOSED && b.sale_status === ValidationStatusEnum.CLOSED) {
          return 1;
        }

        // Step 4: Within Closed, sort alphabetically by business_name
        if (a.sale_status === ValidationStatusEnum.CLOSED && b.sale_status === ValidationStatusEnum.CLOSED) {
          return (
            (new Date(b.date_sold as any) as any) -
            (new Date(a.date_sold as any) as any)
          );
        }

        // Step 5: For any other sale_status, keep original order
        return ListingEnum.ZERO;
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
      console.error(ListingEnum.ERROR_FETCHIN_DATA, error);
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
        LocalStorageKeysEnum.SALES_APPROACH_VALUE_APPRAISAL,
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

  let totalaveragedadjustedpsf = 0;

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
        const calculatedValue = (sqFt * weightSf) / ListingEnum.HUNDRED;

        return total + calculatedValue;
      }
      return total;
    }, ListingEnum.ZERO);
  };

  const result = calculateTotalZoningValue(zonningsData);
  const calculateTotalBeds = (data: any) => {
    return data.reduce((total: any, item: any) => total + (item.bed || ListingEnum.ZERO), ListingEnum.ZERO);
  };
  const totalBeds = calculateTotalBeds(zonningsData);

  const calculateTotalUnits = (data: any) => {
    return data.reduce((total: any, item: any) => total + (item.unit || ListingEnum.ZERO), ListingEnum.ZERO);
  };
  const totalUnits = calculateTotalUnits(zonningsData);

  totalaveragedadjustedpsf = parseFloat(totalaveragedadjustedpsf.toFixed(2));

  const FinalResult = result * totalaveragedadjustedpsf;
  const totalSalesUnitOfSquareftOrACre =
    totalaveragedadjustedpsf * appraisalData.land_size;

  let totalWeightage = 0;

  values.tableData.forEach((comp: { weight: string }) => {
    if (comp.weight) {
      totalWeightage += parseFloat(comp.weight);
    }
  });
  const comps = values.tableData?.map((item: any, index: number) => {
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
    console.log('item', values);
    return {
      ...(appraisalSalesApproachId ? { id: item.id } : {}),

      comp_id: comp_id,

      order: index + 1,
      overall_comparability: item.overall_comparability
        ? item.overall_comparability
        : ListingEnum.SIMILAR,
      adjustment_note: item?.adjustment_note,
      total_adjustment: item?.total,
      adjusted_psf: item.adjusted_psf,
      weight: parseFloat(item.weight),
      blended_adjusted_psf: item.blended_adjusted_psf,
      averaged_adjusted_psf: item.averaged_adjusted_psf,
      comps_adjustments: comps_adjustments,
      comps_qualitative_adjustments: comps_qualitative_adjustments,
    };
  });

  const salesApproachData = {
    ...(appraisalSalesApproachId ? { id: appraisalId } : {}),
    //   'id':appraisalId,
    appraisal_approach_id: salesId ? parseFloat(salesId) : null,

    averaged_adjusted_psf: totalaveragedadjustedpsf,
    sales_approach_value: FinalResult,
    weight: parseFloat(totalWeightage.toString()),
    note: salesNote,
    subject_property_adjustments: subject_property_adjustments,
    subject_qualitative_adjustments: subject_qualitative_adjustments,
    sales_comparison_attributes: sales_comparison_attributes,
    sales_approach_indicated_val: FinalResult,
    comps: comps,
  };

  const finalData = {
    appraisal_id: id ? parseFloat(id) : null,
    sales_approach: salesApproachData,
  };
  const mutation = useMutate<any, any>({
    queryKey: 'save-sale-approach',
    endPoint: 'appraisals/save-sales-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'save-sale-approach',
    endPoint: 'appraisals/update-sales-approach',
    requestType: RequestType.POST,
  });
  const handleAddNewComp = () => {
    localStorage.setItem(LocalStorageKeysEnum.CHECK_STATUS, LocalStorageKeysEnum.SALES);
    localStorage.removeItem(LocalStorageKeysEnum.SELECTED_TOGGLE);
    localStorage.removeItem(LocalStorageKeysEnum.VIEW);
    localStorage.setItem(LocalStorageKeysEnum.COMPS_LENGTH_SALES_APPRAISAL, compsLength);
    localStorage.setItem(LocalStorageKeysEnum.COMPARISON_BASIS_VIEW, comparisonBasis);

    // setIsOpen(true);
    // localStorage.setItem('activeType', 'building_with_land');
    navigate(`/filter-comps?id=${id}&approachId=${salesId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };

  const handleLinkExistingComps = () => {
    navigate(`/sales/create-comp?id=${id}&approachId=${salesId}`, {
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
        console.log('gotid', appraisalId);
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
            comps: finalData.sales_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        setLoader(false);
        toast.success(response.data.message);
        navigate(`/sales-comps-map?id=${id}&salesId=${salesId}`);
      }
    } catch (error) {
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
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
            comps: finalData.sales_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
        refetch();
      }

      if (response && response.data && response.data.message) {
        // toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
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
            comps: finalData.sales_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        navigate(`/update-comps/${itemId}/${id}/sales/${salesId}`);
      }
    } catch (error) {
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
      }, ListingEnum.TWO_THOUSAND);
    }
  }, [updatedCompss, hasProcessedComps]);

  const passCompsDataToFilterSales = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      // Check if we're at the 4 comp limit
      if (oldValues.tableData.length >= ListingEnum.FOUR) {
        toast.error('Maximum of 4 comps allowed. Cannot add more comps.');
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
        quantitativeAdjustments: values.salesCompQualitativeAdjustment.map(
          (qa: any) => ({
            ...qa,
            adj_value: ListingEnum.SIMILAR_,
          })
        ),
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
      }, ListingEnum.ZERO);

      // Call submit with updated comps after state update
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

  useEffect(() => {
    if (updatedCompssales && !hasProcessedSalesComps) {
      setTimeout(() => {
        passCompsDataToFilterSales(updatedCompssales);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
        setHasProcessedSalesComps(true);
      }, ListingEnum.TWO_THOUSAND);
    }
  }, [updatedCompssales, hasProcessedSalesComps]);
  console.log('appraisalApproach', appraisalSalesApproachId || appraisalId);

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

      const updatedFinalResult =
        updatedTotalAveragedAdjustedPsf * appraisalData.building_size;

      // Create updated comps data
      const updatedCompsData = updatedComps.map((item: any, index: number) => {
        const comps_adjustments =
          item.expenses?.map((exp: any) => ({
            adj_key: exp.adj_key,
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
          adjustment_note: item?.adjustment_note,
          total_adjustment: item?.total,
          adjusted_psf: item.adjusted_psf,
          weight: parseFloat(item.weight),
          blended_adjusted_psf: item.blended_adjusted_psf,
          averaged_adjusted_psf: item.averaged_adjusted_psf,
          comps_adjustments: comps_adjustments,
          comps_qualitative_adjustments: comps_qualitative_adjustments,
        };
      });

      const updatedSalesApproachData = {
        ...(appraisalSalesApproachId ? { id: appraisalSalesApproachId } : {}),
        appraisal_approach_id: salesId ? parseFloat(salesId) : null,
        averaged_adjusted_psf: updatedTotalAveragedAdjustedPsf,
        sales_approach_value: updatedFinalResult,
        weight: parseFloat(updatedTotalWeightage.toString()),
        note: salesNote,
        subject_property_adjustments: subject_property_adjustments,
        subject_qualitative_adjustments: subject_qualitative_adjustments,
        sales_comparison_attributes: sales_comparison_attributes,
        sales_approach_indicated_val: updatedFinalResult,
        comps: updatedCompsData,
      };

      const updatedFinalData = {
        appraisal_id: id ? parseFloat(id) : null,
        sales_approach: updatedSalesApproachData,
      };

      let response;
      if (appraisalSalesApproachId) {
        console.log('passcompif', appraisalId);
        response = await mutations.mutateAsync(updatedFinalData);
        fetchComposData(values, setValues);
      } else {
        const modifiedPayload = {
          ...updatedFinalData,
          sales_approach: {
            ...updatedFinalData.sales_approach,
            comps: updatedFinalData.sales_approach.comps,
          },
        };
        response = await mutation.mutateAsync(modifiedPayload);
        refetch();
        fetchComposData(values, setValues);
      }

      if (response && response.data && response.data.message) {
        // toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };

  const passCompsDataToFilter = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = ListingEnum.HUNDRED / totalComps.length;
      let count = 0;
      const updatedComps = totalComps.map((comp) => {
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
            comps: finalData.sales_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
        refetch();
      }
    } catch (error) {
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };

  const passCompsDataToFilter1 = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = ListingEnum.HUNDRED / totalComps.length;
      let count = 0;

      // Custom sorting logic
      const sortedComps = totalComps.sort((a, b) => {
        // Step 1: Sort Pending items first
        if (a.sale_status === UploadStatusEnum.PENDING && b.sale_status !== UploadStatusEnum.PENDING) {
          return -1;
        }
        if (a.sale_status !== UploadStatusEnum.PENDING && b.sale_status === UploadStatusEnum.PENDING) {
          return 1;
        }

        // Step 2: Within Pending, sort by date_sold
        if (a.sale_status === UploadStatusEnum.PENDING && b.sale_status === UploadStatusEnum.PENDING) {
          return a.business_name.localeCompare(b.business_name);
        }

        // Step 3: Sort Closed items after Pending
        if (a.sale_status === ValidationStatusEnum.CLOSED && b.sale_status !== ValidationStatusEnum.CLOSED) {
          return -1;
        }
        if (a.sale_status !== ValidationStatusEnum.CLOSED && b.sale_status === ValidationStatusEnum.CLOSED) {
          return 1;
        }

        // Step 4: Within Closed, sort alphabetically by business_name
        if (a.sale_status === ValidationStatusEnum.CLOSED && b.sale_status === ValidationStatusEnum.CLOSED) {
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
        if (sortedComps.length === ListingEnum.THREE && count === sortedComps.length) {
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

  // const capitalizeWords = (str: string | null | undefined) => {
  //   if (!str) {
  //     return '';
  //   }

  //   return str
  //     .split(/[_\s]+/)
  //     .map(
  //       (word: string) =>
  //         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter
  //     )
  //     .join(' ');
  // };

  const getLabelFromValue = (value: any) => {
    if (!value || value === ListingEnum.SELECT_A_SUBTYPE) {
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

  const formatNumberAcre = (value: number | string): string => {
    if (!value || isNaN(Number(value))) {
      return 'N/A'; // Return 'N/A' if the value is not a valid number
    }
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > ListingEnum.HUNDRED);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, ListingEnum.THREE_HUNDRED);

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
  // const editorText = (event: any) => {
  //   setSalesNote(event);
  // };
  // const handleSave = () => {
  //   handleSaveAdjustmentNote();
  //   setNoteModalOpen(false);
  // };

  const handleSave = () => {
    // handleSaveAdjustmentNote();
    setSalesNote(editorValue); // Save the current text
    setNoteModalOpen(false); // Close modal
  };

  const passcomparabilityData = (event: any) => {
    setOverallComparabilityData(event);
  };
  return (
    <AppraisalMenu>
      {openComps && (
        <UploadSalesCompsModal
          open={openComps}
          onClose={() => setCompsOpen(false)}
          setCompsModalOpen={setCompsModalOpen}
          setCompsData={setCompsData}
          compsLength={compsLength}
          compsData={compsData ?? []} // Avoid passing null where an array is needed
        />
      )}
      {compsModalOpen && (
        <SalesCompsForm
          passCompsData={passCompsDataToFilter1}
          open={compsModalOpen}
          compsLength={compsLength}
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
          {CreateCompsEnum.SALES_COMPS} <span>({salesApproachName})</span>
        </Typography>

        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">
            {CreateCompsEnum.VALUE_OF_PROPERTY}
          </span>
        </div>
      </div>
      {/* <div className="overflow-auto h-[calc(100vh-280px)]"> */}
      <div className="flex flex-wrap items-start space-x-2 mb-20 xl:px-[44px] px-[15px]">
        <div className="flex flex-col w-[15.5%]">
          <h3 className="px-4 py-5 text-base capitalize invisible font-semibold text-ellipsis overflow-hidden h-16">
            {CreateCompsEnum.SUBJECT_PROPERTY}
          </h3>
          <div className="lg:p-4 p-2 !pt-0 bg-white flex-1">
            <div className="max-w-full h-[160px]">
              <div className="w-full h-[160px] bg-white-200"></div>
            </div>
            <div className="p-2">
              <p className="text-sm font-bold invisible flex h-[20px]">
                {CreateCompsEnum.SALES_PRICE}
              </p>
              <h2 className="text-gray-500  text-xs font-bold mt-0 min-h-[40px] mt-2 overflow-hidden whitespace-nowrap text-ellipsis">
                {CreateCompsEnum.LOCATION}
              </h2>
              <p className="pb-1 text-xs font-bold">{CreateCompsEnum.DATE_SOLD}</p>
              {localStorage.getItem('activeType') === 'building_with_land' && (
                <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                  {CreateCompsEnum.PROPERTY_TYPE}
                </p>
              )}
              {localStorage.getItem('activeType') === 'land_only' && (
                <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                  {CreateCompsEnum.LAND_TYPE}
                </p>
              )}
            </div>
            <div className="p-1 pb-[1px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
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
                        {CreateCompsEnum.NO_APPRAISAL}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5] py-1 mt-[1px]">
              <FieldArray
                name="operatingExpenses"
                render={() => (
                  <>
                    {values.operatingExpenses &&
                    values.operatingExpenses.length > ListingEnum.ZERO ? (
                      values.operatingExpenses.map((zone: any, i: number) => (
                        <div
                          className="flex items-center quantitate-items justify-between gap-1 h-[20px]"
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
                                                  input === CustomFieldValuesEnum.TYPE_MY_OWN_LOWER,
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
                                  zone.adj_value === CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
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
                                  minHeight: '36px',
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
                                                  CustomFieldValuesEnum.TYPE_MY_OWN_LOWER ||
                                                !adjFactores.some(
                                                  (option: any) =>
                                                    option.value ===
                                                    expense.adj_key
                                                );

                                              const newAdjKey = isTypeMyOwn
                                                ? ''
                                                : CustomFieldValuesEnum.TYPE_MY_OWN_LOWER;
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
                                              ListingEnum.ZERO
                                            );

                                          const weight = comp.weight;
                                          const calculatedCompData =
                                            calculateCompData({
                                              total: newTotal,
                                              weight,
                                              comp,
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

                              {i === values.operatingExpenses.length - ListingEnum.ONE && (
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
                        {CreateCompsEnum.NO_OPERATING_EXPENSES}
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
                  values.salesCompQualitativeAdjustment.length > ListingEnum.ZERO ? (
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
                                    zone.adj_value === CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
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
                                                    CustomFieldValuesEnum.TYPE_MY_OWN_LOWER ||
                                                  !QualitativeadjFactores.some(
                                                    (option: any) =>
                                                      option.value ===
                                                      expense.adj_key
                                                  );

                                                const newAdjKey = isTypeMyOwn
                                                  ? ''
                                                  : CustomFieldValuesEnum.TYPE_MY_OWN_LOWER;

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
                                    ListingEnum.ONE && (
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
                      {CreateCompsEnum.NO_SALES_COMP_DATA}
                    </p>
                  )}
                </>
              )}
            />

            {/* //-----------------------------------------------------------------------------------? */}
            <div className="border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] px-1 flex items-center  h-10 mt-[3px]">
              <p className="text-xs font-bold border-below">{CreateCompsEnum.NOTES}</p>
            </div>
            <div className="mt-2 flex flex-col gap-[2px]">
              <p className="text-xs font-semibold italic h-[28px] flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.OVERALL_COMPARABILITY}
              </p>
              <p className="text-xs h-[18px] !m-0 font-semibold italic text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>

              {comparisonBasis === 'Bed' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_PRICE_PER_BED}
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_PRICE_PER_UNIT}
                </p>
              ) : analysisType === '$/Acre' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_PRICE_PER_ACRE}
                </p>
              ) : (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_PRICE_PER_SF}
                </p>
              )}
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.WEIGHTING}
              </p>

              {comparisonBasis === 'Bed' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.SALES_VALUE_PER_BED}
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.SALES_VALUE_PER_UNIT}
                </p>
              ) : analysisType === '$/Acre' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.SALES_VALUE_PER_ACRE}
                </p>
              ) : (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.SALES_VALUE_PER_SF}
                </p>
              )}

              {comparisonBasis === 'Bed' || comparisonBasis === 'Unit' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.AVERAGE_ADJUSTED_PRICE_PER_SF}
                </p>
              ) : null}
              <p className="text-base h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap uppercase">
                {CreateCompsEnum.TOTAL_SALES_VALUE}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[15.5%]">
          <h3 className="py-5 text-base capitalize font-semibold text-ellipsis overflow-hidden ">
            {CreateCompsEnum.SUBJECT_PROPERTY}
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
                {CreateCompsEnum.SALES_PRICE}
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
              <div>
                {localStorage.getItem('activeType') ===
                  'building_with_land' && (
                  // <p className="text-xs font-bold  flex h-[20px] text-gray-500">
                  <p className="text-gray-500 text-xs font-bold pb-1 overflow-hidden whitespace-nowrap text-ellipsis">
                    {getLabelFromValue(appraisalData?.zonings[0]?.zone)} /{' '}
                    {getLabelFromValue(appraisalData?.zonings[0]?.sub_zone)}
                  </p>
                )}
                {localStorage.getItem('activeType') === 'land_only' && (
                  <p className="text-xs font-bold  flex h-[20px] text-gray-500">
                    {getLabelFromValue(appraisalData?.land_type)}
                  </p>
                )}
              </div>
            </div>
            <div className="p-1 space-y-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              {values.appraisalSpecificAdjustment?.length > ListingEnum.ZERO
                ? values.appraisalSpecificAdjustment.map(
                    (adjustments: any, index: number) => {
                      const isStreetAddress =
                        adjustments.comparison_key === SortingEnum.STREET_ADDRESS;
                      const isLandSizeSF =
                        adjustments.comparison_key === SortingEnum.LAND_SIZE_SF;
                      const isLandSizeAcre =
                        adjustments.comparison_key === SortingEnum.LAND_SIZE_ACRE;
                      const isCityState =
                        adjustments.comparison_key === SortingEnum.CITY_STATE;
                      const isDateSold =
                        adjustments.comparison_key === FieldNamesEnum.DATE_SOLD;
                      const isYearBuiltRemodeled =
                        adjustments.comparison_key ===
                        SortingEnum.YEAR_BUILT_YEAR_REMODELED;
                      const isBuildingSize =
                        adjustments.comparison_key === SortingEnum.BUILDING_SIZE;
                      const isSalePrice =
                        adjustments.comparison_key === SortingEnum.SALE_PRICE;
                      const isPricePerSF =
                        adjustments.comparison_key === SortingEnum.PRICE_PER_SF;
                      const isQualityCondition =
                        adjustments.comparison_key === SortingEnum.QUALITY_CONDITION;
                      const isUnit = adjustments.comparison_key === SortingEnum.UNIT;
                      const isHighestBestUse =
                        adjustments.comparison_key === SortingEnum.HIGHEST_BEST_USE;
                      const isBusinessName =
                        adjustments.comparison_key === SortingEnum.BUSINESS_NAME;
                      const isEffectiveAge =
                        adjustments.comparison_key === SortingEnum.EFFECTIVE_AGE;
                      const isSalesPrice =
                        adjustments.comparison_key === SortingEnum.SALE_PRICE;
                      const isCapRate =
                        adjustments.comparison_key === SortingEnum.CAP_RATE;
                      const isUnitMix =
                        adjustments.comparison_key === SortingEnum.UNIT_MIX;
                      const isPricePerUnit =
                        adjustments.comparison_key === SortingEnum.PRICE_PER_UNIT;
                      const isTopography =
                        adjustments.comparison_key === SortingEnum.TOPOGRAPHY;
                      const isUtilitiesSelect =
                        adjustments.comparison_key === SortingEnum.UTILITIES_SELECT;
                      const isZoningType =
                        adjustments.comparison_key === SortingEnum.ZONING_TYPE;
                      const isCityCounty =
                        adjustments.comparison_key === SortingEnum.CITY_COUNTY; // New condition

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
                            {isStreetAddress
                              ? appraisalData.street_address
                              : isLandSizeSF
                                ? appraisalData.land_size != null
                                  ? `${
                                      landDimensions === 'ACRE'
                                        ? Math.round(
                                            appraisalData.land_size * ListingEnum.SQFT_ACRE
                                          ).toLocaleString() // Convert to integer
                                        : parseInt(
                                            appraisalData.land_size,
                                            10
                                          ).toLocaleString() // No decimals for SF
                                    }`
                                  : 'N/A'
                                : isLandSizeAcre
                                  ? appraisalData.land_size != null
                                    ? `${
                                        landDimensions === 'SF'
                                          ? formatNumberAcre(
                                              (
                                                appraisalData.land_size / ListingEnum.SQFT_ACRE
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
                                                    ) || ''
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
                        {CreateCompsEnum.NO_DATA}
                      </p>
                    )
                  )}
            </div>

            <div className="p-1 mt-[2px] flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
              {values.operatingExpenses?.length > ListingEnum.ZERO
                ? values.operatingExpenses.map((index: number) => (
                    <p
                      key={index}
                      className={`text-xs font-bold h-[18px] ${!appraisalData.operatingExpenses?.[index]?.names ? 'text-transparent' : ''}`}
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
                        {CreateCompsEnum.NO_DATA}
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
                    className="px-2 subject-property-input h-[20.4px] hideLabel relative"
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

                          if (e.keyCode === ListingEnum.EIGHT) {
                            if (
                              selectionStart === ListingEnum.ZERO &&
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

                          if (parseFloat(nStr) < -ListingEnum.HUNDRED) {
                            nStr = '-100';
                          } else if (parseFloat(nStr) > ListingEnum.HUNDRED) {
                            nStr = '100';
                          }

                          const parts = nStr.split('.');
                          if (
                            parts.length > ListingEnum.TWO ||
                            (parts.length === ListingEnum.TWO && parts[1].length > ListingEnum.TWO)
                          ) {
                            e.preventDefault();
                            return;
                          }

                          if (parts[0].length > ListingEnum.THREE && !nStr.includes('.')) {
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
                          transform: 'translateY(-94%)',
                          color: 'gray',
                          pointerEvents: 'none',
                          right: '5px',
                        }}
                      >
                        ft.
                      </span>
                    )}
                  </div>
                );
              }
            )}
            <p
              className="text-xs h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below text-[#0DA1C7] p-1 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer"
              // onClick={() => handleOpen(item, index)}
              onClick={handleNote}
            >
              {CreateCompsEnum.CLICK_ENTER_PROPERTY_NOTES}
            </p>

            <div className="mt-2 px-1 flex flex-col gap-[2px] pb-2">
              <p
                className="text-xs text-gray-500 font-medium border-below h-[28px] flex items-end text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>
              <p
                className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>

              <p
                className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
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
                {comparisonBasis === BuildingDetailsEnum.Bed
                  ? BuildingDetailsEnum.PER_BED
                  : comparisonBasis === SortingEnum.UNIT_
                    ? SortingEnum.PER_UNIT
                    : analysisType === SortingEnum.DOLLAR_PER_ACRE
                      ? SortingEnum.PER_ACRE
                      : SortingEnum.PER_SF}
              </p>

              {comparisonBasis === BuildingDetailsEnum.Bed ? (
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
                  {SortingEnum.PER_SF_}
                </p>
              ) : null}
              <p className="text-base text-[#0da1c7] h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap uppercase">
                {comparisonBasis === BuildingDetailsEnum.Bed
                  ? totalSaleValue
                    ? formatPrice(totalSaleValue || ListingEnum.ZERO)
                    : APPROACHESENUMS.NA
                  : comparisonBasis === BuildingDetailsEnum.UNIT
                    ? totalSaleValueUnit
                      ? formatPrice(totalSaleValueUnit || ListingEnum.ZERO)
                      : APPROACHESENUMS.NA
                    : compsType === MenuOptionsEnum.LAND_ONLY
                      ? totalSalesUnitOfSquareftOrACre
                        ? formatPrice(totalSalesUnitOfSquareftOrACre || ListingEnum.ZERO)
                        : APPROACHESENUMS.NA
                      : FinalResult
                        ? formatPrice(FinalResult || ListingEnum.ZERO)
                        : APPROACHESENUMS.NA}
              </p>
            </div>
          </div>
        </div>
        {!className || !open
          ? values.tableData?.map((item: any, index: any) => (
              <CompCard
                key={item.id}
                index={index}
                handleChange={handleChange}
                appraisalData={appraisalData}
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
                  <CompCard
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
                  {CreateCompsEnum.LINK_EXISTING_COMPS}{' '}
                </Typography>
              </div>
              <div
                onClick={handleLinkExistingComps}
                className="flex flex-col items-center justify-center w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer "
              >
                <Icons.AddCircleIcon
                  className="text-[#0DA1C7]"
                  style={{ fontSize: '40px' }}
                />
                <Typography
                  variant="h6"
                  className="text-gray-600 text-sm font-semibold mt-2"
                >
                  {CreateCompsEnum.ADD_NEW_COMP}
                </Typography>
              </div>

              {/* Upload Comp */}
              <div
                onClick={uploadComps}
                className="flex flex-col items-center justify-center max-w-[220px] w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer"
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
          </>
        )}
      </div>
      {/* Modal for Filter */}
      {/* {isOpen && (
        <FilterMapHeaderOptions
          passCompsData={passCompsDataToFilter}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          tableLength={tableLength}
          appraisalData={appraisalData}
          tableData={tableData}
          appraisalComparisonBasis={comparisonBasis}
          compsType={compsType}
        />
      )} */}

      <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5">
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            if (hasSaleType && filtereSalesdData.length > 1) {
              const saleIndex = filtereSalesdData.findIndex(
                (element) => element.id == salesId
              );

              if (saleIndex > 0) {
                const saleIdRedirectIndex = filtereSalesdData[saleIndex - 1].id;
                navigate(
                  `/sales-comps-map?id=${id}&salesId=${saleIdRedirectIndex}`
                );
                return;
              } else {
                if (hasRentRollType) {
                  navigate(
                    `/rent-roll?id=${id}&appraisalId=${filtereRentRolldData?.[filtereRentRolldData.length - 1]?.id}`
                  );
                  return;
                } else if (hasIncomeType) {
                  navigate(
                    `/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - 1]?.id}`
                  );
                  return;
                }
              }
            } else if (hasRentRollType) {
              navigate(
                `/rent-roll?id=${id}&appraisalId=${filtereRentRolldData?.[filtereRentRolldData.length - 1]?.id}`
              );
              return;
            } else if (hasIncomeType) {
              navigate(
                `/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - 1]?.id}`
              );
              return;
            }

            navigate(`/area-info?id=${id}`);
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
      <SalesApproachNote
        open={noteModalOpen}
        setNoteModalOpen={setNoteModalOpen}
        editorText={setEditorValue}
        handleSave={handleSave}
        salesNote={editorValue}
      />
    </AppraisalMenu>
  );
};

export default SalesApproach;

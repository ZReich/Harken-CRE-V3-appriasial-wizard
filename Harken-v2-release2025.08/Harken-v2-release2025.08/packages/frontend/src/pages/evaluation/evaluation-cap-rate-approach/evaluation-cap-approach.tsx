import React, { useEffect, useState } from 'react';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import { Button, Grid, Typography } from '@mui/material';
import { useGet } from '@/hook/useGet';
import { FieldArray, useFormikContext } from 'formik';
import { Icons } from '@/components/icons';
// import StyledField from '@/components/styles/Style-field-login';
import SelectTextField from '@/components/styles/select-input';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import axios from 'axios';
import defaultPropertImage from '../../../images/default-placeholder.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
// import { options } from '@/pages/comps/comp-form/fakeJson';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import loadingImage from '../../../images/loading.png';
import EvaluationCapCompCard from './evaluation-cap-comps-card';
import EvaluationCapSubjectPropertyAdjustmentNoteModal from './evaluation-cap-approach-adjustment-note-modal';
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
} from '@/pages/comps/create-comp/SelectOption';
import EvaluationAiCapCompsData from './evaluation-cap-ai-comps-table';
import EvaluationUploadCapCompsModal from './evaluation-upload-comps-from-cap-approach';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import CommonButton from '@/components/elements/button/Button';
import { EvaluationEnum } from '../set-up/evaluation-setup-enums';
import TextEditor from '@/components/styles/text-editor';
import { propertyTypeOptions } from '@/pages/my-profile/significant-transaction/select-option/Select';
import SubjectPropertyComparitiveAttributes from '@/utils/subject-property-comparitive.attributes';
import { capitalizeWords } from '@/utils/sanitize';
import { ListingHeaderEnum,
  ListingEnum,
  UnitsEnum,
  BuildingDetailsEnum,
  ValidationStatusEnum,
  CreateCompsEnum,
  UploadStatusEnum,
 } from '@/pages/comps/enum/CompsEnum';

export const getExpensesTotal = (
  expenses: any,
  expenseIndex: any,
  newExpenseValue: any
) => {
  let total: number = ListingEnum.ZERO;

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
// Function to format the values
let adjFactores: any;
let QualitativeadjFactores: any;
// let comparativeFActors: any;

const EvaluationCapApproach: React.FC = () => {
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
      comp.sale_price === ListingEnum.ZERO && comp.total_beds === ListingEnum.ZERO
        ? ListingEnum.ZERO
        : comp.total_beds === ListingEnum.ZERO
          ? ListingEnum.ZERO
          : comp.sale_price / comp.total_beds;

    const bedUnitPerSqFt =
      comp.total_units === ListingEnum.ZERO ? ListingEnum.ZERO : comp.sale_price / comp.total_units;
    const finalBed = (total / ListingEnum.HUNDRED) * bedPerSqFit + bedPerSqFit;

    const finalUnits = (total / ListingEnum.HUNDRED) * bedUnitPerSqFt + bedUnitPerSqFt;
    const finalAdjustePricePerAcre =
      (comp.sale_price / comp?.land_size) * ListingEnum.SQFT_ACRE;
    const updatedAdjustedPsf =
      (total / ListingEnum.HUNDRED) * price_square_foot + price_square_foot;

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

  console.log('updates', updatedCompss);
  // Retrieve query parameters

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  // const capId = searchParams.get('capId');
  const [appraisalId, setAppraisalId] = useState('');
  const { handleChange, values, setValues } = useFormikContext<any>();
  const cardValues = {
    ...values,
    tableData: values?.tableData.sort((a: any, b: any) => {
      // Assign numeric rank based on sale_status
      const getStatusRank = (status: string) => {
        if (status === UploadStatusEnum.PENDING) return ListingEnum.ZERO;
        if (status === ValidationStatusEnum.CLOSED) return ListingEnum.ONE;
        return 2; // Others
      };
      console.log(appraisalId);
      const rankA = getStatusRank(a.sale_status);
      const rankB = getStatusRank(b.sale_status);

      // Step 1: Sort by status rank
      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // Step 2: For Pending, sort alphabetically by business name
      if (a.sale_status === UploadStatusEnum.PENDING && b.sale_status === UploadStatusEnum.PENDING) {
        return a.business_name.localeCompare(b.business_name);
      }

      // Step 3: For Closed, sort by date_sold descending
      if (a.sale_status === ValidationStatusEnum.CLOSED && b.sale_status === ValidationStatusEnum.CLOSED) {
        return (
          new Date(b.date_sold).getTime() - new Date(a.date_sold).getTime()
        );
      }

      // Step 4: Keep original order for other statuses (stable sort fallback)
      return 0;
    }),
  };
  let minAveragedAdjustedPsf = Infinity; // Set to a very high value
  let maxAveragedAdjustedPsf = -Infinity; // Set to a very low value
  values.tableData.forEach((comp: { cap_rate: string }) => {
    const value = parseFloat(comp?.cap_rate ?? '');

    // Update min and max values
    if (value < minAveragedAdjustedPsf) minAveragedAdjustedPsf = value;
    if (value > maxAveragedAdjustedPsf) maxAveragedAdjustedPsf = value;
  });
  const capRateSum = values.tableData.reduce((total: any, item: any) => {
    const rate = parseFloat(item.cap_rate);
    return !isNaN(rate) ? total + rate : total;
  }, 0);

  const averageCapRate =
    values.tableData.length > ListingEnum.ZERO
      ? (capRateSum / values.tableData.length).toFixed(2)
      : '0.00';
  const capRateDividedByWeightTotal = values.tableData.reduce(
    (total: any, item: any) => {
      const capRate = parseFloat(item.cap_rate);
      const weight = parseFloat(item.weight);

      if (!isNaN(capRate) && !isNaN(weight)) {
        return parseFloat(total) + capRate * (weight / ListingEnum.HUNDRED);
      }
      return parseFloat(total);
    },
    0
  );
  if (!adjFactores) adjFactores = values.operatingAllExpensesInitial;

  if (!QualitativeadjFactores)
    QualitativeadjFactores = values.salesCompQualitativeAdjustment;

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  // const [ setIsOpen] = useState(false);
  const [openComps, setCompsOpen] = useState(false);

  const [comparisonBasis, setComparisonBasis] = useState<any>(null);
  const [, setCompsType] = useState<any>(null);
  const [compType, setCompType] = useState<any>(null);
  const [landDimensions, setLandDimensions] = useState<any>(null);
  const [editorValue, setEditorValue] = useState(''); // current editor text
  const capId = searchParams.get('capId');
  const [, setAnalysisType] = useState<any>(null);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [, setAreaInfoData1] = useState<any>();
  const [salesApproachName, setSalesApproachName] = useState('');
  const [open] = useState(false);
  const [hasIncomeType, setHasIncomeType] = useState(false);
  const [hasRentRollType, setHasRentRollType] = useState(false);
  const [hasCapType, setHasCapType] = useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [hasMultiFamilyType, setHasMultiFamilyType] = useState(false);
  console.log(hasMultiFamilyType, 'hasMultiFamilyTypehasMultiFamilyType');
  const [salesNote, setSalesNote] = useState('');
  const [leaseCompNote, setLeaseCompNote] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [className, setClassName] = useState(false);
  const [indexType, setIndexType] = useState<any>();
  const [appraisalType, setAppraisalType] = useState<any>();
  const [maxUnitCount, setMaxUnitCount] = useState<number>(0);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [compsLength, setCompsLength] = useState(0);

  const [overallComparabilityData, setOverallComparabilityData] = useState('');
  const [loader, setLoader] = useState(false);
  console.log('appraisaltype', appraisalType, hasCapType);
  console.log(overallComparabilityData);
  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filteredMultiFamilyData, setFilteredMultiFamilyData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCapdData, setFilteredCapData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereRentRolldData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [, setQualitativeApproaachItems] = useState<SubOption[]>([]);
  const [quanitativeApproaachItems, setQuanitativeApproaachItems] = useState<
    SubOption[]
  >([]);
  const uploadComps = () => {
    localStorage.setItem('compsLengthcapevaluation', String(compsLength));

    navigate(`/evaluation/upload-cap-comps?id=${id}&capId=${String(capId)}`, {
      state: {
        operatingExpenses: values.operatingExpenses,
      },
    });
  };
  const [comparativeFactors, setComparativeFactors] = useState<any[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > ListingEnum.HUNDRED);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  console.log(
    'filtereSalesdData',
    filtereSalesdData,
    hasSaleType,
    filtereCapdData
  );
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
      enabled: Boolean(capId),
      refetchOnWindowFocus: false,
      onSuccess: (data: any) => {
        const comparisonBasis = data?.data?.data?.comparison_basis;
        const landDimension = data?.data?.data?.land_dimension;
        const compsType = data?.data?.data?.comp_type;
        const analysisType = data?.data?.data?.analysis_type;
        const mapData = data?.data?.data?.scenarios;
        const subjectCompType = data?.data?.data?.comp_type;
        const appraisalType = data?.data?.data?.evaluation_type;
        // const scenario = data?.data?.data?.scenarios;
        if (mapData.length > 1) {
          // Map sales approach name
          mapData &&
            mapData.map((item: any) => {
              if (item.id == capId) {
                setSalesApproachName(item.name);
              }
            });
        }

        // Find and set cover image URL
        const coverImage = data?.data?.data?.evaluation_files?.find(
          (file: any) => file.title === ListingEnum.COVER
        );
        if (coverImage) {
          const imageUrl = coverImage.dir;
          setCoverImageUrl(imageUrl);
        }

        // Fetch compos data
        if (capId) {
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
  }, [id, mutateAsync, capId]);

  useEffect(() => {
    refetch();
  }, [areaInfoData?.data?.data, capId, refetch]);

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
    if (areaInfoData?.data?.data?.scenarios && !areaInfoData.isStale) {
      const updateData = areaInfoData.data.data.scenarios;
      const salesApproaches = updateData.filter(
        (item: { has_sales_approach: any }) => item.has_sales_approach === ListingEnum.ONE
      );
      setHasSaleType(salesApproaches.length > ListingEnum.ZERO);
      setFilteredSalesData(salesApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { has_rent_roll_approach: any }) =>
          item.has_rent_roll_approach === ListingEnum.ONE
      );
      setHasRentRollType(rentRollApproaches.length > ListingEnum.ZERO);
      setFilteredRentRollData(rentRollApproaches);

      const incomeApproaches = updateData.filter(
        (item: { has_income_approach: any }) => item.has_income_approach === ListingEnum.ONE
      );
      setHasIncomeType(incomeApproaches.length > ListingEnum.ZERO);
      setFilteredData(incomeApproaches);

      const multiFamilyApproaches = updateData.filter(
        (item: { has_multi_family_approach: any }) =>
          item.has_multi_family_approach === ListingEnum.ONE
      );
      setHasMultiFamilyType(multiFamilyApproaches.length > ListingEnum.ZERO);
      setFilteredMultiFamilyData(multiFamilyApproaches);

      const capApproaches = updateData.filter(
        (item: { has_cap_approach: any }) => item.has_cap_approach === ListingEnum.ONE
      );
      setHasCapType(capApproaches.length > ListingEnum.ZERO);
      setFilteredCapData(capApproaches);
    }
  }, [areaInfoData?.data?.data?.scenarios]);
  const appraisalData = areaInfoData?.data.data || {};
  const getLabelFromValue1 = (value: any) => {
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
    ];
    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, return the value as is without capitalizing
    return capitalizeWords(value);
  };
  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[appraisalData.state];
  // const zonningsData = areaInfoData?.data?.data?.zonings || [];

  const appraisalApproach = areaInfoData?.data?.data?.scenarios?.find(
    (approach: any) => (capId ? approach.id == parseFloat(capId) : false)
  );

  const appraisalSalesApproachId =
    appraisalApproach?.evaluation_cap_approach?.id || null;

  console.log('appraisalSalesApproachId', appraisalSalesApproachId);
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `evaluations/get-cap-approach?evaluationId=${id}&evaluationScenarioId=${capId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;
      setCompsLength(compsArr?.length || ListingEnum.ZERO);

      localStorage.setItem('compsLenghtCap', compsArr?.length || ListingEnum.ZERO);
      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      const salesNoteForComp = response?.data?.data?.data?.notes;
      const leaseComNote = response?.data?.data?.data?.cap_rate_notes;
      setLeaseCompNote(leaseComNote);
      setSalesNote(salesNoteForComp);
      if (!compsArr) {
        setValues({
          ...values,
          tableData: [],
          operatingExpenses: values.operatingExpenses,
        });
        return; // Exit if no data
      }

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

        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          // expenses: formattedExpenses,
          // quantitativeAdjustments: formattedQualitativeApproach,
          // appraisalSpecificAdjustment: formattedComparativeApproach,
          id: c.id,
          comp_id: c.comp_id,
          overall_comparability: c.overall_comparability,
          // averaged_adjusted_psf: avgpsf,
          blended_adjusted_psf: c.blended_adjusted_psf,
          weight: c.weight,
          total: c.total_adjustment,
          adjustment_note: c?.weighting_note,
        });
      }
      //chekc this tomorrow
      const sortedComps = calculatedComps.sort((a: any, b: any) => {
        // Sort by status (pending first, then closed)
        if (a.sale_status === ValidationStatusEnum.PENDING && b.sale_status !== UploadStatusEnum.PENDING) {
          return -1;
        }
        if (a.sale_status !== ValidationStatusEnum.PENDING && b.sale_status === UploadStatusEnum.PENDING) {
          return ListingEnum.ONE;
        }

        // Step 2: Within Pending, sort by date_sold
        if (a.sale_status === ValidationStatusEnum.PENDING && b.sale_status === UploadStatusEnum.PENDING) {
          return a.business_name.localeCompare(b.business_name);
        }
        if (a.sale_status === ValidationStatusEnum.CLOSED && b.sale_status !== ValidationStatusEnum.CLOSED) {
          return -1;
        }
        if (a.sale_status !== ValidationStatusEnum.CLOSED && b.sale_status === ValidationStatusEnum.CLOSED) {
          return ListingEnum.ONE;
        }
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
        // operatingExpenses: formattedOperatingExpenses,
        // salesCompQualitativeAdjustment: formattedQualitativeExpenses,
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
  }, [capId]);

  useEffect(() => {
    if (values.appraisalSpecificAdjustment) {
      const capApproachValues = {
        appraisalSpecificAdjustment: values.appraisalSpecificAdjustment,
      };
      localStorage.setItem(
        'capApproachValues',
        JSON.stringify(capApproachValues)
      );
    }
  }, [
    values.operatingExpenses,
    values.salesCompQualitativeAdjustment,
    values.appraisalSpecificAdjustment,
  ]);

  function transformComparitiveAdjustment(appraisalSpecificAdjustment: any[]) {
    return appraisalSpecificAdjustment?.map((expense) => ({
      comparison_key: expense?.comparison_key
        ?.toLowerCase()
        ?.replace(/\s+/g, '_'),
      comparison_value: expense?.comparison_value,
    }));
  }

  const comparison_attributes = transformComparitiveAdjustment(
    values.appraisalSpecificAdjustment
  );

  let totalaveragedadjustedpsf: any = ListingEnum.ZERO;

  values.tableData.forEach((comp: { averaged_adjusted_psf: string }) => {
    if (comp.averaged_adjusted_psf) {
      totalaveragedadjustedpsf += parseFloat(comp.averaged_adjusted_psf);
    }
  });

  totalaveragedadjustedpsf = parseFloat(totalaveragedadjustedpsf.toFixed(2));

  let totalWeightage = 0;

  values.tableData.forEach((comp: { weight: string }) => {
    if (comp.weight) {
      totalWeightage += parseFloat(comp.weight);
    }
  });
  const comp_data = values.tableData?.map((item: any, index: number) => {
    const comp_id = item.comp_id || item.id;
    console.log('item', values);
    return {
      ...(appraisalSalesApproachId ? { id: item.id } : {}),

      comp_id: comp_id,

      order: index + 1,

      weighting_note: item?.adjustment_note,

      weight: parseFloat(item.weight),
    };
  });

  const salesApproachData = {
    ...(appraisalId ? { id: appraisalId } : {}),
    //   'id':appraisalId,
    evaluation_scenario_id: capId ? parseFloat(capId) : null,
    high_cap_rate: maxAveragedAdjustedPsf,
    low_cap_rate: minAveragedAdjustedPsf,
    rounded_average: averageCapRate,
    weigted_average: capRateDividedByWeightTotal,
    notes: salesNote,

    cap_rate_notes: leaseCompNote,
    // sales_approach_value: FinalResult,
    weight: parseFloat(totalWeightage.toString()),

    comparison_attributes: comparison_attributes,
    comps: comp_data,
  };

  const finalData = {
    evaluation_id: id ? parseFloat(id) : null,
    cap_approach: salesApproachData,
  };
  const mutation = useMutate<any, any>({
    queryKey: 'save-cap-approach',
    endPoint: 'evaluations/save-cap-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'save-cap-approach',
    endPoint: 'evaluations/update-cap-approach',
    requestType: RequestType.POST,
  });
  const handleAddNewComp = () => {
    localStorage.setItem('checkStatus', 'sales');
    localStorage.removeItem('selectedToggle');
    localStorage.removeItem('view');
    localStorage.setItem('compsLengthcapevaluation', String(compsLength));
    localStorage.setItem('comparisonBasisView', comparisonBasis);

    navigate(`/evaluation/filter-cap-comps?id=${id}&approachId=${capId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };

  const handleLinkExistingComps = () => {
    navigate(`/evaluation/cap/create-comp?id=${id}&approachId=${capId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };
  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    try {
      // Fetch fresh data from API
      const freshResponse = await axios.get(`evaluations/get/${id}`);
      const currentAppraisalApproach =
        freshResponse?.data?.data?.data?.scenarios?.find((approach: any) =>
          capId ? approach.id == parseFloat(capId) : false
        );
      const currentAppraisalSalesApproachId =
        currentAppraisalApproach?.evaluation_cap_approach?.id ||
        appraisalId ||
        null;

      console.log(
        'currentAppraisalSalesApproachId:',
        freshResponse?.data?.data
      );

      // Recalculate totals with updated comps
      let updatedTotalWeightage = 0;

      updatedComps.forEach((comp: any) => {
        if (comp.weight) {
          updatedTotalWeightage += parseFloat(comp.weight);
        }
      });

      // Create updated comps data
      const updatedCompsData = updatedComps.map((item: any, index: number) => {
        const comp_id = item.comp_id || item.id;
        return {
          // ...(currentAppraisalSalesApproachId ? { id: item.id } : {}),
          comp_id: comp_id,
          order: index + 1,
          weighting_note: item?.adjustment_note,
          weight: parseFloat(item.weight),
        };
      });

      const updatedSalesApproachData = {
        ...(currentAppraisalSalesApproachId
          ? { id: currentAppraisalSalesApproachId }
          : {}),
        evaluation_scenario_id: capId ? parseFloat(capId) : null,
        weight: parseFloat(updatedTotalWeightage.toString()),
        notes: salesNote,
        cap_rate_notes: leaseCompNote,
        comparison_attributes: comparison_attributes,
        comps: updatedCompsData,
      };

      const updatedFinalData = {
        evaluation_id: id ? parseFloat(id) : null,
        cap_approach: updatedSalesApproachData,
      };

      let response;
      if (currentAppraisalSalesApproachId) {
        console.log('gottheid');
        response = await mutations.mutateAsync(updatedFinalData);
        fetchComposData(values, setValues);
      } else {
        console.log('notgottheid');
        const modifiedPayload = {
          ...updatedFinalData,
          cap_approach: {
            ...updatedFinalData.cap_approach,
            comps: updatedFinalData.cap_approach.comps,
          },
        };
        response = await mutation.mutateAsync(modifiedPayload);

        // Set the approach ID from the response for future updates
        if (response?.data?.data?.id) {
          console.log('New approach ID:', response.data.data.id);
          fetchComposData(values, setValues);
        }
      }

      if (response && response.data && response.data.message) {
        // toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
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
          cap_approach: {
            ...finalData.cap_approach,
            comps: finalData.cap_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        toast.success(response.data.message);
        setLoader(false);
        navigate(`/evaluation/cap-comps-map?id=${id}&capId=${capId}`);

        // Default navigation if no other conditions met
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
          cap_approach: {
            ...finalData.cap_approach,
            comps: finalData.cap_approach.comps,
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
          cap_approach: {
            ...finalData.cap_approach,
            comps: finalData.cap_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        navigate(`/evaluation/update-cap-comps/${itemId}/${id}/cap/${capId}`);
      }
    } catch (error) {
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };
  useEffect(() => {
    if (updatedCompss) {
      setTimeout(() => {
        passCompsDataToFilter(updatedCompss);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
      }, 2000);
    }
  }, [updatedCompss]);

  const passCompsDataToFilter = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = ListingEnum.HUNDRED / totalComps.length;
      let count = 0;
      const updatedComps = totalComps.map((comp) => {
        count++;
        if (totalComps.length === 3 && count === totalComps.length) {
          comp.weight = 33.34;
        } else {
          comp.weight = newInitialWeight.toFixed(2);
        }

        const calculatedCompData = calculateCompData({
          weight: comp.weight,
          comp,
        });

        const updatedCompData = {
          ...comp,
          ...calculatedCompData,
        };
        return updatedCompData;
      });

      // Call API with updated comps after state update
      setTimeout(() => {
        handleSubmitWithUpdatedComps(updatedComps);
        // fetchComposData(values, setValues);
      }, ListingEnum.HUNDRED);

      return {
        ...oldValues,
        tableData: updatedComps,
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
          cap_approach: {
            ...finalData.cap_approach,
            comps: finalData.cap_approach.comps,
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
          return ListingEnum.ONE;
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
          return ListingEnum.ONE;
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
        if (sortedComps.length === 3 && count === sortedComps.length) {
          comp.weight = 33.34;
        } else {
          comp.weight = newInitialWeight.toFixed(2);
        }

        // const expenses = [...comp.expenses];
        // const { total } = getExpensesTotal(expenses, '', '');

        const calculatedCompData = calculateCompData({
          // total,
          weight: comp.weight,
          comp,
        });

        const updatedCompData = {
          ...comp,
          ...calculatedCompData,
        };
        return updatedCompData;
      });

      // const totalAverageAdjustedPsf = updatedComps.reduce((acc, item) => {
      //   return acc + item.averaged_adjusted_psf;
      // }, 0);

      return {
        ...oldValues,
        tableData: updatedComps,
        // averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });

    // setIsOpen(false);
  };

  // const totalSaleValue = totalBeds * totalaveragedadjustedpsf;
  // const totalSaleValueUnit = totalUnits * totalaveragedadjustedpsf;

  // const averageadjustedBedSf = totalSaleValue / appraisalData.building_size;
  // const averageadjustedUnitSf =
  //   totalSaleValueUnit / appraisalData.building_size;
  // let valueToStore: any = '';

  // if (comparisonBasis === 'Bed') {
  //   valueToStore = totalSaleValue;
  // } else if (comparisonBasis === 'Unit') {
  //   valueToStore = totalSaleValueUnit;
  // } else if (compsType === 'land_only') {
  //   valueToStore = totalSalesUnitOfSquareftOrACre;
  // } else {
  //   valueToStore = FinalResult;
  // }
  localStorage.setItem('salesValuePerUnit', totalaveragedadjustedpsf);
  // localStorage.setItem('salesValuePerUnitForWeightage', valueToStore);

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
          updatedTableData.length === 3 &&
          count === updatedTableData.length
        ) {
          comp.weight = 33.34;
        } else {
          comp.weight = newInitialWeight.toFixed(2);
        }

        // const expenses = [...comp.expenses];
        // const { total } = getExpensesTotal(expenses, '', '');
        const calculatedCompData = calculateCompData({
          // total,
          weight: comp.weight,
          comp,
        });

        return {
          ...comp,
          ...calculatedCompData,
        };
      });

      // const totalAverageAdjustedPsf = updatedComps.reduce(
      //   (acc: any, item: any) => acc + item.averaged_adjusted_psf,
      //   0
      // );

      return {
        ...oldValues,
        tableData: updatedComps,
        // averaged_adjusted_psf: totalAverageAdjustedPsf,
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
      return option.label; // Return matched label
    }

    // If no match, capitalize the first letter of each word
    return capitalizeWords(value);
  };

  // const formattedDropdownOptions = qualitativeApproachItems.map((option) => ({
  //   value: option.code,
  //   label: option.name,
  // }));

  // const formattedQualitativeDropdownOptions = quanitativeApproaachItems.map(
  //   (option) => ({
  //     value: option.code,
  //     label: option.name,
  //   })
  // );
  // Utility function to format numbers

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
    setEditorValue(salesNote ? salesNote.slice(0, 250) : ''); // Load the saved value
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
  const handleNextClick = () => {
    handleSubmit();
  };

  const handleBackClick = () => {
    if (hasRentRollType) {
      navigate(
        `/evaluation/rent-roll?id=${id}&evaluationId=${filtereRentRolldData?.[filtereRentRolldData.length - 1]?.id}`
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

  console.log(values.tableData.length);
  return (
    <EvaluationMenuOptions
      onNextClick={handleNextClick}
      onBackClick={handleBackClick}
    >
      {' '}
      {openComps && (
        <EvaluationUploadCapCompsModal
          open={openComps}
          onClose={() => setCompsOpen(false)}
          compsLength={compsLength}
          setCompsModalOpen={setCompsModalOpen}
          setCompsData={setCompsData}
          compsData={compsData ?? []} // Avoid passing null where an array is needed
        />
      )}
      {compsModalOpen && (
        <EvaluationAiCapCompsData
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
          {ListingEnum.CAP_RATE_COMPS}{' '}
          <span>{salesApproachName ? `(${salesApproachName})` : ''} </span>
        </Typography>

        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">
            {ListingEnum.VALUE_OF_PROPERTY_ON_APPLICABLE_CAP_RATE}
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
              <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                {CreateCompsEnum.DATE_SOLD}
              </p>
              <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                {CreateCompsEnum.PROPERTY_TYPE}
              </p>
            </div>
            <div className="p-1 border-r-0 border-[#d5d5d5]">
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
                              className="dropdown min-w-[calc(100%-36px)] w-full manageDropdownField"
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

                                    // const compsWithNewAdj = old.tableData.map(
                                    //   (comp: any) => ({
                                    //     ...comp,
                                    //     expenses: comp.expenses.map(
                                    //       (exp: any, expIndex: number) =>
                                    //         expIndex === i
                                    //           ? {
                                    //               ...exp,
                                    //               comparison_key: input,
                                    //             }
                                    //           : exp
                                    //     ),
                                    //   })
                                    // );

                                    return {
                                      ...old,
                                      appraisalSpecificAdjustment,
                                      // tableData: compsWithNewAdj,
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
                        No appraisal specific adjustment data
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="border-r-0  border-[#d5d5d5] py-1 mt-[1px]">
              <div className="p-2 flex flex-col gap-[2px] space-y-2 border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5]">
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  {appraisalData.comparison_basis === 'SF'
                    ? '$/SF'
                    : appraisalData.comparison_basis === 'Bed'
                      ? '$/Bed'
                      : appraisalData.comparison_basis === 'Unit'
                        ? '$/Unit'
                        : null}
                </p>
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Net Operating Income
                </p>
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Capitalization Rate
                </p>
              </div>
            </div>
            <div className="text-xs h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below text-[#121212] p-1 border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer">
              <p className="text-xs font-bold">Notes </p>
            </div>

            <div className="text-xs text-black-500 h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium p-1 pb-[6px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer">
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Weighting
              </p>
            </div>

            <div className=" space-y-2 flex flex-col gap-[2px]">
              <p className="text-xs font-bold h-[37px] flex items-end text-ellipsis overflow-hidden whitespace-nowrap">
                High
              </p>
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Low
              </p>
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Rounded Average
              </p>
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Weighted Average
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
                {/* <p className="text-xs font-bold  flex h-[20px] text-gray-500"> */}
                <p className="text-gray-500 text-xs font-bold pb-1 overflow-hidden whitespace-nowrap text-ellipsis">
                  {getLabelFromValue1(appraisalData?.zonings[0]?.zone)} /{' '}
                  {getLabelFromValue1(appraisalData?.zonings[0]?.sub_zone)}
                </p>
              </div>
            </div>
            <div className="p-1 space-y-2 flex flex-col gap-[2px] border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5]">
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
            <div className="border-r-0  border-[#d5d5d5] py-1 mt-[1px]">
              <div className="p-2 flex flex-col gap-[2px] space-y-2 border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5]">
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis"></p>
                <p className="text-gray-500 h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis"></p>
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis"></p>
              </div>
            </div>
            <p
              className="text-xs h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below text-[#0DA1C7] p-1 border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer"
              // onClick={() => handleOpen(item, index)}
              onClick={handleNote}
            >
              {salesNote !== null
                ? 'Click to edit CAP Rate notes'
                : 'Click to add notes'}
            </p>

            <p
              className="text-xs text-gray-500  h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below p-1 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer"
              // onClick={() => handleOpen(item, index)}
            >
              {totalWeightage.toFixed(2) + '%'}
            </p>
            <p className="text-xs px-1 text-gray-500 font-medium border-below h-[36px] flex items-end text-ellipsis overflow-hidden whitespace-nowrap">
              {' '}
              {minAveragedAdjustedPsf === Infinity &&
              maxAveragedAdjustedPsf === -Infinity
                ? '0.00%'
                : `${maxAveragedAdjustedPsf.toFixed(2)}%`}
            </p>

            <div className="px-1 space-y-2 flex flex-col gap-[2px] pb-2">
              <p className="text-xs text-gray-500 h-[18px] font-medium border-below flex items-end text-ellipsis overflow-hidden whitespace-nowrap">
                {minAveragedAdjustedPsf === Infinity &&
                maxAveragedAdjustedPsf === -Infinity
                  ? '0.00%'
                  : `${minAveragedAdjustedPsf.toFixed(2)}%`}
              </p>
              <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {''}
                {averageCapRate}%
              </p>

              <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {' '}
                {capRateDividedByWeightTotal.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        {!className || !open
          ? values.tableData?.map((item: any, index: any) => (
              <EvaluationCapCompCard
                key={item.id}
                index={index}
                handleChange={handleChange}
                item={item}
                values={cardValues}
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
                comparisonBasis={comparisonBasis}
                appraisalData={appraisalData}
              />
            ))
          : values?.tableData?.map((item: any, index: any) =>
              index === indexType ? (
                <div key={item.id}>
                  <EvaluationCapCompCard
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
                    subOption={quanitativeApproaachItems}
                    indexType={indexType}
                    setIndexType={setIndexType}
                    setClassName={setClassName}
                    handleSubmit={handleSubmit}
                    landDimensions={landDimensions}
                    passcomparabilityData={passcomparabilityData}
                    comparisonBasis={comparisonBasis}
                    appraisalData={appraisalData}
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
      <div
        className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5"
        style={{ zIndex: 99 }}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            // INCOME TYPE: Redirect using IncomeId
            if (hasIncomeType) {
              const incomeData: any = filteredData.find(
                (element) => element.id == capId
              );
              if (incomeData?.id) {
                navigate(
                  `/evaluation/income-approch?id=${id}&IncomeId=${incomeData.id}`
                );
                return;
              }
            }

            // MULTI-FAMILY TYPE: Redirect using second last ID
            if (hasMultiFamilyType) {
              // Ensure at least 2 entries exist
              if (filteredMultiFamilyData.length >= ListingEnum.TWO) {
                const targetId =
                  filteredMultiFamilyData[filteredMultiFamilyData.length - ListingEnum.TWO]
                    ?.id;
                if (targetId) {
                  navigate(
                    `/evaluation/multi-family-comps-map?id=${id}&evaluationId=${targetId}`
                  );
                  return;
                }
              }
            }

            // Optional: Uncomment this if you want fallback logic for Cap type
            // if (hasCapType && filtereCapdData.length > 1) {
            //   const leaseIndex = filtereCapdData.findIndex(
            //     (element) => element.id == capId
            //   );
            //   if (leaseIndex > 0) {
            //     const leaseIdRedirectIndex = filtereCapdData[leaseIndex - 1].id;
            //     navigate(`/evaluation/cap-comps-map?id=${id}&capId=${leaseIdRedirectIndex}`);
            //     return;
            //   }
            // }

            // Default fallback
            navigate(`/evaluation-area-info?id=${id}`);
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
          {EvaluationEnum.SAVE_AND_CONTINUE}
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
      <EvaluationCapSubjectPropertyAdjustmentNoteModal
        open={noteModalOpen}
        setNoteModalOpen={setNoteModalOpen}
        editorText={setEditorValue}
        handleSave={handleSave}
        salesNote={editorValue || ''}
      />
      <div className="xl:px-[60px] mt-14 pb-32 px-[15px]">
        <h4 className="text-gray-800 text-xs font-medium font-bold">
          {CreateCompsEnum.CAP_COMPS_NOTES}
        </h4>
        <TextEditor
          editorData={(content) => setLeaseCompNote(content)}
          editorContent={
            leaseCompNote
            // '<strong>Even</strong>: No Adjustment, Similar to Subject Property. <strong>Minus</strong>: Downward adjustment, Better than/Superior to Subject Property. <strong>Plus</strong>: Upward Adjustment Poorer than/Inferior to Subject Property.'
          }
          value={leaseCompNote} // Ensure the 'value' prop is provided
        />
      </div>
    </EvaluationMenuOptions>
  );
};

export default EvaluationCapApproach;

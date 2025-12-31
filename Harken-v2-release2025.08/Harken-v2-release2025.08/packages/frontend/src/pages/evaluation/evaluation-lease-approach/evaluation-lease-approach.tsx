import React, { useEffect, useState } from 'react';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import { Grid, Typography, TextField } from '@mui/material';
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
import TextEditor from '@/components/styles/text-editor';
import defaultPropertImage from '../../../images/default-placeholder.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import EvaluationLeaseApproachAdjustmentNotesModal from './evaluation-lease-approach-subject-property-notes-modal';
import DeleteApproachConfirmationModal from '@/pages/comps/Listing/delete-approach-confirmation';

import { options, usa_state } from '@/pages/comps/comp-form/fakeJson';
import EvaluationCompsAiDataForm from './evaluation-lease-ai-comps-data';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import loadingImage from '../../../images/loading.png';

import {
  AllTypeJson,
  conditionOptions,
  retailOptions,
  officeOptions,
  industrialOptions,
  multifamilyOptions,
  hospitalityOptions,
  specialOptions,
  residentialOptions,
  topographyOptions,
  landTypeOptions,
} from '@/pages/comps/create-comp/SelectOption';
import UploadSalesCompsModal from '@/pages/appraisal/sales/upload-comps-from-sales';
import { EvaluationEnum } from '../set-up/evaluation-setup-enums';
import EvaluationLeaseApproachCompsNote from './evaluation-lease-approach-comps-notes';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import {
  capitalizeWords,
  formatPrice,
  // formatPrice,
  // formatPriceForLease,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { propertyTypeOptions } from '@/pages/my-profile/significant-transaction/select-option/Select';
import SubjectPropertyComparitiveAttributes from '@/utils/subject-property-comparitive.attributes';
import CompsPropertyComparitiveAttributes from '@/utils/comps-property-comparitive.attributes';
import { ListingHeaderEnum, ListingEnum, MenuOptionsEnum, BuildingDetailsEnum, LocalStorageKeysEnum, LocalStorageEnum, CreateCompsEnum, PayloadFieldsEnum, CustomFieldValuesEnum, SiteDetailsEnum, } from '@/pages/comps/enum/CompsEnum';

// Local enums for adjustment keys/labels and qualitative values not present in CompsEnum.ts
export enum AdjustmentKeyEnum {
  REAL_ESTATE_TAXES = 'real_estate_taxes',
  PROPERTY_INSURANCE = 'property_insurance',
  UTILITIES = 'utilities',
  REPAIRS_AND_MAINTENANCE = 'repairs_and_maintenance',
  MANAGEMENT_FEES = 'management_fees',
  ADMINISTRATIVE = 'administrative',
  CONTRACT_SERVICES = 'contract_services',
  MARKETING = 'marketing',
  PAYROLL = 'payroll',
  GENERAL_AND_ADMIN = 'general_and_admin',
  REPLACEMENT_RESERVES = 'replacement_reserves',
  OTHER = 'other',
  TIME = 'time',
  OPERATING_EXP = 'operating_exp',
  LOCATION = 'location',
  CONSTRUCTION = 'construction',
  CONDITION = 'condition',
  TYPE = 'type',
  ECONOMIES_OF_SCALE = 'economies_of_scale',
}

export enum AdjustmentLabelEnum {
  REAL_ESTATE_TAXES = 'Real Estate Taxes',
  PROPERTY_INSURANCE = 'Property Insurance',
  UTILITIES = 'Utilities',
  REPAIRS_AND_MAINTENANCE = 'Repairs & Maintenance',
  MANAGEMENT_FEES = 'Management Fees',
  ADMINISTRATIVE = 'Administrative',
  CONTRACT_SERVICES = 'Contract Services',
  MARKETING = 'Marketing',
  PAYROLL = 'Payroll',
  GENERAL_AND_ADMIN = 'General & Admin',
  REPLACEMENT_RESERVES = 'Replacement Reserves',
  OTHER = 'Other',
  TIME = 'Time',
  OPERATING_EXP = 'Operating Expenses',
  LOCATION = 'Location',
  CONSTRUCTION = 'Construction',
  CONDITION = 'Condition',
  TYPE = 'Type/Use',
  ECONOMIES_OF_SCALE = 'Economies Of Scale',
}

export enum QualitativeAdjustmentEnum {
  SUPERIOR = 'Superior',
  INFERIOR = 'Inferior',
  EQUAL = 'Equal',
}
export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  const bedPerSqFit =
    comp.lease_rate === ListingEnum.ZERO || comp.total_beds === ListingEnum.ZERO
      ? ListingEnum.ZERO
      : comp.lease_rate_unit === ListingEnum.MONTHLY
        ? comp.lease_rate / comp.total_beds / ListingEnum.TWELVE
        : comp.lease_rate / comp.total_beds;

  const bedUnitPerSqFt =
    comp.total_units === ListingEnum.ZERO || comp.lease_rate === ListingEnum.ZERO
      ? ListingEnum.ZERO
      : comp.lease_rate_unit === ListingEnum.MONTHLY
        ? comp.lease_rate / comp.total_units / ListingEnum.TWELVE
        : comp.lease_rate / comp.total_units;
  const finalBed =
    appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR
      ? total + bedPerSqFit
      : (total / ListingEnum.HUNDRED) * bedPerSqFit + bedPerSqFit;

  const finalUnits =
    appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR
      ? total + bedUnitPerSqFt
      : (total / ListingEnum.HUNDRED) * bedUnitPerSqFt + bedUnitPerSqFt;
  const valuePerACre =
    appraisalData &&
      appraisalData.comp_adjustment_mode === ListingEnum.DOLLAR &&
      appraisalData.analysis_type === ListingEnum.ACRE
      ? total + comp.price_square_foot * ListingEnum.SQFT_ACRE
      : (total / ListingEnum.HUNDRED) * comp.price_square_foot * ListingEnum.SQFT_ACRE +
      comp.price_square_foot * ListingEnum.SQFT_ACRE;
  let updatedAdjustedPsf;

  if (appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR) {
    if (appraisalData?.comp_type === MenuOptionsEnum.LAND_ONLY) {
      if (appraisalData?.analysis_type === ListingEnum.ACRE) {
        updatedAdjustedPsf =
          total + parseFloat((price_square_foot / ListingEnum.SQFT_ACRE).toFixed(2));
      } else {
        updatedAdjustedPsf = total + price_square_foot;
      }
    } else {
      updatedAdjustedPsf = total + price_square_foot;
    }
  } else {
    if (appraisalData?.comp_type === MenuOptionsEnum.LAND_ONLY) {
      if (appraisalData?.analysis_type === ListingEnum.ACRE) {
        updatedAdjustedPsf =
          (total / ListingEnum.HUNDRED) * parseFloat((price_square_foot / ListingEnum.SQFT_ACRE).toFixed(2)) +
          parseFloat((price_square_foot / ListingEnum.SQFT_ACRE).toFixed(2));
      } else {
        updatedAdjustedPsf =
          (total / ListingEnum.HUNDRED) * price_square_foot + price_square_foot;
      }
    } else {
      updatedAdjustedPsf =
        (total / ListingEnum.HUNDRED) * price_square_foot + price_square_foot;
    }
  }

  const updatedAverageAdjustedPsf = (updatedAdjustedPsf * weight) / ListingEnum.HUNDRED;
  const bedAveragedAdjustedPsf = (finalBed * weight) / ListingEnum.HUNDRED;
  const unitAveragedAdjustedPsf = (finalUnits * weight) / ListingEnum.HUNDRED;

  const updatedBlendedPsf = (price_square_foot * weight) / ListingEnum.HUNDRED;
  const bedUpdatedBlendedPsf = (bedPerSqFit * weight) / ListingEnum.HUNDRED;
  const unitUpdatedBlendedPsf = (bedPerSqFit * weight) / ListingEnum.HUNDRED;
  return {
    adjusted_psf:
      comp?.comparison_basis === BuildingDetailsEnum.Bed
        ? finalBed
        : comp?.comparison_basis === BuildingDetailsEnum.UNIT
          ? finalUnits
          : appraisalData?.analysis_type === ListingEnum.ACRE
            ? valuePerACre
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

// function to calculate comps total dropdown adjustment values
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
    total += exp.adj_value != '-' ? parseFloat(exp.adj_value) : ListingEnum.ZERO;
  });

  return { total, expenses };
};

let adjFactores: any;
let QualitativeadjFactores: any;

const EvaluationLeaseApproach: React.FC = () => {
  console.log('EvaluationLeaseApproach component loaded');

  type DropdownField = {
    id: number;
    value: string;
    isTextField: boolean;
    customValue: any;
    input: any;
    placeholder: string;
  };

  // Retrieve query parameters
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // const { leaseId } = useParams()
  const [appraisalId, setAppraisalId] = useState('');
  const { handleChange, values, setValues } = useFormikContext<any>();
  if (!adjFactores) {
    // Sort adjFactores by default_order before setting
    const sortedAdjFactores = (values.operatingExpenses || []).sort((a: any, b: any) => {
      if (a.default_order === null && b.default_order === null) return 0;
      if (a.default_order === null) return 1;
      if (b.default_order === null) return -1;
      return a.default_order - b.default_order;
    });
    adjFactores = sortedAdjFactores;
    console.log('adjFactores:', adjFactores);
  }
  if (!QualitativeadjFactores)
    QualitativeadjFactores = values.salesCompQualitativeAdjustment;
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  // const [isOpen, setIsOpen] = useState(false);
  const [comparisonBasis, setComparisonBasis] = useState<any>(null);
  const [compsType, setCompsType] = useState<any>(null);
  const [compType, setCompType] = useState<any>(null);
  const [maxUnitCount, setMaxUnitCount] = useState<number>(ListingEnum.ZERO);
  const [compsLength, setCompsLength] = useState('');

  const [landDimensions, setLandDimensions] = useState<any>(null);
  const leaseId = searchParams.get(ListingEnum.LEASE_ID);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const location = useLocation();
  const updatedCompss = location.state?.updatedComps;
  //  const [modalOpen,setModalOpen]=useState(false);
  const [analysisType, setAnalysisType] = useState<any>(null);
  const [, setAreaInfoData1] = useState<any>();
  const [salesApproachName, setSalesApproachName] = useState('');
  const [open, setOpen] = useState(false);
  const [adjustmentData, setAdustmentData] = useState<any>();
  const [className, setClassName] = useState(false);
  const [openComps, setCompsOpen] = useState(false);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [comparativeFactors, setComparativeFactors] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);
  const [indexType, setIndexType] = useState<any>();
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  console.log(compsType);
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > ListingEnum.HUNDRED);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const {
    data: areaInfoData,
    refetch,
    isLoading,
  } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(leaseId),
      refetchOnWindowFocus: false,
      onSuccess: (data: any) => {
        const comparisonBasis = data?.data?.data?.comparison_basis;
        const landDimension = data?.data?.data?.land_dimension;
        const compsType = data?.data?.data?.comp_type;
        const analysisType = data?.data?.data?.analysis_type;
        const mapData = data?.data?.data?.scenarios;
        const subjectCompType = data?.data?.data?.comp_type;
        if (mapData.length > 1) {
          mapData &&
            mapData.map((item: any) => {
              if (item.id == leaseId) {
                setSalesApproachName(item.name);
              }
            });
        }
        const coverImage = data?.data?.data?.evaluation_files?.find(
          (file: any) => file.title === ListingEnum.COVER
        );

        if (coverImage) {
          const imageUrl = coverImage.dir;
          setCoverImageUrl(imageUrl);
        }

        if (leaseId) {
          fetchComposData(values, setValues);
        } else {
          console.log('error');
        }

        setComparisonBasis(comparisonBasis);
        setCompsType(compsType);
        setLandDimensions(landDimension);
        setAnalysisType(analysisType);
        setCompType(subjectCompType);
        setComparisonBasis(data?.data?.data?.comparison_basis);
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
          const propertyUnits = data?.data?.data?.property_units || [];

          const maxUnitCount = propertyUnits.reduce(
            (max: number, unit: any) => Math.max(max, unit?.sq_ft || ListingEnum.ZERO),
            ListingEnum.ZERO
          );
          setMaxUnitCount(maxUnitCount); // Assuming setMaxUnitCount is your state setter
          setAreaInfoData1(type_sqft);
        }
      },
    },
  });

  const { data } = useGet<any>({
    queryKey: 'all',
    endPoint: `globalCodes`,
    config: { refetchOnWindowFocus: false },
  });

  type SubOption = {
    code: string;
    name: string;
  };

  const [qualitativeApproachItems, setQualitativeApproaachItems] = useState<
    SubOption[]
  >([]);
  const [quanitativeApproaachItems, setQuanitativeApproaachItems] = useState<
    SubOption[]
  >([]);
  const [dropdownFields, setDropdownFields] = useState<DropdownField[]>([]);

  useEffect(() => {
    if (data?.data?.data) {
      const firstOptions = data.data.data.find(
        (item: any) => item.type === ListingEnum.SALES_COMP_QUALITATIVE_ADJUSTMENT
      )?.options;

      // Set subOptions based on fetched data
      setQuanitativeApproaachItems(firstOptions || []);

      // Initialize dropdownFields to match the number of subOptions
      const initialDropdownFields = (firstOptions || []).map(
        (option: any, index: any) => ({
          id: index + 1,
          value: option.code, // Set initial value based on option
          isTextField: false, // Track if this should be a text field
        })
      );

      setDropdownFields(initialDropdownFields);
    }
    if (data?.data?.data) {
      const activeType = localStorage.getItem('activeType');
      console.log('ActiveType in lease approach:', activeType);

      const quantitativeType = activeType === 'land_only'
        ? 'land_lease_quantitative_adjustments'
        : ListingEnum.LEASE_QUANTITATIVE_ADJUSTMENTS;

      console.log('QuantitativeType selected for lease:', quantitativeType);

      const firstOptions = data.data.data.find(
        (item: any) => item.type === quantitativeType
      )?.options;

      console.log('Lease quantitative options found:', firstOptions);

      // Sort by default_order before setting
      const sortedOptions = (firstOptions || []).sort((a: any, b: any) => {
        if (a.default_order === null && b.default_order === null) return 0;
        if (a.default_order === null) return 1;
        if (b.default_order === null) return -1;
        return a.default_order - b.default_order;
      });

      console.log('Sorted lease options:', sortedOptions);

      // Set subOptions based on sorted data
      setQualitativeApproaachItems(sortedOptions);

      // Initialize dropdownFields to match the number of sorted subOptions
      const initialDropdownFields = sortedOptions.map(
        (option: any, index: any) => ({
          id: index + 1,
          value: option.code, // Set initial value based on option
          isTextField: false, // Track if this should be a text field
        })
      );

      setDropdownFields(initialDropdownFields);
    }
  }, [data]);
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
  }, [id, mutateAsync, leaseId]);

  useEffect(() => {
    refetch();
  }, [areaInfoData?.data?.data, leaseId, refetch]);
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
  const [hasIncomeType, setHasIncomeType] = useState(false);
  const [capRateType, setHasCapRateType] = useState(false);
  const [hasRentRollType, setHasRentRollType] = useState(false);

  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [salesNote, setSalesNote] = useState('');
  const [leaseCompNote, setLeaseCompNote] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [hasLeaseType, setHasLeaseType] = React.useState(false);

  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filteredCapRateData, setFilteredCapRateData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  const [filtereRentRolldData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereLeasedData, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  useEffect(() => {
    if (areaInfoData?.data?.data?.scenarios && !areaInfoData.isStale) {
      const updateData = areaInfoData.data.data.scenarios;
      const salesApproaches = updateData.filter(
        (item: { has_sales_approach: any }) => item.has_sales_approach === 1
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
        (item: { has_income_approach: any }) => item.has_income_approach === 1
      );
      setHasIncomeType(incomeApproaches.length > ListingEnum.ZERO);
      setFilteredData(incomeApproaches);

      const leaseApproaches = updateData.filter(
        (item: { has_lease_approach: any }) => item.has_lease_approach === 1
      );
      setHasLeaseType(leaseApproaches.length > ListingEnum.ZERO);
      setFilteredLeaseData(leaseApproaches);
      const capApproaches = updateData.filter(
        (item: { has_cap_approach: any }) => item.has_cap_approach === 1
      );
      setHasCapRateType(capApproaches.length > ListingEnum.ZERO);
      setFilteredCapRateData(capApproaches);
    }
  }, [areaInfoData?.data?.data?.senarios]);

  const appraisalData: any = areaInfoData?.data.data || {};
  // const getLabelFromValue1 = (value: any) => {
  //   if (!value || value === ListingEnum.SELECT_A_SUBTYPE) {
  //     return '';
  //   }
  //   const allOptions = [
  //     ...propertyTypeOptions,
  //     ...retailOptions,
  //     ...officeOptions,
  //     ...industrialOptions,
  //     ...multifamilyOptions,
  //     ...hospitalityOptions,
  //     ...specialOptions,
  //     ...residentialOptions,
  //     ...conditionOptions,
  //     ...topographyOptions,
  //     ...landTypeOptions,
  //   ];
  //   // Check if value matches any of the options
  //   const option = allOptions.find((option) => option.value === value);
  //   if (option) {
  //     return option.label; // Return matched label if found
  //   }

  //   // If no match, return the value as is without capitalizing
  //   return capitalizeWords(value);
  // };

  console.log(
    appraisalData.comp_type,
    appraisalData.analysis_type,
    'appraisalData.comp_type'
  );
  console.log(appraisalData?.net_operating_income, 'net_operating_income1234');
  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[appraisalData.state];

  const appraisalApproach = areaInfoData?.data?.data?.scenarios?.find(
    (approach: any) => (leaseId ? approach.id == parseFloat(leaseId) : false)
  );

  const appraisalSalesApproachId =
    appraisalApproach && appraisalApproach.evaluation_lease_approach
      ? appraisalApproach.evaluation_lease_approach.id
      : null;

  console.log('appraisalApproach:', appraisalApproach);
  console.log('appraisalSalesApproachId:', appraisalSalesApproachId);

  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `evaluations/get-lease-approach?evaluationId=${id}&evaluationScenarioId=${leaseId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;
      setCompsLength(compsArr?.length || 0);

      localStorage.setItem(LocalStorageKeysEnum.COMPS_LENGTH_LEASE, compsArr.length);

      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      console.log(
        'fetchComposData - appraisalSalesApproachResponseId:',
        appraisalSalesApproachResponseId
      );
      const salesNoteForComp = response?.data?.data?.data?.notes;
      const leaseComNote = response?.data?.data?.data?.lease_comps_notes;
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
      const defaultOperatingExpensesInitial = [
        { adj_key: ListingEnum.TIME, adj_value: ListingEnum.TIME_CAPITAL, comparison_basis: ListingEnum.ZERO },
        {
          adj_key: ListingEnum.OPERATING_EXP,
          adj_value: ListingEnum.OPERATING_EXPENSES,
          comparison_basis: ListingEnum.ZERO,
        },
        { adj_key: CreateCompsEnum.LOCATION_LOWER, adj_value: CreateCompsEnum.LOCATION, comparison_basis: ListingEnum.ZERO },
        {
          adj_key: ListingEnum.CONSTRUCTION,
          adj_value: ListingEnum.CONSTRUCTION_CAPITAL,
          comparison_basis: ListingEnum.ZERO,
        },
        { adj_key: BuildingDetailsEnum.CONDITION, adj_value: CreateCompsEnum.CONDITION, comparison_basis: ListingEnum.ZERO },
        { adj_key: PayloadFieldsEnum.TYPE, adj_value: PayloadFieldsEnum.TYPE_USE, comparison_basis: ListingEnum.ZERO },

        {
          adj_key: ListingEnum.ECONOMIES_OF_SCALE,
          adj_value: ListingEnum.ECONOMIES_OF_SCALE_,
          comparison_basis: ListingEnum.ZERO,
        },
      ];

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

          // const isCustom = !options.some(
          //   (option: { value: any }) => option.value === newValue.adj_value
          // );
          return {
            ...oe,
            adj_key: newValue.adj_key,
            adj_value: newValue.adj_value || ListingEnum.ZERO,
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
        const avgpsf =
          (total / ListingEnum.HUNDRED) * c?.comp_details?.price_square_foot +
          c?.comp_details?.price_square_foot;
        const finalavgpsf = (avgpsf * weight) / ListingEnum.HUNDRED;

        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          expenses: formattedExpenses || defaultOperatingExpensesInitial,
          quantitativeAdjustments: formattedQualitativeApproach,
          id: c.id,
          comp_id: c.comp_id,
          averaged_adjusted_psf: finalavgpsf,
          blended_adjusted_psf: c.blended_adjusted_psf,
          weight: c.weight,
          total: c.total_adjustment,
          adjustment_note: c?.adjustment_note,
        });
      }

      setValues({
        ...values,
        tableData: calculatedComps,
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
  }, [leaseId]);
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
        'leaseApproachValues',
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

  function transformComparitiveAdjustment(appraisalSpecificAdjustment: any[]) {
    return appraisalSpecificAdjustment?.map((expense) => ({
      comparison_key: expense?.comparison_key
        ?.toLowerCase()
        ?.replace(/\s+/g, '_'),
      comparison_value: expense?.comparison_value,
    }));
  }
  const subject_qualitative_adjustments =
    transformsalesCompQualitativeAdjustmentToAdjustments(
      values.salesCompQualitativeAdjustment
    );
  const sales_comparison_attributes = transformComparitiveAdjustment(
    values.appraisalSpecificAdjustment
  );

  let minAveragedAdjustedPsf = Infinity; // Set to a very high value
  let maxAveragedAdjustedPsf = -Infinity; // Set to a very low value
  // values.tableData.forEach((comp: { adjusted_psf?: string }) => {
  //   const value = parseFloat(comp.adjusted_psf ?? '');

  //   if (!isNaN(value)) {
  //     if (value < minAveragedAdjustedPsf) minAveragedAdjustedPsf = value;
  //     if (value > maxAveragedAdjustedPsf) maxAveragedAdjustedPsf = value;
  //   }
  // });
  values.tableData.forEach((comp: any) => {
    console.log('Processing comp:', comp, 'adjusted_psf:', comp.adjusted_psf); // Debug each comp

    // Handle both string and number types
    let value: number;
    if (typeof comp.adjusted_psf === 'string') {
      value = parseFloat(comp.adjusted_psf);
    } else if (typeof comp.adjusted_psf === 'number') {
      value = comp.adjusted_psf;
    } else {
      value = NaN;
    }

    console.log('Parsed value:', value, 'isNaN:', isNaN(value)); // Debug parsed value

    if (!isNaN(value) && value > 0) {
      if (value < minAveragedAdjustedPsf) minAveragedAdjustedPsf = value;
      if (value > maxAveragedAdjustedPsf) maxAveragedAdjustedPsf = value;
    }
  });
  // Handle cases where no valid adjusted_psf values are found
  if (minAveragedAdjustedPsf === Infinity) minAveragedAdjustedPsf = ListingEnum.ZERO;
  if (maxAveragedAdjustedPsf === -Infinity) maxAveragedAdjustedPsf = ListingEnum.ZERO;

  console.log(
    'Minimum:',
    minAveragedAdjustedPsf,
    'Maximum:',
    maxAveragedAdjustedPsf
  );

  let totalWeightage: number = ListingEnum.ZERO;

  values.tableData.forEach((comp: { weight: string }) => {
    if (comp.weight) {
      totalWeightage += parseFloat(comp.weight);
    }
  });

  const comps = values.tableData?.map((item: any, index: number) => {
    const comps_adjustments =
      item.expenses?.map((exp: any) => ({
        adj_key: exp.adj_key,
        adj_value: exp.adj_value,
        // isCustom:false
      })) || [];

    const comps_qualitative_adjustments =
      item.quantitativeAdjustments?.map((qualExp: any) => ({
        adj_key: qualExp.adj_key ? qualExp.adj_key.replace(/\s+/g, '_') : '',
        adj_value: qualExp.adj_value,
      })) || [];

    const comp_id = item.comp_id || item.id;
    console.log('itemlease', item);
    return {
      ...(appraisalSalesApproachId ? { id: item.id } : {}),

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

  const salesApproachData = {
    ...(appraisalSalesApproachId || appraisalId
      ? { id: appraisalSalesApproachId || appraisalId }
      : {}),
    evaluation_scenario_id: leaseId ? parseFloat(leaseId) : null,

    // averaged_adjusted_psf: totalaveragedadjustedpsf,
    low_adjusted_comp_range: minAveragedAdjustedPsf.toString(),
    high_adjusted_comp_range: maxAveragedAdjustedPsf.toString(),

    weight: parseFloat(totalWeightage.toString()),
    notes: salesNote,
    lease_comps_notes: leaseCompNote,
    subject_property_adjustments: subject_property_adjustments,
    subject_qualitative_adjustments: subject_qualitative_adjustments,
    comparison_attributes: sales_comparison_attributes,

    // sales_approach_indicated_val: FinalResult,
    comps: comps,
  };

  const finalData = {
    evaluation_id: id ? parseFloat(id) : null,
    lease_approach: salesApproachData,
  };

  const mutation = useMutate<any, any>({
    queryKey: 'lease-sale-approach',
    endPoint: 'evaluations/save-lease-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'save-lease-approach',
    endPoint: 'evaluations/update-lease-approach',
    requestType: RequestType.POST,
  });

  const handleSubmit = async () => {
    console.log(
      'handleSubmit - appraisalSalesApproachId:',
      appraisalSalesApproachId
    );
    console.log('handleSubmit - appraisalId:', appraisalId);
    setLoader(true);
    try {
      let response;
      if (appraisalSalesApproachId || appraisalId) {
        // Update API - include ID in lease_approach
        const updatePayload = {
          ...finalData,
          lease_approach: {
            ...finalData.lease_approach,
            id: appraisalSalesApproachId || appraisalId,
          },
        };
        console.log('Using UPDATE API with payload:', updatePayload);
        response = await mutations.mutateAsync(updatePayload);
        fetchComposData(values, setValues);
      } else {
        // Add API
        console.log('Using ADD API with payload:', finalData);
        const modifiedPayload = {
          ...finalData,
          lease_approach: {
            ...finalData.lease_approach,
            comps: finalData.lease_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
        if (response?.data?.data?.id) {
          setAppraisalId(response.data.data.id);
        }
      }

      if (response && response.data && response.data.message) {
        toast.success(response.data.message);
        setLoader(false);
        navigate(`/evaluation/lease-comps-map?id=${id}&leaseId=${leaseId}`);
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
          lease_approach: {
            ...finalData.lease_approach,
            comps: finalData.lease_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        navigate(
          `/evaluation/update-lease-comps/${itemId}/${id}/lease/${leaseId}`
        );
      }
    } catch (error) {
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };
  const handleDeleteComp = async () => {
    try {
      let response;
      if (appraisalSalesApproachId) {
        // Update API
        response = await mutations.mutateAsync(finalData);
        toast.success(response.data.message);

        await fetchComposData(values, setValues);
        // window.location.reload(); // Add this line
        // navigate(0);
      } else {
        // Add API
        const modifiedPayload = {
          ...finalData,
          lease_approach: {
            ...finalData.lease_approach,
            comps: finalData.lease_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
        refetch();
        // await fetchComposData(values, setValues);

        // window.location.reload(); // Add this line
        // navigate(0);
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
          lease_approach: {
            ...finalData.lease_approach,
            comps: finalData.lease_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        // toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };
  const handleAddNewComp = () => {
    localStorage.setItem(LocalStorageKeysEnum.CHECK_STATUS, PayloadFieldsEnum.LEASE);
    localStorage.setItem(LocalStorageEnum.CHECK_TYPE, LocalStorageEnum.LEASES_CHECKBOX);
    localStorage.removeItem(LocalStorageKeysEnum.SELECTED_TOGGLE);
    localStorage.removeItem(LocalStorageKeysEnum.VIEW);
    localStorage.setItem(LocalStorageKeysEnum.COMPS_LENGTH_LEASE_EVALUATION, compsLength);

    navigate(`/evaluation/filter-lease-comps?id=${id}&approachId=${leaseId}`, {
      state: { comparisonBasis: comparisonBasis, compsLength: compsLength },
    });
  };
  const handleLinkExistingComps = () => {
    navigate(`/evaluation/lease/create-comp?id=${id}&approachId=${leaseId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };
  const uploadComps = () => {

    localStorage.setItem(LocalStorageKeysEnum.COMPS_LENGTH_LEASE_EVALUATION, compsLength);
    // Preserve the current compsType to prevent automatic change to 'building_with_land'
    localStorage.setItem(LocalStorageKeysEnum.PRESERVED_ACTIVE_TYPE, compsType || MenuOptionsEnum.BUILDING_WITH_LAND
    );

    navigate(`/evaluation/upload-lease-comps?id=${id}&leaseId=${leaseId}`, {
      state: {
        operatingExpenses: values.operatingExpenses,
        salesCompQualitativeAdjustment: values.salesCompQualitativeAdjustment,
        appraisalSpecificAdjustment: values.appraisalSpecificAdjustment,
      },
    });
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

  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    try {
      // Recalculate totals with updated comps
      let updatedMinAveragedAdjustedPsf = Infinity;
      let updatedMaxAveragedAdjustedPsf = -Infinity;
      let updatedTotalWeightage: number = ListingEnum.ZERO;

      updatedComps.forEach((comp: any) => {
        const value = parseFloat(comp.adjusted_psf ?? '');
        if (!isNaN(value)) {
          if (value < updatedMinAveragedAdjustedPsf)
            updatedMinAveragedAdjustedPsf = value;
          if (value > updatedMaxAveragedAdjustedPsf)
            updatedMaxAveragedAdjustedPsf = value;
        }
        if (comp.weight) {
          updatedTotalWeightage += parseFloat(comp.weight);
        }
      });

      if (updatedMinAveragedAdjustedPsf === Infinity)
        updatedMinAveragedAdjustedPsf = ListingEnum.ZERO;
      if (updatedMaxAveragedAdjustedPsf === -Infinity)
        updatedMaxAveragedAdjustedPsf = ListingEnum.ZERO;

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
        ...(appraisalSalesApproachId || appraisalId
          ? { id: appraisalSalesApproachId || appraisalId }
          : {}),
        evaluation_scenario_id: leaseId ? parseFloat(leaseId) : null,
        low_adjusted_comp_range: updatedMinAveragedAdjustedPsf.toString(),
        high_adjusted_comp_range: updatedMaxAveragedAdjustedPsf.toString(),
        weight: parseFloat(updatedTotalWeightage.toString()),
        notes: salesNote,
        lease_comps_notes: leaseCompNote,
        subject_property_adjustments: subject_property_adjustments,
        subject_qualitative_adjustments: subject_qualitative_adjustments,
        comparison_attributes: sales_comparison_attributes,
        comps: updatedCompsData,
      };

      const updatedFinalData = {
        evaluation_id: id ? parseFloat(id) : null,
        lease_approach: updatedSalesApproachData,
      };

      let response;
      if (appraisalSalesApproachId || appraisalId) {
        response = await mutations.mutateAsync(updatedFinalData);
        fetchComposData(values, setValues);
      } else {
        const modifiedPayload = {
          ...updatedFinalData,
          lease_approach: {
            ...updatedFinalData.lease_approach,
            comps: updatedFinalData.lease_approach.comps,
          },
        };
        response = await mutation.mutateAsync(modifiedPayload);
        if (response?.data?.data?.id) {
          console.log('New approach ID:', response.data.data.id);
          setAppraisalId(response.data.data.id);
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

  const passCompsDataToFilter = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = ListingEnum.HUNDRED / totalComps.length;
      let count: number = ListingEnum.ZERO;

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

  const passCompsDataToFilter1 = (comps: any) => {
    console.log('cashkahsdkjahsdjkhas', comps);

    setValues((oldValues: { tableData: any }) => {
      const totalComps = [...oldValues.tableData, ...comps];
      const newInitialWeight: number = ListingEnum.HUNDRED / totalComps.length;
      let count: number = ListingEnum.ZERO;
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

  const handleDeleteCard = (index: number) => {
    setValues((oldValues: { tableData: any }) => {
      const updatedTableData = oldValues.tableData.filter(
        (_: any, innerIndex: number) => index !== innerIndex
      );

      const newInitialWeight = updatedTableData.length
        ? ListingEnum.HUNDRED / updatedTableData.length
        : ListingEnum.ZERO;
      let count: number = ListingEnum.ZERO;

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

  // const capitalizeWords = (str: string | null | undefined) => {
  //   if (!str) return ''; // return empty string or handle as needed

  //   return str
  //     .split(/[_\s]+/)
  //     .map(
  //       (word: string) =>
  //         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  //     )
  //     .join(' ');
  // };

  // const findCondition = (conditionOptions: any) => {
  //   const foundItem = conditionOptions.find(
  //     (item: { value: string }) => item?.value === appraisalData?.condition
  //   );

  //   // If foundItem exists and its label is the default option, return an empty string
  //   if (foundItem && foundItem.label === '--Select Property Condition--') {
  //     return '';
  //   }

  //   // If a match is found, return its label
  //   if (foundItem) {
  //     return foundItem.label;
  //   }

  //   // If no match is found and appraisalData.condition is defined, capitalize it
  //   if (appraisalData?.condition) {
  //     return capitalizeWords(appraisalData.condition);
  //   }

  //   // If condition is not defined, return null
  //   return null;
  // };

  const formattedDropdownOptions = [
    ...qualitativeApproachItems
      .filter((option: any) => option.evaluation_default === 1)
      .sort((a: any, b: any) => {
        if (a.default_order === null && b.default_order === null) return 0;
        if (a.default_order === null) return 1;
        if (b.default_order === null) return -1;
        return a.default_order - b.default_order;
      })
      .map((option) => ({
        value: option.code,
        label: option.name,
      })),
    { value: 'type_my_own', label: 'Type My Own' }
  ];

  console.log('Lease formattedDropdownOptions:', formattedDropdownOptions); // Debug log

  const formattedQualitativeDropdownOptions = quanitativeApproaachItems.map(
    (option) => ({
      value: option.code,
      label: option.name,
    })
  );
  const editorText = (event: any) => {
    setValues((oldValues: any) => {
      const updatedTableData = [...oldValues.tableData];
      updatedTableData[indexType].adjustment_note = event;
      return {
        ...oldValues,
        tableData: updatedTableData,
      };
    });
  };
  // const editorText1 = (event: any) => {
  //   setSalesNote(event);
  // };
  const handleSave = () => {
    // handleSaveAdjustmentNote();
    // setOpen(false);
    setSalesNote(editorValue);
    setNoteModalOpen(false);
  };

  const [loading, setLoading] = useState(true);

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
  const handlePropertyNotes = () => {
    setEditorValue(salesNote.slice(0, 250));
    setNoteModalOpen(true);
  };

  // format number only for formatting

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
      ...propertyTypeOptions,
      ...landTypeOptions,
    ];

    // Check if value matches any of the options
    const option = allOptions.find((option: any) => option.value === value);
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, return the value as is without capitalizing
    return value;
  };

  return (
    <EvaluationMenuOptions>
      {openComps && (
        <UploadSalesCompsModal
          open={openComps}
          onClose={() => setCompsOpen(false)}
          compsLength={compsLength}
          setCompsModalOpen={setCompsModalOpen}
          setCompsData={setCompsData}
          compsData={compsData ?? []} // Avoid passing null where an array is needed
        />
      )}
      {compsModalOpen && (
        <EvaluationCompsAiDataForm
          passCompsData={passCompsDataToFilter1}
          open={compsModalOpen}
          compsLength={compsLength}
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
          {CreateCompsEnum.LEASE_COMPS}{' '}
          <span>{salesApproachName ? `(${salesApproachName})` : ''} </span>
        </Typography>

        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">
            {CreateCompsEnum.VALUE_LEASE_COMPS}
          </span>
        </div>
      </div>
      {/* <div className="overflow-auto h-[calc(100vh-280px)]"> */}
      <div className="flex flex-wrap items-start space-x-2 mb-20 xl:px-[44px] px-[15px]">
        <div className="flex flex-col w-[15.5%]">
          <h3 className="px-4 py-5 text-base capitalize invisible font-semibold">
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
                {CreateCompsEnum.DATE_LEASED}
              </p>
              {localStorage.getItem(LocalStorageKeysEnum.ACTIVE_TYPE) === ListingEnum.BUILDING_WITH_LAND && (
                <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                  {MenuOptionsEnum.PROPERTY_TYPE}
                </p>
              )}
              {localStorage.getItem(LocalStorageKeysEnum.ACTIVE_TYPE) === ListingEnum.LAND_ONLY && (
                <p className="pb-1 text-xs font-bold text-gray-500 truncate">
                  {SiteDetailsEnum.LAND_TYPE}
                </p>
              )}
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
            <div className="border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5] pb-2">
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
                                      old.operatingAllExpensesInitial?.find(
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

                                  fontWeight: 400,
                                  padding: '0',
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
                <div className="flex flex-col py-1">
                  {values.salesCompQualitativeAdjustment &&
                    values.salesCompQualitativeAdjustment.length > 0 ? (
                    values.salesCompQualitativeAdjustment.map(
                      (zone: any, i: number) => {
                        // Log the index if adj_key is 'building_size'

                        return (
                          <div
                            className="flex items-center quantitate-items justify-between gap-1 h-[18px]"
                            key={i}
                          >
                            <Grid
                              item
                              className="min-w-[calc(100%-36px)] manageDropdownField w-full"
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
                                    width: '179px', // Increase width here as needed, e.g., 200px
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

                                    fontWeight: 400,
                                    padding: '0',
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
                                    style={{ width: '14px', height: '18px' }}
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

                                <Icons.RemoveCircleOutlineIcon
                                  className="text-red-500 cursor-pointer"
                                  style={{
                                    width: '14px',
                                    cursor: 'pointer',
                                    height: '18px',
                                  }}
                                  onClick={() => {
                                    setValues((old: any) => {
                                      const salesCompQualitativeAdjustment =
                                        old.salesCompQualitativeAdjustment.filter(
                                          (_: any, index: number) => index !== i
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
                      {CreateCompsEnum.NO_SALES_COMP_DATA}
                    </p>
                  )}
                </div>
              )}
            />

            {/* //-----------------------------------------------------------------------------------? */}
            <div className="border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] px-1 flex items-center h-10">
              <p className="text-xs font-bold border-below">{CreateCompsEnum.NOTES}</p>
            </div>
            <div className="mt-2 flex flex-col gap-[2px]">
              <p className="text-xs h-[18px] !m-0 font-semibold italic text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>
              {comparisonBasis === 'Bed' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_DOLLAR_PER_BED}{' '}
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_DOLLAR_PER_UNIT}
                </p>
              ) : analysisType === '$/Acre' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted $/AC
                </p>
              ) : (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_DOLLAR_PER_SF}
                </p>
              )}
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.WEIGHTING}
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
              {/* <div>
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
              </div> */}
            </div>

            <div className="p-1 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              {values.appraisalSpecificAdjustment?.length > ListingEnum.ZERO ? (
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
            <div className="px-1 flex flex-col gap-[2.5px] border-solid border-b border-l-0 pb-0 border-r-0 border-t-0 border-[#d5d5d5] pb-2">
              {values.operatingExpenses?.length > ListingEnum.ZERO
                ? values.operatingExpenses.map((index: number) => (
                  <p
                    key={index}
                    className={`text-xs font-bold h-[18.3px] text-ellipsis overflow-hidden whitespace-nowrap ${!appraisalData.operatingExpenses?.[index]?.names ? 'text-transparent' : ''}`}
                  // style={{ lineHeight: '4em' }}
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
                      className="text-xs font-bold text-transparent"
                      style={{ lineHeight: '0rem!important' }}
                    >
                      {CreateCompsEnum.NO_DATA}
                    </p>
                  )
                )}
            </div>
            <div className="flex flex-col py-1">
              {values.salesCompQualitativeAdjustment.map(
                (field: any, idx: number) => {
                  const isBuildingSize = field.adj_key === 'building_size';
                  const isSidewallHeight = field.adj_key === 'sidewall_height';
                  const isOfficeArea = field.adj_key === 'office_area';
                  return (
                    <div
                      key={field.id}
                      className="px-2 subject-property-input h-[17.5px] flex flex-col items-end relative"
                    >
                      <StyledField
                        name={`subjectProperty.${idx}`}
                        style={{
                          borderBottomWidth: '1px',
                          color: 'black',
                          padding: '0',
                          height: '17.5px',
                          paddingRight: isSidewallHeight ? '24px' : undefined,
                          boxSizing: 'border-box',
                        }}
                        value={
                          isBuildingSize
                            ? appraisalData.building_size !== null
                              ? appraisalData.building_size === ListingEnum.ZERO
                                ? 'N/A'
                                : appraisalData.building_size?.toLocaleString() +
                                ' SF'
                              : 'N/A'
                            : field?.subject_property_value || ''
                        }
                        disabled={isBuildingSize}
                        onKeyDown={(e: any) => {
                          // Allow Ctrl + A / Cmd + A for text selection
                          if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                            return; // Let the browser handle it
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
                            } else if (e.key === '-' && nStr.length === ListingEnum.ZERO) {
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
                                          ? appraisalData?.building_size?.toString()
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
                                            ? appraisalData.building_size.toString()
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
                            // Allow only integers and Backspace for sidewall_height
                            if (!/^\d*$/.test(e.key) && e.key !== 'Backspace') {
                              e.preventDefault();
                            }
                          }
                        }}
                        onChange={(e: any) => {
                          if (isSidewallHeight) {
                            // Format value with commas for sidewall_height
                            const onlyDigits = e.target.value.replace(
                              /\D/g,
                              ''
                            );

                            // If the input is cleared (empty), set the value to an empty string
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
                                        ? formattedValue // Set the cleared value to an empty string
                                        : expense.subject_property_value,
                                  })
                                );

                              return {
                                ...old,
                                salesCompQualitativeAdjustment,
                              };
                            });
                          } else if (!isOfficeArea) {
                            // Handle other fields' onChange normally
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

                      // onChange={(e: any) => {
                      //   if (isSidewallHeight) {
                      //     // Format value with commas for sidewall_height
                      //     const onlyDigits = e.target.value.replace(/\D/g, '');
                      //     const formattedValue =
                      //       Number(onlyDigits).toLocaleString();

                      //     setValues((old: any) => {
                      //       const salesCompQualitativeAdjustment =
                      //         old.salesCompQualitativeAdjustment.map(
                      //           (expense: any, expenseIndex: number) => ({
                      //             ...expense,
                      //             subject_property_value:
                      //               expenseIndex === idx
                      //                 ? formattedValue
                      //                 : expense.subject_property_value,
                      //           })
                      //         );

                      //       return {
                      //         ...old,
                      //         salesCompQualitativeAdjustment,
                      //       };
                      //     });
                      //   } else if (!isOfficeArea) {
                      //     // Handle other fields' onChange normally
                      //     const newValue = e.target.value;

                      //     setValues((old: any) => {
                      //       const salesCompQualitativeAdjustment =
                      //         old.salesCompQualitativeAdjustment.map(
                      //           (expense: any, expenseIndex: number) => ({
                      //             ...expense,
                      //             subject_property_value:
                      //               expenseIndex === idx
                      //                 ? newValue
                      //                 : expense.subject_property_value,
                      //           })
                      //         );

                      //       return {
                      //         ...old,
                      //         salesCompQualitativeAdjustment,
                      //       };
                      //     });
                      //   }
                      // }}
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
            </div>

            <div className="px-1  border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] flex items-center h-10">
              <p
                className="text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap border-below text-[#0DA1C7] cursor-pointer"
                onClick={handlePropertyNotes}
              >
                {ListingEnum.ADD_NOTES}
              </p>
            </div>

            <div className="mt-2 px-1 flex flex-col gap-[2px] pb-2">
              <p
                className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>

              <p
                className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>

              <p className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap">
                {totalWeightage.toFixed(2) + '%'}
              </p>
              <p className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap">
                {minAveragedAdjustedPsf
                  ? formatPrice(minAveragedAdjustedPsf)
                  : ''}
                {minAveragedAdjustedPsf && maxAveragedAdjustedPsf ? ' - ' : ''}
                {maxAveragedAdjustedPsf
                  ? formatPrice(maxAveragedAdjustedPsf)
                  : ''}
              </p>
            </div>
          </div>
        </div>
        {!className || !open
          ? values.tableData?.map((item: any, index: any) => (
            <Card
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
              open={open}
              setOpen={setOpen}
              indexType={indexType}
              setIndexType={setIndexType}
              setClassName={setClassName}
              setAdjustmentData={setAdustmentData}
              id={id}
              leaseId={leaseId}
            />
          ))
          : values?.tableData?.map((item: any, index: any) =>
            index === indexType ? (
              <div key={item.id}>
                <Card
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
                  open={open}
                  setOpen={setOpen}
                  indexType={indexType}
                  setIndexType={setIndexType}
                  setClassName={setClassName}
                  setAdjustmentData={setAdustmentData}
                  id={id}
                  leaseId={leaseId}
                />
              </div>
            ) : null
          )}

        {values.tableData.length == 4 ? null : (
          <>
            <div className="flex flex-col items-center space-y-6 mt-16 w-[15.5%]">
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
                className="flex flex-col items-center justify-center w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer"
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

      <div className="px-[60px] pb-32">
        <h4 className="text-gray-800 text-xs font-medium font-bold">
          Lease Notes
        </h4>
        <TextEditor
          editorData={(content) => setLeaseCompNote(content)}
          editorContent={
            leaseCompNote ||
            '<strong>Even</strong>: No Adjustment, Similar to Subject Property. <strong>Minus</strong>: Downward adjustment, Better than/Superior to Subject Property. <strong>Plus</strong>: Upward Adjustment Poorer than/Inferior to Subject Property.'
          }
          value={leaseCompNote} // Ensure the 'value' prop is provided
        />
      </div>
      <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5">
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            if (hasLeaseType && filtereLeasedData.length > 1) {
              const leaseIndex = filtereLeasedData.findIndex(
                (element) => element.id == leaseId
              );

              if (leaseIndex > 0) {
                const leaseIdRedirectIndex =
                  filtereLeasedData[leaseIndex - 1].id;
                navigate(
                  `/evaluation/lease-comps-map?id=${id}&leaseId=${leaseIdRedirectIndex}`
                );
                return;
              }
            }
            if (hasSaleType) {
              navigate(
                `/evaluation/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
              );
              return;
            }
            if (hasRentRollType) {
              navigate(
                `/rent-roll?id=${id}&appraisalId=${filtereRentRolldData?.[filtereRentRolldData.length - 1]?.id}`
              );
              return;
            }
            if (capRateType) {
              navigate(
                `/evaluation/cap-comps-map?id=${id}&capId=${filteredCapRateData?.[filteredCapRateData.length - 1]?.id}`
              );
              return;
            }
            if (hasIncomeType) {
              navigate(
                `/evaluation/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - 1]?.id}`
              );
              return;
            } else {
              navigate(`/evaluation-area-info?id=${id}`);
            }
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
      {/* </div> */}
      <EvaluationLeaseApproachAdjustmentNotesModal
        open={open}
        setOpen={setOpen}
        indexType={indexType}
        editorText={editorText}
        adjustmentData={adjustmentData}
        handleSave={handleSave}
        // indexType={indexType}
        values={values}
      />
      <EvaluationLeaseApproachCompsNote
        open={noteModalOpen}
        setNoteModalOpen={setNoteModalOpen}
        editorText={setEditorValue}
        handleSave={handleSave}
        salesNote={editorValue.slice(0, 250)}
      />
    </EvaluationMenuOptions>
  );
};

export default EvaluationLeaseApproach;

function Card({
  index,
  item,
  values,
  totalCards,
  appraisalData,
  handleDelete,
  handleNavigateToComp,
  // subjectcompType,
  setOpen,
  setIndexType,
  setClassName,
  setAdjustmentData,
  id,
  leaseId,
}: {
  item: any;
  appraisalData: any;
  handleChange: any;
  values: any;
  totalCards: number;
  index: any;
  dimension: any;
  handleNavigateToComp: any;
  handleDeleteComp: any;
  handleSaveAdjustmentNote: any;
  subjectcompType: any;
  dropdownField: any;
  setDropdownField: any;
  setSubOption: any;
  subOption: any;
  handleDelete: (id: number) => void;
  open: any;
  setOpen: any;
  indexType: any;
  setIndexType: any;
  setClassName: any;
  setAdjustmentData: any;
  id: any;
  leaseId: any;
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to manage modal visibility
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  // end of delete confirmation modal
  const [error, setError] = useState('');
  // const [open, setOpen] = useState(false);
  const [quantitativeOptions, setQuantitativeOptions] = useState([]);
  // const [note] = useState(item?.adjustment_note || '');
  const { setValues } = useFormikContext<any>();
  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[item?.state];
  const handleOpen = (item: any, index: any) => {
    setAdjustmentData(item);
    setClassName(true);
    setIndexType(index);
    setOpen(true);
  };
  let total: number = ListingEnum.ZERO;
  item.expenses?.forEach((exp: any) => {
    const expNum = exp.comparison_basis
      ? +exp.comparison_basis.split('%')[0]
      : 0;
    total += expNum;
  });
  const addTotalAsPercentageToPriceSquareFoot = (
    priceSquareFoot: number,
    total: any
  ) => {
    const percentageIncrease = (total / ListingEnum.HUNDRED) * priceSquareFoot;
    return priceSquareFoot + percentageIncrease;
  };

  const adjustedPricepercentage: number =
    item.price_square_foot === ListingEnum.ZERO
      ? 0
      : addTotalAsPercentageToPriceSquareFoot(item.price_square_foot, total);

  const calculateWeightage = (totalCards: number): string => {
    if (totalCards <= ListingEnum.ZERO) {
      return 'NA';
    }
    return (ListingEnum.HUNDRED / totalCards).toFixed(2);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: any
  ) => {
    let nStr = values.tableData[index].weight;
    const { selectionStart, selectionEnd }: any = event.target;

    if (
      event.keyCode === ListingEnum.EIGHT &&
      selectionStart === ListingEnum.ZERO &&
      selectionEnd >= nStr.length
    ) {
      nStr = ''; // Clear all data
    } else if (event.keyCode === 8) {
      // Backspace: remove the last character if not everything is selected
      nStr = nStr.slice(0, -1);
    } else if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Backspace'
    ) {
      // Allow arrow keys and backspace
      return;
    } else if (event.key === '-') {
      // Allow negative sign at the start
      if (nStr.length === ListingEnum.ZERO) {
        nStr = '-';
      }
      return;
    }
    // Allow negative numbers
    let sanitizedValue = nStr.replace(/[^0-9.-]/g, '');
    if (sanitizedValue.indexOf('-') > 0) {
      sanitizedValue = sanitizedValue.replace(/-/g, '');
    }

    const inputWeightage = +sanitizedValue;
    const maxWeightage = +calculateWeightage(totalCards);

    if (inputWeightage > maxWeightage) {
      setError(CreateCompsEnum.ENSURE_WEIGHTAGE_HUNDRED_PERCENT);
    } else {
      setError('');
    }

    setValues((oldValues: { tableData: { [x: string]: any } }) => {
      const comp = oldValues.tableData[index];
      const expenses = [...comp.expenses];
      const weight = sanitizedValue;

      const { total, expenses: updatedExpenses } = getExpensesTotal(
        expenses,
        undefined,
        undefined
      );

      const calculatedCompData = calculateCompData({
        total,
        weight,
        comp,
        appraisalData,
      });
      const updatedCompData = {
        ...comp,
        ...calculatedCompData,
      };
      oldValues.tableData[index] = {
        ...updatedCompData,
        expenses: updatedExpenses,
        total,
      };

      const totalAverageAdjustedPsf = oldValues.tableData.reduce(
        (acc: any, item: { averaged_adjusted_psf: any }) => {
          return acc + item.averaged_adjusted_psf;
        },
        0
      );
      return { ...oldValues, averaged_adjusted_psf: totalAverageAdjustedPsf };
    });
    updateCardsValue(sanitizedValue, index);
  };
  // Handle input change
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: any
  ) => {
    const value = event.target.value;
    // Allow negative numbers
    let sanitizedValue = value.replace(/[^0-9.-]/g, '');
    if (sanitizedValue.indexOf('-') > 0) {
      sanitizedValue = sanitizedValue.replace(/-/g, '');
    }

    const parts = sanitizedValue.split('.');

    if (parts.length > ListingEnum.TWO || (parts.length === ListingEnum.TWO && parts[1].length > ListingEnum.TWO)) {
      return;
    }

    const inputWeightage = +sanitizedValue;
    const maxWeightage = +calculateWeightage(totalCards);

    if (inputWeightage > maxWeightage) {
      setError(CreateCompsEnum.ENSURE_WEIGHTAGE_HUNDRED_PERCENT);
    } else {
      setError('');
    }

    setValues((oldValues: { tableData: { [x: string]: any } }) => {
      const comp = oldValues.tableData[index];
      const expenses = [...comp.expenses];
      const weight = sanitizedValue;

      const { total, expenses: updatedExpenses } = getExpensesTotal(
        expenses,
        undefined,
        undefined
      );

      const calculatedCompData = calculateCompData({
        total,
        weight,
        comp,
        appraisalData,
      });
      const updatedCompData = {
        ...comp,
        ...calculatedCompData,
      };
      oldValues.tableData[index] = {
        ...updatedCompData,
        expenses: updatedExpenses,
        total,
      };

      const totalAverageAdjustedPsf = oldValues.tableData.reduce(
        (acc: any, item: { averaged_adjusted_psf: any }) => {
          return acc + item.averaged_adjusted_psf;
        },
        0
      );
      return { ...oldValues, averaged_adjusted_psf: totalAverageAdjustedPsf };
    });
    // setWeightages(inputWeightage);
    updateCardsValue(sanitizedValue, index);
  };

  const fetchGlobalCodes = async () => {
    try {
      // Make the API call using axios
      const response = await axios.get(`globalCodes`, {});

      if (response?.data?.data?.data) {
        // Filter for quantitative adjustments
        const filteredQuantitativeOptions = response.data.data.data
          .find((item: any) => item.type === 'qualitative_adjustments_dropdown')
          ?.options.filter((option: any) => option.code !== CustomFieldValuesEnum.TYPE_MY_OWN_LOWER);

        // Filter for qualitative adjustments (modify as needed)

        // Update state with the filtered options
        setQuantitativeOptions(filteredQuantitativeOptions || []);
      }
    } catch (error) {
      console.error(ListingEnum.ERROR_FETCHIN_DATA, error);
    }
  };
  useEffect(() => {
    // Call the fetch function when the component mounts
    fetchGlobalCodes();
  }, []);

  const updateCardsValue = (inputWeightage: string, index: undefined) => {
    let new_blended_adjusted_value = ListingEnum.ZERO;
    if (adjustedPricepercentage) {
      new_blended_adjusted_value =
        (adjustedPricepercentage * parseFloat(inputWeightage)) / ListingEnum.HUNDRED;
    }
    const new_average_adjusted_value =
      (parseFloat(item.price_square_foot) * parseFloat(inputWeightage)) / ListingEnum.HUNDRED;
    ({
      target: {
        value: values.tableData.map((td: any, tableIndex: undefined) => {
          if (index === tableIndex) {
            td.weight = inputWeightage;
            td.blended_adjusted_value = new_blended_adjusted_value;
            td.average_adjusted_value = new_average_adjusted_value;
          }

          return td;
        }),
        name: ListingEnum.TABLE_DATA,
      },
    });
  };

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
      ,
      ...landTypeOptions,
    ];
    // Check if value matches any of the options
    const option = allOptions?.find((option: any) => option?.value === value);
    if (option) {
      return option?.label; // Return matched label
    }

    // If no match, capitalize the first letter of each word
    return capitalizeWords(value);
  };

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
  return (
    <div className="flex flex-col w-[15.5%]">
      <h3 className="py-5 text-base capitalize invisible font-semibold">
        {CreateCompsEnum.SUBJECT_PROPERTY}
      </h3>
      <div key={item.id} className="bg-slate-100 flex-1">
        <div className="max-w-full h-[160px]">
          <img
            className="w-full h-[160px] object-cover"
            src={
              item.property_image_url
                ? import.meta.env.VITE_S3_URL + item.property_image_url
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
          <div className="flex h-[20px] gap-2 items-center test">
            <Link
              to={`/evaluation/update-lease-comps/${item.comp_id}/${id}/lease/${leaseId}`}
              className="flex"
            >
              <Icons.VisibleIcon
                onClick={() => handleNavigateToComp(item.comp_id)}
                style={{ color: 'rgb(13 161 199)', fontSize: '17px' }}
                className="cursor-pointer"
              />
            </Link>
            <Icons.DeleteIcon
              style={{ fontSize: '15px' }}
              className="cursor-pointer text-red-500"
              onClick={openDeleteModal} // Open the confirmation modal
            />
          </div>
          {isDeleteModalOpen && (
            <DeleteApproachConfirmationModal
              close={closeDeleteModal} // Close modal function
              deleteId={index} // Pass the index or item ID
              setArrayAfterDelete={() => {
                handleDelete(index); // Execute the delete function after confirmation
                closeDeleteModal(); // Close the modal after deletion
              }}
            />
          )}
          <div className="min-h-[40px] mt-2">
            {/* Street address on one line */}
            <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
              {item.street_address || 'No address available'}
            </h2>

            {/* City, state (uppercase), and zipcode on the next line */}
            <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
              {item.city ? item.city + ', ' : ''}
              {item.state ? item.state.toUpperCase() + ', ' : ''}
              {item.zipcode || ''}
            </h2>
          </div>


          {localStorage.getItem('activeType') === 'building_with_land' && (
            <p className="text-gray-500 text-xs font-medium pb-1 overflow-hidden whitespace-nowrap text-ellipsis min-h-[20px]">
              {getLabelFromValue1(item?.zonings[0]?.zone || '')} /{' '}
              {getLabelFromValue1(item?.zonings[0]?.sub_zone || '')}{' '}
            </p>
          )}
          {localStorage.getItem('activeType') === 'land_only' && (
            <p className="text-gray-500 text-xs font-medium pb-1 overflow-hidden whitespace-nowrap text-ellipsis min-h-[20px]">
              {getLabelFromValue1(item?.land_type)}
            </p>
          )}
        </div>
        <div className="p-1 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
          {values.appraisalSpecificAdjustment?.length > 0 ? (
            <CompsPropertyComparitiveAttributes
              values={values}
              item={item}
              fullStateName={fullStateName}
              getLabelFromValue={getLabelFromValue}
              appraisalData={appraisalData}
            />
          ) : (
            Array.from(
              { length: values.appraisalSpecificAdjustment?.length },
              (_, i) => (
                <p
                  key={i}
                  className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
                  style={{ lineHeight: '0rem!important' }}
                >
                  {CreateCompsEnum.NO_DATA}
                </p>
              )
            )
          )}
        </div>
        <div className="p-1 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
          <div className="w-full">
            {item.expenses?.map((expense: any, expenseIndex: any) => (
              <div key={expense.id} className="subjectPropertyCard">
                {appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR ? (
                  <div className="flex items-center h-[20.3px]">
                    <div className="flex items-center gap-2 w-full">
                      <TextField
                        type="text"
                        className="w-1/2 approchTextField [&_.MuiInputBase-formControl]:rounded-none"
                        value={
                          expense.adj_value === '-0'
                            ? sanitizeInputDollarSignComps(-0)
                            : sanitizeInputDollarSignComps(
                              parseFloat(expense.adj_value || 0).toFixed(2)
                            )
                        }
                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                          e.target.select();
                        }}
                        onKeyDown={(e) => {
                          // let nStr = expense.adj_value
                          //   ? `${expense.adj_value}`
                          //   : '';

                          let nStr = (e.target as HTMLInputElement).value || '';
                          nStr = nStr.replace(/[^0-9.-]/g, '');

                          // Handle when all the text is selected and backspace is pressed
                          const { selectionStart, selectionEnd }: any =
                            e.target;
                          if (
                            e.keyCode != 9 &&
                            e.keyCode != 39 &&
                            selectionStart === ListingEnum.ZERO &&
                            selectionEnd >=
                            sanitizeInputDollarSignComps(
                              parseFloat(expense.adj_value).toFixed(2)
                            ).length
                          ) {
                            nStr = '';
                          } else if (e.keyCode === 8) {
                            nStr = nStr.slice(0, -1);
                          } else if (
                            e.key === 'ArrowLeft' ||
                            e.key === 'ArrowRight' ||
                            e.key === 'Backspace'
                          ) {
                            return;
                          } else if (e.key === '-') {
                            // Allow negative sign at the start
                            nStr = nStr.length
                              ? ('-' + nStr)
                                .replace(/-+/g, '-')
                                .replace(/(?!^)-/g, '')
                              : '-0';
                          } else if (!/^[0-9.]$/.test(e.key)) {
                            return;
                          }

                          // Handle decimal point
                          if (e.key === '.' && nStr.includes('.')) {
                            return;
                          }

                          let sanitizedValue =
                            nStr +
                            (e.key === 'Backspace' || e.key === '-'
                              ? ''
                              : e.key);

                          sanitizedValue =
                            sanitizeInputDollarSignComps(sanitizedValue);
                          sanitizedValue = sanitizedValue.replace(
                            /[^0-9.-]/g,
                            ''
                          );

                          setValues(
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
                              const comp = oldValues.tableData[index];
                              const expenses = [...comp.expenses];
                              const weight = comp.weight;

                              const parsedValue = sanitizedValue
                                ? sanitizedValue
                                : 0;
                              const { total, expenses: updatedExpenses } =
                                getExpensesTotal(
                                  expenses,
                                  expenseIndex,
                                  parsedValue
                                );

                              const calculatedCompData = calculateCompData({
                                total,
                                weight,
                                comp,
                                appraisalData,
                              });

                              const updatedCompData = {
                                ...comp,
                                ...calculatedCompData,
                              };

                              oldValues.tableData[index] = {
                                ...updatedCompData,
                                expenses: updatedExpenses,
                                total,
                              };

                              const totalAverageAdjustedPsf =
                                oldValues.tableData.reduce(
                                  (acc: any, item: any) => {
                                    return acc + item.averaged_adjusted_psf;
                                  },
                                  0
                                );

                              return {
                                ...oldValues,
                                averaged_adjusted_psf: totalAverageAdjustedPsf,
                              };
                            }
                          );
                        }}
                        inputProps={{
                          style: {
                            padding: 0,
                            textAlign: 'left',
                            fontSize: '12px',
                            borderRadius: '0',
                            borderBottom: '1px solid #ccc',
                          },
                        }}
                      />
                      <span
                        className={`text-xs ${parseFloat(expense.adj_value) > ListingEnum.ZERO
                          ? 'text-red-600'
                          : parseFloat(expense.adj_value) < ListingEnum.ZERO
                            ? 'text-green-600'
                            : 'text-gray-500'
                          }`}
                      >
                        {parseFloat(expense.adj_value) > ListingEnum.ZERO
                          ? 'Inferior'
                          : parseFloat(expense.adj_value) < ListingEnum.ZERO
                            ? 'Superior'
                            : 'Equal'}
                      </span>
                    </div>
                  </div>
                ) : expense.customType === true ? (
                  <div className="h-[20px]">
                    <div className="flex">
                      <TextField
                        type="text"
                        className="w-1/2 approchTextField [&_.MuiInputBase-formControl]:rounded-none"
                        value={expense.adj_value ? `${expense.adj_value}%` : ''}
                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                          e.target.select();
                        }}
                        onKeyDown={(e) => {
                          let nStr = expense.adj_value
                            ? `${expense.adj_value}`
                            : '';

                          // Handle when all the text is selected and backspace is pressed
                          const { selectionStart, selectionEnd }: any =
                            e.target;

                          if (
                            e.keyCode === 8 &&
                            selectionStart === ListingEnum.ZERO &&
                            selectionEnd >= nStr.length
                          ) {
                            nStr = '';
                          } else if (e.keyCode === ListingEnum.EIGHT) {
                            nStr = nStr.slice(0, -1);
                          } else if (
                            e.key === 'ArrowLeft' ||
                            e.key === 'ArrowRight' ||
                            e.key === 'Backspace'
                          ) {
                            return;
                          } else if (e.key === '-') {
                            // Allow negative sign at the start
                            if (nStr.length === ListingEnum.ZERO) {
                              nStr = '-';
                            }
                            return;
                          } else if (nStr.includes('100')) {
                            nStr = '100';
                          } else if (parseFloat(nStr) > ListingEnum.HUNDRED) {
                            nStr = nStr.substr(0, 2);
                          }

                          const sanitizedValue = nStr;

                          setValues(
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
                              const comp = oldValues.tableData[index];
                              const expenses = [...comp.expenses];

                              const weight = comp.weight;

                              const parsedValue = sanitizedValue
                                ? sanitizedValue
                                : 0;
                              const { total, expenses: updatedExpenses } =
                                getExpensesTotal(
                                  expenses,
                                  expenseIndex,
                                  parsedValue
                                );

                              const calculatedCompData = calculateCompData({
                                total,
                                weight,
                                comp,
                                appraisalData,
                              });

                              const updatedCompData = {
                                ...comp,
                                ...calculatedCompData,
                              };

                              oldValues.tableData[index] = {
                                ...updatedCompData,
                                expenses: updatedExpenses,
                                total,
                              };

                              const totalAverageAdjustedPsf =
                                oldValues.tableData.reduce(
                                  (acc: any, item: any) => {
                                    return acc + item.averaged_adjusted_psf;
                                  },
                                  0
                                );

                              return {
                                ...oldValues,
                                averaged_adjusted_psf: totalAverageAdjustedPsf,
                              };
                            }
                          );
                        }}
                        inputProps={{
                          maxLength: 6,
                          style: {
                            padding: 0,
                            textAlign: 'left',
                            fontSize: '12px',
                            borderBottom: '1px solid #ccc',
                          },
                        }}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Allow negative numbers
                          let sanitizedValue = value.replace(/[^0-9.-]/g, '');
                          if (sanitizedValue.indexOf('-') > ListingEnum.ZERO) {
                            sanitizedValue = sanitizedValue.replace(/-/g, '');
                          }

                          // Limit the input value to between -100 and ListingEnum.HUNDRED
                          if (parseFloat(sanitizedValue) < -ListingEnum.HUNDRED) {
                            sanitizedValue = '-100';
                          } else if (parseFloat(sanitizedValue) > ListingEnum.HUNDRED) {
                            sanitizedValue = sanitizedValue.substr(0, 2);
                          }

                          const parts = sanitizedValue.split('.');

                          if (
                            parts.length > ListingEnum.TWO ||
                            (parts.length === 2 && parts[1].length > ListingEnum.TWO)
                          ) {
                            return;
                          }

                          if (parts[0].length > ListingEnum.THREE) {
                            return;
                          }

                          setValues(
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
                              const comp = oldValues.tableData[index];
                              const expenses = [...comp.expenses];

                              const weight = comp.weight;

                              const parsedValue = sanitizedValue
                                ? sanitizedValue
                                : 0;
                              const { total, expenses: updatedExpenses } =
                                getExpensesTotal(
                                  expenses,
                                  expenseIndex,
                                  parsedValue
                                );

                              const calculatedCompData = calculateCompData({
                                total,
                                weight,
                                comp,
                                appraisalData,
                              });

                              const updatedCompData = {
                                ...comp,
                                ...calculatedCompData,
                              };

                              oldValues.tableData[index] = {
                                ...updatedCompData,
                                expenses: updatedExpenses,
                                total,
                              };

                              const totalAverageAdjustedPsf =
                                oldValues.tableData.reduce(
                                  (acc: any, item: any) => {
                                    return acc + item.averaged_adjusted_psf;
                                  },
                                  0
                                );

                              return {
                                ...oldValues,
                                averaged_adjusted_psf: totalAverageAdjustedPsf,
                              };
                            }
                          );
                        }}
                      />
                      <span
                        className={`text-xs ${expense.adj_value > ListingEnum.ZERO
                          ? 'text-red-600'
                          : expense.adj_value < ListingEnum.ZERO
                            ? 'text-green-600'
                            : 'text-gray-400'
                          }`}
                      >
                        {expense.adj_value > ListingEnum.ZERO
                          ? 'Inferior'
                          : expense.adj_value < ListingEnum.ZERO
                            ? 'Superior'
                            : ''}
                      </span>
                      <span
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          color: 'gray',
                          marginLeft: '-20px',
                          fontSize: '10px',
                        }}
                      >
                        %
                      </span>

                      <Icons.SwitchIcon
                        style={{
                          color: 'rgb(13 161 199)',
                          margin: '0 6px',
                          width: '17px',
                          height: '17px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setValues(
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
                              const comp = oldValues.tableData[index];
                              const expenses = [...comp.expenses];

                              expenses[expenseIndex].customType = false;
                              const weight = comp.weight;

                              const { total, expenses: updatedExpenses } =
                                getExpensesTotal(expenses, expenseIndex, 0);

                              const calculatedCompData = calculateCompData({
                                total,
                                weight,
                                comp,
                                appraisalData,
                              });

                              const updatedCompData = {
                                ...comp,
                                ...calculatedCompData,
                              };

                              oldValues.tableData[index] = {
                                ...updatedCompData,
                                expenses: [...updatedExpenses],
                                total,
                              };

                              const totalAverageAdjustedPsf =
                                oldValues.tableData.reduce(
                                  (acc: any, item: any) => {
                                    return acc + item.averaged_adjusted_psf;
                                  },
                                  0
                                );

                              return {
                                ...oldValues,
                                averaged_adjusted_psf: totalAverageAdjustedPsf,
                              };
                            }
                          );
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-1/2">
                      <SelectTextField
                        className="custom-dropdown"
                        options={options.map((option) => ({
                          value: option.value,
                          label: (
                            <span style={{ fontSize: '13px' }}>
                              {option.label}
                            </span>
                          ),
                        }))}
                        value={
                          expense.adj_value !== undefined &&
                            expense.adj_value !== null
                            ? expense.adj_value
                            : ListingEnum.ZERO
                        }
                        onChange={(e) => {
                          const { value } = e.target;
                          const number = parseFloat(value);
                          const isCustomValue = value === 'custom';

                          setValues(
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
                              const comp = oldValues.tableData[index];
                              const expenses = [...comp.expenses];

                              expenses[expenseIndex].customType = isCustomValue;
                              expenses[expenseIndex].adj_value = isCustomValue
                                ? ListingEnum.ZERO
                                : number;

                              const weight = comp.weight;

                              const { total, expenses: updatedExpenses } =
                                getExpensesTotal(
                                  expenses,
                                  expenseIndex,
                                  isCustomValue ? ListingEnum.ZERO : number
                                );

                              const calculatedCompData = calculateCompData({
                                total,
                                weight,
                                comp,
                                appraisalData,
                              });

                              const updatedCompData = {
                                ...comp,
                                ...calculatedCompData,
                              };

                              oldValues.tableData[index] = {
                                ...updatedCompData,
                                expenses: updatedExpenses,
                                total,
                              };

                              const totalAverageAdjustedPsf =
                                oldValues.tableData.reduce(
                                  (acc: any, item: any) => {
                                    return acc + item.averaged_adjusted_psf;
                                  },
                                  0
                                );

                              return {
                                ...oldValues,
                                averaged_adjusted_psf: totalAverageAdjustedPsf,
                              };
                            }
                          );
                        }}
                        name={`${item.id}.expenses.${expenseIndex}.adj_value`}
                      />
                    </div>
                    <span
                      className={`text-sm font-normal ${parseFloat(expense.adj_value || '0') > ListingEnum.ZERO
                        ? 'text-red-500 font-semibold'
                        : parseFloat(expense.adj_value || '0') < ListingEnum.ZERO
                          ? '  text-green-500 font-semibold'
                          : 'text-gray-500 '
                        }`}
                    >
                      {parseFloat(expense.adj_value || '0') > ListingEnum.ZERO
                        ? 'Inferior'
                        : parseFloat(expense.adj_value || '0') < ListingEnum.ZERO
                          ? 'Superior'
                          : 'Equal'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-1 pt-0">
          <div className="w-full">
            {item.quantitativeAdjustments?.map(
              (expense: any, expenseIndex: any) => (
                <div key={expense.id} className="h-[18px] subjectPropertyCard">
                  <div className="flex items-center">
                    <div className="w-1/2 qualitative-dropdown">
                      <SelectTextField
                        className="custom-dropdown"
                        options={quantitativeOptions.map((option: any) => ({
                          value: option.code,
                          label: (
                            <span style={{ fontSize: '13px' }}>
                              {option.name}
                            </span>
                          ),
                        }))}
                        value={
                          expense.adj_value !== undefined &&
                            expense.adj_value !== null
                            ? expense.adj_value
                            : 0
                        }
                        onChange={(e) => {
                          const { value } = e.target;
                          // const number = parseFloat(value);
                          const isCustomValue = value === 'custom';

                          setValues(
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
                              const comp = oldValues.tableData[index];
                              const quantitativeAdjustments = [
                                ...comp.quantitativeAdjustments,
                              ];

                              // Update quantitativeAdjustments specific properties
                              quantitativeAdjustments[expenseIndex].customType =
                                isCustomValue;
                              quantitativeAdjustments[expenseIndex].adj_value =
                                value;

                              // Calculate the updated total and related data based on quantitativeAdjustments

                              const updatedCompData = {
                                ...comp,
                              };

                              // Update the table data with modified quantitativeAdjustments
                              oldValues.tableData[index] = {
                                ...updatedCompData,
                              };

                              const totalAverageAdjustedPsf =
                                oldValues.tableData.reduce(
                                  (acc: any, item: any) => {
                                    return acc + item.averaged_adjusted_psf;
                                  },
                                  0
                                );

                              return {
                                ...oldValues,
                                averaged_adjusted_psf: totalAverageAdjustedPsf,
                              };
                            }
                          );
                        }}
                        name={`${item.id}.quantitativeAdjustments.${expenseIndex}.adj_value`}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="">
          <p
            className="text-xs h-10 text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below text-[#0DA1C7] p-1 py-2.5 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer"
            onClick={() => handleOpen(item, index)}
          >
            {CreateCompsEnum.ADD_ADJUSTMENT_NOTES}
          </p>
        </div>
        <div className="mt-2 px-1 flex flex-col gap-[2px] pb-2">
          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium">
            {values.tableData[index].total
              ? appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR
                ? `${formatPrice(values.tableData[index].total || ListingEnum.ZERO)}`
                : `${Number(values.tableData[index].total).toFixed(2)}%`
              : appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR
                ? '$0.00'
                : '0.00%'}
          </p>

          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            {formatPrice(values.tableData[index].adjusted_psf || ListingEnum.ZERO)}
          </p>

          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            <input
              type="text"
              step="0.01" // Allows decimal values with two places
              value={
                values.tableData[index].weight
                  ? `${values.tableData[index].weight}%`.trim()
                  : ''
              }
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="bg-transparent outline-none h-4 p-0 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5] focus:border-[#0da1c7] text-gray-500 text-xs font-medium"
            />

            {error && (
              <div className="text-[11px] text-red-500 mt-1">{error}</div>
            )}
          </p>

          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium invisible text-ellipsis overflow-hidden whitespace-nowrap">
            {values.tableData[index].blended_adjusted_psf
              ? Number(
                values.tableData[index].blended_adjusted_psf
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
              : 0}
          </p>

          <p
            style={{ borderBottom: '3px solid' }}
            className="text-gray-500 h-[18px] !m-0 text-xs font-medium hidden text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {values.tableData[index].averaged_adjusted_psf
              ? `${Number(values.tableData[index].averaged_adjusted_psf)}`
              : ListingEnum.ZERO}
          </p>
        </div>
      </div>
    </div>
  );
}

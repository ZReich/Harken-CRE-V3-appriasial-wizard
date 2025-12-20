import React, { useEffect, useState } from 'react';
import AppraisalMenu from '../../set-up/appraisa-menu';
import { Grid, Typography, TextField } from '@mui/material';
import { useGet } from '@/hook/useGet';
import { FieldArray, useFormikContext } from 'formik';
import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
// import LeaseFilter from './leaseFilter';
import SelectTextField from '@/components/styles/select-input';
import { RequestType, useMutate } from '@/hook/useMutate';
import CommonButton from '@/components/elements/button/Button';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@mui/material';
import TextEditor from '@/components/styles/text-editor';
import defaultPropertImage from '../../../../images/default-placeholder.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import DeleteApproachConfirmationModal from '@/pages/comps/Listing/delete-approach-confirmation';
import LeaseApproachAdjustmentModal from './leaseApproachAdjustmentModal';
import { options } from '@/pages/comps/comp-form/fakeJson';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import loadingImage from '../../../../images/loading.png';
import LeaseForm from './lease-comps-table';

import {
  AllTypeJson,
  conditionOptions,
  propertyOptions,
  landTypeOptions,
  retailOptions,
  officeOptions,
  industrialOptions,
  multifamilyOptions,
  hospitalityOptions,
  specialOptions,
  residentialOptions,
  frontageOptions,
  leaseTypeOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { AppraisalEnum } from '../../set-up/setUpEnum';
import LeaseApproachNote from './leaseApproachNote';
import UploadSalesCompsModal from '../../sales/upload-comps-from-sales';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import {
  capitalizeWords,
  formatPrice,
  formatValue,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
// let inputField = 'type_my_own';
// Function for calculation of comps data
export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  const bedPerSqFit =
    comp.lease_rate === 0 || comp.total_beds === 0
      ? 0
      : comp.lease_rate_unit === 'monthly'
        ? (comp.lease_rate / comp.total_beds) * 12
        : comp.lease_rate / comp.total_beds;

  const bedUnitPerSqFt =
    comp.total_units === 0 || comp.lease_rate === 0
      ? 0
      : comp.lease_rate_unit === 'monthly'
        ? (comp.lease_rate / comp.total_units) * 12
        : comp.lease_rate / comp.total_units;
  const finalBed =
    appraisalData?.comp_adjustment_mode === 'Dollar'
      ? total + bedPerSqFit
      : (total / 100) * bedPerSqFit + bedPerSqFit;

  const finalUnits =
    appraisalData?.comp_adjustment_mode === 'Dollar'
      ? total + bedUnitPerSqFt
      : (total / 100) * bedUnitPerSqFt + bedUnitPerSqFt;

  const valuePerACre =
    appraisalData &&
    appraisalData.comp_adjustment_mode === 'Dollar' &&
    appraisalData.analysis_type === '$/Acre'
      ? total + comp.price_square_foot * 43560
      : (total / 100) * comp.price_square_foot * 43560 +
        comp.price_square_foot * 43560;

  const updatedAdjustedPsf =
    appraisalData?.comp_adjustment_mode === 'Dollar'
      ? total + price_square_foot
      : (total / 100) * price_square_foot + price_square_foot;

  const updatedAverageAdjustedPsf = (updatedAdjustedPsf * weight) / 100;
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
          : appraisalData?.analysis_type === '$/Acre'
            ? valuePerACre
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

// function to calculate comps total dropdown adjustment values
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
const formatNumber = (num: any) => {
  if (num === null || num === undefined) return 'NA';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

let adjFactores: any;
let QualitativeadjFactores: any;

const LeaseApproach: React.FC = () => {
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
  const leaseId = searchParams.get('leaseId');
  // const { leaseId } = useParams()
  const [appraisalId, setAppraisalId] = useState('');
  const { handleChange, values, setValues } = useFormikContext<any>();
  if (!adjFactores) adjFactores = values.operatingExpenses;
  if (!QualitativeadjFactores)
    QualitativeadjFactores = values.salesCompQualitativeAdjustment;
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  // const [isOpen, setIsOpen] = useState(false);
  const [comparisonBasis, setComparisonBasis] = useState<any>(null);
  const [compsType, setCompsType] = useState<any>(null);
  const [compsLength, setCompsLength] = useState('');

  const [compType, setCompType] = useState<any>(null);
  const [landDimensions, setLandDimensions] = useState<any>(null);
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
  const [loader, setLoader] = useState(false);
  const [indexType, setIndexType] = useState<any>();
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const {
    data: areaInfoData,
    refetch,
    isLoading,
  } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: {
      enabled: Boolean(leaseId),
      refetchOnWindowFocus: false,
      onSuccess: (data: any) => {
        const comparisonBasis = data?.data?.data?.comparison_basis;
        localStorage.setItem('comparisonBasis', comparisonBasis);
        const landDimension = data?.data?.data?.land_dimension;
        const compsType = data?.data?.data?.comp_type;
        const analysisType = data?.data?.data?.analysis_type;
        const mapData = data?.data?.data?.appraisal_approaches;
        const subjectCompType = data?.data?.data?.comp_type;
        mapData &&
          mapData.map((item: any) => {
            if (item.id == leaseId) {
              setSalesApproachName(item.name);
            }
          });
        const coverImage = data?.data?.data?.appraisal_files?.find(
          (file: any) => file.title === 'cover'
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
        (item: any) => item.type === 'sales_comp_qualitative_adjustments'
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
      const firstOptions = data.data.data.find(
        (item: any) => item.type === 'lease_quantitative_adjustments'
      )?.options;

      // Set subOptions based on fetched data
      setQualitativeApproaachItems(firstOptions || []);

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
  }, [data]);
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/update-position',
    endPoint: `appraisals/update-position/${id}`,
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

  const [hasIncomeType, setHasIncomeType] = useState(false);
  const [hasRentRollType, setHasRentRollType] = useState(false);

  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [salesNote, setSalesNote] = useState('');
  const [leaseCompNote, setLeaseCompNote] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [hasLeaseType, setHasLeaseType] = React.useState(false);

  const [filteredData, setFilteredData] = useState<
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
    if (
      areaInfoData?.data?.data?.appraisal_approaches &&
      !areaInfoData.isStale
    ) {
      const updateData = areaInfoData.data.data.appraisal_approaches;
      const salesApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'sale'
      );
      setHasSaleType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'rent_roll'
      );
      setHasRentRollType(rentRollApproaches.length > 0);
      setFilteredRentRollData(rentRollApproaches);
      const incomeApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'income'
      );
      setHasIncomeType(incomeApproaches.length > 0);
      setFilteredData(incomeApproaches);

      const leaseApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'lease'
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeaseData(leaseApproaches);
    }
  }, [areaInfoData?.data?.data?.appraisal_approaches]);

  const appraisalData: any = areaInfoData?.data.data || {};
  const findSubZone = (AllTypeJson: any) => {
    const foundItem = AllTypeJson.find(
      (item: { value: string }) =>
        item?.value === appraisalData.zonings[0].sub_zone
    );

    if (foundItem) {
      return foundItem.label;
    }

    // If no match is found, capitalize and return appraisalData.zonings[0].sub_zone
    if (appraisalData.zonings[0]?.sub_zone) {
      return capitalizeWords(appraisalData.zonings[0].sub_zone);
    }

    // If sub_zone is not defined, return null
    return null;
  };

  const findDZone = (propertyOptions: any) => {
    const foundItem = propertyOptions.find(
      (item: { value: string }) => item?.value === appraisalData.zonings[0].zone
    );
    return foundItem ? foundItem.label : null;
  };

  const findLandType = (landTypeOptions: any) => {
    const foundItem = landTypeOptions.find(
      (item: { value: string }) => item?.value === appraisalData.land_type
    );
    return foundItem ? foundItem.label : null;
  };

  const appraisalApproach =
    areaInfoData?.data?.data?.appraisal_approaches?.find((approach: any) =>
      leaseId ? approach.id == parseFloat(leaseId) : false
    );

  const appraisalSalesApproachId =
    appraisalApproach && appraisalApproach.appraisal_lease_approach
      ? appraisalApproach.appraisal_lease_approach.id
      : null;

  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `appraisals/get-lease-approach?appraisalId=${id}&appraisalApproachId=${leaseId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;
      setCompsLength(compsArr?.length);

      localStorage.setItem('compsLengthLease', compsArr.length);

      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      const salesNoteForComp = response?.data?.data?.data?.note;
      const leaseCompNote = response?.data?.data?.data?.lease_comps_notes;
      setLeaseCompNote(leaseCompNote);
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
            comparison_basis: adj_value ? adj_value + '%' : 0,
            adj_key,
            adj_value,
          })
        );

      const formattedQualitativeExpenses =
        response?.data?.data?.data.subject_qualitative_adjustments.map(
          ({ adj_key, adj_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: adj_value ? adj_value : 'Similar',
            adj_key,
            adj_value,
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
          appraisalData: appraisalData,
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
                  : String(newValue?.adj_value || 'Similar'),
              customType: isCustom,
            };
          }
        );
        const avgpsf =
          (total / 100) * c?.comp_details?.price_square_foot +
          c?.comp_details?.price_square_foot;
        const finalavgpsf = (avgpsf * weight) / 100;

        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          expenses: formattedExpenses,
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
      });

      setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      console.error('Error fetching comps data:', error);
      // Handle the error appropriately
    }
  };

  useEffect(() => {
    fetchComposData(values, setValues);
  }, [leaseId]);
  useEffect(() => {
    if (values.operatingExpenses && values.salesCompQualitativeAdjustment) {
      const salesApproachValues = {
        operatingExpenses: values.operatingExpenses,
        salesCompQualitativeAdjustment: values.salesCompQualitativeAdjustment,
      };
      localStorage.setItem(
        'leaseApproachValuesAppraisal',
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
  const subject_qualitative_adjustments =
    transformsalesCompQualitativeAdjustmentToAdjustments(
      values.salesCompQualitativeAdjustment
    );

  let minAveragedAdjustedPsf = Infinity; // Set to a very high value
  let maxAveragedAdjustedPsf = -Infinity; // Set to a very low value
  values.tableData.forEach((comp: { adjusted_psf?: string }) => {
    const value = parseFloat(comp.adjusted_psf ?? '');

    if (!isNaN(value)) {
      if (value < minAveragedAdjustedPsf) minAveragedAdjustedPsf = value;
      if (value > maxAveragedAdjustedPsf) maxAveragedAdjustedPsf = value;
    }
  });

  // Handle cases where no valid adjusted_psf values are found
  if (minAveragedAdjustedPsf === Infinity) minAveragedAdjustedPsf = 0;
  if (maxAveragedAdjustedPsf === -Infinity) maxAveragedAdjustedPsf = 0;

  console.log(
    'Minimum:',
    minAveragedAdjustedPsf,
    'Maximum:',
    maxAveragedAdjustedPsf
  );

  let totalWeightage = 0;

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
    ...(appraisalSalesApproachId ? { id: appraisalId } : {}),
    //   'id':appraisalId,
    appraisal_approach_id: leaseId ? parseFloat(leaseId) : null,

    // averaged_adjusted_psf: totalaveragedadjustedpsf,
    low_adjusted_comp_range: minAveragedAdjustedPsf.toString(),
    high_adjusted_comp_range: maxAveragedAdjustedPsf.toString(),

    // lease_approach_value: FinalResult,
    weight: parseFloat(totalWeightage.toString()),
    note: salesNote || null,
    lease_comps_notes: leaseCompNote || null,
    // "adjustment_note":note
    total_comp_adj: '835540',
    subject_property_adjustments: subject_property_adjustments,
    subject_qualitative_adjustments: subject_qualitative_adjustments,
    // sales_approach_indicated_val: FinalResult,
    comps: comps,
  };

  const finalData = {
    appraisal_id: id ? parseFloat(id) : null,
    lease_approach: salesApproachData,
  };

  const mutation = useMutate<any, any>({
    queryKey: 'lease-sale-approach',
    endPoint: 'appraisals/save-lease-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'save-lease-approach',
    endPoint: 'appraisals/update-lease-approach',
    requestType: RequestType.POST,
  });

  console.log('appraisalSalesApproachId', appraisalSalesApproachId);
  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    try {
      const freshResponse = await axios.get(`appraisals/get/${id}`);
      const currentAppraisalApproach =
        freshResponse?.data?.data?.data?.appraisal_approaches?.find(
          (approach: any) =>
            leaseId ? approach.id == parseFloat(leaseId) : false
        );
      const currentAppraisalSalesApproachId =
        currentAppraisalApproach?.appraisal_lease_approach?.id ||
        appraisalId ||
        null;

      // Rebuild comps data with updated values
      const updatedCompsData = updatedComps?.map((item: any, index: number) => {
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
          // ...(currentAppraisalSalesApproachId ? { id: item.id } : {}),
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

      const updatedFinalData = {
        ...finalData,
        lease_approach: {
          ...finalData.lease_approach,
          ...(currentAppraisalSalesApproachId
            ? { id: currentAppraisalSalesApproachId }
            : {}),
          comps: updatedCompsData,
        },
      };

      let response;
      if (currentAppraisalSalesApproachId) {
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
      }

      if (response && response.data && response.data.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
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
          lease_approach: {
            ...finalData.lease_approach,
            comps: finalData.lease_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        setLoader(false);
        toast.success(response.data.message);
        navigate(`/lease-comps-map?id=${id}&leaseId=${leaseId}`);
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
          lease_approach: {
            ...finalData.lease_approach,
            comps: finalData.lease_approach.comps,
          },
        };

        response = await mutation.mutateAsync(modifiedPayload);
      }

      if (response && response.data && response.data.message) {
        navigate(`/update-comps/${itemId}/${id}/lease/${leaseId}`);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
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
      toast.error('An error occurred. Please try again.');
    }
  };
  const handleAddNewComp = () => {
    localStorage.setItem('checkStatus', 'lease');
    localStorage.setItem('checkType', 'leaseCheckBox');
    // localStorage.setItem('activeType', 'building_with_land');

    // setIsOpen(true);
    navigate(`/filter-lease-comps?id=${id}&approachId=${leaseId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };

  const handleLinkExistingComps = () => {
    navigate(`/lease/create-comp?id=${id}&approachId=${leaseId}`, {
      state: {
        comparisonBasis: comparisonBasis,
        compsLength: compsLength,
      },
    });
  };
  // const setFilterTrue = () => {
  //   setIsOpen(true);
  // };
  const uploadComps = () => {
    setCompsOpen(true);
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

      setTimeout(() => {
        handleSubmitWithUpdatedComps(updatedComps);
      }, 100);

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });

    // setIsOpen(false);
  };

  const passCompsDataToFilter1 = (comps: any) => {
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

  // const capitalizeWords = (str: string) => {
  //   return str
  //     .split(/[_\s]+/) // Split the string by underscores or spaces
  //     .map(
  //       (word: string) =>
  //         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter
  //     )
  //     .join(' '); // Join the words back with a space
  // };
  const findCondition = (conditionOptions: any) => {
    const foundItem = conditionOptions.find(
      (item: { value: string }) => item?.value === appraisalData?.condition
    );

    // If foundItem exists and its label is the default option, return an empty string
    if (foundItem && foundItem.label === '--Select Property Condition--') {
      return '';
    }

    // If a match is found, return its label
    if (foundItem) {
      return foundItem.label;
    }

    // If no match is found and appraisalData.condition is defined, capitalize it
    if (appraisalData?.condition) {
      return capitalizeWords(appraisalData.condition);
    }

    // If condition is not defined, return null
    return null;
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
  const editorText1 = (event: any) => {
    setSalesNote(event);
  };
  const handleSave = () => {
    handleSaveAdjustmentNote();
    setOpen(false);
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
    setNoteModalOpen(true);
  };
  return (
    <AppraisalMenu>
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
        <LeaseForm
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
          Lease comps <span>({salesApproachName})</span>
        </Typography>

        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">
            Value of the property based on applicable Lease comps
          </span>
        </div>
      </div>
      {/* <div className="overflow-auto h-[calc(100vh-280px)]"> */}
      <div className="flex flex-wrap items-start space-x-2 mb-20 xl:px-[44px] px-[15px]">
        <div className="flex flex-col w-[15.5%]">
          <h3 className="px-4 py-5 text-base capitalize invisible font-semibold">
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
              <p className="pb-1 text-xs font-bold">Date Leased</p>
            </div>
            <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                Lease Type
              </p>
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                Lease Terms - Months
              </p>

              {comparisonBasis === 'Bed' ? (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Beds
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Units
                </p>
              ) : compsType === 'land_only' ? (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Land Size
                </p>
              ) : (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Building Size / Land Size
                </p>
              )}
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                Suite Size
              </p>

              {compsType === 'land_only' ? (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Land Type
                </p>
              ) : (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Property Type/Sub-Type
                </p>
              )}

              {compsType === 'land_only' ? null : (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  Year Built / Remodeled
                </p>
              )}

              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                Condition
              </p>

              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                Zoning
              </p>
              {comparisonBasis === 'Bed' ? (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  $/Beds
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  $/Unit
                </p>
              ) : landDimensions === 'ACRE' ? (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  $/AC/Year
                </p>
              ) : (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  $/SF/YR
                </p>
              )}
            </div>
            <div className="border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5] pb-2">
              <FieldArray
                name="operatingExpenses"
                render={() => (
                  <>
                    {values.operatingExpenses &&
                    values.operatingExpenses.length > 0 ? (
                      values.operatingExpenses.map((zone: any, i: number) => (
                        <div
                          className="flex items-center quantitate-items justify-between gap-1 h-[20px]"
                          key={i}
                        >
                          <Grid className="min-w-[calc(100%-36px)] manageDropdownField w-full">
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
                                    const operatingExpenses =
                                      old.operatingExpenses.map(
                                        (expense: any, index: number) =>
                                          index === i
                                            ? {
                                                ...expense,
                                                adj_key: input,
                                                adj_value: input,
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
                                name={`operatingExpenses.${i}.adj_value`}
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
                                  minHeight: '36px',
                                  fontWeight: 400,
                                }}
                              />
                            )}
                          </Grid>
                          <Grid item className="min-w-[36px]">
                            <div className="flex flex-row items-center">
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
                                                'type_my_own';

                                              // Set adj_key to empty if "type my own" was selected
                                              const newAdjKey = isTypeMyOwn
                                                ? ''
                                                : 'type_my_own';

                                              return {
                                                ...expense,
                                                adj_key: newAdjKey,
                                                adj_value: isTypeMyOwn
                                                  ? 0
                                                  : expense.adj_value,
                                                isTypeMyOwnSelected: false, // Reset to prevent dropdown options
                                              };
                                            }
                                            return expense;
                                          }
                                        );

                                      const updatedTableData =
                                        old.tableData.map((comp: any) => ({
                                          ...comp,
                                          expenses: comp.expenses.map(
                                            (exp: any, expIndex: number) => {
                                              if (expIndex === i) {
                                                const isTypeMyOwn =
                                                  updatedOperatingExpenses[i]
                                                    .adj_key === '';

                                                return {
                                                  ...exp,
                                                  adj_key: isTypeMyOwn
                                                    ? ''
                                                    : 'type_my_own',
                                                  adj_value: isTypeMyOwn
                                                    ? 0
                                                    : exp.adj_value,
                                                };
                                              }
                                              return exp;
                                            }
                                          ),
                                        }));

                                      return {
                                        ...old,
                                        operatingExpenses:
                                          updatedOperatingExpenses,
                                        tableData: updatedTableData,
                                      };
                                    });
                                  }}
                                />
                              )}
                              <div
                                className="flex"
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
                                <Icons.AddCircleOutlineIcon
                                  style={{ width: '14px' }}
                                  className="ml-1 text-[#0da1c7] cursor-pointer"
                                  onClick={() => {
                                    setValues((old: any) => ({
                                      ...old,
                                      operatingExpenses: [
                                        ...old.operatingExpenses,
                                        {
                                          adj_key: '', // No default selected
                                          adj_value: '', // Start adj_value as empty
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
                <div className="flex flex-col py-1">
                  {values.salesCompQualitativeAdjustment &&
                  values.salesCompQualitativeAdjustment.length > 0 ? (
                    values.salesCompQualitativeAdjustment.map(
                      (zone: any, i: number) => {
                        // Log the index if adj_key is 'building_size'

                        return (
                          <div
                            className="flex items-center quantitate-items justify-between gap-1 h-[18px] overflow-hidden"
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
                                    minHeight: '36px',
                                    fontWeight: 400,
                                  }}
                                />
                              )}
                            </Grid>
                            <Grid item className="min-w-[36px]">
                              <div className="flex flex-row items-center">
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

                                <Icons.RemoveCircleOutlineIcon
                                  className="text-red-500 cursor-pointer"
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                    cursor: 'pointer',
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
                                    style={{ width: '14px', height: '14px' }}
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
                </div>
              )}
            />

            {/* //-----------------------------------------------------------------------------------? */}
            <div className="border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] px-1 flex items-center  h-10">
              <p className="text-xs font-bold border-below">Notes</p>
            </div>
            <div className="mt-2 flex flex-col gap-[2px]">
              <p className="text-xs h-[18px] !m-0 font-semibold italic text-ellipsis overflow-hidden whitespace-nowrap">
                Overall Adjustment
              </p>
              {comparisonBasis === 'Bed' ? (
                <p className="text-xs h-[18px] !m-0 font-bold italic text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted $/Bed{' '}
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="text-xs h-[18px] !m-0 font-bold italic text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted $/Unit
                </p>
              ) : analysisType === '$/Acre' ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted $/AC
                </p>
              ) : (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Adjusted $/SF
                </p>
              )}
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Weighting
              </p>

              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                Adjusted Comp Range
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[15.5%]">
          <h3 className="py-5 text-base capitalize font-semibold">
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
              <p className="text-gray-500 text-xs font-medium pb-1">
                {APPROACHESENUMS.SPACE}
              </p>
            </div>

            <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {APPROACHESENUMS.SPACE}
              </p>
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {APPROACHESENUMS.SPACE}
              </p>
              {compsType === 'land_only' ? (
                <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                  {appraisalData.land_size
                    ? landDimensions === 'ACRE'
                      ? `${parseFloat(appraisalData.land_size).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          }
                        )} AC`
                      : `${parseFloat(appraisalData.land_size).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }
                        )} SF`
                    : APPROACHESENUMS.SPACE}
                </p>
              ) : comparisonBasis === 'Bed' ? (
                <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                  {appraisalData.total_beds || 'NA'}
                </p>
              ) : comparisonBasis === 'Unit' ? (
                <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                  {appraisalData.total_units || 'NA'}
                </p>
              ) : (
                <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                  {appraisalData.building_size
                    ? `${formatNumber(appraisalData.building_size)} SF`
                    : 'NA'}
                  {appraisalData.building_size && (
                    <>
                      {appraisalData.land_size
                        ? landDimensions === 'ACRE'
                          ? ` / ${parseFloat(
                              appraisalData.land_size
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                            })} AC`
                          : ` / ${parseFloat(
                              appraisalData.land_size
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} SF`
                        : ' / NA'}
                    </>
                  )}
                </p>
              )}

              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {APPROACHESENUMS.SPACE}
              </p>
              {compsType === 'land_only' ? (
                <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                  {findLandType(landTypeOptions) || APPROACHESENUMS.SPACE}
                  {/* Show land_type when compsType is land_only */}
                </p>
              ) : (
                <p
                  className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
                  title={
                    appraisalData.zonings?.[0]?.zone
                      ? `${findDZone(propertyOptions)}${
                          appraisalData.zonings?.[0]?.sub_zone
                            ? ` / ${findSubZone(AllTypeJson)}`
                            : ' / NA'
                        }`
                      : 'NA'
                  }
                >
                  {appraisalData.zonings?.[0]?.zone
                    ? findDZone(propertyOptions)
                    : 'NA'}
                  {appraisalData.zonings?.[0]?.zone &&
                    (appraisalData.zonings?.[0]?.sub_zone
                      ? ` / ${findSubZone(AllTypeJson)}`
                      : ' / NA')}
                </p>
              )}

              {compsType === 'land_only' ? null : (
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
              )}

              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {findCondition(conditionOptions) || APPROACHESENUMS.SPACE}
              </p>

              <p
                className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ maxWidth: '30ch' }} // Set maximum width for 30 characters
                title={
                  appraisalData.zoning_type?.length > 30
                    ? capitalizeWords(appraisalData.zoning_type)
                    : ''
                } // Show tooltip if length exceeds 30
              >
                {capitalizeWords(
                  appraisalData.zoning_type || APPROACHESENUMS.SPACE
                )}
              </p>

              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"></p>
            </div>
            <div className="px-1 border-solid border-b border-l-0 pb-0 border-r-0 border-t-0 border-[#d5d5d5] pb-2">
              {values.operatingExpenses?.length > 0
                ? values.operatingExpenses.map((index: number) => (
                    <p
                      key={index}
                      className={`text-xs font-bold h-[20px] text-ellipsis overflow-hidden whitespace-nowrap ${!appraisalData.operatingExpenses?.[index]?.names ? 'text-transparent' : ''}`}
                      // style={{ lineHeight: '4em' }}
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
                        className="text-xs font-bold text-transparent"
                        style={{ lineHeight: '0rem!important' }}
                      >
                        No data
                      </p>
                    )
                  )}
            </div>
            <div className="py-1">
              {values.salesCompQualitativeAdjustment.map(
                (field: any, idx: number) => {
                  const isBuildingSize = field.adj_key === 'building_size';
                  const isSidewallHeight = field.adj_key === 'sidewall_height';
                  const isOfficeArea = field.adj_key === 'office_area';
                  return (
                    <div
                      key={field.id}
                      className="p-0 subject-property-input flex flex-col h-[18px] hideLabel relative"
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
                            ? appraisalData.building_size !== null
                              ? appraisalData.building_size === 0
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
                        
                      />

                    {isSidewallHeight && (
                      <span
                        style={{
                          position: 'absolute',
                          transform: 'translateY(-11%)',
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
            <div className="px-1 py-2.5  border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] flex items-center h-10">
              <p
                className="text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap border-below text-[#0DA1C7] cursor-pointer"
                onClick={handlePropertyNotes}
              >
                Click to add notes
              </p>
            </div>

            <div className="mt-2 px-1 space-y-2 flex flex-col gap-[2px] pb-2">
              <p
                className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                Overall Adjustment
              </p>

              <p
                className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ visibility: 'hidden' }}
              >
                Overall Adjustment
              </p>

              <p className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap">
                {totalWeightage.toFixed(2) + '%'}
              </p>
              <p className="text-xs text-gray-500 font-medium h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap">
                {formatPrice(minAveragedAdjustedPsf || 0)}-{' '}
                {formatPrice(maxAveragedAdjustedPsf || 0)}
              </p>
            </div>
          </div>
        </div>
        {!className || !open
          ? values.tableData?.map((item: any, index: any) => (
              <Card
                key={item.id}
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
                    appraisalData={appraisalData}
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
                className="flex flex-col items-center justify-center w-full h-[180px] bg-white border-[2px] border-gray-300 rounded-xl cursor-pointer "
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

      <div className="px-[60px] pb-32">
        <h4 className="text-gray-800 text-xs font-medium font-bold">
          Lease Notes
        </h4>
        <TextEditor
          editorData={(content) => setLeaseCompNote(content)}
          editorContent={leaseCompNote}
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
                  `/lease-comps-map?id=${id}&leaseId=${leaseIdRedirectIndex}`
                );
                return;
              } else {
                if (hasSaleType) {
                  navigate(
                    `/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
                  );
                  return;
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
                } else {
                  navigate(`/area-info?id=${id}`);
                }
              }
            } else if (hasSaleType) {
              navigate(
                `/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
              );
              return;
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
            } else {
              navigate(`/area-info?id=${id}`);
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
      {/* </div> */}
      <LeaseApproachAdjustmentModal
        open={open}
        setOpen={setOpen}
        indexType={indexType}
        editorText={editorText}
        adjustmentData={adjustmentData}
        handleSave={handleSave}
      />
      <LeaseApproachNote
        open={noteModalOpen}
        setNoteModalOpen={setNoteModalOpen}
        editorText={editorText1}
        handleSave={handleSave}
        salesNote={salesNote}
      />
    </AppraisalMenu>
  );
};

export default LeaseApproach;

function Card({
  index,
  item,
  values,
  totalCards,
  handleDelete,
  appraisalData,
  dimension,
  handleNavigateToComp,
  subjectcompType,
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

  const handleOpen = (item: any, index: any) => {
    setAdjustmentData(item);
    setClassName(true);
    setIndexType(index);
    setOpen(true);
  };
  let total = 0;
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
    const percentageIncrease = (total / 100) * priceSquareFoot;
    return priceSquareFoot + percentageIncrease;
  };

  const adjustedPricepercentage: number =
    item.price_square_foot === 0
      ? 0
      : addTotalAsPercentageToPriceSquareFoot(item.price_square_foot, total);

  const calculateWeightage = (totalCards: number): string => {
    if (totalCards <= 0) {
      return 'NA';
    }
    return (100 / totalCards).toFixed(2);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: any
  ) => {
    let nStr = values.tableData[index].weight;
    const { selectionStart, selectionEnd }: any = event.target;

    if (
      event.keyCode === 8 &&
      selectionStart === 0 &&
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
      if (nStr.length === 0) {
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
      setError('Please ensure total weightage remains 100%');
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

    if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
      return;
    }

    const inputWeightage = +sanitizedValue;
    const maxWeightage = +calculateWeightage(totalCards);

    if (inputWeightage > maxWeightage) {
      setError('Please ensure total weightage remains 100%');
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
          ?.options.filter((option: any) => option.code !== 'type_my_own');

        // Filter for qualitative adjustments (modify as needed)

        // Update state with the filtered options
        setQuantitativeOptions(filteredQuantitativeOptions || []);
      }
    } catch (error) {
      console.error('Error fetching comps data:', error);
    }
  };
  useEffect(() => {
    // Call the fetch function when the component mounts
    fetchGlobalCodes();
  }, []);

  const updateCardsValue = (inputWeightage: string, index: undefined) => {
    let new_blended_adjusted_value = 0;
    if (adjustedPricepercentage) {
      new_blended_adjusted_value =
        (adjustedPricepercentage * parseFloat(inputWeightage)) / 100;
    }
    const new_average_adjusted_value =
      (parseFloat(item.price_square_foot) * parseFloat(inputWeightage)) / 100;
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
        name: 'tableData',
      },
    });
  };
  const dollarPerBed =
    item.lease_rate === 0 || item.total_beds === 0
      ? 0
      : item.lease_rate_unit === 'monthly'
        ? (item.lease_rate / item.total_beds) * 12
        : item.lease_rate / item.total_beds;

  const dollarPerUnit =
    item.lease_rate === 0 || item.total_units === 0
      ? 0
      : item.lease_rate_unit === 'monthly'
        ? (item.lease_rate / item.total_units) * 12
        : item.lease_rate / item.total_units;
  const convertSquaretoAcre = 43560;
  const dollarPerSquareFtndAcre = item.price_square_foot * convertSquaretoAcre;

  const capitalizeWords = (str: string | undefined | null): string => {
    if (!str) return '';

    return String(str) // Ensure `str` is treated as a string
      .split(/\s+/) // Split the string by one or more spaces
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter
      )
      .join(' '); // Join the words back with a space
  };

  const getLabelFromValue = (value: any) => {
    const allOptions = [
      ...retailOptions,
      ...officeOptions,
      ...industrialOptions,
      ...multifamilyOptions,
      ...hospitalityOptions,
      ...specialOptions,
      ...residentialOptions,
    ];

    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label
    }

    // If no match, capitalize the first letter of each word
    return capitalizeWords(value);
  };
  const getLabelFromZone = (zoneValue: string) => {
    const foundItem = propertyOptions.find((item) => item.value === zoneValue);

    // If a match is found, return the label; otherwise, return the capitalized zoneValue
    return foundItem ? foundItem.label : capitalizeWords(zoneValue);
  };

  const getLabelFromCondition = (conditionValue: string) => {
    const foundItem = frontageOptions.find(
      (item) => item.value === conditionValue
    );

    // If a match is found, return the label; otherwise, return the capitalized conditionValue
    return foundItem ? foundItem.label : capitalizeWords(conditionValue);
  };
  const getLabelFromLeaseType = (conditionValue: string) => {
    const foundItem = leaseTypeOptions.find(
      (item) => item.value === conditionValue
    );

    // If a match is found, return the label; otherwise, return the capitalized conditionValue
    return foundItem ? foundItem.label : capitalizeWords(conditionValue);
  };
  const getLabelFromLandType = (conditionValue: string) => {
    const foundItem = landTypeOptions.find(
      (item) => item.value === conditionValue
    );

    // If a match is found, return the label; otherwise, return the capitalized conditionValue
    return foundItem ? foundItem.label : capitalizeWords(conditionValue);
  };
  return (
    <div className="flex flex-col w-[15.5%]">
      <h3 className="py-5 text-base capitalize invisible font-semibold">
        Subject Property
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
              to={`/update-comps/${item.comp_id}/${id}/lease/${leaseId}`}
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
          <p className="text-gray-500 text-xs font-medium pb-1 overflow-hidden whitespace-nowrap text-ellipsis">
            {item?.date_sold
              ? new Date(item.date_sold).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })
              : APPROACHESENUMS.SPACE}
          </p>
        </div>
        <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.lease_type
              ? getLabelFromLeaseType(item.lease_type)
              : APPROACHESENUMS.NA}
          </p>
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.term || APPROACHESENUMS.SPACE}
          </p>

          {item.comp_type === 'land_only' ? (
            <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
              {item.land_size
                ? dimension === 'ACRE' && item.land_dimension === 'SF'
                  ? `${(item.land_size / 43560).toLocaleString()} AC`
                  : dimension === 'SF' && item.land_dimension === 'ACRE'
                    ? `${(item.land_size * 43560).toLocaleString()} SF`
                    : `${parseInt(item.land_size, 10).toLocaleString()} ${
                        dimension === 'ACRE' && item.land_dimension === 'ACRE'
                          ? 'AC'
                          : 'SF'
                      }`
                : 'N/A'}
            </p>
          ) : subjectcompType === 'land_only' ? (
            <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
              {item.land_size
                ? dimension === 'ACRE' && item.land_dimension === 'SF'
                  ? `${(item.land_size / 43560).toLocaleString()} AC`
                  : dimension === 'SF' && item.land_dimension === 'ACRE'
                    ? `${(item.land_size * 43560).toLocaleString()} SF`
                    : `${parseInt(item.land_size, 10).toLocaleString()} ${
                        dimension === 'ACRE' && item.land_dimension === 'ACRE'
                          ? 'AC'
                          : 'SF'
                      }`
                : '\u00A0'}
            </p>
          ) : (
            <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
              {appraisalData.comparison_basis === 'Unit' ? (
                formatValue(item.total_units || 0)
              ) : (
                <>
                  {item.building_size
                    ? `${item.building_size.toLocaleString()} SF / `
                    : 'N/A / '}
                  {item.land_size
                    ? dimension === 'ACRE' && item.land_dimension === 'SF'
                      ? `${(item.land_size / 43560).toLocaleString()} AC`
                      : dimension === 'SF' && item.land_dimension === 'ACRE'
                        ? `${(item.land_size * 43560).toLocaleString()} SF`
                        : `${parseInt(item.land_size, 10).toLocaleString()} ${
                            dimension === 'ACRE' &&
                            item.land_dimension === 'ACRE'
                              ? 'AC'
                              : 'SF'
                          }`
                    : 'N/A'}
                </>
              )}
            </p>
          )}

          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.space ? `${formatValue(item.space)} SF` : APPROACHESENUMS.NA}
          </p>
          {subjectcompType === 'land_only' ? (
            <p
              className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
              style={{ marginTop: '10px' }}
            >
              {item.lease_type
                ? getLabelFromLandType(item.land_type)
                : APPROACHESENUMS.NA}
            </p>
          ) : (
            <p
              className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
              title={
                item.zonings?.[0]?.zone
                  ? `${getLabelFromZone(item.zonings[0].zone)}${
                      item.zonings?.[0]?.sub_zone
                        ? ` / ${getLabelFromValue(item.zonings[0].sub_zone)}`
                        : ' / NA'
                    }`
                  : 'NA'
              }
            >
              {item.zonings?.[0]?.zone
                ? getLabelFromZone(item.zonings[0].zone)
                : 'NA'}
              {item.zonings?.[0]?.zone &&
                (item.zonings[0]?.sub_zone
                  ? ` / ${getLabelFromValue(item.zonings[0].sub_zone)}`
                  : ' / NA')}
            </p>
          )}
          {subjectcompType === 'land_only' ? null : (
            <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
              {item.year_built ? item.year_built : APPROACHESENUMS.SPACE}
              {item.year_built && item.year_remodeled ? ' / ' : ''}
              {item.year_remodeled
                ? item.year_remodeled
                : APPROACHESENUMS.SPACE}
            </p>
          )}
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.condition
              ? getLabelFromCondition(item.condition)
              : APPROACHESENUMS.NA}
          </p>
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.zoning_type || APPROACHESENUMS.SPACE}
          </p>
          {item?.comparison_basis === 'Bed' ? (
            <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
              {dollarPerBed !== undefined
                ? `$${dollarPerBed.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '$0.00'}
            </p>
          ) : item?.comparison_basis === 'Unit' ? (
            <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
              {dollarPerUnit !== undefined
                ? `$${dollarPerUnit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '$0.00'}
            </p>
          ) : item?.comp_type === 'land_only' && dimension === 'ACRE' ? (
            <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
              {dollarPerSquareFtndAcre !== undefined
                ? `$${dollarPerSquareFtndAcre.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}${dimension === 'ACRE' ? ' / AC' : ''}`
                : APPROACHESENUMS.NA}
            </p>
          ) : (
            <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
              {item.price_square_foot !== undefined
                ? `$${Number(item.price_square_foot).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '$0.00'}
            </p>
          )}
        </div>
        <div className="p-1.5 pt-0 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
          <div className="w-full">
            {item.expenses?.map((expense: any, expenseIndex: any) => (
              <div key={expense.id} className="subjectPropertyCard">
                {appraisalData?.comp_adjustment_mode === 'Dollar' ? (
                  <div className="flex">
                    <TextField
                      type="text"
                      className="w-1/2 h-[20px] p-0 [&_.MuiInputBase-formControl]:rounded-none"
                      value={
                        expense.adj_value
                          ? sanitizeInputDollarSignComps(expense.adj_value)
                          : '$0.00'
                      }
                      onKeyDown={(e) => {
                        let nStr = expense.adj_value
                          ? `${expense.adj_value}`
                          : '';

                        // Handle when all the text is selected and backspace is pressed
                        const { selectionStart, selectionEnd }: any = e.target;

                        if (
                          e.keyCode === 8 &&
                          selectionStart === 0 &&
                          selectionEnd >= nStr.length
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

                        const sanitizedValue =
                          nStr +
                          (e.key === 'Backspace' || e.key === '-' ? '' : e.key);

                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
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
                          height: '20px',
                        },
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Remove $ sign and other non-numeric characters except decimal point and negative sign
                        let sanitizedValue = value.replace(/[^0-9.-]/g, '');

                        // Ensure only one decimal point
                        const parts = sanitizedValue.split('.');
                        if (parts.length > 2) {
                          sanitizedValue =
                            parts[0] + '.' + parts.slice(1).join('');
                        }

                        // Limit to 2 decimal places
                        if (parts.length === 2 && parts[1].length > 2) {
                          sanitizedValue =
                            parts[0] + '.' + parts[1].substring(0, 2);
                        }

                        // Handle negative sign
                        if (sanitizedValue.indexOf('-') > 0) {
                          sanitizedValue = sanitizedValue.replace(/-/g, '');
                        }

                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
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
                      className={`text-xs ${
                        parseFloat(expense.adj_value) > 0
                          ? 'text-green-600'
                          : parseFloat(expense.adj_value) < 0
                            ? 'text-red-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {parseFloat(expense.adj_value) > 0
                        ? 'Superior'
                        : parseFloat(expense.adj_value) < 0
                          ? 'Inferior'
                          : ''}
                    </span>
                  </div>
                ) : expense.customType === true ? (
                  <div className=" flex">
                    <TextField
                      type="text"
                      className="w-1/2 [&_.MuiInputBase-formControl]:rounded-none"
                      value={expense.adj_value ? `${expense.adj_value}%` : ''}
                      onKeyDown={(e) => {
                        let nStr = expense.adj_value
                          ? `${expense.adj_value}`
                          : '';

                        // Handle when all the text is selected and backspace is pressed
                        const { selectionStart, selectionEnd }: any = e.target;

                        if (
                          e.keyCode === 8 &&
                          selectionStart === 0 &&
                          selectionEnd >= nStr.length
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
                          if (nStr.length === 0) {
                            nStr = '-';
                          }
                          return;
                        } else if (nStr.includes('100')) {
                          nStr = '100';
                        } else if (parseFloat(nStr) > 100) {
                          nStr = nStr.substr(0, 2);
                        }

                        const sanitizedValue = nStr;

                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
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
                          height: '20px',
                        },
                      }}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Allow negative numbers
                        let sanitizedValue = value.replace(/[^0-9.-]/g, '');
                        if (sanitizedValue.indexOf('-') > 0) {
                          sanitizedValue = sanitizedValue.replace(/-/g, '');
                        }

                        // Limit the input value to between -100 and 100
                        if (parseFloat(sanitizedValue) < -100) {
                          sanitizedValue = '-100';
                        } else if (parseFloat(sanitizedValue) > 100) {
                          sanitizedValue = sanitizedValue.substr(0, 2);
                        }

                        const parts = sanitizedValue.split('.');

                        if (
                          parts.length > 2 ||
                          (parts.length === 2 && parts[1].length > 2)
                        ) {
                          return;
                        }

                        if (parts[0].length > 3) {
                          return;
                        }

                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
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
                      className={`text-xs ${
                        expense.adj_value > 0
                          ? 'text-red-600'
                          : expense.adj_value < 0
                            ? 'text-green-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {expense.adj_value > 0
                        ? 'Inferior'
                        : expense.adj_value < 0
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

                        marginRight: '13px',
                        width: '17px',
                        height: '17px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
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
                            : 0
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
                                ? 0
                                : number;

                              const weight = comp.weight;

                              const { total, expenses: updatedExpenses } =
                                getExpensesTotal(
                                  expenses,
                                  expenseIndex,
                                  isCustomValue ? 0 : number
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
                      className={`text-sm font-normal ${
                        parseFloat(expense.adj_value || '0') > 0
                          ? 'text-red-500 font-semibold'
                          : parseFloat(expense.adj_value || '0') < 0
                            ? '  text-green-500 font-semibold'
                            : 'text-gray-500 '
                      }`}
                    >
                      {parseFloat(expense.adj_value || '0') > 0
                        ? 'Inferior'
                        : parseFloat(expense.adj_value || '0') < 0
                          ? 'Superior'
                          : 'Equal'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-1">
          <div className="w-full">
            {item.quantitativeAdjustments?.map(
              (expense: any, expenseIndex: any) => (
                <div
                  key={expense.id}
                  className="subjectPropertyCard overflow-hidden"
                >
                  <div className="flex items-center">
                    <div className="w-1/2 h-[18.3px] qualitative-dropdown">
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
            Click to add adjustment notes
          </p>
        </div>
        <div className="mt-2 px-1 flex flex-col gap-[2px] pb-2">
          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium">
            {values.tableData[index].total
              ? appraisalData?.comp_adjustment_mode === 'Dollar'
                ? `${formatPrice(values.tableData[index].total || 0)}`
                : `${Number(values.tableData[index].total).toFixed(2)}%`
              : appraisalData?.comp_adjustment_mode === 'Dollar'
                ? '$0.00'
                : '0.00%'}
          </p>

          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            {values.tableData[index].adjusted_psf
              ? formatPrice(values.tableData[index].adjusted_psf || 0)
              : '$0.00'}
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
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}

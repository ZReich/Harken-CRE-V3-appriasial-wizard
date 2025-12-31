import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import AppraisalMenu from '../../set-up/appraisa-menu';
import { Grid, Typography } from '@mui/material';
import { useGet } from '@/hook/useGet';
import { FieldArray, useFormikContext } from 'formik';
import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
import { RequestType, useMutate } from '@/hook/useMutate';
import CommonButton from '@/components/elements/button/Button';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@mui/material';
import TextEditor from '@/components/styles/text-editor';
import defaultPropertImage from '../../../../images/default-placeholder.png';
import { AppraisalEnum } from '../../set-up/setUpEnum';
import { options } from '@/pages/comps/comp-form/fakeJson';
import {
  frontageOptions,
  utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import loadingImage from '../../../../images/loading.png';
import CompsCard from './compsCrad';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import UploadSalesCompsModal from '../../sales/upload-comps-from-sales';
import { Comp } from '@/pages/comps/Listing/comps-table-interfaces';
import CostCompsForm from './cost-comps-table';
import { capitalizeWords, formatPrice } from '@/utils/sanitize';
import {
  ListingHeaderEnum,
  ListingEnum,
  CreateCompsEnum,
  BuildingDetailsEnum,
  MenuOptionsEnum,
  LocalStorageKeysEnum,
  PayloadFieldsEnum,
  UnitsEnum,
} from '@/pages/comps/enum/CompsEnum';

export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  const landWithAcre =
    comp.land_dimension === BuildingDetailsEnum.SF
      ? parseFloat((comp.land_size / ListingEnum.SQFT_ACRE).toFixed(3))
      : comp.land_size; // Round to 3 decimal places
  const landSF =
    comp.land_dimension === UnitsEnum.ACRE
      ? parseFloat((comp.land_size * ListingEnum.SQFT_ACRE).toFixed(2))
      : comp.land_size; // Round to 3 decimal places
  const landPricePerUnit = comp.sale_price / landWithAcre;

  const updatedAdjustedPsf =
    appraisalData?.comp_adjustment_mode === ListingEnum.DOLLAR
      ? appraisalData.land_dimension === UnitsEnum.ACRE
        ? total + landPricePerUnit
        : total + comp.sale_price / comp.land_size
      : appraisalData.land_dimension === UnitsEnum.ACRE
        ? (total / ListingEnum.HUNDRED) * landPricePerUnit + landPricePerUnit
        : ((total / ListingEnum.HUNDRED) * comp.sale_price) / landSF + comp.sale_price / landSF;

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

const CostApproach: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [appraisalId, setAppraisalId] = useState('');
  const [appraisalSalesApproachId, setAppraisalSalesApproachId] = useState<
    string | null
  >(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [landDimesion, setLandDimension] = useState('');
  const { handleChange, values, setValues } = useFormikContext<any>();
  const [landDimensions, setLandDimensions] = useState<any>(null);
  const costId = searchParams.get('costId');
  // const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [hasIncomeType, setHasIncomeType] = React.useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [costName, setCostName] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [salesNote, setSalesNote] = useState('new');
  const [loading, setLoading] = useState(true);
  const [compsLength, setCompsLength] = useState('');

  const [openComps, setCompsOpen] = useState(false);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [loader, setLoader] = useState(false);
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
  const updatedCompsCost = location.state?.updatedCompsCost;
  const [hasProcessedComps, setHasProcessedComps] = useState(false);
  const [hasProcessedCostComps, setHasProcessedCostComps] = useState(false);

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // });
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
    queryKey: `appraisals/get`,
    endPoint: `appraisals/get/${id}`,
    config: {
      enabled: Boolean(costId),
      refetchOnWindowFocus: false,
      onSuccess(data: any) {
        if (!data?.data?.data) {
          console.error(ListingEnum.INVALID_DATA_STRUCTURE_RECEIVED);
          return;
        }

        setLandDimension(data.data.data.land_dimension); // Set the land dimension
        const landDimension = data.data.data.land_dimension;

        const mapData = data.data.data.appraisal_approaches;

        mapData &&
          mapData.map((item: any) => {
            if (item.id == costId) {
              setCostName(item.name);
            }
          });

        const appraisalApproach = data.data.data.appraisal_approaches?.find(
          (approach: any) =>
            costId ? approach.id == parseFloat(costId) : false
        );

        // Find the 'cover' image in the appraisal_files array
        const coverImage = data?.data?.data?.appraisal_files?.find(
          (file: any) => file.title === ListingEnum.COVER
        );

        // Construct the URL and set the global state
        if (coverImage) {
          const imageUrl = coverImage.dir;
          setCoverImageUrl(imageUrl);
        }
        setLandDimensions(landDimension);

        const appraisalSalesApproachIdValue =
          appraisalApproach?.appraisal_cost_approach?.id || null;
        setAppraisalSalesApproachId(appraisalSalesApproachIdValue);

        if (appraisalSalesApproachIdValue) {
          fetchComposData(values, setValues);
        } else {
          console.error('appraisalSalesApproachId is undefined');
        }
      },
    },
  });
  // API FOR GET RECENT PAGE URL
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
  }, [id, mutateAsync, costId]);
  // Use useEffect to react to changes in landDimension
  // useEffect(() => {
  //   console.log('Updated landDimension:', landDimesion);
  // }, [landDimesion]); // This will run whenever landDimension changes

  useEffect(() => {
    refetch();
  }, [refetch, costId]);

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
    }
  }, [areaInfoData?.data?.data?.appraisal_approaches]);

  // FETCHING ATTRIBUTES OF APPRAISALS
  const appraisalData = areaInfoData?.data.data || {};

  // const appraisalApproach =
  //   areaInfoData?.data?.data?.appraisal_approaches?.find((approach: any) =>
  //     costId ? approach.id == parseFloat(costId) : false
  //   );
  // FUNCTION TO FETCH COMPS DATA
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `appraisals/get-cost-approach?appraisalId=${id}&appraisalApproachId=${costId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;
      setCompsLength(compsArr?.length || 0);

      localStorage.setItem('compsLengthCost', compsArr.length);

      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      const salesNoteForComp = response?.data?.data?.data?.notes;

      setSalesNote(salesNoteForComp);
      if (response?.data?.data?.data == null) {
        setValues({
          ...values,
          tableData: [],
          operatingExpenses: values.operatingExpenses,
        });
      }

      const formattedOperatingExpenses =
        response?.data?.data?.data.cost_subject_property_adjustments.map(
          ({ adj_key, adj_value, ...restAdj }: any) => {
            return {
              ...restAdj,
              comparison_basis: adj_value ? adj_value + '%' : ListingEnum.ZERO,
              adj_key: adj_key,
              adj_value: adj_value,
            };
          }
        );

      const calculatedComps = []; // Array to store calculated comp data

      for (let i = 0; i < compsArr.length; i++) {
        const c = compsArr[i];
        const weight = c?.weight;
        const total = c?.total_adjustment;
        // const appData = appraisalData;
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
            adj_value: newValue.adj_value || ListingEnum.ZERO,
            customType: isCustom,
          };
        });
        const avgpsf =
          (total / ListingEnum.HUNDRED) * c?.comp_details?.price_square_foot +
          c?.comp_details?.price_square_foot;
        const finalavgpsf = (avgpsf * weight) / ListingEnum.HUNDRED;
        // (total / ListingEnum.HUNDRED) * price_square_foot + price_square_foot;
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
          // adjusted_psf: c?.adjusted_psf,
        });
      }

      // Set combined values in state once
      setValues({
        ...values,
        tableData: calculatedComps,
        operatingExpenses: formattedOperatingExpenses,
      });

      setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      // Handle the error
    }
  };

  useEffect(() => {
    fetchComposData(values, setValues);
  }, [costId]);

  useEffect(() => {
    if (values.operatingExpenses) {
      const salesApproachValues = {
        operatingExpenses: values.operatingExpenses,
      };
      localStorage.setItem(
        'costApproachValuesAppraisal',
        JSON.stringify(salesApproachValues)
      );
    }
  }, [values.operatingExpenses]);
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

      const newDataTotal = (adjustedPricepercentage * itemWeightage) / ListingEnum.HUNDRED;

      return total + newDataTotal;
    }, ListingEnum.ZERO);

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

      order: index + 1,
      total_adjustment: item?.total,
      adjusted_psf: isNaN(item.adjusted_psf) ? ListingEnum.ZERO : item.adjusted_psf,
      weight: parseFloat(item.weight),

      comps_adjustments: comps_adjustments,
    };
  });

  const salesApproachData = {
    ...(appraisalSalesApproachId ? { id: appraisalId } : {}),
    //   'id':appraisalId,
    appraisal_approach_id: costId ? parseFloat(costId) : null,
    averaged_adjusted_psf: totalaveragedadjustedpsf,
    weight: parseFloat(totalWeightage.toString()),
    notes: salesNote,

    land_value: FinalResult,
    overall_replacement_cost: ListingEnum.ZERO,
    total_depreciation: ListingEnum.ZERO,
    total_depreciation_percentage: ListingEnum.ZERO,
    total_depreciated_cost: ListingEnum.ZERO,
    total_cost_valuation: ListingEnum.ZERO,
    indicated_value_psf: ListingEnum.ZERO,
    indicated_value_punit: ListingEnum.ZERO,
    improvements_total_adjusted_cost: ListingEnum.ZERO,
    improvements_total_adjusted_ppsf: ListingEnum.ZERO,
    improvements_total_depreciation: ListingEnum.ZERO,
    improvements_total_sf_area: ListingEnum.ZERO,
    cost_subject_property_adjustments: subject_property_adjustments,
    comps: comps,
  };

  const finalData = {
    appraisal_id: id ? parseFloat(id) : null,
    cost_approach: salesApproachData,
  };

  const mutation = useMutate<any, any>({
    queryKey: 'save-cost-approach',
    endPoint: 'appraisals/save-cost-approach',
    requestType: RequestType.POST,
  });

  const mutations = useMutate<any, any>({
    queryKey: 'update-cost-approach',
    endPoint: 'appraisals/update-cost-approach',
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
        navigate(`/cost-comps-map?id=${id}&costId=${costId}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };

  const uploadComps = () => {
    localStorage.setItem('compsLengthcostappraisal', compsLength);
    localStorage.setItem('activeType', 'land_only');

    navigate(`/appraisal/upload-cost-comps?id=${id}&costId=${costId}`, {
      state: {
        operatingExpenses: values.operatingExpenses,
      },
    });
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
        navigate(`/update-comps/${itemId}/${id}/cost/${costId}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };

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
      toast.error(ListingEnum.ERROR_OCCURED_TRY_AGAIN);
    }
  };
  const handleAddNewComp = () => {
    localStorage.setItem(LocalStorageKeysEnum.CHECK_STATUS, LocalStorageKeysEnum.SALES);
    localStorage.removeItem(LocalStorageKeysEnum.SELECTED_TOGGLE);
    localStorage.removeItem(LocalStorageKeysEnum.VIEW);
    localStorage.setItem(LocalStorageKeysEnum.COMPS_LENGTH_COST_APPRAISAL, compsLength);

    localStorage.setItem(LocalStorageKeysEnum.ACTIVE_TYPE, MenuOptionsEnum.LAND_ONLY);
    // setIsOpen(true);
    navigate(`/filter-cost-comps?id=${id}&approachId=${costId}`, {
      state: {
        compsLength: compsLength,
      },
    });
  };

  const handleLinkExistingComps = () => {
    localStorage.setItem('activeType', 'land_only');
    navigate(`/cost/create-comp?id=${id}&approachId=${costId}`, {
      state: {
        compsLength: compsLength,
      },
    });
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

  const passCompsDataToFilterCost = (comps: any) => {
    setValues((oldValues: { tableData: any }) => {
      // Check if we're at the 4 comp limit
      if (oldValues.tableData.length >= ListingEnum.FOUR) {
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
      }, ListingEnum.HUNDRED);

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });
  };

  useEffect(() => {
    if (updatedCompsCost && !hasProcessedCostComps) {
      setTimeout(() => {
        passCompsDataToFilterCost(updatedCompsCost);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
        setHasProcessedCostComps(true);
      }, 2000);
    }
  }, [updatedCompsCost, hasProcessedCostComps]);
  const handleSubmitWithUpdatedComps = async (updatedComps: any) => {
    try {
      // Get fresh appraisal data
      const freshDataResponse = await axios.get(`appraisals/get/${id}`);
      const freshAppraisalApproach =
        freshDataResponse?.data?.data?.data?.appraisal_approaches?.find(
          (approach: any) =>
            costId ? approach.id == parseFloat(costId) : false
        );
      const freshAppraisalSalesApproachId = freshAppraisalApproach
        ? freshAppraisalApproach.appraisal_cost_approach?.id
        : null;

      console.log(
        'freshAppraisalSalesApproachId:',
        freshAppraisalSalesApproachId
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
          // ...(freshAppraisalSalesApproachId ? { id: item.id } : {}),
          comp_id: comp_id,
          order: index + 1,
          total_adjustment: item?.total,
          adjusted_psf: isNaN(item.adjusted_psf) ? 0 : item.adjusted_psf,
          weight: parseFloat(item.weight),
          comps_adjustments: comps_adjustments,
        };
      });

      const updatedSalesApproachData = {
        ...(freshAppraisalSalesApproachId
          ? { id: freshAppraisalSalesApproachId }
          : {}),
        appraisal_approach_id: costId ? parseFloat(costId) : null,
        averaged_adjusted_psf: updatedTotalAveragedAdjustedPsf,
        weight: parseFloat(updatedTotalWeightage.toString()),
        notes: salesNote,
        land_value: updatedFinalResult,
        overall_replacement_cost: ListingEnum.ZERO,
        total_depreciation: ListingEnum.ZERO,
        total_depreciation_percentage: ListingEnum.ZERO,
        total_depreciated_cost: ListingEnum.ZERO,
        total_cost_valuation: ListingEnum.ZERO,
        indicated_value_psf: ListingEnum.ZERO,
        indicated_value_punit: ListingEnum.ZERO,
        improvements_total_adjusted_cost: ListingEnum.ZERO,
        improvements_total_adjusted_ppsf: ListingEnum.ZERO,
        improvements_total_depreciation: ListingEnum.ZERO,
        improvements_total_sf_area: ListingEnum.ZERO,
        cost_subject_property_adjustments: subject_property_adjustments,
        comps: updatedCompsData,
      };

      const updatedFinalData = {
        appraisal_id: id ? parseFloat(id) : null,
        cost_approach: updatedSalesApproachData,
      };

      let response;

      if (freshAppraisalSalesApproachId) {
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
        refetch();
        fetchComposData(values, setValues);
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
  // // function for capitalize attribute
  // const capitalizeWords = (str: string = '') => {
  //   if (typeof str !== 'string') {
  //     return '';
  //   }

  //   return str
  //     .split(/\s+/)
  //     .map(
  //       (word: string) =>
  //         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  //     )
  //     .join(' '); // Join the words back with a space
  // };

  const getLabelFromCondition = (conditionValue: string) => {
    const foundItem = frontageOptions.find(
      (item) => item.value === conditionValue
    );

    // If a match is found, return the label; otherwise, return the capitalized conditionValue
    return foundItem ? foundItem.label : capitalizeWords(conditionValue);
  };
  const getLabelFromUtilities = (topography: string) => {
    const foundItem = utilitiesOptions.find(
      (item) => item.value === topography
    );

    // If a match is found, return the label; otherwise, return the capitalized conditionValue
    return foundItem ? foundItem.label : capitalizeWords(topography);
  };

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

  const passCompsDataToFilter1 = (comps: any) => {
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
      }, 0);

      return {
        ...oldValues,
        tableData: updatedComps,
        averaged_adjusted_psf: totalAverageAdjustedPsf,
      };
    });

    // setIsOpen(false);
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
        <CostCompsForm
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
          {CreateCompsEnum.COST_COMPS} <span>({costName})</span>
        </Typography>

        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">
            {CreateCompsEnum.VALUE_OF_LAND}
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
              <p className="pb-1 text-xs font-bold">{CreateCompsEnum.DATE_SOLD} </p>
            </div>

            <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {CreateCompsEnum.SALES_PRICE}
              </p>
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {ListingEnum.BUILDING_SIZE_LAND_SIZE}
              </p>
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {ListingEnum.ZONING}
              </p>
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {ListingEnum.SERVICES_}
              </p>
              <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {CreateCompsEnum.FRONTAGE}
              </p>
              {landDimesion === UnitsEnum.ACRE ? (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  {ListingEnum.ACRE}
                </p>
              ) : (
                <p className="h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  {ListingEnum.SF}
                </p>
              )}
            </div>
            {/* ------------------------------------------------------------------------------- */}
            <div className=" px-1 pb-1">
              <FieldArray
                name="operatingExpenses"
                render={() => (
                  <>
                    {values.operatingExpenses &&
                    values.operatingExpenses.length > ListingEnum.ZERO ? (
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

                              {i === values.operatingExpenses.length - ListingEnum.ONE && (
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

            <div className="mt-2 flex flex-col gap-[2px]">
              <p className="text-xs h-[18px] !m-0 font-semibold italic text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
              </p>
              {landDimesion === UnitsEnum.ACRE ? (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_DOLLAR_PER_ACRE}
                </p>
              ) : (
                <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  {CreateCompsEnum.ADJUSTED_DOLLAR_PER_SF}
                </p>
              )}
              <p className="text-xs h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.WEIGHTING}
              </p>

              <p className="text-base h-[18px] !m-0 font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                {CreateCompsEnum.TOTAL_LAND_VALUE}
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
              <p className="text-xs text-[#687F8B] pb-1 font-medium overflow-hidden whitespace-nowrap text-ellipsis">
                {'\u00A0'}
              </p>
            </div>
            <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {'\u00A0'}
              </p>

              {/* <p className="text-gray-500 font-medium">
                    {appraisalData.property_type
                      ? appraisalData.property_type
                      : '\u00A0'}
                  </p> */}
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {appraisalData.building_size
                  ? `${formatNumber(appraisalData.building_size)} SF`
                  : 'NA'}
                {appraisalData.building_size &&
                  (appraisalData.land_size
                    ? ` / ${formatNumber(appraisalData.land_size)} ${
                        landDimesion === UnitsEnum.ACRE ? 'AC' : BuildingDetailsEnum.SF
                      }`
                    : MenuOptionsEnum.PER_NA)}
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
                {capitalizeWords(appraisalData.zoning_type || '\u00A0')}
              </p>
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {appraisalData.utilities_select
                  ? getLabelFromUtilities(appraisalData.utilities_select)
                  : '\u00A0'}
              </p>

              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {appraisalData.frontage
                  ? getLabelFromCondition(appraisalData.frontage)
                  : APPROACHESENUMS.NA}
              </p>
              <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
                {appraisalData.price_square_foot
                  ? parseFloat(appraisalData.price_square_foot).toLocaleString(
                      'en-US',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : '\u00A0'}
              </p>
            </div>
            <div className="pb-1 mt-2 min-h-[26px] border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
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
                {CreateCompsEnum.OVERALL_ADJUSTMENT}
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
              <p className="text-gray-500 h-[18px] !m-0 text-ellipsis overflow-hidden whitespace-nowrap font-bold text-base uppercase">
                {formatPrice(FinalResult || ListingEnum.ZERO)}
              </p>
            </div>
          </div>
        </div>
        {values.tableData?.map((item: any, index: any) => (
          <CompsCard
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
      {/* Modal for Filter */}
      {/* {isOpen && (
        <CostFilter
          passCompsData={passCompsDataToFilter}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          tableLength={tableLength}
          appraisalData={appraisalData}
          tableData={tableData}
        />
      )} */}

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
      <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5">
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            if (hasCostType && filtereCostdData.length > ListingEnum.ONE) {
              const costIndex = filtereCostdData.findIndex(
                (element) => element.id == costId
              );

              // If costId is found and it's not the first element
              if (costIndex > 0) {
                const costIdRedirectIndex = filtereCostdData[costIndex - 1].id;
                navigate(
                  `/cost-approach-improvement?id=${id}&costId=${costIdRedirectIndex}`
                );
                return;
              } else {
                if (hasLeaseType) {
                  navigate(
                    `/lease-comps-map?id=${id}&leaseId=${filtereLeasedData?.[filtereLeasedData.length - 1]?.id}`
                  );
                  return;
                } else if (hasSaleType) {
                  navigate(
                    `/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
                  );
                  return;
                } else if (hasRentRollType) {
                  navigate(
                    `/rent-roll?id=${id}&appraisalId=${filtereRentRollData?.[filtereRentRollData.length - 1]?.id}`
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
            } else if (hasLeaseType) {
              navigate(
                `/lease-comps-map?id=${id}&leaseId=${filtereLeasedData?.[filtereLeasedData.length - 1]?.id}`
              );
              return;
            } else if (hasSaleType) {
              navigate(
                `/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
              );
              return;
            } else if (hasRentRollType) {
              navigate(
                `/rent-roll?id=${id}&appraisalId=${filtereRentRollData?.[filtereRentRollData.length - 1]?.id}`
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
    </AppraisalMenu>
  );
};

export default CostApproach;

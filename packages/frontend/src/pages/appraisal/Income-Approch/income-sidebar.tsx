import React, { useEffect, useState, useRef } from 'react';
import { Expense } from './Expense';
import { NetIncome } from './net-income';
import { Income } from './income';
import { Formik, Form } from 'formik';
import { useMutate, RequestType } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResponseType } from '@/components/interface/response-type';
import { useGet } from '@/hook/useGet';
import { IncomeApproachEnum } from '../Enum/AppraisalEnum';
import { OtherIncome } from './other-income';

import {
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  propertyOptions,
  residentialOptions,
  retailOptions,
  specialOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { landTypeOptions } from '@/pages/comps/create-comp/SelectOption';
import loadingImage from '../../../images/loading.png';

import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { Button } from '@mui/material';
import { AppraisalEnum } from '../set-up/setUpEnum';

const IncomeApprochSidebar: React.FC<any> = ({ matchName }: any) => {
  const [lastButtonClicked, setLastButtonClicked] = useState('');

  // const handlePreviousClick = (values: any) => {
  //   const params = mapValuesToParams(values);
  //   mutate(params, {
  //     onSuccess: () => {
  //       setLoader(false);
  //     },
  //   });
  //   setLastButtonClicked('previous');
  // };

  const handleNextClick = () => {
    setLastButtonClicked('next');
  };

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const STATE_ID = searchParams.get('IncomeId');

  const Income_Id = localStorage.getItem('incomeId');

  const navigate = useNavigate();
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'save-income-approach',
    endPoint: 'appraisals/save-income-approach',
    requestType: RequestType.POST,
  });

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
  }, [id, mutateAsync, STATE_ID]);

  const [compType, setCompType] = useState('');
  const [landType, setLandType] = useState('');
  const [landSize, setLandSize] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<any>();
  const [annualIncome, setAnnualIncome] = useState<any>();
  const [indicatedSfCapRate, setIndicatedSfCapRate] = useState(0);
  const [indicatedSfMarketRate, setIndicatedSfMarketRate] = useState(0);
  const [indicatedSfHighRate, setIndicatedSfHighRate] = useState(0);
  const [effectiveIncome, setEffectiveIncome] = useState<any>();
  const [operationExpenseData, setOpeartionExpenseData] = useState([]);
  const [totalAnnualIncomess, setTotalAnnualIncomess] = useState(0);
  const [indicatedCapRate, setIndicatedCapRate] = useState(0);
  const [indicatedMarketRate, setIndicatedMarketRate] = useState(0);
  const [indicatedHighRate, setIndicateHighRate] = useState(0);
  const [loader, setLoader] = useState(false);
  const [unitMarketRate, setUnitMarketRate] = useState<number>(0); // Add this state

  const [totalExpenses, setTotalExpenses] = useState<any>();
  console.log(unitMarketRate);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { data, refetch, isLoading } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: { enabled: Boolean(id), refetchOnWindowFocus: false },
  });
  const totalUnits = data?.data?.data?.total_units;
  const data_zonings = data?.data?.data?.zonings;
  const analysis_type = data?.data?.data?.analysis_type;

  useEffect(() => {
    const fetchData = async () => {
      if (STATE_ID) {
        const matchedItem = data?.data?.data?.appraisal_approaches.find(
          (item: { id: any }) => item.id == STATE_ID
        );
        if (matchedItem) {
          matchName(matchedItem.name);
        }
      }
      try {
        setCompType(data?.data?.data?.comp_type);
        setLandType(data?.data?.data?.land_type);
        setLandSize(data?.data?.data?.land_size);
        refetch();
      } catch (error) {
        console.error('Error while mutating data:', error);
      }
    };
    fetchData();
  }, [data?.data?.data, STATE_ID, refetch, mutateAsync]);

  let appraisalIncomeApproachIds = 0;
  if (
    data?.data?.data?.appraisal_approaches[0].appraisal_income_approach ===
    null &&
    data?.data?.data?.appraisal_approaches[0].type === 'income'
  ) {
    appraisalIncomeApproachIds = 0;
  } else {
    const mapData = data?.data?.data?.appraisal_approaches;

    mapData &&
      mapData.map((item: any) => {
        if (item.id == STATE_ID) {
          appraisalIncomeApproachIds = item?.appraisal_income_approach?.id;
        }
      });
  }

  const [hasIncomeType, setHasIncomeType] = useState(false);
  const [hasSaleType, setHasSaleType] = useState(false);
  const [hasRentRollType, setHasRentRollType] = useState(false);

  const [hasCostType, setHasCostType] = React.useState(false);
  const [hasLeaseType, setHasLeaseType] = React.useState(false);
  const [filtereIncomeData, setFilteredIncomeData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCostdData, setFilteredCostsData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereLeasedData, setFilteredLeasedData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filteredRentRollData, setFilteredRentRoledData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  useEffect(() => {
    if (data?.data?.data?.appraisal_approaches && !data.isStale) {
      const updateData = data.data.data.appraisal_approaches;
      const incomeApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'income'
      );
      setHasIncomeType(incomeApproaches.length > 0);
      setFilteredIncomeData(incomeApproaches);

      const salesApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'sale'
      );
      setHasSaleType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const RentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'rent_roll'
      );
      setHasRentRollType(RentRollApproaches.length > 0);
      setFilteredRentRoledData(RentRollApproaches);

      const costApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'cost'
      );

      setHasCostType(costApproaches.length > 0);
      setFilteredCostsData(costApproaches);
      const leaseApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'lease'
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeasedData(leaseApproaches);
    }
  }, [data?.data?.data?.appraisal_approaches]);

  useEffect(() => {
    if (id && STATE_ID) {
      // Add a slight delay to ensure the component is ready
      const timeoutId = setTimeout(() => {
        refetch();
        // refetchClientApproach will be called when the hook is available
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [STATE_ID, id, refetch]);

  const {
    data: clientApproch,
    isFetching,
    refetch: refetchClientApproach,
  } = useGet<any>({
    queryKey: '1df',
    endPoint: `appraisals/income-approach?appraisalId=${id}&appraisalApproachId=${STATE_ID}`,
    config: { enabled: Boolean(id && STATE_ID) },
  });

  const client_approch_source = clientApproch?.data?.data?.incomeSources;
  const client_approch_expense = clientApproch?.data?.data?.operatingExpenses;

  // Refetch client approach when STATE_ID changes
  useEffect(() => {
    if (id && STATE_ID) {
      const timeoutId = setTimeout(() => {
        refetchClientApproach();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [STATE_ID, id, refetchClientApproach]);

  // const getLabelFromValue = (value: any, options: any[]) => {
  // const option = options.find((option) => option.value === value);
  // return option ? option.label : value;
  // };
  const capitalizeWords = (str: string) => {
    const exceptions = ['and', 'of', 'the', 'w/o', 'with']; // Words to keep in lowercase

    return str
      ?.split(/\s+/) // Split the string by one or more spaces
      .map((word: string, index: number) => {
        // Check if word contains parentheses
        if (word.includes('(') && word.includes(')')) {
          const parts = word.split('(');
          const mainWord = parts[0].trim();
          const insideParentheses = parts[1].replace(')', '').toUpperCase(); // Convert content inside parentheses to uppercase
          return `${mainWord.charAt(0).toUpperCase() + mainWord.slice(1)}(${insideParentheses})`; // Capitalize main word and keep parentheses content uppercase
        }

        if (exceptions.includes(word.toLowerCase()) && index !== 0) {
          // Keep exception words in lowercase unless it's the first word
          return word.toLowerCase();
        }

        if (word.includes('-')) {
          // Handle hyphenated words
          return word
            .split('-')
            .map(
              (subWord) => subWord.charAt(0).toUpperCase() + subWord.slice(1)
            )
            .join('-');
        }

        if (word.includes('/')) {
          // Handle words with a slash
          return word
            .split('/')
            .map(
              (subWord) => subWord.charAt(0).toUpperCase() + subWord.slice(1)
            )
            .join('/');
        }

        // Capitalize the first letter of other words
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' '); // Join the words back with spaces
  };

  const getLabelFromValue = (
    value: any,
    multifamilyOptions: { value: string; label: string }[]
  ) => {
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

  const mapValuesToParams = (values: any) => {
    const operatingExpenses = values.operatingExpenses?.map((ele: any) => {
      return {
        name: ele.names,
        annual_amount: ele.annual_amount
          ? parseFloat(ele.annual_amount.toString().replace(/,/g, ''))
          : 0,
        total_per_sq_ft: ele.total_per_sq_ft
          ? parseFloat(ele.total_per_sq_ft.toString().replace(/,/g, ''))
          : 0,
        total_per_bed: ele.total_per_bed
          ? parseFloat(ele.total_per_bed.toString().replace(/,/g, ''))
          : 0,
        comments: ele.comments || '',
        percentage_of_gross: Number(ele.percentage_of_gross) || 0,
        total_per_unit: ele.total_per_unit
          ? parseFloat(ele.total_per_unit.toString().replace(/,/g, ''))
          : 0,
        id: ele.extra_id ? ele.extra_id : null,
      };
    }) || [];

    const toTitleCase = (str: string) => {
      const allOptions = [
        ...retailOptions,
        ...officeOptions,
        ...industrialOptions,
        ...multifamilyOptions,
        ...hospitalityOptions,
        ...specialOptions,
        ...residentialOptions,
      ];
      const option = allOptions.find((option) => option.label === str);
      if (option) {
        return option?.value;
      }
      return str;
    };

    const income_source = values.incomeSources?.map((ele: any) => {
      return {
        type: toTitleCase(ele.type),
        monthly_income: Number(ele.monthly_income) || 0,
        annual_income: Number(ele.annual_income) || 0,
        rent_sq_ft: isNaN(parseFloat(ele.rent_sq_ft))
          ? 0
          : parseFloat(ele.rent_sq_ft),
        sf_source: ele.sf_source
          ? parseFloat(ele.sf_source.toString().replace(/,/g, ''))
          : 0,
        comments: ele.comments || '',
        bed: ele.rent_bed
          ? parseFloat(ele.rent_bed.toString().replace(/,/g, ''))
          : 0,
        unit: ele.unit ? parseFloat(ele.unit.toString().replace(/,/g, '')) : 0,
        zoning_id: ele.id ? ele.id : null,
        id: ele.extra_id ? ele.extra_id : null,
        link_overview: ele?.link_overview === 0 ? 0 : 1,
      };
    }) || [];
    
    const other_income_source = values.otherIncomeSources?.map((ele: any) => {
      return {
        type: ele.type || '',
        monthly_income: Number(ele.monthly_income) || 0,
        annual_income: Number(ele.annual_income) || 0,
        square_feet: ele.square_feet
          ? parseFloat(ele.square_feet.toString().replace(/,/g, ''))
          : 0,
        comments: ele.comments || '',
      };
    }) || [];

    return {
      id: appraisalIncomeApproachIds ? appraisalIncomeApproachIds : null,
      appraisal_approach_id: STATE_ID ? STATE_ID : Income_Id,
      operatingExpenses: operatingExpenses,
      cap_rate_notes: values.cap_rate_notes?.toString() || '',
      vacancy: values.vacancy ? values.vacancy : null,
      total_sq_ft: values.total_sq_ft ? values.total_sq_ft : 0,
      other_total_sq_ft: values.other_total_sq_ft
        ? values.other_total_sq_ft
        : 0,
      total_rent_sq_ft: values.total_rent_sq_ft ? values.total_rent_sq_ft : 0,
      total_oe_per_square_feet: values.total_oe_per_square_feet || null,
      total_oe_gross: values.total_oe_gross || null,
      total_oe_annual_amount: values.total_oe_annual_amount || null,
      total_net_income: values.total_net_income || 0,
      total_monthly_income: values.total_monthly_income || 0,
      other_total_monthly_income: values.other_total_monthly_income || 0,
      total_annual_income: values.total_annual_income || 0,
      other_total_annual_income: values.other_total_annual_income || 0,
      sq_ft_capitalization_rate: Number(values.sq_ft_capitalization_rate) || 0,
      high_capitalization_rate: Number(values.high_capitalization_rate) || 0,
      net_income: values.net_income.toString() || '0',
      monthly_capitalization_rate: Number(values.monthly_capitalization_rate) || 0,
      indicated_range_sq_feet: indicatedHighRate ? indicatedHighRate : 0,
      indicated_range_monthly: indicatedCapRate ? indicatedCapRate : 0,
      indicated_range_annual: indicatedMarketRate ? indicatedMarketRate : 0,
      indicated_psf_sq_feet: indicatedSfHighRate ? indicatedSfHighRate : 0,
      indicated_psf_monthly: indicatedSfCapRate ? indicatedSfCapRate : 0,
      indicated_psf_annual: indicatedSfMarketRate ? indicatedSfMarketRate : 0,
      expense_notes: values.expense_notes || '',
      annual_capitalization_rate: Number(values.annual_capitalization_rate) || 0,
      vacant_amount: values.vacant_amount || 0,
      adjusted_gross_amount: values.adjusted_gross_amount || 0,
      income_notes: values.income_notes || '',
      appraisal_id: id,
      total_unit: values.total_unit || null,
      total_bed: values.total_bed || null,
      total_oe_per_unit: values.total_oe_per_unit || 0,
      total_oe_per_bed: values.total_oe_per_bed || 0,
      indicated_psf_unit: values.indicated_psf_unit
        ? values.indicated_psf_unit
        : 0,
      incomeSources: income_source,
      otherIncomeSources: other_income_source,
    };
  };
  const handleSubmit = (values: any) => {
    setLoader(true);
    
    // Ensure all calculations are up to date before submitting
    const updatedValues = {
      ...values,
      total_net_income: values.total_net_income || 0,
      total_annual_income: values.total_annual_income || 0,
      total_monthly_income: values.total_monthly_income || 0,
      other_total_annual_income: values.other_total_annual_income || 0,
      other_total_monthly_income: values.other_total_monthly_income || 0,
      total_oe_annual_amount: values.total_oe_annual_amount || 0,
      adjusted_gross_amount: values.adjusted_gross_amount || 0,
      vacant_amount: values.vacant_amount || 0,
    };

    const params = mapValuesToParams(updatedValues);
    const datas: any = data?.data?.data?.appraisal_approaches;

    const getNextIncomeId = (STATE_ID: string | null, dataArray: any[]) => {
      const currentIndex = dataArray.findIndex((item) => item.id == STATE_ID);

      if (currentIndex !== -1 && currentIndex < dataArray.length - 1) {
        for (let i = currentIndex + 1; i < dataArray.length; i++) {
          if (dataArray[i].type === 'income') {
            return dataArray[i].id;
          }
        }
      }
      return null;
    };

    // const getPreviousIncomeId = (STATE_ID: string | null, dataArray: any[]) => {
    // const currentIndex = dataArray.findIndex((item) => item.id == STATE_ID);

    // if (currentIndex > 0) {
    // for (let i = currentIndex - 1; i >= 0; i--) {
    // if (dataArray[i].type === 'income') {
    // return dataArray[i].id;
    // }
    // }
    // }
    // return null;
    // };

    if (lastButtonClicked == 'next') {
      const nextId = getNextIncomeId(STATE_ID, datas);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

      mutate(params, {
        onSuccess: (res: any) => {
          toast(res.data.message);
          setLoader(false);

          if (nextId != null) {
            navigate(`/income-approch?id=${id}&IncomeId=${nextId}`, {
              replace: true,
            });
          } else {
            // Income is at the last index, now check priority order for next navigation
            if (hasRentRollType) {
              navigate(
                `/rent-roll?id=${id}&appraisalId=${filteredRentRollData?.[0]?.id}`
              );
            } else if (hasSaleType) {
              navigate(
                `/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`
              );
            } else if (hasCostType) {
              navigate(
                `/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`
              );
            } else if (hasLeaseType) {
              navigate(
                `/lease-approach?id=${id}&leaseId=${filtereLeasedData?.[0]?.id}`
              );
            } else {
              navigate(`/appraisal-exhibits?id=${id}`);
            }
          }
        },
      });
    } else {
      if (hasIncomeType && filtereIncomeData.length > 1) {
        const incomeIndex = filtereIncomeData.findIndex(
          (element) => element.id == STATE_ID
        );

        // If incomeId is found and it's not the first element
        if (incomeIndex > 0) {
          const incomeIdRedirectIndex = filtereIncomeData[incomeIndex - 1].id;
          navigate(
            `/income-approch?id=${id}&IncomeId=${incomeIdRedirectIndex}`
          );
          return;
        }
      }

      // Income is at the last index, follow priority navigation order
      if (hasRentRollType) {
        navigate(
          `/rent-roll?id=${id}&appraisalId=${filteredRentRollData?.[0]?.id}`
        );
      } else if (hasSaleType) {
        navigate(
          `/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`
        );
      } else if (hasCostType) {
        navigate(`/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`);
      } else if (hasLeaseType) {
        navigate(
          `/lease-approach?id=${id}&leaseId=${filtereLeasedData?.[0]?.id}`
        );
      } else {
        navigate(`/area-info?id=${id}`);
      }
    }
  };

  const [incomeSource, setIncomeSource] = useState([
    {
      type: '',
      monthly_income: 0,
      annual_income: 0,
      rent_sq_ft: 0,
      sf_source: '',
      comments: '',
      isDisabled: true,
      rent_bed: '',
      unit: '',
      id: null,
      extra_id: null,
      link_overview: 0,
    },
  ]);
  // Initialize with default data when no API data is available
  useEffect(() => {
    // Don't proceed if essential data is still loading
    if (isLoading || isFetching || !compType || !data?.data?.data || !data_zonings) {
      return;
    }

    // Check if we already have income approach API data
    const hasIncomeApproachData = clientApproch?.data?.data?.incomeSources?.length > 0 && 
                                 clientApproch?.data?.statusCode !== '404';

    // Only initialize from main API if we don't have income approach data
    if (!hasIncomeApproachData) {
      const newIncomeSource = data_zonings.map(
        (zoning: {
          [x: string]: any;
          sub_zone: any;
          sq_ft: any;
          zone: any;
        }) => ({
          type: getLabelFromValue(zoning.sub_zone, multifamilyOptions),
          monthly_income: 0,
          annual_income: 0,
          rent_sq_ft: 0,
          sf_source: zoning.sq_ft,
          comments: getLabelFromValue(zoning.zone, propertyOptions),
          isDisabled: true,
          rent_bed: zoning.bed ? zoning.bed : 0,
          unit: zoning.unit ? zoning.unit : 0,
          id: zoning.id ? zoning.id : null,
          extra_id: null,
        })
      );
      console.log('Setting from main API - newIncomeSource:', newIncomeSource);
      
      if (compType === 'land_only') {
        const incomeLand: any = [
          {
            type: getLandTypeLabel(landType),
            monthly_income: '',
            annual_income: '',
            rent_sq_ft: '',
            sf_source: landSize,
            comments: 'Land Only',
            isDisabled: true,
            extra_id: null,
          },
        ];
        console.log('Setting incomeSourceLand from main API:', incomeLand);
        setIncomeSourceLand(incomeLand);
      } else {
        console.log('Setting incomeSource from main API:', newIncomeSource);
        setIncomeSource(newIncomeSource);
      }
    }
  }, [
    isLoading,
    isFetching,
    clientApproch?.data?.statusCode,
    clientApproch?.data?.data?.incomeSources,
    data?.data?.data,
    data_zonings,
    compType,
    landType,
    landSize,
    multifamilyOptions,
    propertyOptions,
  ]);

  // Consolidated useEffect for handling income source initialization from API data
  // Consolidated useEffect for handling income source initialization from API data
  useEffect(() => {
    // Don't proceed if data is still loading
    if (isFetching || !compType || !data?.data?.data) {
      return;
    }

    // Only update if we have actual income approach data
    if (
      clientApproch?.data?.data?.incomeSources?.length > 0 &&
      clientApproch?.data?.statusCode !== '404'
    ) {
      const newIncomeSource = client_approch_source.map(
        (zoning: {
          [x: string]: any;
          sub_zone: any;
          sq_ft: any;
          zone: any;
        }) => {
          const ComparisonBasis = data?.data?.data?.comparison_basis;
          let RentSqFt = 0;

          // Safe calculation with proper fallbacks
          if (ComparisonBasis === 'Unit' && zoning.unit > 0) {
            RentSqFt = zoning.annual_income / zoning.unit;
          } else if (ComparisonBasis === 'Bed' && zoning.bed > 0) {
            RentSqFt = zoning.annual_income / zoning.bed;
          } else if (zoning.sf_source > 0) {
            RentSqFt = zoning.annual_income / zoning.sf_source;
          }

          return {
            type: getLabelFromValue(zoning.type, multifamilyOptions),
            monthly_income: zoning.monthly_income || 0,
            annual_income: zoning.annual_income || 0,
            rent_sq_ft: RentSqFt.toFixed(2),
            sf_source: zoning.sf_source || 0,
            comments: zoning.comments || '',
            isDisabled: true,
            rent_bed: zoning.bed ? zoning.bed : 0,
            unit: zoning.unit ? zoning.unit : 0,
            id: zoning.zoning_id ? zoning.zoning_id : null,
            extra_id: zoning.id ? zoning.id : null,
            link_overview: zoning?.link_overview || 0,
          };
        }
      );

      // Update the ref to track this as the latest API data
      incomeSourceLandRef.current = newIncomeSource;

      // Set the income source data immediately without timeout to avoid race conditions
      if (compType === 'land_only') {
        console.log('Setting incomeSourceLand from API data:', newIncomeSource);
        setIncomeSourceLand(newIncomeSource);
      } else {
        console.log('Setting incomeSource from API data:', newIncomeSource);
        setIncomeSource(newIncomeSource);
      }
    }
  }, [
    isFetching,
    clientApproch?.data?.data?.incomeSources,
    clientApproch?.data?.statusCode,
    client_approch_source,
    compType,
    data?.data?.data?.comparison_basis,
    multifamilyOptions,
  ]);

  const updateData = clientApproch?.data?.data;
  const getLandTypeLabel = (landTypeValue: string) => {
    const landTypeOption = landTypeOptions.find(
      (option) => option.value === landTypeValue
    );
    return landTypeOption ? landTypeOption.label : landTypeValue;
  };
  const otherIncomeUpdate = updateData?.otherIncomeSources?.map((ele: any) => {
    return {
      type: ele.type,
      monthly_income: ele.monthly_income,
      annual_income: ele.annual_income,
      square_feet: ele.square_feet,
      comments: ele.comments,
    };
  });
  const [incomeSourceLand, setIncomeSourceLand] = useState([]);
  const incomeSourceLandRef = useRef<any>(null);

  // Fallback initialization when compType is 'land_only' but no other data has been set
  useEffect(() => {
    if (compType === 'land_only' && landType && landSize) {
      // Only set if incomeSourceLand is empty and we don't have API data
      const hasApiData = clientApproch?.data?.data?.incomeSources?.length > 0 && 
                        clientApproch?.data?.statusCode !== '404';
      
      if (!hasApiData && incomeSourceLand.length === 0) {
        const incomeLandFallback: any = [
          {
            type: getLandTypeLabel(landType),
            monthly_income: '',
            annual_income: '',
            rent_sq_ft: '',
            sf_source: landSize,
            comments: 'Land Only',
            isDisabled: true,
            extra_id: null,
          },
        ];
        console.log('Setting incomeSourceLand from compType fallback:', incomeLandFallback);
        setIncomeSourceLand(incomeLandFallback);
      }
    }
  }, [compType, landType, landSize, clientApproch?.data?.statusCode, clientApproch?.data?.data?.incomeSources, incomeSourceLand.length]);

  const operatingExpensesInitial = [
    {
      names: 'Property Taxes',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '',
      extra_id: null,
    },
    {
      names: 'Insurance',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '',
      extra_id: null,
    },
    {
      names: 'Maintenance',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '',
      extra_id: null,
    },
    {
      names: 'Management',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '',
      extra_id: null,
    },
    {
      names: 'Utilities',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '',
      extra_id: null,
    },
  ];

  useEffect(() => {
    if (clientApproch?.data?.data?.operatingExpenses?.length > 0) {
      const operatingExpenses = client_approch_expense.map(
        (operatingExpenses: any) => ({
          names: operatingExpenses.name,
          annual_amount: operatingExpenses.annual_amount,
          percentage_of_gross: operatingExpenses.percentage_of_gross,
          total_per_sq_ft: operatingExpenses.total_per_sq_ft,
          comments: operatingExpenses.comments,
          total_per_unit: operatingExpenses.total_per_unit,
          total_per_bed: operatingExpenses.total_per_bed,
          extra_id: operatingExpenses.id,
        })
      );

      setOpeartionExpenseData(operatingExpenses);
    }
  }, [clientApproch?.data?.data?.operatingExpenses]);

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

  const ID = clientApproch?.data?.data?.id;

  const formInitialValues = {
    incomeSources:
      compType === IncomeApproachEnum.LAND_ONLY
        ? incomeSourceLand
        : incomeSource,
    otherIncomeSources:
      updateData?.otherIncomeSources && updateData.otherIncomeSources.length > 0
        ? otherIncomeUpdate
        : [
          {
            type: '',
            monthly_income: '',
            annual_income: '',
            square_feet: '',
            comments: '',
            link_overview: 0,
            id: null,
          },
        ],
    operatingExpenses:
      clientApproch?.data?.data?.operatingExpenses.length > 0
        ? [...operationExpenseData]
        : [...operatingExpensesInitial],
    total_monthly_income: updateData?.total_monthly_income || null,
    total_annual_income: updateData?.total_annual_income || null,
    total_rent_sq_ft: updateData?.total_rent_sq_ft,
    total_sq_ft: updateData?.total_sq_ft || '',
    vacancy: updateData?.vacancy || '',
    vacant_amount: updateData?.vacant_amount || null,
    adjusted_gross_amount: updateData?.adjusted_gross_amount || null,
    total_oe_annual_amount: updateData?.total_oe_annual_amount || '',
    total_oe_gross: updateData?.total_oe_gross || '',
    total_oe_per_square_feet: updateData?.total_oe_per_square_feet || '',
    expense_notes:
      updateData?.expense_notes ||
      'Expense are derived from actual costs and estimates incurred on the property and assumptions made by the author all values are deemed reliable but not guaranteed.',
    total_net_income: updateData?.total_net_income || '',
    monthly_capitalization_rate: updateData?.monthly_capitalization_rate || '0',
    annual_capitalization_rate: updateData?.annual_capitalization_rate || '0',
    net_income: '',
    sq_ft_capitalization_rate: updateData?.sq_ft_capitalization_rate || '0',
    high_capitalization_rate: updateData?.high_capitalization_rate || '0',
    indicated_range_monthly: updateData?.indicated_range_monthly || null,
    indicated_range_annual: updateData?.indicated_range_annual || null,
    indicated_range_sq_feet: updateData?.indicated_range_sq_feet || null,
    indicated_psf_monthly: updateData?.indicated_psf_monthly || '',
    indicated_psf_annual: updateData?.indicated_psf_annual || '',
    indicated_psf_sq_feet: updateData?.indicated_psf_sq_feet || '',
    cap_rate_notes: updateData?.cap_rate_notes || '',
    income_notes:
      updateData?.income_notes ||
      'Income is based on a blend of actual rates received on the property, adjusted for the type of property and quoted on a modified gross basis.',
    comparison_basis: data?.data?.data?.comparison_basis,
    total_unit: totalUnits || null,
    total_bed: updateData?.total_bed || null,
    total_oe_per_unit: updateData?.total_oe_per_unit || '',
    total_oe_per_bed: updateData?.total_oe_per_bed || '',
    indicated_psf_unit: updateData?.indicated_psf_unit || '',
    boolean: false,
  };
  console.log('site', STATE_ID);
  return (
    <>
      <Formik
        enableReinitialize
        initialValues={formInitialValues}
        onSubmit={handleSubmit}
      >
        {() => {
          return (
            <>
              <>
                <Form className="w-full">
                  {Array.from([
                    <Income
                      ID={ID}
                      isFetching={isFetching}
                      compType={compType}
                      analysis_type={analysis_type}
                      monthlyIncome={monthlyIncome}
                      setMonthlyIncome={setMonthlyIncome}
                      annualIncome={annualIncome}
                      setAnnualIncome={setAnnualIncome}
                      setEffectiveIncome={setEffectiveIncome}
                      totalAnnualIncomess={totalAnnualIncomess}
                      setTotalAnnualIncomess={setTotalAnnualIncomess}
                    />,
                    <hr style={{ marginTop: '20px' }} />,
                    <OtherIncome analysis_type={analysis_type} />,

                    <Expense
                      analysis_type={analysis_type}
                      isFetching={isFetching}
                      effectiveIncome={effectiveIncome}
                      totalAnnualIncomess={totalAnnualIncomess}
                      totalExpenses={totalExpenses}
                      setTotalExpenses={setTotalExpenses}
                    />,
                    <NetIncome
                      arrayData={data?.data?.data?.appraisal_approaches}
                      analysis_type={analysis_type}
                      indicatedSfCapRate={indicatedSfCapRate}
                      setIndicatedSfCapRate={setIndicatedSfCapRate}
                      indicatedSfMarketRate={indicatedSfMarketRate}
                      setIndicatedSfMarketRate={setIndicatedSfMarketRate}
                      indicatedSfHighRate={indicatedSfHighRate}
                      setIndicatedSfHighRate={setIndicatedSfHighRate}
                      indicatedCapRate={indicatedCapRate}
                      setIndicatedCapRate={setIndicatedCapRate}
                      indicatedMarketRate={indicatedMarketRate}
                      setIndicatedMarketRate={setIndicatedMarketRate}
                      indicatedHighRate={indicatedHighRate}
                      setIndicateHighRate={setIndicateHighRate}
                      totalAnnualIncomess={totalAnnualIncomess}
                      totalExpenses={totalExpenses}
                      setUnitMarketRate={setUnitMarketRate} // Pass the missing prop
                    />,
                    <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
                        onClick={() => {
                          console.log('Button Clicked!');
                          console.log(
                            'Filtered Income Data:',
                            filtereIncomeData
                          );

                          if (filtereIncomeData?.length > 0) {
                            const incomeIndex = filtereIncomeData.findIndex(
                              (element: any) => element.id == STATE_ID
                            );

                            console.log('Income Index:', incomeIndex);

                            if (incomeIndex > 0) {
                              const previousIncomeId =
                                filtereIncomeData[incomeIndex - 1].id;
                              console.log(
                                'Navigating to previous Income Approach:',
                                previousIncomeId
                              );
                              navigate(
                                `/income-approch?id=${id}&IncomeId=${previousIncomeId}`
                              );
                              return;
                            }
                          }

                          console.log('Navigating to Area Info Page');
                          navigate(`/area-info?id=${id}`);
                        }}
                      >
                        <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
                      </Button>

                      <CommonButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleNextClick}
                        style={{ width: '300px', fontSize: '14px' }}
                      >
                        {AppraisalEnum.SAVE_AND_CONTINUE}
                        <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
                      </CommonButton>
                      {showScrollTop && (
                        <Button
                          id="backToTop"
                          color='primary'
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          style={{ fontSize: '24px', cursor: 'pointer', border: 'none', padding: '0px' }}
                        >
                          ↑
                        </Button>
                      )}
                    </div>,
                  ])}
                </Form>
              </>
            </>
          );
        }}
      </Formik>
    </>
  );
};

export default IncomeApprochSidebar;

import { ResponseType } from '@/components/interface/response-type';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { IncomeApproachEnum } from '@/pages/appraisal/Enum/AppraisalEnum';
import { Form, Formik, FormikProps } from 'formik';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IncomeExpense } from './evaluation-income-expense';
import { EvaluationNetIncome } from './evaluation-net-income';
import { EvaluationIncome } from './index';

import {
  hospitalityOptions,
  industrialOptions,
  landTypeOptions,
  multifamilyOptions,
  officeOptions,
  propertyOptions,
  residentialOptions,
  retailOptions,
  specialOptions,
} from '@/pages/comps/create-comp/SelectOption';
import loadingImage from '../../../images/loading.png';

type EvaluationIncomeApprochFormRef = {
  onNextClick: () => void;
  onBackClick: () => void;
  getIndicatedCapRate: () => number;
};

type EvaluationIncomeApprochFormProps = {
  matchName: (value: string) => void;
  onIndicatedCapRateChange: (value: number) => void;
  onIndicatedPsfAnnualRateChange: (value: number) => void;
  evalWeights?: number;
  totalWeightedValue: any;
};

const EvaluationIncomeApprochForm = forwardRef<
  EvaluationIncomeApprochFormRef,
  EvaluationIncomeApprochFormProps
>((props: any, ref: any) => {
  const { matchName, totalWeightedValue } = props;
  const [lastButtonClicked, setLastButtonClicked] = useState('');

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const STATE_ID = searchParams.get('IncomeId');

  const Income_Id = localStorage.getItem('incomeId');

  const navigate = useNavigate();
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'save-income-approach',
    endPoint: 'evaluations/save-income-approach',
    requestType: RequestType.POST,
  });

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
  }, [id, mutateAsync, STATE_ID]);

  const [compType, setCompType] = useState('');
  const [landType, setLandType] = useState('');
  const [landSize, setLandSize] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<any>();
  const [annualIncome, setAnnualIncome] = useState<any>();
  const [indicatedSfCapRate, setIndicatedSfCapRate] = useState(0);
  const [unitMarketRate, setUnitMarketRate] = useState<number>(0); // State to store the calculated value

  const [indicatedSfMarketRate, setIndicatedSfMarketRate] = useState(0);
  const [indicatedSfHighRate, setIndicatedSfHighRate] = useState(0);
  const [effectiveIncome, setEffectiveIncome] = useState<any>();
  const [operationExpenseData, setOpeartionExpenseData] = useState([]);
  const [totalAnnualIncomess, setTotalAnnualIncomess] = useState(0);
  const [indicatedCapRate, setIndicatedCapRate] = useState(0);
  const [indicatedMarketRate, setIndicatedMarketRate] = useState(0);
  const [indicatedHighRate, setIndicateHighRate] = useState(0);
  const [loader, setLoader] = useState(false);
  const [navigationLoader, setNavigationLoader] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState<any>();

  const { data, refetch, isLoading } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: { enabled: Boolean(id && STATE_ID), refetchOnWindowFocus: false },
  });
  const totalUnits = data?.data?.data?.total_units;
  const data_zonings = data?.data?.data?.zonings;
  const analysis_type = data?.data?.data?.analysis_type;
  useEffect(() => {
    props.onIndicatedCapRateChange(indicatedMarketRate);
    props.onIndicatedPsfAnnualRateChange(indicatedSfMarketRate);
  }, [indicatedMarketRate, indicatedSfMarketRate, indicatedCapRate]);
  useEffect(() => {
    const fetchData = async () => {
      if (STATE_ID) {
        const scenarios = data?.data?.data?.scenarios || [];

        const validScenarios = scenarios.filter(
          (item: any) =>
            item?.evaluation_income_approach ||
            item?.evaluation_sales_approach ||
            item?.evaluation_cost_approach
        );

        const matchedItem = scenarios.find(
          (item: { id: any }) => item.id == STATE_ID
        );

        // ✅ Only call matchName if more than one valid scenario exists
        if (matchedItem && validScenarios.length > 1) {
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

  const formikRef = useRef<FormikProps<any>>(null);

  //   let appraisalIncomeApproachIds = 0;
  if (
    data?.data?.data?.scenarios[0].has_income_approach === null &&
    data?.data?.data?.evaluation_approaches[0].type === 'income'
  ) {
    // appraisalIncomeApproachIds = 0;
  } else {
    const mapData = data?.data?.data?.evaluation_approaches;

    mapData &&
      mapData.map((item: any) => {
        if (item.id == STATE_ID) {
          //   appraisalIncomeApproachIds = item?.evaluation_income_approach?.id;
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
    if (data?.data?.data?.evaluation_approaches && !data.isStale) {
      const updateData = data.data.data.evaluation_approaches;
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
  }, [data?.data?.data?.evaluation_approaches]);

  const {
    data: clientApproch,
    isFetching,
  } = useGet<any>({
    queryKey: `income-approach-${id}-${STATE_ID}`,
    endPoint: `evaluations/income-approach?evaluationId=${id}&evaluationScenarioId=${STATE_ID}`,
    config: {
      enabled: Boolean(id && STATE_ID),
      cacheTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    if (id && STATE_ID) {
      setNavigationLoader(true);
      setTimeout(() => {
        refetch();
      }, 500);
    }
  }, [STATE_ID]);

  useEffect(() => {
    if (!isFetching && clientApproch?.data?.data) {
      setTimeout(() => {
        setNavigationLoader(false);
      }, 600);
    }
  }, [isFetching, clientApproch?.data?.data]);
  useEffect(() => {
    if (clientApproch?.data?.data?.eval_weight) {
      const evalWeight: any = clientApproch?.data?.data?.eval_weight * 100;
      localStorage.setItem('evalWeightIncome', evalWeight);
    }
  }, [clientApproch?.data?.data?.eval_weight]);
  const client_approch_source = clientApproch?.data?.data?.incomeSources;
  const evalWeight = clientApproch?.data?.data?.eval_weight * 100;
  const client_approch_expense = clientApproch?.data?.data?.operatingExpenses;
  const incomeId = clientApproch?.data?.data?.id;

  console.log(
    'clientApproch?.data?.data?.eval_weight',
    clientApproch?.data?.data?.eval_weight
  );
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
  console.log('incrementttttttt', (indicatedMarketRate * evalWeight) / 100);
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
    const adjustedGrossAmount =
      (totalAnnualIncomess || 0) +
      (values.other_total_annual_income || 0) -
      (Number(values.vacant_amount) || 0);
    const total = adjustedGrossAmount - totalExpenses;
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
        comments: ele.comments,
        percentage_of_gross: Number(ele.percentage_of_gross),
        total_per_unit: ele.total_per_unit
          ? parseFloat(ele.total_per_unit.toString().replace(/,/g, ''))
          : 0,
        id: ele.extra_id ? ele.extra_id : null,
      };
    });
    const toTitleCase = (str: string) => {
      const allOptions = [
        ...retailOptions,
        ...officeOptions,
        ...industrialOptions,
        ...multifamilyOptions,
        ...hospitalityOptions,
        ...specialOptions,
        ...residentialOptions,
        ...landTypeOptions,
      ];
      const option = allOptions.find((option) => option.label === str);
      if (option) {
        return option?.value;
      }
      return str;
    };

    const income_source = values.incomeSources?.map((ele: any) => {
      return {
        space: toTitleCase(ele.space),
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
    });
    const other_income_source = values.otherIncomeSources
      ?.map((ele: any) => {
        console.log('Other income element:', ele);
        return {
          type: ele.type,
          monthly_income: Number(ele.monthly_income),
          annual_income: Number(ele.annual_income),
          square_feet: ele.square_feet
            ? parseFloat(ele.square_feet.toString().replace(/,/g, ''))
            : 0,
          comments: ele.comments,
          id: ele.extra_id ? ele.extra_id : null,
        };
      })
      .filter((item: any) => 
        item.type || 
        item.monthly_income || 
        item.annual_income || 
        item.square_feet || 
        item.comments
      ) || [];
    console.log('Final other_income_source:', other_income_source);
    return {
      id: incomeId ? incomeId : null,
      weighted_market_value: totalWeightedValue,
      evaluation_scenario_id: STATE_ID ? STATE_ID : Income_Id,
      operatingExpenses: operatingExpenses,
      cap_rate_notes: values.cap_rate_notes.toString(),
      vacancy: values.vacancy ? values.vacancy : null,
      total_sq_ft: values.total_sq_ft ? values.total_sq_ft : 0,
      other_total_sq_ft: values.other_total_sq_ft
        ? values.other_total_sq_ft
        : 0,
      total_rent_sq_ft: values.total_rent_sq_ft ? values.total_rent_sq_ft : 0,
      total_oe_per_square_feet: values.total_oe_per_square_feet || null,
      total_oe_gross:
        values?.operatingExpenses?.reduce((sum: any, item: any) => {
          return sum + parseFloat(item.percentage_of_gross || '0');
        }, 0) || null,
      total_oe_annual_amount: values.total_oe_annual_amount || null,
      total_net_income: Number(total.toFixed(2)),
      total_monthly_income: values.total_monthly_income,
      other_total_monthly_income: values.other_total_monthly_income,
      total_annual_income: values.total_annual_income,
      other_total_annual_income: values.other_total_annual_income,
      sq_ft_capitalization_rate: Number(values.sq_ft_capitalization_rate),
      high_capitalization_rate: Number(values.high_capitalization_rate),
      net_income: values.net_income,
      monthly_capitalization_rate: Number(values.monthly_capitalization_rate),
      indicated_range_sq_feet: indicatedHighRate ? indicatedHighRate : 0,
      indicated_range_monthly: indicatedCapRate ? indicatedCapRate : 0,
      indicated_range_annual: indicatedMarketRate ? indicatedMarketRate : 0,
      incremental_value: indicatedMarketRate
        ? (indicatedMarketRate *
            (evalWeight !== undefined && evalWeight !== 0
              ? evalWeight
              : clientApproch?.data?.data?.eval_weight * 100 || 0)) /
          100
        : 0,

      indicated_psf_sq_feet: indicatedSfHighRate ? indicatedSfHighRate : 0,
      indicated_psf_monthly: indicatedSfCapRate ? indicatedSfCapRate : 0,
      indicated_psf_annual:
        values.comparison_basis === 'Unit'
          ? indicatedMarketRate / values.total_unit
          : values.comparison_basis === 'Bed'
            ? indicatedMarketRate / values.total_bed
            : values.comparison_basis === 'SF'
              ? indicatedSfMarketRate
              : 0,
      expense_notes: values.expense_notes,
      annual_capitalization_rate: Number(values.annual_capitalization_rate),
      vacant_amount: values.vacant_amount,
      adjusted_gross_amount:
        (totalAnnualIncomess || 0) +
        (values.other_total_annual_income || 0) -
        (Number(values.vacant_amount) || 0),
      income_notes: values.income_notes,
      evaluation_id: id,
      total_unit: values.total_unit,
      total_bed: values.total_bed,
      total_oe_per_unit: values.total_oe_per_unit,
      total_oe_per_bed: values.total_oe_per_bed,
      indicated_psf_unit: values.indicated_psf_unit
        ? values.indicated_psf_unit
        : 0,
      incomeSources: income_source,
      otherIncomeSources: other_income_source ? other_income_source : [],
      // id:25
    };
  };
  const handleSubmit = (values: any) => {
    setLoader(true);
    const params = mapValuesToParams(values);

    if (lastButtonClicked === 'next') {
      mutate(params, {
        onSuccess: (res: any) => {
          toast(res.data.message);
          setLoader(false);

          const scenarios = data?.data?.data?.scenarios || [];
          console.log('All scenarios:', scenarios);
          console.log('Current STATE_ID:', STATE_ID);

          const currentScenario = scenarios.find(
            (s: any) => s.id === Number(STATE_ID)
          );
          console.log('Current scenario:', currentScenario);

          // === 1. Check CURRENT scenario for cap approach first ===
          if (currentScenario?.has_cap_approach === 1) {
            navigate(
              `/evaluation/cap-approach?id=${id}&capId=${currentScenario.id}`
            );
            return;
          }

          // === 2. Check CURRENT scenario for multi-family approach ===
          if (currentScenario?.has_multi_family_approach === 1) {
            navigate(
              `/evaluation/rent-roll?id=${id}&evaluationId=${currentScenario.id}`
            );
            return;
          }

          // === 3. Check NEXT income scenarios ===
          const nextScenarios = scenarios.filter(
            (s: any) => s.id > Number(STATE_ID)
          );
          console.log('Next scenarios:', nextScenarios);

          const nextIncome = nextScenarios.find(
            (s: any) => s.has_income_approach === 1
          );
          console.log('Next income scenario:', nextIncome);

          if (nextIncome) {
            console.log('Navigating to next income scenario:', nextIncome.id);
            navigate(
              `/evaluation/income-approch?id=${id}&IncomeId=${nextIncome.id}`
            );
            return;
          }
          if (currentScenario?.has_sales_approach === 1) {
            navigate(
              `/evaluation/sales-approach?id=${id}&salesId=${currentScenario.id}`
            );
            return;
          }
          if (currentScenario?.has_lease_approach === 1) {
            navigate(
              `/evaluation/lease-approach?id=${id}&leaseId=${currentScenario.id}`
            );
            return;
          }
          if (currentScenario?.has_cost_approach === 1) {
            navigate(
              `/evaluation/cost-approach?id=${id}&costId=${currentScenario.id}`
            );
            return;
          }

          // === 3. Check other NEXT scenarios ===

          const nextCap = nextScenarios.find(
            (s: any) =>
              s.has_cap_approach === 1 && s.evaluation_cap_approach?.id
          );
          if (nextCap) {
            navigate(`/evaluation/cap-approach?id=${id}&capId=${nextCap.id}`);
            return;
          }

          const nextMulti = nextScenarios.find(
            (s: any) =>
              s.has_multi_family_approach === 1 &&
              s.evaluation_multi_family_approach?.id
          );
          if (nextMulti) {
            navigate(
              `/evaluation/rent-roll?id=${id}&evaluationId=${nextMulti.id}`
            );
            return;
          }

          // === 4. Check PREVIOUS scenarios for sales, lease, cost ===
          const previousScenarios = scenarios.filter(
            (s: any) => s.id < Number(STATE_ID)
          );

          const prevSales = previousScenarios.find(
            (s: any) =>
              s.has_sales_approach === 1 && s.evaluation_sales_approach?.id
          );
          if (prevSales) {
            navigate(
              `/evaluation/sales-approach?id=${id}&salesId=${prevSales.id}`
            );
            return;
          }

          const prevLease = previousScenarios.find(
            (s: any) =>
              s.has_lease_approach === 1 && s.evaluation_lease_approach?.id
          );
          if (prevLease) {
            navigate(
              `/evaluation/lease-approach?id=${id}&leaseId=${prevLease.id}`
            );
            return;
          }

          const prevCost = previousScenarios.find(
            (s: any) =>
              s.has_cost_approach === 1 && s.evaluation_cost_approach?.id
          );
          if (prevCost) {
            navigate(
              `/evaluation/cost-approach?id=${id}&costId=${prevCost.id}`
            );
            return;
          }

          // === 4. Fallback ===
          navigate(`/evaluation-exhibits?id=${id}`);
        },
      });
    } else {
      // === Handle "Previous" button logic ===
      if (hasIncomeType && filtereIncomeData.length > 1) {
        const incomeIndex = filtereIncomeData.findIndex(
          (el) => el.id == STATE_ID
        );
        if (incomeIndex > 0) {
          const incomeIdRedirectIndex = filtereIncomeData[incomeIndex - 1].id;
          navigate(
            `/evaluation/income-approch?id=${id}&IncomeId=${incomeIdRedirectIndex}`
          );
          return;
        }
      }

      if (hasRentRollType) {
        navigate(
          `/evaluation/rent-roll?id=${id}&evaluationId=${filteredRentRollData?.[0]?.id}`
        );
      } else if (hasSaleType) {
        navigate(
          `/evaluation/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`
        );
      } else if (hasCostType) {
        navigate(
          `/evaluation/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`
        );
      } else if (hasLeaseType) {
        navigate(
          `/evaluation/lease-approach?id=${id}&leaseId=${filtereLeasedData?.[0]?.id}`
        );
      } else {
        navigate(`/area-info?id=${id}`);
      }
    }
  };

  // const check = () => {
  //   console.log('ahjdashjgasdjh');
  // };
  const handleNextClick = () => {
    console.log('handleNextClick triggered');
    setLastButtonClicked('next');
    formikRef.current?.handleSubmit(); // ✅ This submits the form
  };
  const handleNextPrevious = () => {
    const scenarios = data?.data?.data?.scenarios || [];
    const currentScenarioIndex = scenarios.findIndex(
      (scenario: any) => scenario.id == STATE_ID
    );

    for (let i = currentScenarioIndex - 1; i >= 0; i--) {
      const scenario = scenarios[i];

      if (scenario.has_multi_family_approach === 1) {
        navigate(
          `/evaluation/multi-family-comps-map?id=${id}&evaluationId=${scenario.id}`
        );
        return;
      }

      if (scenario.has_cap_approach === 1) {
        navigate(`/evaluation/cap-comps-map?id=${id}&capId=${scenario.id}`);
        return;
      }

      if (
        scenario.has_income_approach === 1 &&
        scenario.evaluation_income_approach?.id
      ) {
        navigate(`/evaluation/income-approch?id=${id}&IncomeId=${scenario.id}`);
        return;
      }
    }

    // If no match found, go to area info
    navigate(`/evaluation-area-info?id=${id}`);
  };

  useImperativeHandle(ref, () => ({
    onNextClick: () => {
      handleNextClick(); // ✅ Now works
    },
    onBackClick: () => {
      handleNextPrevious(); // ✅ Now works
    },
    getIndicatedCapRate: () => indicatedMarketRate, // this exposes the value
  }));
  // useImperativeHandle(ref, () => ({
  //   onNextClick: handleNextClick,
  // }));
  const [incomeSource, setIncomeSource] = useState([]);
  useEffect(() => {
    if (
      clientApproch?.data?.statusCode == '404' ||
      clientApproch?.data?.statusCode === undefined
    ) {
      if (data_zonings) {
        const newIncomeSource = data_zonings.map(
          (zoning: {
            [x: string]: any;
            sub_zone: any;
            sq_ft: any;
            zone: any;
          }) => ({
            space: getLabelFromValue(zoning.sub_zone, multifamilyOptions),
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

        if (compType === 'land_only') {
          const incomeLand: any = [
            {
              space: getLandTypeLabel(landType),
              monthly_income: '',
              annual_income: '',
              rent_sq_ft: '',
              sf_source: landSize,
              comments: 'Land Only',
              isDisabled: true,
              extra_id: null,
            },
          ];
          setIncomeSourceLand(incomeLand);
        } else {
          setIncomeSource(newIncomeSource);
        }
      }
    }
  }, [
    clientApproch?.data?.statusCode,
    data_zonings,
    multifamilyOptions,
    propertyOptions,
    id,
    STATE_ID,
  ]);

  useEffect(() => {
    // Clear previous data when ID changes
    setIncomeSource([]);

    setIncomeSourceLand([]);

    // Clear localStorage when ID changes
    localStorage.removeItem('incomeSource');
    localStorage.removeItem('incomeSourceLand');

    if (
      clientApproch?.data?.data?.incomeSources?.length > 0 &&
      clientApproch?.data?.statusCode != '404'
    ) {
      const newIncomeSource = client_approch_source.map(
        (zoning: {
          [x: string]: any;
          sub_zone: any;
          sq_ft: any;
          zone: any;
        }) => {
          const ComparisonBasis = data?.data?.data?.comparison_basis;
          let RentSqFt;

          if (ComparisonBasis === 'Unit') {
            RentSqFt = zoning.annual_income / zoning.unit;
          } else if (ComparisonBasis === 'Bed') {
            RentSqFt = zoning.annual_income / zoning.bed;
          } else {
            RentSqFt = zoning.annual_income / zoning.sf_source;
          }

          return {
            space: getLabelFromValue(
              zoning.space,
              landType ? landTypeOptions : multifamilyOptions
            ),
            monthly_income: zoning.monthly_income,
            annual_income: zoning.annual_income,
            rent_sq_ft: RentSqFt.toFixed(2),
            sf_source: zoning.sf_source,
            comments: zoning.comments,
            isDisabled: true,
            rent_bed: zoning.bed ? zoning.bed : 0,
            unit: zoning.unit ? zoning.unit : 0,
            id: zoning.zoning_id ? zoning.zoning_id : null,
            extra_id: zoning.id ? zoning.id : null,
            zone: zoning.zoning_id ? 'zoning-based' : 'other-income',
            link_overview: zoning?.link_overview,
          };
        }
      );

      const compTypeFromStorage = localStorage.getItem('activeType');

      if (compTypeFromStorage === 'land_only' || compType === 'land_only') {
        setIncomeSourceLand(newIncomeSource);
        localStorage.setItem(
          'incomeSourceLand',
          JSON.stringify(newIncomeSource)
        );
      } else {
        setIncomeSource(newIncomeSource);
        localStorage.setItem('incomeSource', JSON.stringify(newIncomeSource));
      }
    }
  }, [
    clientApproch?.data?.data?.incomeSources,
    clientApproch?.data?.statusCode,
    id,
    STATE_ID,
  ]);

  // Add this effect to load data from localStorage on component mount
  useEffect(() => {
    const compTypeFromStorage = localStorage.getItem('compType');
    const savedIncomeSourceLand = localStorage.getItem('incomeSourceLand');
    const savedIncomeSource = localStorage.getItem('incomeSource');

    if (compTypeFromStorage === 'land_only' && savedIncomeSourceLand) {
      try {
        setIncomeSourceLand(JSON.parse(savedIncomeSourceLand));
      } catch (e) {
        console.error('Error parsing incomeSourceLand from localStorage', e);
      }
    } else if (savedIncomeSource) {
      try {
        setIncomeSource(JSON.parse(savedIncomeSource));
      } catch (e) {
        console.error('Error parsing incomeSource from localStorage', e);
      }
    }
  }, []);

  const updateData = clientApproch?.data?.data;
  const getLandTypeLabel = (landTypeValue: string) => {
    const landTypeOption = landTypeOptions.find(
      (option) => option.value === landTypeValue
    );
    return landTypeOption ? landTypeOption.label : landTypeValue;
  };
  const otherIncomeUpdate = updateData?.otherIncomeSources?.map((ele: any) => {
    console.log('API other income data:', ele);
    return {
      type: ele.type,
      monthly_income: ele.monthly_income,
      annual_income: ele.annual_income,
      square_feet: ele.square_feet,
      comments: ele.comments,
      extra_id: ele.id || null,
    };
  });
  const [incomeSourceLand, setIncomeSourceLand] = useState([]);
  const incomeLand: any = [
    {
      space: getLandTypeLabel(landType),
      monthly_income: '',
      annual_income: '',
      rent_sq_ft: '',
      sf_source: landSize,
      comments: 'Land Only',
      isDisabled: true,
      extra_id: null,
    },
  ];
  useEffect(() => {
    if (compType === 'land_only' && incomeSourceLand.length === 0) {
      setIncomeSourceLand(incomeLand);
    }
  }, [compType, incomeSourceLand.length]);

  const operatingExpensesInitial = [
    {
      names: 'Property Taxes',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '0.00',
      total_per_bed: '0.00',
      extra_id: null,
    },
    {
      names: 'Insurance',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '0.00',
      total_per_bed: '0.00',
      extra_id: null,
    },
    {
      names: 'Maintenance',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '0.00',
      total_per_bed: '0.00',
      extra_id: null,
    },
    {
      names: 'Management',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '0.00',
      total_per_bed: '0.00',
      extra_id: null,
    },
    {
      names: 'Utilities',
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '0.00',
      total_per_bed: '0.00',
      extra_id: null,
    },
  ];

  useEffect(() => {
    if (clientApproch?.data?.data?.operatingExpenses?.length > 0) {
      const operatingExpenses = client_approch_expense.map(
        (operatingExpenses: any) => {
          console.log('API operating expense data:', operatingExpenses);
          return {
            names: operatingExpenses.name,
            annual_amount: operatingExpenses.annual_amount,
            percentage_of_gross: operatingExpenses.percentage_of_gross,
            total_per_sq_ft: operatingExpenses.total_per_sq_ft,
            comments: operatingExpenses.comments,
            total_per_unit: operatingExpenses.total_per_unit,
            total_per_bed: operatingExpenses.total_per_bed,
            extra_id: operatingExpenses.id,
          };
        }
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

  if (isLoading || loading || loader || navigationLoader || isFetching) {
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
      clientApproch?.data?.statusCode === '404' || !updateData
        ? [
            {
              type: '',
              monthly_income: '',
              annual_income: '',
              square_feet: '',
              comments: '',
              link_overview: 0,
              extra_id: null,
            },
          ]
        : otherIncomeUpdate || [],
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
        innerRef={formikRef}
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
                    <EvaluationIncome
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
                      navigationLoader={navigationLoader}
                      zonings={data_zonings}
                    />,
                    <hr style={{ marginTop: '20px' }} />,

                    <IncomeExpense
                      analysis_type={analysis_type}
                      isFetching={isFetching}
                      effectiveIncome={effectiveIncome}
                      totalAnnualIncomess={totalAnnualIncomess}
                      totalExpenses={totalExpenses}
                      setTotalExpenses={setTotalExpenses}
                    />,
                    <EvaluationNetIncome
                      arrayData={data?.data?.data?.appraisal_approaches}
                      analysis_type={analysis_type}
                      indicatedSfCapRate={indicatedSfCapRate}
                      setIndicatedSfCapRate={setIndicatedSfCapRate}
                      setUnitMarketRate={setUnitMarketRate}
                      unitMarketRate={unitMarketRate}
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
                      totalExpenses={totalExpenses}
                      totalAnnualIncomess={totalAnnualIncomess}
                    />,
                  ])}
                </Form>
              </>
            </>
          );
        }}
      </Formik>
    </>
  );
});

export default EvaluationIncomeApprochForm;

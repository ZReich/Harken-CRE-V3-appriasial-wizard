import { ResponseType } from '@/components/interface/response-type';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
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
import { ResidentialEvaluationIncome } from '.';
import { ResidentialIncomeExpense } from './residential-evaluation-income-expense';
import { ResidentialEvaluationNetIncome } from './residential-evaluation-net-income';
import { ResidentialEvaluationOtherIncome } from './residential-evaluation-other-income';

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
import loadingImage from '../../../../images/loading.png';
import { ResidentialIncomeApproachEnum } from './residential-incom-approach-enum';

type EvaluationIncomeApprochFormRef = {
  onNextClick: () => void;
  onBackClick: () => void;
  getIndicatedCapRate: () => number;
};

type EvaluationIncomeApprochFormProps = {
  matchName: (value: string) => void;
  onIndicatedCapRateChange: (value: number) => void;
  onIndicatedPsfAnnualRateChange: (value: number) => void;
  evalWeights: any;
  totalWeightedValue: any;
};

const ResidentialEvaluationIncomeApprochForm = forwardRef<
  EvaluationIncomeApprochFormRef,
  EvaluationIncomeApprochFormProps
>((props, ref) => {
  const { matchName, totalWeightedValue } = props;
  const [lastButtonClicked, setLastButtonClicked] = useState('');
  const [, setUpdateId] = useState(null);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const STATE_ID = searchParams.get('IncomeId');

  const Income_Id = localStorage.getItem('incomeId');

  const navigate = useNavigate();
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'save-income-approach',
    endPoint: 'res-evaluations/save-income-approach',
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
  const [indicatedSfMarketRate, setIndicatedSfMarketRate] = useState(0);
  const [indicatedSfHighRate, setIndicatedSfHighRate] = useState(0);
  const [effectiveIncome, setEffectiveIncome] = useState<any>();
  const [operationExpenseData, setOpeartionExpenseData] = useState([]);
  const [totalAnnualIncomess, setTotalAnnualIncomess] = useState(0);
  const [indicatedCapRate, setIndicatedCapRate] = useState(0);
  const [indicatedMarketRate, setIndicatedMarketRate] = useState(0);
  const [indicatedHighRate, setIndicateHighRate] = useState(0);
  const [loader, setLoader] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState<any>();
  const { data, refetch, isLoading } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: { enabled: Boolean(id && STATE_ID), refetchOnWindowFocus: false },
  });
  const totalUnits = data?.data?.data?.total_units;
  const data_zonings = data?.data?.data?.res_zonings;
  const data_scenario = data?.data?.data?.res_evaluation_scenarios;
  useEffect(() => {
    if (data_scenario && data_scenario[0]?.res_evaluation_income_approach?.id) {
      setUpdateId(data_scenario[0]?.res_evaluation_income_approach?.id);
    }
  }, [data_scenario && data_scenario[0]?.res_evaluation_income_approach?.id]);
  const analysis_type = data?.data?.data?.analysis_type;
  useEffect(() => {
    props.onIndicatedCapRateChange(indicatedMarketRate);
    props.onIndicatedPsfAnnualRateChange(indicatedSfMarketRate);
  }, [indicatedMarketRate, indicatedSfMarketRate]);
  useEffect(() => {
    const fetchData = async () => {
      if (STATE_ID) {
        const scenarios = data?.data?.data?.res_evaluation_scenarios || [];

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
    data?.data?.data?.res_evaluation_scenarios[0]?.has_income_approach ===
    null &&
    data?.data?.data?.res_evaluation_scenarios[0]?.type === 'income'
  ) {
  } else {
    const mapData = data?.data?.data?.res_evaluation_scenarios;

    mapData &&
      mapData.map((item: any) => {
        if (item.id == STATE_ID) {
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
    if (data?.data?.data?.res_evaluation_scenarios && !data.isStale) {
      const updateData = data.data.data.res_evaluation_scenarios;
      const incomeApproaches = updateData.filter(
        (item: { has_income_approach: any }) => item.has_income_approach === 1
      );
      setHasIncomeType(incomeApproaches.length > 0);
      setFilteredIncomeData(incomeApproaches);

      const salesApproaches = updateData.filter(
        (item: { has_sales_approach: any }) => item.has_sales_approach === 1
      );
      setHasSaleType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const RentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'rent_roll'
      );
      setHasRentRollType(RentRollApproaches.length > 0);
      setFilteredRentRoledData(RentRollApproaches);

      const costApproaches = updateData.filter(
        (item: { has_cost_approach: any }) => item.has_cost_approach === 1
      );

      setHasCostType(costApproaches.length > 0);
      setFilteredCostsData(costApproaches);
      const leaseApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'lease'
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeasedData(leaseApproaches);
    }
  }, [data?.data?.data?.res_evaluation_scenarios]);

  useEffect(() => {
    if (id && STATE_ID) {
      setTimeout(() => {
        refetch();
        refetchClientApproach();
      }, 500);
    }
  }, [STATE_ID]);

  const {
    data: clientApproch,
    isFetching,
    refetch: refetchClientApproach,
  } = useGet<any>({
    queryKey: '1df',
    endPoint: `res-evaluations/income-approach?evaluationId=${id}&evaluationScenarioId=${STATE_ID}`,
    config: { enabled: Boolean(id && STATE_ID) },
  });
  const client_approch_source = clientApproch?.data?.data?.incomeSources;
  const client_approch_expense = clientApproch?.data?.data?.operatingExpenses;
  const incomeId = clientApproch?.data?.data?.id;
  const capitalizeWords = (str: string) => {
    const exceptions = ['and', 'of', 'the', 'w/o', 'with'];

    return str
      ?.split(/\s+/)
      .map((word: string, index: number) => {
        if (word.includes('(') && word.includes(')')) {
          const parts = word.split('(');
          const mainWord = parts[0].trim();
          const insideParentheses = parts[1].replace(')', '').toUpperCase();
          return `${mainWord.charAt(0).toUpperCase() + mainWord.slice(1)}(${insideParentheses})`;
        }

        if (exceptions.includes(word.toLowerCase()) && index !== 0) {
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

    return capitalizeWords(value);
  };

  const mapValuesToParams = (values: any) => {
    const total =
      (totalAnnualIncomess || 0) -
      (Number(values.vacant_amount) || 0) +
      values.other_total_annual_income -
      totalExpenses;
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
      ];
      const option = allOptions.find((option) => option.label === str);
      if (option) {
        return option?.value;
      }
      return str;
    };

    const income_source = values.incomeSources?.map((ele: any) => {
      return {
        space: toTitleCase(ele.type),
        monthly_income: Number(ele.monthly_income),
        annual_income: Number(ele.annual_income),
        rent_sq_ft: isNaN(parseFloat(ele.rent_sq_ft))
          ? 0
          : parseFloat(ele.rent_sq_ft),
        square_feet: ele.square_feet
          ? parseFloat(ele.square_feet.toString().replace(/,/g, ''))
          : 0,
        comments: ele.comments,
        res_zoning_id: ele.id ? ele.id : null,
        id: ele.extra_id ? ele.extra_id : null,
        link_overview: ele?.link_overview === 0 ? 0 : 1,
      };
    });
    const other_income_source = values.otherIncomeSources?.map((ele: any) => {
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
    });
    return {
      id: incomeId ? incomeId : null,
      weighted_market_value: totalWeightedValue,

      res_evaluation_id: id,
      res_evaluation_scenario_id: STATE_ID ? STATE_ID : Income_Id,
      operatingExpenses: operatingExpenses,
      cap_rate_notes: values.cap_rate_notes.toString(),
      vacancy: values.vacancy ? values.vacancy : null,
      total_sq_ft: values.total_sq_ft ? values.total_sq_ft : 0,
      other_total_sq_ft: values.other_total_sq_ft
        ? values.other_total_sq_ft
        : 0,
      total_rent_sq_ft: values.total_rent_sq_ft ? values.total_rent_sq_ft : 0,
      total_oe_per_square_feet: values.total_oe_per_square_feet || null,
      total_oe_gross: values.total_oe_gross || null,
      total_oe_annual_amount: values.total_oe_annual_amount || null,
      total_net_income: Number(total.toFixed(2)),
      total_monthly_income: values.total_monthly_income,
      other_total_monthly_income: values.other_total_monthly_income,
      total_annual_income: values.total_annual_income,
      other_total_annual_income: values.other_total_annual_income,
      sq_ft_capitalization_rate: Number(values.sq_ft_capitalization_rate),
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
      indicated_psf_annual: indicatedSfMarketRate ? indicatedSfMarketRate : 0,
      expense_notes: values.expense_notes,
      annual_capitalization_rate: Number(values.annual_capitalization_rate),
      vacant_amount: values.vacant_amount,
      adjusted_gross_amount: values.adjusted_gross_amount,
      income_notes: values.income_notes,
      incomeSources: income_source,
      otherIncomeSources: other_income_source
        ? other_income_source
        : [],
    };
  };
  const handleSubmit = (values: any) => {
    setLoader(true);
    // setTimeout(()=>{
    //   setLoader(true);
    // },3000)
    const params = mapValuesToParams(values);

    if (lastButtonClicked == 'next') {
      mutate(params, {
        onSuccess: (res: any) => {
          toast(res.data.message);
          setLoader(false);

          const scenarios = data?.data?.data?.res_evaluation_scenarios || [];
          // Function to find next scenario with specific approach
          const findNextScenario = (approachType: string) => {
            return scenarios.find(
              (scenario: any) =>
                scenario.id !== STATE_ID && scenario[approachType] === 1
            );
          };

          // First check for more income approaches
          const nextIncomeScenario = scenarios.find(
            (scenario: any) =>
              scenario.id !== STATE_ID &&
              scenario.has_income_approach === 1 &&
              scenario.id > Number(STATE_ID)
          );

          if (nextIncomeScenario) {
            navigate(
              `/residential/evaluation/income-approch?id=${id}&IncomeId=${nextIncomeScenario.id}`
            );
            return;
          }

          // Then check for cap approach
          const capScenario = findNextScenario('has_cap_approach');
          if (capScenario) {
            navigate(
              `/evaluation/cap-approach?id=${id}&capId=${capScenario.id}`
            );
            return;
          }

          // Then check for multi-family approach
          const multiFamilyScenario = findNextScenario(
            'has_multi_family_approach'
          );
          if (multiFamilyScenario) {
            navigate(
              `/evaluation/multi-family-approach?id=${id}&multiFamilyId=${multiFamilyScenario.id}`
            );
            return;
          }

          // Then check for sales approach
          const salesScenario = findNextScenario('has_sales_approach');
          if (salesScenario) {
            navigate(
              `/residential/sales-approach?id=${id}&salesId=${salesScenario.id}`
            );
            return;
          }

          // Then check for cost approach
          const costScenario = findNextScenario('has_cost_approach');
          if (costScenario) {
            navigate(
              `/residential/evaluation/cost-approach?id=${id}&costId=${costScenario.id}`
            );
            return;
          }

          // Then check for lease approach
          const leaseScenario = findNextScenario('has_lease_approach');
          if (leaseScenario) {
            navigate(
              `/evaluation/lease-approach?id=${id}&leaseId=${leaseScenario.id}`
            );
            return;
          }

          // If no other approaches found, use the existing navigation logic
          if (hasRentRollType) {
            navigate(
              `/evaluation/rent-roll?id=${id}&appraisalId=${filteredRentRollData?.[0]?.id}`
            );
          } else if (hasSaleType) {
            navigate(
              `/residential/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`
            );
          } else if (hasCostType) {
            navigate(
              `/residential/evaluation/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`
            );
          } else if (hasLeaseType) {
            navigate(
              `/evaluation/lease-approach?id=${id}&leaseId=${filtereLeasedData?.[0]?.id}`
            );
          } else {
            navigate(`/residential/evaluation-exhibits?id=${id}`);
          }
        },
      });
    } else {
      // Your existing "previous" button logic
      if (hasIncomeType && filtereIncomeData.length > 1) {
        const incomeIndex = filtereIncomeData.findIndex(
          (element) => element.id == STATE_ID
        );

        if (incomeIndex > 0) {
          const incomeIdRedirectIndex = filtereIncomeData[incomeIndex - 1].id;
          navigate(
            `/evaluation/income-approch?id=${id}&IncomeId=${incomeIdRedirectIndex}`
          );
          return;
        }
      }

      // Rest of your navigation logic
      if (hasRentRollType) {
        navigate(
          `/evaluation/rent-roll?id=${id}&appraisalId=${filteredRentRollData?.[0]?.id}`
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
  const handleNextClick = () => {
    setLastButtonClicked('next');
    formikRef.current?.handleSubmit();
  };
  const handleNextPrevious = () => {
    const scenarios = data?.data?.data?.res_evaluation_scenarios || [];
    const currentScenarioIndex = scenarios.findIndex(
      (scenario: any) => scenario.id == STATE_ID
    );
    // Find the closest previous scenario with income approach
    for (let i = currentScenarioIndex - 1; i >= 0; i--) {
      if (scenarios[i].has_income_approach === 1) {
        navigate(
          `/residential/evaluation/income-approch?id=${id}&IncomeId=${scenarios[i].id}`
        );
        return;
      }
    }
    navigate(`/residential/evaluation-area-info?id=${id}`);
  };
  useEffect(() => {
    if (clientApproch?.data?.data?.eval_weight) {
      const evalWeight: any = clientApproch?.data?.data?.eval_weight * 100;
      localStorage.setItem('evalWeightIncome', evalWeight);
    }
  }, [clientApproch?.data?.data?.eval_weight]);
  const evalWeight = clientApproch?.data?.data?.eval_weight * 100;

  useImperativeHandle(ref, () => ({
    onNextClick: () => {
      handleNextClick();
    },
    onBackClick: () => {
      handleNextPrevious();
    },
    getIndicatedCapRate: () => indicatedMarketRate,
  }));

  const [incomeSource, setIncomeSource] = useState([
    {
      type: '',
      monthly_income: 0,
      annual_income: 0,
      square_feet: 0,
      comments: '',
      isDisabled: true,
      id: null,
      extra_id: null,
      link_overview: 0,
    },
  ]);
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
            total_sq_ft: any;
            zone: any;
            id: any;
          }) => ({
            type: getLabelFromValue(zoning.sub_zone, residentialOptions),
            square_feet: zoning.total_sq_ft,
            monthly_income: 0,
            annual_income: 0,
            rent_sq_ft: 0,
            comments: getLabelFromValue(zoning.zone, propertyOptions),
            isDisabled: true,
            id: zoning?.id ? zoning?.id : null,
            extra_id: null,
          })
        );

        if (compType === ResidentialIncomeApproachEnum.LAND_ONLY) {
          const incomeLand: any = [
            {
              type: getLandTypeLabel(landType),
              monthly_income: '',
              annual_income: '',
              square_feet: '',
              // sf_source: landSize,
              comments: ResidentialIncomeApproachEnum.LAND_ONLY_COMMENTS,
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
    // clientApproch?.data?.statusCode,
    data_zonings,
    residentialOptions,
    propertyOptions,
    id,
    STATE_ID,
  ]);
  useEffect(() => {
    if (
      clientApproch?.data?.data?.incomeSources?.length > 0 &&
      clientApproch?.data?.statusCode != '404'
    ) {
      const capitalizeFirstLetter = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      const newIncomeSource = client_approch_source.map(
        (zoning: {
          [x: string]: any;
          sub_zone: any;
          square_feet: any;
          zone: any;
          id: any;
        }) => {
          const ComparisonBasis = data?.data?.data?.comparison_basis;
          let RentSqFt;

          if (ComparisonBasis === ResidentialIncomeApproachEnum.UNIT) {
            RentSqFt = zoning.annual_income / zoning.unit;
          } else if (ComparisonBasis === ResidentialIncomeApproachEnum.BED) {
            RentSqFt = zoning.annual_income / zoning.bed;
          } else {
            RentSqFt = zoning.annual_income / zoning.square_feet;
          }

          return {
            type: getLabelFromValue(zoning.space, multifamilyOptions),
            monthly_income: zoning.monthly_income,
            annual_income: zoning.annual_income,
            rent_sq_ft: RentSqFt.toFixed(2),
            square_feet: zoning.square_feet,
            comments: capitalizeFirstLetter(zoning.comments || ''),
            isDisabled: true,
            rent_bed: zoning.bed ? zoning.bed : 0,
            unit: zoning.unit ? zoning.unit : 0,
            id: zoning?.res_zoning_id ? zoning.res_zoning_id : null,
            extra_id: zoning.id ? zoning.id : null,
            link_overview: zoning?.link_overview,
          };
        }
      );

      if (compType === ResidentialIncomeApproachEnum.LAND_ONLY) {
        setIncomeSourceLand(newIncomeSource);
      } else {
        setIncomeSource(newIncomeSource);
      }
    }
  }, [
    clientApproch?.data?.data?.incomeSources,
    clientApproch?.data?.statusCode,
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
  const [, setIncomeSourceLand] = useState([]);

  const incomeLand: any = [
    {
      type: getLandTypeLabel(landType),
      monthly_income: '',
      annual_income: '',
      rent_sq_ft: '',
      sf_source: landSize,
      comments: ResidentialIncomeApproachEnum.LAND_ONLY_COMMENTS,
      extra_id: null,
    },
  ];

  useEffect(() => {
    if (compType === ResidentialIncomeApproachEnum.LAND_ONLY) {
      setIncomeSourceLand(incomeLand);
    }
  }, [compType]);

  const operatingExpensesInitial = [
    {
      names: ResidentialIncomeApproachEnum.PROPERTY_TAXES,
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '0.00',
      extra_id: null,
    },
    {
      names: ResidentialIncomeApproachEnum.INSURANCE,
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '0.00',
      extra_id: null,
    },
    {
      names: ResidentialIncomeApproachEnum.MAINTENANCE,
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '0.00',
      extra_id: null,
    },
    {
      names: ResidentialIncomeApproachEnum.MANAGEMENT,
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '0.00',
      extra_id: null,
    },
    {
      names: ResidentialIncomeApproachEnum.UTILITIES,
      annual_amount: '0.00',
      percentage_of_gross: '0.00',
      total_per_sq_ft: '0.00',
      comments: '',
      total_per_unit: '',
      total_per_bed: '0.00',
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
    incomeSources: incomeSource,
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
      clientApproch?.data?.data?.operatingExpenses?.length > 0
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
    high_capitalization_rate: updateData?.sq_ft_capitalization_rate || '0',
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
      // onSubmit={updateId ? handleUpdate : handleSubmit}
      >
        {() => {
          return (
            <>
              <>
                <Form className="w-full">
                  {Array.from([
                    <ResidentialEvaluationIncome
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
                    <ResidentialEvaluationOtherIncome
                      analysis_type={analysis_type}
                    />,

                    <ResidentialIncomeExpense
                      analysis_type={analysis_type}
                      isFetching={isFetching}
                      effectiveIncome={effectiveIncome}
                      totalAnnualIncomess={totalAnnualIncomess}
                      totalExpenses={totalExpenses}
                      setTotalExpenses={setTotalExpenses}
                    />,
                    <ResidentialEvaluationNetIncome
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

export default ResidentialEvaluationIncomeApprochForm;

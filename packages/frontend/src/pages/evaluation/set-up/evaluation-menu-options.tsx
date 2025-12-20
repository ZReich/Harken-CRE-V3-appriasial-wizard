import { Icons } from '@/components/icons';
import React, { useEffect, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { RequestType } from '@/hook';
import { useGet } from '@/hook/useGet';
import { useMutate } from '@/hook/useMutate';
import axios from 'axios';
import { Button } from '@mui/material';

const EvaluationMenuOptions = ({
  children,
  onNextClick,
  totalaveragedadjustedpsfSales,
  onBackClick,
  finalResults,
  indicatedCapRate,
  indicatedSfAnnualRate,
  totalaveragedadjustedpsfCost,
  finalResultCost,
  // costValueModified,
  onUpdateEvalWeightChange,
  onUpdateEvalSaleWeightChange,
  onUpdateEvalCostWeightChange,
  totalCostValuation,
  onTotalWeightedChange,
}: any) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [, setStoredFinalResults] = useState<any>(null);
  const [, setStoredIndicatedCapRate] = useState<any>(null);
  const [, setStoredIndicatedSfAnnualRate] = useState<any>(null);
  const [storedFinalResultCost, setStoredFinalResultCost] = useState<any>(null);
  const totalSqCost = totalCostValuation / totalaveragedadjustedpsfCost;

  const [showScrollTop, setShowScrollTop] = useState(false);
  console.log(storedFinalResultCost);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Store values by approach type instead of overwriting
    if (finalResults !== undefined) {
      localStorage.setItem('finalResults_sales', JSON.stringify(finalResults));
    }

    if (indicatedCapRate !== undefined) {
      localStorage.setItem(
        'indicatedCapRate_income',
        JSON.stringify(indicatedCapRate)
      );
    }

    if (indicatedSfAnnualRate !== undefined) {
      localStorage.setItem(
        'indicatedSfAnnualRate_income',
        JSON.stringify(indicatedSfAnnualRate)
      );
    }

    if (finalResultCost !== undefined) {
      localStorage.setItem(
        'finalResultCost_cost',
        JSON.stringify(finalResultCost)
      );
    }

    // Retrieve values by approach type
    const storedSalesResults = localStorage.getItem('finalResults_sales');
    const storedIncomeCapRate = localStorage.getItem('indicatedCapRate_income');
    const storedIncomeSfRate = localStorage.getItem(
      'indicatedSfAnnualRate_income'
    );
    const storedCostResult = localStorage.getItem('finalResultCost_cost');

    setStoredFinalResults(
      storedSalesResults ? JSON.parse(storedSalesResults) : 0
    );
    setStoredIndicatedCapRate(
      storedIncomeCapRate ? JSON.parse(storedIncomeCapRate) : 0
    );
    setStoredIndicatedSfAnnualRate(
      storedIncomeSfRate ? JSON.parse(storedIncomeSfRate) : 0
    );
    setStoredFinalResultCost(
      storedCostResult ? JSON.parse(storedCostResult) : 0
    );
  }, [finalResults, indicatedCapRate, indicatedSfAnnualRate, finalResultCost]);

  // Use stored values or props
  // const effectiveFinalResults = finalResults || storedFinalResults;
  // const effectiveIndicatedCapRate = indicatedCapRate || storedIndicatedCapRate;
  // const effectiveIndicatedSfAnnualRate =
  //   indicatedSfAnnualRate || storedIndicatedSfAnnualRate;
  // const effectiveFinalResultCost = finalResultCost || storedFinalResultCost;
  const pathMatch =
    location.pathname === '/evaluation/income-approch' ||
    location.pathname === '/evaluation/sales-approach' ||
    location.pathname === '/evaluation/cost-approach' ||
    location.pathname === '/evaluation/cost-approach-improvement';

  const id = searchParams.get('id'); // ✅ Keep only this one
  const incomeId = searchParams.get('IncomeId');
  const salesId = searchParams.get('salesId');
  const costId = searchParams.get('costId');
  // const INCOME_ID = searchParams.get('IncomeId');
  const [hasIncomeType, setHasIncomeType] = React.useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [, setHasCapType] = React.useState(false);
  const [, setHasMultiFamilyType] = React.useState(false);
  const [hasCostType, setHasCostType] = React.useState(false);
  const [hasLeaseType, setHasLeaseType] = React.useState(false);

  const [activeLink, setActiveLink] = useState('');
  const [initialIncomePercentage, setInitialIncomePercentage] =
    React.useState<any>(0);
  const [initialSalesPercentage, setInitialSalesPercentage] =
    React.useState<any>(0);
  const [initialCostPercentage, setInitialCostPercentage] =
    React.useState<any>(0);
  const [showHeader, setShowHeader] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [showModalSales, setShowModalSales] = React.useState(false);
  const [showModalCost, setShowModalCost] = React.useState(false);
  const [updateEvalWeight, setUpdateEvalWeight] = React.useState<any>(0);
  const [updateEvalWeightSales, setUpdateEvalWeightSales] =
    React.useState<any>(0);
  const [updateEvalWeightCost, setUpdateEvalWeightCost] =
    React.useState<any>(0);
  const [reviewData, setReviewData] = React.useState<any>(null);
  const [sideBarId, setSideBarId] = React.useState<any>(null);
  const [sideBarData, setSideBarData] = React.useState<any>(null);

  const [, setLoading] = React.useState(true);
  const [comparisonBasis, setComparisionBasis] = React.useState<any>('');
  const [analysisType, setAnalysisType] = React.useState<any>('');
  const [compType, setCompType] = React.useState<any>('');

  const navigate = useNavigate();

  const fetchReviewData = async () => {
    // Guard clause: Exit early if ID is not valid
    if (!id) {
      console.warn('No ID provided, skipping API call.');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`/evaluations/get-review/${id}`);
      setComparisionBasis(response.data?.data?.data?.comparison_basis);
      setAnalysisType(response.data?.data?.data?.analysis_type);
      setCompType(response.data?.data?.data?.comp_type);
      const scenarios = response.data?.data?.data?.scenarios;
      setReviewData(scenarios);

      const urlParams = new URLSearchParams(window.location.search);
      const incomeIdFromUrl = urlParams.get('IncomeId');
      const capIdFromUrl = urlParams.get('capId');
      const appraisalIdFromUrl = urlParams.get('appraisalId');
      const salesIdFromUrl = urlParams.get('salesId');
      const costFromUrl = urlParams.get('costId');

      const storedSalesId = localStorage.getItem('selectedSalesId');
      const storedCostId = localStorage.getItem('selectedCostId');
      const directCostId = localStorage.getItem('costId');

      let currentSideBarId =
        incomeIdFromUrl ||
        capIdFromUrl ||
        appraisalIdFromUrl ||
        salesIdFromUrl ||
        costFromUrl ||
        directCostId ||
        storedSalesId ||
        storedCostId ||
        sideBarId;

      if (
        window.location.pathname.includes('cost-approach-improvement') &&
        costFromUrl
      ) {
        currentSideBarId = costFromUrl;
      }

      // const storedData = sessionStorage.getItem('costImprovementData');
      console.log(
        'Current path:',
        window.location.pathname,
        'Includes cost-approach-improvement:',
        window.location.pathname.includes('cost-approach-improvement')
      );

      if (
        window.location.pathname.includes('cost-approach-improvement') &&
        costFromUrl &&
        scenarios
      ) {
        const matchedData = scenarios.find(
          (item: any) => item.id === Number(costFromUrl)
        );
        console.log('Cost improvement matchedData by costId:', matchedData);
        if (matchedData) {
          setSideBarData(matchedData);
        }
      } else if (currentSideBarId && scenarios) {
        const matchedData = scenarios.find(
          (item: any) => item.id === Number(currentSideBarId)
        );
        setSideBarData(matchedData);
      }
    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
  }, [id, sideBarId]);
  const ReviewData = reviewData?.filter(
    (ele: any) =>
      ele.id === Number(incomeId) ||
      ele.id === Number(salesId) ||
      ele.id === Number(costId)
  );

  const incomeEvalWeight =
    !ReviewData ||
    ReviewData.length === 0 ||
    ReviewData[0].evaluation_income_approach === null
      ? 0
      : ReviewData[0].evaluation_income_approach?.eval_weight || 0;
  const incomeEvalWeightPercentage = incomeEvalWeight * 100;
  const salesEvalWeight =
    !ReviewData ||
    ReviewData.length === 0 ||
    ReviewData[0].evaluation_sales_approach === null
      ? 0
      : ReviewData[0].evaluation_sales_approach?.eval_weight || 0;
  const salesEvalWeightPercentage = salesEvalWeight * 100;
  const costEvalWeight =
    !ReviewData ||
    ReviewData.length === 0 ||
    ReviewData[0].evaluation_cost_approach === null
      ? 0
      : ReviewData[0].evaluation_cost_approach?.eval_weight || 0;
  const costEvalWeightPercentage = costEvalWeight * 100;
  useEffect(() => {
    if (incomeEvalWeightPercentage) {
      localStorage.setItem(
        'initialIncomePercentage',
        incomeEvalWeightPercentage.toString()
      );
      setInitialIncomePercentage(
        `${Number.isInteger(incomeEvalWeightPercentage) ? incomeEvalWeightPercentage : incomeEvalWeightPercentage.toFixed(2)}`
      );
    }
    if (salesEvalWeightPercentage) {
      setInitialSalesPercentage(
        `${Number.isInteger(salesEvalWeightPercentage) ? salesEvalWeightPercentage : salesEvalWeightPercentage.toFixed(2)}`
      );
      localStorage.setItem(
        'initialSalesPercentage',
        salesEvalWeightPercentage.toString()
      );
    }
    if (costEvalWeightPercentage) {
      setInitialCostPercentage(
        `${Number.isInteger(costEvalWeightPercentage) ? costEvalWeightPercentage : costEvalWeightPercentage.toFixed(2)}`
      );
      localStorage.setItem(
        'initialCostPercentage',
        costEvalWeightPercentage.toString()
      );
    }
  }, [
    incomeEvalWeightPercentage,
    salesEvalWeightPercentage,
    costEvalWeightPercentage,
  ]);
  const incomePercentage = Number(
    parseFloat(localStorage.getItem('initialIncomePercentage') || '0')
  );
  const salesPercentage = Number(
    parseFloat(localStorage.getItem('initialSalesPercentage') || '0')
  );
  const costPercentage = Number(
    parseFloat(localStorage.getItem('initialCostPercentage') || '0')
  );

  const incomeDataValue =
    indicatedCapRate !== undefined && indicatedCapRate !== null
      ? indicatedCapRate * (updateEvalWeight && updateEvalWeight / 100) ||
        indicatedCapRate *
          ((sideBarData?.evaluation_income_approach?.eval_weight * 100) / 100)
      : // (updateEvalWeight && updateEvalWeight !== null
        //   ? updateEvalWeight / 100
        //   : incomePercentage / 100)
        sideBarData?.evaluation_income_approach?.indicated_range_annual
        ? sideBarData.evaluation_income_approach.indicated_range_annual *
            (updateEvalWeight && updateEvalWeight / 100) ||
          sideBarData?.evaluation_income_approach?.indicated_range_annual *
            ((sideBarData?.evaluation_income_approach?.eval_weight * 100) / 100)
        : // (updateEvalWeight !== undefined && updateEvalWeight !== null
          //   ? updateEvalWeight / 100
          //   : sideBarData.evaluation_income_approach.eval_weight ||
          //     incomePercentage / 100)
          0;

  const salesDataValue =
    finalResults !== undefined && finalResults !== null
      ? finalResults * (updateEvalWeightSales && updateEvalWeightSales / 100) ||
        finalResults *
          ((sideBarData?.evaluation_sales_approach?.eval_weight * 100) / 100)
      : sideBarData?.evaluation_sales_approach?.sales_approach_value
        ? sideBarData.evaluation_sales_approach?.sales_approach_value *
            (updateEvalWeightSales && updateEvalWeightSales / 100) ||
          (sideBarData?.evaluation_sales_approach?.sales_approach_value *
            (sideBarData?.evaluation_sales_approach?.eval_weight * 100)) /
            100
        : 0;

  const costDataValue =
    finalResultCost !== undefined && finalResultCost !== null
      ? finalResultCost *
          (updateEvalWeightCost && updateEvalWeightCost / 100) ||
        finalResultCost *
          ((sideBarData?.evaluation_cost_approach?.eval_weight * 100) / 100)
      : sideBarData?.evaluation_cost_approach?.total_cost_valuation
        ? sideBarData.evaluation_cost_approach.total_cost_valuation *
            (updateEvalWeightCost && updateEvalWeightCost / 100) ||
          (sideBarData?.evaluation_cost_approach?.total_cost_valuation *
            (sideBarData?.evaluation_cost_approach?.eval_weight * 100)) /
            100
        : 0;

  const totalaveragedadjustedpsfSalesValue =
    totalaveragedadjustedpsfSales !== undefined &&
    totalaveragedadjustedpsfSales !== null
      ? totalaveragedadjustedpsfSales *
          (updateEvalWeightSales && updateEvalWeightSales / 100) ||
        totalaveragedadjustedpsfSales *
          ((sideBarData?.evaluation_sales_approach?.eval_weight * 100) / 100)
      : sideBarData?.evaluation_sales_approach?.averaged_adjusted_psf !==
            undefined &&
          sideBarData?.evaluation_sales_approach?.averaged_adjusted_psf !== null
        ? sideBarData.evaluation_sales_approach.averaged_adjusted_psf *
            (updateEvalWeightSales && updateEvalWeightSales / 100) ||
          (sideBarData.evaluation_sales_approach.averaged_adjusted_psf *
            (sideBarData?.evaluation_sales_approach?.eval_weight * 100)) /
            100
        : 0;
  const totalaveragedadjustedpsfCostValue =
    totalSqCost !== undefined && totalSqCost !== null && !isNaN(totalSqCost)
      ? totalSqCost * (updateEvalWeightCost && updateEvalWeightCost / 100) ||
        totalSqCost *
          ((sideBarData?.evaluation_cost_approach?.eval_weight * 100) / 100)
      : sideBarData?.evaluation_cost_approach?.indicated_value_psf !==
            undefined &&
          sideBarData?.evaluation_cost_approach?.indicated_value_psf !== null
        ? sideBarData.evaluation_cost_approach.indicated_value_psf *
            (updateEvalWeightCost && updateEvalWeightCost / 100) ||
          (sideBarData.evaluation_cost_approach.indicated_value_psf *
            (sideBarData?.evaluation_cost_approach?.eval_weight * 100)) /
            100
        : 0;
  const indicatedSfAnnualRateValue =
    indicatedSfAnnualRate !== undefined && indicatedSfAnnualRate !== null
      ? indicatedSfAnnualRate * (updateEvalWeight && updateEvalWeight / 100) ||
        indicatedSfAnnualRate *
          ((sideBarData?.evaluation_income_approach?.eval_weight * 100) / 100)
      : sideBarData?.evaluation_income_approach?.indicated_psf_annual !==
            undefined &&
          sideBarData?.evaluation_income_approach?.indicated_psf_annual !== null
        ? sideBarData.evaluation_income_approach.indicated_psf_annual *
            (updateEvalWeight && updateEvalWeight / 100) ||
          (sideBarData.evaluation_income_approach.indicated_psf_annual *
            (sideBarData?.evaluation_income_approach?.eval_weight * 100)) /
            100
        : 0;

  // const totalWeighted = incomeDataValue + costDataValue + salesDataValue;

  const totalWeighted = incomeDataValue + costDataValue + salesDataValue;

  // Call the callback whenever totalWeighted changes
  React.useEffect(() => {
    if (onTotalWeightedChange && totalWeighted !== undefined) {
      onTotalWeightedChange(totalWeighted);
    }
  }, [totalWeighted, onTotalWeightedChange]);

  const handleLinkClick = (link: any) => {
    localStorage.removeItem('compsLenght');
    setActiveLink(link);
  };
  // useEffect(() => {
  //   setInitialIncomePercentage(localStorage.getItem('evalWeightIncome') || '0');
  // }, [localStorage.getItem('evalWeightIncome')]);

  const url = new URL(window.location.href);
  const urlParts = {
    scheme: url.protocol.replace(':', ''),
    netloc: url.host,
    path: url.pathname,
  };

  const { data } = useGet<any>({
    queryKey: 'evaluations/get',
    cacheTime: 0,
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled:
        !urlParts.path.includes('evaluation-set-up') &&
        !urlParts.path.includes('appraisal-set-up'),
      refetchOnWindowFocus: false,
    },
  });

  const totalSF =
    comparisonBasis === 'Bed'
      ? totalWeighted / data?.data?.data?.total_beds
      : comparisonBasis === 'Unit'
        ? totalWeighted / data?.data?.data?.total_units
        : totalaveragedadjustedpsfSalesValue +
          totalaveragedadjustedpsfCostValue +
          indicatedSfAnnualRateValue;
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const incomeId = searchParams.get('IncomeId');
    const appraisalId = searchParams.get('appraisalId');

    if (
      urlParts.path.includes('residential/evaluation/income-approch') &&
      incomeId
    ) {
      setActiveLink(`residential/evaluation/income-approch-${incomeId}`);
    } else if (urlParts.path.includes('evaluation/rent-roll') && appraisalId) {
      setActiveLink(`evaluation/rent-roll-${appraisalId}`);
    }
  }, [urlParts.path]);

  // const overviewData = data?.data?.data?.zonings;
  // const appraisalType = data?.data?.data?.appraisal_type;
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-position',
    endPoint: `evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });
  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      if (
        id &&
        !urlParts.path.includes('evaluation-set-up') &&
        !urlParts.path.includes('appraisal-set-up')
      ) {
        const ApiUrl = window.location.href.replace(window.location.origin, '');
        await mutateAsync({
          position: ApiUrl,
        });
      }
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync, urlParts.path]);

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      if (
        id &&
        !urlParts.path.includes('evaluation-set-up') &&
        !urlParts.path.includes('appraisal-set-up')
      ) {
        const ApiUrl = window.location.href.replace(window.location.origin, '');
        await mutateAsync({
          position: ApiUrl,
        });
      }
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync, urlParts.path]);

  // Update street_address when data changes
  useEffect(() => {
    const appraisalData = data?.data?.data;

    if (appraisalData) {
      const address = appraisalData.street_address;
      console.log('Street Address:', address);
    }
  }, [data]);

  const updateDatas = data?.data?.data?.scenarios;
  // const comaprisonBasis = data?.data?.data?.comparison_basis;
  // const totalUnits = data?.data?.data?.total_units;
  const matchedScenario = updateDatas?.filter(
    (item: { id: any }) =>
      item.id === Number(incomeId) ||
      item.id === Number(salesId) ||
      item.id === Number(costId)
  );
  const evaluationIncomeId =
    matchedScenario?.length > 0
      ? matchedScenario[0]?.evaluation_income_approach?.id
      : null;
  const evaluationSalesId =
    matchedScenario?.length > 0
      ? matchedScenario[0]?.evaluation_sales_approach?.id
      : null;
  const evaluationCostId =
    matchedScenario?.length > 0
      ? matchedScenario[0]?.evaluation_cost_approach?.id
      : null;
  const passAerialInfoMap = data?.data?.data;

  const incomeApprochId = updateDatas && updateDatas[0] && updateDatas[0].id;
  localStorage.setItem('incomeId', incomeApprochId);
  const incomeApprochName =
    updateDatas && updateDatas[0] && updateDatas[0].name;

  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filteredRentRollData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  const [filtereCapdData, setFilteredCapData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  const [filtereMultiFamilydData, setFilteredMultiFamilyData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filterLeasedData, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCostdData, setFilteredCostsData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  useEffect(() => {
    const scenarios = data?.data?.data?.scenarios;

    if (scenarios && Array.isArray(scenarios)) {
      const sales = scenarios.filter((item) => item.has_sales_approach === 1);
      const income = scenarios.filter((item) => item.has_income_approach === 1);
      const lease = scenarios.filter((item) => item.has_lease_approach === 1);
      const cap = scenarios.filter((item) => item.has_cap_approach === 1);
      const multiFamily = scenarios.filter(
        (item) => item.has_multi_family_approach === 1
      );
      const cost = scenarios.filter((item) => item.has_cost_approach === 1);

      // Find scenarios that have both multi-family and rent-roll approaches
      const rentRoll = scenarios.filter(
        (item) => item.has_rent_roll_approach === 1
      );

      setHasSaleType(sales.length > 0);
      setHasIncomeType(
        income.length > 0 ||
          cap.length > 0 ||
          multiFamily.length > 0 ||
          rentRoll.length > 0
      );
      setHasLeaseType(lease.length > 0);
      setHasCapType(cap.length > 0);
      setHasMultiFamilyType(multiFamily.length > 0);
      setHasCostType(cost.length > 0);

      setFilteredSalesData(sales.map(({ id, name }) => ({ id, name })));
      setFilteredData(income.map(({ id, name }) => ({ id, name })));
      setFilteredLeaseData(lease.map(({ id, name }) => ({ id, name })));
      setFilteredCapData(cap.map(({ id, name }) => ({ id, name })));

      // Create an interleaved array of multi-family and rent-roll items
      // const combinedMultiFamilyAndRentRoll = [];

      // First add all multi-family items
      setFilteredMultiFamilyData(
        multiFamily.map(({ id, name }) => ({ id, name }))
      );

      // For rent roll, find matching scenarios with multi-family approach
      const rentRollWithMultiFamily = rentRoll.filter((rentRollItem) =>
        multiFamily.some(
          (multiFamilyItem) => multiFamilyItem.id === rentRollItem.id
        )
      );

      setFilteredRentRollData(
        rentRollWithMultiFamily.map(({ id, name }) => ({ id, name }))
      );
      setFilteredCostsData(cost.map(({ id, name }) => ({ id, name })));
    }
  }, [data?.data?.data?.scenarios]);

  // const templateIds = data?.data?.data?.template?.id;

  useEffect(() => {
    if (data?.data?.data?.template?.id) {
      const fetchData = async () => {
        try {
          await axios.get(`/template/report-template/${id}`);
        } catch (error) {
          console.error('Error fetching template data', error);
        }
      };
      fetchData();
    }
  }, [data?.data?.data?.template?.id]);

  const salesApproch: any = sessionStorage.getItem('hasSaleType');
  const incomeApproch: any = sessionStorage.getItem('hasIncomeApproch');
  const costApproch: any = sessionStorage.getItem('hasCostApproch');
  const leaseApproach: any = sessionStorage.getItem('hasLeaseApproch');
  const capApproach: any = sessionStorage.getItem('hasCapApproch');

  useEffect(() => {
    if (salesApproch === 'true') {
      setHasSaleType(true);
    }
    if (capApproach === 'true') {
      setHasCapType(true);
    }
    if (incomeApproch === 'true') {
      setHasIncomeType(true);
    }
    if (costApproch === 'true') {
      setHasCostType(true);
    }
    if (leaseApproach === 'true') {
      localStorage.setItem('checkType', 'leasesCheckbox');
      localStorage.removeItem('compsLenght');
      setHasLeaseType(true);
    }
  }, [salesApproch, incomeApproch, costApproch]);

  const IncomeApprochRentRollIndex = filteredRentRollData[0]?.id;

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Directly find the matching rent-roll item
    const matchingRentRoll = filteredRentRollData.find(
      (elem) =>
        currentPath === `/evaluation/rent-roll?id=${id}&evaluationId=${elem.id}`
    );

    if (matchingRentRoll) {
      console.log('Rent Roll Matched:', matchingRentRoll.id); // Debugging log
      setActiveLink(matchingRentRoll.id);
    }
  }, [location.pathname, location.search, id, filteredRentRollData]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    // Define valid paths and their respective required parameters
    const validPaths: any = {
      '/evaluation/sales-approach': 'salesId',
      '/evaluation/lease-approach': 'leaseId',
      '/evaluation/cost-approach': 'costId',
    };

    // Check if the current path matches any valid route and has required query parameters
    if (
      validPaths[location.pathname] &&
      id &&
      params.get(validPaths[location.pathname])
    ) {
      localStorage.removeItem('checkType');

      // If it's the lease-approach page, set 'approachType' to 'leaseCheck'
      if (location.pathname === '/evaluation/lease-approach') {
        localStorage.setItem('approachType', 'leaseCheck');
      }
      if (location.pathname === '/evaluation/sales-approach') {
        localStorage.setItem('approachType', 'salesCheck');
      }
      if (location.pathname === '/evaluation/cost-approach') {
        localStorage.setItem('approachType', 'salesCheck');
      }
    }
  }, [location]);

  // const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    const approachId = searchParams.get('approachId');

    if (id && approachId) {
      const keysToRemove = [
        'building_sf_max',
        'building_sf_min',
        'cap_rate_max',
        'compStatus',
        'end_date',
        'land_sf_max',
        'land_sf_min',
        'property_type',
        'start_date',
        'state',
        'street_address',
        'all',
      ];

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
  }, [location.search]); // 👈 Run when URL search params change

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    if (currentPath.includes('evaluation-overview')) {
      setActiveLink('evaluation-overview');
    } else if (currentPath.includes('evaluation/images')) {
      setActiveLink('evaluation/images');
    } else if (currentPath.includes('evalution-photo-sheet')) {
      setActiveLink('evalution-photo-sheet');
    } else if (currentPath.includes('evaluation-property-boundaries')) {
      setActiveLink('evaluation-property-boundaries');
    } else if (currentPath.includes('evaluation-aerialmap')) {
      setActiveLink('evaluation-aerialmap');
    } else if (currentPath.includes('evaluation-area-info')) {
      setActiveLink('evaluation-area-info');
    } else if (currentPath.includes('evaluation-photo-sheet')) {
      setActiveLink('evaluation-photo-sheet');
    }

    // Rent-roll check
    const matchingRentRoll = filteredRentRollData.find(
      (elem) =>
        currentPath === `/evaluation/rent-roll?id=${id}&evaluationId=${elem.id}`
    );

    if (matchingRentRoll) {
      setActiveLink(matchingRentRoll.id);
    }

    // **Income-Approach check (Fix)**
    filteredData.forEach((elem: any) => {
      const incomeApproachPath = `/evaluation/income-approch?id=${id}&IncomeId=${elem.id}`;
      if (currentPath === incomeApproachPath) {
        setActiveLink(`evaluation/income-approch-${elem.id}`);
      }
    });

    // Sales-Approach check
    filtereSalesdData.forEach((elem) => {
      const salesApproachPath = `/evaluation/sales-approach?id=${id}&salesId=${elem.id}`;
      const salesCompsMapPath = `/evaluation/sales-comps-map?id=${id}&salesId=${elem.id}`;
      if (currentPath === salesApproachPath) {
        localStorage.removeItem('checkType');
        setActiveLink(`evaluation/sales-approach-${elem.id}`);
      } else if (currentPath === salesCompsMapPath) {
        setActiveLink(`evaluation/sales-comps-map-${elem.id}`);
      }
    });
    filtereCapdData.forEach((elem) => {
      const capApproachPath = `/evaluation/cap-approach?id=${id}&capId=${elem.id}`;
      const capCompsMapPath = `/evaluation/cap-comps-map?id=${id}&capId=${elem.id}`;
      if (currentPath === capApproachPath) {
        localStorage.removeItem('checkType');
        setActiveLink(`evaluation/cap-approach-${elem.id}`);
      } else if (currentPath === capCompsMapPath) {
        setActiveLink(`cap-comps-map-${elem.id}`);
      }
    });

    filtereMultiFamilydData.forEach((elem) => {
      const multiFamilyApproachPath = `/evaluation/multi-family-approach?id=${id}&evaluationId=${elem.id}`;
      const multiFamilyCompsMapPath = `/evaluation/multi-family-comps-map?id=${id}&evaluationId=${elem.id}`;
      if (currentPath === multiFamilyApproachPath) {
        localStorage.removeItem('checkType');
        setActiveLink(`evaluation/multi-family-approach-${elem.id}`);
      } else if (currentPath === multiFamilyCompsMapPath) {
        setActiveLink(`/evaluation/multi-family-comps-map-${elem.id}`);
      }
    });

    // Lease-Approach check
    filterLeasedData.forEach((elem) => {
      const leaseApproachPath = `/evaluation/lease-approach?id=${id}&leaseId=${elem.id}`;
      const leaseCompsMapPath = `/evaluation/lease-comps-map?id=${id}&leaseId=${elem.id}`;
      if (currentPath === leaseApproachPath) {
        setActiveLink(`evaluation/lease-approach-${elem.id}`);
      } else if (currentPath === leaseCompsMapPath) {
        setActiveLink(`evaluation/lease-comps-map-${elem.id}`);
      }
    });

    // Cost-Approach check
    filtereCostdData.forEach((elem) => {
      const costApproachPath = `/evaluation/cost-approach?id=${id}&costId=${elem.id}`;
      const costCompsMapPath = `/evaluation/cost-comps-map?id=${id}&costId=${elem.id}`;
      const costCompsMapImprovement = `/evaluation/cost-approach-improvement?id=${id}&costId=${elem.id}`;
      if (currentPath === costApproachPath) {
        setActiveLink(`evaluation/cost-approach-${elem.id}`);
      } else if (currentPath === costCompsMapPath) {
        setActiveLink(`/evaluation/cost-comps-map-${elem.id}`);
      } else if (currentPath === costCompsMapImprovement) {
        setActiveLink(`evaluation/cost-approach-improvement-${elem.id}`);
      }
    });
  }, [
    location,
    id,
    filteredRentRollData,
    filteredData,
    filtereSalesdData,
    filtereCostdData,
    filterLeasedData,
    filtereCapdData,
    filtereMultiFamilydData,
  ]);
  const isSalesApproach = location.pathname === '/evaluation/sales-approach';
  const isCostApproach = location.pathname === '/evaluation/cost-approach';
  const isCostImprovement =
    location.pathname === '/evaluation/cost-approach-improvement';

  const shouldShowSidebar =
    (pathMatch && id && incomeId) ||
    (isSalesApproach && salesId) ||
    (isCostApproach && costId) ||
    (isCostApproach && costId) ||
    (isCostImprovement && costId);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentValue = initialIncomePercentage;

      // Let browser handle if nothing to slice
      if (currentValue === '') return;

      e.preventDefault(); // Prevent default backspace

      setInitialIncomePercentage((prev: any) => {
        if (typeof prev !== 'string') return '';
        const newValue = prev.slice(0, -1);
        return newValue === '.' ? '' : newValue;
      });
    }
  };

  const handleSalesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault(); // Stop default backspace behavior

      setInitialSalesPercentage((prev: any) => {
        if (typeof prev !== 'string') return ''; // Fallback safety

        const newValue = prev.slice(0, -1);
        return newValue === '.' ? '' : newValue;
      });
    }
  };
  const handleCostKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault(); // Stop default backspace behavior

      setInitialCostPercentage((prev: any) => {
        if (typeof prev !== 'string') return ''; // Fallback safety

        const newValue = prev.slice(0, -1);
        return newValue === '.' ? '' : newValue;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace('%', '');

    // Allow empty input
    if (inputValue === '') {
      setInitialIncomePercentage('');
      return;
    }

    // Match number with up to 2 decimal digits
    if (/^\d*\.?\d{0,2}$/.test(inputValue)) {
      const num = parseFloat(inputValue);

      // Allow incomplete decimal like "25." or just "."
      if (inputValue.endsWith('.') || inputValue === '.') {
        setInitialIncomePercentage(inputValue);
        return;
      }

      // Allow numbers only up to 100
      if (!isNaN(num) && num <= 100) {
        setInitialIncomePercentage(inputValue);
      }
    }
  };

  const handleChangeCost = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace('%', '');

    // Allow empty input
    if (inputValue === '') {
      setInitialCostPercentage('');
      return;
    }

    // Match number with up to 2 decimal digits
    if (/^\d*\.?\d{0,2}$/.test(inputValue)) {
      const num = parseFloat(inputValue);

      // Allow incomplete decimal like "25." or just "."
      if (inputValue.endsWith('.') || inputValue === '.') {
        setInitialCostPercentage(inputValue);
        return;
      }

      // Allow numbers only up to 100
      if (!isNaN(num) && num <= 100) {
        setInitialCostPercentage(inputValue);
      }
    }
  };
  const handleChangeSales = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace('%', '');

    // Allow empty input
    if (inputValue === '') {
      setInitialSalesPercentage('');
      return;
    }

    // Match number with up to 2 decimal digits
    if (/^\d*\.?\d{0,2}$/.test(inputValue)) {
      const num = parseFloat(inputValue);

      // Allow incomplete decimal like "25." or just "."
      if (inputValue.endsWith('.') || inputValue === '.') {
        setInitialSalesPercentage(inputValue);
        return;
      }

      // Allow numbers only up to 100
      if (!isNaN(num) && num <= 100) {
        setInitialSalesPercentage(inputValue);
      }
    }
  };
  const handleEdit = (item: string) => {
    setShowHeader(item);
    setShowModal(true);
  };
  const handleSave = async (incomeId: any) => {
    try {
      const value = parseFloat(initialIncomePercentage);

      if (isNaN(value) || value > 100) {
        console.log('Please enter a valid percentage (0–100).');
        return;
      }
      const response = await axios.patch(
        `/evaluations/save-weight-percent/${id}`,
        {
          approach_id: incomeId,
          approach_type: 'income',
          eval_weight: value,
        }
      );
      if (response.data.data.statusCode) {
        setUpdateEvalWeight(value);
        // Pass the updated value to parent component
        if (onUpdateEvalWeightChange) {
          onUpdateEvalWeightChange(value);
        }
        fetchReviewData();
        // setInitialIncomePercentage(value)
      }

      setShowModal(false);
    } catch (error) {
      console.error('Patch error:', error);
      // alert('Failed to save. Please try again.');
    }
  };
  const handleSaveSales = async (salesId: any) => {
    try {
      const value = parseFloat(initialSalesPercentage);

      if (isNaN(value) || value > 100) {
        console.log('Please enter a valid percentage (0–100).');
        return;
      }
      const response = await axios.patch(
        `/evaluations/save-weight-percent/${id}`,
        {
          approach_id: salesId,
          approach_type: 'sale',
          eval_weight: value,
        }
      );
      if (response.data.data.statusCode) {
        setUpdateEvalWeightSales(value);
        if (onUpdateEvalSaleWeightChange) {
          onUpdateEvalSaleWeightChange(value);
        }
        // setInitialSalesPercentage(value)
      }

      setShowModalSales(false);
    } catch (error) {
      console.error('Patch error:', error);
      // alert('Failed to save. Please try again.');
    }
  };
  const handleSaveCost = async (costid: any) => {
    try {
      const value = parseFloat(initialCostPercentage);

      if (isNaN(value) || value > 100) {
        console.log('Please enter a valid percentage (0–100).');
        return;
      }
      const response = await axios.patch(
        `/evaluations/save-weight-percent/${id}`,
        {
          approach_id: costid,
          approach_type: 'cost',
          eval_weight: value,
        }
      );
      if (response.data.data.statusCode) {
        setUpdateEvalWeightCost(value);
        if (onUpdateEvalCostWeightChange) {
          onUpdateEvalCostWeightChange(value);
        }
        // setInitialCostPercentage(value)
      }

      setShowModalCost(false);
    } catch (error) {
      console.error('Patch error:', error);
      // alert('Failed to save. Please try again.');
    }
  };
  // Add this function to your component
  const handleSidebarIdChange = (newId: any) => {
    // Set the state
    setSideBarId(newId);
    // Immediately find and use the data without waiting for state update
    if (newId && reviewData) {
      console.log('Looking for ID:', newId, 'Type:', typeof newId);
      console.log('Available reviewData:', reviewData);

      // Try to find with number comparison first
      let matchedData = reviewData.find(
        (item: any) => item.id === Number(newId)
      );

      // If not found, try with string comparison
      if (!matchedData) {
        matchedData = reviewData.find(
          (item: any) => String(item.id) === String(newId)
        );
      }

      console.log('finalResultCost:', finalResultCost);

      if (matchedData) {
        console.log('Matched data immediately:', matchedData);
        setSideBarData(matchedData);
        // Also store in sessionStorage for persistence
        sessionStorage.setItem('costApproachData', JSON.stringify(matchedData));
      } else {
        console.warn('No matching data found in reviewData for ID:', newId);
      }
    }
  };
  // Add this useEffect
  useEffect(() => {
    // When reviewData changes and we have a sideBarId, update sideBarData
    if (reviewData && reviewData.length > 0) {
      // If we have a sideBarId, use it
      if (sideBarId) {
        // alert('sdfsdkj');
        const matchedData = reviewData.find(
          (item: any) => item.id === Number(sideBarId)
        );
        if (matchedData) {
          setSideBarData(matchedData);
        }
      }
    }
  }, [reviewData, sideBarId, filteredData]);

  return (
    <>
      <div className="flex">
        <div className="w-full">
          <div
            className={`w-[calc(100%-0px)] flex text-[#95989A] cursor-pointer sticky-nav relative border border-[#eeeeee] border-b border-solid border-t-0 border-r-0 border-l-0 ${
              localStorage.getItem('open') === 'open' ? 'z-50' : 'z-20'
            }`}
          >
            <div
              style={{
                width: '14.29%',
                borderRadius: '0 0 44px 0',
                position: 'relative',
              }}
              className={`${urlParts.path.includes('evaluation-set-up') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg] flex-1 ' : 'flex-1 before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
            >
              <Link
                className={`w-full h-full flex justify-center items-center no-underline relative ${urlParts.path.includes('evaluation-set-up') ? 'text-[white]' : 'text-[#95989A] '}`}
                to={
                  id
                    ? `/update-evaluation-set-up?id=${id}`
                    : '/evaluation-set-up'
                }
              >
                <div
                  className={`w-[100%] h-full flex justify-center items-center !border-t-0 text-[#95989A]  ${urlParts.path.includes('evaluation-set-up') ? '' : ''}`}
                >
                  <span
                    className={`h-full flex items-center ${urlParts.path.includes('evaluation-set-up') ? 'text-[white]' : 'text-[#95989A]'} `}
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      textAlign: 'center',
                      padding: '5px 10px',
                    }}
                  >
                    Setup
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex-1">
              <div
                className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${urlParts.path.includes('evaluation-overview') || urlParts.path.includes('evalution-image') || urlParts.path.includes('evaluation-property-boundaries') || urlParts.path.includes('evaluation-area-info') || urlParts.path.includes('evaluation-aerialmap') || urlParts.path.includes('evalution-photo-sheet') || urlParts.path.includes('evaluation-photo-sheet') || urlParts.path.includes('evaluation/images') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
                style={{
                  opacity: id ? 1 : 0.5,
                  pointerEvents: id ? 'auto' : 'none',
                }}
              >
                <Link
                  className={`w-full h-full flex justify-center items-center relative no-underline ${urlParts.path.includes('evaluation-overview') || urlParts.path.includes('evalution-image') || urlParts.path.includes('evaluation-property-boundaries') || urlParts.path.includes('evaluation-aerialmap') || urlParts.path.includes('evaluation-area-info') || urlParts.path.includes('evalution-photo-sheet') || urlParts.path.includes('evaluation-photo-sheet') || urlParts.path.includes('evaluation/images') ? 'text-[white]' : 'text-[#95989A]'}`}
                  to={
                    id
                      ? `/evaluation-overview?id=${id}`
                      : '/evaluation-overview'
                  }
                  style={{
                    pointerEvents: id ? 'auto' : 'none',
                    cursor: id ? 'pointer' : 'default',
                  }}
                  onClick={(e) => {
                    if (!id) {
                      e.preventDefault();
                    }
                  }}
                >
                  <span
                    className="h-full flex items-center"
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      textAlign: 'center',
                      padding: '5px 10px',
                    }}
                  >
                    Overview
                  </span>
                  <Icons.ArrowDropDownIcon
                    style={{
                      pointerEvents: id ? 'auto' : 'none',
                      opacity: id ? 1 : 0.5,
                    }}
                  />
                </Link>
                <div className="appraisal-menu-hover left-[-11px] absolute top-[58px] opacity-100 bg-white w-full z-50">
                  <ul className="text-customBlue list-none">
                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${urlParts.path.includes('evaluation-overview') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'evaluation-overview' ? 'active-li-class' : ''}`}
                        to={
                          id
                            ? `/evaluation-overview?id=${id}`
                            : '/evaluation-overview'
                        }
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            handleLinkClick('evaluation-overview');
                          }
                        }}
                      >
                        {' '}
                        Overview Page
                      </Link>
                    </li>

                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] no-underline ${urlParts.path.includes('evaluation/images') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'evaluation/images' ? 'active-li-class' : ''}`}
                        to={`/evaluation/images?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            handleLinkClick('evaluation/images');
                          }
                        }}
                      >
                        Images Page
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] no-underline ${urlParts.path.includes('evaluation-photo-sheet') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'evaluation-photo-sheet' ? 'active-li-class' : ''}`}
                        to={`/evaluation-photo-sheet?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            handleLinkClick('evaluation-photo-sheet');
                          }
                        }}
                      >
                        Photo Pages
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] no-underline ${urlParts.path.includes('evaluation-property-boundaries') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'evaluation-property-boundaries' ? 'active-li-class' : ''}`}
                        to={`/evaluation-property-boundaries?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            handleLinkClick('evaluation-property-boundaries');
                          }
                        }}
                      >
                        Map Boundary Page
                      </Link>
                    </li>
                    <li>
                      <Link
                        state={{ from: passAerialInfoMap }}
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] no-underline ${urlParts.path.includes('evaluation-aerialmap') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'evaluation-aerialmap' ? 'active-li-class' : ''}`}
                        to={`/evaluation-aerialmap?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            setActiveLink('evaluation-aerialmap');
                          }
                        }}
                      >
                        Aerial Map
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] no-underline ${urlParts.path.includes('evaluation-area-info') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'evaluation-area-info' ? 'active-li-class' : ''}`}
                        to={`/evaluation-area-info?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        state={{ from: passAerialInfoMap }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            setActiveLink('area-info');
                          }
                        }}
                      >
                        {' '}
                        Area Info
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* INCOME APPROACH GROUPING */}
            {hasIncomeType && (
              <div className="flex-1">
                <div
                  className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${
                    [
                      'evaluation/income-approch',
                      'evaluation/cap-approach',
                      'evaluation/cap-comps-map',
                      'evaluation/multi-family-comps',
                      'evaluation/rent-roll',
                      'evaluation/multi-family-approach',
                    ].some((path) => urlParts.path.includes(path))
                      ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]'
                      : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'
                  }`}
                >
                  <Link
                    className={`w-full h-full flex justify-center items-center relative no-underline ${
                      [
                        'evaluation/income-approch',
                        'evaluation/cap-approach',
                        'evaluation/rent-roll',
                        'evaluation/cap-comps-map',
                        'evaluation/multi-family-comps',
                        'evaluation/multi-family-approach',
                      ].some((path) => urlParts.path.includes(path))
                        ? 'text-[white]'
                        : 'text-[#95989A]'
                    }`}
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();

                      const incomeId = filteredData?.[0]?.id;
                      if (incomeId) {
                        handleSidebarIdChange(incomeId);
                        return navigate(
                          `/evaluation/income-approch?id=${id}&IncomeId=${incomeId}`,
                          { state: { from: incomeApprochName } }
                        );
                      }

                      const capId = filtereCapdData?.[0]?.id;
                      if (capId) {
                        handleSidebarIdChange(capId);
                        return navigate(
                          `/evaluation/cap-approach?id=${id}&capId=${capId}`
                        );
                      }

                      const multiId = filtereMultiFamilydData?.[0]?.id;
                      if (multiId) {
                        handleSidebarIdChange(multiId);
                        return navigate(
                          `/evaluation/rent-roll?id=${id}&evaluationId=${multiId}`
                        );
                      }

                      navigate(
                        `/evaluation/rent-roll?id=${id}&evaluationId=${IncomeApprochRentRollIndex}`
                      );
                    }}
                    state={{ from: incomeApprochName }}
                  >
                    <span
                      className="h-full flex items-center"
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center',
                        padding: '5px 10px',
                      }}
                    >
                      Income Approach
                    </span>
                    <Icons.ArrowDropDownIcon />
                  </Link>

                  <div className="appraisal-menu-hover left-[-11px] absolute top-[58px] opacity-100 bg-white w-full z-50">
                    {updateDatas &&
                      (() => {
                        // First, create a map to maintain original order
                        const groupedIncomeMap = new Map<string, any[]>();
                        const nameOrder: string[] = [];

                        updateDatas.forEach((item: any) => {
                          if (!groupedIncomeMap.has(item.name)) {
                            groupedIncomeMap.set(item.name, []);
                            nameOrder.push(item.name);
                          }

                          const items = groupedIncomeMap.get(item.name)!;

                          if (item.has_income_approach)
                            items.push({
                              ...item,
                              type: 'income',
                            });
                          if (item.has_cap_approach)
                            items.push({ ...item, type: 'cap' });
                          if (item.has_rent_roll_approach)
                            items.push({
                              ...item,
                              type: 'rentroll',
                            });
                          if (item.has_multi_family_approach)
                            items.push({ ...item, type: 'multi' });
                        });

                        // Convert to array maintaining original order
                        const groupedIncomeData = nameOrder.map(name => [
                          name,
                          groupedIncomeMap.get(name)!
                        ]) as [string, any[]][];

                        // const totalIncomeItems = groupedIncomeData.reduce(
                        //   (acc, [, items]) => acc + items.length,
                        //   0
                        // );

                        return groupedIncomeData.map(
                          ([scenarioName, items]) => (
                            <div key={scenarioName} className="capitalize mb-2">
                              {/* ✅ Show scenario name only if there's more than one item */}
                              {updateDatas.length > 1 && (
                                <div className="px-3 py-2 font-semibold text-black bg-gray-100 cursor-default">
                                  {scenarioName}
                                </div>
                              )}

                              {items.map((item) => {
                                const scenarioId = item.id;

                                switch (item.type) {
                                  case 'income':
                                    return (
                                      <Link
                                        key={`income-${scenarioId}`}
                                        className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                          location.pathname.includes(
                                            '/evaluation/income-approch'
                                          ) &&
                                          location.search.includes(
                                            `IncomeId=${scenarioId}`
                                          )
                                            ? 'active-li-class'
                                            : 'text-customBlue'
                                        }`}
                                        to={`/evaluation/income-approch?id=${id}&IncomeId=${scenarioId}`}
                                        onClick={() =>
                                          handleSidebarIdChange(scenarioId)
                                        }
                                      >
                                        Income Approach
                                      </Link>
                                    );

                                  case 'cap':
                                    return (
                                      <React.Fragment key={`cap-${scenarioId}`}>
                                        <Link
                                          className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                            location.pathname.includes(
                                              '/evaluation/cap-approach'
                                            ) &&
                                            location.search.includes(
                                              `capId=${scenarioId}`
                                            )
                                              ? 'active-li-class'
                                              : 'text-customBlue'
                                          }`}
                                          to={`/evaluation/cap-approach?id=${id}&capId=${scenarioId}`}
                                          onClick={() =>
                                            handleSidebarIdChange(scenarioId)
                                          }
                                        >
                                          Cap Rate
                                        </Link>
                                        <Link
                                          className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                            location.pathname.includes(
                                              '/evaluation/cap-comps-map'
                                            ) &&
                                            location.search.includes(
                                              `capId=${scenarioId}`
                                            )
                                              ? 'active-li-class'
                                              : 'text-customBlue'
                                          }`}
                                          to={`/evaluation/cap-comps-map?id=${id}&capId=${scenarioId}`}
                                        >
                                          Cap Rate Comps Map
                                        </Link>
                                      </React.Fragment>
                                    );

                                  case 'rentroll':
                                    return (
                                      <Link
                                        key={`rentroll-${scenarioId}`}
                                        className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                          location.pathname.includes(
                                            '/evaluation/rent-roll'
                                          ) &&
                                          location.search.includes(
                                            `evaluationId=${scenarioId}`
                                          )
                                            ? 'active-li-class'
                                            : 'text-customBlue'
                                        }`}
                                        to={`/evaluation/rent-roll?id=${id}&evaluationId=${scenarioId}`}
                                        onClick={() =>
                                          handleSidebarIdChange(scenarioId)
                                        }
                                      >
                                        Rent Roll
                                      </Link>
                                    );

                                  case 'multi':
                                    return (
                                      <React.Fragment
                                        key={`multi-${scenarioId}`}
                                      >
                                        <Link
                                          className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                            location.pathname.includes(
                                              '/evaluation/multi-family-approach'
                                            ) &&
                                            location.search.includes(
                                              `evaluationId=${scenarioId}`
                                            )
                                              ? 'active-li-class'
                                              : 'text-customBlue'
                                          }`}
                                          to={`/evaluation/multi-family-approach?id=${id}&evaluationId=${scenarioId}`}
                                          onClick={() =>
                                            handleSidebarIdChange(scenarioId)
                                          }
                                        >
                                          MultiFamily
                                        </Link>
                                        <Link
                                          className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                            location.pathname.includes(
                                              '/evaluation/multi-family-comps-map'
                                            ) &&
                                            location.search.includes(
                                              `evaluationId=${scenarioId}`
                                            )
                                              ? 'active-li-class'
                                              : 'text-customBlue'
                                          }`}
                                          to={`/evaluation/multi-family-comps-map?id=${id}&evaluationId=${scenarioId}`}
                                        >
                                          Multi Family Comps Map
                                        </Link>
                                      </React.Fragment>
                                    );

                                  default:
                                    return null;
                                }
                              })}
                            </div>
                          )
                        );
                      })()}
                  </div>
                </div>
              </div>
            )}

            {hasSaleType && (
              <div className="flex-1">
                <div
                  className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 
                    ${
                      urlParts.path.includes('evaluation/sales-approach') ||
                      urlParts.path.includes('evaluation/sales-comps-map')
                        ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]'
                        : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'
                    }`}
                >
                  <Link
                    className={`w-full h-full flex justify-center items-center no-underline relative 
                      ${
                        urlParts.path.includes('evaluation/sales-approach') ||
                        urlParts.path.includes('evaluation/sales-comps-map')
                          ? 'text-[white]'
                          : 'text-[#95989A]'
                      }`}
                    to={`/evaluation/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.removeItem('checkType');
                      localStorage.removeItem('approachType');
                      localStorage.setItem(
                        'selectedSalesId',
                        filtereSalesdData?.[0]?.id
                      );

                      handleSidebarIdChange(filtereSalesdData?.[0]?.id);

                      if (reviewData) {
                        const matchedData = reviewData.find(
                          (item: any) =>
                            item.id === Number(filtereSalesdData?.[0]?.id)
                        );
                        if (matchedData) {
                          sessionStorage.setItem(
                            'salesApproachData',
                            JSON.stringify(matchedData)
                          );
                        }
                      }

                      setTimeout(() => {
                        navigate(
                          `/evaluation/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`
                        );
                      }, 100);
                    }}
                  >
                    <span
                      className="h-full flex items-center"
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center',
                        padding: '5px 10px',
                      }}
                    >
                      Sales Approach
                    </span>
                    <Icons.ArrowDropDownIcon />
                  </Link>

                  {/* 🔽 Hover Menu with Scenario Name Grouping */}
                  <div className="appraisal-menu-hover left-[-11px] absolute top-[58px] opacity-100 bg-white w-full z-50">
                    {filtereSalesdData?.length > 0 &&
                      filtereSalesdData.map((elem, index) => (
                        <div key={index} className="capitalize">
                          {/* Show Scenario Name only if there's more than one item */}
                          {filtereSalesdData.length > 1 && (
                            <div className="px-3 py-2 font-semibold text-black bg-gray-100 cursor-default">
                              {elem.name}
                            </div>
                          )}

                          {/* Sales Approach */}
                          <Link
                            className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                              activeLink ===
                              `evaluation/sales-approach-${elem.id}`
                                ? 'active-li-class'
                                : 'text-customBlue'
                            }`}
                            to={`/evaluation/sales-approach${id ? `?id=${id}&salesId=${elem.id}` : `?salesId=${elem.id}`}`}
                            state={{ from: elem.id }}
                            onClick={(e) => {
                              e.preventDefault();
                              localStorage.setItem('selectedSalesId', elem.id);
                              handleSidebarIdChange(elem.id);
                              if (reviewData) {
                                const matchedData = reviewData.find(
                                  (item: any) => item.id === Number(elem.id)
                                );
                                if (matchedData) {
                                  sessionStorage.setItem(
                                    'salesApproachData',
                                    JSON.stringify(matchedData)
                                  );
                                }
                              }
                              setTimeout(() => {
                                navigate(
                                  `/evaluation/sales-approach${id ? `?id=${id}&salesId=${elem.id}` : `?salesId=${elem.id}`}`
                                );
                                setActiveLink(
                                  `evaluation/sales-approach-${elem.id}`
                                );
                              }, 100);
                            }}
                          >
                            Sales Approach
                          </Link>

                          {/* Sales Comps Map */}
                          {id && (
                            <Link
                              className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${
                                activeLink ===
                                `evaluation/sales-comps-map-${elem.id}`
                                  ? 'active-li-class'
                                  : 'text-customBlue'
                              }`}
                              to={`/evaluation/sales-comps-map?id=${id}&salesId=${elem.id}`}
                              onClick={() =>
                                setActiveLink(
                                  `evaluation/sales-comps-map-${elem.id}`
                                )
                              }
                            >
                              Sales Comps Map
                            </Link>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {hasLeaseType && (
              <div className="flex-1">
                <div
                  className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 
        ${
          urlParts.path.includes('evaluation/lease-approach') ||
          urlParts.path.includes('lease-comps-map')
            ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]'
            : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'
        }`}
                >
                  <Link
                    className={`w-full h-full flex justify-center items-center no-underline relative ${
                      urlParts?.path?.includes('evaluation/lease-approach') ||
                      urlParts?.path?.includes('lease-comps-map')
                        ? 'text-[white]'
                        : 'text-[#95989A]'
                    }`}
                    to={`/evaluation/lease-approach?id=${id}${
                      filterLeasedData?.[0]?.id
                        ? `&leaseId=${filterLeasedData[0].id}`
                        : ''
                    }`}
                    onClick={() => {
                      localStorage.removeItem('checkType');
                      localStorage.setItem('approachType', 'leaseCheck');
                    }}
                  >
                    <span
                      className="h-full flex items-center"
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center',
                        padding: '5px 10px',
                      }}
                    >
                      Lease Approach
                    </span>
                    <Icons.ArrowDropDownIcon />
                  </Link>

                  <div className="appraisal-menu-hover left-[-11px] absolute top-[58px] opacity-100 bg-white w-full z-50">
                    {updateDatas &&
                      (() => {
                        // First, create a map to maintain original order
                        const groupedLeaseMap = new Map<string, any[]>();
                        const nameOrder: string[] = [];

                        updateDatas.forEach((item: any) => {
                          if (item.has_lease_approach) {
                            if (!groupedLeaseMap.has(item.name)) {
                              groupedLeaseMap.set(item.name, []);
                              nameOrder.push(item.name);
                            }
                            groupedLeaseMap.get(item.name)!.push(item);
                          }
                        });

                        // Convert to array maintaining original order
                        const groupedLeaseData = nameOrder.map(name => [
                          name,
                          groupedLeaseMap.get(name)!
                        ]) as [string, any[]][];

                        const totalLeaseItems = groupedLeaseData.reduce(
                          (acc, [, items]) => acc + items.length,
                          0
                        );

                        return groupedLeaseData.map(([scenarioName, items]) => (
                          <div key={scenarioName} className="capitalize mb-2">
                            {/* Show scenario name only if more than one item */}
                            {totalLeaseItems > 1 && (
                              <div className="px-3 py-2 font-semibold text-black bg-gray-100 cursor-default">
                                {scenarioName}
                              </div>
                            )}

                            {items.map((elem) => (
                              <div key={elem.id}>
                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                    location.pathname.includes(
                                      'lease-approach'
                                    ) &&
                                    location.search.includes(
                                      `leaseId=${elem.id}`
                                    )
                                      ? 'active-li-class'
                                      : 'text-customBlue'
                                  }`}
                                  to={`/evaluation/lease-approach?id=${id}&leaseId=${elem.id}`}
                                  state={{ from: elem.id }}
                                  onClick={() =>
                                    setActiveLink(
                                      `evaluation/lease-approach-${elem.id}`
                                    )
                                  }
                                >
                                  Lease Approach
                                </Link>

                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                    location.pathname.includes(
                                      'lease-comps-map'
                                    ) &&
                                    location.search.includes(
                                      `leaseId=${elem.id}`
                                    )
                                      ? 'active-li-class'
                                      : 'text-customBlue'
                                  }`}
                                  to={`/evaluation/lease-comps-map?id=${id}&leaseId=${elem.id}`}
                                  style={{
                                    pointerEvents: id ? 'auto' : 'none',
                                    cursor: id ? 'pointer' : 'default',
                                  }}
                                  onClick={() =>
                                    setActiveLink(
                                      `evaluation/lease-comps-map-${elem.id}`
                                    )
                                  }
                                >
                                  Lease Comps Map
                                </Link>
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                  </div>
                </div>
              </div>
            )}

            {hasCostType && (
              <div className="flex-1">
                <div
                  className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${
                    urlParts.path.includes('cost')
                      ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]'
                      : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'
                  }`}
                >
                  <Link
                    className={`w-full h-full flex justify-center items-center no-underline relative ${
                      urlParts.path.includes('cost')
                        ? 'text-[white]'
                        : 'text-[#95989A]'
                    }`}
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const firstId = filtereCostdData?.[0]?.id;
                      if (!firstId) return;

                      localStorage.removeItem('checkType');
                      localStorage.removeItem('approachType');
                      localStorage.setItem('selectedCostId', firstId);
                      localStorage.setItem('costId', firstId);

                      const matchedData = reviewData?.find(
                        (item: any) => Number(item.id) === Number(firstId)
                      );

                      if (matchedData) {
                        setSideBarData(matchedData);
                        sessionStorage.setItem(
                          'costApproachData',
                          JSON.stringify(matchedData)
                        );
                      }

                      handleSidebarIdChange(firstId);
                      setTimeout(() => {
                        navigate(
                          `/evaluation/cost-approach?id=${id}&costId=${firstId}`
                        );
                      }, 100);
                    }}
                  >
                    <span
                      className="h-full flex items-center"
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center',
                        padding: '5px 10px',
                      }}
                    >
                      Cost Approach
                    </span>
                    <Icons.ArrowDropDownIcon />
                  </Link>

                  <div className="appraisal-menu-hover left-[-11px] absolute top-[58px] opacity-100 bg-white w-full z-50">
                    {updateDatas &&
                      (() => {
                        // First, create a map to maintain original order
                        const groupedCostMap = new Map<string, any[]>();
                        const nameOrder: string[] = [];

                        updateDatas.forEach((item: any) => {
                          if (item.has_cost_approach) {
                            if (!groupedCostMap.has(item.name)) {
                              groupedCostMap.set(item.name, []);
                              nameOrder.push(item.name);
                            }
                            groupedCostMap.get(item.name)!.push(item);
                          }
                        });

                        // Convert to array maintaining original order
                        const groupedCostData = nameOrder.map(name => [
                          name,
                          groupedCostMap.get(name)!
                        ]) as [string, any[]][];

                        const totalCostItems = groupedCostData.reduce(
                          (acc, [, items]) => acc + items.length,
                          0
                        );

                        return groupedCostData.map(([scenarioName, items]) => (
                          <div key={scenarioName} className="capitalize mb-2">
                            {/* ✅ Show scenario name only if more than one item */}
                            {totalCostItems > 1 && (
                              <div className="px-3 py-2 font-semibold text-black bg-gray-100 cursor-default">
                                {scenarioName}
                              </div>
                            )}

                            {items.map((elem) => (
                              <div key={elem.id}>
                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                    activeLink ===
                                    `evaluation/cost-approach-${elem.id}`
                                      ? 'active-li-class'
                                      : 'text-customBlue'
                                  }`}
                                  to={`/evaluation/cost-approach?id=${id}&costId=${elem.id}`}
                                  state={{ from: elem.id }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    localStorage.setItem(
                                      'selectedCostId',
                                      elem.id
                                    );
                                    localStorage.setItem('costId', elem.id);

                                    const matchedData = reviewData?.find(
                                      (item: any) =>
                                        Number(item.id) === Number(elem.id)
                                    );

                                    if (matchedData) {
                                      setSideBarData(matchedData);
                                      sessionStorage.setItem(
                                        'costApproachData',
                                        JSON.stringify(matchedData)
                                      );
                                    }

                                    setTimeout(() => {
                                      navigate(
                                        `/evaluation/cost-approach?id=${id}&costId=${elem.id}`
                                      );
                                      setActiveLink(
                                        `evaluation/cost-approach-${elem.id}`
                                      );
                                    }, 100);

                                    handleSidebarIdChange(elem.id);
                                  }}
                                >
                                  Cost Approach
                                </Link>

                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                    location.pathname.includes(
                                      'cost-comps-map'
                                    ) &&
                                    location.search.includes(
                                      `costId=${elem.id}`
                                    )
                                      ? 'active-li-class'
                                      : 'text-customBlue'
                                  }`}
                                  to={`/evaluation/cost-comps-map?id=${id}&costId=${elem.id}`}
                                  style={{
                                    pointerEvents: id ? 'auto' : 'none',
                                    cursor: id ? 'pointer' : 'default',
                                  }}
                                  onClick={() =>
                                    setActiveLink(
                                      `evaluation/cost-comps-map-${elem.id}`
                                    )
                                  }
                                >
                                  Cost Comps Map
                                </Link>

                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                    location.pathname.includes(
                                      'cost-approach-improvement'
                                    ) &&
                                    location.search.includes(
                                      `costId=${elem.id}`
                                    )
                                      ? 'active-li-class'
                                      : 'text-customBlue'
                                  }`}
                                  to={`/evaluation/cost-approach-improvement?id=${id}&costId=${elem.id}`}
                                  style={{
                                    pointerEvents: id ? 'auto' : 'none',
                                    cursor: id ? 'pointer' : 'default',
                                  }}
                                  onClick={() =>
                                    setActiveLink(
                                      `evaluation/cost-approach-improvement-${elem.id}`
                                    )
                                  }
                                >
                                  Cost Improvement
                                </Link>
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                  </div>
                </div>
              </div>
            )}

            <div
              className={`flex-1 flex justify-center items-center relative !border-t-0 ${urlParts.path.includes('evaluation-exhibits') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
            >
              <Link
                className={`w-full h-full flex justify-center items-center no-underline relative ${urlParts.path.includes('evaluation-exhibits') ? 'text-[white]' : 'text-[#95989A]'}`}
                to={`/evaluation-exhibits?id=${id}`}
                style={{
                  pointerEvents: id ? 'auto' : 'none',
                  cursor: id ? 'pointer' : 'default',
                }}
                onClick={(e) => {
                  if (!id) {
                    e.preventDefault();
                  }
                }}
              >
                <span
                  className="h-full flex items-center"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    textAlign: 'center',
                    padding: '5px 10px',
                  }}
                >
                  Exhibits
                </span>
              </Link>
            </div>

            <div
              className={`flex-1 flex justify-center items-center relative !border-t-0 ${urlParts.path.includes('evaluation/review') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : ''}`}
            >
              <Link
                className={`w-full h-full flex justify-center items-center no-underline relative ${urlParts.path.includes('evaluation/review') ? 'text-[white]' : 'text-[#95989A]'}`}
                to={`/evaluation/review?id=${id}`}
                style={{
                  pointerEvents: id ? 'auto' : 'none',
                  cursor: id ? 'pointer' : 'default',
                }}
                onClick={(e) => {
                  if (!id) {
                    e.preventDefault();
                  }
                }}
              >
                <span
                  className="h-full flex items-center"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    textAlign: 'center',
                    padding: '5px 10px',
                  }}
                >
                  Review
                </span>
              </Link>
            </div>
            <div
              style={{
                height: '58px',
              }}
            ></div>
          </div>
          {children}
        </div>
        {shouldShowSidebar && (
          <div className="approach-sidebar bg-[#d3d7d7] lg:min-w-[18%] min-w-[150px] py-4 px-3">
            <div className="approach-sidebar-container flex flex-col gap-8 sticky top-[116px]">
              {evaluationIncomeId && (
                <div className="single-approach text-center">
                  <h3 className="mb-1 text-xl font-medium uppercase">Income</h3>
                  <div
                    className="numbers income-approach-sidebar hide"
                    data-hide-cents="true"
                  >
                    <p className="font-bold text-lg break-words text-[#0DA1C7]">
                      <i className="currency-label"></i>
                      <span id="income-approach-total-lg" className="text-xl">
                        $
                        {indicatedCapRate !== undefined &&
                        indicatedCapRate !== null
                          ? Math.trunc(indicatedCapRate).toLocaleString('en-US')
                          : sideBarData?.evaluation_income_approach
                                ?.indicated_range_annual !== undefined &&
                              sideBarData?.evaluation_income_approach
                                ?.indicated_range_annual !== null
                            ? Math.trunc(
                                sideBarData.evaluation_income_approach
                                  .indicated_range_annual
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>{' '}
                      <span
                        id="income-approach-percentage"
                        className="tooltipped weight text-gray-500"
                      >
                        <span id="income-approach-weight" className="text-base">
                          {updateEvalWeight
                            ? parseFloat(updateEvalWeight.toFixed(2)).toString()
                            : parseFloat(incomePercentage.toFixed(2)).toString()}
                        </span>
                        %{' '}
                        <Icons.EditIcon
                          className="cursor-pointer text-base"
                          onClick={() => handleEdit('Income Approach Weight')}
                        />
                      </span>
                    </p>
                    <p className="blend text-xs text-[#0DA1C7] font-medium">
                      <span className="hide "></span>$
                      <span id="income-approach-psf">
                        {(() => {
                          if (data?.data?.data?.comparison_basis === 'Unit') {
                            console.log('Rendering UNIT condition');
                            if (
                              !data?.data?.data?.total_units ||
                              data?.data?.data?.total_units === 0
                            ) {
                              return indicatedSfAnnualRate !== undefined &&
                                indicatedSfAnnualRate !== null
                                ? Math.trunc(
                                    indicatedSfAnnualRate
                                  ).toLocaleString('en-US')
                                : '0';
                            }
                            return indicatedCapRate !== undefined &&
                              indicatedCapRate !== null
                              ? Math.trunc(
                                  indicatedCapRate /
                                    data?.data?.data?.total_units
                                ).toLocaleString('en-US')
                              : sideBarData?.evaluation_income_approach
                                    ?.indicated_psf_annual !== undefined &&
                                  sideBarData?.evaluation_income_approach
                                    ?.indicated_psf_annual !== null
                                ? Math.trunc(
                                    sideBarData.evaluation_income_approach
                                      .indicated_psf_annual
                                  ).toLocaleString('en-US')
                                : '0';
                          } else if (
                            data?.data?.data?.comparison_basis === 'Bed'
                          ) {
                            console.log(
                              'Rendering BED condition',
                              indicatedCapRate
                            );
                            return indicatedCapRate !== undefined &&
                              indicatedCapRate !== null
                              ? Math.trunc(
                                  indicatedCapRate /
                                    data?.data?.data?.total_beds
                                ).toLocaleString('en-US')
                              : sideBarData?.evaluation_income_approach
                                    ?.indicated_psf_annual !== undefined &&
                                  sideBarData?.evaluation_income_approach
                                    ?.indicated_psf_annual !== null
                                ? Math.trunc(
                                    sideBarData.evaluation_income_approach
                                      .indicated_range_annual /
                                      data?.data?.data?.total_beds
                                  ).toLocaleString('en-US')
                                : '0';
                          } else {
                            return indicatedSfAnnualRate !== undefined &&
                              indicatedSfAnnualRate !== null
                              ? Math.trunc(
                                  indicatedSfAnnualRate
                                ).toLocaleString('en-US')
                              : sideBarData?.evaluation_income_approach
                                    ?.indicated_psf_annual !== undefined &&
                                  sideBarData?.evaluation_income_approach
                                    ?.indicated_psf_annual !== null
                                ? Math.trunc(
                                    sideBarData.evaluation_income_approach
                                      .indicated_psf_annual
                                  ).toLocaleString('en-US')
                                : '0';
                          }
                        })()}
                      </span>
                      /
                      {compType === 'land_only'
                        ? analysisType === '$/Acre'
                          ? 'AC'
                          : 'SF'
                        : comparisonBasis === 'SF'
                          ? 'SF'
                          : comparisonBasis === 'Unit'
                            ? 'Unit'
                            : comparisonBasis === 'Bed'
                              ? 'Bed'
                              : 'SF'}
                    </p>
                  </div>
                </div>
              )}

              {evaluationSalesId && (
                <div className="single-approach text-center">
                  <h3 className="mb-1 text-xl font-medium uppercase">Sales</h3>
                  <div
                    className="numbers income-approach-sidebar hide"
                    data-hide-cents="true"
                  >
                    {/* {console.log('finalllldataaaaa', finalResults, sideBarData)} */}
                    <p className="font-bold text-lg break-words text-[#0DA1C7]">
                      <i className="currency-label"></i>
                      <span id="income-approach-total-lg" className="text-xl">
                        $
                        {finalResults !== undefined && finalResults !== null
                          ? Math.trunc(finalResults).toLocaleString('en-US')
                          : sideBarData?.evaluation_sales_approach
                                ?.sales_approach_value !== undefined &&
                              sideBarData?.evaluation_sales_approach
                                ?.sales_approach_value !== null
                            ? Math.trunc(
                                sideBarData.evaluation_sales_approach
                                  .sales_approach_value
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>{' '}
                      <span
                        id="income-approach-percentage"
                        className="tooltipped weight text-gray-500"
                      >
                        {/* <span id="income-approach-weight" className="text-base">
                          {updateEvalWeightSales
                            ? `${Math.round(updateEvalWeightSales)}`
                            : `${Math.round(salesPercentage)}`}
                        </span> */}
                        <span id="income-approach-weight" className="text-base">
                          {updateEvalWeightSales
                            ? parseFloat(updateEvalWeightSales.toFixed(2)).toString()
                            : parseFloat(salesPercentage.toFixed(2)).toString()}
                        </span>
                        %{' '}
                        <Icons.EditIcon
                          className="cursor-pointer text-base"
                          onClick={() => setShowModalSales(true)}
                        />
                      </span>
                    </p>
                    <p className="blend text-xs text-[#0DA1C7] font-medium">
                      <span className="hide "></span>$
                      <span id="income-approach-psf">
                        {totalaveragedadjustedpsfSales !== undefined &&
                        totalaveragedadjustedpsfSales !== null
                          ? Math.trunc(
                              totalaveragedadjustedpsfSales
                            ).toLocaleString('en-US')
                          : sideBarData?.evaluation_sales_approach
                                ?.averaged_adjusted_psf !== undefined &&
                              sideBarData?.evaluation_sales_approach
                                ?.averaged_adjusted_psf !== null
                            ? Math.trunc(
                                sideBarData.evaluation_sales_approach
                                  .averaged_adjusted_psf
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>
                      /
                      {compType === 'land_only'
                        ? analysisType === '$/Acre'
                          ? 'AC'
                          : 'SF'
                        : comparisonBasis === 'SF'
                          ? 'SF'
                          : comparisonBasis === 'Unit'
                            ? 'Unit'
                            : comparisonBasis === 'Bed'
                              ? 'Bed'
                              : 'SF'}
                    </p>
                  </div>
                </div>
              )}

              {evaluationCostId && (
                <div className="single-approach text-center">
                  <h3 className="mb-1 text-xl font-medium uppercase">Cost</h3>
                  <div
                    className="numbers income-approach-sidebar hide"
                    data-hide-cents="true"
                  >
                    <p className="font-bold text-lg break-words text-[#0DA1C7]">
                      <i className="currency-label"></i>
                      <span id="income-approach-total-lg" className="text-xl">
                        $
                        {finalResultCost !== undefined &&
                        finalResultCost !== null &&
                        finalResultCost !== 0
                          ? Math.trunc(finalResultCost).toLocaleString('en-US')
                          : sideBarData?.evaluation_cost_approach
                                ?.total_cost_valuation !== undefined &&
                              sideBarData?.evaluation_cost_approach
                                ?.total_cost_valuation !== null
                            ? Math.trunc(
                                sideBarData.evaluation_cost_approach
                                  .total_cost_valuation
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>{' '}
                      <span
                        id="income-approach-percentage"
                        className="tooltipped weight text-gray-500"
                      >
                        {/* <span id="income-approach-weight" className="text-base">
                          {updateEvalWeightCost
                            ? `${Math.round(updateEvalWeightCost)}`
                            : `${Math.round(costPercentage)}`}
                        </span> */}
                        <span id="income-approach-weight" className="text-base">
                          {updateEvalWeightCost
                            ? parseFloat(updateEvalWeightCost.toFixed(2)).toString()
                            : parseFloat(costPercentage.toFixed(2)).toString()}
                        </span>
                        %{' '}
                        <Icons.EditIcon
                          className="cursor-pointer text-base"
                          onClick={() => setShowModalCost(true)}
                        />
                      </span>
                    </p>
                    <p className="text-xs text-[#0DA1C7] font-medium">
                      <span className="hide">
                        <i className="currency-label"></i>
                        {/* <span id="income-approach-incremental-value">
                          $
                          {totalSqCost !== undefined &&
                          totalSqCost !== null &&
                          !isNaN(totalSqCost)
                            ? Math.trunc(totalSqCost).toLocaleString('en-US')
                            : sideBarData?.evaluation_cost_approach
                                  ?.indicated_value_psf !== undefined &&
                                sideBarData?.evaluation_cost_approach
                                  ?.indicated_value_psf !== null &&
                                !isNaN(
                                  sideBarData.evaluation_cost_approach
                                    .indicated_value_psf
                                )
                              ? Math.trunc(
                                  sideBarData.evaluation_cost_approach
                                    .indicated_value_psf
                                ).toLocaleString('en-US')
                              : '0'}
                        </span>{' '} */}
                        <span id="income-approach-incremental-value">
                          $
                          {(() => {
                            const comparisonBasis =
                              data?.data?.data?.comparison_basis;
                            const costApproach =
                              sideBarData?.evaluation_cost_approach;
                            const totalBeds = data?.data?.data?.total_beds;
                            const totalUnits = data?.data?.data?.total_units;
                            console.log('costApproach', totalUnits);
                            if (
                              comparisonBasis === 'Bed' &&
                              costApproach?.total_cost_valuation &&
                              totalBeds
                            ) {
                              return Math.trunc(
                                costApproach.total_cost_valuation / totalBeds
                              ).toLocaleString('en-US');
                            }

                            if (
                              comparisonBasis === 'Unit' &&
                              costApproach?.total_cost_valuation &&
                              totalUnits
                            ) {
                              return Math.trunc(
                                costApproach.total_cost_valuation / totalUnits
                              ).toLocaleString('en-US');
                            }

                            if (
                              totalSqCost !== undefined &&
                              totalSqCost !== null &&
                              !isNaN(totalSqCost)
                            ) {
                              return Math.trunc(totalSqCost).toLocaleString(
                                'en-US'
                              );
                            }

                            if (
                              costApproach?.indicated_value_psf !== undefined &&
                              costApproach?.indicated_value_psf !== null &&
                              !isNaN(costApproach.indicated_value_psf)
                            ) {
                              return Math.trunc(
                                costApproach.indicated_value_psf
                              ).toLocaleString('en-US');
                            }

                            return '0';
                          })()}
                        </span>
                      </span>
                      /
                      {compType === 'land_only'
                        ? analysisType === '$/Acre'
                          ? 'AC'
                          : 'SF'
                        : comparisonBasis === 'SF'
                          ? 'SF'
                          : comparisonBasis === 'Unit'
                            ? 'Unit'
                            : comparisonBasis === 'Bed'
                              ? 'Bed'
                              : 'SF'}
                    </p>
                  </div>
                </div>
              )}

              <div className="approach-weighted-total text-center">
                <span className="mb-1 text-xl font-medium uppercase">
                  Weighted Total
                </span>
                <div className="font-bold text-lg break-words text-[#0DA1C7]">
                  <span className="weighted-total">
                    <i className="currency-label"></i>
                    <span id="weighted-value" className="text-xl">
                      $
                      {totalWeighted !== undefined &&
                      totalWeighted !== null &&
                      !isNaN(totalWeighted)
                        ? Math.trunc(totalWeighted).toLocaleString('en-US')
                        : '0'}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-[#0DA1C7] font-medium">
                  $
                  <span id="total-weight-psf">
                    {totalSF !== undefined &&
                    totalSF !== null &&
                    !isNaN(totalSF)
                      ? Math.trunc(totalSF).toLocaleString('en-US')
                      : '0'}
                  </span>
                  /
                  {compType === 'land_only'
                    ? analysisType === '$/Acre'
                      ? 'AC'
                      : 'SF'
                    : comparisonBasis === 'SF'
                      ? 'SF'
                      : comparisonBasis === 'Unit'
                        ? 'Unit'
                        : comparisonBasis === 'Bed'
                          ? 'Bed'
                          : 'SF'}
                </p>
              </div>

              <div className="approach-buttons text-center flex gap-1 justify-center">
                <button
                  onClick={onBackClick}
                  className="cursor-pointer text-white border-0 py-2.5 px-4 uppercase rounded-sm min-h-[36px] bg-[#a9a7a7]"
                >
                  <Icons.ArrowBackIcon className="text-base" />
                </button>
                <button
                  onClick={onNextClick}
                  className="cursor-pointer bg-[#0DA1C7] font-medium text-white border-0 py-2.5 px-4 uppercase rounded-sm min-h-[36px] flex items-center gap-1"
                >
                  Next
                  <Icons.ArrowForwardIcon className="text-base" />
                </button>
                {showScrollTop && (
                  <Button
                    id="backToTopMenuOptions"
                    color="primary"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
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
            </div>
          </div>
        )}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-md w-[90%] max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">{showHeader}</h2>
              <input
                type="text"
                value={
                  initialIncomePercentage === ''
                    ? ''
                    : `${initialIncomePercentage}%`
                }
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full border p-2 rounded mb-4"
                placeholder="Enter new weight (%)"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white border-0 py-2.5 px-4 uppercase rounded-sm min-h-[36px]  bg-[#a9a7a7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(evaluationIncomeId)}
                  className="bg-[#0DA1C7] font-medium text-white border-0 py-2.5 px-4 uppercase rounded-sm min-h-[36px] flex items-center gap-1 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {showModalSales && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-md w-[90%] max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">Sales Approach Weight</h2>
              <input
                type="text"
                value={
                  initialSalesPercentage === ''
                    ? ''
                    : `${initialSalesPercentage}%`
                }
                // value={initialIncomePercentage}
                onChange={handleChangeSales}
                onKeyDown={handleSalesKeyDown}
                className="w-full border p-2 rounded mb-4"
                placeholder="Enter new weight (%)"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModalSales(false)}
                  className="text-white border-0 py-2.5 px-4 uppercase rounded-sm min-h-[36px]  bg-[#a9a7a7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSales(evaluationSalesId)}
                  className="bg-[#0DA1C7] font-medium text-white border-0 py-2.5 px-4 uppercase rounded-sm min-h-[36px] flex items-center gap-1 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {showModalCost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-md w-[90%] max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">Cost Approach Weight</h2>
              <input
                type="text"
                value={
                  initialCostPercentage === ''
                    ? ''
                    : `${initialCostPercentage}%`
                }
                // value={initialIncomePercentage}
                onChange={handleChangeCost}
                onKeyDown={handleCostKeyDown}
                className="w-full border p-2 rounded mb-4"
                placeholder="Enter new weight (%)"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModalCost(false)}
                  className="text-white border-0 py-2.5 px-4 uppercase rounded-sm min-h-[36px]  bg-[#a9a7a7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveCost(evaluationCostId)}
                  className="bg-[#0DA1C7] font-medium text-white border-0 py-2.5 px-4 uppercase rounded-sm min-h-[36px] flex items-center gap-1 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default EvaluationMenuOptions;

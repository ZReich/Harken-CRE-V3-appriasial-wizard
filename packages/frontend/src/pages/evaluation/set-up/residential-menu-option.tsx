import { Icons } from '@/components/icons';
import React, { useEffect, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
// import projectAvatar from '../../../images/projectavatar.png';
import { RequestType } from '@/hook';
import { useGet } from '@/hook/useGet';
import { useMutate } from '@/hook/useMutate';
import axios from 'axios';
import { Button, Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  ApproachGuidancePanel,
  ApproachGuidanceToggle,
  ApproachType,
} from '@/components/approach-guidance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LandscapeIcon from '@mui/icons-material/Landscape';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BuildIcon from '@mui/icons-material/Build';

const ResidentialMenuOptions = ({
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
  totalCostValuation,
  onTotalWeightedChange,
}: any) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const totalSqCost = totalCostValuation / totalaveragedadjustedpsfCost;
 
  // const id = searchParams.get('id');
  // useEffect(() => {
  //   // Store values by approach type instead of overwriting
  //   if (finalResults !== undefined) {
  //     localStorage.setItem('finalResults_sales', JSON.stringify(finalResults));
  //   }

  //   if (indicatedCapRate !== undefined) {
  //     localStorage.setItem(
  //       'indicatedCapRate_income',
  //       JSON.stringify(indicatedCapRate)
  //     );
  //   }

  //   if (indicatedSfAnnualRate !== undefined) {
  //     localStorage.setItem(
  //       'indicatedSfAnnualRate_income',
  //       JSON.stringify(indicatedSfAnnualRate)
  //     );
  //   }

  //   if (finalResultCost !== undefined) {
  //     localStorage.setItem(
  //       'finalResultCost_cost',
  //       JSON.stringify(finalResultCost)
  //     );
  //   }

  //   // Retrieve values by approach type
  //   const storedSalesResults = localStorage.getItem('finalResults_sales');
  //   const storedIncomeCapRate = localStorage.getItem('indicatedCapRate_income');
  //   const storedIncomeSfRate = localStorage.getItem(
  //     'indicatedSfAnnualRate_income'
  //   );

  //   console.log('finalResultCost', finalResults);
  //   const storedCostResult = localStorage.getItem('finalResultCost_cost');

  //   setStoredFinalResults(
  //     storedSalesResults ? JSON.parse(storedSalesResults) : 0
  //   );
  //   setStoredIndicatedCapRate(
  //     storedIncomeCapRate ? JSON.parse(storedIncomeCapRate) : 0
  //   );
  //   setStoredIndicatedSfAnnualRate(
  //     storedIncomeSfRate ? JSON.parse(storedIncomeSfRate) : 0
  //   );
  //   setStoredFinalResultCost(
  //     storedCostResult ? JSON.parse(storedCostResult) : 0
  //   );
  // }, [finalResults, indicatedCapRate, indicatedSfAnnualRate, finalResultCost]);
  const pathMatch =
    location.pathname === '/residential/evaluation/income-approch' ||
    location.pathname === '/residential/sales-app/roach' ||
    location.pathname === '/residential/evaluation/cost-approach';
  location.pathname === '/residential/evaluation/cost-approach-improvement';

  const id = searchParams.get('id'); // ✅ Keep only this one
  const incomeId = searchParams.get('IncomeId');
  const salesId = searchParams.get('salesId');
  const costId = searchParams.get('costId');
  const navigate = useNavigate();
  // const INCOME_ID = searchParams.get('IncomeId');
  const [hasIncomeType, setHasIncomeType] = React.useState(false);
  const [comparisonBasis, setComparisionBasis] = React.useState<any>('');
  const [sideBarId, setSideBarId] = React.useState<any>(null);
  const [sideBarData, setSideBarData] = React.useState<any>(null);

  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [hasCapType, setHasCapType] = React.useState(false);
  const [hasmultiFamilyType, setHasMultiFamilyType] = React.useState(false);
  console.log(hasCapType, hasmultiFamilyType);
  const [hasCostType, setHasCostType] = React.useState(false);
  const [hasLeaseType, setHasLeaseType] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showModalSales, setShowModalSales] = React.useState(false);
  const [showModalCost, setShowModalCost] = React.useState(false);
  const [showHeader, setShowHeader] = React.useState('');
  const [, setLoading] = React.useState(true);
  const [initialIncomePercentage, setInitialIncomePercentage] =
    React.useState<any>(0);
  const [initialSalesPercentage, setInitialSalesPercentage] =
    React.useState<any>(0);
  const [initialCostPercentage, setInitialCostPercentage] =
    React.useState<any>(0);
  const [updateEvalWeight, setUpdateEvalWeight] = React.useState<any>(0);
  const [updateEvalWeightSales, setUpdateEvalWeightSales] =
    React.useState<any>(0);
  const [updateEvalWeightCost, setUpdateEvalWeightCost] =
    React.useState<any>(0);
  const [reviewData, setReviewData] = React.useState<any>(null);
  // const [
  //   indicatedAnnualRangeforWeightage,
  //   // setIndicatedAnnualRangeforWeightage,
  // ] = React.useState(
  //   localStorage.getItem('indicatedAnnualRangeforWeightage1') || '0'
  // );
  // const indicatedAnnualRangeforWeightage:any=localStorage.getItem('indicatedAnnualRangeforWeightage1')
  const [activeLink, setActiveLink] = useState('');

  // const indicatedAnnualRangeforWeightage = localStorage.getItem(
  //   'indicatedAnnualRangeforWeightage1'
  // );
  // const indicatedAnnualRangeforWeightage1 = Number(
  //   parseFloat(indicatedAnnualRangeforWeightage || '0')
  // );

  // const salesValueForWeightage1 = localStorage.getItem(
  //   'salesValuePerUnitForWeightage'
  // );
  // const salesValueForWeightage = Number(
  //   parseFloat(salesValueForWeightage1 || '0')
  // );
  // const costTotalLandValueforWeightage1 = localStorage.getItem(
  //   'costValuePerUnitForWeightage1'
  // );
  // const costTotalLandValueforWeightage = Number(
  //   parseFloat(costTotalLandValueforWeightage1 || '0')
  // );
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isGuidancePanelVisible, setIsGuidancePanelVisible] = useState(true);
  const [guidanceMode, setGuidanceMode] = useState<'guidance' | 'values'>('guidance');

  // Determine current approach type for guidance panel
  const getCurrentApproachType = (): ApproachType | null => {
    if (location.pathname.includes('sales-approach') || location.pathname.includes('sales-comps')) {
      return 'sales';
    }
    if (location.pathname.includes('income-approch') || location.pathname.includes('rent-roll')) {
      return 'income';
    }
    if (location.pathname.includes('cost-approach') || location.pathname.includes('cost-comps')) {
      return 'cost';
    }
    return null;
  };

  const currentApproachType = getCurrentApproachType();
  const showGuidancePanel = currentApproachType !== null;
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchReviewData = async () => {
    // Guard clause: skip API call if ID is missing
    if (!id) {
      console.warn('ID is null or undefined. Skipping fetch.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`/res-evaluations/get-review/${id}`);
      setComparisionBasis(response.data?.data?.data?.comparison_basis);
      const scenarios = response.data?.data?.data?.res_evaluation_scenarios;
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

      const storedData = sessionStorage.getItem('costImprovementData');
      console.log(storedData);
      if (
        window.location.pathname.includes('cost-approach-improvement') &&
        costFromUrl &&
        scenarios
      ) {
        const matchedData = scenarios.find(
          (item: any) => item.id === Number(costFromUrl)
        );
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
  // const fetchReviewData = async () => {
  //   try {
  //     const response = await axios.get(`/res-evaluations/get-review/${id}`);
  //     setComparisionBasis(response.data?.data?.data?.comparison_basis);
  //     const scenarios = response.data?.data?.data?.scenarios;
  //     setReviewData(scenarios);

  //     // If sideBarId exists, find the matching data
  //     if (sideBarId && scenarios) {
  //       const matchedData = scenarios.find(
  //         (item) => item.id === Number(sideBarId)
  //       );
  //       console.log('matchedData (from fetch)', matchedData);
  //       setSideBarData(matchedData);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching review data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  useEffect(() => {
    fetchReviewData();
  }, [id, sideBarId]);
  const ReviewData = reviewData?.filter(
    (ele: any) =>
      ele.id === Number(incomeId) || Number(salesId) || Number(costId)
  );
  const incomeEvalWeight =
    !ReviewData ||
    ReviewData.length === 0 ||
    ReviewData[0].res_evaluation_income_approach === null
      ? 0
      : ReviewData[0].res_evaluation_income_approach?.eval_weight || 0;
  const incomeEvalWeightPercentage = incomeEvalWeight * 100;
  const salesEvalWeight =
    !ReviewData ||
    ReviewData.length === 0 ||
    ReviewData[0].res_evaluation_sales_approach === null
      ? 0
      : ReviewData[0].res_evaluation_sales_approach?.eval_weight || 0;
  const salesEvalWeightPercentage = salesEvalWeight * 100;
  const costEvalWeight =
    !ReviewData ||
    ReviewData.length === 0 ||
    ReviewData[0].res_evaluation_cost_approach === null
      ? 0
      : ReviewData[0].res_evaluation_cost_approach?.eval_weight || 0;
  const costEvalWeightPercentage = costEvalWeight * 100;
  useEffect(() => {
    if (
      incomeEvalWeightPercentage !== undefined &&
      incomeEvalWeightPercentage !== null
    ) {
      localStorage.setItem(
        'initialIncomePercentage1',
        incomeEvalWeightPercentage.toString()
      );
      setInitialIncomePercentage(
        `${
          Number.isInteger(incomeEvalWeightPercentage)
            ? incomeEvalWeightPercentage
            : incomeEvalWeightPercentage.toFixed(2)
        }`
      );
    }

    if (
      salesEvalWeightPercentage !== undefined &&
      salesEvalWeightPercentage !== null
    ) {
      setInitialSalesPercentage(
        `${
          Number.isInteger(salesEvalWeightPercentage)
            ? salesEvalWeightPercentage
            : salesEvalWeightPercentage.toFixed(2)
        }`
      );
      localStorage.setItem(
        'initialSalesPercentage1',
        salesEvalWeightPercentage.toString()
      );
    }

    if (
      costEvalWeightPercentage !== undefined &&
      costEvalWeightPercentage !== null
    ) {
      setInitialCostPercentage(
        `${
          Number.isInteger(costEvalWeightPercentage)
            ? costEvalWeightPercentage
            : costEvalWeightPercentage.toFixed(2)
        }`
      );
      localStorage.setItem(
        'initialCostPercentage1',
        costEvalWeightPercentage.toString()
      );
    }
  }, [
    incomeEvalWeightPercentage,
    salesEvalWeightPercentage,
    costEvalWeightPercentage,
  ]);

  const incomePercentage = Number(
    parseFloat(localStorage.getItem('initialIncomePercentage1') || '0')
  );
  console.log(incomePercentage, 'incomePercentageincomePercentage');
  const salesPercentage = Number(
    parseFloat(localStorage.getItem('initialSalesPercentage1') || '0')
  );
  const costPercentage = Number(
    parseFloat(localStorage.getItem('initialCostPercentage1') || '0')
  );
  // const indicatedPsfAnnual =
  //   ReviewData &&
  //   ReviewData[0]?.res_evaluation_income_approach?.indicated_psf_annual;
  // const averagedAdjustedPsfSales =
  //   ReviewData &&
  //   ReviewData[0]?.res_evaluation_sales_approach?.averaged_adjusted_psf;
  // const averagedAdjustedPsfCost =
  //   ReviewData &&
  //   ReviewData[0]?.res_evaluation_cost_approach?.averaged_adjusted_psf;

  // const incomeData =
  //   !ReviewData ||
  //   ReviewData.length === 0 ||
  //   ReviewData[0].res_evaluation_income_approach === null
  //     ? 0
  //     : ReviewData[0].res_evaluation_income_approach?.incremental_value || 0;
  // const salesData =
  //   !ReviewData ||
  //   ReviewData.length === 0 ||
  //   ReviewData[0].res_evaluation_sales_approach === null
  //     ? 0
  //     : ReviewData[0].res_evaluation_sales_approach?.incremental_value || 0;
  // const costData =
  //   !ReviewData ||
  //   ReviewData.length === 0 ||
  //   ReviewData[0].res_evaluation_cost_approach === null
  //     ? 0
  //     : ReviewData[0].res_evaluation_cost_approach?.incremental_value || 0;

  // const incomeDataValue =
  //   indicatedAnnualRangeforWeightage === null
  //     ? incomeData * (updateEvalWeight && updateEvalWeight / 100) ||
  //       incomeData * (incomePercentage / 100)
  //     : indicatedAnnualRangeforWeightage1 * (updateEvalWeight / 100) ||
  //       indicatedAnnualRangeforWeightage1 * (incomePercentage / 100);
  // const salesDataValue =
  //   salesValueForWeightage1 === null
  //     ? salesData * (updateEvalWeightSales / 100) ||
  //       salesData * (salesPercentage / 100)
  //     : salesValueForWeightage * (updateEvalWeightSales / 100) ||
  //       salesValueForWeightage * (salesPercentage / 100);
  // const costDataValue =
  //   costTotalLandValueforWeightage1 === null
  //     ? costData * (updateEvalWeightCost / 100) ||
  //       costData * (costPercentage / 100)
  //     : costTotalLandValueforWeightage * (updateEvalWeightCost / 100) ||
  //       costTotalLandValueforWeightage * (costPercentage / 100);
  // const totalWeighted = incomeDataValue + costDataValue + salesDataValue;
  const incomeDataValue =
    indicatedCapRate !== undefined && indicatedCapRate !== null
      ? indicatedCapRate * (updateEvalWeight && updateEvalWeight / 100) ||
        indicatedCapRate *
          ((sideBarData?.res_evaluation_income_approach?.eval_weight * 100) /
            100)
      : // (updateEvalWeight && updateEvalWeight !== null
        //   ? updateEvalWeight / 100
        //   : incomePercentage / 100)
        sideBarData?.res_evaluation_income_approach?.indicated_range_annual
        ? sideBarData.res_evaluation_income_approach.indicated_range_annual *
            (updateEvalWeight && updateEvalWeight / 100) ||
          sideBarData?.res_evaluation_income_approach?.indicated_range_annual *
            ((sideBarData?.res_evaluation_income_approach?.eval_weight * 100) /
              100)
        : // (updateEvalWeight !== undefined && updateEvalWeight !== null
          //   ? updateEvalWeight / 100
          //   : sideBarData.res_evaluation_income_approach.eval_weight ||
          //     incomePercentage / 100)
          0;

  const salesDataValue =
    finalResults !== undefined && finalResults !== null
      ? finalResults * (updateEvalWeightSales && updateEvalWeightSales / 100) ||
        finalResults *
          ((sideBarData?.res_evaluation_sales_approach?.eval_weight * 100) /
            100)
      : sideBarData?.res_evaluation_sales_approach?.sales_approach_value
        ? sideBarData.res_evaluation_sales_approach?.sales_approach_value *
            (updateEvalWeightSales && updateEvalWeightSales / 100) ||
          (sideBarData?.res_evaluation_sales_approach?.sales_approach_value *
            (sideBarData?.res_evaluation_sales_approach?.eval_weight * 100)) /
            100
        : 0;

  const costDataValue =
    finalResultCost !== undefined && finalResultCost !== null
      ? finalResultCost *
          (updateEvalWeightCost && updateEvalWeightCost / 100) ||
        finalResultCost *
          ((sideBarData?.res_evaluation_cost_approach?.eval_weight * 100) / 100)
      : sideBarData?.res_evaluation_cost_approach?.total_cost_valuation
        ? sideBarData.res_evaluation_cost_approach.total_cost_valuation *
            (updateEvalWeightCost && updateEvalWeightCost / 100) ||
          (sideBarData?.res_evaluation_cost_approach?.total_cost_valuation *
            (sideBarData?.res_evaluation_cost_approach?.eval_weight * 100)) /
            100
        : 0;

  // const totalaveragedadjustedpsfSalesValue =
  //   totalaveragedadjustedpsfSales !== undefined &&
  //   totalaveragedadjustedpsfSales !== null
  //     ? totalaveragedadjustedpsfSales *
  //         (updateEvalWeightSales && updateEvalWeightSales / 100) ||
  //       totalaveragedadjustedpsfSales *
  //         ((sideBarData?.res_evaluation_sales_approach?.eval_weight * 100) /
  //           100)
  //     : sideBarData?.res_evaluation_sales_approach?.indicated_value_psf !==
  //           undefined &&
  //         sideBarData?.res_evaluation_sales_approach?.indicated_value_psf !==
  //           null
  //       ? sideBarData.res_evaluation_sales_approach.indicated_value_psf *
  //           (updateEvalWeightSales && updateEvalWeightSales / 100) ||
  //         (sideBarData.res_evaluation_sales_approach.indicated_value_psf *
  //           (sideBarData?.res_evaluation_sales_approach?.eval_weight * 100)) /
  //           100
  //       : 0;
  // const totalaveragedadjustedpsfCostValue =
  //   totalaveragedadjustedpsfCost !== undefined &&
  //   totalaveragedadjustedpsfCost !== null
  //     ? totalaveragedadjustedpsfCost *
  //         (updateEvalWeightCost && updateEvalWeightCost / 100) ||
  //       totalaveragedadjustedpsfCost *
  //         ((sideBarData?.res_evaluation_cost_approach?.eval_weight * 100) / 100)
  //     : sideBarData?.res_evaluation_cost_approach?.indicated_value_psf !==
  //           undefined &&
  //         sideBarData?.res_evaluation_cost_approach?.indicated_value_psf !==
  //           null
  //       ? sideBarData.res_evaluation_cost_approach.indicated_value_psf *
  //           (updateEvalWeightCost && updateEvalWeightCost / 100) ||
  //         (sideBarData.res_evaluation_cost_approach.indicated_value_psf *
  //           (sideBarData?.res_evaluation_cost_approach?.eval_weight * 100)) /
  //           100
  //       : 0;
  // const indicatedSfAnnualRateValue =
  //   indicatedSfAnnualRate !== undefined && indicatedSfAnnualRate !== null
  //     ? indicatedSfAnnualRate * (updateEvalWeight && updateEvalWeight / 100) ||
  //       indicatedSfAnnualRate *
  //         ((sideBarData?.res_evaluation_income_approach?.eval_weight * 100) /
  //           100)
  //     : sideBarData?.res_evaluation_income_approach?.indicated_psf_annual !==
  //           undefined &&
  //         sideBarData?.res_evaluation_income_approach?.indicated_psf_annual !==
  //           null
  //       ? sideBarData.res_evaluation_income_approach.indicated_psf_annual *
  //           (updateEvalWeight && updateEvalWeight / 100) ||
  //         (sideBarData.res_evaluation_income_approach.indicated_psf_annual *
  //           (sideBarData?.res_evaluation_income_approach?.eval_weight * 100)) /
  //           100
  //       : 0;

  const totalWeighted = incomeDataValue + costDataValue + salesDataValue;
  React.useEffect(() => {
    if (onTotalWeightedChange && totalWeighted !== undefined) {
      onTotalWeightedChange(totalWeighted);
    }
  }, [totalWeighted, onTotalWeightedChange]);

  const handleLinkClick = (link: any) => {
    localStorage.removeItem('compsLenght');
    setActiveLink(link);
  };

  const url = new URL(window.location.href);
  const urlParts = {
    scheme: url.protocol.replace(':', ''),
    netloc: url.host,
    path: url.pathname,
  };
  console.log(urlParts.path, 'urlparts');
  const { data } = useGet<any>({
    queryKey: 'res-evaluations/get',
    cacheTime: 0,
    endPoint: `res-evaluations/get/${id}`,
    config: {
      enabled:
        !urlParts.path.includes('evaluation/residential-set-up') &&
        !urlParts.path.includes('appraisal-set-up'),
      refetchOnWindowFocus: false,
    },
  });
  const totalSF = totalWeighted / data?.data?.data?.building_size || 0;
  console.log('checkataa', totalWeighted, data?.data?.data?.building_size);
  // totalaveragedadjustedpsfSalesValue +
  // totalaveragedadjustedpsfCostValue +
  // indicatedSfAnnualRateValue;
  console.log(data, 'residentialData');
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
    queryKey: 'res-evaluations/update-position',
    endPoint: `res-evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });
  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      if (
        id &&
        !urlParts.path.includes('evaluation/residential-set-up') &&
        !urlParts.path.includes('evaluation-set-up')
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

      // Console log the street address
      console.log('Street Address:', address);
    }
  }, [data]);

  const updateDatas = data?.data?.data?.res_evaluation_scenarios;
  const matchedScenario = updateDatas?.filter(
    (item: { id: any }) =>
      item.id === Number(incomeId) || Number(salesId) || Number(costId)
  );
  const evaluationIncomeId =
    matchedScenario?.length > 0
      ? matchedScenario[0]?.res_evaluation_income_approach?.id
      : null;
  const evaluationSalesId =
    matchedScenario?.length > 0
      ? matchedScenario[0]?.res_evaluation_sales_approach?.id
      : null;
  const evaluationCostId =
    matchedScenario?.length > 0
      ? matchedScenario[0]?.res_evaluation_cost_approach?.id
      : null;
  const passAerialInfoMap = data?.data?.data;

  const incomeApprochId = updateDatas && updateDatas[0] && updateDatas[0].id;
  localStorage.setItem('incomeId', incomeApprochId);
  const incomeApprochName =
    updateDatas && updateDatas[0] && updateDatas[0].name;

  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filteredRentRollData] = useState<{ id: any; name: React.ReactNode }[]>(
    []
  );
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
    const scenarios = data?.data?.data?.res_evaluation_scenarios;

    if (scenarios && Array.isArray(scenarios)) {
      const sales = scenarios.filter((item) => item.has_sales_approach === 1);
      const income = scenarios.filter((item) => item.has_income_approach === 1);
      const lease = scenarios.filter((item) => item.has_lease_approach === 1);
      const cap = scenarios.filter((item) => item.has_cap_approach === 1);
      const multiFamily = scenarios.filter(
        (item) => item.has_multi_family_approach === 1
      );
      const cost = scenarios.filter((item) => item.has_cost_approach === 1);

      setHasSaleType(sales.length > 0);
      setHasIncomeType(
        income.length > 0 || cap.length > 0 || multiFamily.length > 0
      );
      setHasLeaseType(lease.length > 0);
      setHasCapType(cap.length > 0);
      setHasMultiFamilyType(multiFamily.length > 0);
      setHasCostType(cost.length > 0);

      setFilteredSalesData(sales.map(({ id, name }) => ({ id, name })));
      setFilteredData(income.map(({ id, name }) => ({ id, name })));
      setFilteredLeaseData(lease.map(({ id, name }) => ({ id, name })));
      setFilteredCapData(cap.map(({ id, name }) => ({ id, name })));
      setFilteredMultiFamilyData(
        multiFamily.map(({ id, name }) => ({ id, name }))
      );
      setFilteredCostsData(cost.map(({ id, name }) => ({ id, name })));
    }
  }, [data?.data?.data?.res_evaluation_scenarios]);

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

  // const IncomeApprochRentRollIndex = filteredRentRollData[0]?.id;

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Directly find the matching rent-roll item
    const matchingRentRoll = filteredRentRollData.find(
      (elem) =>
        currentPath === `/evaluation/rent-roll?id=${id}&appraisalId=${elem.id}`
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
      '/residential/sales-approach': 'salesId',
      '/evaluation/lease-approach': 'leaseId',
      '/residential/evaluation/cost-approach': 'costId',
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
      if (location.pathname === '/residential/sales-approach') {
        localStorage.setItem('approachType', 'salesCheck');
      }
      if (location.pathname === '/residential/evaluation/cost-approach') {
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

    if (currentPath.includes('residential-overview')) {
      setActiveLink('residential-overview');
    } else if (currentPath.includes('residential/evaluation/images')) {
      setActiveLink('residential/evaluation/images');
    } else if (currentPath.includes('residential/evalution-photo-sheet')) {
      setActiveLink('residential/evalution-photo-sheet');
    } else if (
      currentPath.includes('residential/evaluation-property-boundaries')
    ) {
      setActiveLink('residential/evaluation-property-boundaries');
    } else if (currentPath.includes('residential/evaluation-aerialmap')) {
      setActiveLink('residential/evaluation-aerialmap');
    } else if (currentPath.includes('residential/evaluation-area-info')) {
      setActiveLink('residential/evaluation-area-info');
    } else if (currentPath.includes('residential/evaluation-photo-sheet')) {
      setActiveLink('residential/evaluation-photo-sheet');
    }

    // Rent-roll check
    const matchingRentRoll = filteredRentRollData.find(
      (elem) =>
        currentPath === `/evaluation/rent-roll?id=${id}&appraisalId=${elem.id}`
    );

    if (matchingRentRoll) {
      setActiveLink(matchingRentRoll.id);
    }

    // **Income-Approach check (Fix)**
    filteredData.forEach((elem: any) => {
      const incomeApproachPath = `/residential/evaluation/income-approch?id=${id}&IncomeId=${elem.id}`;
      if (currentPath === incomeApproachPath) {
        setActiveLink(`residential/evaluation/income-approch-${elem.id}`);
      }
    });

    // Sales-Approach check
    filtereSalesdData.forEach((elem) => {
      const salesApproachPath = `/residential/sales-approach?id=${id}&salesId=${elem.id}`;
      const salesCompsMapPath = `/residential/evaluation/sales-comps-map?id=${id}&salesId=${elem.id}`;
      if (currentPath === salesApproachPath) {
        localStorage.removeItem('checkType');
        setActiveLink(`residential/sales-approach-${elem.id}`);
      } else if (currentPath === salesCompsMapPath) {
        setActiveLink(`residential/evaluation/sales-comps-map-${elem.id}`);
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
      const multiFamilyApproachPath = `/evaluation/multi-family-approach?id=${id}&capId=${elem.id}`;
      const multiFamilyCompsMapPath = `/evaluation/multi-family-comps-map?id=${id}&capId=${elem.id}`;
      if (currentPath === multiFamilyApproachPath) {
        localStorage.removeItem('checkType');
        setActiveLink(`evaluation/multi-family-approach-${elem.id}`);
      } else if (currentPath === multiFamilyCompsMapPath) {
        setActiveLink(`evaluation/multi-family-comps-map-${elem.id}`);
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
      const costApproachPath = `/residential/evaluation/cost-approach?id=${id}&costId=${elem.id}`;
      const costCompsMapPath = `/residential/evaluation/cost-comps-map?id=${id}&costId=${elem.id}`;
      const costCompsMapImprovement = `/residential/evaluation/cost-approach-improvement?id=${id}&costId=${elem.id}`;
      if (currentPath === costApproachPath) {
        setActiveLink(`/residential/evaluation/cost-approach-${elem.id}`);
      } else if (currentPath === costCompsMapPath) {
        setActiveLink(`/residential/evaluation/cost-comps-map-${elem.id}`);
      } else if (currentPath === costCompsMapImprovement) {
        setActiveLink(
          `/residential/evaluation/cost-approach-improvement-${elem.id}`
        );
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
  const isSalesApproach = location.pathname === '/residential/sales-approach';
  const isCostApproach =
    location.pathname === '/residential/evaluation/cost-approach';
  const isCostImprovement =
    location.pathname === '/residential/evaluation/cost-approach-improvement';

  const shouldShowSidebar =
    (pathMatch && id && incomeId) ||
    (isSalesApproach && salesId) ||
    (isCostApproach && costId) ||
    (isCostImprovement && costId);
  // if (!shouldShowSidebar) return null;
  // const indicatedAnnualRangeforWeightage = Number(
  //   parseFloat(
  //     localStorage.getItem('indicatedAnnualRangeforWeightage') || '0'
  //   ).toFixed(2)
  // ).toLocaleString('en-US', {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // });

  // const costTotalLandValueforWeightage = Number(
  //   parseFloat(
  //     localStorage.getItem('costValuePerUnitForWeightage1') || '0'
  //   ).toFixed(2)
  // ).toLocaleString('en-US', {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // });

  // const indicatedPsfRangeforWeightage = Number(
  //   parseFloat(
  //     localStorage.getItem('indicatedPsfRangeforWeightage') || '0'
  //   ).toFixed(2)
  // ).toLocaleString('en-US', {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // });
  // const costValuePerSfforWeightage = Number(
  //   parseFloat(localStorage.getItem('costValuePerUnit') || '0').toFixed(2)
  // ).toLocaleString('en-US', {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // });

  // const salesValueForWeightage = Number(
  //   parseFloat(
  //     localStorage.getItem('salesValuePerUnitForWeightage1') || '0'
  //   ).toFixed(2)
  // ).toLocaleString('en-US', {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // });

  // const salesValuePerUnitForWeightage = Number(
  //   parseFloat(localStorage.getItem('salesValuePerUnit') || '0').toFixed(2)
  // ).toLocaleString('en-US', {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // });
  // const handleEdit = (item: string) => {
  //   setShowHeader(item);
  //   setShowModal(true);
  // };

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
        `/res-evaluations/save-weight-percent/${id}`,
        {
          approach_id: incomeId,
          approach_type: 'income',
          eval_weight: value,
        }
      );
      if (response.data.data.statusCode) {
        setUpdateEvalWeight(value);
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
        `/res-evaluations/save-weight-percent/${id}`,
        {
          approach_id: salesId,
          approach_type: 'sale',
          eval_weight: value,
        }
      );
      if (response.data.data.statusCode) {
        setUpdateEvalWeightSales(value);
        // setInitialSalesPercentage(value)
      }

      setShowModalSales(false);
    } catch (error) {
      console.error('Patch error:', error);
      // alert('Failed to save. Please try again.');
    }
  };
  // Add at the top of your component
  const [isUsingStoredData, setIsUsingStoredData] = useState(false);

  // Modify your useEffect that fetches data
  // Modify your useEffect that fetches data
  useEffect(() => {
    // First check for stored data in sessionStorage
    const storedData = sessionStorage.getItem('costApproachData');

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Use the stored data immediately
        setSideBarData(parsedData); // Changed from setYourDataState to setSideBarData
        setIsUsingStoredData(true);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }

    // Only fetch from API if we're not using stored data
    if (!isUsingStoredData) {
      // Your existing API fetch code here
      fetchReviewData();
    } else {
      // Reset the flag for next navigation
      setIsUsingStoredData(false);
    }
  }, [id, costId]);

  const handleSaveCost = async (costid: any) => {
    try {
      const value = parseFloat(initialCostPercentage);

      if (isNaN(value) || value > 100) {
        console.log('Please enter a valid percentage (0–100).');
        return;
      }
      const response = await axios.patch(
        `/res-evaluations/save-weight-percent/${id}`,
        {
          approach_id: costid,
          approach_type: 'cost',
          eval_weight: value,
        }
      );
      if (response.data.data.statusCode) {
        setUpdateEvalWeightCost(value);
        // setInitialCostPercentage(value)
      }

      setShowModalCost(false);
    } catch (error) {
      console.error('Patch error:', error);
      // alert('Failed to save. Please try again.');
    }
  };
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
              className={`${urlParts.path.includes('evaluation/residential-set-up') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg] flex-1' : 'flex-1 before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
            >
              <Link
                className={`w-full h-full flex justify-center items-center relative no-underline ${urlParts.path.includes('evaluation/residential-set-up') ? 'text-[white]' : 'text-[#95989A]'}`}
                to={
                  id
                    ? `/update-evaluation/residential-set-up?id=${id}`
                    : '/evaluation/residential-set-up'
                }
              >
                <div
                  className={`w-[100%] h-full flex justify-center items-center !border-t-0 text-[#95989A] ${urlParts.path.includes('evaluation/residential-set-up') ? '' : ''}`}
                >
                  <span
                    className={`h-full flex items-center ${urlParts.path.includes('evaluation/residential-set-up') ? 'text-[white]' : 'text-[#95989A]'} `}
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
                className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${urlParts.path.includes('residential-overview') || urlParts.path.includes('residential/evalution-image') || urlParts.path.includes('residential/evaluation-property-boundaries') || urlParts.path.includes('residential/evaluation-area-info') || urlParts.path.includes('residential/evaluation-aerialmap') || urlParts.path.includes('residential/evalution-photo-sheet') || urlParts.path.includes('residential/evaluation-photo-sheet') || urlParts.path.includes('residential/evaluation/images') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
                style={{
                  opacity: id ? 1 : 0.5,
                  pointerEvents: id ? 'auto' : 'none',
                }}
              >
                <Link
                  className={`w-full h-full flex justify-center items-center relative no-underline ${urlParts.path.includes('residential-overview') || urlParts.path.includes('residential/evalution-image') || urlParts.path.includes('residential/evaluation-property-boundaries') || urlParts.path.includes('residential/evaluation-aerialmap') || urlParts.path.includes('residential/evaluation-area-info') || urlParts.path.includes('residential/evalution-photo-sheet') || urlParts.path.includes('residential/evaluation-photo-sheet') || urlParts.path.includes('residential/evaluation/images') ? 'text-[white]' : 'text-[#95989A]'}`}
                  to={
                    id
                      ? `/residential-overview?id=${id}`
                      : '/residential-overview'
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
                      transform: 'skew(19deg)',
                      pointerEvents: id ? 'auto' : 'none',
                      opacity: id ? 1 : 0.5,
                    }}
                  />
                </Link>
                <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white min-w-[200px] z-50">
                  <ul className="text-customBlue list-none">
                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${urlParts.path.includes('residential-overview') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'residential-overview' ? 'active-li-class' : ''}`}
                        to={
                          id
                            ? `/residential-overview?id=${id}`
                            : '/residential-overview'
                        }
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            handleLinkClick('residential-overview');
                          }
                        }}
                      >
                        {' '}
                        Overview Page
                      </Link>
                    </li>

                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${urlParts.path.includes('residential/evaluation/images') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'residential/evaluation/images' ? 'active-li-class' : ''}`}
                        to={`/residential/evaluation/images?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            handleLinkClick('residential/evaluation/images');
                          }
                        }}
                      >
                        Images Page
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7]  ${urlParts.path.includes('residential/evaluation-photo-sheet') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'residential/evaluation-photo-sheet' ? 'active-li-class' : ''}`}
                        to={`/residential/evaluation-photo-sheet?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            handleLinkClick(
                              'residential/evaluation-photo-sheet'
                            );
                          }
                        }}
                      >
                        Photo Pages
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${urlParts.path.includes('residential/evaluation-property-boundaries') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'residential/evaluation-property-boundaries' ? 'active-li-class' : ''}`}
                        to={`/residential/evaluation-property-boundaries?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            handleLinkClick(
                              'residential/evaluation-property-boundaries'
                            );
                          }
                        }}
                      >
                        Map Boundary Page
                      </Link>
                    </li>
                    <li>
                      <Link
                        state={{ from: passAerialInfoMap }}
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${urlParts.path.includes('residential/evaluation-aerialmap') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'residential/evaluation-aerialmap' ? 'active-li-class' : ''}`}
                        to={`/residential/evaluation-aerialmap?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            setActiveLink('residential/evaluation-aerialmap');
                          }
                        }}
                      >
                        Aerial Map
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${urlParts.path.includes('residential/evaluation-area-info') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'residential/evaluation-area-info' ? 'active-li-class' : ''}`}
                        to={`/residential/evaluation-area-info?id=${id}`}
                        style={{
                          pointerEvents: id ? 'auto' : 'none',
                          cursor: id ? 'pointer' : 'default',
                        }}
                        state={{ from: passAerialInfoMap }}
                        onClick={(e) => {
                          if (!id) {
                            e.preventDefault();
                          } else {
                            setActiveLink('residential/evaluation-area-info');
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

            {hasIncomeType && (
              <div className="flex-1">
                <div
                  className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${
                    ['/residential/evaluation/income-approch'].some((path) =>
                      urlParts.path.includes(path)
                    )
                      ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]'
                      : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'
                  }`}
                >
                  <Link
                    className={`w-full h-full flex justify-center items-center relative no-underline ${
                      ['/residential/evaluation/income-approch'].some((path) =>
                        urlParts.path.includes(path)
                      )
                        ? 'text-[white]'
                        : 'text-[#95989A]'
                    }`}
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const newSidebarId = filteredData?.[0]?.id;
                      handleSidebarIdChange(newSidebarId);
                      setTimeout(() => {
                        navigate(
                          `/residential/evaluation/income-approch?id=${id}&IncomeId=${newSidebarId}`,
                          {
                            state: { from: incomeApprochName },
                          }
                        );
                      }, 100);
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

                  <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white min-w-[200px] z-50">
                    {filteredData &&
                      (() => {
                        // First, create a map to maintain original order
                        const groupedIncomeMap = new Map<string, any[]>();
                        const nameOrder: string[] = [];

                        filteredData.forEach((item: any) => {
                          if (!groupedIncomeMap.has(item.name)) {
                            groupedIncomeMap.set(item.name, []);
                            nameOrder.push(item.name);
                          }
                          groupedIncomeMap.get(item.name)!.push(item);
                        });

                        // Convert to array maintaining original order
                        const groupedIncomeData = nameOrder.map(name => [
                          name,
                          groupedIncomeMap.get(name)!
                        ]) as [string, any[]][];

                        return groupedIncomeData.map(([scenarioName, items]) => (
                        <div key={scenarioName} className="capitalize mb-2">
                          {/* ✅ Only show scenario name if more than one item in total */}
                          {filteredData.length > 1 && (
                            <div className="px-3 py-2 font-semibold text-black bg-gray-100 cursor-default">
                              {scenarioName}
                            </div>
                          )}

                          {items.map((elem) => (
                            <Link
                              key={elem.id}
                              className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                location.pathname.includes(
                                  '/residential/evaluation/income-approch'
                                ) &&
                                location.search.includes(`IncomeId=${elem.id}`)
                                  ? 'active-li-class'
                                  : 'text-customBlue'
                              }`}
                              to={`/residential/evaluation/income-approch?id=${id}&IncomeId=${elem.id}`}
                              state={{ from: elem.id }}
                              onClick={() => {
                                handleSidebarIdChange(elem.id);
                                setActiveLink(
                                  `/residential/evaluation/income-approch-${elem.id}`
                                );
                              }}
                            >
                              Income Approach
                              {/* optional: show name inline if needed */}
                              {/* {filteredData.length > 1 ? ` (${elem.name})` : ''} */}
                            </Link>
                          ))}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {hasSaleType && (
              <div className="flex-1">
                <div
                  className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${
                    urlParts.path.includes('residential/sales-approach') ||
                    urlParts.path.includes(
                      'residential/evaluation/sales-comps-map'
                    )
                      ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]'
                      : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'
                  }`}
                >
                  <Link
                    className={`w-full h-full flex justify-center items-center relative no-underline ${
                      urlParts.path.includes('residential/sales-approach') ||
                      urlParts.path.includes(
                        'residential/evaluation/sales-comps-map'
                      )
                        ? 'text-[white]'
                        : 'text-[#95989A]'
                    }`}
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.removeItem('checkType');
                      localStorage.removeItem('approachType');
                      const defaultId = filtereSalesdData?.[0]?.id;
                      localStorage.setItem('selectedSalesId', defaultId);
                      handleSidebarIdChange(defaultId);

                      const matchedData = reviewData?.find(
                        (item: any) => item.id === Number(defaultId)
                      );
                      if (matchedData) {
                        sessionStorage.setItem(
                          'salesApproachData',
                          JSON.stringify(matchedData)
                        );
                      }

                      setTimeout(() => {
                        navigate(
                          `/residential/sales-approach?id=${id}&salesId=${defaultId}`
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

                  <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white min-w-[200px] z-50">
                    {filtereSalesdData &&
                      (() => {
                        // First, create a map to maintain original order
                        const groupedSalesMap = new Map<string, any[]>();
                        const nameOrder: string[] = [];

                        filtereSalesdData.forEach((item: any) => {
                          if (!groupedSalesMap.has(item.name)) {
                            groupedSalesMap.set(item.name, []);
                            nameOrder.push(item.name);
                          }
                          groupedSalesMap.get(item.name)!.push(item);
                        });

                        // Convert to array maintaining original order
                        const groupedSalesData = nameOrder.map(name => [
                          name,
                          groupedSalesMap.get(name)!
                        ]) as [string, any[]][];

                        return groupedSalesData.map(([scenarioName, items]) => (
                        <div key={scenarioName} className="capitalize mb-2">
                          {/* ✅ Conditionally show scenario name only if multiple items */}
                          {filtereSalesdData.length > 1 && (
                            <div className="px-3 py-2 font-semibold text-black bg-gray-100 cursor-default">
                              {scenarioName}
                            </div>
                          )}

                          {items.map((elem) => (
                            <div key={elem.id}>
                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                  location.pathname.includes(
                                    'sales-approach'
                                  ) &&
                                  location.search.includes(`salesId=${elem.id}`)
                                    ? 'active-li-class'
                                    : 'text-customBlue'
                                }`}
                                to={`/residential/sales-approach?id=${id}&salesId=${elem.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  localStorage.setItem(
                                    'selectedSalesId',
                                    elem.id
                                  );
                                  handleSidebarIdChange(elem.id);

                                  const matchedData = reviewData?.find(
                                    (item: any) => item.id === Number(elem.id)
                                  );
                                  if (matchedData) {
                                    sessionStorage.setItem(
                                      'salesApproachData',
                                      JSON.stringify(matchedData)
                                    );
                                  }

                                  setTimeout(() => {
                                    navigate(
                                      `/residential/sales-approach?id=${id}&salesId=${elem.id}`
                                    );
                                  }, 100);
                                }}
                              >
                                Sales Approach
                              </Link>

                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                  location.pathname.includes(
                                    'sales-comps-map'
                                  ) &&
                                  location.search.includes(`salesId=${elem.id}`)
                                    ? 'active-li-class'
                                    : 'text-customBlue'
                                }`}
                                to={`/residential/evaluation/sales-comps-map?id=${id}&salesId=${elem.id}`}
                                onClick={() => {
                                  setActiveLink(
                                    `residential/evaluation/sales-comps-map-${elem.id}`
                                  );
                                }}
                              >
                                Sales Comps Map
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

            {hasLeaseType && (
              <div className="flex-1">
                <div
                  className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${
                    urlParts.path.includes('evaluation/lease-approach') ||
                    urlParts.path.includes('lease-comps-map')
                      ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]'
                      : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'
                  }`}
                >
                  <Link
                    className={`w-full h-full flex justify-center items-center relative no-underline ${
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

                  <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white min-w-[200px] z-50">
                    {filterLeasedData &&
                      (() => {
                        // First, create a map to maintain original order
                        const groupedLeaseMap = new Map<string, any[]>();
                        const nameOrder: string[] = [];

                        filterLeasedData.forEach((item: any) => {
                          if (!groupedLeaseMap.has(item.name)) {
                            groupedLeaseMap.set(item.name, []);
                            nameOrder.push(item.name);
                          }
                          groupedLeaseMap.get(item.name)!.push(item);
                        });

                        // Convert to array maintaining original order
                        const groupedLeaseData = nameOrder.map(name => [
                          name,
                          groupedLeaseMap.get(name)!
                        ]) as [string, any[]][];

                        return groupedLeaseData.map(([scenarioName, items]) => (
                        <div key={scenarioName} className="capitalize mb-2">
                          <div className="px-3 py-2 font-semibold text-black bg-gray-100 cursor-default">
                            {scenarioName}
                          </div>

                          {items.map((elem) => (
                            <div key={elem.id}>
                              {/* Lease Approach Link */}
                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                  location.pathname.includes(
                                    'lease-approach'
                                  ) &&
                                  location.search.includes(`leaseId=${elem.id}`)
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

                              {/* Lease Comps Map Link */}
                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                  location.pathname.includes(
                                    'lease-comps-map'
                                  ) &&
                                  location.search.includes(`leaseId=${elem.id}`)
                                    ? 'active-li-class'
                                    : 'text-customBlue'
                                }`}
                                to={`/evaluation/lease-comps-map?id=${id}&leaseId=${elem.id}`}
                                state={{ from: elem.id }}
                                onClick={() =>
                                  setActiveLink(
                                    `evaluation/lease-comps-map-${elem.id}`
                                  )
                                }
                                style={{
                                  pointerEvents: id ? 'auto' : 'none',
                                  cursor: id ? 'pointer' : 'default',
                                }}
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
                  className={`income-approach-wrapper relative w-full h-full flex justify-center items-center !border-t-0 ${
                    urlParts.path.includes('cost')
                      ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]'
                      : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'
                  }`}
                >
                  <Link
                    className={`w-full h-full flex justify-center items-center relative no-underline ${
                      urlParts.path.includes('cost')
                        ? 'text-[white]'
                        : 'text-[#95989A]'
                    }`}
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const defaultId = filtereCostdData?.[0]?.id;
                      localStorage.removeItem('checkType');
                      localStorage.removeItem('approachType');
                      localStorage.setItem('selectedCostId', defaultId);
                      localStorage.setItem('costId', defaultId);

                      const matched = reviewData?.find(
                        (item: any) => item.id === Number(defaultId)
                      );
                      if (matched) {
                        setSideBarData(matched);
                        sessionStorage.setItem(
                          'costApproachData',
                          JSON.stringify(matched)
                        );
                      }

                      handleSidebarIdChange(defaultId);
                      setTimeout(() => {
                        navigate(
                          `/residential/evaluation/cost-approach?id=${id}&costId=${defaultId}`
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

                  <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white min-w-[200px] z-50">
                    {filtereCostdData &&
                      (() => {
                        // First, create a map to maintain original order
                        const groupedCostMap = new Map<string, any[]>();
                        const nameOrder: string[] = [];

                        filtereCostdData.forEach((item: any) => {
                          if (!groupedCostMap.has(item.name)) {
                            groupedCostMap.set(item.name, []);
                            nameOrder.push(item.name);
                          }
                          groupedCostMap.get(item.name)!.push(item);
                        });

                        // Convert to array maintaining original order
                        const groupedCostData = nameOrder.map(name => [
                          name,
                          groupedCostMap.get(name)!
                        ]) as [string, any[]][];

                        return groupedCostData.map(([scenarioName, items]) => (
                        <div key={scenarioName} className="capitalize mb-2">
                          {/* ✅ Show scenario name only if there's more than one */}
                          {filtereCostdData.length > 1 && (
                            <div className="px-3 py-2 font-semibold text-black bg-gray-100 cursor-default">
                              {scenarioName}
                            </div>
                          )}

                          {items.map((elem) => (
                            <div key={elem.id}>
                              {/* Cost Approach */}
                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                  activeLink ===
                                  `/residential/evaluation/cost-approach-${elem.id}`
                                    ? 'active-li-class'
                                    : 'text-customBlue'
                                }`}
                                to={`/residential/evaluation/cost-approach?id=${id}&costId=${elem.id}`}
                                onClick={() => {
                                  localStorage.setItem(
                                    'selectedCostId',
                                    elem.id
                                  );
                                  localStorage.setItem('costId', elem.id);
                                  const matched = reviewData?.find(
                                    (item: any) => item.id === Number(elem.id)
                                  );
                                  if (matched) {
                                    setSideBarData(matched);
                                    sessionStorage.setItem(
                                      'costApproachData',
                                      JSON.stringify(matched)
                                    );
                                  }
                                  handleSidebarIdChange(elem.id);
                                  setActiveLink(
                                    `/residential/evaluation/cost-approach-${elem.id}`
                                  );
                                }}
                              >
                                Cost Approach
                              </Link>

                              {/* Cost Comps Map */}
                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                  location.pathname.includes(
                                    'cost-comps-map'
                                  ) &&
                                  location.search.includes(`costId=${elem.id}`)
                                    ? 'active-li-class'
                                    : 'text-customBlue'
                                }`}
                                to={`/residential/evaluation/cost-comps-map?id=${id}&costId=${elem.id}`}
                                onClick={() => {
                                  localStorage.setItem(
                                    'selectedCostId',
                                    elem.id
                                  );
                                  localStorage.setItem('costId', elem.id);
                                  const matched = reviewData?.find(
                                    (item: any) => item.id === Number(elem.id)
                                  );
                                  if (matched) setSideBarData(matched);
                                  handleSidebarIdChange(elem.id);
                                  setActiveLink(
                                    `/residential/evaluation/cost-comps-map-${elem.id}`
                                  );
                                }}
                              >
                                Cost Comps Map
                              </Link>

                              {/* Cost Improvement */}
                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                  location.pathname.includes(
                                    'cost-approach-improvement'
                                  ) &&
                                  location.search.includes(`costId=${elem.id}`)
                                    ? 'active-li-class'
                                    : 'text-customBlue'
                                }`}
                                to={`/residential/evaluation/cost-approach-improvement?id=${id}&costId=${elem.id}`}
                                onClick={() => {
                                  localStorage.setItem(
                                    'selectedCostId',
                                    elem.id
                                  );
                                  localStorage.setItem('costId', elem.id);
                                  const matched = reviewData?.find(
                                    (item: any) => item.id === Number(elem.id)
                                  );
                                  if (matched) {
                                    setSideBarData(matched);
                                    sessionStorage.setItem(
                                      'costImprovementData',
                                      JSON.stringify(matched)
                                    );
                                  }
                                  handleSidebarIdChange(elem.id);
                                  setActiveLink(
                                    `/residential/evaluation/cost-approach-improvement-${elem.id}`
                                  );
                                }}
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
              className={`flex-1 flex justify-center items-center relative !border-t-0 ${urlParts.path.includes('residential/evaluation-exhibits') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg] flex-1' : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
            >
              <Link
                className={`w-full h-full flex justify-center items-center relative no-underline ${urlParts.path.includes('residential/evaluation-exhibits') ? 'text-[white]' : 'text-[#95989A]'}`}
                to={`/residential/evaluation-exhibits?id=${id}`}
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
              className={`flex-1 flex justify-center items-center relative !border-t-0 ${urlParts.path.includes('residential/evaluation/review') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : ''}`}
            >
              <Link
                className={`w-full h-full flex justify-center items-center no-underline relative ${urlParts.path.includes('residential/evaluation/review') ? 'text-[white]' : 'text-[#95989A]'}`}
                to={`/residential/evaluation/review?id=${id}`}
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
          
          {/* Sub-header with Guidance/Values toggle for approach pages */}
          {showGuidancePanel && (
            <Box 
              className="bg-white border-b border-[#eee] border-solid shadow-sm"
              sx={{
                position: 'fixed',
                top: '58px',
                left: 0,
                right: 0,
                zIndex: 35,
              }}
            >
              <Box className="flex items-center justify-between px-6 py-3">
                {/* Left side - Approach Title */}
                <Box className="flex items-center gap-3">
                  <Typography variant="h5" className="font-bold text-[#2e2e2e]">
                    Valuation Analysis
                  </Typography>
                  <Box className="px-3 py-1 rounded-full text-xs font-medium bg-[#0DA1C7] bg-opacity-20 text-[#0DA1C7]">
                    In Progress
                  </Box>
                </Box>

                {/* Right side - Guidance/Values Toggle */}
                <ApproachGuidanceToggle
                  mode={guidanceMode}
                  onModeChange={(mode) => {
                    setGuidanceMode(mode);
                    if (!isGuidancePanelVisible) {
                      setIsGuidancePanelVisible(true);
                    }
                  }}
                  isVisible={isGuidancePanelVisible}
                  onTogglePanel={() => setIsGuidancePanelVisible(!isGuidancePanelVisible)}
                  showFullscreen={false}
                />
              </Box>
              <Box className="px-6 pb-2 text-xs text-gray-500">
                Phase 5 of 6 • Valuation Approaches
              </Box>
            </Box>
          )}
          
          {/* Spacer for fixed sub-header */}
          {showGuidancePanel && <Box sx={{ height: '102px' }} />}
          
          {/* Layout with Left Sidebar and Main Content */}
          {showGuidancePanel ? (
            <Box className="flex">
              {/* Left Sidebar - Approach Navigation */}
              {!isLeftSidebarCollapsed && (
                <Box
                  className="fixed left-0 bg-white border-r border-[#eee] border-solid overflow-y-auto z-30"
                  sx={{ 
                    width: 240, 
                    top: '160px',
                    bottom: 0,
                  }}
                >
                  <Box className="p-4">
                    <Typography variant="subtitle2" className="font-semibold text-[#2e2e2e] mb-1">
                      Valuation Analysis
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      {[hasSaleType, hasIncomeType, hasCostType].filter(Boolean).length} Approaches Selected
                    </Typography>
                  </Box>

                  <List className="pt-0">
                    {/* Highest & Best Use - Always show */}
                    <ListItem
                      component={Link}
                      to={`/residential/evaluation/highest-best-use?id=${id}`}
                      className={`py-3 px-4 transition-colors cursor-pointer no-underline ${
                        location.pathname.includes('highest-best-use')
                          ? 'bg-[#0DA1C7] bg-opacity-10 border-l-4 border-[#0DA1C7] border-solid border-t-0 border-r-0 border-b-0'
                          : 'hover:bg-gray-50 border-l-4 border-transparent border-solid border-t-0 border-r-0 border-b-0'
                      }`}
                    >
                      <ListItemIcon className={`min-w-[36px] ${location.pathname.includes('highest-best-use') ? 'text-[#0DA1C7]' : 'text-gray-500'}`}>
                        <TrendingUpIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Highest & Best Use"
                        primaryTypographyProps={{
                          className: `text-sm font-medium ${location.pathname.includes('highest-best-use') ? 'text-[#0DA1C7]' : 'text-gray-700'}`,
                        }}
                      />
                    </ListItem>

                    {/* Land Valuation */}
                    <ListItem
                      component={Link}
                      to={`/residential/evaluation/land-valuation?id=${id}`}
                      className={`py-3 px-4 transition-colors cursor-pointer no-underline ${
                        location.pathname.includes('land-valuation')
                          ? 'bg-[#0DA1C7] bg-opacity-10 border-l-4 border-[#0DA1C7] border-solid border-t-0 border-r-0 border-b-0'
                          : 'hover:bg-gray-50 border-l-4 border-transparent border-solid border-t-0 border-r-0 border-b-0'
                      }`}
                    >
                      <ListItemIcon className={`min-w-[36px] ${location.pathname.includes('land-valuation') ? 'text-[#0DA1C7]' : 'text-gray-500'}`}>
                        <LandscapeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Land Valuation"
                        primaryTypographyProps={{
                          className: `text-sm font-medium ${location.pathname.includes('land-valuation') ? 'text-[#0DA1C7]' : 'text-gray-700'}`,
                        }}
                      />
                    </ListItem>

                    {/* Market Analysis */}
                    <ListItem
                      component={Link}
                      to={`/residential/evaluation/market-analysis?id=${id}`}
                      className={`py-3 px-4 transition-colors cursor-pointer no-underline ${
                        location.pathname.includes('market-analysis')
                          ? 'bg-[#0DA1C7] bg-opacity-10 border-l-4 border-[#0DA1C7] border-solid border-t-0 border-r-0 border-b-0'
                          : 'hover:bg-gray-50 border-l-4 border-transparent border-solid border-t-0 border-r-0 border-b-0'
                      }`}
                    >
                      <ListItemIcon className={`min-w-[36px] ${location.pathname.includes('market-analysis') ? 'text-[#0DA1C7]' : 'text-gray-500'}`}>
                        <BarChartIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Market Analysis"
                        primaryTypographyProps={{
                          className: `text-sm font-medium ${location.pathname.includes('market-analysis') ? 'text-[#0DA1C7]' : 'text-gray-700'}`,
                        }}
                      />
                    </ListItem>

                    {/* Sales Comparison */}
                    {hasSaleType && filtereSalesdData?.[0]?.id && (
                      <ListItem
                        component={Link}
                        to={`/residential/evaluation/sales-approach?id=${id}&salesId=${filtereSalesdData[0].id}`}
                        className={`py-3 px-4 transition-colors cursor-pointer no-underline ${
                          location.pathname.includes('sales-approach') || location.pathname.includes('sales-comps')
                            ? 'bg-[#0DA1C7] bg-opacity-10 border-l-4 border-[#0DA1C7] border-solid border-t-0 border-r-0 border-b-0'
                            : 'hover:bg-gray-50 border-l-4 border-transparent border-solid border-t-0 border-r-0 border-b-0'
                        }`}
                      >
                        <ListItemIcon className={`min-w-[36px] ${location.pathname.includes('sales') ? 'text-[#0DA1C7]' : 'text-gray-500'}`}>
                          <CompareArrowsIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Sales Comparison"
                          primaryTypographyProps={{
                            className: `text-sm font-medium ${location.pathname.includes('sales') ? 'text-[#0DA1C7]' : 'text-gray-700'}`,
                          }}
                        />
                      </ListItem>
                    )}

                    {/* Income Approach */}
                    {hasIncomeType && filteredData?.[0]?.id && (
                      <ListItem
                        component={Link}
                        to={`/residential/evaluation/income-approch?id=${id}&IncomeId=${filteredData[0].id}`}
                        className={`py-3 px-4 transition-colors cursor-pointer no-underline ${
                          location.pathname.includes('income-approch') || location.pathname.includes('rent-roll')
                            ? 'bg-[#0DA1C7] bg-opacity-10 border-l-4 border-[#0DA1C7] border-solid border-t-0 border-r-0 border-b-0'
                            : 'hover:bg-gray-50 border-l-4 border-transparent border-solid border-t-0 border-r-0 border-b-0'
                        }`}
                      >
                        <ListItemIcon className={`min-w-[36px] ${location.pathname.includes('income') || location.pathname.includes('rent-roll') ? 'text-[#0DA1C7]' : 'text-gray-500'}`}>
                          <AccountBalanceIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Income Approach"
                          primaryTypographyProps={{
                            className: `text-sm font-medium ${location.pathname.includes('income') || location.pathname.includes('rent-roll') ? 'text-[#0DA1C7]' : 'text-gray-700'}`,
                          }}
                        />
                      </ListItem>
                    )}

                    {/* Cost Approach */}
                    {hasCostType && filtereCostdData?.[0]?.id && (
                      <ListItem
                        component={Link}
                        to={`/residential/evaluation/cost-approach?id=${id}&costId=${filtereCostdData[0].id}`}
                        className={`py-3 px-4 transition-colors cursor-pointer no-underline ${
                          location.pathname.includes('cost-approach') || location.pathname.includes('cost-comps')
                            ? 'bg-[#0DA1C7] bg-opacity-10 border-l-4 border-[#0DA1C7] border-solid border-t-0 border-r-0 border-b-0'
                            : 'hover:bg-gray-50 border-l-4 border-transparent border-solid border-t-0 border-r-0 border-b-0'
                        }`}
                      >
                        <ListItemIcon className={`min-w-[36px] ${location.pathname.includes('cost') ? 'text-[#0DA1C7]' : 'text-gray-500'}`}>
                          <BuildIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Cost Approach"
                          primaryTypographyProps={{
                            className: `text-sm font-medium ${location.pathname.includes('cost') ? 'text-[#0DA1C7]' : 'text-gray-700'}`,
                          }}
                        />
                      </ListItem>
                    )}
                  </List>

                  {/* Collapse button */}
                  <Box className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={() => setIsLeftSidebarCollapsed(true)}
                      className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-full cursor-pointer shadow-sm"
                    >
                      <Icons.ChevronLeftIcon fontSize="small" />
                    </button>
                  </Box>
                </Box>
              )}

              {/* Expand Left Sidebar Button (when collapsed) */}
              {isLeftSidebarCollapsed && (
                <button
                  onClick={() => setIsLeftSidebarCollapsed(false)}
                  className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 p-2 bg-[#0DA1C7] text-white border-0 rounded-r-lg cursor-pointer shadow-lg"
                >
                  <Icons.ChevronRightIcon fontSize="small" />
                </button>
              )}

              {/* Main content with margins for sidebars */}
              <Box
                className="flex-1 min-h-[calc(100vh-160px)] transition-all duration-300"
                sx={{
                  marginLeft: isLeftSidebarCollapsed ? '0px' : '240px',
                  marginRight: isGuidancePanelVisible ? '280px' : '0px',
                }}
              >
                {children}
              </Box>

              {/* Right Guidance Panel */}
              {currentApproachType && (
                <ApproachGuidancePanel
                  approachType={currentApproachType}
                  isVisible={isGuidancePanelVisible}
                  mode={guidanceMode}
                  onModeChange={setGuidanceMode}
                  onClose={() => setIsGuidancePanelVisible(false)}
                  valueSummary={
                    currentApproachType === 'sales' && finalResults
                      ? {
                          approachValue: finalResults,
                          weight: updateEvalWeightSales || salesPercentage,
                          perUnit: totalaveragedadjustedpsfSales,
                          unitType: comparisonBasis === 'Unit' ? 'Unit' : comparisonBasis === 'Bed' ? 'Bed' : 'SF',
                        }
                      : currentApproachType === 'income' && indicatedCapRate
                        ? {
                            approachValue: indicatedCapRate,
                            weight: updateEvalWeight || incomePercentage,
                            perUnit: indicatedSfAnnualRate,
                            unitType: comparisonBasis === 'Unit' ? 'Unit' : comparisonBasis === 'Bed' ? 'Bed' : 'SF',
                          }
                        : currentApproachType === 'cost' && finalResultCost
                          ? {
                              approachValue: finalResultCost,
                              weight: updateEvalWeightCost || costPercentage,
                              perUnit: totalSqCost,
                              unitType: comparisonBasis === 'Unit' ? 'Unit' : comparisonBasis === 'Bed' ? 'Bed' : 'SF',
                            }
                          : undefined
                  }
                />
              )}
            </Box>
          ) : (
            // Non-approach pages - render children normally
            <div>
              {children}
            </div>
          )}
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
                        {indicatedCapRate !== undefined &&
                        indicatedCapRate !== null
                          ? Math.trunc(indicatedCapRate).toLocaleString('en-US')
                          : sideBarData?.res_evaluation_income_approach
                                ?.indicated_range_annual !== undefined &&
                              sideBarData?.res_evaluation_income_approach
                                ?.indicated_range_annual !== null
                            ? Math.trunc(
                                sideBarData.res_evaluation_income_approach
                                  .indicated_range_annual
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>{' '}
                      <span
                        id="income-approach-percentage"
                        className="tooltipped weight text-gray-500"
                      >
                        <span id="income-approach-weight" className="text-base">
                          {/* {initialIncomePercentage} */}
                          {updateEvalWeight
                            ? `${Number.isInteger(updateEvalWeight) ? updateEvalWeight : updateEvalWeight.toFixed(2)}`
                            : `${Number.isInteger(incomePercentage) ? incomePercentage : incomePercentage.toFixed(2)}`}
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
                        {indicatedSfAnnualRate !== undefined &&
                        indicatedSfAnnualRate !== null
                          ? Math.trunc(indicatedSfAnnualRate).toLocaleString(
                              'en-US'
                            )
                          : sideBarData?.res_evaluation_income_approach
                                ?.indicated_psf_annual !== undefined &&
                              sideBarData?.res_evaluation_income_approach
                                ?.indicated_psf_annual !== null
                            ? Math.trunc(
                                sideBarData.res_evaluation_income_approach
                                  .indicated_psf_annual
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>
                      /
                      {comparisonBasis === 'SF'
                        ? 'SF'
                        : comparisonBasis === 'Unit'
                          ? 'Unit'
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
                    <p className="font-bold text-lg break-words text-[#0DA1C7]">
                      <i className="currency-label"></i>
                      <span id="income-approach-total-lg" className="text-xl">
                        {finalResults !== undefined && finalResults !== null
                          ? Math.trunc(finalResults).toLocaleString('en-US')
                          : sideBarData?.res_evaluation_sales_approach
                                ?.sales_approach_value !== undefined &&
                              sideBarData?.res_evaluation_sales_approach
                                ?.sales_approach_value !== null
                            ? Math.trunc(
                                sideBarData.res_evaluation_sales_approach
                                  .sales_approach_value
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>{' '}
                      <span
                        id="income-approach-percentage"
                        className="tooltipped weight text-gray-500"
                      >
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
                          : sideBarData?.res_evaluation_sales_approach
                                ?.averaged_adjusted_psf !== undefined &&
                              sideBarData?.res_evaluation_sales_approach
                                ?.averaged_adjusted_psf !== null
                            ? Math.trunc(
                                sideBarData.res_evaluation_sales_approach
                                  .averaged_adjusted_psf
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>
                      /
                      {comparisonBasis === 'Bed'
                        ? 'Bed'
                        : comparisonBasis === 'Unit'
                          ? 'Unit'
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
                        {finalResultCost !== undefined &&
                        finalResultCost !== null
                          ? Math.trunc(finalResultCost).toLocaleString('en-US')
                          : sideBarData?.res_evaluation_cost_approach
                                ?.total_cost_valuation !== undefined &&
                              sideBarData?.res_evaluation_cost_approach
                                ?.total_cost_valuation !== null
                            ? Math.trunc(
                                sideBarData.res_evaluation_cost_approach
                                  .total_cost_valuation
                              ).toLocaleString('en-US')
                            : '0'}
                      </span>{' '}
                      <span
                        id="income-approach-percentage"
                        className="tooltipped weight text-gray-500"
                      >
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
                        <span id="income-approach-incremental-value">
                          {totalSqCost !== undefined &&
                          totalSqCost !== null &&
                          !isNaN(totalSqCost)
                            ? Math.trunc(totalSqCost).toLocaleString('en-US')
                            : sideBarData?.res_evaluation_cost_approach
                                  ?.indicated_value_psf !== undefined &&
                                sideBarData?.res_evaluation_cost_approach
                                  ?.indicated_value_psf !== null &&
                                !isNaN(
                                  sideBarData?.res_evaluation_cost_approach
                                    ?.indicated_value_psf
                                )
                              ? Math.trunc(
                                  sideBarData.res_evaluation_cost_approach
                                    .indicated_value_psf
                                ).toLocaleString('en-US')
                              : '0'}
                        </span>{' '}
                      </span>
                      /
                      {comparisonBasis === 'SF'
                        ? 'SF'
                        : comparisonBasis === 'Unit'
                          ? 'Unit'
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
                  /SF{' '}
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
export default ResidentialMenuOptions;

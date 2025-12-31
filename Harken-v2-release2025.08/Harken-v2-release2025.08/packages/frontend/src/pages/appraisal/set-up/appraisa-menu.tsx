import React, { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
import axios from 'axios';
import { RequestType, useMutate } from '@/hook/useMutate';
import { HeaderEnum } from '@/components/header/ENUM/headerEnum';
import {
  ListingEnum,
  CreateCompsEnum,
  BuildingDetailsEnum,
  SiteDetailsEnum,
  LocalStorageKeysEnum,
  LocalStorageEnum,
  FieldNamesEnum,
  PayloadFieldsEnum,
} from '@/pages/comps/enum/CompsEnum';

const AppraisalMenu = ({ children }: any) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  // const INCOME_ID = searchParams.get('IncomeId');
  const [hasIncomeType, setHasIncomeType] = React.useState(false);
  const [hasSaleType, setHasSaleType] = React.useState(false);
  const [hasCostType, setHasCostType] = React.useState(false);
  const [hasLeaseType, setHasLeaseType] = React.useState(false);

  const [activeLink, setActiveLink] = useState('');
  const handleLinkClick = (link: any) => {
    localStorage.removeItem(LocalStorageEnum.COMPS_LENGTH);
    setActiveLink(link);
  };

  const url = new URL(window.location.href);
  const urlParts = {
    scheme: url.protocol.replace(':', ''),
    netloc: url.host,
    path: url.pathname,
  };

  const { data } = useGet<any>({
    queryKey: 'appraisals/get',
    cacheTime: ListingEnum.ZERO,
    endPoint: `appraisals/get/${id}`,
    config: {
      enabled: !urlParts.path.includes('appraisal-set-up'),
      refetchOnWindowFocus: false,
    },
  });
  
  const setData = data?.data?.data;
  if (setData?.comp_type) {
    const comp_type = setData?.comp_type;
    localStorage.setItem('activeType', comp_type);
    if (comp_type === HeaderEnum.BUILDING_WITH_LAND) {
      localStorage.setItem('activeButton', HeaderEnum.COMMERCIAL);
    } else {
      localStorage.setItem('activeButton', HeaderEnum.LAND);
    }
    localStorage.setItem('activeMain', HeaderEnum.APPRAISAL);
  }
  localStorage.setItem(FieldNamesEnum.COMPARISON_BASIS, setData?.comparison_basis);
  localStorage.setItem(LocalStorageKeysEnum.COMPARISON_BASIS_VIEW, setData?.comparison_basis);
  localStorage.setItem(LocalStorageKeysEnum.COMPARISON_BASIS, setData?.comparison_basis);
  
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/update-position',
    endPoint: `appraisals/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      await mutateAsync({
        position: ApiUrl,
      });
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync]);

  // Update street_address when data changes
  useEffect(() => {
    const appraisalData = data?.data?.data;

    if (appraisalData) {
      const address = appraisalData.street_address;

      // Console log the street address
      console.log('Street Address:', address);
    }
  }, [data]);

  const updateDatas = data?.data?.data?.appraisal_approaches;
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
  const [filterLeasedData, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCostdData, setFilteredCostsData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  useEffect(() => {
    if (data?.data?.data?.appraisal_approaches && !data.isStale) {
      const updateData = data.data.data.appraisal_approaches;
      const incomeApproaches = updateData.filter(
        (item: { type: string }) =>
          item.type === BuildingDetailsEnum.INCOME || item.type === PayloadFieldsEnum.RENT_ROLL
      );
      const incomeApproaches1 = updateData.filter(
        (item: { type: string }) => item.type === BuildingDetailsEnum.INCOME
      );
      const incomeApproachesRentRoll = updateData.filter(
        (item: { type: string }) => item.type === PayloadFieldsEnum.RENT_ROLL
      );
      setFilteredRentRollData(incomeApproachesRentRoll);
      setHasIncomeType(incomeApproaches.length > ListingEnum.ZERO);
      setFilteredData(incomeApproaches1);
    }
  }, [data?.data?.data?.appraisal_approaches]);

  useEffect(() => {
    if (data?.data?.data?.appraisal_approaches && !data.isStale) {
      const updateData = data.data.data.appraisal_approaches;
      const salesApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'sale'
      );
      setHasSaleType(salesApproaches.length > ListingEnum.ZERO);
      setFilteredSalesData(salesApproaches);
    }
  }, [data?.data?.data?.appraisal_approaches]);

  useEffect(() => {
    if (data?.data?.data?.appraisal_approaches && !data.isStale) {
      const updateData = data.data.data.appraisal_approaches;
      const costApproaches = updateData.filter(
        (item: { type: string }) => item.type === BuildingDetailsEnum.COST
      );
      setHasCostType(costApproaches.length > ListingEnum.ZERO);
      setFilteredCostsData(costApproaches);
    }
  }, [data?.data?.data?.appraisal_approaches]);
  // for lease
  useEffect(() => {
    if (data?.data?.data?.appraisal_approaches && !data.isStale) {
      const updateData = data.data.data.appraisal_approaches;
      const costApproaches = updateData.filter(
        (item: { type: string }) => item.type === ListingEnum.LEASE
      );
      setHasLeaseType(costApproaches.length > ListingEnum.ZERO);
      setFilteredLeaseData(costApproaches);
    }
  }, [data?.data?.data?.appraisal_approaches]);

  const templateIds = data?.data?.data?.template?.id;

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

  useEffect(() => {
    if (salesApproch === 'true') {
      setHasSaleType(true);
    }
    if (incomeApproch === 'true') {
      setHasIncomeType(true);
    }
    if (costApproch === 'true') {
      setHasCostType(true);
    }
    if (leaseApproach === 'true') {
      localStorage.setItem(LocalStorageEnum.CHECK_TYPE, LocalStorageEnum.LEASES_CHECKBOX);
      localStorage.removeItem(LocalStorageEnum.COMPS_LENGTH);
      setHasLeaseType(true);
    }
  }, [salesApproch, incomeApproch, costApproch]);

  const IncomeApprochRentRollIndex = filteredRentRollData[0]?.id;
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Directly find the matching rent-roll item
    const matchingRentRoll = filteredRentRollData.find(
      (elem) => currentPath === `/rent-roll?id=${id}&appraisalId=${elem.id}`
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
      '/sales-approach': 'salesId',
      '/lease-approach': 'leaseId',
      '/cost-approach': 'costId',
    };

    // Check if the current path matches any valid route and has required query parameters
    if (
      validPaths[location.pathname] &&
      id &&
      params.get(validPaths[location.pathname])
    ) {
      localStorage.removeItem(LocalStorageEnum.CHECK_TYPE);

      // If it's the lease-approach page, set 'approachType' to 'leaseCheck'
      if (location.pathname === '/lease-approach') {
        localStorage.setItem(LocalStorageEnum.APPROACH_TYPE, LocalStorageEnum.LEASE_CHECK);
      }
      if (location.pathname === LocalStorageEnum.SALES_APPROACH) {
        localStorage.setItem(LocalStorageEnum.APPROACH_TYPE, LocalStorageEnum.SALES_CHECK);
      }
      if (location.pathname === LocalStorageEnum.COST_APPROACH) {
        localStorage.setItem(LocalStorageEnum.APPROACH_TYPE, LocalStorageEnum.SALES_CHECK);
      }
    }
  }, [location]);

  // const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const incomeId = searchParams.get('IncomeId');
    const appraisalId = searchParams.get('appraisalId');

    if (urlParts.path.includes('income-approch') && incomeId) {
      setActiveLink(`income-approch-${incomeId}`);
    } else if (urlParts.path.includes('rent-roll') && appraisalId) {
      setActiveLink(`rent-roll-${appraisalId}`);
    }
  }, [urlParts.path]);
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

    if (currentPath.includes('overview')) {
      setActiveLink('overview');
    } else if (currentPath.includes('evalution-image')) {
      setActiveLink('evalution-image');
    } else if (currentPath.includes('evalution-photo-sheet')) {
      setActiveLink('evalution-photo-sheet');
    } else if (currentPath.includes('property-boundaries')) {
      setActiveLink('property-boundaries');
    } else if (currentPath.includes('aerialmap')) {
      setActiveLink('aerialmap');
    } else if (currentPath.includes('area-info')) {
      setActiveLink('area-info');
    } else if (currentPath.includes('appraisal-photo-sheet')) {
      setActiveLink('appraisal-photo-sheet');
    }

    // Rent-roll check
    const matchingRentRoll = filteredRentRollData.find(
      (elem) => currentPath === `/rent-roll?id=${id}&appraisalId=${elem.id}`
    );

    if (matchingRentRoll) {
      setActiveLink(matchingRentRoll.id);
    }

    // **Income-Approach check (Fix)**
    filteredData.forEach((elem: any) => {
      const incomeApproachPath = `/income-approach?id=${id}&IncomeId=${elem.id}`;
      if (currentPath === incomeApproachPath) {
        setActiveLink(`income-approach-${elem.id}`);
      }
    });

    // Sales-Approach check
    filtereSalesdData.forEach((elem) => {
      const salesApproachPath = `/sales-approach?id=${id}&salesId=${elem.id}`;
      const salesCompsMapPath = `/sales-comps-map?id=${id}&salesId=${elem.id}`;
      if (currentPath === salesApproachPath) {
        localStorage.removeItem('checkType');
        setActiveLink(`sales-approach-${elem.id}`);
      } else if (currentPath === salesCompsMapPath) {
        setActiveLink(`sales-comps-map-${elem.id}`);
      }
    });

    // Lease-Approach check
    filterLeasedData.forEach((elem) => {
      const leaseApproachPath = `/lease-approach?id=${id}&leaseId=${elem.id}`;
      const leaseCompsMapPath = `/lease-comps-map?id=${id}&leaseId=${elem.id}`;
      if (currentPath === leaseApproachPath) {
        setActiveLink(`lease-approach-${elem.id}`);
      } else if (currentPath === leaseCompsMapPath) {
        setActiveLink(`lease-comps-map-${elem.id}`);
      }
    });

    // Cost-Approach check
    filtereCostdData.forEach((elem) => {
      const costApproachPath = `/cost-approach?id=${id}&costId=${elem.id}`;
      const costCompsMapPath = `/cost-comps-map?id=${id}&costId=${elem.id}`;
      const costCompsMapImprovement = `/cost-approach-improvement?id=${id}&costId=${elem.id}`;
      if (currentPath === costApproachPath) {
        setActiveLink(`cost-approach-${elem.id}`);
      } else if (currentPath === costCompsMapPath) {
        setActiveLink(`cost-comps-map-${elem.id}`);
      } else if (currentPath === costCompsMapImprovement) {
        setActiveLink(`cost-approach-improvement-${elem.id}`);
      }
    });
  }, [
    location,
    id,
    filteredRentRollData,
    filteredData, // Added dependency for income approach
    filtereSalesdData,
    filtereCostdData,
    filterLeasedData,
  ]);

  return (
    <>
      <div>
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
            className={`${urlParts.path.includes('appraisal-set-up') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg] flex-1' : 'flex-1 before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
          >
            <Link
              className={`w-full h-full flex justify-center items-center no-underline relative ${urlParts.path.includes('appraisal-set-up') ? 'text-[white]' : 'text-[#95989A]'}`}
              to={
                id ? `/update-appraisal-set-up?id=${id}` : '/appraisal-set-up'
              }
            >
              <div
                className={`w-[100%] h-full flex justify-center items-center !border-t-0 text-[#95989A] ${urlParts.path.includes('appraisal-set-up') ? '' : ''}`}
              >
                <span
                  className={`h-full flex items-center ${urlParts.path.includes('appraisal-set-up') ? 'text-[white]' : 'text-[#95989A]'} `}
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    textAlign: 'center',
                    padding: '5px 10px',
                  }}
                >
                  {SiteDetailsEnum.SETUP}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex-1">
            <div
              className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${urlParts.path.includes('overview') || urlParts.path.includes('evalution-image') || urlParts.path.includes('property-boundaries') || urlParts.path.includes('area-info') || urlParts.path.includes('aerialmap') || urlParts.path.includes('evalution-photo-sheet') || urlParts.path.includes('appraisal-photo-sheet') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : ' before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
              style={{
                opacity: id ? 1 : 0.5,
                pointerEvents: id ? 'auto' : 'none',
              }}
            >
              <Link
                className={`w-full h-full flex justify-center items-center relative no-underline ${urlParts.path.includes('overview') || urlParts.path.includes('evalution-image') || urlParts.path.includes('property-boundaries') || urlParts.path.includes('aerialmap') || urlParts.path.includes('area-info') || urlParts.path.includes('evalution-photo-sheet') || urlParts.path.includes('appraisal-photo-sheet') ? 'text-[white]' : 'text-[#95989A]'}`}
                to={id ? `/overview?id=${id}` : '/overview'}
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
                  {CreateCompsEnum.OVERVIEW}
                </span>
                <Icons.ArrowDropDownIcon
                  style={{
                    pointerEvents: id ? 'auto' : 'none',
                    opacity: id ? 1 : 0.5,
                  }}
                />
              </Link>
              <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white w-full z-50">
                <ul className="text-customBlue list-none">
                  <li>
                    <Link
                      className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${urlParts.path.includes('overview') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'overview' ? 'active-li-class' : ''}`}
                      to={id ? `/overview?id=${id}` : '/overview'}
                      style={{
                        pointerEvents: id ? 'auto' : 'none',
                        cursor: id ? 'pointer' : 'default',
                      }}
                      onClick={(e) => {
                        if (!id) {
                          e.preventDefault();
                        } else {
                          handleLinkClick('overview');
                        }
                      }}
                    >
                      {' '}
                      {CreateCompsEnum.OVERVIEW_PAGE}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7]  relative ${urlParts.path.includes('appraisal-photo-sheet') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'appraisal-photo-sheet' ? 'active-li-class' : ''}`}
                      to={`/appraisal-photo-sheet?id=${id}`}
                      style={{
                        pointerEvents: id ? 'auto' : 'none',
                        cursor: id ? 'pointer' : 'default',
                      }}
                      onClick={(e) => {
                        if (!id) {
                          e.preventDefault();
                        } else {
                          handleLinkClick('appraisal-photo-sheet');
                        }
                      }}
                    >
                      {CreateCompsEnum.PHOTO_PAGES}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] relative ${urlParts.path.includes('property-boundaries') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'property-boundaries' ? 'active-li-class' : ''}`}
                      to={`/property-boundaries?id=${id}`}
                      style={{
                        pointerEvents: id ? 'auto' : 'none',
                        cursor: id ? 'pointer' : 'default',
                      }}
                      onClick={(e) => {
                        if (!id) {
                          e.preventDefault();
                        } else {
                          handleLinkClick('property-boundaries');
                        }
                      }}
                    >
                      {CreateCompsEnum.MAP_BOUNDARY_PAGE}
                    </Link>
                  </li>
                  <li>
                    <Link
                      state={{ from: passAerialInfoMap }}
                      className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] relative ${urlParts.path.includes('aerialmap') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'aerialmap' ? 'active-li-class' : ''}`}
                      to={`/aerialmap?id=${id}`}
                      style={{
                        pointerEvents: id ? 'auto' : 'none',
                        cursor: id ? 'pointer' : 'default',
                      }}
                      onClick={(e) => {
                        if (!id) {
                          e.preventDefault();
                        } else {
                          setActiveLink('aerialmap');
                        }
                      }}
                    >
                      {CreateCompsEnum.AERIAL_MAP}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] relative ${urlParts.path.includes('area-info') ? 'text-[#0da1c7]' : 'text-customBlue'} ${activeLink === 'area-info' ? 'active-li-class' : ''}`}
                      to={`/area-info?id=${id}`}
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
                      {CreateCompsEnum.AREA_INFO}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {hasIncomeType && (
            <div className="flex-1">
              <div
                className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${urlParts.path.includes('income-approch') || urlParts.path.includes('rent-roll') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
              >
                <Link
                  className={`w-full h-full flex justify-center items-center relative no-underline ${urlParts.path.includes('income-approch') || urlParts.path.includes('rent-roll') ? 'text-[white]' : 'text-[#95989A]'}`}
                  // to={`/income-approch?id=${id}&IncomeId=${IncomeApprochIndex}`}
                  to={
                    filteredData.length === 0
                      ? `/rent-roll?id=${id}&appraisalId=${IncomeApprochRentRollIndex}`
                      : `/income-approch?id=${id}&IncomeId=${filteredData?.[0]?.id}`
                  }
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
                    {CreateCompsEnum.INCOME_APPROACH}
                  </span>
                  <Icons.ArrowDropDownIcon />
                </Link>
                <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white w-full z-50">
                  {filteredData &&
                    filteredData.map(
                      (
                        elem: { id: any; name: React.ReactNode },
                        index: React.Key
                      ) => {
                        return (
                          <div
                            key={index}
                            // className="block text-sm font-normal text-lefhasft capitalize leading-3 text-customBlue"
                            className="capitalize"
                          >
                            <ul className="text-customBlue list-none">
                              <li>
                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${
                                    new URLSearchParams(window.location.search).get('IncomeId') === elem.id.toString()
                                      ? 'active-li-class'
                                      : 'text-customBlue'
                                  }`}
                                  to={`/income-approch${id ? `?id=${id}&IncomeId=${elem.id}` : `?IncomeId=${elem.id}`}`}
                                  state={{ from: elem.id }}
                                  onClick={() => {
                                    setActiveLink(`income-approch-${elem.id}`);
                                  }}
                                >
                                  {BuildingDetailsEnum.INCOME_} ({elem.name})
                                </Link>
                              </li>
                            </ul>
                          </div>
                        );
                      }
                    )}
                  {filteredRentRollData &&
                    filteredRentRollData.map(
                      (
                        elem: { id: any; name: React.ReactNode },
                        index: React.Key
                      ) => {
                        const isActive = activeLink === elem.id;
                        return (
                          <div
                            key={index}
                            // className="block text-sm font-normal text-lefhasft capitalize leading-3 text-customBlue"
                            className="capitalize"
                          >
                            <ul className="text-customBlue list-none">
                              <li>
                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${isActive ? 'active-li-class' : 'text-customBlue'}`}
                                  to={`/rent-roll?id=${id}&appraisalId=${elem.id}`}
                                  state={{ from: elem.name }}
                                  onClick={() => setActiveLink(elem.id)}
                                >
                                  {BuildingDetailsEnum.RENT_ROLL} ({elem.name})
                                </Link>
                              </li>
                            </ul>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            </div>
          )}
          {hasSaleType && (
            <div className="flex-1">
              <div
                className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${urlParts.path.includes('sales-approach') || urlParts.path.includes('sales-comps-map') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
              >
                <Link
                  className={`w-full h-full flex justify-center items-center relative no-underline ${urlParts.path.includes('sales-approach') || urlParts.path.includes('sales-comps-map') ? 'text-[white]' : 'text-[#95989A]'}`}
                  to={`/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`}
                  onClick={() => {
                    localStorage.removeItem('checkType');
                    localStorage.removeItem('approachType');
                  }}
                >
                  <span
                    className="h-full flex items-center"
                    style={{
                      fontSize: '12px', // Change from 8px to 12px
                      fontWeight: '500',
                      textAlign: 'center',
                      padding: '5px 10px',
                    }}
                  >
                    {BuildingDetailsEnum.SALES_APPROACH}
                  </span>
                  <Icons.ArrowDropDownIcon />
                </Link>

                <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white w-full z-50">
                  <ul className="text-customBlue list-none">
                    <li>
                      {filtereSalesdData &&
                        filtereSalesdData.map(
                          (
                            elem: { id: any; name: React.ReactNode },
                            index: React.Key
                          ) => {
                            return (
                              <div key={index} className="capitalize">
                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] relative no-underline ${
                                    activeLink === `sales-approach-${elem.id}`
                                      ? 'active-li-class'
                                      : 'text-customBlue'
                                  }`}
                                  to={`/sales-approach${id ? `?id=${id}&salesId=${elem.id}` : `?salesId=${elem.id}`}`}
                                  state={{ from: elem.id }}
                                  onClick={() => {
                                    setActiveLink(`sales-approach-${elem.id}`);
                                  }}
                                >
                                  {ListingEnum.SALES} ({elem.name})
                                </Link>

                                {id && (
                                  <Link
                                    className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${
                                      activeLink ===
                                      `sales-comps-map-${elem.id}`
                                        ? 'active-li-class'
                                        : 'text-customBlue'
                                    }`}
                                    to={`/sales-comps-map?id=${id}&salesId=${elem.id}`}
                                    onClick={() =>
                                      setActiveLink(
                                        `sales-comps-map-${elem.id}`
                                      )
                                    }
                                  >
                                    {BuildingDetailsEnum.SALES_COMPS_MAP}
                                  </Link>
                                )}
                              </div>
                              // </h3>
                            );
                          }
                        )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {hasLeaseType && (
            <div className="flex-1">
              <div
                className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${urlParts.path.includes('lease-approach') || urlParts.path.includes('lease-comps-map') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
              >
                <Link
                  className={`w-full h-full flex justify-center items-center relative no-underline ${
                    urlParts?.path?.includes('lease-approach') ||
                    urlParts?.path?.includes('lease-comps-map')
                      ? 'text-[white]'
                      : 'text-[#95989A]'
                  }`}
                  to={`/lease-approach?id=${id}${
                    filterLeasedData?.[0]?.id
                      ? `&leaseId=${filterLeasedData[0].id}`
                      : ''
                  }`}
                  onClick={() => {
                    localStorage.removeItem(LocalStorageEnum.CHECK_TYPE);
                    localStorage.setItem(LocalStorageEnum.APPROACH_TYPE, LocalStorageEnum.LEASE_CHECK);
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
                    {BuildingDetailsEnum.LEASE_APPROACH}
                  </span>
                  <Icons.ArrowDropDownIcon />
                </Link>

                <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white w-full z-50">
                  <ul className="text-customBlue list-none">
                    <li>
                      {filterLeasedData &&
                        filterLeasedData.map(
                          (
                            elem: { id: any; name: React.ReactNode },
                            index: React.Key
                          ) => {
                            return (
                              <div key={index} className="capitalize">
                                <Link
                                  className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${activeLink === `lease-approach-${elem.id}` ? 'active-li-class' : 'text-customBlue'}`}
                                  to={`/lease-approach?id=${id}&leaseId=${elem.id}`}
                                  state={{ from: elem.id }}
                                  onClick={() =>
                                    setActiveLink(`lease-approach-${elem.id}`)
                                  }
                                >
                                  {PayloadFieldsEnum.LEASE_} ({elem.name})
                                </Link>
                                <Link
                                  className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${
                                    activeLink === `lease-comps-map-${elem.id}`
                                      ? 'active-li-class'
                                      : 'text-customBlue'
                                  }`}
                                  to={`/lease-comps-map?id=${id}&leaseId=${elem.id}`}
                                  style={{
                                    pointerEvents: id ? 'auto' : 'none',
                                    cursor: id ? 'pointer' : 'default',
                                  }}
                                  onClick={() =>
                                    setActiveLink(`lease-comps-map-${elem.id}`)
                                  }
                                >
                                  {BuildingDetailsEnum.LEASE_COMPS_MAP}
                                </Link>
                              </div>
                              // </h3>
                            );
                          }
                        )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {hasCostType && (
            <div className="flex-1">
              <div
                className={`income-approach-wrapper relative w-[100%] h-full flex justify-center items-center !border-t-0 ${urlParts.path.includes('cost') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : 'before:content-[""] before:absolute before:border before:border-[#eeeeee] before:border-b-0 before:border-solid before:border-t-0 before:border-r before:border-l-0 before:skew-x-[-20deg] before:w-full before:h-full'}`}
              >
                <Link
                  className={`w-full h-full flex justify-center  items-center relative no-underline ${urlParts.path.includes('cost') ? 'text-[white]' : 'text-[#95989A]'}`}
                  to={`/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`}
                  onClick={() => {
                    localStorage.removeItem('checkType');
                    localStorage.removeItem('approachType');
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
                    {BuildingDetailsEnum.COST_APPROACH}
                  </span>
                  <Icons.ArrowDropDownIcon />
                </Link>

                <div className="appraisal-menu-hover absolute top-[58px] left-[-11px] opacity-100 bg-white w-full z-50">
                  {filtereCostdData &&
                    filtereCostdData.map(
                      (
                        elem: { id: any; name: React.ReactNode },
                        index: React.Key
                      ) => {
                        return (
                          <div
                            key={index}
                            // style={
                            //   index
                            //     ? { paddingTop: '20px' }
                            //     : { paddingTop: '10px' }
                            // }
                            className="capitalize"
                          >
                            <ul className="text-customBlue list-none">
                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${activeLink === `cost-approach-${elem.id}` ? 'active-li-class' : 'text-customBlue'}`}
                                to={`/cost-approach?id=${id}&costId=${elem.id}`}
                                state={{ from: elem.id }}
                                onClick={() =>
                                  setActiveLink(`cost-approach-${elem.id}`)
                                } // Set to match the active condition
                              >
                                {BuildingDetailsEnum.COST_} ({elem.name})
                              </Link>

                              <Link
                                className={`block text-sm p-3 hover:bg-[#f7f7f7] no-underline ${activeLink === `cost-comps-map-${elem.id}` ? 'active-li-class' : 'text-customBlue'}`}
                                to={`/cost-comps-map?id=${id}&costId=${elem.id}`}
                                style={{
                                  pointerEvents: id ? 'auto' : 'none',
                                  cursor: id ? 'pointer' : 'default',
                                }}
                                onClick={() =>
                                  setActiveLink(`cost-comps-map-${elem.id}`)
                                } // Same here
                              >
                                {BuildingDetailsEnum.COST_COMPS_MAP}
                              </Link>

                              <Link
                                className={`block text-sm no-underline p-3 hover:bg-[#f7f7f7] ${activeLink === `cost-approach-improvement-${elem.id}` ? 'active-li-class' : 'text-customBlue'}`}
                                to={`/cost-approach-improvement?id=${id}&costId=${elem.id}`}
                                style={{
                                  pointerEvents: id ? 'auto' : 'none',
                                  cursor: id ? 'pointer' : 'default',
                                }}
                                onClick={() =>
                                  setActiveLink(
                                    `cost-approach-improvement-${elem.id}`
                                  )
                                } // And here
                              >
                                {BuildingDetailsEnum.COST_IMPROVEMENT}
                              </Link>
                            </ul>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            </div>
          )}
          <div
            className={`flex-1 flex justify-center items-center relative !border-t-0 ${urlParts.path.includes('appraisal-exhibits') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : ''}`}
          >
            <Link
              className={`w-full h-full flex justify-center items-center relative no-underline ${urlParts.path.includes('appraisal-exhibits') ? 'text-[white]' : 'text-[#95989A]'}`}
              // to={`appraisal-exhibits${filtereSalesdData?.[0]?.id?`/${filtereSalesdData?.[0]?.id}`:''}${filtereCostdData?.[0]?.id?`/${filtereCostdData?.[0]?.id}`:''}/id=${id}`}
              // to={`/appraisal-exhibits?id=${id}&IncomeId=${IncomeApprochIndex}&salesId=${filtereSalesdData?.[0]?.id}&costId=${filtereCostdData?.[0]?.id}`}
              // to={`/appraisal-exhibits?id=${id}${
              //   IncomeApprochIndex ? `&IncomeId=${IncomeApprochIndex}` : ''
              // }${filtereSalesdData?.[0]?.id ? `&salesId=${filtereSalesdData[0].id}` : ''}${
              //   filtereCostdData?.[0]?.id
              //     ? `&costId=${filtereCostdData[0].id}`
              //     : ''
              // }`}
              to={`/appraisal-exhibits?id=${id}`}
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
                {BuildingDetailsEnum.EXHIBITS}
              </span>
            </Link>
          </div>

          <div
            className={`flex-1 flex justify-center items-center relative !border-t-0 ${urlParts.path.includes('report') ? 'before:content-[""] before:absolute before:inset-0 before:bg-[#0DA1C7] before:text-white before:w-full before:h-full before:skew-x-[-20deg]' : ''}`}
          >
            <Link
              className={`w-full h-full flex justify-center items-center no-underline z-10 ${urlParts.path.includes('report') ? 'text-[white]' : 'text-[#95989A]'}`}
              to={
                templateIds
                  ? `/report-template?id=${id}&template_id=${templateIds}`
                  : `/report?id=${id}`
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
                {BuildingDetailsEnum.REPORT}
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
    </>
  );
};
export default AppraisalMenu;

import CommonButton from '@/components/elements/button/Button';
import { Divider, Grid } from '@mui/material';
import NoImageUpload from '../../../images/Group 1549.png';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CompsViewGetData } from '@/components/interface/comps-view-get-data-type';
import { useGet } from '@/hook/useGet';
import CompViewGoogleMapLocation from './comp-map';
import React, { useEffect, useState } from 'react';
import { compsView } from './compsViewEnum';
import { CompanyGetData } from '@/components/interface/company-get-data-type';
import { ClientGetData } from '@/components/interface/client-get-data-type';
import loadingImage from '../../../images/loading.png';
import { formatDateToMMDDYYYY } from '@/utils/date-format';

import { ListingEnum } from '../enum/CompsEnum';
import {
  industrialOptions,
  officeOptions,
  retailOptions,
} from '../create-comp/SelectOption';
import { Icons } from '@/components/icons';
import { HeaderEnum } from '@/components/header/ENUM/headerEnum';

export const CommercialCompsView = () => {
  const navigate = useNavigate();
  const { id, check }: any = useParams();
  const location = useLocation();
  const propertyId = location.state?.propertyId;
  const approachId = location.state?.approachId;
  const comparisonBasis = location.state?.comparisonBasis;
  const comparisonBasisView =
    location.state?.comparisonBasisView || comparisonBasis;

  const selectedToggleButton = location.state?.selectedToggleButton;
  const rawFilters = location.state?.filters;
  const currentBounds = location.state?.bounds;
  const mapZoom = location.state?.zoom;
  const selectedIds = location.state?.selectedIds || [];
  console.log('CommercialCompsView location.state:', location.state);
  console.log('CommercialCompsView selectedIds:', mapZoom);

  // Clean up filters to remove invalid fields and map activeType to comp_type
  const filters = rawFilters
    ? (() => {
        const {
          selectedCities,
          activeType,
          checkType,
          property_type,
          ...validFilters
        } = rawFilters;
        return {
          ...validFilters,
          comp_type: activeType || validFilters.comp_type,
          propertyType: property_type
            ? property_type.split(',').filter(Boolean)
            : validFilters.propertyType,
        };
      })()
    : null;

  console.log('🚀🚀🚀 CommercialCompsView:', rawFilters);
  // useEffect(() => {
  //   const handlePopState = () => {
  //     localStorage.setItem('checkStatus', check);

  //     if (localStorage.getItem('activeType') === 'building_with_land') {
  //       navigate('/comps');
  //     } else {
  //       navigate('/land_comps');
  //     }
  //   };

  //   window.addEventListener('popstate', handlePopState);
  // }, []);
  const { data, isLoading } = useGet<CompsViewGetData>({
    queryKey: 'all',
    endPoint: `comps/get/${id}`,
    config: {
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    if (data?.data?.data?.comp_type) {
      const comp_type = data?.data?.data?.comp_type;
      localStorage.setItem('activeType', comp_type);
      // localStorage.setItem('activeMain', HeaderEnum.COMPS);
      if (comp_type === HeaderEnum.BUILDING_WITH_LAND) {
        localStorage.setItem('activeButton', HeaderEnum.COMMERCIAL);
      } else {
        localStorage.setItem('activeButton', HeaderEnum.LAND);
      }
    }
  }, [data]);

  const view = data?.data?.data;

  const { data: companyData } = useGet<CompanyGetData>({
    queryKey: `company/get/${view?.offeror_id}`,
    endPoint: `company/get/${view?.offeror_id}`,
    config: {
      enabled: Boolean(
        view?.offeror_id !== null && view?.offeror_type === compsView.COMPANY
      ),
      refetchOnWindowFocus: false,
    },
  });

  const { data: companyData1 } = useGet<CompanyGetData>({
    queryKey: `company/get/${view?.acquirer_id}`,
    endPoint: `company/get/${view?.acquirer_id}`,
    config: {
      enabled: Boolean(
        view?.acquirer_id !== null && view?.acquirer_type === compsView.COMPANY
      ),
      refetchOnWindowFocus: false,
    },
  });
  const { data: clientData } = useGet<ClientGetData>({
    queryKey: `client/get/${view?.offeror_id}`,
    endPoint: `client/get/${view?.offeror_id}`,
    config: {
      enabled: Boolean(
        view?.offeror_id !== null && view?.offeror_type === compsView.PERSON
      ),
      refetchOnWindowFocus: false,
    },
  });

  const { data: clientData1 } = useGet<ClientGetData>({
    queryKey: `client/get1/${view?.acquirer_id}`,
    endPoint: `client/get/${view?.acquirer_id}`,
    config: {
      enabled: Boolean(
        view?.acquirer_id !== null && view?.acquirer_type === compsView.PERSON
      ),
      refetchOnWindowFocus: false,
    },
  });

  const salePrice = view?.sale_price;
  const formattedSalePrice =
    salePrice !== null && salePrice !== undefined
      ? parseFloat(salePrice).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';
  const leaseRate = view?.lease_rate;
  const formatedLeaseRate =
    leaseRate !== null && leaseRate !== undefined
      ? parseFloat(leaseRate).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';
  const Cam = view?.cam;
  const formatedCam =
    Cam !== null && Cam !== undefined
      ? parseFloat(Cam).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';
  const TIAllowance = view?.TI_allowance;
  const formatedTIAllowance =
    TIAllowance !== null && TIAllowance !== undefined
      ? parseFloat(TIAllowance).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';
  const AskingRent = view?.asking_rent;
  const FormatedAskingRent =
    AskingRent !== null && AskingRent !== undefined
      ? parseFloat(AskingRent).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  const isoDateString: any = view?.date_sold;

  const formattedDate = formatDateToMMDDYYYY(isoDateString);

  const netOperatingIncome = view?.net_operating_income;
  const formattedNetOperatingIncome =
    netOperatingIncome !== null &&
    netOperatingIncome !== undefined &&
    netOperatingIncome !== 0
      ? parseFloat(netOperatingIncome).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  const totalOperatingExpense = view?.total_operating_expense;
  const formattedTotalOperatingExpense =
    totalOperatingExpense !== null &&
    totalOperatingExpense !== undefined &&
    netOperatingIncome !== 0
      ? parseFloat(totalOperatingExpense).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';
  const operatingExpense = view?.operating_expense_psf;
  const formattedOperatingExpense =
    operatingExpense !== null && operatingExpense !== undefined
      ? parseFloat(operatingExpense).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';
  const listPrice = view?.list_price;
  const formattedListPrice =
    listPrice !== null && listPrice !== undefined
      ? parseFloat(listPrice).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  const totalConcessions = view?.total_concessions;
  const formattedTotalConcessions =
    totalConcessions !== null && totalConcessions !== undefined
      ? parseFloat(totalConcessions).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  const formattedPercent1 =
    view?.escalators === null ? '' : `${view?.escalators?.toFixed(2)}%`;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || loading) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }
  const pathname = location.pathname;

  const handleBackNavigation = () => {
    // Debug logging
    console.log('🔙 Back navigation triggered:', {
      pathname,
      propertyId,
      approachId,
      filters,
      currentBounds,
      mapZoom,
      comparisonBasisView,
    });

    // Preserve localStorage values before navigation
    const preservedValues = {
      compStatus: localStorage.getItem('compStatus'),
      property_type: localStorage.getItem('property_type'),
      checkType: localStorage.getItem('checkType'),
      activeType: localStorage.getItem('activeType'),
      search_term: localStorage.getItem('search_term'),
    };

    // Get approachId from current URL since it's in the path, not query params
    const currentUrl = window.location.pathname + window.location.search;
    const urlParams = new URLSearchParams(window.location.search);

    // Extract approachId from current URL if not in state
    let extractedApproachId = approachId;
    if (!extractedApproachId) {
      // Try URL params first
      extractedApproachId = urlParams.get('approachId');

      // If still not found, try to extract from the referrer or current context
      if (!extractedApproachId) {
        // Get from localStorage as last resort
        extractedApproachId = localStorage.getItem('approachId');
      }
    }

    const fallbackPropertyId = propertyId || urlParams.get('id');
    const fallbackApproachId = extractedApproachId;

    console.log('🔍 Fallback values:', {
      propertyId,
      approachId,
      fallbackPropertyId,
      fallbackApproachId,
      currentUrl,
      urlParams: Object.fromEntries(urlParams),
      localStorage_approachId: localStorage.getItem('approachId'),
    });

    if (pathname.includes('evaluation/sales-comps-view')) {
      const targetUrl =
        fallbackPropertyId && fallbackApproachId
          ? `/evaluation/filter-comps?id=${fallbackPropertyId}&approachId=${fallbackApproachId}`
          : '/evaluation/filter-comps';

      navigate(targetUrl, {
        state: {
          comparisonBasisView: comparisonBasisView,
          typeView: check,
          compFilters: filters,
          currentBounds: currentBounds,
          mapZoom: mapZoom,
          selectedIds: selectedIds,
          preservedLocalStorage: preservedValues,
        },
      });
    } else if (pathname.includes('evaluation/cost-comps-view')) {
      const targetUrl =
        fallbackPropertyId && fallbackApproachId
          ? `/evaluation/filter-cost-comps?id=${fallbackPropertyId}&approachId=${fallbackApproachId}`
          : '/evaluation/filter-cost-comps';

      navigate(targetUrl, {
        state: {
          comparisonBasisView: comparisonBasisView,
          typeView: check,
          compFilters: filters,
          currentBounds: currentBounds,
          mapZoom: mapZoom,
          selectedIds: selectedIds,
          preservedLocalStorage: preservedValues,
        },
      });
    } else if (pathname.includes('evaluation/lease-comps')) {
      const targetUrl =
        fallbackPropertyId && fallbackApproachId
          ? `/evaluation/filter-lease-comps?id=${fallbackPropertyId}&approachId=${fallbackApproachId}`
          : '/evaluation/filter-lease-comps';

      navigate(targetUrl, {
        state: {
          comparisonBasisView: comparisonBasisView,
          typeView: check,
          compFilters: filters,
          currentBounds: currentBounds,
          mapZoom: mapZoom,
          selectedIds: selectedIds,
          preservedLocalStorage: preservedValues,
        },
      });
    } else if (pathname.includes('evaluation/cap-comps')) {
      const targetUrl =
        fallbackPropertyId && fallbackApproachId
          ? `/evaluation/filter-cap-comps?id=${fallbackPropertyId}&approachId=${fallbackApproachId}`
          : '/evaluation/filter-cap-comps';

      navigate(targetUrl, {
        state: {
          comparisonBasisView: comparisonBasisView,
          typeView: check,
          compFilters: filters,
          currentBounds: currentBounds,
          mapZoom: mapZoom,
          selectedIds: selectedIds,
          preservedLocalStorage: preservedValues,
        },
      });
    } else if (pathname.includes('evaluation/multi-family-comps')) {
      const targetUrl =
        fallbackPropertyId && fallbackApproachId
          ? `/evaluation/filter-multi-family-comps?id=${fallbackPropertyId}&approachId=${fallbackApproachId}`
          : '/evaluation/filter-multi-family-comps';

      navigate(targetUrl, {
        state: {
          comparisonBasisView: comparisonBasisView,
          typeView: check,
          compFilters: filters,
          currentBounds: currentBounds,
          mapZoom: mapZoom,
          selectedIds: selectedIds,
          preservedLocalStorage: preservedValues,
        },
      });
    } else if (pathname.includes('cost-comps-view')) {
      const targetUrl =
        fallbackPropertyId && fallbackApproachId
          ? `/filter-cost-comps?id=${fallbackPropertyId}&approachId=${fallbackApproachId}`
          : '/filter-cost-comps';

      navigate(targetUrl, {
        state: {
          comparisonBasisView: comparisonBasisView,
          typeView: check,
          compFilters: filters,
          currentBounds: currentBounds,
          mapZoom: mapZoom,
          selectedIds: selectedIds,
          preservedLocalStorage: preservedValues,
        },
      });
    } else if (pathname.includes('sales-comps-view')) {
      const targetUrl =
        fallbackPropertyId && fallbackApproachId
          ? `/filter-comps?id=${fallbackPropertyId}&approachId=${fallbackApproachId}`
          : '/filter-comps';

      navigate(targetUrl, {
        state: {
          comparisonBasisView: comparisonBasisView,
          typeView: check,
          compFilters: filters,
          currentBounds: currentBounds,
          mapZoom: mapZoom,
          selectedIds: selectedIds,
          preservedLocalStorage: preservedValues,
        },
      });
    } else if (pathname.includes('lease-comps-view')) {
      const targetUrl =
        fallbackPropertyId && fallbackApproachId
          ? `/filter-lease-comps?id=${fallbackPropertyId}&approachId=${fallbackApproachId}`
          : '/filter-lease-comps';

      navigate(targetUrl, {
        state: {
          comparisonBasisView: comparisonBasisView,
          typeView: check,
          compFilters: filters,
          currentBounds: currentBounds,
          mapZoom: mapZoom,
          selectedIds: selectedIds,
          preservedLocalStorage: preservedValues,
        },
      });
    }
  };

  const showBackButton =
    pathname.includes('evaluation/sales-comps') ||
    pathname.includes('evaluation/cost-comps') ||
    pathname.includes('evaluation/lease-comps') ||
    pathname.includes('evaluation/cap-comps') ||
    pathname.includes('evaluation/multi-family-comps') ||
    pathname.includes('cost-comps-view') ||
    pathname.includes('sales-comps-view') ||
    pathname.includes('lease-comps-view');

  console.log(
    '🔙 Show back button:',
    showBackButton,
    'for pathname:',
    pathname
  );

  const hideEditButton =
    pathname.includes('cost-comps-view') ||
    pathname.includes('sales-comps-view') ||
    pathname.includes('lease-comps-view');
  console.log('asdghajgjhagdas', propertyId, approachId);

  return (
    <>
      <Grid container spacing={3} className="pl-4 pt-6 h-[calc(100vh-80px)]">
        <Grid
          item
          xs={7}
          className="h-full overflow-auto p-4"
          style={{ boxShadow: '18px 9px 20.1px 0px rgba(0, 0, 0, 0.1)' }}
        >
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: 'rgba(236, 248, 251, 1)' }}
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl leading-10 font-bold text-[#0DA1C7] capitalize">
                  {view?.street_address}
                </h2>
                <p className="text-sm leading-5 font-medium">
                  {view?.street_address}
                </p>
                <p className="text-sm font-medium">
                  {view?.city}, {view?.state.toUpperCase()} {view?.zipcode}
                </p>
              </div>
              <h2 className="text-2xl font-bold text-[#0DA1C7] capitalize">
                {' '}
                {view?.type}
              </h2>
            </div>
          </div>
          <div className="flex py-3 w-full justify-between items-center">
            <Divider textAlign="left" className="text-[15px] font-bold">
              {compsView.PROPERTY_DETAILS}
            </Divider>
            <div className="h-[1px] w-[85%] bg-[#E4E4E4]"></div>
          </div>
          <div className="bg-[#F9F9F9] p-3 rounded-lg">
            <h2 className="text-xs font-bold text-[#6D7F8A]">
              {compsView.PROPERTY_SUMMARY}
            </h2>
            <p className="pt-1.5 text-xs leading-5 font-medium text-[#6D7F8A] mb-3">
              {view?.summary}
            </p>
            <div className="grid grid-cols-4 gap-4 text-[#6D7F8A]">
              {view?.comp_type === 'building_with_land' ? (
                <div className="flex-1 flex flex-col">
                  <h4 className="font-bold text-xs leading-4">
                    {compsView.BUILDINGS}
                  </h4>

                  <p className="pt-1.5 text-xs leading-5 font-medium">
                    {view &&
                      view.zonings.map((item: any, index: number) => {
                        let subZoneLabel = '';

                        switch (item.zone) {
                          case 'office':
                            subZoneLabel =
                              officeOptions.find(
                                (option) => option.value === item.sub_zone
                              )?.label ||
                              item.sub_zone
                                ?.split(/[\s_]+/)
                                .map(
                                  (word: string) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(' ');
                            break;
                          case 'multi_family':
                            subZoneLabel =
                              officeOptions.find(
                                (option) => option.value === item.sub_zone
                              )?.label ||
                              (item.zone === 'multi_family'
                                ? item.sub_zone === '100_plus_units'
                                  ? '100+ Units'
                                  : item.sub_zone === '2_4_units'
                                    ? '2-4 Units'
                                    : item.sub_zone === '4_10_units'
                                      ? '4-10 Units'
                                      : item.sub_zone === '10_20_units'
                                        ? '10-20 Units'
                                        : item.sub_zone === '20_100_units'
                                          ? '20-100 Units'
                                          : item.sub_zone
                                              ?.split(/[\s_]+/)
                                              .map(
                                                (word: string) =>
                                                  word.charAt(0).toUpperCase() +
                                                  word.slice(1).toLowerCase()
                                              )
                                              .join(' ')
                                : item.sub_zone);
                            break;

                          case 'special':
                            subZoneLabel =
                              officeOptions.find(
                                (option) => option.value === item.sub_zone
                              )?.label ||
                              (item.zone === 'special'
                                ? item.sub_zone === 'large-animal_vet_clinic'
                                  ? 'Large Animal Vet Clinic'
                                  : item.sub_zone === 'sports_entertainment'
                                    ? 'Sports/Entertainment'
                                    : item.sub_zone === 'car_dealerships'
                                      ? 'Car Dealerships'
                                      : item.sub_zone
                                          ?.split(/[\s_]+/)
                                          .map(
                                            (word: string) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1).toLowerCase()
                                          )
                                          .join(' ')
                                : item.sub_zone);
                            break;

                          case 'retail':
                            subZoneLabel =
                              retailOptions.find(
                                (option) => option.value === item.sub_zone
                              )?.label ||
                              item.sub_zone
                                ?.split(/[\s_]+/)
                                .map(
                                  (word: string) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(' ');
                            break;
                          case 'residential':
                            subZoneLabel =
                              officeOptions.find(
                                (option) => option.value === item.sub_zone
                              )?.label ||
                              (item.zone === 'residential' &&
                              item.sub_zone === 'single_family'
                                ? 'Single Family Residence'
                                : item.sub_zone
                                    ?.split(/[\s_]+/)
                                    .map(
                                      (word: string) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(' '));
                            break;

                          case 'industrial':
                            subZoneLabel =
                              industrialOptions.find(
                                (option) => option.value === item.sub_zone
                              )?.label ||
                              item.sub_zone
                                ?.split(/[\s_]+/)
                                .map(
                                  (word: string) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(' ');
                            break;
                          default:
                            subZoneLabel = item.sub_zone
                              ?.split(/[\s_]+/)
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(' ');
                            break;
                        }

                        return (
                          <React.Fragment key={index}>
                            <div>
                              {item.zone === 'multi_family'
                                ? 'Multi-Family'
                                : item.zone
                                    .split(/[\s_]+/)
                                    .map(
                                      (word: string) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(' ')}
                              - {subZoneLabel} -{' '}
                              {item.sq_ft ? item.sq_ft.toLocaleString() : 'N/A'}{' '}
                              SF
                            </div>
                          </React.Fragment>
                        );
                      })}
                  </p>
                </div>
              ) : null}
              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-xs leading-4">
                  {view?.comp_type === compsView.BUILDING_WITH_LAND
                    ? compsView.BUILDING_SIZE
                    : compsView.LAND_TYPE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.comp_type === compsView.BUILDING_WITH_LAND
                    ? `${view?.building_size?.toLocaleString()} SF`
                    : (() => {
                        switch (view?.land_type) {
                          case 'ag':
                            return 'Agriculture';
                          case 'cbd':
                            return 'Central Business District (CBD)';
                          case 'industrial':
                            return 'Industrial';
                          case 'residential_2_10_units':
                            return 'Residential - 2-10 Units';
                          case 'residential_development':
                            return 'Residential - Development';
                          case 'residential_multi_family':
                            return 'Residential - Multi-Family';
                          case 'residential_single_family':
                            return 'Residential - Single Family';
                          case 'retail_office':
                            return 'Retail/Office';
                          case 'subdivisions':
                            return 'Subdivisions';
                          default:
                            return view?.land_type;
                        }
                      })()}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-xs leading-4">
                  {compsView.LAND_SIZE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium">
                  {(() => {
                    const landSize: any = view?.land_size;
                    const landDimension = view?.land_dimension;
                    const isSF = landDimension === compsView.SF.toUpperCase();
                    const isAcre = landDimension === compsView.ACRE;

                    if (landSize === 0 || landSize === null) {
                      return 'N/A';
                    }

                    if (selectedToggleButton) {
                      if (isSF && selectedToggleButton === 'AC') {
                        return `${(landSize / 43560).toFixed(3).toLocaleString()} ${compsView.AC}`;
                      }

                      if (isAcre && selectedToggleButton === 'SF') {
                        return `${(landSize * 43560).toLocaleString()} ${compsView.SF.toUpperCase()}`;
                      }
                    }

                    return isSF
                      ? `${landSize.toLocaleString()} ${compsView.SF.toUpperCase()}`
                      : isAcre
                        ? `${landSize.toFixed(3).toLocaleString()} ${compsView.AC}`
                        : 'N/A';
                  })()}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-xs leading-4">Topography</h4>
                <p
                  className="pt-1.5 text-xs leading-5 font-medium"
                  style={{
                    display:
                      view?.topography === compsView.SELECT ||
                      view?.topography === ''
                        ? 'none'
                        : 'block',
                  }}
                >
                  {view?.topography !== compsView.SELECT &&
                    view?.topography &&
                    view?.topography
                      .replace('_', ' ')
                      .split(' ')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')}
                </p>
              </div>

              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-xs leading-4">
                  {compsView.LOT_SHAPE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.lot_shape === compsView.SELECT ? '' : view?.lot_shape}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-xs leading-4">
                  {compsView.FRONTAGE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium">
                  {view?.frontage &&
                    view?.frontage
                      .replace('_', ' ')
                      .split(' ')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')}{' '}
                </p>
              </div>

              {view?.type === compsView.SALE && (
                <div className="flex-1 flex flex-col">
                  <h4 className="font-bold text-xs leading-4">
                    {compsView.CONDITION}
                  </h4>
                  <p className="pt-1.5 text-xs leading-5 font-medium">
                    {view?.condition &&
                      view?.condition
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </p>
                </div>
              )}

              {view?.comp_type === compsView.BUILDING_WITH_LAND && (
                <div className="flex-1 flex flex-col">
                  <h4 className="font-bold text-xs leading-4">
                    {compsView.BUILT_YEAR}
                  </h4>
                  <p className="pt-1.5 text-xs leading-5 font-medium ">
                    {view?.year_built}
                  </p>
                </div>
              )}
              {view?.comp_type === compsView.BUILDING_WITH_LAND && (
                <div className="flex-1 flex flex-col">
                  <h4 className="font-bold text-xs leading-4">
                    {compsView.REMODELED_YEAR}
                  </h4>
                  <p className="pt-1.5 text-xs leading-5 font-medium ">
                    {view?.year_remodeled}
                  </p>
                </div>
              )}
              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-xs leading-4">
                  {compsView.UTILITIES}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.utilities_select === compsView.SELECT && <div></div>}
                  {view?.utilities_select
                    ?.replace('_', ' ')
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-xs leading-4">
                  {compsView.ZONING_TYPE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.utilities_select === compsView.SELECT && <div></div>}
                  {view?.zoning_type}
                </p>
              </div>
              {/* {check === 'sales' && ( */}
              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-xs leading-4">
                  {compsView.NOTES}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.concessions}
                </p>
              </div>
              {/* )}  */}
            </div>
          </div>
          <div className="flex py-3 w-full justify-between items-center">
            <Divider textAlign="left" className="text-[15px] font-bold">
              {view?.type === compsView.SALE
                ? compsView.TRANSACTION_DETAILS
                : compsView.SPACE_DETAILS}
            </Divider>
            <div className="h-[1px] w-[85%] bg-[#E4E4E4]"></div>
          </div>
          <div className="bg-[#F9F9F9] p-3 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-[#6D7F8A]">
              {view?.type === compsView.SALE && (
                <>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.SALE_PRICE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {formattedSalePrice ? '$' + formattedSalePrice : 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.DATE_SOLD}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {formattedDate}
                    </p>
                  </div>
                  {view?.comp_type === 'building_with_land' && (
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-bold text-xs leading-4">
                        {compsView.NET_OPERATING_INCOME}
                      </h4>
                      <p className="pt-1.5 text-xs leading-5 font-medium ">
                        {formattedNetOperatingIncome
                          ? '$' + formattedNetOperatingIncome
                          : 'N/A'}
                      </p>
                    </div>
                  )}
                  {view?.comp_type === 'building_with_land' && (
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-bold text-xs leading-4">
                        {compsView.CAP_RATE}
                      </h4>
                      <p className="pt-1.5 text-xs leading-5 font-medium ">
                        {view.cap_rate ? view.cap_rate + '%' : 'N/A'}
                      </p>
                    </div>
                  )}
                  {view?.comp_type === compsView.BUILDING_WITH_LAND && (
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-bold text-xs leading-4">
                        {compsView.TOTAL_OPERATING_EXPENSE}
                      </h4>
                      <p className="pt-1.5 text-xs leading-5 font-medium ">
                        {formattedTotalOperatingExpense
                          ? '$' + formattedTotalOperatingExpense
                          : 'N/A'}
                      </p>
                    </div>
                  )}
                  {view?.comp_type === compsView.BUILDING_WITH_LAND && (
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-bold text-xs leading-4">
                        {compsView.OPERATING_EXPANSE_PSF}
                      </h4>
                      <p className="pt-1.5 text-xs leading-5 font-medium ">
                        {formattedOperatingExpense
                          ? '$' + formattedOperatingExpense
                          : 'N/A'}
                      </p>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.LIST_PRICE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {formattedListPrice ? '$' + formattedListPrice : 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.LIST_DATE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.date_list}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.DAYS_ON_MARKET}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.days_on_market}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.TOTAL_CONCESSIONS}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {formattedTotalConcessions
                        ? '$' + formattedTotalConcessions
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.SELLER}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.offeror_id ? (
                        view.offeror_type === compsView.PERSON ? (
                          <div>
                            {clientData?.data?.data?.first_name +
                              ' ' +
                              clientData?.data?.data?.last_name}
                          </div>
                        ) : view.offeror_type === compsView.COMPANY ? (
                          <div>{companyData?.data?.data?.company_name}</div>
                        ) : (
                          <div>{ListingEnum.NA}</div>
                        )
                      ) : (
                        <div>{ListingEnum.NA}</div>
                      )}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.BUYER}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {view?.acquirer_id ? (
                        view?.acquirer_type === compsView.PERSON ? (
                          <div>
                            {clientData1?.data?.data?.first_name +
                              ' ' +
                              clientData1?.data?.data?.last_name}
                          </div>
                        ) : view?.acquirer_type === compsView.COMPANY ? (
                          <div>{companyData1?.data?.data?.company_name}</div>
                        ) : (
                          <div>{ListingEnum.NA}</div>
                        )
                      ) : (
                        <div>{ListingEnum.NA}</div>
                      )}
                    </p>
                  </div>
                </>
              )}
              {view?.type === compsView.LEASE && (
                <>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.SPACE_SF}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.space &&
                        view?.space?.toLocaleString() + ' ' + 'SF'}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.CONDITION}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.condition === compsView.SELECT && <div></div>}
                      {view?.condition &&
                        view?.condition
                          .replace(/_/g, ' ')
                          .split(' ')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(' ')}{' '}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.LEASE_TYPE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.lease_type &&
                        view?.lease_type
                          .replace(/_/g, ' ')
                          .split(' ')
                          .map((word) => {
                            if (word.toLowerCase() === 'nnn') {
                              return 'NNN';
                            }

                            return (
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                            );
                          })
                          .join(' ')}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.TRANSACTION_DATE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {formattedDate}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.LEASE_RATE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {formatedLeaseRate ? '$' + formatedLeaseRate : 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.LEASE_RATE_UNITS}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {view?.lease_rate_unit === compsView.YEAR
                        ? compsView.SF_YEAR
                        : view?.lease_rate_unit === compsView.MONTH
                          ? compsView.SF_MONTH
                          : view?.lease_rate_unit === compsView.ACRE_YEAR
                            ? compsView.$_ACRE_YEAR
                            : view?.lease_rate_unit === compsView.ACRE_MONTH
                              ? compsView.$_ACRE_MONTH
                              : view?.lease_rate_unit === compsView.ANNUAL
                                ? compsView.ANNUAL_RENT
                                : view?.lease_rate_unit === compsView.MONTHLY
                                  ? compsView.MONTHLY_RENT
                                  : ''}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.CAM}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {formatedCam ? '$' + formatedCam : 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.TERM_MONTHS}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {view?.term}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.LEASE_NOTES}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {view?.concessions}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.EXECUTE_DATE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.date_execution}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.COMMENCEMENT_DATE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {view?.date_commencement}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.EXPIRATION_DATE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {view?.date_expiration}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.LEASE_STATUS}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.lease_status === compsView.SELECT
                        ? ''
                        : view?.lease_status
                            ?.split('_')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(' ')}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.TI_ALLOWANCE}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {formatedTIAllowance ? '$' + formatedTIAllowance : 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.TI_ALLOWANCE_UNITS}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium ">
                      {view?.TI_allowance_unit === compsView.SF
                        ? compsView.$_SF
                        : view?.TI_allowance_unit === compsView.TOTAL
                          ? compsView.TOTAL
                          : ''}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.ASKING_RENT}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {FormatedAskingRent ? '$' + FormatedAskingRent : 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.ASKING_RENT_UNITS}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.asking_rent_unit === compsView.YEAR
                        ? compsView.SF_YEAR
                        : view?.asking_rent_unit === compsView.MONTH
                          ? compsView.SF_MONTH
                          : view?.asking_rent_unit === compsView.ACRE_YEAR
                            ? compsView.$_ACRE_YEAR
                            : view?.asking_rent_unit === compsView.ACRE_MONTH
                              ? compsView.$_ACRE_MONTH
                              : view?.asking_rent_unit === compsView.ANNUAL
                                ? compsView.ANNUAL_RENT
                                : view?.asking_rent_unit === compsView.MONTHLY
                                  ? compsView.MONTHLY_RENT
                                  : ''}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.ESCALATORS}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {formattedPercent1}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.FREE_RENT_MONTHS}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.free_rent}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.LANDLORD}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.offeror_id &&
                        view?.offeror_type === compsView.PERSON && (
                          <div>
                            {clientData?.data?.data?.first_name +
                              ' ' +
                              clientData?.data?.data?.last_name}
                          </div>
                        )}
                      {view?.offeror_id &&
                        view?.offeror_type === compsView.COMPANY && (
                          <div>{companyData?.data?.data?.company_name}</div>
                        )}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-xs leading-4">
                      {compsView.TENANT}
                    </h4>
                    <p className="pt-1.5 text-xs leading-5 font-medium">
                      {view?.acquirer_id &&
                        view?.acquirer_type === compsView.PERSON && (
                          <div>
                            {clientData1?.data?.data?.first_name +
                              ' ' +
                              clientData1?.data?.data?.last_name}
                          </div>
                        )}
                      {view?.acquirer_id &&
                        view?.acquirer_type === compsView.COMPANY && (
                          <div>{companyData1?.data?.data?.company_name}</div>
                        )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Grid>
        <Grid item xs={5} className="flex flex-col justify-between p-0">
          <div className="py-4 px-6 flex flex-col pb-0">
            <div className="flex justify-end gap-1">
              <>
                {showBackButton ? (
                  <CommonButton
                    variant="contained"
                    className="text-xs"
                    color="primary"
                    onClick={handleBackNavigation}
                    style={{
                      borderRadius: '0 10px 0 0',
                      textTransform: 'capitalize',
                      width: '97px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Icons.BackIcon style={{ color: 'white' }} />
                    Back
                  </CommonButton>
                ) : (
                  <>
                    <CommonButton
                      variant="contained"
                      className="text-xs"
                      color="primary"
                      onClick={() => {
                        localStorage.setItem('checkStatus', check);

                        if (
                          localStorage.getItem('activeType') ===
                          'building_with_land'
                        ) {
                          navigate('/comps', {
                            state: {
                              typeView: check,
                              compFilters: filters,
                              currentBounds: currentBounds,
                              mapZoom: mapZoom,
                              selectedIds: selectedIds,
                            },
                          });
                        } else {
                          navigate('/land_comps', {
                            state: {
                              typeView: check,
                              compFilters: filters,
                              currentBounds: currentBounds,
                              mapZoom: mapZoom,
                              selectedIds: selectedIds,
                            },
                          });
                        }
                      }}
                      style={{
                        borderRadius: hideEditButton
                          ? '0 10px 0 0'
                          : '0 0 0 10px',
                        textTransform: 'capitalize',
                        width: '97px',
                        height: '36px',
                      }}
                    >
                      {compsView.BACK_TO_COMPS}
                    </CommonButton>

                    {!hideEditButton && (
                      <CommonButton
                        variant="contained"
                        className="text-xs"
                        color="primary"
                        onClick={() => {
                          navigate(`/update-comps/${id}`);
                        }}
                        style={{
                          borderRadius: '0 10px 0 0',
                          textTransform: 'capitalize',
                          width: '97px',
                          height: '36px',
                        }}
                      >
                        {compsView.EDIT_COMP}
                      </CommonButton>
                    )}
                  </>
                )}
              </>
            </div>
            <div className="flex items-center justify-center h-[360px]">
              {view?.property_image_url && (
                <img
                  src={import.meta.env.VITE_S3_URL + view?.property_image_url}
                  className="rounded-2xl w-[377px] h-[278px]"
                  alt=""
                />
              )}
              {!view?.property_image_url && (
                <img src={NoImageUpload} alt="no-image-upload" />
              )}
            </div>
          </div>
          <div>
            <CompViewGoogleMapLocation GoogleData={view} />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

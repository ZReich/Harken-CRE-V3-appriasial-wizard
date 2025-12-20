import CommonButton from '@/components/elements/button/Button';
import { ClientGetData } from '@/components/interface/client-get-data-type';
import { CompanyGetData } from '@/components/interface/company-get-data-type';
import { CompsViewGetData } from '@/components/interface/comps-view-get-data-type';
import { useGet } from '@/hook/useGet';
import { compsView } from '@/pages/comps/comps-view/compsViewEnum';
import { Divider, Grid } from '@mui/material';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CompViewGooleMapLocation from '../../comps/comps-view/comp-map';
import NoImageUpload from '../../../images/Group 1549.png';
import { formatDate } from '@/utils/date-format';
import loadingImage from '../../../images/loading.png';
import { ListingEnum } from '@/pages/comps/enum/CompsEnum';
import moment from 'moment';
import { Icons } from '@/components/icons';

export const ResCompsView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propertyId = location.state?.propertyId;
  const approachId = location.state?.approachId;
  // const selectedToggleButton = location.state?.selectedToggleButton;
  const { id, check } = useParams();
  console.log(check);
  const { data, isSuccess, isLoading } = useGet<CompsViewGetData>({
    queryKey: 'all',
    endPoint: `resComps/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  const view = data?.data?.data;
  const isoDateString = view?.date_sold;
  // Ensure the date is interpreted in UTC
  const formattedDate = isoDateString
    ? moment.utc(isoDateString).format('MM/DD/YYYY')
    : 'Invalid Date';
  React.useEffect(() => {}, [view?.acquirer_id, view?.offeror_id]);

  const { data: companyData } = useGet<CompanyGetData>({
    queryKey: `company/get/${view?.offeror_id}`,
    endPoint: `company/get/${view?.offeror_id}`,
    config: {
      enabled: Boolean(
        view?.offeror_id !== null &&
          view?.offeror_type === compsView.COMPANY &&
          isSuccess
      ),
      refetchOnWindowFocus: false,
    },
  });

  const { data: companyData1 } = useGet<CompanyGetData>({
    queryKey: `company/get/${view?.acquirer_id}`,
    endPoint: `company/get/${view?.acquirer_id}`,
    config: {
      enabled: Boolean(
        view?.acquirer_id !== null &&
          view?.acquirer_type === compsView.COMPANY &&
          isSuccess
      ),
      refetchOnWindowFocus: false,
    },
  });
  const { data: clientData } = useGet<ClientGetData>({
    queryKey: `client/get/${view?.offeror_id}`,
    endPoint: `client/get/${view?.offeror_id}`,
    config: {
      enabled: Boolean(
        // view?.offeror_id !== null &&
        view?.offeror_type === compsView.PERSON && isSuccess
      ),
      refetchOnWindowFocus: false,
    },
  });

  const { data: clientData1 } = useGet<ClientGetData>({
    queryKey: `client/get1/${view?.acquirer_id}`,
    endPoint: `client/get/${view?.acquirer_id}`,
    config: {
      enabled: Boolean(view?.acquirer_type === compsView.PERSON && isSuccess),
    },
  });

  const originalDateString: any = view?.date_list;
  let formattedDateString;
  if (originalDateString === '') {
    formattedDateString = 'N/A';
  } else {
    formattedDateString = formatDate(originalDateString);
  }

  const netSalePrice = view?.sale_price;
  const formattedSalePrice =
    netSalePrice !== null && netSalePrice !== undefined && netSalePrice !== 0
      ? parseFloat(netSalePrice).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  const netListPrice = view?.list_price;
  const formattedListPrice =
    netListPrice !== null && netListPrice !== undefined && netListPrice !== 0
      ? parseFloat(netListPrice).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  const netTotalConcession = view?.total_concessions;
  const formattedTotalConcessions =
    netTotalConcession !== null &&
    netTotalConcession !== undefined &&
    netTotalConcession !== 0
      ? parseFloat(netTotalConcession).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  if (isLoading) {
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
    console.log('Back navigation clicked:', { propertyId, approachId, pathname });
    
    if (pathname.includes('residential/sales-comps')) {
      const url = propertyId && approachId 
        ? `/residential/filter-sales-comps?id=${propertyId}&approachId=${approachId}`
        : '/res_comps';
      navigate(url);
    } else if (pathname.includes('residential/cost-comps-view')) {
      const url = propertyId && approachId 
        ? `/residential/filter-cost-comps?id=${propertyId}&approachId=${approachId}`
        : '/res_comps';
      navigate(url);
    } else if (pathname.includes('evaluation/lease-comps')) {
      const url = propertyId && approachId 
        ? `/evaluation/filter-lease-comps?id=${propertyId}&approachId=${approachId}`
        : '/evaluation-list';
      navigate(url);
    } else if (pathname.includes('evaluation/cap-comps')) {
      const url = propertyId && approachId 
        ? `/evaluation/filter-cap-comps?id=${propertyId}&approachId=${approachId}`
        : '/evaluation-list';
      navigate(url);
    } else if (pathname.includes('evaluation/multi-family-comps')) {
      const url = propertyId && approachId 
        ? `/evaluation/filter-multi-family-comps?id=${propertyId}&approachId=${approachId}`
        : '/evaluation-list';
      navigate(url);
    } else {
      // Fallback navigation
      navigate('/res_comps');
    }
  };

  const showBackButton =
    pathname.includes('residential/sales-comps') ||
    pathname.includes('residential/cost-comps') ||
    pathname.includes('residential/lease-comps');
  // pathname.includes('evaluation/cap-comps') ||
  // pathname.includes('evaluation/multi-family-comps');
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
            <div>
              <h2 className="text-2xl leading-10 font-bold text-[#0DA1C7] capitalize">
                {view?.street_address}
              </h2>
              <p className="text-sm leading-5 font-medium">
                {view?.street_address}
              </p>
              <p className="text-sm font-medium">
                {view?.city}, {view?.state?.toUpperCase()} {view?.zipcode}
              </p>
            </div>
          </div>
          <div className="flex py-3 w-full justify-between items-center">
            <Divider textAlign="left" className="text-[15px] font-bold">
              {compsView.PROPERTY_DETAILS}
            </Divider>
            <div className="h-[1px] w-[85%] bg-[#E4E4E4]"></div>
          </div>
          <div className="bg-[#F9F9F9] p-3 rounded-lg">
            <h2 className="text-xs font-semibold text-[#6D7F8A]">
              {compsView.PROPERTY_SUMMARY}
            </h2>
            <p className="pt-1.5 text-xs leading-5 font-medium text-[#6D7F8A] mb-3">
              {view?.summary}
            </p>
            <div className="grid grid-cols-4 gap-4 text-[#6D7F8A]">
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.BUILDINGS}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.res_zonings &&
                    view?.res_zonings.map((item: any, index: number) => (
                      <React.Fragment key={index}>
                        <div>
                          {item.zone
                            .split('_')
                            .map(
                              (word: string) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')}{' '}
                          -{' '}
                          {item.sub_zone === 'single_family'
                            ? 'Single Family Residence'
                            : item.sub_zone
                              ? item.sub_zone
                                  .split('_')
                                  .map(
                                    (word: string) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(' ')
                              : ''}{' '}
                          - {item.total_sq_ft.toLocaleString() + ' SF'}
                        </div>
                      </React.Fragment>
                    ))}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.BUILDING_SIZE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium">
                  {typeof view?.building_size === 'number'
                    ? `${view.building_size.toLocaleString()} ${compsView.SF.toUpperCase()}`
                    : '-'}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.LAND_SIZE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium">
                  {view?.land_size === 0 &&
                  view?.land_dimension === compsView.SF.toUpperCase()
                    ? 'N/A'
                    : view?.land_size !== null &&
                      view?.land_dimension === 'SF' &&
                      view?.land_size?.toLocaleString() +
                        ' ' +
                        compsView.SF.toUpperCase()}
                  {view?.land_size === 0 &&
                  view?.land_dimension === compsView.ACRE
                    ? 'N/A'
                    : view?.land_size !== null &&
                      view?.land_dimension === compsView.ACRE &&
                      (view?.land_size * 43560).toLocaleString() +
                        ' ' +
                        compsView.SF.toUpperCase()}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.TOPOGRAPHY}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium">
                  {view?.topography
                    ?.split('_') // Split the string by underscores
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase() // Capitalize the first letter and convert the rest to lowercase
                    )
                    .join(' ')}{' '}
                  {/* Join the words with a space */}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.LOT_SHAPE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.lot_shape === compsView.SELECT ? '' : view?.lot_shape}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.FRONTAGE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium">
                  {view?.frontage
                    ?.split('_') // Split the string by underscores
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase() // Capitalize first letter and make the rest lowercase
                    )
                    .join(' ')}{' '}
                  {/* Join the words with spaces */}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.CONDITION}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.condition
                    ?.split('_') // Split the string by underscores
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase() // Capitalize first letter and make the rest lowercase
                    )
                    .join(' ')}{' '}
                  {/* Join the words with spaces */}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.BUILT_YEAR}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.year_built}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.REMODELED_YEAR}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.year_remodeled}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.UTILITIES}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.utilities_select === compsView.SELECT
                    ? ''
                    : view?.utilities_select}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.BASEMENT}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.basement}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.ZONING_TYPE}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium">
                  {view?.zoning_type}
                </p>
              </div>
            </div>
          </div>
          <div className="flex py-3 w-full justify-between items-center">
            <Divider textAlign="left" className="text-[15px] font-bold">
              {compsView.AMENITIES_DETAILS}
            </Divider>
            <div className="h-[1px] w-[85%] bg-[#E4E4E4]"></div>
          </div>
          <div className="bg-[#F9F9F9] p-3 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-[#6D7F8A]">
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.EXTERIOR}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.exterior}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.ROOF}
                </h4>
                <p className="pt-1.5 text-xs leading-5 font-medium ">
                  {view?.roof}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.ELECTRICAL}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {' '}
                  {view?.electrical}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.PLUMBING}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.plumbing}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.HEATING_COOLING}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.heating_cooling}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.WINDOWS}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.windows}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.BEDROOMS}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.bedrooms}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.BATHROOMS}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {' '}
                  {view?.bathrooms}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.GARAGE}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {' '}
                  {view?.garage}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.FENCING}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {' '}
                  {view?.fencing}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.FIREPLACE}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {' '}
                  {view?.fireplace}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {' '}
                  {compsView.ADDITIONAL_AMENITIES}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view &&
                    view?.res_comp_amenities &&
                    view.res_comp_amenities
                      .map((ele: any) => ele.additional_amenities)
                      .join(', ')}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.OTHER_AMENITIES}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {' '}
                  {view?.other_amenities}
                </p>
              </div>
            </div>
          </div>
          <div className="flex py-3 w-full justify-between items-center">
            <Divider textAlign="left" className="text-[15px] font-bold">
              {compsView.TRANSACTION_DETAILS}
            </Divider>
            <div className="h-[1px] w-[85%] bg-[#E4E4E4]"></div>
          </div>
          <div className="bg-[#F9F9F9] p-3 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-[#6D7F8A]">
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.SALE_PRICE}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {'$' + formattedSalePrice}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.DATE_SOLD}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {formattedDate}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.LIST_PRICE}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.list_price ? '$' + formattedListPrice : 'N/A'}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.LIST_DATE}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {formattedDateString === '//' ? '' : formattedDateString}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.DAYS_ON_MARKET}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.days_on_market}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.TOTAL_CONCESSIONS}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.total_concessions
                    ? '$' + formattedTotalConcessions
                    : 'N/A'}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.SELLER}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.offeror_id &&
                  view?.offeror_type === compsView.PERSON ? (
                    <div>
                      {clientData?.data?.data?.first_name +
                        ' ' +
                        clientData?.data?.data?.last_name}
                    </div>
                  ) : view?.offeror_id &&
                    view?.offeror_type === compsView.COMPANY ? (
                    <div>{companyData?.data?.data?.company_name}</div>
                  ) : (
                    <div>{ListingEnum.NA}</div>
                  )}
                </p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-xs leading-4">
                  {compsView.BUYER}
                </h4>
                <p className="pt-1.5 text-xs font-medium leading-5">
                  {view?.acquirer_id &&
                  view?.acquirer_type === compsView.PERSON ? (
                    <div>
                      {clientData1?.data?.data?.first_name +
                        ' ' +
                        clientData1?.data?.data?.last_name}
                    </div>
                  ) : view?.acquirer_id &&
                    view?.acquirer_type === compsView.COMPANY ? (
                    <div>{companyData1?.data?.data?.company_name}</div>
                  ) : (
                    <div>{ListingEnum.NA}</div>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Grid>
        <Grid item xs={5} className="flex flex-col justify-between p-0">
          <div className="py-4 px-6 flex flex-col gap-14">
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
                      onClick={() => navigate('/res_comps')}
                      // onClick={() => {
                      //   if (propertyId && approachId) {
                      //     navigate(
                      //       `/filter-lease-comps?id=${propertyId}&approachId=${approachId}`
                      //     );
                      //   } else if (
                      //     localStorage.getItem('activeType') ===
                      //     'building_with_land'
                      //   ) {
                      //     navigate('/comps', { state: { typeView: check } });
                      //   } else {
                      //     navigate('/res_comps', {
                      //       state: { typeView: check },
                      //     });
                      //   }
                      // }}
                      style={{
                        borderRadius: '0 0 0 10px',
                        textTransform: 'capitalize',
                        width: '97px',
                        height: '36px',
                      }}
                    >
                      {compsView.BACK_TO_COMPS}
                    </CommonButton>

                    <CommonButton
                      variant="contained"
                      className="text-xs"
                      color="primary"
                      onClick={() => {
                        navigate(`/residential-update-comps/${id}`);
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
                  </>
                )}
              </>
            </div>
            <div className="flex items-center justify-center">
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
            <CompViewGooleMapLocation GoogleData={view} />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

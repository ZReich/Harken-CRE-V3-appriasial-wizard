import { useEffect, useState } from 'react';
import CommonButton from '@/components/elements/button/Button';
import { Box, Stack } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import DeleteConfirmationModal from './delete-confirmation';
import { Icons } from '@/components/icons';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import { ClearIcon } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/date-format';
import print from '../../../images/print.svg';
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';
import AiImage from '../../../images/AI SVG.svg';

import { ListingEnum, PaginationEnum, CreateCompsEnum } from '../enum/CompsEnum';
import NoImageUpload from '../../../images/list.jpg';
import axios from 'axios';
import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';

interface CompsListingMapProps {
  typeFilter: string;
  typeProperty: any;
  searchValuesByfilter: string;
  sidebarFilters: FilterComp | null;
  getType: any;
  isOpen: any;
  passDataCheckType: any;
  passSetCheckType: any;
  sortingSettings: any;
  checkType: any;
  setCheckType: any;
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  compFilters?: any;
  uploadCompsStatus?: any;
  onResetSearch?: () => void; // Add the reset search callback
}

interface typeResponse {
  data: {
    data: {
      comps: IComp[];
      page: number;
      perPage: number;
      totalRecord: number;
      compFilters?: any;
    };
  };
}
interface paramsType extends Partial<FilterComp> {
  type: any;
  limit: any;
  page: any;
  compStatus?: any;
  propertyType?: any;
  search?: any;
  orderByColumn?: any;
  orderBy?: any;
  state?: any;
  street_address?: any;
  cap_rate_min?: any;
  cap_rate_max?: any;
  price_sf_min?: any;
  price_sf_max?: any;
  land_sf_min?: any;
  land_sf_max?: any;
  square_footage_min?: any;
  square_footage_max?: any;
  building_sf_min?: any;
  building_sf_max?: any;
  start_date?: any;
  end_date?: any;
  city?: any;
  land_dimension: any;
  compFilters?: any;
}
let rowsPerPage: number = 4;

const CompsListingMap: React.FC<CompsListingMapProps> = ({
  typeFilter,
  searchValuesByfilter,
  sidebarFilters,
  typeProperty,
  getType,

  passSetCheckType,
  sortingSettings,
  checkType,
  setCheckType,
  setLoading,
  loading,
  selectedToggleButton,
  page,
  setPage,
  uploadCompsStatus,
  compFilters,
  onResetSearch, // Add the callback for resetting search
}) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const parameterType =
    checkType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;
  const mutation = useMutate<typeResponse, paramsType>({
    queryKey: `list/${parameterType}`,
    endPoint: 'comps/list',
    requestType: RequestType.POST,
  });
  console.log('compFilterslisyjkh', compFilters);
  useEffect(() => {
    getType(parameterType);
  }, [parameterType]);
  const compsPropertyType = localStorage.getItem('property_type');
  const compsPropertyType1: string[] = compsPropertyType
    ? compsPropertyType.split(',')
    : [];
  const compStatus = localStorage.getItem('compStatus') || '';

  useEffect(() => {
    const fetchData = async () => {
      const state = localStorage.getItem('state') || null;
      const street_address = localStorage.getItem('street_address') || null;
      const cap_rate_min = localStorage.getItem('cap_rate_min')
        ? Number(localStorage.getItem('cap_rate_min')!.replace('%', ''))
        : null;
      const cap_rate_max = localStorage.getItem('cap_rate_max')
        ? Number(localStorage.getItem('cap_rate_max')!.replace('%', ''))
        : null;
      const price_sf_min = localStorage.getItem('price_sf_min')
        ? parseFloat(localStorage.getItem('price_sf_min')!.replace(/,/g, ''))
        : null;
      const price_sf_max = localStorage.getItem('price_sf_max')
        ? parseFloat(localStorage.getItem('price_sf_max')!.replace(/,/g, ''))
        : null;
      const land_sf_min = localStorage.getItem('land_sf_min')
        ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
        : null;
      const building_sf_min = localStorage.getItem('building_sf_min')
        ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
        : null;
      const building_sf_max = localStorage.getItem('building_sf_max')
        ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
        : null;
      const land_sf_max = localStorage.getItem('land_sf_max')
        ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
        : null;

      const start_date = localStorage.getItem('start_date') || null;
      const end_date = localStorage.getItem('end_date') || null;

      const square_footage_min = localStorage.getItem('square_footage_min')
        ? parseFloat(
            localStorage.getItem('square_footage_min')!.replace(/,/g, '')
          )
        : null;
      const square_footage_max = localStorage.getItem('square_footage_max')
        ? parseFloat(
            localStorage.getItem('square_footage_max')!.replace(/,/g, '')
          )
        : null;
      const lease_type = localStorage.getItem('lease_type') || null;

      const city = localStorage.getItem('selectedCities')
        ? JSON.parse(localStorage.getItem('selectedCities')!)
        : [];
      const compType = localStorage.getItem('activeType');

      const params: paramsType = {
        limit: 10,
        land_dimension:
          !localStorage.getItem('selectedSize') ||
          localStorage.getItem('selectedSize') === 'SF'
            ? 'SF'
            : 'ACRE',
        comp_type: compType,
        page: page,
        propertyType: compsPropertyType1.length ? compsPropertyType1 : null,
        orderByColumn: sortingSettings.sortingType || ListingEnum.DATE_SOLD,
        type: parameterType,
        search: searchValuesByfilter,
        orderBy: sortingSettings.orderSorting || 'DESC',
        compStatus: compStatus ? compStatus : '',
        ...(state ||
        street_address ||
        cap_rate_min ||
        cap_rate_max ||
        price_sf_min ||
        price_sf_max ||
        land_sf_min ||
        land_sf_max ||
        square_footage_min ||
        square_footage_max ||
        building_sf_min ||
        building_sf_max ||
        start_date ||
        city ||
        end_date ||
        lease_type
          ? {
              state,
              street_address,
              cap_rate_min,
              cap_rate_max,
              price_sf_min,
              price_sf_max,
              land_sf_min,
              land_sf_max,
              square_footage_min,
              square_footage_max,
              building_sf_max,
              building_sf_min,
              city,
              start_date,
              lease_type,
              end_date,
            }
          : sidebarFilters),
      };

      try {
        await mutation.mutateAsync(params);
      } catch (error) {
        console.error('Error while mutating data:', error);
      }
    };

    fetchData();
  }, [
    page,
    parameterType,
    typeFilter,
    searchValuesByfilter,
    sidebarFilters,
    typeProperty,
    sortingSettings,
    compsPropertyType,
    deleteBoolean,
    uploadCompsStatus,
    // compStatus,
  ]);
  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handlePreviousPage = () => {
    setPage((prevPage: any) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage: any) => Math.max(prevPage + 1, 1));
  };

  const deleteListingItem = (id: number) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const updateListingItem = (id: number) => {
    localStorage.setItem('view', 'android');
    setDeleteId(id);
    const filters: { search: string } = { search: searchValuesByfilter };
    navigate(`/update-comps/${id}`, {
      state: {
        selectedToggleButton: selectedToggleButton || null,
        filters,
      },
    });
  };

  const viewListingItem = (id: number) => {
    let check;
    if (checkType === 'salesCheckbox') {
      check = 'sales';
    } else {
      check = 'lease';
    }
    const filters: { search: string } = { search: searchValuesByfilter };
    navigate(`/comps-view/${id}/${check}`, {
      state: {
        selectedToggleButton: selectedToggleButton || null,
        filters,
      },
    });
  };

  const closeCompsModal1 = () => {
    setModalOpen(false);
  };

  const setArrayAfterDelete = (event: any) => {
    setDeleteBoolean(event);
  };

  if (mutation.isLoading) {
    return <>{ListingEnum.LOADING}....</>;
  }

  if (mutation.isError) {
    return <>{ListingEnum.ERROR}....</>;
  }

  rowsPerPage = mutation.data?.data.data.totalRecord || 4;
  const data = mutation.data?.data.data.comps || [];
  const isAllSelected =
    data.every((item) => selectedIds.includes(item.id)) && data.length > 0;

  const handleSelectAll = () => {
    const currentPageIds = data.map((item) => item.id);

    if (isAllSelected) {
      setSelectedIds((prevSelectedIds) =>
        prevSelectedIds.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedIds((prevSelectedIds) => [
        ...prevSelectedIds,
        ...currentPageIds.filter((id) => !prevSelectedIds.includes(id)),
      ]);
    }
  };
  const handleCheckboxToggle = (id: string) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((itemId) => itemId !== id)
        : [...prevSelectedIds, id]
    );
  };

  const downloadComps = async () => {
    // setLoading(true);
    try {
      const payload = {
        compIds: selectedIds,
        comparison:
          localStorage.getItem('activeType') === 'land_only'
            ? selectedToggleButton
            : 'SF',
      };

      const response = await axios.post('comps/download-comp-pdf', payload, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Comps.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLoading(false);
      toast.success(`${CreateCompsEnum.COMPS_DOWNLOADED_SUCCESSFULLY}`);
    } catch (error) {
      console.error(`${CreateCompsEnum.ERROR_DOWNLOADING_COMPS}`, error);
      setLoading(false);
      toast.error(`${CreateCompsEnum.FAILED_TO_DOWNLOAD_COMPS}`);
    }
  };

  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedIds([]);
    // localStorage.removeItem('compStatus');
    const selectedType = e.target.id;
    localStorage.setItem('checkType', e.target.id);
    setCheckType(selectedType);
    passSetCheckType(selectedType);

    ClearAdditionalStorage();

    localStorage.setItem('property_type', '');

    localStorage.removeItem('params');
    localStorage.removeItem('checkStatus');

    // Reset search input when switching between sale and lease
    if (onResetSearch) {
      onResetSearch();
    }

    setPage(1);
  };
  if (loading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }

  return (
    <Box
      style={{ backgroundColor: '#fff' }}
      className="px-3 rounded-lg h-[calc(100vh-220px)] overflow-auto"
    >
      <Box className="bg-customLightGray pt-[5px] pb-4 px-[15px] rounded">
        <Box className="flex justify-between items-center sticky z-10 top-0 py-3 bg-customLightGray">
          {data && data.length === 0 ? (
            <div></div>
          ) : (
            <div className="text-lightBlack ps-2 flex items-center gap-2.5">
              <span className="flex items-center gap-2">
                <label className="comp-select">
                  {ListingEnum.SELECT_ALL}
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="checkmark"></span>
                </label>
              </span>
              <span className="text-sm">
                Showing {(page - 1) * 10 + 1} to{' '}
                {Math.min(page * 10, rowsPerPage)} of {rowsPerPage} entries
              </span>
            </div>
          )}

          <Box className="flex items-center gap-6">
            {selectedIds.length > 0 ? (
              <Box className="flex items-center gap-2.5">
                <p className="text-sm">{ListingEnum.PRINT}({selectedIds.length})</p>
                <img
                  src={print}
                  className="cursor-pointer"
                  onClick={downloadComps}
                />
              </Box>
            ) : (
              <Box className="flex items-center gap-2.5 opacity-50 cursor-not-allowed">
                <p className="text-sm text-gray-400">{ListingEnum.PRINT}</p>
                <img
                  src={print}
                  className="pointer-events-none"
                  onClick={() => toast.error(CreateCompsEnum.PLEASE_SELECT_COMPS)}
                />
              </Box>
            )}

            <Box className="round flex items-center gap-4">
              <Box className="pl-2 flex items-center">
                <input
                  type="checkbox"
                  checked={checkType === 'leasesCheckbox'}
                  onChange={handleCheckboxChange}
                  id="leasesCheckbox"
                />
                <label htmlFor="leasesCheckbox"></label>
                <span className="select-text-content">
                  {ListingEnum.LEASES}
                </span>
              </Box>
              <Box className="round">
                <Box className="pl-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={checkType === 'salesCheckbox'}
                    onChange={handleCheckboxChange}
                    id="salesCheckbox"
                  />
                  <label htmlFor="salesCheckbox"></label>
                  <span className="select-text-content">
                    {ListingEnum.SALES}
                  </span>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {data.length === ListingEnum.ZERO ? (
          <div>{ListingEnum.N0_RECORDS_FOUND}</div>
        ) : (
          data.length &&
          data.map((item: any, index) => {
            return (
              <Box
                className="flex p-[7px] rounded-lg bg-Customwhite mb-3.5 border border-solid border-[#f3f3f3]"
                key={index}
                style={{
                  boxShadow: '4px 7px 5px 7px #00000008',
                }}
              >
                <Box>
                  <label className="comp-select mr-1.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleCheckboxToggle(item.id)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </Box>

                <Box className="w-44 flex items-center">
                  <img
                    className="rounded-md object-cover object-center w-full h-full xl:min-w-[185px] min-w-[125px]"
                    src={
                      item.property_image_url
                        ? import.meta.env.VITE_S3_URL + item.property_image_url
                        : NoImageUpload
                    }
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = NoImageUpload;
                    }}
                  />
                </Box>
                <Box className="py-2 px-9 w-full">
                  <Box className="text-base break-all font-bold pt-2 text-[#0DA1C7] capitalize">
                    {item.street_address}
                  </Box>
                  <Box className="pt-1 text-[15px] leading-[22px]">
                    {item.street_address}
                  </Box>
                  <Box className="text-[15px]">
                    {item.city}, {item.state.toUpperCase()}, {item.zipcode}
                  </Box>
                </Box>
                <Box className="pb-2 pt-3 px-2 w-full text-[15px]">
                  {localStorage.getItem('activeType') === 'land_only' ? (
                    <Box className="py-2">
                      {ListingEnum.TYPE} :{' '}
                      {item.land_type
                        ? (() => {
                            switch (item.land_type) {
                              case 'ag':
                                return 'Agricultural';
                              case 'cbd':
                                return 'Central Business District (CBD)';
                              case 'industrial':
                                return 'Industrial';
                              case 'residential_2_10_units':
                                return 'Residential - 2-10 Units';
                              case 'residential_multi_family':
                                return 'Residential - Multi-Family';
                              case 'residential_single_family':
                                return 'Residential - Single Family';
                              case 'retail_office':
                                return 'Retail/Office';
                              case 'subdivisions':
                                return 'Subdivisions';
                              case 'residential_development':
                                return 'Residential - Development';
                              default:
                                return item.land_type;
                            }
                          })()
                        : ListingEnum.NA}
                    </Box>
                  ) : (
                    <Box className="py-2">
                      {ListingEnum.TYPE} :{' '}
                      {item?.type?.length > ListingEnum.ZERO
                        ? item.type
                            .map((zoning: any) => {
                              switch (zoning) {
                                case 'multi_family':
                                  return 'Multi-Family';
                                case 'office':
                                  return 'Office';
                                case 'retail':
                                  return 'Retail';
                                case 'industrial':
                                  return 'Industrial';
                                case 'hospitality':
                                  return 'Hospitality';
                                case 'special':
                                  return 'Special';
                                case 'residential':
                                  return 'Residential';
                                default:
                                  return zoning.zone || ListingEnum.NA;
                              }
                            })
                            .join(', ')
                        : ListingEnum.NA}
                    </Box>
                  )}

                  <Box className="py-2">
                    {checkType === 'salesCheckbox'
                      ? ListingEnum.SALE_DATE
                      : 'Transaction Date'}{' '}
                    :{' '}
                    {item.date_sold
                      ? `${item.sale_status === 'Pending' ? formatDate(item.date_sold) + ' (P)' : formatDate(item.date_sold)}`
                      : ListingEnum.NA}
                  </Box>
                  {item.comp_type === 'building_with_land' ? (
                    <Box className="py-2">
                      {ListingEnum.YEAR_BUILT_REMODELED} :{' '}
                      {item?.year_built ? item?.year_built : 'N/A'} /{' '}
                      {item?.year_remodeled ? item?.year_remodeled : 'N/A'}
                    </Box>
                  ) : null}
                </Box>
                <Box className="pb-2 pt-3 px-9 w-full text-[15px]">
                  {localStorage.getItem('activeType') !== 'land_only' ? (
                    <Box className="py-2">
                      {ListingEnum.BUILDING_SIZE} :{' '}
                      {item.building_size
                        ? `${item.building_size.toLocaleString()}${' '}SF`
                        : ListingEnum.NA}
                    </Box>
                  ) : null}
                  {localStorage.getItem('activeType') ===
                  'building_with_land' ? (
                    <Box className="py-2">
                      {ListingEnum.LAND_SIZE} :{' '}
                      {item.land_size
                        ? item.land_dimension === 'ACRE'
                          ? (parseFloat(item.land_size) * ListingEnum.SQFT_ACRE).toLocaleString(
                              'en-US',
                              { maximumFractionDigits: 2 }
                            ) + ' SF'
                          : parseFloat(item.land_size).toLocaleString('en-US', {
                              maximumFractionDigits: 2,
                            }) + ' SF'
                        : ListingEnum.NA}
                    </Box>
                  ) : (
                    <Box className="py-2">
                      {ListingEnum.LAND_SIZE} :{' '}
                      {item.land_size
                        ? selectedToggleButton === 'SF'
                          ? item.land_dimension === 'SF'
                            ? parseFloat(item.land_size).toLocaleString(
                                'en-US',
                                {
                                  maximumFractionDigits: 2,
                                }
                              ) + ' SF'
                            : (
                                parseFloat(item.land_size) * ListingEnum.SQFT_ACRE
                              ).toLocaleString('en-US', {
                                maximumFractionDigits: 2,
                              }) + ' SF'
                          : selectedToggleButton === 'AC'
                            ? item.land_dimension === 'ACRE'
                              ? parseFloat(item.land_size)
                                  .toFixed(3)
                                  .toLocaleString() + ' AC'
                              : (parseFloat(item.land_size) / ListingEnum.SQFT_ACRE)
                                  .toFixed(3)
                                  .toLocaleString() + ' AC'
                            : ListingEnum.NA
                        : ListingEnum.NA}
                    </Box>
                  )}
                  {item.comp_type === 'building_with_land' ? (
                    <Box className="py-2">
                      {ListingEnum.CAP_RATE} :{' '}
                      {item.cap_rate ? `${item.cap_rate}%` : ListingEnum.NA}
                    </Box>
                  ) : null}

                  {item.comp_type === 'land_only' ? (
                    <Box className="py-2">
                      {ListingEnum.ZONING} :{' '}
                      {item.zoning_type
                        ? `${item.zoning_type}`
                        : ListingEnum.NA}
                    </Box>
                  ) : null}
                </Box>
                <Box className="py-2 px-9 w-full text-[15px]">
                  <Box className="py-2">
                    {checkType === 'leasesCheckbox' &&
                    item &&
                    item.lease_rate !== null
                      ? ListingEnum.LEASE_RATE
                      : ListingEnum.SALES_PRICE}

                    {checkType === 'leasesCheckbox'
                      ? item && item.lease_rate !== null
                        ? '$' +
                          parseFloat(item.lease_rate).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ''
                      : item && item.sale_price !== null
                        ? parseFloat(item.sale_price).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ''}
                  </Box>
                  {localStorage.getItem('activeType') ===
                  'building_with_land' ? (
                    <Box className="py-2">
                      {checkType === 'leasesCheckbox' &&
                      item &&
                      item?.price_square_foot !== null
                        ? '$/SF/YR : '
                        : ListingEnum.SF}
                      {item.price_square_foot
                        ? `$${item.price_square_foot.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
                        : ListingEnum.NA}
                    </Box>
                  ) : (
                    <Box className="py-2">
                      {checkType === 'leasesCheckbox'
                        ? selectedToggleButton === 'SF'
                          ? '$/SF/YR : '
                          : selectedToggleButton === 'AC'
                            ? '$/Acre/YR : '
                            : null
                        : selectedToggleButton === 'SF'
                          ? '$/SF : '
                          : selectedToggleButton === 'AC'
                            ? '$/Acre : '
                            : null}
                      {item?.price_square_foot
                        ? selectedToggleButton === 'AC'
                          ? `$${(item.price_square_foot * ListingEnum.SQFT_ACRE).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
                          : `$${item.price_square_foot.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
                        : ListingEnum.NA}
                    </Box>
                  )}
                </Box>
                <Box className="w-44 flex flex-col justify-between">
                  <Box className="flex justify-end">
                    <a href={`/comps-view/${item.id}`}>
                      <CommonButton
                        variant="contained"
                        className="text-xs"
                        color="primary"
                        style={{
                          borderRadius: '0 0 0 10px',
                          padding: '7px 30px',
                          textTransform: 'capitalize',
                        }}
                        onClick={(e: any) => {
                          localStorage.setItem('view', 'android');
                          e.preventDefault();
                          viewListingItem(item.id);
                        }}
                      >
                        {ListingEnum.VIEW}
                      </CommonButton>
                    </a>

                    <a
                      href={`/update-comps/${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.button === 0) {
                          updateListingItem(item.id);
                        }
                      }}
                    >
                      <CommonButton
                        variant="contained"
                        className="text-xs"
                        color="primary"
                        style={{
                          borderRadius: '0 10px 0 0',
                          padding: '7px 30px',
                          textTransform: 'capitalize',
                          marginLeft: '3px',
                        }}
                      >
                        {ListingEnum.EDIT}
                      </CommonButton>
                    </a>
                  </Box>
                  {item.ai_generated === 1 && (
                    <img
                      src={AiImage}
                      style={{
                        width: '40px',
                        height: '40px',
                        marginLeft: '139px',
                      }}
                    />
                  )}
                  <Box className="flex justify-end">
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer"
                      onClick={() => deleteListingItem(item?.id)}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Stack direction="row" justifyContent="center" mt={2} mb={1}>
        <button
          className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
          onClick={handlePreviousPage}
          disabled={data?.length === 0 || page === 1}
        >
          {PaginationEnum.PREVIOUS}
        </button>
        <Pagination
          count={data?.length === 0 ? 0 : Math.ceil(rowsPerPage / 10)}
          page={page}
          onChange={handleChangePage}
          className="paginationCard"
          sx={{
            '& .MuiPaginationItem-page.Mui-selected': {
              backgroundColor: '#687F8B',
              color: 'white',
            },
          }}
        />
        <button
          className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= Math.ceil(rowsPerPage / 10) ? 'text-gray-400 cursor-not-allowed' : ''}`}
          disabled={page >= Math.ceil(rowsPerPage / 10)}
          onClick={handleNextPage}
        >
          {PaginationEnum.NEXT}
        </button>
      </Stack>
      {modalOpen ? (
        <CompDeleteModal>
          <div
            className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
            onClick={closeCompsModal1}
          >
            <ClearIcon className="text-3xl" />
          </div>
          <DeleteConfirmationModal
            close={closeCompsModal1}
            deleteId={deleteId}
            setArrayAfterDelete={setArrayAfterDelete}
          />
        </CompDeleteModal>
      ) : null}
    </Box>
  );
};
export default CompsListingMap;

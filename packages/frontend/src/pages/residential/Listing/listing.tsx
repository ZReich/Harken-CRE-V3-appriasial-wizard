import { useEffect, useState } from 'react';
import CommonButton from '@/components/elements/button/Button';
import { Box, Stack } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import {
  IComp,
  FilterComp,
  FilterCompResidential,
} from '@/components/interface/header-filter';
import DeleteConfirmationModal from './delete-confirmation';
import { Icons } from '@/components/icons';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import { ClearIcon } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/date-format';
import { ListingEnum, PaginationEnum } from '../../comps/enum/CompsEnum';
// import listImage from '../../../images/no-photo-available.png';
import { toast } from 'react-toastify';
import axios from 'axios';
import print from '../../../images/print.svg';
import NoImageUpload from '../../../images/list.jpg';
import AiImage from '../../../images/AI SVG.svg';

// import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';

interface CompsListingMapProps {
  typeProperty?: any;
  searchValuesByfilter?: string;
  sidebarFilters?: FilterCompResidential | any;
  sortingSettings?: any;
  isOpen?: any;
  checkType?: any;
  setCheckType?: any;
  passSetCheckType?: any;
  setLoading?: any;
  page?: any;
  setPage?: any;
  uploadCompsStatus?: any;
  typeFilter?: any;
  getType?: any;
  passDataCheckType?: any;
  loading?: any;
}
interface typeResponse {
  data: {
    data: {
      resComps: IComp[];
      page: number;
      perPage: number;
      totalRecord: number;
    };
  };
}
interface paramsType extends Partial<FilterComp> {
  limit: number;
  page: number;
  comp_type?: string;
  propertyType?: string;
  search?: string;
}
let rowsPerPage: number = 4;

const CompsListingMap: React.FC<CompsListingMapProps> = ({
  searchValuesByfilter,
  sidebarFilters,
  typeProperty,
  sortingSettings,
  isOpen,
  checkType,
  setLoading,
  page,
  setPage,
  uploadCompsStatus,
  // setCheckType,
  // passSetCheckType,
}) => {
  const navigate = useNavigate();
  // const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  // const [selectedComps, setSelectedComps] = useState<number[]>([]); // To store selected comps IDs

  const mutation = useMutate<typeResponse, paramsType>({
    queryKey: `list-resi`,
    endPoint: 'resComps/list',
    requestType: RequestType.POST,
  });
  useEffect(() => {
    const fetchData = async () => {
      const propertyType = ListingEnum.PROPERTY_TYPE;

      const params: paramsType = {
        limit: 10,
        page: searchValuesByfilter ? 1 : page,
        orderByColumn: sortingSettings.sortingType
          ? sortingSettings.sortingType
          : ListingEnum.DATE_SOLD,
        search: isOpen !== false ? '' : searchValuesByfilter,
        orderBy: sortingSettings.orderSorting
          ? sortingSettings.orderSorting
          : 'DESC',
        ...sidebarFilters,
      };

      if (sidebarFilters === null) {
        if (
          typeProperty &&
          typeProperty.length &&
          isOpen == false &&
          typeProperty !== 'show_all'
        ) {
          params[propertyType] = typeProperty;
        }
      }

      try {
        await mutation.mutateAsync(params);
      } catch (error) {
        console.error('Error while mutating data:', error);
      }
    };
    fetchData();
    // }, [page, searchValuesByfilter, sidebarFilters, typeProperty, deleteBoolean, sortingType, orderSorting, sortingOrder]);
  }, [
    page,
    searchValuesByfilter,
    sidebarFilters,
    typeProperty,
    deleteBoolean,
    sortingSettings,
    uploadCompsStatus,
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
    setDeleteId(id);
    navigate(`/residential-update-comps/${id}`);
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
  const viewListingItem = (id: number) => {
    navigate(`/res-comps-view/${id}`);
  };
  rowsPerPage = mutation.data?.data.data.totalRecord || 4;
  const data = mutation.data?.data.data.resComps || [];
  // const ResidentialCompsView = (id: number) => {
  //   navigate(`/res-comps-view/${id}`);
  // };
  const isAllSelected =
    data.every((item) => selectedIds.includes(item.id)) && data.length > 0;

  const handleSelectAll = () => {
    const currentPageIds = data.map((item) => item.id); // IDs of items on the current page

    if (isAllSelected) {
      // Deselect only the items from the current page
      setSelectedIds((prevSelectedIds) =>
        prevSelectedIds.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      // Add the current page's IDs to the selected IDs
      setSelectedIds((prevSelectedIds) => [
        ...prevSelectedIds,
        ...currentPageIds.filter((id) => !prevSelectedIds.includes(id)), // Avoid duplicates
      ]);
    }
  };

  // const filterData =
  //   data?.filter((ele: any) => selectedIds.includes(ele.id)) || [];

  // const filterDataIds = filterData?.map((ele) => ele?.id);
  const downloadComps = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'resComps/download-res-comps-pdf',
        { compIds: selectedIds }, // Use selectedIds directly
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Comps.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
      toast.success('Comps downloaded successfully!');
    } catch (error) {
      console.error('Error downloading comps:', error);
      toast.error('Failed to download comps');
    }
  };

  // const handleCheckboxChange = async (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   setSelectedIds([]);
  //   localStorage.removeItem('compStatus');
  //   passSetCheckType(e.target.id);
  //   setCheckType(e.target.id);
  //   setPage(1);
  //   ClearAdditionalStorage();
  // };
  const handleCheckboxToggle = (id: string) => {
    setSelectedIds(
      (prevSelectedIds) =>
        prevSelectedIds.includes(id)
          ? prevSelectedIds.filter((itemId) => itemId !== id) // Remove if already selected
          : [...prevSelectedIds, id] // Add to selection
    );
  };

  // const handleSelectComp = (id: number) => {
  //   setSelectedComps((prev) =>
  //     prev.includes(id) ? prev.filter((compId) => compId !== id) : [...prev, id]
  //   );
  // };
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
                  Select all
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
          {selectedIds.length > 0 ? (
            <Box className="flex items-center gap-2.5 mr-3">
              <p className="text-sm">Print({selectedIds.length})</p>
              <img
                src={print}
                className="cursor-pointer"
                onClick={downloadComps}
              />
            </Box>
          ) : (
            <Box className="flex items-center gap-2.5 mr-3 opacity-50 cursor-not-allowed">
              <p className="text-sm text-gray-400">Print</p>
              <img
                src={print}
                className="pointer-events-none"
                onClick={() => toast.error('Please select Comps')}
              />
            </Box>
          )}
        </Box>
        {data.length === 0 ? (
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
                  {/* <Box className="py-2">
                    {ListingEnum.TYPE} :{' '}
                    {item.comp_type === 'building_with_land'
                      ? ListingEnum.BUILDING_WITH_LAND
                      : item.comp_type === 'land_only'
                        ? ListingEnum.LAND_ONLY
                        : ListingEnum.NA}
                  </Box> */}
                  <Box className="py-2">
                    {ListingEnum.TYPE} :{' '}
                    {item?.res_zonings?.length > 0
                      ? (() => {
                          const zone = item.res_zonings[0]?.zone;
                          switch (zone) {
                            case 'residential':
                              return 'Residential';
                            default:
                              return zone || ListingEnum.NA;
                          }
                        })()
                      : ListingEnum.NA}
                  </Box>
                  <Box className="py-2">
                    {checkType === 'salesCheckbox'
                      ? ListingEnum.SALE_DATE
                      : 'Sale Date'}{' '}
                    :{' '}
                    {item.date_sold
                      ? `${item.sale_status === 'Pending' ? formatDate(item.date_sold) + ' (P)' : formatDate(item.date_sold)}`
                      : ListingEnum.NA}
                  </Box>
                  <Box className="py-2">
                    {ListingEnum.YEAR_BUILT_REMODELED} :{' '}
                    {item?.year_built ? item?.year_built : 'N/A'} /{' '}
                    {item?.year_remodeled ? item?.year_remodeled : 'N/A'}
                  </Box>
                </Box>
                <Box className="pb-2 pt-3 px-9 w-full text-[15px]">
                  {/* <Box className="py-2">
                    {ListingEnum.CAP_RATE} :{' '}
                    {item.cap_rate ? `${item.cap_rate}%` : ListingEnum.NA}
                  </Box> */}
                  <Box className="py-2">
                    {ListingEnum.BUILDING_SIZE} :{' '}
                    {item.building_size
                      ? `${item.building_size.toLocaleString()}${' '}SF`
                      : ListingEnum.NA}
                  </Box>
                  <Box className="py-2">
                    {ListingEnum.LAND_SIZE} :{' '}
                    {item.land_size
                      ? item.land_dimension === 'ACRE'
                        ? (parseFloat(item.land_size) * 43560).toLocaleString(
                            'en-US',
                            { maximumFractionDigits: 2 }
                          ) + ' SF'
                        : parseFloat(item.land_size).toLocaleString('en-US', {
                            maximumFractionDigits: 2,
                          }) + ' SF'
                      : ListingEnum.NA}
                  </Box>
                  <Box className="py-2">
                    {ListingEnum.BED_BATH} :{' '}
                    {item.bedrooms ? item.bedrooms : ListingEnum.NA} /{' '}
                    {item.bathrooms ? item?.bathrooms : ListingEnum.NA}
                  </Box>
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
          className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= Math.floor(rowsPerPage / 10) ? 'text-gray-400 cursor-not-allowed' : ''}`}
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

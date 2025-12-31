import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useMutate, RequestType } from '@/hook/useMutate';
import { useEffect, useState } from 'react';
import { ListingEnum, PaginationEnum } from '@/pages/comps/enum/CompsEnum';
import { Icons } from '@/components/icons';
import { Stack } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { FilterComp } from './interface/appraisal-listing';
import { useNavigate } from 'react-router-dom';
import DeleteModalAppraisalListing from './delete-confirmation';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import { ClearIcon } from '@mui/x-date-pickers';
import { SortingEnum } from '@/pages/comps/enum/CompsEnum';
import { formatDate } from '@/utils/date-format';

interface CompsListingMapProps {
  searchValuesByfilter: string;
  sidebarFilters: FilterComp | null | any;
  sortingSettings: any;
}
let rowsPerPage: number = 4;

const LandOnlyAppraisalListingTable: React.FC<CompsListingMapProps> = ({
  searchValuesByfilter,
  sidebarFilters,
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [orderByColumn, setOrderByColumn] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<SortingEnum>(SortingEnum.DESC);
  const mutation = useMutate<any, any>({
    queryKey: `appraisals-list`,
    endPoint: 'appraisals/list',
    requestType: RequestType.POST,
  });

  const editSetup = async (id: number, position: string) => {
    sessionStorage.setItem('hasSaleType', 'false');
    sessionStorage.setItem('hasIncomeApproch', 'false');
    sessionStorage.setItem('hasCostApproch', 'false');
    setDeleteId(id);
    try {
      if (position === 'overview' || position === 'images') {
        position = '';
      }
      const targetPath = position
        ? position
        : `/update-appraisal-set-up?id=${id}`;
      navigate(targetPath);
    } catch (error) {
      console.error('Network error:', error);
      navigate(`/update-appraisal-set-up?id=${id}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const params = {
        limit: 10,
        page: page,
        orderByColumn: orderByColumn,
        orderBy: orderBy,
        search: searchValuesByfilter,
        compType: localStorage.getItem('activeType'),
        ...sidebarFilters,
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
    searchValuesByfilter,
    sidebarFilters,
    orderByColumn,
    orderBy,
    deleteBoolean,
  ]);

  const deleteListingItem = (id: number) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const closeCompsModal1 = () => {
    setModalOpen(false);
  };

  const setArrayAfterDelete = (event: any) => {
    setDeleteBoolean(event);
  };

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.max(prevPage + 1, 1));
  };
  const handleSort = (column: any) => {
    if (orderByColumn === column) {
      setOrderBy((prevOrderBy) =>
        prevOrderBy === SortingEnum.ASC ? SortingEnum.DESC : SortingEnum.ASC
      );
    } else {
      setOrderByColumn(column);
      setOrderBy(SortingEnum.ASC); // Reset to ascending for a new column
    }
  };

  const data = mutation?.data?.data?.data?.appraisals || [];
  rowsPerPage = mutation.data?.data.data.totalRecords || 4;

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="caption table">
          <TableHead>
            <TableRow>
              <TableCell
                style={{ width: '15%' }}
                // onClick={() => handleSort('business_name')}
              >
                Name
                <span className="relative cursor-pointer">
                  {orderByColumn === 'business_name' &&
                  orderBy === SortingEnum.ASC ? (
                    <Icons.ArrowUp
                      className="absolute top-[-5px]"
                      onClick={() => handleSort('business_name')}
                    />
                  ) : orderByColumn === 'business_name' &&
                    orderBy === SortingEnum.DESC ? (
                    <Icons.ArrowDropDownIcon
                      className="absolute left-[0px] top-[1px]"
                      onClick={() => handleSort('business_name')}
                    />
                  ) : (
                    <span>
                      <Icons.ArrowUp
                        className="absolute top-[-5px]"
                        onClick={() => handleSort('business_name')}
                      />
                      <Icons.ArrowDropDownIcon
                        className="absolute left-[0px] top-[1px]"
                        onClick={() => handleSort('business_name')}
                      />
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell
                style={{ width: '15%' }}
                // onClick={() => handleSort('date_of_analysis')}
              >
                Client
              </TableCell>
              <TableCell
                // onClick={() => handleSort('street_address')}
                style={{ width: '15%' }}
              >
                Address
                <span className="relative cursor-pointer">
                  {orderByColumn === 'street_address' &&
                  orderBy === SortingEnum.ASC ? (
                    <Icons.ArrowUp
                      className="absolute top-[-5px]"
                      onClick={() => handleSort('street_address')}
                    />
                  ) : orderByColumn === 'street_address' &&
                    orderBy === SortingEnum.DESC ? (
                    <Icons.ArrowDropDownIcon
                      className="absolute left-[0px] top-[1px]"
                      onClick={() => handleSort('street_address')}
                    />
                  ) : (
                    <span>
                      <Icons.ArrowUp
                        className="absolute top-[-5px]"
                        onClick={() => handleSort('street_address')}
                      />
                      <Icons.ArrowDropDownIcon
                        className="absolute left-[0px] top-[1px]"
                        onClick={() => handleSort('street_address')}
                      />
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell
                // onClick={() => handleSort('date_of_analysis')}
                style={{ width: '15%' }}
              >
                Inspection Date
                <span className="relative cursor-pointer">
                  {orderByColumn === 'date_of_analysis' &&
                  orderBy === SortingEnum.ASC ? (
                    <Icons.ArrowUp
                      className="absolute top-[-5px]"
                      onClick={() => handleSort('date_of_analysis')}
                    />
                  ) : orderByColumn === 'date_of_analysis' &&
                    orderBy === SortingEnum.DESC ? (
                    <Icons.ArrowDropDownIcon
                      className="absolute left-[0px] top-[1px]"
                      onClick={() => handleSort('date_of_analysis')}
                    />
                  ) : (
                    <span>
                      <Icons.ArrowUp
                        className="absolute top-[-5px]"
                        onClick={() => handleSort('date_of_analysis')}
                      />
                      <Icons.ArrowDropDownIcon
                        className="absolute left-[0px] top-[1px]"
                        onClick={() => handleSort('date_of_analysis')}
                      />
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell
                // onClick={() => handleSort('comp_type')}
                style={{ width: '15%' }}
              >
                Type
                <span className="relative cursor-pointer">
                  {orderByColumn === 'comp_type' &&
                  orderBy === SortingEnum.ASC ? (
                    <Icons.ArrowUp
                      className="absolute top-[-5px]"
                      onClick={() => handleSort('comp_type')}
                    />
                  ) : orderByColumn === 'comp_type' &&
                    orderBy === SortingEnum.DESC ? (
                    <Icons.ArrowDropDownIcon
                      className="absolute left-[0px] top-[1px]"
                      onClick={() => handleSort('comp_type')}
                    />
                  ) : (
                    <span>
                      <Icons.ArrowUp
                        className="absolute top-[-5px]"
                        onClick={() => handleSort('comp_type')}
                      />
                      <Icons.ArrowDropDownIcon
                        className="absolute left-[0px] top-[1px]"
                        onClick={() => handleSort('comp_type')}
                      />
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell
                // onClick={() => handleSort('appraisal_approaches_types')}
                style={{ width: '15%' }}
              >
                Approaches
                <Icons.ArrowUp className="absolute top-[-5px]" />
                <Icons.ArrowDropDownIcon className="absolute left-[0px] top-[1px]" />
              </TableCell>
              <TableCell style={{ width: '10%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 && <p className="3">No Records Found</p>}
            {data.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell className="text-customBlue font-medium cursor-pointer" onClick={() => editSetup(row?.id, row?.position)}>
                  {row.business_name}
                </TableCell>
                <TableCell>
                  {row.client.first_name + ' ' + row.client.last_name}
                </TableCell>
                <TableCell>{row.street_address}</TableCell>
                <TableCell>
                  {row.date_of_analysis
                    ? formatDate(row.date_of_analysis)
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {row.comp_type === 'building_with_land'
                    ? ListingEnum.BUILDING_WITH_LAND
                    : ListingEnum.LAND_ONLY}
                </TableCell>
                <TableCell>
                  {row.appraisal_approaches_types
                    .map((type: string) => {
                      switch (type) {
                        case 'sale':
                          return 'S';
                        case 'income':
                          return 'I';
                        case 'cost':
                          return 'C';
                        case 'lease':
                          return 'L';
                        default:
                          return type;
                      }
                    })
                    .join('/')}
                </TableCell>
                <TableCell>
                  <span>
                    <Icons.EditIcon
                      className="text-dodgerblue cursor-pointer"
                      onClick={() => editSetup(row?.id, row?.position)}
                    />
                  </span>
                  &nbsp;&nbsp;
                  <span>
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer"
                      onClick={() => deleteListingItem(row?.id)}
                    />
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
      </TableContainer>

      {modalOpen ? (
        <CompDeleteModal>
          <div
            className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
            onClick={closeCompsModal1}
          >
            <ClearIcon className="text-[30px]" />
          </div>
          <DeleteModalAppraisalListing
            close={closeCompsModal1}
            deleteId={deleteId}
            setArrayAfterDelete={setArrayAfterDelete}
          />
        </CompDeleteModal>
      ) : null}
    </>
  );
};
export default LandOnlyAppraisalListingTable;

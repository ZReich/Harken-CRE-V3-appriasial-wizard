import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Typography,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  PaginationEnum,
  ListingHeaderEnum,
} from '@/pages/comps/enum/CompsEnum';
import { Icons } from '@/components/icons';
import DeleteModalReport from './delete-template';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import { ClearIcon } from '@mui/x-date-pickers';
import { useGet } from '@/hook/useGet';
import { formatDate } from '@/utils/date-format';
import CreateTemplate from './screen-moals/create-template';
import { ReportTitleEnum } from './Enums/report-template';
import { useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';

const LINES_TO_SHOW = 1;

const MultiLineEllipsisTableCell = styled(TableCell)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '400px',
  height: '40px',
  display: '-webkit-box',
  border: 'none',
  WebkitLineClamp: LINES_TO_SHOW,
  WebkitBoxOrient: 'vertical',
});

interface RowData {
  id: number;
  name: string;
  description: string;
  date_created: string;
}

const TemplateListingTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [passRow, setPassRow] = useState<RowData | undefined>();
  const [searchValuesByfilter, setSearchValuesByfilter] = useState<string>('');
  const [addTemplate, setAddTemplate] = useState(false);
  const [sortBy, setSortBy] = useState('desc');
  const [sortByDate, setSortByDate] = useState('desc');
  const [sortColumn, setSortColumn] = useState('date_created');

  const navigate = useNavigate();

  const { data, refetch } = useGet<any>({
    queryKey: `template/list/${page}`,

    endPoint: `template/list?page=${page}&limit=10&search=${searchValuesByfilter}&orderBy=${sortColumn === 'name' ? sortBy : sortByDate}&orderByColumn=${sortColumn}`,
    config: { enabled: true, refetchOnWindowFocus: false },
  });

  const { data: update, refetch: refetch2 } = useGet<any>({
    queryKey: `template/get/${passRow?.id}`,
    endPoint: `template/get/${passRow?.id}`,
    config: { enabled: !!passRow, refetchOnWindowFocus: false },
  });
  const handleSort = () => {
    setSortBy((prevSortBy) => {
      const newSortBy = prevSortBy === 'desc' ? 'asc' : 'desc';
      setSortColumn('name');

      return newSortBy;
    });
  };

  const handleDateSort = () => {
    setSortByDate((prevSortBy) => {
      const newSortBy = prevSortBy === 'asc' ? 'desc' : 'asc';
      setSortColumn('date_created'); //

      return newSortBy;
    });
  };

  useEffect(() => {
    refetch();
  }, [sortColumn === 'name' ? sortBy : sortByDate, sortColumn]);

  const templateId = update?.data?.data?.id;
  const sectionId = update?.data?.data?.sections[0]?.id;

  useEffect(() => {
    if (templateId) {
      navigate(`/template/${templateId}`);
    }
  }, [templateId, sectionId, navigate]);

  useEffect(() => {
    if (passRow !== undefined) {
      refetch2();
    }
  }, [passRow]);

  useEffect(() => {
    if (searchValuesByfilter || deleteBoolean) {
      refetch();
    }
    if (searchValuesByfilter === '') {
      refetch();
    }
  }, [searchValuesByfilter, deleteBoolean]);

  const editSetup = (row: RowData) => {
    setPassRow(row);
  };

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
    setPage((prevPage) => prevPage + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValuesByfilter(e.target.value);
  };

  const closeModal = () => {
    setAddTemplate(false);
  };

  const add = () => {
    setAddTemplate(true);
  };

  const dataMap: RowData[] = data?.data?.data?.template || [];
  const totalRows = data?.data?.data?.totalRecord || 4;

  return (
    <>
      <div className="flex pt-7 pb-7 px-9">
        <Typography variant="h4" component="h4" className="text-xl font-bold">
          TEMPLATE LIST
        </Typography>
        <div className="flex justify-end absolute right-[20px]">
          <Box className="relative ml-9 flex items-end">
            <Icons.SearchIcon className="text-[#0DA1C7] mr-1 pointer-events-none" />
            <Icons.Input
              className="text-xs !pb-[6px] w-96"
              placeholder="Search Template"
              onChange={handleInputChange}
            />
          </Box>
          <Box className="ml-4">
            <button
              onClick={add}
              className="border-none text-white bg-[#0DA1C7] flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded cursor-pointer"
            >
              {ListingHeaderEnum.ADD_NEW}
              <Icons.AddIcon className="relative text-lg" />
            </button>
          </Box>
        </div>
      </div>

      <TableContainer component={Paper} className="table-head-wrapper">
        <Table aria-label="caption table">
          <TableHead>
            <TableRow>
              <TableCell className="relative">
                {ReportTitleEnum.NAME}
                {sortBy === 'asc' && sortColumn === 'name' ? (
                  <span>
                    {' '}
                    <Icons.ArrowUp
                      className="absolute top-[21px] cursor-pointer"
                      onClick={handleSort}
                    />
                  </span>
                ) : sortBy === 'desc' && sortColumn === 'name' ? (
                  <span className="relative">
                    {' '}
                    <Icons.ArrowDropDownIcon
                      className="absolute top-[1px] cursor-pointer"
                      onClick={handleSort}
                    />
                  </span>
                ) : (
                  <span
                    onClick={handleSort}
                    className="relative cursor-pointer"
                  >
                    <Icons.ArrowUp className="absolute top-[-5px]" />
                    <Icons.ArrowDropDownIcon className="absolute left-[0px] top-[1px]" />
                  </span>
                )}
              </TableCell>
              <TableCell>{ReportTitleEnum.DESCRIPTION}</TableCell>
              <TableCell>
                {ReportTitleEnum.CREATED_DATE}
                {sortByDate === 'asc' && sortColumn === 'date_created' ? (
                  <span className="relative cursor-pointer">
                    {' '}
                    <Icons.ArrowUp
                      className="absolute"
                      onClick={handleDateSort}
                    />
                  </span>
                ) : sortByDate === 'desc' && sortColumn === 'date_created' ? (
                  <span className="relative cursor-pointer">
                    {' '}
                    <Icons.ArrowDropDownIcon
                      className="absolute"
                      onClick={handleDateSort}
                    />
                  </span>
                ) : (
                  <span
                    onClick={handleDateSort}
                    className="relative cursor-pointer"
                  >
                    <Icons.ArrowUp className="absolute top-[-7px]" />
                    <Icons.ArrowDropDownIcon className="absolute top-[-1px] left-[0px]" />
                  </span>
                )}
              </TableCell>
              <TableCell>{ReportTitleEnum.ACTIONS}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataMap.length > 0 ? (
              dataMap.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell style={{ width: '500px' }} className="truncate">
                    <Tooltip
                      className="p-0"
                      title={row.description}
                      placement="bottom-end"
                    >
                      <MultiLineEllipsisTableCell>
                        {row.description}
                      </MultiLineEllipsisTableCell>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatDate(row.date_created)}</TableCell>
                  <TableCell>
                    <span>
                      <Icons.EditIcon
                        className="text-dodgerblue cursor-pointer"
                        onClick={() => editSetup(row)}
                      />
                    </span>
                    <span>
                      <Icons.DeleteIcon
                        className="text-red-500 cursor-pointer"
                        onClick={() => deleteListingItem(row.id)}
                      />
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <div className="py-6 px-4">No matching records found</div>
            )}
          </TableBody>
        </Table>
        <Stack direction="row" justifyContent="center" mt={2} mb={1}>
          <button
            className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${
              page === 1 ? 'text-gray-400 cursor-not-allowed' : ''
            }`}
            onClick={handlePreviousPage}
            disabled={dataMap.length === 0 || page === 1}
          >
            {PaginationEnum.PREVIOUS}
          </button>
          <Pagination
            count={dataMap.length === 0 ? 0 : Math.ceil(totalRows / 10)}
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
            className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${
              page >= Math.floor(totalRows / 10)
                ? 'text-gray-400 cursor-not-allowed'
                : ''
            }`}
            disabled={page >= Math.floor(totalRows / 10)}
            onClick={handleNextPage}
          >
            {PaginationEnum.NEXT}
          </button>
        </Stack>
      </TableContainer>

      {modalOpen && (
        <CompDeleteModal>
          <div
            className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
            onClick={closeCompsModal1}
          >
            <ClearIcon className="text-3xl" />
          </div>
          <DeleteModalReport
            close={closeCompsModal1}
            deleteId={deleteId}
            setArrayAfterDelete={setArrayAfterDelete}
          />
        </CompDeleteModal>
      )}

      {addTemplate && (
        <CompDeleteModal>
          <div
            className="text-right text-gray-500 pr-3 cursor-pointer relative top-[40px] -mt-[31px]"
            onClick={closeModal}
          >
            <ClearIcon className="text-3xl" />
          </div>
          <CreateTemplate />
        </CompDeleteModal>
      )}
    </>
  );
};

export default TemplateListingTable;

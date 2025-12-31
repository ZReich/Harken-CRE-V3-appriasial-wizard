import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useNavigate } from 'react-router-dom';
import { useMutate, RequestType } from '../../hook/useMutate';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import Pagination from '@mui/material/Pagination';
import { Box, Grid, Stack } from '@mui/material';

let rowsPerPage: number = 4;

export default function AccessibleTable() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchValuesByfilter, setSearchValuesByfilter] = useState<string>('');

  const mutation = useMutate<any, any>({
    queryKey: 'account-list',
    endPoint: 'accounts/setting-account-list',
    requestType: RequestType.POST,
  });

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = {
          page: page,
          search: searchValuesByfilter,
          orderByColumn: null,
          limit: 10,
        };
        const response = await mutation.mutateAsync(data);
        if (
          response.data &&
          response.data.data &&
          response.data.data.accounts
        ) {
          setAccounts(response.data.data.accounts);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [page, searchValuesByfilter]);
  const handleNextPage = () => {
    setPage((prevPage) => Math.max(prevPage + 1, 1));
  };

  const editAccountSetting = (id: number) => {
    navigate(`/account-edit/${id}`);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValuesByfilter(e.target.value);
  };

  rowsPerPage =
    mutation.data &&
    mutation.data.data &&
    mutation.data.data.data &&
    mutation.data.data.data.totalRecords;
  const data =
    mutation.data &&
    mutation.data.data &&
    mutation.data.data.data &&
    mutation.data.data.data.totalRecords;

  return (
    <>
      <Box>
        <Box sx={{ marginTop: '35px' }}>
          <Grid
            container
            spacing={2}
            sx={{ marginTop: '32px', marginBottom: '32px' }}
          >
            <Grid
              xs={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '50px',
                fontSize: '23px',
                fontWeight: 600,
              }}
            >
              ACCOUNT LIST
              <div
                onClick={() => navigate('/accounts/create')}
                className="ms-4  flex items-center"
              >
                <Icons.AddCircleIcon className="text-[#0DA1C7] cursor-pointer " />
              </div>
            </Grid>
            <Grid xs={6} className="flex justify-end pe-[50px]">
              <Icons.SearchIcon className="text-[#0DA1C7] mr-1  pointer-events-none ny mt-2 w-[34px] h-[34px] pe-2 " />

              <div>
                <Icons.Input
                  className="text-xs"
                  placeholder="Search Accounts"
                  onChange={handleInputChange}
                  style={{ width: '390px' }}
                />
              </div>
            </Grid>
          </Grid>
        </Box>
        <TableContainer sx={{ marginBottom: '80px' }}>
          <Table aria-label="caption table" className="pb-3">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    paddingLeft: '35px',
                    color: '#687F8B',
                    fontSize: '16px',
                  }}
                >
                  Name
                </TableCell>
                <TableCell sx={{ color: '#687F8B', fontSize: '16px' }}>
                 # Users
                </TableCell>
                <TableCell sx={{ color: '#687F8B', fontSize: '16px' }}>
                 # Comps
                </TableCell>
                <TableCell sx={{ color: '#687F8B', fontSize: '16px' }}>
                  Subscription Type
                </TableCell>
                <TableCell
                  sx={{
                    paddingRight: '50px',
                    color: '#687F8B',
                    fontSize: '16px',
                  }}
                  align="right"
                >
                  Edit
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Data available
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ paddingLeft: '35px', color: '#687F8B' }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={{ color: '#687F8B' }}>{row.users}</TableCell>
                    <TableCell sx={{ color: '#687F8B' }}>{row.comps}</TableCell>
                    <TableCell sx={{ color: '#687F8B' }}>
                      {row.subscription && row.subscription.charAt(0).toUpperCase() + row.subscription.slice(1)}
                    </TableCell>
                    <TableCell
                      style={{ paddingRight: '45px', color: '#687F8B' }}
                      align="right"
                    >
                      <div
                        className="text-right text-[#0DA1C7] pr-3 cursor-pointer mt-[10px]"
                        onClick={() => editAccountSetting(row?.id)}
                      >
                        <Icons.EditIcon />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Stack direction="row" justifyContent="center" mt={5}>
            <button
              className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
              onClick={handlePreviousPage}
              disabled={data?.length === 0 || page === 1}
            >
              Previous
            </button>
            <Pagination
              count={data?.length === 0 ? 0 : Math.ceil(rowsPerPage / 10)}
              page={page}
              onChange={handleChangePage}
              className='paginationCard'
              sx={{
                '& .MuiPaginationItem-page.Mui-selected': {
                  backgroundColor: '#687F8B',
                  color: 'white',
                },
              }}
            />
            <button
              className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= Math.floor(rowsPerPage / 10) ? 'text-gray-400 cursor-not-allowed' : ''}`}
              disabled={page >= Math.floor(rowsPerPage / 10)}
              onClick={handleNextPage}
            >
              Next
            </button>
          </Stack>
          <div className="flex justify-center mt-[50px]">
            <span className="font-thin text-sm">© 2024, Harken CRE, LLC</span>
          </div>
        </TableContainer>
      </Box>
    </>
  );
}

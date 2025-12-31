import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { visuallyHidden } from '@mui/utils';
import { Close as CloseIcon } from '@mui/icons-material';
import { RequestType } from '@/hook';
import { useMutate } from '@/hook/useMutate';
import CommonButton from '@/components/elements/button/Button';
import { FilterListingEnum } from '@/pages/comps/enum/CompsEnum';
import { useFormikContext } from 'formik';
import { Typography } from '@mui/material';
import defaultPropertImage from '../../../../images/default-placeholder.png';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Data {
  id: number;
  name: string;
  street_address: string;
  BuildingSize: number;
  LandSize: number;
  DateSold: number;
  sale_price: number;
  price_square_foot: number;
  cap_rate: number;
  building_size: number;
  land_size: number;
  date_sold: number;
  select?: boolean;
  images?: string[];
}

interface TableComponentProps {
  rowss: Data[];
  onClose: () => void;
  dataHandle: any;
  dataLength: any;
  tableLength: number;
  tableData: any;
  formvalues: any;
}

function createData(
  id: number,
  name: string,
  street_address: string,
  BuildingSize: number,
  LandSize: number,
  DateSold: number,
  sale_price: number,
  price_square_foot: number,
  cap_rate: number,
  building_size: number,
  land_size: number,
  date_sold: number
): Data {
  return {
    id,
    name,
    street_address,
    BuildingSize,
    LandSize,
    DateSold,
    sale_price,
    price_square_foot,
    cap_rate,
    building_size,
    land_size,
    date_sold,
  };
}

const rows = [
  createData(
    1, // id
    'Image', // name
    '123 Street Name', // street_address
    4, // BuildingSize
    6, // LandSize
    5, // DateSold
    500000, // sale_price
    300, // price_square_foot
    5, // cap_rate
    1000, // building_size
    5000, // land_size
    20210801 // date_sold
  ),
];

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'select' as any,
    numeric: false,
    disablePadding: true,
    label: 'Select',
  },
  {
    id: 'images' as any,
    numeric: false,
    disablePadding: true,
    label: 'Images',
  },
  {
    id: 'street_address',
    numeric: false,
    disablePadding: false,
    label: 'Address',
  },
  {
    id: 'sale_price',
    numeric: true,
    disablePadding: false,
    label: 'Sale Price',
  },
  {
    id: 'price_square_foot',
    numeric: true,
    disablePadding: false,
    label: '$/SF',
  },
  {
    id: 'cap_rate',
    numeric: true,
    disablePadding: false,
    label: 'CAP Rate',
  },
  {
    id: 'BuildingSize',
    numeric: true,
    disablePadding: false,
    label: 'Building Size',
  },
  {
    id: 'LandSize',
    numeric: true,
    disablePadding: false,
    label: 'Land Size',
  },
  {
    id: 'DateSold',
    numeric: true,
    disablePadding: false,
    label: 'Date Sold',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
    newOrder: any
  ) => void;
  order: Order;
  orderBy: keyof Data; // Make sure this matches the type
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onRequestSort, order, orderBy } = props;

  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      const newOrder = orderBy === property && order === 'asc' ? 'desc' : 'asc';
      console.log('Clicked:', property, 'New Order:', newOrder); // Debug log
      onRequestSort(event, property, newOrder);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell: any) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'left' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id !== 'select' && headCell.id !== 'images' ? (
              <TableSortLabel
                active={true}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
                hideSortIcon={false}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  onClose: () => void;
  handleSubmit: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { onClose, handleSubmit } = props;

  return (
    <Box className="modal-header-image relative flex flex-col p-4">
      <Box className="advance-Filter text-customDeeperSkyBlue font-bold text-base">
        <h4 className="text-xs text-white">Results Format</h4>
      </Box>

      <div className="text-center">
        <h2 className="text-[22px] font-normal text-white">ADVANCED FILTER</h2>
        <p className="text-sm text-white">
          Can't find what you're looking for? Create a new comp by
          <Link to="/create-comps" className="no-underline text-[#0DA1C7]">
            &nbsp; clicking here
          </Link>
          .
        </p>
      </div>

      <Box
        className="mt-7  flex items-center gap-8"
        sx={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}
      >
        <CommonButton
          style={{ width: '241px', display: 'flex', background: '#0DA1C7' }}
          variant="contained"
          type="button"
          onClick={onClose}
          isButtonVisible={FilterListingEnum.MAP_SEARCH_FILTER}
        >
          {FilterListingEnum.ADJUST_SEARCH}
        </CommonButton>
        <CommonButton
          style={{ width: '293px', display: 'flex' }}
          variant="contained"
          type="button"
          onClick={handleSubmit}
          isButtonVisible={FilterListingEnum.MAP_SEARCH_FILTER}
        >
          {FilterListingEnum.LINK_SELECTED_COMPS}
        </CommonButton>
        <CommonButton
          style={{ width: '94px', display: 'flex' }}
          variant="contained"
          type="button"
          onClick={onClose}
          isButtonVisible={FilterListingEnum.MAP_SEARCH_FILTER}
        >
          {FilterListingEnum.CLOSE}
        </CommonButton>
        <IconButton
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            position: 'absolute',
            right: 0,
            top: 0,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
const CostTableComponent: React.FC<TableComponentProps> = ({
  rowss,
  onClose,
  dataHandle,
  tableLength,
  tableData,
  formvalues,
}: any) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [orderBy, setOrderBy] = React.useState<keyof Data>('street_address');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [error, setError] = React.useState('');
  const [page] = React.useState(0);
  const [dense] = React.useState(false);
  const [rowsPerPage] = React.useState(5);
  const [, setIsModalOpen] = React.useState(true);
  const { values } = useFormikContext();

  const mutation = useMutate<any, any>({
    queryKey: 'filter',
    endPoint: '/appraisals/get-selected-comps/',
    requestType: RequestType.POST,
  });

  const stateAbbreviation = formvalues.state;
  const stateLabel = usa_state[0][stateAbbreviation] || 'State not found';

  console.log(stateLabel, 'stateLabel');

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast('Please select comps.');
      return;
    }

    try {
      const params = { compIds: selectedIds };
      const response = await mutation.mutateAsync(params);

      if (response?.data) {
        console.log('response data', response?.data.data);

        const comps = response?.data?.data || [];
        const updatedComps = comps.map(({ id, ...restComp }: any) => {
          return {
            ...restComp,
            comp_id: id,
            expenses: (values as any).operatingExpenses.map((exp: any) => ({
              ...exp,
              adj_value: 0,
              comparison_basis: 0,
            })),
            adjusted_psf: restComp.price_square_foot,
          };
        });
        console.log(updatedComps, 'updatedComps');
        dataHandle(updatedComps);
        setIsModalOpen(false);
        setError('');
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Filter submission error:', error);
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    console.log(event);
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  console.log('check tabledatalength', tableData);
  const handleClick = (_event: React.MouseEvent<unknown>, id: number) => {
    const maxLength = 4 - tableLength;
    setSelected((old) => {
      console.log(`Currently selected comps: ${old.length}`); // Log the number of selected comps
      if (old.includes(id)) {
        // Unchecking an item
        const newSelected = old.filter((compId) => compId !== id);

        // Clear the error if the number of selected items is now below the limit
        if (newSelected.length < maxLength) {
          setError('');
        }
        return newSelected;
      } else {
        // Checking an item
        if (old.length < maxLength) {
          console.log(id, 'id push');
          setError('');
          return [...old, id];
        } else {
          if (tableLength === 0) {
            toast('You can only link a maximum of 4 comps.');
          } else {
            toast(
              ` ${tableLength} already selected.Now you can only link a maximum of ${maxLength} comps.`
            );
          }
          // Show toast with current selection count and max length

          // toast(` ${alreadySelectedCount} already selected.Now you can only link a maximum of ${maxLength} comps.`);
          return old;
        }
      }
    });

    setSelectedIds((old) => {
      console.log(`Currently selected IDs: ${old.length}`); // Log the number of selected IDs

      if (old.includes(id)) {
        old = old.filter((compId) => compId !== id);
      } else {
        if (old.length < maxLength) {
          console.log(id, 'id push');
          old.push(id);
        } else {
          return [...old];
        }
      }

      return [...old];
    });
  };

  const isSelected = (id: number) => {
    console.log(selectedIds, 'selectedIds');
    console.log(id, 'rowid');

    return selectedIds.includes(id);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%', height: '870px' }}>
      {' '}
      {/* Set the desired height */}
      <Paper sx={{ width: '100%', height: '100%', mb: 2 }}>
        {' '}
        {/* Ensure Paper fills the Box */}
        {error && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100px',
            }}
          >
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </Box>
        )}
        <EnhancedTableToolbar
          numSelected={selected.length}
          onClose={() => {
            setIsModalOpen(false);
            onClose();
          }}
          handleSubmit={handleSubmit}
        />
        <TableContainer
          component={Paper}
          style={{
            maxHeight: '700px',
            overflow: 'auto',
            paddingLeft: '26px',
            paddingRight: '26px',
          }}
        >
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {rowss.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ borderBottom: 'none' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px', // Adjust height as needed
                      }}
                    >
                      <Typography variant="h6" color="textSecondary">
                        No Data Found in
                        <strong>&nbsp;{stateLabel}&nbsp;</strong>
                        state
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rowss.map((row: any, index: any) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        <img
                          style={{ paddingTop: '11px', paddingBottom: '11px' }}
                          className="w-[53%] min-w-[100px] h-[103px] object-cover"
                          src={
                            row.property_image_url
                              ? import.meta.env.VITE_S3_URL +
                                row.property_image_url
                              : defaultPropertImage
                          }
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = defaultPropertImage;
                          }}
                          alt="building img"
                        />
                      </TableCell>
                      <TableCell align="left">
                        {row?.street_address && row?.city
                          ? `${row.street_address}, ${row.city}`
                          : row?.street_address || row?.city || '--'}
                      </TableCell>
                      <TableCell align="left">
                        {row.sale_price != null
                          ? `$${Number(row.sale_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="left">
                        {row.price_square_foot
                          ? `$${Number(row.price_square_foot).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="left">{row.cap_rate}%</TableCell>
                      <TableCell align="left">
                        {row.building_size
                          ? `${Number(row.building_size).toLocaleString()} SF`
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="left">
                        {row.land_size
                          ? `${Number(row.land_size).toLocaleString()} SF`
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="left">
                        {row.sale_status === 'Pending' ? (
                          <>
                            {row.date_sold
                              ? new Intl.DateTimeFormat('en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                })
                                  .format(new Date(row.date_sold))
                                  .replace(
                                    /(\d{2})\/(\d{2})\/(\d{4})/,
                                    '$3/$1/$2'
                                  )
                              : 'No date available'}
                            <span style={{ marginLeft: '5px' }}>(P)</span>
                          </>
                        ) : row.date_sold ? (
                          new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                            .format(new Date(row.date_sold))
                            .replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3/$1/$2')
                        ) : (
                          'No date available'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={8} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CostTableComponent;

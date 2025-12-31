import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import ExhibitsHeader from './header';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSearchParams } from 'react-router-dom';
import AppraisalMenu from '../set-up/appraisa-menu';
import { useGet } from '@/hook/useGet';
import SortableRow from './sortable-row';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import DeleteModalAppraisalExhibits from './delete-confirmation';
import { ClearIcon } from '@mui/x-date-pickers';
import UploadImageExhibits from '@/components/upload-images-exhibits';
import loadingImage from '../../../images/loading.png';
import { useMutate, RequestType } from '@/hook/useMutate';
import { Icons } from '@/components/icons';
import { Button } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import { useNavigate } from 'react-router-dom';
import { AppraisalEnum } from '../set-up/setUpEnum';

type ItemType = {
  id: string;
  filename: string;
  dir: string;
  appraisal_id: any;
};

const ExhibitsListing = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [deleteId, setDeleteId] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [idExhibit, setExhibit] = useState<string>('');
  const [items, setItems] = useState<ItemType[]>([]);
  const [loaderClassName, setLoaderClassName] = useState(false);
  const navigate = useNavigate();

  const [filteredData, setFilteredData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCostdData, setFilteredCostsData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereLeasedData, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filteredRentRollData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const {
    data: dataGet,
    refetch,
    isLoading,
  } = useGet<any>({
    queryKey: `appraisals/get-files/${id}`,
    endPoint: `appraisals/get-files/${id}?origin=APPRAISAL_EXHIBITS`,
    config: { refetchOnWindowFocus: false },
  });

  const { data: datas } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: {},
  });

  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/update-position',
    endPoint: `appraisals/update-position/${id}`,
    requestType: RequestType.PATCH,
  });
  const { mutate:mutate1 } = useMutate<ResponseType, any>({
      queryKey: 'appraisals/update-positions',
      endPoint: `appraisals/update-positions/${id}`,
      requestType: RequestType.PATCH,
    });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      const response = await mutateAsync({
        position: ApiUrl,
      });
      console.log('Update successful:', response);
    };
    updatePositionWithCurrentUrl();
    console.log('idExhibit', idExhibit);
  }, [id, mutateAsync]);

  const [hasSaleType, setHasSaleType] = useState(false);
  const [hasCostType, setHasCostType] = useState(false);
  const [hasIncomeType, setHasIncomeType] = useState(false);
  const [hasLeaseType, setHasLeaseType] = useState(false);
  const [hasRentRollType, setHasRentRollType] = useState(false);

  useEffect(() => {
    if (datas?.data?.data?.appraisal_approaches && !datas.isStale) {
      const updateData = datas.data.data.appraisal_approaches;
      const salesApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'sale'
      );
      setHasSaleType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const costApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'cost'
      );
      setHasCostType(costApproaches.length > 0);
      setFilteredCostsData(costApproaches);

      const incomeApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'income'
      );
      setHasIncomeType(incomeApproaches.length > 0);
      setFilteredData(incomeApproaches);

      const leaseApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'lease'
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeaseData(leaseApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'rent_roll'
      );
      setHasRentRollType(rentRollApproaches.length > 0);
      setFilteredRentRollData(rentRollApproaches);
    }
  }, [datas?.data?.data?.appraisal_approaches]);

  const templateIds = datas?.data?.data?.template?.id;
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, keyboardSensor);

  useEffect(() => {
    setItems(dataGet?.data?.data || []);
    console.log(dataGet?.data, 'dataGet?.data?.data');
  }, [dataGet]);

  useEffect(() => {
    const fetchData = async () => {};
    fetchData();
  }, [deleteBoolean]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeRowData = items.find((item) => item.id === active.id);
    if (activeRowData) {
      setExhibit(activeRowData.appraisal_id);
    }

    const activeIndex = items.findIndex((item) => item.id === active.id);
    const overIndex = items.findIndex((item) => item.id === over.id);

    if (activeIndex !== overIndex) {
      const newItems = arrayMove(items, activeIndex, overIndex);

      const updatedExhibits = newItems.map((item, index) => ({
        id: item.id,
        order: index + 1,
      }));

      setItems(newItems);

      const data = {
        exhibits: updatedExhibits,
      };

      try {
        setTimeout(async () => {
          await mutate1(data);
        }, 100);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const deleteListingItem = (row: any) => {
    setDeleteId(row.id);
    setModalOpen(true);
  };

  const closeCompsModal1 = () => {
    setModalOpen(false);
  };

  const setArrayAfterDelete = (event: any) => {
    setDeleteBoolean(event);
  };

  if (isLoading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }
  console.log(loaderClassName, 'loaderClassName');
  return (
    <AppraisalMenu>
      <ExhibitsHeader />
      <div>
        <UploadImageExhibits
          refetch={refetch}
          setLoaderClassName={setLoaderClassName}
          loaderClassName={loaderClassName}
        />
      </div>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="xl:px-[60px] px-[15px]">
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <TableContainer
              component={Paper}
              style={{ padding: '0px auto 90px' }}
            >
              <Table sx={{ minWidth: 650 }} aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row, index) => (
                    <SortableRow
                      key={row.id}
                      row={row}
                      index={index}
                      deleteListingItem={deleteListingItem}
                      onUpdate={refetch}
                      appraisalId={id}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {modalOpen ? (
              <CompDeleteModal>
                <div
                  className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
                  onClick={closeCompsModal1}
                >
                  <ClearIcon className="text-3xl" />
                </div>
                <DeleteModalAppraisalExhibits
                  close={closeCompsModal1}
                  deleteId={deleteId}
                  setArrayAfterDelete={setArrayAfterDelete}
                  refetch={refetch}
                />
              </CompDeleteModal>
            ) : null}
          </SortableContext>
        </div>
      </DndContext>
      <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5">
        <Button
          variant="contained"
          color="primary"
          size="small"
          className="appraisal-previous-button text-xs p-3 text-white font-medium"
          onClick={() => {
            if (hasCostType) {
              navigate(
                `/cost-approach-improvement?id=${id}&costId=${filtereCostdData?.[filtereCostdData.length - 1]?.id}`
              );
            } else if (hasLeaseType) {
              navigate(
                `/lease-comps-map?id=${id}&leaseId=${filtereLeasedData?.[filtereLeasedData.length - 1]?.id}`
              );
            } else if (hasSaleType) {
              navigate(
                `/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
              );
            } else if (hasRentRollType) {
              navigate(
                `/rent-roll?id=${id}&appraisalId=${filteredRentRollData?.[filteredRentRollData.length - 1]?.id}`
              );
            } else if (hasIncomeType) {
              navigate(
                `/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - 1]?.id}`
              );
            } else {
              navigate(`/overview?id=${id}`);
            }
          }}
        >
          <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
        </Button>

        <CommonButton
          type="submit"
          variant="contained"
          color="primary"
          size="small"
          onClick={() =>
            navigate(
              datas?.data?.data?.template == null
                ? `/report?id=${id}`
                : `/report-template?id=${id}&template_id=${templateIds}`
            )
          }
          style={{ width: '300px', fontSize: '14px' }}
        >
          {AppraisalEnum.SAVE_AND_CONTINUE}
          <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
        </CommonButton>
      </div>
      <p className="text-center pt-9 text-xs text-lightBlack">
        © 2024, Harken CRE, LLC
      </p>
    </AppraisalMenu>
  );
};

export default ExhibitsListing;

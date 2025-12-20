import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@mui/material';
import { ClearIcon } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import loadingImage from '../../../../images/loading.png';
import { EvaluationEnum } from '../../set-up/evaluation-setup-enums';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import DeleteModalResidentialExhibits from './residential-delete-exhibits-confirmation';
import ResidentialDragAndDropRow from './residential-exhibits-drag-drop';
import ResidentialUploadImageExhibits from './residential-upload-exhibits-image';
import { ResidentialExhibitsEnum } from './residential-exhibits-enum';
type ItemType = {
  id: string;
  filename: string;
  dir: string;
  evaluation_id: any;
};

const ResidentialExhibitsListing = () => {
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
    queryKey: `res-evaluations/get-files/${id}`,
    endPoint: `res-evaluations/get-files/${id}?origin=EVALUATION_EXHIBITS`,
    config: { refetchOnWindowFocus: false },
  });
  console.log(dataGet, 'dataGetdataGet');
  const { data: datas } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: {},
  });
  console.log(datas, 'residentialdatas');

  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'res-evaluations/update-position',
    endPoint: `res-evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });
  const { mutate: mutate1 } = useMutate<ResponseType, any>({
    queryKey: 'res-evaluations/update-exhibit-position',
    endPoint: `res-evaluations/update-exhibit-position/${id}`,
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
    if (datas?.data?.data?.res_evaluation_scenarios && !datas.isStale) {
      const updateData = datas.data.data.res_evaluation_scenarios;
      const salesApproaches = updateData.filter(
        (item: { has_sales_approach: any }) => item.has_sales_approach === 1
      );
      setHasSaleType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const costApproaches = updateData.filter(
        (item: { has_cost_approach: any }) => item.has_cost_approach === 1
      );
      setHasCostType(costApproaches.length > 0);
      setFilteredCostsData(costApproaches);

      const incomeApproaches = updateData.filter(
        (item: { has_income_approach: any }) => item.has_income_approach === 1
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
  }, [datas?.data?.data?.res_evaluation_scenarios]);

  // const templateIds = datas?.data?.data?.template?.id;
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
    const fetchData = async () => { };
    fetchData();
  }, [deleteBoolean]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeRowData = items.find((item) => item.id === active.id);
    if (activeRowData) {
      setExhibit(activeRowData.evaluation_id);
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
    <ResidentialMenuOptions>
      {/* <EvaluationHeader /> */}
      <div>
        <ResidentialUploadImageExhibits
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
                    <TableCell>{ResidentialExhibitsEnum.ORDER}</TableCell>
                    <TableCell>{ResidentialExhibitsEnum.TITLE}</TableCell>
                    <TableCell>{ResidentialExhibitsEnum.FILE}</TableCell>
                    <TableCell>{ResidentialExhibitsEnum.ACTIONS}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row, index) => (
                    <ResidentialDragAndDropRow
                      key={row.id}
                      row={row}
                      index={index}
                      deleteListingItem={deleteListingItem}
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
                <DeleteModalResidentialExhibits
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
                `/residential/evaluation/cost-approach-improvement?id=${id}&costId=${filtereCostdData?.[filtereCostdData.length - 1]?.id}`
              );
            } else if (hasLeaseType) {
              navigate(
                `/evaluation/lease-comps-map?id=${id}&leaseId=${filtereLeasedData?.[filtereLeasedData.length - 1]?.id}`
              );
            } else if (hasSaleType) {
              navigate(
                `/residential/evaluation/sales-comps-map?id=${id}&salesId=${filtereSalesdData?.[filtereSalesdData.length - 1]?.id}`
              );
            } else if (hasRentRollType) {
              navigate(
                `/residential/evaluation/rent-roll?id=${id}&evaluationId=${filteredRentRollData?.[filteredRentRollData.length - 1]?.id}`
              );
            } else if (hasIncomeType) {
              navigate(
                `/residential/evaluation/income-approch?id=${id}&IncomeId=${filteredData?.[filteredData.length - 1]?.id}`
              );
            } else {
              navigate(`/residential-overview?id=${id}`);
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
          onClick={() => navigate(`/residential/evaluation/review?id=${id}`)}
          style={{ width: '300px', fontSize: '14px' }}
        >
          {EvaluationEnum.SAVE_AND_CONTINUE}
          <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
        </CommonButton>
      </div>
      <p className="text-center pt-9 text-xs text-lightBlack">
        {ResidentialExhibitsEnum.HARKEN_CRE_LLC} {new Date().getFullYear()}
      </p>
    </ResidentialMenuOptions>
  );
};

export default ResidentialExhibitsListing;

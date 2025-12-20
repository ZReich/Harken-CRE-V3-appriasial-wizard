import { AppraisalPhotoPagesEnum } from '@/pages/appraisal/overview/OverviewEnum';
import DeleteConfirmationAppraisalPhotoSheet from '@/pages/comps/Listing/delete-confirmation-appraisal-photo-sheet';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { arrayMove } from 'react-movable';
import { SortableItem } from '@/pages/appraisal/overview/appraisal-photo-sheet/AppraisalPhotoSheetSortableItem';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import loadingImage from '../../../../../images/loading.png';
import ResidentialViewPhoto from './view-photo';
import { ResidentialOverviewEnum } from '../residential-overview-enum';
type Props = {
  showValidation: boolean;
  setInitialState: any;
  initialState: any;
  srcArray: any;
  setSrcArray: any;
};
const ResidentialPhotoSheetTable = ({
  showValidation,
  setInitialState,
  initialState,
  srcArray,
  setSrcArray,
}: Props) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { errors, setFieldValue } = useFormikContext<any>();
  const deletePhotos = (index: number | undefined) => {
    setDeleteModalOpen(true);
    setDeleteId(index);
  };
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };
  const deletefunction = () => {
    const updatedInitialState = initialState?.photos?.filter(
      (_: any, i: any) => i !== deleteId
    );
    setInitialState((prev: any) => {
      return {
        ...prev,
        photos: updatedInitialState,
      };
    });
  };
  const visiblePhotoImage = (image_url: string) => {
    setImageUrl(image_url);
    setViewModalOpen(true);
  };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

  const handleDragEnd = ({ active, over }: any) => {
    if (active.id !== over?.id) {
      const oldIndex = initialState?.photos.findIndex(
        (photo: any) => photo.image_url === active.id
      );
      const newIndex = initialState?.photos.findIndex(
        (photo: any) => photo.image_url === over?.id
      );
      const updatedPhotos = arrayMove(initialState?.photos, oldIndex, newIndex);
      setInitialState((prev: any) => {
        return {
          ...prev,
          photos: updatedPhotos,
        };
      });
      setFieldValue(ResidentialOverviewEnum.PHOTOS, updatedPhotos);
    }
  };
  if (loading) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }
  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={initialState?.photos.map((photo: any) => photo.image_url)}
          strategy={verticalListSortingStrategy}
        >
          <TableContainer component={Paper} className="w-full shadow-none">
            <Table sx={{ minWidth: 500 }} aria-label="photo upload table">
              <TableHead>
                <TableRow>
                  <TableCell className="font-bold w-2/12 bg-[#f0f0f0] text-[#808080]">
                    {AppraisalPhotoPagesEnum.IMAGE}
                  </TableCell>
                  <TableCell
                    className="font-bold w-9-12 bg-[#f0f0f0] text-[#808080]"
                    align="center"
                  >
                    {AppraisalPhotoPagesEnum.CAPTION}
                  </TableCell>
                  <TableCell
                    className="font-bold w-1/12 bg-[#f0f0f0] text-[#808080]"
                    align="right"
                  >
                    {AppraisalPhotoPagesEnum.ACTION}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {initialState?.photos.map((row: any, index: any) => (
                  <SortableItem
                    key={row.image_url}
                    row={row}
                    index={index}
                    deletePhotos={deletePhotos}
                    visiblePhotoImage={visiblePhotoImage}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    showValidation={showValidation}
                    setInitialState={setInitialState}
                    initialState={initialState}
                    setLoading={setLoading}
                    srcArray={srcArray}
                    setSrcArray={setSrcArray}
                  />
                ))}
              </TableBody>
              {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <DeleteConfirmationAppraisalPhotoSheet
                    close={handleCloseDeleteModal}
                    deleteFunction={deletefunction}
                  />
                </div>
              )}
            </Table>
          </TableContainer>
        </SortableContext>
      </DndContext>
      {viewModalOpen && (
        <ResidentialViewPhoto
          imageUrl={imageUrl}
          setViewModalOpen={setViewModalOpen}
        />
      )}
    </div>
  );
};
export default ResidentialPhotoSheetTable;

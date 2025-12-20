import { useSortable } from '@dnd-kit/sortable';
import {
  DialogActions,
  DialogContent,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '@/components/icons';
import { AppraisalPhotoPagesEnum } from '../OverviewEnum';
import CropImagePhotoSheet from '@/pages/comps/create-comp/crop-photo-sheet-image';
import CommonButton from '@/components/elements/button/Button';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { RequestType, useMutate } from '@/hook/useMutate';
import { UpdateProfileUserType } from '@/components/interface/update-profile-user-type';
import { Tooltip } from '@mui/material';
interface FormDataObject {
  file: string;
  id: number;
  type: string;
  field?: string;
  imageId?: any;
  setLoading: any;
  srcArray: any;
  setSrcArray: any;
  initialState: any;
}
export function SortableItem({
  row,
  index,
  deletePhotos,
  visiblePhotoImage,
  showValidation,
  setInitialState,
  setLoading,
  srcArray,
  setSrcArray,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: row?.image_url, // Unique identifier for each item
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const [formDataAll, setFormData] = useState<FormData | any>(null);
  const [hide, setHide] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [indexValue, setIndexValue] = useState<number | any>();
  const [cropImageSrc, setCropImageSrc] = useState<any>();
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<any>();
  const [cropPhotoIndex, setCropPhotoIndex] = useState<number>();
  const s3Url = import.meta.env.VITE_S3_URL;

  const handleUploadImage = (index: number) => {
    setModalOpen(true);
    setIndexValue(index);
  };
  const { mutateAsync } = useMutate<UpdateProfileUserType, FormDataObject>({
    queryKey: 'upload-files',
    endPoint: `/appraisals/upload-photos`,
    requestType: RequestType.POST,
  });
  const { mutateAsync: mutateAsync1 } = useMutate<any, any>({
    queryKey: 'upload-files/upload',
    endPoint: 'upload-files/upload',
    requestType: RequestType.POST,
  });
  const getText = (text: string) => {
    console.log('Received text:', text);
  };
  const formDataObjectGet = (formData: FormData) => {
    setFormData(formData);
  };
  const check = (event: any) => {
    if (event) {
      setHide(true);
    }
  };
  const closeModal = () => {
    setModalOpen(false);
  };
  const updateImage = async () => {
    setLoading(true);
    if (!formDataAll) {
      setLoading(false);
      toast.error('Please Select Image');
      return;
    }
    try {
      const response = await mutateAsync(formDataAll);
      if (response?.data?.statusCode === 200) {
        toast.success('The image has been saved.');
        setLoading(false);
        setFormData('');
      }

      const url1 = response?.data?.data;
      const formattedImages: any = url1?.map((item) =>
        item?.replace(s3Url, '')
      );
      setInitialState((prevData: any) => ({
        ...prevData,
        photos: prevData.photos.map((photo: any, idx: any) =>
          idx === indexValue
            ? { ...photo, image_url: formattedImages[0] }
            : photo
        ),
      }));
      setSrcArray([]);
      // setSrc(null);
    } catch (error) {
      console.log(error);
      toast.error('Error uploading image');
    } finally {
      setModalOpen(false);
    }
  };
  const cropPhotoImage = (image_url: string, index: any) => {
    setCropPhotoIndex(index);
    setCropImageUrl(image_url);
    const baseUrl = s3Url;
    const fullImageUrl = `${baseUrl}${image_url}`;
    setCropModalOpen(true);
    setCropImageSrc(fullImageUrl);
  };
  const closeCropModal = () => {
    setCropModalOpen(false);
  };

  const updateCropImage = async () => {
    setLoading(true);
    if (!formDataAll) {
      setLoading(false);
      toast.error('Please Select Image');
      return;
    }
    try {
      const response: any = await mutateAsync1(formDataAll);
      if (response?.data?.statusCode === 200) {
        toast.success('The image has been saved.');
        setLoading(false);
        setFormData('');
      }

      const url1 = response?.data?.data?.url;
      const modifiedUrl = url1.replace(s3Url, '');
      setInitialState((prevData: any) => ({
        ...prevData,
        photos: prevData.photos.map((photo: any, idx: any) =>
          idx === cropPhotoIndex ? { ...photo, image_url: modifiedUrl } : photo
        ),
      }));
    } catch (error) {
      console.log(error);
      toast.error('Error uploading image');
    } finally {
      setCropModalOpen(false);
    }
  };
  return (
    <>
      <TableRow
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        key={index}
      >
        <TableCell align="center" className="p-[5px]" scope="row" draggable>
          <div className="max-w-[230px] h-[80px] cursor-pointer m-auto flex object-contain items-center justify-center overflow-hidden">
            <img
              src={import.meta.env.VITE_S3_URL + row?.image_url}
              alt="Photo"
              className="max-w-[135px] max-h-[80px]"
              onClick={() => handleUploadImage(index)}
            />
          </div>
        </TableCell>
        <TableCell align="center" className="p-[5px] relative">
          <div className="appraisal-input-main">
            <input
              type="text"
              className="py-2 px-3 rounded border bo
              rder-solid border-[#e9e9e9] w-full !text-sm"
              onChange={(e) => {
                setInitialState((prevData: any) => ({
                  ...prevData,
                  photos: prevData.photos.map((photo: any, idx: any) =>
                    idx === index
                      ? { ...photo, caption: e.target.value }
                      : photo
                  ),
                }));
              }}
              value={row?.caption ?? ''}
            />
            {row?.caption === '' && showValidation ? (
              <div className="text-red-500 text-[11px] leading-loose text-left">
                {AppraisalPhotoPagesEnum.REQUIRED}
              </div>
            ) : (
              ''
            )}
          </div>
        </TableCell>
        <TableCell
          align="right"
          className="py-[5px] px-4"
          draggable={false}
          onDragStart={(e) => e.stopPropagation()} // Prevent drag on this cell
          onMouseDown={(e) => e.stopPropagation()} // Prevent mouse down to stop drag
        >
          <div className="flex">
            <Tooltip title="Delete">
              <Icons.DeleteIcon
                className="cursor-pointer text-[#ff0000] text-xl"
                onClick={() => deletePhotos(index)}
              />
            </Tooltip>
            <Tooltip title="View">
              <Icons.VisibleIcon
                className="cursor-pointer text-[#0DA1C7] ms-1.5 text-xl"
                onClick={() => visiblePhotoImage(row?.image_url)}
              />
            </Tooltip>
            <Tooltip title="Crop">
              <Icons.CropIcon
                className="cursor-pointer text-[#0DA1C7] ms-1.5 text-xl"
                onClick={() => cropPhotoImage(row?.image_url, index)}
              />
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
      {cropModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              height: '650px',
              width: '800px',
              borderRadius: '5px',
              padding: '20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              className="close"
              onClick={closeCropModal}
              style={{
                position: 'absolute',
                top: '8px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '35px',
              }}
            >
              &times;
            </span>
            <CropImagePhotoSheet
              getText={getText}
              formDataObjectGet={formDataObjectGet}
              // field={selectedUniqueValue}
              type="appraisal"
              check={check}
              srcArray={srcArray}
              setSrcArray={setSrcArray}
              src={undefined}
              setSrc={undefined}
              cropModalOpen={cropModalOpen}
              cropImageSrc={cropImageSrc}
              cropImageUrl={cropImageUrl}
            />

            <DialogActions className="absolute bottom-4">
              <CommonButton
                onClick={updateCropImage}
                variant="contained"
                color="primary"
                style={{
                  fontSize: '12px',
                  padding: '7px 30px',
                  width: '100px',
                  margin: 'auto',
                }}
              >
                {AppraisalPhotoPagesEnum.UPLOAD}
              </CommonButton>
            </DialogActions>
          </div>
        </div>
      )}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              height: '650px',
              width: '800px',
              borderRadius: '5px',
              padding: '20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              className="close"
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '8px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '35px',
              }}
            >
              &times;
            </span>
            {!hide ? (
              <>
                <div>
                  <DialogContent
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <div className="cursor-pointer">
                      <Icons.AddCircleIcon
                        className="text-[#0DA1C7] text-3xl"
                        style={{ fontSize: '50px' }}
                      />
                    </div>
                    <Typography
                      variant="h5"
                      className="text-gray-500 text-3xl"
                      gutterBottom
                    >
                      {AppraisalPhotoPagesEnum.ADD_PROPERTY_IMAGE}
                    </Typography>
                  </DialogContent>
                </div>
              </>
            ) : null}

            <CropImagePhotoSheet
              getText={getText}
              formDataObjectGet={formDataObjectGet}
              // field={selectedUniqueValue}
              type="appraisal"
              check={check}
              srcArray={srcArray}
              setSrcArray={setSrcArray}
              src={undefined}
              setSrc={undefined}
              cropModalOpen={cropModalOpen}
              cropImageSrc={cropImageSrc}
              cropImageUrl={cropImageUrl}
            />

            <DialogActions className="absolute bottom-4">
              <CommonButton
                onClick={updateImage}
                variant="contained"
                color="primary"
                style={{
                  fontSize: '12px',
                  padding: '7px 30px',
                  width: '100px',
                  margin: 'auto',
                }}
              >
                {AppraisalPhotoPagesEnum.UPLOAD}
              </CommonButton>
            </DialogActions>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import {
  Typography,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import { toast } from 'react-toastify';
import { Icons } from '@/components/icons';
import CommonButton from '@/components/elements/button/Button';
import CropImage from '@/pages/comps/create-comp/crop-image';
import { RequestType, useMutate } from '@/hook/useMutate';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import axios from 'axios';
import loadingImage from '../../../images/loading.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  ActionTypes,
  ButtonLabels,
  ImageOrientation,
  TableHeaders,
  UniqueValueKeys,
} from '@/pages/appraisal/overview/OverviewEnum';
import {
  filterTableData,
  getTableData,
} from '@/components/modals/evaluation-approach-config';

interface RowImage {
  url: string;
  uniqueValue: string;
  id: number;
}

interface RowImagesState {
  [key: string]: RowImage;
}

const EvaluationImage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // State variables
  const [src, setSrc] = useState<string | null>(null);
  const [modalOpenCrop, setModalOpen] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [formDataAll, setFormData] = useState<FormData | null>(null);
  const [selectedUniqueValue, setSelectedUniqueValue] = useState<string | null>(
    null
  );
  const [rowImages, setRowImages] = useState<RowImagesState>({});
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewImage, setViewImage] = useState<string | undefined>();
  const [hide, setHide] = useState(false);
  const [orientation, setOrientation] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [extraImages, setExtraImages] = useState<any[]>([]);
  // API calls
  const { mutateAsync } = useMutate<any, any>({
    queryKey: 'upload-image',
    endPoint: `/evaluations/upload-image/${id}`,
    requestType: RequestType.POST,
  });

  const { mutate } = useMutate<any, any>({
    queryKey: 'evaluations/update-position',
    endPoint: `evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  const { data, refetch } = useGet<any>({
    queryKey: 'all',
    endPoint: `evaluations/get-files/${id}?origin=EVALUATION_IMAGES`,
  });

  const { data: nav, refetch: refetchNav } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: { refetchOnWindowFocus: true },
  });

  // Update position with current URL
  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      await mutate({ position: ApiUrl });
    };
    updatePositionWithCurrentUrl();
  }, [id, mutate]);

  // Extract appraisal files from response
  useEffect(() => {
    const appraisalFiles = nav?.data?.data?.scenarios;
    if (appraisalFiles) {
      setExtraImages(appraisalFiles);
    }
  }, [nav?.data?.data?.scenarios]);

  // Process image data
  useEffect(() => {
    const view = data?.data?.data;
    if (!Array.isArray(view) || view.length === 0) {
      setRowImages({});
      return;
    }

    const images = view.reduce((acc: RowImagesState, image: any) => {
      const key = image.title;
      acc[key] = {
        url: import.meta.env.VITE_S3_URL + image.dir,
        id: image.id,
        uniqueValue: key,
      };
      return acc;
    }, {});

    setRowImages(images);
  }, [data?.data?.data]);

  // Delete image handler
  const handleDeleteImage = async (imageId: number, uniqueValue: string) => {
    try {
      await axios.delete(
        `evaluations/remove-image?image_id=${imageId}&evaluation_id=${id}&field=${uniqueValue}`
      );
      refetch();
      refetchNav();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Modal handlers
  const handleModalOpen = (
    rowId: number = 0,
    uniqueValue: string,
    orientation: string
  ) => {
    setOrientation(orientation);
    setUniqueValue(uniqueValue);
    setModalOpen(true);
    setSelectedRowId(rowId);
    setSelectedUniqueValue(uniqueValue);
    setHide(false);
  };

  const handleCloseModal = async () => {
    setLoading(true);
    if (!formDataAll) {
      setLoading(false);
      toast.error(ActionTypes.SELECT_IMAGE);
      return;
    }

    try {
      const response = await mutateAsync(formDataAll);
      if (response?.data?.statusCode === 200) {
        toast.success(ActionTypes.SAVE_SUCCESS);
        refetch();
        setLoading(false);
        setFormData(null);
      }

      const url = response?.data?.data?.url;
      const imgId = response?.data?.data?.id;

      if (selectedRowId !== null && url && selectedUniqueValue) {
        setRowImages((prevImages) => ({
          ...prevImages,
          [selectedUniqueValue]: {
            url,
            uniqueValue: selectedUniqueValue,
            id: prevImages[selectedUniqueValue]?.id ?? imgId,
          },
        }));
      }
      setSrc(null);
    } catch (error) {
      toast.error(ActionTypes.UPLOAD_ERROR);
    } finally {
      setModalOpen(false);
    }
  };

  const handleCloseModalCross = () => {
    setViewModalOpen(false);
    setModalOpen(false);
    setFormData(null);
  };

  const handleFormData = (formData: FormData) => {
    setFormData(formData);
  };

  const handleCheck = (event: any) => {
    if (event) {
      setHide(true);
    }
  };

  const handleViewImage = (image: string) => {
    setViewImage(image);
    setViewModalOpen(true);
  };

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} alt="Loading" />
      </div>
    );
  }

  // Filter table data based on conditions
  const activeType = localStorage.getItem('activeType');
  const hasCostApproach = extraImages?.[0]?.has_cost_approach === 1;
  const tableData = getTableData();
  const filteredData = filterTableData(tableData, activeType, hasCostApproach);

  return (
    <EvaluationMenuOptions>
      {/* Crop Image Modal */}
      {modalOpenCrop && (
        <div 
        // className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
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
          // className="bg-white h-[80%] w-[60%] rounded p-5 relative flex flex-col justify-center items-center"
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
              // className="absolute top-2 right-4 cursor-pointer text-3xl"
              className="close"
              onClick={handleCloseModalCross}
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
            <div className='relative flex overflow-hidden cursor-pointer'>
              {!hide && (
                <div className={`${src ? 'image-loaded' : ''}`}>
                  <DialogContent className="flex items-center justify-center flex-col p-0">
                    <div className="cursor-pointer">
                      <Icons.AddCircleIcon
                        className="text-[#0DA1C7]"
                        style={{ fontSize: '50px' }}
                      />
                    </div>
                    <Typography
                      variant="h5"
                      className="text-gray-500 text-3xl m-0"
                      gutterBottom
                    >
                      {ButtonLabels.ADD_PROPERTY_IMAGE}
                    </Typography>
                  </DialogContent>
                </div>
              )}

              <CropImage
                getText={() => {}}
                formDataObjectGet={handleFormData}
                field={selectedUniqueValue}
                type="evaluation"
                src={src}
                setSrc={setSrc}
                check={handleCheck}
                allignment={orientation}
                uniqueValue={uniqueValue}
              />
            </div>
            <DialogActions className="absolute bottom-4">
              <CommonButton
                onClick={handleCloseModal}
                variant="contained"
                color="primary"
                style={{
                  fontSize: '12px',
                  padding: '7px 30px',
                  width: '100px',
                  margin: 'auto',
                }}
              >
                {ButtonLabels.UPLOAD}
              </CommonButton>
            </DialogActions>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
          <Typography
            variant="h1"
            component="h2"
            className="text-xl font-bold uppercase"
          >
            Images{' '}
            <span className="text-xs">
              For best results, we recommend photo size to be between 2MB - 5MB,
              if possible.
            </span>
          </Typography>
          <div className="flex items-center">
            <ErrorOutlineIcon className="pr-[10px] w-[30px] h-[30px]" />
            <span className="text-xs">
              Upload images to be used in this evaluation.
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <TableContainer
        component={Paper}
        style={{
          width: '100%',
          margin: '20px auto',
          padding: '0 60px',
          marginBottom: '82px',
        }}
      >
        <Table sx={{ minWidth: 500 }} aria-label="image upload table">
          <TableHead style={{ backgroundColor: '#f0f0f0' }}>
            <TableRow>
              <TableCell style={{ color: 'gray', fontWeight: 'bold' }}>
                {TableHeaders.IMAGE}
              </TableCell>
              <TableCell
                style={{ color: 'gray', fontWeight: 'bold' }}
                align="center"
              >
                {TableHeaders.DESCRIPTION}
              </TableCell>
              <TableCell
                style={{ color: 'gray', fontWeight: 'bold' }}
                align="center"
              >
                {TableHeaders.ORIENTATION}
              </TableCell>
              <TableCell
                style={{ color: 'gray', fontWeight: 'bold' }}
                align="center"
              >
                {TableHeaders.PAGE}
              </TableCell>
              <TableCell
                style={{ color: 'gray', fontWeight: 'bold' }}
                align="right"
              >
                {TableHeaders.ACTION}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Regular images */}
            {filteredData.map((row) => {
              const matchingImage = rowImages[row.uniqueValue];
              return (
                <TableRow key={row.id}>
                  <TableCell
                    component="th"
                    scope="row"
                    align="center"
                    style={{ padding: '5px' }}
                  >
                    {matchingImage?.url ? (
                      <div className="max-w-[230px] h-[80px] cursor-pointer m-auto flex object-contain items-center justify-center overflow-hidden">
                        <img
                          className="block max-w-[230px] h-[80px] object-contain"
                          src={matchingImage.url}
                          alt={matchingImage.uniqueValue}
                          onClick={() =>
                            handleModalOpen(
                              matchingImage.id,
                              row.uniqueValue,
                              row.orientation
                            )
                          }
                        />
                      </div>
                    ) : (
                      <IconButton
                        onClick={() =>
                          handleModalOpen(
                            row.id,
                            row.uniqueValue,
                            row.orientation
                          )
                        }
                      >
                        <Icons.AddImageIcon
                          className="large-icon"
                          style={{ fontSize: '50px' }}
                        />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell align="center" style={{ padding: '5px' }}>
                    {row.description ?? 'N/A'}
                  </TableCell>
                  <TableCell align="center" style={{ padding: '5px' }}>
                    {row.orientation}
                  </TableCell>
                  <TableCell align="center" style={{ padding: '5px' }}>
                    {row.page}
                  </TableCell>
                  <TableCell align="center" style={{ padding: '5px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0px',
                      }}
                    >
                      {matchingImage?.id && (
                        <>
                          <Tooltip title="View">
                            <IconButton
                              onClick={() => handleViewImage(matchingImage.url)}
                            >
                              <Icons.VisibleIcon
                                style={{ fontSize: '20px', color: '#0DA1C7' }}
                              />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() =>
                                handleDeleteImage(
                                  matchingImage.id,
                                  matchingImage.uniqueValue
                                )
                              }
                            >
                              <Icons.DeleteIcon style={{ fontSize: '20px' }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Extra images */}
            {extraImages.map((extraImage: any) => {
              if (extraImage.title === UniqueValueKeys.EXTRA_IMAGE) {
                return (
                  <TableRow key={extraImage.id}>
                    <TableCell
                      component="th"
                      scope="row"
                      align="center"
                      style={{ padding: '5px' }}
                    >
                      {extraImage?.dir ? (
                        <div className="max-w-[230px] h-[80px] cursor-pointer m-auto flex object-contain items-center justify-center overflow-hidden">
                          <img
                            className="block max-w-[230px] h-[80px] object-contain"
                            src={import.meta.env.VITE_S3_URL + extraImage.dir}
                            alt="Extra"
                            onClick={() =>
                              handleModalOpen(
                                extraImage.id,
                                UniqueValueKeys.EXTRA_IMAGE,
                                ''
                              )
                            }
                          />
                        </div>
                      ) : (
                        <IconButton
                          onClick={() =>
                            handleModalOpen(
                              extraImage.id,
                              UniqueValueKeys.EXTRA_IMAGE,
                              ''
                            )
                          }
                        >
                          <Icons.AddImageIcon
                            className="large-icon"
                            style={{ fontSize: '50px' }}
                          />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell align="center" style={{ padding: '5px' }}>
                      {extraImage.description ?? 'N/A'}
                    </TableCell>
                    <TableCell align="center" style={{ padding: '5px' }}>
                      {extraImage.description}
                    </TableCell>
                    <TableCell align="center" style={{ padding: '5px' }}>
                      {extraImage.description}
                    </TableCell>
                    <TableCell align="center" style={{ padding: '5px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '0px',
                        }}
                      >
                        {extraImage?.id && (
                          <>
                            <IconButton
                              onClick={() => handleViewImage(extraImage.url)}
                            >
                              <Icons.VisibleIcon
                                style={{ fontSize: '20px', color: '#0DA1C7' }}
                              />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                handleDeleteImage(
                                  extraImage.id,
                                  UniqueValueKeys.EXTRA_IMAGE
                                )
                              }
                            >
                              <Icons.DeleteIcon style={{ fontSize: '20px' }} />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }
              return null;
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Navigation buttons */}
      <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5">
        <Button
          variant="contained"
          color="primary"
          size="small"
          className="appraisal-previous-button text-xs p-3 text-white font-medium"
          onClick={() => navigate(`/evaluation-overview?id=${id}`)}
        >
          <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
        </Button>

        <CommonButton
          type="submit"
          variant="contained"
          color="primary"
          size="small"
          onClick={() => navigate(`/evaluation-photo-sheet?id=${id}`)}
          style={{ width: '270px', fontSize: '14px' }}
        >
          {ButtonLabels.SAVE_CONTINUE}
          <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
        </CommonButton>
      </div>

      {/* View image modal */}
      {viewModalOpen && viewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="w-7/12 bg-white rounded p-12 relative flex flex-col justify-center items-center min-h-[45vh]">
            <span
              className="close flex items-center justify-center text-white bg-[#f16666] absolute top-0 right-0 cursor-pointer text-3xl p-[6px_13px]"
              onClick={handleCloseModalCross}
            >
              &times;
            </span>
            <DialogContent className="p-0">
              <img
                src={viewImage}
                alt="image"
                style={{
                  width:
                    orientation === ImageOrientation.HORIZONTAL
                      ? '100%'
                      : 'auto',
                  height:
                    orientation === ImageOrientation.HORIZONTAL
                      ? '100%'
                      : '100%',
                }}
              />
            </DialogContent>
          </div>
        </div>
      )}
    </EvaluationMenuOptions>
  );
};

export default EvaluationImage;

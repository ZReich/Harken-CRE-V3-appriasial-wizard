import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { UpdateProfileUserType } from '@/components/interface/update-profile-user-type';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import CropImage from '@/pages/comps/create-comp/crop-image';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Button,
  DialogActions,
  DialogContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import loadingImage from '../../../../images/loading.png';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import DeleteConfirmationResidentialImage from './residential-images-delete-confirmation';
import { ResidentialOverviewEnum } from './residential-overview-enum';
interface FormDataObject {
  file: string;
  id: number;
  type: string;
  field?: string;
  imageId: any;
}

const ResidentialImage = ({ updateData }: any) => {
  const [src, setSrc] = useState<any>();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [modalOpenCrop, setModalOpen] = useState<boolean>(false);
  const [, setShowLoader] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<number | any>(null);
  const [formDataAll, setFormData] = useState<FormData | any>(null);
  const [selectedUniqueValue, setSelectedUniqueValue] = useState<string | any>(
    null
  );
  const [rowImages, setRowImages] = useState<{
    [key: number]: { url: string; uniqueValue: string; id: number };
  }>({});
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [image, setImage] = useState();
  const [hide, setHide] = useState(false);
  const [orientations, setOrientation] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [extraIMmage, setExtraImage] = useState([]);
  const [imageId, setImageId] = useState('');

  const openDeleteModal = (imageId: number, uniqueValue: string) => {
    setSelectedImageId(imageId);
    setSelectedUniqueValue(uniqueValue);
    setDeleteConfirmation(true);
  };
  const { mutateAsync } = useMutate<UpdateProfileUserType, FormDataObject>({
    queryKey: 'upload-image',
    endPoint: `/res-evaluations/upload-image/${id}`,
    requestType: RequestType.POST,
  });
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'res-evaluations/update-position',
    endPoint: `res-evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      const response = await mutate({
        position: ApiUrl,
      });
      console.log('Update successful:', response);
    };
    updatePositionWithCurrentUrl();
  }, [id, mutate]);

  const { data, refetch } = useGet<any>({
    queryKey: 'all',
    endPoint: `res-evaluations/get-files/${id}?origin=EVALUATION_IMAGES`,
  });

  const { data: nav, refetch: refetch1 } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: { refetchOnWindowFocus: true },
  });
  const appraisalFiles = nav?.data?.data?.res_evaluation_scenarios;
  useEffect(() => {
    if (appraisalFiles) {
      setExtraImage(appraisalFiles);
    }
  }, [appraisalFiles]);

  const view = data?.data?.data;
  useEffect(() => {
    if (!Array.isArray(view) || view.length === 0) {
      setRowImages({});
      return;
    }

    const images = view.reduce((acc: any, image: any) => {
      const key = image.title;
      acc[key] = {
        url: import.meta.env.VITE_S3_URL + image.dir,
        id: image.id,
        uniqueValue: key,
      };
      return acc;
    }, {});

    setRowImages(images);
  }, [view]);

  const deleteImage = async () => {
    if (selectedImageId === null || !selectedUniqueValue) return;

    try {
      await axios.delete(
        `res-evaluations/remove-image?image_id=${selectedImageId}&res_evaluation_id=${id}&field=${selectedUniqueValue}`
      );
      refetch();
      refetch1();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const tableData = [
    {
      id: 1,
      description: 'Sub. Property',
      orientation: 'Horizontal',
      page: '1 - Cover Photo',
      uniqueValue: 'cover',
    },
    {
      id: 2,
      description: 'Sub. Property 2',
      orientation: 'Vertical',
      page: '2 - Table of Contents',
      uniqueValue: 'table-of-contents',
    },
    {
      id: 3,
      description: 'Sub. Property 3',
      orientation: 'Vertical',
      page: '5 - Executive Summary',
      uniqueValue: 'executive-summary-details',
    },
    {
      id: 4,
      description: 'Sub. Property 4',
      orientation: 'Horizontal',
      page: '7 - Property Summary',
      uniqueValue: 'property-summary-top-image',
    },
    {
      id: 5,
      description: 'Sub. Property 5',
      orientation: 'Horizontal',
      page: '7 - Property Summary',
      uniqueValue: 'property-summary-bottom-image',
    },
    {
      id: 6,
      description: 'Sub. Property 6',
      orientation: 'Horizontal',
      page: '16',
      uniqueValue: 'sub-property-1',
    },
    {
      id: 7,
      description: 'Sub. Property 7',
      orientation: 'Horizontal',
      page: '16',
      uniqueValue: 'sub-property-2',
    },
    {
      id: 8,
      description: 'Sub. Property 8',
      orientation: 'Horizontal',
      page: '16',
      uniqueValue: 'sub-property-3',
    },
  ];

  const modalOpen = (
    rowId: number = 0,
    uniqueValue: any,
    orientation: string
  ) => {
    setOrientation(orientation);
    setUniqueValue(uniqueValue);
    setModalOpen(true);
    setSelectedRowId(rowId);
    setSelectedUniqueValue(uniqueValue);
    setHide(false);
  };

  const closeModal = async () => {
    setLoading(true);
    if (!formDataAll) {
      setLoading(false);
      toast.error(ResidentialOverviewEnum.PLEASE_SELECT_IMAGE);
      return;
    }
    try {
      setShowLoader(true);
      const response = await mutateAsync(formDataAll);
      if (response?.data?.statusCode === 200) {
        toast.success(ResidentialOverviewEnum.THE_IMAGE_HAS_BEEN_SAVED);
        refetch();
        setLoading(false);
        setFormData('');
      }
      const url = response?.data?.data?.url;
      const imgid = response?.data?.data?.id;
      setImageId(imageId);
      if (selectedRowId !== null && url) {
        setRowImages((prevImages) => ({
          ...prevImages,
          [selectedRowId]: {
            url,
            uniqueValue: selectedUniqueValue,
            id: prevImages[selectedRowId]?.id ?? imgid,
          },
        }));
      }
      setSrc(null);
    } catch (error) {
      console.log(error);
      toast.error(ResidentialOverviewEnum.ERROR_UPLOADING_IMAGE);
    } finally {
      setShowLoader(false);
      setModalOpen(false);
    }
  };
  const closeModalCross = () => {
    setViewModalOpen(false);
    setModalOpen(false);
    setFormData(null);
  };

  const getText = (text: string) => {
    console.log('Received text:', text);
  };

  const formDataObjectGet = (formData: FormData) => {
    setFormData(formData);
  };

  useEffect(() => {
    if (updateData) {
    }
  }, [updateData]);

  const check = (event: any) => {
    if (event) {
      setHide(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }
  const viewImage = (image: any) => {
    setImage(image);
    setViewModalOpen(true);
  };

  const activeType = localStorage.getItem('activeType');
  const hasCostApproach = appraisalFiles?.[0]?.has_cost_approach === 1;
  const filteredData = tableData.filter((row) => {
    if (activeType === 'land_only') {
      return [1, 2, 3].includes(row.id);
    }

    if (hasCostApproach) {
      return row.id <= 8;
    } else {
      return row.id <= 5;
    }
  });

  const handleCloseDeleteModal = () => {
    setDeleteConfirmation(false);
    setSelectedImageId(null);
    setSelectedUniqueValue('');
  };
  return (
    <>
      <ResidentialMenuOptions>
        {modalOpenCrop && (
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
                onClick={closeModalCross}
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
                {!hide ? (
                  <>
                    <div className={`${src ? 'image-loaded' : ''}`}>
                      <DialogContent
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          padding: '0',
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
                          className="text-gray-500 text-3xl mb-0"
                          gutterBottom
                        >
                          {ResidentialOverviewEnum.ADD_PROPERTY_IMAGE}
                        </Typography>
                      </DialogContent>
                    </div>
                  </>
                ) : null}

                <CropImage
                  getText={getText}
                  formDataObjectGet={formDataObjectGet}
                  field={selectedUniqueValue}
                  type="res_evaluation"
                  src={src}
                  setSrc={setSrc}
                  check={check}
                  allignment={orientations}
                  uniqueValue={uniqueValue}
                />
              </div>

              <DialogActions className="absolute bottom-4">
                <CommonButton
                  onClick={closeModal}
                  variant="contained"
                  color="primary"
                  style={{
                    fontSize: '12px',
                    padding: '7px 30px',
                    width: '100px',
                    margin: 'auto',
                  }}
                >
                  {ResidentialOverviewEnum.UPLOAD}
                </CommonButton>
              </DialogActions>
            </div>
          </div>
        )}

        <>
          <div>
            <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
              <Typography
                variant="h1"
                component="h2"
                className="text-xl font-bold uppercase"
              >
                {ResidentialOverviewEnum.IMAGES}{' '}
                <span className="text-xs">
                  {ResidentialOverviewEnum.IMAGES_HEADER}
                </span>
              </Typography>
              <div className=" flex items-center">
                <ErrorOutlineIcon className="pr-[10px] w-[30px] h-[30px]" />
                <span className="text-xs">
                  {ResidentialOverviewEnum.UPLOAD_IMAGES_TO_BE_USED_IN_THIS_EVALUATION}
                </span>
              </div>
            </div>
          </div>
        </>

        <TableContainer
          component={Paper}
          style={{ width: '100%', margin: '20px auto', padding: '0 60px', marginBottom: '40px' }}
        >
          <Table sx={{ minWidth: 500 }} aria-label="image upload table">
            <TableHead style={{ backgroundColor: '#f0f0f0' }}>
              <TableRow>
                <TableCell style={{ color: 'gray', fontWeight: 'bold' }}>
                  {ResidentialOverviewEnum.IMAGE}
                </TableCell>
                <TableCell
                  style={{ color: 'gray', fontWeight: 'bold' }}
                  align="center"
                >
                  {ResidentialOverviewEnum.DESCRIPTION}
                </TableCell>
                <TableCell
                  style={{ color: 'gray', fontWeight: 'bold' }}
                  align="center"
                >
                  {ResidentialOverviewEnum.ORIENTATION}
                </TableCell>
                <TableCell
                  style={{ color: 'gray', fontWeight: 'bold' }}
                  align="center"
                >
                  {ResidentialOverviewEnum.PAGE}
                </TableCell>
                <TableCell
                  style={{ color: 'gray', fontWeight: 'bold' }}
                  align="right"
                >
                  {ResidentialOverviewEnum.ACTION}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row: any) => {
                const matchingImage = rowImages[row.uniqueValue]; 

                return (
                  <React.Fragment key={row.id}>
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                        align="center"
                        style={{ padding: '5px' }}
                      >
                        {matchingImage?.url ? (
                          <div className="max-w-[230px] h-[80px] cursor-pointer m-auto flex object-contain items-center justify-center overflow-hidden">
                            <img
                              className={`block max-w-[230px] h-[80px] object-contain`}
                              src={matchingImage.url}
                              alt={matchingImage.uniqueValue}
                              onClick={() =>
                                modalOpen(
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
                              modalOpen(
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
                                  onClick={() => viewImage(matchingImage.url)}
                                >
                                  <Icons.VisibleIcon
                                    className="large-icon"
                                    style={{
                                      fontSize: '20px',
                                      color: '#0DA1C7',
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() =>
                                    openDeleteModal(
                                      matchingImage.id,
                                      matchingImage.uniqueValue
                                    )
                                  }
                                >
                                  <Icons.DeleteIcon
                                    className="large-icon"
                                    style={{ fontSize: '20px' }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}

              {extraIMmage.map((extraImage: any) => {
                if (extraImage.title === 'extraImage') {
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
                              className={`block max-w-[230px] h-[80px] object-contain`}
                              src={import.meta.env.VITE_S3_URL + extraImage.dir}
                              onClick={() =>
                                modalOpen(extraImage.id, 'extraImage', '')
                              }
                            />
                          </div>
                        ) : (
                          <IconButton
                            onClick={() =>
                              modalOpen(extraImage.id, 'extraImgae', '')
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
                                onClick={() => viewImage(extraImage.url)}
                              >
                                <Icons.VisibleIcon
                                  className="large-icon"
                                  style={{ fontSize: '20px', color: '#0DA1C7' }}
                                />
                              </IconButton>
                              <IconButton
                              
                              >
                                <Icons.DeleteIcon
                                  className="large-icon"
                                  style={{ fontSize: '20px' }}
                                />
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

        <div className="justify-center flex gap-3 py-5">
          <Button
            variant="contained"
            color="primary"
            size="small"
            className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
            onClick={() => navigate(`/residential-overview?id=${id}`)}
          >
            <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
          </Button>

          <CommonButton
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              navigate(`/residential/evaluation-photo-sheet?id=${id}`)
            }
            style={{ width: '270px', fontSize: '14px' }}
          >
            {ResidentialOverviewEnum.SAVE_AND_CONTINUE}
            <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
          </CommonButton>
        </div>
        {deleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <DeleteConfirmationResidentialImage
              close={handleCloseDeleteModal}
              deleteFunction={deleteImage}
            />
          </div>
        )}
        {viewModalOpen && (
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
              className="w-5/12"
              style={{
                backgroundColor: 'white',
                borderRadius: '5px',
                padding: '3rem 0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
              }}
            >
              <span
                className="close flex items-center justify-center text-white bg-[#f16666] absolute top-0 right-0 cursor-pointer"
                onClick={closeModalCross}
                style={{
                  fontSize: '30px',
                  padding: '6px 13px',
                }}
              >
                &times;
              </span>
              <div className={`${src ? 'image-loaded' : ''}`}>
                <DialogContent className="p-0">
                  <img
                    src={image}
                    alt="image"
                    style={{
                      width: orientations === ResidentialOverviewEnum.HORIZONTAL ? '100%' : 'auto',
                      height: orientations === ResidentialOverviewEnum.HORIZONTAL ? 'auto' : '100%',
                    }}
                  />
                </DialogContent>
              </div>
            </div>
          </div>
        )}
      </ResidentialMenuOptions>
    </>
  );
};

export default ResidentialImage;

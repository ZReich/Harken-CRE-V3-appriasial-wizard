import React, { useState, useEffect } from 'react';
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
import { UpdateProfileUserType } from '@/components/interface/update-profile-user-type';
import { useSearchParams } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
import { useNavigate } from 'react-router-dom';
import AppraisalMenu from '../set-up/appraisa-menu';
import axios from 'axios';
import loadingImage from '../../../images/loading.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// import { Height } from '@mui/icons-material';

interface FormDataObject {
  file: string;
  id: number;
  type: string;
  field?: string;
  imageId: any;
}

const AppraisalEvalutionImage = ({ updateData }: any) => {
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
  const [extraIMmage, setExtraImage] = useState([]);
  const [imageId, setImageId] = useState('');

  const { mutateAsync } = useMutate<UpdateProfileUserType, FormDataObject>({
    queryKey: 'upload-image',
    endPoint: `/appraisals/upload-image/${id}`,
    requestType: RequestType.POST,
  });
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/update-position',
    endPoint: `appraisals/update-position/${id}`,
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
    endPoint: `appraisals/get-files/${id}?origin=APPRAISAL_IMAGES`,
  });

  const { data: nav, refetch: refetch1 } = useGet<any>({
    queryKey: 'appraisals/get',
    // cacheTime: 0,
    endPoint: `appraisals/get/${id}`,
    config: { refetchOnWindowFocus: true },
  });

  // Extract appraisalFiles from the response
  const appraisalFiles = nav?.data?.data?.appraisal_files;

  useEffect(() => {
    if (appraisalFiles) {
      setExtraImage(appraisalFiles); // Set the state only when appraisalFiles changes
    }
  }, [appraisalFiles]); // Dependency array ensures this runs only when appraisalFiles changes

  // Filter for extra images

  const view = data?.data?.data;

  useEffect(() => {
    if (!Array.isArray(view) || view.length === 0) {
      setRowImages({});
      return;
    }

    const images = view.reduce((acc: any, image: any) => {
      acc[image.id] = {
        url: import.meta.env.VITE_S3_URL + image.dir,
        id: image.id,
        uniqueValue: image.title,
      };
      return acc;
    }, {});

    setRowImages(images);
  }, [view]);

  const deleteImage = async (imageId: number, uniqueValue: string) => {
    try {
      await axios.delete(
        `appraisals/remove-image?image_id=${imageId}&appraisal_id=${id}&field=${uniqueValue}`,
        {}
      );
      refetch();
      refetch1();
    } catch (error) {
      console.error('Error downloading report:', error);
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
      uniqueValue: 'tableOfContents',
    },
    {
      id: 3,
      description: 'Sub. Property 3',
      orientation: 'Vertical',
      page: '5 - Executive Summary',
      uniqueValue: 'executiveSummaryDetails',
    },
    {
      id: 4,
      description: 'Sub. Property 4',
      orientation: 'Horizontal',
      page: '7 - Property Summary',
      uniqueValue: 'propertySummaryTopImage',
    },
    {
      id: 5,
      description: 'Sub. Property 5',
      orientation: 'Horizontal',
      page: '7 - Property Summary',
      uniqueValue: 'propertySummaryBottomImage',
    },
  ];

  const modalOpen = (
    rowId: number = 0,
    uniqueValue: string,
    orientation: string
  ) => {
    setOrientation(orientation);
    setModalOpen(true);
    setSelectedRowId(rowId);
    setSelectedUniqueValue(uniqueValue);
    setHide(false);
  };

  const closeModal = async () => {
    setLoading(true);
    if (!formDataAll) {
      setLoading(false);
      toast.error('Please Select Image');
      return;
    }
    try {
      setShowLoader(true);
      const response = await mutateAsync(formDataAll);
      if (response?.data?.statusCode === 200) {
        toast.success('The image has been saved.');
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
      toast.error('Error uploading image');
    } finally {
      setShowLoader(false);
      setModalOpen(false);
    }
  };
  const closeModalCross = () => {
    setViewModalOpen(false);
    setModalOpen(false);
  };

  const getText = (text: string) => {
    console.log('Received text:', text);
  };

  const formDataObjectGet = (formData: FormData) => {
    setFormData(formData);
  };

  useEffect(() => {
    if (updateData) {
      // Set field value if updateData exists
      // Example: setFieldValue('property_image_url', updateData.property_image_url);
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
  return (
    <>
      <AppraisalMenu>
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
              {!hide ? (
                <>
                  <div className={`${src ? 'image-loaded' : ''}`}>
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
                        Add Property Image
                      </Typography>
                    </DialogContent>
                  </div>
                </>
              ) : null}

              <CropImage
                getText={getText}
                formDataObjectGet={formDataObjectGet}
                field={selectedUniqueValue}
                type="appraisal"
                src={src}
                setSrc={setSrc}
                check={check}
                allignment={orientations}
              />

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
                  Upload
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
                Images{' '}
                <span className="text-xs">
                  For best results, we recommend photo size to be between 2MB -
                  5MB, if possible.
                </span>
              </Typography>
              <div className=" flex items-center">
                <ErrorOutlineIcon className="pr-[10px] w-[30px] h-[30px]" />
                <span className="text-xs">
                  Upload images to be used in this Appraisal.
                </span>
              </div>
            </div>
          </div>
        </>

        <TableContainer
          component={Paper}
          style={{ width: '100%', margin: '20px auto', padding: '0 60px', marginBottom: '82px' }}
        >
          <Table sx={{ minWidth: 500 }} aria-label="image upload table">
            <TableHead style={{ backgroundColor: '#f0f0f0' }}>
              <TableRow>
                <TableCell style={{ color: 'gray', fontWeight: 'bold' }}>
                  Image
                </TableCell>
                <TableCell
                  style={{ color: 'gray', fontWeight: 'bold' }}
                  align="center"
                >
                  Description
                </TableCell>
                <TableCell
                  style={{ color: 'gray', fontWeight: 'bold' }}
                  align="center"
                >
                  Orientation
                </TableCell>
                <TableCell
                  style={{ color: 'gray', fontWeight: 'bold' }}
                  align="center"
                >
                  Page
                </TableCell>
                <TableCell
                  style={{ color: 'gray', fontWeight: 'bold' }}
                  align="right"
                >
                  Action
                </TableCell>
                {tableData.some((row) => row.uniqueValue === 'extraImage') && (
                  <TableCell
                    style={{ color: 'gray', fontWeight: 'bold' }}
                    align="center"
                  >
                    Extra Images
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => {
                // Find the matching image data by uniqueValue
                const matchingImage = Object.values(rowImages).find(
                  (image) => image.uniqueValue === row.uniqueValue
                );

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
                                    deleteImage(
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
                                onClick={() =>
                                  deleteImage(extraImage.id, 'extraImage')
                                }
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
                return null; // Return null if the condition doesn't match
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <button onClick={() => modalOpen(0, 'extraImage', '')}>
          add nore images
        </button> */}
        <div className="justify-center flex gap-3">
          <Button
            variant="contained"
            color="primary"
            size="small"
            className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
            onClick={() => navigate(`/overview?id=${id}`)}
          >
            <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
          </Button>

          <CommonButton
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            onClick={() => navigate(`/appraisal-photo-sheet?id=${id}`)}
            style={{ width: '270px', fontSize: '14px', marginBottom: '20px' }}
          >
            SAVE AND CONTINUE
            <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
          </CommonButton>
        </div>
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
                      width: orientations === 'Horizontal' ? '100%' : 'auto',
                      height: orientations === 'Horizontal' ? 'auto' : '100%',
                    }}
                  />
                </DialogContent>
              </div>
            </div>
          </div>
        )}
      </AppraisalMenu>
    </>
  );
};

export default AppraisalEvalutionImage;

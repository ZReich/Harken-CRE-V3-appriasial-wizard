import DatePickerComp from '@/components/date-picker';
import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { UploadPhotoPagesResponse } from '@/components/interface/appraisal-upload-photo-pages';
import { UpdateProfileUserType } from '@/components/interface/update-profile-user-type';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { AppraisalPhotoPagesEnum } from '@/pages/appraisal/overview/OverviewEnum';
import CropImagePhotoSheet from '@/pages/comps/create-comp/crop-photo-sheet-image';
import { EvalutionPhotoPagesSchema } from '@/utils/evalutionPhotoPagesSchema';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import StarIcon from '@mui/icons-material/Star';

import {
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ResidentialMenuOptions from '@/pages/evaluation/set-up/residential-menu-option';
import loadingImage from '../../../../../images/loading.png';
import ResidentialPhotoSheetTable from './residential-photo-sheet-table';
import { ResidentialOverviewEnum } from '../residential-overview-enum';
interface FormDataObject {
  file: string;
  id: number;
  type: string;
  field?: string;
  imageId?: any;
}
type InitialState = {
  photos_taken_by: string;
  photo_date: any;
  photos: any;
};

const ResidentialEvaluationPhotoSheet = () => {
  const [src, setSrc] = useState<any>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [hide, setHide] = useState<boolean>(false);
  const [showValidation, setShowValidation] = useState<any>(false);
  const [formDataAll, setFormData] = useState<FormData | any>(null);
  const [srcArray, setSrcArray] = useState<string[]>([]);
  const [loader, setLoader] = useState(false);
  const s3Url = import.meta.env.VITE_S3_URL;

  const [initialState, setInitialState] = useState<InitialState>({
    photos_taken_by: '',
    photo_date: '',
    photos: [
      {
        image_url: '',
        caption: '',
        order: 0,
      },
    ],
  });

  const [selectedUniqueValue] = useState<string | any>(null);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { mutate } = useMutate<UploadPhotoPagesResponse, any>({
    queryKey: 'res-evaluations/save-photo-pages',
    endPoint: `/res-evaluations/save-photo-pages/${id}`,
    requestType: RequestType.POST,
  });
  const { mutateAsync } = useMutate<UpdateProfileUserType, FormDataObject>({
    queryKey: 'upload-files/upload-multiple-photos',
    endPoint: `/upload-files/upload-multiple-photos`,
    requestType: RequestType.POST,
  });
  const { data } = useGet<any>({
    queryKey: 'res-evaluations/get-photo-pages',
    endPoint: `res-evaluations/get-photo-pages/${id}`,
    config: {},
  });
  const appraisalGetAllPhoto = data?.data?.data;
  const formattedDate = appraisalGetAllPhoto?.photo_date
    ? moment(appraisalGetAllPhoto?.photo_date).format('MM/DD/YYYY')
    : '';
  useEffect(() => {
    if (appraisalGetAllPhoto) {
      setInitialState({
        ...initialState,
        photos: appraisalGetAllPhoto?.photos,
        photos_taken_by: appraisalGetAllPhoto?.photos_taken_by,
        photo_date: formattedDate,
      });
    }
  }, [appraisalGetAllPhoto, formattedDate]);
  const handleSubmit = (values: any) => {
    setLoader(true);
    if (
      values.photos_taken_by === null ||
      values.photo_date === '' ||
      values?.photos?.some((ele: any) => !ele.image_url || !ele.caption)
    ) {
      toast.error(ResidentialOverviewEnum.PLEASE_COMPLETE_MISSING_FIELDS);
    }
    const updatedOrderPhotos = values.photos.map((photo: any, index: any) => {
      photo.order = index + 1;
      return photo;
    });
    mutate(
      {
        photos_taken_by: values?.photos_taken_by,
        photo_date:
          values?.photo_date === 'NaN/NaN/NaN' ? '' : values?.photo_date,
        photos: updatedOrderPhotos,
      },
      {
        onSuccess: (res) => {
          setLoader(false);
          navigate(`/residential/evaluation-property-boundaries?id=${id}`);
          toast.success(res?.data?.message);
        },
      }
    );
  };
  const handleModal = () => {
    setModalOpen(true);
    setHide(false);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSrcArray([]);
    setHide(false);
    setFormData(null);
  };
  const getText = (text: string) => {
    console.log('Received text:', text);
  };
  const formDataObjectGet = (formData: FormData) => {
    setFormData(formData);
  };
  console.log(formDataAll, 'formDataAll');
  const uploadImage = async () => {
    setLoading(true);
    if (!formDataAll) {
      setLoading(false);
      toast.error('Please Select Image');
      return;
    }
    try {
      // formDataAll.append('type', 'appraisal');
      const response = await mutateAsync(formDataAll);
      if (response?.data?.statusCode === 200) {
        setLoading(false);
        setFormData('');
      }
      const url1 = response?.data?.data;
      const formattedImages: any = url1?.map((item) => ({
        image_url: item?.replace(s3Url, ''),
        caption: '',
      }));
      // Update setInitialState
      setInitialState((prevState) => ({
        ...prevState,
        photos:
          prevState.photos?.length > 0
            ? [...prevState.photos, ...formattedImages]
            : formattedImages,
      }));
      setSrc(null);
      setSrcArray([]);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(ResidentialOverviewEnum.ERROR_UPLOADING_IMAGE);
    } finally {
      setModalOpen(false);
    }
  };
  const check = (event: any) => {
    if (event.length === 1) {
      setHide(true);
    }
  };
  const handlePrevPage = () => {
    navigate(`/residential/evaluation/images?id=${id}`);
  };
  const handleValidation = (values: any) => {
    setShowValidation(true);
    if (
      values.photos_taken_by === '' ||
      values?.photo_date === '' ||
      values?.photos?.some((photo: any) => photo.caption.trim() === '')
    ) {
      toast.info(ResidentialOverviewEnum.PLEASE_COMPLETE_MISSING_FIELDS, {
        icon: false,
        style: {
          backgroundColor: '#0DA1C7',
          color: 'white',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '320px',
        },
      });
    }
  };
  if (loading || loader) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }
  return (
    <>
      <ResidentialMenuOptions>
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
              <div className='relative flex overflow-hidden cursor-pointer'>
                {!hide ? (
                  <>
                    <div className='flex flex-col'>
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
                            {AppraisalPhotoPagesEnum.ADD_PROPERTY_IMAGE}
                          </Typography>
                        </DialogContent>
                      </div>
                      {srcArray?.length > 1 && (
                        <div className="flex justify-center">
                          {' '}
                          <p
                            style={{
                              marginTop: '20px',
                              background: '#e1e1e138',
                              border: '1px solid #e1e1e138',
                              padding: '19px 60px',
                              borderRadius: '5px',
                              fontSize: '18px',
                            }}
                          >
                            {srcArray?.length} images selected
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
                <CropImagePhotoSheet
                  getText={getText}
                  formDataObjectGet={formDataObjectGet}
                  field={selectedUniqueValue}
                  type="evaluation"
                  check={check}
                  src={src}
                  setSrc={setSrc}
                  srcArray={srcArray}
                  setSrcArray={setSrcArray}
                  cropModalOpen={undefined}
                  cropImageSrc={undefined}
                  cropImageUrl={undefined}
                />
              </div>
              <DialogActions className="absolute bottom-4">
                <CommonButton
                  onClick={uploadImage}
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
        <>
          <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
            <Typography
              variant="h1"
              component="h2"
              className="text-xl font-bold uppercase"
            >
              {AppraisalPhotoPagesEnum.PHOTOS}
            </Typography>
            <div className=" flex items-center">
              <ErrorOutlineIcon className="pr-[10px] w-[30px] h-[30px]" />
              <span className="text-xs">
                {AppraisalPhotoPagesEnum.PHOTO_PAGE_HEADER}
              </span>
            </div>
          </div>
          <div className="mt-10 xl:px-[60px] px-[15px]">
            <Formik
              initialValues={initialState}
              onSubmit={handleSubmit}
              validationSchema={EvalutionPhotoPagesSchema}
              enableReinitialize
            >
              {({ values, handleChange, errors }) => {
                return (
                  <Form>
                    <Grid container spacing={2} className='items-end'>
                      <Grid item xs={4} className="photo-taken">
                        <StyledField
                          label={
                            <span className="relative">
                              {AppraisalPhotoPagesEnum.PHOTO_TAKEN_BY}
                              <StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                            </span>
                          }
                          name="photos_taken_by"
                          onChange={(e) =>
                            setInitialState({
                              ...initialState,
                              photos_taken_by: e.target.value,
                            })
                          }
                          value={
                            values?.photos_taken_by === null
                              ? ''
                              : values?.photos_taken_by
                          }
                        />
                      </Grid>
                      <Grid
                        item
                        xs={4}
                        className="mt-[12px] common-label-wrapper"
                      >
                        <DatePickerComp
                          name="photo_date"
                          style={{ width: '100%' }}
                          label={
                            <span className="relative" style={{ fontSize: '16px' }}>
                              {AppraisalPhotoPagesEnum.PHOTO_DATE}<span className="text-red-500"> *</span>
                            </span>
                          }
                          value={
                            values.photo_date != null || values.photo_date != ''
                              ? moment(values.photo_date, [
                                moment.ISO_8601,
                                'MM/DD/YYYY',
                                'YYYY-MM-DD',
                                'YYYY-MM-DD HH:mm:ss',
                                'x', // Unix ms timestamp
                                'X', // Unix s timestamp
                              ])
                              : null
                          }
                          onChange={(date: Date | null) => {
                            if (date) {
                              const formattedDate = moment(date).format('MM/DD/YYYY');

                              handleChange({
                                target: {
                                  name: 'photo_date',
                                  value: formattedDate,
                                },
                              });

                              setInitialState((prev) => ({
                                ...prev,
                                photo_date: formattedDate,
                              }));
                            } else {
                              handleChange({
                                target: {
                                  name: 'photo_date',
                                  value: '',
                                },
                              });
                            }
                          }}
                        />
                        {errors && showValidation && (
                          <div className="text-red-500 text-[11px] absolute">
                            {errors.photo_date as any}
                          </div>
                        )}
                      </Grid>
                      <Grid item xs={4}>
                        <div className="flex justify-end">
                          <CommonButton
                            variant="contained"
                            color="primary"
                            size="small"
                            style={{ width: '270px' }}
                            onClick={handleModal}
                          >
                            {AppraisalPhotoPagesEnum.CLICK_HERE_TO_ADD_IMAGE}
                          </CommonButton>
                        </div>
                      </Grid>
                    </Grid>
                    {initialState?.photos?.length > 0 && (
                      <div className="photo-sheets mt-5 pb-24">
                        <ResidentialPhotoSheetTable
                          showValidation={showValidation}
                          setInitialState={setInitialState}
                          initialState={initialState}
                          srcArray={srcArray}
                          setSrcArray={setSrcArray}
                        />
                      </div>
                    )}
                    <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5 z-10">
                      <Button
                        // type='submit'
                        variant="contained"
                        color="primary"
                        size="small"
                        className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
                        onClick={() => handlePrevPage()}
                      >
                        <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
                      </Button>

                      <CommonButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="small"
                        style={{
                          width: '270px',
                          fontSize: '14px',
                        }}
                        // onClick={() => setShowValidation(true)}
                        onClick={() => handleValidation(values)}
                      >
                        {AppraisalPhotoPagesEnum.SAVE_AND_CONTINUE}
                        <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
                      </CommonButton>
                      {showScrollTop && (
                        <a
                          href="#harken"
                          id="backToTop"
                        >
                          &#8593;
                        </a>
                      )}
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </>
      </ResidentialMenuOptions>
    </>
  );
};

export default ResidentialEvaluationPhotoSheet;

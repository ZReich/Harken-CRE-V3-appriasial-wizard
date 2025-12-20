import { useEffect, useState } from 'react';
import { Location } from './create-comp/Location';
import addIcons from '../../images/AddIcons.png';

import { useFormikContext, FormikValues } from 'formik';
import CircularProgress from '@mui/material/CircularProgress';
import { CreateCompsEnum } from '../comps/enum/CompsEnum';
import { Icons } from '@/components/icons';
import CommonButton from '@/components/elements/button/Button';
import { Typography, DialogContent, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';

import { RequestType, useMutate } from '@/hook/useMutate';
import { UpdateProfileUserType } from '@/components/interface/update-profile-user-type';
import CropCompImage from '../comps/create-comp/crop-comp-image';

interface FormDataObject {
  file: string;
  id: number;
  type: string;
}

const Broker = ({ setDataRequited, updateData }: any) => {
  const { setFieldValue, values } = useFormikContext<FormikValues>();
  const [modalOpenCrop, setModalOpen] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState('');

  const [showImage, setShowImage] = useState(false);
  const [fake, setFake] = useState(false);

  const [showText, setShowText] = useState(false);
  const [formDataAll, setFormData] = useState<any>('');
  const [showLoader, setShowLoader] = useState(false);

  const { mutateAsync } = useMutate<UpdateProfileUserType, FormDataObject>({
    queryKey: 'upload-files/upload',
    endPoint: 'upload-files/upload',
    requestType: RequestType.POST,
  });

  const modalOpen = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!formDataAll) {
      toast.error('Please Select Image');
      return;
    }
    setModalOpen(false);
    setShowImage(true);
    setShowText(false);
    setFake(true);
  };

  const getText = (event: any) => {
    setShowText(event);
  };

  const formDataObject = (event: any) => {
    setFormData(event);
  };

  useEffect(() => {
    const fetchData = async () => {
      setShowLoader(true);
      if (fake) {
        try {
          const response = await mutateAsync(formDataAll);
          const url = response?.data.data.url;
          setFieldValue('property_image_url', url);
          if (url && !showLoader) {
            toast(response?.data?.message);
          }
          setShowLoader(false);
          setImageUrl(url);
          setFormData('');
          setFake(false);
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchData();
  }, [fake]);

  const closeModalCross = () => {
    setModalOpen(false);
    setShowText(false);
    setFormData('');
  };
  useEffect(() => {
    if (updateData) {
      setFieldValue('property_image_url', updateData.property_image_url);
    }
  }, [updateData]);

  return (
    <>
      <div>
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
                  top: '10px',
                  right: '15px',
                  cursor: 'pointer',
                  fontSize: '35px',
                }}
              >
                &times;
              </span>
              <div className="relative flex overflow-hidden cursor-pointer flex-col">
                {!showText ? (
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
                      Add Property Image
                    </Typography>
                  </DialogContent>
                ) : null}

                <CropCompImage
                  getText={getText}
                  formDataObjectGet={formDataObject}
                  type="users"
                />
              </div>
              <DialogActions className="absolute bottom-3">
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
        <div className="flex items-center mb-[20px]">
          <div
            onClick={modalOpen}
            className={
              'crop-icon xl:w-[345px] w-[245px] h-[241px] xl:h-[190px] rounded-lg flex items-center justify-center cursor-pointer'
            }
          >
            <div className="text-center relative z-[1]">
              <div className="absolute top-[50%] left-[50%] addImagewrapper">
                <img src={addIcons} alt="addicon" />
                <p className="m-0 text-[#84929A] text-xs font-normal">
                  {CreateCompsEnum.ADD_IMAGE}
                </p>
              </div>
              <div className="relative loaderMainWrapper">
                {fake && showLoader && showImage ? (
                  <CircularProgress
                    className={`loaderWrapper-broker ${imageUrl ? 'updateLoader' : ''}`}
                  />
                ) : null}
                {imageUrl && showImage ? (
                  <img
                    className="xl:w-[345px] w-[245px] h-[241px] xl:h-[190px]"
                    src={imageUrl}
                    alt="harken"
                  ></img>
                ) : (
                  updateData &&
                  updateData.property_image_url && (
                    <img
                      src={
                        import.meta.env.VITE_S3_URL + values.property_image_url
                      }
                      className="w-[345px] h-[241px] rounded-[5px]"
                    />
                  )
                )}
                {/* {fake && showLoader ? (
                  <CircularProgress className="loaderWrapper-broker" />
                ) : null} */}
              </div>
            </div>
          </div>
        </div>
        <Location setDataRequited={setDataRequited} updateData={updateData} />
      </div>
    </>
  );
};
export default Broker;

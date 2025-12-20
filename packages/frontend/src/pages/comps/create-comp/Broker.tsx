import React, { useEffect, useLayoutEffect, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Location } from './Location';
import { useFormikContext, FormikValues } from 'formik';
import CircularProgress from '@mui/material/CircularProgress';

import addIcons from '../../../images/AddIcons.png';
import { CreateCompsEnum, ListingEnum } from '../enum/CompsEnum';
import { Icons } from '@/components/icons';

import CommonButton from '@/components/elements/button/Button';
import { Typography, DialogContent, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';

const activeToggle = 'rounded-[20px] bg-[#0DA1C7] text-white py-3.5 px-3.5';

import { RequestType, useMutate } from '@/hook/useMutate';
import { UpdateProfileUserType } from '@/components/interface/update-profile-user-type';
import CropCompImage from './crop-comp-image';

interface FormDataObject {
  file: string;
  id: number;
  type: string;
}

const Broker = ({ setDataRequited, passData, sendType }: any) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  const [modalOpenCrop, setModalOpen] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState('');

  const [showImage, setShowImage] = useState(false);
  const [fake, setFake] = useState(false);

  const [showText, setShowText] = useState(false);
  const [formDataAll, setFormData] = useState<any>('');
  console.log(formDataAll, 'formdataalll');
  const [showLoader, setShowLoader] = useState(false);

  const { mutateAsync } = useMutate<UpdateProfileUserType, FormDataObject>({
    queryKey: 'upload-files/upload',
    endPoint: 'upload-files/upload',
    requestType: RequestType.POST,
  });

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (!newAlignment.length) {
      return;
    }
    setFieldValue('type', newAlignment);
    sendType(newAlignment);
  };

  useEffect(() => {
    if (passData.id) {
      setFieldValue('business_name', passData.business_name);
      setFieldValue('location_desc', passData.location_desc);
      setFieldValue('legal_desc', passData.legal_desc);
      setFieldValue('legal_desc', passData.legal_desc);
      setFieldValue('city', passData.city);
      setFieldValue('street_suite', passData.street_suite);
      setFieldValue('zipcode', passData.zipcode);
      setFieldValue('property_image_url', passData.property_image_url);
    }
  }, [passData.id]);

  useLayoutEffect(() => {
    if (passData.type === 'sale') {
      setFieldValue('type', 'sales');
    }

    if (passData.type === 'lease') {
      setFieldValue('type', 'leases');
    }
  }, [passData]);

  const modalOpen = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!formDataAll) {
      toast.error('Please Select Image');
      // setImageUrl('');
      return;
    }
    setShowImage(true);
    setModalOpen(false);
    setShowText(false);
    setFake(true);
    // setFormData('');
  };

  const getText = (event: any) => {
    setShowText(event);
  };

  const formDataObject = (event: any) => {
    console.log(event, 'eventttt');
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
          setShowLoader(false);
          if (url && !showLoader) {
            toast(response?.data?.message);
          }
          setImageUrl(url);
          setFake(false);
          setFormData('');
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchData();
  }, [fake, formDataAll]);

  const closeModalCross = () => {
    setFormData('');
    setModalOpen(false);
    setShowText(false);
  };

  return (
    <>
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
                      className="text-[#0DA1C7] text-3xl cursor-pointer"
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
      <div className="flex items-center mb-10">
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
                  className="xl:w-[345px] w-[245px] h-[241px] xl:h-[190px] "
                  src={imageUrl}
                  alt="harken"
                ></img>
              ) : (
                passData &&
                passData.property_image_url && (
                  <img
                    src={
                      import.meta.env.VITE_S3_URL + values.property_image_url
                    }
                    className="h-[237px] w-[341px] rounded-[5px]"
                  />
                )
              )}
            </div>
          </div>
        </div>

        <p className="pl-[50px] text-[#84929A] text-xs font-medium">
          {CreateCompsEnum.PROPERTY_ON}
        </p>

        <div className="ml-[30px]">
          <ToggleButtonGroup
            color="primary"
            value={values.type}
            onChange={handleChange}
            exclusive
            sx={{
              '&.MuiToggleButtonGroup-root': {
                maxHeight: 31,
                borderRadius: 32,
                width: '115px',
                backgroundColor: 'rgba(232, 248, 252, 1)',
              },
            }}
          >
            <ToggleButton
              value="leases"
              sx={{
                '&.MuiButtonBase-root': { px: 1 },
                fontSize: '12px',
                textTransform: 'capitalize',
                fontWeight: '500',
                padding: '10px!important',
              }}
              className={
                values.type === 'leases'
                  ? activeToggle
                  : 'border-0 text-[#90BCC8]'
              }
            >
              {ListingEnum.LEASES}
            </ToggleButton>
            <ToggleButton
              value="sales"
              sx={{
                fontSize: '12px',
                textTransform: 'capitalize',
                fontWeight: '500',
              }}
              className={
                values.type === 'sales'
                  ? activeToggle
                  : 'border-0 text-[#90BCC8]'
              }
            >
              {ListingEnum.SALES}
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
      <Location setDataRequited={setDataRequited} passData={passData} />
    </>
  );
};

export default Broker;

import { Box, Grid, Typography } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import UploadImages from '@/components/upload-images';
import { BackgroundDetails } from './BackgroundDetails';
import { Formik, Form } from 'formik';
import StarIcon from '@mui/icons-material/Star';
import { useGet } from '@/hook/useGet';
import { useMutate, RequestType } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import Loader from '@/components/loader/Loader';
import UploadSignature from '@/components/styles/upload-signature';
import CommonButton from '@/components/elements/button/Button';
import React, { ChangeEvent } from 'react';
import { UserGetDataType } from '@/components/interface/user-get-data';
import { ResponseType } from '@/components/interface/response-type';
import { UserUpdateProfileValidation } from '@/utils/validation-Schema';

export interface InitialValues {
  first_name: string | undefined;
  last_name: string | undefined;
  email_address: string | undefined;
  phone_number: string | undefined;
  position: string | undefined;
  qualification: string | undefined;
  background: string | undefined;
  affiliations: string | undefined;
  education: string | undefined;
  responsibility: string | undefined;
  profile_image_url: string | undefined;
  signature_image_url: string | undefined;
  include_background_in_pdf: number | undefined;
  include_affiliations_in_pdf: number | undefined;
  include_education_in_pdf: number | undefined;
  include_responsibility_in_pdf: number | undefined;
}
export const PersonalDetails = () => {
  const [loader, setLoader] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<string>('');
  const [userData,setUserData]=React.useState<any>('')
  const { data: personalDetails, isLoading,refetch } = useGet<UserGetDataType>({
    queryKey: 'header',
    endPoint: 'user/get',
    config: {},
  });
  const user = personalDetails?.data?.data?.user;
 React.useEffect(()=>{
  setUserData(user)

  },[user])
  
  const { mutate } = useMutate<ResponseType, InitialValues>({
    queryKey: 'user/update-personal-data',
    endPoint: `user/update-personal-data/${user?.id}`,
    requestType: RequestType.PATCH,
  });
  const mutation = useMutate<ResponseType, unknown>({
    queryKey: 'user/update',
    endPoint: 'user/check-email',
    requestType: RequestType.POST,
  });

  const formatPhoneNumber = (phoneNumber: string | undefined) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
  };
  const handleSubmit = (values: InitialValues) => {
    setLoader(true);
    mutate(
      {
        first_name: values?.first_name,
        last_name: values?.last_name,
        email_address: values?.email_address,
        phone_number: values?.phone_number,
        position: values?.position,
        qualification: values?.qualification,
        background: values?.background,
        affiliations: values?.affiliations,
        education: values?.education,
        responsibility: values?.responsibility,
        profile_image_url: values?.profile_image_url,
        signature_image_url: values?.signature_image_url,
        include_background_in_pdf: values?.include_background_in_pdf,
        include_affiliations_in_pdf: values?.include_affiliations_in_pdf,
        include_education_in_pdf: values?.include_education_in_pdf,
        include_responsibility_in_pdf: values?.include_responsibility_in_pdf,
      },
     
      {
        onSuccess: (res) => {
          setLoader(false);
          toast(res?.data?.message);
          refetch();
        },
        onError: () => {
          setLoader(false);
        },
      }
    );
   
  };

  if (isLoading) {
    return <> <Loader /> </>;
  }

  return (
    <>
      <Box className="mt-5">
        <Formik
          initialValues={{
            first_name: user?.first_name,
            last_name: user?.last_name,
            email_address: user?.email_address,
            phone_number: formatPhoneNumber(user?.phone_number),
            position: user?.position,
            qualification: user?.qualification,
            background: user?.background,
            affiliations: user?.affiliations,
            education: user?.education,
            responsibility: user?.responsibility,
            profile_image_url: user?.profile_image_url,
            signature_image_url: user?.signature_image_url,
            include_background_in_pdf: user?.include_background_in_pdf || 1,
            include_affiliations_in_pdf: user?.include_affiliations_in_pdf || 1,
            include_education_in_pdf: user?.include_education_in_pdf || 1,
            include_responsibility_in_pdf: user?.include_responsibility_in_pdf || 1,
          }}
          validationSchema={UserUpdateProfileValidation}
          onSubmit={handleSubmit}
        >
          {({ handleChange, setFieldValue, values }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={4} xl={3}>
                  <UploadImages personalDetails={personalDetails} userData={userData} />
                </Grid>
                <Grid item xs={4} xl={3} className="mt-[67px]">
                  <StyledField
                    label={
                      <span className="relative">
                        First Name
                        <StarIcon className="absolute text-[6px] text-red-500 right-[-10px] top-0.5" />
                      </span>
                    }
                    name="first_name"
                    onChange={handleChange}
                    value={values.first_name}
                    type="text"
                  />
                </Grid>
                <Grid item xs={4} xl={3} className="mt-[67px]">
                  <StyledField
                    label={
                      <span className="relative">
                        Last Name
                        <StarIcon className="absolute text-[6px] text-red-500 right-[-10px] top-0.5" />
                      </span>
                    }
                    name="last_name"
                    onChange={handleChange}
                    value={values.last_name}
                    type="text"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={3} className="mt-2">
                <Grid item xs={3}>
                  <StyledField
                    onFocus={(e: ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('email_address', e.target.value);
                      mutation.mutate(
                        {
                          id: `${user?.id}`,
                          email_address: e.target.value,
                        },
                        {
                          onError: (error:any) => {
                            setErrors(error?.response?.data?.data?.message);
                          }
                        }
                      );
                    }}
                    label={
                      <span className="relative">
                        Email Address
                        <StarIcon className="absolute text-[6px] text-red-500 right-[-10px] top-0.5" />
                      </span>
                    }
                    onChange={handleChange}
                    name="email_address"
                    value={values.email_address}
                    type="text"
                  />
                  {errors && (
                    <div className="text-red-600 text-base">{errors}</div>
                  )}
                </Grid>
                <Grid item xs={3}>
                  <StyledField
                    label={
                      <span className="relative">
                        Phone Number
                        <StarIcon className="absolute text-[6px] text-red-500 right-[-10px] top-0.5" />
                      </span>
                    }
                    name="phone_number"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const inputPhoneNumber = e.target.value;
                      const formattedPhoneNumber =
                        formatPhoneNumber(inputPhoneNumber);
                      if (
                        formattedPhoneNumber !== undefined &&
                        formattedPhoneNumber.replace(/\D/g, '').length <= 10
                      ) {
                        setFieldValue('phone_number', formattedPhoneNumber);
                      }
                    }}
                    value={values.phone_number}
                    type="text"
                  />
                </Grid>
                <Grid item xs={3}>
                  <StyledField
                    label={
                      <span className="relative">
                        Position(ex.Broker)
                        <StarIcon className="absolute text-[6px] text-red-500 right-[-10px] top-0.5" />
                      </span>
                    }
                    name="position"
                    onChange={handleChange}
                    value={values.position}
                    type="text"
                  />
                  { values && values.position && values.position.length<3 ? <div className='text-red-500 text-[11px]'>Position length must be at least 3 characters.</div>:null}
                </Grid>
                <Grid item xs={3}>
                  <StyledField
                    label="Qualifications(ex.SIOR)"
                    name="qualification"
                    onChange={handleChange}
                    value={values.qualification}
                    type="text"
                  />
                </Grid>
              </Grid>
              <BackgroundDetails />
              <Box className="mt-8">
                <Typography
                  variant="h4"
                  component="h4"
                  className="text-lg font-montserrat font-bold py-5"
                  style={{ fontFamily: 'montserrat-normal' }}
                >
                  HANDWRITTEN SIGNATURE
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <UploadSignature personalDetails={personalDetails} />
                  </Grid>
                  <Grid item xs={6}>
                    <div className="flex justify-end mt-[80px]">
                      <CommonButton
                        color="primary"
                        type="submit"
                        variant="contained"
                        style={{
                          width: '291px',
                          height: '46px',
                          borderRadius: '7px',
                          fontWeight: 'bold',
                          fontSize: '14px',
                        }}
                      >
                        {loader ? <Loader /> : 'update'}
                      </CommonButton>
                    </div>
                  </Grid>
                </Grid>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
};

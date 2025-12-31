import { Box, Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { Icons } from '@/components/icons';
import { Form, Formik } from 'formik';
import SelectTextField from '@/components/styles/select-input';
import TextEditor from '@/components/styles/text-editor';
import CommonButton from '@/components/elements/button/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { UserAccountValidation } from '@/utils/validation-Schema';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { useGet } from '@/hook/useGet';
import React from 'react';

const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data, isLoading, refetch } = useGet<any>({
    queryKey: `accounts/${id}`,
    endPoint: `accounts/get/${id}`,
    config: { refetchOnWindowFocus: false, enabled: !!id },
  });

  const mutation = useMutate<any, any>({
    queryKey: `accounts/update-contact/${id}`,
    endPoint: `accounts/update-contact/${id}`,
    requestType: RequestType.PATCH,
  });
  const createMutation = useMutate<any, any>({
    queryKey: `accounts/create-contact`,
    endPoint: `accounts/create-contact`,
    requestType: RequestType.POST,
  });

  const accountData = data && data.data && data.data.data;

  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  if (id && isLoading) {
    return <>Loading</>;
  }
  return (
    <>
      <Box className="mt-5">
        <Formik
          initialValues={{
            name: (accountData && accountData?.name) || '',
            phone_number: (accountData && accountData?.phone_number) || '',
            street_address: (accountData && accountData?.street_address) || '',
            city: (accountData && accountData?.city) || '',
            state: (accountData && accountData?.state) || '',
            zipcode: (accountData && accountData?.zipcode) || null,
            detail: (accountData && accountData?.detail) || '',
            share_clients: accountData?.share_clients===1 ? true : false
          }}
          validationSchema={UserAccountValidation}
          onSubmit={async (values, { setSubmitting }) => {
            if (isSubmitting) return;
            setIsSubmitting(true);
            const payload = {
              ...values,
              zipcode: values.zipcode ? Number(values?.zipcode) : null,
              share_clients: values.share_clients=== true? 1: 0,
            };

            try {
              if (id) {
                const response = await mutation.mutateAsync(payload);
                refetch();
                toast(response?.data.message);
                navigate('/accounts');
              } else {
                const response = await createMutation.mutateAsync(payload);
                toast(response?.data.message);
                navigate('/accounts');
              }
            } catch (error: any) {
              toast(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, errors, handleSubmit }) => {
            return (
              <Form onSubmit={handleSubmit}>
                <Box>
                  <Typography
                    variant="h4"
                    component="h4"
                    className="text-lg font-montserrat font-bold"
                    style={{ fontFamily: 'montserrat-normal' }}
                  >
                    SETTINGS
                  </Typography>
                  <Box className="mt-3">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.share_clients}
                          onChange={(e) =>
                            setFieldValue('share_clients', e.target.checked)
                          }
                          name="share_clients"
                        />
                      }
                      label={
                        <span className="text-[#A1A1AA] font-medium text-sm">
                          Share client lists between agents?
                        </span>
                      }
                    />
                  </Box>

                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    component="h4"
                    className="text-lg font-montserrat font-bold py-8"
                    style={{ fontFamily: 'montserrat-normal' }}
                  >
                    CONTACTS
                  </Typography>
                   <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <StyledField
                      label={
                        <span className="relative">
                          Business Name
                          <Icons.StarIcon className="absolute text-[6px] text-red-500 right-[-10px] top-0.5" />
                        </span>
                      }
                      name="name"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <StyledField
                      label={<span className="relative">Phone Number</span>}
                      name="phone_number"
                      maxLength="14"
                      value={values.phone_number}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        let phoneNumber = e.target.value.replace(/\D/g, '');
                        if (phoneNumber.length <= 10) {
                          if (phoneNumber.length > 6) {
                            phoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
                          } else if (phoneNumber.length > 3) {
                            phoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}`;
                          } else if (phoneNumber.length > 0) {
                            phoneNumber = `(${phoneNumber.slice(0, 3)}`;
                          }
                        }
                        setFieldValue('phone_number', phoneNumber);
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2} className="mt-4 items-end">
                  <Grid item xs={3}>
                    <StyledField label="Street Address" name="street_address" />
                  </Grid>
                  <Grid item xs={3}>
                    <StyledField label="City" name="city" />
                  </Grid>
                  <Grid item xs={3} className="mt-[1px] selectFixedHeight">
                    <SelectTextField
                      options={usaStateOptions}
                      label="State"
                      name="state"
                      defaultValue={(accountData && accountData?.state) || ''}
                      onChange={(selectedState) =>
                        setFieldValue('state', selectedState.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <StyledField
                      label="Zipcode"
                      name="zipcode"
                      value={values.zipcode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const zipCode = e.target.value.replace(/\D/g, '');
                        if (zipCode.length <= 5) {
                          setFieldValue('zipcode', zipCode);
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                </Box>
               
                <Box className="mt-[30px]">
                  <Typography
                    variant="h4"
                    component="h4"
                    className="text-lg font-montserrat font-bold py-5"
                    style={{ fontFamily: 'montserrat-normal' }}
                  >
                    PROFILE
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <label className="text-customGray text-xs">
                        <span>
                          About the company
                          <span className="text-red-500"> *</span>
                        </span>
                      </label>
                      <TextEditor
                        name="detail"
                        editorContent={values.detail}
                        editorData={(e: string) => setFieldValue('detail', e)}
                      />
                      <div className="text-red-500 mt-[46px]  text-[11px]">
                        {errors.detail as string}
                      </div>
                    </Grid>
                  </Grid>

                  <p className="text-lg text-[#0DA1C7] mt-[10px]">
                    This section should outline more information about your
                    company, and will be placed at the end of your forms.
                  </p>
                  <div className="flex justify-end mt-10">
                    <CommonButton
                      color="primary"
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      style={{
                        width: '291px',
                        height: '46px',
                        borderRadius: '7px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                      }}
                    >
                      {id ? 'Update' : 'Create'}
                    </CommonButton>
                  </div>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </>
  );
};
export default ContactDetails;

import { Formik, Form } from 'formik';
import { Autocomplete, Grid, TextField, Typography } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import CommonButton from '@/components/elements/button/Button';
import { AppraisalClientValidation } from '@/utils/validation-Schema';
import { AccountListDataType } from '@/components/interface/account-list-data';
import { useGet } from '@/hook/useGet';
import moment from 'moment';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import AutocompleteLocation from '@/pages/comps/create-comp/searchLocation';
import { TilleTypeJson } from './frontJson';
import { CustomSelect } from '@/components/custom-select';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate, useParams } from 'react-router-dom';
import { UsaStateCodes } from '@/utils/usaState';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
const usaStateOptions = Object.entries(usa_state[0]).map(([value, label]) => ({
  value,
  label,
}));

interface ClientData {
  title?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  street_address?: string;
  state?: string;
  zipcode?: string;
  email_address?: string;
  account_id?: number | null;
  phone_number?: string;
  city?: string;
}
const EditClientForm = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem('role');
  const [clientData, setClientData] = useState<ClientData | any>(null);
  const [autoFilledStreet] = useState(''); // To store the company address separately if needed
  const [selectedAccountId, setSelectedAccountId] = useState<any>(null);
  const [, setAutoFilledCompany] = useState(''); // To store the company address separately if needed

  console.log('clientData,', clientData);
  const isSuperAdmin = role == '1' ? true : false;
  const { id } = useParams(); // Extracts 'id' from the URL
  console.log('ID:', id);

  const { data } = useGet<AccountListDataType>({
    queryKey: 'accounts/list',
    endPoint: 'accounts/list',
    config: { enabled: isSuperAdmin },
  });

  const fetchComposData = async () => {
    try {
      const response = await axios.get(`client/get/${id}`);
      const rollData = response?.data?.data?.data;
      console.log('clientdata', response?.data?.data?.data);
      const statusCode = response?.data?.data?.statusCode;
      setSelectedAccountId(response?.data?.data?.data?.account_id);
      setAutoFilledCompany(response?.data?.data?.data?.company);
      if (statusCode === 200) {
        setClientData(rollData); // Set fetched data
      } else if (statusCode === 404) {
        console.log('No data found');
      }
    } catch (error) {
      console.error('Error fetching comps data:', error);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (id) {
      fetchComposData();
    }
  }, [id]);

  // update client api
  const mutation = useMutate<any, any>({
    queryKey: `client/update`,
    endPoint: `client/update/${id}`,
    requestType: RequestType.PATCH,
  });
  // get the user account options
  const userAccountOptions = data?.data?.data?.accounts?.map((ele) => {
    return {
      value: ele?.id,
      label: `${ele?.name} (Created at ${moment(ele?.created).subtract(10, 'days').calendar()})`,
    };
  });

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          title: clientData?.title || '',
          first_name: clientData?.first_name || '',
          last_name: clientData?.last_name || '',
          company: clientData?.company || '',
          street_address: autoFilledStreet || clientData?.street_address || '', // Bind to autoFilledStreet
          state: usa_state[0][clientData?.state?.toLowerCase()] || '',
          zipcode: clientData?.zipcode || '',
          email_address: clientData?.email_address || '',
          phone_number: clientData?.phone_number || '',
          city: clientData?.city || '',
        }}
        validationSchema={AppraisalClientValidation}
        onSubmit={async (values, actions) => {
          const stateCode = Object.keys(UsaStateCodes).find(
            (key) => UsaStateCodes[key] === values.state
          );

          const formattedData = {
            ...values,
            state: stateCode || values.state,
          };

          try {
            const response = await mutation.mutateAsync(formattedData);
            const responseMessage = response?.data;
            toast(responseMessage.message);
            if (responseMessage.message) {
              navigate('/clients-list');
              localStorage.setItem('client_id', responseMessage?.data.id);
            }
          } catch (error) {
            console.error(error);
          }

          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting, handleSubmit, setFieldValue, values, setValues }) => {
          console.log('CLIENT_DATA_VALUES', values);
          return (
            <Grid container spacing={2} className="create-client-wrapper">
              <Grid item xs={12} className="m-auto mt-5">
                <Typography
                  variant="h6"
                  component="h4"
                  className="text-2xl font-bold"
                >
                  UPDATE CLIENT
                </Typography>
                <Form onSubmit={handleSubmit} className="mt-6 create-client">
                  <>
                    <Typography
                      variant="h6"
                      component="h6"
                      className="text-sm font-bold"
                    >
                      CLIENT
                    </Typography>
                    <div className="text-sm font-medium py-4 text-customGray">
                      Specify the Business Information. This will be used for
                      reference and to email appraisals when completed.
                    </div>

                    {/* Name Fields */}
                    <Grid container spacing={2} className="mt-6 items-end">
                      <Grid item xs={3} className="floatingLabelDropdown">
                        <CustomSelect
                          label="Select Title"
                          options={TilleTypeJson}
                          value={values.title}
                          onChange={(e: SelectChangeEvent<string>) => {
                            setFieldValue('title', e.target.value);
                          }}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <StyledField
                          label={
                            <span className="relative text-xs">
                              First Name
                              <StarIcon className="relative text-[6px] text-red-500 -top-1 -right-1" />
                            </span>
                          }
                          name="first_name"
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <StyledField
                          label={
                            <span className="relative text-xs">
                              Last Name
                              <StarIcon className="relative text-[6px] text-red-500 -top-1 -right-1" />
                            </span>
                          }
                          name="last_name"
                        />
                      </Grid>
                    </Grid>

                    {/* Address Fields */}
                    <Grid container spacing={2} className="mt-[20px] items-end">
                      <Grid item xs={6} className="relative googleAddressField">
                        {}
                        <AutocompleteLocation
                          // value={'New york'} // Use Formik's value instead of autoFilledCompany
                          onSelected={(location: any) => {
                            console.log('Location selected:', location);

                            const selectedStreet =
                              location.address ||
                              location.formatted_address ||
                              '';
                            const selectedCompany = location.description ?? '';

                            console.log('Selected Street:', selectedStreet);
                            console.log('Selected Company:', selectedCompany);

                            setValues((prevValues) => ({
                              ...prevValues,
                              street_address: selectedStreet,
                              state: location.state || '',
                              zipcode: location.zipCode || '',
                              city: location.city || '',
                              company: selectedCompany, // Directly update Formik
                            }));
                          }}
                          onRawInput={(input: string) => {
                            console.log('⌨️ User raw input:', input);
                            setValues((prevValues) => ({
                              ...prevValues,
                              company: input, // Update Formik's value
                            }));
                          }}
                          label={'appraisal'}
                        />

                        {/* Also log the initial company value */}
                      </Grid>
                      <Grid item xs={3}>
                        <StyledField
                          label="Email Address"
                          name="email_address"
                        />
                      </Grid>

                      <Grid item xs={3}>
                        <StyledField
                          label={<span className="relative">Phone Number</span>}
                          name="phone_number"
                          maxLength="14"
                          value={values.phone_number}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            let phoneNumber = e.target.value.replace(/\D/g, ''); // Remove non-digits
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

                    <Grid container spacing={2} className="mt-[20px] items-end">
                      {/* Street Address */}
                      <Grid item xs={3}>
                        <StyledField
                          label="Street Address"
                          name="street_address"
                          value={values.street_address} // Formik's state should be the main source of truth
                          onChange={(e) => {
                            const newStreetAddress = e.target.value;
                            console.log(
                              'Manual Street Address Input:',
                              newStreetAddress
                            );
                            setValues((prevValues) => ({
                              ...prevValues,
                              street_address: newStreetAddress,
                            }));
                          }}
                        />
                      </Grid>

                      {/* City */}
                      <Grid item xs={3}>
                        <StyledField label="City" name="city" />
                      </Grid>
                      <Grid item xs={3} className='selectFixedHeight'>
                        <Autocomplete
                          disableClearable
                          options={usaStateOptions}
                          value={
                            values.state
                              ? { label: values.state, value: values.state }
                              : { label: '-Select State-', value: '' }
                          }
                          onChange={(_event, newValue) => {
                            setFieldValue('state', newValue?.label || '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="State"
                              variant="standard"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <StyledField
                          label="Zip Code"
                          name="zipcode"
                          value={values.zipcode}
                          onChange={(event) => {
                            let { value } = event.target;
                            value = value.replace(/\D/g, '');
                            if (value.length <= 5) {
                              setFieldValue('zipcode', value);
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    {/* Account Selection */}
                    {isSuperAdmin && (
                      <Grid container spacing={2} className="mt-[20px]">
                        <Grid item xs={8}>
                          <Typography
                            variant="h6"
                            component="h6"
                            className="text-sm font-bold"
                          >
                            ACCOUNT
                          </Typography>
                          <div className="text-sm font-medium pt-4 text-customGray">
                            Specify the Harken CRE's account this company
                            belongs to. This field is set automatically upon
                            user creation and shouldn't be changed regularly.
                          </div>
                          <Autocomplete
                            id="combo-box-demo"
                            options={userAccountOptions || []}
                            onChange={(_e, newValue) => {
                              // If no selection, reset to null
                              const accountId = newValue
                                ? newValue.value
                                : null;
                              setFieldValue(
                                'account_id',
                                newValue ? newValue.value : null
                              );
                              // Set selected account ID to state and form field
                              setSelectedAccountId(accountId);
                              setFieldValue('account_id', accountId);
                            }}
                            sx={{
                              '& .MuiAutocomplete-listbox': {
                                maxHeight: '50px',
                              },
                              cursor: 'pointer',
                            }}
                            value={
                              // Ensure the value is set correctly using state or form value
                              userAccountOptions?.find(
                                (option) => option.value === selectedAccountId
                              ) || null
                            }
                            className="mt-4"
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Account"
                                variant="standard"
                                InputLabelProps={{ shrink: true }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </>
                  <div className="flex justify-end mt-10 mb-5">
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Update Client'}
                    </CommonButton>
                  </div>
                </Form>
              </Grid>
            </Grid>
          );
        }}
      </Formik>
    </>
  );
};

export default EditClientForm;

import { CustomSelect } from '@/components/custom-select';
import CommonButton from '@/components/elements/button/Button';
import { AccountListDataType } from '@/components/interface/account-list-data';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { TilleTypeJson } from '@/pages/appraisal/set-up/frontJson';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import AutocompleteLocation from '@/pages/comps/create-comp/searchLocation';
import { CreateCompsEnum } from '@/pages/comps/enum/CompsEnum';
import { AuthContext } from '@/pages/login/AuthProvider';
import { UsaStateCodes } from '@/utils/usaState';
import { EvaluationClientValidation } from '@/utils/validation-Schema';
import StarIcon from '@mui/icons-material/Star';
import { Autocomplete, Grid, TextField, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Form, Formik } from 'formik';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const usaStateOptions = Object.entries(usa_state[0]).map(([value, label]) => ({
  value,
  label,
}));

const ResidentialClientForm = ({ handleCloseModal }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = location.state || {};
  const authValues = useContext(AuthContext);
  const [, setZipCode] = useState('');
  const [isRawData] = useState('');
  const [, setCity] = useState('');
  const [, setState] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [manualStreetAddress, setManualStreetAddress] = useState('');
  // const [typedStreetAddress, setTypedStreetAddress] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<any>(null);

  const role = localStorage.getItem('role');
  const isSuperAdmin = role == '1' ? true : false;
  const { data } = useGet<AccountListDataType>({
    queryKey: 'accounts/list',
    endPoint: 'accounts/list',
    config: { enabled: isSuperAdmin },
  });

  const { data: userinfo } = useGet<AccountListDataType>({
    queryKey: 'user/get',
    endPoint: 'user/get',
    config: { enabled: isSuperAdmin },
  });
  // const sessionAccountId = sessionData?.data?.data?.data?.user?.account_id;
  const mutation = useMutate<any, any>({
    queryKey: `client/create`,
    endPoint: 'client/create',
    requestType: RequestType.POST,
  });
  useEffect(() => {
    if (userinfo) {
      console.log(
        'userinfouserinfouserinfouserinfo',
        userinfo?.data?.data?.user?.account_id
      );
      const usrID = userinfo?.data?.data?.user?.account_id;
      setSelectedAccountId(usrID);
    }
  }, [userinfo]);
  const userAccountOptions = data?.data?.data?.accounts.map((ele) => {
    return {
      value: ele?.id,
      label: `${ele?.name} (Created at ${moment(ele?.created).subtract(10, 'days').calendar()})`,
    };
  });
  console.log('Current Pathname:', window.location.pathname);
  console.log('ID Value:', id);

  useEffect(() => {
    const handlePopState = () => {
      console.log('Current Pathname:', window.location.pathname);

      if (id && window.location.pathname.startsWith('/client-edit/')) {
        navigate('/clients-list');
      } else if (window.location.pathname === '/create-client') {
        navigate('/evaluation-set-up');
      } else if (
        window.location.pathname === '/create-new-client' ||
        window.location.pathname === '/create-new-client/'
      ) {
        navigate('/clients-list');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [id, navigate]);
  // const handleChangeZipcode = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   let { value } = event.target;

  //   // Remove non-digit characters
  //   value = value.replace(/\D/g, '');

  //   // Ensure it updates the form state correctly
  //   setFieldValue('zipcode', value);
  // };

  useEffect(() => {
    console.log(authValues, 'authValues');
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          title: '',
          first_name: '',
          last_name: null,
          company: '',
          street_address: '',
          state: '',
          zipcode: '',
          email_address: '',
          account_id: null,
          phone_number: null,
          city: null,
        }}
        validationSchema={EvaluationClientValidation}
        onSubmit={async (values, actions) => {
          const stateCode = Object.keys(UsaStateCodes).find(
            (key) => UsaStateCodes[key] === values.state
          );
          const formattedData = {
            first_name: values.first_name,
            last_name: values.last_name,
            email_address: values.email_address,
            title: values.title,
            company: values.company,
            city: values.city,
            state: stateCode || values.state,
            zipcode: values.zipcode,
            street_address: manualStreetAddress || streetAddress,
            phone_number: values.phone_number,
            account_id: selectedAccountId,
          };

          try {
            const response = await mutation.mutateAsync(formattedData);
            const responseMessage = response?.data;
            toast(responseMessage.message);
            localStorage.setItem('client_id', responseMessage?.data.id);
            if (
              responseMessage.message &&
              window.location.pathname.includes('create-new-client')
            ) {
              navigate(`/clients-list`);
              console.log('new-client');
              localStorage.setItem('client_id', responseMessage?.data.id);
            } else if (
              responseMessage.message &&
              window.location.pathname.includes('update-evaluation/residential-set-up')
            ) {
              handleCloseModal();
            } else if (
              responseMessage.message &&
              window.location.pathname.includes('evaluation/residential-set-up')
            ) {
              handleCloseModal();
            } else {
              console.log('old client');
              navigate('/evaluation/residential-set-up');
            }
          } catch (error) {
            console.log(error);
          }

          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting, handleSubmit, setFieldValue, values, setValues }) => {
          console.log('addvalues', values);

          return (
            <Grid container spacing={2} className="create-client-wrapper">
              <Grid item xs={12} className="m-auto mt-5">
                <Typography
                  variant="h6"
                  component="h4"
                  className="text-2xl font-bold"
                >
                  CREATE CLIENT
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
                      Specify the Business Information.This will be used for
                      reference,and to email appraisals when completed.
                    </div>
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

                    <Grid container spacing={2} className="mt-[20px] items-end">
                      <Grid item xs={6} className="relative googleAddressField">
                        <AutocompleteLocation
                          // value={values?.company} // Bind the input to streetAddress state
                          onSelected={(location: any) => {
                            console.log('Selected Location:', location); // Log the whole location object
                            const selectedAddress = location.address;

                            // Update the form values with the selected location data
                            setValues((old: any) => ({
                              ...old,
                              street_address: selectedAddress,
                              company: location.description,
                              // Update street_address with selected address
                              state: location.state,
                              zipcode: location.zipCode,
                              county: location.county,
                              city: location.city,
                              geometry: location.geometry,
                            }));

                            setStreetAddress(selectedAddress); // Store the selected street address
                            setZipCode(location.zipCode);
                            setCity(location.city);
                            setState(location.state);
                            setManualStreetAddress('');
                            // Log the selected address
                            console.log(
                              'Street Address after selection (Autofill):',
                              selectedAddress
                            );
                          }}
                          onRawInput={(input: any) => {
                            console.log(
                              'User is typing in autocomplete:',
                              input
                            ); // Log raw input from the user
                            setIsUserTyping(input);
                            setValues((prev: any) => ({
                              ...prev,
                              company: input, // Update the state with the new value
                            }));

                            console.log(
                              'Street Address after manual input:',
                              isUserTyping
                            );
                          }}
                          label={'appraisal'}
                        />

                        <div className="px-2">
                          <div
                            className={`google absolute w-5 h-5 inline-block bg-contain bg-center bg-no-repeat bg-[url("../../frontend//src/images/google_logo.png")] top-[30px] ${isRawData ? 'right-10' : 'right-0'}`}
                          ></div>
                        </div>
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
                          value={values.street_address}
                          onChange={(e: any) => {
                            const newStreetAddress = e.target.value;
                            console.log(
                              'Street Address Value:',
                              newStreetAddress
                            );
                            setFieldValue('street_address', newStreetAddress);
                          }}
                        />
                      </Grid>

                      {/* City */}
                      <Grid item xs={3}>
                        <StyledField
                          label={<span>{CreateCompsEnum.CITY}</span>}
                          name="city"
                          value={values.city}
                        />
                      </Grid>

                      {/* State */}
                      <Grid item xs={3} className="mt-[4px] selectFixedHeight">
                        <Autocomplete
                          disableClearable={true}
                          options={usaStateOptions}
                          value={
                            values.state
                              ? {
                                  value: values.state,
                                  label:
                                    UsaStateCodes[values.state] || values.state, // Ensure label is always the state name
                                }
                              : { value: '', label: '-Select State-' }
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.value === value.value
                          }
                          onChange={(_event, newValue) => {
                            if (newValue) {
                              setState(newValue.label); // Show the state name in UI
                              setFieldValue('state', newValue.label); // Store the state code in Formik
                            } else {
                              setState('');
                              setFieldValue('state', '');
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={
                                <span className="text-customGray">
                                  {CreateCompsEnum.STATE}
                                </span>
                              }
                              variant="standard"
                            />
                          )}
                        />
                      </Grid>

                      {/* Zip Code */}
                      <Grid item xs={3}>
                        <StyledField
                          label="Zip Code"
                          name="zipcode"
                          value={values.zipcode}
                          onChange={(event) => {
                            // const value = event.target.value.replace(/\D/g, ''); // Allow only numbers
                            // setFieldValue('zipcode', value); // Set the cleaned value in Formik
                            let { value } = event.target;
                            value = value.replace(/\D/g, '');
                            if (value.length <= 5) {
                              setFieldValue('zipcode', value);
                            }
                          }}
                          {...{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                          }} // Show numeric keyboard on mobile
                        />
                      </Grid>
                    </Grid>

                    {isSuperAdmin && (
                      <Grid container spacing={2} className="mt-5">
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
                              //   setFieldValue('account_id', accountId);

                              // Log the selected account ID
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
                  <div className="flex justify-end mt-7">
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
                      {isSubmitting ? 'Saving...' : 'Save Client'}
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

export default ResidentialClientForm;

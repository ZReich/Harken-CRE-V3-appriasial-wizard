import { Box, Grid, Typography } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import {
  propertyTypeOptions,
  categoryOptions,
  CompAdustmentModeSelection,
  statusOption,
} from './select-option/Select';
import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { useGet } from '@/hook/useGet';
import moment from 'moment';
import { FieldArray, Form, Formik } from 'formik';
import group3 from '../../../images/Group3.png';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import Loader from '@/components/loader/Loader';
import React, { ChangeEvent } from 'react';
import { UserGetDataType } from '@/components/interface/user-get-data';
import { AccountListDataType } from '@/components/interface/account-list-data';
import { ResponseType } from '@/components/interface/response-type';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
interface Significant {
  comp_adjustment_mode: string | undefined;
  account_id: any;
  status: string | undefined;
  significant_in_pdf: any;
  users_transactions: any;
}

const SignificantTransaction = () => {
  const [errors, setErrors] = React.useState<boolean>(false);

  const { data: data1, isLoading: loadingUser,refetch } = useGet<UserGetDataType>({
    queryKey: 'user/get',
    endPoint: 'user/get',
    config: {},
  });
  const user = data1?.data?.data?.user;

  const { data, isLoading: loadingOptions } = useGet<AccountListDataType>({
    queryKey: 'accounts/list',
    endPoint: 'accounts/list',
    // config: {},
    config: { enabled: Boolean(user?.role === 1 || user?.role === 4), refetchOnWindowFocus: false }
  });

  const userAccountOptions = data?.data?.data?.accounts.map((ele) => {
    return {
      value: ele?.id,
      label: `${ele?.name} (Created at ${moment(ele?.created).subtract(10, 'days').calendar()})`,
    };
  });
  


  const { mutate } = useMutate<ResponseType, Significant>({
    queryKey: 'user/update',
    endPoint: `user/update-transaction-data/${user?.id}`,
    requestType: RequestType.PATCH,
  });

  const handleSubmit = (values: Significant) => {
    setErrors(true);
    mutate(
      {
        status: values.status,
        comp_adjustment_mode: values.comp_adjustment_mode,
        account_id: values.account_id?.value,
        significant_in_pdf: values.significant_in_pdf === true ? 1 : 0,
        users_transactions: values.users_transactions?.map(
          (ele: {
            category: string;
            name: string;
            sf: string;
            type: string;
            id: number;
          }) => {
            return {
              category: ele.category,
              name: ele.name,
              sf: parseFloat(ele.sf.replace(/,/g, '')),
              type: ele.type,
              id:ele.id || null,
            };
          }
        ),
      },
      {
        onSuccess: (res) => {
          refetch();
          setErrors(false);
          toast(res?.data?.message);
        },
        onError: () => {
          setErrors(false);
        },
      }
    );
  };
  const formatSquareFootage = (squareFootage: number | string) => {
    // Remove any non-digit characters
    const cleaned = ('' + squareFootage).replace(/\D/g, '');
    // Add commas after every three digits
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formatted;
  };

  if (loadingOptions || loadingUser) {
    return <>Loading </>;
  }
  return (
    <Box>
      <Typography
        variant="h6"
        component="p"
        className="text-xs font-medium mt-3 text-[#84929A]"
      >
        Enter any significant transactions that you have completed. These will
        be added to your form by category.
      </Typography>
      <Box>
        <Formik
          initialValues={{
            comp_adjustment_mode: user?.comp_adjustment_mode,
            account_id: userAccountOptions?.find(
              (u) => u.value === user?.account_id
            ),
            status: user?.status,
            significant_in_pdf: user?.significant_in_pdf !== 0,
            users_transactions:
              user && user?.users_transactions?.length > 0
                ? user?.users_transactions.map((ele) => {
                  return {
                    name: ele.name,
                    sf: formatSquareFootage(ele.sf),
                    type: ele.type,
                    category: ele.category,
                    id: ele.id,
                  };
                })
                : [
                  {
                    name: '',
                    sf: '',
                    type: '',
                    category: '',
                    id: '',
                  },
                ],
          }}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => {
            return (
              <Form>
                <FieldArray
                  name="users_transactions"
                  render={(arrayHelpers) => (
                    <Box className="mt-[20px] bg-[#FBFBFB] p-6">
                      {values.users_transactions.map((field, index) => {
                        // field.id=index;
                        return (
                          <Grid
                            container
                            spacing={2}
                            key={index}
                            className="mt-1 items-end"
                            alignItems="center"
                          >
                            <Grid item xs={3}>
                              <StyledField
                                label="Transaction Name"
                                name={`users_transactions[${index}].name`}
                                value={field.name}
                                onChange={(
                                  e: ChangeEvent<HTMLInputElement>
                                ) => {
                                  setFieldValue(
                                    `users_transactions[${index}].name`,
                                    e.target.value
                                  );
                                }}
                                style={{
                                  backgroundColor: '#FBFBFB',
                                  borderBottomWidth: '1px',
                                }}
                                type="text"
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <StyledField
                                label="Square Footage"
                                name={`users_transactions[${index}].sf`}
                                value={field.sf}
                                onChange={(
                                  e: ChangeEvent<HTMLInputElement>
                                ) => {
                                  const inputSquareFootage = e.target.value;
                                  const formattedSquareFootage =
                                    formatSquareFootage(inputSquareFootage);
                                  setFieldValue(
                                    `users_transactions[${index}].sf`,
                                    formattedSquareFootage
                                  );
                                }}
                                style={{
                                  backgroundColor: '#FBFBFB',
                                  borderBottomWidth: '1px',
                                }}
                                type="text"
                              />
                            </Grid>
                            <Grid item xs={3} className="mt-[3px] selectFixedHeight">
                              <SelectTextField
                                style={{ fontSize: '12px', fontWeight: '400' }}
                                label="Select Property Type"
                                name={`users_transactions[${index}].type`}
                                value={values.users_transactions[index].type}
                                onChange={(
                                  e: ChangeEvent<HTMLInputElement>
                                ) => {
                                  setFieldValue(
                                    `users_transactions[${index}].type`,
                                    e.target.value
                                  );
                                }}
                                options={categoryOptions}
                              />
                            </Grid>
                            <Grid item xs={2} className="mt-[3px] selectFixedHeight">
                              <SelectTextField
                                label="Select Category"
                                name={`users_transactions[${index}].category`}
                                value={values.users_transactions[index].category}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  setFieldValue(
                                    `users_transactions[${index}].category`,
                                    e.target.value
                                  );
                                }}
                                options={propertyTypeOptions}
                              />
                            </Grid>
                            {index > 0 && (
                              <Grid item xs={1} className="flex justify-center">
                                <Icons.DeleteIcon
                                  className="text-red-500 cursor-pointer mt-8"
                                  onClick={() => arrayHelpers.remove(index)}
                                />
                              </Grid>
                            )}
                          </Grid>
                        );
                      })}
                      <Grid container spacing={2} className="mt-3 mb-2">
                        <Grid item xs={12}>
                          <CommonButton
                            variant="contained"
                            color="primary"
                            style={{
                              background: 'white',
                              border: 'dashed',
                              color: '#A1AFB7',
                              borderRadius: '10px',
                              borderWidth: '1px',
                              fontSize: '12px',
                              boxShadow: 'none',
                              height: '55px',
                            }}
                            onClick={() =>
                              arrayHelpers.insert(
                                values.users_transactions.length,
                                {
                                  name: '',
                                  sf: '',
                                  type: '',
                                  category: '',
                                  // id:null,
                                }
                              )
                            }
                          >
                            <img src={group3} alt="add" className="mr-2" />
                            Add New Transaction
                          </CommonButton>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                />
                <Box className="mt-2 flex">
                  <input
                    type="checkbox"
                    className="h-[17px] w-[17px]"
                    name="significant_in_pdf"
                    checked={values?.significant_in_pdf}
                    onChange={(e) => {
                      setFieldValue('significant_in_pdf', e.target.checked);
                    }}
                  />
                  <p className="p-0 mt-0.5 ml-2 text-xs font-medium text-[#84929A]">
                    Include significant transactions on printed evaluations.
                  </p>
                </Box>
                <Grid container spacing={2} className='items-end'>
                  <Grid item xs={6} className="mt-3 mb-5 selectFixedHeight">
                    <Typography
                      variant="h4"
                      component="h4"
                      sx={{ fontFamily: 'montserrat-normal' }}
                      className="text-xl font-bold mt-2 mb-3"
                    >
                      CONFIGURATION
                    </Typography>
                    <SelectTextField
                      style={{ marginTop: '16px' }}
                      label="Comp Adjustment Mode"
                      name="comp_adjustment_mode"
                      value={values?.comp_adjustment_mode}
                      options={CompAdustmentModeSelection}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFieldValue('comp_adjustment_mode', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} className="mt-3 mb-5 selectFixedHeight">
                    {user?.role === 1 || user?.role === 4 ? <>
                      <Typography
                        variant="h4"
                        component="h4"
                        sx={{ fontFamily: 'montserrat-normal' }}
                        className="text-xl font-bold"
                      >
                        PERMISSION
                      </Typography>
                      <Autocomplete
                        id="combo-box-demo"
                        // name="account_id"
                        options={userAccountOptions || []}
                        onChange={(_e, newValue) =>
                          setFieldValue('account_id', newValue)
                        }
                        value={values.account_id}
                        className="mt-[20px]"
                        renderInput={(params) => (
                          <TextField
                            // name='account_id'
                            {...params}
                            label="User Account"
                            variant="standard"
                          />
                        )}
                      />
                    </> : null}

                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6} className="mt-[10px] selectFixedHeight">
                    {user?.role === 1 || user?.role === 4 ? <>
                      <SelectTextField
                        style={{ marginTop: '15px' }}
                        label="Status"
                        name="status"
                        value={values?.status}
                        options={statusOption}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue('status', e.target.value)}
                      />
                    </> : null}

                  </Grid>
                </Grid>
                <Box className="flex justify-end mt-[60px]">
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
                    {errors ? <Loader /> : 'update'}
                  </CommonButton>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Box>
  );
};

export default SignificantTransaction;

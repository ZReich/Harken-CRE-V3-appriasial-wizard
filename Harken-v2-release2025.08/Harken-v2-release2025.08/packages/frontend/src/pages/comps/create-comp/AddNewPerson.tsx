import React, { useEffect } from 'react';
import { Typography, Grid } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import CommonSellerBuyier from '@/components/elements/button/seller-buyier-button';
import { useMutate, RequestType } from '@/hook/useMutate';
import { useGet } from '@/hook/useGet';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import moment from 'moment';
import { UserGetDataType } from '@/components/interface/user-get-data';
import {
  Account,
  ConfirmationModalContentProps,
} from './interfaces/IntComptype';

interface AccountListResponse {
  data: {
    data: {
      accounts: Account[];
    };
  };
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddNewPerson: React.FC<ConfirmationModalContentProps> = ({
  close,
  refetch2,
  companyListing,
}) => {
  const {
    data: data1,
    isLoading: loadingUser,
    refetch,
  } = useGet<UserGetDataType>({
    queryKey: 'user/get',
    endPoint: 'user/get',
    config: {},
  });
  const user = data1?.data?.data?.user;

  const [addPersonData, setAddPersonData] = React.useState({
    first_name: '',
    last_name: '',
    email_address: '',
    account_id: '',
  });
  const [emailError, setEmailError] = React.useState('');

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;

    const isEmailProvided = value.trim() !== '';
    const isValidEmail = emailRegex.test(value);

    if (isEmailProvided && !isValidEmail) {
      setEmailError('');
    }

    setAddPersonData((ele: any) => {
      return {
        ...ele,
        email_address: value,
      };
    });
  };

  useEffect(() => {
    refetch();
    setAddPersonData((ele: any) => {
      return {
        ...ele,
        account_id: user?.account_id,
      };
    });
  }, [user?.account_id]);

  const [personData, setPersonData] = React.useState(false);

  const mutation = useMutate({
    queryKey: 'add-form',
    endPoint: 'client/create',
    requestType: RequestType.POST,
  });

  const { data: accountList, isLoading: loadingOptions } =
    useGet<AccountListResponse>({
      queryKey: 'account-list',
      endPoint: `accounts/list`,
      config: { enabled: user?.role === 1, refetchOnWindowFocus: false },
    });

  const userAccountOptions = accountList?.data?.data?.accounts.map((ele) => {
    return {
      value: ele?.id,
      label: `${ele?.name} (Created at ${moment(ele?.created).subtract(10, 'days').calendar()})`,
    };
  });

  const handleSelectChange = (value: any) => {
    if (value) {
      setAddPersonData({ ...addPersonData, account_id: value.value });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setAddPersonData({ ...addPersonData, [name]: value });
  };

  const handleClick = async () => {
    const isEmailProvided = addPersonData.email_address.trim() !== '';
    const isValidEmail = emailRegex.test(addPersonData.email_address);

    if (isEmailProvided && !isValidEmail) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setPersonData(true);
    setAddPersonData(addPersonData);
    try {
      const response = (await mutation.mutateAsync(addPersonData)) as {
        data: { message: string };
      };
      companyListing(response);
      refetch2();
      toast(response.data.message);
      close();
      return false;
    } catch (error) {
      toast.info('Please complete the missing fields', {
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
      console.log(error);
    }
  };

  if (loadingOptions || loadingUser) {
    return <>Loading </>;
  }

  return (
    <div className="pb-3 w-96" style={{ fontFamily: 'montserrat-normal' }}>
      <div className="px-5">
        <Typography
          variant="h4"
          component="h4"
          className="text-xl font-bold"
        >
          Add New Person
        </Typography>
        <Grid container className="mt-[20px]">
          <Grid xs={12}>
            <StyledField
              label={
                <span>
                  First Name<span className="text-red-500"> *</span>
                </span>
              }
              name="first_name"
              onChange={handleChange}
            />
            {addPersonData.first_name === '' && personData ? (
              <div className="text-red-500 text-[11px] absolute">
                This field is required.
              </div>
            ) : null}
          </Grid>
        </Grid>
        <Grid container className="mt-[20px]">
          <Grid xs={12}>
            <StyledField
              label={
                <span>
                  Last Name<span className="text-red-500"> *</span>
                </span>
              }
              name="last_name"
              onChange={handleChange}
            />
            {addPersonData.last_name === '' && personData ? (
              <div className="text-red-500 text-[11px] absolute">
                This field is required.
              </div>
            ) : null}
          </Grid>
        </Grid>
        <Grid container className="mt-[20px]">
          <Grid xs={12}>
            <StyledField
              label="Email Address"
              name="email_address"
              onChange={handleEmail}
            />
            {emailError && (
              <div className="text-red-500 text-[11px]">{emailError}</div>
            )}
          </Grid>
        </Grid>
        <Grid container className="mt-[20px]">
          <Grid xs={12}>
            {user?.role === 1 ? (
              <Autocomplete
                options={userAccountOptions || []}
                value={
                  userAccountOptions?.find(
                    (u) => u.value === addPersonData?.account_id
                  ) || null
                }
                id="auto-complete"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Account"
                    variant="standard"
                    className="text-lg"
                  />
                )}
                onChange={(_event, value) => handleSelectChange(value)}
              />
            ) : (
              ''
            )}
          </Grid>
        </Grid>
        <Grid container className="mt-[25px] mb-[15px]">
          <Grid xs={12}>
            <CommonSellerBuyier
              color="primary"
              style={{ fontSize: '14px' }}
              onClick={handleClick}
            >
              Add
            </CommonSellerBuyier>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default AddNewPerson;

import React, { useEffect } from 'react';
import { Typography, Grid } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import CommonSellerBuyier from '@/components/elements/button/seller-buyier-button';
import { useMutate, RequestType } from '@/hook/useMutate';
import { useGet } from '@/hook/useGet';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import { UserGetDataType } from '@/components/interface/user-get-data';
import moment from 'moment';
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
const AddCompany: React.FC<ConfirmationModalContentProps> = ({
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

  const [addPersonData, setAddPersonData] = React.useState<any>({
    company_name: '',
    account_id: '',
  });
  useEffect(() => {
    refetch();
    setAddPersonData((ele: any) => {
      return {
        ...ele,
        account_id: user?.account_id,
      };
    });
  }, [user]);
  const [personData, setPersonData] = React.useState(false);
  const mutation = useMutate({
    queryKey: 'company-form',
    endPoint: 'company/create',
    requestType: RequestType.POST,
  });

  const { data: accountList, isLoading: loadingOptions } =
    useGet<AccountListResponse>({
      queryKey: 'account-list',
      endPoint: `accounts/list`,
      config: {
        enabled: Boolean(user?.role === 1),
        refetchOnWindowFocus: false,
      },
    });
  console.log('accountList', accountList);
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

  const handleSubmit = async () => {
    setPersonData(true);
    setAddPersonData(addPersonData);
    if (addPersonData.company_name === '') {
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
      return;
    }

    try {
      const response = (await mutation.mutateAsync(addPersonData)) as {
        data: { message: string };
      };
      companyListing(response);
      refetch2();
      toast(response.data.message);

      close();
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as {
          response: { data: { data: { message: string } } };
        };
        toast(err.response.data.data.message);
      }
    }
  };
  const handleChange1 = (e: any) => {
    const { name, value } = e.target;
    setAddPersonData({ ...addPersonData, [name]: value });
  };
  if (loadingOptions || loadingUser) {
    return <>Loading </>;
  }

  return (
    <div className="pb-3 w-96">
      <div className="px-5">
        <Typography variant="h4" component="h4" className="text-xl font-bold">
          Add Company
        </Typography>
        <Grid container className="mt-[20px]">
          <Grid xs={12}>
            <StyledField
              label={
                <span>
                  Company Name<span className="text-red-500"> *</span>
                </span>
              }
              name="company_name"
              onChange={handleChange1}
            />
            {addPersonData.company_name === '' && personData ? (
              <div className="text-red-500 text-[11px]">
                This field is requred
              </div>
            ) : null}
          </Grid>
        </Grid>

        <Grid container className="mt-[20px]">
          <Grid xs={12}>
            {user?.role === 1 ? (
              <Autocomplete
                options={userAccountOptions || []}
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '0.7rem',
                  },
                }}
                value={
                  userAccountOptions?.find(
                    (u) => u.value === addPersonData?.account_id
                  ) || null
                }
                id="auto-complete"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label={
                      <span className="text-lg">
                        User Account<span className="text-red-500"> *</span>
                      </span>
                    }
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
              style={{ fontSize: '14px' }}
              onClick={handleSubmit}
            >
              Add
            </CommonSellerBuyier>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default AddCompany;

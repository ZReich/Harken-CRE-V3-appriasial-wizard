import { Box, Grid, Typography } from '@mui/material';
import AccountLogo from './AccountLogo';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { Form, Formik } from 'formik';
import SelectTextField from '@/components/styles/select-input';
import CommonButton from '@/components/elements/button/Button';
import ChooseColor from './ColorPicker';
import { AccountThemeOptions } from './SelectOption';
import { useGet } from '@/hook/useGet';
import { useNavigate, useParams } from 'react-router-dom';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { useState } from 'react';

const ThemeSettings = () => {
  const { id } = useParams();
  const [imageSrc, setImageSrc] = useState<string | undefined>('');
  const [imageUrl, setImageUrl] = useState<any>();
 const navigate=useNavigate();
  const { data, refetch } = useGet<any>({
    queryKey: `accounts/${id}`,
    endPoint: `accounts/get/${id}`,
    config: { refetchOnWindowFocus: false, enabled: !!id },
  });

  const mutation = useMutate<any, any>({
    queryKey: `accounts/update-theme/${id}`,
    endPoint: `accounts/update-theme/${id}`,
    requestType: RequestType.PATCH,
  });

  const accountData = data?.data?.data;

  const handleSubmit = async (value: any) => {
    console.log('Submitted price:', value.per_user_price);

    const parseCurrency = (val: any): number => {
      if (typeof val === 'number') return val;
      const cleaned = String(val || '').replace(/[^0-9.]/g, '');
      return parseFloat(cleaned || '0');
    };

    try {
      if (id) {
        const parsedPrice = parseCurrency(value.per_user_price);

        const response = await mutation.mutateAsync({
          ...value,
          per_user_price: parsedPrice === 0 ? null : parsedPrice,
        });

        refetch();
        toast(response?.data.message);
        navigate('/accounts')
      }
    } catch (error: any) {
      toast(error.message);
    }
  };

  const formatCurrencyInput = (value: string | number | undefined | null): string => {
    const stringValue = String(value ?? '');
    const numeric = stringValue.replace(/[^0-9]/g, '');
    const cents = parseFloat(numeric) / 100;
    if (isNaN(cents)) return '$0.00';

    return cents.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Box>
      <Formik
        // enableReinitialize
        initialValues={{
          logo_url: accountData?.logo_url || imageUrl,
          manager_email: accountData?.manager_email || '',
          theme: accountData?.theme ? accountData?.theme : 'default',
          per_user_price: accountData?.per_user_price || '',
          primary_color: accountData?.primary_color || '',
          secondary_color: accountData?.secondary_color || '',
          tertiary_color: accountData?.tertiary_color || '',
        }}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className="flex items-center">
              <AccountLogo
                setImageSrc={setImageSrc}
                imageSrc={imageSrc}
                accountData={accountData}
                setImageUrl={setImageUrl}
                imageUrl={imageUrl}
              />
              <div className="w-[261px] h-[30px] text-xs font-normal ml-8 mt-[-20px]">
                You should update here your account logo to be used in any document generation.
              </div>
            </div>

            <Box className="mt-[30px]">
              <Typography
                variant="h4"
                component="h4"
                className="text-lg font-montserrat font-bold py-5"
                style={{ fontFamily: 'montserrat-normal' }}
              >
                ACCOUNT ADMINISTRATOR
              </Typography>
              <div className="text-xs text-[#000000]">
                Enter the e-mail of the main account administrator.
              </div>
              <Grid container spacing={2} className="mt-[20px] items-end">
                <Grid item xs={3}>
                  <StyledField
                    label="Account Administrator Email"
                    name="manager_email"
                    value={values?.manager_email} 
                  />
                </Grid>
                <Grid item xs={3} className="mt-[2px] selectFixedHeight">
                  <SelectTextField
                    options={AccountThemeOptions}
                    onChange={(e) => setFieldValue('theme', e.target.value)}
                    label="Account Theme"
                    name="theme"
                    value={values.theme}
                  />
                </Grid>
                <Grid item xs={3}>
                  <StyledField
                    label="Per User Price"
                    name="per_user_price"
                    value={formatCurrencyInput(values.per_user_price)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const formattedValue = formatCurrencyInput(e.target.value);
                      setFieldValue('per_user_price', formattedValue);
                    }}
                  />
                </Grid>
              </Grid>

              <Box className="mt-[30px]">
                <Typography
                  variant="h4"
                  component="h4"
                  className="text-lg font-montserrat font-bold py-5"
                  style={{ fontFamily: 'montserrat-normal' }}
                >
                  CHOOSE COLOR
                </Typography>
                <ChooseColor />
              </Box>

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
                  {id ? 'Update' : 'Create'}
                </CommonButton>
              </div>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default ThemeSettings;

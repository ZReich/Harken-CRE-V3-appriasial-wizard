import { Box } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import CommonButton from '@/components/elements/button/Button';
import StarIcon from '@mui/icons-material/Star';
import group1 from '../../../images/Group1.png';
import { Formik, Form } from 'formik';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { ResponseType } from '@/components/interface/response-type';
import React from 'react';
import Loader from '@/components/loader/Loader';
import { UserChangePasswordValidation } from '@/utils/validation-Schema';
interface initialValues {
  new_password: string;
  confirm_password: string;
}

const ChangePassword = () => {
  const [errors, setErrors] = React.useState<boolean>(false);
  const [errorMessage,setErrorMessage]=React.useState<string>('')
  const mutation = useMutate<ResponseType, initialValues>({
    queryKey: 'user/change-password',
    endPoint: 'user/change-password',
    requestType: RequestType.PATCH,
  });
  const handleSubmit = async (values: initialValues) => {
    setErrors(true);
    if (values.new_password != values.confirm_password) {
      setErrors(false);
      toast('Password did not matched');
      return false;
    }
    const data:initialValues = {
      new_password: values.new_password,
      confirm_password:values.confirm_password
    };

    try {
      const response = await mutation.mutateAsync(data);
      toast(response.data.message);
      setErrors(false);
    } catch (error) {
      setErrors(false)
    }
  };

  return (
    <>
      <Box className="mt-[5px] flex justify-center">
        <Box className="w-[390px] ">
          <Box className="ml-5">
            <img src={group1} style={{ width: '290px' }} alt="" />
          </Box>
          <Formik
            initialValues={{
              new_password: '',
              confirm_password: '',
            }}
            validationSchema={UserChangePasswordValidation}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, handleChange }) => {
              return (
                <Form>
                  <Box className="mt-5">
                    <StyledField
                      label={<span className="relative">
                        New Password
                        <StarIcon className="absolute text-[6px] text-red-500 right-[-10px] top-0.5" />
                      </span>}
                      name="new_password"
                      type="password"
                      onChange={(e: { target: { value:string; }; }) => {
                        setFieldValue('new_password', e.target.value);
                        if (values.new_password.length < 4) {
                          setErrorMessage('Password must be 5 characters.');

                        }
                        else {
                          setErrorMessage('');
                        }
                      } }
                      value={values?.new_password} />
                    {errorMessage && <div className='text-red-500 text-[11px]'>{errorMessage}</div>}
                    
                  </Box>
                  <Box className="mt-3">
                    <StyledField
                      label={<span className="relative">
                        Retype New Password
                        <StarIcon className="absolute text-[6px] text-red-500 right-[-10px] top-0.5" />
                      </span>}
                      name="confirm_password"
                      type="password"
                      value={values?.confirm_password}
                      onChange={handleChange}                  />
                  </Box>
                  <Box className="mt-7">
                    <CommonButton
                      color="primary"
                      type="submit"
                      variant="contained"
                      style={{
                        width: '395px',
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
    </>
  );
};
export default ChangePassword;

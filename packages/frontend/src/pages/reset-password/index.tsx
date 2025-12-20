import CommonButton from '@/components/elements/button/Button';
import StyledField from '../../components/styles/Style-field-login';
import { Formik, Form, FormikValues } from 'formik';
import { Box } from '@mui/material';
import { resetPasswordValidation } from '@/utils/validation-Schema';
import { useMutate, RequestType } from '@/hook/useMutate';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import logo from '../../images/logo-white.svg';
import { AxiosError } from 'axios';

interface ApiResponse {
  data: {
    message: string;
  };
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const mutation = useMutate({
    queryKey: '',
    endPoint: 'auth/reset-password',
    requestType: RequestType.POST,
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location?.search);
  const query = searchParams.get('name');
  const { id } = useParams();

  const handleSubmit = async (values: FormikValues) => {
    if (values.password != values.confirm_password) {
      toast('Password did not matched');
      return false;
    } else if (values.password.length < 5) {
      toast('The Password field must be at least 5 characters in length.');
      return false;
    }
    const data = {
      password: values.password.toString(),
      token: id?.toString(),
    };

    try {
      const response = (await mutation.mutateAsync(data)) as ApiResponse;
      toast(response.data.message);
      navigate('/comps');
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      if (axiosError?.response?.data?.data?.message) {
        toast.error(axiosError.response.data.data.message);
      }
    }
  };

  return (
    <>
      <div className="w-[100%] h-[100vh] flex justify-center items-center forgot-password">
        <div className="w-[400px] p-[20px] bg-loginGray">
          <header>
            <div className="mb-[2rem] text-center">
              <a href="https://harkencre.com">
                <img src={logo} id="logo" alt="Harken CRE" />
              </a>
            </div>
          </header>
          <div className="text-center">
            <h5 className="text-white text-[1.64rem] font-bold m-[0] p-[0] font-serif font-roboto-slab">
              RESET PASSWORD
            </h5>
            <p className="text-white font-montserrat font-sans text-[15px]">
              Hello {query}, please enter your new password.
            </p>
            <Formik
              initialValues={{ password: '', confirm_password: '' }}
              validationSchema={resetPasswordValidation}
              onSubmit={handleSubmit}
            >
              <Form>
                <Box display="flex" py={1} flexWrap="wrap" gap={4}>
                  <StyledField
                    label="Password"
                    name="password"
                    type="password"
                  />
                </Box>
                <Box display="flex" py={1} flexWrap="wrap" gap={4}>
                  <StyledField
                    label="Confirm Password"
                    name="confirm_password"
                    type="password"
                  />
                </Box>
                <div className="mt-[1rem] mb-[2rem]">
                  <CommonButton
                    variant="contained"
                    color="primary"
                    type="submit"
                    style={{
                      width: '100%',
                      background: '#0DA1C7',
                      fontSize: '9pt',
                      fontWeight: '500',
                    }}
                  >
                    RESET PASSWORD
                  </CommonButton>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};
export default ResetPassword;

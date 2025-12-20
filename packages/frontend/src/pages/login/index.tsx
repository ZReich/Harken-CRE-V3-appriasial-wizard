import { useState, useEffect, useContext } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';
import { toast } from 'react-toastify';
import logo from '../../images/logo-white.svg';
import StyledField from '@/components/styles/Style-field-login';
import { loginValidation } from '@/utils/validation-Schema';
import { useMutate, RequestType } from '../../hook/useMutate';
import ENDPOINTS from '@/api/COMMON_URL';
import CommonButton from '@/components/elements/button/Button';
const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showError, setShowError] = useState(false);
  const [accessTokenExists, setAccessTokenExists] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      setAccessTokenExists(true);
    }
  }, []);
  console.log(accessTokenExists);
  useEffect(() => {
    // Previously had back button handler
    // Now intentionally left empty
  }, []);
  // useEffect(() => {
  //   const handlePopState = () => {
  //     navigate('/login');
  //     console.log('Back button clicked, checkStatus set in localStorage.');
  //   };
  //   window.addEventListener('popstate', handlePopState);
  // }, []);
  // Remove the popstate handler that forced navigation to '/login'.
  // Instead, handle redirect based on accessTokenExists below.
  // If accessTokenExists, redirect to the previous page (last open screen) using history.back().
  // if (accessTokenExists) {
  //   // If there is a previous page in history, go back. Otherwise, fallback to '/comps'.
  //   if (window.history.length > 1) {
  //     window.history.back();
  //   } else {
  //     navigate('/comps');
  //   }
  //   return null;
  // }
  const mutation = useMutate<any, any>({
    queryKey: 'login',
    endPoint: ENDPOINTS.LOGIN,
    requestType: RequestType.POST,
  });
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(false);
    const data = {
      email_address: values.email_address.toString(),
      password: values.password.toString(),
    };
    try {
      const response = await mutation.mutateAsync(data);
      toast('Login Successfully');
      localStorage.setItem('accessToken', response.data.data.token);
      localStorage.setItem('activeType', 'building_with_land');
      localStorage.setItem('activeButton', 'Commercial');
      localStorage.setItem('role', response.data.data.user.role);
      localStorage.setItem('refresh', response.data.data.refresh_token);
      login(response.data.data.user.role, response.data.data.token);
      setTimeout(() => {
        navigate('/comps');
      }, 500);
    } catch (error) {
      setShowError(true);
    }
  };
  const handleForgotPasswordClick = () => {
    navigate('/login/forgot');
  };
  return (
    <>
      <div className="w-full h-[100vh] login flex justify-center items-center login-body">
        <div className="w-[350px] p-[20px] login-page">
          <div className="text-center">
            <a href="https://harkencre.com/">
              <img src={logo} alt="harken"></img>
            </a>
          </div>
          <div className="text-white text-center pt-7">
            {showError ? (
              <p className="red-text mb-2">Login is invalid.</p>
            ) : (
              ''
            )}
            <Formik
              initialValues={{ email_address: '', password: '' }}
              validationSchema={loginValidation}
              onSubmit={handleSubmit}
            >
              <Form>
                <ErrorMessage
                  name="email_address"
                  component="div"
                  className="bg-lightRed pt-3 pb-3 text-center w-full rounded text-redError text-sm font-sans text-left font-montserrat font-sans"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="bg-lightRed pt-3 pb-3 text-center w-full rounded text-redError text-sm text-left font-montserrat font-sans"
                />
                <Box display="flex" pb={2} flexWrap="wrap">
                  <StyledField
                    label="Email Address"
                    name="email_address"
                    style={{ borderBottom: '1px solid #9e9e9e' }}
                  />
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <StyledField
                    label="Password"
                    name="password"
                    type="password"
                    style={{ borderBottom: '1px solid #9e9e9e' }}
                  />
                </Box>
                <div className="mt-[1rem] mb-[1rem]">
                  <CommonButton
                    variant="contained"
                    color="primary"
                    type="submit"
                    style={{ fontSize: '9pt' }}
                  >
                    Log In
                  </CommonButton>
                </div>
                <a
                  href="#"
                  className="text-white text-[0.7em] text-center no-underline text-xs font-montserrat font-sans hover:underline"
                  onClick={handleForgotPasswordClick}
                >
                  Forgot your password?
                </a>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};
export default LoginForm;

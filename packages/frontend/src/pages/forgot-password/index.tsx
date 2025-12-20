import { useState } from 'react';
import { Formik, Form } from 'formik';
import { Box } from '@mui/material';
import Recaptcha from '../../components/recaptcha';
import { useMutate, RequestType } from '@/hook/useMutate';
import { forgotPasswordLogin } from '@/utils/validation-Schema';
import CommonButton from '@/components/elements/button/Button';
import StyledField from '../../components/styles/Style-field-login';
import ENDPOINTS from '@/api/COMMON_URL';
import { toast } from 'react-toastify';
import logo from '../../images/logo-white.svg'

const ForgotPassword = () => {

    interface ApiResponse { data: { message: string; } }

    const mutation = useMutate({
        queryKey: 'forgot',
        endPoint: ENDPOINTS.FORGOT_PASSWORD,
        requestType: RequestType.POST,
    });

    const [recaptchaVerified, setRecaptchaVerified] = useState(false);
    const [error, setError] = useState('');

    interface FormValues {
        email: string;
    }

    const handleSubmit = async (values: FormValues) => {
        const data = {
            email_address: values.email.toString()
        };
        if (recaptchaVerified) {
            try {
                const res = await mutation.mutateAsync(data) as ApiResponse;
                toast(res.data.message);
            } catch (error) {
                setError('Failed to submit. Please try again.');
            }
        } else {
            setError('Please select the CAPTCHA.');
        }
    };


    const handleVerify = () => {
        setRecaptchaVerified(true);
        setError('');
    };

    return (
        <div className="w-[100%] h-[100vh] flex justify-center items-center forgot-password">
            <div className="w-[370px] p-[20px] bg-loginGray">
                <header>
                    <div className="mb-10 text-center">
                        <a href="https://harkencre.com">
                            <img src={logo} id="logo" alt="Harken CRE" />
                        </a>
                    </div>
                </header>
                {/* <p>Check</p> */}
                <div className="text-center">
                    <h5 className="text-white text-[1.64rem] mt-[0.3rem] mb-[0.656rem] font-bold font-serif font-roboto-slab">
                        FORGOT PASSWORD
                    </h5>
                    <p className="p-[20px] text-white paragraph leading-[1.65em] text-xs font-montserrat font-sans">
                        Please enter your email address and we'll send you instructions on
                        how to reset your password
                    </p>
                    <Formik
                        initialValues={{ email: '' }}
                        validationSchema={forgotPasswordLogin}
                        onSubmit={handleSubmit}
                    >
                        <Form>
                            <Box display="flex" py={3}>
                            <StyledField label="Email" name="email" type="email" required />
                            </Box>
                            <div className="flex justify-center">
                                <Recaptcha onChange={handleVerify} />
                            </div>
                            {error && <div className="text-red-500 text-[11px]">{error}</div>}
                            <div className="mt-[1rem] mb-[2rem]">
                                <CommonButton
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    className="custom-button"
                                    style={{ fontWeight: '500', fontSize: '9pt' }}
                                >
                                    SUBMIT
                                </CommonButton>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

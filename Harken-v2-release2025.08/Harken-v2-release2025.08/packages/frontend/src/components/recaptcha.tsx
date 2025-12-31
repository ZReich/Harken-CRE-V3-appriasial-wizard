import ReCAPTCHA from 'react-google-recaptcha';

const key = import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY;

const Recaptcha = ({
  onChange,
}: {
  onChange: (token: string | null) => void;
}) => {
  if (!key) {
    return null;
  }

  return <ReCAPTCHA sitekey={key} onChange={onChange} />;
};

export default Recaptcha;

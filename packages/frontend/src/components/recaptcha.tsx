import ReCAPTCHA from 'react-google-recaptcha';


const Recaptcha = ({ onChange }: { onChange: (token: string | null) => void }) => {  
    return (
        <>
            <ReCAPTCHA
                sitekey={'6Lfgs4AgAAAAAHHMQgr0D42_1Fxros57krHL9wsS'}
                onChange={onChange}
            />
        </>
    )
}

export default Recaptcha;

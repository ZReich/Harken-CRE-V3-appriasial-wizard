import { Field, ErrorMessage } from 'formik';

interface StyledFieldProps {
  label: React.ReactNode;
  name: string;
  style?: any;
  onFocus?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: any;
  disabled?: boolean;
  maxLength?: number;
}

const TextAreaField = ({ label, name, maxLength, ...rest }: StyledFieldProps) => (
  <div className='grid relative'>
    <label
      className="block text-left text-customGray text-xs font-normal"
      style={{ fontFamily: 'montserrat-normal' }}
      htmlFor={name}
    >
      {label}
    </label>
    <Field
      as="textarea" // Use textarea instead of input
      style={{
        borderBottomWidth: '1px',
        fontFamily: 'montserrat-normal,sans-serif',
        resize: 'vertical',
      }}
      className="focus:border-blue-500 focus:outline-none w-full border-t-0 border-r-0 border-l-0 pt-[2.5px] overflow-hidden"
      id={name}
      name={name}
      maxLength={maxLength}
      {...rest}
    />
    {maxLength && (
      <div className="text-xs text-gray-500 mt-1 text-right absolute right-0 -bottom-5">
        {rest.value?.length || 0}/{maxLength}
      </div>
    )}
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 pt-1  text-[11px] font-sans"
    />
  </div>
);

export default TextAreaField;

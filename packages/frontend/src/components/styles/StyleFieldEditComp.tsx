import { ErrorMessage, Field } from 'formik';

interface StyledFieldProps {
  label?: React.ReactNode;
  name: string;
  style?: any;
  onFocus?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onBlur?: (event: React.KeyboardEvent) => void;
  type?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: any;
  disabled?: boolean;
  maxLength?: any;
  className?: string;
  placeholder?: any;
}

const StyledField = ({
  label,
  name,
  disabled,
  maxLength,
  ...rest
}: StyledFieldProps) => (
  <div className='textField'>
    <label
      className="block text-left text-customGray text-xs font-normal"
      style={{ fontFamily: 'montserrat-normal' }}
      htmlFor={name}
    >
      {label}
    </label>
    <Field
      style={{ borderBottomWidth: '1px', fontFamily: 'montserrat-normal' }}
      className="relative focus:border-blue-500 focus:outline-none w-full border-t-0 border-r-0 border-l-0 !py-0 !px-0 !min-h-[26px] text-sm"
      id={name}
      name={name}
      disabled={disabled}
      maxLength={maxLength}
      {...rest}
    />
    {/* <ErrorMessage
      name={name}
      component="div"
      className="absolute text-red-500 pt-1 text-sm font-sans error-msg"
    /> */}
    <ErrorMessage
      name={name}
      component="div"
      className="absolute text-red-500 text-[11px] font-sans error-msg"
    />
  </div>
);

export default StyledField;

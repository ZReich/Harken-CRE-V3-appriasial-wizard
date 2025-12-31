import React from 'react';
import { Field } from 'formik';

interface StyledFieldProps {
  label?: string;
  name?: string;
  type?: string;
  required?: boolean;
  style?: React.CSSProperties;
  onChange?: any;
  value?: any;
  disabled?: any;
  onKeyDown?: any;
  readOnly?: any;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
}

const StyledField: React.FC<StyledFieldProps> = ({
  label,
  name,
  type,
  ...rest
}) => (
  <div className="w-full flex flex-col">
    <label className="block text-left text-white text-sm" htmlFor={name}>
      {label}
    </label>
    <Field
      type={type}
      className=" text-white text-xs pl-1 bg-inherit border-customGray focus:border-customSkyBlue focus:outline-none w-full border-t-0 border-r-0 border-l-0 "
      id={name}
      name={name}
      {...rest}
    />
  </div>
);

export default StyledField;

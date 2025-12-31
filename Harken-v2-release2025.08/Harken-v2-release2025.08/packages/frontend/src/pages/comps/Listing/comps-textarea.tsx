import React from 'react';

interface CompsTextAreaProps {
  label: React.ReactNode;
  name: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const CompsTextArea: React.FC<CompsTextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  style,
  disabled,
}) => (
  <div>
    <label
      className="block text-left text-customGray text-xs font-normal"
      htmlFor={name}
    >
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      disabled={disabled}
      style={{ borderBottomWidth: '1px', resize: 'vertical', ...style }}
      className="focus:border-blue-500 focus:outline-none w-full border-t-0 border-r-0 border-l-0 pt-[2.5px]"
    />
  </div>
);

export default CompsTextArea;

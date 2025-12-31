import { Button, ButtonProps } from '@mui/material';

interface CommonButtonProps extends ButtonProps {
  onClick?: any;
  isButtonVisible?: 'MapSearchFilter' | undefined;
}

const CommonButton: React.FC<CommonButtonProps> = ({
  variant,
  color,
  onClick,
  children,
  style,
  type,
  isButtonVisible,
  disabled,
}) => {
  const buttonClass =
    isButtonVisible === 'MapSearchFilter' ? 'px-14 font-bold leading-7' : '';

  return (
    <Button
      className={`py-2 w-full bg-customBlue ${buttonClass}`}
      variant={variant}
      color={color}
      onClick={onClick}
      style={style}
      type={type}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default CommonButton;

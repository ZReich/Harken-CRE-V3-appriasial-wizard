import { Button, ButtonProps } from '@mui/material';

interface CommonButtonProps extends ButtonProps {
  isButtonVisible?: "MapSearchFilter" | undefined;
}

const CommonSellerBuyier: React.FC<CommonButtonProps> = ({ variant, color, onClick, children, style, type, isButtonVisible }) => {
  const buttonClass = isButtonVisible === "MapSearchFilter" ? 'px-14 font-bold leading-7' : '';

  return (
    <Button className={`py-2 w-full bg-customBlue text-white ${buttonClass}`} variant={variant} color={color} onClick={onClick} style={style} type={type}>
      {children}
    </Button>
  );
};

export default CommonSellerBuyier;

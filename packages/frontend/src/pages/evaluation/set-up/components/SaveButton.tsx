import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { EvaluationEnum } from '../evaluation-setup-enums';

interface SaveButtonProps {
  onClick: () => void;
}

const SaveButton = ({ onClick }: SaveButtonProps) => (
  <div className="flex justify-center fixed m-0 py-5 w-full bottom-0 left-0 bg-white">
    <CommonButton
      variant="contained"
      onClick={onClick}
      color="primary"
      type="submit"
      style={{
        fontSize: '14px',
        width: '300px',
      }}
    >
      {EvaluationEnum.SAVE_AND_CONTINUE}
      <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
    </CommonButton>
  </div>
);

export default SaveButton;
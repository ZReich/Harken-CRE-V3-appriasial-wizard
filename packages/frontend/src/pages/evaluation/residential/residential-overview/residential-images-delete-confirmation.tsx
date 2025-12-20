import CommonButton from '@/components/elements/button/Button';
import React from 'react';
// import deleteImage from '../../../images/delete.png';
import deleteImage from '../../../../images/delete.png';
// import { toast } from 'react-toastify';
// import { DeleteEvalutionPhotoEnum } from '../enum/CompsEnum';
import { DeleteEvalutionPhotoEnum } from '@/pages/comps/enum/CompsEnum';
interface ConfirmationModalContentProps {
  close: () => void;
  deleteFunction: any;
}

const DeleteConfirmationResidentialImage: React.FC<
  ConfirmationModalContentProps
> = ({ close, deleteFunction }) => {
  const deleteComps = () => {
    deleteFunction();
    close();
    // toast.success('Deleted successfully.');
  };

  return (
    <div className="w-[383px] h-[320px] bg-white rounded-[14px] shadow-lg flex flex-col items-center p-4">
      <div className="flex justify-center mb-4">
        <img src={deleteImage} className="h-[75px] w-[94px]" />
      </div>
      <p className="text-center text-xl font-bold">
        {DeleteEvalutionPhotoEnum.ARE_YOU_SURE}
      </p>
      <div className="flex w-full justify-center mb-4">
        <div className="text-sm font-medium w-[322px] h-[40px] text-center">
          {DeleteEvalutionPhotoEnum.WARNING_MESSAGE}
        </div>
      </div>
      <div className="flex justify-center mb-2">
        <CommonButton
          variant="contained"
          color="primary"
          style={{
            width: '315px',
            height: '40px',
            borderRadius: '5px',
            backgroundColor: 'rgba(246, 104, 96, 1)',
          }}
          onClick={deleteComps}
        >
         {DeleteEvalutionPhotoEnum.DELETE_SNIPPET}
        </CommonButton>
      </div>
      <div className="flex justify-center">
        <CommonButton
          variant="contained"
          color="primary"
          style={{
            width: '315px',
            height: '40px',
            borderRadius: '5px',
            backgroundColor: 'rgba(221, 221, 221, 1)',
            color: 'rgba(90, 90, 90, 1)',
          }}
          onClick={close}
        >
          {DeleteEvalutionPhotoEnum.CANCEL}
        </CommonButton>
      </div>
    </div>
  );
};

export default DeleteConfirmationResidentialImage;

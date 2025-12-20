import React from 'react';
import deleteImage from '../../../images/delete.png';
import CommonButton from '@/components/elements/button/Button';
import { DeleteCompEnum } from '../enum/CompsEnum';

interface ConfirmationModalContentProps {
  close: () => void;
  setArrayAfterDelete: () => void;
  deleteId: number | undefined;
}

const DeleteApproachConfirmationModal: React.FC<ConfirmationModalContentProps> = ({
  close,
  setArrayAfterDelete,
}) => {
  return (
    <div>
      {/* Background overlay */}
      <div className="modal-overlay">


     

      {/* Modal content */}
      <div className="modal-content ">
        <div className="flex justify-center">
          <img src={deleteImage} className="h-[75px] w-[94px]" />
        </div>
        <p className="text-center text-xl font-bold">{DeleteCompEnum.ARE_YOU_SURE}</p>
        <div className="flex w-full justify-center">
          <div className="text-sm font-medium w-[322px] h-[40px] text-center">
            {DeleteCompEnum.WARNING_MESSAGE}
          </div>
        </div>
        <div className="flex justify-center pb-2">
          <CommonButton
            variant="contained"
            color="primary"
            style={{
              width: '315px',
              height: '40px',
              borderRadius: '5px',
              marginTop: '30px',
              backgroundColor: 'rgba(246, 104, 96, 1)',
            }}
            onClick={setArrayAfterDelete}
          >
            {DeleteCompEnum.DELETE_COMP}
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
              marginTop: '10px',
              backgroundColor: 'rgba(221, 221, 221, 1)',
              color: 'rgba(90, 90, 90, 1)',
            }}
            onClick={close}
          >
            {DeleteCompEnum.CANCEL}
          </CommonButton>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DeleteApproachConfirmationModal;

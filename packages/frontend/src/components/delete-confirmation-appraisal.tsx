import React from 'react';
import deleteImage from '../images/delete.png';
import CommonButton from '@/components/elements/button/Button';
import { DeleteAppraisalEnum, DeleteCompEnum, DeleteTemaplateEnum } from '@/pages/comps/enum/CompsEnum';

interface DeleteModalContentProps {
  close: () => void;
  deleteComps: () => void;
  label: string;
  type?: 'appraisal' | 'template';
}

const DeleteModalContentAppraisal: React.FC<DeleteModalContentProps> = ({ close, deleteComps, label, type }) => {
  const enumToUse = type === 'template' ? DeleteTemaplateEnum : DeleteAppraisalEnum;
  return (
    <div className="w-[383px] h-[320px] rounded-[14px]">
      <div className="flex justify-center">
        <img src={deleteImage} className="h-[75px] w-[94px]" />
      </div>
      <p className="text-center text-xl font-bold">{DeleteCompEnum.ARE_YOU_SURE}</p>
      <div className="flex w-full justify-center">
        <div className="text-sm font-medium w-[322px] h-[40px] text-center">
          {enumToUse.WARNING_MESSAGE}
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
          onClick={deleteComps}
        >
          {label}
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
  );
};

export default DeleteModalContentAppraisal;

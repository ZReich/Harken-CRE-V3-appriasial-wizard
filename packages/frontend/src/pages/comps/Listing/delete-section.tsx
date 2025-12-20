import React from 'react';
import deleteImage from '../../../images/delete.png';
import CommonButton from '@/components/elements/button/Button';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { ResponseType } from '@/components/interface/response-type';
import { DeleteCompEnum } from '../enum/CompsEnum';

interface ConfirmationModalContentProps {
  close: () => void;
  deleteId: number | undefined;
}
const DeleteSectionModal: React.FC<ConfirmationModalContentProps> = ({
  close,
  deleteId,
}) => {
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'template/delete-section/',
    endPoint: `template/delete-section/${deleteId}`,
    requestType: RequestType.DELETE,
  });

  const deleteComps = () => {
    mutate(
      {
        id: deleteId,
      },
      {
        onSuccess: (res: any) => {
          toast(res?.data.message);
          close();
        },
        onError: (res: any) => {
          toast(res?.response?.data?.data?.error);
          setTimeout(() => {
            close();
          }, 2000);
        },
      }
    );
  };

  return (
    <div className="w-[383px] h-[320px] rounded-[14px]">
      <div className="flex justify-center">
        <img src={deleteImage} className="h-[75px] w-[94px]" />
      </div>
      <p className="text-center text-xl font-bold">
        {DeleteCompEnum.ARE_YOU_SURE}
      </p>
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
          onClick={deleteComps}
        >
          Delete Section
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

export default DeleteSectionModal;

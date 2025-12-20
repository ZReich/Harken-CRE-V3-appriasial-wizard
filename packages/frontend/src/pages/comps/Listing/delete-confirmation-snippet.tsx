import React from 'react';
import deleteImage from '../../../images/delete.png';
import CommonButton from '@/components/elements/button/Button';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { ResponseType } from '@/components/interface/response-type';
import { DeleteSnippetItemEnum } from '../enum/CompsEnum';

interface ConfirmationModalContentProps {
  close: () => void;
  setArrayAfterDelete: (res: any) => void;
  deleteId: number | undefined;
}

const DeleteConfirmationSnippet: React.FC<ConfirmationModalContentProps> = ({
  close,
  deleteId,
  setArrayAfterDelete,
}) => {
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'template/delete/',
    endPoint: `template/delete-snippet/${deleteId}`,
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
          setArrayAfterDelete(res?.data);
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
    <div  className="w-[383px] h-[320px] bg-white rounded-[14px] shadow-lg flex flex-col items-center p-4">
      <div className="flex justify-center mb-4">
        <img src={deleteImage} className="h-[75px] w-[94px]" />
      </div>
      <p className="text-center text-xl font-bold">{DeleteSnippetItemEnum.ARE_YOU_SURE}</p>
      <div className="flex w-full justify-center mb-4">
        <div className="text-sm font-medium w-[322px] h-[40px] text-center">
          {DeleteSnippetItemEnum.WARNING_MESSAGE}
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
          {DeleteSnippetItemEnum.DELETE_SNIPPET}
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
          {DeleteSnippetItemEnum.CANCEL}
        </CommonButton>
      </div>
    </div>
  );
};

export default DeleteConfirmationSnippet;

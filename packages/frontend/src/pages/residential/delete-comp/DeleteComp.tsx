import React from 'react';
import deleteImage from '../../../images/delete.png';
import CommonButton from '@/components/elements/button/Button';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { ResponseType } from '@/components/interface/response-type';

interface ConfirmationModalContentProps {
  close: () => void;
//   setArrayAfterDelete: () => void;
//   deleteId: number | undefined;
}

const DeleteConfirmationModal: React.FC<ConfirmationModalContentProps> = ({
  close,
//   deleteId,
//   setArrayAfterDelete
}) => {
  const { mutate } = useMutate<ResponseType,any>({
    queryKey: 'resComps/delete',
    endPoint: `resComps/delete/`,
    requestType: RequestType.DELETE,
  });
  const deleteComps = () => {
    mutate(
      {
        id:'',
      },
      {
        onSuccess: (res) => {
          toast(res?.data.message);
          close();
        //   setArrayAfterDelete(res?.data)
            
        },
        onError: (res:any) => {
          toast(res?.response?.data?.data?.error);
          setTimeout(() => {
            close();
          }, 2000);
        },
      }
    );
  };

  return (
    <div className="pb-3 w-[380px] h-[354px] rounded-[14px]">
      <div className="flex justify-center">
        <img src={deleteImage} className="h-[75px] w-[94px]" />
      </div>
      <p className="text-center text-xl font-bold">Are you sure?</p>
      <div className="flex w-full justify-center">
        <div className="text-sm font-medium w-[322px] h-[40px] text-center">
          This action can not be undone. All data associated with this comp will be lost.
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
          Delete Comp
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
          Cancel
        </CommonButton>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
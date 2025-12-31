import React from 'react';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { ResponseType } from '@/components/interface/response-type';
import { DeleteEvaluationEnum } from '@/pages/comps/enum/CompsEnum';
import CommonButton from '@/components/elements/button/Button';
import deleteImage from '../../../images/delete.png';

interface ConfirmationModalContentProps {
  close: () => void;
  setArrayAfterDelete: (res: any) => void;
  deleteId: number | undefined;
}

const DeleteModalEvaluationListing: React.FC<ConfirmationModalContentProps> = ({
  close,
  deleteId,
  setArrayAfterDelete,
}) => {
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'evalluation/delete/',
    endPoint: `evaluations/delete/${deleteId}`,
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

  // return <DeleteModalContentAppraisal close={close} deleteComps={deleteComps} label = {DeleteModalLabelEnum.DELETE_LIST} />;
  return (
    <div className="w-[383px] h-[320px] rounded-[14px]">
      <div className="flex justify-center">
        <img src={deleteImage} className="h-[75px] w-[94px]" />
      </div>
      <p className="text-center text-xl font-bold">
        {DeleteEvaluationEnum.ARE_YOU_SURE}
      </p>
      <div className="flex w-full justify-center">
        <div className="text-sm font-medium w-[322px] h-[40px] text-center">
          {DeleteEvaluationEnum.WARNING_MESSAGE}
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
          {DeleteEvaluationEnum.DELETE_EVALUATION}
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
          {DeleteEvaluationEnum.CANCEL}
        </CommonButton>
      </div>
    </div>
  );
};

export default DeleteModalEvaluationListing;

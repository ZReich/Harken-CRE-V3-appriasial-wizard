import React from 'react';
import DeleteModalContentAppraisal from '@/components/delete-confirmation-appraisal';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { ResponseType } from '@/components/interface/response-type';
import { DeleteModalLabelEnum } from '@/pages/comps/enum/CompsEnum';

interface ConfirmationModalContentProps {
  close: () => void;
//   setArrayAfterDelete: (res: any) => void;
  deleteId: number | undefined;
}

const DeleteModalSubSection: React.FC<ConfirmationModalContentProps> = ({
  close,
  deleteId,
//   setArrayAfterDelete,
}) => {
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'template/delete-section/${deleteId}',
    endPoint: `template/delete-section-item/${deleteId}`,
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
        //   setArrayAfterDelete(res?.data);
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

  return <DeleteModalContentAppraisal close={close} deleteComps={deleteComps} label = {DeleteModalLabelEnum.DELETE_LIST} />;
};

export default DeleteModalSubSection;
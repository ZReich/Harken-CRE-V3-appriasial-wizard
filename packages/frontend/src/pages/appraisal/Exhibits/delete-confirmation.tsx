import React from 'react';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { ResponseType } from '@/components/interface/response-type';
import DeleteModalContentAppraisal from '@/components/delete-confirmation-appraisal';
import { DeleteModalLabelEnum } from '@/pages/comps/enum/CompsEnum';

interface ConfirmationModalContentProps {
  close: () => void;
  setArrayAfterDelete: (res: any) => void;
  deleteId: number | undefined;
  refetch: any;
}

const DeleteModalAppraisalExhibits: React.FC<ConfirmationModalContentProps> = ({
  close,
  deleteId,
  setArrayAfterDelete,
  refetch,
}) => {
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/remove-exhibit',
    endPoint: `appraisals/remove-exhibit/${deleteId}`,
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
          refetch();
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
    <DeleteModalContentAppraisal
      close={close}
      deleteComps={deleteComps}
      label={DeleteModalLabelEnum.DELETE_EXHIBIT}
    />
  );
};

export default DeleteModalAppraisalExhibits;

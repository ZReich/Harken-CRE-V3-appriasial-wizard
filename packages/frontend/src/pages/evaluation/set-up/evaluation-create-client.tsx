import { useFormikContext } from 'formik';
import { DialogContent, Dialog, DialogTitle, IconButton } from '@mui/material';
import { AccountListDataType } from '@/components/interface/account-list-data';
import { useGet } from '@/hook/useGet';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '@/components/icons';
import EvaluationClientForm from './evaluation-create-client-form';
import { EvaluationCreateClientModalProps } from '@/pages/comps/Listing/comps-table-interfaces';

const EvaluationCreateClientModal: React.FC<
  EvaluationCreateClientModalProps
> = ({ open, onClose, handleCloseModal }) => {
  const navigate = useNavigate();
  // reset form
  const { resetForm } = useFormikContext();

  const location = useLocation();
  // get client id from url
  const { clientid } = location.state || {};
  // formik auth values
  const [selectedAccount, setSelectedAccountId] = useState<
    number | string | null
  >(null);
  // get client role from local storage
  const role = localStorage.getItem('role');

  // Function to handle browser back/forward navigation (popstate event)

  useEffect(() => {
    const handlePopState = () => {
      console.log('Current Pathname:', window.location.pathname);

      if (clientid && window.location.pathname.startsWith('/client-edit/')) {
        navigate('/clients-list');
      } else if (window.location.pathname === '/create-client') {
        navigate('/evaluation-set-up');
      } else if (
        window.location.pathname === '/create-new-client' ||
        window.location.pathname === '/create-new-client/'
      ) {
        navigate('/clients-list');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [clientid, navigate]);
  // get is superadmin or not
  const isSuperAdmin = role == '1' ? true : false;
  // user info api
  const { data: userinfo } = useGet<AccountListDataType>({
    queryKey: 'user/get',
    endPoint: 'user/get',
    config: { enabled: isSuperAdmin },
  });
  // State to store the selected account ID
  useEffect(() => {
    if (userinfo) {
      const usrID = userinfo?.data?.data?.user?.account_id;
      setSelectedAccountId(usrID);
    }
  }, [userinfo]);
  // modal close function
  const handleClose = () => {
    resetForm(); // Reset all fields
    handleCloseModal(); // Close the modal
  };

  console.log(selectedAccount);
  return (
    <>
      <Dialog
        className="create-client-modal"
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xl"
        sx={{
          '& .MuiDialog-paper': {
            width: '100vw',
            maxWidth: '1200px',
            height: '75vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
          }}
        >
          <IconButton onClick={handleClose} sx={{ color: 'gray' }}>
            <Icons.ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <EvaluationClientForm handleCloseModal={handleCloseModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EvaluationCreateClientModal;

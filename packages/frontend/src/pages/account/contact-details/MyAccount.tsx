import { Typography } from '@mui/material';
import AccountTabs from '../tab-panel/TabPanel';
import { useParams } from 'react-router-dom';

export const MyAcoount = () => {
  const { id } = useParams();

  return (
    <>
      <div className="mx-7">
        <Typography
          variant="h4"
          component="h4"
          className="text-xl font-bold py-5"
        >
          {id ? 'Update Account' : 'Create Account'}
          {!id && (
            <Typography className="text-sm font-normal pt-3">
              Create your account. After doing it, you can enter a payment
              method.
            </Typography>
          )}
        </Typography>
        <AccountTabs />
      </div>
    </>
  );
};

import { Typography } from '@mui/material';
import BasicTabs from '../tab-panel/TabPanel';

export const MyProfile = () => {
  return (
    <>
      <div className="mx-7">
        <Typography
          variant="h4"
          component="h4"
          className="text-xl font-bold py-5"
        >
          MY PROFILE
        </Typography>
        <BasicTabs />
      </div>
    </>
  );
};

import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ContactDetails from '../contact-details/ContactDetails';
import ThemeSettings from '../theme-settings/ThemeSettings';
import { TabPanelProps } from '../interfaces/accounInt';
import OtherAdministratorTable from "../other-administration";
import { useLocation } from 'react-router-dom'; 

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function AccountTabs() {
  const [value, setValue] = React.useState(0);
  const location = useLocation();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(event);
    setValue(newValue);
  };

  const isCreatingAccount = location.pathname.includes('accounts/create');

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
        className="custom-tabs"
      >
        <Tab
          label="Contact Details"
          sx={{ fontSize: '14px', textTransform: 'capitalize' }}
          {...a11yProps(0)}
        />
        <Tab
          label="Theme Settings"
          sx={{ textTransform: 'capitalize' }}
          {...a11yProps(1)}
        />
        {!isCreatingAccount && (
          <Tab
            label="Other Administrations"
            sx={{ textTransform: 'capitalize' }}
            {...a11yProps(2)}
          />
        )}
      </Tabs>
      <CustomTabPanel value={value} index={0}>
        <ContactDetails />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <ThemeSettings />
      </CustomTabPanel>
      {!isCreatingAccount && (
        <CustomTabPanel value={value} index={2}>
          <OtherAdministratorTable />
        </CustomTabPanel>
      )}
    </Box>
  );
}

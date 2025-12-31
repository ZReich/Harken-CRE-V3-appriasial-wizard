import { useEffect } from 'react';
import AppraisalLeaseUploadCompsScreen from './upload-lease-comps-screen';

const UploadAppraisalLeaseCompsScreen = () => {
  // Set localStorage values for lease upload mode
  useEffect(() => {
    localStorage.setItem('checkStatus', 'lease');
    // Use preserved active type instead of hardcoding 'building_with_land'
    const preservedActiveType = localStorage.getItem('preservedActiveType') || 'building_with_land';
    localStorage.setItem('activeType', preservedActiveType);
    localStorage.setItem('checkType', 'leasesCheckbox');
  }, []);

  return <AppraisalLeaseUploadCompsScreen />;
};

export default UploadAppraisalLeaseCompsScreen;
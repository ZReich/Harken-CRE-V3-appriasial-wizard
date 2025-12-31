import { useEffect } from 'react';
import AppraisalSalesUploadCompsScreen from './upload-sales-comps-screen';

const UploadAppraisalSalesCompsScreen = () => {
  // Set localStorage values for sales upload mode
  useEffect(() => {
    localStorage.setItem('checkStatus', 'sales');
    // Use preserved active type instead of hardcoding 'building_with_land'
    const preservedActiveType = localStorage.getItem('preservedActiveType') || 'building_with_land';
    localStorage.setItem('activeType', preservedActiveType);
    localStorage.setItem('checkType', 'salesCheckbox');
  }, []);

  return <AppraisalSalesUploadCompsScreen />;
};

export default UploadAppraisalSalesCompsScreen;
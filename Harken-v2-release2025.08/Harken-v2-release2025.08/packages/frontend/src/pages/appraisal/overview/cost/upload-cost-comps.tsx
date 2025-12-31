import { useEffect } from 'react';
import AppraisalCostUploadCompsScreen from './upload-cost-comps-screen';

const UploadAppraisalCostCompsScreen = () => {
  // Set localStorage values for cost upload mode
  useEffect(() => {
    localStorage.setItem('checkStatus', 'sales');
    localStorage.setItem('activeType', 'land_only');
    localStorage.setItem('checkType', 'salesCheckbox');
  }, []);

  return <AppraisalCostUploadCompsScreen />;
};

export default UploadAppraisalCostCompsScreen;
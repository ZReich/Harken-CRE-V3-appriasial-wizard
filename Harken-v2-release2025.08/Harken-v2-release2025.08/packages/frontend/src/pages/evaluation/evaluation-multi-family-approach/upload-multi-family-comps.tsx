import { useEffect } from 'react';
import MultiFamilyUploadCompsScreen from './upload-multi-family-comps-screen';

const UploadMultiFamilyCompsScreen = () => {
  // Set localStorage values for multi-family upload mode
  useEffect(() => {
    localStorage.setItem('checkStatus', 'sales');
    localStorage.setItem('activeType', 'building_with_land');
    localStorage.setItem('checkType', 'salesCheckbox');
  }, []);

  return <MultiFamilyUploadCompsScreen />;
};

export default UploadMultiFamilyCompsScreen;
import { useEffect } from 'react';
import CapUploadCompsScreen from './upload-cap-comps-screen';

const UploadCapCompsScreen = () => {
  // Set localStorage values for cap upload mode
  useEffect(() => {
    localStorage.setItem('checkStatus', 'sales');
    localStorage.setItem('activeType', 'building_with_land');
    localStorage.setItem('checkType', 'salesCheckbox');
  }, []);

  return <CapUploadCompsScreen />;
};

export default UploadCapCompsScreen;
import React, { useEffect } from 'react';
import CostUploadCompsScreen from './upload-cost-comps-screen';

const UploadCostComps: React.FC = () => {
  useEffect(() => {
    localStorage.setItem('activeType', 'land_only');
    localStorage.setItem('checkType', 'salesCheckbox');
  }, []);

  return <CostUploadCompsScreen />;
};

export default UploadCostComps;
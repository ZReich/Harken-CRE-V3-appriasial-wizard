import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const UploadResidentialCostComps = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Set localStorage values for residential cost approach
    localStorage.setItem('activeType', 'residential');
    localStorage.setItem('checkType', 'costCheckbox');
    localStorage.setItem('approachType', 'costCheck');
    
    // Navigate to the upload screen with state and preserve query parameters
    navigate(`/residential/upload-comps-cost${location.search}`, {
      state: location.state,
      replace: true
    });
  }, [navigate, location.state, location.search]);

  return null;
};

export default UploadResidentialCostComps;
import { useState, useEffect } from 'react';
import { residentialCompFields, qualitativeAdjustments } from '../../../../utils/staticCompData';

export const useResidentialSalesComps = (appraisalType: string) => {
  const [operatingExpensesInitial, setOperatingExpensesInitial] = useState<any[]>([]);
  const [operatingAllExpensesInitial, setOperatingAllExpensesInitial] = useState<any[]>([]);
  const [salesCompQualitativeAdjustment, setSalesCompQualitativeAdjustment] = useState<any[]>([]);
  const [appraisalSpecificAdjustment, setAppraisalSpecificAdjustment] = useState<any[]>([]);
  const [isLoading] = useState(false);

  // This function replaces the fetchCompsData API call with static data
  const fetchCompsData = async () => {
    try {
      // Step 1: Use static data instead of API call
      
      // Step 2: Set the static fields for Quantitative Adjustments
      setOperatingExpensesInitial(residentialCompFields);
      
      // Step 3: Set all operating expenses
      setOperatingAllExpensesInitial(residentialCompFields);
      
      // Step 4: Set qualitative adjustments
      setSalesCompQualitativeAdjustment(qualitativeAdjustments);
      
      // Step 5: Handle Appraisal Specific Adjustments based on appraisal type
      import('./staticAppraisalOptions').then(({ appraisalSpecificOptions }:any) => {
        // Get the appropriate options based on appraisal type
        const options = appraisalSpecificOptions[appraisalType] || appraisalSpecificOptions.residential;
        
        // Step 6: Set appraisal specific adjustments
        setAppraisalSpecificAdjustment(options);
      });
      
    } catch (error) {
      console.error('Error setting static comps data:', error);
    }
  };

  // Load the static data when the component mounts or appraisalType changes
  useEffect(() => {
    fetchCompsData();
  }, [appraisalType]);

  return {
    operatingExpensesInitial,
    operatingAllExpensesInitial,
    salesCompQualitativeAdjustment,
    appraisalSpecificAdjustment,
    fetchCompsData,
    isLoading
  };
};
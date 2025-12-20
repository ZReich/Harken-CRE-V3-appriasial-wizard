import { useEffect } from 'react';
import { useResidentialSalesComps } from './useResidentialSalesComps';

const ResidentialSalesCompExample = () => {
  // Initialize the hook with the appraisal type
  const {
    operatingExpensesInitial,
    operatingAllExpensesInitial,
    salesCompQualitativeAdjustment,
    appraisalSpecificAdjustment,
    fetchCompsData
  } = useResidentialSalesComps('residential');

  useEffect(() => {
    // Load the static data when component mounts
    fetchCompsData();
  }, []);

  return (
    <div>
      <h2>Residential Sales Comparison Fields</h2>
      
      <h3>Quantitative Adjustments</h3>
      <ul>
        {operatingExpensesInitial.map((field, index) => (
          <li key={index}>
            {field.adj_value} - {field.adj_key}
          </li>
        ))}
      </ul>
      
      <h3>All Operating Expenses</h3>
      <ul>
        {operatingAllExpensesInitial.map((field, index) => (
          <li key={index}>
            {field.adj_value} - {field.adj_key}
          </li>
        ))}
      </ul>
      
      <h3>Qualitative Adjustments</h3>
      <ul>
        {salesCompQualitativeAdjustment.map((field, index) => (
          <li key={index}>
            {field.adj_value} - {field.adj_key}
          </li>
        ))}
      </ul>
      
      <h3>Appraisal Specific Adjustments</h3>
      <ul>
        {appraisalSpecificAdjustment.map((field, index) => (
          <li key={index}>
            {field.comparison_value} - {field.comparison_key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResidentialSalesCompExample;
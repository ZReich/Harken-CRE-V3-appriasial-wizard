import React, { useEffect } from 'react';
import { Grid, Typography, TextField, Divider, Paper, MenuItem } from '@mui/material';
import { useFormikContext } from 'formik';
import { formatPrice } from '@/utils/sanitize';

interface CostAnalysisFormProps {
  propertyType: string;
}

export const CostAnalysisForm: React.FC<CostAnalysisFormProps> = ({ propertyType }) => {
  const { values, setFieldValue, handleChange } = useFormikContext<any>();

  // Normalize property type
  const type = propertyType?.toLowerCase() || 'commercial';
  const isLand = type.includes('land');
  const isResidential = type.includes('residential');

  // Auto-calculate totals
  useEffect(() => {
    if (isLand) return;

    const costNew = (parseFloat(values.unitCost) || 0) * (parseFloat(values.unitQuantity) || 0);
    const subTotalRCN = costNew; // Add other items if needed
    
    // Depreciation
    const physDepAmt = subTotalRCN * ((parseFloat(values.physicalDepreciation) || 0) / 100);
    const econDepAmt = subTotalRCN * ((parseFloat(values.economicDepreciation) || 0) / 100);
    const funcDepAmt = subTotalRCN * ((parseFloat(values.functionalDepreciation) || 0) / 100);
    const totalDepreciation = physDepAmt + econDepAmt + funcDepAmt;
    
    const depreciatedCost = subTotalRCN - totalDepreciation;
    const totalRCN = depreciatedCost + (parseFloat(values.siteImprovements) || 0);
    
    const totalSF = parseFloat(values.unitQuantity) || 1;
    const costPerSF = totalRCN / totalSF;

    // Actual Cost Estimate
    const actualDepVal = (parseFloat(values.actualBuildingCost) || 0) * (1 - (parseFloat(values.actualDepreciationPct) || 0) / 100);
    const totalEstValue = actualDepVal + (parseFloat(values.estimatedLandValue) || 0);

    // We can update state or just display. For form submission, we might want to set these in values.
    // But to avoid infinite loops, we'll just calculate for display or use controlled inputs for calculated fields if they need to be saved.
  }, [values]);

  if (isLand) {
    return (
      <Paper elevation={0} className="p-4 mt-4 bg-gray-50 border border-gray-200 rounded">
        <Typography variant="h6" className="font-bold text-gray-700">
          Cost Approach Analysis
        </Typography>
        <Typography variant="body2" className="text-gray-600 mt-2">
          The Cost Approach is typically not applicable to vacant land valuation. 
          Please refer to the Sales Comparison Approach (Comps) for land value.
        </Typography>
      </Paper>
    );
  }

  // Calculations for render
  const costNew = (parseFloat(values.unitCost) || 0) * (parseFloat(values.unitQuantity) || 0);
  const subTotalRCN = costNew; // + Interior Office + Refrigerated Space if we added those fields
  const physDep = (parseFloat(values.physicalDepreciation) || 0);
  const econDep = (parseFloat(values.economicDepreciation) || 0);
  const funcDep = (parseFloat(values.functionalDepreciation) || 0);
  
  const physDepAmt = subTotalRCN * (physDep / 100);
  const econDepAmt = subTotalRCN * (econDep / 100);
  const funcDepAmt = subTotalRCN * (funcDep / 100);
  
  const subTotalAfterDep = subTotalRCN - (physDepAmt + econDepAmt + funcDepAmt);
  const totalRCN = subTotalAfterDep + (parseFloat(values.siteImprovements) || 0);
  const costPerSF = values.unitQuantity ? totalRCN / values.unitQuantity : 0;

  // Actual Cost
  const actualBuildCost = parseFloat(values.actualBuildingCost) || 0;
  const actualDepPct = parseFloat(values.actualDepreciationPct) || 0;
  const actualDepAmt = actualBuildCost * (actualDepPct / 100);
  const depreciatedValue = actualBuildCost - actualDepAmt;
  const landValue = parseFloat(values.estimatedLandValue) || 0;
  const totalEstValue = depreciatedValue + landValue;


  return (
    <div className="mt-8 px-4 xl:px-[44px]">
      <Typography variant="h6" className="font-bold text-gray-800 mb-4 uppercase">
        {isResidential ? 'Residential Cost Analysis' : 'Commercial Cost Analysis (MVS)'}
      </Typography>

      <Paper variant="outlined" className="p-6 bg-white">
        <Grid container spacing={3}>
          {/* MVS Cost Estimate Section */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" className="font-bold border-b pb-2 mb-4">
              MVS Cost Estimate
            </Typography>
            
            <Grid container spacing={2} alignItems="center" className="mb-2 font-semibold text-sm text-gray-600">
              <Grid item xs={4}>Building Type</Grid>
              <Grid item xs={2}>Unit Cost</Grid>
              <Grid item xs={2}>Quantity ({isResidential ? 'GLA' : 'SF'})</Grid>
              <Grid item xs={4} className="text-right">Cost New</Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" className="mb-4">
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  name="buildingType"
                  value={values.buildingType}
                  onChange={handleChange}
                  select
                >
                  {isResidential ? (
                    [
                      <MenuItem key="sfr" value="Single Family">Single Family</MenuItem>,
                      <MenuItem key="condo" value="Condo">Condo</MenuItem>,
                      <MenuItem key="townhouse" value="Townhouse">Townhouse</MenuItem>
                    ]
                  ) : (
                    [
                      <MenuItem key="light-mfg" value="Light Manufacturing">Light Manufacturing</MenuItem>,
                      <MenuItem key="office" value="Interior Office">Interior Office</MenuItem>,
                      <MenuItem key="retail" value="Retail">Retail</MenuItem>,
                      <MenuItem key="warehouse" value="Warehouse">Warehouse</MenuItem>
                    ]
                  )}
                </TextField>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  size="small"
                  name="unitCost"
                  type="number"
                  value={values.unitCost}
                  onChange={handleChange}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  size="small"
                  name="unitQuantity"
                  type="number"
                  value={values.unitQuantity}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4} className="text-right font-medium">
                {formatPrice(costNew)}
              </Grid>
            </Grid>

            <Divider className="my-4" />

            <Grid container className="mb-2">
              <Grid item xs={8} className="font-bold">Subtotal - Replacement Cost New</Grid>
              <Grid item xs={4} className="text-right font-bold">{formatPrice(subTotalRCN)}</Grid>
            </Grid>

            <div className="pl-4 space-y-2">
              <Grid container alignItems="center">
                <Grid item xs={6}>Physical Depreciation (%)</Grid>
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    name="physicalDepreciation"
                    type="number"
                    value={values.physicalDepreciation}
                    onChange={handleChange}
                    InputProps={{ endAdornment: '%' }}
                  />
                </Grid>
                <Grid item xs={4} className="text-right text-red-600">({formatPrice(physDepAmt)})</Grid>
              </Grid>
              <Grid container alignItems="center">
                <Grid item xs={6}>Economic Depreciation (%)</Grid>
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    name="economicDepreciation"
                    type="number"
                    value={values.economicDepreciation}
                    onChange={handleChange}
                    InputProps={{ endAdornment: '%' }}
                  />
                </Grid>
                <Grid item xs={4} className="text-right text-red-600">({formatPrice(econDepAmt)})</Grid>
              </Grid>
              <Grid container alignItems="center">
                <Grid item xs={6}>Functional Depreciation (%)</Grid>
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    name="functionalDepreciation"
                    type="number"
                    value={values.functionalDepreciation}
                    onChange={handleChange}
                    InputProps={{ endAdornment: '%' }}
                  />
                </Grid>
                <Grid item xs={4} className="text-right text-red-600">({formatPrice(funcDepAmt)})</Grid>
              </Grid>
            </div>

            <Divider className="my-4" />

            <Grid container className="mb-2">
              <Grid item xs={8} className="font-bold">Subtotal - After Depreciation</Grid>
              <Grid item xs={4} className="text-right font-bold">{formatPrice(subTotalAfterDep)}</Grid>
            </Grid>

            <Grid container alignItems="center" className="mb-2">
              <Grid item xs={8}>Site Improvements</Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  name="siteImprovements"
                  type="number"
                  value={values.siteImprovements}
                  onChange={handleChange}
                  InputProps={{ startAdornment: '$', inputMode: 'numeric' }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </Grid>
            </Grid>

            <div className="bg-gray-100 p-3 mt-4 rounded">
              <Grid container>
                <Grid item xs={8} className="font-bold text-lg">Total Replacement Cost New</Grid>
                <Grid item xs={4} className="text-right font-bold text-lg text-blue-700">{formatPrice(totalRCN)}</Grid>
              </Grid>
              <Grid container className="mt-2 text-sm text-gray-600">
                <Grid item xs={8}>Cost per SF</Grid>
                <Grid item xs={4} className="text-right">{formatPrice(costPerSF)}</Grid>
              </Grid>
            </div>
          </Grid>

          {/* Actual Cost Estimate Section */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" className="font-bold border-b pb-2 mb-4">
              Actual Cost Estimate
            </Typography>
             <Grid container alignItems="center" className="mb-2">
              <Grid item xs={7}>Building & Site Improvements</Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  size="small"
                  name="actualBuildingCost"
                  type="number"
                  value={values.actualBuildingCost}
                  onChange={handleChange}
                  InputProps={{ startAdornment: '$' }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </Grid>
            </Grid>

             <Grid container alignItems="center" className="mb-2">
              <Grid item xs={7}>Less Depreciation @ {values.actualDepreciationPct}%</Grid>
              <Grid item xs={5}>
                 <TextField
                  fullWidth
                  size="small"
                  name="actualDepreciationPct"
                  type="number"
                  value={values.actualDepreciationPct}
                  onChange={handleChange}
                  InputProps={{ endAdornment: '%' }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </Grid>
            </Grid>

            <Divider className="my-2" />

             <Grid container alignItems="center" className="mb-2 font-medium">
              <Grid item xs={7}>Depreciated Value</Grid>
              <Grid item xs={5} className="text-right">{formatPrice(depreciatedValue)}</Grid>
            </Grid>

             <Grid container alignItems="center" className="mb-4">
              <Grid item xs={7}>Plus Estimated Land Value</Grid>
              <Grid item xs={5}>
                 <TextField
                  fullWidth
                  size="small"
                  name="estimatedLandValue"
                  type="number"
                  value={values.estimatedLandValue}
                  onChange={handleChange}
                  InputProps={{ startAdornment: '$' }}
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </Grid>
            </Grid>

            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <Grid container>
                <Grid item xs={7} className="font-bold">Total Estimated Value</Grid>
                <Grid item xs={5} className="text-right font-bold text-blue-800">{formatPrice(totalEstValue)}</Grid>
              </Grid>
              <Grid container className="mt-2">
                <Grid item xs={7} className="font-bold">Rounded to</Grid>
                <Grid item xs={5} className="text-right font-bold text-xl">
                   {formatPrice(Math.round(totalEstValue / 1000) * 1000)}
                </Grid>
              </Grid>
            </div>

            <div className="mt-6 text-sm text-gray-500 italic">
              <Typography variant="body2">
                Comparison: MVS Estimate is {((totalRCN - totalEstValue) / totalEstValue * 100).toFixed(1)}% 
                {totalRCN > totalEstValue ? ' higher ' : ' lower '} 
                than Actual Cost Estimate.
              </Typography>
            </div>

          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};






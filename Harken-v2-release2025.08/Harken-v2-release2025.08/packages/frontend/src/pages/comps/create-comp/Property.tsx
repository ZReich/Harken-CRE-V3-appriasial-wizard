import React, { useEffect } from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import { useFormikContext, FormikValues } from 'formik';
import {
  formatPercentageInput,
  handleInputChange,
  // sanitizeInputPercentage,
} from '@/utils/sanitize';
import { ResidentialComponentHeaderEnum } from '@/pages/residential/enum/ResidentialEnum';
import { sanitizeInputZoningType } from '@/utils/sanitize';
import TextAreaField from '@/components/styles/textarea';

export const Property = ({ passData }: any) => {
  const { handleChange, values, setValues, setFieldValue } =
    useFormikContext<FormikValues>();
  useEffect(() => {
    if (passData.id) {
      setFieldValue('summary', passData.summary);
      setFieldValue('site_coverage_percent', passData.site_coverage_percent);
      setFieldValue('parcel_id_apn', passData.parcel_id_apn);
      setFieldValue('confirmed_with', passData.confirmed_with);
      setFieldValue('confirmed_by', passData.confirmed_by);
      setFieldValue('instrument', passData.instrument);
      setFieldValue('grantee', passData.grantee);
      setFieldValue('grantor', passData.grantor);
      setFieldValue('occupancy', passData.occupancy);
      setFieldValue('zoning_type', passData.zoning_type);
      if (passData.lat && passData.lng) {
        setValues(passData);
      }
    }
  }, [passData.id]);

  return (
    <>
      <div id="propertyDiv">
        <Typography
          variant="h6"
          component="h5"
          className="text-lg font-bold"
          sx={{ fontFamily: '"Montserrat", serif' }}
        >
          {ResidentialComponentHeaderEnum.PROPERTY}
        </Typography>
        <div className="mt-[6px] items-end">
          <Grid className="mt-2 items-end" container spacing={3}>
            <Grid item xs={6} className='pt-2 textareaField'>
              <TextAreaField label="Property Summary" name="summary" />
            </Grid>
            <Grid item xs={6} className='pt-2 pb-[4px]'>
              <StyledField
                label="Site Coverage Ratio"
                name="site_coverage_percent"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';

                  const { selectionStart, selectionEnd }: any = e.target;
                  const inputValue =
                    values?.site_coverage_percent?.toString() || '';

                  if (isBack) {
                    if (
                      selectionStart === 0 &&
                      selectionEnd >= inputValue.length
                    ) {
                      handleInputChange(
                        handleChange,
                        'site_coverage_percent',
                        ''
                      );
                      event.preventDefault();
                    } else {
                      const inpArr = Array.from(inputValue);
                      inpArr.pop();
                      handleInputChange(
                        handleChange,
                        'site_coverage_percent',
                        inpArr.join('')
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = e.target.value;

                  const sanitizedInput = input.replace(/[%|,]/g, '');

                  if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
                    handleInputChange(
                      handleChange,
                      'site_coverage_percent',
                      sanitizedInput
                    );
                  }
                }}
                value={
                  values.site_coverage_percent
                    ? formatPercentageInput(values.site_coverage_percent)
                    : ''
                }
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-3 items-end">
            <Grid item xs={4} md={3} className='pt-2'>
              <StyledField
                label="Zoning Type"
                name="zoning_type"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputZoningType(e.target.value);
                  handleInputChange(handleChange, 'zoning_type', input);
                }}
                value={values.zoning_type}
              />
            </Grid>
            <Grid item xs={4} md={3} className='pt-2'>
              <StyledField label="Occupancy" name="occupancy" />
            </Grid>
            <Grid item xs={4} md={3} className='pt-2'>
              <StyledField label="Grantor" name="grantor" />
            </Grid>
            <Grid item xs={4} md={3} className='pt-2'>
              <StyledField label="Grantee" name="grantee" />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-3 items-end">
            <Grid item xs={4} md={3} className='pt-2'>
              <StyledField label="Instrument" name="instrument" />
            </Grid>
            <Grid item xs={4} md={3} className='pt-2'>
              <StyledField label="Confirmed By" name="confirmed_by" />
            </Grid>
            <Grid item xs={4} md={3} className='pt-2'>
              <StyledField label="Confirmed With" name="confirmed_with" />
            </Grid>
            <Grid item xs={4} md={3} className='pt-2'>
              <StyledField label="Parcel #" name="parcel_id_apn" />
            </Grid>
          </Grid>
        </div>
        <div>
          <HarkenHr />
        </div>
      </div>
    </>
  );
};

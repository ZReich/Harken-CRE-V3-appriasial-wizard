import { HarkenHr } from '@/components/harken-hr';
import SelectTextField from '@/components/styles/select-input';
import { Grid, Typography } from '@mui/material';

import { useFormikContext } from 'formik';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { AmenitiesEnum } from '@/pages/appraisal/overview/OverviewEnum';
import { sanitizeTwentyFiveChar, handleInputChange } from '@/utils/sanitize';
import useGlobalCodeOptions from '../globalCodes/global-codes-option';

export const EvaluationAmenities = () => {
  const {
    AppraisalExteriorTypeOptions,
    AppraisalRoofTypeOptions,
    AppraisalPlumbingTypeOptions,
    AppraisalWindowsTypeOptions,
    HeatingCoolingOptions,
    ElectricalOptions,
  } = useGlobalCodeOptions();
  const { values, handleChange, setFieldValue } = useFormikContext<any>();
  return (
    <>
      <div>
        <Typography
          variant="h1"
          component="h2"
          className="text-lg font-bold mt-5"
        >
          {AmenitiesEnum.AMENITIES}
        </Typography>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={values.exterior === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6} className='pt-2 selectFixedHeight'>
            <SelectTextField
              label={AmenitiesEnum.EXTERIOR}
              name={AmenitiesEnum.EXTERIOR_NAME}
              options={AppraisalExteriorTypeOptions}
              onChange={(e) =>
                setFieldValue(AmenitiesEnum.EXTERIOR_NAME, e.target.value)
              }
              value={values.exterior}
            />
          </Grid>
          {values.exterior === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-exterior pt-2">
              <StyledField
                label={AmenitiesEnum.OTHER_EXTERIOR}
                name={AmenitiesEnum.EXTERIOR_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'exterior_custom', input);
                }}
                value={values.exterior_custom}
              />
            </Grid>
          ) : null}
          <Grid item xs={values.roof === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6} className='pt-2 selectFixedHeight'>
            <SelectTextField
              label={AmenitiesEnum.ROOF}
              name={AmenitiesEnum.ROOF_NAME}
              options={AppraisalRoofTypeOptions}
              onChange={(e) =>
                setFieldValue(AmenitiesEnum.ROOF_NAME, e.target.value)
              }
              value={values.roof}
            />
          </Grid>
          {values.roof === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-roof pt-2">
              <StyledField
                label={AmenitiesEnum.OTHER_ROOF}
                name={AmenitiesEnum.ROOF_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'roof_custom', input);
                }}
                value={values.roof_custom}
              />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={values.electrical === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={AmenitiesEnum.ELECTRICAL}
              name={AmenitiesEnum.ELECTRICAL_NAME}
              options={ElectricalOptions}
              onChange={(e) =>
                setFieldValue(AmenitiesEnum.ELECTRICAL_NAME, e.target.value)
              }
              value={values.electrical}
            />
          </Grid>
          {values.electrical === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className='pt-2'>
              <StyledField
                label={AmenitiesEnum.OTHER_ELECTRICAL}
                name={AmenitiesEnum.ELECTRICAL_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'electrical_custom', input);
                }}
                value={values.electrical_custom}
              />
            </Grid>
          ) : null}
          <Grid item xs={values.plumbing === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6} className='pt-2 selectFixedHeight'>
            <SelectTextField
              label={AmenitiesEnum.PLUMBING}
              name={AmenitiesEnum.PLUMBING_NAME}
              options={AppraisalPlumbingTypeOptions}
              onChange={(e) =>
                setFieldValue(AmenitiesEnum.PLUMBING_NAME, e.target.value)
              }
              value={values.plumbing}
            />
          </Grid>
          {values.plumbing === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className='pt-2'>
              <StyledField
                label={AmenitiesEnum.OTHER_PLUMBING}
                name={AmenitiesEnum.PLUMBING_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'plumbing_custom', input);
                }}
                value={values.plumbing_custom}
              />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={values.heating_cooling === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={AmenitiesEnum.HEATING_COOLING}
              name={AmenitiesEnum.HEATING_COOLING_NAME}
              options={HeatingCoolingOptions}
              onChange={(e) =>
                setFieldValue(
                  AmenitiesEnum.HEATING_COOLING_NAME,
                  e.target.value
                )
              }
              value={values.heating_cooling}
            />
          </Grid>
          {values.heating_cooling === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className='pt-2'>
              <StyledField
                label={AmenitiesEnum.OTHER_HEATING_COOLING}
                name={AmenitiesEnum.HEATING_COOLING_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(
                    handleChange,
                    'heating_cooling_custom',
                    input
                  );
                }}
                value={values.heating_cooling_custom}
              />
            </Grid>
          ) : null}
          <Grid item xs={values.windows === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6} className='pt-2 selectFixedHeight'>
            <SelectTextField
              label={AmenitiesEnum.WINDOWS}
              name={AmenitiesEnum.WINDOWS_NAME}
              options={AppraisalWindowsTypeOptions}
              onChange={(e) =>
                setFieldValue(AmenitiesEnum.WINDOWS_NAME, e.target.value)
              }
              value={values.windows}
            />
          </Grid>
          {values.windows === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className='pt-2'>
              <StyledField
                label={AmenitiesEnum.OTHER_WINDOWS}
                name={AmenitiesEnum.WINDOWS_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'windows_custom', input);
                }}
                value={values.windows_custom}
              />
            </Grid>
          ) : null}
        </Grid>
        <HarkenHr />
      </div>
    </>
  );
};

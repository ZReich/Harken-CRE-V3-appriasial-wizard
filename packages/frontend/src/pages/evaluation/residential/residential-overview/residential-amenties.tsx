import { HarkenHr } from '@/components/harken-hr';
import SelectTextField from '@/components/styles/select-input';
import { Grid, Typography } from '@mui/material';

import StyledField from '@/components/styles/StyleFieldEditComp';
import { AmenitiesEnum } from '@/pages/appraisal/overview/OverviewEnum';
import {
  BarthroomOptions,
  BedroomOptions,
  FencingOptions,
  FireplaceOptions,
  GarageOptions,
} from '@/pages/residential/create-comp/SelectOption';
import { AmenitisResidentialComp } from '@/pages/residential/enum/ResidentialEnum';
import { handleInputChange, sanitizeTwentyFiveChar } from '@/utils/sanitize';
import { useFormikContext } from 'formik';
import useGlobalCodeOptions from '../../globalCodes/global-codes-option';
import ResidentialAdditionalAmenities from './residential-amenities';

export const ResidentialAmenties = ({ updateData }: any) => {
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
        <Grid container spacing={3} className="mt-1 items-end">
          <Grid
            item
            xs={values.exterior === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
            className="pt-2 selectFixedHeight"
          >
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
          <Grid
            item
            xs={values.roof === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
            className="pt-2 selectFixedHeight"
          >
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
          <Grid
            className="pt-2 selectFixedHeight"
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
            <Grid item xs={3} className="pt-2">
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
          <Grid
            item
            xs={values.plumbing === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
            className="pt-2 selectFixedHeight"
          >
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
            <Grid item xs={3} className="pt-2">
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
          <Grid
            className="pt-2 selectFixedHeight"
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
            <Grid item xs={3} className="pt-2">
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
          <Grid
            item
            xs={values.windows === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
            className="pt-2 selectFixedHeight"
          >
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
            <Grid item xs={3} className="pt-2">
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
        <Grid container spacing={2} className="mt-2 items-end">
          <Grid
            className="pt-2 selectFixedHeight"
            item
            xs={values.bedrooms === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={
                <span className="text-customGray">
                  {AmenitisResidentialComp.BEDROOMS}
                </span>
              }
              name={AmenitisResidentialComp.BEDROOMS_NAME}
              options={BedroomOptions}
              onChange={(e) =>
                setFieldValue(
                  AmenitisResidentialComp.BEDROOMS_NAME,
                  e.target.value
                )
              }
              value={values.bedrooms}
            />
          </Grid>
          {values.bedrooms === AmenitisResidentialComp.TYPE_MY_OWN ? (
            <Grid item xs={3} className="pt-2">
              <StyledField
                label={AmenitisResidentialComp.OTHER_BEDROOMS}
                name={AmenitisResidentialComp.BEDROOMS_CUSTOM}
                maxLength={25}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'bedrooms_custom', input);
                }}
                value={values.bedrooms_custom}
              />
            </Grid>
          ) : null}
          <Grid
            className="pt-2 selectFixedHeight"
            item
            xs={
              values.bathrooms === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
            }
          >
            <SelectTextField
              label={
                <span className="text-customGray">
                  {AmenitisResidentialComp.BATHROOMS}
                </span>
              }
              name={AmenitisResidentialComp.BATHROOMS_NAME}
              options={BarthroomOptions}
              onChange={(e) =>
                setFieldValue(
                  AmenitisResidentialComp.BATHROOMS_NAME,
                  e.target.value
                )
              }
              value={values.bathrooms}
            />
          </Grid>
          {values.bathrooms === AmenitisResidentialComp.TYPE_MY_OWN ? (
            <Grid item xs={3} className="pt-2">
              <StyledField
                label={AmenitisResidentialComp.OTHER_BATHROOMS}
                name={AmenitisResidentialComp.BATHROOMS_CUSTOM}
                maxLength={25}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'bathrooms_custom', input);
                }}
                value={values.bathrooms_custom}
              />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={2} className="mt-2 items-end">
          <Grid
            className="pt-2 selectFixedHeight"
            item
            xs={values.garage === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={
                <span className="text-customGray">
                  {AmenitisResidentialComp.GARAGE}
                </span>
              }
              name={AmenitisResidentialComp.GARAGE_NAME}
              options={GarageOptions}
              onChange={(e) =>
                setFieldValue(
                  AmenitisResidentialComp.GARAGE_NAME,
                  e.target.value
                )
              }
              value={values.garage}
            />
          </Grid>
          {values.garage === AmenitisResidentialComp.TYPE_MY_OWN ? (
            <Grid item xs={3} className="pt-2">
              <StyledField
                label={AmenitisResidentialComp.OTHER_GARAGE}
                name={AmenitisResidentialComp.GARAGE_CUSTOM}
                maxLength={25}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'garage_custom', input);
                }}
                value={values.garage_custom}
              />
            </Grid>
          ) : null}
          <Grid
            className="pt-2 selectFixedHeight"
            item
            xs={values.fencing === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={
                <span className="text-customGray">
                  {AmenitisResidentialComp.FENCING}
                </span>
              }
              name={AmenitisResidentialComp.FENCING_NAME}
              options={FencingOptions}
              onChange={(e) =>
                setFieldValue(
                  AmenitisResidentialComp.FENCING_NAME,
                  e.target.value
                )
              }
              value={values.fencing}
            />
          </Grid>
          {values.fencing === AmenitisResidentialComp.TYPE_MY_OWN ? (
            <Grid item xs={3} className="pt-2">
              <StyledField
                label={AmenitisResidentialComp.OTHER_FENCING}
                name={AmenitisResidentialComp.FENCING_CUSTOM}
                maxLength={25}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'fencing_custom', input);
                }}
                value={values.fencing_custom}
              />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={2} className="mt-2 items-end">
          <Grid
            className="pt-2 selectFixedHeight"
            item
            xs={
              values.fireplace === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
            }
          >
            <SelectTextField
              label={
                <span className="text-customGray">
                  {AmenitisResidentialComp.FIREPLACE}
                </span>
              }
              name={AmenitisResidentialComp.FIREPLACE_NAME}
              options={FireplaceOptions}
              onChange={(e) =>
                setFieldValue(
                  AmenitisResidentialComp.FIREPLACE_NAME,
                  e.target.value
                )
              }
              value={values.fireplace}
            />
          </Grid>
          {values.fireplace === AmenitisResidentialComp.TYPE_MY_OWN ? (
            <Grid item xs={3} className="pt-2">
              <StyledField
                label={AmenitisResidentialComp.OTHER_FIREPLACE}
                name={AmenitisResidentialComp.FIREPLACE_CUSTOM}
                maxLength={25}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeTwentyFiveChar(e.target.value);
                  handleInputChange(handleChange, 'fireplace_custom', input);
                }}
                value={values.fireplace_custom}
              />
            </Grid>
          ) : null}
          <Grid item xs={6} className="pt-2 selectFixedHeight ">
            <ResidentialAdditionalAmenities updateData={updateData} />
          </Grid>
        </Grid>
        <Grid container spacing={2} className="mt-2 items-end">
          <Grid item xs={12} className="pt-2">
            <StyledField
              label={AmenitisResidentialComp.OTHER_AMENITIES_LABEL}
              name={AmenitisResidentialComp.OTHER_AMENITIES}
              maxLength={50}
            />
          </Grid>
        </Grid>
        <HarkenHr />
      </div>
    </>
  );
};

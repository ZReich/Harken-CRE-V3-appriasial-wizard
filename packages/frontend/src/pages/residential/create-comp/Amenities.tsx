import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import SelectTextField from '@/components/styles/select-input';
import { useFormikContext } from 'formik';
import { ResidentialCreateComp } from '@/components/interface/residential-create-comp';
import {
  BarthroomOptions,
  BedroomOptions,
  ElectricalOptions,
  ExteriorOptions,
  FencingOptions,
  FireplaceOptions,
  GarageOptions,
  HeatingCoolingOptions,
  PlumbingOptions,
  RoofOptions,
  WindowOptions,
} from './SelectOption';
import AdditionalAmenities from './AdditionalAmenities';
import { useEffect } from 'react';
import {
  ResidentialComponentHeaderEnum,
  AmenitisResidentialComp,
} from '../enum/ResidentialEnum';

import {
  getValueOrTypeMyExterior,
  getValueOrTypeMyRoof,
  getValueOrTypeMyElectrical,
  getValueOrTypeMyPlumbing,
  getValueOrTypeMyHeating_Cooling,
  getValueOrTypeMyWindows,
  getValueOrTypeMyBedRoom,
  getValueOrTypeMyBathroom,
  getValueOrTypeMyGarage,
  getValueOrTypeMyFencing,
  getValueOrTypeMyFirePlace,
} from '@/utils/type-my-own';

export const Amenities = ({ updateData }: any) => {
  const { values, setFieldValue } = useFormikContext<ResidentialCreateComp>();
  useEffect(() => {
    if (updateData?.id) {
      setFieldValue(
        AmenitisResidentialComp.EXTERIOR_NAME,
        getValueOrTypeMyExterior(updateData.exterior)
      );
      setFieldValue(
        AmenitisResidentialComp.EXTERIOR_CUSTOM,
        updateData.exterior
      );

      setFieldValue(
        AmenitisResidentialComp.ROOF_NAME,
        getValueOrTypeMyRoof(updateData.roof)
      );
      setFieldValue(AmenitisResidentialComp.ROOF_CUSTOM, updateData.roof);

      setFieldValue(
        AmenitisResidentialComp.ELECTRICAL_NAME,
        getValueOrTypeMyElectrical(updateData.electrical)
      );
      setFieldValue(
        AmenitisResidentialComp.ELECTRICAL_CUSTOM,
        updateData.electrical
      );

      setFieldValue(
        AmenitisResidentialComp.PLUMBING_NAME,
        getValueOrTypeMyPlumbing(updateData.plumbing)
      );
      setFieldValue(
        AmenitisResidentialComp.PLUMGING_CUSTOM,
        updateData.plumbing
      );

      setFieldValue(
        AmenitisResidentialComp.HEATING_COOLING_NAME,
        getValueOrTypeMyHeating_Cooling(updateData.heating_cooling)
      );
      setFieldValue(
        AmenitisResidentialComp.HEATING_COOLING_CUSTOM,
        updateData.heating_cooling
      );

      setFieldValue(
        AmenitisResidentialComp.BEDROOMS_NAME,
        getValueOrTypeMyBedRoom(updateData.bedrooms)
      );
      setFieldValue(
        AmenitisResidentialComp.BEDROOMS_CUSTOM,
        updateData.bedrooms
      );

      setFieldValue(
        AmenitisResidentialComp.BATHROOMS_NAME,
        getValueOrTypeMyBathroom(updateData.bathrooms)
      );
      setFieldValue(
        AmenitisResidentialComp.BATHROOMS_CUSTOM,
        updateData.bathrooms
      );

      setFieldValue(
        AmenitisResidentialComp.GARAGE_NAME,
        getValueOrTypeMyGarage(updateData.garage)
      );
      setFieldValue(AmenitisResidentialComp.GARAGE_CUSTOM, updateData.garage);

      setFieldValue(
        AmenitisResidentialComp.FENCING_NAME,
        getValueOrTypeMyFencing(updateData.fencing)
      );
      setFieldValue(AmenitisResidentialComp.FENCING_CUSTOM, updateData.fencing);

      setFieldValue(
        AmenitisResidentialComp.FIREPLACE_NAME,
        getValueOrTypeMyFirePlace(updateData.fireplace)
      );
      setFieldValue(
        AmenitisResidentialComp.FIREPLACE_CUSTOM,
        updateData.fireplace
      );

      setFieldValue(
        AmenitisResidentialComp.OTHER_AMENITIES,
        updateData.other_amenities
      );

      setFieldValue(
        AmenitisResidentialComp.WINDOWS_NAME,
        getValueOrTypeMyWindows(updateData.windows)
      );
      setFieldValue(AmenitisResidentialComp.WINDOWS_CUSTOM, updateData.windows);
    }
  }, [updateData?.id]);

  return (
    <>
      <div>
        <Typography variant="h6" component="h5" className="text-lg font-bold">
          {ResidentialComponentHeaderEnum.AMENITIES}
        </Typography>
        <div className="mt-[30px]">
          <Grid container spacing={2} className='items-end'>
            <Grid
              item
              xs={
                values.exterior === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {AmenitisResidentialComp.EXTERIOR}
                  </span>
                }
                name={AmenitisResidentialComp.EXTERIOR_NAME}
                options={ExteriorOptions}
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.EXTERIOR_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.EXTERIOR_CUSTOM, '');
                }}
                value={values.exterior}
              />
            </Grid>
            {values.exterior === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_EXTERIOR}</span>}
                  name={AmenitisResidentialComp.EXTERIOR_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
            <Grid
              item
              xs={values.roof === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6}
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {AmenitisResidentialComp.ROOF}
                  </span>
                }
                name={AmenitisResidentialComp.ROOF_NAME}
                options={RoofOptions}
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.ROOF_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.ROOF_CUSTOM, '');
                }}
                value={values.roof}
              />
            </Grid>
            {values.roof === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_ROOF}</span>}
                  name={AmenitisResidentialComp.ROOF_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={2} className="mt-[20px] items-end">
            <Grid
              item
              xs={
                values.electrical === AmenitisResidentialComp.TYPE_MY_OWN
                  ? 3
                  : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {AmenitisResidentialComp.ELECTRICAL}
                  </span>
                }
                name={AmenitisResidentialComp.ELECTRICAL_NAME}
                options={ElectricalOptions}
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.ELECTRICAL_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.ELECTRICAL_CUSTOM, '');
                }}
                value={values.electrical}
              />
            </Grid>
            {values.electrical === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_ELECTRICAL}</span>}
                  name={AmenitisResidentialComp.ELECTRICAL_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
            <Grid
              item
              xs={
                values.plumbing === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {AmenitisResidentialComp.PLUMBING}
                  </span>
                }
                name={AmenitisResidentialComp.PLUMBING_NAME}
                options={PlumbingOptions}
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.PLUMBING_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.PLUMGING_CUSTOM, '');
                }}
                value={values.plumbing}
              />
            </Grid>
            {values.plumbing === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_PLUMBING}</span>}
                  name={AmenitisResidentialComp.PLUMGING_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={2} className="mt-[20px] items-end">
            <Grid
              item
              xs={
                values.heating_cooling === AmenitisResidentialComp.TYPE_MY_OWN
                  ? 3
                  : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {AmenitisResidentialComp.HEATING_COOLING}
                  </span>
                }
                name={AmenitisResidentialComp.HEATING_COOLING_NAME}
                options={HeatingCoolingOptions}
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.HEATING_COOLING_NAME,
                    e.target.value
                  );
                  setFieldValue(
                    AmenitisResidentialComp.HEATING_COOLING_CUSTOM,
                    ''
                  );
                }}
                value={values.heating_cooling}
              />
            </Grid>
            {values.heating_cooling === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_HEATING_COOLING}</span>}
                  name={AmenitisResidentialComp.HEATING_COOLING_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
            <Grid
              item
              xs={
                values.windows === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {AmenitisResidentialComp.WINDOWS}
                  </span>
                }
                name={AmenitisResidentialComp.WINDOWS_NAME}
                options={WindowOptions}
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.WINDOWS_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.WINDOWS_CUSTOM, '');
                }}
                value={values.windows}
              />
            </Grid>
            {values.windows === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_WINDOWS}</span>}
                  name={AmenitisResidentialComp.WINDOWS_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={2} className="mt-[20px] items-end">
            <Grid
              item
              xs={
                values.bedrooms === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {AmenitisResidentialComp.BEDROOMS}
                  </span>
                }
                name={AmenitisResidentialComp.BEDROOMS_NAME}
                options={BedroomOptions}
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.BEDROOMS_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.BEDROOMS_CUSTOM, '');
                }}
                value={values.bedrooms}
              />
            </Grid>
            {values.bedrooms === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_BEDROOMS}</span>}
                  name={AmenitisResidentialComp.BEDROOMS_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
            <Grid
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
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.BATHROOMS_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.BATHROOMS_CUSTOM, '');
                }}
                value={values.bathrooms}
              />
            </Grid>
            {values.bathrooms === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_BATHROOMS}</span>}
                  name={AmenitisResidentialComp.BATHROOMS_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={2} className="mt-[20px] items-end">
            <Grid
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
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.GARAGE_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.GARAGE_CUSTOM, '');
                }}
                value={values.garage}
              />
            </Grid>
            {values.garage === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_GARAGE}</span>}
                  name={AmenitisResidentialComp.GARAGE_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
            <Grid
              item
              xs={
                values.fencing === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {AmenitisResidentialComp.FENCING}
                  </span>
                }
                name={AmenitisResidentialComp.FENCING_NAME}
                options={FencingOptions}
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.FENCING_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.FENCING_CUSTOM, '');
                }}
                value={values.fencing}
              />
            </Grid>
            {values.fencing === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_FENCING}</span>}
                  name={AmenitisResidentialComp.FENCING_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={2} className="mt-[20px] items-end">
            <Grid
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
                onChange={(e) => {
                  setFieldValue(
                    AmenitisResidentialComp.FIREPLACE_NAME,
                    e.target.value
                  );
                  setFieldValue(AmenitisResidentialComp.FIREPLACE_CUSTOM, '');
                }}
                value={values.fireplace}
              />
            </Grid>
            {values.fireplace === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3}>
                <StyledField
                  label={<span className='relative top-[-6px]'>{AmenitisResidentialComp.OTHER_FIREPLACE}</span>}
                  name={AmenitisResidentialComp.FIREPLACE_CUSTOM}
                  maxLength={25}
                />
              </Grid>
            ) : null}
            <Grid item xs={6}>
              <AdditionalAmenities updateData={updateData} />
            </Grid>
          </Grid>
          <Grid container spacing={2} className="mt-[20px] items-end">
            <Grid item xs={12}>
              <StyledField
                label={AmenitisResidentialComp.OTHER_AMENITIES_LABEL}
                name={AmenitisResidentialComp.OTHER_AMENITIES}
                maxLength={50}
              />
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

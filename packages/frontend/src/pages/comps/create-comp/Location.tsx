import { Typography, Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import { useFormikContext } from 'formik';
// import StarIcon from '@mui/icons-material/Star';
import { usa_state } from '../comp-form/fakeJson';
import AutocompleteLocation from './searchLocation';
import GoogleMapLocation from './createCompMap';
import React, { useEffect, useState } from 'react';
import TextAreaField from '@/components/styles/textarea';
import { CreateCompsEnum } from '../enum/CompsEnum';
import { ResidentialComponentHeaderEnum } from '@/pages/residential/enum/ResidentialEnum';

// type keys = keyof typeof UsaStateCodes;
export const Location = ({ setDataRequited, passData }: any) => {
  const { values, errors, setFieldValue, setValues } = useFormikContext<any>();
  const [zoomLevel, setZoomLevel] = useState<number>(
    Number(localStorage.getItem('mapZoom')) || 10
  );
  console.log(values?.zipcode, 'zipcodezipcode');
  useEffect(() => {
    if (values.zipcode?.state) {
      setFieldValue('state', values.zipcode?.state);
    }
  }, [values.zipcode?.state]);

  useEffect(() => {
    if (values.zipcode?.zipCode) {
      setFieldValue('zipcode', values.zipcode?.zipCode);
      setFieldValue('city', values.zipcode?.city);
    }
  }, [values.zipcode?.state]);

  useEffect(() => {
    if (passData.id) {
      const lat = parseFloat(passData.latitude);
      const lng = parseFloat(passData.longitude);

      const geometry = {
        lat: lat,
        lng: lng,
      };

      setFieldValue('business_name', passData.business_name);
      setFieldValue('location_desc', passData.location_desc);
      setFieldValue('legal_desc', passData.legal_desc);
      setFieldValue('legal_desc', passData.legal_desc);
      setFieldValue('city', passData.city);
      setFieldValue('street_suite', passData.street_suite);
      setFieldValue('zipcode', passData.zipcode);
      setFieldValue('street_address', passData.street_address);
      setFieldValue('geometry', geometry);

      setFieldValue('map_pin_lat', passData.map_pin_lat);
      setFieldValue('map_pin_lng', passData.map_pin_lng);

      const stateCode = usa_state.find((state) => state[passData.state]);
      if (stateCode) {
        const fullName = stateCode[passData.state];
        setFieldValue('state', fullName);
      }
    }
  }, [passData.id, passData.state]);

  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  const handleChangeZipcode = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    value = value.replace(/\D/g, '');
    if (value.length <= 5) {
      setFieldValue('zipcode', value);
    }
  };

  const onRawInput = (e: any) => {
    if (e === '') {
      setFieldValue('city', '');
      setFieldValue('zipcode', '');
      setFieldValue('state', '');
    }
  };

  return (
    <>
      <div>
        <Typography variant="h6" component="h5" className="text-lg font-bold">
          {ResidentialComponentHeaderEnum.LOCATION}
        </Typography>
        <div className="mt-4">
          {/* <Grid>
            <Grid item xs={12}>
              <StyledField
                label={
                  <span className="relative">
                    {CreateCompsEnum.PROPERTY_NAME}
                    <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                      *
                    </span>
                  </span>
                }
                name="business_name"
              />
            </Grid>
          </Grid> */}
          <Grid container spacing={3} className="mt-2 relative items-end">
            <Grid item xs={6} className="mt-1 pt-2">
              <AutocompleteLocation
                onSelected={(location: any) => {
                  setValues((old: any) => ({
                    ...old,
                    state: location.state,
                    zipcode: location.zipCode,
                    county: location.county,
                    city: location.city,
                    street_address: location.address,
                    geometry: location.geometry,
                  }));
                }}
                onRawInput={onRawInput}
              />

              {setDataRequited && errors && (
                <div className="text-red-500 text-[11px] absolute">
                  {errors.street_address as any}
                </div>
              )}
            </Grid>
            <Grid item xs={6} className="mt-1 pt-2">
              <StyledField label="Suite Number" name="street_suite" />
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mt-2 relative items-end">
            <Grid item xs={4} lg={3} className="pt-2">
              <StyledField
                label={
                  <span className="relative z-10">
                    {CreateCompsEnum.CITY}
                    <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                      *
                    </span>
                  </span>
                }
                name="city"
                value={values.city}
              />
              {setDataRequited && errors && !values?.city && (
                <div className="text-red-500 text-[11px] absolute">
                  {CreateCompsEnum.REQUIRED_FIELD}
                </div>
              )}
            </Grid>
            <Grid
              item
              xs={4}
              lg={3}
              className="relative pt-2 selectFixedHeight"
            >
              <Autocomplete
                disableClearable={true}
                options={usaStateOptions}
                value={values.state ? values.state : '-Select State-'}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                onChange={(_event, newValue) => {
                  setFieldValue(
                    'state',
                    newValue?.label || values.zipcode?.state || ''
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    className="relative"
                    {...params}
                    label={
                      <span className="text-customGray">
                        {CreateCompsEnum.STATE}
                        <span className="text-red-500"> *</span>
                      </span>
                    }
                    variant="standard"
                  />
                )}
              />
              {/* {setDataRequited && errors && !values?.city && (
                <div className="text-red-500 pt-1 text-sm absolute">
                  {errors.state as any}
                </div>
              )} */}
              {setDataRequited &&
                (values?.state === '--Select State--' ||
                  values?.state === '' ||
                  values.state === null) && (
                  <div className="text-red-500 text-[11px] absolute">
                    This field is required
                  </div>
                )}
            </Grid>
            <Grid item xs={4} lg={3} className="pt-2">
              <StyledField
                label={
                  <span className="relative z-10">
                    {CreateCompsEnum.ZIPCODE}
                    <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                      *
                    </span>
                  </span>
                }
                name="zipcode"
                type="text"
                value={values?.zipcode}
                onChange={handleChangeZipcode}
              />
              {setDataRequited && values.zipcode.length > 5 && (
                <div className="text-red-500 text-[11px] absolute">
                  Please enter no more than 5 characters.
                </div>
              )}
            </Grid>
          </Grid>

          <Grid className="mt-5">
            <Grid item xs={12} className="pt-2">
              <GoogleMapLocation
                passData={values.geometry}
                initialZoom={zoomLevel}
                onMarkerChange={(coords) => {
                  setValues((prev: any) => ({
                    ...prev,
                    geometry: coords,
                  }));
                }}
                onZoomChange={(newZoom) => {
                  setZoomLevel(newZoom);
                  localStorage.setItem('mapZoom', newZoom.toString());
                }}
              />{' '}
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mt-5 items-end">
            <Grid item xs={12} className="pt-2">
              <TextAreaField
                label="Location Description"
                name="location_desc"
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-2 items-end">
            <Grid item xs={12} className="pt-2">
              <TextAreaField label="Legal Description" name="legal_desc" />
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
